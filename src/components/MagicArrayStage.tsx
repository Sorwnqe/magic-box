import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import styled from '@emotion/styled'
import confetti from 'canvas-confetti'
import { backgrounds } from '../assets/images'
import { playPop, playClick, playSuccess, playError } from '../hooks/useSound'

// 密室侦探主题配色
const COLORS = {
  primary: '#4f46e5',
  primaryLight: '#818cf8',
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  indigo: '#6366f1',
  cyan: '#22d3ee',
  yellow: '#facc15',
  gold: '#fbbf24',
  goldLight: '#fde68a',
  green: '#22c55e',
  orange: '#fb923c',
  pink: '#f472b6',
  textPrimary: '#1e293b',
  textMuted: '#64748b',
  bgDark: '#0f172a',
  bgLight: '#1e293b',
}


// 判断是否是反转数对
function isReversePair(a: number, b: number): boolean {
  if (a < 10 || a > 99 || b < 10 || b > 99) return false
  const aReversed = (a % 10) * 10 + Math.floor(a / 10)
  return aReversed === b
}

// 验证算式是否和为44且是反转数对
function validateFormula(left: number, right: number, sum: number): {
  valid: boolean
  message: string
} {
  const isPair = isReversePair(left, right)
  const sumCorrect = left + right === sum
  const sumIs44 = sum === 44
  
  if (isPair && sumCorrect && sumIs44) {
    return {
      valid: true,
      message: '🎉 太棒了！你找到了和为44的反转数对！魔法阵能量+1！'
    }
  } else if (!sumIs44 && sumCorrect && isPair) {
    return {
      valid: false,
      message: `😅 这是反转数对，但和是 ${sum}，不是 44 哦！`
    }
  } else if (isPair && !sumCorrect) {
    return {
      valid: false,
      message: `🤔 ${left} + ${right} = ${left + right}，不是 ${sum} 哦！`
    }
  } else if (!isPair && sumIs44) {
    return {
      valid: false,
      message: `😅 和是44，但 ${left} 和 ${right} 不是反转数对！`
    }
  } else {
    return {
      valid: false,
      message: '❌ 检查一下：1. 两个数是反转数对吗？ 2. 和等于44吗？'
    }
  }
}

// 背景粒子特效
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio
      canvas.height = window.innerHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)
    
    const width = window.innerWidth
    const height = window.innerHeight
    
    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      alpha: number
      symbol: string
      pulse: number
      pulseSpeed: number
    }
    
    const colors = ['#8b5cf6', '#6366f1', '#22d3ee', '#facc15', '#22c55e', '#fb923c']
    const symbols = ['4', '4', '✨', '⭐', '+', '=', '🔮', '💫']
    
    const particles: Particle[] = []
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 18 + 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.3 + 0.1,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.03 + 0.01
      })
    }
    
    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.pulse += p.pulseSpeed
        
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1
        
        const pulseAlpha = p.alpha * (0.7 + Math.sin(p.pulse) * 0.3)
        
        ctx.save()
        ctx.globalAlpha = pulseAlpha
        ctx.font = `${p.size}px "Nunito", sans-serif`
        ctx.fillStyle = p.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(p.symbol, p.x, p.y)
        ctx.restore()
      })
      
      animationId = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])
  
  return <ParticleCanvas ref={canvasRef} />
}

const ParticleCanvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
`

// 飞入的算式数字
interface FlyingFormula {
  left: string
  right: string
  sum: string
  progress: number
  startX: number
  startY: number
}

// 验证结果弹出
interface ValidationResult {
  valid: boolean
  message: string
  progress: number
  scale: number
}

// 鼓励语
const CORRECT_MESSAGES = [
  '太厉害了！',
  '完美！你真棒！',
  '答对啦！继续加油！',
  '魔法能量充泛！',
  '你掌握规律了！'
]

const WRONG_MESSAGES = [
  '没关系，再试一次！',
  '加油！你可以的！',
  '别灰心，检查一下~',
  '差一点点，再想想！',
  '仔细看看规律哦~'
]

// 魔法台 Canvas 组件 - 四十四符文阵
function MagicPlatformCanvas({
  energy,
  flyingFormula,
  validationResult
}: {
  energy: number
  flyingFormula: FlyingFormula | null
  validationResult: ValidationResult | null
  onValidationComplete: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<Array<{
    x: number
    y: number
    vx: number
    vy: number
    size: number
    color: string
    alpha: number
    life: number
    type: 'star' | 'sparkle' | 'rune'
  }>>([])
  const floatPhaseRef = useRef(0)
  const runeRotationRef = useRef(0)
  
  // 绘制六芒星
  const drawHexagram = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    
    // 第一个三角形（向上）
    ctx.beginPath()
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 - Math.PI / 2
      const px = Math.cos(angle) * size
      const py = Math.sin(angle) * size
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.stroke()
    
    // 第二个三角形（向下）
    ctx.beginPath()
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 + Math.PI / 2
      const px = Math.cos(angle) * size
      const py = Math.sin(angle) * size
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.stroke()
    
    ctx.restore()
  }
  
  // 绘制符文字符
  const drawRune = (ctx: CanvasRenderingContext2D, x: number, y: number, char: string, size: number, alpha: number) => {
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.font = `bold ${size}px "Segoe UI Symbol", system-ui`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(char, x, y)
    ctx.restore()
  }
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    
    if (w <= 0 || h <= 0) {
      animationRef.current = requestAnimationFrame(draw)
      return
    }
    
    const cx = w * 0.5
    const cy = h * 0.5
    
    ctx.clearRect(0, 0, w, h)
    
    // 更新动画相位
    floatPhaseRef.current += 0.015
    runeRotationRef.current += 0.008
    const floatY = Math.sin(floatPhaseRef.current) * 5
    const pulse = Math.sin(floatPhaseRef.current * 2) * 0.15 + 0.85
    
    // 魔法阵中心
    const platformY = cy + floatY
    
    ctx.save()
    ctx.translate(cx, platformY)
    
    // ===== 最外层光晕 =====
    const outerGlow = ctx.createRadialGradient(0, 0, 100, 0, 0, 220)
    outerGlow.addColorStop(0, `rgba(251, 146, 60, ${0.25 * pulse})`)
    outerGlow.addColorStop(0.4, `rgba(250, 204, 21, ${0.15 * pulse})`)
    outerGlow.addColorStop(0.7, `rgba(34, 197, 94, ${0.1 * pulse})`)
    outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = outerGlow
    ctx.beginPath()
    ctx.arc(0, 0, 220, 0, Math.PI * 2)
    ctx.fill()
    
    // ===== 外圈装饰环 (旋转的符文环) =====
    ctx.save()
    ctx.rotate(runeRotationRef.current)
    
    // 外圈线
    ctx.strokeStyle = `rgba(251, 146, 60, ${0.5 * pulse})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, 165, 0, Math.PI * 2)
    ctx.stroke()
    
    // 外圈符文 (数字4和符号)
    const outerRunes = ['4', '✦', '4', '◇', '4', '✧', '4', '◈']
    ctx.fillStyle = `rgba(251, 146, 60, ${0.7 * pulse})`
    ctx.shadowColor = '#fb923c'
    ctx.shadowBlur = 10
    for (let i = 0; i < outerRunes.length; i++) {
      const angle = (i * Math.PI * 2) / outerRunes.length
      const rx = Math.cos(angle) * 165
      const ry = Math.sin(angle) * 165
      drawRune(ctx, rx, ry, outerRunes[i], 18, 0.8)
    }
    ctx.shadowBlur = 0
    ctx.restore()
    
    // ===== 中圈 (反向旋转) =====
    ctx.save()
    ctx.rotate(-runeRotationRef.current * 1.3)
    
    ctx.strokeStyle = `rgba(250, 204, 21, ${0.6 * pulse})`
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(0, 0, 125, 0, Math.PI * 2)
    ctx.stroke()
    
    // 中圈六芒星
    ctx.strokeStyle = `rgba(250, 204, 21, ${0.5 * pulse})`
    ctx.lineWidth = 2
    drawHexagram(ctx, 0, 0, 110, 0)
    
    ctx.restore()
    
    // ===== 内圈 (缓慢旋转) =====
    ctx.save()
    ctx.rotate(runeRotationRef.current * 0.5)
    
    // 内圈能量环
    ctx.strokeStyle = `rgba(34, 197, 94, ${0.6 * pulse})`
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(0, 0, 85, 0, Math.PI * 2)
    ctx.stroke()
    
    // 内六芒星
    ctx.strokeStyle = `rgba(34, 197, 94, ${0.4 * pulse})`
    ctx.lineWidth = 1.5
    drawHexagram(ctx, 0, 0, 70, Math.PI / 6)
    
    ctx.restore()
    
    // ===== 中心核心 - 大"44" =====
    // 核心外圈光晕
    const coreGlow = ctx.createRadialGradient(0, 0, 20, 0, 0, 80)
    const coreColor = energy >= 2 ? 'rgba(34, 197, 94,' : 'rgba(251, 146, 60,'
    coreGlow.addColorStop(0, coreColor + `${0.95 * pulse})`)
    coreGlow.addColorStop(0.4, coreColor + `${0.5 * pulse})`)
    coreGlow.addColorStop(1, coreColor + '0)')
    ctx.fillStyle = coreGlow
    ctx.beginPath()
    ctx.arc(0, 0, 80, 0, Math.PI * 2)
    ctx.fill()
    
    // 核心外圈边框
    ctx.strokeStyle = energy >= 2 ? '#22c55e' : '#fb923c'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(0, 0, 60, 0, Math.PI * 2)
    ctx.stroke()
    
    // 核心内圈边框
    ctx.strokeStyle = energy >= 2 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(251, 146, 60, 0.5)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, 50, 0, Math.PI * 2)
    ctx.stroke()
    
    // 核心背景
    const coreBg = ctx.createRadialGradient(0, 0, 0, 0, 0, 55)
    coreBg.addColorStop(0, energy >= 2 ? 'rgba(34, 197, 94, 0.98)' : 'rgba(251, 146, 60, 0.98)')
    coreBg.addColorStop(0.7, energy >= 2 ? 'rgba(22, 163, 74, 0.95)' : 'rgba(234, 88, 12, 0.95)')
    coreBg.addColorStop(1, energy >= 2 ? 'rgba(21, 128, 61, 0.9)' : 'rgba(194, 65, 12, 0.9)')
    ctx.fillStyle = coreBg
    ctx.beginPath()
    ctx.arc(0, 0, 55, 0, Math.PI * 2)
    ctx.fill()
    
    // 中心 "44" 数字 - 简单清晰
    ctx.font = 'bold 48px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('44', 0, 0)
    
    ctx.restore()
    
    // ===== 绘制飞入的算式 =====
    if (flyingFormula) {
      const t = flyingFormula.progress
      const startX = flyingFormula.startX
      const startY = flyingFormula.startY
      const endX = cx
      const endY = platformY
      
      // 贝塞尔曲线控制点
      const cp1X = startX - 100
      const cp1Y = startY - 180
      const cp2X = endX + 100
      const cp2Y = endY - 120
      
      // 三次贝塞尔曲线
      const mt = 1 - t
      const x = mt*mt*mt*startX + 3*mt*mt*t*cp1X + 3*mt*t*t*cp2X + t*t*t*endX
      const y = mt*mt*mt*startY + 3*mt*mt*t*cp1Y + 3*mt*t*t*cp2Y + t*t*t*endY
      
      // 缩放和旋转效果
      const scale = 1.3 - t * 0.5
      const rotation = t * Math.PI * 2
      
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation * 0.3)
      ctx.scale(scale, scale)
      
      // 发光背景
      ctx.shadowColor = '#fbbf24'
      ctx.shadowBlur = 50
      
      // 算式背景
      const bgGrad = ctx.createLinearGradient(-90, 0, 90, 0)
      bgGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)')
      bgGrad.addColorStop(0.5, 'rgba(254, 243, 199, 0.98)')
      bgGrad.addColorStop(1, 'rgba(255, 255, 255, 0.98)')
      ctx.fillStyle = bgGrad
      ctx.beginPath()
      ctx.roundRect(-95, -32, 190, 64, 16)
      ctx.fill()
      
      // 算式边框
      ctx.strokeStyle = '#fb923c'
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.shadowBlur = 0
      
      // 算式文字
      ctx.font = 'bold 30px var(--font-display), system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#ea580c'
      ctx.fillText(`${flyingFormula.left} + ${flyingFormula.right} = ${flyingFormula.sum}`, 0, 2)
      
      ctx.restore()
      
      // 生成星星粒子拖尾
      if (Math.random() < 0.6 && particlesRef.current.length < 40) {
        const colors = ['#fbbf24', '#fb923c', '#22c55e', '#facc15']
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 40,
          y: y + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 5,
          vy: -Math.random() * 4 - 2,
          size: Math.random() * 10 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          life: 50,
          type: Math.random() > 0.4 ? 'star' : 'sparkle'
        })
      }
    }
    
    // ===== 绘制验证结果 - 魔法阵风格 + 鼓励语 =====
    if (validationResult) {
      const t = validationResult.progress
      const ease = 1 - Math.pow(1 - t, 4)
      const scale = 0.3 + ease * 0.7
      const isValid = validationResult.valid
      
      // 获取鼓励语（基于 message 的 hash 选择）
      const msgHash = validationResult.message.length % 5
      const encourageText = isValid ? CORRECT_MESSAGES[msgHash] : WRONG_MESSAGES[msgHash]
      
      ctx.save()
      ctx.translate(cx, platformY)
      ctx.scale(scale, scale)
      
      // 外圈魔法光环 - 更大
      const ringGlow = ctx.createRadialGradient(0, 0, 70, 0, 0, 180)
      if (isValid) {
        ringGlow.addColorStop(0, 'rgba(34, 197, 94, 0.9)')
        ringGlow.addColorStop(0.5, 'rgba(34, 197, 94, 0.4)')
        ringGlow.addColorStop(1, 'rgba(34, 197, 94, 0)')
      } else {
        ringGlow.addColorStop(0, 'rgba(239, 68, 68, 0.9)')
        ringGlow.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)')
        ringGlow.addColorStop(1, 'rgba(239, 68, 68, 0)')
      }
      ctx.fillStyle = ringGlow
      ctx.beginPath()
      ctx.arc(0, 0, 180, 0, Math.PI * 2)
      ctx.fill()
      
      // 旋转的符文环
      ctx.save()
      ctx.rotate(floatPhaseRef.current * 2)
      ctx.strokeStyle = isValid ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(0, 0, 120, 0, Math.PI * 2)
      ctx.stroke()
      
      // 周围的小符文
      const symbols = isValid ? ['✓', '★', '✓', '✦', '✓', '★', '✓', '✨'] : ['✗', '×', '✗', '‼', '✗', '×', '✗', '❗']
      ctx.fillStyle = isValid ? '#22c55e' : '#ef4444'
      symbols.forEach((sym, i) => {
        const angle = (i / symbols.length) * Math.PI * 2
        const rx = Math.cos(angle) * 120
        const ry = Math.sin(angle) * 120
        ctx.font = 'bold 16px system-ui'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(sym, rx, ry)
      })
      ctx.restore()
      
      // 中心结果圆 - 更大
      const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 70)
      if (isValid) {
        centerGrad.addColorStop(0, '#4ade80')
        centerGrad.addColorStop(0.5, '#22c55e')
        centerGrad.addColorStop(1, '#16a34a')
      } else {
        centerGrad.addColorStop(0, '#f87171')
        centerGrad.addColorStop(0.5, '#ef4444')
        centerGrad.addColorStop(1, '#dc2626')
      }
      ctx.beginPath()
      ctx.arc(0, 0, 70, 0, Math.PI * 2)
      ctx.fillStyle = centerGrad
      ctx.shadowColor = isValid ? '#22c55e' : '#ef4444'
      ctx.shadowBlur = 50
      ctx.fill()
      ctx.shadowBlur = 0
      
      // 结果图标
      ctx.font = 'bold 56px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#ffffff'
      ctx.fillText(isValid ? '✓' : '✗', 0, -5)
      
      // 鼓励文字 - 在图标下方
      ctx.font = 'bold 22px "Nunito", system-ui'
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = isValid ? '#166534' : '#991b1b'
      ctx.shadowBlur = 4
      ctx.fillText(encourageText, 0, 105)
      ctx.shadowBlur = 0
      
      ctx.restore()
    }
    
    // ===== 更新并绘制粒子 =====
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.12
      p.life--
      p.alpha = Math.min(p.life / 35, 1)
      
      if (p.life <= 0) return false
      
      ctx.save()
      ctx.globalAlpha = p.alpha
      ctx.translate(p.x, p.y)
      
      if (p.type === 'star') {
        // 绘制星星
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 12
        ctx.beginPath()
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
          const px = Math.cos(angle) * p.size
          const py = Math.sin(angle) * p.size
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
          
          const innerAngle = ((i + 0.5) * Math.PI * 2) / 5 - Math.PI / 2
          const innerX = Math.cos(innerAngle) * (p.size * 0.4)
          const innerY = Math.sin(innerAngle) * (p.size * 0.4)
          ctx.lineTo(innerX, innerY)
        }
        ctx.closePath()
        ctx.fill()
      } else {
        // 绘制闪光圆点
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
      
      ctx.restore()
      return true
    })
    
    // 环境粒子（持续生成）
    if (Math.random() < 0.08 && particlesRef.current.length < 50) {
      const angle = Math.random() * Math.PI * 2
      const dist = 120 + Math.random() * 80
      particlesRef.current.push({
        x: cx + Math.cos(angle) * dist,
        y: platformY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 1,
        vy: -Math.random() * 2 - 0.5,
        size: Math.random() * 5 + 3,
        color: ['#fbbf24', '#22c55e', '#facc15'][Math.floor(Math.random() * 3)],
        alpha: 0.7,
        life: 60,
        type: 'sparkle'
      })
    }
    
    animationRef.current = requestAnimationFrame(draw)
  }, [energy, flyingFormula, validationResult])
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    
    resize()
    const initTimer = setTimeout(resize, 100)
    window.addEventListener('resize', resize)
    animationRef.current = requestAnimationFrame(draw)
    
    return () => {
      clearTimeout(initTimer)
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [draw])
  
  return <MagicCanvas ref={canvasRef} />
}

