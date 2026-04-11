import { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  Float, 
  MeshTransmissionMaterial,
  RoundedBox,
  Sparkles,
  Environment
} from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import confetti from 'canvas-confetti'
import * as THREE from 'three'
import { backgrounds, characters, items, zootopiaColors } from '../assets/images'

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
    
    const colors = ['#8b5cf6', '#6366f1', '#a78bfa', '#c4b5fd', '#22d3ee', '#facc15']
    const symbols = ['+', '=', '×', '÷', '1', '2', '3', '✨', '⭐']
    
    const particles: Particle[] = []
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 16 + 10,
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

// 范例算式
const EXAMPLE_FORMULAS = [
  { left: 12, right: 21, sum: 33 },
  { left: 23, right: 32, sum: 55 },
  { left: 34, right: 43, sum: 77 },
  { left: 45, right: 54, sum: 99 }
]

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
      message: `😅 加法算得对，但 ${left} 和 ${right} 不是反转数对哦！试试 ${left} 和 ${(left % 10) * 10 + Math.floor(left / 10)}？`
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

// 3D 魔法天平/审判台
function MagicScale({ isJudging, result }: { isJudging: boolean, result: 'correct' | 'wrong' | null }) {
  const groupRef = useRef<THREE.Group>(null)
  const leftPanRef = useRef<THREE.Group>(null)
  const rightPanRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.1
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.05
    }
    
    // 天平晃动效果
    if (leftPanRef.current && rightPanRef.current) {
      if (isJudging) {
        // 判断中：剧烈摇摆
        const swing = Math.sin(time * 8) * 0.3
        leftPanRef.current.rotation.z = swing
        rightPanRef.current.rotation.z = -swing
      } else if (result === 'correct') {
        // 正确：平衡
        leftPanRef.current.rotation.z = leftPanRef.current.rotation.z * 0.9
        rightPanRef.current.rotation.z = rightPanRef.current.rotation.z * 0.9
      } else if (result === 'wrong') {
        // 错误：倾斜
        leftPanRef.current.rotation.z += (0.2 - leftPanRef.current.rotation.z) * 0.1
        rightPanRef.current.rotation.z += (-0.2 - rightPanRef.current.rotation.z) * 0.1
      }
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={groupRef}>
        {/* 底座 */}
        <mesh position={[0, -1.5, 0]}>
          <cylinderGeometry args={[0.8, 1, 0.3, 32]} />
          <meshStandardMaterial color={COLORS.indigo} metalness={0.5} roughness={0.3} />
        </mesh>
        
        {/* 支柱 */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 2, 16]} />
          <meshStandardMaterial color={COLORS.purple} metalness={0.6} roughness={0.3} />
        </mesh>
        
        {/* 横梁 */}
        <mesh position={[0, 0.5, 0]} rotation={[0, 0, 0]}>
          <RoundedBox args={[3, 0.15, 0.15]} radius={0.05}>
            <MeshTransmissionMaterial
              backside
              samples={8}
              thickness={0.3}
              chromaticAberration={0.2}
              color={COLORS.cyan}
              transmission={0.8}
            />
          </RoundedBox>
        </mesh>
        
        {/* 左托盘 */}
        <group ref={leftPanRef} position={[-1.2, 0.3, 0]}>
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
            <meshStandardMaterial 
              color={result === 'correct' ? COLORS.green : COLORS.yellow} 
              metalness={0.4} 
              roughness={0.4}
              emissive={result === 'correct' ? COLORS.green : COLORS.yellow}
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* 托盘链条 */}
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[Math.cos(i * Math.PI * 2 / 3) * 0.3, -0.15, Math.sin(i * Math.PI * 2 / 3) * 0.3]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
              <meshStandardMaterial color={COLORS.purple} metalness={0.7} />
            </mesh>
          ))}
        </group>
        
        {/* 右托盘 */}
        <group ref={rightPanRef} position={[1.2, 0.3, 0]}>
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
            <meshStandardMaterial 
              color={result === 'correct' ? COLORS.green : COLORS.yellow}
              metalness={0.4} 
              roughness={0.4}
              emissive={result === 'correct' ? COLORS.green : COLORS.yellow}
              emissiveIntensity={0.2}
            />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[Math.cos(i * Math.PI * 2 / 3) * 0.3, -0.15, Math.sin(i * Math.PI * 2 / 3) * 0.3]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
              <meshStandardMaterial color={COLORS.purple} metalness={0.7} />
            </mesh>
          ))}
        </group>
        
        {/* 顶部装饰 */}
        <mesh position={[0, 0.8, 0]}>
          <octahedronGeometry args={[0.2]} />
          <meshStandardMaterial 
            color={isJudging ? COLORS.orange : COLORS.cyan} 
            emissive={isJudging ? COLORS.orange : COLORS.cyan}
            emissiveIntensity={isJudging ? 0.8 : 0.3}
          />
        </mesh>
        
        {/* 判断时的粒子效果 */}
        {isJudging && (
          <Sparkles count={100} scale={4} size={6} speed={2} color={COLORS.orange} />
        )}
        
        {/* 正确时的粒子效果 */}
        {result === 'correct' && (
          <>
            <Sparkles count={80} scale={4} size={5} speed={1} color={COLORS.green} />
            <Sparkles count={60} scale={3} size={4} speed={0.8} color={COLORS.yellow} />
          </>
        )}
      </group>
    </Float>
  )
}

