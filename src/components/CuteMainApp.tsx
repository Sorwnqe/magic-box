import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import confetti from 'canvas-confetti'
import { useMagicBox } from '../stores/useMagicBox'

interface Message {
  id: number
  type: 'bot' | 'user'
  content: string
  isTyping?: boolean
}

// 可爱魔盒组件
function CuteMagicBox({
  isSpinning,
  isOpening,
  displayNumber
}: {
  isSpinning: boolean
  isOpening: boolean
  displayNumber: string
}) {
  return (
    <MagicBoxWrapper>
      <BoxContainer
        animate={{
          rotate: isSpinning ? [0, 360] : isOpening ? [0, 10, -10, 0] : 0,
          scale: isOpening ? [1, 1.1, 1] : 1
        }}
        transition={{
          rotate: { duration: isSpinning ? 1 : 0.5, repeat: isSpinning ? Infinity : 0 },
          scale: { duration: 0.3 }
        }}
      >
        {/* 盒子主体 */}
        <BoxBody isOpening={isOpening}>
          <BoxFace>
            <BoxNumber>{displayNumber}</BoxNumber>
            <BoxDecoration>✨</BoxDecoration>
          </BoxFace>
          <BoxLid isOpening={isOpening}>
            <LidBow>🎀</LidBow>
          </BoxLid>
        </BoxBody>

        {/* 魔法光芒 */}
        {isOpening && (
          <MagicGlow
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 2] }}
            transition={{ duration: 0.8 }}
          />
        )}
      </BoxContainer>

      {/* 周围的星星装饰 */}
      <FloatingStar style={{ top: '10%', left: '10%' }} delay={0}>⭐</FloatingStar>
      <FloatingStar style={{ top: '20%', right: '15%' }} delay={0.3}>✨</FloatingStar>
      <FloatingStar style={{ bottom: '30%', left: '5%' }} delay={0.6}>🌟</FloatingStar>
      <FloatingStar style={{ bottom: '20%', right: '10%' }} delay={0.9}>💫</FloatingStar>
    </MagicBoxWrapper>
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
      {message.type === 'bot' && <Avatar>🧙‍♀️</Avatar>}
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
        <DigitBox color={isResult ? "#6ee7b7" : "#ff6b9d"}>
          <DigitLabel>十位</DigitLabel>
          <DigitValue>{tens}</DigitValue>
        </DigitBox>
        <DigitBox color={isResult ? "#a78bfa" : "#7dd3fc"}>
          <DigitLabel>个位</DigitLabel>
          <DigitValue>{ones}</DigitValue>
        </DigitBox>
      </DigitBoxes>
    </CardWrapper>
  )
}

