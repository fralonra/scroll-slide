import { terser } from 'rollup-plugin-terser'
import filesize from 'rollup-plugin-filesize'

export default [{
  input: 'src/index.js',
  plugins: [filesize()],
  output: {
    file: 'dist/scroll-slide.js',
    format: 'umd',
    name: 'Scroll'
  }
}, {
  input: 'src/index.js',
  plugins: [terser(), filesize()],
  output: {
    file: 'dist/scroll-slide.min.js',
    format: 'umd',
    name: 'Scroll'
  }
}]
