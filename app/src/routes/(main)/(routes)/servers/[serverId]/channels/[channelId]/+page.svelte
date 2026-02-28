<script lang="ts">
    import type { PageProps } from "./$types";

	import ChatHeader from "$lib/components/chat/ChatHeader.svelte";
	import ChatInput from "$lib/components/chat/ChatInput.svelte";
    import ChatMessages from "$lib/components/chat/ChatMessages.svelte";


    let { data }: PageProps = $props();
    
    let currentChannel = $derived(data.channel);
    let currentMember = $derived(data.member);

</script>


<div class="flex flex-col h-screen">
    <ChatHeader 
        name={currentChannel.channelName}
        serverId={currentChannel.serverId}
        type="channel"
    />

<!--    <ChatMessages-->
<!--            member={currentMember}-->
<!--            name={currentChannel.channelName}-->
<!--            chatId={currentChannel.channelId}-->
<!--            type="channel"-->
<!--            apiUrl="/api/messages"-->
<!--            socketUrl="/api/socket/messages"-->
<!--            socketQuery={{-->
<!--                channelId: currentChannel.channelId,-->
<!--                serverId: currentChannel.serverId,-->
<!--            }}-->
<!--            paramKey="channelId"-->
<!--            paramValue={currentChannel.channelId}-->
<!--    />-->

    <ChatMessages
            channelId={currentChannel.channelId}
            channelName={currentChannel.channelName}
            serverId={currentChannel.serverId}
            memberId={currentMember.memberId}
            type="channel"
    />

<!--    <ChatInput-->
<!--            name={currentChannel.channelName}-->
<!--            type="channel"-->
<!--            apiUrl="/api/socket/messages"-->
<!--            query={{-->
<!--                channelId: currentChannel.channelId,-->
<!--                serverId: currentChannel.serverId-->
<!--            }}-->
<!--    />-->
    <ChatInput
            channelId={currentChannel.channelId}
            channelName={currentChannel.channelName}
            serverId={currentChannel.serverId}
            memberId={currentMember.memberId}
    />
</div>