// 动画
// 样式组件
const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`

const BackgroundImage = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${backgrounds.mysticAlley});
  background-size: cover;
  background-position: center;
  z-index: 0;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(79, 70, 229, 0.4));
  }
`

const Header = styled(motion.div)`
  text-align: center;
  padding: 12px 35px 14px;
  z-index: 10;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
  backdrop-filter: blur(10px);
  border-radius: 0 0 20px 20px;
  margin: 0 auto;
  width: fit-content;
  box-shadow: 0 5px 30px rgba(0,0,0,0.3);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-top: none;
`

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`

const StageTag = styled.div`
  display: inline-block;
  padding: 4px 14px;
  background: linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight});
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 3px 10px rgba(251, 191, 36, 0.4);
`

const Title = styled.h1`
  font-size: 1.6rem;
  background: linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  font-weight: 800;
`

const Subtitle = styled.p`
  color: ${COLORS.purpleLight};
  font-size: 0.85rem;
  margin: 0;
  font-weight: 500;
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 15px 25px 90px;
  z-index: 10;
`

const LeftSection = styled.div`
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const CenterSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
`

const GlassContainer = styled.div`
  position: relative;
  width: 100%;
  height: calc(100% - 20px);
  max-height: calc(100vh - 180px);
  min-height: 400px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(251, 146, 60, 0.15),
    inset 0 0 30px rgba(255, 255, 255, 0.1);
  
  @media (min-width: 1400px) {
    max-height: calc(100vh - 150px);
  }
