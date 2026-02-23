<script lang="ts">
	import { Hash } from "@lucide/svelte";

	import MobileToggle from "$lib/components/mobile/MobileToggle.svelte";
	import UserAvatar from "../modals/UserAvatar.svelte";

    interface ChatHeaderProps {
        serverId: string;
        name: string;
        type: "channel" | "conversation";
        imageUrl?: string | null;
    }

    let {
        serverId,
        name,
        type,
        imageUrl
    }: ChatHeaderProps = $props();

</script>

<div class="text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2">
    <MobileToggle {serverId}/>

    {#if type === "channel"}
        <Hash class="size-5 text-zinc-500 dark:text-zinc-400 mr-2"/>
    {/if}

    {#if type === "conversation"}
        <UserAvatar src={imageUrl} className="size-8 md:size-8 mr-2"/>
    {/if}

    <p class="font-semibold text-md">{name}</p>
</div>