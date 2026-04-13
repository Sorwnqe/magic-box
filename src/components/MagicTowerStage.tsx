import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import confetti from 'canvas-confetti'
import { 
  GiLockedDoor, 
  GiOpenGate,
  GiKey,
  GiSparkles,
  GiCastle
} from 'react-icons/gi'
import { 
  FaStar,
  FaCrown
} from 'react-icons/fa'
import { backgrounds, characters, items, zootopiaColors } from '../assets/images'

// 配色 - 动物城主题
const COLORS = {
  ...zootopiaColors,
  purple: '#7c3aed',
  deepPurple: '#5b21b6',
  gold: '#fbbf24',
  orange: '#f97316',
  cyan: '#06b6d4',
  green: '#22c55e',
  pink: '#ec4899',
  red: '#ef4444'
}

// 所有和为99的反转数对
// const ALL_FORMULAS = [
//   { left: 18, right: 81, sum: 99 },
//   { left: 27, right: 72, sum: 99 },
//   { left: 36, right: 63, sum: 99 },
//   { left: 45, right: 54, sum: 99 },
// ]

// 通关需要找到的数量
const REQUIRED_COUNT = 4

// 判断是否是反转数对
function isReversePair(a: number, b: number): boolean {
  if (a < 10 || a > 99 || b < 10 || b > 99) return false
  const aReversed = (a % 10) * 10 + Math.floor(a / 10)
  return aReversed === b
}

// 验证密码
function validatePassword(left: number, right: number, sum: number): {
  valid: boolean
  message: string
} {
  const isPair = isReversePair(left, right)
  const sumCorrect = left + right === sum
  const sumIs99 = sum === 99
  
  if (isPair && sumCorrect && sumIs99) {
    return {
      valid: true,
      message: '🎉 密码正确！魔法塔能量+1！'
    }
  } else if (!sumIs99 && sumCorrect && isPair) {
    return {
      valid: false,
      message: `⚠️ 这是反转数对，但和是 ${sum}，不是 99！`
    }
  } else if (isPair && !sumCorrect) {
    return {
      valid: false,
      message: `🤔 计算有误：${left} + ${right} = ${left + right}，不是 ${sum}`
    }
  } else if (!isPair && sumIs99) {
    return {
      valid: false,
      message: `😅 和是99，但 ${left} 和 ${right} 不是反转数对！`
    }
  } else {
    return {
      valid: false,
      message: '❌ 密码错误！检查：1. 两个数是反转数对吗？ 2. 和等于99吗？'
    }
  }
}

// 鼓励语
const CORRECT_MESSAGES = [
  '太厉害了！',
  '完美！你真棒！',
  '答对啦！继续加油！',
  '密码正确！',
  '你掌握规律了！'
]

const WRONG_MESSAGES = [
  '没关系，再试一次！',
  '加油！你可以的！',
  '别灰心，检查一下~',
  '差一点点，再想想！',
  '仔细看看规律哦~'
]

// 背景粒子特效 - 魔法塔主题
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
    
    const colors = ['#7c3aed', '#fbbf24', '#06b6d4', '#ec4899', '#a78bfa']
    const symbols = ['9', '9', '✨', '⭐', '🔑', '🏰', '🗝️', '💫', '⚡']
    
    const particles: Particle[] = []
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 20 + 14,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.35 + 0.1,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.04 + 0.01
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

// 飞入的算式
interface FlyingFormula {
  left: string
  right: string
  sum: string
  progress: number
  startX: number
  startY: number
}

// 验证结果
interface ValidationResult {
  valid: boolean
  message: string
  progress: number
}