// 主组件
export default function CuteMainApp() {
  const magicBox = useMagicBox()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: '✨ 欢迎来到<strong style="color:#ff6b9d">数字魔盒</strong>！<br/><br/>我是魔法小精灵 🧚‍♀️<br/><br/>试着输入一个<strong style="color:#a78bfa">两位数</strong>（比如 12、35），看看魔盒会变出什么神奇的东西吧！🎁'
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
    // 可爱的彩色confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b9d', '#a78bfa', '#6ee7b7', '#fcd34d', '#7dd3fc', '#fdba74']
    })

    // 添加星星效果
    confetti({
      particleCount: 30,
      spread: 100,
      origin: { y: 0.5 },
      shapes: ['star'],
      colors: ['#fcd34d', '#ff6b9d']
    })
  }

  const handleSubmit = () => {
    const value = inputValue.trim()
    if (!value) return

    const validation = magicBox.validateInput(value)
    if (!validation.valid) {
      addBotMessage(`😅 ${validation.message}`)
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

    setTimeout(() => addBotMessage(`🎁 ${result.message}`), 800)

    setInputValue('')
  }

  const handleReveal = () => {
    const result = magicBox.openBox()

    if (!result.success) {
      addBotMessage(`🤔 ${result.message}`)
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
    addBotMessage('🧹 历史记录已清空！让我们重新开始探索吧！✨')
  }

  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 背景装饰 */}
      <BackgroundDecoration />

      {/* 主内容 */}
      <MainContent>
        {/* 左侧 - 魔盒区 */}
        <LeftPanel>
          <MagicBoxArea>
            <CuteMagicBox
              isSpinning={isSpinning}
              isOpening={isOpening}
              displayNumber={displayNumber}
            />
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
              <ActionButton color="pink" onClick={handleSubmit}>
                <span>🎁</span> 放入魔盒
              </ActionButton>
              <ActionButton color="purple" onClick={handleReveal}>
                <span>✨</span> 打开魔盒
              </ActionButton>
              <ActionButton color="mint" onClick={handlePattern}>
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
                <HistoryEmpty>还没有记录哦，快来试试吧！🌈</HistoryEmpty>
              ) : (
                magicBox.history.map((item, index) => (
                  <HistoryItem key={index}>
                    <span>{item.input}</span>
                    <span style={{ color: '#ff6b9d' }}>✨➡️</span>
                    <span style={{ color: item.revealed ? '#6ee7b7' : '#fcd34d' }}>
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

      {/* 底部装饰波浪 */}
      <BottomWaves>
        <Wave color="#ffb3c6" />
        <Wave color="#c4b5fd" style={{ bottom: 10 }} />
        <Wave color="#a8edea" style={{ bottom: 20 }} />
      </BottomWaves>
    </Container>
  )
}

// 动画关键帧
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
`

const bounceAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`

const waveAnimation = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`

const sparkleAnimation = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.8); }
`

const typingAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`

// Styled Components
const Container = styled(motion.div)`
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ff 0%, #fdf4ff 50%, #f5f3ff 100%);
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
    radial-gradient(circle at 20% 30%, rgba(255, 107, 157, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(167, 139, 250, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(110, 231, 183, 0.05) 0%, transparent 50%);
`

const Navbar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 3px solid #ffb3c6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(255, 107, 157, 0.1);
`

const NavLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const LogoEmoji = styled.span`
  font-size: 32px;
  animation: ${bounceAnimation} 2s ease-in-out infinite;
`

const LogoText = styled.span`
  font-family: 'Nunito', sans-serif;
  font-size: 26px;
  font-weight: 800;
  background: linear-gradient(135deg, #ff6b9d 0%, #a78bfa 50%, #6ee7b7 100%);
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
  background: ${props => props.active ? 'linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%)' : 'white'};
  border: 2px solid ${props => props.active ? '#ff6b9d' : '#e5e7eb'};
  border-radius: 25px;
  color: ${props => props.active ? 'white' : props.disabled ? '#9ca3af' : '#581c87'};
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 4px 15px rgba(255, 107, 157, 0.3)' : 'none'};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 107, 157, 0.2);
  }
`

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  padding: 100px 30px 180px;
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
  height: 350px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 243, 248, 0.9) 100%);
  border-radius: 30px;
  border: 3px solid #ffb3c6;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(255, 107, 157, 0.15);
`

const MagicBoxWrapper = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
`

const BoxContainer = styled(motion.div)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const BoxBody = styled.div<{ isOpening: boolean }>`
  width: 140px;
  height: 120px;
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
  border-radius: 15px;
  position: relative;
  box-shadow: 
    0 15px 30px rgba(139, 92, 246, 0.4),
    inset 0 -10px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
`

const BoxFace = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`

const BoxNumber = styled.span`
  font-family: 'Nunito', sans-serif;
  font-size: 48px;
  font-weight: 900;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`

const BoxDecoration = styled.span`
  font-size: 20px;
  animation: ${sparkleAnimation} 1.5s ease-in-out infinite;
`

const BoxLid = styled.div<{ isOpening: boolean }>`
  position: absolute;
  top: -25px;
  left: -5px;
  right: -5px;
  height: 35px;
  background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%);
  border-radius: 10px 10px 5px 5px;
  transform-origin: bottom;
  transform: ${props => props.isOpening ? 'rotateX(-30deg)' : 'rotateX(0)'};
  transition: transform 0.3s ease;
  box-shadow: 0 -5px 15px rgba(139, 92, 246, 0.3);
`

const LidBow = styled.span`
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 30px;
`

const MagicGlow = styled(motion.div)`
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 205, 52, 0.6) 0%, transparent 70%);
  pointer-events: none;
