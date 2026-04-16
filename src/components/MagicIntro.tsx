import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { backgrounds, characters, items, zootopiaColors as COLORS } from '../assets/images'
import { IoRocketSharp } from 'react-icons/io5'
import { GiModernCity, GiMagicSwirl } from 'react-icons/gi'
import { TbNumbers } from 'react-icons/tb'

interface MagicIntroProps {
  onComplete: () => void
}

export default function MagicIntro({ onComplete }: MagicIntroProps) {
  const [phase, setPhase] = useState<'story1' | 'story2' | 'story3' | 'ready'>('story1')
  const [textIndex, setTextIndex] = useState(0)
  
  // 故事文本
  const storyTexts = {
    story1: [
      '动物城被神秘的「数字迷雾」笼罩了...',
      '所有的数字都变得混乱不堪！',
      '只有掌握「反转数」魔法的人才能拯救它！'
    ],
    story2: [
      '朱迪警官在警局发现了一个神秘的魔法盒...',
      '「这个盒子能交换数字的十位和个位！」',
      '也许这就是破解迷雾的关键！'
    ],
    story3: [
      '小朋友，我们需要你的帮助！',
      '和朱迪、尼克一起探索数字的秘密，',
      '拯救动物城吧！'
    ]
  }
  
  // 自动推进文字
  useEffect(() => {
    const currentTexts = storyTexts[phase as keyof typeof storyTexts]
    if (!currentTexts) return
    
    if (textIndex < currentTexts.length - 1) {
      const timer = setTimeout(() => setTextIndex(textIndex + 1), 2000)
      return () => clearTimeout(timer)
    } else {
      // 当前阶段文字播放完毕，进入下一阶段
      const timer = setTimeout(() => {
        if (phase === 'story1') {
          setPhase('story2')
          setTextIndex(0)
        } else if (phase === 'story2') {
          setPhase('story3')
          setTextIndex(0)
        } else if (phase === 'story3') {
          setPhase('ready')
        }
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [phase, textIndex])

  return (
    <Container>
      {/* 动物城背景 */}
      <BackgroundImage 
        src={backgrounds.skyline} 
        alt="Zootopia" 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5 }}
      />
      <BackgroundOverlay phase={phase} />
      
      <ContentWrapper>
        <AnimatePresence mode="wait">
          {/* 故事阶段1 - 迷雾来袭 */}
          {phase === 'story1' && (
            <StoryWrapper key="story1">
              <FogEffect />
              <StoryTextBox
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
              >
                <StoryText key={textIndex}>
                  {storyTexts.story1[textIndex]}
                </StoryText>
              </StoryTextBox>
              <FloatingNumbers>
                {['1', '2', '3', '?', '!', '4', '5'].map((num, i) => (
                  <FloatingNumber
                    key={i}
                    style={{ left: `${10 + i * 13}%` }}
                    animate={{
                      y: [0, -30, 0],
                      opacity: [0.3, 0.7, 0.3],
                      rotate: [0, 20, -20, 0]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                  >
                    {num}
                  </FloatingNumber>
                ))}
              </FloatingNumbers>
            </StoryWrapper>
          )}

          {/* 故事阶段2 - 朱迪发现魔盒 */}
          {phase === 'story2' && (
            <StoryWrapper key="story2">
              <CharacterImage
                src={characters.judy}
                alt="Judy"
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                style={{ left: '10%' }}
              />
              <MagicBoxImage
                src={items.magicBox}
                alt="魔法盒"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.5 }}
              />
              <StoryTextBox
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                style={{ bottom: '15%' }}
              >
                <StoryText key={textIndex}>
                  {storyTexts.story2[textIndex]}
                </StoryText>
              </StoryTextBox>
            </StoryWrapper>
          )}

          {/* 故事阶段3 - 召唤小朋友 */}
          {phase === 'story3' && (
            <StoryWrapper key="story3">
              <CharacterImage
                src={characters.judy}
                alt="Judy"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                style={{ left: '15%', width: '180px' }}
              />
              <CharacterImage
                src={characters.nick}
                alt="Nick"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 15, delay: 0.2 }}
                style={{ right: '15%', width: '200px' }}
              />
              <StoryTextBox
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <StoryText key={textIndex}>
                  {storyTexts.story3[textIndex]}
                </StoryText>
              </StoryTextBox>
            </StoryWrapper>
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
                <TitleChar delay={0.1} color={COLORS.accent}>魔</TitleChar>
                <TitleChar delay={0.15} color={COLORS.purple}>盒</TitleChar>
              </LogoTitle>
              
              <Subtitle
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <SubtitleIcon><GiModernCity /></SubtitleIcon>
                拯救动物城大冒险
                <SubtitleIcon><GiModernCity /></SubtitleIcon>
              </Subtitle>
              
              <CharacterRow>
                <CharacterImageSmall
                  src={characters.judy}
                  alt="Judy"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                />
                <MissionBadge
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: 'spring' }}
                >
                  <BadgeIconWrapper>
                    <TbNumbers />
                    <GiMagicSwirl className="magic" />
                  </BadgeIconWrapper>
                  <BadgeText>反转数魔法</BadgeText>
                </MissionBadge>
                <CharacterImageSmall
                  src={characters.nick}
                  alt="Nick"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                />
              </CharacterRow>

              <StartButton
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1, type: 'spring', damping: 20, stiffness: 200 }}
                whileHover={{ scale: 1.03, y: -3, transition: { type: 'spring', damping: 20, stiffness: 400 } }}
                whileTap={{ scale: 0.97, transition: { type: 'spring', damping: 25, stiffness: 500 } }}
                onClick={onComplete}
              >
                <span>开始冒险</span>
                <ButtonIconWrapper><IoRocketSharp /></ButtonIconWrapper>
              </StartButton>
              
              {/* 跳过故事按钮 */}
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

