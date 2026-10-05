import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "content",

  // GitHub Pages 的项目站点地址是 https://<用户名>.github.io/<仓库名>/，
  // 资源路径必须带 /<仓库名>/ 前缀，否则全站静态资源 404。
  // 部署工作流会注入 DOCS_BASE，本地开发不注入，所以本地是根路径。
  base: process.env.DOCS_BASE || '/',

  // 去掉网址里的 .html 后缀（/about.html → /about）。
  // 产物里仍然是 about.html，只是链接不再带后缀，
  // 需要托管平台支持「请求 /about 时返回 about.html」——
  // GitHub Pages 原生支持，本地 dev 也支持。
  cleanUrls: true,

  vite: {
    // 用 import.meta.url 推导路径，而不是 CJS 的 __dirname：
    // 后者不被 Vite 的 configLoader: 'native' 支持（将来会变成默认）。
    publicDir: fileURLToPath(new URL('../public', import.meta.url))
  },

  title: 'Corinne的个人博客',
  description: `"走吧，还有很多事没干呢~"`,

  // 内容页统一套用左右两栏布局（左文章列表 + 右正文）。
  // 首页自己带 layout: page，404 不是文章页，都不动；
  // 页面若已自行指定 layout 也尊重原设置。
  transformPageData(pageData) {
    if (pageData.relativePath === '404.md') return
    if (!pageData.frontmatter.layout) {
      pageData.frontmatter.layout = 'BlogLayout'
    }
  },

  // 背景终端动画所需的两款字体
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&display=swap'
      }
    ]
  ],

  themeConfig: {
    siteTitle: "Corinne1124's Blog",
    logo: '/logo.png',

    nav: [
      { text: '首页', link: '/' },
      {
        text: '文章',
        items: [
          { text: '教程', link: '/coding/vitepress-guide' }
        ]
      },
      { text: '关于', link: '/about' }
    ],

    search: {
      provider: 'local'
    }
  }
})
