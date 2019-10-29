# @hammal/cli-service

## Usage

### Install

```
npm i --save-dev @hammal/cli-service
```

### 命令

在项目的 `package.json` 中:

```
{
  "scripts": {
    "start": "hammal-cli-service start",
    "build": "hammal-cli-service build"
  }
}
```

#### hammal-cli-service start

启动一个开发服务器（基于 webpack-dev-server）。

```
# 用法
hammal-cli-service start [options] [entry]

# options
# --host  指定 host (默认：0.0.0.0)
# --port  指定 port （默认：3003）
```

除了以上命令行参数，还可以通过 `hammal.config.js` 的 `devServer` 字段来配置开发服务器参数（参数字段同 webpack 的 [DevServer](https://webpack.js.org/configuration/dev-server/)）配置。注意，配置会优先使用命令行的 `host` 和 `port` 的值。

#### hammal-cli-service build

构建编译代码到 `dist/` 目录。

```
#用法
hammal-cli-service build [options] [entry]

# options
# --no-minimize  不压缩构建后的代码（用于调试等）
```

## 配置

`hammal.config.js` 是一个可选配置文件，和项目 `package.json` 同级，会被 `hammal-cli-service` 自动加载。

示例：

```
// hammal.config.js
module.exports = {
  // options...
};
```

### publicUrl

Type: `string`

Default: `'/'`

如果构建生产环境代码，会将该配置的值注入到 `process.env.PUBLIC_URL` 中。如果 `publicUrl` 没有以 `/` 结尾，`PUBLIC_URL` 会自动带上。

当应用部署到服务器的非根路径目录， 你就需要用该参数指定一个子路径。比如：`https://nicolaszhao.com/my-app/`，则设置 `publicUrl` 为 `/my-app/`。

#### 何时使用?

在 `public/*.html` 中：

```
<link rel="shortcut icon" href="%PUBLIC_URL%favicon.ico" />
```

当有动态导入模块时（`import(/* module */)`）：

```
// public-path.js
__webpack_public_path__ = process.env.PUBLIC_URL;
```

在项目入口模块导入：

```
// entry.js
import './public-path';
import './app';
```

参见：[webpack 文档](https://webpack.js.org/guides/public-path/#on-the-fly)

### outputDir

Type: `string`

Default: `dist`

`hammal-cli-service build` 生成的生产环境文件的目录，构建前，输出目录会被自动清除。

### filenameHashing

Type: `boolean`

Default: `true`

`hammal-cli-service build` 生成的生产环境代码（*.css, *.js） 会包含 hash 以控制持久缓存。你也可以关闭该选项，出于某些原因你不需要的话。

### sourceMap

Type: `boolean`

Default: `false`

为 CSS，JS 开启 source map，注意开启后会影响构建性能。

### pages

Type: `Object`

Default: `undefined`

用于 multi-page 模式，一个 "page" 对应一个入口文件。

```
pages: {

  // entry name 为：index, main, home, homepage 时，
  // 模板将使用 `public/index.html`
  index: 'src/pages/home/index.js',
  
  // 如果 entry：subpage 未能找到 `public/subpage.html`，
  // 将回退使用 `public/index.html`
  subpage: 'src/pages/subpage/index.js'
}
```

### css.modules

Type: `boolean`

Default: `false`

默认，只对 `*.module.[ext]` 文件视为 CSS Modules，设置为 `true`，将完全开启 CSS Modules，包括非 `*.module.[ext]` 后缀的文件。

### css.loaderOptions.sass

Type: `Object`

Default: `undefined`

CSS loader 额外的选项，目前只使用了 `sass`。

### devServer

Type: `Object`

Default: `{}`

`webpack-dev-server` 的选项，参见：[webpack 文档](https://webpack.js.org/configuration/dev-server/)。

`host`，`port` 等选项优先使用命令行参数。**注意：不要修改 `publicPath` 和 `historyApiFallback`** 等参数，它们需要和开发服务器的 `publicPath` 保持同步。

### configureWebpack

Type: `Object | Function`

如果这个值是一个对象，则会通过 [webpack-merge](https://github.com/survivejs/webpack-merge) 合并到最终的配置中。

如果是函数，则接收被解析后的配置，以及 NODE_ENV 的环境变量，并返回配置对象。值：`development`，`production`。

```
// hammal.config.js
module.exports = {
  configureWebpack: (config, env) => {
    if (env === 'development') {
      // 为开发环境修改配置
    } else {
      // 为生产环境修改配置
    }
    
    return config;
  }
};
```

## 环境变量

`hammal-cli-service` 内置了 [dotenv](https://github.com/motdotla/dotenv#readme)，可在项目根目录下创建 `.env` 文件来指定环境变量：

```
.env                # 在所有的环境中被载入
.env.local          # 在所有的环境中被载入，但会被 git 忽略
.env.[mode]         # 只在指定的模式中被载入
.env.[mode].local   # 只在指定的模式中被载入，但会被 git 忽略
```

只有 `HAMMAL_APP_` 开头的变量才会被 `webpack.DefinePlugin` 嵌入到客户端包中。`.env.local` 和 `.env.[mode].local` 应该只在本地生效，注意检查 `.gitignore` 文件。 

参考于 [Vue CLI 的文档]([https://cli.vuejs.org/zh/guide/mode-and-env.html#%E6%A8%A1%E5%BC%8F](https://cli.vuejs.org/zh/guide/mode-and-env.html))。

