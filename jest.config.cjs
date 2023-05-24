module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  "testMatch": [
    "**/*.steps.js",
    "**/*.test.ts"
  ],
  modulePathIgnorePatterns: ['/mnt/Data/Repos/Demo-Project/build/']
};