// 魔法塔 Canvas 组件 - 2D绘制 (更华丽版本)
function MagicTowerCanvas({
  energy,
  isUnlocking,
  isUnlocked,
  flyingFormula,
  validationResult
}: {
  energy: number
  isUnlocking: boolean
  isUnlocked: boolean
  flyingFormula: FlyingFormula | null
  validationResult: ValidationResult | null
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const floatPhaseRef = useRef(0)
  const doorAngleRef = useRef(0)
  const particlesRef = useRef<Array<{
    x: number
    y: number
    vx: number
    vy: number
    size: number
    color: string
    alpha: number
    life: number
    type: 'star' | 'magic'
  }>>([])
  const messageRef = useRef<string>('')
  
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
    const cy = h * 0.52
    
    ctx.clearRect(0, 0, w, h)
    
    // 更新动画相位
    floatPhaseRef.current += 0.018
    const floatY = Math.sin(floatPhaseRef.current) * 6
    const pulse = Math.sin(floatPhaseRef.current * 1.5) * 0.12 + 0.88
    const glowPulse = Math.sin(floatPhaseRef.current * 2) * 0.3 + 0.7
    
    // 门的动画
    if (isUnlocked) {
      doorAngleRef.current += (Math.PI / 3 - doorAngleRef.current) * 0.03
    } else if (isUnlocking) {
      doorAngleRef.current = Math.sin(floatPhaseRef.current * 10) * 0.08
    }
    
    // ===== 绘制魔法塔 =====
    const towerY = cy + floatY
    const towerScale = Math.min(w, h) / 520
    
    ctx.save()
    ctx.translate(cx, towerY)
    ctx.scale(towerScale, towerScale)
    
    // ===== 外层魔法光环 =====
    for (let ring = 0; ring < 3; ring++) {
      const ringRadius = 230 + ring * 25
      const ringAlpha = (0.15 - ring * 0.04) * glowPulse
      const ringColor = ring === 0 ? '#7c3aed' : ring === 1 ? '#fbbf24' : '#ec4899'
      
      ctx.save()
      ctx.rotate(floatPhaseRef.current * (0.3 - ring * 0.1) * (ring % 2 === 0 ? 1 : -1))
      ctx.strokeStyle = ringColor
      ctx.lineWidth = 2
      ctx.globalAlpha = ringAlpha
      ctx.setLineDash([15, 10])
      ctx.beginPath()
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    }
    
    // 外层光晕
    const outerGlow = ctx.createRadialGradient(0, 0, 80, 0, 0, 280)
    outerGlow.addColorStop(0, `rgba(124, 58, 237, ${0.35 * pulse})`)
    outerGlow.addColorStop(0.3, `rgba(251, 191, 36, ${0.2 * pulse})`)
    outerGlow.addColorStop(0.6, `rgba(236, 72, 153, ${0.1 * pulse})`)
    outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = outerGlow
    ctx.beginPath()
    ctx.arc(0, 0, 280, 0, Math.PI * 2)
    ctx.fill()
    
    // ===== 地面魔法阵 =====
    ctx.save()
    ctx.translate(0, 115)
    ctx.scale(1, 0.3)
    ctx.rotate(floatPhaseRef.current * 0.5)
    
    // 魔法阵圈
    for (let i = 0; i < 3; i++) {
      const radius = 140 - i * 30
      ctx.strokeStyle = `rgba(251, 191, 36, ${0.4 - i * 0.1})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.stroke()
    }
    
    // 魔法阵符文
    const runeCount = 8
    ctx.fillStyle = 'rgba(251, 191, 36, 0.6)'
    ctx.font = 'bold 16px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (let i = 0; i < runeCount; i++) {
      const angle = (i / runeCount) * Math.PI * 2
      const rx = Math.cos(angle) * 120
      const ry = Math.sin(angle) * 120
      ctx.fillText('✦', rx, ry)
    }
    ctx.restore()
    
    // ===== 塔基 - 更精致 =====
    // 塔基底座
    const baseGrad = ctx.createLinearGradient(-110, 95, 110, 95)
    baseGrad.addColorStop(0, '#3730a3')
    baseGrad.addColorStop(0.5, '#4c1d95')
    baseGrad.addColorStop(1, '#3730a3')
    ctx.fillStyle = baseGrad
    ctx.beginPath()
    ctx.moveTo(-110, 105)
    ctx.lineTo(110, 105)
    ctx.lineTo(95, 75)
    ctx.lineTo(-95, 75)
    ctx.closePath()
    ctx.fill()
    
    // 塔基边框和装饰
    ctx.strokeStyle = '#a78bfa'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // 塔基宝石装饰
    const baseGems = [-60, -30, 0, 30, 60]
    baseGems.forEach((x, i) => {
      const gemGlow = ctx.createRadialGradient(x, 90, 2, x, 90, 12)
      gemGlow.addColorStop(0, '#fbbf24')
      gemGlow.addColorStop(1, 'rgba(251, 191, 36, 0)')
      ctx.fillStyle = gemGlow
      ctx.beginPath()
      ctx.arc(x, 90, 12, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = energy > i ? '#fbbf24' : '#64748b'
      ctx.beginPath()
      ctx.arc(x, 90, 5, 0, Math.PI * 2)
      ctx.fill()
    })
    
    // ===== 塔身 - 更立体 =====
    // 塔身主体
    const bodyGrad = ctx.createLinearGradient(-85, 0, 85, 0)
    bodyGrad.addColorStop(0, '#312e81')
    bodyGrad.addColorStop(0.2, '#4c1d95')
    bodyGrad.addColorStop(0.5, '#5b21b6')
    bodyGrad.addColorStop(0.8, '#4c1d95')
    bodyGrad.addColorStop(1, '#312e81')
    ctx.fillStyle = bodyGrad
    ctx.beginPath()
    ctx.moveTo(-95, 75)
    ctx.lineTo(95, 75)
    ctx.lineTo(72, -85)
    ctx.lineTo(-72, -85)
    ctx.closePath()
    ctx.fill()
    
    // 塔身边框
    ctx.strokeStyle = '#7c3aed'
    ctx.lineWidth = 3
    ctx.stroke()
    
    // 塔身装饰线条
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.4)'
    ctx.lineWidth = 1
    for (let i = 1; i <= 3; i++) {
      const y = 75 - i * 40
      const width = 95 - i * 8
      ctx.beginPath()
      ctx.moveTo(-width, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    // ===== 塔身窗户 - 更华丽 =====
    const drawWindow = (x: number, y: number, size: number) => {
      // 窗户光晕
      if (isUnlocked) {
        const winGlow = ctx.createRadialGradient(x, y, size * 0.3, x, y, size * 2)
        winGlow.addColorStop(0, 'rgba(251, 191, 36, 0.8)')
        winGlow.addColorStop(1, 'rgba(251, 191, 36, 0)')
        ctx.fillStyle = winGlow
        ctx.beginPath()
        ctx.arc(x, y, size * 2, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // 窗户本体
      ctx.fillStyle = isUnlocked ? '#fbbf24' : '#1e1b4b'
      ctx.strokeStyle = '#c4b5fd'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      
      // 窗户十字
      ctx.strokeStyle = isUnlocked ? '#f59e0b' : '#4c1d95'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x - size * 0.6, y)
      ctx.lineTo(x + size * 0.6, y)
      ctx.moveTo(x, y - size * 0.6)
      ctx.lineTo(x, y + size * 0.6)
      ctx.stroke()
    }
    
    // 上排窗户
    drawWindow(-40, -50, 10)
    drawWindow(0, -55, 12)
    drawWindow(40, -50, 10)
    
    // 中排窗户
    drawWindow(-55, 0, 13)
    drawWindow(55, 0, 13)
    
    // 下排窗户
    drawWindow(-45, 45, 10)
    drawWindow(45, 45, 10)
    
    // ===== 塔顶 - 更尖锐华丽 =====
    // 塔顶底座
    ctx.fillStyle = '#5b21b6'
    ctx.beginPath()
    ctx.moveTo(-75, -85)
    ctx.lineTo(75, -85)
    ctx.lineTo(65, -100)
    ctx.lineTo(-65, -100)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#a78bfa'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // 塔顶主体
    const roofGrad = ctx.createLinearGradient(0, -210, 0, -100)
    roofGrad.addColorStop(0, isUnlocked ? '#fbbf24' : '#8b5cf6')
    roofGrad.addColorStop(0.5, isUnlocked ? '#f97316' : '#7c3aed')
    roofGrad.addColorStop(1, isUnlocked ? '#ea580c' : '#5b21b6')
    ctx.fillStyle = roofGrad
    ctx.beginPath()
    ctx.moveTo(0, -210)
    ctx.lineTo(-68, -100)
    ctx.lineTo(68, -100)
    ctx.closePath()
    ctx.fill()
    
    // 塔顶边框
    ctx.strokeStyle = isUnlocked ? '#fbbf24' : '#a78bfa'
    ctx.lineWidth = 3
    ctx.stroke()
    
    // 塔顶装饰线
    ctx.strokeStyle = isUnlocked ? 'rgba(251, 191, 36, 0.5)' : 'rgba(167, 139, 250, 0.4)'
    ctx.lineWidth = 1
    for (let i = 1; i <= 4; i++) {
      const y = -100 - i * 25
      const halfWidth = 68 - i * 15
      ctx.beginPath()
      ctx.moveTo(-halfWidth, y)
      ctx.lineTo(halfWidth, y)
      ctx.stroke()
    }
    
    // ===== 塔尖宝石 - 更闪耀 =====
    ctx.save()
    ctx.translate(0, -220)
    
    // 多层光晕
    for (let i = 3; i >= 0; i--) {
      const glowSize = 25 + i * 12
      const glowAlpha = (0.3 - i * 0.06) * glowPulse
      const gemGlow = ctx.createRadialGradient(0, 0, 5, 0, 0, glowSize)
      gemGlow.addColorStop(0, isUnlocked ? `rgba(251, 191, 36, ${glowAlpha})` : `rgba(124, 58, 237, ${glowAlpha})`)
      gemGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = gemGlow
      ctx.beginPath()
      ctx.arc(0, 0, glowSize, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // 宝石本体
    const gemBodyGrad = ctx.createLinearGradient(-15, -18, 15, 18)
    gemBodyGrad.addColorStop(0, isUnlocked ? '#fef3c7' : '#c4b5fd')
    gemBodyGrad.addColorStop(0.5, isUnlocked ? '#fbbf24' : '#a78bfa')
    gemBodyGrad.addColorStop(1, isUnlocked ? '#f59e0b' : '#7c3aed')
    ctx.fillStyle = gemBodyGrad
    ctx.strokeStyle = isUnlocked ? '#fef3c7' : '#e9d5ff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, -18)
    ctx.lineTo(15, 0)
    ctx.lineTo(0, 18)
    ctx.lineTo(-15, 0)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // 宝石高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.beginPath()
    ctx.moveTo(-3, -10)
    ctx.lineTo(5, -3)
    ctx.lineTo(0, -5)
    ctx.closePath()
    ctx.fill()
    
    ctx.restore()
    
    // ===== 大门 - 更精致 =====
    ctx.save()
    ctx.translate(0, 52)
    
    // 门框装饰
    ctx.fillStyle = '#78350f'
    ctx.beginPath()
    ctx.roundRect(-42, -58, 84, 62, [8, 8, 0, 0])
    ctx.fill()
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // 门框顶部装饰
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(0, -58, 15, Math.PI, 0)
    ctx.fill()
    ctx.fillStyle = '#7c3aed'
    ctx.beginPath()
    ctx.arc(0, -58, 8, 0, Math.PI * 2)
    ctx.fill()
    
    // 门（带开门动画）
    ctx.save()
    ctx.translate(-35, 0)
    ctx.transform(1, 0, Math.sin(doorAngleRef.current) * 0.4, 1, 0, 0)
    
    const doorGrad = ctx.createLinearGradient(0, -50, 65, -50)
    doorGrad.addColorStop(0, isUnlocked ? '#fbbf24' : '#92400e')
    doorGrad.addColorStop(0.5, isUnlocked ? '#f59e0b' : '#78350f')
    doorGrad.addColorStop(1, isUnlocked ? '#d97706' : '#451a03')
    ctx.fillStyle = doorGrad
    ctx.beginPath()
    ctx.roundRect(2, -52, 66, 56, [6, 6, 0, 0])
    ctx.fill()
    
    // 门板装饰
    ctx.strokeStyle = isUnlocked ? '#fef3c7' : '#b45309'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(8, -46, 24, 22, 3)
    ctx.stroke()
    ctx.beginPath()
    ctx.roundRect(38, -46, 24, 22, 3)
    ctx.stroke()
    ctx.beginPath()
    ctx.roundRect(8, -18, 24, 18, 3)
    ctx.stroke()
    ctx.beginPath()
    ctx.roundRect(38, -18, 24, 18, 3)
    ctx.stroke()
    
    // 门把手
    ctx.fillStyle = isUnlocked ? '#fef3c7' : '#d97706'
    ctx.beginPath()
    ctx.arc(58, -24, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = isUnlocked ? '#fbbf24' : '#92400e'
    ctx.beginPath()
    ctx.arc(58, -24, 3, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.restore()
    
    // 门内光芒（开门后）
    if (isUnlocked && doorAngleRef.current > 0.1) {
      const innerGlow = ctx.createRadialGradient(0, -25, 10, 0, -25, 50)
      innerGlow.addColorStop(0, `rgba(251, 191, 36, ${doorAngleRef.current * 0.8})`)
      innerGlow.addColorStop(1, 'rgba(251, 191, 36, 0)')
      ctx.fillStyle = innerGlow
      ctx.beginPath()
      ctx.arc(0, -25, 50, 0, Math.PI * 2)
      ctx.fill()
    }
    
    ctx.restore()
    
    // ===== 中心 "99" 数字 =====
    ctx.save()
    ctx.translate(0, 15)
    
    // 核心能量环
    ctx.save()
    ctx.rotate(floatPhaseRef.current * 0.8)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const orbX = Math.cos(angle) * 55
      const orbY = Math.sin(angle) * 55
      
      const orbGlow = ctx.createRadialGradient(orbX, orbY, 2, orbX, orbY, 12)
      orbGlow.addColorStop(0, energy >= REQUIRED_COUNT ? '#22c55e' : '#fbbf24')
      orbGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = orbGlow
      ctx.beginPath()
      ctx.arc(orbX, orbY, 12, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = energy >= REQUIRED_COUNT ? '#22c55e' : '#fbbf24'
      ctx.beginPath()
      ctx.arc(orbX, orbY, 4, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
    
    // 核心光晕
    const coreGlow = ctx.createRadialGradient(0, 0, 15, 0, 0, 55)
    const coreColor = energy >= REQUIRED_COUNT ? 'rgba(34, 197, 94,' : 'rgba(251, 191, 36,'
    coreGlow.addColorStop(0, coreColor + `${0.95 * pulse})`)
    coreGlow.addColorStop(0.5, coreColor + `${0.5 * pulse})`)
    coreGlow.addColorStop(1, coreColor + '0)')
    ctx.fillStyle = coreGlow
    ctx.beginPath()
    ctx.arc(0, 0, 55, 0, Math.PI * 2)
    ctx.fill()
    
    // 核心圆
    const coreBg = ctx.createRadialGradient(0, -8, 0, 0, 0, 42)
    coreBg.addColorStop(0, energy >= REQUIRED_COUNT ? '#4ade80' : '#fde047')
    coreBg.addColorStop(0.7, energy >= REQUIRED_COUNT ? '#22c55e' : '#fbbf24')
    coreBg.addColorStop(1, energy >= REQUIRED_COUNT ? '#16a34a' : '#f59e0b')
    ctx.fillStyle = coreBg
    ctx.strokeStyle = energy >= REQUIRED_COUNT ? '#86efac' : '#fef08a'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(0, 0, 42, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    
    // "99" 文字
    ctx.font = 'bold 38px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetY = 2
    ctx.fillText('99', 0, 2)
    ctx.shadowBlur = 0
    
    ctx.restore()
    
    ctx.restore() // 结束塔的绘制
    
    // ===== 绘制飞入的算式 =====
    if (flyingFormula) {
      const t = flyingFormula.progress
      const startX = flyingFormula.startX
      const startY = flyingFormula.startY
      const endX = cx
      const endY = towerY + 15 * towerScale
      
      // 贝塞尔曲线
      const cp1X = startX - 120
      const cp1Y = startY - 200
      const cp2X = endX + 120
      const cp2Y = endY - 150
      
      const mt = 1 - t
      const x = mt*mt*mt*startX + 3*mt*mt*t*cp1X + 3*mt*t*t*cp2X + t*t*t*endX
      const y = mt*mt*mt*startY + 3*mt*mt*t*cp1Y + 3*mt*t*t*cp2Y + t*t*t*endY
      
      const scale = 1.2 - t * 0.4
      const rotation = t * Math.PI * 2.5
      
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation * 0.25)
      ctx.scale(scale, scale)
      
      ctx.shadowColor = '#fbbf24'
      ctx.shadowBlur = 40
      
      const bgGrad = ctx.createLinearGradient(-90, 0, 90, 0)
      bgGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)')
      bgGrad.addColorStop(0.5, 'rgba(254, 243, 199, 0.98)')
      bgGrad.addColorStop(1, 'rgba(255, 255, 255, 0.98)')
      ctx.fillStyle = bgGrad
      ctx.beginPath()
      ctx.roundRect(-90, -30, 180, 60, 15)
      ctx.fill()
      
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.shadowBlur = 0
      
      ctx.font = 'bold 28px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#7c3aed'
      ctx.fillText(`${flyingFormula.left} + ${flyingFormula.right} = ${flyingFormula.sum}`, 0, 2)
      
      ctx.restore()
      
      // 生成星星粒子
      if (Math.random() < 0.7 && particlesRef.current.length < 50) {
        const colors = ['#fbbf24', '#7c3aed', '#22c55e', '#ec4899', '#06b6d4']
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 50,
          y: y + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 6,
          vy: -Math.random() * 5 - 2,
          size: Math.random() * 12 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          life: 60,
          type: 'magic'
        })
      }
    }
    
    // ===== 绘制验证结果 =====
    if (validationResult) {
      const t = validationResult.progress
      const ease = 1 - Math.pow(1 - t, 4)
      const scale = 0.2 + ease * 0.8
      const isValid = validationResult.valid
      
      // 只在第一次设置消息
      if (t < 0.1 && !messageRef.current) {
        const messages = isValid ? CORRECT_MESSAGES : WRONG_MESSAGES
        messageRef.current = messages[Math.floor(Math.random() * messages.length)]
      }
      
      ctx.save()
      ctx.translate(cx, cy - 60)
      ctx.scale(scale, scale)
      ctx.globalAlpha = ease
      
      // 结果背景光晕
      const resultGlow = ctx.createRadialGradient(0, 0, 30, 0, 0, 140)
      if (isValid) {
        resultGlow.addColorStop(0, 'rgba(34, 197, 94, 0.98)')
        resultGlow.addColorStop(0.6, 'rgba(22, 163, 74, 0.9)')
        resultGlow.addColorStop(1, 'rgba(21, 128, 61, 0.7)')
      } else {
        resultGlow.addColorStop(0, 'rgba(239, 68, 68, 0.98)')
        resultGlow.addColorStop(0.6, 'rgba(220, 38, 38, 0.9)')
        resultGlow.addColorStop(1, 'rgba(185, 28, 28, 0.7)')
      }
      ctx.fillStyle = resultGlow
      ctx.beginPath()
      ctx.arc(0, 0, 85, 0, Math.PI * 2)
      ctx.fill()
      
      // 结果边框
      ctx.strokeStyle = isValid ? '#86efac' : '#fca5a5'
      ctx.lineWidth = 5
      ctx.stroke()
      
      // 装饰环
      ctx.save()
      ctx.rotate(floatPhaseRef.current * 2)
      ctx.strokeStyle = isValid ? 'rgba(134, 239, 172, 0.5)' : 'rgba(252, 165, 165, 0.5)'
      ctx.lineWidth = 2
      ctx.setLineDash([8, 8])
      ctx.beginPath()
      ctx.arc(0, 0, 100, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
      
      // 结果图标
      ctx.font = 'bold 55px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 4
      ctx.fillText(isValid ? '✓' : '✗', 0, -5)
      ctx.shadowBlur = 0
      
      // 鼓励语
      ctx.font = 'bold 20px system-ui'
      ctx.fillStyle = '#ffffff'
      ctx.fillText(messageRef.current, 0, 115)
      
      ctx.restore()
    } else {
      // 重置消息
      messageRef.current = ''
    }
    
    // ===== 更新并绘制粒子 =====
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.08
      p.alpha -= 0.018
      p.life--
      
      if (p.life > 0 && p.alpha > 0) {
        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.font = `${p.size}px system-ui`
        ctx.textAlign = 'center'
        ctx.fillText(p.type === 'magic' ? '✦' : '★', p.x, p.y)
        ctx.restore()
        return true
      }
      return false
    })
    
    // 解锁粒子效果
    if (isUnlocking || isUnlocked) {
      const count = isUnlocked ? 4 : 2
      for (let i = 0; i < count; i++) {
        if (particlesRef.current.length < 100) {
          const angle = Math.random() * Math.PI * 2
          const radius = 80 + Math.random() * 60
          particlesRef.current.push({
            x: cx + Math.cos(angle) * radius,
            y: cy + floatY + Math.sin(angle) * radius,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 4 - 1,
            size: Math.random() * 14 + 8,
            color: isUnlocked ? ['#fbbf24', '#fef3c7', '#f59e0b'][Math.floor(Math.random() * 3)] : '#06b6d4',
            alpha: 1,
            life: 70,
            type: 'star'
          })
        }
      }
    }
    
    animationRef.current = requestAnimationFrame(draw)
  }, [energy, isUnlocking, isUnlocked, flyingFormula, validationResult])
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    
    resize()
    window.addEventListener('resize', resize)
    animationRef.current = requestAnimationFrame(draw)
    
    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [draw])
  
  return <MagicCanvas ref={canvasRef} />
}

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
  background-image: url(${backgrounds.cityHallTower});
  background-size: cover;
  background-position: center;
  z-index: 0;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(91, 33, 182, 0.4) 0%, rgba(124, 58, 237, 0.3) 100%);
  }
`

const CharacterGuide = styled(motion.div)`
  position: fixed;
  bottom: 80px;
  left: 20px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`

const CharacterImg = styled.img`
  width: 120px;
  height: auto;
  filter: drop-shadow(0 5px 20px rgba(0,0,0,0.3));
`

const CharacterSpeech = styled(motion.div)`
  background: white;
  padding: 10px 14px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
  font-size: 0.85rem;
  color: ${COLORS.textPrimary};
  max-width: 160px;
  text-align: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid white;
  }
`

// 白色背景 Header
const Header = styled(motion.div)`
  text-align: center;
  padding: 10px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 0 0 20px 20px;
  margin: 0 auto;
  width: fit-content;
  padding: 10px 30px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
`

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const HeaderIcon = styled.img`
  width: 45px;
  height: 45px;
  object-fit: contain;
  filter: drop-shadow(0 3px 10px rgba(124, 58, 237, 0.4));
`

const Title = styled.h1`
  font-size: 1.5rem;
  background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.purple} 50%, ${COLORS.gold} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`

const Subtitle = styled.p`
  color: ${COLORS.textSecondary};
  font-size: 0.8rem;
  margin: 2px 0 0;
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 15px 25px 90px;
  z-index: 10;
`

// 三栏布局
const LeftPanel = styled.div`
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const CenterPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
`

const RightPanel = styled.div`
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

// 毛玻璃容器
const GlassContainer = styled.div`
  position: relative;
  width: 100%;
  height: calc(100% - 20px);
  max-height: calc(100vh - 220px);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(124, 58, 237, 0.15),
    inset 0 0 30px rgba(255, 255, 255, 0.1);
  overflow: hidden;
`

const MagicCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 6px 25px rgba(124, 58, 237, 0.15);
`

const CardTitle = styled.h3`
  color: ${COLORS.purple};
  font-size: 0.9rem;
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`

const PasswordList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
  padding-right: 4px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 2px;
  }
  &::-webkit-scrollbar-thumb {
    background: #a78bfa;
    border-radius: 2px;
  }
