// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import IndexBox from '../components/IndexBox.vue'
import Wallpaper from '../components/Wallpaper.vue'
import ProfileMenu from '../components/ProfileMenu.vue'
import NavBlur from '../components/NavBlur.vue'
import BlogLayout from '../components/BlogLayout.vue'
import './style.css'
import './custom.css'


export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // 全局图片壁纸；首页在 frontmatter 里用 wallpaper: false 关闭
      // NavBlur 不渲染内容，只负责把 frontmatter 的 navBlur 同步成 CSS 变量
      'layout-top': () => [h(Wallpaper), h(NavBlur)],
      // 顶栏右上角的圆形头像 + 下拉详情
      'nav-bar-content-after': () => h(ProfileMenu)
    })
  },
  enhanceApp({ app, router, siteData }) {
    app.component('IndexBox', IndexBox)
    // 文章页布局：左侧文件树 + 右侧正文。
    // config.mts 的 transformPageData 会把内容页的 layout 设成这个组件名。
    app.component('BlogLayout', BlogLayout)
  }
} satisfies Theme
