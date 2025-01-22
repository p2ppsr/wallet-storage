import type { Config } from 'jest'
//import { defaults } from 'jest-config'

export default async (): Promise<Config> => {
  //console.log(defaults)
  return {
    bail: 0,
    verbose: true,
    // default is '.'
    rootDir: '.',
    // Must include source and test folders: default is ['<rootDir>']
    roots: ['<rootDir>'],
    // Speed up by restricting to module (source files) extensions used.
    moduleFileExtensions: ['ts', 'js'],
    // excluded source files...
    modulePathIgnorePatterns: ['out/src', 'out/test'],
    // Default is 'node'
    testEnvironment: 'node',
    // default [ '**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)' ]
    testMatch: ['**/?(*.)+(test).[tj]s', '**/__test/**/*.test.ts'],
    // default []
    testRegex: [],
    transform: { '^.+\\.ts$': ['ts-jest', { rootDir: '.' }] },
    reporters: ['default', ['jest-simple-summary', { summary: true, colors: true }]],
    // Add coverage collection
    collectCoverage: true, // Enable coverage collection
    coverageDirectory: 'coverage', // Output directory for coverage reports
    coverageReporters: ['html', 'text', 'lcov'], // Include HTML for index.html and text for console output
    collectCoverageFrom: [
      '<rootDir>/src/**/*.{ts,js}', // Include all source files
      '!<rootDir>/node_modules/**', // Exclude dependencies
      '!<rootDir>/src/**/*.d.ts' // Exclude type declaration files
    ]
  }
}
