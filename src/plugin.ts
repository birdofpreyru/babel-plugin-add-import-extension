import { existsSync, lstatSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';

import type { PluginObject, PluginPass } from '@babel/core';

import {
  exportAllDeclaration,
  exportNamedDeclaration,
  importDeclaration,
  importExpression,
  stringLiteral,
} from '@babel/types';

type OptionsT = {
  extension?: string;
  observedScriptExtensions?: string[];
  replace?: boolean;
};

function getOptions(state: PluginPass<OptionsT>): Required<OptionsT> {
  return {
    extension: state.opts.extension ?? 'js',
    observedScriptExtensions: state.opts.observedScriptExtensions
      ?? ['js', 'json', 'ts', 'jsx', 'tsx', 'mjs', 'cjs'],
    replace: false,
  };
}

function isActiveExtension(
  path: string,
  observedScriptExtensions: string[],
): boolean {
  return observedScriptExtensions.includes(extname(path).replace(/[^a-z]/, ''));
}

function isNodeModule(path: string): boolean {
  if (path.startsWith('.') || path.startsWith('/')) {
    return false;
  }

  try {
    require.resolve(path);
    return true;
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'MODULE_NOT_FOUND') {
      return false;
    }

    throw e;
  }
}

function keepPath(path: string, ops: Required<OptionsT>): boolean {
  return !path.startsWith('.')
    || isNodeModule(path)
    || (
      ops.replace && (isActiveExtension(path, ops.observedScriptExtensions) || extname(path) === `.${ops.extension}`)
        ? extname(path) === `.${ops.extension}`
        : !!extname(path).length
          && (isActiveExtension(path, ops.observedScriptExtensions) || extname(path) === `.${ops.extension}`)
    );
}

function makePath(
  path: string,
  filename: string | undefined,
  ops: Required<OptionsT>,
): string {
  if (filename === undefined) throw Error('Missing filename');

  const dirPath = resolve(dirname(filename), path);

  const hasModuleExt = extname(path).length
    && isActiveExtension(path, ops.observedScriptExtensions);

  const newModuleName = hasModuleExt
    ? path.slice(0, -extname(path).length) : path;

  if (existsSync(dirPath) && lstatSync(dirPath).isDirectory()) {
    return `${path}${newModuleName.endsWith('/') ? '' : '/'}index.${ops.extension}`;
  }

  return `${newModuleName}.${ops.extension}`;
}

export default function plugin(): PluginObject<PluginPass<OptionsT>> {
  return {
    name: 'add-import-extension',
    visitor: {
      ExportAllDeclaration(path, state) {
        const exportPath = path.node.source.value;
        const ops = getOptions(state);
        if (path.node.exportKind !== 'type' && !keepPath(exportPath, ops)) {
          path.replaceWith(
            exportAllDeclaration(
              stringLiteral(
                makePath(exportPath, state.file.opts.filename, ops),
              ),
            ),
          );
        }
      },
      ExportNamedDeclaration(path, state) {
        const exportPath = path.node.source?.value;
        const ops = getOptions(state);
        if (
          exportPath !== undefined
          && path.node.exportKind !== 'type'
          && !keepPath(exportPath, ops)
        ) {
          path.replaceWith(
            exportNamedDeclaration(
              path.node.declaration,
              path.node.specifiers,
              stringLiteral(
                makePath(exportPath, state.file.opts.filename, ops),
              ),
            ),
          );
        }
      },
      ImportDeclaration(path, state) {
        const importPath = path.node.source.value;
        const ops = getOptions(state);
        if (
          path.node.importKind !== 'type'
          && !keepPath(importPath, ops)
        ) {
          path.replaceWith(
            importDeclaration(
              path.node.specifiers,
              stringLiteral(
                makePath(importPath, state.file.opts.filename, ops),
              ),
            ),
          );
        }
      },
      ImportExpression(path, state) {
        const { source } = path.node;
        if (source.type === 'StringLiteral') {
          const importPath = source.value;
          const ops = getOptions(state);
          if (!keepPath(importPath, ops)) {
            path.replaceWith(
              importExpression(
                stringLiteral(
                  makePath(importPath, state.file.opts.filename, ops),
                ),
                path.node.options,
              ),
            );
          }
        }
      },
    },
  };
}
