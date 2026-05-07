import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { playSuccess, playClick } from '../hooks/useSound'
import { IoStar, IoPlay, IoPause, IoReload, IoChevronBack } from 'react-icons/io5'

interface MagicEndingProps {
  onRestart: () => void
  onBack?: () => void
}

// 彩带位置预设
const CONFETTI_POSITIONS = [
  { left: 5, delay: 0 }, { left: 12, delay: 0.3 }, { left: 20, delay: 0.6 },
  { left: 28, delay: 0.9 }, { left: 35, delay: 1.2 }, { left: 42, delay: 1.5 },
  { left: 50, delay: 1.8 }, { left: 58, delay: 2.1 }, { left: 65, delay: 0.2 },
  { left: 72, delay: 0.5 }, { left: 80, delay: 0.8 }, { left: 88, delay: 1.1 },
  { left: 95, delay: 1.4 }, { left: 8, delay: 1.7 }, { left: 15, delay: 2.0 },
  { left: 25, delay: 2.3 }, { left: 33, delay: 0.1 }, { left: 40, delay: 0.4 },
  { left: 48, delay: 0.7 }, { left: 55, delay: 1.0 }, { left: 62, delay: 1.3 },
  { left: 70, delay: 1.6 }, { left: 78, delay: 1.9 }, { left: 85, delay: 2.2 },
  { left: 92, delay: 2.5 }, { left: 2, delay: 0.15 }, { left: 10, delay: 0.45 },
  { left: 18, delay: 0.75 }, { left: 45, delay: 1.05 }, { left: 75, delay: 1.35 },
]

// 星星位置预设
const STAR_POSITIONS = [
  { top: 8, left: 10, size: 3, delay: 0, duration: 3 },
  { top: 15, left: 25, size: 2, delay: 0.5, duration: 2.5 },
  { top: 5, left: 45, size: 4, delay: 1, duration: 3.5 },
  { top: 20, left: 60, size: 2, delay: 1.5, duration: 2 },
  { top: 10, left: 78, size: 3, delay: 0.3, duration: 4 },
  { top: 25, left: 90, size: 2, delay: 0.8, duration: 2.8 },
  { top: 35, left: 5, size: 3, delay: 1.2, duration: 3.2 },
  { top: 40, left: 30, size: 2, delay: 0.2, duration: 2.2 },
  { top: 30, left: 55, size: 4, delay: 1.8, duration: 3.8 },
  { top: 45, left: 72, size: 2, delay: 0.6, duration: 2.6 },
  { top: 38, left: 85, size: 3, delay: 1.4, duration: 3 },
  { top: 55, left: 15, size: 2, delay: 0.4, duration: 2.4 },
  { top: 50, left: 40, size: 3, delay: 1.1, duration: 3.3 },
  { top: 60, left: 65, size: 2, delay: 0.9, duration: 2.1 },
  { top: 52, left: 82, size: 4, delay: 1.6, duration: 3.6 },
  { top: 70, left: 8, size: 2, delay: 0.7, duration: 2.9 },
  { top: 68, left: 35, size: 3, delay: 1.3, duration: 3.1 },
  { top: 75, left: 58, size: 2, delay: 0.1, duration: 2.3 },
  { top: 72, left: 80, size: 3, delay: 1.9, duration: 3.4 },
  { top: 85, left: 20, size: 2, delay: 1.0, duration: 2.7 },
  { top: 82, left: 48, size: 4, delay: 0.35, duration: 3.7 },
  { top: 88, left: 70, size: 2, delay: 1.7, duration: 2.5 },
  { top: 90, left: 92, size: 3, delay: 0.55, duration: 3.2 },
]

// 魔法符号位置预设
const MAGIC_SYMBOLS = [
  { symbol: '✦', top: 12, left: 18, delay: 0, duration: 5 },
  { symbol: '✧', top: 22, left: 85, delay: 1.2, duration: 6 },
  { symbol: '✨', top: 35, left: 8, delay: 0.8, duration: 4.5 },
  { symbol: '★', top: 45, left: 92, delay: 2, duration: 5.5 },
  { symbol: '✦', top: 58, left: 22, delay: 0.4, duration: 6.5 },
  { symbol: '✧', top: 65, left: 75, delay: 1.6, duration: 4 },
  { symbol: '✨', top: 78, left: 12, delay: 0.2, duration: 5 },
  { symbol: '★', top: 82, left: 88, delay: 1, duration: 6 },
  { symbol: '✦', top: 30, left: 48, delay: 1.8, duration: 4.8 },
  { symbol: '✧', top: 68, left: 50, delay: 0.6, duration: 5.2 },
]

// 光点位置预设
const GLOW_ORBS = [
  { top: 20, left: 15, color: '#8b5cf6', size: 80, delay: 0 },
  { top: 60, left: 80, color: '#4f46e5', size: 100, delay: 2 },
  { top: 80, left: 25, color: '#a78bfa', size: 60, delay: 1 },
  { top: 35, left: 70, color: '#6366f1', size: 90, delay: 3 },
  { top: 50, left: 40, color: '#818cf8', size: 70, delay: 1.5 },
]

const COLORS = {
  primary: '#4f46e5',
  success: '#22c55e',
  gold: '#fbbf24',
  accent: '#f59e0b',
  purple: '#8b5cf6',
}