const fogMove = keyframes`
  0% { transform: translateX(-10%); opacity: 0.4; }
  50% { transform: translateX(10%); opacity: 0.6; }
  100% { transform: translateX(-10%); opacity: 0.4; }
`

// Styled Components
const Container = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 9999;
  background: #1a1a2e;
`

const BackgroundImage = styled(motion.img)`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const BackgroundOverlay = styled.div<{ phase: string }>`
  position: absolute;
  inset: 0;
  background: ${props => 
    props.phase === 'story1' ? 'rgba(0, 0, 0, 0.5)' :
    props.phase === 'story2' ? 'rgba(30, 64, 175, 0.3)' :
    props.phase === 'story3' ? 'rgba(30, 64, 175, 0.2)' :
    'rgba(255, 255, 255, 0.1)'
  };
  transition: background 1s ease;
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

const StoryWrapper = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const FogEffect = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(148, 163, 184, 0.3) 25%, 
    rgba(148, 163, 184, 0.5) 50%, 
    rgba(148, 163, 184, 0.3) 75%, 
    transparent 100%);
  animation: ${fogMove} 8s ease-in-out infinite;
`

const StoryTextBox = styled(motion.div)`
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 25px 50px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 700px;
  text-align: center;
`

const StoryText = styled(motion.p)`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${COLORS.textPrimary};
  margin: 0;
  line-height: 1.6;
`

const FloatingNumbers = styled.div`
  position: absolute;
  top: 20%;
  width: 100%;
  display: flex;
  justify-content: space-around;
`

const FloatingNumber = styled(motion.div)`
  font-size: 4rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.5);
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
`

const CharacterImage = styled(motion.img)`
  position: absolute;
  bottom: 20%;
  width: 320px;
  height: auto;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
`

const MagicBoxImage = styled(motion.img)`
  width: 180px;
  height: auto;
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translateX(-50%);
  filter: drop-shadow(0 0 30px rgba(251, 191, 36, 0.8));
`

const ReadyWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
  text-shadow: 3px 3px 0 white, 5px 5px 0 rgba(0,0,0,0.1);
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
  color: ${COLORS.primary};
  display: flex;
  align-items: center;
`

const CharacterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
  margin: 15px 0;
`

const CharacterImageSmall = styled(motion.img)`
  width: 160px;
  height: auto;
  filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.2));
`

const MissionBadge = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px 25px;
  background: linear-gradient(135deg, ${COLORS.gold}, ${COLORS.accent});
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(251, 191, 36, 0.4);
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
  box-shadow: 0 10px 30px rgba(30, 64, 175, 0.4);
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
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`

const SkipHint = styled.div`
  font-size: 0.9rem;
  color: ${COLORS.textMuted};
  margin-top: 10px;
`
