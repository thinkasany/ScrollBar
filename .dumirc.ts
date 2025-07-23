import { defineConfig } from 'dumi';

const basePath = process.env.GH_PAGES ? '/ScrollBar/' : '/';
const publicPath = process.env.GH_PAGES ? '/ScrollBar/' : '/';

export default defineConfig({
  favicons: ['https://avatars0.githubusercontent.com/u/9441414?s=200&v=4'],
  themeConfig: {
    name: 'ScrollBar',
    logo: 'https://avatars0.githubusercontent.com/u/9441414?s=200&v=4',
  },
  outputPath: '.doc',
  exportStatic: {},
  base: basePath,
  publicPath,
});
