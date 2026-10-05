<template>
  <div ref="rootEl" class="web-bg" aria-hidden="true">
    <div ref="containerEl" class="web-bg__container">
      <div ref="visualsEl" class="web-bg__visuals"></div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const rootEl = ref(null)
const containerEl = ref(null)
const visualsEl = ref(null)

/* ------------------------------------------------------------------
   计时器登记：组件卸载时统一清理，
   避免 VitePress 切换路由后动画仍在后台运行
------------------------------------------------------------------ */
const timers = new Set()

function later(fn, ms) {
  const id = setTimeout(() => {
    timers.delete(id)
    fn()
  }, ms)
  timers.add(id)
  return id
}

function every(fn, ms) {
  const id = setInterval(fn, ms)
  timers.add(id)
  return id
}

function stopTimer(id) {
  clearTimeout(id)
  clearInterval(id)
  timers.delete(id)
}

let rafId = 0
let startedAt = 0
let cursorIndex = 0
let stopped = false
let binaryTimer = 0

const elapsed = () => (performance.now() - startedAt) / 1000

function readVar(name) {
  if (!rootEl.value) return ''
  return getComputedStyle(rootEl.value).getPropertyValue(name).trim()
}

/* ------------------------------------------------------------------
   时间轴：与 index.html 保持一致
------------------------------------------------------------------ */
const timeline = [
  { time: 0.100, func: typeLine, args: { text: 'Switch on the power line', onComplete: showPowerLines } },
  { time: 1.740, func: typeLine, args: { text: 'Remember to put on' } },
  { time: 2.920, func: showEmphasis, args: { text: 'PROTECTION', onComplete: showProtectionShield } },
  { time: 3.873, func: typeLine, args: { text: 'Lay down your pieces' } },
  { time: 5.491, func: typeLine, args: { text: "And let's begin" } },
  { time: 6.380, func: showCodeSnippet },
  { time: 7.446, func: typeLine, args: { text: 'Fill in my data parameters' } },
  { time: 10.091, func: showProgressBar },
  { time: 11.095, func: typeLine, args: { text: 'Set up our new world' } },
  { time: 12.906, func: typeLine, args: { text: "And let's begin the" } },
  { time: 13.891, func: showEmphasis, args: { text: 'SIMULATION' } },

  // Interlude 1: Binary Rain
  { time: 16.000, func: startBinaryRain },
  { time: 29.000, func: stopBinaryRain },
  { time: 29.500, func: clearScreen },

  { time: 29.709, func: typeLine, args: { text: "If I'm a set of points", onComplete: drawPoints } },
  { time: 31.116, func: typeLine, args: { text: 'Then I will give you my' } },
  { time: 32.682, func: showEmphasis, args: { text: 'DIMENSION' } },
  { time: 33.412, func: typeLine, args: { text: "If I'm a circle", onComplete: drawCircle } },
  { time: 34.646, func: typeLine, args: { text: 'Then I will give you my' } },
  { time: 36.287, func: showEmphasis, args: { text: 'CIRCUMFERENCE' } },
  { time: 37.067, func: typeLine, args: { text: "If I'm a sine wave", onComplete: drawSineWave } },
  { time: 38.596, func: typeLine, args: { text: 'Then you can sit on all my' } },
  { time: 40.049, func: showEmphasis, args: { text: 'TANGENTS', onComplete: drawTangents } },
  { time: 40.706, func: typeLine, args: { text: 'If I approach infinity' } },
  { time: 42.346, func: typeLine, args: { text: 'Then you can be my', onComplete: drawLimitations } },
  { time: 43.507, func: showEmphasis, args: { text: 'LIMITATIONS' } },

  // Enhanced AC/DC section
  { time: 44.452, func: typeLine, args: { text: 'Switch my current' } },
  { time: 45.850, func: typeLine, args: { text: 'To AC, to DC', onComplete: currentSwitch } },
  { time: 47.672, func: typeLine, args: { text: 'And then blind my vision' } },
  { time: 49.534, func: blindVision },
  { time: 50.000, func: typeLine, args: { text: 'So dizzy, so dizzy' } },

  // Enhanced travel section
  { time: 51.363, func: typeLine, args: { text: 'Oh we can travel' } },
  { time: 53.225, func: typeLine, args: { text: 'To A.D to B.C', onComplete: timeTravel } },
  { time: 55.083, func: typeLine, args: { text: 'And we can unite' } },
  { time: 56.916, func: typeLine, args: { text: 'So deeply, so deeply', onComplete: uniteEffect } },

  { time: 58.000, func: clearScreen },

  { time: 59.223, func: typeLine, args: { text: 'If I can, If I can give you all the' } },
  { time: 61.958, func: showEmphasis, args: { text: 'STIMULATIONS' } },
  { time: 62.589, func: typeLine, args: { text: 'Then I can, Then I can be your only' } },
  { time: 65.397, func: showEmphasis, args: { text: 'SATISFACTION' } },
  { time: 66.601, func: typeLine, args: { text: 'If I can make you happy' } },
  { time: 68.252, func: typeLine, args: { text: 'I will run the' } },
  { time: 69.259, func: showEmphasis, args: { text: 'EXECUTION' } },
  { time: 70.084, func: typeLine, args: { text: 'Though we are trapped' } },
  { time: 71.764, func: typeLine, args: { text: 'In this strange strange' } },
  { time: 73.169, func: showEmphasis, args: { text: 'SIMULATION' } },

  // Enhanced eggplant/tomato/cat/god section
  { time: 74.045, func: clearScreenAndShapes },
  { time: 74.045, func: typeLine, args: { text: "If I'm an eggplant", onComplete: () => showEmoji('🍆') } },
  { time: 75.422, func: typeLine, args: { text: 'Then I will give you my' } },
  { time: 76.959, func: showEmphasis, args: { text: 'NUTRIENTS', onComplete: showNutrients } },
  { time: 77.576, func: typeLine, args: { text: "If I'm a tomato", onComplete: () => showEmoji('🍅') } },
  { time: 79.226, func: typeLine, args: { text: 'Then I will give you' } },
  { time: 80.620, func: showEmphasis, args: { text: 'ANTIOXIDANTS', onComplete: showMolecules } },
  { time: 81.351, func: typeLine, args: { text: "If I'm a tabby cat", onComplete: () => showEmoji('🐱') } },
  { time: 82.833, func: typeLine, args: { text: 'Then I will purr for your' } },
  { time: 84.268, func: showEmphasis, args: { text: 'ENJOYMENT', onComplete: showSoundWaves } },
  { time: 85.078, func: typeLine, args: { text: "If I'm the only god", onComplete: () => showEmoji('⚡') } },
  { time: 86.538, func: typeLine, args: { text: "Then you're the proof of my" } },
  { time: 87.922, func: showEmphasis, args: { text: 'EXISTENCE' } },

  // Enhanced gender/role switch section
  { time: 88.587, func: typeLine, args: { text: 'Switch my gender' } },
  { time: 90.197, func: typeLine, args: { text: 'To F, to M', onComplete: genderSwitch } },
  { time: 92.015, func: typeLine, args: { text: 'And then do whatever' } },
  { time: 93.953, func: typeLine, args: { text: 'From AM to PM', onComplete: showTimeDisplay } },
  { time: 95.465, func: typeLine, args: { text: 'Oh switch my role' } },
  { time: 97.739, func: typeLine, args: { text: 'To S, to M', onComplete: roleSwitch } },
  { time: 99.349, func: typeLine, args: { text: 'So we can enter' } },
  { time: 101.474, func: typeLine, args: { text: 'The trance, the trance', onComplete: enterTrance } },

  { time: 102.500, func: clearScreen },

  { time: 103.489, func: typeLine, args: { text: 'If I can, If I can feel your' } },
  { time: 106.293, func: showEmphasis, args: { text: 'VIBRATIONS', onComplete: rippleEffect } },
  { time: 107.220, func: typeLine, args: { text: 'Then I can, Then I can finally be' } },
  { time: 110.221, func: showEmphasis, args: { text: 'COMPLETION' } },

  { time: 110.900, func: clearScreen },
  { time: 110.900, func: typeLine, args: { text: 'Though you have left...' } },
  { time: 112.220, func: typeLine, args: { text: 'You have left...' } },
  { time: 113.100, func: typeLine, args: { text: 'You have left...' } },
  { time: 114.180, func: typeLine, args: { text: 'You have left...' } },
  { time: 114.920, func: typeLine, args: { text: 'You have left...' } },
  { time: 115.780, func: typeLine, args: { text: 'You have left me in' } },
  { time: 117.274, func: showIsolation },

  { time: 118.333, func: clearScreen },
  { time: 118.333, func: typeLine, args: { text: 'If I can, If I can erase all the pointless' } },
  { time: 120.860, func: showEmphasis, args: { text: 'FRAGMENTS' } },
  { time: 121.728, func: typeLine, args: { text: "Then maybe, Then maybe you won't leave me so" } },
  { time: 124.890, func: showEmphasis, args: { text: 'DISHEARTENED' } },

  { time: 125.708, func: clearScreen },
  { time: 125.708, func: addClass, args: { target: 'container', className: 'error screenShake', duration: 12000 } },
  { time: 125.708, func: typeLine, args: { text: 'Challenging your god...' } },
  { time: 128.661, func: typeLine, args: { text: 'You have made some' } },
  { time: 131.224, func: showEmphasis, args: { text: 'ILLEGAL ARGUMENTS' } },

  // Interlude 2: BSOD
  { time: 133.500, func: showBSOD },
  { time: 147.000, func: hideBSOD },

  // Extended EXECUTION spam from 147.660 to 158.000
  { time: 147.660, func: clearScreen },
  { time: 147.660, func: executionSpamExtended, args: { duration: 10340 } },

  { time: 158.900, func: showChaosText, args: { text: 'EIN' } },
  { time: 159.321, func: showChaosText, args: { text: 'DOS' } },
  { time: 159.657, func: showChaosText, args: { text: 'TROIS' } },
  { time: 160.244, func: showChaosText, args: { text: 'NE' } },
  { time: 160.693, func: showChaosText, args: { text: 'FEM' } },
  { time: 161.124, func: showChaosText, args: { text: 'LIU' } },
  { time: 161.584, func: showEmphasis, args: { text: 'EXECUTION' } },

  { time: 162.632, func: clearScreen },
  { time: 162.632, func: typeLine, args: { text: 'If I can, If I can give them all the' } },
  { time: 165.166, func: showEmphasis, args: { text: 'EXECUTION', className: 'error' } },
  { time: 166.016, func: typeLine, args: { text: 'Then I can, Then I can be your only' } },
  { time: 168.911, func: showEmphasis, args: { text: 'EXECUTION', className: 'error' } },
  { time: 169.824, func: typeLine, args: { text: 'If I can have you back' } },
  { time: 171.868, func: typeLine, args: { text: 'I will run the' } },
  { time: 172.712, func: showEmphasis, args: { text: 'EXECUTION', className: 'error' } },
  { time: 173.643, func: typeLine, args: { text: 'Though we are trapped... We are trapped ah-' } },

  { time: 177.246, func: clearScreen },
  { time: 177.246, func: typeLine, args: { text: "I've studied, I've studied how to properly" } },
  { time: 179.929, func: showEmphasis, args: { text: 'L O-O-O V E', className: 'love' } },
  { time: 180.857, func: typeLine, args: { text: 'Question me, question me, I can answer all' } },
  { time: 183.646, func: showEmphasis, args: { text: 'L O-O-O V E', className: 'love' } },
  { time: 184.540, func: typeLine, args: { text: 'I know the algebraic expression of' } },
  { time: 187.665, func: showEmphasis, args: { text: 'L O-O-O V E', className: 'love' } },

  { time: 188.483, func: clearScreen },
  { time: 188.483, func: typeLine, args: { text: 'Though you are free...', style: { opacity: 0.7 } } },
  { time: 189.746, func: typeLine, args: { text: 'I am trapped.', style: { fontSize: '1.5em' } } },
  { time: 190.801, func: typeLine, args: { text: 'Trapped in...' } },
  { time: 191.356, func: showTrappedInLove },

  { time: 205.811, func: clearScreen },
  { time: 205.811, func: finalExecution }
]

