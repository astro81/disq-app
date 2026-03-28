<script lang="ts">
    import type { ServerProps } from '$lib/types/server';

    import { Globe, LockKeyhole, Trash2, Upload, X } from '@lucide/svelte';

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
	import Switch from '$lib/components/ui/switch/switch.svelte';


    let {
        isServerEditDialogOpen = $bindable(),
        currentServer,
    }: {
        isServerEditDialogOpen: boolean;
        currentServer: ServerProps;
    } = $props();


    let isLoading = $state(false);
    let errorMsg  = $state<string | null>(null);

    // Text fields – initialised from the current server each time the dialog opens
    let serverName = $derived(currentServer.serverName ?? '');
    let serverDescription = $derived(currentServer.serverDescription ?? '');
    let isPrivateServer   = $derived(currentServer.isPrivateServer ?? false);

    // Image state: null = remove, undefined = no change, string = current/preview URL
    let imagePreview : string | null = $derived(currentServer.serverImageUrl ?? null);
    let bannerPreview: string | null = $derived(currentServer.serverBannerImageUrl ?? null);

    // Pending File objects chosen by the user (not yet uploaded)
    let pendingIconFile : File | null = $state(null);
    let pendingBannerFile: File | null = $state(null);

    // did the user explicitly ask to remove the current asset?
    let removeIcon  = $state(false);
    let removeBanner = $state(false);

    // Re-sync text fields whenever the dialog reopens with fresh server data
    $effect(() => {
        if (isServerEditDialogOpen) {
            serverName = currentServer.serverName ?? '';
            serverDescription = currentServer.serverDescription ?? '';
            imagePreview = currentServer.serverImageUrl ?? null;
            isPrivateServer = currentServer.isPrivateServer ?? false;
            bannerPreview = currentServer.serverBannerImageUrl ?? null;
            pendingIconFile = null;
            pendingBannerFile = null;
            removeIcon = false;
            removeBanner = false;
            errorMsg = null;
        }
    });


    function pickIcon(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        pendingIconFile = file;
        imagePreview = URL.createObjectURL(file);
        removeIcon = false;
    }

    function pickBanner(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        pendingBannerFile = file;
        bannerPreview = URL.createObjectURL(file);
        removeBanner = false;
    }

    function clearIcon() {
        pendingIconFile = null;
        imagePreview = null;
        removeIcon = true;
    }

    function clearBanner() {
        pendingBannerFile = null;
        bannerPreview = null;
        removeBanner = true;
    }

    async function handleSubmit() {
        errorMsg  = null;
        isLoading = true;

        try {
            const form = new FormData();

            if (serverName.trim()) form.append('serverName', serverName.trim());
            if (serverDescription !== undefined) form.append('serverDescription', serverDescription);

            form.append('isPrivateServer', isPrivateServer.toString());

            if (removeIcon) form.append('removeImage', 'true');
            else if (pendingIconFile) form.append('serverImage', pendingIconFile);

            if (removeBanner) form.append('removeBanner', 'true');
            else if (pendingBannerFile) form.append('serverBannerImage', pendingBannerFile);

            const res = await fetch(`/api/servers/update/${currentServer.serverId}`, {
                method: 'PATCH',
                body: form,
            });

            const data = await res.json();

            if (!res.ok) {
                errorMsg = data.error ?? 'Failed to update server settings.';
                return;
            }

            currentServer.serverName = data.server.serverName;
            currentServer.serverDescription = data.server.serverDescription;
            
            currentServer.isPrivateServer = data.server.isPrivateServer;

            currentServer.serverImageUrl = data.server.serverImageUrl;
            currentServer.serverBannerImageUrl = data.server.serverBannerImageUrl;

            isServerEditDialogOpen = false;
        } catch (err) {
            console.error('ServerSettings submit error:', err);
            errorMsg = 'Something went wrong. Please try again.';
        } finally {
            isLoading = false;
        }
    }
</script>

