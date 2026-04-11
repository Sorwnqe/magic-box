import { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  Float, 
  MeshTransmissionMaterial,
  Sparkles,
  Environment
} from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import confetti from 'canvas-confetti'
import * as THREE from 'three'
import { backgrounds, characters, expressions, items, zootopiaColors } from '../assets/images'

// 配色 - 动物城主题
const COLORS = {
  ...zootopiaColors,
  purple: '#8b5cf6',
  indigo: '#6366f1',
  cyan: '#22d3ee',
  yellow: '#facc15',
  green: '#22c55e',
  orange: '#fb923c',
  pink: '#f472b6'
}

// 范例展示
const EXAMPLE_FORMULAS = [
  { left: 13, right: 31, sum: 44 },
  { left: 22, right: 22, sum: 44 },
]

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
      message: `😅 这是反转数对，但和是 ${sum}，不是 44 哦！提示：个位相加得4，十位相加得4！`
    }
  } else if (isPair && !sumCorrect) {
    return {
      valid: false,
      message: `🤔 ${left} + ${right} = ${left + right}，不是 ${sum} 哦！`
    }
  } else if (!isPair && sumIs44) {
    return {
      valid: false,
      message: `😅 和是44，但 ${left} 和 ${right} 不是反转数对！试试交换十位和个位的数？`
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

// 3D 魔法阵
function MagicArray3D({ activated, energy }: { activated: boolean, energy: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const ringRefs = useRef<THREE.Mesh[]>([])
  
  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    if (groupRef.current) {
      groupRef.current.rotation.z = time * 0.2
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.1
    }
    
    // 各环独立旋转
    ringRefs.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.z = time * (0.3 + i * 0.15) * (i % 2 === 0 ? 1 : -1)
      }
    })
  })

  const ringCount = 3
  const maxEnergy = 2 // 最多2个正确答案

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* 魔法阵环 */}
        {Array.from({ length: ringCount }).map((_, i) => (
          <mesh 
            key={i} 
            ref={(el) => { if (el) ringRefs.current[i] = el }}
            position={[0, 0, -i * 0.1]}
          >
            <torusGeometry args={[1.2 - i * 0.25, 0.05, 16, 64]} />
            <meshStandardMaterial 
              color={i < energy ? COLORS.green : activated ? COLORS.cyan : COLORS.purple}
              emissive={i < energy ? COLORS.green : activated ? COLORS.cyan : COLORS.purple}
              emissiveIntensity={i < energy ? 0.8 : activated ? 0.5 : 0.2}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
        
        {/* 中心44符文 */}
        <mesh position={[0, 0, 0.1]}>
          <circleGeometry args={[0.5, 32]} />
          <MeshTransmissionMaterial
            backside
            samples={8}
            thickness={0.2}
            chromaticAberration={0.1}
            color={energy >= maxEnergy ? COLORS.green : COLORS.yellow}
            transmission={0.7}
          />
        </mesh>
        
        {/* 能量指示点 */}
        {Array.from({ length: maxEnergy }).map((_, i) => {
          const angle = (i / maxEnergy) * Math.PI * 2 - Math.PI / 2
          return (
            <mesh 
              key={i} 
              position={[Math.cos(angle) * 0.8, Math.sin(angle) * 0.8, 0.15]}
            >
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial 
                color={i < energy ? COLORS.green : '#94a3b8'}
                emissive={i < energy ? COLORS.green : '#64748b'}
                emissiveIntensity={i < energy ? 1 : 0.2}
              />
            </mesh>
          )
        })}
        
        {/* 激活时的粒子 */}
        {activated && (
          <Sparkles count={80} scale={3} size={5} speed={1.5} color={COLORS.cyan} />
        )}
        
        {/* 完成时的粒子 */}
        {energy >= maxEnergy && (
          <>
            <Sparkles count={100} scale={4} size={6} speed={2} color={COLORS.green} />
            <Sparkles count={60} scale={3} size={4} speed={1} color={COLORS.yellow} />
          </>
        )}
      </group>
    </Float>
  )
}

// 动画
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
  50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
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

const BackgroundImage = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${backgrounds.cityPlaza});
  background-size: cover;
  background-position: center;
  z-index: 0;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(250, 204, 21, 0.1) 100%);
  }
