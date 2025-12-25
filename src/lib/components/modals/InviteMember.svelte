<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Check, Copy, RefreshCw } from "@lucide/svelte";
	import Button from "../ui/button/button.svelte";
	import Input from "../ui/input/input.svelte";
	import Label from "../ui/label/label.svelte";
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import { inviteCode } from "$lib/remote/server/invite-code.remote";


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
 
<Dialog.Root bind:open={inviteDialogOpen}>
    <Dialog.Content class="sm:max-w-[525px]">
        <Dialog.Header>
            <Dialog.Title>Invite People</Dialog.Title>
        </Dialog.Header>
        
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

    </Dialog.Content>
</Dialog.Root>
