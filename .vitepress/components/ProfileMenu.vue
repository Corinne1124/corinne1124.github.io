<template>
  <div
    ref="rootEl"
    class="profile"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <button
      class="profile__trigger"
      type="button"
      :aria-expanded="open"
      aria-haspopup="true"
      :aria-label="`${profile.name} 的个人信息`"
      @click="toggle"
    >
      <img
        v-if="showImage"
        class="profile__avatar"
        :src="avatarSrc"
        :alt="profile.name"
        referrerpolicy="no-referrer"
        @error="imgFailed = true"
      />
      <span v-else class="profile__avatar profile__avatar--fallback">{{ initial }}</span>
    </button>

    <transition name="profile-fade">
      <div
        v-if="open"
        ref="panelEl"
        class="profile__panel"
        :style="{ '--panel-shift': `${shift}px` }"
      >
        <p class="profile__name">{{ profile.name }}</p>
        <p class="profile__bio">{{ profile.bio }}</p>

        <ul v-if="links.length" class="profile__links">
          <li v-for="item in links" :key="item.link">
            <a
              class="profile__link"
              :href="item.link"
              :target="item.external ? '_blank' : undefined"
              :rel="item.external ? 'noreferrer' : undefined"
              @click="close"
            >
              {{ item.text }}
            </a>
          </li>
        </ul>

        <ul v-if="socials.length" class="profile__socials">
          <li v-for="item in socials" :key="item.link">
            <a
              class="profile__social"
              :href="item.link"
              target="_blank"
              rel="noreferrer"
              :aria-label="item.label"
              :title="item.label"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path :d="ICONS[item.icon]" fill="currentColor" />
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, inject } from 'vue'
import { useRoute } from 'vitepress'
/* 内置图标，24x24 viewBox，用 currentColor 跟随文字颜色。
   不依赖 VitePress 内部组件，升级主题不会失效。
   新增图标在这里加一条，键名即可用于资料配置里的 socials。 */
const ICONS = {
  github:
    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  bilibili:
    'M17.813 4.653h.854q2.266.08 3.773 1.574Q23.946 7.72 24 9.987v7.36q-.054 2.266-1.56 3.773c-1.506 1.507-2.262 1.524-3.773 1.56H5.333q-2.266-.054-3.773-1.56C.053 19.614.036 18.858 0 17.347v-7.36q.054-2.267 1.56-3.76t3.773-1.574h.774l-1.174-1.12a1.23 1.23 0 0 1-.373-.906q0-.534.373-.907l.027-.027q.4-.373.92-.373t.92.373L9.653 4.44q.107.106.187.213h4.267a.8.8 0 0 1 .16-.213l2.853-2.747q.4-.373.92-.373c.347 0 .662.151.929.4s.391.551.391.907q0 .532-.373.906zM5.333 7.24q-1.12.027-1.88.773q-.76.748-.786 1.894v7.52q.026 1.146.786 1.893t1.88.773h13.334q1.12-.026 1.88-.773t.786-1.893v-7.52q-.026-1.147-.786-1.894t-1.88-.773zM8 11.107q.56 0 .933.373q.375.374.4.96v1.173q-.025.586-.4.96q-.373.375-.933.374c-.56-.001-.684-.125-.933-.374q-.375-.373-.4-.96V12.44q0-.56.386-.947q.387-.386.947-.386m8 0q.56 0 .933.373q.375.374.4.96v1.173q-.025.586-.4.96q-.373.375-.933.374c-.56-.001-.684-.125-.933-.374q-.375-.373-.4-.96V12.44q.025-.586.4-.96q.373-.373.933-.373',
  steam:
    'M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658a3.4 3.4 0 0 1 1.912-.59q.094.001.188.006l2.861-4.142V8.91a4.53 4.53 0 0 1 4.524-4.524c2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911l.004.159a3.39 3.39 0 0 1-3.39 3.396a3.41 3.41 0 0 1-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0M7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25a2.551 2.551 0 0 0 3.337-3.324a2.547 2.547 0 0 0-3.255-1.413l1.523.63a1.878 1.878 0 0 1-1.445 3.467zm11.415-9.303a3.02 3.02 0 0 0-3.015-3.015a3.015 3.015 0 1 0 3.015 3.015m-5.273-.005a2.264 2.264 0 1 1 4.531 0a2.267 2.267 0 0 1-2.266 2.265a2.264 2.264 0 0 1-2.265-2.265'
}

