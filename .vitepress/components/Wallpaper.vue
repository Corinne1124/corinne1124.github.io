<template>
  <div v-if="visible" class="wallpaper" :style="style" aria-hidden="true"></div>
</template>

<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

/**
 * 全局图片壁纸。
 *
 * - 默认全站生效，由 theme/Layout 的 layout-top 插槽挂载；
 * - 任意页面可用 frontmatter 关闭或更换图片：
 *     wallpaper: false            // 该页不显示壁纸
 *     wallpaperImage: /xx.png     // 该页换一张图
 */
const DEFAULT_IMAGE = '/backgrounds/MissingHalloween.png'

const { frontmatter } = useData()

const visible = computed(() => frontmatter.value.wallpaper !== false)

const src = computed(() => {
  const custom = frontmatter.value.wallpaperImage
  const raw = typeof custom === 'string' && custom ? custom : DEFAULT_IMAGE
  return `${import.meta.env.BASE_URL}${raw.replace(/^\//, '')}`
})

const style = computed(() => ({ backgroundImage: `url('${src.value}')` }))
</script>

<style scoped>
.wallpaper {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

/* 壁纸与文字之间的遮罩。
   方向随主题相反：
   - 浅色模式正文是深色，必须把画面整体提亮才读得清，所以用白色淡罩；
     若这里用暗罩，背景越暗、深色文字越糊。
   - 深色模式正文是浅色，用更重的暗罩压住照片。
   两者的顶栏毛玻璃都依赖这一层：浅色提亮后顶栏才够亮，深色压暗后文字才够跳。 */
.wallpaper::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.5);
}

.dark .wallpaper::before {
  background: rgba(0, 0, 0, 0.72);
}

/* 移动端避免大图滚动时抖动 */
@media (max-width: 768px) {
  .wallpaper {
    background-attachment: scroll;
  }
}
</style>
