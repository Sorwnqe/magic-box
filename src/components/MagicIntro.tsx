import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { IoRocketSharp } from 'react-icons/io5'
import { GiMagicSwirl } from 'react-icons/gi'
import { TbNumbers, TbDoorEnter } from 'react-icons/tb'

// 数字密室主题配色
const COLORS = {
  primary: '#4f46e5',
  primaryLight: '#818cf8',
  primaryDark: '#3730a3',
  accent: '#f59e0b',
  accentLight: '#fbbf24',
  success: '#10b981',
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  bgDark: '#0f172a',
  bgLight: '#1e293b',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
}

// 算式数据 - 左边加法，右边减法
const equations = {
  addition: [
    { a: 11, b: 11, result: 22 },
    { a: 12, b: 21, result: 33 },
    { a: 13, b: 31, result: 44 },
    { a: 14, b: 41, result: 55 },
    { a: 15, b: 51, result: 66 },
    { a: 16, b: 61, result: 77 },
    { a: 17, b: 71, result: 88 },
    { a: 18, b: 81, result: 99 },
  ],
  subtraction: [
    { a: 22, b: 11, result: 11 },
    { a: 33, b: 21, result: 12 },
    { a: 44, b: 31, result: 13 },
    { a: 55, b: 41, result: 14 },
    { a: 66, b: 51, result: 15 },
    { a: 77, b: 61, result: 16 },
    { a: 88, b: 71, result: 17 },
    { a: 99, b: 81, result: 18 },
  ]
}

interface MagicIntroProps {
  onComplete: () => void
}

