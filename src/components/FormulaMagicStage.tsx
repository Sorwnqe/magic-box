import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import confetti from 'canvas-confetti'

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
  accent: '#f59e0b',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  bgDark: '#0f172a',
  bgLight: '#1e293b',
}


// 判断是否是反转数对
function isReversePair(a: number, b: number): boolean {
  if (a < 10 || a > 99 || b < 10 || b > 99) return false
  const aReversed = (a % 10) * 10 + Math.floor(a / 10)
  return aReversed === b
}

// 验证算式
function validateFormula(left: number, right: number, sum: number): {
  valid: boolean
  isReversePair: boolean
  sumCorrect: boolean
  message: string
} {
  const isPair = isReversePair(left, right)
  const sumCorrect = left + right === sum

  if (isPair && sumCorrect) {
    return {
      valid: true,
      isReversePair: true,
      sumCorrect: true,
      message: '🎉 太棒了！算式完全正确！你找到了反转数的规律！'
    }
  } else if (isPair && !sumCorrect) {
    return {
      valid: false,
      isReversePair: true,
      sumCorrect: false,
      message: `🤔 反转数对找对了！但是 ${left} + ${right} = ${left + right}，不是 ${sum} 哦！`
    }
  } else if (!isPair && sumCorrect) {
    return {
      valid: false,
      isReversePair: false,
      sumCorrect: true,
      message: `😅 加法算得对，但 ${left} 和 ${right} 不是反转数对哦！`
    }
  } else {
    return {
      valid: false,
      isReversePair: false,
      sumCorrect: false,
      message: '❌ 算式有问题哦！检查一下：1. 两个数是不是反转数对？ 2. 加法对不对？'
    }
  }
}

// 动画接口
interface FlyingFormula {
  id: number
  text: string
  startX: number
  startY: number
  progress: number
  color: string
}

interface MagicParticle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  rotation: number
  rotationSpeed: number
  life: number
}

interface ResultAnimation {
  active: boolean
  type: 'correct' | 'wrong'
  scale: number
  alpha: number
  textAlpha: number
  textY: number
  formulaAlpha: number
  formulaScale: number
}

// 结果文字
const CORRECT_MESSAGES = [
  '太厉害了！🎉',
  '完美！你真棒！✨',
  '答对啦！继续加油！🌟',
  '厉害厉害！数学小天才！🏆',
  '正确！你掌握规律了！💪'
]

const WRONG_MESSAGES = [
  '没关系，再试一次！💪',
  '加油！你可以的！🌈',
  '别灰心，检查一下~😊',
  '差一点点，再想想！✨',
  '仔细看看规律哦~🔍'
]

const pulseGlow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.4)); }
  50% { filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.7)); }
`

// 样式组件
const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`

