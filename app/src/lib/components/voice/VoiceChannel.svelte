<script lang="ts">
	import { voiceState } from '$lib/stores/voiceStore.svelte';
	import { onDestroy } from 'svelte';
	import { Mic, MicOff, PhoneOff, Phone, User, Loader2, AlertCircle, Volume2 } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

	let { channelId, channelName }: { channelId: string; channelName: string } = $props();

	function handleJoin() {
		voiceState.joinVoice(channelId);
	}

	function handleLeave() {
		voiceState.leaveVoice();
	}

	function handleMute() {
		voiceState.toggleMute();
	}

	// Auto-play remote audio streams
	let audioElements = $state<Map<string, HTMLAudioElement>>(new Map());

	$effect(() => {
		// Sync audio elements with remote streams
		const currentStreams = voiceState.remoteStreams;

		// Play new streams
		currentStreams.forEach((stream, peerId) => {
			if (!audioElements.has(peerId)) {
				const audio = new Audio();
				audio.srcObject = stream;
				audio.autoplay = true;
				audio.play().catch(console.error);
				const newElements = new Map(audioElements);
				newElements.set(peerId, audio);
				audioElements = newElements;
			}
		});

		// Clean up removed streams
		audioElements.forEach((audio, peerId) => {
			if (!currentStreams.has(peerId)) {
				audio.pause();
				audio.srcObject = null;
				const newElements = new Map(audioElements);
				newElements.delete(peerId);
				audioElements = newElements;
			}
		});
	});

	onDestroy(() => {
		// Clean up audio elements
		audioElements.forEach((audio) => {
			audio.pause();
			audio.srcObject = null;
		});

		// Only leave if we're connected to this channel
		if (voiceState.currentRoomId === channelId) {
			voiceState.leaveVoice();
		}
	});
</script>

