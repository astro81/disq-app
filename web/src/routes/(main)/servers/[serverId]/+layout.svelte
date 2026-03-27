<script lang="ts">
	import ServerSidebar from '$lib/components/server/ServerSidebar.svelte';
    import type { LayoutProps } from './$types';

    let { data, children }: LayoutProps = $props();

    let currentServer = $derived(await data.currentServer);
    let currentMember = $derived(await data.currentMember);
    let membersList = $derived(await data.currentServerMemberList);
    let channelsList = $derived(await data.currentServerChannelList);
</script>


{#if currentServer}
    <div class="h-full">
        <div class="hidden fixed md:flex h-full w-60 z-20 flex-col inset-y-0">
            <ServerSidebar 
                {currentServer}
                {currentMember}
                {membersList}
                {channelsList}
            />
        </div>

        <main class="h-full md:pl-60">{@render children()}</main>
    </div>

{:else}
    <h1>No server selected or server not found</h1>
{/if}