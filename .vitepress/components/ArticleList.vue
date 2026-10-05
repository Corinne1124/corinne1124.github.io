<template>
  <nav class="articles" aria-label="文章列表">
    <p class="articles__caption">文章列表</p>

    <p v-if="!rows.length" class="articles__empty">还没有文章</p>

    <ul v-else class="articles__list">
      <li v-for="row in rows" :key="row.key">
        <button
          v-if="row.type === 'dir'"
          class="articles__row articles__row--dir"
          type="button"
          :style="{ paddingLeft: `${8 + row.depth * 12}px` }"
          :aria-expanded="!row.collapsed"
          @click="toggle(row.path)"
        >
          <span
            class="articles__caret"
            :class="{ 'is-collapsed': row.collapsed }"
            aria-hidden="true"
          ></span>
          <span class="articles__name">{{ row.name }}</span>
          <span class="articles__count">{{ row.count }}</span>
        </button>

        <a
          v-else
          class="articles__row articles__row--file"
          :class="{ 'is-active': row.active }"
          :href="withBase(row.url)"
          :title="row.path"
          :style="{ paddingLeft: `${8 + row.depth * 12}px` }"
          :aria-current="row.active ? 'page' : undefined"
        >
          <span class="articles__name">{{ row.label }}</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vitepress'
import { data as files } from '../theme/files.data.mjs'

const route = useRoute()

/* 折叠的分组路径。用数组而不是 Set，是为了让 ref 能追踪变化 */
const collapsed = ref([])

function toggle(path) {
  const i = collapsed.value.indexOf(path)
  if (i >= 0) collapsed.value.splice(i, 1)
  else collapsed.value.push(path)
}

/* 当前路由：/posts/hello 与 /posts/hello.html 视为同一页 */
const normalize = (p) =>
  String(p || '')
    .replace(/\.html?$/i, '')
    .replace(/\/+$/, '') || '/'

/* createContentLoader 给出的 url 不含 base，这里补上。
   否则部署到 GitHub Pages 的项目站点（/<仓库名>/）时，
   列表链接会指向域名根目录而全部 404。 */
const base = import.meta.env.BASE_URL || '/'
const withBase = (url) => `${base.replace(/\/$/, '')}${url}`

const activePath = computed(() => normalize(route.path))

/* 显示用的名字：优先用 frontmatter 的 title，
   没有标题就退回文件名并去掉 .md 后缀。 */
const labelOf = (f) => f.title || f.name.replace(/\.md$/i, '')

function countFiles(node) {
  let n = node.files.length
  for (const dir of node.dirs.values()) n += countFiles(dir)
  return n
}

/* 把扁平的文章列表按目录分组，再按折叠状态压平成可直接渲染的行 */
const rows = computed(() => {
  const root = { dirs: new Map(), files: [] }
  for (const f of files) {
    const parts = f.path.split('/')
    let node = root
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node.dirs.has(parts[i])) {
        node.dirs.set(parts[i], { name: parts[i], dirs: new Map(), files: [] })
      }
      node = node.dirs.get(parts[i])
    }
    node.files.push(f)
  }

  const out = []
  const walk = (node, depth, prefix) => {
    const dirs = [...node.dirs.values()].sort((a, b) => a.name.localeCompare(b.name))
    const fs = node.files.slice().sort((a, b) => a.name.localeCompare(b.name))

    for (const dir of dirs) {
      const path = prefix ? `${prefix}/${dir.name}` : dir.name
      const isCollapsed = collapsed.value.includes(path)
      out.push({
        key: `d:${path}`,
        type: 'dir',
        name: dir.name,
        path,
        depth,
        collapsed: isCollapsed,
        count: countFiles(dir)
      })
      if (!isCollapsed) walk(dir, depth + 1, path)
    }

    for (const f of fs) {
      out.push({
        key: `f:${f.path}`,
        type: 'file',
        name: f.name,
        label: labelOf(f),
        path: f.path,
        url: f.url,
        depth,
        active: normalize(f.url) === activePath.value
      })
    }
  }
  walk(root, 0, '')
  return out
})
</script>

<style scoped>
.articles {
  padding: 0.85rem 0.6rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background-color: color-mix(in srgb, var(--vp-c-bg) 88%, transparent);
  -webkit-backdrop-filter: var(--vp-nav-backdrop-filter);
  backdrop-filter: var(--vp-nav-backdrop-filter);
}

.articles__caption {
  margin: 0 0 0.6rem;
  padding: 0 0.4rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
}

.articles__empty {
  margin: 0;
  padding: 0 0.4rem 0.3rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

.articles__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.articles__row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  padding: 0.34rem 0.4rem;
  border: 0;
  border-radius: 6px;
  font-size: 0.85rem;
  line-height: 1.45;
  text-align: left;
  text-decoration: none;
  color: var(--vp-c-text-2);
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.articles__row:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-default-soft);
}

.articles__row--file.is-active {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
  font-weight: 500;
}

.articles__row--dir .articles__name {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.articles__name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.articles__count {
  margin-left: auto;
  padding-left: 0.4rem;
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

/* 分组前的折叠箭头 */
.articles__caret {
  flex-shrink: 0;
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 5px solid var(--vp-c-text-3);
  transform: rotate(90deg);
  transition: transform 0.2s;
}

.articles__caret.is-collapsed {
  transform: rotate(0deg);
}
</style>
