/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  "testMatch": [
    "**/*.steps.js",
    "**/*.test.ts"
  ],
};
