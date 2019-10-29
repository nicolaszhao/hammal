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
pure-mpa ---------------- nicolaszhao/pure-mpa-boilerplate
react-mpa --------------- nicolaszhao/react-mpa-boilerplate
react-spa --------------- nicolaszhao/react-spa-boilerplate
react-redux-spa --------- nicolaszhao/react-redux-spa-boilerplate
vue-spa ----------------- nicolaszhao/vue-spa-boilerplate
library ----------------- nicolaszhao/library-boilerplate
react-components-library  nicolaszhao/react-components-library-boilerplate
```

You can add custom templates locally.

## @hammal/cli-service project

`pure-mpa`, `react-mpa`, `react-spa`, `react-redux-spa`.

## browserslist

All projects will set [browserslist](https://github.com/browserslist/browserslist) config in `package.json`:

```
{
  ...
  "browserslist": {
    "production": [
      "> 1%",
      "last 5 versions",
      "ie 11"
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

All projects have ESLint, you can remove ESLint by terminal inquirer.
