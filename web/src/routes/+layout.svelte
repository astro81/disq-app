<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	import { userStore } from '$lib/stores/user-state.svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props()
 
    $effect(() => {
		if (data.user) {
        	userStore.set(data.user)
		} else {
			userStore.clear()
		}
    })
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
