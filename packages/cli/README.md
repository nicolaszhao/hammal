# @hammal/cli

## Install

```shell
npm install -g @hammal/cli
```

## Usage

```
Usage: hammal <command>

Options:
  -v, --version                              output the version number
  -h, --help                                 output usage information

Commands:
  create <project-name>                      generate a new project from a template
  list|ls                                    list available templates
  add <template> <repository> [description]  add one custom template
  del <template>                             delete one custom template
```

## Templates

```
pure --------- nicolaszhao/pure-boilerplate
react -------- nicolaszhao/react-boilerplate
react-spa ---- nicolaszhao/react-spa-boilerplate
react-app ---- nicolaszhao/react-app-boilerplate
vue-app ------ nicolaszhao/vue-app-boilerplate
library ------ nicolaszhao/library-boilerplate
react-library  nicolaszhao/react-library-boilerplate
```

You can add custom templates locally.

## @hammal/cli-service projects

`pure`, `react`, `react-spa`, `react-app`.

## browserslist

All projects will set [browserslist](https://github.com/browserslist/browserslist) config in `package.json`:

```
{
  ...
  "browserslist": {
    "production": [
      "> 1%",
      "last 2 versions"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

## ESLint

All templates have ESLint, you can remove ESLint by terminal inquirer.

## License

[MIT](https://github.com/nicolaszhao/hammal/blob/master/LICENSE) © [nicolaszhao](https://github.com/nicolaszhao)
