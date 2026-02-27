<!--/servers/discovery/+page.svelte-->
<script lang="ts">
    import type { PageProps } from './$types';
    import { Maximize2 } from 'lucide-svelte';
    import { Button } from '$lib/components/ui/button';

    let { data }: PageProps = $props();

    let servers = $derived(data.servers);
    let joinedServerIds = $derived(data.joinedServerIds);

    // Svelte 5 runes state
    let isPopupOpen = $state(false);
    let popupPosition = $state({ x: 0, y: 0 });
    let selectedServer = $state<typeof servers[number] | null>(null);

    function openPopup(event: MouseEvent, server: typeof servers[number]) {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

        popupPosition = {
            x: rect.left - 340,
            y: rect.top
        };

        selectedServer = server;
        isPopupOpen = true;
    }
</script>

<div class="h-full flex flex-col flex-1 overflow-hidden">
    <section class="flex-1 overflow-y-auto px-20 py-8">

        <h1 class="text-5xl font-extrabold uppercase mb-10">
            Find your community
        </h1>

        <h2 class="text-xl font-medium mb-6">
            Featured Servers
        </h2>

        <div class="grid grid-cols-4 gap-6">

            {#each servers as server}
                <div class="relative h-80 outline outline-border rounded-lg group overflow-hidden flex flex-col">

                    <button
                            type="button"
                            onclick={(e) => openPopup(e, server)}
                            class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition bg-background/80 backdrop-blur p-2 rounded-md z-20"
                    >
                        <Maximize2 class="size-4 text-muted-foreground" />
                    </button>

                    {@render CardImage({
                        serverBannerImageUrl: server.serverBannerImageUrl,
                        serverImageUrl: server.serverImageUrl,
                        serverName: server.serverName
                    })}

                    <div class="flex flex-col flex-1 px-4 pt-10 pb-4">
                        <div class="flex-1">
                            <h3 class="font-semibold">{server.serverName}</h3>
                            <p class="text-sm text-muted-foreground mt-1">
                                {server.serverDescription ?? "No description available."}
                            </p>
                        </div>

                        <div class="text-xs text-muted-foreground mt-3">
                            {server.totalMembers} members
                        </div>
                    </div>
                </div>
            {/each}

        </div>
    </section>
</div>

{#if isPopupOpen && selectedServer}
    <!-- Overlay -->
    <div
            class="fixed inset-0 z-40"
            role="button"
            tabindex="0"
            onclick={() => (isPopupOpen = false)}
            onkeydown={(e) => e.key === 'Escape' && (isPopupOpen = false)}
    ></div>

    <!-- Popup -->
    <div
            class="fixed z-50 bg-card border border-border rounded-lg shadow-xl overflow-hidden animate-popup"
            style="top:{popupPosition.y}px; left:{popupPosition.x}px; width:340px"
            role="dialog"
            tabindex="0"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.key === 'Escape' && (isPopupOpen = false)}
    >
        {@render CardImage({
            serverBannerImageUrl: selectedServer.serverBannerImageUrl,
            serverImageUrl: selectedServer.serverImageUrl,
            serverName: selectedServer.serverName
        })}

        <div class="px-4 pt-10 pb-6">
            <h3 class="text-lg font-semibold">
                {selectedServer.serverName}
            </h3>

            <div class="text-sm text-muted-foreground mt-1">
                {selectedServer.totalMembers} members
            </div>

            <div class="text-sm text-muted-foreground mb-3">
                Established {new Date(selectedServer.createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric"
            })}
            </div>

            <p class="text-sm mb-4">
                {selectedServer.serverDescription ?? "No description available."}
            </p>

            <form method="POST" action="?/join">
                <input type="hidden" name="serverId" value={selectedServer.serverId} />

                <Button
                        type="submit"
                        name="join"
                        value="true"
                        class="w-full bg-chart-2 text-lg font-semibold"
                        disabled={joinedServerIds.includes(selectedServer.serverId)}
                >
                    {joinedServerIds.includes(selectedServer.serverId)
                        ? "Already Joined"
                        : "Join"}
                </Button>
            </form>
        </div>
    </div>
{/if}

{#snippet CardImage({ serverBannerImageUrl, serverImageUrl, serverName })}
    <div class="relative h-32 w-full">
        <img
                src={serverBannerImageUrl ?? "https://github.com/shadcn.png"}
                alt="banner"
                class="w-full h-full object-cover"
        />

        <div class="absolute -bottom-6 left-6 w-16 h-16 rounded-lg overflow-hidden border-4 border-card">
            <img
                    src={serverImageUrl ?? "https://github.com/shadcn.png"}
                    alt={serverName}
                    class="w-full h-full object-cover"
            />
        </div>
    </div>
{/snippet}

<style>
    .animate-popup {
        animation: popup 0.15s ease-out forwards;
        transform: scale(0.95);
        opacity: 0;
    }

    @keyframes popup {
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
</style>