// 动画关键帧
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
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
  background-image: url(${backgrounds.mysticAlley});
  background-size: cover;
  background-position: center;
  z-index: 0;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.15) 100%);
  }
`

const CharacterGuide = styled(motion.div)`
  position: fixed;
  bottom: 100px;
  left: 20px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`

const CharacterImg = styled.img`
  width: 160px;
  height: auto;
  filter: drop-shadow(0 5px 20px rgba(0,0,0,0.3));
`

const CharacterSpeech = styled(motion.div)`
  background: white;
  padding: 12px 18px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
  font-size: 0.9rem;
  color: ${COLORS.textPrimary};
  max-width: 200px;
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

const AIJudgeImage = styled(motion.img)`
  width: 80px;
  height: auto;
  border-radius: 50%;
  border: 3px solid ${COLORS.gold};
  box-shadow: 0 5px 20px rgba(251, 191, 36, 0.4);
`

const Header = styled(motion.div)`
  text-align: center;
  padding: 12px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 0 0 20px 20px;
  margin: 0 auto;
  width: fit-content;
  padding: 12px 40px;
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
  filter: drop-shadow(0 3px 10px rgba(139, 92, 246, 0.4));
`

const Title = styled.h1`
  font-size: 1.8rem;
  background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.purple} 50%, ${COLORS.accent} 100%);
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
  flex: 0 0 280px;
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

const ExampleCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 6px 25px rgba(139, 92, 246, 0.15);
  flex: 1;
`

const ExampleTitle = styled.h3`
  color: ${COLORS.purple};
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
  background: ${props => props.highlighted ? 'linear-gradient(135deg, #f5f3ff, #ede9fe)' : 'transparent'};
  margin-bottom: 6px;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const FormulaNumber = styled.span<{ color?: string }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.color || COLORS.indigo};
  min-width: 32px;
  text-align: center;
`

const FormulaOperator = styled.span`
  font-size: 1.3rem;
  color: ${COLORS.cyan};
  font-weight: 700;
`

const InputCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 6px 25px rgba(139, 92, 246, 0.15);
`

const InputTitle = styled.h3`
  color: ${COLORS.purple};
  font-size: 1.1rem;
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
  margin-bottom: 20px;
`

const NumberInputBox = styled.div<{ active?: boolean; hasError?: boolean }>`
  width: 72px;
  height: 60px;
  border: 3px solid ${props => props.hasError ? '#ef4444' : props.active ? COLORS.purple : '#ddd6fe'};
  border-radius: 15px;
  font-size: 1.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLORS.indigo};
  background: ${props => props.hasError ? '#fef2f2' : props.active ? '#ede9fe' : '#faf5ff'};
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.active ? '0 0 20px rgba(139, 92, 246, 0.35)' : '0 2px 8px rgba(139, 92, 246, 0.1)'};
  
  &:hover {
    border-color: ${COLORS.purple};
    transform: scale(1.03);
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.25);
  }
  
  &:active {
    transform: scale(0.98);
  }
`

const NumberInputPlaceholder = styled.span`
  color: #c4b5fd;
  font-size: 1.2rem;
`

const OperatorDisplay = styled.span`
  font-size: 1.8rem;
  color: ${COLORS.cyan};
  font-weight: 700;
`

const JudgeButton = styled(motion.button)<{ disabled?: boolean }>`
  width: 100%;
  padding: 18px;
  border: none;
  border-radius: 15px;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  background: ${props => props.disabled 
    ? '#e5e7eb' 
    : `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.purple} 50%, ${COLORS.accent} 100%)`};
  color: white;
  box-shadow: ${props => props.disabled 
    ? 'none' 
    : '0 4px 20px rgba(30, 64, 175, 0.4)'};
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(30, 64, 175, 0.45);
    filter: brightness(1.05);
  }
  
  &:active:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(30, 64, 175, 0.35);
  }