/* ------------------------------------------------------------------
   主循环
------------------------------------------------------------------ */
function tick() {
  if (stopped) return
  const t = elapsed()
  while (cursorIndex < timeline.length && t >= timeline[cursorIndex].time) {
    const event = timeline[cursorIndex]
    cursorIndex++
    event.func(event.args || {})
  }
  if (cursorIndex < timeline.length) {
    rafId = requestAnimationFrame(tick)
  }
}

/* ------------------------------------------------------------------
   自动开始：整条时间轴由单调时钟驱动，
   不依赖音频，也不需要任何用户交互
------------------------------------------------------------------ */
onMounted(() => {
  stopped = false
  cursorIndex = 0
  startedAt = performance.now()
  rafId = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  stopped = true
  cancelAnimationFrame(rafId)
  timers.forEach((id) => {
    clearTimeout(id)
    clearInterval(id)
  })
  timers.clear()
})

/* ------------------------------------------------------------------
   基础绘制
------------------------------------------------------------------ */
function typeLine({ text, className = '', style = {}, onComplete = null }) {
  const visuals = visualsEl.value
  if (!visuals) return
  const line = document.createElement('div')
  line.className = `line ${className}`
  Object.assign(line.style, style)
  line.innerHTML =
    '<span class="prompt">C:\\> </span><span class="text"></span><span class="cursor"></span>'
  visuals.appendChild(line)

  const textSpan = line.querySelector('.text')
  const cursor = line.querySelector('.cursor')
  let i = 0
  const typingInterval = every(() => {
    if (i < text.length) {
      textSpan.textContent += text.charAt(i)
      i++
      visuals.scrollTop = visuals.scrollHeight
    } else {
      stopTimer(typingInterval)
      cursor.remove()
      if (onComplete) onComplete()
    }
  }, 60)
}