`

const PasswordItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${COLORS.green};
  border: 2px solid ${COLORS.green};
`

const EmptyHint = styled.div`
  padding: 20px;
  text-align: center;
  color: ${COLORS.textSecondary};
  font-size: 0.85rem;
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  border-radius: 10px;
  
  .icon {
    font-size: 2rem;
    margin-bottom: 8px;
  }
`

const ProgressBar = styled.div`
  margin-top: 10px;
  background: #e5e7eb;
  border-radius: 8px;
  height: 10px;
  overflow: hidden;
`

const ProgressFill = styled(motion.div)<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, ${COLORS.purple}, ${COLORS.gold});
  border-radius: 8px;
  width: ${props => props.progress}%;
`

const TipBox = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 10px;
  font-size: 0.8rem;
  color: #92400e;
  text-align: center;
`

const EnergyDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 12px;
  margin-top: 10px;
`

const EnergyNumber = styled.span`
  font-size: 1.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, ${COLORS.purple}, ${COLORS.gold});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const EnergyLabel = styled.span`
  font-size: 0.85rem;
  color: #92400e;
`

// 输入卡片
const InputCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 6px 25px rgba(124, 58, 237, 0.15);
`

const FormulaInputRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
`

const NumberInputBox = styled.div<{ active?: boolean; hasError?: boolean; disabled?: boolean }>`
  width: 60px;
  height: 50px;
  border: 3px solid ${props => props.hasError ? COLORS.red : props.active ? COLORS.gold : '#a78bfa'};
  border-radius: 12px;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLORS.purple};
  background: ${props => props.disabled ? '#f1f5f9' : props.hasError ? '#fef2f2' : props.active ? '#fef3c7' : '#faf5ff'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 0 20px rgba(251, 191, 36, 0.4)' : '0 2px 6px rgba(124, 58, 237, 0.1)'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  &:hover {
    border-color: ${props => props.disabled ? '' : COLORS.gold};
    transform: ${props => props.disabled ? 'none' : 'scale(1.02)'};
  }
`