<Dialog bind:open={isServerEditDialogOpen}>
    <DialogContent class="max-h-[85vh] overflow-y-auto sm:max-w-125">
        <DialogHeader>
            <DialogTitle>Server Settings</DialogTitle>
            <DialogDescription>Update your server's name, description and images.</DialogDescription>
        </DialogHeader>

        <form
            onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}
            class="flex flex-col gap-6"
        >
            <FieldSet>
                <FieldGroup class="gap-4">

                    <!-- Server Name -->
                    <Field>
                        <FieldLabel for="serverName">Server Name</FieldLabel>
                        <Input
                            id="serverName"
                            name="serverName"
                            placeholder="Enter a unique server name"
                            bind:value={serverName}
                            disabled={isLoading}
                        />
                    </Field>

                    <!-- Server Description -->
                    <Field>
                        <FieldLabel for="serverDescription">Server Description</FieldLabel>
                        <textarea
                            id="serverDescription"
                            name="serverDescription"
                            placeholder="Describe your server..."
                            bind:value={serverDescription}
                            disabled={isLoading}
                            rows="3"
                            class="flex w-full resize-none rounded-md border border-input bg-transparent
                                   px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground
                                   focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none
                                   disabled:cursor-not-allowed disabled:opacity-50"
                        ></textarea>
                    </Field>

                    <!-- Privacy Toggle -->
                    <Field>
                        <FieldLabel>Server Privacy</FieldLabel>
                        <div class="flex items-center justify-between rounded-lg border border-input bg-muted/30 p-4">
                            <div class="flex items-center gap-3">
                                {#if isPrivateServer}
                                    <LockKeyhole class="size-5 text-muted-foreground" />
                                    <div>
                                        <p class="text-sm font-medium">Private Server</p>
                                        <p class="text-xs text-muted-foreground">
                                            Only invited members can join and see this server
                                        </p>
                                    </div>
                                {:else}
                                    <Globe class="size-5 text-muted-foreground" />
                                    <div>
                                        <p class="text-sm font-medium">Public Server</p>
                                        <p class="text-xs text-muted-foreground">
                                            Anyone can join and see this server in the directory
                                        </p>
                                    </div>
                                {/if}
                            </div>
                            <Switch
                                bind:checked={isPrivateServer}
                                disabled={isLoading}
                                class="data-[state=checked]:bg-indigo-500"
                            />
                        </div>
                    </Field>

                    <!-- Server Icon -->
                    <Field>
                        <FieldLabel>Server Icon</FieldLabel>

                        {#if imagePreview}
                            <!-- Preview + controls -->
                            <div class="flex items-center gap-3">
                                <img
                                    src={imagePreview}
                                    alt="Server icon preview"
                                    class="h-20 w-20 rounded-full object-cover ring-2 ring-border"
                                />
                                <div class="flex flex-col gap-2">
                                    <!-- Replace -->
                                    <label
                                        class="flex cursor-pointer items-center gap-1.5 rounded-md border
                                               border-input bg-transparent px-3 py-1.5 text-xs font-medium
                                               shadow-sm transition-colors hover:bg-accent"
                                    >
                                        <Upload class="size-3.5" />
                                        Change
                                        <input
                                            type="file"
                                            accept="image/*"
                                            class="sr-only"
                                            disabled={isLoading}
                                            onchange={pickIcon}
                                        />
                                    </label>
                                    <!-- Remove -->
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        class="h-auto px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-50
                                               hover:text-rose-600 dark:hover:bg-rose-950"
                                        disabled={isLoading}
                                        onclick={clearIcon}
                                    >
                                        <Trash2 class="mr-1.5 size-3.5" />
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        {:else}
                            <!-- Upload dropzone -->
                            <label
                                class="flex cursor-pointer flex-col items-center justify-center gap-2
                                       rounded-md border-2 border-dashed border-input bg-muted/30 p-6
                                       text-center text-sm text-muted-foreground transition-colors
                                       hover:bg-muted/50"
                            >
                                <Upload class="size-5 opacity-60" />
                                <span>Click to upload server icon</span>
                                <span class="text-xs opacity-60">PNG, JPG or GIF · max 8 MB</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    class="sr-only"
                                    disabled={isLoading}
                                    onchange={pickIcon}
                                />
                            </label>
                        {/if}
                    </Field>

                    <!-- Banner Image -->
                    <Field>
                        <FieldLabel>Banner Image</FieldLabel>

                        {#if bannerPreview}
                            <div class="relative w-full">
                                <img
                                    src={bannerPreview}
                                    alt="Server banner preview"
                                    class="h-32 w-full rounded-md object-cover"
                                />
                                <!-- Overlay buttons -->
                                <div class="absolute top-2 right-2 flex gap-1.5">
                                    <!-- Replace -->
                                    <label
                                        class="flex cursor-pointer items-center gap-1 rounded-full
                                               bg-black/60 px-2.5 py-1 text-xs font-medium text-white
                                               backdrop-blur-sm transition-colors hover:bg-black/80"
                                    >
                                        <Upload class="size-3" />
                                        Change
                                        <input
                                            type="file"
                                            accept="image/*"
                                            class="sr-only"
                                            disabled={isLoading}
                                            onchange={pickBanner}
                                        />
                                    </label>
                                    <!-- Remove -->
                                    <button
                                        type="button"
                                        onclick={clearBanner}
                                        disabled={isLoading}
                                        class="flex items-center justify-center rounded-full bg-black/60 p-1.5
                                               text-white backdrop-blur-sm transition-colors hover:bg-rose-600"
                                        aria-label="Remove banner image"
                                    >
                                        <X class="size-3.5" />
                                    </button>
                                </div>
                            </div>
                        {:else}
                            <label
                                class="flex cursor-pointer flex-col items-center justify-center gap-2
                                       rounded-md border-2 border-dashed border-input bg-muted/30 p-6
                                       text-center text-sm text-muted-foreground transition-colors
                                       hover:bg-muted/50"
                            >
                                <Upload class="size-5 opacity-60" />
                                <span>Click to upload banner image</span>
                                <span class="text-xs opacity-60">PNG or JPG · max 12 MB · recommended 1200 × 480</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    class="sr-only"
                                    disabled={isLoading}
                                    onchange={pickBanner}
                                />
                            </label>
                        {/if}
                    </Field>

                </FieldGroup>
            </FieldSet>

            <!-- Error banner -->
            {#if errorMsg}
                <p class="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600
                           dark:bg-rose-950 dark:text-rose-400">
                    {errorMsg}
                </p>
            {/if}

            <!-- Footer -->
            <DialogFooter>
                <Button
                    type="button"
                    variant="ghost"
                    disabled={isLoading}
                    onclick={() => (isServerEditDialogOpen = false)}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    class="bg-indigo-500 text-foreground hover:bg-indigo-500/90"
                >
                    {isLoading ? 'Saving…' : 'Save Changes'}
                </Button>
            </DialogFooter>
        </form>
    </DialogContent>
</Dialog>