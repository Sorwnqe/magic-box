import { useEffect } from 'react'
import { motion } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { GiStoneBlock, GiMagicPortal, GiTreasureMap, GiTrophyCup } from 'react-icons/gi'
import { IoChevronForward } from 'react-icons/io5'
import { HiSparkles } from 'react-icons/hi2'
import { playClick } from '../hooks/useSound'

const COLORS = {
  primary: '#4f46e5',
  primaryLight: '#818cf8',
  primaryDark: '#3730a3',
  accent: '#f59e0b',
  accentLight: '#fbbf24',
  gold: '#fbbf24',
  goldLight: '#fde68a',
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  bgDark: '#0f172a',
  bgLight: '#1e293b',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
}

interface StageAnnounceProps {
  stageNumber: 1 | 2 | 3 | 4
  stageTitle: string
  challengeText: string
  onContinue: () => void
}

export default function StageAnnounce({ 
  stageNumber, 
  stageTitle,
  challengeText,
  onContinue 
}: StageAnnounceProps) {
  useEffect(() => {
    // 可以在这里播放开门音效
  }, [])

  const handleContinue = () => {
    playClick()
    onContinue()
  }

  const getIcon = () => {
    if (stageNumber === 4) return <GiTrophyCup />
    if (stageNumber === 3) return <GiTreasureMap />
    if (stageNumber === 1) return <GiMagicPortal />
    return <GiStoneBlock />
  }

  return (
    <Container>
      <BackgroundGradient />
      
      {/* 粒子背景 */}
      <ParticleLayer>
        {Array.from({ length: 20 }).map((_, i) => (
          <Particle
            key={i}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </ParticleLayer>

      <ContentWrapper>
        {/* 大门图标 */}
        <DoorScene
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: 'spring', damping: 15 }}
        >
          <DoorGlow />
          <DoorIcon>
            {getIcon()}
          </DoorIcon>
        </DoorScene>

        {/* 关卡标签 */}
        <StageLabel
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <HiSparkles />
          第 {stageNumber} 关
          <HiSparkles />
        </StageLabel>

        {/* 关卡标题 */}
        <StageTitle
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: 'spring', damping: 12 }}
        >
          {stageTitle}
        </StageTitle>

        {/* 挑战描述 */}
        <ChallengeBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <ChallengeLabel>
            <GiMagicPortal /> 密室挑战
          </ChallengeLabel>
          <ChallengeText>{challengeText}</ChallengeText>
        </ChallengeBox>

        {/* 继续按钮 */}
        <ContinueButton
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleContinue}
        >
          <span>继续探索</span>
          <IoChevronForward />
        </ContinueButton>
      </ContentWrapper>
    </Container>
  )
}

const sparkleAnim = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
`

const doorGlowPulse = keyframes`
  0%, 100% { 
    box-shadow: 0 0 60px rgba(251, 191, 36, 0.4), inset 0 0 40px rgba(251, 191, 36, 0.2);
  }
  50% { 
    box-shadow: 0 0 100px rgba(251, 191, 36, 0.7), inset 0 0 60px rgba(251, 191, 36, 0.4);
  }
`

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
    radial-gradient(ellipse at center, rgba(139, 92, 246, 0.25) 0%, rgba(15, 23, 42, 1) 70%),
    linear-gradient(135deg, ${COLORS.bgDark} 0%, ${COLORS.primaryDark} 50%, ${COLORS.bgDark} 100%);
`

const ParticleLayer = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
`

const Particle = styled.div`
  position: absolute;
  width: 6px;
  height: 6px;
  background: ${COLORS.purpleLight};
  border-radius: 50%;
  box-shadow: 0 0 15px ${COLORS.purple};
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
  gap: 25px;
  padding: 40px;
`

const DoorScene = styled(motion.div)`
  position: relative;
  width: 200px;
  height: 260px;
  background: linear-gradient(180deg, #475569 0%, #334155 50%, #1e293b 100%);
  border: 6px solid #64748b;
  border-radius: 100px 100px 10px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${doorGlowPulse} 2.5s ease-in-out infinite;
`

const DoorGlow = styled.div`
  position: absolute;
  inset: 10px;
  background: radial-gradient(circle at center, rgba(251, 191, 36, 0.3), transparent 70%);
  border-radius: 90px 90px 5px 5px;
`

const DoorIcon = styled.div`
  font-size: 6rem;
  color: ${COLORS.accentLight};
  filter: drop-shadow(0 0 20px ${COLORS.accent});
  z-index: 1;
`

const StageLabel = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 24px;
  background: linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight});
  color: white;
  border-radius: 25px;
  font-size: 1.3rem;
  font-weight: 900;
  box-shadow: 0 5px 20px rgba(251, 191, 36, 0.5);
  
  svg {
    font-size: 1.3rem;
  }
`

const StageTitle = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.accentLight} 50%, ${COLORS.gold} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 40px rgba(251, 191, 36, 0.6);
  margin: 0;
  letter-spacing: 0.15em;
`

const ChallengeBox = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 25px 40px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
  border: 2px solid ${COLORS.purpleLight};
  border-radius: 20px;
  box-shadow: 0 15px 50px rgba(139, 92, 246, 0.4), inset 0 0 30px rgba(139, 92, 246, 0.1);
  max-width: 750px;
`

const ChallengeLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${COLORS.accentLight};
  
  svg {
    font-size: 1.5rem;
  }
`

const ChallengeText = styled.p`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${COLORS.textPrimary};
  margin: 0;
  line-height: 1.7;
`

const ContinueButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 40px;
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.purple});
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(79, 70, 229, 0.5);
  margin-top: 10px;
  
  svg {
    font-size: 1.4rem;
  }
`