/* ==================================================================
   资料数据**不在这里改** —— 在 .vitepress/theme/index.ts 的
   app.provide('Profile', { ... }) 里，这里只负责读取和渲染。
   avatar 支持完整外链（https://...）或 public/ 下的本地路径（/avatar.png）。
   留空时显示首字母圆形占位；填了地址但加载失败也会自动退化成占位，不会出现碎图。
================================================================== */
const FALLBACK = { avatar: '', name: '', bio: '', links: [], socials: [] }
const provided = inject('Profile', FALLBACK) || FALLBACK

/* 与默认值合并：即使只配了 name/bio，也不会因为缺 links/socials 而整块崩掉 */
const profile = {
  ...FALLBACK,
  ...provided,
  links: provided.links || [],
  socials: provided.socials || []
}

const links = profile.links

/* 过滤掉 ICONS 里不存在的图标名。
   否则 :d 会是 undefined，Vue 直接省略该属性，SVG 渲染成空白且不报任何错，很难排查。 */
const socials = profile.socials.filter((item) => {
  const known = !!ICONS[item.icon]
  if (!known && import.meta.env.DEV) {
    console.warn(
      `[ProfileMenu] socials 里的图标名 "${item.icon}" 不在 ICONS 中，已跳过。可用：${Object.keys(ICONS).join('、')}`
    )
  }
  return known
})

const rootEl = ref(null)
const panelEl = ref(null)
const open = ref(false)
const pinned = ref(false)
const imgFailed = ref(false)

/* 面板水平居中的修正量。
   头像左移后，通常有足够空间严格居中（shift = 0）；
   窄屏放不下时把右缘夹到视口边界，保证不会被裁掉。 */
const shift = ref(0)
const EDGE = 12

function updateShift() {
  const root = rootEl.value
  const panel = panelEl.value
  if (!root || !panel || !panel.offsetWidth) return
  const r = root.getBoundingClientRect()
  const w = panel.offsetWidth
  const centerX = r.left + r.width / 2
  const naturalLeft = centerX - w / 2
  const maxLeft = window.innerWidth - EDGE - w
  const clamped = Math.min(Math.max(naturalLeft, EDGE), Math.max(maxLeft, EDGE))
  shift.value = Math.round(clamped - naturalLeft)
}

const initial = computed(() => (profile.name.trim().charAt(0) || '?').toUpperCase())

// 填了地址且没加载失败才用图片，否则显示首字母占位
const showImage = computed(() => !!profile.avatar && !imgFailed.value)

