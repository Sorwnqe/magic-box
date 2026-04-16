import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import confetti from 'canvas-confetti'
import { characters, backgrounds, zootopiaColors } from '../assets/images'

const COLORS = {
  ...zootopiaColors,
  purple: '#8b5cf6',
  indigo: '#6366f1',
  cyan: '#22d3ee',
  green: '#22c55e',
  orange: '#fb923c',
  yellow: '#facc15'
}

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`

const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.4)); }
  50% { filter: drop-shadow(0 0 40px rgba(139, 92, 246, 0.7)); }
`

const sparkle = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
`

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0.2) 100%);
  }
`

const ContentWrapper = styled(motion.div)`
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`

const TitleSection = styled(motion.div)`
  text-align: center;
  margin-bottom: 20px;
`

const Title = styled.h1`
  font-size: 2.2rem;
  background: linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.cyan} 50%, ${COLORS.green} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 10px;
  text-shadow: 0 5px 30px rgba(139, 92, 246, 0.3);
`

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`

const FormulaCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 24px;
  padding: 40px 60px;
  box-shadow: 
    0 20px 60px rgba(139, 92, 246, 0.3),
    inset 0 0 30px rgba(255, 255, 255, 0.5);
  border: 3px solid rgba(139, 92, 246, 0.3);
  animation: ${glow} 3s ease-in-out infinite;
`

const FormulaRow = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin: 15px 0;
`

const FormulaNumber = styled(motion.span) <{ color?: string }>`
  font-size: 3.5rem;
  font-weight: 800;
  color: ${props => props.color || COLORS.indigo};
  text-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
  animation: ${float} 3s ease-in-out infinite;
  min-width: 80px;
  text-align: center;
`

const FormulaOperator = styled.span`
  font-size: 2.5rem;
  color: ${COLORS.cyan};
  font-weight: 700;
`

const AnswerNumber = styled(motion.span)`
  font-size: 3.5rem;
  font-weight: 800;
  color: ${COLORS.green};
  text-shadow: 0 4px 20px rgba(34, 197, 94, 0.4);
  min-width: 80px;
  text-align: center;
`

const QuestionMark = styled(motion.span)`
  font-size: 3rem;
  font-weight: 800;
  color: ${COLORS.orange};
  min-width: 80px;
  text-align: center;
`

const Divider = styled.div`
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, ${COLORS.purple}, transparent);
  margin: 15px 0;
`

const CharacterLeft = styled(motion.div)`
  position: fixed;
  bottom: 60px;
  left: 40px;
  z-index: 20;
`

const CharacterRight = styled(motion.div)`
  position: fixed;
  bottom: 60px;
  right: 40px;
  z-index: 20;
`

const CharacterImg = styled.img`
  width: 180px;
  height: auto;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
`

const SpeechBubble = styled(motion.div)`
  background: white;
  padding: 15px 20px;
  border-radius: 18px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  font-size: 1rem;
  color: ${COLORS.textPrimary};
  max-width: 200px;
  text-align: center;
  margin-bottom: 15px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid white;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  margin-top: 30px;
`

const BackButton = styled(motion.button)`
  padding: 16px 30px;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${COLORS.purple};
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid ${COLORS.purple};
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
  }
`

const ActionButton = styled(motion.button) <{ variant?: 'primary' | 'success' }>`
  padding: 18px 50px;
  border: none;
  border-radius: 30px;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  background: ${props => props.variant === 'success'
    ? `linear-gradient(135deg, ${COLORS.green} 0%, ${COLORS.cyan} 100%)`
    : `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.yellow} 100%)`};
  color: white;
  box-shadow: ${props => props.variant === 'success'
    ? '0 8px 30px rgba(34, 197, 94, 0.5)'
    : '0 8px 30px rgba(251, 146, 60, 0.5)'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.variant === 'success'
    ? '0 12px 40px rgba(34, 197, 94, 0.6)'
    : '0 12px 40px rgba(251, 146, 60, 0.6)'};
  }
`

const Sparkles = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
`

const Sparkle = styled.div<{ delay: number; x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}%;
  top: ${props => props.y}%;
  width: 8px;
  height: 8px;
  background: ${COLORS.yellow};
  border-radius: 50%;
  animation: ${sparkle} 2s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  box-shadow: 0 0 10px ${COLORS.yellow};
