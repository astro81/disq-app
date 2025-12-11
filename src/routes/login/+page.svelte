<!-- login/+page.svelte -->

<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

    async function loginWithGoogle() {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/",                   // /channels/@me
            errorCallbackURL: "/error",         // /auth/error
            newUserCallbackURL: "/",            // /channels/explore/servers  
        });
    }
</script>

<h1>Login</h1>

<button onclick={loginWithGoogle}>Login with Google</button>
