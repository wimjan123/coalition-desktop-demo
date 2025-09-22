<script lang="ts">
	import Desktop from '$lib/components/Desktop.svelte';
</script>

<svelte:head>
	<title>Coalition Desktop</title>
	<meta name="description" content="Satirical desktop-in-a-window for Coalition Desktop" />
</svelte:head>

<main>
	<Desktop />
</main>

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		height: 100%;
		overflow: hidden;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	main {
		height: 100vh;
		width: 100vw;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		position: relative;
		overflow: hidden;
	}
</style>
