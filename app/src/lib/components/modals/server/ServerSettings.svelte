<script lang="ts">
	import { browser } from '$app/environment';

	import { updateServer } from '$lib/remote/server/update-server.remote';

	import { CircleAlert } from '@lucide/svelte';

	import { Button } from '$lib/components/ui/button/index.js';
	import Input from '$lib/components/ui/input/input.svelte';

	import Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import DialogDescription from '$lib/components/ui/dialog/dialog-description.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';

	import FieldSet from '$lib/components/ui/field/field-set.svelte';
	import FieldGroup from '$lib/components/ui/field/field-group.svelte';
	import Field from '$lib/components/ui/field/field.svelte';
	import FieldLabel from '$lib/components/ui/field/field-label.svelte';
	import FieldError from '$lib/components/ui/field/field-error.svelte';

	import CreateServerImageUploader from '$lib/components/modals/server/CreateServerImageUploader.svelte';

	let { isServerEditDialogOpen = $bindable(), currentServer } = $props();

	let isLoading = $state(false);
	let imageUrl: string | null = $derived(currentServer.serverImageUrl ?? null);
	let bannerImageUrl: string | null = $derived(currentServer.serverBannerImageUrl ?? null);
	let serverName = $derived(currentServer.serverName ?? '');
	let serverDescription = $derived(currentServer.serverDescription ?? '');

	async function handleSubmit() {
		isLoading = true;
		try {
			await updateServer({
				serverId: currentServer.serverId,
				serverName: serverName || undefined,
				serverDescription: serverDescription || null,
				serverImage: imageUrl || undefined,
				serverBannerImage: bannerImageUrl
			});
			isServerEditDialogOpen = false;
		} finally {
			isLoading = false;
		}
	}

	// UploadThing helpers — loaded client-side only
	let bannerUploader: any = $state();
	let BannerUploadDropzone: any = $state();

	$effect(() => {
		if (!browser) return;

		(async () => {
			const uploadthing = await import('$lib/utils/uploadthing');
			const utSvelte = await import('@uploadthing/svelte');

			BannerUploadDropzone = utSvelte.UploadDropzone;
			bannerUploader = await uploadthing.createUploader('serverBannerImage', {
				onClientUploadComplete: (res) => {
					bannerImageUrl = res[0]?.ufsUrl ?? null;
				},
				onUploadError: (error: Error) => {
					alert(error.message);
				}
			});
		})();
	});
</script>

<Dialog bind:open={isServerEditDialogOpen}>
	<DialogContent class="max-h-[85vh] overflow-y-auto sm:max-w-[500px]">
		<DialogHeader>
			<DialogTitle>Edit Server</DialogTitle>
			<DialogDescription>Update your server settings</DialogDescription>
		</DialogHeader>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
			class="flex flex-col gap-6"
		>
			<FieldSet>
				<FieldGroup class="gap-4">
					<!-- Server Name -->
					<Field>
						<FieldLabel for="serverName">Server Name</FieldLabel>
						<Input
							name="serverName"
							placeholder="Enter a unique server name"
							bind:value={serverName}
						/>
					</Field>

					<!-- Server Description -->
					<Field>
						<FieldLabel for="serverDescription">Server Description</FieldLabel>
						<textarea
							name="serverDescription"
							placeholder="Describe your server..."
							bind:value={serverDescription}
							rows="3"
							class="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						></textarea>
					</Field>

					<!-- Server Icon -->
					<Field>
						<FieldLabel>Server Icon</FieldLabel>
						{#if currentServer.serverImageUrl && !imageUrl}
							<img
								src={currentServer.serverImageUrl}
								alt="server icon"
								class="h-20 w-20 rounded-full object-cover"
							/>
						{:else if browser}
							<CreateServerImageUploader bind:imageUrl />
						{/if}
					</Field>

					<!-- Banner Image -->
					<Field>
						<FieldLabel>Banner Image</FieldLabel>
						{#if bannerImageUrl}
							<div class="relative w-full">
								<img
									src={bannerImageUrl}
									alt="Server banner"
									class="h-32 w-full rounded-md object-cover"
								/>
								<button
									type="button"
									onclick={() => (bannerImageUrl = null)}
									class="absolute top-2 right-2 rounded-full bg-gray-200 p-1 shadow hover:bg-gray-300"
									aria-label="Remove banner image"
								>
									✕
								</button>
							</div>
						{:else if bannerUploader && BannerUploadDropzone}
							<BannerUploadDropzone
								uploader={bannerUploader}
								multiple={false}
								class="cursor-pointer rounded border-2 border-dashed border-gray-400 p-6 text-center"
							>
								Drag & drop or click to upload banner image
							</BannerUploadDropzone>
						{/if}
					</Field>
				</FieldGroup>
			</FieldSet>

			<DialogFooter>
				<Button
					type="submit"
					disabled={isLoading}
					class="bg-indigo-500 text-foreground hover:bg-indigo-500/90"
					>{isLoading ? 'Saving...' : 'Save'}</Button
				>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
