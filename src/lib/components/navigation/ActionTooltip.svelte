<script lang="ts">
    import type { Snippet } from 'svelte';

	import Tooltip from "../ui/tooltip/tooltip.svelte";
	import TooltipProvider from "../ui/tooltip/tooltip-provider.svelte";
	import TooltipTrigger from "../ui/tooltip/tooltip-trigger.svelte";
	import TooltipContent from "../ui/tooltip/tooltip-content.svelte";

    interface tooltipProps {
        children: Snippet,
        side?: "top" | "right" | "bottom" | "left",
        align?: "start" | "center" | "end",
        label: string
    }

    let { children, side, align, label }: tooltipProps = $props();

</script>

<TooltipProvider>
    <Tooltip delayDuration={50}>
        <TooltipTrigger>
            {@render children()}
        </TooltipTrigger>
        <TooltipContent {side} {align}>
            <p class="font-semibold text-sm capitalize">{label?.toLowerCase()}</p>
        </TooltipContent>
    </Tooltip>
</TooltipProvider>