<script>
    let { data } = $props();
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

{#if data.session?.user}
    <img src={data.session?.user.image} alt={data.session?.user.name}>
    <h1>Hello {data.session?.user.name}</h1>
    <button>Logout</button>
{:else}
    <a href="/login">Login</a>
{/if}