`

const RightSection = styled.div`
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: flex-end;
  padding-bottom: 20px;
`

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 6px 25px rgba(251, 146, 60, 0.2);
`

const CardTitle = styled.h3`
  color: ${COLORS.orange};
  font-size: 1rem;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 6px;
`

const FormulaInputRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
`

const NumberInputBox = styled.div<{ active?: boolean; hasError?: boolean }>`
  width: 56px;
  height: 48px;
  border: 3px solid ${props => props.hasError ? '#ef4444' : props.active ? COLORS.orange : '#fed7aa'};
  border-radius: 10px;
  font-size: 1.4rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLORS.orange};
  background: ${props => props.hasError ? '#fef2f2' : props.active ? '#fff7ed' : '#fffbeb'};
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.active ? '0 0 15px rgba(251, 146, 60, 0.35)' : '0 2px 6px rgba(251, 146, 60, 0.1)'};
  
  &:hover {
    border-color: ${COLORS.orange};
    transform: scale(1.03);
  }
`

const NumberInputPlaceholder = styled.span`
  color: #fdba74;
  font-size: 1rem;
`

const OperatorDisplay = styled.span`
  font-size: 1.4rem;
  color: ${COLORS.yellow};
  font-weight: 700;
`

const SubmitButton = styled(motion.button)<{ disabled?: boolean }>`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  background: ${props => props.disabled 
    ? '#e5e7eb' 
    : `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.yellow} 100%)`};
  color: white;
  box-shadow: ${props => props.disabled 
    ? 'none' 
    : '0 4px 20px rgba(251, 146, 60, 0.4)'};
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(251, 146, 60, 0.45);
  }
