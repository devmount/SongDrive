import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const path = require("path");

export default defineConfig({
	plugins: [vue()],
	assetsInclude: ['**/*.md'],
	define: {
		APP_VERSION: JSON.stringify(process.env.npm_package_version),
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
