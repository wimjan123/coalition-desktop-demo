<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { StartingScenario } from '../types/game.js';
	import { STARTING_SCENARIOS } from '../types/game.js';

	const dispatch = createEventDispatcher<{
		select: { scenario: StartingScenario };
	}>();

	let selectedScenario: StartingScenario | null = null;

	function selectScenario(scenario: StartingScenario) {
		selectedScenario = scenario;
	}

	function confirmSelection() {
		if (selectedScenario) {
			dispatch('select', { scenario: selectedScenario });
		}
	}

	function getRiskColor(riskLevel: string): string {
		switch (riskLevel) {
			case 'low': return 'text-green-600 bg-green-50';
			case 'medium': return 'text-yellow-600 bg-yellow-50';
			case 'high': return 'text-orange-600 bg-orange-50';
			case 'extreme': return 'text-red-600 bg-red-50';
			default: return 'text-gray-600 bg-gray-50';
		}
	}

	function getModifierDisplay(value: number): string {
		if (value === 0) return '±0';
		return value > 0 ? `+${value}` : `${value}`;
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
	<div class="max-w-6xl mx-auto">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-gray-900 mb-4">Choose Your Political Entry</h1>
			<p class="text-lg text-gray-600 max-w-3xl mx-auto">
				Every political career begins with a story. How will you enter Dutch politics?
				Each scenario affects your starting conditions, interview tone, and gameplay challenges.
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
			{#each STARTING_SCENARIOS as scenario}
				<div
					class="bg-white rounded-lg shadow-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-xl
						{selectedScenario?.id === scenario.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}"
					on:click={() => selectScenario(scenario)}
					role="button"
					tabindex="0"
					on:keydown={(e) => e.key === 'Enter' && selectScenario(scenario)}
				>
					<div class="p-6">
						<!-- Risk Level Badge -->
						<div class="flex justify-between items-start mb-4">
							<span class="px-3 py-1 rounded-full text-sm font-medium {getRiskColor(scenario.riskLevel)}">
								{scenario.riskLevel.toUpperCase()} RISK
							</span>
							{#if selectedScenario?.id === scenario.id}
								<div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
									<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
								</div>
							{/if}
						</div>

						<!-- Scenario Details -->
						<h3 class="text-xl font-bold text-gray-900 mb-2">{scenario.name}</h3>
						<p class="text-gray-600 mb-4">{scenario.description}</p>

						<!-- Interview Tone -->
						<div class="mb-4">
							<span class="text-sm font-medium text-gray-700">Interview Tone:</span>
							<span class="text-sm font-bold ml-2
								{scenario.interviewerTone === 'hostile' ? 'text-red-600' :
								scenario.interviewerTone === 'skeptical' ? 'text-orange-600' :
								scenario.interviewerTone === 'confrontational' ? 'text-red-500' :
								scenario.interviewerTone === 'neutral' ? 'text-gray-600' : 'text-green-600'}">
								{scenario.interviewerTone.toUpperCase()}
							</span>
						</div>

						<!-- Gameplay Modifiers -->
						<div class="space-y-2">
							<div class="text-sm font-medium text-gray-700 mb-2">Starting Modifiers:</div>
							<div class="grid grid-cols-1 gap-1 text-xs">
								<div class="flex justify-between">
									<span>Approval Rating:</span>
									<span class="font-mono {scenario.gameplayModifiers.approvalRating >= 0 ? 'text-green-600' : 'text-red-600'}">
										{getModifierDisplay(scenario.gameplayModifiers.approvalRating)}%
									</span>
								</div>
								<div class="flex justify-between">
									<span>Media Relations:</span>
									<span class="font-mono {scenario.gameplayModifiers.mediaRelations >= 0 ? 'text-green-600' : 'text-red-600'}">
										{getModifierDisplay(scenario.gameplayModifiers.mediaRelations)}
									</span>
								</div>
								<div class="flex justify-between">
									<span>Coalition Trust:</span>
									<span class="font-mono {scenario.gameplayModifiers.coalitionTrust >= 0 ? 'text-green-600' : 'text-red-600'}">
										{getModifierDisplay(scenario.gameplayModifiers.coalitionTrust)}
									</span>
								</div>
							</div>

							<!-- Special Actions -->
							{#if scenario.gameplayModifiers.specialActions.length > 0}
								<div class="mt-3">
									<div class="text-sm font-medium text-gray-700 mb-1">Special Actions:</div>
									<div class="flex flex-wrap gap-1">
										{#each scenario.gameplayModifiers.specialActions as action}
											<span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
												{action}
											</span>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Difficulty Warning -->
		{#if selectedScenario && (selectedScenario.riskLevel === 'high' || selectedScenario.riskLevel === 'extreme')}
			<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
				<div class="flex items-start">
					<svg class="w-6 h-6 text-yellow-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
					</svg>
					<div>
						<h4 class="text-lg font-bold text-yellow-800 mb-2">
							{selectedScenario.riskLevel === 'extreme' ? 'Expert Challenge' : 'High Difficulty Warning'}
						</h4>
						<p class="text-yellow-700">
							This scenario provides a challenging start with significant penalties but unique opportunities.
							Are you ready for the political gauntlet?
						</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Navigation -->
		<div class="flex justify-center">
			<button
				disabled={!selectedScenario}
				on:click={confirmSelection}
				class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg
					disabled:bg-gray-300 disabled:cursor-not-allowed
					hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
					transition-colors duration-200"
			>
				{selectedScenario ? `Continue with ${selectedScenario.name}` : 'Select a Scenario to Continue'}
			</button>
		</div>
	</div>
</div>