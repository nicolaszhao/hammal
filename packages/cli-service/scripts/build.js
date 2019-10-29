
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

process.on('unhandledRejection', (err) => {
  throw err;
});

require('../config/env');

const yargs = require('yargs');
const spawn = require('cross-spawn');
const which = require('npm-which');

const { argv } = yargs;
const webpackCliArgs = [
  '--env.production',
  '--config', require.resolve('../config/webpack.config.js'),
];

if (argv.minimize === false) {
  webpackCliArgs.unshift('--env.nominimize');
}

const result = spawn.sync(
  which(__dirname).sync('webpack'),
  webpackCliArgs,
  { stdio: 'inherit' },
);

if (result.signal) {
  process.exit(1);
}
process.exit(result.status);
