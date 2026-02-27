<script lang="ts">
	import { Hash } from '@lucide/svelte';

	import MobileToggle from '$lib/components/mobile/MobileToggle.svelte';
	import UserAvatar from '../modals/UserAvatar.svelte';
	import SocketIndicator from '$lib/components/socket/SocketIndicator.svelte';

	interface ChatHeaderProps {
		serverId: string;
		name: string;
		type: 'channel' | 'conversation';
		imageUrl?: string | null;
	}

	let { serverId, name, type, imageUrl }: ChatHeaderProps = $props();
</script>

<div
	class="text-md flex h-12 items-center border-b-2 border-neutral-200 px-3 font-semibold dark:border-neutral-800"
>
	<MobileToggle {serverId} />

	{#if type === 'channel'}
		<Hash class="mr-2 size-5 text-zinc-500 dark:text-zinc-400" />
	{/if}

	{#if type === 'conversation'}
		<UserAvatar src={imageUrl} className="size-8 md:size-8 mr-2" />
	{/if}

	<p class="text-md font-semibold">{name}</p>

	<div class="ml-auto flex items-center">
		<SocketIndicator />
	</div>
</div>
