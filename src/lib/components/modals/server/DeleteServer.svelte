<script lang="ts">
    import { goto } from "$app/navigation";
    
	import { deleteServer } from "$lib/remote/server/delete-server.remote";

    import { currentServerStore } from "$lib/stores/server-state.svelte";

	import Button from "$lib/components/ui/button/button.svelte";

    import Dialog from "$lib/components/ui/dialog/dialog.svelte";
    import DialogContent from "$lib/components/ui/dialog/dialog-content.svelte";
    import DialogHeader from "$lib/components/ui/dialog/dialog-header.svelte";
    import DialogTitle from "$lib/components/ui/dialog/dialog-title.svelte";
    import DialogDescription from "$lib/components/ui/dialog/dialog-description.svelte";
    import DialogFooter from "$lib/components/ui/dialog/dialog-footer.svelte";


    let { isDeleteServerDialogOpen = $bindable() } = $props();

    const currentServer = $derived(currentServerStore.currentServer);

    let isLoading = $state(false);

</script>
 
<Dialog bind:open={isDeleteServerDialogOpen}>
    <DialogContent class="sm:max-w-[525px]">
        <DialogHeader>
            <DialogTitle class="text-center">Delete Server</DialogTitle>
            <DialogDescription class="text-center text-zinc-500">Are you sure you want to delete 
                <span class="font-semibold text-indigo-500/90">{currentServer?.serverName}</span>?
            </DialogDescription>
        </DialogHeader>
    

        <DialogFooter class="py-4">
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

                            goto("/servers/@me");
                        } catch (error: any) {
                            console.log(error);
                            alert(error?.message ?? "Failed to delete server");
                        } finally {
                            isLoading = false;
                        }
                    }}
                >Confirm</Button>
            </div>
        </DialogFooter>

    </DialogContent>
</Dialog>
