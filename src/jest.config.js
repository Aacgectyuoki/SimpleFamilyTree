module.exports = {
    transform: {
      "^.+\\.(js|jsx|ts|tsx)$": "babel-jest", // Use babel-jest to transform modern JS
    },
    transformIgnorePatterns: [
      "/node_modules/(?!(d3-|react-d3-tree)/)", // Include all d3 modules and react-d3-tree
    ],
    moduleNameMapper: {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy", // Optional: Handle CSS imports
    },
    testEnvironment: "jsdom", // Ensure Jest uses a browser-like environment
  };
  