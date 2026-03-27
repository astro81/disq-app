<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
	import { userStore } from "$lib/stores/user-state.svelte";

    let user = $derived(userStore.current);
</script>

{#if user}
    <h1>Username: {user.username}</h1>
    <h1>Name: {user.displayName}</h1>
    <h1>Email: {user.email}</h1>

    <img src={user.image} alt="" />

    <Button href="/servers/@me" variant="link" >Me</Button>

    <form method="POST" action="/api/logout">
    	<Button type="submit" variant="destructive">Logout</Button>
    </form>

{:else}
    <Button href="/login" variant="link">Login</Button>
{/if}

