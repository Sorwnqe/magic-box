import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import styled from '@emotion/styled'
import MagicIntro from './components/MagicIntro'
import MagicMainApp from './components/MagicMainApp'
import FormulaMagicStage from './components/FormulaMagicStage'
import MagicArrayStage from './components/MagicArrayStage'
import MagicTowerStage from './components/MagicTowerStage'
import { expressions, backgrounds, items, zootopiaColors as COLORS } from './assets/images'
import { IoChevronBack, IoChevronForward, IoHome, IoCheckmarkCircle } from 'react-icons/io5'
import './App.css'

// 活动阶段: intro -> stage1(数字魔盒) -> stage2(算式魔法台) -> stage3(四十四魔法阵) -> stage4(九十九魔法塔) -> complete
type AppState = 'intro' | 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'complete'
type TransitionDirection = 'left' | 'right' | null

function App() {
  const [appState, setAppState] = useState<AppState>('intro')
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>(null)

  const handleIntroComplete = () => {
    setTransitionDirection('right')
    setAppState('stage1')
  }

  const goToStage1 = () => {
    setTransitionDirection('left')
    setAppState('stage1')
  }

  const goToStage2 = () => {
    setTransitionDirection('right')
    setAppState('stage2')
  }

  const goToStage3 = () => {
    setTransitionDirection('right')
    setAppState('stage3')
  }

  const goToStage4 = () => {
    setTransitionDirection('right')
    setAppState('stage4')
  }

  const handleComplete = () => {
    setTransitionDirection('right')
    setAppState('complete')
  }

  // 根据方向计算动画参数 - 更炫酷的换页动效
  const getSlideVariants = (direction: TransitionDirection) => ({
    initial: { 
      opacity: 0, 
      x: direction === 'right' ? 200 : direction === 'left' ? -200 : 0,
      scale: 0.85,
      rotateY: direction === 'right' ? 15 : direction === 'left' ? -15 : 0,
      filter: 'blur(10px)'
    },
    animate: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      rotateY: 0,
      filter: 'blur(0px)'
    },
    exit: { 
      opacity: 0, 
      x: direction === 'right' ? -200 : direction === 'left' ? 200 : 0,
      scale: 0.85,
      rotateY: direction === 'right' ? -15 : direction === 'left' ? 15 : 0,
      filter: 'blur(10px)'
    }
  })

  const variants = getSlideVariants(transitionDirection)

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {appState === 'intro' && (
          <MagicIntro key="intro" onComplete={handleIntroComplete} />
        )}
        
        {appState === 'stage1' && (
          <motion.div
            key="stage1"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <MagicMainApp />
            <StageNavigation 
              currentStage={1} 
              onPrev={() => {
                setTransitionDirection('left')
                setAppState('intro')
              }}
              onNext={goToStage2}
            />
          </motion.div>
        )}
        
        {appState === 'stage2' && (
          <motion.div
            key="stage2"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <FormulaMagicStage onComplete={goToStage3} />
            <StageNavigation 
              currentStage={2} 
              onPrev={goToStage1}
              onNext={goToStage3}
            />
          </motion.div>
        )}

        {appState === 'stage3' && (
          <motion.div
            key="stage3"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <MagicArrayStage onComplete={goToStage4} />
            <StageNavigation 
              currentStage={3} 
              onPrev={goToStage2}
              onNext={goToStage4}
            />
          </motion.div>
        )}

        {appState === 'stage4' && (
          <motion.div
            key="stage4"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <MagicTowerStage onComplete={handleComplete} />
            <StageNavigation 
              currentStage={4} 
              onPrev={goToStage3}
              onNext={handleComplete}
            />
          </motion.div>
        )}

        {appState === 'complete' && (
          <FinalCelebration key="complete" onRestart={() => {
            setTransitionDirection('left')
            setAppState('intro')
          }} />
        )}
      </AnimatePresence>
    </div>
  )
}