export default function MagicEnding({ onRestart, onBack }: MagicEndingProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    playSuccess()
  }, [])

  const handleVideoEnd = () => {
    setVideoEnded(true)
    setIsPlaying(false)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play().catch(() => {})
      setIsPlaying(true)
      setVideoEnded(false)
    }
  }

  const handleReplay = () => {
    if (!videoRef.current) return
    videoRef.current.currentTime = 0
    videoRef.current.play().catch(() => {})
    setIsPlaying(true)
    setVideoEnded(false)
  }

  const handleBack = () => {
    playClick()
    onBack?.()
  }

  return (
    <Container>
      <BackgroundOverlay />

      {/* 神秘光晕 */}
      <GlowLayer>
        {GLOW_ORBS.map((orb, i) => (
          <GlowOrb
            key={i}
            style={{
              top: `${orb.top}%`,
              left: `${orb.left}%`,
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle, ${orb.color}33 0%, transparent 70%)`,
              animationDelay: `${orb.delay}s`,
            }}
          />
        ))}
      </GlowLayer>

      {/* 星星层 */}
      <StarLayer>
        {STAR_POSITIONS.map((s, i) => (
          <Star
            key={i}
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </StarLayer>

      {/* 魔法符号层 */}
      <SymbolLayer>
        {MAGIC_SYMBOLS.map((m, i) => (
          <MagicSymbol
            key={i}
            style={{
              top: `${m.top}%`,
              left: `${m.left}%`,
              animationDelay: `${m.delay}s`,
              animationDuration: `${m.duration}s`,
            }}
          >
            {m.symbol}
          </MagicSymbol>
        ))}
      </SymbolLayer>

      {/* 彩带效果 */}
      <ConfettiLayer>
        {CONFETTI_POSITIONS.map((p, i) => (
          <Confetti
            key={i}
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              backgroundColor: [COLORS.primary, COLORS.success, COLORS.gold, COLORS.accent, COLORS.purple][i % 5]
            }}
          />
        ))}
      </ConfettiLayer>

      <ContentWrapper>
        <VideoWrapper
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <video
            ref={videoRef}
            src="/video/mofaleyuan.mp4"
            playsInline
            onEnded={handleVideoEnd}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            style={{
              display: 'block',
              maxHeight: '65vh',
              maxWidth: '100%',
              width: 'auto',
              height: 'auto',
              borderRadius: '16px',
            }}
          />

          {/* 视频内叠加控制条 */}
          <VideoOverlay>
            <OverlayBtn onClick={togglePlay} whileTap={{ scale: 0.9 }}>
              {isPlaying ? <IoPause /> : <IoPlay />}
            </OverlayBtn>
            <OverlayBtn onClick={handleReplay} whileTap={{ scale: 0.9 }}>
              <IoReload />
            </OverlayBtn>
          </VideoOverlay>
        </VideoWrapper>

        {/* 返回 + 再来一次 放同一行 */}
        <BottomActions
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {onBack && (
            <ActionBtn onClick={handleBack} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <IoChevronBack />
              <span>返回</span>
            </ActionBtn>
          )}
          <ActionBtn onClick={onRestart} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} $primary>
            <IoStar />
            <span>再来一次</span>
          </ActionBtn>
        </BottomActions>
      </ContentWrapper>
    </Container>
  )
}

// ========== Animations ==========

const confettiFall = keyframes`
  0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
`

const starTwinkle = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.3); }
`

const floatUp = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
  50% { transform: translateY(-20px) rotate(5deg); opacity: 1; }
`

const pulseGlow = keyframes`
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
  50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.7; }
`

// ========== Styled Components ==========

const Container = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0f1e 0%, #0f172a 40%, #1a1040 70%, #0f172a 100%);
`

const BackgroundOverlay = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(79, 70, 229, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(251, 191, 36, 0.05) 0%, transparent 60%);
`

const GlowLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
`

const GlowOrb = styled.div`
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ${pulseGlow} 4s ease-in-out infinite;
  filter: blur(20px);
`

const StarLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
`

const Star = styled.div`
  position: absolute;
  background: #fbbf24;
  border-radius: 50%;
  box-shadow: 0 0 8px #fbbf24, 0 0 16px rgba(251, 191, 36, 0.5);
  animation: ${starTwinkle} ease-in-out infinite;
`

const SymbolLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
`

const MagicSymbol = styled.div`
  position: absolute;
  font-size: 1.4rem;
  color: rgba(251, 191, 36, 0.5);
  text-shadow: 0 0 12px rgba(251, 191, 36, 0.4);
  animation: ${floatUp} ease-in-out infinite;
`

const ConfettiLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
`

const Confetti = styled.div`
  position: absolute;
  top: -10px;
  width: 8px;
  height: 14px;
  border-radius: 2px;
  animation: ${confettiFall} 4s linear infinite;
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

const VideoWrapper = styled(motion.div)`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 420px;
  width: 100%;
`

const VideoOverlay = styled.div`
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 5;
  opacity: 0.85;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }
`

const OverlayBtn = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 1.1rem;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`

const BottomActions = styled(motion.div)`
  display: flex;
  gap: 16px;
  align-items: center;
`

const ActionBtn = styled(motion.button)<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${props => props.$primary ? '14px 40px' : '12px 28px'};
  font-size: ${props => props.$primary ? '1.2rem' : '1rem'};
  font-weight: ${props => props.$primary ? '800' : '700'};
  color: ${props => props.$primary ? 'white' : '#a78bfa'};
  background: ${props => props.$primary
    ? 'linear-gradient(135deg, #4f46e5, #8b5cf6)'
    : 'transparent'};
  border: ${props => props.$primary ? 'none' : '2px solid #a78bfa'};
  border-radius: 50px;
  cursor: pointer;
  box-shadow: ${props => props.$primary ? '0 10px 30px rgba(79, 70, 229, 0.5)' : 'none'};

  svg { font-size: ${props => props.$primary ? '1.4rem' : '1.1rem'}; }
`