const BackgroundGradient = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 40%, rgba(79, 70, 229, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 60%, rgba(251, 191, 36, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, ${COLORS.bgDark} 0%, #1e1b4b 100%);
`

const ParticleLayer = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
`

const sparkleAnim = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
`

const Particle = styled.div`
  position: absolute;
  width: 5px;
  height: 5px;
  background: ${COLORS.purpleLight};
  border-radius: 50%;
  box-shadow: 0 0 10px ${COLORS.purple};
  animation: ${sparkleAnim} 3s ease-in-out infinite;
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

const Title = styled.h1`
  font-size: 1.6rem;
  background: linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  font-weight: 800;
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 15px 25px 90px;
  z-index: 10;
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
  justify-content: flex-end;
  padding-bottom: 20px;
`

// 魔法台Canvas容器 - 毛玻璃背景
const MagicCanvasContainer = styled.div`
  position: relative;
  width: 100%;
  height: calc(100% - 20px);
  max-height: calc(100vh - 180px);
  min-height: 400px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(139, 92, 246, 0.15),
    inset 0 0 30px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  
  @media (min-width: 1400px) {
    max-height: calc(100vh - 150px);
  }
`

const MagicCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

// 全屏飞行动画Canvas
const FullscreenCanvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
`


// 右侧输入面板
const InputCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 6px 25px rgba(139, 92, 246, 0.15);
`

const InputTitle = styled.h3`
  color: ${COLORS.purple};
  font-size: 1rem;
  margin: 0 0 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const FormulaInputRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 15px;
`

const NumberInputBox = styled.div<{ active?: boolean; hasError?: boolean; isSuccess?: boolean }>`
  width: 70px;
  height: 60px;
  border: 3px solid ${props => props.isSuccess ? COLORS.green : props.hasError ? '#ef4444' : props.active ? COLORS.purple : '#ddd6fe'};
  border-radius: 14px;
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.isSuccess ? COLORS.green : COLORS.indigo};
  background: ${props => props.isSuccess ? '#dcfce7' : props.hasError ? '#fef2f2' : props.active ? '#ede9fe' : '#faf5ff'};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 0 15px rgba(139, 92, 246, 0.4)' : '0 2px 8px rgba(139, 92, 246, 0.1)'};
  
  &:hover {
    border-color: ${props => props.isSuccess ? COLORS.green : COLORS.purple};
    transform: scale(1.03);
  }
`

const NumberInputPlaceholder = styled.span`
  color: #c4b5fd;
  font-size: 1.2rem;
`

const OperatorDisplay = styled.span`
  font-size: 2rem;
  color: ${COLORS.cyan};
  font-weight: 700;
`

const KeypadCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  padding: 12px;
  box-shadow: 0 6px 25px rgba(139, 92, 246, 0.15);
`

const KeypadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
`

const KeypadButton = styled(motion.button) <{ variant?: 'number' | 'action' }>`
  height: 40px;
  border: none;
  border-radius: 8px;
  font-size: ${props => props.variant === 'action' ? '0.8rem' : '1.2rem'};
  font-weight: 700;
  cursor: pointer;
  background: ${props => props.variant === 'action'
    ? 'linear-gradient(135deg, #f1f5f9, #e2e8f0)'
    : 'linear-gradient(135deg, #ede9fe, #ddd6fe)'};
  color: ${props => props.variant === 'action' ? '#64748b' : COLORS.indigo};
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(139, 92, 246, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
  }
  
  &:active {
    transform: translateY(0) scale(0.97);
  }
`

const JudgeButton = styled(motion.button) <{ disabled?: boolean }>`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  background: ${props => props.disabled
    ? '#e5e7eb'
    : `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.purple} 50%, ${COLORS.accent} 100%)`};
  color: white;
  box-shadow: ${props => props.disabled
    ? 'none'
    : '0 4px 20px rgba(30, 64, 175, 0.4)'};
  transition: all 0.35s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  animation: ${props => !props.disabled ? pulseGlow : 'none'} 2s ease-in-out infinite;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(30, 64, 175, 0.45);
  }
`

const ActiveInputHint = styled.div<{ active: boolean }>`
  margin-top: 8px;
  padding: 6px;
  background: ${props => props.active ? '#ede9fe' : '#f8fafc'};
  border-radius: 8px;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.active ? COLORS.purple : '#94a3b8'};
`


type ActiveInput = 'left' | 'right' | 'sum' | null

