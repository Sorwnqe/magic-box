import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import styled from '@emotion/styled'
import MysticBackground from './MysticBackground'

interface Props {
  onContinue: () => void
  onBack: () => void
}

// ========== 色块配置（对齐 340px 楷书偏旁） ==========
const BLOCKS = [
  { x: 28, y: 60, w: 152, h: 330, r: 20, color: 'rgba(96,  165, 250, 0.78)', delay: 0.3 }, // 耳
  { x: 188, y: 64, w: 208, h: 98, r: 16, color: 'rgba(251, 146, 60,  0.78)', delay: 1.0 }, // 丷
  { x: 192, y: 164, w: 208, h: 100, r: 16, color: 'rgba(248, 113, 113, 0.78)', delay: 1.7 }, // 口
  { x: 188, y: 268, w: 208, h: 128, r: 16, color: 'rgba(34,  197, 94,  0.90)', delay: 2.4 }, // 心
]

// ========== 可爱 SVG 图标（带颜色+描边） ==========

/** 耳朵 */
function EarIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M5.5 7.5C5.5 2 9.5 0 12 0s6.5 2 6.5 7.5c0 2.8-1.5 5.2-3.2 6.2V18c0 1-.8 1.8-1.8 1.8h-3c-1 0-1.8-.8-1.8-1.8v-4.3C6.7 12.7 5.5 10.3 5.5 7.5z"
        fill="#fecaca"
        stroke="#f43f5e"
        strokeWidth="1.3"
      />
      <path
        d="M9 7.5c0-2.2 1.3-3.5 3-3.5s3 1.3 3 3.5c0 1.5-.7 2.8-1.5 3.3"
        fill="none"
        stroke="#f43f5e"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="10.5" r="1.4" fill="#f43f5e" opacity="0.5" />
    </svg>
  )
}

/** 眼睛 */
function EyeIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <ellipse cx="12" cy="12" rx="11" ry="7.5" fill="white" stroke="#3b82f6" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4.5" fill="#2563eb" />
      <circle cx="12" cy="12" r="2.3" fill="#1e3a8a" />
      <circle cx="10.5" cy="10" r="1.7" fill="white" />
      <path d="M3 10c2-1.2 4-1.8 6-1.8M21 10c-2-1.2-4-1.8-6-1.8" stroke="#3b82f6" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/** 口 — 圆脸 O 型嘴 */
function MouthIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10.5" fill="#fecaca" stroke="#ef4444" strokeWidth="1.2" />
      <circle cx="8" cy="9" r="1.2" fill="#374151" />
      <circle cx="16" cy="9" r="1.2" fill="#374151" />
      <circle cx="6.5" cy="12.5" r="1.4" fill="#f87171" opacity="0.35" />
      <circle cx="17.5" cy="12.5" r="1.4" fill="#f87171" opacity="0.35" />
      <ellipse cx="12" cy="15.5" rx="3" ry="3.5" fill="#dc2626" />
      <rect x="10.2" y="13.2" width="3.6" height="2" rx="0.6" fill="white" />
      <ellipse cx="12" cy="17.5" rx="1.6" ry="0.7" fill="#f87171" />
    </svg>
  )
}

/** 心 */
function HeartIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="#f43f5e"
        stroke="#e11d48"
        strokeWidth="1.2"
      />
      <ellipse cx="9.5" cy="7.5" rx="2" ry="1.3" fill="white" opacity="0.7" />
    </svg>
  )
}

// 图标位置（整体下移 30，对准各偏旁中心）
const ICON_POSITIONS = [
  { delay: 0.8, x: 102, y: 344, size: 44, Component: EarIcon },   // 耳下面
  { delay: 1.5, x: 258, y: 108, size: 40, Component: EyeIcon },   // 眼上面
  { delay: 2.2, x: 264, y: 206, size: 38, Component: MouthIcon }, // 口里面
  { delay: 2.9, x: 270, y: 320, size: 44, Component: HeartIcon }, // 心里面
]

