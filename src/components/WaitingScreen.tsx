import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { playClick } from '../hooks/useSound'
import { 
  IoRocketSharp, 
  IoSparkles,
  IoSchool,
  IoCalendar,
  IoPlanet,
  IoStar
} from 'react-icons/io5'
import { 
  GiBookshelf, 
  GiPencilBrush,
  GiSpellBook,
  GiMagicSwirl,
  GiStarSattelites
} from 'react-icons/gi'
import { 
  FaChild, 
  FaPaperPlane,
  FaCloudSun,
  FaCalculator
} from 'react-icons/fa'
import { BsStars } from 'react-icons/bs'
import { TbMathSymbols } from 'react-icons/tb'

interface WaitingScreenProps {
  onStart: () => void
}

// 动画
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`

const floatRotate = keyframes`
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
`

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
`

const flyPath = keyframes`
  0% { transform: translate(0, 0) rotate(-25deg); }
  25% { transform: translate(40px, -25px) rotate(-15deg); }
  50% { transform: translate(80px, -15px) rotate(-30deg); }
  75% { transform: translate(40px, 10px) rotate(-20deg); }
  100% { transform: translate(0, 0) rotate(-25deg); }
`

const rocketFly = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(-45deg); }
  50% { transform: translate(15px, -25px) rotate(-45deg); }
`

const twinkle = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.3); }
`

const wiggle = keyframes`
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
`

const bounce = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8px) scale(1.05); }
`

const talkMouth = keyframes`
  0% { transform: translateX(-50%) scaleY(0.3); }
  100% { transform: translateX(-50%) scaleY(1); }
`

const speakerBounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
`

// SVG 手绘风格边框路径
const HandDrawnBorder = () => (
  <svg viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
    <path 
      d="M50 30 Q20 35 15 70 Q8 120 12 160 Q10 200 25 240 Q35 265 70 270 
         Q150 278 200 275 Q280 280 330 270 Q370 262 385 230 
         Q395 190 390 140 Q392 80 380 50 Q365 20 320 18 
         Q240 12 150 15 Q80 18 50 30 Z" 
      fill="white"
      stroke="#7dd3fc"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: 'drop-shadow(0 8px 25px rgba(125, 211, 252, 0.3))' }}
    />
    <path 
      d="M55 38 Q28 42 22 72 Q16 115 20 155 Q18 195 32 232 Q42 255 72 260 
         Q148 267 198 265 Q275 268 322 260 Q358 253 372 223 
         Q382 188 378 142 Q380 85 370 58 Q356 32 315 28 
         Q238 22 152 25 Q85 27 55 38 Z" 
      fill="none"
      stroke="#bae6fd"
      strokeWidth="2"
      strokeDasharray="8 6"
      strokeLinecap="round"
    />
  </svg>
)

