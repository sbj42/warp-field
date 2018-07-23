module.exports = {
    collectCoverage: true,
    coverageDirectory: "coverage",
    globals: {
      "ts-jest": {
        "tsConfigFile": "tsconfig.json"
      }
    },
    moduleFileExtensions: [
      "ts",
      "tsx",
      "js"
    ],
    testEnvironment: "node",
    testMatch: [
      "**/test/**/*.+(ts|tsx|js)"
    ],
    transform: {
      "^.+\\.(ts|tsx)$": "ts-jest"
    },
  };
  