export default function CongRevealPage({ onContinue, onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const [showBtn, setShowBtn] = useState(false)
  const [visibleIcons, setVisibleIcons] = useState<boolean[]>([false, false, false, false])

  useEffect(() => {
    const fontPromise = document.fonts.load('1px KaiTi, STKaiti, "华文楷体", serif').catch(() => null)

    const timers = ICON_POSITIONS.map((icon, i) =>
      setTimeout(() => {
        setVisibleIcons(prev => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, icon.delay * 1000)
    )

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 400
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = size + 'px'
    canvas.style.height = size + 'px'
    ctx.scale(dpr, dpr)

    const startTime = performance.now()
    let btnShown = false

    const draw = () => {
      const elapsed = (performance.now() - startTime) / 1000
      ctx.clearRect(0, 0, size, size)

      let allDone = true

      BLOCKS.forEach(b => {
        if (elapsed < b.delay) {
          allDone = false
          return
        }

        const t = Math.min((elapsed - b.delay) / 0.7, 1)
        const ease = t >= 1 ? 1 : 1 - Math.pow(1 - t, 3)
        if (t < 1) allDone = false

        const cx = b.x + b.w / 2
        const cy = b.y + b.h / 2
        const scale = 0.85 + ease * 0.15

        ctx.save()
        ctx.globalAlpha = ease
        ctx.translate(cx, cy)
        ctx.scale(scale, scale)
        ctx.translate(-cx, -cy)

        ctx.beginPath()
        ctx.roundRect(b.x, b.y, b.w, b.h, b.r)
        ctx.fillStyle = b.color
        ctx.fill()

        ctx.strokeStyle = 'rgba(255,255,255,0.5)'
        ctx.lineWidth = 3
        ctx.stroke()

        ctx.restore()
      })

      // 楷书"聪"字（380px，下移对准色块）
      ctx.save()
      ctx.font = `500 380px KaiTi, STKaiti, "华文楷体", serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 3
      ctx.strokeText('聪', size / 2, size / 2 + 8)

      ctx.fillStyle = 'rgba(18, 18, 32, 0.92)'
      ctx.fillText('聪', size / 2, size / 2 + 8)
      ctx.restore()

      if (allDone && !btnShown) {
        btnShown = true
        setShowBtn(true)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    fontPromise.then(() => {
      animRef.current = requestAnimationFrame(draw)
    })

    return () => {
      cancelAnimationFrame(animRef.current)
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <Container>
      <BgGradient />
      <MysticBackground />

      <CanvasWrap>
        <canvas ref={canvasRef} />
        {ICON_POSITIONS.map((icon, i) =>
          visibleIcons[i] ? (
            <IconOverlay
              key={i}
              style={{
                left: `${icon.x}px`,
                top: `${icon.y}px`,
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', bounce: 0.35 }}
                style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))' }}
              >
                <icon.Component size={icon.size} />
              </motion.div>
            </IconOverlay>
          ) : null
        )}
      </CanvasWrap>

      {showBtn && (
        <BtnWrap>
          <PlainBtn onClick={onBack}>返回</PlainBtn>
          <PlainBtn onClick={onContinue}>继续探索</PlainBtn>
        </BtnWrap>
      )}
    </Container>
  )
}

// ========== Styles ==========

const BgGradient = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 40%, rgba(79, 70, 229, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 60%, rgba(251, 191, 36, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
`

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  gap: 50px;
`

const CanvasWrap = styled.div`
  position: relative;
  z-index: 2;
  width: 400px;
  height: 400px;
`

const IconOverlay = styled.div`
  position: absolute;
  z-index: 3;
  transform: translate(-50%, -50%);
  pointer-events: none;
`

const BtnWrap = styled.div`
  display: flex;
  gap: 48px;
  align-items: center;
  z-index: 2;
`

const PlainBtn = styled.button`
  font-size: 1.5rem;
  font-weight: 700;
  color: #fbbf24;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 16px;
  transition: opacity 0.2s;
  &:hover { opacity: 0.8; }
`
