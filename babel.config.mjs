export default {
  plugins: [
    ['babel-plugin-transform-import-meta', { module: 'ES6' }],
  ],
  presets: [
    '@babel/env',
    ['@babel/typescript', { onlyRemoveTypeImports: true }],
  ],
  targets: 'maintained node versions',
};
