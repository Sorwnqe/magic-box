import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { GiTreasureMap, GiCrown, GiTrophyCup } from 'react-icons/gi'
import { IoChevronForward } from 'react-icons/io5'
import { HiSparkles } from 'react-icons/hi2'
import { playSuccess, playClick } from '../hooks/useSound'
import MysticBackground from './MysticBackground'

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
  red: '#ef4444',
}

interface FormulaShowcaseProps {
  onContinue: () => void
}

const FORMULAS_99 = [
  { a: 18, b: 81, result: 99 },
  { a: 27, b: 72, result: 99 },
  { a: 36, b: 63, result: 99 },
  { a: 45, b: 54, result: 99 },
]

const PARTICLE_POSITIONS = [
  { left: 12, top: 8, delay: 0 }, { left: 45, top: 15, delay: 0.5 }, { left: 78, top: 5, delay: 1 },
  { left: 25, top: 35, delay: 1.5 }, { left: 65, top: 28, delay: 2 }, { left: 90, top: 42, delay: 0.3 },
  { left: 5, top: 55, delay: 0.8 }, { left: 38, top: 62, delay: 1.3 }, { left: 72, top: 58, delay: 1.8 },
  { left: 15, top: 78, delay: 2.3 }, { left: 55, top: 85, delay: 0.2 }, { left: 88, top: 75, delay: 0.7 },
  { left: 30, top: 22, delay: 1.2 }, { left: 60, top: 45, delay: 1.7 }, { left: 82, top: 30, delay: 2.2 },
  { left: 8, top: 42, delay: 2.5 }, { left: 48, top: 72, delay: 0.4 }, { left: 75, top: 88, delay: 0.9 },
  { left: 20, top: 92, delay: 1.4 }, { left: 52, top: 10, delay: 1.9 }, { left: 95, top: 65, delay: 2.4 },
  { left: 35, top: 50, delay: 0.1 }, { left: 68, top: 18, delay: 0.6 }, { left: 3, top: 68, delay: 1.1 },
  { left: 42, top: 38, delay: 1.6 }, { left: 80, top: 52, delay: 2.1 }, { left: 18, top: 25, delay: 2.6 },
  { left: 58, top: 80, delay: 0.35 }, { left: 85, top: 12, delay: 0.85 }, { left: 10, top: 48, delay: 1.35 },
]

export default function FormulaShowcase({ onContinue }: FormulaShowcaseProps) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [showChest, setShowChest] = useState(false)

  useEffect(() => {
    // 依次显示算式
    const timers: ReturnType<typeof setTimeout>[] = []
    FORMULAS_99.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleCount(i + 1), 600 + i * 700))
    })
    // 全部显示后展示宝箱
    timers.push(setTimeout(() => {
      setShowChest(true)
      playSuccess()
    }, 600 + FORMULAS_99.length * 700 + 400))
    
    return () => timers.forEach(clearTimeout)
  }, [])

  const handleContinue = () => {
    playClick()
    onContinue()
  }

  return (
    <Container>
      <MysticBackground />
      <BackgroundGradient />
      
      {/* 粒子背景 */}
      <ParticleLayer>
        {PARTICLE_POSITIONS.map((p, i) => (
          <Particle
            key={i}
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </ParticleLayer>

      <ContentWrapper>
        {/* 左侧：标题 + 算式竖向排列 */}
        <LeftSection>
          <Title
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <HiSparkles /> 和为99的<YellowHighlight>有趣算式</YellowHighlight> <HiSparkles />
          </Title>

          <FormulasContainer>
            {FORMULAS_99.map((formula, i) => (
              <AnimatePresence key={i}>
                {i < visibleCount && (
                  <FormulaRow
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                  >
                    <Num>{formula.a}</Num>
                    <Op>+</Op>
                    <Num>{formula.b}</Num>
                    <Op>=</Op>
                    <ResultBox>{formula.result}</ResultBox>
                  </FormulaRow>
                )}
              </AnimatePresence>
            ))}
          </FormulasContainer>
        </LeftSection>

        {/* 右侧：宝箱和勋章 */}
        <AnimatePresence>
          {showChest && (
            <RightSection
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: 'spring', damping: 15 }}
            >
              <TreasureChestContainer>
                <TreasureLight />
                <ChestIcon
                  animate={{
                    y: [0, -8, 0],
                    rotate: [-2, 2, -2]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <GiTrophyCup />
                </ChestIcon>
                <MedalBadge
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: 'spring', damping: 10 }}
                >
                  <GiCrown />
                  <MedalText>王牌侦探</MedalText>
                </MedalBadge>
              </TreasureChestContainer>

              <SuccessMessage
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <SuccessLabel>
                  <GiTreasureMap /> 密室解锁
                </SuccessLabel>
                <SuccessText>
                  叮——！第三关解锁成功！<br />
                  恭喜你们，获得了"王牌侦探"勋章！
                </SuccessText>
              </SuccessMessage>

              <ContinueButton
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleContinue}
              >
                <span>继续探索</span>
                <IoChevronForward />
              </ContinueButton>
            </RightSection>
          )}
        </AnimatePresence>
      </ContentWrapper>
    </Container>
  )
}

