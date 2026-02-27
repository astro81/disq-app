<script lang="ts">
    import {Hash} from "lucide-svelte";

    interface ChatWelcomeProps {
        name: string;
        type: "channel" | "conversation";
    }

    let { type, name }: ChatWelcomeProps = $props();
</script>

<div class="space-y-2 px-4 mb-4">
    {#if type === "channel"}
        <div class="size-18.75 rounded-full bg-zinc-500 dark:bg-zinc-700 flex items-center justify-center">
            <Hash class="size-12 text-white"/>
        </div>
    {/if}

    {#if type === "channel"}
        <p class="text-xl md:text-3xl font-bold">Welcome to # {name}</p>
    {/if}

    <p class="text-zinc-600 dark:text-zinc-400 text-sm">
        {#if type === "channel"}
            This is the start of #{name} channel.
        {:else if type === "conversation"}
            This is the start of conversation with {name}.
        {/if}
    </p>

</div>
