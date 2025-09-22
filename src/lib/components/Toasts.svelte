<script lang="ts">
	import { fly } from 'svelte/transition';
	import { toastsStore } from '../stores/stores.js';
	import type { Toast } from '../types/toast.js';

	function dismissToast(id: string) {
		toastsStore.update(toasts => toasts.filter(t => t.id !== id));
	}

	function getToastIcon(type: Toast['type']) {
		switch (type) {
			case 'success': return '✅';
			case 'error': return '❌';
			case 'warning': return '⚠️';
			case 'info':
			default: return 'ℹ️';
		}
	}
</script>

<div class="toasts-container" role="region" aria-label="Notifications">
	{#each $toastsStore as toast (toast.id)}
		<div
			class="toast toast-{toast.type}"
			transition:fly={{ x: 300, duration: 300 }}
			role="alert"
			aria-live="polite"
		>
			<div class="toast-content">
				<span class="toast-icon" role="img" aria-label="{toast.type} notification">
					{getToastIcon(toast.type)}
				</span>
				<div class="toast-text">
					{#if toast.title}
						<div class="toast-title">{toast.title}</div>
					{/if}
					<div class="toast-message">{toast.message}</div>
				</div>
			</div>
			<button
				class="toast-dismiss"
				on:click={() => dismissToast(toast.id)}
				aria-label="Dismiss notification"
			>
				×
			</button>
		</div>
	{/each}
</div>

<style>
	.toasts-container {
		position: fixed;
		top: 16px;
		right: 16px;
		z-index: 10000;
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-width: 320px;
	}

	.toast {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 12px 16px;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border-radius: 8px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		box-shadow:
			0 4px 16px rgba(0, 0, 0, 0.1),
			0 2px 8px rgba(0, 0, 0, 0.05);
		min-height: 60px;
	}

	.toast-success {
		border-left: 4px solid #10b981;
	}

	.toast-error {
		border-left: 4px solid #ef4444;
	}

	.toast-warning {
		border-left: 4px solid #f59e0b;
	}

	.toast-info {
		border-left: 4px solid #3b82f6;
	}

	.toast-content {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		flex: 1;
	}

	.toast-icon {
		font-size: 16px;
		margin-top: 2px;
		flex-shrink: 0;
	}

	.toast-text {
		flex: 1;
		min-width: 0;
	}

	.toast-title {
		font-weight: 600;
		font-size: 14px;
		color: #374151;
		margin-bottom: 2px;
		line-height: 1.4;
	}

	.toast-message {
		font-size: 13px;
		color: #6b7280;
		line-height: 1.4;
		word-wrap: break-word;
	}

	.toast-dismiss {
		background: none;
		border: none;
		color: #9ca3af;
		cursor: pointer;
		font-size: 18px;
		line-height: 1;
		padding: 0;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.15s ease;
		flex-shrink: 0;
	}

	.toast-dismiss:hover {
		background: rgba(0, 0, 0, 0.05);
		color: #374151;
	}

	@media (max-width: 480px) {
		.toasts-container {
			left: 16px;
			right: 16px;
			max-width: none;
		}

		.toast {
			padding: 10px 12px;
		}

		.toast-title {
			font-size: 13px;
		}

		.toast-message {
			font-size: 12px;
		}
	}
</style>