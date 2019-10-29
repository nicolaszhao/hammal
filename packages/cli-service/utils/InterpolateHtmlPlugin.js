const HtmlWebpackPlugin = require('html-webpack-plugin');
const escapeStringRegexp = require('escape-string-regexp');

class InterpolateHtmlPlugin {
  constructor(replacements) {
    this.replacements = replacements;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('InterpolateHtmlPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tap('InterpolateHtmlPlugin', (data) => {
        Object.keys(this.replacements).forEach((key) => {
          const value = this.replacements[key];

          data.html = data.html.replace(
            new RegExp(`<%=\\s*${escapeStringRegexp(key)}\\s*%>`, 'g'),
            value,
          );
        });
      });
    });
  }
}

module.exports = InterpolateHtmlPlugin;
