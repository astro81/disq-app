<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { setUserState } from '$lib/stores/user-state.svelte.js';
	
	let { children, data } = $props();

	const userState = setUserState();

	$effect(() => {
		if (data.user) {
			userState.add(data.user);
		} else {
			userState.remove();
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
