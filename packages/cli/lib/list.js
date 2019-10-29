const chalk = require('chalk');
const { getAllTemplates } = require('./templateHelper');

module.exports = () => {
  const all = getAllTemplates();
  const names = Object.keys(all);
  const labelText = '(custom)';
  const namePads = Math.max(...names.map((name) => name.length)) + 1;

  console.log();

  names.forEach((name) => {
    const { custom = false, url } = all[name];
    const label = custom ? labelText : '';
    const cells = [];

    cells.push(chalk.cyan(`${label}`.padStart(labelText.length, ' ')));
    cells.push(`${name} `.padEnd(namePads, '-'));
    cells.push(url);

    console.log(cells.join(' '));
  });

  console.log();
};
