<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { setUserState } from '$lib/stores/user-state.svelte.ts';
	// import {onDestroy, onMount} from "svelte";
	// import {socketState} from "$lib/stores/socket.svelte.ts";
	
	let { children, data } = $props();

	const userState = setUserState();

	$effect(() => {
		if (data.user) {
			userState.add(data.user);
		} else {
			userState.remove();
		}
	});

	// onMount(() => {
	// 	socketState.connect();
	// });
	//
	// onDestroy(() => {
	// 	socketState.disconnect();
	// });
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
