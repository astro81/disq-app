<!-- ChatMessages.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import ChatWelcome from '$lib/components/chat/ChatWelcome.svelte';
	import { socketState } from '$lib/stores/socket.svelte';
	import { getMessages, deleteMessage } from '$lib/remote/message/message.remote';
	import UserAvatar from '$lib/components/modals/UserAvatar.svelte';
	import { Trash2 } from 'lucide-svelte';
	import { createHighlighter, type Highlighter } from 'shiki';

	const CODE_PREFIX = ':::code:::';

	const shikiLanguages = [
		'javascript',
		'typescript',
		'python',
		'svelte',
		'rust',
		'tsx',
		'html',
		'css',
		'c++',
		'c#',
		'c',
		'docker',
		'json',
		'jsx',
		'lua',
		'nix',
		'razor'
	];

	const shikiThemes = [
		'github-dark',
		'github-light',
		'nord',
		'one-dark-pro',
		'catppuccin-frappe',
		'catppuccin-latte',
		'catppuccin-macchiato',
		'catppuccin-mocha',
		'dracula',
		'dracula-soft',
		'gruvbox-dark-soft',
		'kanagawa-dragon',
		'tokyo-night'
	];

	interface ChatMessageProps {
		channelId: string;
		channelName: string;
		serverId: string;
		memberId: string;
		type: 'channel' | 'conversation';
	}

	interface ChatMessage {
		messageId: string;
		messageContent: string;
		messageFileUrl: string | null;
		memberId: string;
		channelId: string;
		messageDeleted: boolean | null;
		createdAt: Date | string;
		updatedAt: Date | string;
		member?: {
			memberId: string;
			role: string;
			user: {
				id: string;
				name: string;
				image: string | null;
				displayName: string | null;
			};
		};
	}

	let { channelId, channelName, serverId, memberId, type }: ChatMessageProps = $props();

	let messages = $state<ChatMessage[]>([]);
	let highlighter = $state<Highlighter | null>(null);

	onMount(() => {
		// Initialize Shiki highlighter
		createHighlighter({ themes: shikiThemes, langs: shikiLanguages }).then((instance) => {
			highlighter = instance;
		});

		// Load message history
		getMessages({ channelId }).then((history: any) => {
			messages = history as ChatMessage[];
		});

		// WebSocket connection
		const protocol = window.location.protocol === 'https' ? 'wss' : 'ws';
		const wsPort = import.meta.env.VITE_WS_PORT ?? '3001';
		const wsUrl = `${protocol}://${window.location.hostname}:${wsPort}/ws?channelId=${channelId}`;

		console.log('[WS] Connecting to:', wsUrl);
		const ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			console.log('[WS] Connected');
			socketState.isConnected = true;
		};

		ws.onmessage = (e: MessageEvent) => {
			const data = JSON.parse(e.data);

			if (data.type === 'MESSAGE_DELETE') {
				const index = messages.findIndex((m) => m.messageId === data.messageId);
				if (index !== -1) {
					messages[index].messageDeleted = true;
				}
				return;
			}

			// Regular message broadcast
			const msg = data as ChatMessage;
			if (msg.channelId === channelId) {
				messages.push(msg);
			}
		};

		ws.onerror = (e) => {
			console.error('[WS] Error:', e);
		};

		ws.onclose = (e) => {
			console.warn('[WS] Closed:', e.code, e.reason);
			socketState.isConnected = false;
		};

		// Cleanup on component destroy
		return () => ws.close();
	});

	async function handleDelete(messageId: string) {
		const confirmed = confirm('Are you sure you want to delete this message?');
		if (!confirmed) return;

		await deleteMessage({ messageId, channelId });
	}

	function parseCodeMessage(content: string): { lang: string; theme: string; code: string } | null {
		if (!content.startsWith(CODE_PREFIX)) return null;
		try {
			const parsed = JSON.parse(content.slice(CODE_PREFIX.length));
			return { lang: parsed.lang, theme: parsed.theme || 'github-dark', code: parsed.code };
		} catch {
			return null;
		}
	}

	function highlightCode(content: string): string {
		const parsed = parseCodeMessage(content);
		if (!parsed || !highlighter) return '';
		try {
			return highlighter.codeToHtml(parsed.code, {
				lang: parsed.lang,
				theme: parsed.theme
			});
		} catch {
			return `<pre class="p-4 text-red-400">${parsed.code}</pre>`;
		}
	}
</script>

<div class="flex flex-1 flex-col gap-y-4 overflow-y-auto px-4 py-4">
	<div class="mb-4">
		<ChatWelcome {type} name={channelName} />
	</div>

	<div class="flex flex-col gap-y-4">
		{#each messages as message (message.messageId)}
			{@const isMine = message.memberId === memberId}
			{@const codeData = !message.messageDeleted ? parseCodeMessage(message.messageContent) : null}
			<div class="flex w-full {isMine ? 'justify-end' : 'justify-start'} group">
				<div class="flex max-w-[80%] flex-col {isMine ? 'items-end' : 'items-start'}">
					<div class="mb-1 flex items-center gap-x-2">
						<UserAvatar src={message.member?.user.image} className="size-5" />
						<p class="cursor-pointer text-xs font-semibold hover:underline">
							{isMine ? 'You' : message.member?.user.name}
						</p>
						<span class="text-[10px] text-zinc-500 dark:text-zinc-400">
							{new Date(message.createdAt).toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit'
							})}
						</span>

						{#if isMine && !message.messageDeleted}
							<button
									onclick={() => handleDelete(message.messageId)}
									class="hidden text-zinc-500 transition group-hover:block hover:text-red-500"
							>
								<Trash2 class="size-3" />
							</button>
						{/if}
					</div>

					{#if message.messageDeleted}
						<!-- Deleted message -->
						<div
								class="rounded-2xl border border-dashed border-zinc-400 px-4 py-2 text-sm opacity-50 shadow-sm
								{isMine
								? 'rounded-tr-none bg-indigo-600 text-white'
								: 'rounded-tl-none bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100'}"
						>
							<span class="text-xs italic">This message has been deleted</span>
						</div>
					{:else if codeData}
						<!-- Code snippet message -->
						<div
								class="code-snippet-container w-full overflow-hidden rounded-xl border border-zinc-700 shadow-lg"
						>
							<!-- Language badge header -->
							<div class="flex items-center justify-between bg-zinc-800 px-3 py-1.5">
								<span class="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
									{codeData.lang}
								</span>
								<span class="text-[10px] tracking-wider text-zinc-500">
									{codeData.theme}
								</span>
							</div>
							<!-- Highlighted code -->
							<div class="shiki-chat-wrapper overflow-x-auto">
								{#if highlighter}
									{@html highlightCode(message.messageContent)}
								{:else}
									<pre
											class="bg-[#0d1117] p-4 font-mono text-sm text-zinc-300">{codeData.code}</pre>
								{/if}
							</div>
						</div>
					{:else}
						<!-- Regular text message -->
						<div
								class="rounded-2xl px-4 py-2 text-sm shadow-sm {isMine
								? 'rounded-tr-none bg-indigo-600 text-white'
								: 'rounded-tl-none bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100'}"
						>
							{message.messageContent}
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	:global(.shiki-chat-wrapper pre) {
		margin: 0;
		padding: 1rem 1.25rem;
		font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
		font-size: 13px;
		line-height: 1.6;
		tab-size: 2;
	}

	:global(.shiki-chat-wrapper code) {
		display: block;
		min-width: fit-content;
	}

	.code-snippet-container {
		min-width: 280px;
		max-width: 100%;
	}
</style>