`

interface FormulaPreviewProps {
  onContinue: () => void
  onBack?: () => void
}

export default function FormulaPreview({ onContinue, onBack }: FormulaPreviewProps) {
  const [showAnswers, setShowAnswers] = useState(false)
  const [answersRevealed, setAnswersRevealed] = useState([false, false])

  const formulas = [
    { left: 12, right: 21, sum: 33 },
    { left: 23, right: 32, sum: 55 },
    { left: 34, right: 43, sum: 77 }
  ]

  // 生成随机闪光点
  const sparkles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2
  }))

  const handleShowAnswers = () => {
    setShowAnswers(true)

    // 第一个答案弹出
    setTimeout(() => {
      setAnswersRevealed([true, false, false])
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#22c55e', '#4ade80', '#fbbf24']
      })
    }, 300)

    // 第二个答案弹出
    setTimeout(() => {
      setAnswersRevealed([true, true, false])
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#22c55e', '#4ade80', '#fbbf24', '#8b5cf6']
      })
    }, 800)

    // 第二个答案弹出
    setTimeout(() => {
      setAnswersRevealed([true, true, true])
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#22c55e', '#4ade80', '#fbbf24', '#8b5cf6']
      })
    }, 1300)
  }

  return (
    <Container>
      <BackgroundImage />

      <Sparkles>
        {sparkles.map(s => (
          <Sparkle key={s.id} x={s.x} y={s.y} delay={s.delay} />
        ))}
      </Sparkles>

      {/* 朱迪 - 左侧 */}
      <CharacterLeft
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
      >
        <SpeechBubble
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
        >
          🐰 观察这两道算式，发现规律了吗？
        </SpeechBubble>
        <CharacterImg src={characters.judy} alt="Judy" />
      </CharacterLeft>

      {/* 尼克 - 右侧 */}
      <CharacterRight
        initial={{ x: 200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
      >
        <SpeechBubble
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
        >
          🦊 用你找到的规律，一起试试吧！
        </SpeechBubble>
        <CharacterImg src={characters.nick} alt="Nick" />
      </CharacterRight>

      <ContentWrapper
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <TitleSection
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Title>✨ 反转数的秘密 ✨</Title>
          <Subtitle>观察下面的算式，准备进入第二关！</Subtitle>
        </TitleSection>

        <FormulaCard
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
        >
          {formulas.map((formula, index) => (
            <FormulaRow
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.2 }}
            >
              <FormulaNumber
                color={COLORS.purple}
                style={{ animationDelay: `${index * 0.3}s` }}
              >
                {formula.left}
              </FormulaNumber>
              <FormulaOperator>+</FormulaOperator>
              <FormulaNumber
                color={COLORS.indigo}
                style={{ animationDelay: `${index * 0.3 + 0.15}s` }}
              >
                {formula.right}
              </FormulaNumber>
              <FormulaOperator>=</FormulaOperator>

              <AnimatePresence mode="wait">
                {answersRevealed[index] ? (
                  <AnswerNumber
                    key="answer"
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 15
                    }}
                  >
                    {formula.sum}
                  </AnswerNumber>
                ) : (
                  <QuestionMark
                    key="question"
                    initial={{ opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    animate={{
                      scale: [1, 1.1, 1],
                      transition: { repeat: Infinity, duration: 1.5 }
                    }}
                  >
                    ?
                  </QuestionMark>
                )}
              </AnimatePresence>
            </FormulaRow>
          ))}

          <Divider />

          {/* <AnimatePresence mode="wait">
            {showAnswers && answersRevealed[1] ? (
              <HintText
                key="revealed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                ✨ 反转数相加，和都是 <strong>11的倍数</strong>！
              </HintText>
            ) : (
              <HintText
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                💡 12 ↔ 21，23 ↔ 32 —— 十位和个位互换！
              </HintText>
            )}
          </AnimatePresence> */}
        </FormulaCard>

        <AnimatePresence mode="wait">
          {showAnswers && answersRevealed[1] ? (
            <ButtonGroup>
              {onBack && (
                <BackButton
                  onClick={onBack}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ← 返回第一关
                </BackButton>
              )}
              <ActionButton
                key="continue"
                variant="success"
                onClick={onContinue}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🚀 进入第二关
              </ActionButton>
            </ButtonGroup>
          ) : (
            <ButtonGroup>
              {onBack && (
                <BackButton
                  onClick={onBack}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ← 返回第一关
                </BackButton>
              )}
              <ActionButton
                key="reveal"
                onClick={handleShowAnswers}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: 1.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🌟 显示答案
              </ActionButton>
            </ButtonGroup>
          )}
        </AnimatePresence>
      </ContentWrapper>
    </Container>
  )
}
