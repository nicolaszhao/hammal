#!/usr/bin/env node

const chalk = require('chalk');
const semver = require('semver');
const program = require('commander');

const pkg = require('../package.json');
const create = require('../lib/create');
const list = require('../lib/list');
const { add, del } = require('../lib/templateHelper');

if (!semver.satisfies(process.version, pkg.engines.node)) {
  console.log(chalk.red(
    `Your are using Node ${process.version}, Hammal requires Node ${pkg.engines.node}. \nPlease upgrade your Node version.`,
  ));
  process.exit(1);
}

program
  .version(pkg.version, '-v, --version')
  .usage('<command>');

program
  .command('create <project-name>')
  .description('generate a new project from a template')
  .action(create);

program
  .command('list')
  .alias('ls')
  .description('list available templates')
  .action(list);

program
  .command('add <template> <repository> [description]')
  .description('add one custom template')
  .action(add);

program
  .command('del <template>')
  .description('delete one custom template')
  .action(del);

program
  .arguments('<command>')
  .action((cmd) => {
    program.outputHelp();
    console.log(`  ${chalk.red(`Unknown command ${chalk.yellow(cmd)}.`)}`);
    console.log();
  });

program.on('--help', () => {
  console.log();
  console.log(`  Run ${chalk.cyan('hammal <command> --help')} for detailed usage of given command.`);
  console.log();
});

program.commands.forEach((c) => c.on('--help', () => console.log()));
program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
