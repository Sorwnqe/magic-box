import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { playSuccess } from '../hooks/useSound'
import { IoTrophy, IoStar } from 'react-icons/io5'
import { GiPartyPopper, GiTreasureMap, GiCrown, GiKey } from 'react-icons/gi'
import { HiSparkles } from 'react-icons/hi2'

const COLORS = {
  primary: '#4f46e5',
  primaryLight: '#818cf8',
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  gold: '#fbbf24',
  goldLight: '#fde68a',
  accent: '#f59e0b',
  accentLight: '#fbbf24',
  success: '#22c55e',
  bgDark: '#0f172a',
  bgLight: '#1e293b',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
}

interface MagicEndingProps {
  onRestart: () => void
}

type EndingPhase = 'celebration' | 'preview'

// 成就展示内容
const ACHIEVEMENTS = [
  { icon: '🔓', title: '密室解锁', desc: '成功破解所有关卡' },
  { icon: '🧮', title: '数字大师', desc: '掌握反转数的秘密' },
  { icon: '👑', title: '王牌侦探', desc: '获得最高荣誉勋章' },
]

export default function MagicEnding({ onRestart }: MagicEndingProps) {
  const [phase, setPhase] = useState<EndingPhase>('celebration')
  const [showAchievements, setShowAchievements] = useState(false)

  // 播放成功音效
  useEffect(() => {
    playSuccess()
    // 延迟显示成就
    const timer = setTimeout(() => setShowAchievements(true), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleContinue = () => {
    setPhase('preview')
  }

  return (
    <Container>
      {/* 密室背景 */}
      <BackgroundGradient />
      
      {/* 粒子效果 */}
      <ParticleLayer>
        {Array.from({ length: 40 }).map((_, i) => (
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

      {/* 彩带效果 */}
      <ConfettiLayer>
        {Array.from({ length: 30 }).map((_, i) => (
          <Confetti
            key={i}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: [COLORS.primary, COLORS.success, COLORS.gold, COLORS.accent, COLORS.purple][i % 5]
            }}
          />
        ))}
      </ConfettiLayer>

      <ContentWrapper>
        <AnimatePresence mode="wait">
          {/* 庆祝阶段 */}
          {phase === 'celebration' && (
            <CelebrationPhase
              key="celebration"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 顶部标题 */}
              <CelebrationTitle
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 12 }}
              >
                <GiPartyPopper /> 密室通关成功！ <GiPartyPopper />
              </CelebrationTitle>

              {/* 中间主内容 */}
              <MainCelebration>
                {/* 大奖杯 */}
                <TrophySection>
                  <TrophyGlow />
                  <TrophyIcon
                    animate={{ 
                      rotate: [0, 5, -5, 0], 
                      scale: [1, 1.1, 1],
                      y: [0, -10, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <IoTrophy />
                  </TrophyIcon>
                  <MedalBadge
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: 'spring', damping: 10 }}
                  >
                    <GiCrown />
                    <span>王牌侦探</span>
                  </MedalBadge>
                </TrophySection>

                {/* 成就展示 */}
                <AnimatePresence>
                  {showAchievements && (
                    <AchievementsGrid>
                      {ACHIEVEMENTS.map((achievement, i) => (
                        <AchievementCard
                          key={i}
                          initial={{ opacity: 0, y: 30, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: i * 0.2 + 0.3, type: 'spring' }}
                        >
                          <AchievementIcon>{achievement.icon}</AchievementIcon>
                          <AchievementTitle>{achievement.title}</AchievementTitle>
                          <AchievementDesc>{achievement.desc}</AchievementDesc>
                        </AchievementCard>
                      ))}
                    </AchievementsGrid>
                  )}
                </AnimatePresence>
              </MainCelebration>

              {/* 底部消息和按钮 */}
              <CelebrationFooter>
                <CelebrationMessage
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <HiSparkles /> 恭喜你破解了数字密室的所有谜题！ <HiSparkles />
                </CelebrationMessage>

                <NextButton
                  onClick={handleContinue}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>继续</span>
                  <IoStar />
                </NextButton>
              </CelebrationFooter>
            </CelebrationPhase>
          )}

          {/* 预告阶段 */}
          {phase === 'preview' && (
            <PreviewPhase
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 装饰钥匙 */}
              <DecorKeyLeft
                initial={{ x: -100, opacity: 0, rotate: -30 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <GiKey />
              </DecorKeyLeft>

              <DecorKeyRight
                initial={{ x: 100, opacity: 0, rotate: 30 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <GiTreasureMap />
              </DecorKeyRight>

              <PreviewCard
                initial={{ scale: 0.8, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 12 }}
              >
                <PreviewTitle>
                  🌟 更多密室谜题等你来挑战！
                </PreviewTitle>

                <PreviewText>敬请期待...</PreviewText>

                <RestartButton
                  onClick={onRestart}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🔄 再来一次
                </RestartButton>
              </PreviewCard>
            </PreviewPhase>
          )}
        </AnimatePresence>
      </ContentWrapper>
    </Container>
  )
}

// ========== Styled Components ==========

const sparkleAnim = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
`

const confettiFall = keyframes`
  0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0.5; }
`

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`

const Container = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`

const BackgroundGradient = styled.div`
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.4) 0%, transparent 50%),
    radial-gradient(ellipse at center bottom, rgba(251, 191, 36, 0.3) 0%, transparent 50%),
    linear-gradient(135deg, ${COLORS.bgDark} 0%, #1e1b4b 50%, ${COLORS.bgDark} 100%);
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
  background: ${COLORS.goldLight};
  border-radius: 50%;
  box-shadow: 0 0 15px ${COLORS.gold};
  animation: ${sparkleAnim} 3s ease-in-out infinite;
`

const ConfettiLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
`

const Confetti = styled.div`
  position: absolute;
  width: 10px;
  height: 25px;
  border-radius: 3px;
  animation: ${confettiFall} 4s linear infinite;
`

const ContentWrapper = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

// ========== 庆祝阶段 ==========

const CelebrationPhase = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 25px;
  padding: 30px;
  width: 100%;
  height: 100%;
`

const CelebrationTitle = styled(motion.h1)`
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 0;
  
  svg {
    color: ${COLORS.gold};
    -webkit-text-fill-color: ${COLORS.gold};
    filter: drop-shadow(0 0 10px ${COLORS.gold});
  }
`

const MainCelebration = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`

const TrophySection = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`

const TrophyGlow = styled.div`
  position: absolute;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%);
  animation: ${sparkleAnim} 2s ease-in-out infinite;
`

const TrophyIcon = styled(motion.div)`
  font-size: 7rem;
  color: ${COLORS.gold};
  filter: drop-shadow(0 10px 30px rgba(251, 191, 36, 0.6));
  position: relative;
  z-index: 2;
`

const MedalBadge = styled(motion.div)`
  position: absolute;
  top: -5px;
  right: -30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 12px;
  background: linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight});
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 5px 20px rgba(251, 191, 36, 0.6);
  z-index: 3;
  
  svg {
    font-size: 1.3rem;
    color: white;
  }
  
  span {
    font-size: 0.55rem;
    font-weight: 900;
    color: white;
    white-space: nowrap;
  }
