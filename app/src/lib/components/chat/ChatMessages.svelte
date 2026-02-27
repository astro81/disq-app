<script lang="ts">
	import type { MemberProps } from '$lib/types/server.ts';
	import ChatWelcome from '$lib/components/chat/ChatWelcome.svelte';

	interface ChatMessageProps {
		name: string;
		member: MemberProps;
		chatId: string;
		apiUrl: string;
		socketUrl: string;
		socketQuery: Record<string, string>;
		paramKey: 'channelId' | 'conversationId';
		paramValue: string;
		type: 'channel' | 'conversation';
	}

	let {
		name,
		member,
		chatId,
		apiUrl,
		socketUrl,
		socketQuery,
		paramKey,
		paramValue,
		type
	}: ChatMessageProps = $props();
</script>

<div class="flex flex-1 flex-col overflow-y-auto py-4">
	<div class="flex-1">
		<ChatWelcome {type} {name} />
	</div>
</div>
