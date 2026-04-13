// 音效管理 Hook
// 使用本地音效文件

// 音效文件路径 - 多种点击音效随机播放
const SOUNDS = {
  // 按钮点击音 - 多种
  click: ['/sounds/click1.mp3', '/sounds/click2.mp3'],
  // 数字键盘弹出音 - 多种
  pop: ['/sounds/pop1.mp3', '/sounds/pop2.mp3', '/sounds/pop3.mp3', '/sounds/bubble.mp3'],
  // 成功音效
  success: ['/sounds/success.mp3'],
  // 错误提示音
  error: ['/sounds/error.mp3'],
}

// 预加载的音频缓存
const audioCache: Map<string, HTMLAudioElement> = new Map()

// 预加载音效
export function preloadSounds() {
  Object.values(SOUNDS).flat().forEach((url) => {
    const audio = new Audio(url)
    audio.preload = 'auto'
    audio.volume = 0.4
    audioCache.set(url, audio)
  })
}

// 播放音效（随机选择一个）
function playSoundType(type: keyof typeof SOUNDS) {
  try {
    const urls = SOUNDS[type]
    // 随机选择一个音效
    const url = urls[Math.floor(Math.random() * urls.length)]
    
    let audio = audioCache.get(url)
    
    if (audio) {
      // 克隆音频以支持快速连续点击
      const clone = audio.cloneNode() as HTMLAudioElement
      clone.volume = 0.4
      clone.play().catch(() => {})
    } else {
      audio = new Audio(url)
      audio.volume = 0.4
      audio.play().catch(() => {})
      audioCache.set(url, audio)
    }
  } catch (e) {
    // 静默失败
  }
}

// 点击音效 - 按钮
export function playClick() {
  playSoundType('click')
}

// 数字键盘音效 - 随机弹出音
export function playPop() {
  playSoundType('pop')
}

// 成功音效
export function playSuccess() {
  playSoundType('success')
}

// 错误音效
export function playError() {
  playSoundType('error')
}