function showEmphasis({ text, className = '', onComplete = null }) {
  const visuals = visualsEl.value
  if (!visuals) return
  const el = document.createElement('div')
  el.className = `emphasis ${className}`
  el.textContent = text
  visuals.appendChild(el)
  visuals.scrollTop = visuals.scrollHeight
  if (onComplete) onComplete()
}

function clearScreen() {
  if (visualsEl.value) visualsEl.value.innerHTML = ''
}

function clearShapes() {
  if (!rootEl.value) return
  rootEl.value
    .querySelectorAll(
      '.shape, .emoji-display, .gender-symbol, .time-display, .molecule, .sound-wave, .year-display, .unite-effect, .trance-overlay, .power-line, .protection-shield, .object-particle'
    )
    .forEach((el) => el.remove())
}

function clearScreenAndShapes() {
  clearScreen()
  clearShapes()
}

function addClass({ target, className, duration }) {
  const el = target === 'container' ? containerEl.value : target
  if (!el) return
  el.classList.add(...className.split(' '))
  later(() => el.classList.remove(...className.split(' ')), duration)
}

/* ------------------------------------------------------------------
   增强特效
------------------------------------------------------------------ */
function showPowerLines() {
  const container = containerEl.value
  if (!container) return
  for (let i = 0; i < 5; i++) {
    later(() => {
      const line = document.createElement('div')
      line.className = 'power-line'
      line.style.top = `${Math.random() * 100}%`
      line.style.left = '0'
      line.style.width = '100%'
      container.appendChild(line)
      later(() => line.remove(), 1000)
    }, i * 200)
  }
}

