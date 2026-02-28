<script lang="ts">
	import ChatWelcome from '$lib/components/chat/ChatWelcome.svelte';
	import { socketState } from '$lib/stores/socket.svelte';
	import { getMessages, deleteMessage } from '$lib/remote/message/message.remote';
	import UserAvatar from '$lib/components/modals/UserAvatar.svelte';
	import { Trash2 } from 'lucide-svelte';

	// interface ChatMessageProps {
	// 	name: string;
	// 	member: MemberProps;
	// 	chatId: string;
	// 	apiUrl: string;
	// 	socketUrl: string;
	// 	socketQuery: Record<string, string>;
	// 	paramKey: 'channelId' | 'conversationId';
	// 	paramValue: string;
	// 	type: 'channel' | 'conversation';
	// }

	// let {
	// 	name,
	// 	member,
	// 	chatId,
	// 	apiUrl,
	// 	socketUrl,
	// 	socketQuery,
	// 	paramKey,
	// 	paramValue,
	// 	type
	// }: ChatMessageProps = $props();

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

	$effect(() => {
		// Load history
		getMessages({ channelId }).then((history: any) => {
			messages = history as ChatMessage[];
		});

		const protocol = window.location.protocol === 'https' ? 'wss' : 'ws';
		const ws = new WebSocket(`${protocol}://${window.location.host}/ws?channelId=${channelId}`);

		ws.onopen = () => {
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

			// Traditional message broadcast
			const msg = data as ChatMessage;
			if (msg.channelId === channelId) {
				messages.push(msg);
			}
		};

		ws.onclose = () => {
			socketState.isConnected = false;
		};

		return () => ws.close();
	});

	async function handleDelete(messageId: string) {
		const confirmed = confirm('Are you sure you want to delete this message?');
		if (!confirmed) return;

		await deleteMessage({ messageId, channelId });
	}
</script>

<div class="flex flex-1 flex-col gap-y-4 overflow-y-auto px-4 py-4">
	<div class="mb-4">
		<ChatWelcome {type} name={channelName} />
	</div>

	<div class="flex flex-col gap-y-4">
		{#each messages as message (message.messageId)}
			{@const isMine = message.memberId === memberId}
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

					<div
						class="rounded-2xl px-4 py-2 text-sm shadow-sm {isMine
							? 'rounded-tr-none bg-indigo-600 text-white'
							: 'rounded-tl-none bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100'} {message.messageDeleted
							? 'border border-dashed border-zinc-400 opacity-50'
							: ''}"
					>
						{#if message.messageDeleted}
							<span class="text-xs italic"> This message has been deleted </span>
						{:else}
							{message.messageContent}
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
