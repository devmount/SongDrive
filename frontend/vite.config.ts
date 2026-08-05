import { defineConfig } from 'vite';
import { resolve } from "path";
import vue from '@vitejs/plugin-vue';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [
		vue(),
		tailwindcss(),
	],
	assetsInclude: ['**/*.md'],
	define: {
		APP_VERSION: JSON.stringify(process.env.npm_package_version),
	},
	resolve: {
		alias: {
			"@": resolve(import.meta.dirname, "./src"),
			"@backend": resolve(import.meta.dirname, "../backend/dist"),
		},
	},
	build: {
    outDir: "../backend/dist/static",
    emptyOutDir: true,
    sourcemap : true,
		chunkSizeWarningLimit: 1024
  }
});