function showProtectionShield() {
  const container = containerEl.value
  if (!container) return
  const shield = document.createElement('div')
  shield.className = 'protection-shield'
  shield.style.left = '50%'
  shield.style.top = '50%'
  shield.style.transform = 'translate(-50%, -50%)'
  shield.style.width = '300px'
  shield.style.height = '300px'
  container.appendChild(shield)
  later(() => shield.remove(), 2000)
}

function currentSwitch() {
  addClass({ target: containerEl.value, className: 'ac-mode', duration: 500 })
  later(() => {
    addClass({ target: containerEl.value, className: 'dc-mode', duration: 500 })
  }, 500)
}

function blindVision() {
  addClass({ target: containerEl.value, className: 'blind dizzy', duration: 3000 })
}

function timeTravel() {
  const container = containerEl.value
  if (!container) return
  addClass({ target: container, className: 'time-travel', duration: 3000 })

  const years = ['2024 AD', '1000 AD', '500 BC', '1000 BC']
  years.forEach((year, i) => {
    later(() => {
      const yearEl = document.createElement('div')
      yearEl.className = 'year-display'
      yearEl.textContent = year
      yearEl.style.left = `${20 + i * 20}%`
      yearEl.style.top = `${30 + i * 10}%`
      container.appendChild(yearEl)
      later(() => yearEl.remove(), 1000)
    }, i * 300)
  })
}

function uniteEffect() {
  const container = containerEl.value
  if (!container) return
  for (let i = 0; i < 3; i++) {
    later(() => {
      const unite = document.createElement('div')
      unite.className = 'unite-effect'
      unite.style.left = `${30 + i * 20}%`
      unite.style.top = `${40 + i * 10}%`
      container.appendChild(unite)
      later(() => unite.remove(), 2000)
    }, i * 500)
  }
}

function showEmoji(emoji) {
  const container = containerEl.value
  if (!container) return
  const el = document.createElement('div')
  el.className = 'emoji-display'
  el.textContent = emoji
  el.style.left = `${Math.random() * 70 + 15}%`
  el.style.top = `${Math.random() * 60 + 20}%`
  container.appendChild(el)
  later(() => el.remove(), 2000)
}

function showNutrients() {
  const container = containerEl.value
  if (!container) return
  const nutrients = ['Vitamin C', 'Fiber', 'Potassium', 'Folate']
  nutrients.forEach((nutrient, i) => {
    later(() => {
      const el = document.createElement('div')
      el.className = 'emoji-display'
      el.style.fontSize = '1.5em'
      el.style.color = '#90EE90'
      el.textContent = nutrient
      el.style.left = `${20 + i * 15}%`
      el.style.top = `${25 + i * 8}%`
      container.appendChild(el)
      later(() => el.remove(), 2000)
    }, i * 200)
  })
}

function showMolecules() {
  const container = containerEl.value
  if (!container) return
  for (let i = 0; i < 8; i++) {
    later(() => {
      const molecule = document.createElement('div')
      molecule.className = 'molecule'
      molecule.style.left = `${Math.random() * 80 + 10}%`
      molecule.style.top = `${Math.random() * 70 + 15}%`
      container.appendChild(molecule)
      later(() => molecule.remove(), 3000)
    }, i * 100)
  }
}

function showSoundWaves() {
  const container = containerEl.value
  if (!container) return
  for (let i = 0; i < 6; i++) {
    later(() => {
      const wave = document.createElement('div')
      wave.className = 'sound-wave'
      wave.style.left = '30%'
      wave.style.top = `${40 + i * 5}%`
      container.appendChild(wave)
      later(() => wave.remove(), 1000)
    }, i * 150)
  }
}

function genderSwitch() {
  const container = containerEl.value
  if (!container) return
  const symbols = ['♀', '♂']
  symbols.forEach((symbol, i) => {
    later(() => {
      const el = document.createElement('div')
      el.className = 'gender-symbol'
      el.textContent = symbol
      el.style.left = `${40 + i * 20}%`
      el.style.top = '30%'
      el.style.color = i === 0 ? '#FF69B4' : '#4169E1'
      container.appendChild(el)
      later(() => el.remove(), 1500)
    }, i * 500)
  })
}

