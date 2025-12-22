<script lang="ts">
	import ActionTooltip from "./ActionTooltip.svelte";
    import { cn } from "$lib/utils";
	import { page } from "$app/state";

    interface NavigationItemProps {
        serverId: string;
        serverName: string;
        serverImageUrl: string;
    }

    let { serverId, serverName, serverImageUrl }: NavigationItemProps = $props();

</script>

<ActionTooltip side="right" align="center" label={serverName}>
    <a
        href="/servers/{serverId}"
        class="group relative flex items-center">
        <!-- server indicator -->
        <div class={cn(
                "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
                page.params.serverId !== serverId && "group-hover:h-[20px]",
                page.params.serverId === serverId ? "h-[36px]" : "h-[8px]"
            )}></div>

        <!-- server image -->
        <div class={cn(
            "relative group flex mx-3 size-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
            page.params.serverId === serverId && "bg-primary/10 text-primary rounded-[16px]"
            )}>
            <img src={serverImageUrl} alt="Channel" />
        </div>
    </a>
</ActionTooltip>