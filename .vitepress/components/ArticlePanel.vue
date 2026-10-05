<template>
  <article class="article">
    <Content class="vp-doc" />
  </article>
</template>

<script setup>
/**
 * 右侧正文面板。
 *
 * 真正渲染文章的是 VitePress 全局注册的 <Content /> —— 它渲染当前页面的
 * Markdown。这里额外挂上 vp-doc 类，正文的排版样式（标题、列表、代码块等）
 * 全部来自 VitePress 自带的 .vp-doc 规则，所以不需要自己重写一套。
 */
</script>

<style scoped>
.article {
  min-width: 0;
  padding: 2rem 2.5rem 2.5rem;
  border-radius: 16px;
  background-color: var(--vp-c-bg);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.dark .article {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.42);
}

@media (max-width: 768px) {
  .article {
    padding: 1.25rem 1.15rem 1.5rem;
    border-radius: 12px;
  }
}
</style>
