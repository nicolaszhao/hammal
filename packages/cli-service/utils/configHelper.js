const cosmiconfig = require('cosmiconfig');

const explorer = cosmiconfig('hammal');
const result = explorer.searchSync();
let config = {};

if (result && result.config) {
  config = result.config;
}

// 支持配置参数:
// ------------------------------
// publicUrl
// outputDir
// filenameHashing
// sourceMap
// pages: { [chunk-name]: [chunk-entry] }
// css: { modules: Boolean, loaderOptions: { sass } }
// devServer: { [webpack-dev-server options] }
// configureWebpack: Object | Function
// transpileDependencies
module.exports = config;