export default function MagicIntro({ onComplete }: MagicIntroProps) {
  const [phase, setPhase] = useState<'door-closed' | 'door-opening' | 'equations-scroll' | 'ready'>('door-closed')
  
  // 自动推进阶段
  useEffect(() => {
    if (phase === 'door-closed') {
      const timer = setTimeout(() => setPhase('door-opening'), 1500)
      return () => clearTimeout(timer)
    } else if (phase === 'door-opening') {
      const timer = setTimeout(() => setPhase('ready'), 1800)
      return () => clearTimeout(timer)
    }
  }, [phase])

  // 随机粒子位置 - 使用 useMemo 避免重新渲染
  const particles = useMemo(() => 
    Array.from({ length: 30 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${3 + Math.random() * 4}s`
    })), [])

  return (
    <Container>
      <BackgroundGradient />
      <FloatingParticles>
        {particles.map((p, i) => (
          <Particle
            key={i}
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration
            }}
          />
        ))}
      </FloatingParticles>
      
      <ContentWrapper>
        <AnimatePresence mode="wait">
          {/* 画面1: 门关闭 */}
          {phase === 'door-closed' && (
            <DoorScene key="door-closed">
              <DoorFrame
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <LeftDoor />
                <RightDoor />
                <DoorCenter>
                  <DoorKnob />
                  <DoorKnob style={{ right: '45%', left: 'auto' }} />
                </DoorCenter>
                <DoorLabel>数字密室</DoorLabel>
              </DoorFrame>
            </DoorScene>
          )}

          {/* 画面2: 门打开 + 光芒 */}
          {phase === 'door-opening' && (
            <DoorScene key="door-opening">
              <DoorFrame>
                <LeftDoor
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: -120 }}
                  transition={{ duration: 1.2, type: 'spring', damping: 12 }}
                />
                <RightDoor
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 120 }}
                  transition={{ duration: 1.2, type: 'spring', damping: 12 }}
                />
                <DoorCenter>
                  <DoorKnob
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <DoorKnob
                    style={{ right: '45%', left: 'auto' }}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </DoorCenter>
                <DoorLabel
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >数字密室</DoorLabel>
                
                {/* 光芒效果 */}
                <LightBurst
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 2 }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
                <LightRays>
                  {Array.from({ length: 16 }).map((_, i) => (
                    <LightRay
                      key={i}
                      style={{ transform: `rotate(${i * 22.5}deg)` }}
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: [0, 1, 0.5] }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.03 }}
                    />
                  ))}
                </LightRays>
              </DoorFrame>
            </DoorScene>
          )}

          {/* 画面3: 算式滚动展示 */}
          {phase === 'equations-scroll' && (
            <EquationsScene key="equations-scroll">
              <EquationsContainer>
                {/* 左边加法 */}
                <EquationColumn>
                  <ScrollingEquations duration={12}>
                    {[...equations.addition, ...equations.addition].map((eq, i) => (
                      <EquationRow key={i}>
                        <Num highlight={eq.a >= 14}>{eq.a}</Num>
                        <Op>+</Op>
                        <Num highlight={eq.b >= 41}>{eq.b}</Num>
                        <Op>=</Op>
                        <ResultBox>{eq.result}</ResultBox>
                      </EquationRow>
                    ))}
                  </ScrollingEquations>
                </EquationColumn>
                
                {/* 右边减法 */}
                <EquationColumn>
                  <ScrollingEquations duration={12} delay>
                    {[...equations.subtraction, ...equations.subtraction].map((eq, i) => (
                      <EquationRow key={i}>
                        <Num highlight={eq.a >= 66}>{eq.a}</Num>
                        <Op>−</Op>
                        <Num highlight={eq.b >= 51}>{eq.b}</Num>
                        <Op>=</Op>
                        <ResultBox>{eq.result}</ResultBox>
                      </EquationRow>
                    ))}
                  </ScrollingEquations>
                </EquationColumn>
              </EquationsContainer>
              
              <HintText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                里面藏着一些神奇的算式，等待最勇敢的侦探来破解...
              </HintText>
            </EquationsScene>
          )}

          {/* 准备开始 */}
          {phase === 'ready' && (
            <ReadyWrapper key="ready">
              <LogoTitle
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 12 }}
              >
                <TitleChar delay={0} color={COLORS.primaryLight}>数</TitleChar>
                <TitleChar delay={0.05} color={COLORS.success}>字</TitleChar>
                <TitleChar delay={0.1} color={COLORS.accent}>密</TitleChar>
                <TitleChar delay={0.15} color={COLORS.purple}>室</TitleChar>
              </LogoTitle>
              
              <Subtitle
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <SubtitleIcon><TbDoorEnter /></SubtitleIcon>
                探索神奇算式的秘密
                <SubtitleIcon><TbDoorEnter /></SubtitleIcon>
              </Subtitle>
              
              <MissionBadge
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
              >
                <BadgeIconWrapper>
                  <TbNumbers />
                  <GiMagicSwirl className="magic" />
                </BadgeIconWrapper>
                <BadgeText>反转数对</BadgeText>
              </MissionBadge>

              <StartButton
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.9, type: 'spring', damping: 20, stiffness: 200 }}
                whileHover={{ scale: 1.03, y: -3, transition: { type: 'spring', damping: 20, stiffness: 400 } }}
                whileTap={{ scale: 0.97, transition: { type: 'spring', damping: 25, stiffness: 500 } }}
                onClick={onComplete}
              >
                <span>进入密室</span>
                <ButtonIconWrapper><IoRocketSharp /></ButtonIconWrapper>
              </StartButton>
              
              <SkipHint>按任意键跳过</SkipHint>
            </ReadyWrapper>
          )}
        </AnimatePresence>
        
        {/* 点击跳过 */}
        {phase !== 'ready' && (
          <SkipButton
            onClick={() => setPhase('ready')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            跳过 →
          </SkipButton>
        )}
      </ContentWrapper>
    </Container>
  )
}

// 动画
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`

const particleFloat = keyframes`
  0%, 100% { 
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% { 
    transform: translateY(-20px) scale(1.2);
    opacity: 0.7;
  }
`

const scrollUp = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
`

const doorGlow = keyframes`
  0%, 100% { box-shadow: inset 0 0 30px rgba(251, 191, 36, 0.3); }
  50% { box-shadow: inset 0 0 50px rgba(251, 191, 36, 0.5); }
`

// Styled Components
const Container = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 9999;
  background: ${COLORS.bgDark};
`

const BackgroundGradient = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, ${COLORS.bgLight} 0%, ${COLORS.bgDark} 70%);
`

const FloatingParticles = styled.div`
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
  animation: ${particleFloat} 4s ease-in-out infinite;
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

// 门场景
const DoorScene = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1500px;
`

const DoorFrame = styled(motion.div)`
  position: relative;
  width: 400px;
  height: 500px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border: 12px solid #475569;
  border-radius: 200px 200px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 0 60px rgba(139, 92, 246, 0.3),
    inset 0 0 80px rgba(0,0,0,0.6);
  overflow: hidden;
`

const LeftDoor = styled(motion.div)`
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 50%, ${COLORS.primaryDark} 100%);
  border-right: 3px solid #334155;
  transform-origin: left center;
  transform-style: preserve-3d;
  animation: ${doorGlow} 2s ease-in-out infinite;
  
  &::before {
    content: '';
    position: absolute;
    inset: 20px;
    border: 2px solid rgba(255,255,255,0.1);
    border-radius: 100px 0 0 0;
  }
`

const RightDoor = styled(motion.div)`
  position: absolute;
  right: 0;
  top: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(225deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 50%, ${COLORS.primaryDark} 100%);
  border-left: 3px solid #334155;
  transform-origin: right center;
  transform-style: preserve-3d;
  animation: ${doorGlow} 2s ease-in-out infinite;
  animation-delay: 0.5s;
  
  &::before {
    content: '';
    position: absolute;
    inset: 20px;
    border: 2px solid rgba(255,255,255,0.1);
    border-radius: 0 100px 0 0;
  }
`

const DoorCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
`

const DoorKnob = styled(motion.div)`
  position: absolute;
  left: 45%;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, ${COLORS.accentLight}, ${COLORS.accent});
  border-radius: 50%;
  box-shadow: 0 0 15px ${COLORS.accent};
`

const DoorLabel = styled(motion.div)`
  position: absolute;
  top: 25%;
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
  letter-spacing: 0.3em;
  z-index: 20;
`

const LightBurst = styled(motion.div)`
  position: absolute;
  inset: -100px;
  background: radial-gradient(ellipse at center, rgba(251, 191, 36, 0.9) 0%, rgba(251, 191, 36, 0) 60%);
  pointer-events: none;
`

const LightRays = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

const LightRay = styled(motion.div)`
  position: absolute;
  width: 6px;
  height: 300px;
  background: linear-gradient(to top, rgba(251, 191, 36, 0.9), transparent);
  transform-origin: bottom center;
`

// 算式滚动场景
const EquationsScene = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const EquationsContainer = styled.div`
  display: flex;
  gap: 100px;
  height: 400px;
  overflow: hidden;
  mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
`

const EquationColumn = styled.div`
  width: 280px;
  height: 100%;
  overflow: hidden;
`

const ScrollingEquations = styled.div<{ duration: number; delay?: boolean }>`
  animation: ${scrollUp} ${props => props.duration}s linear infinite;
  animation-delay: ${props => props.delay ? '-2s' : '0s'};
`

const EquationRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 15px 0;
  font-size: 2rem;
  font-weight: 700;
`

const Num = styled.span<{ highlight?: boolean }>`
  color: ${props => props.highlight ? '#ef4444' : COLORS.textPrimary};
  min-width: 50px;
  text-align: center;
`

const Op = styled.span`
  color: ${COLORS.textSecondary};
  min-width: 30px;
  text-align: center;
`

const ResultBox = styled.span`
  min-width: 50px;
  padding: 5px 12px;
  background: rgba(251, 191, 36, 0.2);
  border: 2px solid ${COLORS.accent};
  border-radius: 8px;
  color: ${COLORS.accentLight};
  text-align: center;
`

const HintText = styled(motion.div)`
  position: absolute;
  bottom: 12%;
  font-size: 1.4rem;
  font-weight: 600;
  color: ${COLORS.textSecondary};
  text-align: center;
`

const ReadyWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  padding: 50px 60px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
  border: 2px solid ${COLORS.purpleLight};
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 50px rgba(139, 92, 246, 0.3);
`

const LogoTitle = styled(motion.div)`
  display: flex;
  gap: 10px;
`

const TitleChar = styled(motion.span)<{ delay: number; color: string }>`
  font-family: 'Nunito', sans-serif;
  font-size: 4rem;
  font-weight: 900;
  color: ${props => props.color};
  text-shadow: 0 0 30px ${props => props.color};
  animation: ${float} 2s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`

const Subtitle = styled(motion.p)`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.3rem;
  font-weight: 600;
  color: ${COLORS.textSecondary};
  margin: 0;
`

const SubtitleIcon = styled.span`
  font-size: 1.8rem;
  color: ${COLORS.purpleLight};
  display: flex;
  align-items: center;
`

const MissionBadge = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px 30px;
  background: linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight});
  border-radius: 15px;
  box-shadow: 0 5px 25px rgba(245, 158, 11, 0.5);
`

const BadgeIconWrapper = styled.div`
  position: relative;
  font-size: 2.8rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .magic {
    position: absolute;
    font-size: 1.5rem;
    top: -5px;
    right: -10px;
    color: #fef3c7;
    animation: ${float} 1.5s ease-in-out infinite;
  }
`

const BadgeText = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: white;
`

const StartButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 50px;
  font-family: 'Nunito', 'Noto Sans SC', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(79, 70, 229, 0.5);
  margin-top: 10px;
`

const ButtonIconWrapper = styled.span`
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  animation: ${float} 1s ease-in-out infinite;
`

const SkipButton = styled(motion.button)`
  position: absolute;
  top: 30px;
  right: 30px;
  padding: 10px 25px;
  background: rgba(139, 92, 246, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 92, 246, 0.5);
  border-radius: 25px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(139, 92, 246, 0.4);
  }
`

const SkipHint = styled.div`
  font-size: 0.9rem;
  color: ${COLORS.textMuted};
  margin-top: 10px;
`
