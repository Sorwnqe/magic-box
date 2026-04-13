import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Float,
  Sparkles,
  Text,
  OrbitControls
} from '@react-three/drei'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import confetti from 'canvas-confetti'
import * as THREE from 'three'
import { useMagicBox } from '../stores/useMagicBox'
import { backgrounds, characters, items, zootopiaColors as COLORS } from '../assets/images'

interface Message {
  id: number
  type: 'bot' | 'user'
  content: string
  isTyping?: boolean
}

// 错误边界组件
class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

// 3D 魔盒组件 - 简化版（兼容性更好）
function MagicBox3D({
  isSpinning,
  isOpening,
  displayNumber
}: {
  isSpinning: boolean
  isOpening: boolean
  displayNumber: string
}) {
  const meshRef = useRef<THREE.Group>(null)
  const boxRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      if (isSpinning) {
        meshRef.current.rotation.y += 0.08
      } else if (isOpening) {
        meshRef.current.rotation.y += 0.15
        const scale = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.1
        meshRef.current.scale.setScalar(scale)
      } else {
        meshRef.current.rotation.y += 0.005
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      }
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={meshRef}>
        {/* 外层光环 */}
        <mesh>
          <torusGeometry args={[2, 0.03, 16, 100]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.6} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.2, 0.02, 16, 100]} />
          <meshBasicMaterial color="#ff00ff" transparent opacity={0.4} />
        </mesh>

        {/* 魔盒主体 - 使用兼容性更好的材质 */}
        <mesh ref={boxRef}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial
            color="#4060ff"
            metalness={0.3}
            roughness={0.2}
            transparent
            opacity={0.85}
            emissive="#2040aa"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* 魔盒边缘发光效果 */}
        <mesh>
          <boxGeometry args={[1.55, 1.55, 1.55]} />
          <meshBasicMaterial
            color="#00d4ff"
            transparent
            opacity={0.15}
            wireframe
          />
        </mesh>

        {/* 内部发光 */}
        <mesh>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshBasicMaterial color={isOpening ? "#00ff88" : "#00d4ff"} transparent opacity={0.8} />
        </mesh>

        {/* 显示数字 */}
        <Text
          position={[0, 0, 1]}
          fontSize={0.6}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {displayNumber}
        </Text>

        {/* 粒子效果 */}
        <Sparkles
          count={50}
          scale={4}
          size={2}
          speed={0.3}
          color={isOpening ? "#00ff88" : "#00d4ff"}
        />
      </group>
    </Float>
  )
}

// 2D 回退版魔盒
function MagicBox2DFallback({ displayNumber }: { displayNumber: string }) {
  return (
    <FallbackBox>
      <FallbackBoxInner>
        <img src={items.magicBox} alt="魔盒" style={{ width: '150px', height: 'auto' }} />
        <FallbackNumber>{displayNumber}</FallbackNumber>
      </FallbackBoxInner>
    </FallbackBox>
  )
}

// 聊天消息组件
function ChatMessage({ message }: { message: Message }) {
  return (
    <MessageWrapper
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
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
      {message.type === 'user' && <Avatar>👧</Avatar>}
    </MessageWrapper>
  )
}

// 数字展示卡片
function NumberCard({
  label,
  number,
  tens,
  ones,
  isResult = false,
  visible = true
}: {
  label: string
  number: string
  tens: string
  ones: string
  isResult?: boolean
  visible?: boolean
}) {
  return (
    <CardWrapper
      initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.8,
        rotateY: visible ? 0 : 180
      }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <CardLabel>{label}</CardLabel>
      <CardNumber isResult={isResult}>{number}</CardNumber>
      <DigitBoxes>
        <DigitBox color={isResult ? "#00ff88" : "#ff00ff"}>
          <DigitLabel>十位</DigitLabel>
          <DigitValue>{tens}</DigitValue>
        </DigitBox>
        <DigitBox color={isResult ? "#ff00ff" : "#00d4ff"}>
          <DigitLabel>个位</DigitLabel>
          <DigitValue>{ones}</DigitValue>
        </DigitBox>
      </DigitBoxes>
    </CardWrapper>
  )
}

