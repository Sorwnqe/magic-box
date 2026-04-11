import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Float,
  MeshTransmissionMaterial,
  RoundedBox,
  Sparkles,
  Text,
  Environment
} from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import confetti from 'canvas-confetti'
import * as THREE from 'three'
import { useMagicBox } from '../stores/useMagicBox'
import { characters } from '../assets/images'

// 背景粒子特效组件
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
      type: 'circle' | 'star' | 'dot'
      pulse: number
      pulseSpeed: number
    }

    const colors = ['#3b82f6', '#22c55e', '#facc15', '#fb923c', '#22d3ee', '#a78bfa', '#f472b6']

    // 创建粒子
    const particles: Particle[] = []
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
        type: ['circle', 'star', 'dot'][Math.floor(Math.random() * 3)] as Particle['type'],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.05 + 0.02
      })
    }

    // 绘制星星
    const drawStar = (x: number, y: number, size: number, color: string, alpha: number) => {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.fillStyle = color
      ctx.translate(x, y)
      ctx.beginPath()
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2
        ctx.moveTo(0, 0)
        ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size)
      }
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()
    }

    // 连线距离
    const connectionDistance = 120

    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // 更新和绘制粒子
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        p.pulse += p.pulseSpeed

        // 边界反弹
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        const pulseAlpha = p.alpha * (0.7 + Math.sin(p.pulse) * 0.3)
        const pulseSize = p.size * (0.8 + Math.sin(p.pulse) * 0.2)

        ctx.globalAlpha = pulseAlpha

        if (p.type === 'circle') {
          ctx.beginPath()
          ctx.arc(p.x, p.y, pulseSize, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.fill()
        } else if (p.type === 'star') {
          drawStar(p.x, p.y, pulseSize, p.color, pulseAlpha)
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, pulseSize * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.fill()
        }

        // 绘制连线
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDistance) {
            ctx.globalAlpha = (1 - dist / connectionDistance) * 0.15
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = p.color
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      })

      ctx.globalAlpha = 1
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

// 中性可爱配色
const COLORS = {
  blue: '#3b82f6',
  lightBlue: '#60a5fa',
  cyan: '#22d3ee',
  green: '#22c55e',
  lime: '#a3e635',
  yellow: '#facc15',
  orange: '#fb923c',
  purple: '#a78bfa'
}

interface Message {
  id: number
  type: 'bot' | 'user'
  content: string
  isTyping?: boolean
}

