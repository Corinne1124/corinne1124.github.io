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

        <ul v-if="profile.links.length" class="profile__links">
          <li v-for="item in profile.links" :key="item.link">
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

        <ul v-if="profile.socials.length" class="profile__socials">
          <li v-for="item in profile.socials" :key="item.link">
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

/* ==================================================================
   改这里即可。
   avatar 支持完整外链（https://...）或 public/ 下的本地路径（/avatar.png）。
   留空时显示首字母圆形占位；填了地址但加载失败也会自动退化成占位，
   不会出现碎图。
================================================================== */
const profile = {
  avatar: 'https://avatars.githubusercontent.com/u/321801735',
  name: 'Corinne',
  bio: '记录学习、思考与生活',
  // 文字链接
  links: [],
  // 图标链接（图标内置在下面的 ICONS 里）
  socials: [
    { icon: 'github', link: 'https://github.com/corinne1124', label: 'GitHub' }
  ]
}

/* 内置图标，24x24 viewBox，用 currentColor 跟随文字颜色。
   不依赖 VitePress 内部组件，升级主题不会失效。 */
const ICONS = {
  github:
    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
}

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
