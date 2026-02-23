<script lang="ts">
    import { browser } from "$app/environment";

    import { createServer } from "$lib/remote/server/create-server.remote";

    import { CircleAlert } from "@lucide/svelte";

    import { Button } from "$lib/components/ui/button/index.js";
    import Input from "$lib/components/ui/input/input.svelte";

    import Dialog from "$lib/components/ui/dialog/dialog.svelte";
    import DialogContent from "$lib/components/ui/dialog/dialog-content.svelte";
    import DialogHeader from "$lib/components/ui/dialog/dialog-header.svelte";
    import DialogTitle from "$lib/components/ui/dialog/dialog-title.svelte";
    import DialogDescription from "$lib/components/ui/dialog/dialog-description.svelte";
    import DialogFooter from "$lib/components/ui/dialog/dialog-footer.svelte";

    import FieldSet from "$lib/components/ui/field/field-set.svelte";
    import FieldGroup from "$lib/components/ui/field/field-group.svelte";
    import Field from "$lib/components/ui/field/field.svelte";
    import FieldLabel from "$lib/components/ui/field/field-label.svelte";
    import FieldError from "$lib/components/ui/field/field-error.svelte";

	import CreateServerImageUploader from "$lib/components/modals/server/CreateServerImageUploader.svelte";


    let { 
        isServerEditDialogOpen = $bindable(),
        currentServer
    } = $props();

    let isLoading = $state(false);
    let imageUrl: string | null = $state(null);
</script>
 
<Dialog bind:open={isServerEditDialogOpen}>
    <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
            <DialogTitle>Edit Server</DialogTitle>
            <DialogDescription>Create Your own server</DialogDescription>
        </DialogHeader>
            

        <!--todo: update server -->
        <form 
            {...createServer.enhance(async ({ submit, form }) => {
                await submit();          
                form.reset();      
                isServerEditDialogOpen = false;
            })}
            oninput={() => createServer.validate()}
            enctype="multipart/form-data"
            class="flex flex-col gap-6"
            >

            <!-- Global-level errors -->
            {#if (createServer.fields.allIssues()?.some(issue => !issue.path || issue.path.length === 0))}
                <div class="mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 flex items-start gap-2">
                    <CircleAlert class="w-5 h-5 mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
                    <div class="flex flex-col gap-1 text-sm">
                        {#each (createServer.fields.allIssues()?.filter(issue => !issue.path || issue.path.length === 0)) ?? [] as issue}
                            <p>{issue.message}</p>
                        {/each}
                    </div>
                </div>
            {/if}
            

            <FieldSet>
                <FieldGroup class="gap-2">

                    <!-- Server Name -->
                    <Field data-invalid={(createServer.fields.serverName?.issues() ?? []).length > 0}>
                        <FieldLabel for="serverName">Server Name</FieldLabel>
                        <Input {...createServer.fields.serverName.as('text')} placeholder="Enter a unique server name" value={currentServer.server.serverName}/>
                        <FieldError>
                            {#each createServer.fields.serverName.issues() ?? [] as issue}
                                <p>{issue.message}</p>
                            {/each}
                        </FieldError>
                    </Field>

                    {#if currentServer.server.serverImageUrl}
                        <img src={currentServer.server.serverImageUrl} alt="server"/>
                    {:else if browser}
                        <CreateServerImageUploader bind:imageUrl />
                    {/if}

                    <!-- Hidden input for form submission -->
                    <input type="hidden" name="serverImage" value={imageUrl ?? ""} />

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