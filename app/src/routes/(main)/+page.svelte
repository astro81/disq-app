<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import ModeToggleButton from '$lib/components/ui/button/ModeToggleButton.svelte';
    
    
    let { data } = $props();

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

{#if data.user}
    <img src={data.user.image} alt={data.user.name}>
    <h1>Hello {data.user.name}</h1>
    <h1>Display Name {data.user.displayName}</h1>

	<form method="POST" action="/api/logout">
    	<Button type="submit" variant="destructive">Logout</Button>
    </form>

{:else}
    <Button variant="default" href="/login">Login</Button>
{/if}

<Button 
    data-sveltekit-preload-data="hover"
    href="servers/@me" 
    variant="link"
    >Welcome
</Button>


<ModeToggleButton />
