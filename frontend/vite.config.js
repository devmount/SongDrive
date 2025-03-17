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
			"@": resolve(__dirname, "./src"),
		},
	},
});