// 3D 可爱魔盒组件 - 增强版
function CuteMagicBox3D({
  isSpinning,
  isOpening,
  displayNumber
}: {
  isSpinning: boolean
  isOpening: boolean
  displayNumber: string
}) {
  const groupRef = useRef<THREE.Group>(null)
  const lidRef = useRef<THREE.Group>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const ring3Ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (groupRef.current) {
      // 更明显的浮动效果
      groupRef.current.position.y = Math.sin(time * 1.5) * 0.15

      if (isSpinning) {
        groupRef.current.rotation.y += 0.12
        groupRef.current.rotation.z = Math.sin(time * 5) * 0.1
      } else if (isOpening) {
        groupRef.current.rotation.y += 0.08
        const bounce = Math.sin(time * 8) * 0.05
        groupRef.current.scale.setScalar(1 + bounce)
      } else {
        groupRef.current.rotation.y += 0.008
        groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.08
        groupRef.current.rotation.z = Math.sin(time * 0.3) * 0.03
      }
    }

    // 光环旋转动画
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = time * 0.5
      ring1Ref.current.rotation.x = Math.sin(time * 0.3) * 0.2
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * 0.4
      ring2Ref.current.rotation.y = time * 0.2
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = time * 0.3
      ring3Ref.current.rotation.z = Math.sin(time * 0.5) * 0.3
    }

    // 盖子开合动画
    if (lidRef.current) {
      const targetRotation = isOpening ? -Math.PI / 2.5 : 0
      lidRef.current.rotation.x += (targetRotation - lidRef.current.rotation.x) * 0.08
    }
  })

  return (
    <Float speed={3} rotationIntensity={0.3} floatIntensity={0.4}>
      <group ref={groupRef}>
        {/* 多层装饰光环 - 更炫酷 */}
        <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.2, 0.04, 16, 100]} />
          <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.6} />
        </mesh>
        <mesh ref={ring2Ref} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
          <torusGeometry args={[2.4, 0.03, 16, 100]} />
          <meshBasicMaterial color={COLORS.yellow} transparent opacity={0.5} />
        </mesh>
        <mesh ref={ring3Ref} rotation={[Math.PI / 4, 0, Math.PI / 6]}>
          <torusGeometry args={[2.6, 0.025, 16, 100]} />
          <meshBasicMaterial color={COLORS.purple} transparent opacity={0.4} />
        </mesh>

        {/* 盒子主体 - 更精细 */}
        <mesh position={[0, 0, 0]}>
          <RoundedBox args={[1.6, 1.2, 1.6]} radius={0.15} smoothness={4}>
            <MeshTransmissionMaterial
              backside
              samples={16}
              thickness={0.5}
              chromaticAberration={0.3}
              anisotropy={0.2}
              distortion={0.3}
              distortionScale={0.3}
              iridescence={1}
              iridescenceIOR={1.5}
              iridescenceThicknessRange={[100, 1400]}
              color="#6366f1"
              transmission={0.9}
            />
          </RoundedBox>
        </mesh>

        {/* 盒子边框装饰 */}
        <mesh position={[0, 0, 0]}>
          <RoundedBox args={[1.65, 1.25, 1.65]} radius={0.16} smoothness={4}>
            <meshBasicMaterial color={COLORS.lightBlue} transparent opacity={0.15} wireframe />
          </RoundedBox>
        </mesh>

        {/* 盒子盖子 */}
        <group ref={lidRef} position={[0, 0.7, -0.8]}>
          <mesh position={[0, 0.15, 0.8]}>
            <RoundedBox args={[1.7, 0.35, 1.7]} radius={0.1} smoothness={4}>
              <MeshTransmissionMaterial
                backside
                samples={8}
                thickness={0.4}
                chromaticAberration={0.2}
                iridescence={1}
                color="#818cf8"
              />
            </RoundedBox>
          </mesh>
          {/* 盖子装饰 - 发光星星 */}
          <mesh position={[0, 0.4, 0.8]}>
            <octahedronGeometry args={[0.2]} />
            <meshStandardMaterial
              color={COLORS.yellow}
              emissive={COLORS.yellow}
              emissiveIntensity={isOpening ? 1 : 0.5}
            />
          </mesh>
          {/* 小星星装饰 */}
          <mesh position={[0.4, 0.35, 0.8]}>
            <octahedronGeometry args={[0.1]} />
            <meshBasicMaterial color={COLORS.cyan} />
          </mesh>
          <mesh position={[-0.4, 0.35, 0.8]}>
            <octahedronGeometry args={[0.1]} />
            <meshBasicMaterial color={COLORS.green} />
          </mesh>
        </group>

        {/* 内部发光核心 - 多层 */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshBasicMaterial
            color={isOpening ? COLORS.yellow : COLORS.cyan}
            transparent
            opacity={0.95}
          />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshBasicMaterial
            color={isOpening ? COLORS.orange : COLORS.lightBlue}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* 显示数字 - 前后都显示 */}
        <Text
          position={[0, 0, 0.9]}
          fontSize={0.55}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#312e81"
        >
          {displayNumber}
        </Text>
        <Text
          position={[0, 0, -0.9]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI, 0]}
          outlineWidth={0.03}
          outlineColor="#312e81"
        >
          {displayNumber}
        </Text>

        {/* 常驻粒子效果 */}
        <Sparkles
          count={60}
          scale={5}
          size={4}
          speed={0.5}
          color={COLORS.cyan}
        />
        <Sparkles
          count={40}
          scale={4}
          size={3}
          speed={0.3}
          color={COLORS.yellow}
        />

        {/* 旋转时的拖尾效果 */}
        {isSpinning && (
          <>
            <Sparkles count={100} scale={6} size={6} speed={2} color={COLORS.orange} />
            <pointLight position={[0, 0, 0]} color={COLORS.cyan} intensity={3} distance={8} />
          </>
        )}

        {/* 开盒时的魔法爆发 */}
        {isOpening && (
          <>
            <pointLight position={[0, 2, 0]} color={COLORS.yellow} intensity={5} distance={10} />
            <pointLight position={[0, 0, 0]} color={COLORS.green} intensity={3} distance={6} />
            <Sparkles count={150} scale={6} size={8} speed={2} color={COLORS.yellow} />
            <Sparkles count={80} scale={5} size={5} speed={1.5} color={COLORS.orange} />
            <Sparkles count={50} scale={4} size={4} speed={1} color={COLORS.green} />
          </>
        )}
      </group>
    </Float>
  )
}

