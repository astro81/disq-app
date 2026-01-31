<script lang="ts">
	import { page } from "$app/state";
	import type { MemberProps, ServerProps } from "$lib/types/server";
	import { cn } from "$lib/utils";
	import { ShieldAlert, ShieldCheck } from "@lucide/svelte";
	import UserAvatar from "../modals/UserAvatar.svelte";

    
    interface ServerMemberProps {
        member: MemberProps;
        server: ServerProps;
    }

    let { member, server }: ServerMemberProps = $props();

</script>

<div>
    <button class={cn(
        "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
        // todo: uncomment after setting member page/params
        // page.params.memberId === member.memberId && "bg-zinc-700/20 dark:bg-zinc-700"
    )}>
        <UserAvatar src={member.userProfileImage} className="size-8 md:size-8"/>

        <p class={cn(
            "font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
            page.params.channelId === member.memberId  && "text-primary dark:text-zinc-200 dark:group-hover:text-white"
        )}>
            {member.username}
        </p>

        {#if member.role === "MODERATOR"}
            <ShieldCheck class="size-4 ml-2"/>
        {:else if member.role === "ADMIN"}
            <ShieldAlert class="size-4 ml-2 text-rose-500"/>
        {/if}
    </button>
</div>