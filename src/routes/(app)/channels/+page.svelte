<script lang="ts">
	import { getJoinedServers } from '$lib/remote/server.remote';
    import type { PageProps } from './$types';

	import CreateServer from '$lib/components/modals/CreateServer.svelte';

    let { data }: PageProps = $props();

    //todo: fetch users servers    

    let joinedServers = $derived(await getJoinedServers());

    // $inspect(joinedServers);
    

</script>

<h1>channels</h1>

<CreateServer />