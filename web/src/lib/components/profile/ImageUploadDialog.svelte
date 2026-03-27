<script lang="ts">
    import { Camera, Trash2, Upload } from '@lucide/svelte'
    import { Button } from '$lib/components/ui/button/index.js'
    import * as Dialog from '$lib/components/ui/dialog/index.js'
    import type { UPLOAD_CONSTRAINTS } from '$lib/constants/upload'

    type ConstraintKey = keyof typeof UPLOAD_CONSTRAINTS
    type AllowedMimeType = (typeof UPLOAD_CONSTRAINTS)[ConstraintKey]['allowedTypes'][number]

    let {
        open = $bindable(false),
        uploading = false,
        constraints,
        onConfirm,
    }: {
        open: boolean
        uploading?: boolean
        constraints: {
            maxBytes: number
            maxLabel: string
            allowedTypes: readonly AllowedMimeType[]
            allowedLabel: string
        }
        onConfirm: (file: File) => Promise<void>
    } = $props()

    let selectedFile = $state<File | null>(null)
    let previewUrl = $state<string | null>(null)
    let validationError = $state<string | null>(null)

    const accept = $derived(constraints.allowedTypes.join(','))

    function onFileChange(e: Event) {
        const input = e.target as HTMLInputElement
        const file = input.files?.[0] ?? null
        input.value = ''
        validationError = null
        if (!file) return

        if (!constraints.allowedTypes.includes(file.type as AllowedMimeType)) {
            validationError = `Unsupported format. Please use ${constraints.allowedLabel}.`
            return
        }
        if (file.size > constraints.maxBytes) {
            validationError = `File too large. Maximum size is ${constraints.maxLabel}.`
            return
        }

        selectedFile = file
        previewUrl = URL.createObjectURL(file)
    }

    function removeSelected() {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        selectedFile = null
        previewUrl = null
        validationError = null
    }

    function handleOpenChange(value: boolean) {
        if (!value) removeSelected()
        open = value
    }

    async function confirm() {
        if (!selectedFile) return
        await onConfirm(selectedFile)
        removeSelected()
        open = false
    }
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
    <Dialog.Content class="max-w-sm">
        <Dialog.Header>
            <Dialog.Title>Upload Image</Dialog.Title>
        </Dialog.Header>

        <!-- Preview or drop zone -->
        {#if previewUrl}
            <div class="relative rounded-lg overflow-hidden bg-muted aspect-video">
                <img src={previewUrl} alt="Preview" class="w-full h-full object-cover" />
                <button
                    type="button"
                    onclick={removeSelected}
                    class="absolute top-2 right-2 rounded-md bg-black/60 p-1 text-white
                           hover:bg-black/80 transition-colors"
                    aria-label="Remove selected image"
                >
                    <Trash2 class="size-3.5" />
                </button>
            </div>
        {:else}
            <label
                class="flex flex-col items-center justify-center gap-2 rounded-lg border-2
                       border-dashed border-border bg-muted/40 py-8 cursor-pointer
                       hover:bg-muted/70 transition-colors"
            >
                <Camera class="size-6 text-muted-foreground" />
                <span class="text-sm text-muted-foreground">Click to select an image</span>
                <input
                    type="file"
                    {accept}
                    class="sr-only"
                    onchange={onFileChange}
                />
            </label>
        {/if}

        <!-- Constraints -->
        <div class="rounded-md bg-muted/50 px-3 py-2 flex flex-col gap-0.5">
            <p class="text-xs text-muted-foreground">
                <span class="font-medium text-foreground">Accepted:</span>
                {constraints.allowedLabel}
            </p>
            <p class="text-xs text-muted-foreground">
                <span class="font-medium text-foreground">Max size:</span>
                {constraints.maxLabel}
            </p>
        </div>

        {#if validationError}
            <p class="text-sm text-destructive">{validationError}</p>
        {/if}

        <Dialog.Footer>
            <Button
                variant="outline"
                onclick={() => handleOpenChange(false)}
                disabled={uploading}
            >
                Cancel
            </Button>
            <Button
                class="gap-1.5"
                onclick={confirm}
                disabled={!selectedFile || uploading}
            >
                <Upload class="size-3.5" />
                {uploading ? 'Uploading…' : 'Upload'}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>