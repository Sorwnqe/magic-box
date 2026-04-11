import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'

interface EpicIntroProps {
  onComplete: () => void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  life: number
  maxLife: number
  type: 'spark' | 'glow' | 'trail' | 'star'
  rotation: number
  rotationSpeed: number
}

// 颜色配置
const COLORS = {
  cyan: '#00d4ff',
  magenta: '#ff00ff',
  green: '#00ff88',
  yellow: '#ffcc00',
  white: '#ffffff',
  pink: '#ff6b9d',
  purple: '#a855f7',
  orange: '#ff8c00'
}

const colorArray = Object.values(COLORS)

export default function EpicIntro({ onComplete }: EpicIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<'gathering' | 'explosion' | 'forming' | 'complete'>('gathering')
  const [showText, setShowText] = useState(false)
  const [textPhase, setTextPhase] = useState(0)
  const particlesRef = useRef<Particle[]>([])
  const frameRef = useRef(0)
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布大小
    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio
      canvas.height = window.innerHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const width = window.innerWidth
    const height = window.innerHeight
    const centerX = width / 2
    const centerY = height / 2

    // 初始化粒子 - 从四周聚集
    const initGatheringParticles = () => {
      const particles: Particle[] = []
      
      // 创建从四周飞入的粒子
      for (let i = 0; i < 300; i++) {
        const angle = Math.random() * Math.PI * 2
        const distance = Math.max(width, height)
        const startX = centerX + Math.cos(angle) * distance
        const startY = centerY + Math.sin(angle) * distance
        
        particles.push({
          x: startX,
          y: startY,
          vx: (centerX - startX) * 0.02 * (0.5 + Math.random() * 0.5),
          vy: (centerY - startY) * 0.02 * (0.5 + Math.random() * 0.5),
          size: Math.random() * 4 + 2,
          color: colorArray[Math.floor(Math.random() * colorArray.length)],
          alpha: 1,
          life: 1,
          maxLife: 1,
          type: Math.random() > 0.7 ? 'star' : 'spark',
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2
        })
      }
      
      // 添加拖尾粒子
      for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2
        const distance = Math.max(width, height) * 0.8
        particles.push({
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance,
          vx: (centerX - particles[i].x) * 0.015,
          vy: (centerY - particles[i].y) * 0.015,
          size: Math.random() * 3 + 1,
          color: COLORS.cyan,
          alpha: 0.6,
          life: 1,
          maxLife: 1,
          type: 'trail',
          rotation: 0,
          rotationSpeed: 0
        })
      }
      
      return particles
    }

    // 爆炸粒子
    const createExplosion = () => {
      const particles: Particle[] = []
      
      // 主爆炸波
      for (let i = 0; i < 500; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 20 + 5
        const color = colorArray[Math.floor(Math.random() * colorArray.length)]
        
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 6 + 2,
          color,
          alpha: 1,
          life: 100 + Math.random() * 100,
          maxLife: 100 + Math.random() * 100,
          type: Math.random() > 0.5 ? 'spark' : 'glow',
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.3
        })
      }
      
      // 环形波动
      for (let ring = 0; ring < 5; ring++) {
        const ringParticles = 60
        const baseSpeed = 8 + ring * 3
        for (let i = 0; i < ringParticles; i++) {
          const angle = (i / ringParticles) * Math.PI * 2
          particles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * baseSpeed,
            vy: Math.sin(angle) * baseSpeed,
            size: 4,
            color: ring % 2 === 0 ? COLORS.cyan : COLORS.magenta,
            alpha: 1,
            life: 80,
            maxLife: 80,
            type: 'glow',
            rotation: 0,
            rotationSpeed: 0
          })
        }
      }
      
      // 星星爆发
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 15 + 10
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 8 + 4,
          color: COLORS.white,
          alpha: 1,
          life: 150,
          maxLife: 150,
          type: 'star',
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.5
        })
      }
      
      return particles
    }

    // 绘制星星
    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
        const r = i === 0 ? size : size
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r)
        const innerAngle = angle + (2 * Math.PI) / 10
        ctx.lineTo(Math.cos(innerAngle) * (size * 0.4), Math.sin(innerAngle) * (size * 0.4))
      }
      ctx.closePath()
      ctx.restore()
    }

    // 绘制粒子
    const drawParticle = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save()
      ctx.globalAlpha = p.alpha * (p.life / p.maxLife)
      
      if (p.type === 'star') {
        // 发光效果
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
        gradient.addColorStop(0, p.color)
        gradient.addColorStop(0.5, p.color + '80')
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
        ctx.fill()
        
        // 星星本体
        ctx.fillStyle = p.color
        drawStar(ctx, p.x, p.y, p.size, p.rotation)
        ctx.fill()
      } else if (p.type === 'glow') {
        // 发光球
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
        gradient.addColorStop(0, p.color)
        gradient.addColorStop(0.3, p.color + 'aa')
        gradient.addColorStop(0.6, p.color + '44')
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fill()
      } else if (p.type === 'trail') {
        // 拖尾效果
        ctx.strokeStyle = p.color
        ctx.lineWidth = p.size
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x - p.vx * 5, p.y - p.vy * 5)
        ctx.stroke()
      } else {
        // 普通火花
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        
        // 添加发光
        ctx.shadowColor = p.color
        ctx.shadowBlur = 10
        ctx.fill()
      }
      
      ctx.restore()
    }

    // 初始化
    particlesRef.current = initGatheringParticles()
    startTimeRef.current = Date.now()

    // 动画循环
    let animationId: number
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      frameRef.current++
      
      // 清除画布（带拖影效果）
      ctx.fillStyle = 'rgba(26, 26, 46, 0.15)'
      ctx.fillRect(0, 0, width, height)
      
      // 阶段控制
      if (phase === 'gathering' && elapsed > 1500) {
        setPhase('explosion')
        particlesRef.current = createExplosion()
        startTimeRef.current = Date.now()
      } else if (phase === 'explosion' && elapsed > 2000) {
        setPhase('forming')
        setShowText(true)
        startTimeRef.current = Date.now()
      } else if (phase === 'forming' && elapsed > 500) {
        setTextPhase(1)
      }
      
      if (phase === 'forming' && elapsed > 1500) {
        setTextPhase(2)
      }
      
      if (phase === 'forming' && elapsed > 2500) {
        setTextPhase(3)
      }
      
      if (phase === 'forming' && elapsed > 3500) {
        setPhase('complete')
      }

      // 更新和绘制粒子
      particlesRef.current = particlesRef.current.filter(p => {
        // 更新位置
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed
        
        // 聚集阶段：减速并聚集到中心
        if (phase === 'gathering') {
          const dx = centerX - p.x
          const dy = centerY - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          
          if (dist > 10) {
            p.vx += dx * 0.001
            p.vy += dy * 0.001
          } else {
            p.vx *= 0.95
            p.vy *= 0.95
          }
          
          // 添加螺旋效果
          const angle = Math.atan2(dy, dx)
          p.vx += Math.cos(angle + Math.PI / 2) * 0.5
          p.vy += Math.sin(angle + Math.PI / 2) * 0.5
        }
        
        // 爆炸阶段：添加阻力
        if (phase === 'explosion' || phase === 'forming') {
          p.vx *= 0.98
          p.vy *= 0.98
          p.life -= 1
        }
        
        // 绘制
        if (p.life > 0 || phase === 'gathering') {
          drawParticle(ctx, p)
        }
        
        return p.life > 0 || phase === 'gathering'
      })

      // 在 forming 阶段添加持续的环境粒子
      if (phase === 'forming' || phase === 'complete') {
        if (frameRef.current % 3 === 0) {
          const angle = Math.random() * Math.PI * 2
          const dist = Math.random() * 300 + 100
          particlesRef.current.push({
            x: centerX + Math.cos(angle) * dist,
            y: centerY + Math.sin(angle) * dist,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 2 + 1,
            color: colorArray[Math.floor(Math.random() * colorArray.length)],
            alpha: 0.6,
            life: 60,
            maxLife: 60,
            type: 'spark',
            rotation: 0,
            rotationSpeed: 0
          })
        }
      }

      // 中心发光效果
      if (phase === 'gathering') {
        const pulseSize = 50 + Math.sin(frameRef.current * 0.1) * 20
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize)
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)')
        gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.4)')
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2)
        ctx.fill()
      }

      // 爆炸闪光
      if (phase === 'explosion' && elapsed < 200) {
        const flashAlpha = 1 - elapsed / 200
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.5})`
        ctx.fillRect(0, 0, width, height)
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [phase])

  return (
    <Container>
      <Canvas ref={canvasRef} />
      
      <AnimatePresence>
        {showText && (
          <TextOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <TitleContainer>
              {['数', '字', '魔', '盒'].map((char, i) => (
                <TitleChar
                  key={i}
                  initial={{ opacity: 0, y: 100, scale: 0, rotateX: 90 }}
                  animate={{ 
                    opacity: textPhase > 0 ? 1 : 0, 
                    y: textPhase > 0 ? 0 : 100,
                    scale: textPhase > 0 ? 1 : 0,
                    rotateX: textPhase > 0 ? 0 : 90
                  }}
                  transition={{ 
                    delay: i * 0.15,
                    duration: 0.6,
                    type: "spring",
                    stiffness: 200
                  }}
                >
                  {char}
                </TitleChar>
              ))}
            </TitleContainer>
            
            <SubTitle
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: textPhase >= 2 ? 1 : 0,
                y: textPhase >= 2 ? 0 : 30
              }}
              transition={{ duration: 0.5 }}
            >
              DIGITAL MAGIC BOX
            </SubTitle>

            <EnterButton
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: textPhase >= 3 ? 1 : 0,
                scale: textPhase >= 3 ? 1 : 0
              }}
              transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
            >
              <ButtonInner>
                <span>开启魔法之旅</span>
                <Arrow
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </Arrow>
              </ButtonInner>
              <ButtonGlow />
              <ButtonRing
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </EnterButton>
          </TextOverlay>
        )}
      </AnimatePresence>

      {/* 边框装饰 */}
      <Corner position="top-left" />
      <Corner position="top-right" />
      <Corner position="bottom-left" />
      <Corner position="bottom-right" />
      
      {/* 扫描线 */}
      <ScanLine
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </Container>
  )
}

// Styled Components
const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #2d2d5a 50%, #1a1a2e 100%);
  overflow: hidden;
  z-index: 9999;
`

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const TextOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`

const TitleContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  perspective: 1000px;
`