`

const MagicCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`

const KeypadCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 6px 25px rgba(251, 146, 60, 0.2);
`

const KeypadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`

const KeypadButton = styled(motion.button)<{ variant?: 'number' | 'action' }>`
  height: 44px;
  border: none;
  border-radius: 10px;
  font-size: ${props => props.variant === 'action' ? '0.85rem' : '1.3rem'};
  font-weight: 700;
  cursor: pointer;
  background: ${props => props.variant === 'action' 
    ? 'linear-gradient(135deg, #fed7aa, #fdba74)' 
    : 'linear-gradient(135deg, #fff7ed, #ffedd5)'};
  color: ${props => props.variant === 'action' ? COLORS.orange : '#9a3412'};
  box-shadow: 0 2px 6px rgba(251, 146, 60, 0.1);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(251, 146, 60, 0.2);
  }
  
  &:active {
    transform: translateY(0) scale(0.97);
  }
`

const ActiveInputHint = styled.div<{ active: boolean }>`
  margin-top: 10px;
  padding: 8px;
  background: ${props => props.active ? '#fff7ed' : '#f1f5f9'};
  border-radius: 10px;
  text-align: center;
  font-size: 0.85rem;
  color: ${props => props.active ? COLORS.orange : '#94a3b8'};
`

const TipBox = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: linear-gradient(135deg, #e0f2fe, #bae6fd);
  border-radius: 10px;
  font-size: 0.85rem;
  color: #0369a1;
  text-align: center;
`

const EnergyDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin: 12px 0;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 16px;
  border: 3px solid #fbbf24;
  box-shadow: 0 8px 25px rgba(251, 191, 36, 0.3);
`

const EnergyNumber = styled.div`
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, ${COLORS.orange}, ${COLORS.gold});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  text-shadow: 0 4px 15px rgba(251, 146, 60, 0.3);
`

const EnergyLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${COLORS.orange};
  margin-top: 4px;
`

// const ResultCard = styled.div<{ valid: boolean }>`
//   margin-top: 12px;
//   padding: 16px;
//   border-radius: 14px;
//   background: ${props => props.valid 
//     ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' 
//     : 'linear-gradient(135deg, #fef2f2, #fecaca)'};
//   border: 2px solid ${props => props.valid ? '#22c55e' : '#ef4444'};
//   box-shadow: ${props => props.valid 
//     ? '0 6px 20px rgba(34, 197, 94, 0.25)' 
//     : '0 6px 20px rgba(239, 68, 68, 0.25)'};
//   text-align: center;
// `

// const ResultIcon = styled.div<{ valid: boolean }>`
//   width: 50px;
//   height: 50px;
//   margin: 0 auto 10px;
//   border-radius: 50%;
//   background: ${props => props.valid 
//     ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
//     : 'linear-gradient(135deg, #ef4444, #dc2626)'};
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   font-size: 1.8rem;
//   color: white;
//   box-shadow: ${props => props.valid 
//     ? '0 4px 15px rgba(34, 197, 94, 0.4)' 
//     : '0 4px 15px rgba(239, 68, 68, 0.4)'};
// `

// const ResultMessage = styled.div`
//   font-size: 1.1rem;
//   font-weight: 700;
//   margin-bottom: 6px;
// `

// const ResultHint = styled.div`
//   font-size: 0.85rem;
//   color: #64748b;
//   line-height: 1.4;
// `

// const SuccessBanner = styled(motion.div)`
//   position: fixed;
//   top: 50%;
//   left: 50%;
//   transform: translate(-50%, -50%);
//   background: white;
//   padding: 40px 60px;
//   border-radius: 30px;
//   box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
//   text-align: center;
//   z-index: 100;
// `

export default function MagicArrayStage() {
  const [leftNum, setLeftNum] = useState('')
  const [rightNum, setRightNum] = useState('')
  const [sumNum, setSumNum] = useState('')
  const [activeInput, setActiveInput] = useState<'left' | 'right' | 'sum' | null>('left')
  const [foundFormulas, setFoundFormulas] = useState<Array<{ left: number; right: number }>>([])
  // const [showSuccess, setShowSuccess] = useState(false)
  
  // 动画状态
  const [flyingFormula, setFlyingFormula] = useState<FlyingFormula | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const flyingAnimRef = useRef<number>(0)
  const validationAnimRef = useRef<number>(0)
  
  // 键盘输入处理
  const handleKeypadClick = (value: string) => {
    if (!activeInput) return
    playPop() // 键盘音效
    
    const setters = {
      left: setLeftNum,
      right: setRightNum,
      sum: setSumNum
    }
    const currentValues = {
      left: leftNum,
      right: rightNum,
      sum: sumNum
    }
    
    const setter = setters[activeInput]
    const currentValue = currentValues[activeInput]
    const maxLength = activeInput === 'sum' ? 3 : 2
    
    if (value === 'clear') {
      setter('')
    } else if (value === 'del') {
      setter(currentValue.slice(0, -1))
    } else {
      if (currentValue.length < maxLength) {
        setter(currentValue + value)
      }
    }
  }
  
  // 飞入动画
  const startFlyingAnimation = (left: string, right: string, sum: string, onComplete: () => void) => {
    let progress = 0
    const animate = () => {
      progress += 0.02
      if (progress >= 1) {
        setFlyingFormula(null)
        onComplete()
        return
      }
      setFlyingFormula({ left, right, sum, progress, startX: 280, startY: 150 })
      flyingAnimRef.current = requestAnimationFrame(animate)
    }
    setFlyingFormula({ left, right, sum, progress: 0, startX: 280, startY: 150 })
    flyingAnimRef.current = requestAnimationFrame(animate)
  }
  
  // 验证结果动画 - 不自动消失，等待点击“再试一次”
  const startValidationAnimation = (valid: boolean, message: string) => {
    let progress = 0
    const animate = () => {
      progress += 0.025
      if (progress >= 1) {
        // 动画完成后保持显示，不自动消失
        setValidationResult({ valid, message, progress: 1, scale: 1 })
        return
      }
      setValidationResult({ valid, message, progress, scale: 0.3 + progress * 0.7 })
      validationAnimRef.current = requestAnimationFrame(animate)
    }
    setValidationResult({ valid, message, progress: 0, scale: 0.3 })
    validationAnimRef.current = requestAnimationFrame(animate)
  }
  
  // 提交验证
  const handleSubmit = () => {
    playClick() // 点击音效
    const left = parseInt(leftNum)
    const right = parseInt(rightNum)
    const sum = parseInt(sumNum)
    
    if (isNaN(left) || isNaN(right) || isNaN(sum)) {
      startValidationAnimation(false, '请填写完整的算式！')
      playError()
      return
    }
    
    // 开始飞入动画
    startFlyingAnimation(leftNum, rightNum, sumNum, () => {
      // 飞入完成后进行验证
      const validation = validateFormula(left, right, sum)
      startValidationAnimation(validation.valid, validation.message)
      
      if (!validation.valid) {
        playError() // 错误音效
      }
      
      if (validation.valid) {
        // 检查是否已经找到过这个算式
        const alreadyFound = foundFormulas.some(
          f => (f.left === left && f.right === right) || (f.left === right && f.right === left)
        )
        
        if (!alreadyFound) {
          playSuccess() // 成功音效
          const newFoundFormulas = [...foundFormulas, { left, right }]
          setFoundFormulas(newFoundFormulas)
          
          // 庆祝效果
          setTimeout(() => {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
              colors: [COLORS.green, COLORS.yellow, COLORS.orange]
            })
          }, 500)
          
          // 检查是否完成
          if (newFoundFormulas.length >= 2) {
            setTimeout(() => {
              // setShowSuccess(true)
              confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.5 },
                colors: [COLORS.green, COLORS.yellow, COLORS.orange, COLORS.cyan]
              })
            }, 2000)
          }
        } else {
          setTimeout(() => {
            startValidationAnimation(true, '✅ 正确！但这个算式已经找到过了，试试其他的吧！')
          }, 1800)
        }
      }
    })
  }
  
  // 重置
  const handleReset = () => {
    playClick() // 点击音效
    setLeftNum('')
    setRightNum('')
    setSumNum('')
    setActiveInput('left')
    setValidationResult(null)
  }
  
  // 清理动画
  useEffect(() => {
    return () => {
      cancelAnimationFrame(flyingAnimRef.current)
      cancelAnimationFrame(validationAnimRef.current)
    }
  }, [])
  
  return (
    <Container>
      <BackgroundImage />
      <ParticleBackground />
      
      
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HeaderContent>
          <StageTag>🔮 第二关</StageTag>
          <Title>算式创造关</Title>
          <Subtitle>找出所有和为 44 的反转数对，解锁密室第二道门！</Subtitle>
        </HeaderContent>
      </Header>
      
      <MainContent>
        {/* 左侧 - 已找到的算式和提示 */}
        <LeftSection>
          {/* 已找到的算式 */}
          <Card
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardTitle>
              <span>✨</span> 魔法能量
            </CardTitle>
            
            {/* 能量分数显示 */}
            <EnergyDisplay>
              <EnergyNumber>{foundFormulas.length * 10}</EnergyNumber>
              <EnergyLabel>能量值</EnergyLabel>
            </EnergyDisplay>
            
            <TipBox>
              💡 <strong>规律提示</strong><br/>
              个位+个位=<strong>4</strong>，十位+十位=<strong>4</strong>！
            </TipBox>
          </Card>
        </LeftSection>
        
        {/* 中间 - 魔法台 Canvas */}
        <CenterSection>
          <GlassContainer>
            <MagicPlatformCanvas
              energy={foundFormulas.length}
              flyingFormula={flyingFormula}
              validationResult={validationResult}
              onValidationComplete={() => {}}
            />
          </GlassContainer>
        </CenterSection>
        
        {/* 右侧 - 输入框、按钮和键盘 */}
        <RightSection>
          {/* 输入框卡片 */}
          <Card
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CardTitle>
              <span>✏️</span> 输入算式
            </CardTitle>
            
            <FormulaInputRow>
              <NumberInputBox
                active={activeInput === 'left'}
                onClick={() => setActiveInput('left')}
              >
                {leftNum || <NumberInputPlaceholder>?</NumberInputPlaceholder>}
              </NumberInputBox>
              <OperatorDisplay>+</OperatorDisplay>
              <NumberInputBox
                active={activeInput === 'right'}
                onClick={() => setActiveInput('right')}
              >
                {rightNum || <NumberInputPlaceholder>?</NumberInputPlaceholder>}
              </NumberInputBox>
              <OperatorDisplay>=</OperatorDisplay>
              <NumberInputBox
                active={activeInput === 'sum'}
                onClick={() => setActiveInput('sum')}
              >
                {sumNum || <NumberInputPlaceholder>?</NumberInputPlaceholder>}
              </NumberInputBox>
            </FormulaInputRow>
          </Card>
          
          {/* 数字键盘 */}
          <KeypadCard
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <KeypadGrid>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <KeypadButton
                  key={num}
                  onClick={() => handleKeypadClick(String(num))}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {num}
                </KeypadButton>
              ))}
              <KeypadButton
                variant="action"
                onClick={() => handleKeypadClick('clear')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                C
              </KeypadButton>
              <KeypadButton
                onClick={() => handleKeypadClick('0')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                0
              </KeypadButton>
              <KeypadButton
                variant="action"
                onClick={() => handleKeypadClick('del')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                ⌫
              </KeypadButton>
            </KeypadGrid>
            
            <ActiveInputHint active={!!activeInput}>
              {activeInput === 'left' && '👉 输入第一个数'}
              {activeInput === 'right' && '👉 输入第二个数'}
              {activeInput === 'sum' && '👉 输入答案'}
              {!activeInput && '点击算式框选择'}
            </ActiveInputHint>
          </KeypadCard>
          
          {/* 验证按钮放在最下面 */}
          <SubmitButton
            onClick={validationResult ? handleReset : handleSubmit}
            disabled={!validationResult && (!leftNum || !rightNum || !sumNum || !!flyingFormula)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {flyingFormula ? '🔮 验证中...' : validationResult ? '🔄 再试一次' : '⚡ 闪电验证'}
          </SubmitButton>
        </RightSection>
      </MainContent>
      
    </Container>
  )
}
