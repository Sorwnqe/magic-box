import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { playSuccess } from '../hooks/useSound'
import { GiTreasureMap, GiKey } from 'react-icons/gi'

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

export default function MagicEnding({ onRestart }: MagicEndingProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => { playSuccess() }, [])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      const next = !isMuted
      videoRef.current.muted = next
      setIsMuted(next)
      if (!next && !isPlaying) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
      }
    }
  }

  return (
    <Container>
      {/* 魔法背景 */}
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
          <PreviewPhase
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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

              <VideoCard
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 14 }}
              >
                <VideoContainer>
                  <VideoPlayer
                    ref={videoRef}
                    src="/video/mofaleyuan.mp4"
                    loop
                    playsInline
                  />
                </VideoContainer>
                <PlayPauseButton onClick={togglePlay}>
                  {isPlaying ? '⏸ 暂停' : '▶ 播放'}
                </PlayPauseButton>
                <SoundButton onClick={toggleMute}>
                  {isMuted ? '🔇 开启声音' : '🔊 声音已开'}
                </SoundButton>
              </VideoCard>

              <RestartButton
                onClick={onRestart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 再来一次
              </RestartButton>
            </PreviewPhase>
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

const VideoCard = styled(motion.div)`
  z-index: 10;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 3px solid ${COLORS.gold}44;
`

const VideoContainer = styled.div`
  height: 72vh;
  max-height: 680px;
  width: auto;
  overflow: hidden;
  position: relative;
  background: #000;
  border-radius: 16px;
`

const VideoPlayer = styled.video`
  height: 100%;
  width: auto;
  display: block;
`

const PlayPauseButton = styled.button`
  position: absolute;
  bottom: 16px;
  left: 16px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  z-index: 20;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    border-color: rgba(255, 255, 255, 0.5);
  }
`

const SoundButton = styled.button`
  position: absolute;
  bottom: 16px;
  right: 16px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  z-index: 20;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    border-color: rgba(255, 255, 255, 0.5);
  }
`

const RestartButton = styled(motion.button)`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 40px;
  background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.purple} 100%);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.5);
  z-index: 20;
`