export default function WaitingScreen({ onStart }: WaitingScreenProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const toggleAudio = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
  }

  const handleStart = () => {
    playClick()
    if (audioRef.current) audioRef.current.pause()
    onStart()
  }

  return (
    <Container>
      {/* 渐变天空背景 */}
      <Background />
      
      {/* 大云朵装饰 */}
      <CloudIcon style={{ top: '8%', left: '3%', fontSize: '6rem' }}>
        <FaCloudSun />
      </CloudIcon>
      <CloudIcon style={{ top: '15%', right: '5%', fontSize: '5rem', animationDelay: '1s' }}>
        <FaCloudSun />
      </CloudIcon>
      
      {/* 飞翔的纸飞机 */}
      <PaperPlaneWrapper>
        <FaPaperPlane />
        <PlaneTrail><BsStars /></PlaneTrail>
      </PaperPlaneWrapper>
      
      {/* 散落的大图标 */}
      <FloatingIcon style={{ top: '5%', left: '20%', color: '#f472b6' }}>
        <GiPencilBrush />
      </FloatingIcon>
      <FloatingIcon style={{ top: '10%', left: '40%', color: '#a78bfa', animationDelay: '0.5s' }}>
        <TbMathSymbols />
      </FloatingIcon>
      <FloatingIcon style={{ top: '6%', right: '20%', color: '#34d399', animationDelay: '1s' }}>
        <GiBookshelf />
      </FloatingIcon>
      <FloatingIcon style={{ top: '18%', right: '8%', color: '#fbbf24', animationDelay: '1.5s' }}>
        <FaCalculator />
      </FloatingIcon>
      
      {/* 闪烁星星 */}
      <StarIcon style={{ top: '12%', left: '12%' }}><IoStar /></StarIcon>
      <StarIcon style={{ top: '25%', right: '18%', animationDelay: '0.5s' }}><IoStar /></StarIcon>
      <StarIcon style={{ top: '40%', left: '6%', animationDelay: '1s' }}><IoStar /></StarIcon>
      <StarIcon style={{ bottom: '35%', right: '10%', animationDelay: '1.5s' }}><IoStar /></StarIcon>
      
      {/* 主卡片区域 */}
      <MainCardWrapper
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring', damping: 12 }}
      >
        <HandDrawnBorder />
        
        <CardContent>
          {/* 顶部魔法图标 */}
          <TopMagicIcon>
            <GiMagicSwirl />
          </TopMagicIcon>
          
          {/* 装饰徽章 */}
          <Badge
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GiStarSattelites style={{ marginRight: 8 }} />
            数学魔法课堂
            <GiStarSattelites style={{ marginLeft: 8 }} />
          </Badge>
          
          {/* 主标题 */}
          <MainTitle
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            有趣的算式
          </MainTitle>
          
          {/* 副标题 - 手绘风格 */}
          <SubtitleWrapper
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <GiSpellBook style={{ fontSize: '1.8rem', marginRight: 12, color: '#60a5fa' }} />
            第五单元 · 100以内数加与减（一）
          </SubtitleWrapper>

          {/* 课前播客 */}
          <PodcastBar
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
          >
            <SpeakerIcon $talking={isPlaying}>
              <SpeakerFace>
                <SpeakerEye style={{ left: '10px' }} />
                <SpeakerEye style={{ right: '10px' }} />
                <SpeakerMouth $talking={isPlaying} />
              </SpeakerFace>
            </SpeakerIcon>
            <PodcastInfo>
              <PodcastLabel>课前小电台</PodcastLabel>
              <PodcastTitle>有趣的算式小课堂</PodcastTitle>
            </PodcastInfo>
            <PlayButton onClick={toggleAudio}>
              {isPlaying ? '⏸' : '▶'}
            </PlayButton>
            <audio ref={audioRef} src="/audio/podcast.mp3" preload="none" />
          </PodcastBar>
          
          {/* 教师信息 */}
          <TeacherRow
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <InfoTag>
              <IoSchool style={{ fontSize: '1.5rem' }} />
              <span>石庆霞 老师</span>
            </InfoTag>
            <InfoTag>
              <IoCalendar style={{ fontSize: '1.4rem' }} />
              <span>2026年 5月</span>
            </InfoTag>
          </TeacherRow>
          
          {/* 开始按钮 */}
          <StartButton
            onClick={handleStart}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, type: 'spring' }}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <IoRocketSharp style={{ fontSize: '2rem' }} />
            <span>开始魔法之旅</span>
            <IoSparkles style={{ fontSize: '1.8rem' }} />
          </StartButton>
        </CardContent>
      </MainCardWrapper>
      
      {/* 左下角 - 学习的小孩 */}
      <BottomLeftDecor>
        <KidIcon><FaChild /></KidIcon>
        <BookIcon><GiBookshelf /></BookIcon>
      </BottomLeftDecor>
      
      {/* 右下角 - 火箭 */}
      <RocketWrapper>
        <RocketIcon><IoRocketSharp /></RocketIcon>
        <RocketSpark><IoSparkles /></RocketSpark>
      </RocketWrapper>
      
      {/* 装饰行星 */}
      <PlanetDecor>
        <IoPlanet />
      </PlanetDecor>
    </Container>
  )
}

// Styles
const Container = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Background = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    #dbeafe 0%,
    #bfdbfe 25%,
    #93c5fd 50%,
    #60a5fa 80%,
    #3b82f6 100%
  );
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 25%;
    background: linear-gradient(to top, rgba(56, 189, 248, 0.4), transparent);
  }
`

const CloudIcon = styled.div`
  position: absolute;
  color: rgba(255, 255, 255, 0.85);
  animation: ${floatRotate} 5s ease-in-out infinite;
  filter: drop-shadow(0 4px 15px rgba(255, 255, 255, 0.5));
`

const PaperPlaneWrapper = styled.div`
  position: absolute;
  top: 15%;
  left: 12%;
  font-size: 4.5rem;
  color: #0ea5e9;
  display: flex;
  align-items: center;
  animation: ${flyPath} 6s ease-in-out infinite;
  filter: drop-shadow(3px 5px 10px rgba(14, 165, 233, 0.4));
`

const PlaneTrail = styled.span`
  font-size: 2rem;
  color: #fbbf24;
  margin-left: -8px;
  opacity: 0.7;
`

const FloatingIcon = styled.div`
  position: absolute;
  font-size: 3.5rem;
  animation: ${float} 3.5s ease-in-out infinite;
  filter: drop-shadow(2px 4px 8px rgba(0, 0, 0, 0.15));
`

const StarIcon = styled.span`
  position: absolute;
  font-size: 2.2rem;
  color: #fbbf24;
  animation: ${twinkle} 2s ease-in-out infinite;
`

const MainCardWrapper = styled(motion.div)`
  position: relative;
  width: 75%;
  max-width: 750px;
  min-height: 380px;
  animation: ${float} 5s ease-in-out infinite;
`

const CardContent = styled.div`
  position: relative;
  z-index: 10;
  padding: 45px 55px;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const TopMagicIcon = styled.div`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 4rem;
  color: #a855f7;
  animation: ${wiggle} 2s ease-in-out infinite;
  filter: drop-shadow(0 4px 15px rgba(168, 85, 247, 0.5));
`