const NumberInputPlaceholder = styled.span`
  color: #c4b5fd;
  font-size: 1rem;
`

const OperatorDisplay = styled.span`
  font-size: 1.4rem;
  color: ${COLORS.gold};
  font-weight: 700;
`

const SubmitButton = styled(motion.button)<{ disabled?: boolean }>`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  background: ${props => props.disabled 
    ? '#e5e7eb' 
    : `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.deepPurple} 50%, ${COLORS.pink} 100%)`};
  color: white;
  box-shadow: ${props => props.disabled 
    ? 'none' 
    : '0 4px 20px rgba(124, 58, 237, 0.4)'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(124, 58, 237, 0.5);
  }
`

const ResultCard = styled(motion.div)<{ type: 'success' | 'error' }>`
  padding: 12px;
  border-radius: 12px;
  margin-top: 10px;
  background: ${props => props.type === 'success' 
    ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' 
    : 'linear-gradient(135deg, #fef2f2, #fecaca)'};
  border: 2px solid ${props => props.type === 'success' ? COLORS.green : COLORS.red};
`

const ResultText = styled.p`
  font-size: 0.85rem;
  margin: 0;
  color: #374151;
  line-height: 1.4;
`

// 键盘卡片
const KeypadCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  padding: 14px;
  box-shadow: 0 6px 25px rgba(124, 58, 237, 0.15);
  flex: 1;
