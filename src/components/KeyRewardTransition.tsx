import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { GiKey, GiTreasureMap, GiStoneBlock } from 'react-icons/gi'
import { HiSparkles } from 'react-icons/hi2'
import { IoChevronForward } from 'react-icons/io5'
import { playSuccess, playClick } from '../hooks/useSound'

// 密室主题配色
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

interface KeyRewardTransitionProps {
  keyNumber: 1 | 2 | 3
  hintText?: string
  floatingFormulas?: string[]
  onContinue: () => void
}

export default function KeyRewardTransition({ 
  keyNumber, 
  hintText,
  floatingFormulas = [],
  onContinue 
}: KeyRewardTransitionProps) {
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    playSuccess()
    // 1.5秒后显示提示文字
    if (hintText) {
      const timer = setTimeout(() => setShowHint(true), 1800)
      return () => clearTimeout(timer)
    }
  }, [hintText])

  const handleContinue = () => {
    playClick()
    onContinue()
  }

  return (
    <Container>
      <BackgroundGradient />
      
      {/* 粒子背景 */}
      <ParticleLayer>
        {Array.from({ length: 25 }).map((_, i) => (
          <Sparkle
            key={i}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </ParticleLayer>

      {/* 光芒背景 */}
      <LightBurst
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      />

      <ContentWrapper>
        {/* 石门场景 */}
        <SceneContainer>
          {/* 石门 */}
          <StoneDoor
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring', damping: 15 }}
          >
            <DoorIcon>
              <GiStoneBlock />
            </DoorIcon>
            <PasswordLock>
              {[keyNumber === 1 ? '?' : keyNumber === 2 ? '4' : '9', 
                keyNumber === 1 ? '?' : keyNumber === 2 ? '4' : '9'].map((n, i) => (
                <LockDigit
                  key={i}
                  animate={{ 
                    textShadow: [
                      `0 0 10px ${COLORS.accent}`,
                      `0 0 25px ${COLORS.accent}`,
                      `0 0 10px ${COLORS.accent}`
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                >
                  {n}
                </LockDigit>
              ))}
            </PasswordLock>
            <DoorCrack />
          </StoneDoor>

          {/* 金色钥匙 - 从门中飞出 */}
          <KeyContainer
            initial={{ scale: 0, y: 0, rotate: -180 }}
            animate={{ 
              scale: 1, 
              y: -20, 
              rotate: 0 
            }}
            transition={{ 
              duration: 1.2, 
              delay: 0.5,
              type: 'spring', 
              damping: 10 
            }}
          >
            <KeyFloat
              animate={{ 
                y: [0, -15, 0],
                rotate: [-5, 5, -5]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <KeyNumber>{keyNumber}</KeyNumber>
              <KeyIcon>
                <GiKey />
              </KeyIcon>
              <KeyGlow />
            </KeyFloat>
          </KeyContainer>

          {/* 漂浮的算式卡片 */}
          {floatingFormulas.map((formula, i) => (
            <FloatingFormula
              key={i}
              style={{
                left: `${15 + (i % 2) * 70}%`,
                top: `${20 + Math.floor(i / 2) * 50}%`
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: [0, 1, 1, 0.7],
                scale: 1,
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 4,
                delay: 1 + i * 0.3,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            >
              <HiSparkles style={{ color: COLORS.accentLight, marginRight: 6 }} />
              {formula}
            </FloatingFormula>
          ))}

          {/* 侦探角色 - 举手庆祝 */}
          <DetectiveContainer
            initial={{ scale: 0, x: -100 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: 1.2, type: 'spring', damping: 12 }}
          >
            <DetectiveBody>
              <DetectiveHat>🎩</DetectiveHat>
              <DetectiveFace>
                <Eye />
                <Eye />
                <Mouth />
              </DetectiveFace>
              <DetectiveArm position="left"
                animate={{ rotate: [-10, 10, -10] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ✋
              </DetectiveArm>
              <DetectiveArm position="right"
                animate={{ rotate: [10, -10, 10] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🖐️
              </DetectiveArm>
              <DetectiveLabel>小侦探</DetectiveLabel>
            </DetectiveBody>
          </DetectiveContainer>
        </SceneContainer>

        {/* 庆祝标题 */}
        <CelebrationTitle
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, type: 'spring', damping: 15 }}
        >
          <TitleStar><HiSparkles /></TitleStar>
          {keyNumber === 1 ? '获得第一把钥匙！' :
           keyNumber === 2 ? '获得第二把钥匙！' :
           '获得王牌侦探勋章！'}
          <TitleStar><HiSparkles /></TitleStar>
        </CelebrationTitle>

        {/* 密室传来的新提示 */}
        <AnimatePresence>
          {showHint && hintText && (
            <HintBox
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: 'spring', damping: 18 }}
            >
              <HintLabel>
                <GiTreasureMap /> 密室传来新提示
              </HintLabel>
              <HintText>{hintText}</HintText>
            </HintBox>
          )}
        </AnimatePresence>

        {/* 继续按钮 */}
        <ContinueButton
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hintText ? 2.5 : 1.5 }}
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

// 动画
const sparkleAnim = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.3) rotate(180deg); }
`

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 30px ${COLORS.accent}, 0 0 60px ${COLORS.accentLight}; }
  50% { box-shadow: 0 0 50px ${COLORS.accent}, 0 0 100px ${COLORS.accentLight}; }
`

// Styled Components
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

const Sparkle = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background: ${COLORS.goldLight};
  border-radius: 50%;
  box-shadow: 0 0 15px ${COLORS.gold};
  animation: ${sparkleAnim} 3s ease-in-out infinite;
`

const LightBurst = styled(motion.div)`
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 60%);
  pointer-events: none;
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
  gap: 20px;
  padding: 40px;
`

const SceneContainer = styled.div`
  position: relative;
  width: 700px;
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const StoneDoor = styled(motion.div)`
  position: relative;
  width: 260px;
  height: 340px;
  background: linear-gradient(180deg, #475569 0%, #334155 50%, #1e293b 100%);
  border: 6px solid #64748b;
  border-radius: 130px 130px 10px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  box-shadow: 
    inset 0 0 40px rgba(0,0,0,0.6),
    0 0 40px rgba(139, 92, 246, 0.4);
`

const DoorIcon = styled.div`
  font-size: 4rem;
  color: ${COLORS.accentLight};
  filter: drop-shadow(0 0 15px ${COLORS.accent});
`

const PasswordLock = styled.div`
  display: flex;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(0,0,0,0.5);
  border: 2px solid ${COLORS.gold};
  border-radius: 12px;
`

const LockDigit = styled(motion.span)`
  font-size: 2rem;
  font-weight: 900;
  color: ${COLORS.accentLight};
  min-width: 30px;
  text-align: center;
`

const DoorCrack = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 100%;
  background: linear-gradient(to bottom, 
    transparent 0%, 
    rgba(251, 191, 36, 0.6) 50%, 
    transparent 100%);
`

const KeyContainer = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
`

const KeyFloat = styled(motion.div)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const KeyIcon = styled.div`
  font-size: 6rem;
  color: ${COLORS.accentLight};
  filter: drop-shadow(0 0 25px ${COLORS.gold});
`

const KeyNumber = styled.div`
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight});
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 900;
  box-shadow: 0 0 20px ${COLORS.gold};
  border: 3px solid white;
  z-index: 2;
`

const KeyGlow = styled.div`
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.5), transparent 70%);
  border-radius: 50%;
  animation: ${glowPulse} 2s ease-in-out infinite;
  z-index: -1;
`

const FloatingFormula = styled(motion.div)`
  position: absolute;
  display: flex;
  align-items: center;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid ${COLORS.accent};
  border-radius: 12px;
  font-size: 1.3rem;
  font-weight: 700;
  color: ${COLORS.primaryDark};
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
`

const DetectiveContainer = styled(motion.div)`
  position: absolute;
  bottom: 0;
  right: 5%;
`

const DetectiveBody = styled.div`
  position: relative;
  width: 100px;
  height: 140px;
  background: linear-gradient(180deg, #f97316 0%, #ea580c 100%);
  border-radius: 50px 50px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 15px;
`

const DetectiveHat = styled.div`
  position: absolute;
  top: -35px;
  font-size: 3rem;
`

const DetectiveFace = styled.div`
  width: 60px;
  height: 50px;
  background: #fdba74;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
`

const Eye = styled.div`
  width: 6px;
  height: 6px;
  background: #1e293b;
  border-radius: 50%;
`

const Mouth = styled.div`
  position: absolute;
  bottom: 10px;
  width: 20px;
  height: 10px;
  border: 2px solid #1e293b;
  border-top: none;
  border-radius: 0 0 20px 20px;
`

const DetectiveArm = styled(motion.div)<{ position: 'left' | 'right' }>`
  position: absolute;
  top: 40px;
  ${props => props.position === 'left' ? 'left: -20px' : 'right: -20px'};
  font-size: 2rem;
`

const DetectiveLabel = styled.div`
  margin-top: 10px;
  padding: 3px 10px;
  background: white;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  color: ${COLORS.primaryDark};
`

const CelebrationTitle = styled(motion.h1)`
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.accentLight} 50%, ${COLORS.gold} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(251, 191, 36, 0.5);
  margin: 0;
`

const TitleStar = styled.span`
  font-size: 2rem;
  color: ${COLORS.accentLight};
  filter: drop-shadow(0 0 10px ${COLORS.gold});
`

const HintBox = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 35px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
  border: 2px solid ${COLORS.purpleLight};
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(139, 92, 246, 0.4);
  max-width: 700px;
`

const HintLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 700;
  color: ${COLORS.accentLight};
`

const HintText = styled.p`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${COLORS.textPrimary};
  margin: 0;
  line-height: 1.6;
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
  
  svg {
    font-size: 1.4rem;
  }
`