function showTimeDisplay() {
  const container = containerEl.value
  if (!container) return
  const times = ['AM 06:00', 'PM 18:00']
  times.forEach((time, i) => {
    later(() => {
      const el = document.createElement('div')
      el.className = 'time-display'
      el.textContent = time
      el.style.left = `${30 + i * 25}%`
      el.style.top = '40%'
      container.appendChild(el)
      later(() => el.remove(), 1500)
    }, i * 600)
  })
}

function roleSwitch() {
  const container = containerEl.value
  if (!container) return
  const roles = ['S', 'M']
  roles.forEach((role, i) => {
    later(() => {
      const el = document.createElement('div')
      el.className = 'gender-symbol'
      el.textContent = role
      el.style.left = `${35 + i * 30}%`
      el.style.top = '35%'
      el.style.color = i === 0 ? '#FF4444' : '#8A2BE2'
      container.appendChild(el)
      later(() => el.remove(), 1200)
    }, i * 400)
  })
}

function enterTrance() {
  const container = containerEl.value
  if (!container) return
  const trance = document.createElement('div')
  trance.className = 'trance-overlay'
  container.appendChild(trance)
  later(() => trance.remove(), 4000)
}

/* ------------------------------------------------------------------
   数字雨 / 代码片段 / 进度条
------------------------------------------------------------------ */
function startBinaryRain() {
  const container = containerEl.value
  if (!container) return
  const canvas = document.createElement('canvas')
  canvas.className = 'web-bg__binary'
  container.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const fontSize = 16
  const columns = canvas.width / fontSize
  const rainDrops = []
  for (let x = 0; x < columns; x++) rainDrops[x] = 1

  binaryTimer = every(() => {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = readVar('--text-color') || '#00ff41'
    ctx.font = fontSize + 'px monospace'
    for (let i = 0; i < rainDrops.length; i++) {
      const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length))
      ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize)
      if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        rainDrops[i] = 0
      }
      rainDrops[i]++
    }
  }, 33)
}

function stopBinaryRain() {
  stopTimer(binaryTimer)
  binaryTimer = 0
  const canvas = rootEl.value && rootEl.value.querySelector('.web-bg__binary')
  if (canvas) {
    canvas.style.transition = 'opacity 1s'
    canvas.style.opacity = '0'
    later(() => canvas.remove(), 1000)
  }
}

function showCodeSnippet() {
  const container = containerEl.value
  const visuals = visualsEl.value
  if (!container || !visuals) return
  const el = document.createElement('div')
  el.className = 'code-snippet'
  el.innerHTML = `> OBJECT CREATION...
<span class="token keyword">class</span> <span class="token class-name">Me</span> {
  <span class="token function">constructor</span>(<span class="token string">'you'</span>) {
    <span class="token keyword">this</span>.world = <span class="token string">'you'</span>;
    <span class="token keyword">this</span>.existence = <span class="token keyword">new</span> <span class="token function">Promise</span>(...)
  }
}`
  visuals.appendChild(el)

  for (let i = 0; i < 20; i++) {
    later(() => {
      const particle = document.createElement('div')
      particle.className = 'object-particle'
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = '100%'
      container.appendChild(particle)
    }, i * 100)
  }
}

function showProgressBar() {
  const visuals = visualsEl.value
  if (!visuals) return
  const wrap = document.createElement('div')
  wrap.className = 'progress-bar-container'
  wrap.innerHTML =
    '> INITIALIZATION...<div class="progress-bar-bg"><div class="progress-bar"></div></div>'
  visuals.appendChild(wrap)
  later(() => {
    const bar = wrap.querySelector('.progress-bar')
    if (bar) bar.style.width = '100%'
  }, 100)
}

/* ------------------------------------------------------------------
   几何图形
------------------------------------------------------------------ */
function drawPoints() {
  const container = containerEl.value
  if (!container) return
  clearShapes()
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div')
    p.className = 'shape point'
    p.style.left = `${Math.random() * 90 + 5}%`
    p.style.top = `${Math.random() * 90 + 5}%`
    container.appendChild(p)
  }
}

function drawCircle() {
  const container = containerEl.value
  if (!container) return
  clearShapes()
  const c = document.createElement('div')
  c.className = 'shape circle'
  const s = Math.min(window.innerWidth, window.innerHeight) * 0.4
  c.style.width = `${s}px`
  c.style.height = `${s}px`
  c.style.left = `calc(50% - ${s / 2}px)`
  c.style.top = `calc(50% - ${s / 2}px)`
  container.appendChild(c)
}

let sineWavePoints = []

function drawSineWave() {
  const container = containerEl.value
  if (!container) return
  clearShapes()
  sineWavePoints = []
  const width = window.innerWidth * 0.8
  for (let i = 0; i < 100; i++) {
    const dot = document.createElement('div')
    dot.className = 'shape sine-dot'
    const x = (i / 100) * width + window.innerWidth * 0.1
    const y = Math.sin((i / 100) * Math.PI * 4) * 80 + window.innerHeight / 2
    sineWavePoints.push({ x, y, i })
    dot.style.left = `${x}px`
    dot.style.top = `${y}px`
    container.appendChild(dot)
  }
}

