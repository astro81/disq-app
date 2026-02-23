<script lang="ts">
    import { goto } from "$app/navigation";
	
    import { leaveServer } from "$lib/remote/server/leave-server.remote";

    import { currentServerStore } from "$lib/stores/server-state.svelte";

	import Button from "$lib/components/ui/button/button.svelte";

    import Dialog from "$lib/components/ui/dialog/dialog.svelte";
    import DialogContent from "$lib/components/ui/dialog/dialog-content.svelte";
    import DialogHeader from "$lib/components/ui/dialog/dialog-header.svelte";
    import DialogTitle from "$lib/components/ui/dialog/dialog-title.svelte";
    import DialogDescription from "$lib/components/ui/dialog/dialog-description.svelte";
    import DialogFooter from "$lib/components/ui/dialog/dialog-footer.svelte";


    let { isLeaveServerDialogOpen = $bindable() } = $props();

    const currentServer = $derived(currentServerStore.currentServer);

    let isLoading = $state(false);

</script>
 
<Dialog bind:open={isLeaveServerDialogOpen}>
    <DialogContent class="sm:max-w-[525px]">
        <DialogHeader>
            <DialogTitle>Leave Server</DialogTitle>
            <DialogDescription class="text-center text-zinc-500">Are you sure you want to leave 
                <span class="font-semibold text-indigo-500/90">{currentServer?.serverName}</span>?
            </DialogDescription>
        </DialogHeader>
        
        <DialogFooter class="py-4">
            <div class="flex items-center justify-between w-full">
                <Button 
                    disabled={isLoading}     

                    onclick={() => { isLeaveServerDialogOpen = false; }}
                    variant="ghost"
                    >Cancel</Button>

                <Button
                    disabled={isLoading}
                    variant="destructive"
                    onclick={async () => {
                        try {
                            isLoading = true;

                            await leaveServer({ serverId: currentServer?.serverId ?? "" })

                            isLeaveServerDialogOpen = false;

                            goto("/server/@me");
                        } catch (error: any) {
                            console.log(error);
                            alert(error?.message ?? "Failed to leave server");
                        } finally {
                            isLoading = false;
                        }
                    }}
                >Confirm</Button>
            </div>
        </DialogFooter>

    </DialogContent>
</Dialog>
