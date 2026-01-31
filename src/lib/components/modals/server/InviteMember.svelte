<script lang="ts">
    import { onMount } from "svelte";
	import { browser } from "$app/environment";
    
    import { inviteCode } from "$lib/remote/server/invite-code.remote";

	import { Check, Copy, RefreshCw } from "@lucide/svelte";
	
    import Button from "$lib/components/ui/button/button.svelte";
	import Input from "$lib/components/ui/input/input.svelte";
	import Label from "$lib/components/ui/label/label.svelte";

    import Dialog from "$lib/components/ui/dialog/dialog.svelte";
    import DialogContent from "$lib/components/ui/dialog/dialog-content.svelte";
    import DialogHeader from "$lib/components/ui/dialog/dialog-header.svelte";
    import DialogTitle from "$lib/components/ui/dialog/dialog-title.svelte";


    let { 
        inviteDialogOpen = $bindable(),
        currentServer
    } = $props();

    let origin = $state("");

    onMount(() => {
        origin = browser ? window.location.origin : "";
    });

    const inviteUrl = $derived(origin + `/invite/${currentServer.server?.serverInviteCode}`);

    let copied = $state(false);
    let isLoading = $state(false);

    const onCopy = () => {
        navigator.clipboard.writeText(inviteUrl);
        copied = true;

        setTimeout(() => {
            copied = false;
        }, 1000);
    }

</script>
 
<Dialog bind:open={inviteDialogOpen}>
    <DialogContent class="sm:max-w-[525px]">
        <DialogHeader>
            <DialogTitle>Invite People</DialogTitle>
        </DialogHeader>
        
        <div class="mt-2">
            <Label class="uppercase text-xs font-bold text-zinc-500">Server Invite Link</Label>
            <div class="flex items-center mt-2 gap-x-2">
                <Input 
                    class="bg-zinc-300/50 border-0 focus-visible:right-0 focus-visible:ring-offset-0"
                    value={inviteUrl}
                    disabled={isLoading}/>
                
                <Button size="icon" disabled={isLoading} onclick={onCopy}>
                    {#if copied}
                        <Check class="size-4"/>
                    {:else}
                        <Copy class="size-4"/>
                    {/if}
                </Button>
            </div>
            <Button
                disabled={isLoading}
                variant="link"
                size="sm"
                class="text-xs text-zinc-500 mt-4 px-0!"
                onclick={async () => {
                    if (!currentServer.server?.serverId) alert("server Id not available");

                    try {
                        isLoading = true;
                        await inviteCode({ serverId: currentServer.server?.serverId });
                    } catch (error) {
                        alert(error);
                    } finally {
                        isLoading = false;
                    }
                }}
            >Generate a new link
                <RefreshCw class="size-4 ml-2"/>
            </Button>
        </div>

    </DialogContent>
</Dialog>
