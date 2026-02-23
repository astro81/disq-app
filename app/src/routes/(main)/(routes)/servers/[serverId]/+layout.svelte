<script lang="ts">
    import type { LayoutProps } from './$types';

	import ServerSidebar from '$lib/components/server/ServerSidebar.svelte';

    let { data, children }: LayoutProps = $props();
    
    let currentServer = $derived(await data.currentServer);
    let currentMember = $derived(await data.currentMember);
    let currentServerChannelsList = $derived(await data.currentServerChannelsList);
    let currentServerMemberList = $derived(await data.currentServerMemberList);
    
</script>


{#if currentServer}
    <div class="h-full">
        <div class="hidden fixed md:flex h-full w-60 z-20 flex-col inset-y-0">
            <ServerSidebar 
                {currentServer}
                {currentMember}
                {currentServerChannelsList}
                {currentServerMemberList}
            />
        </div>

        <main class="h-full md:pl-60">{@render children()}</main>
    </div>

{:else}
    <h1>No server selected or server not found</h1>
{/if}