import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
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
  accent: '#f59e0b',
  bgDark: '#0f172a',
  textPrimary: '#f8fafc',
}

const sparkleAnim = keyframes`
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 0.8; transform: scale(1.2); }
`

interface Stage5VideoProps {
  onContinue: () => void
  onBack?: () => void
}

export default function Stage5Video({ onContinue, onBack }: Stage5VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

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

  const handleContinue = () => { playClick(); onContinue() }
  const handleBack = () => { playClick(); onBack?.() }

  return (
    <Container>
      <BackgroundGradient />

      <ParticleLayer>
        {Array.from({ length: 15 }).map((_, i) => (
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
        <VideoCard
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14 }}
        >
          <VideoContainer>
            <VideoPlayer
              ref={videoRef}
              src="/video/stairs_transition.mp4"
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

        <ButtonRow
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {onBack && (
            <BackButton
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBack}
            >
              <IoChevronBack />
              <span>返回</span>
            </BackButton>
          )}
          <ContinueButton
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleContinue}
          >
            <span>继续探索</span>
            <IoChevronForward />
          </ContinueButton>
        </ButtonRow>
      </ContentWrapper>
    </Container>
  )
}

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
  gap: 28px;
  padding: 30px 40px;
`

const VideoCard = styled(motion.div)`
  z-index: 10;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 3px solid ${COLORS.gold}44;
  position: relative;
`

const VideoContainer = styled.div`
  height: 68vh;
  max-height: 640px;
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

const ButtonRow = styled(motion.div)`
  display: flex;
  gap: 14px;
  align-items: center;
`

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 26px;
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
  padding: 14px 40px;
  font-size: 1.2rem;
  font-weight: 800;
  color: white;
  background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.purple});
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(79, 70, 229, 0.5);
  svg { font-size: 1.3rem; }
`
