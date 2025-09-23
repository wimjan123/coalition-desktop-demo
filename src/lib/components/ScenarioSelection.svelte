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
	<div class="max-w-7xl mx-auto">
		<div class="text-center mb-12">
			<h1 class="text-5xl font-bold text-gray-900 mb-6">Choose Your Political Entry</h1>
			<p class="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
				Every political career begins with a story. How will you enter Dutch politics?<br>
				<span class="text-lg text-gray-500">Each scenario affects your starting conditions, interview tone, and gameplay challenges.</span>
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
			{#each STARTING_SCENARIOS as scenario}
				<div
					class="bg-white rounded-xl shadow-xl border-3 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-105 transform
						{selectedScenario?.id === scenario.id ? 'border-blue-500 ring-4 ring-blue-200 shadow-2xl scale-105' : 'border-gray-200 hover:border-blue-300'}"
					on:click={() => selectScenario(scenario)}
					role="button"
					tabindex="0"
					on:keydown={(e) => e.key === 'Enter' && selectScenario(scenario)}
				>
					<!-- Header Section with Risk Badge -->
					<div class="bg-gradient-to-r {scenario.riskLevel === 'low' ? 'from-green-500 to-green-600' :
						scenario.riskLevel === 'medium' ? 'from-yellow-500 to-orange-500' :
						scenario.riskLevel === 'high' ? 'from-orange-500 to-red-500' :
						'from-red-600 to-red-700'} rounded-t-xl p-6 text-white relative overflow-hidden">

						<!-- Background Pattern -->
						<div class="absolute inset-0 opacity-10">
							<div class="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
							<div class="absolute top-4 right-4 w-24 h-24 border-4 border-white rounded-full opacity-20"></div>
							<div class="absolute bottom-2 left-8 w-16 h-16 border-2 border-white rounded-full opacity-15"></div>
						</div>

						<div class="relative z-10">
							<!-- Risk Level Badge -->
							<div class="flex justify-between items-center mb-4">
								<div class="bg-white bg-opacity-25 backdrop-blur-sm px-4 py-2 rounded-full">
									<span class="text-white font-bold text-sm tracking-wide">
										{scenario.riskLevel.toUpperCase()} RISK
									</span>
								</div>
								{#if selectedScenario?.id === scenario.id}
									<div class="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
										<svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
										</svg>
									</div>
								{/if}
							</div>

							<!-- Scenario Title -->
							<h3 class="text-2xl font-bold text-white mb-3 leading-tight">{scenario.name}</h3>

							<!-- Interview Tone Badge -->
							<div class="inline-block bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full">
								<span class="text-white text-sm font-medium">
									Interview: {scenario.interviewerTone.toUpperCase()}
								</span>
							</div>
						</div>
					</div>

					<!-- Content Section -->
					<div class="p-6 space-y-6">
						<!-- Description -->
						<p class="text-gray-700 text-lg leading-relaxed">{scenario.description}</p>

						<!-- Stats Section -->
						<div class="bg-gray-50 rounded-lg p-4">
							<h4 class="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Starting Modifiers</h4>
							<div class="grid grid-cols-3 gap-4">
								<div class="text-center">
									<div class="text-2xl font-bold {scenario.gameplayModifiers.approvalRating >= 0 ? 'text-green-600' : 'text-red-600'}">
										{getModifierDisplay(scenario.gameplayModifiers.approvalRating)}%
									</div>
									<div class="text-xs text-gray-600 font-medium">Approval</div>
								</div>
								<div class="text-center">
									<div class="text-2xl font-bold {scenario.gameplayModifiers.mediaRelations >= 0 ? 'text-green-600' : 'text-red-600'}">
										{getModifierDisplay(scenario.gameplayModifiers.mediaRelations)}
									</div>
									<div class="text-xs text-gray-600 font-medium">Media</div>
								</div>
								<div class="text-center">
									<div class="text-2xl font-bold {scenario.gameplayModifiers.coalitionTrust >= 0 ? 'text-green-600' : 'text-red-600'}">
										{getModifierDisplay(scenario.gameplayModifiers.coalitionTrust)}
									</div>
									<div class="text-xs text-gray-600 font-medium">Coalition</div>
								</div>
							</div>
						</div>

						<!-- Special Actions -->
						{#if scenario.gameplayModifiers.specialActions.length > 0}
							<div>
								<h4 class="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Special Actions</h4>
								<div class="flex flex-wrap gap-2">
									{#each scenario.gameplayModifiers.specialActions as action}
										<span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
											{action}
										</span>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<!-- Enhanced Difficulty Warning -->
		{#if selectedScenario && (selectedScenario.riskLevel === 'high' || selectedScenario.riskLevel === 'extreme')}
			<div class="max-w-2xl mx-auto mb-8">
				<div class="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 shadow-lg">
					<div class="flex items-start">
						<div class="flex-shrink-0">
							<div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
								<svg class="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
								</svg>
							</div>
						</div>
						<div class="ml-4">
							<h4 class="text-xl font-bold text-amber-900 mb-2">
								{selectedScenario.riskLevel === 'extreme' ? '⚡ Expert Challenge' : '🔥 High Difficulty Warning'}
							</h4>
							<p class="text-amber-800 text-lg leading-relaxed">
								This scenario provides a challenging start with significant penalties but unique opportunities.
								Are you ready for the political gauntlet?
							</p>
							{#if selectedScenario.riskLevel === 'extreme'}
								<div class="mt-3 p-3 bg-amber-100 rounded-lg">
									<p class="text-amber-900 text-sm font-medium">
										⚠️ Extreme scenarios are designed for experienced players who want maximum challenge.
									</p>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Enhanced Navigation -->
		<div class="text-center">
			{#if selectedScenario}
				<div class="mb-4">
					<p class="text-gray-600 text-lg">You've selected:</p>
					<p class="text-2xl font-bold text-gray-900">{selectedScenario.name}</p>
				</div>
			{/if}

			<button
				disabled={!selectedScenario}
				on:click={confirmSelection}
				class="px-12 py-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 transform
					{selectedScenario
						? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300'
						: 'bg-gray-300 text-gray-600 cursor-not-allowed'}"
			>
				{selectedScenario ? `Begin Your Journey as ${selectedScenario.name}` : 'Select a Scenario to Continue'}
			</button>

			{#if selectedScenario}
				<p class="mt-4 text-gray-500 text-sm">
					Next: Choose your professional background and party setup
				</p>
			{/if}
		</div>
	</div>
</div>