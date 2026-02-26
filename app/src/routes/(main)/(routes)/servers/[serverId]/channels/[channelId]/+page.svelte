<script lang="ts">
    import type { PageProps } from "./$types";

	import ChatHeader from "$lib/components/chat/ChatHeader.svelte";
	import ChatInput from "$lib/components/chat/ChatInput.svelte";


    let { data }: PageProps = $props();
    
    let currentChannel = $derived(data.channel);
    // let currentMember = $derived(data.member);

</script>


<div class="flex flex-col h-screen">
    <ChatHeader 
        name={currentChannel.channelName}
        serverId={currentChannel.serverId}
        type="channel"
    />
    <div class="flex-1">future messages</div>
    <ChatInput
            name={currentChannel.channelName}
            type="channel"
            apiUrl="/api/socket/messages"
            query={{
                channelId: currentChannel.channelId,
                serverId: currentChannel.serverId
            }}
    />
</div>