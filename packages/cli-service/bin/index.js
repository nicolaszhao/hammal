#!/usr/bin/env node

process.on('unhandleRejection', (err) => {
  throw err;
});

const spawn = require('cross-spawn');

const args = process.argv.slice(2);
const script = args[0];

if (['start', 'build'].includes(script)) {
  const result = spawn.sync(
    'node',
    [
      require.resolve(`../scripts/${script}`),
      ...args.slice(1),
    ],
    { stdio: 'inherit' },
  );

  if (result.signal) {
    process.exit(1);
  }
  process.exit(result.status);
} else {
  console.log(`Unknow script "${script}".`);
}
