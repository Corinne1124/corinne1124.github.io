import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'

// GitHub Pages 的项目站点地址是 https://<用户名>.github.io/<仓库名>/，
// 资源路径必须带 /<仓库名>/ 前缀，否则全站静态资源 404。
// 部署工作流会注入 DOCS_BASE，本地开发不注入，所以本地是根路径。
// 归一成以 / 结尾，方便下面 head 里手动拼接。
const rawBase = process.env.DOCS_BASE || '/'
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "content",

  base,

  // 去掉网址里的 .html 后缀（/about.html → /about）。
  cleanUrls: true,

  vite: {
    // 用 import.meta.url 推导路径
    publicDir: fileURLToPath(new URL('../public', import.meta.url))
  },

  title: 'Corinne的个人博客',
  description: `真的会有人看嘛？`,

  // 内容页统一套用左右两栏布局（左文章列表 + 右正文）。
  // 首页自己带 layout: page，404 不是文章页，都不动；
  // 页面若已自行指定 layout 也尊重原设置。
  transformPageData(pageData) {
    if (pageData.relativePath === '404.md') return
    if (!pageData.frontmatter.layout) {
      pageData.frontmatter.layout = 'BlogLayout'
    }
  },

  head: [
    // 网站图标（浏览器标签页那个）。由 public/logo.png 缩出来的 32x32，
    // 原图 51KB，这份只有 2KB。
    // 注意：head 里的地址 VitePress 不会自动加 base 前缀，必须自己拼 ——
    // 否则部署到 GitHub Pages 的子路径后 favicon 会 404。
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${base}favicon.png` }],
    // iOS 添加到主屏幕时用的图标
    ['link', { rel: 'apple-touch-icon', href: `${base}apple-touch-icon.png` }],
    // 背景终端动画所需的两款字体
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