`

const AchievementsGrid = styled(motion.div)`
  display: flex;
  gap: 20px;
`

const AchievementCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
  border: 2px solid ${COLORS.purpleLight};
  border-radius: 16px;
  padding: 20px 25px;
  text-align: center;
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.3);
  min-width: 140px;
`

const AchievementIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 8px;
`

const AchievementTitle = styled.div`
  font-size: 1rem;
  font-weight: 800;
  color: ${COLORS.goldLight};
  margin-bottom: 4px;
`

const AchievementDesc = styled.div`
  font-size: 0.8rem;
  color: ${COLORS.purpleLight};
`

const CelebrationFooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`

const CelebrationMessage = styled(motion.p)`
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  
  svg {
    color: ${COLORS.goldLight};
  }
`

const NextButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 40px;
  background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.purple} 100%);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.5);
`

// ========== 预告阶段 ==========

const PreviewPhase = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const DecorKeyLeft = styled(motion.div)`
  position: absolute;
  left: 10%;
  bottom: 20%;
  font-size: 5rem;
  color: ${COLORS.goldLight};
  filter: drop-shadow(0 5px 15px rgba(251, 191, 36, 0.5));
  animation: ${floatAnimation} 3s ease-in-out infinite;
`

const DecorKeyRight = styled(motion.div)`
  position: absolute;
  right: 10%;
  bottom: 20%;
  font-size: 5rem;
  color: ${COLORS.purpleLight};
  filter: drop-shadow(0 5px 15px rgba(139, 92, 246, 0.5));
  animation: ${floatAnimation} 3s ease-in-out infinite;
  animation-delay: 0.5s;
`

const PreviewCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98));
  border: 2px solid ${COLORS.purpleLight};
  border-radius: 30px;
  padding: 40px 80px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  text-align: center;
  z-index: 10;
  max-width: 600px;
`

const PreviewTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 12px;
  background: linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const PreviewText = styled.p`
  font-size: 1.2rem;
  color: ${COLORS.purpleLight};
  margin-bottom: 25px;
`

const RestartButton = styled(motion.button)`
  padding: 15px 40px;
  background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.purple} 100%);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.5);
`
