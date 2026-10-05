import { createContentLoader } from 'vitepress'

/**
 * 把页面 url 还原成相对 srcDir 的文件路径：
 *   /                  → index.md
 *   /posts/hello.html  → posts/hello.md
 *   /posts/            → posts/index.md
 * 因为 .html 后缀是可选的，cleanUrls 开或不开都能还原。
 */
function toFilePath(url) {
  let p = String(url || '')
    .replace(/^\//, '')
    .replace(/\.html?$/i, '')
  if (p === '') p = 'index'
  else if (p.endsWith('/')) p += 'index'
  return p + '.md'
}

/**
 * 文件树的数据源：构建时扫描 content/ 下所有 .md。
 * 新建文章后重新构建就会自动出现，不需要维护任何列表。
 */
export default createContentLoader('**/*.md', {
  transform(raw) {
    return raw
      .map((item) => {
        const path = toFilePath(item.url)
        const fm = item.frontmatter || {}
        return {
          path,
          url: item.url,
          name: path.slice(path.lastIndexOf('/') + 1),
          title: typeof fm.title === 'string' ? fm.title : ''
        }
      })
      // 首页和 404 不是文章，不进文件树
      .filter((f) => f.path !== 'index.md' && f.path !== '404.md')
      .sort((a, b) => a.path.localeCompare(b.path))
  }
})
