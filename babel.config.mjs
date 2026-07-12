export default {
  presets: [
    '@babel/env',
    ['@babel/typescript', { onlyRemoveTypeImports: true }],
  ],
  targets: 'maintained node versions',
};
