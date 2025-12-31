<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
	import Button from "../ui/button/button.svelte";
	import { currentServerStore } from "$lib/stores/server-state.svelte";
	import { goto } from "$app/navigation";
	import { deleteServer } from "$lib/remote/server/delete-server.remote";


    let { isDeleteServerDialogOpen = $bindable() } = $props();

    const currentServer = $derived(currentServerStore.currentServer);

    let isLoading = $state(false);

</script>
 
<Dialog.Root bind:open={isDeleteServerDialogOpen}>
    <Dialog.Content class="sm:max-w-[525px]">
        <Dialog.Header>
            <Dialog.Title>Delete Server</Dialog.Title>
            <Dialog.Description class="text-center text-zinc-500">Are you sure you want to delete 
                <span class="font-semibold text-indigo-500/90">{currentServer?.serverName}</span>?
            </Dialog.Description>
        </Dialog.Header>
    

        <Dialog.Footer class="py-4">
            <div class="flex items-center justify-between w-full">
                <Button 
                    disabled={isLoading}     

                    onclick={() => { isDeleteServerDialogOpen = false; }}
                    variant="ghost"
                    >Cancel</Button>

                <Button
                    disabled={isLoading}
                    variant="destructive"
                    onclick={async () => {
                        try {
                            isLoading = true;

                            await deleteServer({ serverId: currentServer?.serverId ?? "" })

                            isDeleteServerDialogOpen = false;

                            goto("/server/@me");
                        } catch (error: any) {
                            console.log(error);
                            alert(error?.message ?? "Failed to delete server");
                        } finally {
                            isLoading = false;
                        }
                    }}
                >Confirm</Button>
            </div>
        </Dialog.Footer>

    </Dialog.Content>
</Dialog.Root>