// 聊天消息组件
function ChatMessage({ message }: { message: Message }) {
  return (
    <MessageWrapper
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, type: "spring" }}
      isUser={message.type === 'user'}
    >
      {message.type === 'bot' && <AvatarImg src={characters.flash} alt="Flash" />}
      <MessageBubble isUser={message.type === 'user'}>
        {message.isTyping ? (
          <TypingIndicator>
            <TypingDot delay={0} />
            <TypingDot delay={0.2} />
            <TypingDot delay={0.4} />
          </TypingIndicator>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br/>') }} />
        )}
      </MessageBubble>
      {message.type === 'user' && <Avatar>🧒</Avatar>}
    </MessageWrapper>
  )
}

// 数字卡片组件
function NumberCard({
  label,
  number,
  tens,
  ones,
  isResult = false,
  visible = true,
  emoji
}: {
  label: string
  number: string
  tens: string
  ones: string
  isResult?: boolean
  visible?: boolean
  emoji: string
}) {
  return (
    <CardWrapper
      initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
      animate={{
        opacity: visible ? 1 : 0.5,
        scale: visible ? 1 : 0.9,
        rotateY: visible ? 0 : 180
      }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <CardEmoji>{emoji}</CardEmoji>
      <CardLabel>{label}</CardLabel>
      <CardNumber isResult={isResult}>{number}</CardNumber>
      <DigitBoxes>
        <DigitBox color={isResult ? COLORS.green : COLORS.blue}>
          <DigitLabel>十位</DigitLabel>
          <DigitValue>{tens}</DigitValue>
        </DigitBox>
        <DigitBox color={isResult ? COLORS.purple : COLORS.orange}>
          <DigitLabel>个位</DigitLabel>
          <DigitValue>{ones}</DigitValue>
        </DigitBox>
      </DigitBoxes>
    </CardWrapper>
  )
}

// 主组件
export default function MagicMainApp() {
  const magicBox = useMagicBox()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: '🎉 欢迎来到<strong style="color:#3b82f6">数字魔盒</strong>！<br/><br/>我是闪电<br/><br/>试着输入一个<strong style="color:#22c55e">两位数</strong>（比如 12、35、78），看看魔盒会变出什么神奇的东西吧！✨'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [displayNumber, setDisplayNumber] = useState('?')
  const [currentInput, setCurrentInput] = useState({ number: '--', tens: '-', ones: '-' })
  const [currentOutput, setCurrentOutput] = useState({ number: '--', tens: '-', ones: '-', visible: false })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addBotMessage = (content: string, delay = 500) => {
    const typingId = Date.now()
    setMessages(prev => [...prev, { id: typingId, type: 'bot', content: '', isTyping: true }])

    setTimeout(() => {
      setMessages(prev =>
        prev.map(m => m.id === typingId ? { ...m, content, isTyping: false } : m)
      )
    }, delay)
  }

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: [COLORS.blue, COLORS.green, COLORS.yellow, COLORS.orange, COLORS.purple, COLORS.cyan]
    })
    confetti({
      particleCount: 30,
      spread: 100,
      origin: { y: 0.5 },
      shapes: ['star'],
      colors: [COLORS.yellow, COLORS.orange]
    })
  }

  const handleSubmit = () => {
    const value = inputValue.trim()
    if (!value) return

    const validation = magicBox.validateInput(value)
    if (!validation.valid) {
      addBotMessage(`🤔 ${validation.message}`)
      return
    }

    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: `我输入了 ${validation.number} 🔢`
    }])

    const result = magicBox.processNumber(validation.number!)

    setDisplayNumber(result.input.toString())
    setCurrentInput({
      number: result.input.toString(),
      tens: result.tens.toString(),
      ones: result.ones.toString()
    })
    setCurrentOutput({ ...currentOutput, visible: false })

    setIsSpinning(true)
    setTimeout(() => setIsSpinning(false), 1000)

    setTimeout(() => addBotMessage(`📦 ${result.message}`), 800)

    setInputValue('')
  }

  const handleReveal = () => {
    const result = magicBox.openBox()

    if (!result.success) {
      addBotMessage(`💭 ${result.message}`)
      return
    }

    setIsOpening(true)

    setTimeout(() => {
      setIsOpening(false)
      setDisplayNumber(result.output!.toString())
      setCurrentOutput({
        number: result.output!.toString(),
        tens: result.outputTens!.toString(),
        ones: result.outputOnes!.toString(),
        visible: true
      })

      addBotMessage(`✨ ${result.message}`)
      setTimeout(() => {
        addBotMessage(`🌟 ${result.encouragement}`)
        triggerConfetti()
      }, 800)
    }, 1500)
  }

  const handlePattern = () => {
    const result = magicBox.revealPattern()

    if (!result.success) {
      addBotMessage(`💭 ${result.message}`)
      return
    }

    setIsOpening(true)

    setTimeout(() => {
      setIsOpening(false)

      if (result.results && result.results.length > 0) {
        const last = result.results[result.results.length - 1]
        setDisplayNumber(last.output.toString())
        setCurrentOutput({
          number: last.output.toString(),
          tens: Math.floor(last.output / 10).toString(),
          ones: (last.output % 10).toString(),
          visible: true
        })
      }

      addBotMessage(`🔮 ${result.message}`)
      setTimeout(() => {
        addBotMessage(result.explanation!.join('<br/>'))
        setTimeout(() => {
          addBotMessage(`🎉 ${result.encouragement}`)
          triggerConfetti()
          triggerConfetti()
        }, 1000)
      }, 800)
    }, 1500)
  }

  const handleClear = () => {
    magicBox.clearHistory()
    setDisplayNumber('?')
    setCurrentInput({ number: '--', tens: '-', ones: '-' })
    setCurrentOutput({ number: '--', tens: '-', ones: '-', visible: false })
    addBotMessage('🧹 历史记录已清空！让我们重新开始探索吧！🚀')
  }

  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 背景装饰 */}
      <BackgroundDecoration />

      {/* 粒子特效 */}
      <ParticleBackground />

      {/* 主内容 */}
      <MainContent>
        {/* 左侧 - 3D魔盒区 */}
        <LeftPanel>
          <MagicBoxArea>
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <Suspense fallback={null}>
                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
                <pointLight position={[-10, -10, -5]} intensity={0.4} color={COLORS.cyan} />
                <Environment preset="sunset" />
                <CuteMagicBox3D
                  isSpinning={isSpinning}
                  isOpening={isOpening}
                  displayNumber={displayNumber}
                />
              </Suspense>
            </Canvas>

            {/* 装饰性浮动元素 */}
            <FloatingDeco style={{ top: '10%', left: '5%' }}>⭐</FloatingDeco>
            <FloatingDeco style={{ top: '15%', right: '8%' }} delay={0.5}>✨</FloatingDeco>
            <FloatingDeco style={{ bottom: '20%', left: '8%' }} delay={1}>🌟</FloatingDeco>
            <FloatingDeco style={{ bottom: '15%', right: '5%' }} delay={1.5}>💫</FloatingDeco>
          </MagicBoxArea>

          {/* 数字卡片 */}
          <CardsContainer>
            <NumberCard
              label="输入的数"
              number={currentInput.number}
              tens={currentInput.tens}
              ones={currentInput.ones}
              emoji="📥"
            />
            <SwapArrow>
              <motion.span
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ✨➡️✨
              </motion.span>
              <span>魔法变换</span>
            </SwapArrow>
            <NumberCard
              label="魔法结果"
              number={currentOutput.number}
              tens={currentOutput.tens}
              ones={currentOutput.ones}
              isResult
              visible={currentOutput.visible}
              emoji="🎁"
            />
          </CardsContainer>
        </LeftPanel>

        {/* 右侧 - 交互区 */}
        <RightPanel>
          {/* 聊天区 */}
          <ChatContainer>
            <ChatMessages>
              <AnimatePresence>
                {messages.map(msg => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </ChatMessages>
          </ChatContainer>

          {/* 输入区 */}
          <InputArea>
            <InputWrapper>
              <NumberInput
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyPress={e => e.key === 'Enter' && handleSubmit()}
                placeholder="输入两位数..."
                maxLength={2}
              />
              <InputEmoji>🔢</InputEmoji>
            </InputWrapper>
            <ButtonGroup>
              <ActionButton color="blue" onClick={handleSubmit}>
                <span>📦</span> 放入魔盒
              </ActionButton>
              <ActionButton color="green" onClick={handleReveal}>
                <span>✨</span> 打开魔盒
              </ActionButton>
              <ActionButton color="orange" onClick={handlePattern}>
                <span>💡</span> 揭示规律
              </ActionButton>
            </ButtonGroup>
          </InputArea>

          {/* 历史记录 */}
          <HistoryPanel>
            <HistoryHeader>
              <span>📝 魔法记录</span>
              <ClearButton onClick={handleClear}>清空</ClearButton>
            </HistoryHeader>
            <HistoryList>
              {magicBox.history.length === 0 ? (
                <HistoryEmpty>还没有记录哦，快来试试吧！🚀</HistoryEmpty>
              ) : (
                magicBox.history.map((item, index) => (
                  <HistoryItem key={index}>
                    <span>{item.input}</span>
                    <span style={{ color: COLORS.blue }}>✨➡️</span>
                    <span style={{ color: item.revealed ? COLORS.green : COLORS.yellow }}>
                      {item.revealed ? item.output : '?'}
                    </span>
                    {item.revealed && <span>🎉</span>}
                  </HistoryItem>
                ))
              )}
            </HistoryList>
          </HistoryPanel>
        </RightPanel>
      </MainContent>
    </Container>
  )
}

