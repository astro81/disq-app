<!-- NavigationSidebar -->
<script lang="ts">
	import { getJoinedServers } from "$lib/remote/server/server.remote";

	import Separator from "$lib/components/ui/separator/separator.svelte";
	import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
    import ModeToggleButton from "$lib/components/ui/button/ModeToggleButton.svelte";

	import UserButton from "$lib/components/profile/UserButton.svelte";
	import CreateServer from "$lib/components/modals/server/CreateServer.svelte";
	import UserNavigationItem from "$lib/components/navigation/UserNavigationItem.svelte";
	import NavigationItem from "$lib/components/navigation/NavigationItem.svelte";
    import {Button} from "$lib/components/ui/button";
    import {Compass} from "lucide-svelte";

    
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

<div class="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1e1f22] bg-sidebar-border py-3">

    <UserNavigationItem />

    <CreateServer />

    <Button href="/servers/discovery" data-sveltekit-preload-data
            class="flex mx-3 size-12 rounded-3xl group-hover:rounded-2xl
            transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700">
        <Compass class="size-5 text-white"/>
    </Button>

    <Separator class="h-0.5 bg-zinc-300 dark:bg-zinc-700 rounded-md w-10! mx-auto"/>

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