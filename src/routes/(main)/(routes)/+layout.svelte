<!-- (routes)/layout.svelte -->
<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
    import type { LayoutProps } from './$types';
    
	import NavigationSidebar from '$lib/components/navigation/NavigationSidebar.svelte';

    let { data, children }: LayoutProps = $props();
</script>

<ModeWatcher />

<div class="h-full">
    <div class="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar />
    </div>

    <main class="md:pl-[72px] h-full">
        {@render children()}
    </main>

</div>