<!--&lt;!&ndash; /(app)/discovery/servers/+page.svelte &ndash;&gt;-->
<!--<script lang="ts">-->
<!--	import { getServerList, getServerMembersCount, getServerMetadata } from '$lib/remote/server/server.remote';-->
<!--	import { Maximize2 } from 'lucide-svelte';-->
<!--    import type { PageProps } from './$types';-->
<!--	import { Button } from '$lib/components/ui/button';-->
<!--	import { joinServer } from '$lib/remote/members/join-server.remote';-->
<!--	import { goto } from '$app/navigation';-->
<!--	import { getUserState } from '$lib/stores/user-state.svelte';-->

<!--    let { data }: PageProps = $props();-->

<!--    const userState = getUserState();-->

<!--    let isPopupOpen = $state(false);-->

<!--    let popupPosition = $state({ x: 0, y: 0 });-->

<!--    let selectedServerId = $state<string | null>(null);-->
<!--        -->
<!--    let selectedServer: Awaited<ReturnType<typeof getServerMetadata>> | null = $state(null);-->
<!--    -->
<!--    $effect(() => {-->
<!--        if (!selectedServerId) {-->
<!--            selectedServer = null;-->
<!--            return;-->
<!--        }-->
<!--    -->
<!--        (async () => {-->
<!--            selectedServer = await getServerMetadata(selectedServerId);-->
<!--        })();-->
<!--    });-->
<!--    -->

<!--    interface CardImageTypes {-->
<!--        serverImageUrl: string | null,-->
<!--        serverBannerImageUrl: string | null,-->
<!--        serverName: string | null-->
<!--    }-->

<!--</script>-->

<!--<div class="flex flex-col flex-1 overflow-hidden">-->

<!--    &lt;!&ndash; Sticky Header &ndash;&gt;-->
<!--    <div class="sticky top-0 w-full h-12 border-b flex justify-start items-center p-4 bg-transparent! z-10">-->
<!--        <nav class="w-full flex">-->
<!--            <ul class="w-full flex gap-4">-->
<!--                <a href="/discover/servers/home"><li>Home</li></a>-->
<!--                <a href="/discover/servers/games"><li>Games</li></a>-->
<!--                <a href="/discover/servers/music"><li>Music</li></a>-->
<!--            </ul>-->
<!--        </nav>-->
<!--    </div>-->

<!--    &lt;!&ndash; Scrollable Content &ndash;&gt;-->
<!--    <section class="flex-1 overflow-y-auto px-28">-->

<!--        &lt;!&ndash; welcome header &ndash;&gt;-->
<!--        <div class="w-full h-20 flex pt-6">-->
<!--            <div>-->
<!--                <h1 class="text-5xl font-extrabold uppercase">Find your community</h1>-->
<!--            </div>-->
<!--        </div>-->

<!--        <div class="w-full flex mt-8 mb-4">-->
<!--            <h1 class="text-xl font-medium">Featured Servers</h1>-->
<!--        </div>-->
<!--        -->
<!--        <div class="w-full grid grid-cols-4 auto-rows-fr gap-x-2 gap-y-4">-->

<!--            {#each await getServerList() as {serverId, serverName, serverImageUrl, serverBannerImageUrl, serverDescription} }-->
<!--                <div class="relative w-75 h-80 outline outline-border flex flex-col justify-start items-center rounded-lg-->
<!--                            group transition-shadow duration-200-->
<!--                            hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.10)]">-->

<!--                    &lt;!&ndash; Hover Button &ndash;&gt;-->
<!--                    <button-->
<!--                        type="button"-->
<!--                        onclick={(e) => {-->
<!--                            const rect = e.currentTarget.getBoundingClientRect();-->
<!--                            popupPosition = {-->
<!--                                x: rect.left - 300,  // popup width (300) + padding (30)-->
<!--                                y: rect.top-->
<!--                            };-->
<!--                            selectedServerId = serverId;-->
<!--                            isPopupOpen = true;-->
<!--                        }}-->
<!--                        class="absolute top-2 right-2 opacity-0 p-2 text-xs rounded-md z-20 -->
<!--                               group-hover:opacity-100 transition-opacity duration-200 -->
<!--                               bg-background/80 backdrop-blur-sm text-white"-->
<!--                    >-->
<!--                        <Maximize2 class="size-4 text-muted-foreground"/>-->
<!--                    </button>-->

<!--                    {@render CardImage({-->
<!--                        serverBannerImageUrl,-->
<!--                        serverImageUrl,-->
<!--                        serverName-->
<!--                    })}-->
<!--                -->
<!--                    &lt;!&ndash; desc &ndash;&gt;-->
<!--                    <div class="w-full h-full flex flex-col px-4 pt-10 pb-3">-->
<!--                        <div class="flex flex-col grow">-->
<!--                            <h1 class="font-medium text-base">{serverName}</h1>-->
<!--                            <h1 class="font-light text-sm/4 mt-1 tracking-normal">-->
<!--                                {serverDescription ?? "lornm sfw wbfowegbvu sifbweub"}-->
<!--                            </h1>-->
<!--                        </div>-->
<!--                    -->
<!--                        <div>-->
<!--                            <h1 class="font-light text-xs/4 mt-1 tracking-normal bottom-0">-->
<!--                                {(await getServerMembersCount(serverId)).totalMembers}-->
<!--                            </h1>-->
<!--                        </div>-->
<!--                    </div>-->
<!--                -->
<!--                </div>-->

