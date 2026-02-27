<!-- /(app)/discovery/+layout.svelte -->
<script lang="ts">
	import type { LayoutProps } from './$types';

	// import { Button } from '$lib/components/ui/button';
	// import { page } from '$app/state';
	//
	// const title = "Explore";
	// const avatarProfile = "";
	//
	let { children }: LayoutProps = $props();
	//
	// const activities = [
    //     "Servers",
    //     "Apps"
    // ];

</script>


<!--<div class="flex flex-1 overflow-hidden">-->
<!--	&lt;!&ndash;{@render contextBox()}&ndash;&gt;-->
<!--	<main class="flex-14 bg-card border-t flex flex-col">-->
<!--        {#key page.url.pathname}-->
<!--		    {@render children?.()}-->
<!--        {/key}-->
<!--	</main>-->
<!--</div>-->

<div class="h-screen bg-card">
	{@render children()}
</div>
