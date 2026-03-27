<script lang="ts">
    import { enhance } from '$app/forms'
    import { Camera } from '@lucide/svelte'
    import { UPLOAD_CONSTRAINTS } from '$lib/constants/upload'
    import ImageUploadDialog from '$lib/components/profile/ImageUploadDialog.svelte'

    let {
        imageUrl = null,
        uploading = $bindable(false),
        error = $bindable<string | null>(null),
        onUpload,
    }: {
        imageUrl?: string | null
        uploading?: boolean
        error?: string | null
        onUpload: (file: File) => Promise<void>
    } = $props()

    let dialogOpen = $state(false)
</script>

<ImageUploadDialog
    bind:open={dialogOpen}
    {uploading}
    constraints={UPLOAD_CONSTRAINTS.banner}
    onConfirm={onUpload}
/>

<div class="relative h-36 md:h-48 bg-muted overflow-hidden group">
    {#if imageUrl}
        <img src={imageUrl} alt="Profile banner" class="w-full h-full object-cover" />
    {/if}

    <button
        type="button"
        onclick={() => (dialogOpen = true)}
        class="absolute inset-0 flex flex-col items-center justify-center gap-1
               bg-black/40 text-white opacity-0 group-hover:opacity-100
               transition-opacity cursor-pointer w-full"
        aria-label="Change banner"
    >
        <Camera class="size-6" />
        <span class="text-xs font-medium">Change banner</span>
    </button>

    {#if imageUrl}
        <form
            method="POST"
            action="?/removeBanner"
            use:enhance
            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
            <button
                type="submit"
                class="rounded-md bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80 transition-colors"
            >
                Remove
            </button>
        </form>
    {/if}

    {#if error}
        <div class="absolute bottom-0 inset-x-0 bg-destructive/90 px-3 py-2">
            <p class="text-xs text-white font-medium">{error}</p>
        </div>
    {/if}
</div>