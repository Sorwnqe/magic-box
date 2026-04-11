import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

interface CuteIntroProps {
  onComplete: () => void
}

// 可爱的颜色配置
const CUTE_COLORS = {
  pink: '#ff6b9d',
  lightPink: '#ffb3c6',
  purple: '#a78bfa',
  mint: '#6ee7b7',
  yellow: '#fcd34d',
  sky: '#7dd3fc',
  peach: '#fdba74',
  lavender: '#c4b5fd',
  rose: '#fda4af'
}

const colorArray = Object.values(CUTE_COLORS)

export default function CuteIntro({ onComplete }: CuteIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<'intro' | 'title' | 'ready'>('intro')
  const [showElements, setShowElements] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth * window.devicePixelRatio
    canvas.height = window.innerHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = window.innerWidth
    const height = window.innerHeight

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      type: 'star' | 'heart' | 'bubble' | 'sparkle'
      rotation: number
      rotationSpeed: number
      alpha: number
      scale: number
      scaleDir: number
    }

    const particles: Particle[] = []

    // 创建初始粒子
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1,
        vy: -Math.random() * 1.5 - 0.5,
        size: Math.random() * 20 + 10,
        color: colorArray[Math.floor(Math.random() * colorArray.length)],
        type: ['star', 'heart', 'bubble', 'sparkle'][Math.floor(Math.random() * 4)] as Particle['type'],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        alpha: Math.random() * 0.5 + 0.5,
        scale: 1,
        scaleDir: 1
      })
    }

    // 绘制星星 ⭐
    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, rotation: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
        const outerX = Math.cos(angle) * size
        const outerY = Math.sin(angle) * size
        if (i === 0) ctx.moveTo(outerX, outerY)
        else ctx.lineTo(outerX, outerY)
        
        const innerAngle = angle + Math.PI / 5
        const innerX = Math.cos(innerAngle) * (size * 0.4)
        const innerY = Math.sin(innerAngle) * (size * 0.4)
        ctx.lineTo(innerX, innerY)
      }
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
      ctx.restore()
    }

    // 绘制爱心 ❤️
    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, rotation: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.beginPath()
      ctx.moveTo(0, size * 0.3)
      ctx.bezierCurveTo(-size, -size * 0.3, -size * 0.5, -size, 0, -size * 0.5)
      ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.3, 0, size * 0.3)
      ctx.fillStyle = color
      ctx.fill()
      ctx.restore()
    }

    // 绘制气泡 🫧
    const drawBubble = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
      const gradient = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
      gradient.addColorStop(0.5, color + '60')
      gradient.addColorStop(1, color + '20')
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // 绘制闪光 ✨
    const drawSparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, scale: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(scale, scale)
      ctx.fillStyle = color
      
      // 四角星
      ctx.beginPath()
      ctx.moveTo(0, -size)
      ctx.quadraticCurveTo(size * 0.2, -size * 0.2, size, 0)
      ctx.quadraticCurveTo(size * 0.2, size * 0.2, 0, size)
      ctx.quadraticCurveTo(-size * 0.2, size * 0.2, -size, 0)
      ctx.quadraticCurveTo(-size * 0.2, -size * 0.2, 0, -size)
      ctx.fill()
      ctx.restore()
    }

    let animationId: number
    const animate = () => {
      // 绘制渐变背景
      const bgGradient = ctx.createLinearGradient(0, 0, width, height)
      bgGradient.addColorStop(0, '#fef7ff')
      bgGradient.addColorStop(0.5, '#fdf4ff')
      bgGradient.addColorStop(1, '#f5f3ff')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)

      // 更新和绘制粒子
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed
        
        // 闪烁效果
        p.scale += 0.02 * p.scaleDir
        if (p.scale > 1.2) p.scaleDir = -1
        if (p.scale < 0.8) p.scaleDir = 1

        // 边界处理
        if (p.y < -50) {
          p.y = height + 50
          p.x = Math.random() * width
        }
        if (p.x < -50) p.x = width + 50
        if (p.x > width + 50) p.x = -50

        ctx.globalAlpha = p.alpha

        switch (p.type) {
          case 'star':
            drawStar(ctx, p.x, p.y, p.size * p.scale, p.color, p.rotation)
            break
          case 'heart':
            drawHeart(ctx, p.x, p.y, p.size * p.scale, p.color, p.rotation)
            break
          case 'bubble':
            drawBubble(ctx, p.x, p.y, p.size * p.scale, p.color)
            break
          case 'sparkle':
            drawSparkle(ctx, p.x, p.y, p.size * p.scale, p.color, p.scale)
            break
        }
      })

      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(animate)
    }

    animate()

    // 阶段控制
    setTimeout(() => setShowElements(true), 300)
    setTimeout(() => setPhase('title'), 800)
    setTimeout(() => setPhase('ready'), 2000)

    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <Container>
      <Canvas ref={canvasRef} />
      
      {/* 装饰性云朵 */}
      <Cloud style={{ top: '10%', left: '5%' }} delay={0} />
      <Cloud style={{ top: '15%', right: '10%' }} delay={0.3} />
      <Cloud style={{ bottom: '20%', left: '8%' }} delay={0.6} />

      {/* 彩虹 */}
      <AnimatePresence>
        {showElements && (
          <Rainbow
            initial={{ opacity: 0, scale: 0, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%' }}
            transition={{ duration: 0.8, type: "spring" }}
          />
        )}
      </AnimatePresence>

      {/* 主标题区 */}
      <ContentWrapper>
        <AnimatePresence>
          {phase !== 'intro' && (
            <>
              {/* 魔盒图标 */}
              <MagicBoxIcon
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
              >
                🎁
              </MagicBoxIcon>

              {/* 标题 */}
              <TitleContainer>
                {['数', '字', '魔', '盒'].map((char, i) => (
                  <TitleChar
                    key={i}
                    initial={{ opacity: 0, y: 50, rotate: -20 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ 
                      delay: 0.1 + i * 0.15,
                      duration: 0.5,
                      type: "spring",
                      stiffness: 300
                    }}
                    color={[CUTE_COLORS.pink, CUTE_COLORS.purple, CUTE_COLORS.sky, CUTE_COLORS.mint][i]}
                  >
                    {char}
                    <CharSparkle style={{ top: -10, right: -5 }}>✨</CharSparkle>
                  </TitleChar>
                ))}
              </TitleContainer>

              {/* 副标题 */}
              <SubTitle
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                🌈 和小魔法师一起探索数字的奥秘 🌈
              </SubTitle>

              {/* 可爱的小动物装饰 */}
              <FloatingEmoji style={{ top: '20%', left: '15%' }} delay={0.5}>🐰</FloatingEmoji>
              <FloatingEmoji style={{ top: '25%', right: '15%' }} delay={0.7}>🦄</FloatingEmoji>
              <FloatingEmoji style={{ bottom: '30%', left: '10%' }} delay={0.9}>🐱</FloatingEmoji>
              <FloatingEmoji style={{ bottom: '25%', right: '12%' }} delay={1.1}>🌟</FloatingEmoji>
            </>
          )}
        </AnimatePresence>

        {/* 开始按钮 */}
        <AnimatePresence>
          {phase === 'ready' && (
            <StartButton
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
            >
              <ButtonContent>
                <span>开始魔法之旅</span>
                <ButtonEmoji>🚀</ButtonEmoji>
              </ButtonContent>
              <ButtonStars>
                <span>⭐</span>
                <span>✨</span>
                <span>💫</span>
              </ButtonStars>
            </StartButton>
          )}
        </AnimatePresence>
      </ContentWrapper>

      {/* 底部波浪 */}
      <WaveContainer>
        <Wave color="#ffb3c6" delay={0} />
        <Wave color="#c4b5fd" delay={-2} />
        <Wave color="#a8edea" delay={-4} />
      </WaveContainer>
    </Container>
  )
}