export default function FormulaMagicStage() {
  const [leftNum, setLeftNum] = useState('')
  const [rightNum, setRightNum] = useState('')
  const [sumNum, setSumNum] = useState('')
  const [activeInput, setActiveInput] = useState<ActiveInput>('left')
  const [isJudging, setIsJudging] = useState(false)
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null)
  // const [successCount, setSuccessCount] = useState(0)
  // showSuccess 不再使用，第二关不弹通关界面
  // Canvas refs
  const platformCanvasRef = useRef<HTMLCanvasElement>(null)
  const flyingCanvasRef = useRef<HTMLCanvasElement>(null)
  const inputRowRef = useRef<HTMLDivElement>(null)
  const centerPanelRef = useRef<HTMLDivElement>(null)

  // Animation state refs
  const flyingFormulasRef = useRef<FlyingFormula[]>([])
  const particlesRef = useRef<MagicParticle[]>([])
  const resultAnimRef = useRef<ResultAnimation>({ active: false, type: 'correct', scale: 0, alpha: 0, textAlpha: 0, textY: 0, formulaAlpha: 0, formulaScale: 0 })
  const resultMessageRef = useRef<string>('')
  const resultFormulaRef = useRef<string>('')
  const platformAnimRef = useRef({
    glowIntensity: 0,
    runeRotation: 0,
    isActivated: false,
    pulsePhase: 0
  })


  // 绘制魔法台
  const drawMagicPlatform = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    ctx.clearRect(0, 0, width, height)

    const centerX = width / 2
    const centerY = height / 2
    const baseRadius = Math.min(width, height) * 0.38
    const state = platformAnimRef.current

    // 更新动画状态
    state.runeRotation += 0.008
    state.pulsePhase += 0.04

    // 外层光晕
    const glowGradient = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.3, centerX, centerY, baseRadius * 1.6)
    const glowAlpha = 0.2 + state.glowIntensity * 0.4 + Math.sin(state.pulsePhase) * 0.08
    glowGradient.addColorStop(0, `rgba(139, 92, 246, ${glowAlpha})`)
    glowGradient.addColorStop(0.4, `rgba(99, 102, 241, ${glowAlpha * 0.6})`)
    glowGradient.addColorStop(0.7, `rgba(34, 211, 238, ${glowAlpha * 0.3})`)
    glowGradient.addColorStop(1, 'rgba(139, 92, 246, 0)')
    ctx.fillStyle = glowGradient
    ctx.fillRect(0, 0, width, height)

    // 魔法台底座 - 多层同心圆环
    const rings = [
      { radius: baseRadius, color: 'rgba(139, 92, 246, 0.25)', width: 4, dash: [] },
      { radius: baseRadius * 0.88, color: 'rgba(99, 102, 241, 0.3)', width: 3, dash: [10, 5] },
      { radius: baseRadius * 0.75, color: 'rgba(34, 211, 238, 0.25)', width: 3, dash: [] },
      { radius: baseRadius * 0.62, color: 'rgba(139, 92, 246, 0.35)', width: 2, dash: [6, 4] },
      { radius: baseRadius * 0.48, color: 'rgba(250, 204, 21, 0.3)', width: 2, dash: [] },
    ]

    rings.forEach(ring => {
      ctx.beginPath()
      ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2)
      ctx.strokeStyle = ring.color
      ctx.lineWidth = ring.width
      ctx.setLineDash(ring.dash)
      ctx.stroke()
      ctx.setLineDash([])
    })

    // 中心魔法阵 - 渐变填充
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 0.45)
    centerGradient.addColorStop(0, `rgba(255, 255, 255, ${0.15 + state.glowIntensity * 0.2})`)
    centerGradient.addColorStop(0.3, `rgba(139, 92, 246, ${0.2 + state.glowIntensity * 0.25})`)
    centerGradient.addColorStop(0.6, `rgba(99, 102, 241, ${0.15 + state.glowIntensity * 0.2})`)
    centerGradient.addColorStop(1, 'rgba(34, 211, 238, 0.1)')

    ctx.beginPath()
    ctx.arc(centerX, centerY, baseRadius * 0.45, 0, Math.PI * 2)
    ctx.fillStyle = centerGradient
    ctx.fill()

    // 六角星形魔法阵
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(state.runeRotation * 0.5)

    // 外六角星
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2
      const x = Math.cos(angle) * baseRadius * 0.7
      const y = Math.sin(angle) * baseRadius * 0.7
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.strokeStyle = `rgba(139, 92, 246, ${0.4 + state.glowIntensity * 0.3})`
    ctx.lineWidth = 2
    ctx.stroke()

    // 内六角星 (旋转30度)
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2 + Math.PI / 6
      const x = Math.cos(angle) * baseRadius * 0.5
      const y = Math.sin(angle) * baseRadius * 0.5
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.strokeStyle = `rgba(34, 211, 238, ${0.35 + state.glowIntensity * 0.3})`
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.restore()

    // 旋转的魔法符文 - 外圈
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(state.runeRotation)

    const outerRuneCount = 12
    const outerSymbols = ['✦', '◇', '☆', '◈', '✧', '○', '△', '□', '✶', '✴', '❋', '✺']
    for (let i = 0; i < outerRuneCount; i++) {
      const angle = (i / outerRuneCount) * Math.PI * 2
      const x = Math.cos(angle) * baseRadius * 0.82
      const y = Math.sin(angle) * baseRadius * 0.82

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle + state.runeRotation * 2)

      const symbolSize = 14 + state.glowIntensity * 6 + Math.sin(state.pulsePhase + i) * 2
      ctx.font = `${symbolSize}px "Nunito", sans-serif`
      ctx.fillStyle = `rgba(139, 92, 246, ${0.6 + state.glowIntensity * 0.3 + Math.sin(state.pulsePhase + i * 0.5) * 0.1})`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(outerSymbols[i], 0, 0)
      ctx.restore()
    }

    // 内圈符文 - 反向旋转
    const innerRuneCount = 8
    const innerSymbols = ['★', '●', '◆', '▲', '✦', '✧', '◇', '○']
    for (let i = 0; i < innerRuneCount; i++) {
      const angle = (i / innerRuneCount) * Math.PI * 2
      const x = Math.cos(angle) * baseRadius * 0.35
      const y = Math.sin(angle) * baseRadius * 0.35

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(-angle - state.runeRotation * 3)

      const symbolSize = 11 + state.glowIntensity * 5
      ctx.font = `${symbolSize}px "Nunito", sans-serif`
      ctx.fillStyle = `rgba(34, 211, 238, ${0.5 + state.glowIntensity * 0.4})`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(innerSymbols[i], 0, 0)
      ctx.restore()
    }

    ctx.restore()

    // 魔法光线 - 从中心向外辐射
    const rayCount = 36
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2 + time * 0.0008
      const innerRadius = baseRadius * 0.15
      const outerRadius = baseRadius * (0.55 + Math.sin(time * 0.002 + i * 0.8) * 0.1)

      ctx.beginPath()
      ctx.moveTo(
        centerX + Math.cos(angle) * innerRadius,
        centerY + Math.sin(angle) * innerRadius
      )
      ctx.lineTo(
        centerX + Math.cos(angle) * outerRadius,
        centerY + Math.sin(angle) * outerRadius
      )

      const rayAlpha = 0.08 + state.glowIntensity * 0.15 + Math.sin(time * 0.003 + i * 0.3) * 0.04
      ctx.strokeStyle = `rgba(139, 92, 246, ${rayAlpha})`
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // 中心核心 - 发光点
    const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 0.12)
    const coreAlpha = 0.9 + state.glowIntensity * 0.1 + Math.sin(state.pulsePhase * 2) * 0.08
    coreGradient.addColorStop(0, `rgba(255, 255, 255, ${coreAlpha})`)
    coreGradient.addColorStop(0.3, `rgba(34, 211, 238, ${coreAlpha * 0.8})`)
    coreGradient.addColorStop(0.6, `rgba(139, 92, 246, ${coreAlpha * 0.5})`)
    coreGradient.addColorStop(1, 'rgba(139, 92, 246, 0)')

    ctx.beginPath()
    ctx.arc(centerX, centerY, baseRadius * 0.12, 0, Math.PI * 2)
    ctx.fillStyle = coreGradient
    ctx.fill()

    // 浮动粒子效果
    const floatingParticleCount = 25
    for (let i = 0; i < floatingParticleCount; i++) {
      const particlePhase = time * 0.001 + i * 1.2
      const distance = baseRadius * (0.25 + Math.sin(particlePhase) * 0.35)
      const angle = (i / floatingParticleCount) * Math.PI * 2 + time * 0.0005
      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance * 0.85 // 椭圆轨道
      const size = 2 + Math.sin(particlePhase * 1.5) * 1.5
      const alpha = 0.4 + state.glowIntensity * 0.3 + Math.sin(particlePhase * 2) * 0.2

      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = i % 3 === 0
        ? `rgba(250, 204, 21, ${alpha})`
        : i % 3 === 1
          ? `rgba(139, 92, 246, ${alpha})`
          : `rgba(34, 211, 238, ${alpha})`
      ctx.fill()
    }

    // 结果动画
    const resultAnim = resultAnimRef.current
    if (resultAnim.active) {
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.scale(resultAnim.scale, resultAnim.scale)
      ctx.globalAlpha = resultAnim.alpha

      if (resultAnim.type === 'correct') {
        // 正确 - 绿色勾 + 光环
        ctx.font = 'bold 70px "Nunito", sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = COLORS.green
        ctx.shadowColor = COLORS.green
        ctx.shadowBlur = 25
        ctx.fillText('✓', 0, 0)

        // 光环效果
        ctx.strokeStyle = `rgba(34, 197, 94, ${resultAnim.alpha * 0.6})`
        ctx.lineWidth = 4
        ctx.shadowBlur = 0
        ctx.beginPath()
        ctx.arc(0, 0, 55 * resultAnim.scale, 0, Math.PI * 2)
        ctx.stroke()
      } else {
        // 错误 - 红色叉
        ctx.font = 'bold 70px "Nunito", sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#ef4444'
        ctx.shadowColor = '#ef4444'
        ctx.shadowBlur = 20
        ctx.fillText('✗', 0, 0)
      }

      ctx.restore()

      // 结果算式展示
      if (resultAnim.formulaAlpha > 0 && resultFormulaRef.current) {
        ctx.save()
        ctx.globalAlpha = resultAnim.formulaAlpha
        ctx.translate(centerX, centerY - 90)
        ctx.scale(resultAnim.formulaScale, resultAnim.formulaScale)

        // 算式背景框
        const formulaWidth = 200
        const formulaHeight = 50
        ctx.fillStyle = resultAnim.type === 'correct'
          ? 'rgba(220, 252, 231, 0.95)'
          : 'rgba(254, 242, 242, 0.95)'
        ctx.shadowColor = resultAnim.type === 'correct' ? COLORS.green : '#ef4444'
        ctx.shadowBlur = 15
        ctx.beginPath()
        ctx.roundRect(-formulaWidth / 2, -formulaHeight / 2, formulaWidth, formulaHeight, 12)
        ctx.fill()
        ctx.shadowBlur = 0

        // 算式文字
        ctx.font = 'bold 24px "Nunito", sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = resultAnim.type === 'correct' ? COLORS.green : '#ef4444'
        ctx.fillText(resultFormulaRef.current, 0, 0)
        ctx.restore()
      }

      // 结果文字动画
      if (resultAnim.textAlpha > 0 && resultMessageRef.current) {
        ctx.save()
        ctx.globalAlpha = resultAnim.textAlpha
        ctx.font = 'bold 26px "Nunito", sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const textY = centerY + 75 + resultAnim.textY

        if (resultAnim.type === 'correct') {
          ctx.fillStyle = COLORS.green
          ctx.shadowColor = COLORS.green
        } else {
          ctx.fillStyle = COLORS.orange
          ctx.shadowColor = COLORS.orange
        }
        ctx.shadowBlur = 12
        ctx.fillText(resultMessageRef.current, centerX, textY)
        ctx.restore()
      }
    }
  }, [])

  // 绘制飞行动画和粒子
  const drawFlyingAnimation = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height)

    const centerPanel = centerPanelRef.current
    if (!centerPanel) return

    const panelRect = centerPanel.getBoundingClientRect()
    const targetX = panelRect.left + panelRect.width / 2
    const targetY = panelRect.top + panelRect.height / 2

    // 绘制飞行的算式
    const flyingFormulas = flyingFormulasRef.current
    const toRemove: number[] = []

    flyingFormulas.forEach((formula, index) => {
      if (formula.progress < 0) {
        formula.progress += 0.02
        return
      }

      const t = Math.min(formula.progress, 1)
      // 贝塞尔曲线 - 快速启动
      const easeT = 1 - Math.pow(1 - t, 4)

      // 控制点 - 优雅的上凸弧线
      const cp1x = formula.startX - (formula.startX - targetX) * 0.4
      const cp1y = formula.startY - 180
      const cp2x = targetX + (formula.startX - targetX) * 0.2
      const cp2y = targetY - 120

      // 贝塞尔曲线计算
      const oneMinusT = 1 - easeT
      const x = oneMinusT * oneMinusT * oneMinusT * formula.startX +
        3 * oneMinusT * oneMinusT * easeT * cp1x +
        3 * oneMinusT * easeT * easeT * cp2x +
        easeT * easeT * easeT * targetX
      const y = oneMinusT * oneMinusT * oneMinusT * formula.startY +
        3 * oneMinusT * oneMinusT * easeT * cp1y +
        3 * oneMinusT * easeT * easeT * cp2y +
        easeT * easeT * easeT * targetY

      // 缩放和透明度
      const scale = 1 - easeT * 0.4
      const alpha = t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15

      // 绘制数字
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(scale, scale)
      ctx.globalAlpha = alpha
      ctx.font = 'bold 28px "Nunito", sans-serif'
      ctx.fillStyle = formula.color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = formula.color
      ctx.shadowBlur = 12
      ctx.fillText(formula.text, 0, 0)
      ctx.restore()

      // 生成星星粒子
      if (t > 0 && t < 0.9 && Math.random() < 0.35) {
        particlesRef.current.push({
          id: Date.now() + Math.random(),
          x: x + (Math.random() - 0.5) * 15,
          y: y + (Math.random() - 0.5) * 15,
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5 - 0.8,
          size: Math.random() * 7 + 3,
          color: ['#8b5cf6', '#22d3ee', '#facc15', '#22c55e'][Math.floor(Math.random() * 4)],
          alpha: 1,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.15,
          life: 1
        })
      }

      // 更新进度
      formula.progress += 0.018
      if (formula.progress >= 1) {
        toRemove.push(index)
      }
    })

    // 移除完成的动画
    if (toRemove.length > 0) {
      flyingFormulasRef.current = flyingFormulas.filter((_, i) => !toRemove.includes(i))
    }

    // 绘制粒子
    const particles = particlesRef.current
    const particlesToRemove: number[] = []

    particles.forEach((p, index) => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.04 // 重力
      p.alpha -= 0.018
      p.life -= 0.018
      p.rotation += p.rotationSpeed

      if (p.life <= 0) {
        particlesToRemove.push(index)
        return
      }

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.globalAlpha = p.alpha

      // 绘制星星
      ctx.beginPath()
      const spikes = 5
      const outerRadius = p.size
      const innerRadius = p.size / 2

      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i * Math.PI) / spikes - Math.PI / 2
        const px = Math.cos(angle) * radius
        const py = Math.sin(angle) * radius

        if (i === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }
      ctx.closePath()
      ctx.fillStyle = p.color
      ctx.fill()
      ctx.restore()
    })

    // 移除消失的粒子
    if (particlesToRemove.length > 0) {
      particlesRef.current = particles.filter((_, i) => !particlesToRemove.includes(i))
    }
  }, [])

  // 魔法台Canvas动画
  useEffect(() => {
    const canvas = platformCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (rect) {
        canvas.width = rect.width * window.devicePixelRatio
        canvas.height = rect.height * window.devicePixelRatio
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`
        ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0)
      }
    }
    resize()
    window.addEventListener('resize', resize)

    const animate = (time: number) => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (rect) {
        drawMagicPlatform(ctx, rect.width, rect.height, time)
      }
      animationId = requestAnimationFrame(animate)
    }
    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [drawMagicPlatform])

  // 飞行动画Canvas
  useEffect(() => {
    const canvas = flyingCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio
      canvas.height = window.innerHeight * window.devicePixelRatio
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      drawFlyingAnimation(ctx, window.innerWidth, window.innerHeight)
      animationId = requestAnimationFrame(animate)
    }
    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [drawFlyingAnimation])

  // 数字键盘点击处理
  const handleKeypadClick = (key: string) => {
    if (!activeInput) return
    playPop() // 播放键盘音效

    const setters = {
      left: setLeftNum,
      right: setRightNum,
      sum: setSumNum
    }
    const values = {
      left: leftNum,
      right: rightNum,
      sum: sumNum
    }
    const maxLengths = {
      left: 2,
      right: 2,
      sum: 3
    }

    const setter = setters[activeInput]
    const currentValue = values[activeInput]
    const maxLen = maxLengths[activeInput]

    if (key === 'del') {
      setter(currentValue.slice(0, -1))
    } else if (key === 'clear') {
      setter('')
    } else if (currentValue.length < maxLen) {
      setter(currentValue + key)
    }
  }

  // 启动飞行动画
  const startFlyingAnimation = () => {
    const inputRow = inputRowRef.current
    if (!inputRow) return

    const rect = inputRow.getBoundingClientRect()
    const startX = rect.left + rect.width / 2
    const startY = rect.top + rect.height / 2

    // 创建飞行的数字 - 错开时间
    const formulas: FlyingFormula[] = [
      { id: 1, text: leftNum, startX: startX - 60, startY, progress: 0, color: COLORS.purple },
      { id: 2, text: '+', startX: startX - 25, startY, progress: -0.08, color: COLORS.cyan },
      { id: 3, text: rightNum, startX: startX + 10, startY, progress: -0.16, color: COLORS.indigo },
      { id: 4, text: '=', startX: startX + 45, startY, progress: -0.24, color: COLORS.cyan },
      { id: 5, text: sumNum, startX: startX + 85, startY, progress: -0.32, color: COLORS.green }
    ]

    flyingFormulasRef.current = formulas
    platformAnimRef.current.glowIntensity = 0.6
    platformAnimRef.current.isActivated = true
  }

  const handleJudge = async () => {
    playClick() // 点击音效
    const left = parseInt(leftNum)
    const right = parseInt(rightNum)
    const sum = parseInt(sumNum)

    if (isNaN(left) || isNaN(right) || isNaN(sum)) {
      setResult({ valid: false, message: '请填写完整的算式哦！' })
      playError()
      return
    }

    setIsJudging(true)
    setResult(null)

    // 启动飞行动画
    startFlyingAnimation()

    // 等待飞行动画完成
    await new Promise(resolve => setTimeout(resolve, 1800))

    const validation = validateFormula(left, right, sum)
    setIsJudging(false)
    setResult(validation)

    // 随机选择结果文字
    if (validation.valid) {
      resultMessageRef.current = CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)]
    } else {
      resultMessageRef.current = WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)]
    }
    resultFormulaRef.current = `${leftNum} + ${rightNum} = ${sumNum}`

    // 显示结果动画
    resultAnimRef.current = {
      active: true,
      type: validation.valid ? 'correct' : 'wrong',
      scale: 0,
      alpha: 1,
      textAlpha: 0,
      textY: 20,
      formulaAlpha: 0,
      formulaScale: 0.5
    }

    // 结果动画
    let animationId: number
    let textAnimStarted = false
    const animateResult = () => {
      const anim = resultAnimRef.current
      if (!anim.active) return

      if (anim.scale < 1.15) {
        anim.scale += (1.2 - anim.scale) * 0.12
      }

      // 算式弹出动画 - 符号出现前开始
      if (anim.scale > 0.3 && anim.formulaAlpha < 1) {
        anim.formulaAlpha += 0.1
        anim.formulaScale += (1 - anim.formulaScale) * 0.15
      }

      // 文字动画 - 符号出现后开始
      if (anim.scale > 0.8 && !textAnimStarted) {
        textAnimStarted = true
      }
      if (textAnimStarted && anim.textAlpha < 1) {
        anim.textAlpha += 0.08
        anim.textY -= 1.5
        if (anim.textY < 0) anim.textY = 0
      }

      if (anim.scale >= 1.1) {
        // 保持显示，不自动淡出
        anim.scale = 1.15
      } else {
        animationId = requestAnimationFrame(animateResult)
      }
    }
    animateResult()

    if (validation.valid) {
      playSuccess() // 成功音效
      // setSuccessCount(prev => prev + 1)

      // 庆祝特效
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#22c55e', '#facc15', '#22d3ee']
      })
      // 等待用户点击"再试一次"按钮
    } else {
      playError() // 错误音效
    }

    return () => cancelAnimationFrame(animationId)
  }

  const handleReset = () => {
    playClick() // 点击音效
    // 清除结果动画
    resultAnimRef.current = {
      active: false,
      type: 'correct',
      scale: 0,
      alpha: 0,
      textAlpha: 0,
      textY: 0,
      formulaAlpha: 0,
      formulaScale: 0
    }
    platformAnimRef.current.glowIntensity = 0

    setLeftNum('')
    setRightNum('')
    setSumNum('')
    setResult(null)
    setActiveInput('left')
  }


  return (
    <Container>

      <BackgroundGradient />

      <ParticleLayer>
        {Array.from({ length: 20 }).map((_, i) => (
          <Particle
            key={i}
            style={{
              left: `${(i * 17 + 7) % 100}%`,
              top: `${(i * 23 + 11) % 100}%`,
              animationDelay: `${(i * 0.3) % 3}s`,
            }}
          />
        ))}
      </ParticleLayer>

      {/* 飞行动画Canvas - 全屏 */}
      <FullscreenCanvas ref={flyingCanvasRef} />

      <Header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <HeaderContent>
          <Title>✍️仿写算式</Title>
        </HeaderContent>
      </Header>

      <MainContent>
        {/* 左侧 - 得分和提示 */}
        {/* <LeftPanel>
          <ScoreCard
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ScoreTitle>
              <span>⭐</span> 我的成绩
            </ScoreTitle>
            <ScoreNumber>{successCount}</ScoreNumber>
            <ScoreLabel>道算式正确</ScoreLabel>
          </ScoreCard>

          <TipCard
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <TipTitle>
              <span>💡</span> 反转数秘籍
            </TipTitle>
            <TipItem>• <strong>12</strong> ↔ <strong>21</strong>：十个位交换</TipItem>
            <TipItem>• 12 + 21 = <strong>33</strong></TipItem>
          </TipCard>
        </LeftPanel> */}

        {/* 中间 - 魔法台 */}
        <CenterPanel ref={centerPanelRef}>
          <MagicCanvasContainer>
            <MagicCanvas ref={platformCanvasRef} />
          </MagicCanvasContainer>
        </CenterPanel>

        {/* 右侧 - 输入区域 */}
        <RightPanel>
          {/* 算式显示 */}
          <InputCard
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <InputTitle>
              <span>✏️</span> 仿写算式
            </InputTitle>

            <FormulaInputRow ref={inputRowRef}>
              <NumberInputBox
                active={activeInput === 'left'}
                hasError={!!(result && !result.valid)}
                isSuccess={!!(result && result.valid)}
                onClick={() => !result && setActiveInput('left')}
              >
                {leftNum || <NumberInputPlaceholder>?</NumberInputPlaceholder>}
              </NumberInputBox>
              <OperatorDisplay>+</OperatorDisplay>
              <NumberInputBox
                active={activeInput === 'right'}
                hasError={!!(result && !result.valid)}
                isSuccess={!!(result && result.valid)}
                onClick={() => !result && setActiveInput('right')}
              >
                {rightNum || <NumberInputPlaceholder>?</NumberInputPlaceholder>}
              </NumberInputBox>
              <OperatorDisplay>=</OperatorDisplay>
              <NumberInputBox
                active={activeInput === 'sum'}
                hasError={!!(result && !result.valid)}
                isSuccess={!!(result && result.valid)}
                onClick={() => !result && setActiveInput('sum')}
              >
                {sumNum || <NumberInputPlaceholder>?</NumberInputPlaceholder>}
              </NumberInputBox>
            </FormulaInputRow>

            {/* <AnimatePresence>
              {result && (
                <ResultCard
                  type={result.valid ? 'success' : 'error'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <ResultText>{result.message}</ResultText>
                  {!result.valid && (
                    <motion.button
                      style={{
                        marginTop: '8px',
                        padding: '6px 14px',
                        border: 'none',
                        borderRadius: '6px',
                        background: COLORS.indigo,
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={handleReset}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🔄 再试一次
                    </motion.button>
                  )}
                </ResultCard>
              )}
            </AnimatePresence> */}
          </InputCard>

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

          {/* 判断按钮 */}
          <JudgeButton
            onClick={result ? handleReset : handleJudge}
            disabled={isJudging || (!result && (!leftNum || !rightNum || !sumNum))}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isJudging ? (
              <>⏳ 验证中...</>
            ) : result ? (
              <>🔄 再试一次</>
            ) : (
              <>⚡ 让魔法台验证</>
            )}
          </JudgeButton>
        </RightPanel>
      </MainContent>
    </Container>
  )
}
