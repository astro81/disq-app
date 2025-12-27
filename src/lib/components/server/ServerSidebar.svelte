<script lang="ts">
    import { getAllServerChannels, getServerMembers, getCurrentServer } from '$lib/remote/server/server.remote';
	import { currentServerStore } from '$lib/stores/server-state.svelte';

    import { getUserState } from '$lib/stores/user-state.svelte';
	import ServerHeader from './ServerHeader.svelte';
	

    interface ServerSidebarProps { serverId: string; }

    let { serverId }: ServerSidebarProps = $props();

    const userState = getUserState();

    // Fetch all data in parallel
    let serverData = $derived(
        Promise.all([
            getCurrentServer({ serverId }),
            getAllServerChannels({ serverId }),
            getServerMembers({ serverId })
        ])
    );

    // Destructure the resolved data
    let currentServer = $derived(await serverData.then(([server]) => server));
    let currentServerChannels = $derived(await serverData.then(([, channels]) => channels));
    let currentServerMembers = $derived(await serverData.then(([, , members]) => members));


    let textChannels = $derived(currentServerChannels.filter(channel => channel.channelType === 'TEXT'));
    let voiceChannels = $derived(currentServerChannels.filter(channel => channel.channelType === 'VOICE'));
    let videoChannels = $derived(currentServerChannels.filter(channel => channel.channelType === 'VIDEO'));

    const members = $derived(currentServerMembers.filter(member => member.userId !== userState.user?.id));

    const role = $derived(currentServer.member.role);


    $effect(() => {
        currentServerStore.set({
            serverId: currentServer.server.serverId,
            serverName: currentServer.server.serverName,
            serverImageUrl: currentServer.server.serverImageUrl,
            serverBannerImageUrl: currentServer.server.serverBannerImageUrl,
            serverDescription: currentServer.server.serverDescription,
            serverInviteCode: currentServer.server.serverInviteCode,
            createdAt: currentServer.server.createdAt,
            updatedAt: currentServer.server.updatedAt,
            createdBy: currentServer.server.createdBy,

            memberId: currentServer.member.memberId,
            role: currentServer.member.role,
            memberUserId: currentServer.member.userId,
            memberCreatedAt: currentServer.member.createdAt,
            memberUpdatedAt: currentServer.member.updatedAt,

            memberCount: members.length + 1                 // current user was excluded from the members list
        });
    })

</script>

<div class="flex flex-col size-full text-primary dark:bg-[#2b2d31] bg-[#f2f3f5]">
    <ServerHeader {currentServer} {role} {members}/>
    {currentServer.server.serverName}
</div>