const TitleChar = styled(motion.span)`
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(60px, 15vw, 140px);
  font-weight: 900;
  background: linear-gradient(135deg, #00d4ff 0%, #ff00ff 30%, #00ff88 60%, #ffcc00 100%);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientFlow 3s ease infinite;
  filter: drop-shadow(0 0 30px rgba(0, 212, 255, 0.5));
  
  @keyframes gradientFlow {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`

const SubTitle = styled(motion.p)`
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(16px, 4vw, 28px);
  color: #00d4ff;
  letter-spacing: 12px;
  text-shadow: 0 0 20px #00d4ff;
  margin-bottom: 50px;
`

const EnterButton = styled(motion.button)`
  position: relative;
  padding: 20px 50px;
  background: transparent;
  border: 2px solid #00d4ff;
  border-radius: 50px;
  cursor: pointer;
  pointer-events: auto;
  overflow: visible;
  
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50px;
    background: linear-gradient(135deg, #00d4ff, #ff00ff, #00ff88);
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:hover::before {
    opacity: 1;
  }
  
  &:hover {
    border-color: transparent;
  }
`

const ButtonInner = styled.span`
  display: flex;
  align-items: center;
  gap: 15px;
  font-family: 'Orbitron', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: white;
  position: relative;
  z-index: 2;
`

const Arrow = styled(motion.span)`
  font-size: 24px;
`

const ButtonGlow = styled.span`
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 0;
`

const ButtonRing = styled(motion.span)`
  position: absolute;
  inset: -5px;
  border: 2px solid #00d4ff;
  border-radius: 50px;
  z-index: 1;
`

const Corner = styled.div<{ position: string }>`
  position: absolute;
  width: 80px;
  height: 80px;
  border: 2px solid #00d4ff;
  opacity: 0.4;
  
  ${props => {
    switch (props.position) {
      case 'top-left':
        return `top: 20px; left: 20px; border-right: none; border-bottom: none;`
      case 'top-right':
        return `top: 20px; right: 20px; border-left: none; border-bottom: none;`
      case 'bottom-left':
        return `bottom: 20px; left: 20px; border-right: none; border-top: none;`
      case 'bottom-right':
        return `bottom: 20px; right: 20px; border-left: none; border-top: none;`
      default:
        return ''
    }
  }}
`

const ScanLine = styled(motion.div)`
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  opacity: 0.3;
  pointer-events: none;
`
