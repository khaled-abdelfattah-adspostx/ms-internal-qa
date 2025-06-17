import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// Enable advanced minification and compression
		minify: 'terser',
		target: 'es2020',
		cssMinify: true,
		reportCompressedSize: false, // Faster builds
		
		// Optimize chunk splitting for better caching
		rollupOptions: {
			output: {
				manualChunks: {
					// Separate vendor chunks for better caching
					'lucide': ['lucide-svelte'],
					'svelte-kit': ['@sveltejs/kit'],
					'utilities': ['$lib/utils/search', '$lib/stores/loading']
				}
			}
		},
		
		// Optimize for production
		terserOptions: {
			compress: {
				drop_console: true, // Remove console.logs in production
				drop_debugger: true
			}
		}
	},
	
	optimizeDeps: {
		// Pre-bundle dependencies for faster cold starts
		include: [
			'lucide-svelte'
		],
		// Exclude problematic dependencies
		exclude: ['@sveltejs/kit/vite']
	},
	
	server: {
		// Improve development server performance
		fs: {
			strict: false
		},
		// Enable hot reload optimizations
		hmr: {
			overlay: false // Reduce overlay noise
		}
	},
	
	// CSS optimization
	css: {
		devSourcemap: false // Faster dev builds
	},
	
	// Worker optimization
	worker: {
		format: 'es'
	}
});
