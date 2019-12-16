# @hammal/babel-preset-app

## 上手

### 安装

```
npm i --save-dev @hammal/babel-preset-app
```

### 配置 `.babelrc`

```
{
  "presets": [
    "@hammal/babel-preset-app"
  ]
}
```

### 选项

默认值：`{ react: false, debug: false }`

#### react

支持编译 react 的 `jsx` 代码：

```
{
  "presets": [
    ["@hammal/babel-preset-app", {"react": true}]
  ]
}
```

`react` 选项设置为 `true` 时，会自动检测目标项目下是否安装了 `react-hot-loader` 依赖，并配置 `react-hot-loader/babel` 到插件选项中。

#### debug

开启 `@babel/preset-env` 的 `debug`。根据 [browserslist](https://github.com/browserslist/browserslist)  配置，在编译时输出导入的 corejs 模块信息。参考文档：[babel-preset-env](https://babeljs.io/docs/en/babel-preset-env#debug)

```
{
  "presets": [
    ["@hammal/babel-preset-app", {"debug": true}]
  ]
}
```

## ENV

需要配置环境变量 `NODE_ENV` 或者 `BABEL_ENV`。变量值必须为：`development`、`production`，或者 `test`。

如需要在 npm-scripts 中配置，建议安装 [cross-env](https://www.npmjs.com/package/cross-env)：

```
npm i --save-dev cross-env
```

## 内置的 presets 和 plugins

### presets

[@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env)

[@babel/preset-react](https://babeljs.io/docs/en/babel-preset-react)

### plugins

[@babel/plugin-proposal-class-properties](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties)

[@babel/plugin-transform-runtime](https://babeljs.io/docs/en/babel-plugin-transform-runtime)

## [Polyfill](https://babeljs.io/docs/en/babel-polyfill)

需要手动在项目入口顶部导入 `core-js/stable` 和 `regenerator-runtime/runtime`。该 preset 中，已包含这 2 个模块，可直接导入。

```js
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

### 调试

**在以 `npm link ` 的方式调试时需要独立安装**。

考虑到对项目的完整编译和浏览器适配，`preset-env` 的 `useBuiltIns` 选项暂时使用了 `entry`。`usage` 固然很好，可按需导入 corejs，但会忽略安装在 `node_modules` 下的第三方模块的 ES6+ 的 api 适配。

## [Runtime](https://babeljs.io/docs/en/babel-runtime)

默认已开启，且已包含 `@babel/runtime` 依赖。但未开启 `corejs` 选项，否则会完全转换 ES6+ 的所有 API 为沙盒模式，而不是根据 browserslist，这会导致代码冗余。

## License

[MIT](https://github.com/nicolaszhao/hammal/blob/master/LICENSE) © [nicolaszhao](https://github.com/nicolaszhao)
