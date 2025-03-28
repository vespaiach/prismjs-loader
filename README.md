## prismjs-loader

If you want to quickly highlight code syntax on your web pages without reading through the PrismJS documentation for integration, this is the solution for you. Here’s the script link:

```html
<script src="https://cdn.jsdelivr.net/gh/vespaiach/prismjs-loader@v1.0.0/dist/prismjs-loader.js"
    integrity="sha384-WxJ7af4egxjXGSl/0ldvVBiaBVhKXo3vu3qHG/Av4ZnfNVSJuX8d0Kgn5m7cFlI/"
    crossorigin="anonymous" defer>
</script>
```

Note: Place it at the end of your <body> tag.

## What it does

This script automatically downloads the following:

- PrismJS core package
- Autoloader plugin package
- Default Prism theme file

Once all resources are loaded, the autoloader plugin determines which language grammar packages should be fetched next.

All requests occur after the page finishes rendering, so your page’s SEO score remains unaffected.

## Theme options

If you want to load themes other than the default, you can specify them in the class attribute of the script tag.

```html
<!-- Load the prism-coy theme in dark mode; otherwise, load the prism-funky theme -->
<script src="https://cdn.jsdelivr.net/gh/vespaiach/prismjs-loader@v1.0.0/dist/prismjs-loader.js"
    integrity="sha384-WxJ7af4egxjXGSl/0ldvVBiaBVhKXo3vu3qHG/Av4ZnfNVSJuX8d0Kgn5m7cFlI/"
    crossorigin="anonymous" defer
    class="dark:prism-coy prism-funky">
</script>
```

Note: Use prefix `dark:` or `light:` to load themes based on the browser's prefers-color-scheme

Available Prism Themes:
- prism (default)
- prism-coy
- prism-dark
- prism-funky
- prism-okaidia
- prism-solarizedlight
- prism-tomorrow
- prism-twilight

## References

- [PrismJS](https://github.com/PrismJS/prism)