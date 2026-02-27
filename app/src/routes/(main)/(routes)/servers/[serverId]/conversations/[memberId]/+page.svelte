<script lang="ts">
	import { page } from '$app/state';
	import ChatHeader from '$lib/components/chat/ChatHeader.svelte';
	import ChatInput from '$lib/components/chat/ChatInput.svelte';
	import ChatMessages from '$lib/components/chat/ChatMessages.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let otherMember = $derived(data.otherMember);
</script>

<div class="flex h-screen flex-col bg-white dark:bg-[#313338]">
	<ChatHeader
		imageUrl={otherMember.userProfileImage}
		name={otherMember.username}
		serverId={page.params.serverId ?? ''}
		type="conversation"
	/>

	<ChatMessages
		member={data.member}
		name={otherMember.username}
		chatId={data.currentConversation.id}
		type="conversation"
		apiUrl="/api/messages"
		socketUrl="/api/socket/messages"
		socketQuery={{
			conversationId: data.currentConversation.id,
			serverId: page.params.serverId ?? ''
		}}
		paramKey="conversationId"
		paramValue={data.currentConversation.id}
	/>

	<ChatInput
		name={otherMember.username}
		type="conversation"
		apiUrl="/api/socket/messages"
		query={{
			conversationId: data.currentConversation.id,
			serverId: page.params.serverId ?? ''
		}}
	/>
</div>