// 动画关键帧
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
`

const bounceAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`

const waveAnimation = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`

const sparkleAnimation = keyframes`
  0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
  50% { opacity: 0.5; transform: scale(0.8) rotate(180deg); }
`

const cloudFloat = keyframes`
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(10px) translateY(-5px); }
`

// Styled Components
const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
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

const ContentWrapper = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
`

const Cloud = styled.div<{ delay: number }>`
  position: absolute;
  width: 120px;
  height: 60px;
  background: white;
  border-radius: 60px;
  opacity: 0.8;
  animation: ${cloudFloat} 4s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  
  &::before, &::after {
    content: '';
    position: absolute;
    background: white;
    border-radius: 50%;
  }
  
  &::before {
    width: 50px;
    height: 50px;
    top: -25px;
    left: 20px;
  }
  
  &::after {
    width: 70px;
    height: 70px;
    top: -35px;
    right: 20px;
  }
`

const Rainbow = styled(motion.div)`
  position: absolute;
  top: 5%;
  left: 50%;
  width: 400px;
  height: 200px;
  border-radius: 200px 200px 0 0;
  background: linear-gradient(
    180deg,
    #ff6b6b 0%,
    #ffd93d 16.67%,
    #6ee7b7 33.33%,
    #7dd3fc 50%,
    #a78bfa 66.67%,
    #ff6b9d 83.33%
  );
  opacity: 0.6;
  
  &::after {
    content: '';
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    bottom: 0;
    background: linear-gradient(135deg, #fef7ff 0%, #fdf4ff 100%);
    border-radius: 180px 180px 0 0;
  }
`

