import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from '@emotion/styled'
import confetti from 'canvas-confetti'
import { useMagicBox } from '../stores/useMagicBox'
import { backgrounds, zootopiaColors as COLORS } from '../assets/images'
import { IoArrowDown, IoBackspace } from 'react-icons/io5'
import { MdClear } from 'react-icons/md'

// 线性粒子背景
function ParticleLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b']
    
    interface Particle {
      x: number; y: number; vx: number; vy: number
      color: string; size: number
    }
    
    const particles: Particle[] = []
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3 + 1.5
      })
    }

    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          
          if (dist < 180) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
            gradient.addColorStop(0, p1.color + '30')
            gradient.addColorStop(1, p2.color + '30')
            ctx.strokeStyle = gradient
            ctx.lineWidth = 1.5
            ctx.stroke()
          }
        }
      }
      
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color + '60'
        ctx.fill()
      })
      
      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <ParticleCanvas ref={canvasRef} />
}

// 魔法粒子类型
interface MagicParticle {
  x: number; y: number; vx: number; vy: number
  size: number; color: string; alpha: number; life: number
}

// 飞入数字动画状态
interface FlyingNumber {
  num: string
  progress: number  // 0-1
  startX: number
  startY: number
}

// 弹出数字动画状态
interface PoppingNumber {
  num: string
  progress: number  // 0-1
  scale: number
  y: number
}

