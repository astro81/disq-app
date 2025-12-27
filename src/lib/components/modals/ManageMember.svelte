<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { currentServerStore } from "$lib/stores/server-state.svelte";
	import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
	import UserAvatar from "$lib/components/modals/UserAvatar.svelte";
	import { Check, EllipsisVertical, Gavel, LoaderCircle, Shield, ShieldAlert, ShieldCheck, ShieldQuestionMark } from "@lucide/svelte";

	import DropdownMenu from "../ui/dropdown-menu/dropdown-menu.svelte";
	import DropdownMenuTrigger from "../ui/dropdown-menu/dropdown-menu-trigger.svelte";
	import DropdownMenuContent from "../ui/dropdown-menu/dropdown-menu-content.svelte";
	import DropdownMenuSub from "../ui/dropdown-menu/dropdown-menu-sub.svelte";
	import DropdownMenuSubTrigger from "../ui/dropdown-menu/dropdown-menu-sub-trigger.svelte";
	import DropdownMenuPortal from "../ui/dropdown-menu/dropdown-menu-portal.svelte";
	import DropdownMenuSubContent from "../ui/dropdown-menu/dropdown-menu-sub-content.svelte";
	import DropdownMenuItem from "../ui/dropdown-menu/dropdown-menu-item.svelte";
	import DropdownMenuSeparator from "../ui/dropdown-menu/dropdown-menu-separator.svelte";

	import type { ServerMemberRole } from "$lib/types/server";
	import { changeMemberRole } from "$lib/remote/server/change-role.remote";
	import { kickServerMember } from "$lib/remote/server/kick-member.remote";

    let { isManageMemberDialogOpen = $bindable(), members } = $props();

    let loadingId = $state("");

    const currentServer = $derived(currentServerStore.currentServer);

    const onRoleChange = async (memberId: string, role: ServerMemberRole, serverId: string) => {
        try {
            loadingId = memberId;

            await changeMemberRole({ memberId, role, serverId });
        } catch (error) {
            alert(error);
        } finally {
            loadingId = "";
        }
    }

    const onKick = async (memberId: string, serverId: string) => {
        try {
            loadingId = memberId;

            await kickServerMember({ memberId, serverId });

        } catch (error) {
            alert(error);
        } finally {
            loadingId = "";
        }
    }

</script>
 
<Dialog.Root bind:open={isManageMemberDialogOpen}>
    <Dialog.Content class="sm:max-w-[525px]">
        <Dialog.Header>
            <Dialog.Title>Manage Members</Dialog.Title>
            <Dialog.Description class="text-zinc-500">
                {currentServer?.memberCount} Members
            </Dialog.Description>
        </Dialog.Header>
        
        <ScrollArea class="mt-8 max-h-[420px] pr-6">
            {#each members as member}
                <div class="flex items-center gap-x-2 mb-6">
                    <UserAvatar src={member.userProfileImage}/>

                    <div class="flex flex-col gap-y-1">
                        <div class="text-xs font-semibold flex items-center">
                            {member.username}
                            {#if member.role === "MODERATOR"}
                                <ShieldCheck class="size-4 ml-2 text-indigo-500" />
                            {:else if member.role === "ADMIN"}
                                <ShieldAlert class="size-4 text-rose-500" />
                            {/if}
                        </div>
                        <p class="text-xs text-zinc-500 ">{member.userEmail}</p>
                    </div>

                    <!--! Only admin is allowd and no actions can be performed on admin, do not show options for admin -->
                    {#if currentServer?.memberUserId !== member.userId && loadingId !== member.memberId}
                        <div class="ml-auto">
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <EllipsisVertical class="size-4 text-zinc-500"/>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="right">
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger class="flex items-center">
                                            <ShieldQuestionMark class="size-4"/>
                                            <span>Role</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>

                                                <DropdownMenuItem onclick={() => onRoleChange(member.memberId, "GUEST", currentServer?.serverId ?? "")}>
                                                    <Shield class="size-4"/>
                                                    Guest
                                                    {#if member.role === "GUEST"}
                                                        <Check class="size-4 ml-auto"/>
                                                    {/if}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onclick={() => onRoleChange(member.memberId, "MODERATOR", currentServer?.serverId ?? "")}>
                                                    <ShieldCheck class="size-4"/>
                                                    Moderator
                                                    {#if member.role === "MODERATOR"}
                                                        <Check class="size-4 ml-auto"/>
                                                    {/if}
                                                </DropdownMenuItem>

                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem onclick={() => onKick(member.memberId, currentServer?.serverId ?? "")}>
                                        <Gavel class="size-4"/>
                                        Kick
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    {/if}

                    {#if loadingId === member.memberId}
                        <LoaderCircle class="animate-spin text-zinc-500 ml-auto size-4"/>
                    {/if}

                </div>
            {/each}
        </ScrollArea>

    </Dialog.Content>
</Dialog.Root>
