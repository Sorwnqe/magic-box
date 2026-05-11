import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import styled from '@emotion/styled'
import MysticBackground from './MysticBackground'

interface Props {
  onContinue: () => void
  onBack: () => void
}

// ========== 色块配置 ==========
const BLOCKS = [
  { x: 28,  y: 60,  w: 152, h: 330, r: 20, color: 'rgba(96,  165, 250, 0.78)', delay: 0.3 }, // 耳
  { x: 188, y: 64,  w: 208, h: 98,  r: 16, color: 'rgba(251, 146, 60,  0.78)', delay: 1.0 }, // 丷
  { x: 192, y: 164, w: 208, h: 100, r: 16, color: 'rgba(248, 113, 113, 0.78)', delay: 1.7 }, // 口
  { x: 188, y: 268, w: 208, h: 128, r: 16, color: 'rgba(34,  197, 94,  0.90)', delay: 2.4 }, // 心
]

// ========== react-icons 图标配置 ==========
const ICON_POSITIONS = [
  { delay: 0.8,  x: 102, y: 344, size: 40, emoji: '👂', color: '#fff' }, // 耳下面
  { delay: 1.5,  x: 272, y: 100, size: 38, emoji: '👀', color: '#fff' }, // 眼上面
  { delay: 2.2,  x: 266, y: 202, size: 32, emoji: '👄', color: '#fff' }, // 口里面
  { delay: 2.9,  x: 292, y: 324, size: 32, emoji: '❤️', color: '#fff' }, // 心里面
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
                style={{
                  color: icon.color,
                  fontSize: icon.size,
                  filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.55)) drop-shadow(0 2px 4px rgba(0,0,0,0.45))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                {icon.emoji}
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
