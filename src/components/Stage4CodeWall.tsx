import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { IoChevronForward, IoChevronBack } from 'react-icons/io5'

import { playClick } from '../hooks/useSound'

const COLORS = {
  primary: '#4f46e5',
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  gold: '#fbbf24',
  goldLight: '#fde68a',
  red: '#ef4444',
  redLight: '#fca5a5',
  bgDark: '#0f172a',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
}

function makeRow(i: number) {
  const a_add = 10 + i
  const b_add = 10 * i + 1
  const r_add = 11 * (i + 1)
  const aHid = i >= 5
  const bHid = i >= 4
  return {
    add: { a: a_add, b: b_add, result: r_add, aHidden: aHid, bHidden: bHid },
    sub: { a: r_add, b: b_add, result: a_add, aHidden: aHid, bHidden: bHid },
  }
}

const ROWS = Array.from({ length: 6 }, (_, i) => makeRow(i + 1))

interface Props {
  onContinue: () => void
  onBack?: () => void
}

export default function Stage4CodeWall({ onContinue, onBack }: Props) {
  const [revealed, setRevealed] = useState(false)

  const handleAction = () => {
    playClick()
    if (!revealed) setRevealed(true)
    else onContinue()
  }

  return (
    <Container>
      <BackgroundGradient />

      <ParticleLayer>
        {Array.from({ length: 18 }).map((_, i) => (
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
        {/* 顶部一行标题 */}
        <HeaderRow
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Title>数字交换和相等的算式</Title>
        </HeaderRow>

        {/* 主体表格 */}
        <TableCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Columns>
            <Column>
              <ColHeader color={COLORS.purple}>✦ 加法密码 ✦</ColHeader>
              {ROWS.map((row, i) => (
                <FormulaRow key={i}>
                  <NumCell
                    hidden={row.add.aHidden}
                    revealed={revealed && row.add.aHidden}
                    baseText={row.add.aHidden ? '?' : String(row.add.a)}
                    revealText={String(row.add.a)}
                    delay={i * 0.12}
                  />
                  <Op>+</Op>
                  <NumCell
                    hidden={row.add.bHidden}
                    revealed={revealed && row.add.bHidden}
                    baseText={row.add.bHidden ? '?' : String(row.add.b)}
                    revealText={String(row.add.b)}
                    delay={i * 0.12 + 0.04}
                  />
                  <Op>=</Op>
                  <NumCell
                    hidden={true}
                    revealed={revealed}
                    baseText="?"
                    revealText={String(row.add.result)}
                    delay={i * 0.12 + 0.08}
                  />
                </FormulaRow>
              ))}
            </Column>

            <ColumnDivider />

            <Column>
              <ColHeader color={COLORS.gold}>✦ 减法密码 ✦</ColHeader>
              {ROWS.map((row, i) => (
                <FormulaRow key={i}>
                  <NumCell
                    hidden={row.sub.aHidden}
                    revealed={revealed && row.sub.aHidden}
                    baseText={row.sub.aHidden ? '?' : String(row.sub.a)}
                    revealText={String(row.sub.a)}
                    delay={i * 0.12}
                  />
                  <Op>−</Op>
                  <NumCell
                    hidden={row.sub.bHidden}
                    revealed={revealed && row.sub.bHidden}
                    baseText={row.sub.bHidden ? '?' : String(row.sub.b)}
                    revealText={String(row.sub.b)}
                    delay={i * 0.12 + 0.04}
                  />
                  <Op>=</Op>
                  <NumCell
                    hidden={true}
                    revealed={revealed}
                    baseText="?"
                    revealText={String(row.sub.result)}
                    delay={i * 0.12 + 0.08}
                  />
                </FormulaRow>
              ))}
            </Column>
          </Columns>
        </TableCard>

        {/* 底部按钮区（含完成提示） */}
        <FooterRow>
          <AnimatePresence>
            {revealed && (
              <CompleteHint
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.6 }}
              >
                🎉 全部密码已破解
              </CompleteHint>
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
            onClick={handleAction}
          >
            <span>{revealed ? '继续探索' : '揭示全部密码'}</span>
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
  gap: 20px;
  padding: 20px 40px;
`

const HeaderRow = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  justify-content: center;
`

const Title = styled.h1`
  font-size: 2.4rem;
  font-weight: 900;
  background: linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  letter-spacing: 0.08em;
`
const TableCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  padding: 22px 40px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(139, 92, 246, 0.05);
`

const Columns = styled.div`
  display: flex;
  gap: 36px;
  align-items: stretch;
`

const ColumnDivider = styled.div`
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(139, 92, 246, 0.4), transparent);
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ColHeader = styled.div<{ color: string }>`
  font-size: 1.1rem;
  font-weight: 800;
  color: ${props => props.color};
  text-align: center;
  margin-bottom: 6px;
  letter-spacing: 0.1em;
`

const FormulaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

// Cell wrapper with staggered number reveal
function NumCell({ hidden, revealed, baseText, revealText, delay }: {
  hidden: boolean
  revealed: boolean
  baseText: string
  revealText: string
  delay: number
}) {
  return (
    <CellBox hidden={hidden} revealed={revealed}>
      <AnimatePresence mode="wait">
        {revealed ? (
          <motion.span
            key="reveal"
            initial={{ opacity: 0, y: 14, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ delay, type: 'spring', damping: 12, stiffness: 260 }}
          >
            {revealText}
          </motion.span>
        ) : (
          <motion.span
            key="base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {baseText}
          </motion.span>
        )}
      </AnimatePresence>
    </CellBox>
  )
}

const CellBox = styled.div<{ hidden?: boolean; revealed?: boolean }>`
  min-width: 58px;
  height: 46px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 900;
  border-radius: 10px;
  border: ${props => props.hidden ? `2px solid ${COLORS.gold}` : '2px solid transparent'};
  background: ${props => props.hidden
    ? (props.revealed ? 'rgba(239, 68, 68, 0.18)' : 'rgba(251, 191, 36, 0.08)')
    : 'rgba(255,255,255,0.04)'};
  color: ${props => !props.hidden
    ? COLORS.textPrimary
    : (props.revealed ? COLORS.redLight : COLORS.goldLight)};
  transition: background 0.5s, color 0.5s, border-color 0.5s;
  position: relative;
`

const Op = styled.span`
  font-size: 1.5rem;
  color: ${COLORS.textSecondary};
  width: 22px;
  text-align: center;
  font-weight: 700;
`

const FooterRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
`

const CompleteHint = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 700;
  color: ${COLORS.goldLight};
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 50px;
  margin-right: 6px;
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
