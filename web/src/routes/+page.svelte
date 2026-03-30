 <script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { ModeWatcher } from 'mode-watcher';
	
    import AmbientBackground from '$lib/components/home/AmbientBackground.svelte';
	import HeroSection from '$lib/components/home/HeroSection.svelte';	
    import CodePreview from '$lib/components/home/CodePreview.svelte';
	import FeaturesSection from '$lib/components/home/FeaturesSection.svelte';
	import CodeSharingSection from '$lib/components/home/CodeSharingSection.svelte';
	import CtaSection from '$lib/components/home/CtaSection.svelte';
	
    import { userStore } from '$lib/stores/user-state.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';


    let user = $derived(userStore.current);

	gsap.registerPlugin(ScrollTrigger);

	let loginBtn: HTMLButtonElement = $state();
	let progressBar: HTMLDivElement = $state();
	let ctx: gsap.Context = $state();

	onMount(() => {
		ctx = gsap.context(() => {
			// Login button entrance with bounce
			gsap.fromTo(
				loginBtn,
				{ opacity: 0, y: -25, scale: 0.9 },
				{ opacity: 1, y: 0, scale: 1, duration: 0.9, delay: 1.8, ease: 'back.out(1.7)' }
			);

			// Scroll progress indicator
			gsap.to(progressBar, {
				scaleX: 1,
				ease: 'none',
				scrollTrigger: {
					trigger: document.body,
					start: 'top top',
					end: 'bottom bottom',
					scrub: 0.3
				}
			});

			// Login button fade on scroll
			ScrollTrigger.create({
				start: 'top top',
				end: '300px top',
				onUpdate: (self) => {
					gsap.to(loginBtn, {
						opacity: 1 - self.progress * 0.5,
						duration: 0.1
					});
				}
			});
		});
	});

	onDestroy(() => {
		ctx?.revert();
	});
</script>

 <svelte:head>
	<title>Disq - Where Developers Communicate</title>
	<meta
		name="description"
		content="Real-time communication platform for developers with code sharing, voice channels, and seamless collaboration."
	/>
</svelte:head>

<main class="relative min-h-screen bg-background text-foreground overflow-x-hidden">
	<AmbientBackground />

	<!-- Scroll progress bar -->
	<div
		bind:this={progressBar}
		class="fixed top-0 left-0 right-0 h-0.5 bg-green-500/60 z-50 origin-left"
		style="transform: scaleX(0)"
	></div>

	<!-- Login button -->
	<div class="fixed top-6 right-6 z-40">
        {#if !user}
		    <button
		    	bind:this={loginBtn}
                onclick={() => goto(resolve("/login"))}
		    	class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md cursor-pointer
                text-sm font-medium transition-all h-8 px-3 backdrop-blur-md bg-background/30 
                border hover:border-accent hover:bg-accent/10 duration-300 hover:scale-105"
		    >
		    	Log in
		    </button>
        {:else}
            <button
		    	bind:this={loginBtn}
                onclick={() => goto(resolve("/servers/@me"))}
		    	class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md cursor-pointer
                text-sm font-medium transition-all h-8 px-3 backdrop-blur-md bg-background/30 
                border border-border/50 hover:border-accent hover:bg-accent/10 duration-300 hover:scale-105"
		    >
		    	Welcome {user.username}
		    </button>
        {/if}
	</div>

	<HeroSection />
	<CodePreview />
	<FeaturesSection />
	<CodeSharingSection />
	<CtaSection />
</main>


<ModeWatcher />