// 2D Canvas 魔法盒组件
function MagicBoxCanvas({ 
  isSpinning, 
  isOpening, 
  displayNumber,
  hasNumber,
  flyingNumber,
  poppingNumber,
  glassBoxRef
}: { 
  isSpinning: boolean
  isOpening: boolean
  displayNumber: string
  hasNumber: boolean
  flyingNumber: FlyingNumber | null
  poppingNumber: PoppingNumber | null
  glassBoxRef: React.RefObject<HTMLDivElement | null>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const lidAngleRef = useRef(0)
  const particlesRef = useRef<MagicParticle[]>([])
  const floatPhaseRef = useRef(0)
  const spinAngleRef = useRef(0)
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 使用 CSS 尺寸（逻辑像素）
    const rect = canvas.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    
    // 如果尺寸无效，跳过绘制
    if (w <= 0 || h <= 0) {
      animationRef.current = requestAnimationFrame(draw)
      return
    }
    
    // 魔盒位置 - 使用 GlassBox 的中心位置
    let cx = w * 0.5
    let cy = h * 0.5
    if (glassBoxRef.current) {
      const boxRect = glassBoxRef.current.getBoundingClientRect()
      cx = boxRect.left + boxRect.width / 2
      cy = boxRect.top + boxRect.height / 2
    }
    
    ctx.clearRect(0, 0, w, h)
    
    // 更新浮动相位
    floatPhaseRef.current += 0.02
    const floatY = Math.sin(floatPhaseRef.current) * 8
    
    // 旋转动画
    if (isSpinning) {
      spinAngleRef.current += 0.15
    } else {
      spinAngleRef.current *= 0.95
    }
    
    // 盖子打开动画
    if (isOpening) {
      lidAngleRef.current = Math.min(lidAngleRef.current + 0.1, Math.PI * 0.7)
      // 适量魔法粒子
      if (Math.random() < 0.3 && particlesRef.current.length < 30) {
        const colors = ['#fbbf24', '#22c55e', '#8b5cf6']
        particlesRef.current.push({
          x: cx + (Math.random() - 0.5) * 100,
          y: cy - 80 + floatY,
          vx: (Math.random() - 0.5) * 8,
          vy: -Math.random() * 10 - 5,
          size: Math.random() * 10 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          life: 50
        })
      }
    } else {
      lidAngleRef.current = Math.max(lidAngleRef.current - 0.08, 0)
    }
    
    // 更新并绘制粒子
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.25 // 重力
      p.life--
      p.alpha = Math.min(p.life / 40, 1)
      
      if (p.life <= 0) return false
      
      ctx.save()
      ctx.globalAlpha = p.alpha
      ctx.beginPath()
      // 星星形状
      const spikes = 5
      const outerRadius = p.size
      const innerRadius = p.size / 2
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i * Math.PI) / spikes - Math.PI / 2
        const x = p.x + Math.cos(angle) * radius
        const y = p.y + Math.sin(angle) * radius
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fillStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = 15
      ctx.fill()
      ctx.restore()
      
      return true
    })
    
    ctx.save()
    ctx.translate(cx, cy + floatY)
    ctx.rotate(spinAngleRef.current)
    
    // 外圈光晕 - 更大
    const glowGradient = ctx.createRadialGradient(0, 0, 100, 0, 0, 250)
    glowGradient.addColorStop(0, 'rgba(139, 92, 246, 0.35)')
    glowGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.18)')
    glowGradient.addColorStop(1, 'rgba(139, 92, 246, 0)')
    ctx.fillStyle = glowGradient
    ctx.fillRect(-280, -280, 560, 560)
    
    // 装饰圆环 - 更大
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(0, 0, 180, 0, Math.PI * 2)
    ctx.stroke()
    
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.35)'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(0, 0, 210, 0, Math.PI * 2)
    ctx.stroke()
    
    // 魔盒主体 - 更大尺寸
    const boxSize = 160
    const boxTop = -40
    
    // 盒子阴影
    ctx.save()
    ctx.shadowColor = 'rgba(139, 92, 246, 0.5)'
    ctx.shadowBlur = 30
    ctx.shadowOffsetY = 15
    
    // 盒子主体 - 渐变填充
    const boxGradient = ctx.createLinearGradient(-boxSize/2, boxTop, boxSize/2, boxTop + boxSize)
    boxGradient.addColorStop(0, '#a78bfa')
    boxGradient.addColorStop(0.3, '#8b5cf6')
    boxGradient.addColorStop(0.7, '#7c3aed')
    boxGradient.addColorStop(1, '#6d28d9')
    
    ctx.fillStyle = boxGradient
    ctx.beginPath()
    ctx.roundRect(-boxSize/2, boxTop, boxSize, boxSize, 12)
    ctx.fill()
    ctx.restore()
    
    // 盒子装饰线
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(-boxSize/2 + 8, boxTop + 8, boxSize - 16, boxSize - 16, 8)
    ctx.stroke()
    
    // 金色装饰带
    ctx.fillStyle = '#fbbf24'
    ctx.fillRect(-8, boxTop, 16, boxSize)
    ctx.fillRect(-boxSize/2, boxTop + boxSize/2 - 8, boxSize, 16)
    
    // 中心宝石
    const gemGradient = ctx.createRadialGradient(0, boxTop + boxSize/2, 0, 0, boxTop + boxSize/2, 25)
    gemGradient.addColorStop(0, '#fef3c7')
    gemGradient.addColorStop(0.5, '#fbbf24')
    gemGradient.addColorStop(1, '#d97706')
    ctx.fillStyle = gemGradient
    ctx.beginPath()
    ctx.arc(0, boxTop + boxSize/2, 20, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3
    ctx.stroke()
    
    // 盒盖（可打开）
    ctx.save()
    ctx.translate(0, boxTop)
    ctx.rotate(-lidAngleRef.current)
    
    const lidHeight = 32
    const lidGradient = ctx.createLinearGradient(-boxSize/2 - 5, -lidHeight, boxSize/2 + 5, 0)
    lidGradient.addColorStop(0, '#c4b5fd')
    lidGradient.addColorStop(0.5, '#a78bfa')
    lidGradient.addColorStop(1, '#8b5cf6')
    
    ctx.fillStyle = lidGradient
    ctx.beginPath()
    ctx.roundRect(-boxSize/2 - 5, -lidHeight, boxSize + 10, lidHeight, [12, 12, 4, 4])
    ctx.fill()
    
    // 盒盖装饰
    ctx.fillStyle = '#fbbf24'
    ctx.fillRect(-8, -lidHeight, 16, lidHeight)
    
    // 盒盖顶部宝石
    const topGemGradient = ctx.createRadialGradient(0, -lidHeight/2, 0, 0, -lidHeight/2, 12)
    topGemGradient.addColorStop(0, '#fef3c7')
    topGemGradient.addColorStop(0.5, '#fbbf24')
    topGemGradient.addColorStop(1, '#d97706')
    ctx.fillStyle = topGemGradient
    ctx.beginPath()
    ctx.arc(0, -lidHeight/2, 10, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.restore()
    
    // 显示盒子里的数字（在盒子表面，只有当有数字且未打开时显示）
    if (hasNumber && !isOpening && !flyingNumber && displayNumber !== '?') {
      ctx.save()
      ctx.font = 'bold 52px var(--font-display), system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.shadowColor = 'rgba(139, 92, 246, 0.6)'
      ctx.shadowBlur = 10
      ctx.fillText(displayNumber, 0, boxTop + boxSize/2 + 2)
      ctx.restore()
    }
    
    ctx.restore()
    
    // 数字飞入动画 - 贝塞尔曲线，更大更震撼
    if (flyingNumber) {
      const t = flyingNumber.progress
      // 贝塞尔曲线控制点 - 更大的弧度
      const startX = flyingNumber.startX
      const startY = flyingNumber.startY
      const endX = cx
      const endY = cy + floatY + 40
      const cp1X = startX - 100
      const cp1Y = startY - 250
      const cp2X = endX + 150
      const cp2Y = endY - 300
      
      // 三次贝塞尔曲线
      const mt = 1 - t
      const x = mt*mt*mt*startX + 3*mt*mt*t*cp1X + 3*mt*t*t*cp2X + t*t*t*endX
      const y = mt*mt*mt*startY + 3*mt*mt*t*cp1Y + 3*mt*t*t*cp2Y + t*t*t*endY
      
      // 缩放效果 - 开始更大
      const scale = 2.0 - t * 1.3
      // 旋转效果
      const rotation = t * Math.PI * 4
      
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.scale(scale, scale)
      
      // 超强发光效果
      ctx.shadowColor = '#fbbf24'
      ctx.shadowBlur = 100
      
      // 大光球效果
      const bgGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 120)
      bgGrad.addColorStop(0, 'rgba(251, 191, 36, 1)')
      bgGrad.addColorStop(0.2, 'rgba(251, 191, 36, 0.8)')
      bgGrad.addColorStop(0.4, 'rgba(139, 92, 246, 0.5)')
      bgGrad.addColorStop(0.7, 'rgba(139, 92, 246, 0.2)')
      bgGrad.addColorStop(1, 'rgba(139, 92, 246, 0)')
      ctx.fillStyle = bgGrad
      ctx.beginPath()
      ctx.arc(0, 0, 120, 0, Math.PI * 2)
      ctx.fill()
      
      // 数字 - 更大更醒目
      ctx.font = 'bold 100px var(--font-display), system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 8
      ctx.strokeText(flyingNumber.num, 0, 0)
      ctx.fillText(flyingNumber.num, 0, 0)
      
      ctx.restore()
      
      // 拖尾粒子 - 减少数量
      if (Math.random() < 0.4 && particlesRef.current.length < 20) {
        const colors = ['#fbbf24', '#8b5cf6', '#ffffff']
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 40,
          y: y + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          size: Math.random() * 10 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          life: 40
        })
      }
    }
    
    // 数字弹出动画 - 从 40px 到 100px
    if (poppingNumber) {
      const t = poppingNumber.progress
      // 快速缓动
      const ease = 1 - Math.pow(1 - t, 4)
      
      // 位置：从魔盒中心往上弹一点点
      const startY = cy + 50
      const targetY = 200
      const popY = startY - ease * targetY
      
      // 字体从 40px 到 100px
      const fontSize = 40 + ease * 100
      
      ctx.save()
      ctx.translate(cx, popY)
      
      // 发光效果
      ctx.shadowColor = '#22c55e'
      ctx.shadowBlur = 40
      
      // 数字
      ctx.font = `bold ${fontSize}px system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // 渐变填充
      const textGrad = ctx.createLinearGradient(-60, -60, 60, 60)
      textGrad.addColorStop(0, '#4ade80')
      textGrad.addColorStop(0.5, '#22c55e')
      textGrad.addColorStop(1, '#16a34a')
      ctx.fillStyle = textGrad
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 4 + ease * 4
      ctx.strokeText(poppingNumber.num, 0, 0)
      ctx.fillText(poppingNumber.num, 0, 0)
      
      ctx.restore()
      
      // 弹出粒子 - 减少数量
      if (Math.random() < 0.25 && t < 0.8 && particlesRef.current.length < 25) {
        const colors = ['#22c55e', '#4ade80', '#fbbf24']
        particlesRef.current.push({
          x: cx + (Math.random() - 0.5) * 150,
          y: popY + (Math.random() - 0.5) * 80,
          vx: (Math.random() - 0.5) * 10,
          vy: -Math.random() * 8 - 4,
          size: Math.random() * 12 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          life: 45
        })
      }
    }
    
    animationRef.current = requestAnimationFrame(draw)
  }, [isSpinning, isOpening, displayNumber, hasNumber, flyingNumber, poppingNumber, glassBoxRef])
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 设置 canvas 尺寸（高清 2x）
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    
    // 立即执行一次
    resize()
    
    // 延迟再执行一次确保正确
    const initTimer = setTimeout(resize, 100)
    
    window.addEventListener('resize', resize)
    animationRef.current = requestAnimationFrame(draw)
    
    return () => {
      clearTimeout(initTimer)
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [draw])
  
  return <MagicCanvas ref={canvasRef} />
}

// 主组件
export default function MagicMainApp() {
  const magicBox = useMagicBox()
  const [inputValue, setInputValue] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [displayNumber, setDisplayNumber] = useState('?')
  const [hasNumber, setHasNumber] = useState(false)
  const [input, setInput] = useState({ num: '--', t: '-', o: '-' })
  const [output, setOutput] = useState({ num: '--', t: '-', o: '-', show: false })
  const [toast, setToast] = useState('')
  
  // GlassBox ref for positioning
  const glassBoxRef = useRef<HTMLDivElement>(null)
  
  // 动画状态
  const [flyingNumber, setFlyingNumber] = useState<FlyingNumber | null>(null)
  const [poppingNumber, setPoppingNumber] = useState<PoppingNumber | null>(null)
  const flyingAnimRef = useRef<number>(0)
  const poppingAnimRef = useRef<number>(0)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  // 交换十位和个位
  const swapDigits = (num: number) => {
    const tens = Math.floor(num / 10)
    const ones = num % 10
    return ones * 10 + tens
  }
  
  // 数字飞入动画
  const startFlyingAnimation = (num: string, startX: number, startY: number, onComplete: () => void) => {
    let progress = 0
    const animate = () => {
      progress += 0.025
      if (progress >= 1) {
        setFlyingNumber(null)
        onComplete()
        return
      }
      setFlyingNumber({ num, progress, startX, startY })
      flyingAnimRef.current = requestAnimationFrame(animate)
    }
    setFlyingNumber({ num, progress: 0, startX, startY })
    flyingAnimRef.current = requestAnimationFrame(animate)
  }
  
  // 数字弹出动画 - 弹出时立即触发结果和礼花
  const startPoppingAnimation = (num: string, onStart: () => void, onComplete: () => void) => {
    let progress = 0
    let triggeredStart = false
    const animate = () => {
      progress += 0.025  // 稍微快一点
      
      // 弹出到一半时触发结果显示和礼花
      if (progress > 0.25 && !triggeredStart) {
        triggeredStart = true
        onStart()
      }
      
      if (progress >= 1) {
        // 保持显示一段时间
        setTimeout(() => {
          setPoppingNumber(null)
          onComplete()
        }, 1200)
        return
      }
      setPoppingNumber({ num, progress, scale: 0.1 + progress * 0.9, y: 0 })
      poppingAnimRef.current = requestAnimationFrame(animate)
    }
    setPoppingNumber({ num, progress: 0, scale: 0.1, y: 0 })
    poppingAnimRef.current = requestAnimationFrame(animate)
  }

  const handleSubmit = () => {
    if (!inputValue.trim()) return
    const v = magicBox.validateInput(inputValue)
    if (!v.valid) { showToast(v.message!); return }
    
    const inputNum = v.number!
    const outputNum = swapDigits(inputNum)
    
    // 处理输入（同时记录到 store）
    magicBox.processNumber(inputNum)
    
    setInput({ 
      num: inputNum.toString(), 
      t: Math.floor(inputNum / 10).toString(), 
      o: (inputNum % 10).toString() 
    })
    setOutput({ ...output, show: false })
    setInputValue('')
    
    // 从右侧键盘区域飞入魔盒（相对于 Canvas 的坐标）
    // Canvas 是 520x520，中心在 (260, 260)
    // 键盘在右侧，所以起始位置在 Canvas 右侧外部
    const startX = 650  // Canvas 右侧外部
    const startY = 260  // Canvas 垂直中心
    
    startFlyingAnimation(inputNum.toString(), startX, startY, () => {
      // 飞入完成后，显示在盒子里
      setDisplayNumber(inputNum.toString())
      setHasNumber(true)
      setIsSpinning(true)
      
      // 旋转后打开盒子
      setTimeout(() => {
        setIsSpinning(false)
        setIsOpening(true)
        
        // 打开后弹出结果数字
        setTimeout(() => {
          startPoppingAnimation(
            outputNum.toString(), 
            // 弹出时立即触发
            () => {
              setOutput({ 
                num: outputNum.toString(), 
                t: Math.floor(outputNum / 10).toString(), 
                o: (outputNum % 10).toString(), 
                show: true 
              })
              // 更大的礼花效果
              confetti({ 
                particleCount: 200, 
                spread: 100, 
                origin: { y: 0.5 }, 
                colors: ['#3b82f6', '#8b5cf6', '#22c55e', '#fbbf24', '#f472b6'],
                scalar: 1.2
              })
              // 再来一波
              setTimeout(() => {
                confetti({ 
                  particleCount: 150, 
                  spread: 120, 
                  origin: { y: 0.6, x: 0.3 }, 
                  colors: ['#22c55e', '#4ade80', '#86efac']
                })
                confetti({ 
                  particleCount: 150, 
                  spread: 120, 
                  origin: { y: 0.6, x: 0.7 }, 
                  colors: ['#8b5cf6', '#a78bfa', '#c4b5fd']
                })
              }, 200)
            },
            // 完成后关闭盒子
            () => {
              setIsOpening(false)
              setHasNumber(false)
              setDisplayNumber('?')
            }
          )
        }, 500)
      }, 700)
    })
  }
  
  // 清理动画
  useEffect(() => {
    return () => {
      cancelAnimationFrame(flyingAnimRef.current)
      cancelAnimationFrame(poppingAnimRef.current)
    }
  }, [])

  const handleKey = (k: string) => {
    if (k === 'C') setInputValue('')
    else if (k === '←') setInputValue(v => v.slice(0, -1))
    else if (inputValue.length < 2) setInputValue(v => v + k)
  }

  return (
    <Page>
      <Bg />
      <ParticleLines />
      
      {/* 全屏魔法动画Canvas - 必须在最外层 */}
      <FullscreenCanvas>
        <MagicBoxCanvas 
          isSpinning={isSpinning} 
          isOpening={isOpening} 
          displayNumber={displayNumber}
          hasNumber={hasNumber}
          flyingNumber={flyingNumber}
          poppingNumber={poppingNumber}
          glassBoxRef={glassBoxRef}
        />
      </FullscreenCanvas>
      
      {/* 顶部标题 */}
      <Header>
        <Title>第一关：数字魔法盒</Title>
      </Header>
      
      <Layout>
        {/* 左侧：输入/结果 */}
        <LeftPanel>
          <NumCard>
            <NumLabel>输入</NumLabel>
            <NumBig>{input.num}</NumBig>
            <NumDigits>
              <Digit c={COLORS.purple}>{input.t}<span>十</span></Digit>
              <Digit c={COLORS.primaryLight}>{input.o}<span>个</span></Digit>
            </NumDigits>
          </NumCard>
          
          <ArrowIcon><IoArrowDown /></ArrowIcon>
          
          <NumCard glow>
            <NumLabel>结果</NumLabel>
            <NumBig glow>{output.show ? output.num : '??'}</NumBig>
            <NumDigits>
              <Digit c={COLORS.success}>{output.show ? output.t : '-'}<span>十</span></Digit>
              <Digit c={COLORS.accent}>{output.show ? output.o : '-'}<span>个</span></Digit>
            </NumDigits>
          </NumCard>
        </LeftPanel>

        {/* 中间：魔盒区域（只显示毛玻璃框） */}
        <CenterPanel>
          <GlassBox ref={glassBoxRef} />
        </CenterPanel>

        {/* 右侧：键盘 + 按钮 */}
        <RightPanel>
          <Display>{inputValue || '—'}</Display>
          
          <Keypad>
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <Key key={n} onClick={() => handleKey(String(n))} whileTap={{ scale: 0.92 }}>{n}</Key>
            ))}
            <Key className="fn" onClick={() => handleKey('C')} whileTap={{ scale: 0.92 }}><MdClear /></Key>
            <Key onClick={() => handleKey('0')} whileTap={{ scale: 0.92 }}>0</Key>
            <Key className="fn back" onClick={() => handleKey('←')} whileTap={{ scale: 0.92 }}><IoBackspace /></Key>
          </Keypad>
          
          <Btn primary onClick={handleSubmit} whileTap={{ scale: 0.97 }}>放入魔盒</Btn>
        </RightPanel>
      </Layout>

      <AnimatePresence>
        {toast && (
          <Toast 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {toast}
          </Toast>
        )}
      </AnimatePresence>
    </Page>
  )
}

// ========== Styles ==========
const ParticleCanvas = styled.canvas`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
`

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
`

const Bg = styled.div`
  position: fixed;
  inset: 0;
  background: url(${backgrounds.policeStation}) center/cover;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(30,64,175,0.55), rgba(124,58,237,0.45));
  }
`

const Header = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 0 0 20px 20px;
  padding: 12px 40px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
`

const Title = styled.h1`
  font-size: 1.8rem;
  background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.purple} 50%, ${COLORS.primaryLight} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  font-weight: 700;