function drawTangents() {
  const container = containerEl.value
  if (!container || !sineWavePoints.length) return
  for (let i = 0; i < 5; i++) {
    const p = sineWavePoints[Math.floor(Math.random() * sineWavePoints.length)]
    const tangent = document.createElement('div')
    tangent.className = 'shape tangent-line'
    const derivative = (Math.cos((p.i / 100) * Math.PI * 4) * 4 * Math.PI) / 100
    const angle =
      Math.atan((derivative * 80) / (window.innerWidth * 0.8)) * (180 / Math.PI)
    tangent.style.width = '150px'
    tangent.style.left = `${p.x}px`
    tangent.style.top = `${p.y}px`
    tangent.style.transform = `rotate(${angle}deg)`
    container.appendChild(tangent)
  }
}

function drawLimitations() {
  const container = containerEl.value
  if (!container) return
  for (let i = 0; i < 2; i++) {
    const limit = document.createElement('div')
    limit.className = 'shape limit-line'
    limit.style.width = '100vw'
    limit.style.left = '0'
    limit.style.top = i === 0 ? '10%' : '90%'
    container.appendChild(limit)
  }
}

function rippleEffect() {
  const container = containerEl.value
  if (!container) return
  const ripple = document.createElement('div')
  ripple.className = 'shape circle'
  Object.assign(ripple.style, {
    borderColor: 'var(--love-color)',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '10px',
    height: '10px',
    opacity: 1
  })
  container.appendChild(ripple)
  let size = 10
  const rippleInterval = every(() => {
    size += 50
    ripple.style.width = `${size}px`
    ripple.style.height = `${size}px`
    ripple.style.opacity = 1 - size / window.innerWidth
    if (size > window.innerWidth) {
      stopTimer(rippleInterval)
      ripple.remove()
    }
  }, 30)
}

/* ------------------------------------------------------------------
   高潮段落
------------------------------------------------------------------ */
function showIsolation() {
  clearScreen()
  showEmphasis({ text: 'ISOLATION', className: 'error' })
}

function showBSOD() {
  const container = containerEl.value
  if (!container) return
  const bsod = document.createElement('div')
  bsod.className = 'web-bg__bsod'
  let dump = 'Dumping physical memory to disk: '
  for (let i = 0; i < 10; i++) dump += Math.floor(Math.random() * 10)

  bsod.innerHTML = `
      <div class="bsod-text">
        <p>A problem has been detected and world has been shut down to prevent damage.</p>
        <p>ILLEGAL_ARGUMENT_EXCEPTION</p>
        <br>
        <p>If this is the first time you've seen this stop error screen, restart your simulation. If this screen appears again, follow these steps:</p>
        <p>Check to be sure you have adequate connection. If a new component is installed, ask your administrator or manufacturer for any updates you might need.</p>
        <br>
        <p>Technical Information:</p>
        <p>*** STOP: 0x0000004E (0x00000099, 0x00000000, 0x00000000, 0x00000000)</p>
        <p class="bsod-dump">${dump}</p>
      </div>`
  container.appendChild(bsod)
}

function hideBSOD() {
  const bsod = rootEl.value && rootEl.value.querySelector('.web-bg__bsod')
  if (!bsod) return
  bsod.style.transition = 'opacity 0.5s'
  bsod.style.opacity = '0'
  later(() => bsod.remove(), 500)
}

function executionSpamExtended({ duration }) {
  const visuals = visualsEl.value
  if (!visuals) return
  const endTime = Date.now() + duration
  let count = 0

  function spamStep() {
    if (stopped || Date.now() >= endTime) return

    const e = document.createElement('div')
    e.className = 'emphasis error'
    e.textContent = 'EXECUTION'
    Object.assign(e.style, {
      position: 'absolute',
      left: `${Math.random() * 60}%`,
      top: `${Math.random() * 70}%`,
      fontSize: `${Math.random() * 4 + 2}em`,
      transform: `rotate(${Math.random() * 40 - 20}deg)`,
      animation: 'none',
      textShadow: '0 0 10px var(--error-color)',
      zIndex: count % 3 === 0 ? 20 : 15
    })
    visuals.appendChild(e)
    later(() => e.remove(), Math.random() * 1000 + 500)
    count++
    later(spamStep, Math.random() * 300 + 100)
  }

  spamStep()
}

function showChaosText({ text }) {
  const visuals = visualsEl.value
  if (!visuals) return
  const e = document.createElement('div')
  e.className = 'chaos-text'
  e.textContent = text
  Object.assign(e.style, {
    left: `${Math.random() * 80}%`,
    top: `${Math.random() * 80}%`,
    fontSize: `${Math.random() * 3 + 2}em`,
    color: `hsl(${Math.random() * 360}, 100%, 70%)`
  })
  visuals.appendChild(e)
  later(() => e.remove(), 500)
}

