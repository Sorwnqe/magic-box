import { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  Float, 
  MeshTransmissionMaterial,
  Sparkles,
  Environment,
  Stars
} from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import confetti from 'canvas-confetti'
import * as THREE from 'three'
import { 
  GiLockedDoor, 
  GiOpenGate,
  GiKey,
  GiSparkles,
  GiCastle
} from 'react-icons/gi'
import { 
  FaShieldAlt, 
  FaStar,
  FaCrown,
  FaRobot
} from 'react-icons/fa'
import { BsLightningChargeFill } from 'react-icons/bs'
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

// 范例展示
const EXAMPLE_FORMULAS = [
  { left: 18, right: 81, sum: 99 },
  { left: 27, right: 72, sum: 99 },
  { left: 36, right: 63, sum: 99 },
  { left: 45, right: 54, sum: 99 },
]

// 判断是否是反转数对
function isReversePair(a: number, b: number): boolean {
  if (a < 10 || a > 99 || b < 10 || b > 99) return false
  const aReversed = (a % 10) * 10 + Math.floor(a / 10)
  return aReversed === b
}

// AI验证密码
function validatePassword(left: number, right: number, sum: number): {
  valid: boolean
  message: string
  aiThinking: string[]
} {
  const isPair = isReversePair(left, right)
  const sumCorrect = left + right === sum
  const sumIs99 = sum === 99
  
  if (isPair && sumCorrect && sumIs99) {
    return {
      valid: true,
      message: '🎉 密码正确！魔法塔大门已开启！',
      aiThinking: [
        `🔍 检测数字 ${left} 和 ${right}...`,
        `✓ 确认：${left} 的十位是 ${Math.floor(left/10)}，个位是 ${left%10}`,
        `✓ 确认：${right} 的十位是 ${Math.floor(right/10)}，个位是 ${right%10}`,
        `✓ 验证：十位和个位互换 ✅`,
        `✓ 计算：${left} + ${right} = ${left + right}`,
        `✓ 验证：和等于 99 ✅`,
        `🔓 密码验证通过！`
      ]
    }
  } else if (!sumIs99 && sumCorrect && isPair) {
    return {
      valid: false,
      message: `⚠️ 这是反转数对，但和是 ${sum}，不是 99！`,
      aiThinking: [
        `🔍 检测数字 ${left} 和 ${right}...`,
        `✓ 验证：十位和个位互换 ✅`,
        `✗ 计算：${left} + ${right} = ${left + right}`,
        `✗ 错误：和不等于 99 ❌`,
        `🔒 密码验证失败`
      ]
    }
  } else if (isPair && !sumCorrect) {
    return {
      valid: false,
      message: `🤔 计算有误：${left} + ${right} = ${left + right}，不是 ${sum}`,
      aiThinking: [
        `🔍 检测算式...`,
        `✓ 验证：十位和个位互换 ✅`,
        `✗ 计算错误：${left} + ${right} ≠ ${sum}`,
        `🔒 密码验证失败`
      ]
    }
  } else if (!isPair && sumIs99) {
    return {
      valid: false,
      message: `😅 和是99，但 ${left} 和 ${right} 不是反转数对！`,
      aiThinking: [
        `🔍 检测数字 ${left} 和 ${right}...`,
        `✗ ${left} 反转后是 ${(left % 10) * 10 + Math.floor(left / 10)}，不是 ${right}`,
        `✗ 验证：十位和个位互换 ❌`,
        `🔒 密码验证失败`
      ]
    }
  } else {
    return {
      valid: false,
      message: '❌ 密码错误！检查：1. 两个数是反转数对吗？ 2. 和等于99吗？',
      aiThinking: [
        `🔍 检测算式 ${left} + ${right} = ${sum}...`,
        `✗ 条件不满足`,
        `🔒 密码验证失败`
      ]
    }
  }
}

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