const sparkleAnim = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.3); }
`

const lightRotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
    radial-gradient(ellipse at center, rgba(251, 191, 36, 0.2) 0%, rgba(15, 23, 42, 1) 70%),
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
  background: ${COLORS.goldLight};
  border-radius: 50%;
  box-shadow: 0 0 15px ${COLORS.gold};
  animation: ${sparkleAnim} 3s ease-in-out infinite;
`

const ContentWrapper = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 60px;
  padding: 40px 60px;
`

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`

const RightSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`

const Title = styled(motion.h1)`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.accentLight} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 5px 0;
  
  svg {
    font-size: 1.3rem;
    color: ${COLORS.accentLight};
    -webkit-text-fill-color: ${COLORS.accentLight};
    filter: drop-shadow(0 0 8px ${COLORS.gold});
  }
`

const FormulasContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const FormulaRow = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 32px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9));
  border: 2px solid ${COLORS.purpleLight};
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
  font-size: 1.8rem;
  font-weight: 800;
`

const Num = styled.span`
  color: ${COLORS.red};
  min-width: 35px;
  text-align: center;
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
`

const Op = styled.span`
  color: ${COLORS.textSecondary};
  min-width: 20px;
  text-align: center;
`

const ResultBox = styled.span`
  min-width: 50px;
  padding: 4px 12px;
  background: linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight});
  color: white;
  border-radius: 8px;
  text-align: center;
  text-shadow: 0 2px 5px rgba(0,0,0,0.3);
  box-shadow: 0 0 20px ${COLORS.gold};
`

const TreasureChestContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 120px;
`

const TreasureLight = styled.div`
  position: absolute;
  width: 160px;
  height: 160px;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(251, 191, 36, 0.3) 45deg,
    transparent 90deg,
    rgba(251, 191, 36, 0.3) 135deg,
    transparent 180deg,
    rgba(251, 191, 36, 0.3) 225deg,
    transparent 270deg,
    rgba(251, 191, 36, 0.3) 315deg,
    transparent 360deg
  );
  animation: ${lightRotate} 8s linear infinite;
`

const ChestIcon = styled(motion.div)`
  position: relative;
  font-size: 4.5rem;
  color: ${COLORS.accentLight};
  filter: drop-shadow(0 0 15px ${COLORS.gold});
  z-index: 2;
`

const MedalBadge = styled(motion.div)`
  position: absolute;
  top: 0;
  right: -12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  background: linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight});
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 3px 12px rgba(251, 191, 36, 0.6);
  z-index: 3;
  
  svg {
    font-size: 1rem;
    color: white;
  }
`

const MedalText = styled.div`
  font-size: 0.5rem;
  font-weight: 900;
  color: white;
  white-space: nowrap;
`

const SuccessMessage = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
  border: 2px solid ${COLORS.accentLight};
  border-radius: 14px;
  box-shadow: 0 6px 25px rgba(251, 191, 36, 0.3);
`

const SuccessLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${COLORS.accentLight};
`

const SuccessText = styled.p`
  font-size: 1rem;
  font-weight: 700;
  color: ${COLORS.textPrimary};
  margin: 0;
  line-height: 1.5;
  text-align: center;
`

const YellowHighlight = styled.span`
  background: linear-gradient(180deg, transparent 60%, rgba(251, 191, 36, 0.35) 60%);
  padding: 0 4px;
  border-radius: 4px;
`

const ContinueButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 30px;
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.purple});
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.5);
  
  svg {
    font-size: 1.2rem;
  }
`
