<script lang="ts">
    import { getAllServerChannels, getAllServerMembers, getCurrentServer } from '$lib/remote/server/server.remote';

    import { getUserState } from '$lib/stores/user-state.svelte';
	import ServerHeader from './ServerHeader.svelte';
	

    interface ServerSidebarProps { serverId: string; }

    let { serverId }: ServerSidebarProps = $props();

    const userState = getUserState();


    let currentServer = $derived(await getCurrentServer({ serverId }));
    let currentServerChannels = $derived(await getAllServerChannels({ serverId }));
    let currentServerMembers = $derived(await getAllServerMembers({ serverId }));


    let textChannels = $derived(currentServerChannels.filter(channel => channel.channelType === 'TEXT'));
    let voiceChannels = $derived(currentServerChannels.filter(channel => channel.channelType === 'VOICE'));
    let videoChannels = $derived(currentServerChannels.filter(channel => channel.channelType === 'VIDEO'));

    const members = $derived(currentServerMembers.filter(member => member.userId !== userState.user?.id));

    const role = $derived(currentServer.member.role);
</script>

<div class="flex flex-col size-full text-primary dark:bg-[#2b2d31] bg-[#f2f3f5]">
    <ServerHeader {currentServer} {role}/>
    {currentServer.server.serverName}
</div>