`

const CharacterGuideLeft = styled(motion.div)`
  position: fixed;
  bottom: 100px;
  left: 20px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`

const CharacterGuideRight = styled(motion.div)`
  position: fixed;
  bottom: 100px;
  right: 20px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`

const CharacterImg = styled.img`
  width: 140px;
  height: auto;
  filter: drop-shadow(0 5px 20px rgba(0,0,0,0.3));
`

const CharacterSpeech = styled(motion.div)`
  background: white;
  padding: 12px 18px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
  font-size: 0.85rem;
  color: ${COLORS.textPrimary};
  max-width: 180px;
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

const Header = styled(motion.div)`
  text-align: center;
  padding: 12px 40px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 0 0 20px 20px;
  margin: 0 auto;
  width: fit-content;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
`

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`

const HeaderIcon = styled.img`
  width: 60px;
  height: 60px;
  object-fit: contain;
  filter: drop-shadow(0 3px 10px rgba(251, 146, 60, 0.4));
`

const Title = styled.h1`
  font-size: 1.8rem;
  background: linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.gold} 50%, ${COLORS.success} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`

const Subtitle = styled.p`
  color: ${COLORS.textSecondary};
  font-size: 0.95rem;
  margin: 4px 0 0;
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 10px 30px 110px;
  z-index: 10;
  max-height: calc(100vh - 90px);
  overflow: hidden;
`

const LeftSection = styled.div`
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`

const CenterSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
`

const RightSection = styled.div`
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 6px 25px rgba(251, 146, 60, 0.2);
`

const CardTitle = styled.h3`
  color: ${COLORS.orange};
  font-size: 1.1rem;
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const FormulaRow = styled(motion.div)<{ highlighted?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 15px;
  border-radius: 12px;
  background: ${props => props.highlighted ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'transparent'};
  margin-bottom: 6px;
`

const FormulaNumber = styled.span<{ color?: string }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.color || COLORS.orange};
  min-width: 32px;
  text-align: center;
`

const FormulaOperator = styled.span`
  font-size: 1.3rem;
  color: ${COLORS.yellow};
  font-weight: 700;
`

const FormulaInputRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 15px;
`

const NumberInputBox = styled.div<{ active?: boolean; hasError?: boolean }>`
  width: 72px;
  height: 60px;
  border: 3px solid ${props => props.hasError ? '#ef4444' : props.active ? COLORS.orange : '#fed7aa'};
  border-radius: 15px;
  font-size: 1.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLORS.orange};
  background: ${props => props.hasError ? '#fef2f2' : props.active ? '#fff7ed' : '#fffbeb'};
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.active ? '0 0 20px rgba(251, 146, 60, 0.35)' : '0 2px 8px rgba(251, 146, 60, 0.1)'};
  
  &:hover {
    border-color: ${COLORS.orange};
    transform: scale(1.03);
    box-shadow: 0 4px 16px rgba(251, 146, 60, 0.25);
  }
  
  &:active {
    transform: scale(0.98);
  }
`

const NumberInputPlaceholder = styled.span`
  color: #fdba74;
  font-size: 1.2rem;
`

const OperatorDisplay = styled.span`
  font-size: 1.8rem;
  color: ${COLORS.yellow};
  font-weight: 700;
`

const SubmitButton = styled(motion.button)<{ disabled?: boolean }>`
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 15px;
  font-size: 1.2rem;
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
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(251, 146, 60, 0.45);
    filter: brightness(1.05);
  }
  
  &:active:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(251, 146, 60, 0.35);
  }
`

const ResultCard = styled(motion.div)<{ type: 'success' | 'error' }>`
  padding: 15px;
  border-radius: 15px;
  margin-top: 15px;
  background: ${props => props.type === 'success' 
    ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' 
    : 'linear-gradient(135deg, #fef2f2, #fecaca)'};
  border: 2px solid ${props => props.type === 'success' ? COLORS.green : '#ef4444'};
  animation: ${props => props.type === 'error' ? shake : 'none'} 0.5s ease;
`

