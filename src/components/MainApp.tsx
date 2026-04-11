import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  Float, 
  MeshTransmissionMaterial,
  Environment,
  Sparkles,
  Text,
  OrbitControls
} from '@react-three/drei'
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

// 3D 魔盒组件
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
        
        {/* 魔盒主体 */}
        <mesh ref={boxRef}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <MeshTransmissionMaterial
            backside
            samples={8}
            thickness={0.3}
            chromaticAberration={0.3}
            anisotropy={0.2}
            distortion={0.3}
            distortionScale={0.3}
            iridescence={1}
            iridescenceIOR={1}
            iridescenceThicknessRange={[0, 1400]}
            color="#4060ff"
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
      {/* 导航栏 */}
      <Navbar>
        <NavLogo>
          <LogoBoxContainer>
            <img src={items.magicBox} alt="魔盒" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </LogoBoxContainer>
          <LogoText>数字魔盒</LogoText>
        </NavLogo>
        <NavTabs>
          <NavTab active>
            <span>🎲</span>
            <span>交换魔法</span>
          </NavTab>
          <NavTab disabled>
            <span>🔮</span>
            <span>即将开放</span>
          </NavTab>
          <NavTab disabled>
            <span>⭐</span>
            <span>即将开放</span>
          </NavTab>
          <NavTab disabled>
            <span>🎯</span>
            <span>即将开放</span>
          </NavTab>
        </NavTabs>
      </Navbar>

      {/* 主内容区 */}
      <MainContent>
        {/* 左侧 - 3D魔盒 */}
        <LeftPanel>
          <CanvasContainer>
            <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
              <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
                <Environment preset="night" />
                <MagicBox3D 
                  isSpinning={isSpinning} 
                  isOpening={isOpening}
                  displayNumber={displayNumber}
                />
                <OrbitControls enableZoom={false} enablePan={false} />
              </Suspense>
            </Canvas>
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
              <svg viewBox="0 0 100 40" width="80" height="32">
                <path d="M10,20 Q50,5 90,20" fill="none" stroke="url(#grad)" strokeWidth="2"/>
                <path d="M10,20 Q50,35 90,20" fill="none" stroke="url(#grad)" strokeWidth="2"/>
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
              <InputIcon>⭐</InputIcon>
            </InputWrapper>
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
          </InputArea>

          {/* 历史记录 */}
          <HistoryPanel>
            <HistoryHeader>
              <span>📝 魔法记录</span>
              <ClearButton onClick={handleClear}>清空</ClearButton>
            </HistoryHeader>
            <HistoryList>
              {magicBox.history.length === 0 ? (
                <HistoryEmpty>还没有记录哦，快来试试吧！</HistoryEmpty>
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

const Navbar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: rgba(30, 64, 175, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid ${COLORS.primaryLight};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  z-index: 100;
`

const NavLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const LogoBoxContainer = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(124, 58, 237, 0.1);
  border: 1px solid rgba(124, 58, 237, 0.3);
`

const LogoText = styled.span`
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, ${COLORS.gold} 0%, #fff 50%, ${COLORS.gold} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const NavTabs = styled.div`
  display: flex;
  gap: 10px;
`

const NavTab = styled.button<{ active?: boolean; disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: 1px solid ${props => props.active ? 'white' : 'rgba(255,255,255,0.3)'};
  border-radius: 25px;
  color: ${props => props.disabled ? 'rgba(255,255,255,0.4)' : 'white'};
  font-family: var(--font-body);
  font-size: 14px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    border-color: white;
    background: rgba(255, 255, 255, 0.15);
  }
`

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  padding: 100px 30px 30px;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
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

const CanvasContainer = styled.div`
  height: 400px;
  background: linear-gradient(135deg, rgba(30, 64, 175, 0.8) 0%, rgba(59, 130, 246, 0.6) 100%);
  border-radius: 24px;
  border: 2px solid ${COLORS.primaryLight};
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(30, 64, 175, 0.3);
`

const CardsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
`

const CardWrapper = styled(motion.div)`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 2px solid ${COLORS.primaryLight};
  border-radius: 20px;
  padding: 20px 30px;
  text-align: center;
  min-width: 160px;
  box-shadow: 0 5px 20px rgba(30, 64, 175, 0.15);
`

const CardLabel = styled.div`
  font-size: 14px;
  color: ${COLORS.textSecondary};
  margin-bottom: 8px;
  font-weight: 600;
`

const CardNumber = styled.div<{ isResult?: boolean }>`
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 700;
  background: ${props => props.isResult 
    ? `linear-gradient(135deg, ${COLORS.success}, ${COLORS.primaryLight})` 
    : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.purple})`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
`

const DigitBoxes = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`

const DigitBox = styled.div<{ color: string }>`
  background: rgba(30, 64, 175, 0.1);
  border: 2px solid ${props => props.color};
  border-radius: 12px;
  padding: 10px 15px;
  min-width: 50px;
`

const DigitLabel = styled.div`
  font-size: 11px;
  color: ${COLORS.textSecondary};
  margin-bottom: 4px;
`

const DigitValue = styled.div`
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  color: ${COLORS.textPrimary};
`

const SwapArrow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  
  span {
    font-size: 12px;
    color: ${COLORS.accent};
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
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 2px solid ${COLORS.primaryLight};
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 300px;
  box-shadow: 0 5px 25px rgba(30, 64, 175, 0.15);
`

const ChatMessages = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
`

const MessageWrapper = styled(motion.div)<{ isUser: boolean }>`
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
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${COLORS.primaryLight};
  flex-shrink: 0;
`

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 15px 20px;
  border-radius: ${props => props.isUser ? '20px 20px 5px 20px' : '20px 20px 20px 5px'};
  background: ${props => props.isUser 
    ? `linear-gradient(135deg, ${COLORS.primaryLight}, ${COLORS.purple})` 
    : '#f0f9ff'};
  border: 1px solid ${props => props.isUser ? COLORS.primary : '#e0f2fe'};
  color: ${props => props.isUser ? 'white' : COLORS.textPrimary};
  line-height: 1.6;
  font-size: 15px;
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

const InputArea = styled.div`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 2px solid ${COLORS.primaryLight};
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 5px 20px rgba(30, 64, 175, 0.1);
`

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 15px;
`

const NumberInput = styled.input`
  width: 100%;
  padding: 15px 50px 15px 20px;
  background: #f0f9ff;
  border: 2px solid ${COLORS.primaryLight};
  border-radius: 15px;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  color: ${COLORS.textPrimary};
  text-align: center;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${COLORS.primary};
    box-shadow: 0 0 20px rgba(30, 64, 175, 0.2);
  }
  
  &::placeholder {
    color: ${COLORS.textMuted};
    font-weight: 400;
  }
`

const InputIcon = styled.span`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  animation: spin 3s linear infinite;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`

const ActionButton = styled.button<{ color: string }>`
  flex: 1;
  min-width: 120px;
  padding: 12px 20px;
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
  border-radius: 24px;
  padding: 15px 20px;
  box-shadow: 0 5px 20px rgba(30, 64, 175, 0.1);
`

const HistoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-weight: 600;
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
  gap: 8px;
  flex-wrap: wrap;
  max-height: 60px;
  overflow-y: auto;
`

const HistoryEmpty = styled.div`
  color: ${COLORS.textMuted};
  font-size: 14px;
`

const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(30, 64, 175, 0.1);
  border: 1px solid ${COLORS.primaryLight};
  border-radius: 15px;
  font-size: 14px;
  font-weight: 600;
  color: ${COLORS.textPrimary};
`
