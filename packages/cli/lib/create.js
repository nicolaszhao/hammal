const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const util = require('util');
const { execSync } = require('child_process');
const ora = require('ora');
const chalk = require('chalk');
const inquirer = require('inquirer');
const spawn = require('cross-spawn');
const downloadGitRepo = require('download-git-repo');
const validateProjectName = require('validate-npm-package-name');
const handlebars = require('handlebars');
const glob = require('glob');
const { getAllTemplates } = require('./templateHelper');
const pkg = require('../package.json');

const defaultBrowsers = {
  production: ['> 1%', 'last 2 versions'],
  development: [
    'last 1 chrome version',
    'last 1 firefox version',
    'last 1 safari version',
  ],
};

function checkProjectName(projectName) {
  const validationResult = validateProjectName(projectName);

  if (!validationResult.validForNewPackages) {
    console.error(`Could not create a project called ${chalk.red(`"${projectName}"`)} because of npm naming restrictions:`);
    const { errors = [], warnings = [] } = validationResult;
    [...errors, ...warnings].forEach((error) => console.error(chalk.red(`  * ${error}`)));
    process.exit(1);
  }
}

function checkProjectConflicts(name) {
  if (fs.existsSync(name)) {
    console.error(`The directory ${chalk.red(`"${name}"`)} already exists, please select another name.`);
    process.exit(1);
  }
}

function getAnswers() {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'Please pick a template',
      default: 0,
      choices: () => {
        const all = getAllTemplates();
        return Object.keys(all).map((name) => {
          const { description = name } = all[name];
          return {
            name: description,
            value: name,
          };
        });
      },
    },
    {
      type: 'confirm',
      name: 'eslint',
      message: 'ESLint?',
      default: true,
    },
  ]);
}

function install(root) {
  process.chdir(root);
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['install'], { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code !== 0) {
        return reject();
      }

      resolve();
    });
  });
}

function createServiceReadmeContent(appName, oldContent) {
  const scripts = [
    {
      script: 'npm start',
      description: 'Starts the development server. Open [http://localhost:3003/](http://localhost:3003/) to view it in the browser.',
    },
    {
      script: 'npm run build',
      description: 'Bundles the app into static files for production.',
    },
  ];

  return [
    `# ${appName}`,
    '',
    '## Usage',
    '',
    '### Install project dependencies',
    '',
    '```',
    'npm install',
    '```',
    '',
    scripts
      .map((script) => [
        `### ${script.description}`,
        '',
        '```',
        `${script.script}`,
        '```',
        '',
      ].join(os.EOL))
      .join(os.EOL),
    '### Customize configuration',
    'See [Configuration Reference](https://github.com/nicolaszhao/hammal/blob/master/packages/cli-service/README.md).',
    oldContent ? ['', oldContent].join(os.EOL) : '',
  ].join(os.EOL);
}

function generateReadme(root, appName, hasService) {
  const readmePath = path.join(root, 'README.md');
  const readmeExists = fs.existsSync(readmePath);
  let readmeContent;

  if (readmeExists) {
    readmeContent = fs.readFileSync(readmePath);
    if (hasService) {
      readmeContent = createServiceReadmeContent(appName, readmeContent);
    } else {
      readmeContent = handlebars.compile(readmeContent.toString())({
        title: appName,
      });
    }
  } else if (hasService) {
    readmeContent = createServiceReadmeContent(appName);
  } else {
    readmeContent = `# ${appName}${os.EOL}`;
  }

  fs.writeFileSync(
    path.join(readmePath),
    readmeContent,
  );
}

function findTemplateConfig(name) {
  const all = getAllTemplates();
  return all[name];
}

function getAuthor() {
  let name = '';
  try {
    name = execSync('git config --get user.name')
      .toString()
      .trim();
  } catch (e) {
    // ignore
  }
  return name;
}

module.exports = async (name) => {
  const root = path.resolve(name);
  const projectName = path.basename(root);

  checkProjectName(projectName);
  checkProjectConflicts(name);

  console.log();
  console.log(chalk.bold.blue(`Hammal v${pkg.version}`));

  const spinner = ora();
  const { template, eslint } = await getAnswers();
  const {
    url,
    custom = false,
    hasService = false,
    isLibrary = false,
  } = findTemplateConfig(template);

  spinner.start('Downloading template...');

  const repositoryUrl = custom ? `direct:${url}` : url;

  try {
    await util.promisify(downloadGitRepo)(repositoryUrl, name, { clone: custom });
    spinner.succeed();
  } catch (err) {
    spinner.fail(chalk.red('Template download failed.'));
    console.error(err);
    process.exit(1);
  }

  console.log(`✨  Creating project in ${chalk.green(root)}.`);

  let appPackage = require(path.join(root, 'package.json'));

  appPackage = {
    ...appPackage,
    name: projectName,
    version: '0.1.0',
    private: true,
    browserslist: defaultBrowsers,
  };

  if (isLibrary) {
    delete appPackage.private;
    appPackage.author = getAuthor();
  }

  if (!eslint) {
    try {
      // 移除 eslint、lint-staged(git commit 验证时使用的) 相关的配置文件
      const files = await util.promisify(glob)('{.eslint*,.lint?(-)staged*}', { cwd: root });
      await Promise.all(
        files.map((file) => fs.remove(path.resolve(root, file))),
      );
    } catch (err) {
      // ignore
    }

    // 移除 eslint、lint-staged 在 package.json 中的配置
    delete appPackage.eslintConfig;
    delete appPackage['lint-staged'];
    delete appPackage.husky;

    // 移除 eslint 的依赖包：插件、共享配置等
    Object.keys(appPackage.devDependencies).forEach((deps) => {
      if (/eslint/.test(deps)) {
        delete appPackage.devDependencies[deps];
      }
    });

    // 移除 lint-staged 的依赖包
    delete appPackage.devDependencies['lint-staged'];
    delete appPackage.devDependencies.husky;
  }

  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL,
  );

  console.log('📦  Installing project dependencies...');
  await install(root);

  console.log();
  console.log('📄  Generating README.md...');
  generateReadme(root, projectName, hasService);
  console.log();

  console.log(`🎉  Successfully created project ${chalk.yellow(projectName)}.`);

  if (hasService) {
    console.log('👉  Get started with the following commands:');
    console.log();
    console.log(chalk.cyan(`  ${chalk.gray('$')} cd ${name}`));
    console.log(chalk.cyan(`  ${chalk.gray('$')} npm start`));
  }

  console.log();
};
