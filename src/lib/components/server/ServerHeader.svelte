<script lang="ts">
	import type { ServerResponseProps, ServerRole } from "$lib/types/server";
	import { ChevronDown } from "@lucide/svelte";
	import DropdownMenuTrigger from "../ui/dropdown-menu/dropdown-menu-trigger.svelte";
	import DropdownMenu from "../ui/dropdown-menu/dropdown-menu.svelte";


    interface ServerHeaderProps {
        currentServer: ServerResponseProps,
        role: ServerRole
    }

    // todo: setup current server store
    let { currentServer, role }: ServerHeaderProps = $props();
    

    const isAdmin = $derived(role === 'ADMIN');
    const isModerator = $derived(isAdmin || role === 'MODERATOR');
</script>

<div>
    <DropdownMenu>
        <DropdownMenuTrigger class="focus:outline-none">
            <button class="w-full text-md font-semibold px-3 
                flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2
                hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition">
                {currentServer.server.serverName}
                <ChevronDown class="size-5 ml-auto"/>
            </button>
        </DropdownMenuTrigger>
    </DropdownMenu>
</div>