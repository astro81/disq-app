<script lang="ts">
	import type { ServerMemberAllProps, ServerResponseProps, ServerMemberRole } from "$lib/types/server";

    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";

	import { ChevronDown, CirclePlus, LogOut, Settings, Trash, UserPlus, Users } from "@lucide/svelte";
	import InviteMember from "$lib/components/modals/InviteMember.svelte";
	import ServerSettings from "$lib/components/modals/ServerSettings.svelte";
	import ManageMember from "../modals/ManageMember.svelte";

    
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
</script>

 
<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        {#snippet child({ props })}
            <button {...props} class="w-full text-md font-semibold px-3 
                flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2
                hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition">
                {currentServer.server.serverName}
                <ChevronDown class="size-5 ml-auto"/>
            </button>
        {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="start" class="w-56 text-xs font-medium text-black dark:text-neutral-400 space-y-0.5">
        {#if isModerator}
            <DropdownMenu.Item 
                class="text-indigo-600 dark:text-indigo-400 px-3 py-2 cursor-pointer"
                onclick={() => { inviteDialogOpen = true }}
                >Invite People
                <UserPlus class="size-4 ml-auto"/>
            </DropdownMenu.Item>
        {/if}
        
        {#if isAdmin}
            <DropdownMenu.Item 
                class="px-3 py-2 cursor-pointer"
                onclick={() => { isServerEditDialogOpen = true }}
                >Server Settings
                <Settings class="size-4 ml-auto"/>
            </DropdownMenu.Item>
        {/if}
        {#if isAdmin}
            <DropdownMenu.Item 
                class="px-3 py-2 cursor-pointer"
                onclick={() => { isManageMemberDialogOpen = true }}
                >Manage Members
                <Users class="size-4 ml-auto"/>
            </DropdownMenu.Item>
        {/if}

        {#if isModerator}
            <DropdownMenu.Item class="px-3 py-2 cursor-pointer">
                Create Channels
                <CirclePlus class="size-4 ml-auto"/>
            </DropdownMenu.Item>
        {/if}

        {#if isModerator}
            <DropdownMenu.Separator />
        {/if}

        {#if isAdmin}
            <DropdownMenu.Item class="text-rose-500 px-3 py-2 cursor-pointer">
                Delete Server
                <Trash class="text-rose-500 size-4 ml-auto"/>
            </DropdownMenu.Item>
        {/if}

        {#if !isAdmin}
            <DropdownMenu.Item class="text-rose-500 px-3 py-2 cursor-pointer">
                Leave Server
                <LogOut class="text-rose-500 size-4 ml-auto"/>
            </DropdownMenu.Item> 
        {/if}
            
    </DropdownMenu.Content>
</DropdownMenu.Root>

<!-- todo: pass the currentServer from the store -->
<InviteMember bind:inviteDialogOpen={inviteDialogOpen} {currentServer}/>
<ServerSettings bind:isServerEditDialogOpen={isServerEditDialogOpen} {currentServer}/>
<ManageMember bind:isManageMemberDialogOpen={isManageMemberDialogOpen} {members}/>