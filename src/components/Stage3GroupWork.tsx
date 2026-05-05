import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { IoChevronForward, IoChevronBack, IoTimeOutline } from 'react-icons/io5'
import { HiSparkles } from 'react-icons/hi2'
import { playClick } from '../hooks/useSound'

const COLORS = {
  primary: '#4f46e5',
  primaryLight: '#818cf8',
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  gold: '#fbbf24',
  goldLight: '#fde68a',
  accent: '#f59e0b',
  green: '#22c55e',
  bgDark: '#0f172a',
  bgLight: '#1e293b',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
}

const TOTAL_SECONDS = 120 // 2 minutes

interface Stage3GroupWorkProps {
  onContinue: () => void
  onBack?: () => void
}

export default function Stage3GroupWork({ onContinue, onBack }: Stage3GroupWorkProps) {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS)
  const [isRunning, setIsRunning] = useState(true)


  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { setIsRunning(false); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isRunning, secondsLeft])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const progress = secondsLeft / TOTAL_SECONDS
  const expired = secondsLeft === 0


  const handleContinue = () => {
    playClick()
    onContinue()
  }

  return (
    <Container>
      <BackgroundGradient />

      <ParticleLayer>
        {Array.from({ length: 15 }).map((_, i) => (
          <Particle
            key={i}
            style={{
              left: `${(i * 19 + 5) % 100}%`,
              top: `${(i * 31 + 13) % 100}%`,
              animationDelay: `${(i * 0.4) % 3}s`,
            }}
          />
        ))}
      </ParticleLayer>

      <ContentWrapper>
        {/* 倒计时区域 */}
        <TimerSection
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TimerIcon expired={expired}>
            <IoTimeOutline />
          </TimerIcon>
          <TimerDisplay expired={expired}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </TimerDisplay>
          <ProgressBar>
            <ProgressFill
              style={{ width: `${progress * 100}%` }}
              expired={expired}
            />
          </ProgressBar>
          <TimerLabel>{expired ? '⏰ 时间到！' : '小组合作时间'}</TimerLabel>
        </TimerSection>

        {/* 合作要求 */}
        <RequirementsArea>
          <RequirementBlock
            color={COLORS.gold}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <BlockHeader color={COLORS.gold}>
              <HiSparkles /> 小组合作要求
            </BlockHeader>
            <ItemList>
              {[
                '一号同学：检查算式是不是有趣算式。',
                '二号同学：说说自己找算式的方法。',
                '全体组员：互相补充，补齐漏掉的算式。',
              ].map((text, i) => (
                <Item key={i}>
                  <ItemText>{text}</ItemText>
                </Item>
              ))}
            </ItemList>
          </RequirementBlock>
        </RequirementsArea>

        {/* 按钮行 */}
        <ButtonRow>
          {onBack && (
            <BackButton
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={onBack}
            >
              <IoChevronBack />
              <span>返回</span>
            </BackButton>
          )}
          <ContinueButton
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleContinue}
          >
            <span>继续探索</span>
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

const pulseRed = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`

// ========== Styled Components ==========

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
    radial-gradient(ellipse at 20% 20%, rgba(79, 70, 229, 0.25) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
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
  gap: 24px;
  padding: 30px 50px;
`

const TimerSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`

const TimerIcon = styled.div<{ expired: boolean }>`
  font-size: 2rem;
  color: ${props => props.expired ? '#ef4444' : COLORS.purpleLight};
  ${props => props.expired ? `animation: ${pulseRed} 1s ease-in-out infinite;` : ''}
`

const TimerDisplay = styled.div<{ expired: boolean }>`
  font-size: 4rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  color: ${props => props.expired ? '#ef4444' : COLORS.goldLight};
  text-shadow: 0 0 20px ${props => props.expired ? 'rgba(239,68,68,0.6)' : 'rgba(251,191,36,0.5)'};
  letter-spacing: 0.05em;
  ${props => props.expired ? `animation: ${pulseRed} 1s ease-in-out infinite;` : ''}
`

const ProgressBar = styled.div`
  width: 300px;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
`

const ProgressFill = styled.div<{ expired: boolean }>`
  height: 100%;
  background: ${props => props.expired
    ? '#ef4444'
    : `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.gold})`};
  border-radius: 4px;
  transition: width 1s linear, background 0.5s ease;
`

const TimerLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${COLORS.textSecondary};
`

const RequirementsArea = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 900px;
`

const RequirementBlock = styled(motion.div)<{ color: string }>`
  width: 100%;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
  border: 3px solid ${props => props.color};
  border-radius: 24px;
  padding: 32px 40px;
  box-shadow: 0 0 40px ${props => props.color}44, 0 10px 40px rgba(0,0,0,0.3);
`

const BlockHeader = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 1.4rem;
  font-weight: 900;
  color: ${props => props.color};
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid ${props => props.color}66;
  text-shadow: 0 0 20px ${props => props.color}66;

  svg { font-size: 1.3rem; }
`

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Item = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 14px;
`

const ItemText = styled.span`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${COLORS.textPrimary};
  line-height: 1.6;
`

const ButtonRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  margin-top: 4px;
`

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 26px;
  font-size: 1.05rem;
  font-weight: 700;
  color: #a78bfa;
  background: transparent;
  border: 2px solid #a78bfa;
  border-radius: 50px;
  cursor: pointer;
  svg { font-size: 1.1rem; }
`

const ContinueButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 40px;
  font-size: 1.15rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.purple});
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(79, 70, 229, 0.5);
  margin-top: 4px;

  svg { font-size: 1.3rem; }
`