// 动画关键帧
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-12px) rotate(3deg); }
`

const bounceAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`

const typingAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`

// Styled Components
const Container = styled(motion.div)`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 30%, #f0fdf4 60%, #fefce8 100%);
  position: relative;
  overflow-x: hidden;
`

const BackgroundDecoration = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 50% 90%, rgba(250, 204, 21, 0.08) 0%, transparent 50%);
`

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  padding: 30px 30px 120px;
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`

const MagicBoxArea = styled.div`
  height: 380px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(224, 242, 254, 0.7) 100%);
  border-radius: 30px;
  border: 3px solid #60a5fa;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(59, 130, 246, 0.15);
`

const FloatingDeco = styled.div<{ delay?: number }>`
  position: absolute;
  font-size: 28px;
  animation: ${floatAnimation} 3s ease-in-out infinite;
  animation-delay: ${props => props.delay || 0}s;
  z-index: 10;
  pointer-events: none;
`

const CardsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
`

const CardWrapper = styled(motion.div)`
  background: white;
  border: 3px solid #60a5fa;
  border-radius: 25px;
  padding: 20px 25px;
  text-align: center;
  min-width: 150px;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.12);
  position: relative;
`

const CardEmoji = styled.div`
  font-size: 28px;
  margin-bottom: 5px;
`

