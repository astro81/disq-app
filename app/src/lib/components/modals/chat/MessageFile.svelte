<script lang="ts">
	import { currentServerStore } from '$lib/stores/server-state.svelte';

	import Button from '$lib/components/ui/button/button.svelte';

	import Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import DialogDescription from '$lib/components/ui/dialog/dialog-description.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import { browser } from '$app/environment';

	import FieldGroup from '../../ui/field/field-group.svelte';
	import { CircleAlert } from '@lucide/svelte';
	import FieldSet from '../../ui/field/field-set.svelte';
	import CreateFIleUploader from '$lib/components/modals/chat/CreateFIleUploader.svelte';
	import { messageFileUploadRemote } from '$lib/remote/message/message-file-upload.remote';
	import Input from '$lib/components/ui/input/input.svelte';

	let { isMessageFileDialogOpen = $bindable(), channelId, serverId } = $props();

	// const currentServer = $derived(currentServerStore.currentServer);

	let isLoading = $state(false);

	let messageFileURL: string | null = $state(null);
	let content = $state('');
</script>

<Dialog bind:open={isMessageFileDialogOpen}>
	<DialogContent class="sm:max-w-118">
		<DialogHeader>
			<DialogTitle class="text-center">Add an attachment</DialogTitle>
			<DialogDescription class="text-center text-zinc-500">Send a file as message</DialogDescription
			>
		</DialogHeader>

		<form
			{...messageFileUploadRemote.enhance(async ({ submit, form }) => {
				isLoading = true;
				await submit();
				form.reset();
				isLoading = false;
				isMessageFileDialogOpen = false;
				messageFileURL = null;
				content = '';
			})}
			oninput={() => messageFileUploadRemote.validate()}
			enctype="multipart/form-data"
			class="flex w-full flex-col gap-6"
		>
			<!-- Global-level errors -->
			{#if messageFileUploadRemote.fields
				.allIssues()
				?.some((issue) => !issue.path || issue.path.length === 0)}
				<div
					class="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
				>
					<CircleAlert class="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
					<div class="flex flex-col gap-1 text-sm">
						{#each messageFileUploadRemote.fields
							.allIssues()
							?.filter((issue) => !issue.path || issue.path.length === 0) ?? [] as issue}
							<p>{issue.message}</p>
						{/each}
					</div>
				</div>
			{/if}

			<FieldSet>
				<FieldGroup class="gap-2">
					{#if browser}
						<CreateFIleUploader bind:messageFileURL />
					{/if}

					<!-- Hidden input for file URL -->
					<input type="hidden" name="messageFile" value={messageFileURL ?? ''} />

					<!-- Caption Input -->
					<div class="mt-4">
						<Input
							bind:value={content}
							name="content"
							placeholder="Add a caption (optional)"
							disabled={isLoading}
							class="border-none bg-zinc-200/50 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-zinc-700/50"
						/>
					</div>

					<!-- Hidden IDs -->
					<input type="hidden" name="channelId" value={channelId} />
					<input type="hidden" name="serverId" value={serverId} />
				</FieldGroup>
			</FieldSet>

			<DialogFooter>
				<Button
					type="submit"
					disabled={isLoading}
					class="w-full bg-indigo-500 text-foreground hover:bg-indigo-500/90">Send</Button
				>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
