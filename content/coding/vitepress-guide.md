---
title: VitePress 踩坑记录
layer: page
---

# VitePress 踩坑记录

记录一下这个站点从零搭起来的过程中踩到的坑，都建站了总得写点什么吧（

## 路由问题

前期还是按照一般项目来写路由的， `/CBlog/` 是原本设想的路由，简单写完文章树跑测试，然后屎山代码发力：全404。  
看了一下网址发现是base问题，`createContentLoader` 的 `url` 来自 `srcDir` ，直接调用了文件位置，而VitePress只会给 nav、logo 这类配置项自动加前缀。解决：

```js
const base = import.meta.env.BASE_URL || '/'
const withBase = (url) => `${base.replace(/\/$/, '')}${url}`
```
（当然是补上了，拿到base拼上去，搞半天还要自己拼）

## 改顶栏背景没反应

 `.VPNavBar { background-color: ... }` 完全无效，然后看了一圈现有效果的实现，发现顶栏背景其实画在伪元素 `.VPNavBar::before` 上，而且组件自带的规则带 scoped 属性（`.VPNavBar[data-v-xxx]::before`），优先级高于普通类选择器。 `!importamt` 提优先级解决。

```css
.VPNavBar::before {
  left: 12px !important;
  right: 12px !important;
  border-radius: 0 0 14px 14px;
}
```
先用px硬编了，移动端适配下次一定。

##  JS动态创建的元素无法用 `<style scoped>` 

用 `document.createElement` 做一些效果，然后发现样式用不了。scoped 样式靠编译时给元素加 `data-v-xxx` 属性来匹配，运行时创建的元素上没有这个属性。只能绕开了。不要加 `scoped` ，改用统一前缀把作用域限定住，避免污染主题的通用类名。

```css
.web-bg .line { ... }
.web-bg .cursor { ... }
```

注意像 `.line`、`.cursor`、`.error` 这种名字 VitePress 自己也用，不加前缀必然打架。

`fade-in`、`pulse`、`blink` 这种通用名字的动画总是不是期望的样子，还反过来影响别处。`@keyframes` 不参与 scoped 隔离，全局同名即冲突，还是加前缀解决。

## 过渡里的 transform

小卡片面板（鼠标悬停头像那个）弹出瞬间跳到偏左的位置，落定后又回到中间，看了下代码，水平居中靠 `transform: translateX(-50%)`，而入场状态 `enter-from` 里又写了一次 `transform: translateY(...)` ，天。`transform` 是整体覆盖而不是叠加，就用 `opacity` 了。

## 本地开发，重新构建后 CSS/JS 返回 404

开发时重新构建，页面样式时有时无，F12检查， CSS/JS 全是 404，文件有产出，仔细核对了下文件名，style.\*.css，\*的位置对不上。
查了一圈资料，预览用的静态服务器在启动时就缓存了目录索引。重新构建后资源文件名带上了新的内容哈希（\*部分），所以要关了命令行重开。
