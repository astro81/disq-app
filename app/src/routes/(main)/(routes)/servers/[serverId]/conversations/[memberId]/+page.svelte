<script lang="ts">
	import { page } from '$app/state';
	import ChatHeader from '$lib/components/chat/ChatHeader.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
    
    let otherMember = $derived(data.otherMember);
</script>


<div class="bg-white dark:bg-[#313338] flex flex-col h-full">
    <ChatHeader
        imageUrl={otherMember.userProfileImage} 
        name={otherMember.username}
        serverId={page.params.serverId ?? ""}
        type="conversation"
    />
</div>