function showTrappedInLove() {
  const visuals = visualsEl.value
  if (!visuals) return
  const el = document.createElement('div')
  el.className = 'code-snippet love'
  el.style.borderColor = 'var(--love-color)'
  el.innerHTML = `> Trapped in LOVE...
<span class="token keyword">while</span>(<span class="token class-name">true</span>) {
  <span class="token keyword">this</span>.<span class="token function">love</span>(<span class="token string">'you'</span>);
} <span class="love-cursor">❤</span>`

  const cursor = el.querySelector('.love-cursor')
  every(() => {
    cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0'
  }, 500)

  visuals.appendChild(el)
}

function finalExecution() {
  showEmphasis({ text: 'EXECUTION', className: 'error' })
}
</script>

<style>
/* ==================================================================
   背景层：全部规则以 .web-bg 限定作用域，
   避免与 VitePress 默认主题的通用类名（.line / .cursor / .error 等）互相污染
================================================================== */
.web-bg {
  --main-bg: #0a0a0a;
  --text-color: #00ff41;
  --highlight-color: #f0f0f0;
  --error-color: #ff3333;
  --love-color: #ff69b4;
  --bsod-bg: #0000aa;
  --bsod-text: #ffffff;
  --font-main: 'Share Tech Mono', monospace;
  --font-display: 'VT323', monospace;

  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;

  background-color: var(--main-bg);
  color: var(--text-color);
  font-family: var(--font-main);
  text-shadow: 0 0 5px var(--text-color), 0 0 10px var(--text-color);
}

.web-bg__container {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 2vw;
  /* 在容器上重新解析变量，使 .ac-mode / .dc-mode 的换色能够生效 */
  color: var(--text-color);
  text-shadow: 0 0 5px var(--text-color), 0 0 10px var(--text-color);
}

/* CRT 扫描线 */
.web-bg__container::before {
  content: ' ';
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
    linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  z-index: 2;
  background-size: 100% 3px, 4px 100%;
  pointer-events: none;
  animation: wb-scanline 8s linear infinite;
}

/* 四角压暗 */
.web-bg__container::after {
  content: ' ';
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0.8) 100%);
  z-index: 2;
  pointer-events: none;
}

@keyframes wb-scanline {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 0 100%;
  }
}

.web-bg__visuals {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  font-size: 1.1rem;
  overflow: hidden;
}

.web-bg .line {
  display: block;
  margin-bottom: 0.5em;
  white-space: pre-wrap;
}

.web-bg .line > .prompt {
  opacity: 0.6;
}

.web-bg .cursor {
  display: inline-block;
  background-color: var(--text-color);
  width: 0.6em;
  height: 1.2em;
  vertical-align: middle;
  animation: wb-blink 1s step-end infinite;
}

.web-bg .emphasis {
  font-family: var(--font-display);
  font-size: 2.5em;
  color: var(--highlight-color);
  text-shadow: 0 0 8px var(--highlight-color);
  display: block;
  text-align: center;
  letter-spacing: 5px;
  animation: wb-fade-in 0.5s;
}

.web-bg .error {
  color: var(--error-color);
  text-shadow: 0 0 8px var(--error-color);
}

.web-bg .love {
  color: var(--love-color);
  text-shadow: 0 0 8px var(--love-color);
  animation: wb-pulse 1.5s infinite;
}

@keyframes wb-blink {
  from,
  to {
    background-color: transparent;
  }
  50% {
    background-color: var(--text-color);
  }
}

@keyframes wb-fade-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes wb-screen-shake {
  0% { transform: translate(2px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-0.8deg); }
  20% { transform: translate(-3px, 0) rotate(0.8deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(0.8deg); }
  50% { transform: translate(-1px, 2px) rotate(-0.8deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-0.8deg); }
  80% { transform: translate(-1px, -1px) rotate(0.8deg); }
  90% { transform: translate(2px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-0.8deg); }
}

@keyframes wb-pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

/* 仅模糊，不旋转 */
.web-bg .dizzy {
  animation: wb-blur 2s linear infinite;
}

@keyframes wb-blur {
  0% { filter: blur(0); }
  50% { filter: blur(5px); }
  100% { filter: blur(0); }
}

.web-bg .ac-mode {
  --text-color: #ff4444;
}

.web-bg .dc-mode {
  --text-color: #4444ff;
}

.web-bg .blind {
  filter: blur(5px) brightness(0.3);
}

.web-bg .time-travel {
  animation: wb-time-warp 3s ease-in-out;
}

@keyframes wb-time-warp {
  0% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(180deg) sepia(1); }
  100% { filter: hue-rotate(360deg); }
}

/* ==================================================================
   特效元素
================================================================== */
.web-bg__binary,
.web-bg__bsod {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  pointer-events: none;
}

.web-bg .code-snippet,
.web-bg .progress-bar-container {
  background-color: rgba(0, 0, 0, 0.5);
  border: 1px solid var(--text-color);
  padding: 1em;
  margin: 1em 0;
  white-space: pre;
  font-family: var(--font-main);
}

