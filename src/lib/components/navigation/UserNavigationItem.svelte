<script lang="ts">
	import { cn } from "$lib/utils";
	import { UserRound } from "@lucide/svelte";
	import ActionTooltip from "./ActionTooltip.svelte";
	import { page } from "$app/state";

	const isActive = $derived(page.url.pathname === "/servers/@me");
</script>

<ActionTooltip side="right" align="center" label="Direct Messages">
	<a href="/servers/@me" class="group relative flex items-center">
		<!-- indicator -->
		<div
			class={cn(
				"absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
				!isActive && "group-hover:h-[20px]",
				isActive ? "h-[36px]" : "h-[8px]"
			)}
		></div>

		<!-- button -->
		<div
			class={cn(
				"relative flex mx-3 size-[48px] rounded-[24px] transition-all overflow-hidden items-center justify-center",
				"group-hover:bg-indigo-500 group-hover:rounded-[16px]",
				isActive
					? "bg-primary/10 rounded-[16px]"
					: "bg-background dark:bg-neutral-700"
			)}
		>
			<UserRound
				size="25"
				class={cn(
					"transition",
					"group-hover:text-white",
					isActive && "text-primary"
				)}
			/>
		</div>
	</a>
</ActionTooltip>
