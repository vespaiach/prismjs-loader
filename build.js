const esbuild = require('esbuild')

esbuild
  .build({
    entryPoints: ['prismjs-loader.js'],
    outfile: `dist/prismjs-loader.js`,
    bundle: true,
    platform: 'browser',
    minify: true,
    sourcemap: true,
    target: ['es2020', 'chrome58', 'edge58', 'firefox58', 'safari13']
  })
  .then(() => {
    console.log(`Build completed: prismjs-loader.js`)
  })
  .catch(() => process.exit(1))
