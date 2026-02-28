<script lang="ts">
	import { socketState } from '$lib/stores/socket.svelte';

	let connected: boolean = $derived(socketState.isConnected);
</script>

{#if !connected}
	<div class="flex h-6 items-center gap-2 rounded-xl bg-yellow-600 px-3 py-1 text-sm text-white">
		<div class="size-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
		Connecting ...
	</div>
{:else}
	<div class="flex h-6 items-center gap-2 rounded-xl bg-emerald-600 px-3 py-1 text-sm text-white">
		Connected
	</div>
{/if}
