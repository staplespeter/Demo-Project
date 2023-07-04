require('dotenv').config({ path: 'config/.env' });

module.exports = {
    verbose: true,
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    testMatch: [
        "<rootDir>/src/**/*.steps.js",
        "<rootDir>/src/**/*.test.ts"
    ],
    modulePathIgnorePatterns: [
        '<rootDir>/build/',
        '<rootDir>/dist/'
    ],
    testTimeout: 600000,
    globals: {
        jest_mysqlConfig: {
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT),
            user: process.env.MYSQL_TEST_USER,
            password: process.env.MYSQL_TEST_PASSWORD,
            schema: process.env.MYSQL_SCHEMA
        }
    }
};