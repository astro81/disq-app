<script lang="ts">
	import Avatar from "$lib/components/ui/avatar/avatar.svelte";
	import { cn } from "$lib/utils";
	import AvatarImage from "../ui/avatar/avatar-image.svelte";

    interface UserAvatarProps {
        src?: string;
        className?: string;
    };

    let { src, className }: UserAvatarProps = $props();

</script>

<Avatar class={cn("size-7 md:size-10", className)}>
    <AvatarImage {src} />
</Avatar>

