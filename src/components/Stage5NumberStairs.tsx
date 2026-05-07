import { useState, useRef, useLayoutEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { IoChevronForward, IoChevronBack } from 'react-icons/io5'
import { HiSparkles } from 'react-icons/hi2'
import { playClick } from '../hooks/useSound'
import MysticBackground from './MysticBackground'

const COLORS = {
  primary: '#4f46e5',
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  gold: '#fbbf24',
  goldLight: '#fde68a',
  red: '#ef4444',
  bgDark: '#0f172a',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
}

const STAIRS = [
  { left: 1,  result: 12 },
  { left: 12, result: 23 },
  { left: 23, result: 34 },
  { left: 34, result: 45 },
  { left: 45, result: 56 },
  { left: 56, result: 67 },
  { left: 67, result: 78 },
  { left: 78, result: 89 },
]

const CHAIN_SET = new Set([12, 23, 34, 45, 56, 67, 78, 89])

interface Props {
  onContinue: () => void
  onBack?: () => void
}

type Step = 0 | 1 | 2

export default function Stage5NumberStairs({ onContinue, onBack }: Props) {
  const [step, setStep] = useState<Step>(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [points, setPoints] = useState<{ x: number; y: number }[]>([])
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 })

  useLayoutEffect(() => {
    if (step < 2) {
      requestAnimationFrame(() => setPoints([]))
      return
    }
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const box = wrapper.getBoundingClientRect()
    setSvgSize({ w: box.width, h: box.height })
    const pts: { x: number; y: number }[] = []
    for (let i = 0; i < STAIRS.length; i++) {
      const leftEl = cellRefs.current[`left-${i}`]
      const rightEl = cellRefs.current[`right-${i}`]
      if (leftEl && CHAIN_SET.has(STAIRS[i].left)) {
        const r = leftEl.getBoundingClientRect()
        pts.push({ x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 })
      }
      if (rightEl && CHAIN_SET.has(STAIRS[i].result)) {
        const r = rightEl.getBoundingClientRect()
        pts.push({ x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 })
      }
    }
    setPoints(pts)
  }, [step])

  const handleButton = () => {
    playClick()
    if (step < 2) setStep((step + 1) as Step)
    else onContinue()
  }

  const btnLabel = step === 0
    ? '揭示答案'
    : step === 1
      ? '点亮数字链条'
      : '继续探索'

  const setCellRef = (key: string) => (el: HTMLDivElement | null) => {
    cellRefs.current[key] = el
  }

  // Build smooth SVG path from points
  const pathD = points.length >= 2
    ? points.reduce((acc, p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`
        const prev = points[i - 1]
        const cx = (prev.x + p.x) / 2
        return `${acc} Q ${cx} ${prev.y} ${cx} ${(prev.y + p.y) / 2} T ${p.x} ${p.y}`
      }, '')
    : ''

  return (
    <Container>
      <MysticBackground />
      <BackgroundGradient />

      <ParticleLayer>
        {Array.from({ length: 16 }).map((_, i) => (
          <Particle
            key={i}
            style={{
              left: `${(i * 23 + 5) % 100}%`,
              top: `${(i * 17 + 13) % 100}%`,
              animationDelay: `${(i * 0.35) % 3}s`,
            }}
          />
        ))}
      </ParticleLayer>

      <ContentWrapper>
        {/* 步骤指示器 */}
        <HeaderRow
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StepIndicator>
            <StepDot active={step >= 0} />
            <StepLine active={step >= 1} />
            <StepDot active={step >= 1} />
            <StepLine active={step >= 2} />
            <StepDot active={step >= 2} />
          </StepIndicator>
        </HeaderRow>

        <MainArea>
          <StairsCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <StairsWrapper ref={wrapperRef}>
              {/* SVG 连线层 */}
              {step >= 2 && svgSize.w > 0 && (
                <ChainSvg
                  width={svgSize.w}
                  height={svgSize.h}
                  viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
                >
                  <defs>
                    <linearGradient id="chainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="30%" stopColor="#fbbf24" />
                      <stop offset="60%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                    <filter id="chainGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {/* 底层发光光晕 */}
                  <motion.path
                    d={pathD}
                    stroke="#fbbf24"
                    strokeWidth={14}
                    strokeOpacity={0.35}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#chainGlow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.7 }}
                    transition={{ duration: 5, ease: 'easeInOut' }}
                  />
                  {/* 主线 */}
                  <motion.path
                    d={pathD}
                    stroke="url(#chainGrad)"
                    strokeWidth={6}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#softGlow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 5, ease: 'easeInOut' }}
                  />
                  {/* 高光细线 */}
                  <motion.path
                    d={pathD}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    strokeOpacity={0.85}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.85 }}
                    transition={{ duration: 5, ease: 'easeInOut' }}
                  />
                  {points.map((p, i) => (
                    <motion.circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={9}
                      fill="#fbbf24"
                      stroke="#fff"
                      strokeWidth={2}
                      filter="url(#chainGlow)"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.4, 1], opacity: 1 }}
                      transition={{
                        delay: 0.3 + (i / Math.max(1, points.length - 1)) * 4.5,
                        duration: 0.5,
                      }}
                    />
                  ))}
                </ChainSvg>
              )}

              {STAIRS.map((stair, i) => {
                const leftIsChain = step >= 2 && CHAIN_SET.has(stair.left)
                const resultIsChain = step >= 2 && CHAIN_SET.has(stair.result)
                return (
                  <EqRow key={i} indent={i}>
                    <NumBox ref={setCellRef(`left-${i}`)} highlight={leftIsChain}>
                      {stair.left}
                    </NumBox>
                    <OpText>+</OpText>
                    <BracketBox filled={step >= 1}>
                      <AnimatePresence mode="wait">
                        {step >= 1 ? (
                          <motion.span
                            key="filled"
                            initial={{ opacity: 0, scale: 0.5, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: i * 0.08, type: 'spring', damping: 12 }}
                          >
                            11
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </BracketBox>
                    <OpText>=</OpText>
                    <NumBox ref={setCellRef(`right-${i}`)} highlight={resultIsChain}>
                      {stair.result}
                    </NumBox>
                  </EqRow>
                )
              })}
            </StairsWrapper>
          </StairsCard>
        </MainArea>

        {/* 底部按钮区（含提示） */}
        <FooterRow>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <HintPill key="h0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <HiSparkles /> 括号里填几，等号才能成立？
              </HintPill>
            )}
            {step === 1 && (
              <HintPill key="h1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <HiSparkles /> 每一步都加 <strong>11</strong>
              </HintPill>
            )}
            {step === 2 && (
              <HintPill key="h2" highlight initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                🎯 上一步的结果正是下一步的起点
              </HintPill>
            )}
          </AnimatePresence>

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
            onClick={handleButton}
          >
            <span>{btnLabel}</span>
            <IoChevronForward />
          </ContinueButton>
        </FooterRow>
      </ContentWrapper>
    </Container>
  )
}

// ========== Animations ==========

const sparkleAnim = keyframes`
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 0.8; transform: scale(1.2); }
`

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 8px rgba(239,68,68,0.4); }
  50% { box-shadow: 0 0 22px rgba(239,68,68,0.75); }
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
  gap: 16px;
  padding: 16px 40px;
`

const HeaderRow = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
`

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

const StepDot = styled.div<{ active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.active
    ? `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`
    : 'rgba(255,255,255,0.15)'};
  border: 2px solid ${props => props.active ? COLORS.gold : 'rgba(255,255,255,0.2)'};
  box-shadow: ${props => props.active ? `0 0 10px ${COLORS.gold}` : 'none'};
  transition: all 0.4s;
`

const StepLine = styled.div<{ active: boolean }>`
  width: 32px;
  height: 2px;
  background: ${props => props.active ? COLORS.gold : 'rgba(255,255,255,0.15)'};
  transition: all 0.4s;
`

const MainArea = styled.div`
  display: flex;
  justify-content: center;
`

const StairsCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  padding: 18px 42px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(139, 92, 246, 0.05);
`

const StairsWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const ChainSvg = styled.svg`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
`

const EqRow = styled.div<{ indent: number }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: ${props => props.indent * 16}px;
  position: relative;
  z-index: 2;
`

const NumBox = styled(motion.div)<{ highlight: boolean }>`
  min-width: 76px;
  height: 58px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 900;
  border-radius: 12px;
  color: ${props => props.highlight ? '#fff' : COLORS.textPrimary};
  border: 2px solid ${props => props.highlight ? COLORS.red : 'rgba(255,255,255,0.08)'};
  background: ${props => props.highlight
    ? 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(251,191,36,0.15))'
    : 'rgba(255,255,255,0.04)'};
  transition: all 0.4s;
  ${props => props.highlight && `animation: ${glowPulse} 2s ease-in-out infinite;`}
`

const OpText = styled.span`
  font-size: 2rem;
  font-weight: 700;
  color: ${COLORS.textSecondary};
  width: 28px;
  text-align: center;
`

const BracketBox = styled(motion.div)<{ filled: boolean }>`
  min-width: 90px;
  height: 58px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 900;
  border-radius: 12px;
  border: 2px dashed ${props => props.filled ? COLORS.gold : COLORS.purpleLight};
  background: ${props => props.filled ? 'rgba(251,191,36,0.1)' : 'rgba(139,92,246,0.08)'};
  color: ${COLORS.goldLight};
  position: relative;

  &::before { content: '('; position: absolute; left: 8px; color: ${COLORS.purpleLight}; font-size: 1.8rem; font-weight: 700; }
  &::after  { content: ')'; position: absolute; right: 8px; color: ${COLORS.purpleLight}; font-size: 1.8rem; font-weight: 700; }
`

const FooterRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
`

const HintPill = styled(motion.div)<{ highlight?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${props => props.highlight ? COLORS.goldLight : COLORS.purpleLight};
  background: ${props => props.highlight ? 'rgba(251,191,36,0.1)' : 'rgba(139,92,246,0.1)'};
  border: 1px solid ${props => props.highlight ? 'rgba(251,191,36,0.3)' : 'rgba(139,92,246,0.3)'};
  border-radius: 50px;
  margin-right: 6px;

  strong {
    color: ${COLORS.goldLight};
    font-weight: 900;
    font-size: 1.1rem;
    margin: 0 2px;
  }
`

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
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
  padding: 12px 34px;
  font-size: 1.1rem;
  font-weight: 800;
  color: white;
  background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.purple});
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.5);
  svg { font-size: 1.2rem; }
`