`

const ResultCard = styled(motion.div)<{ type: 'success' | 'error' }>`
  padding: 20px;
  border-radius: 15px;
  margin-top: 20px;
  background: ${props => props.type === 'success' 
    ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' 
    : 'linear-gradient(135deg, #fef2f2, #fecaca)'};
  border: 2px solid ${props => props.type === 'success' ? COLORS.green : '#ef4444'};
  animation: ${props => props.type === 'error' ? shake : 'none'} 0.5s ease;
`

const ResultText = styled.p`
  font-size: 1.1rem;
  margin: 0;
  color: #374151;
  line-height: 1.6;
`

const CanvasContainer = styled.div`
  height: 200px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%);
  box-shadow: 0 6px 25px rgba(139, 92, 246, 0.15);
`

// 数字键盘样式
const KeypadCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 15px;
  box-shadow: 0 6px 25px rgba(139, 92, 246, 0.15);
  flex: 1;
`

const KeypadTitle = styled.h3`
  color: ${COLORS.purple};
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
    ? 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' 
    : 'linear-gradient(135deg, #ede9fe, #ddd6fe)'};
  color: ${props => props.variant === 'action' ? '#64748b' : COLORS.indigo};
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(139, 92, 246, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
    background: ${props => props.variant === 'action' 
      ? 'linear-gradient(135deg, #e2e8f0, #cbd5e1)' 
      : 'linear-gradient(135deg, #ddd6fe, #c4b5fd)'};
  }
  
  &:active {
    transform: translateY(0) scale(0.97);
    box-shadow: 0 1px 4px rgba(139, 92, 246, 0.15);
  }
`

const ActiveInputHint = styled.div<{ active: boolean }>`
  margin-top: 12px;
  padding: 10px;
  background: ${props => props.active ? '#ede9fe' : '#f8fafc'};
  border-radius: 12px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.active ? COLORS.purple : '#94a3b8'};
`

const SuccessOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  z-index: 100;
`

const SuccessTitle = styled(motion.h2)`
  font-size: 3rem;
  background: linear-gradient(135deg, ${COLORS.green} 0%, ${COLORS.cyan} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 20px;
`

const ContinueButton = styled(motion.button)`
  padding: 15px 40px;
  border: none;
  border-radius: 25px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.indigo} 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
  margin-top: 20px;
  
  &:hover {
    transform: scale(1.05);
  }
