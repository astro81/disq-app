<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Plus, Smile } from 'lucide-svelte';
	import Input from '../ui/input/input.svelte';
	import MessageFile from '$lib/components/modals/chat/MessageFile.svelte';

	interface ChatInputProps {
		apiUrl: string;
		query: Record<string, any>;
		name: string;
		type: 'conversation' | 'channel';
	}

	let { apiUrl, query, name, type }: ChatInputProps = $props();

	let content = $state('');
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!content.trim()) return;

		isLoading = true;
		error = null;

		try {
			const params = new URLSearchParams({
				channelId: query.channelId,
				serverId: query.serverId
			});

			const formData = new FormData();
			formData.append('content', content);
			// formData.append("fileUrl", fileUrl);

			const res = await fetch(`${apiUrl}?${params.toString()}`, {
				method: 'POST',
				body: formData
			});

			const data = await res.json();

			if (!res.ok) {
				error = data.error?.content?.[0] || data.error || 'Failed to send messages';
				return;
			}

			content = '';
		} catch (err) {
			error = 'Something went wrong';
		} finally {
			isLoading = false;
		}
	}

	let isMessageFileDialogOpen = $state<boolean>(false);
</script>

<div>
	<form onsubmit={handleSubmit} enctype="multipart/form-data" class="flex flex-col gap-4">
		{#if error}
			<div class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
				{error}
			</div>
		{/if}

		<div class="relative p-4 pb-6">
			<!-- open dialog to attach file            -->
			<Button
				type="button"
				onclick={() => (isMessageFileDialogOpen = !isMessageFileDialogOpen)}
				class="absolute top-7 left-8 flex size-6
                items-center justify-center rounded-full bg-zinc-500 p-1 transition hover:bg-zinc-600"
			>
				<Plus class="text-white dark:text-[#313338]" />
			</Button>

			<Input
				bind:value={content}
				disabled={isLoading}
				placeholder={`Message ${type === 'channel' ? '#' + name : name}`}
				class="border-none bg-zinc-200/90 px-14 py-6 focus-visible:ring-0
                focus-visible:ring-offset-0 dark:bg-zinc-700/75"
			/>

			<div class="absolute top-7 right-8">
				<Smile />
			</div>
		</div>
	</form>
</div>

<MessageFile bind:isMessageFileDialogOpen channelId={query.channelId} serverId={query.serverId} />
