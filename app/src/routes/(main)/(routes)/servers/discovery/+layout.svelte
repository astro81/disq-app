<!--&lt;!&ndash; /(app)/discovery/+layout.svelte &ndash;&gt;-->
<!--<script lang="ts">-->
<!--	import type { LayoutProps } from './$types';-->

<!--	import { Button } from '$lib/components/ui/button';-->
<!--	import { page } from '$app/state';-->

<!--	const title = "Explore";-->
<!--	const avatarProfile = "";-->

<!--	let { children }: LayoutProps = $props();-->

<!--	const activities = [-->
<!--        "Servers",-->
<!--        "Apps"-->
<!--    ];-->

<!--</script>-->

<!--        -->
<!--<div class="flex flex-1 overflow-hidden">-->
<!--	{@render contextBox()}-->
<!--	<main class="flex-14 bg-card border-t flex flex-col">-->
<!--        {#key page.url.pathname}-->
<!--		    {@render children?.()}-->
<!--        {/key}-->
<!--	</main>-->
<!--</div>-->



<!--{#snippet contextBox()}-->
<!--	<div class="flex-3 border-t border-l rounded-tl-lg flex flex-col">-->
<!--    -->
<!--    <div class="sticky w-full h-12 border-b rounded-tl-lg flex justify-start items-center p-4">-->
<!--        <h1 class="text-xl">Discover</h1>-->
<!--    </div>-->

<!--    <div class="flex-1 mb-16 overflow-x-auto">-->
<!--        <div class="flex flex-col gap-1 mt-2 px-3">-->
<!--            {#each activities as activity}-->
<!--                <Button variant="secondary" href="/discovery/{activity.toLowerCase()}">-->
<!--                    <h1 class="text-base">{activity}</h1>-->
<!--                </Button>-->
<!--            {/each}-->
<!--        </div>-->
<!--    </div>-->

<!--</div>-->
<!--{/snippet}-->