// 3D 魔法塔
function MagicTower3D({ isUnlocking, isUnlocked, energy }: { 
  isUnlocking: boolean
  isUnlocked: boolean 
  energy: number 
}) {
  const groupRef = useRef<THREE.Group>(null)
  const doorRef = useRef<THREE.Mesh>(null)
  const gemsRef = useRef<THREE.Mesh[]>([])
  
  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.15
      groupRef.current.position.y = Math.sin(time * 0.4) * 0.05
    }
    
    // 门的动画
    if (doorRef.current) {
      if (isUnlocked) {
        doorRef.current.rotation.y += (Math.PI / 2 - doorRef.current.rotation.y) * 0.05
      } else if (isUnlocking) {
        doorRef.current.rotation.y = Math.sin(time * 10) * 0.1
      }
    }
    
    // 宝石闪烁
    gemsRef.current.forEach((gem, i) => {
      if (gem) {
        const scale = i < energy ? 1 + Math.sin(time * 3 + i) * 0.1 : 0.8
        gem.scale.setScalar(scale)
      }
    })
  })

  const maxEnergy = 4 // 需要找到4个正确密码

  return (
    <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.2}>
      <group ref={groupRef}>
        {/* 塔基 */}
        <mesh position={[0, -1.8, 0]}>
          <cylinderGeometry args={[1.2, 1.4, 0.4, 8]} />
          <meshStandardMaterial 
            color="#4c1d95" 
            metalness={0.3} 
            roughness={0.6}
          />
        </mesh>
        
        {/* 塔身 */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.9, 1.1, 2.2, 8]} />
          <meshStandardMaterial 
            color="#5b21b6" 
            metalness={0.4} 
            roughness={0.5}
          />
        </mesh>
        
        {/* 塔顶 */}
        <mesh position={[0, 1, 0]}>
          <coneGeometry args={[1, 1.5, 8]} />
          <meshStandardMaterial 
            color={isUnlocked ? COLORS.gold : "#7c3aed"}
            metalness={0.6} 
            roughness={0.3}
            emissive={isUnlocked ? COLORS.gold : "#7c3aed"}
            emissiveIntensity={isUnlocked ? 0.5 : 0.2}
          />
        </mesh>
        
        {/* 塔尖宝石 */}
        <mesh position={[0, 1.9, 0]}>
          <octahedronGeometry args={[0.2]} />
          <MeshTransmissionMaterial
            backside
            samples={8}
            thickness={0.3}
            chromaticAberration={0.2}
            color={isUnlocked ? COLORS.gold : COLORS.purple}
            transmission={0.8}
          />
        </mesh>
        
        {/* 门 */}
        <mesh 
          ref={doorRef} 
          position={[0, -0.8, 0.95]}
        >
          <boxGeometry args={[0.6, 1, 0.1]} />
          <meshStandardMaterial 
            color={isUnlocked ? COLORS.gold : "#92400e"}
            metalness={0.5}
            roughness={0.4}
            emissive={isUnlocking ? COLORS.cyan : 'black'}
            emissiveIntensity={isUnlocking ? 0.5 : 0}
          />
        </mesh>
        
        {/* 能量宝石指示器 - 围绕塔身 */}
        {Array.from({ length: maxEnergy }).map((_, i) => {
          const angle = (i / maxEnergy) * Math.PI * 2 - Math.PI / 2
          const radius = 1.3
          return (
            <mesh 
              key={i}
              ref={(el) => { if (el) gemsRef.current[i] = el }}
              position={[
                Math.cos(angle) * radius, 
                -0.3, 
                Math.sin(angle) * radius
              ]}
            >
              <octahedronGeometry args={[0.12]} />
              <meshStandardMaterial 
                color={i < energy ? COLORS.gold : '#64748b'}
                emissive={i < energy ? COLORS.gold : '#475569'}
                emissiveIntensity={i < energy ? 1 : 0.1}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          )
        })}
        
        {/* 解锁中的粒子 */}
        {isUnlocking && (
          <Sparkles count={100} scale={4} size={8} speed={3} color={COLORS.cyan} />
        )}
        
        {/* 解锁后的粒子 */}
        {isUnlocked && (
          <>
            <Sparkles count={150} scale={5} size={10} speed={2} color={COLORS.gold} />
            <Sparkles count={80} scale={4} size={6} speed={1.5} color={COLORS.pink} />
          </>
        )}
        
        {/* 背景星星 */}
        <Stars radius={50} depth={30} count={1000} factor={3} saturation={0.5} />
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
  0%, 100% { box-shadow: 0 0 30px rgba(124, 58, 237, 0.4); }
  50% { box-shadow: 0 0 60px rgba(124, 58, 237, 0.8); }
