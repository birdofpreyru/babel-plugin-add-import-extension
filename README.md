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
to better adopt the plugin for [my][birdofpreyru] needs and taste.

[![Sponsor](.README/sponsor.svg)](https://github.com/sponsors/birdofpreyru)

### [Contributors](https://github.com/birdofpreyru/babel-plugin-add-import-extension/graphs/contributors)

[<img width=36 src="https://avatars.githubusercontent.com/u/20144632?s=36" />](https://github.com/birdofpreyru)

## Content
- [Getting Started](#getting-started)
- [Options](#options)

## Getting Started

Install the plugin:
```sh
npm install --save-dev @dr.pogodin/babel-plugin-add-import-extension
```

Add it to `plugins` array of your [Babel] configuration:
```js
// With default options.
plugins: ['@dr.pogodin/add-import-extension']

// With custom options.
plugins: [['@dr.pogodin/add-import-extension', {
  extension: 'mjs',
}]]
```

Here is the detailed description of what this plugin does:

1.  It acts on import (export) specifiers in all import (export) declarations
    and expressions in the code being transformed.

2.  It does not update [non-relative specifiers] that can be resolved by
    [import.meta.resolve()], or start with `#` symbol ([TypeScript stuff](https://www.typescriptlang.org/docs/handbook/modules/reference.html#packagejson-imports-and-self-name-imports)).

3.  If the code being transformed is associated with a specific file,
    it attempts to resolve the specifier path relative to that file being
    transformed.

    a.  If it resolves to a directory, the specifier path is appended by
        `index.extension` (or `/index.extension`, if the specifier path does not
        include the trailing `/` already), where `extension` is the value of
        the [extension] setting (`js` by default), and the processing of this
        import (export) ends.

    b.  If it resolves to a file, its actual extension is determined by
        [extname()].

    c.  If it cannot be resolved, the result of [extname()] call on this
        specifier is checked against the [virtualExtensions] array, and if
        it is present there, it is treated as the path's extensions, otherwise
        we assume the path has no extension.

4.  a.  If the specifier path has no extension determined at this point,
        [extension] is appended to it.

    b.  Otherwise, the path extension is checked against [replacements] map
        (first), and [replaceExtensions] array (second), if any check matches
        the extension, it is replaced by the custom substitution from
        [replacements], or by [extension] otherwise.

    c.  If no path modification happened prior to this point, the path is left
        as it is.

## Options

### extension

Optional **string**, defaults `js`.

The extension to add to import (export) specifiers, without leading dot.

### replaceExtensions

Optional **string[]**, defaults `[]`.

Array of extensions, without leading dots. When a specifier path has
and extension included into this array, it will be replaced by [extension].

### replacements

Optional **Record&lt;string, string&gt;**, defaults `{}`.

A map of custom extension replacements to perform, _e.g._ with this option set
```ts
{ svg: 'svg.js' }
```
an import specifier `./image.svg` will be transformed into `./image.svg.js`,
provided that `svg` was detected as its extension (either because the path
was successfully resolved to a real file, or because it was included into
[virtualExtensions] array).

### virtualExtensions

Optional **string[]**, defaults `[]`.

Array of extensions, without leading dots. When a specifier path does not
resolve to any object on the disk, but ends with an extension (as defined by
[extname()]) included into this array, it is treated as the specifier's path
extension.

[Babel]: https://babeljs.io
[Babel v8]: https://babeljs.io/blog/2026/06/16/8.0.0
[babel-plugin-add-import-extension]: https://www.npmjs.com/package/babel-plugin-add-import-extension
[birdofpreyru]: https://github.com/birdofpreyru
[extension]: #extension
[extname()]: https://nodejs.org/api/path.html#pathextnamepath
[import.meta.resolve()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta/resolve
[non-relative specifiers]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#module_specifier_resolution
[replaceExtensions]: #replaceextensions
[replacements]: #replacements
[virtualExtensions]: #virtualextensions
