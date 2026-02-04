<script lang="ts">
	
    import type { ChannelProps, MemberProps, ServerProps } from '$lib/types/server';

    import { getUserState } from '$lib/stores/user-state.svelte';
	import { currentServerStore } from '$lib/stores/server-state.svelte';

    import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	
    import ServerChannel from '$lib/components/server/ServerChannel.svelte';
	import ServerHeader from '$lib/components/server/ServerHeader.svelte';
	import ServerMember from '$lib/components/server/ServerMember.svelte';
	import ServerSearch from '$lib/components/server/ServerSearch.svelte';
	import ServerSection from '$lib/components/server/ServerSection.svelte';


    interface ServerSidebarProps { 
        currentServer: ServerProps;
        currentMember: MemberProps;
        currentServerChannelsList: ChannelProps[];
        currentServerMemberList: MemberProps[]; 
    }

    let { 
        currentServer,
        currentMember,
        currentServerChannelsList,
        currentServerMemberList,
    }: ServerSidebarProps = $props();

    const userState = getUserState();

    let textChannelsList = $derived(currentServerChannelsList.filter(channel => channel.channelType === 'TEXT'));
    let voiceChannelsList = $derived(currentServerChannelsList.filter(channel => channel.channelType === 'VOICE'));
    let videoChannelsList = $derived(currentServerChannelsList.filter(channel => channel.channelType === 'VIDEO'));

    const currentServerMembersList = $derived(currentServerMemberList.filter(member => member.userId !== userState.user?.id));

    const role = $derived(currentMember.role);


    $effect(() => {
        currentServerStore.set({
            serverId: currentServer.serverId,
            serverName: currentServer.serverName,
            serverImageUrl: currentServer.serverImageUrl,
            serverBannerImageUrl: currentServer.serverBannerImageUrl,
            serverDescription: currentServer.serverDescription,
            serverInviteCode: currentServer.serverInviteCode,
            createdAt: currentServer.createdAt,
            updatedAt: currentServer.updatedAt,
            createdBy: currentServer.createdBy,

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
                        server={currentServer}
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
                        server={currentServer}
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
                        server={currentServer}
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
                    <ServerMember {member} server={currentServer}/>
                {/each}

            </div>
        {/if}

    </ScrollArea>
</div>