`

const Layout = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 40px;
  width: 100%;
  max-width: 1400px;
  justify-content: center;
  padding: 0 20px;
`

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-width: 180px;
`

const NumCard = styled.div<{ glow?: boolean }>`
  background: rgba(255,255,255,0.96);
  border: 2px solid ${p => p.glow ? COLORS.success : COLORS.primaryLight};
  border-radius: 20px;
  padding: 22px 32px;
  text-align: center;
  min-width: 160px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
`

const NumLabel = styled.div`
  font-size: 13px;
  color: ${COLORS.textMuted};
  font-weight: 600;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const NumBig = styled.div<{ glow?: boolean }>`
  font-family: var(--font-display);
  font-size: 52px;
  font-weight: 800;
  background: ${p => p.glow
    ? `linear-gradient(135deg, ${COLORS.success}, #06b6d4)`
    : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.purple})`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.1;
`

const NumDigits = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 12px;
`

const Digit = styled.div<{ c: string }>`
  background: ${p => p.c}12;
  border: 2px solid ${p => p.c};
  border-radius: 10px;
  padding: 6px 14px;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: ${p => p.c};
  span { font-size: 11px; color: ${COLORS.textMuted}; margin-left: 3px; }
`

const ArrowIcon = styled.div`
  font-size: 28px;
  color: ${COLORS.gold};
  display: flex;
  align-items: center;
