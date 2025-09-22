import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		// Prevent Vite from trying to analyze Tauri imports in development
		__TAURI_AVAILABLE__: false
	},
	optimizeDeps: {
		exclude: ['@tauri-apps/api', '@tauri-apps/api/fs', '@tauri-apps/api/path']
	},
	build: {
		rollupOptions: {
			external: (id) => {
				// Make Tauri APIs external in all environments except Tauri builds
				return id.startsWith('@tauri-apps/api');
			}
		}
	}
});
