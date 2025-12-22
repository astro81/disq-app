<!-- NavigationSidebar -->
<script lang="ts">
	import { getJoinedServers } from "$lib/remote/server/server.remote";
	import Separator from "../ui/separator/separator.svelte";
	import ScrollArea from "../ui/scroll-area/scroll-area.svelte";
	import NavigationItem from "./NavigationItem.svelte";
	import ModeToggleButton from "../ui/button/ModeToggleButton.svelte";
	import UserButton from "../profile/UserButton.svelte";
	import CreateServer from "../modals/CreateServer.svelte";
	
    interface JoinedServerProps {
        serverId: string;
        serverName: string;
        serverImageUrl: string,
        serverBannerImageUrl: string | null;
        serverInviteCode: string;
        serverCreatedBy: string;
        serverCreatedAt: Date;
        memberId: string;
        memberRole: 'ADMIN' | 'MODERATOR' | 'GUEST';
        memberJoinedAt: Date;
    }

    let joinedServers = $derived<JoinedServerProps[]>(await getJoinedServers());
</script>

<div class="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1e1f22] py-3">
    <CreateServer />

    <Separator class="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10! mx-auto"/>

    <ScrollArea class="flex-1 w-full">
        {#each joinedServers as server}
            <div class="mb-4">
                <NavigationItem 
                    serverId={server.serverId} 
                    serverName={server.serverName} 
                    serverImageUrl={server.serverImageUrl}/>
            </div>
        {/each}
    </ScrollArea>

    <div class="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <ModeToggleButton />

        <UserButton />
    </div>
</div>