<!-- Idle State - Join Screen -->
{#if voiceState.status === 'idle' || voiceState.status === 'error'}
	<div class="voice-join-screen">
		<div class="voice-join-content">
			<!-- Channel Icon -->
			<div class="voice-icon-ring">
				<div class="voice-icon-inner">
					<Volume2 size={48} strokeWidth={1.5} />
				</div>
			</div>

			<h2 class="voice-channel-name">{channelName}</h2>
			<p class="voice-channel-subtitle">Voice Channel</p>

			{#if voiceState.status === 'error' && voiceState.error}
				<div class="voice-error">
					<AlertCircle size={16} />
					<span>{voiceState.error}</span>
				</div>
			{/if}

			<Button class="voice-join-btn" onclick={handleJoin}>
				<Phone size={18} />
				<span>Join Voice</span>
			</Button>

			<p class="voice-hint">You'll need to allow microphone access</p>
		</div>
	</div>

	<!-- Connecting State -->
{:else if voiceState.status === 'connecting'}
	<div class="voice-join-screen">
		<div class="voice-join-content">
			<div class="voice-icon-ring connecting">
				<div class="voice-icon-inner">
					<Loader2 size={48} strokeWidth={1.5} class="animate-spin" />
				</div>
			</div>

			<h2 class="voice-channel-name">{channelName}</h2>
			<p class="voice-channel-subtitle">Connecting...</p>

			<p class="voice-hint">Requesting microphone access</p>
		</div>
	</div>

	<!-- Connected State - In Call -->
{:else if voiceState.status === 'connected'}
	<div class="voice-call-screen">
		<!-- Participants Grid -->
		<div class="voice-participants">
			<!-- Local User -->
			<div class="voice-participant {voiceState.isMuted ? 'muted' : 'active'}">
				<div class="participant-avatar">
					<User size={32} />
					{#if voiceState.isMuted}
						<div class="mute-badge">
							<MicOff size={12} />
						</div>
					{/if}
				</div>
				<span class="participant-name">You</span>
				{#if !voiceState.isMuted}
					<div class="speaking-ring"></div>
				{/if}
			</div>

			<!-- Remote Peers -->
			{#each Array.from(voiceState.remoteStreams.entries()) as [peerId]}
				<div class="voice-participant active">
					<div class="participant-avatar">
						<User size={32} />
					</div>
					<span class="participant-name">User {peerId.slice(0, 6)}</span>
					<div class="speaking-ring"></div>
				</div>
			{/each}
		</div>

		<!-- Status Bar -->
		<div class="voice-status-bar">
			<div class="voice-status-indicator">
				<div class="status-dot"></div>
				<span>Voice Connected — {channelName}</span>
			</div>
			<span class="peer-count"
				>{voiceState.peerCount + 1}
				{voiceState.peerCount + 1 === 1 ? 'participant' : 'participants'}</span
			>
		</div>

		<!-- Call Controls -->
		<div class="voice-controls">
			<button
				class="control-btn {voiceState.isMuted ? 'control-btn-danger' : 'control-btn-default'}"
				onclick={handleMute}
				title={voiceState.isMuted ? 'Unmute' : 'Mute'}
			>
				{#if voiceState.isMuted}
					<MicOff size={22} />
				{:else}
					<Mic size={22} />
				{/if}
			</button>

			<button class="control-btn control-btn-leave" onclick={handleLeave} title="Leave Voice">
				<PhoneOff size={22} />
			</button>
		</div>
	</div>
{/if}

<style>
	/* ======================== Join Screen ======================== */
	.voice-join-screen {
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #1e1f22 0%, #2b2d31 50%, #1e1f22 100%);
		padding: 2rem;
	}

	.voice-join-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		max-width: 400px;
		text-align: center;
	}

	.voice-icon-ring {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: linear-gradient(135deg, rgba(88, 101, 242, 0.2), rgba(88, 101, 242, 0.05));
		border: 2px solid rgba(88, 101, 242, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 0.5rem;
		transition: all 0.3s ease;
	}

	.voice-icon-ring.connecting {
		border-color: rgba(250, 168, 26, 0.4);
		background: linear-gradient(135deg, rgba(250, 168, 26, 0.15), rgba(250, 168, 26, 0.05));
		animation: pulse-ring 2s ease-in-out infinite;
	}

	.voice-icon-inner {
		width: 88px;
		height: 88px;
		border-radius: 50%;
		background: rgba(88, 101, 242, 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #5865f2;
	}

	.connecting .voice-icon-inner {
		background: rgba(250, 168, 26, 0.12);
		color: #faa81a;
	}

	.voice-channel-name {
		font-size: 1.5rem;
		font-weight: 700;
		color: #f2f3f5;
		margin: 0;
	}

	.voice-channel-subtitle {
		font-size: 0.875rem;
		color: #b5bac1;
		margin: 0;
	}

	.voice-error {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgba(237, 66, 69, 0.12);
		border: 1px solid rgba(237, 66, 69, 0.3);
		border-radius: 8px;
		color: #ed4245;
		font-size: 0.8125rem;
		max-width: 100%;
	}

	:global(.voice-join-btn) {
		margin-top: 0.5rem;
		padding: 0.75rem 2rem !important;
		background: #248046 !important;
		border: none !important;
		border-radius: 999px !important;
		color: white !important;
		font-size: 0.9375rem !important;
		font-weight: 600 !important;
		cursor: pointer;
		transition: all 0.2s ease !important;
		display: flex !important;
		align-items: center !important;
		gap: 0.5rem !important;
	}

	:global(.voice-join-btn:hover) {
		background: #1a6334 !important;
		transform: scale(1.02);
	}

	.voice-hint {
		font-size: 0.75rem;
		color: #80848e;
		margin: 0;
	}

	/* ======================== Call Screen ======================== */
	.voice-call-screen {
		display: flex;
		flex: 1;
		flex-direction: column;
		background: #1e1f22;
	}

	.voice-participants {
		flex: 1;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		padding: 2rem;
		overflow-y: auto;
	}

	.voice-participant {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		position: relative;
	}

	.participant-avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: #2b2d31;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #b5bac1;
		position: relative;
		border: 3px solid transparent;
		transition: border-color 0.2s ease;
	}

	.voice-participant.active .participant-avatar {
		border-color: #23a559;
	}

	.voice-participant.muted .participant-avatar {
		border-color: #80848e;
	}

	.mute-badge {
		position: absolute;
		bottom: -2px;
		right: -2px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: #ed4245;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		border: 3px solid #1e1f22;
	}

	.participant-name {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #f2f3f5;
	}

	.speaking-ring {
		position: absolute;
		top: -4px;
		left: -4px;
		right: -4px;
		bottom: calc(-4px + 1.5rem + 0.75rem);
		border-radius: 50%;
		pointer-events: none;
	}

	/* ======================== Status Bar ======================== */
	.voice-status-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 1rem;
		background: #2b2d31;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}

	.voice-status-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: #23a559;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #23a559;
		animation: pulse-dot 2s ease-in-out infinite;
	}

	.peer-count {
		font-size: 0.75rem;
		color: #80848e;
	}

	/* ======================== Controls ======================== */
	.voice-controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 1.25rem;
		background: #232428;
	}

	.control-btn {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.control-btn:hover {
		transform: scale(1.08);
	}

	.control-btn:active {
		transform: scale(0.95);
	}

	.control-btn-default {
		background: #2b2d31;
		color: #b5bac1;
	}

	.control-btn-default:hover {
		background: #35373c;
		color: #f2f3f5;
	}

	.control-btn-danger {
		background: rgba(237, 66, 69, 0.2);
		color: #ed4245;
	}

	.control-btn-danger:hover {
		background: rgba(237, 66, 69, 0.35);
	}

	.control-btn-leave {
		background: #ed4245;
		color: white;
	}

	.control-btn-leave:hover {
		background: #d63031;
	}

	/* ======================== Animations ======================== */
	@keyframes pulse-ring {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(250, 168, 26, 0.15);
		}
		50% {
			box-shadow: 0 0 0 12px rgba(250, 168, 26, 0);
		}
	}

	@keyframes pulse-dot {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	:global(.animate-spin) {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
