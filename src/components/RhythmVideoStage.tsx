import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { GiMagicPortal, GiEnergyBreath } from 'react-icons/gi'
import { IoChevronForward, IoPlay, IoPause } from 'react-icons/io5'
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
  pink: '#ec4899',
  cyan: '#06b6d4',
}

interface RhythmVideoStageProps {
  onContinue: () => void
}

// 律动步骤
const RHYTHM_STEPS = [
  { action: '个位十位，换一换！', gesture: '双手交换', icon: '🙌', color: '#8b5cf6' },
  { action: '变成算式，算一算！', gesture: '双手计算', icon: '🧮', color: '#06b6d4' },
  { action: '1 和 3，凑成 4！', gesture: '伸出 1 和 3', icon: '☝️', color: '#f59e0b' },
  { action: '13 + 31 = 44！', gesture: '交叉换位，比 4', icon: '✌️', color: '#ec4899' },
  { action: '2 和 2，凑成 4！', gesture: '伸出 2 和 2', icon: '✌️', color: '#10b981' },
  { action: '22 + 22 = 44！', gesture: '交叉换位，比 4', icon: '🤝', color: '#ef4444' },
  { action: '能量充满，继续战！', gesture: '双手握拳加油', icon: '💪', color: '#f59e0b' },
]

export default function RhythmVideoStage({ onContinue }: RhythmVideoStageProps) {
  const [showIntro, setShowIntro] = useState(true)
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)

  // 播放控制
  useEffect(() => {
    if (!isPlaying) return
    if (currentStep >= RHYTHM_STEPS.length - 1) {
      // 播放完毕
      const timer = setTimeout(() => setIsPlaying(false), 1500)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => {
      setCurrentStep(currentStep + 1)
    }, 2000)
    return () => clearTimeout(timer)
  }, [isPlaying, currentStep])

  const handleStartRhythm = () => {
    playClick()
    setShowIntro(false)
    setCurrentStep(0)
    setIsPlaying(true)
  }

  const handleTogglePlay = () => {
    playClick()
    if (currentStep >= RHYTHM_STEPS.length - 1) {
      // 重新播放
      setCurrentStep(0)
    }
    setIsPlaying(!isPlaying)
  }

  const handleContinue = () => {
    playClick()
    onContinue()
  }

  return (
    <Container>
      <BackgroundGradient />
      
      {/* 粒子背景 */}
      <ParticleLayer>
        {Array.from({ length: 30 }).map((_, i) => (
          <Particle
            key={i}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              background: ['#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899'][i % 4]
            }}
          />
        ))}
      </ParticleLayer>

      <ContentWrapper>
        <AnimatePresence mode="wait">
          {/* 介绍页 - 密室守护者消息 */}
          {showIntro && (
            <IntroWrapper
              key="intro"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
            >
              <GuardianBadge>
                <GuardianIcon>
                  <GiMagicPortal />
                </GuardianIcon>
                <GuardianLabel>密室守护者</GuardianLabel>
              </GuardianBadge>

              <MessageBox
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', damping: 15 }}
              >
                <MessageLabel>
                  <HiSparkles /> 密室守护者发来消息 <HiSparkles />
                </MessageLabel>
                <MessageText>
                  "小侦探们辛苦了！前方还有终极彩蛋关，
                  <br />
                  先跟我一起做一套'侦探能量操'，充满电再出发！"
                </MessageText>
              </MessageBox>

              <EnergyTitle
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <GiEnergyBreath />
                侦探能量操
                <GiEnergyBreath />
              </EnergyTitle>

              <StartRhythmButton
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStartRhythm}
              >
                <IoPlay />
                <span>开始律动</span>
              </StartRhythmButton>
            </IntroWrapper>
          )}

          {/* 律动播放页 */}
          {!showIntro && (
            <RhythmWrapper
              key="rhythm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RhythmHeader>
                <RhythmTitle>
                  <GiEnergyBreath /> 侦探能量操 <GiEnergyBreath />
                </RhythmTitle>
                <ProgressIndicator>
                  {RHYTHM_STEPS.map((_, i) => (
                    <ProgressDot
                      key={i}
                      active={i <= currentStep}
                      done={i < currentStep}
                    />
                  ))}
                </ProgressIndicator>
              </RhythmHeader>

              <RhythmStage>
                {/* 当前动作展示 */}
                <AnimatePresence mode="wait">
                  {currentStep >= 0 && (
                    <ActionDisplay
                      key={currentStep}
                      initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      exit={{ opacity: 0, scale: 1.2, rotateY: 90 }}
                      transition={{ duration: 0.5, type: 'spring', damping: 15 }}
                    >
                      <ActionIcon
                        style={{ color: RHYTHM_STEPS[currentStep].color }}
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        {RHYTHM_STEPS[currentStep].icon}
                      </ActionIcon>
                      <ActionText>
                        {RHYTHM_STEPS[currentStep].action}
                      </ActionText>
                      <GestureHint>
                        （{RHYTHM_STEPS[currentStep].gesture}）
                      </GestureHint>
                    </ActionDisplay>
                  )}
                </AnimatePresence>

                {/* 能量环 */}
                <EnergyRing
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                />
              </RhythmStage>

              {/* 完整步骤列表 */}
              <StepsList>
                {RHYTHM_STEPS.map((step, i) => (
                  <StepItem
                    key={i}
                    active={i === currentStep}
                    done={i < currentStep}
                    color={step.color}
                  >
                    <StepIndex>{i + 1}</StepIndex>
                    <StepContent>
                      <StepAction>{step.action}</StepAction>
                      <StepGesture>{step.gesture}</StepGesture>
                    </StepContent>
                    <StepIcon>{step.icon}</StepIcon>
                  </StepItem>
                ))}
              </StepsList>

              {/* 控制按钮 */}
              <ControlBar>
                <PlayButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleTogglePlay}
                >
                  {isPlaying ? <IoPause /> : <IoPlay />}
                  {isPlaying ? '暂停' : (currentStep >= RHYTHM_STEPS.length - 1 ? '重播' : '继续')}
                </PlayButton>

                <ContinueButton
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleContinue}
                >
                  <span>进入终极彩蛋关</span>
                  <IoChevronForward />
                </ContinueButton>
              </ControlBar>
            </RhythmWrapper>
          )}
        </AnimatePresence>
      </ContentWrapper>
    </Container>
  )
}

