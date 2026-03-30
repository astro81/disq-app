<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	gsap.registerPlugin(ScrollTrigger);

	let container: HTMLDivElement;
	let orb1: HTMLDivElement;
	let orb2: HTMLDivElement;
	let orb3: HTMLDivElement;
	let liquid: HTMLDivElement;
	let particles: HTMLDivElement;
	let grid: HTMLDivElement;
	let ctx: gsap.Context;

	// Defined outside gsap.context so we can remove it in onDestroy
	function handleMouseMove(e: MouseEvent) {
		const { clientX, clientY } = e;
		const centerX = window.innerWidth / 2;
		const centerY = window.innerHeight / 2;
		const moveX = (clientX - centerX) / 60;
		const moveY = (clientY - centerY) / 60;

		gsap.to(orb1, {
			x: `+=${moveX * 0.4}`,
			y: `+=${moveY * 0.4}`,
			duration: 2,
			ease: 'power2.out',
			overwrite: 'auto'
		});

		gsap.to(orb2, {
			x: `+=${moveX * 0.25}`,
			y: `+=${moveY * 0.25}`,
			duration: 2.5,
			ease: 'power2.out',
			overwrite: 'auto'
		});

		gsap.to(orb3, {
			x: `+=${moveX * 0.15}`,
			y: `+=${moveY * 0.15}`,
			duration: 3,
			ease: 'power2.out',
			overwrite: 'auto'
		});
	}

	onMount(() => {
		// Guard: wait a tick to ensure all bind:this refs are resolved
		if (!container || !orb1 || !orb2 || !orb3 || !liquid || !particles || !grid) {
			return;
		}

		ctx = gsap.context(() => {
			// Floating orb animations
			const orbs = [
				{ ref: orb1, xRange: 60, yRange: 45, duration: 18 },
				{ ref: orb2, xRange: 45, yRange: 55, duration: 22 },
				{ ref: orb3, xRange: 35, yRange: 40, duration: 15 }
			];

			orbs.forEach(({ ref, xRange, yRange, duration }) => {
				gsap.to(ref, {
					keyframes: [
						{ x: xRange, y: yRange * 0.5, duration: duration * 0.25 },
						{ x: xRange * 0.5, y: yRange, duration: duration * 0.25 },
						{ x: -xRange * 0.3, y: yRange * 0.7, duration: duration * 0.25 },
						{ x: 0, y: 0, duration: duration * 0.25 }
					],
					repeat: -1,
					ease: 'sine.inOut'
				});

				gsap.to(ref, {
					scale: 1.2,
					duration: duration * 0.4,
					repeat: -1,
					yoyo: true,
					ease: 'sine.inOut'
				});

				gsap.to(ref, {
					opacity: '+=0.08',
					duration: duration * 0.3,
					repeat: -1,
					yoyo: true,
					ease: 'sine.inOut'
				});
			});

			// Liquid flow animation
			gsap.to(liquid, {
				backgroundPosition: '200% 100%',
				duration: 25,
				repeat: -1,
				ease: 'none'
			});

			// Create particles
			for (let i = 0; i < 40; i++) {
				const particle = document.createElement('div');
				particle.style.cssText = `
					position: absolute;
					width: ${gsap.utils.random(2, 5)}px;
					height: ${gsap.utils.random(2, 5)}px;
					background: oklch(0.7 0.15 160 / ${gsap.utils.random(0.2, 0.5)});
					border-radius: 50%;
					left: ${gsap.utils.random(0, 100)}%;
					top: ${gsap.utils.random(0, 100)}%;
					filter: blur(${gsap.utils.random(0, 1)}px);
				`;
				particles.appendChild(particle);

				gsap.to(particle, {
					y: gsap.utils.random(-200, -400),
					x: gsap.utils.random(-50, 50),
					opacity: 0,
					duration: gsap.utils.random(8, 15),
					repeat: -1,
					delay: gsap.utils.random(0, 5),
					ease: 'none',
					onRepeat: () => {
						gsap.set(particle, {
							y: 0,
							x: 0,
							opacity: gsap.utils.random(0.2, 0.5),
							left: `${gsap.utils.random(0, 100)}%`,
							top: `${gsap.utils.random(80, 120)}%`
						});
					}
				});
			}

			// Grid subtle animation
			gsap.to(grid, {
				backgroundPosition: '40px 40px',
				opacity: 0.03,
				duration: 20,
				repeat: -1,
				yoyo: true,
				ease: 'sine.inOut'
			});

			// Parallax on scroll
			gsap.to(orb1, {
				y: -300,
				ease: 'none',
				scrollTrigger: {
					trigger: container,
					start: 'top top',
					end: 'bottom top',
					scrub: 1.5
				}
			});

			gsap.to(orb2, {
				y: -450,
				ease: 'none',
				scrollTrigger: {
					trigger: container,
					start: 'top top',
					end: 'bottom top',
					scrub: 2
				}
			});

			gsap.to(orb3, {
				y: -220,
				ease: 'none',
				scrollTrigger: {
					trigger: container,
					start: 'top top',
					end: 'bottom top',
					scrub: 2.5
				}
			});
		}, container);

		window.addEventListener('mousemove', handleMouseMove);
	});

	onDestroy(() => {
		window.removeEventListener('mousemove', handleMouseMove);
		ctx?.revert();
	});
