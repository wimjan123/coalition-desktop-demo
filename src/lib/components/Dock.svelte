<script lang="ts">
	import { createWindow } from '../utils/window-manager.js';
	import { clearGameState } from '../stores/gameStore.js';

	export let showCampaignDashboard: boolean = true;
	export let showPollingApp: boolean = false;
	export let showPartyOverview: boolean = false;
	export let currentPhase: string | undefined = undefined;

	const apps = [
		{ id: 'mail', name: 'Mail', icon: '📧', appType: 'mail' },
		{ id: 'chat', name: 'Chat', icon: '💬', appType: 'chat' },
		{ id: 'polling', name: 'Polling', icon: '📊', appType: 'polling' },
		{ id: 'party', name: 'Party Stats', icon: '📈', appType: 'party' },
		{ id: 'calendar', name: 'Calendar', icon: '📅', appType: 'calendar' },
		{ id: 'cabinet', name: 'Cabinet', icon: '🗄️', appType: 'cabinet' },
		{ id: 'policy', name: 'Policy', icon: '📋', appType: 'policy' },
		{ id: 'media', name: 'Media', icon: '📺', appType: 'media' },
		{ id: 'newgame', name: 'New Game', icon: '🎮', appType: 'newgame' }
	];

	$: campaignApps = currentPhase === 'campaign'
		? [{ id: 'campaign', name: 'Campaign Manager', icon: '🚀', appType: 'campaign' }, ...apps]
		: apps;

	function launchApp(app: typeof apps[0]) {
		if (app.appType === 'newgame') {
			// Special case: Start new game (clear game state to show character creation)
			if (confirm('Are you sure you want to start a new game? This will delete your current progress.')) {
				clearGameState();
			}
		} else if (app.appType === 'campaign') {
			// Special case: Toggle campaign dashboard
			showCampaignDashboard = true;
		} else if (app.appType === 'polling') {
			// Special case: Toggle polling app
			showPollingApp = true;
		} else if (app.appType === 'party') {
			// Special case: Toggle party overview
			showPartyOverview = true;
		} else {
			// Position windows in a predictable cascade pattern
			const windowCount = document.querySelectorAll('.window').length;
			const offsetStep = 30;
			const baseX = 150;
			const baseY = 100;

			createWindow({
				title: app.name,
				appType: app.appType,
				width: 600,
				height: 400,
				x: baseX + (windowCount * offsetStep) % 400,
				y: baseY + (windowCount * offsetStep) % 300
			});
		}
	}
</script>

<div class="dock" role="toolbar" aria-label="Application dock">
	<div class="dock-container">
		{#each campaignApps as app (app.id)}
			<button
				class="dock-item"
				class:active={(app.appType === 'campaign' && showCampaignDashboard) || (app.appType === 'polling' && showPollingApp) || (app.appType === 'party' && showPartyOverview)}
				on:click={() => launchApp(app)}
				aria-label="Launch {app.name}"
				title={app.name}
			>
				<span class="dock-icon" role="img" aria-label="{app.name} icon">
					{app.icon}
				</span>
				<span class="dock-label">{app.name}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.dock {
		position: absolute;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;
	}

	.dock-container {
		display: flex;
		gap: 8px;
		padding: 12px 16px;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(20px);
		border-radius: 16px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.dock-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 8px;
		background: transparent;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		color: white;
		min-width: 60px;
	}

	.dock-item:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-4px) scale(1.05);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
	}

	.dock-item:active {
		transform: translateY(-2px) scale(1.02);
	}

	.dock-item.active {
		background: rgba(255, 255, 255, 0.3);
		transform: translateY(-4px) scale(1.05);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
	}

	.dock-icon {
		font-size: 24px;
		display: block;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	.dock-label {
		font-size: 10px;
		font-weight: 500;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		white-space: nowrap;
	}

	@media (max-width: 768px) {
		.dock-container {
			flex-wrap: wrap;
			max-width: 280px;
		}

		.dock-item {
			min-width: 50px;
		}

		.dock-icon {
			font-size: 20px;
		}

		.dock-label {
			font-size: 9px;
		}
	}
</style>