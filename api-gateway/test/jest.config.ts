import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../..',
  testRegex: 'api-gateway/test/.*\\.(spec|e2e-spec)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        diagnostics: false
      }
    ]
  },
  moduleNameMapper: {
    '^@parklink/common$': '<rootDir>/libs/common/src',
    '^@parklink/common/(.*)$': '<rootDir>/libs/common/src/$1'
  },
  testEnvironment: 'node'
};

export default config;
