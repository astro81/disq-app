<script lang="ts">
    import { goto } from "$app/navigation";

    import { deleteChannel } from "$lib/remote/channel/delete-channel.remote";
	
    import { currentServerStore } from "$lib/stores/server-state.svelte";
    
	import type { ChannelProps } from "$lib/types/server";

	import Button from "$lib/components/ui/button/button.svelte";

    import Dialog from "$lib/components/ui/dialog/dialog.svelte";
    import DialogContent from "$lib/components/ui/dialog/dialog-content.svelte";
    import DialogHeader from "$lib/components/ui/dialog/dialog-header.svelte";
    import DialogTitle from "$lib/components/ui/dialog/dialog-title.svelte";
    import DialogDescription from "$lib/components/ui/dialog/dialog-description.svelte";
    import DialogFooter from "$lib/components/ui/dialog/dialog-footer.svelte";

    
    interface ServerChannelProps {
        isDeleteChannelDialogOpen: boolean;
        channel: ChannelProps;
    }
    
    const currentServer = $derived(currentServerStore.currentServer);

    let { 
        isDeleteChannelDialogOpen = $bindable(),
        channel
    }: ServerChannelProps = $props();

    let isLoading = $state(false);

</script>
 
<Dialog bind:open={isDeleteChannelDialogOpen}>
    <DialogContent class="sm:max-w-[525px]">
        <DialogHeader>
            <DialogTitle class="text-center">Delete Channel</DialogTitle>
            <DialogDescription class="text-center text-zinc-500">Are you sure you want to delete 
                <span class="font-semibold text-indigo-500/90">#{channel.channelName}</span>?
            </DialogDescription>
        </DialogHeader>
    

        <DialogFooter class="py-4">
            <div class="flex items-center justify-between w-full">
                <Button 
                    disabled={isLoading}     

                    onclick={() => { isDeleteChannelDialogOpen = false; }}
                    variant="ghost"
                    >Cancel</Button>

                <Button
                    disabled={isLoading || channel.channelName === "general" }
                    variant="destructive"
                    onclick={async () => {
                        try {
                            isLoading = true;

                            await deleteChannel({
                                channelId: channel.channelId,
                                serverId: currentServer?.serverId ?? ""
                            });

                            isDeleteChannelDialogOpen = false;

                            goto(`/servers/${currentServer?.serverId}`);
                        } catch (error: any) {
                            console.log(error);
                            alert(error?.message ?? "Failed to delete channel");
                        } finally {
                            isLoading = false;
                        }
                    }}
                >Confirm</Button>
            </div>
        </DialogFooter>

    </DialogContent>
</Dialog>