`

const KeypadTitle = styled.h3`
  color: ${COLORS.purple};
  font-size: 0.85rem;
  margin: 0 0 10px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`

const KeypadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
`

const KeypadButton = styled(motion.button)<{ variant?: 'number' | 'action' }>`
  height: 42px;
  border: none;
  border-radius: 10px;
  font-size: ${props => props.variant === 'action' ? '0.8rem' : '1.2rem'};
  font-weight: 700;
  cursor: pointer;
  background: ${props => props.variant === 'action' 
    ? `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.deepPurple})` 
    : 'linear-gradient(135deg, #f5f3ff, #ede9fe)'};
  color: ${props => props.variant === 'action' ? 'white' : COLORS.purple};
  box-shadow: 0 2px 6px rgba(124, 58, 237, 0.15);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
  }
  
  &:active {
    transform: translateY(0) scale(0.97);
  }
`

const ActiveInputHint = styled.div<{ active: boolean }>`
  margin-top: 8px;
  padding: 6px;
  background: ${props => props.active ? '#fef3c7' : '#f1f5f9'};
  border-radius: 8px;
  text-align: center;
  font-size: 0.75rem;
  color: ${props => props.active ? '#92400e' : '#94a3b8'};
`

const SuccessOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
`

const SuccessBanner = styled(motion.div)`
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
  padding: 50px 70px;
  border-radius: 30px;
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.5),
    0 0 100px rgba(124, 58, 237, 0.3),
    inset 0 0 60px rgba(251, 191, 36, 0.1);
  text-align: center;
  border: 3px solid rgba(251, 191, 36, 0.5);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(from 0deg, transparent, rgba(251, 191, 36, 0.1), transparent, rgba(124, 58, 237, 0.1), transparent);
    animation: rotate 10s linear infinite;
  }
  
  @keyframes rotate {
    100% { transform: rotate(360deg); }
  }