// 关卡导航组件
function StageNavigation({ 
  currentStage, 
  onPrev, 
  onNext 
}: { 
  currentStage: number
  onPrev: () => void
  onNext: () => void 
}) {
  const stages = [
    { id: 1, label: '1', name: '数字魔法盒' },
    { id: 2, label: '2', name: '算式魔法台' },
    { id: 3, label: '3', name: '四十四魔法阵' },
    { id: 4, label: '4', name: '九十九魔法塔' }
  ]

  return (
    <NavContainer>
      {/* 上一关按钮 */}
      <NavButton 
        onClick={onPrev}
        position="left"
        whileHover={{ scale: 1.03, x: -3, transition: { type: 'spring', damping: 20, stiffness: 400 } }}
        whileTap={{ scale: 0.97, transition: { type: 'spring', damping: 25, stiffness: 500 } }}
      >
        {currentStage === 1 ? <IoHome /> : <IoChevronBack />}
        <span>{currentStage === 1 ? '返回首页' : stages[currentStage - 2].name}</span>
      </NavButton>

      {/* 关卡指示器 */}
      <StageIndicator>
        {stages.map((stage) => (
          <StagePoint 
            key={stage.id}
            active={stage.id === currentStage}
            whileHover={{ scale: 1.1, transition: { type: 'spring', damping: 20, stiffness: 400 } }}
          >
            <span>{stage.label}</span>
            {stage.id === currentStage && (
              <motion.div
                layoutId="activeStage"
                style={{
                  position: 'absolute',
                  inset: -4,
                  border: '3px solid #3b82f6',
                  borderRadius: 20,
                }}
                transition={{ type: 'spring', damping: 20 }}
              />
            )}
          </StagePoint>
        ))}
      </StageIndicator>

      {/* 下一关按钮 */}
      <NavButton 
        onClick={onNext}
        position="right"
        whileHover={{ scale: 1.03, x: 3, transition: { type: 'spring', damping: 20, stiffness: 400 } }}
        whileTap={{ scale: 0.97, transition: { type: 'spring', damping: 25, stiffness: 500 } }}
      >
        <span>{currentStage === 4 ? '完成活动' : stages[currentStage].name}</span>
        {currentStage === 4 ? <IoCheckmarkCircle /> : <IoChevronForward />}
      </NavButton>
    </NavContainer>
  )
}

const NavContainer = styled.div`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 25px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 50px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
`

const NavButton = styled(motion.button)<{ position: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${props => props.position === 'right' 
    ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)'
    : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'};
  color: ${props => props.position === 'right' ? 'white' : '#475569'};
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.position === 'right' 
    ? '0 4px 15px rgba(99, 102, 241, 0.4)'
    : '0 4px 15px rgba(0, 0, 0, 0.1)'};

  svg {
    font-size: 1.1rem;
  }

  &:hover {
    box-shadow: ${props => props.position === 'right' 
      ? '0 8px 25px rgba(99, 102, 241, 0.45)'
      : '0 8px 25px rgba(0, 0, 0, 0.12)'};
    filter: brightness(1.03);
  }
  
  &:active {
    transform: translateY(1px);
  }
`

const StageIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 0 15px;
`

const StagePoint = styled(motion.div)<{ active: boolean }>`
  position: relative;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' 
    : '#f1f5f9'};
  border-radius: 50%;
  font-size: 1rem;
  font-weight: 700;
  color: ${props => props.active ? 'white' : '#64748b'};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' 
      : '#e2e8f0'};
    transform: scale(1.08);
  }
  
  &:active {
    transform: scale(0.95);
  }
`

// 最终庆祝界面 - 动物城主题
function FinalCelebration({ onRestart }: { onRestart: () => void }) {
  const colors = [COLORS.primary, COLORS.success, COLORS.gold, COLORS.accent, COLORS.purple]
  
  return (
    <motion.div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `url(${backgrounds.skyline})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflow: 'hidden'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 背景遮罩 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.3) 0%, rgba(251, 191, 36, 0.2) 100%)'
      }} />
      
      {/* 背景彩带 */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 8 + Math.random() * 15,
            height: 20 + Math.random() * 30,
            background: colors[i % colors.length],
            borderRadius: 5,
            top: -50
          }}
          initial={{ x: Math.random() * window.innerWidth, y: -50 }}
          animate={{ y: window.innerHeight + 100, rotate: [0, 360, 720] }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ))}

      {/* 主内容 */}
      <motion.div
        style={{
          textAlign: 'center',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.98)',
          padding: '40px 60px',
          borderRadius: 30,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)'
        }}
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 10, delay: 0.3 }}
      >
        {/* 胜利徽章 */}
        <motion.img
          src={items.victoryBadge}
          alt="Victory Badge"
          style={{
            width: 120,
            height: 'auto',
            marginBottom: 15,
            filter: 'drop-shadow(0 5px 15px rgba(251, 191, 36, 0.5))'
          }}
          animate={{
            rotate: [0, 5, 0, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* 团队胜利图 */}
        <motion.img
          src={expressions.teamVictory}
          alt="Team Victory"
          style={{
            width: 250,
            height: 'auto',
            marginBottom: 20,
            borderRadius: 15,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
          }}
          animate={{
            y: [0, -10, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        <motion.h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.success} 50%, ${COLORS.gold} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 15px'
          }}
        >
          🏆 动物城成功拯救！
        </motion.h1>
        
        <p style={{ fontSize: '1.3rem', color: COLORS.textPrimary, margin: '0 0 10px' }}>
          你和朱迪、尼克一起掌握了反转数的秘密！
        </p>
        <p style={{ fontSize: '1.1rem', color: COLORS.textSecondary, margin: '0 0 25px' }}>
          🌟 数字迷雾已经消散，动物城恢复了和平！ 🌟
        </p>
        
        <motion.button
          style={{
            padding: '15px 40px',
            border: 'none',
            borderRadius: 25,
            fontSize: '1.2rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
            color: 'white',
            boxShadow: '0 4px 20px rgba(30, 64, 175, 0.4)'
          }}
          onClick={onRestart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔄 再来一次冒险
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export default App
