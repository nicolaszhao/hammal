const fs = require('fs-extra');
const path = require('path');
const ini = require('ini');
const chalk = require('chalk');
const templates = require('../templates.json');

const HAMALRC = path.join(process.env.HOME, '.hamalrc');
const HAMAL_SERVICE_TEMPLATES = [
  'pure-mpa',
  'react-mpa',
  'react-spa',
  'react-redux-spa',
];

const setCustomTemplates = (config) => {
  Object.keys(config).forEach((name) => {
    if (templates[name]) {
      delete config[name];
    }
  });

  fs.writeFileSync(HAMALRC, ini.stringify(config));
};

const getCustomTemplates = () => (fs.existsSync(HAMALRC)
  ? ini.parse(fs.readFileSync(HAMALRC, 'utf-8'))
  : {}
);

const getAllTemplates = () => {
  const custom = getCustomTemplates();
  const all = { ...templates, ...custom };

  Object.keys(all).forEach((name) => {
    if (custom[name]) {
      // 防止自定义的模板和内置的重名，用内置的模板反向覆盖
      if (templates[name]) {
        all[name] = { ...templates[name] };
      } else {
        all[name].custom = true;
      }
    }

    if (HAMAL_SERVICE_TEMPLATES.includes(name)) {
      all[name].hasService = true;
    }
  });

  return all;
};

const add = (name, url, description) => {
  const custom = getCustomTemplates();
  const repositoryUrlRegex = /^git@([^:]+):([^/]+)\/.*\.git$/;

  if (templates[name] || custom[name]) {
    console.log(`The template "${name}" already exists.`);
    return;
  }

  if (!repositoryUrlRegex.test(url)) {
    console.log(chalk.red('`Repository url use SSH only.'));
    return;
  }

  custom[name] = { url };

  if (description) {
    custom[name].description = description;
  }
  setCustomTemplates(custom);
  console.log(`Add template "${name}" success.`);
};

const del = (name) => {
  const custom = getCustomTemplates();

  if (templates[name]) {
    console.log(`The built-in template "${name}" cannot be deleted.`);
    return;
  }

  if (!custom[name]) {
    console.log(`The template "${name}" does not exist.`);
    return;
  }

  delete custom[name];
  setCustomTemplates(custom);
  console.log(`Delete template "${name}" success.`);
};

module.exports = {
  getAllTemplates,
  add,
  del,
};
