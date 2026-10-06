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
    app.component('BlogLayout', BlogLayout)

    app.provide('Profile', {
      avatar: 'https://avatars.githubusercontent.com/u/321801735',
      name: 'Corinne1124',
      bio: '想成为程序员的某某',
      // 文字链接
      links: [],
      // 图标链接（图标内置在ProfileMenu.vue的 ICONS 里）
      socials: [
        { icon: 'github', link: 'https://github.com/corinne1124', label: 'GitHub' },
        { icon: 'bilibili', link: 'https://space.bilibili.com/1240864447', label: 'Bilibili' },
        { icon: 'steam', link: 'https://steamcommunity.com/id/corinne1124/', label: 'Steam' }
      ]
    })
  }
} satisfies Theme
