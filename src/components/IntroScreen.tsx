import { useRef, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  Float, 
  Stars, 
  Text,
  MeshTransmissionMaterial,
  Sparkles
} from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import { fonts } from '../assets/fonts'
import styled from '@emotion/styled'

interface IntroScreenProps {
  onEnter: () => void
}

// 3D 魔盒组件
function MagicBox() {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const ringRef1 = useRef<THREE.Mesh>(null)
  const ringRef2 = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      meshRef.current.rotation.y += 0.01
    }
    if (glowRef.current) {
      glowRef.current.rotation.y -= 0.008
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      glowRef.current.scale.setScalar(scale)
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.z += 0.005
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.x += 0.007
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group>
        {/* 外层光环 */}
        <mesh ref={glowRef}>
          <torusGeometry args={[2.5, 0.05, 16, 100]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.6} />
        </mesh>
        <mesh ref={ringRef1} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.8, 0.03, 16, 100]} />
          <meshBasicMaterial color="#ff00ff" transparent opacity={0.4} />
        </mesh>
        <mesh ref={ringRef2} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <torusGeometry args={[3, 0.02, 16, 100]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.3} />
        </mesh>
        
        {/* 魔盒主体 */}
        <mesh ref={meshRef}>
          <boxGeometry args={[1.8, 1.8, 1.8]} />
          <MeshTransmissionMaterial
            backside
            samples={16}
            thickness={0.5}
            chromaticAberration={0.5}
            anisotropy={0.3}
            distortion={0.5}
            distortionScale={0.5}
            temporalDistortion={0.1}
            iridescence={1}
            iridescenceIOR={1}
            iridescenceThicknessRange={[0, 1400]}
            color="#4060ff"
          />
        </mesh>

        {/* 内部发光核心 */}
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.8} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshBasicMaterial color="#ff00ff" transparent opacity={0.3} />
        </mesh>
        
        {/* 问号文字 */}
        <Text
          position={[0, 0, 1.2]}
          fontSize={1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font={fonts.orbitron}
        >
          ?
        </Text>

        {/* 粒子光点 */}
        <Sparkles
          count={150}
          scale={6}
          size={4}
          speed={0.5}
          color="#00d4ff"
        />
        <Sparkles
          count={80}
          scale={8}
          size={2}
          speed={0.3}
          color="#ff00ff"
        />
      </group>
    </Float>
  )
}

// 背景星空
function Background() {
  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      {/* Environment removed - using local lights only */}
    </>
  )
}

// 飘浮的数字
function FloatingNumbers() {
  const numbers = Array.from({ length: 20 }, (_, i) => ({
    value: Math.floor(Math.random() * 90 + 10).toString(),
    position: [
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 8 - 3
    ] as [number, number, number],
    speed: Math.random() * 0.5 + 0.2,
    id: i
  }))

  return (
    <>
      {numbers.map((num) => (
        <FloatingNumber key={num.id} value={num.value} position={num.position} speed={num.speed} />
      ))}
    </>
  )
}

function FloatingNumber({ value, position, speed }: {
  value: string
  position: [number, number, number]
  speed: number
}) {
  const meshRef = useRef<THREE.Group>(null)
  const initialY = position[1]
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime * speed) * 0.5
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.3
    }
  })

  return (
    <group ref={meshRef} position={position}>
      <Text
        fontSize={0.5}
        color="#00d4ff"
        anchorX="center"
        anchorY="middle"
        font={fonts.orbitron}
        fillOpacity={0.3}
      >
        {value}
      </Text>
    </group>
  )
}

// Canvas 粒子效果组件
function CanvasParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      opacity: number
    }> = []
    
    const colors = ['#00d4ff', '#ff00ff', '#00ff88', '#ffcc00']
    
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.3
      })
    }
    
    let animationId: number
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color.replace(')', `, ${p.opacity})`).replace('rgb', 'rgba').replace('#', '')
        const hex = p.color
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`
        ctx.fill()
        
        // Draw connections
        particles.slice(i + 1).forEach(p2 => {
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.2 * (1 - dist / 150)})`
            ctx.stroke()
          }
        })
      })
      
      animationId = requestAnimationFrame(animate)
    }
    
    animate()
    
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
}

