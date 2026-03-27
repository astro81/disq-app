<script lang="ts">
    import type { PageProps } from './$types';


    type Server = {
        createdAt: string
        createdBy: string
        isPrivateServer: boolean
        serverBannerImageUrl: string | null
        serverDescription: string | null
        serverId: string
        serverImageUrl: string | null
        serverInviteCode: string
        serverName: string
        updatedAt: string
    }

    let { data }: PageProps = $props();

    let currentServer = $derived<Server>(await data.currentServer)

</script>

<h1>Welcome to {currentServer.serverName}</h1>