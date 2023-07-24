import babel from "@rollup/plugin-babel"
import resolve from '@rollup/plugin-node-resolve';

const config = {
  input: "src/index.js",
  output: {
    file: "lib/index.js",
    format: "cjs"
  },
  plugins: [babel({ babelHelpers: 'bundled' }), resolve()]
}

export default config