`

interface FormulaMagicStageProps {
  onComplete: () => void
}

// 当前激活的输入框
type ActiveInput = 'left' | 'right' | 'sum' | null

export default function FormulaMagicStage({ onComplete }: FormulaMagicStageProps) {
  const [leftNum, setLeftNum] = useState('')
  const [rightNum, setRightNum] = useState('')
  const [sumNum, setSumNum] = useState('')
  const [activeInput, setActiveInput] = useState<ActiveInput>('left')
  const [isJudging, setIsJudging] = useState(false)
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null)
  const [scaleResult, setScaleResult] = useState<'correct' | 'wrong' | null>(null)
  const [successCount, setSuccessCount] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [highlightedExample, setHighlightedExample] = useState(0)
  
  // 循环高亮范例
  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightedExample(prev => (prev + 1) % EXAMPLE_FORMULAS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // 数字键盘点击处理
  const handleKeypadClick = (key: string) => {
    if (!activeInput) return
    
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
  
  const handleJudge = async () => {
    const left = parseInt(leftNum)
    const right = parseInt(rightNum)
    const sum = parseInt(sumNum)
    
    if (isNaN(left) || isNaN(right) || isNaN(sum)) {
      setResult({ valid: false, message: '请填写完整的算式哦！' })
      return
    }
    
    setIsJudging(true)
    setResult(null)
    setScaleResult(null)
    
    // 判断动画
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const validation = validateFormula(left, right, sum)
    setIsJudging(false)
    setResult(validation)
    setScaleResult(validation.valid ? 'correct' : 'wrong')
    
    if (validation.valid) {
      setSuccessCount(prev => prev + 1)
      
      // 庆祝特效
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#22c55e', '#facc15', '#22d3ee']
      })
      
      // 显示成功界面
      setTimeout(() => {
        setShowSuccess(true)
      }, 1000)
    }
  }
  
  const handleReset = () => {
    setLeftNum('')
    setRightNum('')
    setSumNum('')
    setResult(null)
    setScaleResult(null)
  }
  
  const handleContinue = () => {
    setShowSuccess(false)
    handleReset()
  }
  
  return (
    <Container>
      <BackgroundImage />
      <ParticleBackground />
      
      {/* 尼克角色引导 */}
      <CharacterGuide
        initial={{ x: -150, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <CharacterSpeech
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          🦊 试试拼出反转数算式，闪电会帮你验证！
        </CharacterSpeech>
        <CharacterImg src={characters.nick} alt="Nick" />
      </CharacterGuide>
      
      <Header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <HeaderContent>
          <HeaderIcon src={items.magicScale} alt="魔法天秤" />
          <div>
            <Title>第二关：算式魔法台</Title>
            <Subtitle>和尼克一起仿写反转数算式，闪电会来判断对错！</Subtitle>
          </div>
        </HeaderContent>
      </Header>
      
      <MainContent>
        {/* 左侧 - 范例和3D */}
        <LeftSection>
          <ExampleCard
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ExampleTitle>
              <span>📚</span> 观察范例
            </ExampleTitle>
            
            {EXAMPLE_FORMULAS.map((formula, index) => (
              <FormulaRow 
                key={index}
                highlighted={index === highlightedExample}
                animate={{ 
                  scale: index === highlightedExample ? 1.03 : 1,
                  backgroundColor: index === highlightedExample ? '#f5f3ff' : 'transparent'
                }}
              >
                <FormulaNumber color={COLORS.purple}>{formula.left}</FormulaNumber>
                <FormulaOperator>+</FormulaOperator>
                <FormulaNumber color={COLORS.indigo}>{formula.right}</FormulaNumber>
                <FormulaOperator>=</FormulaOperator>
                <FormulaNumber color={COLORS.green}>{formula.sum}</FormulaNumber>
              </FormulaRow>
            ))}
            
            <motion.div
              style={{
                marginTop: '12px',
                padding: '10px 12px',
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                borderRadius: '12px',
                fontSize: '0.9rem',
                color: '#92400e',
                textAlign: 'center'
              }}
            >
              💡 规律：<strong>十位和个位交换</strong>！
            </motion.div>
          </ExampleCard>
        </LeftSection>
        
        {/* 中间 - 输入和3D */}
        <CenterSection>
          {/* 输入区 */}
          <InputCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <InputTitle>
              <span>✏️</span> 仿写算式 - 自己输入所有数字
            </InputTitle>
            
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
            
            <JudgeButton
              onClick={handleJudge}
              disabled={isJudging || !leftNum || !rightNum || !sumNum}
              whileHover={{ scale: 1.02, transition: { type: 'spring', damping: 20, stiffness: 400 } }}
              whileTap={{ scale: 0.98, transition: { type: 'spring', damping: 25, stiffness: 500 } }}
            >
              {isJudging ? (
                <>
                  <AIJudgeImage src={characters.flash} alt="Flash" />
                  闪电判断中...
                </>
              ) : (
                <>✨ 让闪电判断</>
              )}
            </JudgeButton>
            
            <AnimatePresence>
              {result && (
                <ResultCard
                  type={result.valid ? 'success' : 'error'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ marginTop: '15px', padding: '15px' }}
                >
                  <ResultText>{result.message}</ResultText>
                  {!result.valid && (
                    <motion.button
                      style={{
                        marginTop: '10px',
                        padding: '8px 20px',
                        border: 'none',
                        borderRadius: '10px',
                        background: COLORS.indigo,
                        color: 'white',
                        fontSize: '0.9rem',
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
            </AnimatePresence>
          </InputCard>

          {/* 3D天平 */}
          <CanvasContainer>
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={1} />
              <pointLight position={[-3, 3, 3]} color={COLORS.purple} intensity={0.5} />
              <Environment preset="studio" />
              <MagicScale isJudging={isJudging} result={scaleResult} />
            </Canvas>
          </CanvasContainer>
        </CenterSection>
        
        {/* 右侧 - 数字键盘 */}
        <RightSection>
          <KeypadCard
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
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
      
      {/* 成功通关界面 */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              style={{ textAlign: 'center' }}
            >
              <motion.div
                style={{ fontSize: '5rem', marginBottom: '20px' }}
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              >
                🏆
              </motion.div>
              <SuccessTitle>恭喜通关！</SuccessTitle>
              <motion.p
                style={{ fontSize: '1.3rem', color: '#6b7280', marginBottom: '10px' }}
              >
                你已经掌握了反转数算式的规律！
              </motion.p>
              <motion.p
                style={{ fontSize: '1.1rem', color: '#9ca3af' }}
              >
                已完成 {successCount} 道算式
              </motion.p>
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '25px' }}>
                <ContinueButton
                  onClick={handleContinue}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✏️ 再写一道
                </ContinueButton>
                <ContinueButton
                  onClick={onComplete}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                    background: `linear-gradient(135deg, ${COLORS.green} 0%, ${COLORS.cyan} 100%)` 
                  }}
                >
                  🎯 完成活动
                </ContinueButton>
              </div>
            </motion.div>
          </SuccessOverlay>
        )}
      </AnimatePresence>
    </Container>
  )
}