`

const FloatingStar = styled.div<{ delay: number }>`
  position: absolute;
  font-size: 24px;
  animation: ${floatAnimation} 3s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
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
  border: 3px solid #ffb3c6;
  border-radius: 25px;
  padding: 20px 25px;
  text-align: center;
  min-width: 150px;
  box-shadow: 0 8px 25px rgba(255, 107, 157, 0.15);
  position: relative;
`

const CardEmoji = styled.div`
  font-size: 28px;
  margin-bottom: 5px;
`

const CardLabel = styled.div`
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 14px;
  color: #7c3aed;
  font-weight: 600;
  margin-bottom: 8px;
`

const CardNumber = styled.div<{ isResult?: boolean }>`
  font-family: 'Nunito', sans-serif;
  font-size: 42px;
  font-weight: 900;
  color: ${props => props.isResult ? '#6ee7b7' : '#ff6b9d'};
  margin-bottom: 12px;
`

const DigitBoxes = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`

const DigitBox = styled.div<{ color: string }>`
  background: ${props => props.color}20;
  border: 2px solid ${props => props.color};
  border-radius: 12px;
  padding: 8px 12px;
  min-width: 45px;
`

const DigitLabel = styled.div`
  font-size: 10px;
  color: #7c3aed;
  font-weight: 600;
  margin-bottom: 3px;
`

const DigitValue = styled.div`
  font-family: 'Nunito', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #581c87;
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
    color: #a78bfa;
    font-weight: 600;
  }
`

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: calc(100vh - 280px);
`

const ChatContainer = styled.div`
  flex: 1;
  background: white;
  border: 3px solid #c4b5fd;
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(167, 139, 250, 0.15);
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
    ? 'linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%)'
    : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'};
  color: ${props => props.isUser ? 'white' : '#581c87'};
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 15px;
  line-height: 1.5;
  box-shadow: 0 4px 15px ${props => props.isUser
    ? 'rgba(255, 107, 157, 0.2)'
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
  background: #a78bfa;
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
  color: #581c87;
  background: white;
  border: 3px solid #ffb3c6;
  border-radius: 25px;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.1);
  
  &::placeholder {
    color: #c4b5fd;
  }
  
  &:focus {
    border-color: #ff6b9d;
    box-shadow: 0 4px 20px rgba(255, 107, 157, 0.25);
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
      case 'pink': return 'linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%)'
      case 'purple': return 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)'
      case 'mint': return 'linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)'
      default: return 'linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%)'
    }
  }};
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px ${props => {
    switch (props.color) {
      case 'pink': return 'rgba(255, 107, 157, 0.3)'
      case 'purple': return 'rgba(167, 139, 250, 0.3)'
      case 'mint': return 'rgba(110, 231, 183, 0.3)'
      default: return 'rgba(255, 107, 157, 0.3)'
    }
  }};
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px ${props => {
    switch (props.color) {
      case 'pink': return 'rgba(255, 107, 157, 0.4)'
      case 'purple': return 'rgba(167, 139, 250, 0.4)'
      case 'mint': return 'rgba(110, 231, 183, 0.4)'
      default: return 'rgba(255, 107, 157, 0.4)'
    }
  }};
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
  border: 3px solid #a8edea;
  border-radius: 20px;
  padding: 15px;
  box-shadow: 0 4px 15px rgba(110, 231, 183, 0.15);
`

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 700;
  color: #581c87;
`

const ClearButton = styled.button`
  padding: 5px 15px;
  font-size: 12px;
  font-weight: 600;
  color: #ff6b9d;
  background: #fff1f3;
  border: 2px solid #ffb3c6;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #ff6b9d;
    color: white;
  }
`

const HistoryList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const HistoryEmpty = styled.div`
  color: #a78bfa;
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
  background: linear-gradient(135deg, #fef7ff 0%, #f5f3ff 100%);
  border: 2px solid #e5e7eb;
  border-radius: 20px;
  font-family: 'Nunito', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #581c87;
`

const BottomWaves = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
`

const Wave = styled.div<{ color: string }>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 60px;
  background: ${props => props.color};
  border-radius: 100% 100% 0 0;
  animation: ${waveAnimation} 10s linear infinite;
  opacity: 0.5;
`