const ResultText = styled.p`
  font-size: 1rem;
  margin: 0;
  color: #374151;
  line-height: 1.5;
`

const CanvasContainer = styled.div`
  flex: 1;
  min-height: 180px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  box-shadow: 0 6px 25px rgba(251, 146, 60, 0.2);
  animation: ${glow} 3s ease-in-out infinite;
`

const KeypadCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 15px;
  box-shadow: 0 6px 25px rgba(251, 146, 60, 0.2);
  flex: 1;
`

const KeypadTitle = styled.h3`
  color: ${COLORS.orange};
  font-size: 1rem;
  margin: 0 0 12px;
  text-align: center;
`

const KeypadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`

const KeypadButton = styled(motion.button)<{ variant?: 'number' | 'action' }>`
  height: 48px;
  border: none;
  border-radius: 12px;
  font-size: ${props => props.variant === 'action' ? '0.9rem' : '1.4rem'};
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
    background: ${props => props.variant === 'action'
      ? 'linear-gradient(135deg, #fdba74, #fb923c)'
      : 'linear-gradient(135deg, #ffedd5, #fed7aa)'};
  }
  
  &:active {
    transform: translateY(0) scale(0.97);
    box-shadow: 0 1px 4px rgba(251, 146, 60, 0.15);
  }
`

const ActiveInputHint = styled.div<{ active: boolean }>`
  margin-top: 12px;
  padding: 8px;
  background: ${props => props.active ? '#fff7ed' : '#f1f5f9'};
  border-radius: 10px;
  text-align: center;
  font-size: 0.85rem;
  color: ${props => props.active ? COLORS.orange : '#94a3b8'};
`

const FoundList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
`

const FoundItem = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${COLORS.green};
`

const TipBox = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #e0f2fe, #bae6fd);
  border-radius: 12px;
  font-size: 0.9rem;
  color: #0369a1;
  text-align: center;
`

const SuccessBanner = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 40px 60px;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  z-index: 100;
`

// 主组件
interface Props {
  onComplete?: () => void
}