const CardLabel = styled.div`
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 14px;
  color: #1e40af;
  font-weight: 600;
  margin-bottom: 8px;
`

const CardNumber = styled.div<{ isResult?: boolean }>`
  font-family: 'Nunito', sans-serif;
  font-size: 42px;
  font-weight: 900;
  color: ${props => props.isResult ? COLORS.green : COLORS.blue};
  margin-bottom: 12px;
`

const DigitBoxes = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`
const AvatarImg = styled.img`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`

const DigitBox = styled.div<{ color: string }>`
  background: ${props => props.color}15;
  border: 2px solid ${props => props.color};
  border-radius: 12px;
  padding: 8px 12px;
  min-width: 45px;
`

const DigitLabel = styled.div`
  font-size: 10px;
  color: #1e40af;
  font-weight: 600;
  margin-bottom: 3px;
`

const DigitValue = styled.div`
  font-family: 'Nunito', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
`

const SwapArrow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  
  span:first-of-type {
    font-size: 24px;
  }
  
  span:last-of-type {
    font-size: 12px;
    color: ${COLORS.blue};
    font-weight: 600;
  }
`

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: calc(100vh - 130px);
`

const ChatContainer = styled.div`
  flex: 1;
  background: white;
  border: 3px solid #22c55e;
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.12);
`

const ChatMessages = styled.div`
  height: 100%;
  max-height: 300px;
  overflow-y: auto;
  padding: 20px;
