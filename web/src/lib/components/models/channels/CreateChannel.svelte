<script lang="ts">
    import type { ServerChannelType } from "$lib/types/server";
    import { invalidateAll } from "$app/navigation";
    import { CircleAlert, Lock } from "@lucide/svelte";

    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Dialog from "$lib/components/ui/dialog/dialog.svelte";
    import DialogTitle from "$lib/components/ui/dialog/dialog-title.svelte";
    import DialogContent from "$lib/components/ui/dialog/dialog-content.svelte";
    import DialogHeader from "$lib/components/ui/dialog/dialog-header.svelte";
    import DialogFooter from "$lib/components/ui/dialog/dialog-footer.svelte";
    import Field from "$lib/components/ui/field/field.svelte";
    import FieldSet from "$lib/components/ui/field/field-set.svelte";
    import FieldGroup from "$lib/components/ui/field/field-group.svelte";
    import FieldLabel from "$lib/components/ui/field/field-label.svelte";
    import FieldError from "$lib/components/ui/field/field-error.svelte";
    import Select from "$lib/components/ui/select/select.svelte";
    import SelectTrigger from "$lib/components/ui/select/select-trigger.svelte";
    import SelectContent from "$lib/components/ui/select/select-content.svelte";
    import SelectItem from "$lib/components/ui/select/select-item.svelte";

    interface CreateChannelProps {
        isCreateChannelDialogOpen: boolean;
        channelType?: ServerChannelType;
        currentServerId: string;
    }

    let {
        isCreateChannelDialogOpen = $bindable(),
        channelType,
        currentServerId
    }: CreateChannelProps = $props();

    let isLoading = $state(false);
    let channelName = $state('');
    let channelNameError = $state('');
    let globalError = $state('');
    let isPrivate = $state(false);

    const channelSelectTypes = [
        { value: "TEXT", label: "Text" },
        { value: "VOICE", label: "Voice" },
        { value: "VIDEO", label: "Video" },
    ];

    let selectValue = $derived("TEXT");

    $effect(() => {
        selectValue = channelType ?? "TEXT";
    });

    const selectTriggerContent = $derived(
        channelSelectTypes.find((c) => c.value === selectValue)?.label ?? "Text"
    );

    function reset() {
        channelName = '';
        channelNameError = '';
        globalError = '';
        isPrivate = false;
        selectValue = channelType ?? "TEXT";
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        channelNameError = '';
        globalError = '';

        if (!channelName.trim()) {
            channelNameError = 'Channel name is required';
            return;
        }
        if (!currentServerId) {
            globalError = 'No server selected';
            return;
        }

        isLoading = true;

        try {
            const res = await fetch(`/api/channels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channelName: channelName.trim(),
                    channelType: selectValue,
                    serverId: currentServerId,
                    isPrivateChannel: isPrivate,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.field === 'channelName') channelNameError = data.error;
                else globalError = data.error ?? 'Something went wrong';
                return;
            }

            await invalidateAll();
            reset();
            isCreateChannelDialogOpen = false;
        } catch {
            globalError = 'Network error, please try again';
        } finally {
            isLoading = false;
        }
    }
</script>

<Dialog bind:open={isCreateChannelDialogOpen}>
    <DialogContent class="sm:max-w-106.25">
        <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
        </DialogHeader>

        <form onsubmit={handleSubmit} class="flex flex-col gap-6 mt-2">

            {#if globalError}
                <div class="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 flex items-start gap-2">
                    <CircleAlert class="w-5 h-5 mt-0.5 shrink-0" />
                    <p class="text-sm">{globalError}</p>
                </div>
            {/if}

            <FieldSet>
                <FieldGroup class="gap-2">

                    <!-- Channel Name -->
                    <Field data-invalid={!!channelNameError}>
                        <FieldLabel for="channelName">Channel Name</FieldLabel>
                        <Input
                            id="channelName"
                            type="text"
                            bind:value={channelName}
                            placeholder="Enter a unique channel name"
                            disabled={isLoading}
                        />
                        {#if channelNameError}
                            <FieldError><p>{channelNameError}</p></FieldError>
                        {/if}
                    </Field>

                    <!-- Channel Type -->
                    <Field>
                        <FieldLabel>Channel Type</FieldLabel>
                        <Select type="single" bind:value={selectValue} disabled={isLoading}>
                            <SelectTrigger>{selectTriggerContent}</SelectTrigger>
                            <SelectContent>
                                {#each channelSelectTypes as t (t.value)}
                                    <SelectItem value={t.value} label={t.label}>{t.label}</SelectItem>
                                {/each}
                            </SelectContent>
                        </Select>
                    </Field>

                    <!-- Private Channel Toggle -->
                    <Field>
                        <button
                            type="button"
                            onclick={() => isPrivate = !isPrivate}
                            disabled={isLoading}
                            class="flex items-center justify-between w-full rounded-md px-3 py-3 
                                   bg-zinc-100 dark:bg-zinc-800 
                                   hover:bg-zinc-200 dark:hover:bg-zinc-700 
                                   transition-colors text-left"
                        >
                            <div class="flex items-center gap-3">
                                <div class="p-1.5 rounded-md bg-zinc-200 dark:bg-zinc-700">
                                    <Lock class="size-4 text-zinc-600 dark:text-zinc-300" />
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                        Private Channel
                                    </span>
                                    <span class="text-xs text-zinc-500 dark:text-zinc-400">
                                        Only admins, moderators, and allowed members can view
                                    </span>
                                </div>
                            </div>

                            <!-- Toggle pill -->
                            <div class="relative shrink-0 ml-4 w-10 h-6 rounded-full transition-colors duration-200
                                        {isPrivate ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-600'}">
                                <span class="absolute top-1 left-1 size-4 rounded-full bg-white shadow transition-transform duration-200
                                             {isPrivate ? 'translate-x-4' : 'translate-x-0'}">
                                </span>
                            </div>
                        </button>
                    </Field>

                </FieldGroup>
            </FieldSet>

            <DialogFooter>
                <Button
                    type="submit"
                    disabled={isLoading}
                    class="bg-indigo-500 text-foreground hover:bg-indigo-500/90"
                >
                    {isLoading ? 'Creating...' : 'Create'}
                </Button>
            </DialogFooter>

        </form>
    </DialogContent>
</Dialog>