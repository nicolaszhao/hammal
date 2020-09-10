const path = require('path');
const resolve = require('resolve');

module.exports = function create(api, opts) {
  if (!api.env(['development', 'production', 'test'])) {
    // 参考自: create-react-app/packages/babel-preset-react-app/create.js
    throw new Error(
      `Using "@hammal/babel-preset-app" requires that you specify "NODE_ENV" or
        "BABEL_ENV" environment variables. Valid values are "development",
        "test", and "production". Instead, received:
        ${JSON.stringify(api.env())} .`,
    );
  }

  const env = api.env();
  const isEnvDevelopment = env === 'development';
  const isEnvProduction = env === 'production';
  const isEnvTest = env === 'test';
  const {
    useBuiltIns = 'entry',
    typescript = false,
    react = false,
    debug = false,
  } = opts;
  const absoluteRuntimePath = path.dirname(
    require.resolve('@babel/runtime/package.json'),
  );

  // react-hot-loader 需要在两块地方使用导入模块路径，
  // 1. babel 配置的 plugin 中
  // 2. 项目代码中
  // 所以，不能在这里做为 babel-preset-app 的依赖项安装
  const requireReactHotLoader = () => {
    let reactHotLoader = '';
    try {
      reactHotLoader = resolve.sync('react-hot-loader/babel', { basedir: process.cwd() });
    } catch (err) {
      // ignore
    }
    return reactHotLoader;
  };

  return {
    presets: [
      isEnvTest && [
        require('@babel/preset-env').default,
        {
          targets: {
            node: 'current',
          },
        },
      ],
      (isEnvDevelopment || isEnvProduction) && [
        require('@babel/preset-env').default,
        {
          useBuiltIns,

          // 此 corejs 配置和 @babel/plugin-transform-runtime 的 corejs 有一定区别，
          // 该配置会代替以前版本的 @babel/polyfill 和 core-js2。corejs3 会更细化和面向未来，
          // 但这里的 corejs3 的导入是 Global 的，而 runtime 不会污染全局，但它也有缺陷，
          // 具体描述看下面的插件配置注释
          corejs: 3,

          modules: false,
          debug,
        },
      ],
      react && [
        require('@babel/preset-react').default,
        {
          development: isEnvDevelopment,
        },
      ],
      typescript && require('@babel/preset-typescript').default,
    ].filter(Boolean),
    plugins: [
      // decorators 和 class-properties 有相互关联，在 plugins 中还有先后顺序
      // 并且，class-properties 配置了 loose 模式，那么 decorators 也必须配上 legacy
      // 参见：https://babeljs.io/docs/en/babel-plugin-proposal-decorators#note-compatibility-with-babel-plugin-proposal-class-properties
      [
        require('@babel/plugin-proposal-decorators').default,
        {
          legacy: true,
        },
      ],
      [
        require('@babel/plugin-proposal-class-properties').default,
        {
          loose: true,
        },
      ],
      [
        require('@babel/plugin-transform-runtime').default,
        {

          // 对于 library，暂时不开启 corejs（可配置化），因为插件在开启 { corejs: 3 } 时，
          // 会一股脑的全部转换所有 ES6+ 的代码和 helpers，包括 instance 方法
          // 目前看起来，插件还不支持 browserslist（类似于 @babel/preset-env），
          // 所以，会导致 library 的代码冗余
          // 参考问题：https://github.com/babel/babel/issues/7330
          corejs: false,

          useESModules: isEnvDevelopment || isEnvProduction,

          // TODO: 开启这个选项时，当同时开启 { corejs: 3 }，插件会出现个 bug：
          // 由于插件源码中，在处理 instance 转换模块的导入时，没有准确的使用 modulePath（使用了 moduleName），
          // 导致在通过 npm-link 方式调试测试项目时，无法从相对路径找到模块，
          // 需要在测试项目中单独再安装 @babel/runtime-corejs3，
          absoluteRuntime: absoluteRuntimePath,
        },
      ],

      require('@babel/plugin-proposal-optional-chaining').default,
      require('@babel/plugin-proposal-nullish-coalescing-operator').default,

      react && requireReactHotLoader(),

    ].filter(Boolean),
  };
};
