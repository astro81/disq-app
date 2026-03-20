<script lang="ts">
	import type { PageProps } from './$types';

	import ChatHeader from '$lib/components/chat/ChatHeader.svelte';
	import ChatInput from '$lib/components/chat/ChatInput.svelte';
	import ChatMessages from '$lib/components/chat/ChatMessages.svelte';
	import VoiceChannel from '$lib/components/voice/VoiceChannel.svelte';

	let { data }: PageProps = $props();

	let currentChannel = $derived(data.channel);
	let currentMember = $derived(data.member);

	let currentChannelType = $derived(currentChannel.channelType.toLowerCase());
</script>

{#if currentChannelType === 'text'}
	<div class="flex h-screen flex-col">
		<ChatHeader
			name={currentChannel.channelName}
			serverId={currentChannel.serverId}
			type="channel"
		/>
		<ChatMessages
			channelId={currentChannel.channelId}
			channelName={currentChannel.channelName}
			serverId={currentChannel.serverId}
			memberId={currentMember.memberId}
			type="channel"
		/>
		<ChatInput
			channelId={currentChannel.channelId}
			channelName={currentChannel.channelName}
			serverId={currentChannel.serverId}
			memberId={currentMember.memberId}
		/>
	</div>
{:else if currentChannelType === 'voice'}
	<div class="flex h-screen flex-col">
		<ChatHeader
			name={currentChannel.channelName}
			serverId={currentChannel.serverId}
			type="channel"
		/>
		<VoiceChannel channelId={currentChannel.channelId} channelName={currentChannel.channelName} />
	</div>
{:else if currentChannelType === 'video'}
	<div class="flex h-screen flex-col">Video Channel</div>
{:else}
	<div class="flex h-screen flex-col">Channel type not found</div>
{/if}
