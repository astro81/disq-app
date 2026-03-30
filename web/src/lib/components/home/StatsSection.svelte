<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	gsap.registerPlugin(ScrollTrigger);

	const stats = [
		{ value: 50000, suffix: '+', label: 'Active developers', prefix: '' },
		{ value: 2, suffix: 'M+', label: 'Code snippets shared', prefix: '' },
		{ value: 99.9, suffix: '%', label: 'Uptime SLA', prefix: '' },
		{ value: 50, suffix: 'ms', label: 'Message latency', prefix: '<' }
	];

	let inView = $state(false);
	let sectionEl: HTMLElement;
	let lineEl: HTMLDivElement;
	let statEls: (HTMLDivElement | null)[] = [];
	let ctx: gsap.Context;

	// Animated counter display values
	let displayValues = $state(stats.map(() => 0));

	$effect(() => {
		if (!inView) return;
		stats.forEach((stat, i) => {
			const duration = 2000;
			const start = Date.now();
			const isDecimal = stat.value % 1 !== 0;

			const animate = () => {
				const elapsed = Date.now() - start;
				const progress = Math.min(elapsed / duration, 1);
				const eased = 1 - Math.pow(1 - progress, 3);
				const current = stat.value * eased;
				displayValues[i] = isDecimal ? Math.round(current * 10) / 10 : Math.floor(current);
				if (progress < 1) requestAnimationFrame(animate);
			};
			animate();
		});
	});

	onMount(() => {
		ctx = gsap.context(() => {
			ScrollTrigger.create({
				trigger: sectionEl,
				start: 'top 80%',
				onEnter: () => (inView = true)
			});

			gsap.fromTo(
				lineEl,
				{ scaleX: 0, transformOrigin: 'center center' },
				{
					scaleX: 1, duration: 1.4, ease: 'power4.inOut',
					scrollTrigger: { trigger: sectionEl, start: 'top 85%', toggleActions: 'play none none reverse' }
				}
			);

			statEls.forEach((stat, index) => {
				if (!stat) return;
				gsap.fromTo(
					stat,
					{ opacity: 0, y: 60, scale: 0.9, rotateX: 15 },
					{
						opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 0.8,
						delay: 0.15 + index * 0.1, ease: 'power4.out',
						scrollTrigger: { trigger: sectionEl, start: 'top 75%', toggleActions: 'play none none reverse' }
					}
				);

				stat.addEventListener('mouseenter', () => {
					gsap.to(stat, { scale: 1.05, y: -5, duration: 0.3, ease: 'power2.out' });
				});
				stat.addEventListener('mouseleave', () => {
					gsap.to(stat, { scale: 1, y: 0, duration: 0.3, ease: 'power2.out' });
				});
			});

			gsap.to(sectionEl, {
				y: -40, ease: 'none',
				scrollTrigger: { trigger: sectionEl, start: 'top bottom', end: 'bottom top', scrub: 1 }
			});
		}, sectionEl);
	});

	onDestroy(() => ctx?.revert());
</script>

<section bind:this={sectionEl} class="relative py-28">
	<div
		bind:this={lineEl}
		class="absolute left-0 right-0 top-0 h-px bg-linear-to-r from-transparent via-accent/60 to-transparent"
	></div>

	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" style="perspective: 1000px">
			{#each stats as stat, index (index)}
				<div
					bind:this={statEls[index]}
					class="group relative text-center p-8 rounded-2xl border border-border/50 bg-card/20 backdrop-blur-sm transition-colors duration-500 hover:border-accent/50 hover:bg-card/40 cursor-pointer"
					style="transform-style: preserve-3d"
				>
					<div
						class="absolute inset-0 rounded-2xl bg-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
					></div>

					<div class="text-5xl font-bold text-foreground sm:text-6xl tabular-nums">
						<span class="text-muted-foreground">{stat.prefix}</span>
						{isNaN(displayValues[index]) ? 0 : displayValues[index].toLocaleString()}
						<span class="text-accent">{stat.suffix}</span>
					</div>
					<div class="mt-3 text-muted-foreground font-medium">{stat.label}</div>
				</div>
			{/each}
		</div>
	</div>

	<div
		class="absolute left-0 right-0 bottom-0 h-px bg-linear-to-r from-transparent via-border to-transparent"
	></div>
</section>
