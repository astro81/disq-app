<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Plus, Smile } from 'lucide-svelte';
	import MessageFile from '$lib/components/modals/chat/MessageFile.svelte';
	import {chatInputSend} from "$lib/remote/message/chat-input.remote.ts";
	import {Input} from "$lib/components/ui/input";


	interface ChatInputProps {
		channelId: string;
		channelName: string;
		serverId: string;
		memberId: string;
	}

	let {
		channelId,
		channelName,
		serverId,
		memberId
	}: ChatInputProps = $props();

	let isLoading = $state(false);
	let error = $state<string | null>(null);

	let isMessageFileDialogOpen = $state<boolean>(false);
</script>

<div>
	<form
			{...chatInputSend.enhance(async ({ submit, form }) => {
				await submit();
				form.reset();
				isMessageFileDialogOpen = false;
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

			<div class="absolute top-7 right-8">
				<Smile class="text-zinc-500 dark:text-zinc-400" />
			</div>
		</div>
	</form>
</div>

<MessageFile
		bind:isMessageFileDialogOpen
		channelId={channelId}
		serverId={serverId}
/>