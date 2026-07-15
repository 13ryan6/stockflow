const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEach: ['<rootDir>/jest.setup.js'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'cobertura', 'html', 'lcov'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // ajusta si tu alias es distinto
  },
}

module.exports = createJestConfig(customJestConfig)