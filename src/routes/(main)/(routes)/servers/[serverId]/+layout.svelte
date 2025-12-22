<script lang="ts">
    import type { LayoutProps } from './$types';

	import { getCurrentServer } from '$lib/remote/server/server.remote';
	import { page } from '$app/state';
	import ServerSidebar from '$lib/components/server/ServerSidebar.svelte';

    let { data, children }: LayoutProps = $props();
    
    let currentServer = $derived(await getCurrentServer({ serverId: page.params.serverId ?? ""}));

</script>


{#if currentServer?.server}
    <div class="h-full">
        <div class="hidden fixed md:flex h-full w-60 z-20 flex-col inset-y-0">
            <ServerSidebar serverId={currentServer.server.serverId}/>
        </div>

        <main class="h-full md:pl-60">{@render children()}</main>
    </div>

{:else}
    <h1>No server selected or server not found</h1>
{/if}