import babel from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'
import filesize from 'rollup-plugin-filesize'

const babelOption = {
  presets: [['@babel/env', { modules: false }]]
}

export default [
  {
    input: 'src/index.js',
    plugins: [
      babel(babelOption),
      filesize()
    ],
    output: {
      file: 'dist/scroll-slide.js',
      format: 'umd',
      name: 'Scroll'
    }
  },
  {
    input: 'src/index.js',
    plugins: [
      babel(babelOption),
      terser(),
      filesize()
    ],
    output: {
      file: 'dist/scroll-slide.min.js',
      format: 'umd',
      name: 'Scroll'
    }
  }
]