`

const CenterPanel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1.5;
  min-width: 400px;
`

const GlassBox = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-width: 520px;
  min-width: 380px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 36px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(30, 64, 175, 0.25);
`

const FullscreenCanvas = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  pointer-events: none;
`

const MagicCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`

const RightPanel = styled.div`
  background: rgba(255,255,255,0.96);
  border-radius: 24px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 15px 50px rgba(0,0,0,0.12);
  min-width: 240px;
`

const Display = styled.div`
  height: 80px;
  background: linear-gradient(135deg, ${COLORS.primary}06, ${COLORS.purple}06);
  border: 2px solid ${COLORS.primaryLight};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 52px;
  font-weight: 800;
  color: ${COLORS.primary};
`

const Keypad = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`

const Key = styled(motion.button)`
  height: 54px;
  border-radius: 14px;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  cursor: pointer;
  border: 2px solid ${COLORS.primaryLight};
  background: ${COLORS.primary}06;
  color: ${COLORS.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  
  &:hover { background: ${COLORS.primary}12; }
  
  &.fn {
    border-color: #e11d48;
    background: #e11d4808;
    color: #e11d48;
    font-size: 20px;
  }
  
  &.back {
    border-color: ${COLORS.gold};
    background: ${COLORS.gold}08;
    color: ${COLORS.accent};
  }
`

const Btn = styled(motion.button)<{ primary?: boolean }>`
  flex: 1;
  padding: 16px 20px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  color: white;
  cursor: pointer;
  background: ${p => p.primary
    ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`
    : `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleLight})`};
  box-shadow: 0 5px 20px ${p => p.primary ? 'rgba(30,64,175,0.35)' : 'rgba(139,92,246,0.35)'};
`

const Toast = styled(motion.div)`
  position: fixed;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(30,64,175,0.95);
  color: white;
  padding: 14px 32px;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
  z-index: 1000;
`