const Badge = styled(motion.div)`
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%);
  color: #92400e;
  padding: 10px 28px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 20px;
  margin-top: 15px;
  box-shadow: 
    0 4px 20px rgba(251, 191, 36, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.5);
  animation: ${bounce} 2.5s ease-in-out infinite;
`

const MainTitle = styled(motion.h1)`
  font-size: 5.5rem;
  font-weight: 900;
  color: #1d4ed8;
  margin: 0 0 20px;
  letter-spacing: 0.1em;
  text-shadow: 
    4px 4px 0 #fff,
    6px 6px 0 #93c5fd,
    8px 8px 20px rgba(29, 78, 216, 0.3);
  
  @media (max-width: 768px) {
    font-size: 3.5rem;
  }
`

const SubtitleWrapper = styled(motion.div)`
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  color: #1e40af;
  font-weight: 600;
  margin-bottom: 25px;
  padding: 12px 30px;
  background: linear-gradient(90deg, 
    rgba(219, 234, 254, 0.8), 
    rgba(191, 219, 254, 0.9), 
    rgba(219, 234, 254, 0.8)
  );
  border-radius: 30px;
  border: 2px dashed #93c5fd;
`

const TeacherRow = styled(motion.div)`
  display: flex;
  gap: 25px;
  margin-bottom: 30px;
`

const InfoTag = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  color: #3b82f6;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 22px;
  border-radius: 20px;
  border: 2px solid #bfdbfe;
  box-shadow: 0 3px 12px rgba(59, 130, 246, 0.15);
`

const StartButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px 55px;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #f97316 0%, #fb923c 30%, #fbbf24 70%, #facc15 100%);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 
    0 8px 30px rgba(249, 115, 22, 0.5),
    0 4px 15px rgba(251, 191, 36, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
  animation: ${pulse} 1.8s ease-in-out infinite;
  
  &:hover {
    animation: none;
  }
`

const PodcastBar = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #bfdbfe;
  border-radius: 50px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.12);
`

const SpeakerIcon = styled.div<{ $talking: boolean }>`
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
  animation: ${props => props.$talking ? `${speakerBounce} 0.4s ease-in-out infinite` : 'none'};
`

const SpeakerFace = styled.div`
  position: absolute;
  inset: 0;
`

const SpeakerEye = styled.div`
  position: absolute;
  top: 12px;
  width: 5px;
  height: 5px;
  background: #1e293b;
  border-radius: 50%;
`

const SpeakerMouth = styled.div<{ $talking: boolean }>`
  position: absolute;
  bottom: 9px;
  left: 50%;
  width: 14px;
  height: 7px;
  background: #1e293b;
  border-radius: 0 0 14px 14px;
  transform-origin: top center;
  animation: ${props => props.$talking ? `${talkMouth} 0.25s ease-in-out infinite alternate` : 'none'};
`

const PodcastInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

const PodcastLabel = styled.span`
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
`

const PodcastTitle = styled.span`
  font-size: 0.95rem;
  color: #1e40af;
  font-weight: 700;
`

const PlayButton = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(59, 130, 246, 0.4);
  transition: transform 0.15s ease;
  
  &:hover {
    transform: scale(1.08);
  }
  
  &:active {
    transform: scale(0.95);
  }
`

const BottomLeftDecor = styled.div`
  position: absolute;
  bottom: 5%;
  left: 4%;
  display: flex;
  align-items: flex-end;
  gap: 8px;
`

const KidIcon = styled.div`
  font-size: 5.5rem;
  color: #f472b6;
  animation: ${bounce} 2s ease-in-out infinite;
  filter: drop-shadow(3px 5px 10px rgba(244, 114, 182, 0.4));
`

const BookIcon = styled.div`
  font-size: 4rem;
  color: #a78bfa;
  animation: ${float} 3s ease-in-out infinite;
  animation-delay: 0.5s;
  filter: drop-shadow(2px 4px 8px rgba(167, 139, 250, 0.4));
`

const RocketWrapper = styled.div`
  position: absolute;
  bottom: 8%;
  right: 5%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const RocketIcon = styled.div`
  font-size: 6rem;
  color: #ef4444;
  animation: ${rocketFly} 3s ease-in-out infinite;
  filter: drop-shadow(3px 5px 15px rgba(239, 68, 68, 0.5));
`

const RocketSpark = styled.div`
  font-size: 2.5rem;
  color: #fbbf24;
  margin-top: -20px;
  animation: ${twinkle} 0.4s ease-in-out infinite;
`

const PlanetDecor = styled.div`
  position: absolute;
  top: 30%;
  right: 3%;
  font-size: 4.5rem;
  color: #a78bfa;
  animation: ${floatRotate} 8s ease-in-out infinite;
  filter: drop-shadow(2px 4px 12px rgba(167, 139, 250, 0.5));
`