const sparkleAnim = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.3); }
`

const energyPulse = keyframes`
  0%, 100% { 
    box-shadow: 0 0 40px rgba(139, 92, 246, 0.4), inset 0 0 30px rgba(139, 92, 246, 0.2); 
  }
  50% { 
    box-shadow: 0 0 80px rgba(139, 92, 246, 0.7), inset 0 0 50px rgba(139, 92, 246, 0.4); 
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
    radial-gradient(ellipse at center, rgba(139, 92, 246, 0.3) 0%, rgba(15, 23, 42, 1) 70%),
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
  border-radius: 50%;
  box-shadow: 0 0 15px currentColor;
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
  padding: 30px;
`

// 介绍页
const IntroWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  max-width: 800px;
`

const GuardianBadge = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`

const GuardianIcon = styled(motion.div)`
  font-size: 5rem;
  color: ${COLORS.purpleLight};
  filter: drop-shadow(0 0 30px ${COLORS.purple});
`

const GuardianLabel = styled.div`
  padding: 6px 18px;
  background: linear-gradient(135deg, ${COLORS.purple}, ${COLORS.primary});
  color: white;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: 0 5px 15px rgba(139, 92, 246, 0.5);
`

const MessageBox = styled(motion.div)`
  position: relative;
  padding: 30px 40px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
  border: 2px solid ${COLORS.purpleLight};
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(139, 92, 246, 0.4);
  
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 20px;
    height: 20px;
    background: rgba(30, 41, 59, 0.95);
    border-top: 2px solid ${COLORS.purpleLight};
    border-left: 2px solid ${COLORS.purpleLight};
  }