`

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
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
  bottom: 100px;
  left: 20px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`

const CharacterImg = styled.img`
  width: 150px;
  height: auto;
  filter: drop-shadow(0 5px 20px rgba(0,0,0,0.4));
`

const CharacterSpeech = styled(motion.div)`
  background: white;
  padding: 12px 18px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
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
  background: rgba(30, 27, 75, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 0 0 20px 20px;
  margin: 0 auto;
  width: fit-content;
  box-shadow: 0 5px 30px rgba(0,0,0,0.3);
  border: 1px solid rgba(124, 58, 237, 0.3);
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
  filter: drop-shadow(0 3px 10px rgba(251, 191, 36, 0.5));
`

const Title = styled.h1`
  font-size: 1.8rem;
  background: linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.orange} 50%, ${COLORS.pink} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`

const Subtitle = styled.p`
  color: #c4b5fd;
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
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const CenterSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const RightSection = styled.div`
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(124, 58, 237, 0.3);
`

const DarkCard = styled(motion.div)`
  background: rgba(30, 27, 75, 0.9);
  border: 2px solid rgba(124, 58, 237, 0.5);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
`

const CardTitle = styled.h3`
  color: ${COLORS.purple};
  font-size: 1rem;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const DarkCardTitle = styled.h3`
  color: ${COLORS.gold};
  font-size: 1rem;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const PasswordGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`

const PasswordItem = styled(motion.div)<{ found?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 8px;
  background: ${props => props.found 
    ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' 
    : 'linear-gradient(135deg, #f5f3ff, #ede9fe)'};
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.found ? COLORS.green : COLORS.purple};
  border: 2px solid ${props => props.found ? COLORS.green : 'transparent'};
`

const FormulaInputRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 12px;
`

const NumberInputBox = styled.div<{ active?: boolean; hasError?: boolean }>`
  width: 68px;
  height: 56px;
  border: 3px solid ${props => props.hasError ? COLORS.red : props.active ? COLORS.gold : '#a78bfa'};
  border-radius: 15px;
  font-size: 1.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLORS.purple};
  background: ${props => props.hasError ? '#fef2f2' : props.active ? '#fef3c7' : '#faf5ff'};
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.active ? `0 0 25px rgba(251, 191, 36, 0.5)` : '0 2px 8px rgba(124, 58, 237, 0.15)'};
  
  &:hover {
    border-color: ${COLORS.gold};
    transform: scale(1.03);
    box-shadow: 0 4px 16px rgba(251, 191, 36, 0.3);
  }
  
  &:active {
    transform: scale(0.98);
  }
`

const NumberInputPlaceholder = styled.span`
  color: #c4b5fd;
  font-size: 1.1rem;
`

const OperatorDisplay = styled.span`
  font-size: 1.6rem;
  color: ${COLORS.gold};
  font-weight: 700;
`

const SubmitButton = styled(motion.button)<{ disabled?: boolean }>`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 15px;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  background: ${props => props.disabled 
    ? '#e5e7eb' 
    : `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.deepPurple} 50%, ${COLORS.pink} 100%)`};
  color: white;
  box-shadow: ${props => props.disabled 
    ? 'none' 
    : '0 4px 25px rgba(124, 58, 237, 0.5)'};
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 35px rgba(124, 58, 237, 0.55);
    filter: brightness(1.05);
  }
  
  &:active:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 18px rgba(124, 58, 237, 0.4);
  }
`

