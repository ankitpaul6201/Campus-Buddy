import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

/**
 * Ensures dynamically injected CSS declarations (e.g. from Tailwind's pseudo-elements like `before:`/`after:`)
 * inherit the parent rule or root stylesheet's source file context.
 * This prevents Vite's UrlRewritePostcssPlugin from raising:
 * "A PostCSS plugin did not pass the `from` option to `postcss.parse`"
 */
const fixMissingSourcePlugin = () => ({
  postcssPlugin: 'postcss-fix-missing-source',
  Once(root) {
    root.walkDecls((decl) => {
      if (!decl.source?.input?.file) {
        decl.source = decl.parent?.source || root.source;
      }
    });
  }
});
fixMissingSourcePlugin.postcss = true;

export default {
  plugins: [
    tailwindcss(),
    autoprefixer(),
    fixMissingSourcePlugin(),
  ],
};