// 主组件
export default function MainApp() {
  const magicBox = useMagicBox()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: '大家......好......🦥<br/><br/>我是<strong style="color:#1e40af">闪电</strong>，车管所......的......工作人员......<br/><br/>这个<strong style="color:#f97316">魔法盒</strong>......能......交换......数字......<br/><br/>输入......一个......<strong style="color:#8b5cf6">两位数</strong>......试试......'
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
    // 添加打字中状态
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
      colors: ['#00d4ff', '#ff00ff', '#00ff88', '#ffcc00']
    })
  }

  const handleSubmit = () => {
    const value = inputValue.trim()
    if (!value) return

    const validation = magicBox.validateInput(value)
    if (!validation.valid) {
      addBotMessage(validation.message!)
      return
    }

    // 添加用户消息
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: `我输入了 ${validation.number}`
    }])

    // 处理数字
    const result = magicBox.processNumber(validation.number!)

    // 更新显示
    setDisplayNumber(result.input.toString())
    setCurrentInput({
      number: result.input.toString(),
      tens: result.tens.toString(),
      ones: result.ones.toString()
    })
    setCurrentOutput({ ...currentOutput, visible: false })

    // 触发旋转动画
    setIsSpinning(true)
    setTimeout(() => setIsSpinning(false), 1000)

    // 添加机器人回复
    setTimeout(() => addBotMessage(result.message), 800)

    setInputValue('')
  }

  const handleReveal = () => {
    const result = magicBox.openBox()

    if (!result.success) {
      addBotMessage(result.message!)
      return
    }

    // 触发开箱动画
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

      addBotMessage(result.message!)
      setTimeout(() => {
        addBotMessage(result.encouragement!)
        triggerConfetti()
      }, 800)
    }, 1500)
  }

  const handlePattern = () => {
    const result = magicBox.revealPattern()

    if (!result.success) {
      addBotMessage(result.message!)
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

      addBotMessage(result.message!)
      setTimeout(() => {
        addBotMessage(result.explanation!.join('<br/>'))
        setTimeout(() => {
          addBotMessage(result.encouragement!)
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
    addBotMessage('历史记录已清空！让我们重新开始探索吧！🎲')
  }

  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 主内容区 - 一屏布局 */}
      <MainContent>
        {/* 左侧 - 3D魔盒 + 数字卡片 */}
        <LeftPanel>
          <CanvasContainer>
            <CanvasErrorBoundary fallback={<MagicBox2DFallback displayNumber={displayNumber} />}>
              <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
                <Suspense fallback={null}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
                  {/* Environment removed - using local lights only */}
                  <MagicBox3D
                    isSpinning={isSpinning}
                    isOpening={isOpening}
                    displayNumber={displayNumber}
                  />
                  <OrbitControls enableZoom={false} enablePan={false} />
                </Suspense>
              </Canvas>
            </CanvasErrorBoundary>
          </CanvasContainer>

          {/* 数字卡片 */}
          <CardsContainer>
            <NumberCard
              label="输入的数"
              number={currentInput.number}
              tens={currentInput.tens}
              ones={currentInput.ones}
            />
            <SwapArrow>
              <svg viewBox="0 0 100 40" width="60" height="24">
                <path d="M10,20 Q50,5 90,20" fill="none" stroke="url(#grad)" strokeWidth="2" />
                <path d="M10,20 Q50,35 90,20" fill="none" stroke="url(#grad)" strokeWidth="2" />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#ff00ff' }} />
                    <stop offset="100%" style={{ stopColor: '#00d4ff' }} />
                  </linearGradient>
                </defs>
              </svg>
              <span>交换</span>
            </SwapArrow>
            <NumberCard
              label="魔法结果"
              number={currentOutput.number}
              tens={currentOutput.tens}
              ones={currentOutput.ones}
              isResult
              visible={currentOutput.visible}
            />
          </CardsContainer>
        </LeftPanel>

        {/* 中间 - 输入区 + 数字键盘 */}
        <CenterPanel>
          {/* 输入显示 */}
          <InputDisplay>
            <InputDisplayNumber>{inputValue || '--'}</InputDisplayNumber>
            <InputDisplayLabel>输入两位数</InputDisplayLabel>
          </InputDisplay>

          {/* 数字键盘 */}
          <KeypadContainer>
            <KeypadGrid>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <KeypadButton
                  key={num}
                  onClick={() => inputValue.length < 2 && setInputValue(inputValue + num)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {num}
                </KeypadButton>
              ))}
              <KeypadButton
                onClick={() => setInputValue('')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ background: 'rgba(255, 71, 87, 0.2)', color: '#ff4757' }}
              >
                清除
              </KeypadButton>
              <KeypadButton
                onClick={() => inputValue.length < 2 && setInputValue(inputValue + '0')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                0
              </KeypadButton>
              <KeypadButton
                onClick={() => setInputValue(inputValue.slice(0, -1))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#f59e0b' }}
              >
                ←
              </KeypadButton>
            </KeypadGrid>
          </KeypadContainer>

          {/* 操作按钮 */}
          <ButtonGroup>
            <ActionButton color="primary" onClick={handleSubmit}>
              <span>🎲</span> 放入魔盒
            </ActionButton>
            <ActionButton color="secondary" onClick={handleReveal}>
              <span>🔓</span> 打开魔盒
            </ActionButton>
            <ActionButton color="accent" onClick={handlePattern}>
              <span>💡</span> 揭示规律
            </ActionButton>
          </ButtonGroup>
        </CenterPanel>

        {/* 右侧 - 聊天区 + 历史 */}
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

          {/* 历史记录 */}
          <HistoryPanel>
            <HistoryHeader>
              <span>📝 魔法记录</span>
              <ClearButton onClick={handleClear}>清空</ClearButton>
            </HistoryHeader>
            <HistoryList>
              {magicBox.history.length === 0 ? (
                <HistoryEmpty>还没有记录</HistoryEmpty>
              ) : (
                magicBox.history.map((item, index) => (
                  <HistoryItem key={index}>
                    <span>{item.input}</span>
                    <span style={{ color: '#00d4ff' }}>→</span>
                    <span style={{ color: item.revealed ? '#00ff88' : '#ffcc00' }}>
                      {item.revealed ? item.output : '?'}
                    </span>
                  </HistoryItem>
                ))
              )}
            </HistoryList>
          </HistoryPanel>
        </RightPanel>
      </MainContent>

      {/* 背景 */}
      <BackgroundImage />
    </Container>
  )
}

// Styled Components
const Container = styled(motion.div)`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
`

const BackgroundImage = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${backgrounds.policeStation});
  background-size: cover;
  background-position: center;
  z-index: 0;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(30, 64, 175, 0.3) 0%, rgba(59, 130, 246, 0.2) 100%);
  }
