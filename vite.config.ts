import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		exclude: ['@tauri-apps/api/fs', '@tauri-apps/api/path']
	},
	ssr: {
		noExternal: ['@tauri-apps/api/fs', '@tauri-apps/api/path']
	}
});
