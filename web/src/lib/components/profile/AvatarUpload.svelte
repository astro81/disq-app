<script lang="ts">
    import { enhance } from '$app/forms'
    import { Camera, User } from '@lucide/svelte'
    import { Button } from '$lib/components/ui/button/index.js'
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
    constraints={UPLOAD_CONSTRAINTS.avatar}
    onConfirm={onUpload}
/>

<div class="flex items-end justify-between -mt-10 mb-2">
    <div class="relative group">
        <div class="size-20 md:size-24 rounded-full ring-4 ring-background bg-muted overflow-hidden">
            {#if imageUrl}
                <img src={imageUrl} alt="Your avatar" class="w-full h-full object-cover" />
            {:else}
                <div class="w-full h-full flex items-center justify-center">
                    <User class="size-10 text-muted-foreground" />
                </div>
            {/if}
        </div>

        <button
            type="button"
            onclick={() => (dialogOpen = true)}
            class="absolute inset-0 rounded-full flex flex-col items-center justify-center gap-0.5
                   bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Change avatar"
        >
            <Camera class="size-4 text-white" />
            <span class="text-[9px] text-white/90 font-medium">Change</span>
        </button>
    </div>

    {#if imageUrl}
        <form method="POST" action="?/removeAvatar" use:enhance class="pb-1">
            <Button type="submit" variant="outline" size="sm">Remove avatar</Button>
        </form>
    {/if}
</div>

{#if error}
    <p class="text-sm text-destructive mt-1 mb-2">{error}</p>
{/if}