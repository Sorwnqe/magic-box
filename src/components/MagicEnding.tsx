import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { backgrounds, characters, expressions, zootopiaColors as COLORS } from '../assets/images'
import { playSuccess } from '../hooks/useSound'
import { IoTrophy, IoStar } from 'react-icons/io5'
import { GiPartyPopper } from 'react-icons/gi'

interface MagicEndingProps {
  onRestart: () => void
}

type EndingPhase = 'dialogue' | 'dance' | 'preview'

// 所有对话内容（自动播放）
const allDialogues = [
  { speaker: 'judy', text: '太棒了！你成功破解了所有的数字谜题！' },
  { speaker: 'nick', text: '不得不承认，你比我想象的还要聪明呢~' },
  { speaker: 'judy', text: '数字迷雾已经开始消散了！' },
  { speaker: 'nick', text: '看来「反转数对」的秘密你已经完全掌握了！' },
  { speaker: 'nick', text: '动物城的居民们一定会感谢你的！' },
  { speaker: 'judy', text: '为了庆祝，让我们跳支舞吧！' },
]

export default function MagicEnding({ onRestart }: MagicEndingProps) {
  const [phase, setPhase] = useState<EndingPhase>('dialogue')
  const [dialogueIndex, setDialogueIndex] = useState(0)
  const [judyBubble, setJudyBubble] = useState<string | null>(null)
  const [nickBubble, setNickBubble] = useState<string | null>(null)

  // 播放成功音效
  useEffect(() => {
    playSuccess()
  }, [])

  // 自动推进对话
  useEffect(() => {
    if (phase !== 'dialogue') return

    if (dialogueIndex < allDialogues.length) {
      const current = allDialogues[dialogueIndex]

      // 显示当前对话气泡
      if (current.speaker === 'judy') {
        setJudyBubble(current.text)
        setNickBubble(null)
      } else {
        setNickBubble(current.text)
        setJudyBubble(null)
      }

      // 2.5秒后进入下一句
      const timer = setTimeout(() => {
        setDialogueIndex(dialogueIndex + 1)
      }, 2500)

      return () => clearTimeout(timer)
    } else {
      // 对话结束，进入跳舞阶段
      setJudyBubble(null)
      setNickBubble(null)
      setTimeout(() => setPhase('dance'), 500)
    }
  }, [phase, dialogueIndex])

  const handleDanceComplete = () => {
    setPhase('preview')
  }

  return (
    <Container>
      {/* 动物城背景 */}
      <BackgroundImage src={backgrounds.skyline} alt="Zootopia" />
      <BackgroundOverlay />

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
          {/* 对话阶段 - 气泡在角色头上 */}
          {phase === 'dialogue' && (
            <DialoguePhase
              key="dialogue"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 中间奖杯 */}
              <TrophyCenter>
                <TrophyIcon
                  animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <IoTrophy />
                </TrophyIcon>
              </TrophyCenter>

              {/* 朱迪 - 左侧 */}
              <CharacterLeft>
                <BubbleWrapper>
                  <AnimatePresence mode="wait">
                    {judyBubble && (
                      <SpeechBubble
                        key={judyBubble}
                        position="left"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        {judyBubble}
                      </SpeechBubble>
                    )}
                  </AnimatePresence>
                </BubbleWrapper>
                <CharacterImg
                  src={expressions.judyHappy}
                  alt="Judy"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </CharacterLeft>

              {/* 尼克 - 右侧 */}
              <CharacterRight>
                <BubbleWrapper>
                  <AnimatePresence mode="wait">
                    {nickBubble && (
                      <SpeechBubble
                        key={nickBubble}
                        position="right"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        {nickBubble}
                      </SpeechBubble>
                    )}
                  </AnimatePresence>
                </BubbleWrapper>
                <CharacterImg
                  src={expressions.nickThumbsup}
                  alt="Nick"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </CharacterRight>
            </DialoguePhase>
          )}

          {/* 跳舞庆祝阶段 */}
          {phase === 'dance' && (
            <DancePhase
              key="dance"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DanceTitle
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <GiPartyPopper /> 庆祝时刻！ <GiPartyPopper />
              </DanceTitle>

              <DanceStage>
                <StageLight position="left" />
                <StageLight position="right" />

                <DancingCharacters
                  initial={{ y: 300, opacity: 0 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                  }}
                  transition={{ duration: 0.8, type: 'spring', damping: 12 }}
                >
                  <motion.img
                    src={expressions.teamVictory}
                    alt="Dancing"
                    style={{ width: '500px', height: 'auto' }}
                    animate={{
                      y: [0, -12, 0, -8, 0],
                      rotate: [0, 1.5, 0, -1.5, 0]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
                  />
                </DancingCharacters>

                <MusicNotes>
                  {['🎵', '🎶', '✨', '⭐', '🎵', '💫'].map((note, i) => (
                    <MusicNote
                      key={i}
                      style={{ left: `${15 + i * 14}%` }}
                      animate={{
                        y: [0, -30, 0],
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 1.3, 1]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    >
                      {note}
                    </MusicNote>
                  ))}
                </MusicNotes>
              </DanceStage>

              <DanceMessage
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                🎉 动物城的和平回来了！感谢你的帮助！ 🎉
              </DanceMessage>

              <NextButton
                onClick={handleDanceComplete}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>太棒了！</span>
                <IoStar />
              </NextButton>
            </DancePhase>
          )}

          {/* 预告阶段 */}
          {phase === 'preview' && (
            <PreviewPhase
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 大角色装饰 */}
              <BigCharacterLeft
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <img src={characters.judy} alt="Judy" />
              </BigCharacterLeft>

              <BigCharacterRight
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <img src={characters.nick} alt="Nick" />
              </BigCharacterRight>

              <PreviewCard
                initial={{ scale: 0.8, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 12 }}
              >
                <PreviewTitle>
                  🌟 更多谜题等你来挑战！
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

const Container = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`

const BackgroundImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const BackgroundOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(30, 64, 175, 0.4) 0%,
    rgba(139, 92, 246, 0.3) 50%,
    rgba(251, 191, 36, 0.3) 100%
  );
`

const confettiFall = keyframes`
  0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0.5; }
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

// ========== 对话阶段 ==========

const DialoguePhase = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const TrophyCenter = styled.div`
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
`

const TrophyIcon = styled(motion.div)`
  font-size: 6rem;
  color: ${COLORS.gold};
  filter: drop-shadow(0 5px 20px rgba(251, 191, 36, 0.6));
`

const CharacterLeft = styled.div`
  position: absolute;
  left: 10%;
  bottom: 15%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const CharacterRight = styled.div`
  position: absolute;
  right: 10%;
  bottom: 15%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const CharacterImg = styled(motion.img)`
  width: 220px;
  height: auto;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
`

const BubbleWrapper = styled.div`
  min-height: 100px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-bottom: 15px;
`

const SpeechBubble = styled(motion.div)<{ position: 'left' | 'right' }>`
  padding: 18px 28px;
  background: white;
  border-radius: 20px;
  font-size: 1.3rem;
  font-weight: 600;
  color: ${COLORS.textPrimary};
  max-width: 320px;
  text-align: center;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  border: 3px solid ${props => props.position === 'left' ? COLORS.primary : COLORS.accent};
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 12px solid white;
  }
`

// ========== 跳舞阶段 ==========

const DancePhase = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
`

const DanceTitle = styled(motion.h1)`
  font-size: 2.5rem;
  color: white;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
`

const DanceStage = styled.div`
  position: relative;
  padding: 40px 80px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 30px;
  backdrop-filter: blur(10px);
`

const stageGlow = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
`

const StageLight = styled.div<{ position: 'left' | 'right' }>`
  position: absolute;
  top: -20px;
  ${props => props.position}: 10%;
  width: 60px;
  height: 200px;
  background: linear-gradient(
    to bottom,
    ${props => props.position === 'left' ? COLORS.primary : COLORS.gold},
    transparent
  );
  opacity: 0.5;
  transform: ${props => props.position === 'left' ? 'rotate(15deg)' : 'rotate(-15deg)'};
  animation: ${stageGlow} 2s ease-in-out infinite;
  animation-delay: ${props => props.position === 'left' ? '0s' : '1s'};
`

const DancingCharacters = styled(motion.div)`
  position: relative;
  z-index: 5;
  
  img {
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }
`

const MusicNotes = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`

const MusicNote = styled(motion.span)`
  position: absolute;
  top: 20%;
  font-size: 2rem;
`

const DanceMessage = styled(motion.p)`
  margin-top: 25px;
  font-size: 1.4rem;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`

const NextButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 15px 40px;
  background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(30, 64, 175, 0.4);
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

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`

const BigCharacterLeft = styled(motion.div)`
  position: absolute;
  left: 5%;
  bottom: 10%;
  animation: ${floatAnimation} 3s ease-in-out infinite;
  
  img {
    width: 180px;
    height: auto;
    filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.25));
  }
`

const BigCharacterRight = styled(motion.div)`
  position: absolute;
  right: 5%;
  bottom: 10%;
  animation: ${floatAnimation} 3s ease-in-out infinite;
  animation-delay: 0.5s;
  
  img {
    width: 200px;
    height: auto;
    filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.25));
  }
`

const PreviewCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.98);
  border-radius: 30px;
  padding: 40px 80px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  text-align: center;
  z-index: 10;
  max-width: 600px;
`

const PreviewTitle = styled.h1`
  font-size: 2.2rem;
  font-weight: 800;
  color: ${COLORS.textPrimary};
  margin: 0 0 12px;
  background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.purple} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
`

const PreviewText = styled.p`
  font-size: 1.3rem;
  color: ${COLORS.textSecondary};
  margin-bottom: 25px;
`

const RestartButton = styled(motion.button)`
  padding: 15px 40px;
  background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(30, 64, 175, 0.4);
`