</script>

<div bind:this={container} class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
	<!-- Liquid flow gradient layer -->
	<div
		bind:this={liquid}
		class="absolute inset-0 opacity-30"
		style="background: linear-gradient(125deg, transparent 0%, oklch(0.7 0.15 160 / 0.08) 25%, transparent 50%, oklch(0.65 0.15 200 / 0.06) 75%, transparent 100%); background-size: 200% 200%;"
	></div>

	<!-- Gradient orbs -->
	<div
		bind:this={orb1}
		class="absolute top-[15%] left-[20%] h-200 w-200 rounded-full opacity-20"
		style="background: radial-gradient(circle, oklch(0.7 0.15 160 / 0.6) 0%, oklch(0.7 0.15 160 / 0.1) 40%, transparent 70%); filter: blur(80px);"
	></div>
	<div
		bind:this={orb2}
		class="absolute top-[40%] right-[15%] h-150 w-150 rounded-full opacity-[0.15]"
		style="background: radial-gradient(circle, oklch(0.65 0.15 200 / 0.5) 0%, oklch(0.65 0.15 200 / 0.1) 40%, transparent 70%); filter: blur(100px);"
	></div>
	<div
		bind:this={orb3}
		class="absolute bottom-[20%] left-[30%] h-125 w-125 rounded-full opacity-[0.18]"
		style="background: radial-gradient(circle, oklch(0.6 0.12 280 / 0.4) 0%, oklch(0.6 0.12 280 / 0.08) 40%, transparent 70%); filter: blur(90px);"
	></div>

	<!-- Floating particles -->
	<div bind:this={particles} class="absolute inset-0"></div>

	<!-- Subtle animated grid -->
	<div
		bind:this={grid}
		class="absolute inset-0 opacity-[0.02]"
		style="background-image: linear-gradient(oklch(0.7 0.15 160 / 0.5) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.15 160 / 0.5) 1px, transparent 1px); background-size: 80px 80px;"
	></div>

	<!-- Vignette effect -->
	<div
		class="absolute inset-0"
		style="background: radial-gradient(ellipse at center, transparent 0%, oklch(0.1 0 0 / 0.5) 80%, oklch(0.1 0 0 / 0.8) 100%);"
	></div>

	<!-- Top gradient fade -->
	<div
		class="absolute inset-x-0 top-0 h-40"
		style="background: linear-gradient(to bottom, oklch(0.1 0 0) 0%, transparent 100%);"
	></div>
</div>