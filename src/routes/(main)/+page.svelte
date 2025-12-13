<script>
	import { goto } from '$app/navigation';

	import { authClient } from '$lib/auth-client.js';

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

    <Button
        variant="destructive"
        onclick={async () => {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => { goto("/login"); }
                }
            })
        }}
    >Logout</Button>

{:else}
    <Button variant="default" href="/login">Login</Button>
{/if}


<ModeToggleButton />