`

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 1fr;
  gap: 15px;
  padding: 60px 15px 15px;
  max-width: 1400px;
  margin: 0 auto;
  height: calc(100vh - 10px);
  position: relative;
  z-index: 1;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const CenterPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const CanvasContainer = styled.div`
  flex: 1;
  min-height: 200px;
  background: linear-gradient(135deg, rgba(30, 64, 175, 0.8) 0%, rgba(59, 130, 246, 0.6) 100%);
  border-radius: 24px;
  border: 2px solid ${COLORS.primaryLight};
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(30, 64, 175, 0.3);
`

// 2D回退版魔盒样式
const FallbackBox = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const FallbackBoxInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: float 3s ease-in-out infinite;
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }
`

const FallbackNumber = styled.div`
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 800;
  color: white;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.8), 0 0 40px rgba(255, 0, 255, 0.5);
`

const CardsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 2px solid ${COLORS.primaryLight};
`

const CardWrapper = styled(motion.div)`
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid ${COLORS.primaryLight};
  border-radius: 12px;
  padding: 10px 15px;
  text-align: center;
  min-width: 100px;
`

const CardLabel = styled.div`
  font-size: 11px;
  color: ${COLORS.textSecondary};
  margin-bottom: 4px;
  font-weight: 600;
`

const CardNumber = styled.div<{ isResult?: boolean }>`
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  background: ${props => props.isResult
    ? `linear-gradient(135deg, ${COLORS.success}, ${COLORS.primaryLight})`
    : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.purple})`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 6px;
`

const DigitBoxes = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
`

const DigitBox = styled.div<{ color: string }>`
  background: rgba(30, 64, 175, 0.1);
  border: 2px solid ${props => props.color};
  border-radius: 8px;
  padding: 4px 8px;
  min-width: 35px;
`

const DigitLabel = styled.div`
  font-size: 9px;
  color: ${COLORS.textSecondary};
  margin-bottom: 2px;
