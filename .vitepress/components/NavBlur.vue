<script>
import { watchEffect } from 'vue'
import { inBrowser, useData } from 'vitepress'

/* ==================================================================
   顶栏毛玻璃的模糊度（px）。

   优先级：当前页 frontmatter 的 navBlur  >  下面按页面类型给的默认值
   用法：在任意 .md 的 frontmatter 里写

     ---
     navBlur: 24
     ---

   数字按 px 处理，写 '24px' 也认。

   实现说明：用行内样式写到 <html> 上。
   行内样式优先级高于任何非 !important 的样式表规则，
   所以它能压过 custom.css 里 :root 的兜底值 —— 前提是别的地方
   不要再把 --vp-nav-backdrop-filter 定义到更具体的元素上。
================================================================== */
const BLUR = {
  home: 10, // 首页：背景是终端动画，模糊轻一点，文字更清晰
  page: 18 // 其他页：背景是照片壁纸，模糊重一点更柔和
}

const SATURATE = 'saturate(180%)'

function resolve(raw, fallback) {
  const n = typeof raw === 'string' ? parseFloat(raw) : raw
  return Number.isFinite(n) ? n : fallback
}

export default {
  name: 'NavBlur',
  setup() {
    const { frontmatter, page } = useData()

    watchEffect(() => {
      if (!inBrowser) return
      const fallback =
        page.value.relativePath === 'index.md' ? BLUR.home : BLUR.page
      const px = resolve(frontmatter.value.navBlur, fallback)
      document.documentElement.style.setProperty(
        '--vp-nav-backdrop-filter',
        `${SATURATE} blur(${px}px)`
      )
    })

    return () => null
  }
}
</script>