const MagicBoxIcon = styled(motion.div)`
  font-size: 80px;
  margin-bottom: 20px;
  animation: ${bounceAnimation} 2s ease-in-out infinite;
  filter: drop-shadow(0 10px 20px rgba(255, 107, 157, 0.3));
`

const TitleContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`

const TitleChar = styled(motion.span)<{ color: string }>`
  font-family: 'Nunito', sans-serif;
  font-size: clamp(50px, 12vw, 100px);
  font-weight: 900;
  color: ${props => props.color};
  text-shadow: 
    3px 3px 0 white,
    6px 6px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  display: inline-block;
`

const CharSparkle = styled.span`
  position: absolute;
  font-size: 24px;
  animation: ${sparkleAnimation} 1.5s ease-in-out infinite;
`

const SubTitle = styled(motion.p)`
  font-family: 'Noto Sans SC', sans-serif;
  font-size: clamp(16px, 4vw, 24px);
  color: #7c3aed;
  margin-bottom: 40px;
  text-align: center;
`

const FloatingEmoji = styled.div<{ delay: number }>`
  position: absolute;
  font-size: 40px;
  animation: ${floatAnimation} 3s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  z-index: 5;
`

const StartButton = styled(motion.button)`
  position: relative;
  padding: 20px 50px;
  font-family: 'Nunito', 'Noto Sans SC', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 50%, #ffc2d1 100%);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 
    0 10px 30px rgba(255, 107, 157, 0.4),
    inset 0 -4px 0 rgba(0, 0, 0, 0.1);
  overflow: visible;
`

const ButtonContent = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
`

const ButtonEmoji = styled.span`
  font-size: 28px;
  animation: ${bounceAnimation} 1s ease-in-out infinite;
`

const ButtonStars = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  display: flex;
  gap: 5px;
  
  span {
    font-size: 16px;
    animation: ${sparkleAnimation} 1s ease-in-out infinite;
    
    &:nth-of-type(2) { animation-delay: 0.2s; }
    &:nth-of-type(3) { animation-delay: 0.4s; }
  }
`

const WaveContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 150px;
  overflow: hidden;
`

const Wave = styled.div<{ color: string; delay: number }>`
  position: absolute;
  bottom: ${props => props.delay === 0 ? '0' : props.delay === -2 ? '20px' : '40px'};
  left: 0;
  width: 200%;
  height: 100px;
  background: ${props => props.color};
  border-radius: 100% 100% 0 0;
  animation: ${waveAnimation} 8s linear infinite;
  animation-delay: ${props => props.delay}s;
  opacity: 0.6;
`
