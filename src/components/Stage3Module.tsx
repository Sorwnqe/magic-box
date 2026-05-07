import { motion } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { IoChevronForward, IoChevronBack } from 'react-icons/io5'
import { GiMagicSwirl } from 'react-icons/gi'
import { playClick } from '../hooks/useSound'
import MysticBackground from './MysticBackground'

const COLORS = {
  primary: '#4f46e5',
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  gold: '#fbbf24',
  goldLight: '#fde68a',
  accent: '#f59e0b',
  bgDark: '#0f172a',
  textPrimary: '#f8fafc',
}

interface Stage3ModuleProps {
  targetSum?: 44 | 99   // 不传则只显示标题
  title?: string
  tagLabel?: string
  onContinue: () => void
  onBack?: () => void
}

export default function Stage3Module({ targetSum, onContinue, onBack }: Stage3ModuleProps) {
  const handleContinue = () => {
    playClick()
    onContinue()
  }

  // const displayTitle = title ?? '算式创造关'
  // const displayTagLabel = tagLabel ?? displayTitle

  return (
    <Container>
      <MysticBackground />
      <BackgroundGradient />

      <ParticleLayer>
        {Array.from({ length: 20 }).map((_, i) => (
          <Particle
            key={i}
            style={{
              left: `${(i * 17 + 7) % 100}%`,
              top: `${(i * 23 + 11) % 100}%`,
              animationDelay: `${(i * 0.3) % 3}s`,
            }}
          />
        ))}
      </ParticleLayer>

      <ContentWrapper>


        {targetSum !== undefined && (
          <ChallengeCard
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ChallengeIcon>
              <GiMagicSwirl />
            </ChallengeIcon>
            <ChallengeMain>
              写出和为 <SumHighlight>{targetSum}</SumHighlight> 的<YellowHighlight>有趣算式</YellowHighlight>
            </ChallengeMain>
          </ChallengeCard>
        )}

        <ButtonRow>
          {onBack && (
            <BackButton
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
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
            transition={{ delay: 1.0 }}
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

const sparkleAnim = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
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
    radial-gradient(ellipse at 30% 40%, rgba(79, 70, 229, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 60%, rgba(251, 191, 36, 0.2) 0%, transparent 50%),
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
  padding: 40px;
`

const ChallengeCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 72px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.97), rgba(15, 23, 42, 0.97));
  border: 2px solid ${COLORS.purpleLight};
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(139, 92, 246, 0.4), inset 0 0 30px rgba(139, 92, 246, 0.08);
  max-width: 700px;
`

const ChallengeIcon = styled.div`
  font-size: 4rem;
  color: ${COLORS.gold};
  filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.6));
`

const ChallengeMain = styled.div`
  font-size: 2.4rem;
  font-weight: 800;
  color: ${COLORS.textPrimary};
  text-align: center;
  line-height: 1.4;
`

const SumHighlight = styled.span`
  font-size: 3.2rem;
  font-weight: 900;
  color: ${COLORS.gold};
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.6);
  padding: 0 6px;
`

const YellowHighlight = styled.span`
  background: linear-gradient(180deg, transparent 60%, rgba(251, 191, 36, 0.35) 60%);
  padding: 0 4px;
  border-radius: 4px;
`

const ButtonRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  margin-top: 8px;
`

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #a78bfa;
  background: transparent;
  border: 2px solid #a78bfa;
  border-radius: 50px;
  cursor: pointer;
  svg { font-size: 1.2rem; }
`

const ContinueButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 44px;
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.purple});
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(79, 70, 229, 0.5);
  margin-top: 8px;
  svg { font-size: 1.4rem; }
`