`

const MessageWrapper = styled(motion.div) <{ isUser: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 15px;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
`

const Avatar = styled.div`
  font-size: 32px;
  flex-shrink: 0;
`

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 12px 18px;
  border-radius: 20px;
  background: ${props => props.isUser
    ? `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.lightBlue} 100%)`
    : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'};
  color: ${props => props.isUser ? 'white' : '#1e293b'};
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 15px;
  line-height: 1.5;
  box-shadow: 0 4px 15px ${props => props.isUser
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(0, 0, 0, 0.05)'};
`

const TypingIndicator = styled.div`
  display: flex;
  gap: 5px;
  padding: 5px 0;
`

const TypingDot = styled.div<{ delay: number }>`
  width: 8px;
  height: 8px;
  background: ${COLORS.blue};
  border-radius: 50%;
  animation: ${typingAnimation} 1s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`

const InputArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const NumberInput = styled.input`
  width: 100%;
  padding: 18px 60px 18px 25px;
  font-family: 'Nunito', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  background: white;
  border: 3px solid #60a5fa;
  border-radius: 25px;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);
  
  &::placeholder {
    color: #94a3b8;
  }
  
  &:focus {
    border-color: ${COLORS.blue};
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.25);
  }
`

const InputEmoji = styled.span`
  position: absolute;
  right: 20px;
  font-size: 24px;
  animation: ${bounceAnimation} 2s ease-in-out infinite;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`

const ActionButton = styled.button<{ color: string }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 20px;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: white;
  background: ${props => {
    switch (props.color) {
      case 'blue': return `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.lightBlue} 100%)`
      case 'green': return `linear-gradient(135deg, ${COLORS.green} 0%, ${COLORS.lime} 100%)`
      case 'orange': return `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.yellow} 100%)`
      default: return `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.lightBlue} 100%)`
    }
  }};
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px ${props => {
    switch (props.color) {
      case 'blue': return 'rgba(59, 130, 246, 0.3)'
      case 'green': return 'rgba(34, 197, 94, 0.3)'
      case 'orange': return 'rgba(251, 146, 60, 0.3)'
      default: return 'rgba(59, 130, 246, 0.3)'
    }
  }};
  
  &:hover {
    transform: translateY(-3px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  span:first-of-type {
    font-size: 18px;
  }
`

const HistoryPanel = styled.div`
  background: white;
  border: 3px solid ${COLORS.yellow};
  border-radius: 20px;
  padding: 15px;
  box-shadow: 0 4px 15px rgba(250, 204, 21, 0.15);
`

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 700;
  color: #1e293b;
`

const ClearButton = styled.button`
  padding: 5px 15px;
  font-size: 12px;
  font-weight: 600;
  color: ${COLORS.orange};
  background: #fef3c7;
  border: 2px solid ${COLORS.yellow};
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${COLORS.orange};
    color: white;
  }
`

const HistoryList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const HistoryEmpty = styled.div`
  color: #64748b;
  font-size: 14px;
  text-align: center;
  width: 100%;
  padding: 10px;
`

const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  background: linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%);
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  font-family: 'Nunito', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
`
