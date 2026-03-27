<script lang="ts">
    import { Plus, Camera, Trash2, CircleAlert, Lock } from '@lucide/svelte'
    import { Button } from '$lib/components/ui/button/index.js'
    import { Input } from '$lib/components/ui/input/index.js'
    import * as Dialog from '$lib/components/ui/dialog/index.js'
    import * as Field from '$lib/components/ui/field/index.js'
    import { UPLOAD_CONSTRAINTS } from '$lib/constants/upload'

    const imageConstraints = UPLOAD_CONSTRAINTS.serverImage
    const accept = imageConstraints.allowedTypes.join(',')

    type AllowedMimeType = typeof imageConstraints.allowedTypes[number]

    let open = $state(false)
    let loading = $state(false)
    let serverName = $state('')
    let serverDescription = $state('')
    let isPrivateServer = $state(false)
    let imageFile = $state<File | null>(null)
    let imagePreview = $state<string | null>(null)
    let fieldErrors = $state<Record<string, string>>({})
    let globalError = $state<string | null>(null)

    function onImageChange(e: Event) {
        const input = e.target as HTMLInputElement
        const file = input.files?.[0] ?? null
        input.value = ''
        fieldErrors = { ...fieldErrors, serverImage: '' }

        if (!file) return

        if (!imageConstraints.allowedTypes.includes(file.type as AllowedMimeType)) {
            fieldErrors = { ...fieldErrors, serverImage: `Unsupported format. Use ${imageConstraints.allowedLabel}.` }
            return
        }
        if (file.size > imageConstraints.maxBytes) {
            fieldErrors = { ...fieldErrors, serverImage: `File too large. Max size is ${imageConstraints.maxLabel}.` }
            return
        }

        imageFile = file
        imagePreview = URL.createObjectURL(file)
    }

    function removeImage() {
        if (imagePreview) URL.revokeObjectURL(imagePreview)
        imageFile = null
        imagePreview = null
    }

    function reset() {
        removeImage()
        serverName = ''
        serverDescription = ''
        isPrivateServer = false
        fieldErrors = {}
        globalError = null
        loading = false
    }

    function handleOpenChange(value: boolean) {
        if (!value) reset()
        open = value
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()
        fieldErrors = {}
        globalError = null

        if (!serverName.trim()) {
            fieldErrors = { serverName: 'Server name is required.' }
            return
        }
        if (!imageFile) {
            fieldErrors = { serverImage: 'A server image is required.' }
            return
        }

        loading = true

        try {
            const fd = new FormData()
            fd.append('serverName', serverName.trim())
            fd.append('serverImage', imageFile)
            fd.append('isPrivateServer', String(isPrivateServer))
            if (serverDescription.trim()) {
                fd.append('serverDescription', serverDescription.trim())
            }

            const res = await fetch('/api/servers/create', { method: 'POST', body: fd })
            const body = await res.json()

            if (!res.ok) {
                if (body.field) {
                    fieldErrors = { [body.field]: body.error }
                } else {
                    globalError = body.error ?? 'Failed to create server.'
                }
                return
            }

            handleOpenChange(false)
        } catch {
            globalError = 'Something went wrong. Please try again.'
        } finally {
            loading = false
        }
    }
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
    <Dialog.Trigger
        class="flex mx-3 h-12 w-12 rounded-3xl hover:rounded-2xl transition-all overflow-hidden
               items-center justify-center bg-background dark:bg-neutral-700 hover:bg-emerald-500 group"
    >
        <Plus class="text-emerald-500 group-hover:text-white transition-colors" size="25" />
    </Dialog.Trigger>

    <Dialog.Content class="sm:max-w-md">
        <Dialog.Header>
            <Dialog.Title>Create a Server</Dialog.Title>
            <Dialog.Description>
                Give your server a name and an image. You can always change these later.
            </Dialog.Description>
        </Dialog.Header>

        <form onsubmit={handleSubmit} class="flex flex-col gap-5">

            {#if globalError}
                <div class="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 flex items-start gap-2">
                    <CircleAlert class="size-4 mt-0.5 shrink-0 text-destructive" />
                    <p class="text-sm text-destructive">{globalError}</p>
                </div>
            {/if}

            <!-- Server image -->
            <Field.Field data-invalid={!!fieldErrors.serverImage}>
                <Field.Label>Server Image</Field.Label>

                {#if imagePreview}
                    <div class="relative w-20 h-20 rounded-full overflow-hidden bg-muted">
                        <img src={imagePreview} alt="Server preview" class="w-full h-full object-cover" />
                        <button
                            type="button"
                            onclick={removeImage}
                            class="absolute inset-0 flex items-center justify-center
                                   bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-full"
                            aria-label="Remove image"
                        >
                            <Trash2 class="size-4 text-white" />
                        </button>
                    </div>
                {:else}
                    <label
                        class="flex flex-col items-center justify-center gap-2 rounded-xl border-2
                               border-dashed border-border bg-muted/40 py-6 cursor-pointer
                               hover:bg-muted/70 transition-colors"
                    >
                        <Camera class="size-6 text-muted-foreground" />
                        <span class="text-xs text-muted-foreground">
                            {imageConstraints.allowedLabel} · Max {imageConstraints.maxLabel}
                        </span>
                        <input
                            type="file"
                            {accept}
                            class="sr-only"
                            onchange={onImageChange}
                        />
                    </label>
                {/if}

                {#if fieldErrors.serverImage}
                    <Field.Error>{fieldErrors.serverImage}</Field.Error>
                {/if}
            </Field.Field>

            <!-- Server name -->
            <Field.Field data-invalid={!!fieldErrors.serverName}>
                <Field.Label for="serverName">Server Name</Field.Label>
                <Input
                    id="serverName"
                    name="serverName"
                    placeholder="My awesome server"
                    bind:value={serverName}
                    disabled={loading}
                />
                {#if fieldErrors.serverName}
                    <Field.Error>{fieldErrors.serverName}</Field.Error>
                {/if}
            </Field.Field>

            <!-- Description -->
            <Field.Field>
                <Field.Label for="serverDescription">
                    Description
                    <span class="text-muted-foreground font-normal ml-1">(optional)</span>
                </Field.Label>
                <Input
                    id="serverDescription"
                    name="serverDescription"
                    placeholder="What's this server about?"
                    bind:value={serverDescription}
                    disabled={loading}
                />
            </Field.Field>

            <!-- Private server toggle -->
            <button
                type="button"
                role="switch"
                aria-checked={isPrivateServer}
                onclick={() => (isPrivateServer = !isPrivateServer)}
                class="flex items-center justify-between rounded-lg border border-border
                       bg-muted/40 px-4 py-3 hover:bg-muted/70 transition-colors text-left"
            >
                <div class="flex items-center gap-3">
                    <div class="flex size-8 items-center justify-center rounded-full bg-background">
                        <Lock class="size-4 text-muted-foreground" />
                    </div>
                    <div>
                        <p class="text-sm font-medium">Private Server</p>
                        <p class="text-xs text-muted-foreground">Only invited members can join</p>
                    </div>
                </div>
                <div
                    class="h-5 w-9 rounded-full transition-colors {isPrivateServer
                        ? 'bg-indigo-500'
                        : 'bg-muted-foreground/30'}"
                >
                    <div
                        class="h-5 w-5 rounded-full bg-white shadow transition-transform {isPrivateServer
                            ? 'translate-x-4'
                            : 'translate-x-0'}"
                    ></div>
                </div>
            </button>

            <Dialog.Footer>
                <Button
                    type="button"
                    variant="outline"
                    onclick={() => handleOpenChange(false)}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    class="bg-indigo-500 hover:bg-indigo-500/90"
                    disabled={loading}
                >
                    {loading ? 'Creating…' : 'Create Server'}
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>