const ResultCard = styled(motion.div)<{ type: 'success' | 'error' }>`
  padding: 14px;
  border-radius: 15px;
  margin-top: 12px;
  background: ${props => props.type === 'success' 
    ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' 
    : 'linear-gradient(135deg, #fef2f2, #fecaca)'};
  border: 2px solid ${props => props.type === 'success' ? COLORS.green : COLORS.red};
  animation: ${props => props.type === 'error' ? shake : 'none'} 0.5s ease;
`

const ResultText = styled.p`
  font-size: 0.95rem;
  margin: 0;
  color: #374151;
  line-height: 1.5;
`

const CanvasContainer = styled.div`
  flex: 1;
  min-height: 200px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  animation: ${glow} 3s ease-in-out infinite;
`

const KeypadCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 14px;
  box-shadow: 0 8px 32px rgba(124, 58, 237, 0.3);
  flex: 1;
`

const KeypadTitle = styled.h3`
  color: ${COLORS.purple};
  font-size: 0.95rem;
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
  height: 44px;
  border: none;
  border-radius: 12px;
  font-size: ${props => props.variant === 'action' ? '0.85rem' : '1.3rem'};
  font-weight: 700;
  cursor: pointer;
  background: ${props => props.variant === 'action' 
    ? `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.deepPurple})` 
    : 'linear-gradient(135deg, #f5f3ff, #ede9fe)'};
  color: ${props => props.variant === 'action' ? 'white' : COLORS.purple};
  box-shadow: 0 2px 6px rgba(124, 58, 237, 0.15);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(124, 58, 237, 0.25);
  }
  
  &:active {
    transform: translateY(0) scale(0.97);
    box-shadow: 0 1px 4px rgba(124, 58, 237, 0.15);
  }
`

const ActiveInputHint = styled.div<{ active: boolean }>`
  margin-top: 10px;
  padding: 8px;
  background: ${props => props.active ? '#fef3c7' : '#f1f5f9'};
  border-radius: 10px;
  text-align: center;
  font-size: 0.8rem;
  color: ${props => props.active ? '#92400e' : '#94a3b8'};
`

const ProgressBar = styled.div`
  margin-top: 12px;
  background: #e5e7eb;
  border-radius: 10px;
  height: 12px;
  overflow: hidden;
`

const ProgressFill = styled(motion.div)<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, ${COLORS.purple}, ${COLORS.gold});
  border-radius: 10px;
  width: ${props => props.progress}%;
`

const AIThinkingBox = styled(motion.div)`
  margin-top: 10px;
  padding: 12px;
  background: #1e1b4b;
  border-radius: 12px;
  font-family: 'Monaco', monospace;
  font-size: 0.75rem;
  color: ${COLORS.cyan};
  max-height: 120px;
  overflow-y: auto;
`

const AIThinkingLine = styled(motion.div)`
  margin: 4px 0;
  display: flex;
  align-items: center;
  gap: 6px;
`

const TipBox = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 12px;
  font-size: 0.85rem;
  color: #92400e;
  text-align: center;
`

const SuccessOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
`

const SuccessBanner = styled(motion.div)`
  background: linear-gradient(135deg, #fef3c7, #fde68a, #fbbf24);
  padding: 50px 70px;
  border-radius: 30px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
  text-align: center;
  z-index: 100;
`

