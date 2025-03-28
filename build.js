const esbuild = require('esbuild')
const { version } = require('./package.json')

esbuild
  .build({
    entryPoints: ['prismjs-loader.js'],
    outfile: `dist/prismjs-loader-${version}.js`,
    bundle: true,
    platform: 'browser',
    minify: true,
    sourcemap: true,
    target: ['es2020', 'chrome58', 'edge58', 'firefox58', 'safari13']
  })
  .then(() => {
    console.log(`Build completed: output-${version}.js`)
  })
  .catch(() => process.exit(1))
