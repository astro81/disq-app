<script lang="ts">
	import { goto } from "$app/navigation";
	import { authClient } from "$lib/auth-client";
	import { getUserState } from "$lib/stores/user-state.svelte";
	import AvatarFallback from "../ui/avatar/avatar-fallback.svelte";
	import AvatarImage from "../ui/avatar/avatar-image.svelte";
	import Avatar from "../ui/avatar/avatar.svelte";
    
	import Button from "../ui/button/button.svelte";
	import DialogContent from "../ui/dialog/dialog-content.svelte";
	import DialogTrigger from "../ui/dialog/dialog-trigger.svelte";
	import Dialog from "../ui/dialog/dialog.svelte";

    const userState = getUserState();

    let open = $state(false);

    const initials = $derived(() => {
		if (!userState.user) return "";
		return userState.user.displayName
			.split(" ")
			.map(n => n[0])
			.join("")
			.slice(0, 2)
			.toUpperCase();
	});
    
</script>

{#if userState.user}
	<Dialog bind:open>
		<DialogTrigger>
			<Button variant="ghost" size="icon" class="rounded-full">
				<Avatar class="size-12">
					<AvatarImage
						src={userState.user.image ?? undefined}
						alt={userState.user.displayName}
					/>
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>
			</Button>
		</DialogTrigger>

		<DialogContent class="sm:max-w-md">
            <div class="flex items-center gap-3">
				<Avatar class="h-12 w-12">
					<AvatarImage
						src={userState.user.image ?? undefined}
						alt={userState.user.displayName}
					/>
					<AvatarFallback class="text-lg">{initials}</AvatarFallback>
				</Avatar>
				<div class="min-w-0">
					<p class="font-semibold truncate">{userState.user.displayName}</p>
					<p class="text-sm text-muted-foreground truncate">{userState.user.email}</p>
				</div>
			</div>

            <div class="mt-4 text-sm space-y-1">
				<p>
					<span class="font-medium">Verified:</span>
					{userState.user.emailVerified ? "Yes" : "No"}
				</p>
				<p>
					<span class="font-medium">Joined:</span>
					{userState.user.createdAt}
				</p>
			</div>

            <div class="mt-4 flex flex-col gap-2">
				<Button variant="outline" class="w-full">Settings</Button>
				<Button
    			    variant="destructive"
    			    onclick={async () => {
    			        await authClient.signOut({
    			            fetchOptions: {
    			                onSuccess: () => { goto("/login"); }
    			            }
    			        })
    			    }}
    			>Logout</Button>
			</div>
		</DialogContent>
	</Dialog>
{/if}