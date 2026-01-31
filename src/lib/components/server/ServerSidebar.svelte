<script lang="ts">
	import { getAllServerChannelsList } from '$lib/remote/channel/channel.remote';
    import { getServerMembersList, getCurrentServer } from '$lib/remote/server/server.remote';
	import { currentServerStore } from '$lib/stores/server-state.svelte';

    import { getUserState } from '$lib/stores/user-state.svelte';
	import ScrollArea from '../ui/scroll-area/scroll-area.svelte';
	import Separator from '../ui/separator/separator.svelte';
	import ServerChannel from './ServerChannel.svelte';
	import ServerHeader from './ServerHeader.svelte';
	import ServerMember from './ServerMember.svelte';
	import ServerSearch from './ServerSearch.svelte';
	import ServerSection from './ServerSection.svelte';

    interface ServerSidebarProps { serverId: string; }

    let { serverId }: ServerSidebarProps = $props();

    const userState = getUserState();

    // Fetch all data in parallel
    let serverData = $derived(
        Promise.all([
            getCurrentServer({ serverId }),
            getAllServerChannelsList({ serverId }),
            getServerMembersList({ serverId })
        ])
    );

    // Destructure the resolved data
    let currentServer = $derived(await serverData.then(([server]) => server));
    let currentServerChannelsList = $derived(await serverData.then(([, channels]) => channels));
    let currentServerAllMembersList = $derived(await serverData.then(([, , members]) => members));

    let textChannelsList = $derived(currentServerChannelsList.filter(channel => channel.channelType === 'TEXT'));
    let voiceChannelsList = $derived(currentServerChannelsList.filter(channel => channel.channelType === 'VOICE'));
    let videoChannelsList = $derived(currentServerChannelsList.filter(channel => channel.channelType === 'VIDEO'));

    const currentServerMembersList = $derived(currentServerAllMembersList.filter(member => member.userId !== userState.user?.id));

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

            memberCount: currentServerMembersList.length + 1                 // current user was excluded from the members list
        });
    })

</script>

<div class="flex flex-col size-full text-primary dark:bg-[#2b2d31] bg-[#f2f3f5]">
    <ServerHeader {currentServer} {role} members={currentServerMembersList}/>
    
    <ScrollArea class="flex-1 px-3">
        <div class="mt-2">
            <ServerSearch data={[
                {
                    label: "Text Channels",
                    type: "channel",
                    data: textChannelsList?.map((channel) => ({
                        id: channel.channelId,
                        name: channel.channelName,
                        type: channel.channelType
                    }))
                },
                {
                    label: "Voice Channels",
                    type: "channel",
                    data: voiceChannelsList?.map((channel) => ({
                        id: channel.channelId,
                        name: channel.channelName,
                        type: channel.channelType
                    }))
                },
                {
                    label: "Video Channels",
                    type: "channel",
                    data: videoChannelsList?.map((channel) => ({
                        id: channel.channelId,
                        name: channel.channelName,
                        type: channel.channelType
                    }))
                },
                {
                    label: "Members",
                    type: "member",
                    data: currentServerMembersList?.map((member) => ({
                        id: member.memberId,
                        name: member.username ?? "User",
                        type: member.role
                    }))
                }
            ]}/>
        </div>

        <Separator class="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2"/>

        {#if textChannelsList.length > 0}
            <div class="mb-2">
                <ServerSection 
                    sectionType="channels"
                    label="Text Channels"
                    channelType="TEXT"
                    {role}
                />
                {#each textChannelsList as channel}
                    <ServerChannel 
                        {channel}
                        {role}
                        server={currentServer.server}
                    />
                {/each}
            </div>
        {/if}

        {#if voiceChannelsList.length > 0}
            <div class="mb-2">
                <ServerSection 
                    sectionType="channels"
                    label="Voice Channels"
                    channelType="VOICE"
                    {role}
                />
                {#each voiceChannelsList as channel}
                    <ServerChannel 
                        {channel}
                        {role}
                        server={currentServer.server}
                    />
                {/each}
            </div>
        {/if}

        {#if videoChannelsList.length > 0}
            <div class="mb-2">
                <ServerSection 
                    sectionType="channels"
                    label="Video Channels"
                    channelType="VIDEO"
                    {role}
                />
                {#each videoChannelsList as channel}
                    <ServerChannel 
                        {channel}
                        {role}
                        server={currentServer.server}
                    />
                {/each}
            </div>
        {/if}

        {#if currentServerMembersList.length > 0}
            <div class="mb-2">
                <ServerSection 
                    sectionType="members"
                    label="Members"
                    {role}
                    {currentServerMembersList}
                />

                {#each currentServerMembersList as member}
                    <ServerMember {member} server={currentServer.server}/>
                {/each}

            </div>
        {/if}

    </ScrollArea>
</div>
