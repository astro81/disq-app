<!-- servers/[serverId]/page.svelte -->
<script lang="ts">
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<h1>server id page</h1>