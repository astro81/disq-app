<script lang="ts">
	import { page } from "$app/state";

	import type { ChannelProps, ServerMemberRole, ServerProps } from "$lib/types/server";
	
    import { cn } from "$lib/utils";
	
    import { Hash, Lock, Mic, SquarePen, Trash, Video } from "@lucide/svelte";

    import DeleteChannel from "$lib/components/modals/channels/DeleteChannel.svelte";
	import EditChannel from "$lib/components/modals/channels/EditChannel.svelte";

	import ActionTooltip from "$lib/components/navigation/ActionTooltip.svelte";


    interface ServerChannelProps {
        channel: ChannelProps;
        server: ServerProps;
        role?: ServerMemberRole;
    }

    let { channel, server, role }: ServerChannelProps = $props();

    let isEditChannelDialogOpen = $state(false);
    let isDeleteChannelDialogOpen = $state(false);
</script>

<div>
    <button 
        onclick={() => {}}
        class={cn(
            "group pl-2 py-2 pr-4 rounded-md flex items-center gap-x-2 w-full",
            "hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
            page.params?.channelId === channel.channelId && "bg-zinc-700/20 dark:bg-zinc-700"
        )}
    >
        
        {#if channel.channelType === "TEXT"}
            <Hash class="size-4 mr-2"/>
        {:else if channel.channelType === "VOICE"}
            <Mic class="size-4 mr-2"/>
        {:else if channel.channelType === "VIDEO"}
            <Video class="size-4 mr-2"/>
        {/if}

        <p class={cn(
                "line-clamp-1 font-semibold text-sm text-zinc-500", 
                "group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
                page.params?.channelId === channel.channelId && "text-primary dark:text-zinc-200 dark:group-hover:text-white"
            )}>
            {channel.channelName}
        </p>
        
        {#if channel.channelName !== "general" && role !== "GUEST"}
            <div class="ml-auto flex items-center gap-x-2">
                <ActionTooltip label="Edit" side="top">
                    <SquarePen 
                        onclick={() => isEditChannelDialogOpen = true}
                        class="hidden group-hover:block size-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"/>
                </ActionTooltip>
                
                <ActionTooltip label="Delete" side="top">
                    <Trash 
                        onclick={() => isDeleteChannelDialogOpen = true}
                        class="hidden group-hover:block size-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
                        />
                </ActionTooltip>
            </div>
        {/if}

        {#if channel.channelName === "general"}
            <Lock class="ml-auto size-4 text-zinc-500 dark:text-zinc-400"/>
        {/if}
    </button>
</div>


<DeleteChannel bind:isDeleteChannelDialogOpen {channel}/>
<EditChannel bind:isEditChannelDialogOpen {channel}/>