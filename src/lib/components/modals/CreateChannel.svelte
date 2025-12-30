<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { CircleAlert } from "@lucide/svelte";
	import Button from "../ui/button/button.svelte";
	import Input from "../ui/input/input.svelte";

	import { currentServerStore } from "$lib/stores/server-state.svelte";
	import { createServer } from "$lib/remote/server/create-server.remote";

    import * as Field from "$lib/components/ui/field";

	import Select from "../ui/select/select.svelte";
    import SelectTrigger from "../ui/select/select-trigger.svelte";
	import SelectContent from "../ui/select/select-content.svelte";
	import SelectItem from "../ui/select/select-item.svelte";
	import { createChannel } from "$lib/remote/channel/create-channel.remote";

    let { 
        isCreateChannelDialogOpen = $bindable(),
    } = $props();

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


</script>
 
<Dialog.Root bind:open={isCreateChannelDialogOpen}>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Create Channel</Dialog.Title>
        </Dialog.Header>
            
        <form 
            {...createChannel.enhance(async ({ submit, form }) => {
                isLoading = true;
                
                await submit(); // always resolves

                // If there are ANY issues, do nothing (dialog stays open)
                if (createChannel.fields.allIssues()?.length) {
                    isLoading = false;
                    return;
                }

                // Success path
                form.reset();
                selectValue = "";
                isCreateChannelDialogOpen = false;

                isLoading = false;
            })}
            oninput={() => createChannel.validate()}
            enctype="multipart/form-data"
            class="flex flex-col gap-6 mt-2"
            >

            <!-- Global-level errors -->
            {#if (createChannel.fields.allIssues()?.some(issue => !issue.path || issue.path.length === 0))}
                <div class="mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 flex items-start gap-2">
                    <CircleAlert class="w-5 h-5 mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
                    <div class="flex flex-col gap-1 text-sm">
                        {#each (createChannel.fields.allIssues()?.filter(issue => !issue.path || issue.path.length === 0)) ?? [] as issue}
                            <p>{issue.message}</p>
                        {/each}
                    </div>
                </div>
            {/if}
            

            <Field.Set>
                <Field.Group class="gap-2">

                    <!-- Channel Name -->
                    <Field.Field data-invalid={(createChannel.fields.channelName?.issues() ?? []).length > 0}>
                        <Field.Label for="channelName">Channel Name</Field.Label>
                        <Input {...createChannel.fields.channelName.as('text')} placeholder="Enter a unique channel name"/>
                        <Field.Error>
                            {#each createChannel.fields.channelName.issues() ?? [] as issue}
                                <p>{issue.message}</p>
                            {/each}
                        </Field.Error>
                    </Field.Field>

                    <!-- Channel Type -->
                    <Field.Field>
                        <Field.Label for="channelType">Channel Type</Field.Label>
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
                        <input type="hidden" name="serverId" value={currentServer?.serverId} />
                    </Field.Field>

                </Field.Group>
            </Field.Set>


            <Dialog.Footer>
                <Button 
                    type="submit" 
                    disabled={isLoading}
                    class="bg-indigo-500 text-foreground hover:bg-indigo-500/90"
                    >Create</Button>
            </Dialog.Footer>

        </form>
    </Dialog.Content>
</Dialog.Root>