// 主组件
export default function IntroScreen({ onEnter }: IntroScreenProps) {
  return (
    <IntroContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 1.5,
        filter: "blur(20px)"
      }}
      transition={{ duration: 0.8 }}
    >
      {/* 粒子背景 */}
      <ParticlesWrapper>
        <CanvasParticles />
      </ParticlesWrapper>

      {/* 3D 场景 */}
      <CanvasWrapper>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
            <Background />
            <MagicBox />
            <FloatingNumbers />
          </Suspense>
        </Canvas>
      </CanvasWrapper>

      {/* UI 覆盖层 */}
      <ContentOverlay>
        <TitleSection
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <MainTitle>
            <TitleChar delay={0}>数</TitleChar>
            <TitleChar delay={0.1}>字</TitleChar>
            <TitleChar delay={0.2}>魔</TitleChar>
            <TitleChar delay={0.3}>盒</TitleChar>
          </MainTitle>
          <SubTitle
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            DIGITAL MAGIC BOX
          </SubTitle>
          <Description
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            发现数字世界的神奇规律
          </Description>
        </TitleSection>

        <EnterButton
          onClick={onEnter}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2, type: "spring", stiffness: 200 }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 0 40px rgba(0, 212, 255, 0.8)"
          }}
          whileTap={{ scale: 0.95 }}
        >
          <ButtonContent>
            <span>开启探索</span>
            <ButtonIcon className="button-icon">→</ButtonIcon>
          </ButtonContent>
          <ButtonGlow className="button-glow" />
        </EnterButton>

        <HintText
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ delay: 3, duration: 2, repeat: Infinity }}
        >
          点击按钮进入魔法世界
        </HintText>
      </ContentOverlay>

      {/* 扫描线效果 */}
      <ScanLines />
      
      {/* 角落装饰 */}
      <CornerDecoration position="top-left" />
      <CornerDecoration position="top-right" />
      <CornerDecoration position="bottom-left" />
      <CornerDecoration position="bottom-right" />
    </IntroContainer>
  )
}

// Styled Components
const IntroContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a2a 100%);
  overflow: hidden;
  z-index: 1000;
`

const ParticlesWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`

const CanvasWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
`

const ContentOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  pointer-events: none;
`

const TitleSection = styled(motion.div)`
  text-align: center;
  margin-bottom: 60px;
`

const MainTitle = styled.h1`
  font-family: var(--font-display);
  font-size: clamp(48px, 10vw, 100px);
  font-weight: 900;
  margin: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
`

const TitleChar = styled.span<{ delay: number }>`
  display: inline-block;
  background: linear-gradient(135deg, #00d4ff 0%, #ff00ff 50%, #00ff88 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 3s ease infinite, charFloat 2s ease-in-out infinite;
  animation-delay: ${props => props.delay}s, ${props => props.delay}s;
  text-shadow: 0 0 40px rgba(0, 212, 255, 0.5);
  
  @keyframes charFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`

const SubTitle = styled(motion.p)`
  font-family: var(--font-display);
  font-size: clamp(14px, 3vw, 24px);
  color: var(--primary);
  letter-spacing: 8px;
  margin-top: 20px;
  text-shadow: 0 0 20px var(--primary);
`

const Description = styled(motion.p)`
  font-family: var(--font-body);
  font-size: clamp(16px, 2.5vw, 22px);
  color: var(--text-secondary);
  margin-top: 15px;
`

const EnterButton = styled(motion.button)`
  position: relative;
  padding: 20px 60px;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(255, 0, 255, 0.2) 100%);
  border: 2px solid var(--primary);
  border-radius: 50px;
  cursor: pointer;
  overflow: hidden;
  pointer-events: auto;
  text-transform: uppercase;
  letter-spacing: 3px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover .button-icon {
    transform: translateX(5px);
  }
  
  &:hover .button-glow {
    opacity: 1;
  }
`

const ButtonContent = styled.span`
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
  z-index: 2;
`

const ButtonIcon = styled.span`
  font-size: 24px;
  transition: transform 0.3s ease;
`

const ButtonGlow = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
`

const HintText = styled(motion.p)`
  position: absolute;
  bottom: 80px;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-muted);
`

const ScanLines = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.1) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 100;
  opacity: 0.3;
`

const CornerDecoration = styled.div<{ position: string }>`
  position: absolute;
  width: 100px;
  height: 100px;
  border: 2px solid var(--primary);
  opacity: 0.3;
  z-index: 50;
  
  ${props => {
    switch (props.position) {
      case 'top-left':
        return `
          top: 30px;
          left: 30px;
          border-right: none;
          border-bottom: none;
        `
      case 'top-right':
        return `
          top: 30px;
          right: 30px;
          border-left: none;
          border-bottom: none;
        `
      case 'bottom-left':
        return `
          bottom: 30px;
          left: 30px;
          border-right: none;
          border-top: none;
        `
      case 'bottom-right':
        return `
          bottom: 30px;
          right: 30px;
          border-left: none;
          border-top: none;
        `
      default:
        return ''
    }
  }}
`
