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

/* 代码块：不横向滚动，长行折行，左侧显示行号。
   VitePress 在窄屏（<640px）给代码块 margin: 1rem -1.5rem，是为了让它贴到
   「内边距 1.5rem 的正文容器」边缘；但这里外面是卡片、内边距只有 1.15rem，
   负边距会戳出卡片边界。统一收回来，并补上圆角让它在卡片里是个完整方块。 */
:deep(.vp-doc) div[class*='language-'] {
  margin-left: 0;
  margin-right: 0;
  border-radius: 0.5rem;
}

/* 1. 折行：长行自动换行，不产生横向滚动条 */
:deep(.vp-doc) div[class*='language-'],
:deep(.vp-doc) div[class*='language-'] pre {
  overflow-x: hidden;
}

:deep(.vp-doc) div[class*='language-'] pre,
:deep(.vp-doc) div[class*='language-'] code {
  white-space: pre-wrap;
  /* 长标识符／URL 这类没有空格的串也要能断开 */
  overflow-wrap: break-word;
}

/* 2. 行号：用 CSS 计数器，每个 .line 前面画一个数字。
      注意 .line 是行内元素（行与行之间靠源码里的换行符断开），
      改成 block 会因为那些换行符多出一倍空行，所以这里必须保持行内。
      做法是把代码的左侧内边距当成槽位，再用负 margin 把行号拉进槽里：
        宽度 1.5rem + 右间距 0.5rem - 左负边距 2rem = 0
      整体推进量正好为零，于是代码正文和折行后的文字都从槽位右缘开始对齐。 */
:deep(.vp-doc) div[class*='language-'] code {
  counter-reset: vp-code-line;
  padding-left: 2.75rem;
}

:deep(.vp-doc) div[class*='language-'] .line {
  counter-increment: vp-code-line;
}

/* 若某个代码块自己开了 VitePress 的 :line-numbers，就不要再叠一层 */
:deep(.vp-doc) div[class*='language-']:not(.line-numbers-mode) .line::before {
  content: counter(vp-code-line);
  display: inline-block;
  width: 1.5rem;
  margin-left: -2rem;
  margin-right: 0.5rem;
  text-align: right;
  color: var(--vp-c-text-3);
  opacity: 0.55;
  /* 复制代码时不要把行号也复制进去 */
  user-select: none;
  -webkit-user-select: none;
}

@media (max-width: 768px) {
  .article {
    padding: 1.25rem 1.15rem 1.5rem;
    border-radius: 12px;
  }
}
</style>
