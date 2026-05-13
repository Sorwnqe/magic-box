import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { playSuccess, playClick } from '../hooks/useSound'
import { IoStar, IoChevronBack, IoPlay, IoPause } from 'react-icons/io5'

interface MagicEndingProps {
  onRestart: () => void
  onBack?: () => void
}
/**
 * suno提示词：
 * create a cheerful kids nursery rhyme instrumental with bright playful melodies soft bouncy drums and a happy description vibe use colorful sounds like xylophone piano bells and nursery rhyme whistles with simple repeating patterns and catchy rhythm v4 5 all add light claps and gentle bass tempo around 90 110 bpm inspired by Children's Music, Educational style fun energetic and easy for introducing gemini kids to sing along
 */

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
  goldLight: '#fde68a',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
}

// ========== 本地音频 + 歌词 ==========
// 支持标准 LRC 格式歌词：[mm:ss.xx]歌词文本
// 直接把 LRC 文本粘贴到 LRC_TEXT 里即可，代码会自动解析
const AUDIO_SRC = '/audio/class.mp3'
const COVER_SRC = '/class-full.png'

// ↓↓↓ 把你的 LRC 歌词直接粘贴在这里 ↓↓↓
const LRC_TEXT = `
[ti:有趣的算式]
[ar:石庆霞]
[al:石庆霞]
[by:东前进小学一年级-石庆霞]
[00:01.20]作者：东前进小学一年级-石庆霞
[00:04.41]数学魔盒变魔术
[00:06.70]两位数字来跳舞
[00:09.14]十位个位换位置
[00:11.30]新的数字就变出
[00:15.61]有趣算式真奇妙
[00:17.85]交换数字有诀窍
[00:20.03]个位十位加一加
[00:22.25]数字相同真乖巧
[00:26.83]和是四四五十五
[00:29.16]九十九也难不倒
[00:31.30]有序思考不重复
[00:33.46]认真动脑学得好
[00:37.94]竖着看 横着瞧
[00:40.11]算式规律能找到
[00:42.39]用耳朵 仔细听
[00:44.64]用眼睛 认真瞧
[00:46.82]开口说 用心想
[00:49.04]我们都是聪明宝
[01:02.43]有趣算式真奇妙
[01:04.64]交换数字有诀窍
[01:06.83]个位十位加一加
[01:09.07]数字相同真乖巧
[01:13.57]数学世界乐趣绕
[01:15.74]善于观察多思考
[01:17.79]开开心心学知识
[01:20.01]快乐成长步步高

[01:24.56]竖着看 横着瞧
[01:26.74]算式规律能找到
[01:29.02]用耳朵 仔细听
[01:31.24]用眼睛 认真瞧
[01:33.52]开口说 用心想
[01:35.77]我们都是聪明宝
[01:49.38]有趣算式真奇妙
[01:51.31]交换数字有诀窍
[01:53.53]个位十位加一加
[01:55.82]数字相同真乖巧
`

// 解析 LRC 文本为 { time, text } 数组
function parseLRC(lrc: string): { time: number; text: string }[] {
  const lines = lrc.trim().split('\n')
  const result: { time: number; text: string }[] = []
  const regex = /^\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\](.*)$/

  for (const line of lines) {
    const match = line.trim().match(regex)
    if (match) {
      const m = parseInt(match[1], 10)
      const s = parseInt(match[2], 10)
      const msStr = match[3] || '0'
      const ms = parseInt(msStr.padEnd(3, '0').slice(0, 3), 10)
      const time = m * 60 + s + ms / 1000
      const text = match[4].trim()
      if (text) result.push({ time, text })
    }
  }

  return result.sort((a, b) => a.time - b.time)
}

