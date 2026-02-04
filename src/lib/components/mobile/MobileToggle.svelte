<script lang="ts">
	import { Menu } from "@lucide/svelte";

    import Sheet from "$lib/components/ui/sheet/sheet.svelte";
    import SheetContent from "$lib/components/ui/sheet/sheet-content.svelte";
    import SheetTrigger from "$lib/components/ui/sheet/sheet-trigger.svelte";
	import Button from "$lib/components/ui/button/button.svelte";

	import NavigationSidebar from "$lib/components/navigation/NavigationSidebar.svelte";
	import ServerSidebar from "$lib/components/server/ServerSidebar.svelte";

    let serverId: string = $props();
</script>


<Sheet>
    <SheetTrigger>
        <Button variant="ghost" size="icon" class="md:hidden">
            <Menu />
        </Button>
    </SheetTrigger>

    <SheetContent side="left" class="p-0 flex gap-0">
        <div class="w-18">
            <NavigationSidebar />
        </div>
        <ServerSidebar {serverId}/>
    </SheetContent>
</Sheet>
