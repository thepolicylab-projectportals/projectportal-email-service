import babel from "@rollup/plugin-babel"

const config = {
  input: "src/index.js",
  output: {
    file: "lib/index.js",
    format: "cjs"
  },
  plugins: [babel({ babelHelpers: 'bundled' })]
}

export default config