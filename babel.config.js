module.exports = function(api) {
  api.cache(true)

  return {
    presets: ["@babel/preset-env"],
    plugins: [
      ["module-resolver", {
        root: ["./src"],
        alias: {
          "@tests": "./tests"
        }
      }]
    ]
  }
}