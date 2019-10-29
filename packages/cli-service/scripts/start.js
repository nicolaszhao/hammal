
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

process.on('unhandledRejection', (err) => {
  throw err;
});

require('../config/env');

const yargs = require('yargs');
const spawn = require('cross-spawn');
const which = require('npm-which');

const { argv } = yargs;
const devServerArgs = [
  '--color',
  '--env.development',
  '--config', require.resolve('../config/webpack.config.js'),
];

if (argv.port) {
  devServerArgs.unshift('--port', argv.port);
}

if (argv.host) {
  devServerArgs.unshift('--host', argv.host);
}

const result = spawn.sync(
  which(__dirname).sync('webpack-dev-server'),
  devServerArgs,
  { stdio: 'inherit' },
);

if (result.signal) {
  process.exit(1);
}
process.exit(result.status);
