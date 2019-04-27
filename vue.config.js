module.exports = {
  publicPath: './',
  chainWebpack: config => config.plugins.delete('named-chunks'),
  parallel: false
}