`

const DigitValue = styled.div`
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: ${COLORS.textPrimary};
`

const SwapArrow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  
  span {
    font-size: 10px;
    color: ${COLORS.accent};
    font-weight: 600;
  }
`

// 输入显示区
const InputDisplay = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 2px solid ${COLORS.primaryLight};
  border-radius: 16px;
  padding: 15px;
  text-align: center;
`

const InputDisplayNumber = styled.div`
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.purple});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  min-height: 60px;
`

const InputDisplayLabel = styled.div`
  font-size: 12px;
  color: ${COLORS.textSecondary};
  margin-top: 5px;
`

// 数字键盘
const KeypadContainer = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 2px solid ${COLORS.primaryLight};
  border-radius: 16px;
  padding: 12px;
  flex: 1;
`

const KeypadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  height: 100%;
`

const KeypadButton = styled(motion.button)`
  background: rgba(30, 64, 175, 0.1);
  border: 2px solid ${COLORS.primaryLight};
  border-radius: 12px;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  color: ${COLORS.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(30, 64, 175, 0.2);
    border-color: ${COLORS.primary};
  }
`

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const ChatContainer = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 2px solid ${COLORS.primaryLight};
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 150px;
`

const ChatMessages = styled.div`
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const MessageWrapper = styled(motion.div) <{ isUser: boolean }>`
  display: flex;
  gap: 12px;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
`

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${COLORS.primaryLight}, ${COLORS.purple});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
`

const AvatarImg = styled.img`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${COLORS.primaryLight};
  flex-shrink: 0;
`

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 85%;
  padding: 10px 14px;
  border-radius: ${props => props.isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px'};
  background: ${props => props.isUser
    ? `linear-gradient(135deg, ${COLORS.primaryLight}, ${COLORS.purple})`
    : '#f0f9ff'};
  border: 1px solid ${props => props.isUser ? COLORS.primary : '#e0f2fe'};
  color: ${props => props.isUser ? 'white' : COLORS.textPrimary};
  line-height: 1.5;
  font-size: 13px;
`

const TypingIndicator = styled.div`
  display: flex;
  gap: 6px;
  padding: 5px 0;
`

const TypingDot = styled.div<{ delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${COLORS.primaryLight};
  animation: bounce 1.4s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  
  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-8px); }
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const ActionButton = styled.button<{ color: string }>`
  flex: 1;
  min-width: 80px;
  padding: 10px 12px;
  background: ${props => {
    switch (props.color) {
      case 'primary': return `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`
      case 'secondary': return `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleLight})`
      case 'accent': return `linear-gradient(135deg, ${COLORS.success}, ${COLORS.successLight})`
      default: return 'rgba(255,255,255,0.1)'
    }
  }};
  border: none;
  border-radius: 12px;
  color: white;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px ${props => {
    switch (props.color) {
      case 'primary': return 'rgba(30, 64, 175, 0.3)'
      case 'secondary': return 'rgba(139, 92, 246, 0.3)'
      case 'accent': return 'rgba(34, 197, 94, 0.3)'
      default: return 'rgba(0,0,0,0.1)'
    }
  }};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px ${props => {
    switch (props.color) {
      case 'primary': return 'rgba(30, 64, 175, 0.4)'
      case 'secondary': return 'rgba(139, 92, 246, 0.4)'
      case 'accent': return 'rgba(34, 197, 94, 0.4)'
      default: return 'rgba(0,0,0,0.15)'
    }
  }};
  }
  
  span {
    font-size: 18px;
  }
`

const HistoryPanel = styled.div`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 2px solid ${COLORS.primaryLight};
  border-radius: 16px;
  padding: 10px 12px;
`

const HistoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 13px;
`

const ClearButton = styled.button`
  padding: 5px 12px;
  background: rgba(255, 71, 87, 0.2);
  border: 1px solid rgba(255, 71, 87, 0.5);
  border-radius: 8px;
  color: #ff4757;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 71, 87, 0.3);
  }
`

const HistoryList = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  max-height: 50px;
  overflow-y: auto;
`

const HistoryEmpty = styled.div`
  color: ${COLORS.textMuted};
  font-size: 12px;
`

const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(30, 64, 175, 0.1);
  border: 1px solid ${COLORS.primaryLight};
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: ${COLORS.textPrimary};
`
