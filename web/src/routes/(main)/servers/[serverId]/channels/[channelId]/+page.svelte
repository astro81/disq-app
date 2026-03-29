<script lang="ts">
  import { connectToChannel, disconnectChannel } from '$lib/stores/socket.svelte'
  import { joinVideoChannel, leaveVideoChannel } from '$lib/stores/video.svelte'

  import ChatHeader from '$lib/components/chat/ChatHeader.svelte'
  import ChatMessages from '$lib/components/chat/ChatMessages.svelte'
  import ChatInput from '$lib/components/chat/ChatInput.svelte'
  import VideoGrid from '$lib/components/video/VideoGrid.svelte'
  import VideoControls from '$lib/components/video/VideoControls.svelte'

  import type { PageProps } from './$types'
	import { joinVoiceChannel, leaveVoiceChannel } from '$lib/stores/voice.svelte';
	import VoiceGrid from '$lib/components/voice/VoiceGrid.svelte';
	import VoiceControls from '$lib/components/voice/VoiceControls.svelte';

  let { data }: PageProps = $props()

  let currentChannel = $derived(data.currentChannel)
  let currentMember = $derived(data.currentChannelMember)
  let channelType = $derived(currentChannel.channelType.toLowerCase())

  // Chat socket — runs for ALL channel types (text + video both need chat)
  $effect(() => {
    connectToChannel(currentChannel.channelId, currentMember)
    return () => disconnectChannel()
  })

  // Video — only for video channels
  $effect(() => {
    if (channelType === 'video') {
      joinVideoChannel(currentChannel.channelId, currentMember)
      return () => leaveVideoChannel()
    }
  })

    $effect(() => {
    if (channelType === 'voice') {
      joinVoiceChannel(currentChannel.channelId, currentMember)
      return () => leaveVoiceChannel()
    }
  })

  let showChat = $state(true)
</script>

{#if channelType === 'text'}
  <div class="flex h-screen flex-col">
    <ChatHeader name={currentChannel.channelName} type="channel" />
    <ChatMessages currentMemberId={currentMember.memberId} />
    <ChatInput channelName={currentChannel.channelName} />
  </div>

{:else if channelType === 'video'}
  <div class="flex h-screen flex-col bg-zinc-950">

    <div class="flex h-12 items-center justify-between border-b border-zinc-800 px-4">
      <span class="text-sm font-semibold text-zinc-200">{currentChannel.channelName}</span>
      <button
        onclick={() => showChat = !showChat}
        class="rounded-lg px-3 py-1 text-xs transition
               {showChat ? 'bg-indigo-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}"
      >
        {showChat ? 'Hide Chat' : 'Show Chat'}
      </button>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <div class="flex flex-1 flex-col">
        <VideoGrid />
        <VideoControls onLeave={() => history.back()} />
      </div>

      {#if showChat}
        <div class="flex w-72 flex-col border-l border-zinc-800">
          <ChatMessages currentMemberId={currentMember.memberId} />
          <ChatInput channelName={currentChannel.channelName} />
        </div>
      {/if}
    </div>
  </div>

{:else if channelType === 'voice'}
  <div class="flex h-screen flex-col bg-zinc-950">
    <div class="flex h-12 items-center justify-between border-b border-zinc-800 px-4">
      <span class="text-sm font-semibold text-zinc-200">{currentChannel.channelName}</span>
      <button
        onclick={() => showChat = !showChat}
        class="rounded-lg px-3 py-1 text-xs transition
               {showChat ? 'bg-indigo-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}"
      >
        {showChat ? 'Hide Chat' : 'Show Chat'}
      </button>
    </div>
    <div class="flex flex-1 overflow-hidden">
      <div class="flex flex-1 flex-col">
        <VoiceGrid />
        <VoiceControls onLeave={() => history.back()} />
      </div>
      {#if showChat}
        <div class="flex w-72 flex-col border-l border-zinc-800">
          <ChatMessages currentMemberId={currentMember.memberId} />
          <ChatInput channelName={currentChannel.channelName} />
        </div>
      {/if}
    </div>
  </div>

{:else}
  <div class="flex h-screen items-center justify-center">
    <p class="text-zinc-400">Channel type not found</p>
  </div>
{/if}