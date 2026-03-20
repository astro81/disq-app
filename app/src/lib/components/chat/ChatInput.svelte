<!-- ChatInput.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Plus, Smile, Code, X } from 'lucide-svelte';
	import MessageFile from '$lib/components/modals/chat/MessageFile.svelte';
	import { chatInputSend } from '$lib/remote/message/chat-input.remote.ts';
	import { Input } from '$lib/components/ui/input';

	const languages = [
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

	const themes = [
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

	interface ChatInputProps {
		channelId: string;
		channelName: string;
		serverId: string;
		memberId: string;
	}

	let { channelId, channelName, serverId, memberId }: ChatInputProps = $props();

	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let isMessageFileDialogOpen = $state<boolean>(false);
	let isCodeMode = $state<boolean>(false);
	let selectedLanguage = $state('javascript');
	let selectedTheme = $state('github-dark');
	let codeContent = $state('');
</script>

<div>
	<form
		{...chatInputSend.enhance(async ({ submit, form }) => {
			await submit();
			form.reset();
			isMessageFileDialogOpen = false;
			codeContent = '';
		})}
		enctype="multipart/form-data"
		oninput={() => chatInputSend.validate()}
		class="flex flex-col gap-4"
	>
		{#if error}
			<div class="mx-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
				{error}
			</div>
		{/if}

		{#if isCodeMode}
			<!-- Code Mode UI -->
			<div class="mx-4 mt-2 rounded-lg border border-indigo-500/30 bg-zinc-800 shadow-lg">
				<!-- Header bar -->
				<div class="flex items-center justify-between border-b border-zinc-700 px-3 py-2">
					<div class="flex items-center gap-2">
						<Code class="size-4 text-indigo-400" />
						<span class="text-xs font-semibold tracking-wider text-indigo-400 uppercase"
							>Code Snippet</span
						>
					</div>
					<div class="flex items-center gap-3">
						<select
							bind:value={selectedLanguage}
							class="rounded-md border border-zinc-600 bg-zinc-700 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
						>
							{#each languages as lang}
								<option value={lang}>{lang}</option>
							{/each}
						</select>
						<select
							bind:value={selectedTheme}
							class="rounded-md border border-zinc-600 bg-zinc-700 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
						>
							{#each themes as t}
								<option value={t}>{t}</option>
							{/each}
						</select>
						<button
							type="button"
							onclick={() => {
								isCodeMode = false;
								codeContent = '';
							}}
							class="rounded p-0.5 text-zinc-400 transition hover:bg-zinc-700 hover:text-zinc-200"
						>
							<X class="size-4" />
						</button>
					</div>
				</div>
				<!-- Code textarea -->
				<textarea
					bind:value={codeContent}
					name="content"
					placeholder="Paste or type your code here..."
					class="block w-full resize-none bg-transparent px-4 py-3 font-mono text-sm text-zinc-100 placeholder-zinc-500 outline-none"
					rows="6"
					disabled={isLoading}
				></textarea>
			</div>
			<!-- Hidden fields for code mode -->
			<input type="hidden" name="codeLanguage" value={selectedLanguage} />
			<input type="hidden" name="codeTheme" value={selectedTheme} />
			<input type="hidden" name="channelId" value={channelId} />
			<input type="hidden" name="serverId" value={serverId} />

			<!-- Send button -->
			<div class="flex justify-end px-4 pb-4">
				<Button
					type="submit"
					disabled={isLoading || !codeContent.trim()}
					class="bg-indigo-600 text-white hover:bg-indigo-700"
				>
					Send Code
				</Button>
			</div>
		{:else}
			<!-- Normal Text Mode -->
			<div class="relative p-4 pb-6">
				<Button
					type="button"
					onclick={() => (isMessageFileDialogOpen = !isMessageFileDialogOpen)}
					class="absolute top-7 left-8 flex size-6 items-center justify-center rounded-full bg-zinc-500 p-1 transition hover:bg-zinc-600"
				>
					<Plus class="text-white dark:text-[#313338]" />
				</Button>

				<Input
					{...chatInputSend.fields.content.as('text')}
					placeholder={`Message #${channelName}`}
					disabled={isLoading}
					class="border-none bg-zinc-200/90 px-14 py-6 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-zinc-700/75"
				/>

				<input type="hidden" name="channelId" value={channelId} />
				<input type="hidden" name="serverId" value={serverId} />

				<div class="absolute top-7 right-8 flex items-center gap-2">
					<button
						type="button"
						onclick={() => (isCodeMode = true)}
						class="rounded p-1 text-zinc-500 transition hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-400"
						title="Send code snippet"
					>
						<Code class="size-5" />
					</button>
					<Smile class="text-zinc-500 dark:text-zinc-400" />
				</div>
			</div>
		{/if}
	</form>
</div>

<MessageFile bind:isMessageFileDialogOpen {channelId} {serverId} />
