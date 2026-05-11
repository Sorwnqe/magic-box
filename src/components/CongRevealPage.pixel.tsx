import { useRef, useEffect, useState } from 'react'
import styled from '@emotion/styled'
import MysticBackground from './MysticBackground'

interface Props {
  onContinue: () => void
  onBack: () => void
}

// 区域配置：裁剪矩形 + 颜色
const REGIONS = [
  { name: 'ear',  x: 0,   y: 0,   w: 155, h: 360, color: [251, 191, 36] },  // 金
  { name: 'top',  x: 155, y: 0,   w: 205, h: 82,  color: [192, 132, 252] }, // 紫
  { name: 'mid',  x: 155, y: 82,  w: 205, h: 88,  color: [129, 140, 248] }, // 蓝
  { name: 'bot',  x: 155, y: 170, w: 205, h: 190, color: [244, 114, 182] }, // 粉
]

export default function CongRevealPage({ onContinue, onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const [showBtn, setShowBtn] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 460
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = size + 'px'
    canvas.style.height = size + 'px'
    ctx.scale(dpr, dpr)

    // 1. 创建4个区域的像素数据
    const regionImages: ImageData[] = []

    REGIONS.forEach(r => {
      const off = document.createElement('canvas')
      off.width = size
      off.height = size
      const octx = off.getContext('2d')!

      // 先画白色矩形（clip 区域）
      octx.fillStyle = 'white'
      octx.fillRect(r.x, r.y, r.w, r.h)

      // 只保留矩形和字的交集
      octx.globalCompositeOperation = 'source-in'

      // 画"聪"字（白色）
      octx.font = `900 300px system-ui, -apple-system, sans-serif`
      octx.textAlign = 'center'
      octx.textBaseline = 'middle'
      octx.fillStyle = 'white'
      octx.fillText('聪', size / 2, size / 2)

      // 获取像素并替换颜色
      const img = octx.getImageData(0, 0, size, size)
      const d = img.data
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] > 100 && d[i + 3] > 0) {
          d[i] = r.color[0]
          d[i + 1] = r.color[1]
          d[i + 2] = r.color[2]
        }
      }
      regionImages.push(img)
    })

    // 2. 动画循环
    const delays = [0.3, 1.0, 1.7, 2.4]
    const durations = [0.7, 0.7, 0.7, 0.7]
    const startTime = performance.now()
    let btnShown = false

    const draw = () => {
      const elapsed = (performance.now() - startTime) / 1000
      ctx.clearRect(0, 0, size, size)

      let allDone = true

      REGIONS.forEach((_, i) => {
        if (elapsed < delays[i]) {
          allDone = false
          return
        }

        const t = Math.min((elapsed - delays[i]) / durations[i], 1)
        const ease = t >= 1 ? 1 : 1 - Math.pow(1 - t, 3)

        if (t < 1) allDone = false

        // 创建临时 canvas 来应用透明度
        const tmp = document.createElement('canvas')
        tmp.width = size
        tmp.height = size
        const tctx = tmp.getContext('2d')!
        tctx.putImageData(regionImages[i], 0, 0)

        ctx.save()
        ctx.globalAlpha = ease
        ctx.drawImage(tmp, 0, 0)
        ctx.restore()
      })

      if (allDone && !btnShown) {
        btnShown = true
        setShowBtn(true)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <Container>
      <BgGradient />
      <MysticBackground />

      <CanvasWrap>
        <canvas ref={canvasRef} />
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
  width: 360px;
  height: 360px;
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

  &:hover {
    opacity: 0.8;
  }
`
