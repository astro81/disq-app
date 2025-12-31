<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
	import Button from "../ui/button/button.svelte";
	import { currentServerStore } from "$lib/stores/server-state.svelte";
	import { goto } from "$app/navigation";
	import { leaveServer } from "$lib/remote/server/leave-server.remote";


    let { isLeaveServerDialogOpen = $bindable() } = $props();

    const currentServer = $derived(currentServerStore.currentServer);

    let isLoading = $state(false);

</script>
 
<Dialog.Root bind:open={isLeaveServerDialogOpen}>
    <Dialog.Content class="sm:max-w-[525px]">
        <Dialog.Header>
            <Dialog.Title>Leave Server</Dialog.Title>
            <Dialog.Description class="text-center text-zinc-500">Are you sure you want to leave 
                <span class="font-semibold text-indigo-500/90">{currentServer?.serverName}</span>?
            </Dialog.Description>
        </Dialog.Header>
        
        <div class="mt-2">
            leave
        </div>

        <Dialog.Footer class="py-4">
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
        </Dialog.Footer>

    </Dialog.Content>
</Dialog.Root>