<!--            {/each}-->
<!--            -->
<!--        </div>-->

<!--    </section>-->

<!--</div>-->



<!--&lt;!&ndash; Popup Overlay &ndash;&gt;-->
<!--{#if isPopupOpen && selectedServer}-->
<!--    &lt;!&ndash; Overlay (click outside to close) &ndash;&gt;-->
<!--    <div-->
<!--        class="fixed inset-0 z-40"-->
<!--        role="button"-->
<!--        tabindex="0"-->
<!--        aria-label="Close popup"-->
<!--        onclick={() => isPopupOpen = false}-->
<!--        onkeydown={(e) => {-->
<!--            if (e.key === "Enter" || e.key === " ") {-->
<!--                isPopupOpen = false;-->
<!--            }-->
<!--        }}-->
<!--    ></div>-->

<!--    &lt;!&ndash; Popup positioned beside hover button &ndash;&gt;-->
<!--    <div-->
<!--        class="fixed z-50 bg-card border border-border rounded-lg shadow-lg -->
<!--               overflow-hidden transition-transform transform scale-95 -->
<!--               animate-[fadeIn_0.15s_ease-out_forwards]"-->
<!--        style="-->
<!--            top: {popupPosition.y}px;-->
<!--            left: {popupPosition.x}px;-->
<!--            width: 300px;-->
<!--        "-->
<!--        role="dialog"-->
<!--        tabindex="0"-->
<!--        aria-modal="true"-->
<!--        onclick={(e) => e.stopPropagation()}-->
<!--        onkeydown={(e) => {-->
<!--            if (e.key === "Escape") isPopupOpen = false;-->
<!--        }}-->
<!--    >-->
<!--        -->
<!--        {@render CardImage({-->
<!--            serverBannerImageUrl: selectedServer.serverBannerImageUrl,-->
<!--            serverImageUrl: selectedServer.serverImageUrl,-->
<!--            serverName: selectedServer.serverName-->
<!--        })}-->


<!--        &lt;!&ndash; Info Content &ndash;&gt;-->
<!--        <div class="px-4 pt-10 pb-6">-->
<!--            <h1 class="font-semibold text-lg">{selectedServer.serverName}</h1>-->

<!--            <div class="text-sm text-muted-foreground">-->
<!--                Members: {(await getServerMembersCount(selectedServer.serverId)).totalMembers}-->
<!--            </div>-->

<!--            <span class="text-sm text-muted-foreground mb-4 block">-->
<!--                Established:-->
<!--                {selectedServer.createdAt.toLocaleDateString("en-US", {-->
<!--                    month: "short",-->
<!--                    year: "numeric",-->
<!--                })}-->
<!--            </span>-->

<!--            <p class="font-light text-sm/4 mb-4">-->
<!--                {selectedServer.serverDescription ?? "No description available."}-->
<!--            </p>-->

<!--            <Button -->
<!--                onclick={async () => {-->
<!--                    if (!userState.user) {-->
<!--                        goto('/login');-->
<!--                        return;-->
<!--                    }-->
<!--                -->
<!--                    const result = await joinServer({-->
<!--                        serverId: selectedServer?.serverId ?? "",-->
<!--                        userId: userState.user.userId-->
<!--                    });-->
<!--                -->
<!--                    if (result.ok && result.redirectTo) goto(result.redirectTo);-->
<!--                    -->
<!--                }}-->
<!--                class="w-full bg-chart-2 text-lg font-semibold"-->
<!--            >Join</Button>-->
<!--            -->
<!--        </div>-->
<!--    </div>-->
<!--{/if}-->


<!--{#snippet CardImage({serverBannerImageUrl, serverImageUrl, serverName}: CardImageTypes ) }-->
<!--    &lt;!&ndash; Banner &ndash;&gt;-->
<!--    <div class="w-full h-[50%] relative">-->
<!--        <img src={serverBannerImageUrl ?? "https://github.com/shadcn.png"}-->
<!--             alt="banner"-->
<!--             class="size-full object-cover rounded-t-lg">-->

<!--        &lt;!&ndash; Profile Image &ndash;&gt;-->
<!--        <div class="absolute -bottom-6 left-1/7 -translate-x-1/2 size-18 rounded-lg overflow-hidden border-6 border-card">-->
<!--            <img src={serverImageUrl ?? "https://github.com/shadcn.png"}-->
<!--                 alt={serverName}-->
<!--                 class="size-full object-cover">-->
<!--        </div>-->
<!--    </div>-->
<!--{/snippet}-->
<!--                -->


<!--<style>-->
<!--@keyframes fadeIn {-->
<!--    to { transform: scale(1); opacity: 1; }-->
<!--}-->
<!--</style>-->