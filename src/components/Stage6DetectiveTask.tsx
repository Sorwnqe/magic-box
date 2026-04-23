import { motion } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { IoChevronForward, IoChevronBack } from 'react-icons/io5'
import { HiSparkles } from 'react-icons/hi2'
import { GiMagnifyingGlass } from 'react-icons/gi'
import { playClick } from '../hooks/useSound'

const COLORS = {
  primary: '#4f46e5',
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  gold: '#fbbf24',
  goldLight: '#fde68a',
  accent: '#f59e0b',
  bgDark: '#0f172a',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
}

interface Props {
  onContinue: () => void
  onBack?: () => void
}

export default function Stage6DetectiveTask({ onContinue, onBack }: Props) {
  const handleContinue = () => { playClick(); onContinue() }

  return (
    <Container>
      <BackgroundGradient />

      <ParticleLayer>
        {Array.from({ length: 18 }).map((_, i) => (
          <Particle
            key={i}
            style={{
              left: `${(i * 19 + 7) % 100}%`,
              top: `${(i * 29 + 11) % 100}%`,
              animationDelay: `${(i * 0.35) % 3}s`,
            }}
          />
        ))}
      </ParticleLayer>

      <ContentWrapper>
        {/* 顶部标签 */}
        <HeaderRow
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StageTag><HiSparkles /> 侦探拓展任务</StageTag>
        </HeaderRow>

        {/* 主卡片 */}
        <TaskCard
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', damping: 14 }}
        >
          <IconArea
            animate={{ rotate: [0, -8, 8, -4, 4, 0], y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          >
            <GiMagnifyingGlass />
          </IconArea>

          <TaskTitle>创造你自己的谜题！</TaskTitle>

          <TaskDesc>
            运用今天学到的<Highlight>反转数</Highlight>知识，<br />
            设计一道<Highlight>有趣的算式</Highlight>谜题，<br />
            回家后考考你的<Accent>家人</Accent>或<Accent>同桌</Accent>。
          </TaskDesc>

          <HintBox>
            <HintRow><HiSparkles /> 例如：把算式中某个数字盖住，让对方猜答案</HintRow>
            <HintRow><HiSparkles /> 也可以问：12 + 21 = ？，你还能找到几个类似的？</HintRow>
          </HintBox>
        </TaskCard>

        {/* 按钮 */}
        <ButtonRow
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {onBack && (
            <BackButton
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { playClick(); onBack() }}
            >
              <IoChevronBack />
              <span>返回</span>
            </BackButton>
          )}
          <ContinueButton
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleContinue}
          >
            <span>完成探索</span>
            <IoChevronForward />
          </ContinueButton>
        </ButtonRow>
      </ContentWrapper>
    </Container>
  )
}

// ========== Animations ==========

const sparkleAnim = keyframes`
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 0.8; transform: scale(1.2); }
`

// ========== Styled ==========

const Container = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: ${COLORS.bgDark};
`

const BackgroundGradient = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 30%, rgba(79, 70, 229, 0.3) 0%, transparent 55%),
    radial-gradient(ellipse at 70% 70%, rgba(251, 191, 36, 0.2) 0%, transparent 55%),
    linear-gradient(135deg, ${COLORS.bgDark} 0%, #1e1b4b 100%);
`

const ParticleLayer = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
`

const Particle = styled.div`
  position: absolute;
  width: 5px;
  height: 5px;
  background: ${COLORS.purpleLight};
  border-radius: 50%;
  box-shadow: 0 0 10px ${COLORS.purple};
  animation: ${sparkleAnim} 3s ease-in-out infinite;
`

const ContentWrapper = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 30px 40px;
`

const HeaderRow = styled(motion.div)`
  display: flex;
  align-items: center;
`

const StageTag = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 28px;
  background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.purple});
  color: white;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: 800;
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.5);
  svg { font-size: 1.1rem; }
`

const TaskCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  padding: 40px 60px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.97), rgba(15, 23, 42, 0.97));
  border: 2px solid rgba(139, 92, 246, 0.35);
  border-radius: 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), inset 0 0 30px rgba(139, 92, 246, 0.06);
  max-width: 700px;
  width: 100%;
`

const IconArea = styled(motion.div)`
  font-size: 6rem;
  color: ${COLORS.gold};
  filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.6));
  line-height: 1;
`

const TaskTitle = styled.h1`
  font-size: 2.4rem;
  font-weight: 900;
  background: linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  text-align: center;
`

const TaskDesc = styled.p`
  font-size: 1.35rem;
  font-weight: 600;
  color: ${COLORS.textPrimary};
  text-align: center;
  line-height: 1.8;
  margin: 0;
`

const Highlight = styled.span`
  color: ${COLORS.goldLight};
  font-weight: 900;
`

const Accent = styled.span`
  color: ${COLORS.purpleLight};
  font-weight: 900;
`

const HintBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 24px;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: 14px;
  width: 100%;
`

const HintRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${COLORS.purpleLight};

  svg { color: ${COLORS.goldLight}; flex-shrink: 0; }
`

const ButtonRow = styled(motion.div)`
  display: flex;
  gap: 14px;
  align-items: center;
`

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 26px;
  font-size: 1rem;
  font-weight: 700;
  color: ${COLORS.purpleLight};
  background: transparent;
  border: 2px solid ${COLORS.purpleLight};
  border-radius: 50px;
  cursor: pointer;
  svg { font-size: 1.1rem; }
`

const ContinueButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 40px;
  font-size: 1.2rem;
  font-weight: 800;
  color: white;
  background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.purple});
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(79, 70, 229, 0.5);
  svg { font-size: 1.3rem; }
`
