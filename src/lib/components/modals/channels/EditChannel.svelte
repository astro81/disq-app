<script lang="ts">
    import { editChannel } from "$lib/remote/channel/edit-channel.remote";

    import type { ChannelProps } from "$lib/types/server";

    import { currentServerStore } from "$lib/stores/server-state.svelte";

    import { CircleAlert } from "@lucide/svelte";

	import Button from "$lib/components/ui/button/button.svelte";
	import Input from "$lib/components/ui/input/input.svelte";

    import Dialog from "$lib/components/ui/dialog/dialog.svelte";
    import DialogContent from "$lib/components/ui/dialog/dialog-content.svelte";
    import DialogHeader from "$lib/components/ui/dialog/dialog-header.svelte";
    import DialogTitle from "$lib/components/ui/dialog/dialog-title.svelte";
    import DialogFooter from "$lib/components/ui/dialog/dialog-footer.svelte";

    import FieldSet from "$lib/components/ui/field/field-set.svelte";
    import FieldGroup from "$lib/components/ui/field/field-group.svelte";
    import Field from "$lib/components/ui/field/field.svelte";
    import FieldLabel from "$lib/components/ui/field/field-label.svelte";
    import FieldError from "$lib/components/ui/field/field-error.svelte";

	import Select from "$lib/components/ui/select/select.svelte";
    import SelectTrigger from "$lib/components/ui/select/select-trigger.svelte";
	import SelectContent from "$lib/components/ui/select/select-content.svelte";
	import SelectItem from "$lib/components/ui/select/select-item.svelte";

    
    interface CreateChannelProps {
        isEditChannelDialogOpen: boolean;
        channel: ChannelProps;
    }

    let { 
        isEditChannelDialogOpen = $bindable(),
        channel
    }: CreateChannelProps = $props();

    const currentServer = $derived(currentServerStore.currentServer);

    let isLoading = $state(false);

    const channelSelectTypes = [
        { value: "TEXT", label: "Text" },
        { value: "VOICE", label: "Voice" },
        { value: "VIDEO", label: "Video" }
    ];

    let selectValue = $state("");

    const selectTriggerContent = $derived(
        channelSelectTypes.find((c) => c.value === selectValue)?.label ?? channelSelectTypes[0].label
    )

    $effect(() => {
        selectValue = channel.channelType ?? "TEXT";
    });


</script>
 
<Dialog bind:open={isEditChannelDialogOpen}>
    <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
            <DialogTitle>Edit Channel</DialogTitle>
        </DialogHeader>
            
        <form 
            {...editChannel.enhance(async ({ submit, form }) => {
                isLoading = true;
                
                await submit(); // always resolves

                // If there are ANY issues, do nothing (dialog stays open)
                if (editChannel.fields.allIssues()?.length) {
                    isLoading = false;
                    return;
                }

                // Success path
                form.reset();
                selectValue = "";
                isEditChannelDialogOpen = false;

                isLoading = false;
            })}
            oninput={() => editChannel.validate()}
            enctype="multipart/form-data"
            class="flex flex-col gap-6 mt-2"
            >

            <!-- Global-level errors -->
            {#if (editChannel.fields.allIssues()?.some(issue => !issue.path || issue.path.length === 0))}
                <div class="mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 flex items-start gap-2">
                    <CircleAlert class="w-5 h-5 mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
                    <div class="flex flex-col gap-1 text-sm">
                        {#each (editChannel.fields.allIssues()?.filter(issue => !issue.path || issue.path.length === 0)) ?? [] as issue}
                            <p>{issue.message}</p>
                        {/each}
                    </div>
                </div>
            {/if}

            {#if channel.channelName === "general"}
                <p class="text-xs text-zinc-500">
                    The general channel cannot be renamed or deleted.
                </p>
            {/if}

            <FieldSet>
                <FieldGroup class="gap-2">

                    <!-- Channel Name -->
                    <Field data-invalid={(editChannel.fields.channelName?.issues() ?? []).length > 0}>
                        <FieldLabel for="channelName">Channel Name</FieldLabel>
                        <Input {...editChannel.fields.channelName.as('text')} placeholder="Enter a unique channel name" value={channel.channelName}/>
                        <FieldError>
                            {#each editChannel.fields.channelName.issues() ?? [] as issue}
                                <p>{issue.message}</p>
                            {/each}
                        </FieldError>
                    </Field>

                    <!-- Channel Type -->
                    <Field>
                        <FieldLabel for="channelType">Channel Type</FieldLabel>
                        <Select 
                            type="single" 
                            bind:value={selectValue} 
                            disabled={isLoading}
                            >
                            <SelectTrigger>{selectTriggerContent}</SelectTrigger>
                            <SelectContent>
                                {#each channelSelectTypes as selectType (selectType.value)}
                                    <SelectItem value={selectType.value} label={selectType.label}>{selectType.label}</SelectItem>
                                {/each}
                            </SelectContent>
                        </Select>

                        <input type="hidden" name="channelType" value={selectValue || "TEXT"} />
                    </Field>

                    <input type="hidden" name="serverId" value={currentServer?.serverId} />
                    <input type="hidden" name="channelId" value={channel.channelId} />

                </FieldGroup>
            </FieldSet>


            <DialogFooter>
                <Button 
                    type="submit" 
                    disabled={isLoading}
                    class="bg-indigo-500 text-foreground hover:bg-indigo-500/90"
                    >Save</Button>
            </DialogFooter>

        </form>
    </DialogContent>
</Dialog>
