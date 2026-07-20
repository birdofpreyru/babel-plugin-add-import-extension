# Babel Plugin Add Import Extension

[![Latest NPM Release](https://img.shields.io/npm/v/@dr.pogodin/babel-plugin-add-import-extension.svg)](https://www.npmjs.com/package/@dr.pogodin/babel-plugin-add-import-extension)
[![NPM Downloads](https://img.shields.io/npm/dm/@dr.pogodin/babel-plugin-add-import-extension.svg)](https://www.npmjs.com/package/@dr.pogodin/babel-plugin-add-import-extension)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/birdofpreyru/babel-plugin-add-import-extension/tree/master.svg?style=shield)](https://app.circleci.com/pipelines/github/birdofpreyru/babel-plugin-add-import-extension)
[![GitHub Repo stars](https://img.shields.io/github/stars/birdofpreyru/babel-plugin-add-import-extension?style=social)](https://github.com/birdofpreyru/babel-plugin-add-import-extension)
[![Dr. Pogodin Studio](.README/logo-dr-pogodin-studio.svg)](https://dr.pogodin.studio/docs/babel-plugin-add-import-extension)

This plugin adds (and/or replaces) extensions of import and export declarations,
which helps to transform a codebase using extensionless imports (alike CommonJS-,
bundler-like module resolution) to fully ECMAScript (ES) compliant modules with
[mandatory file extensions](https://nodejs.org/docs/latest/api/esm.html#mandatory-file-extensions).

It started as a fork of the original [babel-plugin-add-import-extension] (which
looks non-maintained since 2021). It was de-spaghettified, upgraded to the latest
[Babel v8], and migrated to TypeScript; and as of its v2.0.0 it worked just
the same as the original library. Subsequent versions got a handful of changes,
to better serve the plugin purpose stated above.

[![Sponsor](.README/sponsor.svg)](https://github.com/sponsors/birdofpreyru)

### [Contributors](https://github.com/birdofpreyru/babel-plugin-add-import-extension/graphs/contributors)

[<img width=36 src="https://avatars.githubusercontent.com/u/20144632?s=36" />](https://github.com/birdofpreyru)

## How to install:

**BEWARE**: **TODO**: _Documentation below is inherited from the original plugin, it should be re-written, to better cover exact behavior of the plugin, and available options. It will be done, once I am happy with the plugin features, and consider it stable._

```sh
# using npm
npm install --save-dev @dr.pogodin/babel-plugin-add-import-extension
# usin yarn
yarn add -D babel-plugin-add-import-extension
```

Add to your `plugins` on your babel config file:

```js
plugins: ["@dr.pogodin/add-import-extension"]; // defaults to .js extension
```

Is possible to set the extension when you set the plugin:

```js
plugins: [
  ["@dr.pogodin/add-import-extension", { extension: "jsx" }], // will add jsx extension
];
```

You can also replace existing extensions with the one you want

```js
plugins: [
  ["@dr.pogodin/add-import-extension", { extension: "jsx", replace: true }], // will replace the "observedScriptExtensions" [see below] to jsx
];
```

**NOTE**: Without `replace` flag set, the `observedScriptExtensions` array
effectively specifies recognized extensions to which nothing more should be
added (and with that `replace` flag these recognized extensions are replaced
by the target one).

To be able to handle file with a *.* in the filename (e.g *component.style.ts*) the plugin is configured
to only handle a certain set of file extensions. If needed you can adjust the default of `['js', 'json', 'ts', 'jsx', 'tsx', 'mjs', 'cjs']`
by changing the `observedScriptExtensions` option

```js
plugins: [
  ["@dr.pogodin/add-import-extension", { extension: "jsx", replace: true, observedScriptExtensions: ['js','ts','jsx','tsx', 'mjs', 'cjs'] }], // will add jsx extension
];
```

## Let's the transformation begin :)

A module import without extension:

```js
import { add, double } from "./lib/numbers";
```

will be converted to:

```js
import { add, double } from "./lib/numbers.js";
```

A module export without extension:

```js
export { add, double } from "./lib/numbers";
```

will be converted to:

```js
export { add, double } from "./lib/numbers.js";
```

If you add the `replace:true` option, extensions will be overwritten like so

```js
import { add, double } from "./lib/numbers.ts";
```

will be converted to:

```js
import { add, double } from "./lib/numbers.js";
```

and

```js
export { add, double } from "./lib/numbers.ts";
```

will be converted to:

```js
export { add, double } from "./lib/numbers.js";
```

What this plugin does is to check all imported modules and if your module is not on `node_module` it will consider that is a project/local module and add the choosed extension, so for node modules it don't add any extension.

[Babel v8]: https://babeljs.io/blog/2026/06/16/8.0.0
[babel-plugin-add-import-extension]: https://www.npmjs.com/package/babel-plugin-add-import-extension