const IconFloat = styled(motion.div)`
  animation: ${float} 2s ease-in-out infinite;
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
  const [aiThinking, setAiThinking] = useState<string[]>([])
  const [isShowingAI, setIsShowingAI] = useState(false)
  const [foundPasswords, setFoundPasswords] = useState<Set<string>>(new Set())
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // 检查密码是否已找到
  const isPasswordFound = (left: number, right: number) => {
    return foundPasswords.has(`${left}+${right}`) || foundPasswords.has(`${right}+${left}`)
  }
  
  // 键盘输入处理
  const handleKeypadClick = (value: string) => {
    if (!activeInput || isUnlocking) return
    
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
    
    setResult(null)
    setAiThinking([])
    setIsShowingAI(false)
  }
  
  // AI验证密码
  const handleSubmit = () => {
    const left = parseInt(leftNum)
    const right = parseInt(rightNum)
    const sum = parseInt(sumNum)
    
    if (isNaN(left) || isNaN(right) || isNaN(sum)) {
      setResult({ valid: false, message: '请填写完整的密码算式！' })
      return
    }
    
    setIsUnlocking(true)
    setIsShowingAI(true)
    setAiThinking([])
    
    const validation = validatePassword(left, right, sum)
    
    // 逐行显示AI思考过程
    validation.aiThinking.forEach((line, index) => {
      setTimeout(() => {
        setAiThinking(prev => [...prev, line])
      }, (index + 1) * 400)
    })
    
    // 显示最终结果
    setTimeout(() => {
      setResult(validation)
      setIsUnlocking(false)
      
      if (validation.valid) {
        const passwordKey = `${left}+${right}`
        
        if (!isPasswordFound(left, right)) {
          const newFound = new Set(foundPasswords)
          newFound.add(passwordKey)
          setFoundPasswords(newFound)
          
          // 庆祝效果
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: [COLORS.gold, COLORS.purple, COLORS.pink]
          })
          
          // 检查是否全部完成
          if (newFound.size >= 4) {
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
        } else {
          setResult({ valid: true, message: '✅ 密码正确！但这个密码你已经找到过了，试试其他的！' })
        }
      }
    }, validation.aiThinking.length * 400 + 500)
  }
  
  // 重置
  const handleReset = () => {
    setLeftNum('')
    setRightNum('')
    setSumNum('')
    setResult(null)
    setAiThinking([])
    setIsShowingAI(false)
    setActiveInput('left')
  }
  
  const progress = (foundPasswords.size / 4) * 100
  
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
          🦁 找到所有和为99的密码，拯救动物城！
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
              <GiCastle size={32} />
              第四关：九十九魔法塔
              <GiCastle size={32} />
            </Title>
            <Subtitle>🔒 终极挑战！和狮子市长一起输入密码算式，打开市政厅塔楼大门！</Subtitle>
          </div>
        </HeaderContent>
      </Header>
      
      <MainContent>
        {/* 左侧 - 密码展示和进度 */}
        <LeftSection>
          <Card
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardTitle>
              <GiKey size={20} /> 密码列表 ({foundPasswords.size}/4)
            </CardTitle>
            
            <PasswordGrid>
              {EXAMPLE_FORMULAS.map((formula, index) => {
                const found = isPasswordFound(formula.left, formula.right)
                return (
                  <PasswordItem
                    key={index}
                    found={found}
                    animate={{ 
                      scale: found ? [1, 1.05, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {found ? <FaStar color={COLORS.gold} /> : <GiLockedDoor />}
                    {found ? `${formula.left}+${formula.right}=99` : '??+??=99'}
                  </PasswordItem>
                )
              })}
            </PasswordGrid>
            
            <ProgressBar>
              <ProgressFill 
                progress={progress}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </ProgressBar>
            
            <TipBox>
              💡 <strong>规律</strong>：个位相加得 <strong>9</strong>，十位相加得 <strong>9</strong>！
            </TipBox>
          </Card>
          
          {/* AI验证显示 */}
          <DarkCard
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <DarkCardTitle>
              <FaRobot size={18} /> AI 密码验证器
            </DarkCardTitle>
            
            {isShowingAI && (
              <AIThinkingBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {aiThinking.map((line, i) => (
                  <AIThinkingLine
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <BsLightningChargeFill size={10} color={COLORS.gold} />
                    {line}
                  </AIThinkingLine>
                ))}
                {isUnlocking && (
                  <AIThinkingLine>
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      ⏳ 验证中...
                    </motion.span>
                  </AIThinkingLine>
                )}
              </AIThinkingBox>
            )}
            
            {!isShowingAI && (
              <p style={{ color: '#94a3b8', textAlign: 'center', margin: '20px 0', fontSize: '0.85rem' }}>
                输入密码后，AI将验证是否正确
              </p>
            )}
          </DarkCard>
        </LeftSection>
        
        {/* 中间 - 3D魔法塔和输入 */}
        <CenterSection>
          <CanvasContainer>
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 5, 5]} intensity={0.8} />
              <pointLight position={[-3, 3, 3]} color={COLORS.purple} intensity={0.6} />
              <pointLight position={[3, 2, 2]} color={COLORS.gold} intensity={0.4} />
              <Environment preset="night" />
              <MagicTower3D 
                isUnlocking={isUnlocking} 
                isUnlocked={isUnlocked} 
                energy={foundPasswords.size} 
              />
            </Canvas>
          </CanvasContainer>
          
          <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <CardTitle>
              <FaShieldAlt size={18} /> 输入密码算式（和必须等于99）
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
              disabled={isUnlocking || !leftNum || !rightNum || !sumNum}
              whileHover={{ scale: 1.02, transition: { type: 'spring', damping: 20, stiffness: 400 } }}
              whileTap={{ scale: 0.97, transition: { type: 'spring', damping: 25, stiffness: 500 } }}
            >
              <GiKey size={20} />
              {isUnlocking ? 'AI 验证中...' : '🔐 验证密码'}
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
                        background: COLORS.purple,
                        color: 'white',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={handleReset}
                      whileHover={{ scale: 1.03, transition: { type: 'spring', damping: 20, stiffness: 400 } }}
                      whileTap={{ scale: 0.97, transition: { type: 'spring', damping: 25, stiffness: 500 } }}
                    >
                      🔄 重新输入
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
            <KeypadTitle>
              <GiSparkles size={16} /> 密码键盘
            </KeypadTitle>
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
          <SuccessOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SuccessBanner
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', damping: 12 }}
            >
              <IconFloat>
                <motion.div
                  style={{ fontSize: '5rem', marginBottom: 15 }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
                >
                  🏆
                </motion.div>
              </IconFloat>
              
              <h2 style={{ 
                fontSize: '2.2rem', 
                margin: '0 0 10px',
                background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.pink})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                <FaCrown style={{ marginRight: 10 }} />
                魔法塔大门已开启！
                <FaCrown style={{ marginLeft: 10 }} />
              </h2>
              
              <p style={{ color: '#5b21b6', margin: '0 0 8px', fontSize: '1.1rem' }}>
                🎉 恭喜你找到了所有密码！
              </p>
              <p style={{ color: '#7c3aed', margin: '0 0 25px', fontSize: '0.95rem' }}>
                规律：个位相加得9，十位相加得9
              </p>
              
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 10, 
                justifyContent: 'center',
                marginBottom: 25 
              }}>
                {EXAMPLE_FORMULAS.map((f, i) => (
                  <motion.span
                    key={i}
                    style={{
                      padding: '8px 15px',
                      background: 'white',
                      borderRadius: 10,
                      fontWeight: 600,
                      color: COLORS.purple
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {f.left}+{f.right}=99
                  </motion.span>
                ))}
              </div>
              
              <motion.button
                style={{
                  padding: '15px 40px',
                  border: 'none',
                  borderRadius: 25,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.pink})`,
                  color: 'white',
                  boxShadow: '0 4px 25px rgba(124, 58, 237, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
                onClick={() => {
                  setShowSuccess(false)
                  onComplete?.()
                }}
                whileHover={{ scale: 1.05 }}
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
