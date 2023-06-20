module.exports = {
  verbose: true,
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  "testMatch": [
    "**/*.steps.js",
    "**/*.test.ts"
  ],
  modulePathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/dist/'],
  testTimeout: 600000
};
