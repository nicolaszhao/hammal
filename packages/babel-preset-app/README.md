# @hammal/babel-preset-app

## Usage

### Install

```
npm i --save-dev @hammal/babel-preset-app
```

### babelrc

```
{
  "presets": [
    "@hammal/babel-preset-app"
  ]
}
```

默认选项：`{ react: false, debug: false }`。

如需开启 `react-hot-loader`，需要安装并导入 [react-hot-loader](https://github.com/gaearon/react-hot-loader#getting-started)  到入口模块的顶部，并开启 `react` 选项：

```
{
  "presets": [
    ["@hammal/babel-preset-app", {"react": true}]
  ]
}
```

开启 `debug` 参数，可以打开 `preset-env` 的 debug 选项，根据 [browserslist](https://github.com/browserslist/browserslist)  配置，在编译时会输出导入的 corejs 模块等信息。

## 内置的 presets 和 plugins

### presets

[@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env)

[@babel/preset-react](https://babeljs.io/docs/en/babel-preset-react)

### plugins

[@babel/plugin-proposal-class-properties](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties)

[@babel/plugin-transform-runtime](https://babeljs.io/docs/en/babel-plugin-transform-runtime)

## [Polyfill](https://babeljs.io/docs/en/babel-polyfill)

需要手动在项目入口顶部导入 `core-js/stable` 和 `regenerator-runtime/runtime`。安装该 preset 时，已包含这 2 个模块，直接导入即可。

```js
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

**在 `npm link ` 调试时需要独立安装**。

考虑到对项目的完整编译和适配浏览器目标，`preset-env` 的 `useBuiltIns` 选项使用了 `entry`。`usage` 固然很好，可以按需导入 corejs，但可能会忽略安装在 `node_modules` 下的第三方模块的适配，除非第三方模块已经完全考虑了这种情况。

## [Runtime](https://babeljs.io/docs/en/babel-runtime)

已开启，且包含 `@babel/runtime`。但未开启 `corejs` 选项，否则会完全转换 ES6+ 的所有 API 为沙盒模式，而不是根据 browserslist。