const avatarSrc = computed(() => {
  const raw = profile.avatar
  if (!raw) return ''
  // 外链原样使用，本地路径拼上 base
  if (/^(https?:)?\/\//.test(raw)) return raw
  return `${import.meta.env.BASE_URL}${raw.replace(/^\//, '')}`
})

let closeTimer = null

function show() {
  clearTimeout(closeTimer)
  open.value = true
  // nextTick 在浏览器绘制前完成，先算好偏移再显示，避免看到跳动
  nextTick(updateShift)
}

function onEnter() {
  show()
}

function onLeave() {
  // 点击固定打开时不随鼠标移出关闭
  if (pinned.value) return
  clearTimeout(closeTimer)
  closeTimer = setTimeout(() => {
    open.value = false
  }, 120)
}

function toggle() {
  if (pinned.value) {
    pinned.value = false
    open.value = false
  } else {
    pinned.value = true
    show()
  }
}

function close() {
  pinned.value = false
  open.value = false
}

function onDocPointerDown(e) {
  if (rootEl.value && !rootEl.value.contains(e.target)) close()
}

function onKeydown(e) {
  if (e.key === 'Escape') close()
}

function onResize() {
  if (open.value) updateShift()
}

const route = useRoute()
watch(() => route.path, close)

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  clearTimeout(closeTimer)
  document.removeEventListener('pointerdown', onDocPointerDown)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.profile {
  position: relative;
  display: flex;
  align-items: center;
  height: var(--vp-nav-height);
  margin-left: 0.75rem;
}

/* 头像左移，给小框腾出水平居中的空间 */
@media (min-width: 768px) {
  .profile {
    margin-right: 60px;
  }
}

/* 头像居中在顶栏内。
   z-index 高于面板，这样面板浮现时是从头像背后滑出来的，
   不会被面板盖住下半截。 */
.profile__trigger {
  position: relative;
  z-index: 41;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.profile__avatar {
  display: block;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  /* 固定不随主题变化。
     之前用 var(--vp-c-divider) 且底色是 var(--vp-c-bg-alt)：
     两者都随主题变，而边框又是半透明的，会在它自己的底色上叠出
     「浅色模式近白、深色模式深灰」两种截然不同的圆环，
     看起来就像头像大小不一致。
     现在边框改为不透明纯白（两种模式渲染色完全相同），
     再配一圈极淡的暗色描边，保证在浅色背景上也有明确边缘。 */
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.22);
  background-color: transparent;
  transition: border-color 0.25s ease,
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.25s ease;
}

/* 悬停或展开时头像稍微变大 */
.profile__trigger:hover .profile__avatar,
.profile__trigger[aria-expanded='true'] .profile__avatar {
  border-color: var(--vp-c-brand-1);
  transform: scale(1.12);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.22), 0 0 0 4px var(--vp-c-brand-soft);
}

/* 图片缺失时的首字母占位 */
.profile__avatar--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  font-weight: 600;
  color: #fff;
  border-color: transparent;
  background: linear-gradient(120deg, #bd34fe, #41d1ff);
  user-select: none;
}

/* 下拉详情卡片：毛玻璃。
   底色取自主题的 --vp-c-bg-elv 再降到八成不透明，
   这样在首页（该变量被改成深色）也能正确跟随。
   顶边落在头像中线略偏下，因此会压住顶栏下半部 —— 这是刻意的。
   水平居中于头像（left:50%），再用 --panel-shift 夹取到视口内。 */
.profile__panel {
  position: absolute;
  top: calc(50% + 12px);
  left: 50%;
  z-index: 40;
  width: 220px;
  padding: 0.9rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background-color: color-mix(in srgb, var(--vp-c-bg-elv) 80%, transparent);
  /* 模糊参数与顶栏共用同一个变量，改 NavBlur.vue 里的值两边一起变 */
  -webkit-backdrop-filter: var(--vp-nav-backdrop-filter);
  backdrop-filter: var(--vp-nav-backdrop-filter);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  white-space: normal;
  text-align: center;
  transform: translateX(calc(-50% + var(--panel-shift, 0px)));
  transform-origin: top center;
}

.dark .profile__panel {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55);
}

.profile__name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--vp-c-text-1);
}

.profile__bio {
  margin: 0.25rem 0 0;
  font-size: 0.78rem;
  line-height: 1.45;
  color: var(--vp-c-text-2);
}

.profile__links {
  margin: 0.75rem 0 0;
  padding: 0.7rem 0 0;
  list-style: none;
  border-top: 1px solid var(--vp-c-divider);
}

.profile__link {
  display: block;
  padding: 0.4rem 0.55rem;
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}

.profile__link:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-default-soft);
}

/* 图标链接一行 */
.profile__socials {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  margin: 0.75rem 0 0;
  padding: 0.7rem 0 0;
  list-style: none;
  border-top: 1px solid var(--vp-c-divider);
}

.profile__social {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  color: var(--vp-c-text-2);
  transition: background-color 0.2s, color 0.2s;
}

.profile__social:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-default-soft);
}

/* 面板浮现：只有淡入，不做位移。
   注意 enter-from 里不要写 transform —— 面板的水平居中
   （translateX(-50% + --panel-shift)）就挂在 transform 上，
   写进去会把居中冲掉。 */
.profile-fade-enter-active {
  transition: opacity 0.22s ease;
}

.profile-fade-leave-active {
  transition: opacity 0.16s ease;
}

.profile-fade-enter-from,
.profile-fade-leave-to {
  opacity: 0;
}
</style>
