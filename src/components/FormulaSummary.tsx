import { motion } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { HiSparkles } from 'react-icons/hi2'

const COLORS = {
  primary: '#4f46e5',
  primaryLight: '#818cf8',
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  indigo: '#6366f1',
  cyan: '#22d3ee',
  green: '#22c55e',
  orange: '#fb923c',
  yellow: '#facc15',
  pink: '#f472b6',
  gold: '#fbbf24',
  goldLight: '#fde68a',
  bgDark: '#0f172a',
  bgLight: '#1e293b',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
}

// 所有算式
const FORMULAS = [
  { left: 12, right: 21, sum: 33, color: COLORS.purple },
  { left: 23, right: 32, sum: 55, color: COLORS.indigo },
  { left: 13, right: 31, sum: 44, color: COLORS.orange },
  { left: 22, right: 22, sum: 44, color: COLORS.yellow },
  { left: 18, right: 81, sum: 99, color: COLORS.cyan },
  { left: 27, right: 72, sum: 99, color: COLORS.green },
  { left: 36, right: 63, sum: 99, color: COLORS.pink },
  { left: 45, right: 54, sum: 99, color: COLORS.purple },
]

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
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
  background: 
    radial-gradient(ellipse at center, rgba(139, 92, 246, 0.3) 0%, transparent 60%),
    linear-gradient(135deg, ${COLORS.bgDark} 0%, #1e1b4b 50%, ${COLORS.bgDark} 100%);
  z-index: 0;
`

const ContentWrapper = styled(motion.div)`
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  padding: 20px;
`

const TitleSection = styled(motion.div)`
  text-align: center;
`

const Title = styled.h1`
  font-size: 2rem;
  background: linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: ${COLORS.gold};
    -webkit-text-fill-color: ${COLORS.gold};
  }
`

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${COLORS.purpleLight};
  margin: 0;
`

const FormulaGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  max-width: 800px;
`

const FormulaCard = styled(motion.div)<{ borderColor: string }>`
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 18px 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 2px solid ${props => props.borderColor};
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.2);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(139, 92, 246, 0.3);
  }
  
  transition: all 0.3s ease;
`

const Number = styled.span<{ color: string }>`
  font-size: 1.8rem;
  font-weight: 800;
  color: ${props => props.color};
  min-width: 45px;
  text-align: center;
`

const Operator = styled.span`
  font-size: 1.5rem;
  color: #94a3b8;
  font-weight: 600;
`

const AnswerNumber = styled(motion.span)<{ sum: number }>`
  font-size: 2rem;
  font-weight: 800;
  min-width: 50px;
  text-align: center;
  background: ${props => {
    if (props.sum === 33) return `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.indigo})`
    if (props.sum === 44) return `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.yellow})`
    if (props.sum === 55) return `linear-gradient(135deg, ${COLORS.indigo}, ${COLORS.cyan})`
    return `linear-gradient(135deg, ${COLORS.green}, ${COLORS.cyan})`
  }};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${float} 2s ease-in-out infinite;
  animation-delay: ${props => (props.sum % 10) * 0.1}s;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`

const BackButton = styled(motion.button)`
  padding: 14px 30px;
  font-size: 1rem;
  font-weight: 700;
  color: ${COLORS.purpleLight};
  background: transparent;
  border: 2px solid ${COLORS.purpleLight};
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
`

const ContinueButton = styled(motion.button)`
  padding: 14px 40px;
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.purple} 100%);
  border: none;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 25px rgba(79, 70, 229, 0.4);
  
  background-size: 200% 100%;
  animation: ${shimmer} 3s linear infinite;
`

const Sparkles = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
`

const Sparkle = styled(motion.div)<{ size: number; color: string }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: ${props => props.color};
  border-radius: 50%;
  filter: blur(1px);
`

interface Props {
  onContinue: () => void
  onBack?: () => void
}

export default function FormulaSummary({ onContinue, onBack }: Props) {
  // 随机生成闪烁星星
  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 3,
    color: [COLORS.purple, COLORS.cyan, COLORS.green, COLORS.yellow, COLORS.orange][Math.floor(Math.random() * 5)],
    delay: Math.random() * 2
  }))

  return (
    <Container>
      <BackgroundImage />
      
      {/* 背景闪烁星星 */}
      <Sparkles>
        {sparkles.map(s => (
          <Sparkle
            key={s.id}
            size={s.size}
            color={s.color}
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 2,
              delay: s.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </Sparkles>
      
      <ContentWrapper
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <TitleSection>
          <Title><HiSparkles /> 反转数魔法大全 <HiSparkles /></Title>
          <Subtitle>密室解锁成功！以下是所有反转数的秘密</Subtitle>
        </TitleSection>
        
        <FormulaGrid>
          {FORMULAS.map((formula, index) => (
            <FormulaCard
              key={index}
              borderColor={formula.color}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <Number color={formula.color}>{formula.left}</Number>
              <Operator>+</Operator>
              <Number color={formula.color}>{formula.right}</Number>
              <Operator>=</Operator>
              <AnswerNumber sum={formula.sum}>{formula.sum}</AnswerNumber>
            </FormulaCard>
          ))}
        </FormulaGrid>
        
        <ButtonGroup>
          {onBack && (
            <BackButton
              onClick={onBack}
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              ← 返回第四关
            </BackButton>
          )}
          <ContinueButton
            onClick={onContinue}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            🎉 完成所有关卡 →
          </ContinueButton>
        </ButtonGroup>
      </ContentWrapper>
    </Container>
  )
}
