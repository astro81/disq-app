<script lang="ts">
    import {socketState} from "$lib/stores/socket.svelte.ts";

    let connected: boolean = $derived(socketState.isConnected);
</script>

{#if !connected}
    <div class="bg-yellow-600 text-white px-3 py-1 flex items-center gap-2 rounded-xl h-6 text-sm">
        <div class="size-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        Connecting ...
    </div>
{:else}
    <div class="bg-emerald-600 text-white px-3 py-1 rounded-xl flex items-center gap-2 h-6 text-sm">
        Connected
    </div>
{/if}