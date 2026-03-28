<script lang="ts">
    import { goto } from "$app/navigation";
    import { leaveServer } from "$lib/remote/server/leave-server.remote";

    import Button from "$lib/components/ui/button/button.svelte";
    import Dialog from "$lib/components/ui/dialog/dialog.svelte";
    import DialogContent from "$lib/components/ui/dialog/dialog-content.svelte";
    import DialogHeader from "$lib/components/ui/dialog/dialog-header.svelte";
    import DialogTitle from "$lib/components/ui/dialog/dialog-title.svelte";
    import DialogDescription from "$lib/components/ui/dialog/dialog-description.svelte";
    import DialogFooter from "$lib/components/ui/dialog/dialog-footer.svelte";
    import type { ServerProps } from "$lib/types/server";
	import { resolve } from "$app/paths";

    let {
        isLeaveServerDialogOpen = $bindable(),
        currentServer,
    }: {
        isLeaveServerDialogOpen: boolean;
        currentServer: ServerProps;
    } = $props();

    let isLoading = $state(false);

    async function handleLeaveServer() {
        try {
            isLoading = true;

            const message = await leaveServer({ serverId: currentServer?.serverId ?? "" });

            isLeaveServerDialogOpen = false;

            await goto(resolve("/servers/@me"));
        } catch (err: any) {
            console.error(err);
            alert(err?.message ?? "Failed to leave server");
        } finally {
            isLoading = false;
        }
    }
</script>

<Dialog bind:open={isLeaveServerDialogOpen}>
    <DialogContent class="sm:max-w-131.25">
        <DialogHeader>
            <DialogTitle>Leave Server</DialogTitle>
            <DialogDescription class="text-center text-zinc-500">
                Are you sure you want to leave
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
                    onclick={handleLeaveServer}
                >
                    {isLoading ? "Leaving..." : "Confirm"}
                </Button>
            </div>
        </DialogFooter>
    </DialogContent>
</Dialog>