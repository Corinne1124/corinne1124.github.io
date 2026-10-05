<template>
  <div class="blog-layout">
    <aside class="blog-layout__aside">
      <ArticleList />
    </aside>

    <div class="blog-layout__main">
      <ArticlePanel />
    </div>
  </div>
</template>

<script setup>
import ArticleList from './ArticleList.vue'
import ArticlePanel from './ArticlePanel.vue'

/**
 * 文章页布局：左侧文章列表 + 右侧正文。
 *
 * 这个组件通过 theme/index.ts 全局注册为 BlogLayout，
 * 内容页的 frontmatter 里 layout 会被 config.mts 的 transformPageData
 * 自动设成 'BlogLayout'，所以新增 .md 不需要手动写这个字段。
 */
</script>

<style scoped>
.blog-layout {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 4rem;
}

.blog-layout__aside {
  position: sticky;
  flex: 0 0 232px;
  top: calc(var(--vp-nav-height) + 1.5rem);
  max-height: calc(100vh - var(--vp-nav-height) - 3rem);
  overflow-y: auto;
}

.blog-layout__main {
  flex: 1 1 auto;
  min-width: 0;
}

@media (max-width: 900px) {
  .blog-layout {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 1rem 3rem;
  }

  .blog-layout__aside {
    position: static;
    flex: none;
    width: 100%;
    max-height: none;
  }
}
</style>
