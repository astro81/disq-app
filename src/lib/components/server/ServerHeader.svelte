<script lang="ts">
	import type { 
        ServerMemberAllProps, 
        ServerResponseProps, 
        ServerMemberRole 
    } from "$lib/types/server";


	import { 
        ChevronDown, 
        CirclePlus, 
        LogOut, 
        Settings, 
        Trash, 
        UserPlus, 
        Users 
    } from "@lucide/svelte";

    import DropdownMenu from "$lib/components/ui/dropdown-menu/dropdown-menu.svelte";
    import DropdownMenuTrigger from "$lib/components/ui/dropdown-menu/dropdown-menu-trigger.svelte";
    import DropdownMenuItem from "$lib/components/ui/dropdown-menu/dropdown-menu-item.svelte";
    import DropdownMenuContent from "$lib/components/ui/dropdown-menu/dropdown-menu-content.svelte";
    import DropdownMenuSeparator from "$lib/components/ui/dropdown-menu/dropdown-menu-separator.svelte";

	import InviteMember from "$lib/components/modals/server/InviteMember.svelte";
	import ServerSettings from "$lib/components/modals/server/ServerSettings.svelte";
	import ManageMember from "$lib/components/modals/server/ManageMember.svelte";
	import CreateChannel from "$lib/components/modals/channels/CreateChannel.svelte";
	import LeaveServer from "$lib/components/modals/server/LeaveServer.svelte";
	import DeleteServer from "$lib/components/modals/server/DeleteServer.svelte";

    
    interface ServerHeaderProps {
        currentServer: ServerResponseProps,
        role: ServerMemberRole,
        members: ServerMemberAllProps[]
    }

    // todo: setup current server store
    let { currentServer, role, members }: ServerHeaderProps = $props();
    
    const isAdmin = $derived(role === 'ADMIN');
    const isModerator = $derived(isAdmin || role === 'MODERATOR');

    let inviteDialogOpen = $state(false);
    let isServerEditDialogOpen = $state(false);
    let isManageMemberDialogOpen = $state(false);
    let isCreateChannelDialogOpen = $state(false);
    let isLeaveServerDialogOpen = $state(false);
    let isDeleteServerDialogOpen = $state(false);
</script>

 
<DropdownMenu>
    <DropdownMenuTrigger>
        {#snippet child({ props })}
            <button {...props} class="w-full text-md font-semibold px-3 
                flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2
                hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition">
                {currentServer.server.serverName}
                <ChevronDown class="size-5 ml-auto"/>
            </button>
        {/snippet}
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" class="w-56 text-xs font-medium text-black dark:text-neutral-400 space-y-0.5">
        {#if isModerator}
            <DropdownMenuItem 
                class="text-indigo-600 dark:text-indigo-400 px-3 py-2 cursor-pointer"
                onclick={() => { inviteDialogOpen = true }}
                >Invite People
                <UserPlus class="size-4 ml-auto"/>
            </DropdownMenuItem>
        {/if}
        
        {#if isAdmin}
            <DropdownMenuItem 
                class="px-3 py-2 cursor-pointer"
                onclick={() => { isServerEditDialogOpen = true }}
                >Server Settings
                <Settings class="size-4 ml-auto"/>
            </DropdownMenuItem>
        {/if}
        {#if isAdmin}
            <DropdownMenuItem 
                class="px-3 py-2 cursor-pointer"
                onclick={() => { isManageMemberDialogOpen = true }}
                >Manage Members
                <Users class="size-4 ml-auto"/>
            </DropdownMenuItem>
        {/if}

        {#if isModerator}
            <DropdownMenuItem 
                class="px-3 py-2 cursor-pointer"
                onclick={() => { isCreateChannelDialogOpen = true }}
                >Create Channels
                <CirclePlus class="size-4 ml-auto"/>
            </DropdownMenuItem>
        {/if}

        {#if isModerator}
            <DropdownMenuSeparator />
        {/if}

        {#if isAdmin}
            <DropdownMenuItem 
                class="text-rose-500 px-3 py-2 cursor-pointer"
                onclick={() => { isDeleteServerDialogOpen = true }}
                >Delete Server
                <Trash class="text-rose-500 size-4 ml-auto"/>
            </DropdownMenuItem>
        {/if}

        {#if !isAdmin}
            <DropdownMenuItem 
                class="text-rose-500 px-3 py-2 cursor-pointer"
                onclick={() => { isLeaveServerDialogOpen = true }}
                >Leave Server
                <LogOut class="text-rose-500 size-4 ml-auto"/>
            </DropdownMenuItem> 
        {/if}
            
    </DropdownMenuContent>
</DropdownMenu>

<!-- todo: pass the currentServer from the store -->
<InviteMember bind:inviteDialogOpen {currentServer}/>
<ServerSettings bind:isServerEditDialogOpen {currentServer}/>
<ManageMember bind:isManageMemberDialogOpen {members}/>
<CreateChannel bind:isCreateChannelDialogOpen/>
<LeaveServer bind:isLeaveServerDialogOpen/>
<DeleteServer bind:isDeleteServerDialogOpen/>