`

const MessageLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 700;
  color: ${COLORS.accentLight};
  margin-bottom: 12px;
`

const MessageText = styled.p`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${COLORS.textPrimary};
  margin: 0;
  line-height: 1.7;
  text-align: center;
`

const EnergyTitle = styled(motion.h1)`
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.accentLight} 50%, ${COLORS.gold} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 40px rgba(251, 191, 36, 0.6);
  margin: 0;
  
  svg {
    color: ${COLORS.accentLight};
    -webkit-text-fill-color: ${COLORS.accentLight};
    font-size: 2.5rem;
  }
`

const StartRhythmButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 40px;
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight});
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(251, 191, 36, 0.5);
  
  svg {
    font-size: 1.5rem;
  }
`

// 律动播放页
const RhythmWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 1100px;
  height: 100%;
`

const RhythmHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`

const RhythmTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(135deg, ${COLORS.goldLight}, ${COLORS.accentLight});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  
  svg {
    color: ${COLORS.accentLight};
    -webkit-text-fill-color: ${COLORS.accentLight};
    font-size: 1.8rem;
  }
`

const ProgressIndicator = styled.div`
  display: flex;
  gap: 8px;
`

const ProgressDot = styled.div<{ active: boolean; done: boolean }>`
  width: 30px;
  height: 6px;
  border-radius: 3px;
  background: ${props => 
    props.done ? COLORS.accentLight : 
    props.active ? COLORS.accent : 
    'rgba(148, 163, 184, 0.3)'};
  transition: background 0.3s ease;
`

const RhythmStage = styled.div`
  position: relative;
  width: 100%;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const EnergyRing = styled(motion.div)`
  position: absolute;
  width: 320px;
  height: 320px;
  border: 3px dashed ${COLORS.purpleLight};
  border-radius: 50%;
  animation: ${energyPulse} 2s ease-in-out infinite;
`

const ActionDisplay = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 2;
`

const ActionIcon = styled(motion.div)`
  font-size: 6rem;
  filter: drop-shadow(0 0 25px currentColor);
`

const ActionText = styled.div`
  font-size: 2rem;
  font-weight: 900;
  color: ${COLORS.textPrimary};
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
  text-align: center;
`

const GestureHint = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${COLORS.accentLight};
`

const StepsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  padding: 10px;
`

const StepItem = styled.div<{ active: boolean; done: boolean; color: string }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background: ${props => 
    props.active ? `linear-gradient(135deg, ${props.color}aa, ${props.color}66)` :
    props.done ? 'rgba(16, 185, 129, 0.2)' :
    'rgba(30, 41, 59, 0.8)'};
  border: 2px solid ${props => 
    props.active ? props.color :
    props.done ? '#10b981' :
    'rgba(148, 163, 184, 0.3)'};
  border-radius: 12px;
  transition: all 0.3s ease;
  transform: ${props => props.active ? 'scale(1.03)' : 'scale(1)'};
`

const StepIndex = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  font-size: 0.85rem;
  font-weight: 800;
  color: white;
  flex-shrink: 0;
`

const StepContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const StepAction = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${COLORS.textPrimary};
`

const StepGesture = styled.div`
  font-size: 0.75rem;
  color: ${COLORS.textSecondary};
`

const StepIcon = styled.div`
  font-size: 1.5rem;
  flex-shrink: 0;
`

const ControlBar = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`

const PlayButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleLight});
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 5px 20px rgba(139, 92, 246, 0.5);
  
  svg {
    font-size: 1.2rem;
  }
`

const ContinueButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 35px;
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight});
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(251, 191, 36, 0.5);
  
  svg {
    font-size: 1.3rem;
  }
`