export default function MagicArrayStage({ onComplete }: Props) {
  const [leftNum, setLeftNum] = useState('')
  const [rightNum, setRightNum] = useState('')
  const [sumNum, setSumNum] = useState('')
  const [activeInput, setActiveInput] = useState<'left' | 'right' | 'sum' | null>('left')
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null)
  const [foundFormulas, setFoundFormulas] = useState<Array<{ left: number; right: number }>>([])
  const [isActivated, setIsActivated] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [highlightedExample, setHighlightedExample] = useState(0)
  
  // 范例高亮轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setHighlightedExample(prev => (prev + 1) % EXAMPLE_FORMULAS.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])
  
  // 键盘输入处理
  const handleKeypadClick = (value: string) => {
    if (!activeInput) return
    
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
    
    // 清除之前的结果
    setResult(null)
  }
  
  // 提交验证
  const handleSubmit = () => {
    const left = parseInt(leftNum)
    const right = parseInt(rightNum)
    const sum = parseInt(sumNum)
    
    if (isNaN(left) || isNaN(right) || isNaN(sum)) {
      setResult({ valid: false, message: '请填写完整的算式！' })
      return
    }
    
    setIsActivated(true)
    
    setTimeout(() => {
      const validation = validateFormula(left, right, sum)
      setResult(validation)
      
      if (validation.valid) {
        // 检查是否已经找到过这个算式
        const alreadyFound = foundFormulas.some(
          f => (f.left === left && f.right === right) || (f.left === right && f.right === left)
        )
        
        if (!alreadyFound) {
          const newFoundFormulas = [...foundFormulas, { left, right }]
          setFoundFormulas(newFoundFormulas)
          
          // 庆祝效果
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: [COLORS.green, COLORS.yellow, COLORS.orange]
          })
          
          // 检查是否完成（找到2个不同的算式）
          if (newFoundFormulas.length >= 2) {
            setTimeout(() => {
              setShowSuccess(true)
              confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.5 },
                colors: [COLORS.green, COLORS.yellow, COLORS.orange, COLORS.cyan]
              })
            }, 1000)
          }
        } else {
          setResult({ valid: true, message: '✅ 正确！但这个算式你已经找到过了，试试其他的吧！' })
        }
      }
      
      setIsActivated(false)
    }, 1200)
  }
  
  // 重置
  const handleReset = () => {
    setLeftNum('')
    setRightNum('')
    setSumNum('')
    setResult(null)
    setActiveInput('left')
  }
  
  return (
    <Container>
      <BackgroundImage />
      <ParticleBackground />
      
      {/* 朱迪角色引导 */}
      <CharacterGuideLeft
        initial={{ x: -150, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <CharacterSpeech>
          🐰 找出和为44的反转数对！
        </CharacterSpeech>
        <CharacterImg src={characters.judy} alt="Judy" />
      </CharacterGuideLeft>
      
      {/* 尼克角色引导 */}
      <CharacterGuideRight
        initial={{ x: 150, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.7, type: 'spring' }}
      >
        <CharacterSpeech>
          🦊 提示：个位+个位=4！
        </CharacterSpeech>
        <CharacterImg src={characters.nick} alt="Nick" />
      </CharacterGuideRight>
      
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HeaderContent>
          <HeaderIcon src={items.magicCircle} alt="魔法阵" />
          <div>
            <Title>第三关：四十四魔法阵</Title>
            <Subtitle>和朱迪、尼克一起找出和为 44 的反转数对，激活广场防护罩！</Subtitle>
          </div>
        </HeaderContent>
      </Header>
      
      <MainContent>
        {/* 左侧 - 范例和提示 */}
        <LeftSection>
          <Card
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardTitle>
              <span>📚</span> 范例板书
            </CardTitle>
            
            {EXAMPLE_FORMULAS.map((formula, index) => (
              <FormulaRow 
                key={index}
                highlighted={index === highlightedExample}
                animate={{ 
                  scale: index === highlightedExample ? 1.03 : 1,
                  backgroundColor: index === highlightedExample ? '#fef3c7' : 'transparent'
                }}
              >
                <FormulaNumber color={COLORS.orange}>{formula.left}</FormulaNumber>
                <FormulaOperator>+</FormulaOperator>
                <FormulaNumber color={COLORS.yellow}>{formula.right}</FormulaNumber>
                <FormulaOperator>=</FormulaOperator>
                <FormulaNumber color={COLORS.green}>{formula.sum}</FormulaNumber>
              </FormulaRow>
            ))}
            
            <TipBox>
              💡 <strong>规律发现</strong><br/>
              个位相加得 <strong>4</strong>，十位相加得 <strong>4</strong>！
            </TipBox>
          </Card>
          
          {/* 已找到的算式 */}
          <Card
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CardTitle>
              <span>✅</span> 已找到 ({foundFormulas.length}/2)
            </CardTitle>
            
            {foundFormulas.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', margin: '10px 0' }}>
                还没有找到哦，加油！
              </p>
            ) : (
              <FoundList>
                {foundFormulas.map((f, i) => (
                  <FoundItem
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    ✨ {f.left} + {f.right} = 44
                  </FoundItem>
                ))}
              </FoundList>
            )}
          </Card>
        </LeftSection>
        
        {/* 中间 - 3D魔法阵和输入 */}
        <CenterSection>
          <CanvasContainer>
            <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={1} />
              <pointLight position={[-3, 3, 3]} color={COLORS.orange} intensity={0.5} />
              <Environment preset="sunset" />
              <MagicArray3D activated={isActivated} energy={foundFormulas.length} />
            </Canvas>
          </CanvasContainer>
          
          <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <CardTitle>
              <span>✏️</span> 写出和为44的反转数对
            </CardTitle>
            
            <FormulaInputRow>
              <NumberInputBox
                active={activeInput === 'left'}
                hasError={!!(result && !result.valid)}
                onClick={() => setActiveInput('left')}
              >
                {leftNum || <NumberInputPlaceholder>?</NumberInputPlaceholder>}
              </NumberInputBox>
              <OperatorDisplay>+</OperatorDisplay>
              <NumberInputBox
                active={activeInput === 'right'}
                hasError={!!(result && !result.valid)}
                onClick={() => setActiveInput('right')}
              >
                {rightNum || <NumberInputPlaceholder>?</NumberInputPlaceholder>}
              </NumberInputBox>
              <OperatorDisplay>=</OperatorDisplay>
              <NumberInputBox
                active={activeInput === 'sum'}
                hasError={!!(result && !result.valid)}
                onClick={() => setActiveInput('sum')}
              >
                {sumNum || <NumberInputPlaceholder>?</NumberInputPlaceholder>}
              </NumberInputBox>
            </FormulaInputRow>
            
            <SubmitButton
              onClick={handleSubmit}
              disabled={isActivated || !leftNum || !rightNum || !sumNum}
              whileHover={{ scale: 1.02, transition: { type: 'spring', damping: 20, stiffness: 400 } }}
              whileTap={{ scale: 0.97, transition: { type: 'spring', damping: 25, stiffness: 500 } }}
            >
              {isActivated ? '🔮 魔法阵验证中...' : '⚡ 激活魔法阵'}
            </SubmitButton>
            
            <AnimatePresence>
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
                        marginTop: '10px',
                        padding: '8px 20px',
                        border: 'none',
                        borderRadius: '10px',
                        background: COLORS.orange,
                        color: 'white',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={handleReset}
                      whileHover={{ scale: 1.03, transition: { type: 'spring', damping: 20, stiffness: 400 } }}
                      whileTap={{ scale: 0.97, transition: { type: 'spring', damping: 25, stiffness: 500 } }}
                    >
                      🔄 再试一次
                    </motion.button>
                  )}
                </ResultCard>
              )}
            </AnimatePresence>
          </Card>
        </CenterSection>
        
        {/* 右侧 - 数字键盘 */}
        <RightSection>
          <KeypadCard
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <KeypadTitle>⌨️ 点击输入</KeypadTitle>
            <KeypadGrid>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <KeypadButton
                  key={num}
                  onClick={() => handleKeypadClick(String(num))}
                  whileHover={{ y: -2, transition: { type: 'spring', damping: 20, stiffness: 400 } }}
                  whileTap={{ scale: 0.95, transition: { type: 'spring', damping: 25, stiffness: 500 } }}
                >
                  {num}
                </KeypadButton>
              ))}
              <KeypadButton
                variant="action"
                onClick={() => handleKeypadClick('clear')}
                whileHover={{ y: -2, transition: { type: 'spring', damping: 20, stiffness: 400 } }}
                whileTap={{ scale: 0.95, transition: { type: 'spring', damping: 25, stiffness: 500 } }}
              >
                C
              </KeypadButton>
              <KeypadButton
                onClick={() => handleKeypadClick('0')}
                whileHover={{ y: -2, transition: { type: 'spring', damping: 20, stiffness: 400 } }}
                whileTap={{ scale: 0.95, transition: { type: 'spring', damping: 25, stiffness: 500 } }}
              >
                0
              </KeypadButton>
              <KeypadButton
                variant="action"
                onClick={() => handleKeypadClick('del')}
                whileHover={{ y: -2, transition: { type: 'spring', damping: 20, stiffness: 400 } }}
                whileTap={{ scale: 0.95, transition: { type: 'spring', damping: 25, stiffness: 500 } }}
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
        </RightSection>
      </MainContent>
      
      {/* 成功弹窗 */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SuccessBanner
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <motion.div
                style={{ fontSize: '4rem', marginBottom: 15 }}
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
              >
                🎉
              </motion.div>
              <img 
                src={expressions.judyNickHighfive} 
                alt="Judy and Nick High Five"
                style={{ width: '150px', marginBottom: '15px' }}
              />
              <h2 style={{ 
                fontSize: '2rem', 
                margin: '0 0 10px',
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.success})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                广场防护罩激活成功！
              </h2>
              <p style={{ color: '#6b7280', margin: '0 0 20px' }}>
                你和朱迪、尼克发现了：个位相加得4，十位相加得4！
              </p>
              <motion.button
                style={{
                  padding: '12px 30px',
                  border: 'none',
                  borderRadius: 20,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.cyan})`,
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)'
                }}
                onClick={() => {
                  setShowSuccess(false)
                  onComplete?.()
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🚀 闯关成功！
              </motion.button>
            </SuccessBanner>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  )
}
