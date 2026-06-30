const modulesToTransform = [
  '@babel',
  'babel-plugin-polyfill-corejs3',
  'import-meta-resolve',
  'js-tokens',
  'obug',
];

export default {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
  ],
  coverageDirectory: '__coverage__',
  modulePathIgnorePatterns: ['<rootDir>/build/'],
  testMatch: ['**/__tests__/**/*.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  transform: {
    '\\.(m?j|t)s$': 'babel-jest',
  },
  transformIgnorePatterns: [
    `/node_modules/(?!${modulesToTransform.join('|')})`,
  ],
};