`

// 主组件
interface Props {
  onComplete?: () => void
}

export default function MagicTowerStage({ onComplete }: Props) {
  const [leftNum, setLeftNum] = useState('')
  const [rightNum, setRightNum] = useState('')
  const [sumNum, setSumNum] = useState('')
  const [activeInput, setActiveInput] = useState<'left' | 'right' | 'sum' | null>('left')
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null)
  const [foundPasswords, setFoundPasswords] = useState<Array<{ left: number; right: number }>>([])
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [flyingFormula, setFlyingFormula] = useState<FlyingFormula | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  
  const inputRef = useRef<HTMLDivElement>(null)
  
  // 检查密码是否已找到
  const isPasswordFound = (left: number, right: number) => {
    return foundPasswords.some(p => 
      (p.left === left && p.right === right) || 
      (p.left === right && p.right === left)
    )
  }
  
  // 键盘输入处理
  const handleKeypadClick = (value: string) => {
    if (!activeInput || isUnlocking || result) return
    
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
  
  // 验证密码
  const handleSubmit = () => {
    const left = parseInt(leftNum)
    const right = parseInt(rightNum)
    const sum = parseInt(sumNum)
    
    if (isNaN(left) || isNaN(right) || isNaN(sum)) {
      setResult({ valid: false, message: '请填写完整的密码算式！' })
      return
    }
    
    // 检查是否已找到过
    if (isPasswordFound(left, right)) {
      setResult({ valid: false, message: '这个密码你已经找到过了，试试其他的！' })
      return
    }
    
    setIsUnlocking(true)
    
    // 获取输入框位置，启动飞入动画
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setFlyingFormula({
        left: leftNum,
        right: rightNum,
        sum: sumNum,
        progress: 0,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2
      })
    }
    
    // 飞入动画
    let progress = 0
    const flyInterval = setInterval(() => {
      progress += 0.025
      if (progress >= 1) {
        clearInterval(flyInterval)
        setFlyingFormula(null)
        
        const validation = validatePassword(left, right, sum)
        
        // 显示验证结果
        let resultProgress = 0
        setValidationResult({ ...validation, progress: 0 })
        const resultInterval = setInterval(() => {
          resultProgress += 0.05
          if (resultProgress >= 1) {
            clearInterval(resultInterval)
            setResult(validation)
            setIsUnlocking(false)
            
            if (validation.valid) {
              // 添加到已找到列表
              const newFound = [...foundPasswords, { left, right }]
              setFoundPasswords(newFound)
              
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: [COLORS.gold, COLORS.purple, COLORS.pink]
              })
              
              // 检查是否达到通关条件
              if (newFound.length >= REQUIRED_COUNT && !isUnlocked) {
                setIsUnlocked(true)
                setTimeout(() => {
                  setShowSuccess(true)
                  confetti({
                    particleCount: 200,
                    spread: 120,
                    origin: { y: 0.5 },
                    colors: [COLORS.gold, COLORS.purple, COLORS.pink, COLORS.cyan]
                  })
                }, 1500)
              }
            }
            
            // 清除验证结果动画
            setTimeout(() => setValidationResult(null), 2000)
          } else {
            setValidationResult({ ...validation, progress: resultProgress })
          }
        }, 30)
      } else {
        setFlyingFormula(prev => prev ? { ...prev, progress } : null)
      }
    }, 20)
  }
  
  // 重置 - 点击再试一次时调用
  const handleReset = () => {
    setLeftNum('')
    setRightNum('')
    setSumNum('')
    setResult(null)
    setValidationResult(null)
    setActiveInput('left')
  }
  
  // 继续（正确后）
  const handleContinue = () => {
    setLeftNum('')
    setRightNum('')
    setSumNum('')
    setResult(null)
    setActiveInput('left')
  }
  
  const progress = Math.min((foundPasswords.length / REQUIRED_COUNT) * 100, 100)
  
  return (
    <Container>
      <BackgroundImage />
      <ParticleBackground />
      
      {/* 狮子市长角色 */}
      <CharacterGuide
        initial={{ x: -150, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <CharacterSpeech>
          🦁 找到{REQUIRED_COUNT}个和为99的密码！
        </CharacterSpeech>
        <CharacterImg src={characters.lionheart} alt="Lionheart" />
      </CharacterGuide>
      
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HeaderContent>
          <HeaderIcon src={items.magicKey} alt="魔法钥匙" />
          <div>
            <Title>
              <GiCastle size={24} />
              第四关：九十九魔法塔
              <GiCastle size={24} />
            </Title>
            <Subtitle>🔒 输入密码算式，打开魔法塔大门！</Subtitle>
          </div>
        </HeaderContent>
      </Header>
      
      <MainContent>
        {/* 左侧 - 已找到的密码列表 */}
        <LeftPanel>
          <Card
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardTitle>
              <GiKey size={18} /> 已找到 ({foundPasswords.length}/{REQUIRED_COUNT})
            </CardTitle>
            
            {foundPasswords.length > 0 ? (
              <PasswordList>
                {foundPasswords.map((p, index) => (
                  <PasswordItem
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <FaStar color={COLORS.gold} size={14} />
                    {p.left} + {p.right} = 99
                  </PasswordItem>
                ))}
              </PasswordList>
            ) : (
              <EmptyHint>
                <div className="icon"><GiLockedDoor /></div>
                还没找到密码哦~<br />快输入试试吧！
              </EmptyHint>
            )}
            
            <ProgressBar>
              <ProgressFill 
                progress={progress}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </ProgressBar>
            
            <EnergyDisplay>
              <EnergyNumber>{foundPasswords.length * 25}</EnergyNumber>
              <EnergyLabel>能量值</EnergyLabel>
            </EnergyDisplay>
            
            <TipBox>
              💡 <strong>规律</strong>：个位相加得 <strong>9</strong>，十位相加得 <strong>9</strong>！
            </TipBox>
          </Card>
        </LeftPanel>
        
        {/* 中间 - Canvas魔法塔 */}
        <CenterPanel>
          <GlassContainer>
            <MagicTowerCanvas 
              energy={foundPasswords.length}
              isUnlocking={isUnlocking}
              isUnlocked={isUnlocked}
              flyingFormula={flyingFormula}
              validationResult={validationResult}
            />
          </GlassContainer>
        </CenterPanel>
        
        {/* 右侧 - 输入和键盘 */}
        <RightPanel>
          {/* 算式输入 */}
          <InputCard
            ref={inputRef}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CardTitle>
              <GiSparkles size={18} /> 输入密码算式
            </CardTitle>
            
            <FormulaInputRow>
              <NumberInputBox
                active={activeInput === 'left'}
                hasError={!!(result && !result.valid)}
                disabled={!!result}
                onClick={() => !result && setActiveInput('left')}
              >
                {leftNum || <NumberInputPlaceholder>?</NumberInputPlaceholder>}
              </NumberInputBox>
              <OperatorDisplay>+</OperatorDisplay>
              <NumberInputBox
                active={activeInput === 'right'}
                hasError={!!(result && !result.valid)}
                disabled={!!result}
                onClick={() => !result && setActiveInput('right')}
              >
                {rightNum || <NumberInputPlaceholder>?</NumberInputPlaceholder>}
              </NumberInputBox>
              <OperatorDisplay>=</OperatorDisplay>
              <NumberInputBox
                active={activeInput === 'sum'}
                hasError={!!(result && !result.valid)}
                disabled={!!result}
                onClick={() => !result && setActiveInput('sum')}
              >
                {sumNum || <NumberInputPlaceholder>?</NumberInputPlaceholder>}
              </NumberInputBox>
            </FormulaInputRow>
            
            {!result ? (
              <SubmitButton
                onClick={handleSubmit}
                disabled={isUnlocking || !leftNum || !rightNum || !sumNum}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <GiKey size={18} />
                {isUnlocking ? '验证中...' : '🔐 验证密码'}
              </SubmitButton>
            ) : (
              <AnimatePresence>
                <ResultCard
                  type={result.valid ? 'success' : 'error'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <ResultText>{result.message}</ResultText>
                  <motion.button
                    style={{
                      marginTop: '10px',
                      padding: '8px 20px',
                      border: 'none',
                      borderRadius: '10px',
                      background: result.valid ? COLORS.green : COLORS.purple,
                      color: 'white',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      width: '100%'
                    }}
                    onClick={result.valid ? handleContinue : handleReset}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {result.valid ? '✨ 继续挑战' : '🔄 再试一次'}
                  </motion.button>
                </ResultCard>
              </AnimatePresence>
            )}
          </InputCard>
          
          {/* 数字键盘 */}
          <KeypadCard
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <KeypadTitle>
              <GiSparkles size={14} /> 密码键盘
            </KeypadTitle>
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
            
            <ActiveInputHint active={!!activeInput && !result}>
              {result ? '点击按钮继续' : activeInput === 'left' ? '👉 输入第一个数' : activeInput === 'right' ? '👉 输入第二个数' : activeInput === 'sum' ? '👉 输入答案' : '点击算式框选择'}
            </ActiveInputHint>
          </KeypadCard>
        </RightPanel>
      </MainContent>
      
      {/* 成功弹窗 - 更酷炫 */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SuccessBanner
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', damping: 10, stiffness: 100 }}
            >
              <motion.div
                style={{ fontSize: '5rem', marginBottom: 15, position: 'relative', zIndex: 1 }}
                animate={{ 
                  scale: [1, 1.15, 1],
                  rotate: [0, 5, -5, 0],
                  y: [0, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🏰
              </motion.div>
              
              <motion.h2 
                style={{ 
                  fontSize: '2.2rem', 
                  margin: '0 0 15px',
                  background: 'linear-gradient(135deg, #fbbf24, #fef3c7, #fbbf24)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  position: 'relative',
                  zIndex: 1
                }}
                animate={{ 
                  textShadow: ['0 0 20px rgba(251, 191, 36, 0.5)', '0 0 40px rgba(251, 191, 36, 0.8)', '0 0 20px rgba(251, 191, 36, 0.5)']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <FaCrown style={{ marginRight: 10, color: '#fbbf24' }} />
                魔法塔大门开启！
                <FaCrown style={{ marginLeft: 10, color: '#fbbf24' }} />
              </motion.h2>
              
              <p style={{ color: '#c4b5fd', margin: '0 0 10px', fontSize: '1.1rem', position: 'relative', zIndex: 1 }}>
                🎉 恭喜你找到了 {foundPasswords.length} 个密码！
              </p>
              <p style={{ color: '#a78bfa', margin: '0 0 25px', fontSize: '0.95rem', position: 'relative', zIndex: 1 }}>
                规律：<span style={{ color: '#fbbf24' }}>个位相加得9</span>，<span style={{ color: '#fbbf24' }}>十位相加得9</span>
              </p>
              
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 10, 
                justifyContent: 'center',
                marginBottom: 25,
                position: 'relative',
                zIndex: 1
              }}>
                {foundPasswords.map((p, i) => (
                  <motion.span
                    key={i}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.1))',
                      border: '2px solid rgba(251, 191, 36, 0.5)',
                      borderRadius: 12,
                      fontWeight: 700,
                      color: '#fbbf24',
                      fontSize: '1rem'
                    }}
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.15, type: 'spring' }}
                  >
                    {p.left}+{p.right}=99
                  </motion.span>
                ))}
              </div>
              
              <motion.button
                style={{
                  padding: '15px 45px',
                  border: 'none',
                  borderRadius: 25,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: '#1e1b4b',
                  boxShadow: '0 8px 30px rgba(251, 191, 36, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  position: 'relative',
                  zIndex: 1
                }}
                onClick={() => {
                  setShowSuccess(false)
                  onComplete?.()
                }}
                whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(251, 191, 36, 0.6)' }}
                whileTap={{ scale: 0.95 }}
              >
                <GiOpenGate size={24} />
                动物城成功拯救！🎊
              </motion.button>
            </SuccessBanner>
          </SuccessOverlay>
        )}
      </AnimatePresence>
    </Container>
  )
}
