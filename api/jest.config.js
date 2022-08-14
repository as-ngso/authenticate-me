/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/tests/factories/',
    '<rootDir>/tests/utils/',
  ],
};