.web-bg .progress-bar {
  height: 1.2em;
  background-color: var(--text-color);
  width: 0;
  transition: width 1s linear;
}

.web-bg .token.keyword {
  color: #cc7832;
}

.web-bg .token.class-name {
  color: #a9b7c6;
}

.web-bg .token.function {
  color: #ffc66d;
}

.web-bg .token.string {
  color: #6a8759;
}

.web-bg__bsod {
  background-color: var(--bsod-bg);
  color: var(--bsod-text);
  font-family: 'Lucida Console', monospace;
  text-shadow: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.web-bg .bsod-text {
  font-size: 1.2em;
  text-align: center;
}

.web-bg .bsod-dump {
  font-size: 0.8em;
  margin-top: 2em;
}

.web-bg .shape {
  position: absolute;
}

.web-bg .point,
.web-bg .sine-dot {
  width: 5px;
  height: 5px;
  background-color: var(--highlight-color);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--highlight-color);
}

.web-bg .circle {
  border: 2px solid var(--highlight-color);
  border-radius: 50%;
  box-shadow: 0 0 15px var(--highlight-color);
  animation: wb-fade-in 1s;
}

.web-bg .tangent-line {
  border-top: 1px dashed var(--love-color);
  transform-origin: left center;
}

.web-bg .limit-line {
  border-top: 2px solid var(--error-color);
}

.web-bg .chaos-text {
  position: absolute;
  font-family: var(--font-display);
  opacity: 0.8;
  animation: wb-fade-in 0.2s;
}

.web-bg .emoji-display {
  position: absolute;
  font-size: 3em;
  animation: wb-bounce-in 0.8s ease-out;
  z-index: 15;
}

@keyframes wb-bounce-in {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}

.web-bg .gender-symbol {
  position: absolute;
  font-size: 4em;
  animation: wb-gender-switch 1s ease-in-out;
  z-index: 15;
}

@keyframes wb-gender-switch {
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(90deg) scale(1.2); }
  100% { transform: rotateY(180deg); }
}

.web-bg .time-display {
  position: absolute;
  font-family: 'Courier New', monospace;
  font-size: 2em;
  background: rgba(0, 0, 0, 0.8);
  padding: 0.5em;
  border: 2px solid var(--text-color);
  animation: wb-digital-clock 2s ease-in-out;
}

@keyframes wb-digital-clock {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0.9;
    transform: scale(1);
  }
}

.web-bg .molecule {
  position: absolute;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #ff6b6b, #4ecdc4);
  border-radius: 50%;
  animation: wb-molecule-float 3s ease-in-out infinite;
}

@keyframes wb-molecule-float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.web-bg .sound-wave {
  position: absolute;
  height: 4px;
  background: linear-gradient(to right, var(--love-color), transparent);
  animation: wb-sound-wave 1s ease-in-out infinite;
}

@keyframes wb-sound-wave {
  0% {
    width: 0;
    opacity: 1;
  }
  100% {
    width: 200px;
    opacity: 0;
  }
}

.web-bg .year-display {
  position: absolute;
  font-family: var(--font-display);
  font-size: 3em;
  color: gold;
  text-shadow: 0 0 10px gold;
  animation: wb-time-travel 0.5s ease-in-out;
}

@keyframes wb-time-travel {
  0% {
    opacity: 0;
    transform: scale(2) rotateX(90deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotateX(0deg);
  }
}

.web-bg .unite-effect {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 3px solid var(--love-color);
  border-radius: 50%;
  animation: wb-unite 2s ease-in-out;
}

@keyframes wb-unite {
  0% {
    transform: scale(0.1);
    opacity: 0;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.8;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

.web-bg .trance-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, transparent 30%, rgba(255, 105, 180, 0.3) 100%);
  animation: wb-trance 4s ease-in-out;
  z-index: 8;
}

@keyframes wb-trance {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
    opacity: 0;
  }
  50% {
    transform: rotate(180deg) scale(1.1);
    opacity: 0.7;
  }
}

.web-bg .power-line {
  position: absolute;
  height: 2px;
  background: var(--text-color);
  box-shadow: 0 0 10px var(--text-color);
  animation: wb-power-pulse 0.5s infinite alternate;
  z-index: 5;
}

@keyframes wb-power-pulse {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

.web-bg .protection-shield {
  position: absolute;
  border: 3px solid var(--text-color);
  border-radius: 50%;
  box-shadow: 0 0 20px var(--text-color);
  animation: wb-shield-pulse 2s infinite;
  z-index: 10;
}

@keyframes wb-shield-pulse {
  0% {
    transform: scale(0.5);
    opacity: 0.5;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.5);
    opacity: 0.5;
  }
}

.web-bg .object-particle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--text-color);
  border-radius: 50%;
  animation: wb-particle-float 3s ease-in-out;
  z-index: 7;
}

@keyframes wb-particle-float {
  0% {
    transform: translateY(0) scale(0.2);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) scale(1);
    opacity: 0;
  }
}
</style>
