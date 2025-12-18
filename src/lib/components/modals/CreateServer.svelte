<script lang="ts">
    import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import Input from "$lib/components/ui/input/input.svelte";
	import { createServer } from "$lib/remote/server/create-server.remote";

    import * as Field from "$lib/components/ui/field";

    import { CircleAlert, X } from "@lucide/svelte";

	import { createUploader } from "$lib/utils/uploadthing";
	import { UploadDropzone } from "@uploadthing/svelte";


    let isOpen = $state(false);
    let isLoading = $state(false);
    let imageUrl: string | null = $state(null);
    let uploadError: string | null = null;


    const uploader = createUploader("serverImage", {
        onClientUploadComplete: (res) => {
            imageUrl = res[0].ufsUrl;
        },
        onUploadError: (error: Error) => {
            alert(`ERROR! ${error.message}`);
        },
    });


</script>
 
<Dialog.Root open>

    <Dialog.Trigger class={buttonVariants({ variant: "outline" })}>Open Dialog</Dialog.Trigger>

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

                    {#if imageUrl}
                        <!-- Preview -->
                        <div class="relative w-full mt-2">
                            <img src={imageUrl} alt="Preview" class="h-60 w-full rounded object-cover" />
                            <button
                                type="button"
                                onclick={() => imageUrl = null}
                                class="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 rounded-full p-1 shadow"
                                aria-label="Remove image"
                            >
                                <X class="w-4 h-4 text-gray-800"/>
                            </button>
                        </div>
                    {:else}
                        <!-- UploadThing Dropzone -->
                        <UploadDropzone
                            {uploader}
                            multiple={false}
                            class="border-dashed border-2 border-gray-400 p-6 rounded text-center cursor-pointer"
                        >
                            Drag & drop or click to upload server image
                        </UploadDropzone>
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