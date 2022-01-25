process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
	configureWebpack: {
		performance: {
			maxEntrypointSize: 4096000,
			maxAssetSize: 2048000
		},
		output: {
			filename: "js/[name].js",
			chunkFilename: "js/[name].bundle.js",
		},
	},
	productionSourceMap: false,
	publicPath: "/",
	chainWebpack: config => {
		config.module
			.rule('raw')
			.test(/\.md$/)
			.use('raw-loader')
			.loader('raw-loader')
			.end()
	},
};
