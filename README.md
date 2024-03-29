# typescript-plugin-toml

[![npm version](https://badge.fury.io/js/typescript-plugin-toml.svg)](https://badge.fury.io/js/typescript-plugin-toml) ![automatic deploy](https://github.com/sapphi-red/typescript-plugin-toml/workflows/automatic%20deploy/badge.svg) [![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

A typescript language service plugin providing support for toml files.

![example](https://user-images.githubusercontent.com/49056869/102447633-b9598300-4073-11eb-97d3-7732881e6552.png)

## Usage

```shell
npm i -D typescript-plugin-toml # yarn add -D typescript-plugin-toml
```

And then add this to `tsconfig.json`.

```json
{
  "compilerOptions": {
    "plugins": [{ "name": "typescript-plugin-toml" }]
  }
}
```

If you're using VSCode, [switch to workspace version](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript).

## `.const.toml`

If the file name ends with `.const.toml`, the typings will become as if you are using `as const`.

For example it will be like below.

`test.toml` and `test.const.toml`

```toml
key = 'val'
```

`index.ts`

```ts
import test from './test.toml'
import testConst from './test.const.toml'

type Test = typeof test // { key: string }
type TestConst = typeof testConst // { readonly key: 'val' }
```
