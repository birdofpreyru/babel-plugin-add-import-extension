export default {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
  ],
  coverageDirectory: '__coverage__',
  extensionsToTreatAsEsm: ['.ts'],
  modulePathIgnorePatterns: ['<rootDir>/build/'],
  testMatch: ['**/__tests__/**/*.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  transform: {
    '\\.(j|t)s$': 'babel-jest',
  },
};
