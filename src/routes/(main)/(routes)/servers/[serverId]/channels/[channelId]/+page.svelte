<script lang="ts">
	import { page } from "$app/state";
    import type { PageProps } from "./$types";

	import ChatHeader from "$lib/components/chat/ChatHeader.svelte";


    let { data }: PageProps = $props();
    
    let currentChannel = $derived(data.channel);
    let currentMember = $derived(data.member);

</script>


<div class="flex flex-col h-full ">
    <ChatHeader 
        name={currentChannel.channelName}
        serverId={currentChannel.serverId}
        type="channel"
    />
</div>