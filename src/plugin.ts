import { existsSync, lstatSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';

import type { PluginObject, PluginPass } from '@babel/core';

import {
  callExpression,
  exportAllDeclaration,
  exportNamedDeclaration,
  importDeclaration,
  importExpression,
  stringLiteral,
} from '@babel/types';

export type OptionsT = {
  extension?: string;
  replaceExtensions?: string[];
  replacements?: Record<string, string>;
  virtualExtensions?: string[];
};

function getOptions(state: PluginPass<OptionsT>): Required<OptionsT> {
  return {
    extension: state.opts.extension ?? 'js',
    replaceExtensions: state.opts.replaceExtensions ?? [],
    replacements: state.opts.replacements ?? {},
    virtualExtensions: state.opts.virtualExtensions ?? [],
  };
}

function isNodeModule(path: string): boolean {
  if (path.startsWith('.') || path.startsWith('/')) {
    return false;
  }

  try {
    import.meta.resolve(path);
    return true;
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'MODULE_NOT_FOUND') {
      return false;
    }

    throw e;
  }
}

function transform(
  path: string,
  state: PluginPass<OptionsT>,
  ops: Required<OptionsT>,
): string {
  // Specifiers starting with # are resolved by TypeScript through the imports
  // field of the nearest ancestor package.json; they should not be modified.
  if (isNodeModule(path) || path.startsWith('#')) return path;

  const absPath = state.filename
    ? resolve(dirname(state.filename), path)
    : resolve(path);

  if (existsSync(absPath) && lstatSync(absPath).isDirectory()) {
    let res = path;
    if (!res.endsWith('/')) res += '/';
    res += `index.${ops.extension}`;
    return res;
  }

  let ext: string | undefined;

  // If `path` points to an existing file system object, we can reliably get
  // its extension.
  if (existsSync(absPath)) ext = extname(absPath);

  // Otherwise (this is the legacy logic) we consider as the extension
  // the result of extname(absPath), provided it is contained in
  // the ops.observedScriptExtensions array.
  else {
    const e = extname(absPath);
    if (e && (ops.virtualExtensions.includes(e.slice(1))
      || e === `.${ops.extension}`
    )) ext = e;
  }

  if (ext === `.${ops.extension}`) return path;

  if (ext && ops.replacements[ext.slice(1)]) {
    return `${path.slice(0, -ext.length)}.${ops.replacements[ext.slice(1)]}`;
  }

  if (ext && !ops.replaceExtensions.includes(ext.slice(1))) return path;

  let res = ext ? path.slice(0, -ext.length) : path;
  res += `.${ops.extension}`;

  return res;
}

export default function plugin(): PluginObject<PluginPass<OptionsT>> {
  return {
    name: 'add-import-extension',
    visitor: {
      CallExpression(path, state) {
        const { node } = path;
        if (node.callee.type === 'Import') {
          const [arg] = node.arguments;
          if (arg?.type === 'StringLiteral') {
            const exportPath = arg.value;
            const ops = getOptions(state);

            const newPath = transform(exportPath, state, ops);

            if (newPath !== exportPath) {
              path.replaceWith(
                callExpression(
                  node.callee,
                  [
                    stringLiteral(newPath),
                    ...node.arguments.slice(1),
                  ],
                ),
              );
            }
          }
        }
      },
      ExportAllDeclaration(path, state) {
        const exportPath = path.node.source.value;
        const ops = getOptions(state);
        if (path.node.exportKind !== 'type') {
          const newPath = transform(exportPath, state, ops);
          if (newPath !== exportPath) {
            path.replaceWith(
              exportAllDeclaration(stringLiteral(newPath)),
            );
          }
        }
      },
      ExportNamedDeclaration(path, state) {
        const exportPath = path.node.source?.value;
        const ops = getOptions(state);
        if (
          exportPath !== undefined
          && path.node.exportKind !== 'type'
        ) {
          const newPath = transform(exportPath, state, ops);
          if (newPath !== exportPath) {
            path.replaceWith(
              exportNamedDeclaration(
                path.node.declaration,
                path.node.specifiers,
                stringLiteral(newPath),
              ),
            );
          }
        }
      },
      ImportDeclaration(path, state) {
        const importPath = path.node.source.value;
        const ops = getOptions(state);
        if (
          path.node.importKind !== 'type'
        ) {
          const newPath = transform(importPath, state, ops);
          if (newPath !== importPath) {
            path.replaceWith(
              importDeclaration(
                path.node.specifiers,
                stringLiteral(newPath),
              ),
            );
          }
        }
      },
      ImportExpression(path, state) {
        const { source } = path.node;
        if (source.type === 'StringLiteral') {
          const importPath = source.value;
          const ops = getOptions(state);
          const newPath = transform(importPath, state, ops);
          if (newPath !== importPath) {
            path.replaceWith(
              importExpression(
                stringLiteral(newPath),
                path.node.options,
              ),
            );
          }
        }
      },
    },
  };
}
