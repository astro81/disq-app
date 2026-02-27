<script lang="ts">
	import { onMount } from 'svelte';

	import { X } from '@lucide/svelte';

	let { messageFileURL = $bindable() } = $props();

	let uploader: any = $state();
	let UploadDropzone: any = $state();

	onMount(async () => {
		// Dynamic imports — NEVER evaluated during SSR
		const uploadthing = await import('$lib/utils/uploadthing');
		const utSvelte = await import('@uploadthing/svelte');

		UploadDropzone = utSvelte.UploadDropzone;

		uploader = await uploadthing.createUploader('messageFile', {
			onClientUploadComplete: (res) => {
				messageFileURL = res[0]?.ufsUrl ?? null;
			},
			onUploadError: (error: Error) => {
				alert(error.message);
			}
		});
	});
	const isImage = $derived(
		messageFileURL &&
			(messageFileURL.endsWith('.jpg') ||
				messageFileURL.endsWith('.jpeg') ||
				messageFileURL.endsWith('.png') ||
				messageFileURL.endsWith('.gif') ||
				messageFileURL.endsWith('.webp') ||
				messageFileURL.includes('images')) // common in uploadthing URLs
	);
</script>

{#if uploader && UploadDropzone}
	{#if messageFileURL}
		<!-- Preview -->
		<div class="relative mt-2 w-full">
			{#if isImage}
				<img src={messageFileURL} alt="Preview" class="h-60 w-full rounded object-cover" />
			{:else}
				<div
					class="flex h-60 w-full flex-col items-center justify-center gap-4 rounded border border-zinc-200 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800"
				>
					<div class="rounded-full bg-indigo-500/10 p-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="text-indigo-500"
							><path
								d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
							/><polyline points="14 2 14 8 20 8" /></svg
						>
					</div>
					<span class="max-w-[80%] truncate text-sm font-medium text-zinc-500">
						{messageFileURL.split('/').pop()}
					</span>
				</div>
			{/if}
			<button
				type="button"
				onclick={() => (messageFileURL = null)}
				class="absolute top-2 right-2 rounded-full bg-gray-200 p-1 shadow hover:bg-gray-300"
				aria-label="Remove image"
			>
				<X class="h-4 w-4 text-gray-800" />
			</button>
		</div>
	{:else}
		<!-- UploadThing Dropzone -->
		<UploadDropzone
			{uploader}
			multiple={false}
			class="cursor-pointer rounded border-2 border-dashed border-gray-400 p-6 text-center"
		>
			Drag & drop or click to upload file
		</UploadDropzone>
	{/if}
{/if}
