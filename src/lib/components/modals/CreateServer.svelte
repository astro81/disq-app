<script lang="ts">
    import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import Input from "$lib/components/ui/input/input.svelte";
	import { createServer } from "$lib/remote/server/create-server.remote";

    import * as Field from "$lib/components/ui/field";

    import { CircleAlert, Plus } from "@lucide/svelte";

	import { browser } from "$app/environment";
	import CreateServerImageUploader from "./CreateServerImageUploader.svelte";


    let isOpen = $state(false);
    let isLoading = $state(false);
    let imageUrl: string | null = $state(null);

</script>
 
<Dialog.Root bind:open={isOpen}>

    <Dialog.Trigger class="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] 
            transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700 group-hover:bg-emerald-500">
        <Plus class="group-hover:text-white transition text-emerald-500" size="25"/>
    </Dialog.Trigger>

    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Create Server</Dialog.Title>
            <Dialog.Description>Create Your own server</Dialog.Description>
        </Dialog.Header>
            
        <form 
            {...createServer.enhance(async ({ submit, form }) => {
                await submit();          
                form.reset();      
                isOpen = false;
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
            

            <Field.Set>
                <Field.Group class="gap-2">

                    <!-- Server Name -->
                    <Field.Field data-invalid={(createServer.fields.serverName?.issues() ?? []).length > 0}>
                        <Field.Label for="serverName">Server Name</Field.Label>
                        <Input {...createServer.fields.serverName.as('text')} placeholder="Enter a unique server name"/>
                        <Field.Error>
                            {#each createServer.fields.serverName.issues() ?? [] as issue}
                                <p>{issue.message}</p>
                            {/each}
                        </Field.Error>
                    </Field.Field>

                    <!-- Uploader (CLIENT ONLY) -->
                    {#if browser}
                        <CreateServerImageUploader bind:imageUrl />
                    {/if}

                    <!-- Hidden input for form submission -->
                    <input type="hidden" name="serverImage" value={imageUrl ?? ""} />

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