const LYRICS = parseLRC(LRC_TEXT)

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function MagicEnding({ onRestart, onBack }: MagicEndingProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lyricRefs = useRef<(HTMLDivElement | null)[]>([])
  const lyricContainerRef = useRef<HTMLDivElement | null>(null)
  const topSpacerRef = useRef<HTMLDivElement | null>(null)
  const bottomSpacerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    playSuccess()
  }, [])

  // 动态设置上下 spacer 高度为容器的一半，确保歌词始终能居中
  useEffect(() => {
    const container = lyricContainerRef.current
    const top = topSpacerRef.current
    const bottom = bottomSpacerRef.current
    if (!container || !top || !bottom) return

    const update = () => {
      const h = container.clientHeight / 2
      top.style.height = `${h}px`
      bottom.style.height = `${h}px`
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  // 播放/暂停
  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().catch(() => {})
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  // 进度条拖动
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const t = Number(e.target.value)
    audio.currentTime = t
    setCurrentTime(t)
  }

  // 计算当前歌词行
  const getLyricIndex = useCallback((time: number) => {
    if (LYRICS.length === 0) return -1
    let idx = 0
    for (let i = 0; i < LYRICS.length; i++) {
      if (time >= LYRICS[i].time) idx = i
      else break
    }
    return idx
  }, [])

  // 歌词滚动到中间
  const scrollLyricToCenter = useCallback((index: number) => {
    const container = lyricContainerRef.current
    const el = lyricRefs.current[index]
    if (!container || !el) return
    const containerH = container.clientHeight
    const elTop = el.offsetTop
    const elH = el.clientHeight
    container.scrollTo({
      top: elTop - containerH / 2 + elH / 2,
      behavior: 'smooth',
    })
  }, [])

  // 初始加载后把第一句滚动到中间
  useEffect(() => {
    const timer = setTimeout(() => {
      if (LYRICS.length > 0) {
        scrollLyricToCenter(0)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [scrollLyricToCenter])

  // timeupdate 事件
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      const idx = getLyricIndex(audio.currentTime)
      if (idx !== currentLyricIndex && idx >= 0) {
        setCurrentLyricIndex(idx)
        scrollLyricToCenter(idx)
      }
    }
    const onLoaded = () => setDuration(audio.duration || 0)
    const onEnded = () => setIsPlaying(false)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnded)
    }
  }, [currentLyricIndex, getLyricIndex, scrollLyricToCenter])

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
        <MusicCard
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <audio ref={audioRef} src={AUDIO_SRC} preload="metadata" />

          {/* 主体：左侧封面 + 右侧歌词 */}
          <PlayerBody>
            {/* 左侧：封面 + 歌曲信息 */}
            <LeftPanel>
              <CoverWrapper onClick={togglePlay}>
                <CoverImage src={COVER_SRC} alt="歌曲封面" />
              </CoverWrapper>
              <SongInfo>
                <SongTitle>有趣的算式之旅</SongTitle>
                <SongAuthor>一年级石庆霞</SongAuthor>
              </SongInfo>
            </LeftPanel>

            <PanelDivider />

            {/* 右侧：歌词轮播 */}
            <RightPanel>
              <LyricContainer ref={lyricContainerRef}>
                <LyricSpacer ref={topSpacerRef} />
                {LYRICS.length === 0 && (
                  <EmptyLyric>暂无歌词，请在代码中添加</EmptyLyric>
                )}
                {LYRICS.map((line, i) => (
                  <LyricLine
                    key={i}
                    ref={el => { lyricRefs.current[i] = el }}
                    $active={i === currentLyricIndex}
                  >
                    {line.text}
                  </LyricLine>
                ))}
                <LyricSpacer ref={bottomSpacerRef} />
              </LyricContainer>
            </RightPanel>
          </PlayerBody>

          {/* 底部控制栏 */}
          <PlayerControls>
            <TimeLabel>{formatTime(currentTime)}</TimeLabel>
            <ProgressBar
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
            />
            <TimeLabel>{formatTime(duration)}</TimeLabel>
            <PlayButtonSmall
              onClick={togglePlay}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isPlaying ? <IoPause /> : <IoPlay />}
            </PlayButtonSmall>
          </PlayerControls>
        </MusicCard>

        {/* 返回 + 再来一次 */}
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

const MusicCard = styled(motion.div)`
  position: relative;
  width: 720px;
  height: 480px;
  max-width: 90vw;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.97), rgba(15, 23, 42, 0.97));
  border: 2px solid rgba(139, 92, 246, 0.35);
  border-radius: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), inset 0 0 30px rgba(139, 92, 246, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const PlayerBody = styled.div`
  flex: 1;
  display: flex;
  align-items: stretch;
  padding: 32px 32px 16px;
  gap: 24px;
  min-height: 0;
`

const LeftPanel = styled.div`
  width: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-shrink: 0;
`

const CoverWrapper = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid rgba(139, 92, 246, 0.35);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), 0 0 24px rgba(139, 92, 246, 0.12);
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.04);
    box-shadow: 0 14px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.2);
  }
`

const CoverImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const SongInfo = styled.div`
  text-align: center;
`

const SongTitle = styled.div`
  font-size: 1.3rem;
  font-weight: 800;
  color: ${COLORS.gold};
  letter-spacing: 0.06em;
  text-shadow: 0 0 14px rgba(251, 191, 36, 0.2);
`

const SongAuthor = styled.div`
  margin-top: 6px;
  font-size: 0.9rem;
  color: ${COLORS.textSecondary};
  opacity: 0.75;
`

const PanelDivider = styled.div`
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(139, 92, 246, 0.3), transparent);
  flex-shrink: 0;
`

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
`

const LyricContainer = styled.div`
  flex: 1;
  width: 100%;
  overflow-y: auto;
  padding: 0 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 12%,
    black 88%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 12%,
    black 88%,
    transparent 100%
  );
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`

const LyricSpacer = styled.div`
  flex-shrink: 0;
`

const EmptyLyric = styled.div`
  color: ${COLORS.textSecondary};
  font-size: 1rem;
  opacity: 0.5;
`

const LyricLine = styled.div<{ $active: boolean }>`
  font-size: ${props => props.$active ? '1.25rem' : '1rem'};
  font-weight: ${props => props.$active ? '800' : '500'};
  color: ${props => props.$active ? COLORS.goldLight : COLORS.textSecondary};
  text-align: center;
  line-height: 1.6;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-shadow: ${props => props.$active ? '0 0 20px rgba(251, 191, 36, 0.3)' : 'none'};
  transform: ${props => props.$active ? 'scale(1.06)' : 'scale(1)'};
`

const PlayerControls = styled.div`
  width: 100%;
  padding: 12px 32px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`

const TimeLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${COLORS.textSecondary};
  min-width: 36px;
  text-align: center;
  font-variant-numeric: tabular-nums;
`

const ProgressBar = styled.input`
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    background: ${COLORS.gold};
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
    cursor: pointer;
    transition: transform 0.2s;
  }
  &::-webkit-slider-thumb:hover {
    transform: scale(1.3);
  }
  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: ${COLORS.gold};
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
    cursor: pointer;
    border: none;
  }
`

const PlayButtonSmall = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.purple});
  color: white;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.5);
  flex-shrink: 0;
  svg { margin-left: 2px; }
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
