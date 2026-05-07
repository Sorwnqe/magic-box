import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import styled from '@emotion/styled'
// keyframes removed - not used
import { preloadSounds } from './hooks/useSound'
import WaitingScreen from './components/WaitingScreen'

import MagicMainApp from './components/MagicMainApp'
import FormulaMagicStage from './components/FormulaMagicStage'

import Stage3Module from './components/Stage3Module'
import Stage3GroupWork from './components/Stage3GroupWork'
import Stage4CodeWall from './components/Stage4CodeWall'
import Stage5NumberStairs from './components/Stage5NumberStairs'
import Stage5Video from './components/Stage5Video'
import Stage6DetectiveTask from './components/Stage6DetectiveTask'
import MagicEnding from './components/MagicEnding'
import { IoChevronBack, IoChevronForward, IoHome, IoCheckmarkCircle } from 'react-icons/io5'
import './App.css'

// 活动阶段：
// waiting -> stage1_decode (数字魔法)
// -> stage1_imitate (仿写算式)
// -> stage3_module1 (算式创造关 - 和为44)
// -> stage3_module2 (算式创造关 - 和为99)
// -> stage3_group (小组合作倒计时)
// -> stage4_codewall (智慧密码墙)
// -> stage5_stairs (数字楼梯)
// -> stage5_video (过渡视频)
// -> stage6_detective (拓展任务)
// -> complete (结局)
type AppState = 
  | 'waiting' 
  | 'stage1_decode' 
  | 'stage1_imitate'
  | 'stage3_module1'
  | 'stage3_module2'
  | 'stage3_group'
  | 'stage4_codewall'
  | 'stage5_stairs'
  | 'stage5_video'
  | 'stage6_detective'
  | 'complete'
type TransitionDirection = 'left' | 'right' | null

// 魔法主题切页动画 - 滑动+淡入淡出

function App() {
  const [appState, setAppState] = useState<AppState>('waiting')
  const [direction, setDirection] = useState<TransitionDirection>('right')

  // 预加载音效
  useEffect(() => {
    preloadSounds()
  }, [])

  // 带过渡效果的状态切换
  const transitionTo = (newState: AppState, newDirection: TransitionDirection) => {
    setDirection(newDirection ?? 'right')
    setAppState(newState)
  }

  // 从等待页开始上课
  const handleStartClass = () => {
    transitionTo('stage1_decode', 'right')
  }

  // 为了便利将每个跳转封装
  const goTo = (state: AppState, newDirection: TransitionDirection = 'right') =>
    () => transitionTo(state, newDirection)

  // 魔法主题切页动画 - 滑动+淡入淡出
  const slideVariants = {
    initial: (dir: TransitionDirection) => ({
      x: dir === 'right' ? 80 : dir === 'left' ? -80 : 0,
      opacity: 0,
      scale: 0.96,
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: TransitionDirection) => ({
      x: dir === 'right' ? -80 : dir === 'left' ? 80 : 0,
      opacity: 0,
      scale: 0.96,
    }),
  }

  return (
    <div className="app">
      <AnimatePresence mode="wait" custom={direction}>
        {appState === 'waiting' && (
          <motion.div
            key="waiting"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <WaitingScreen onStart={handleStartClass} />
          </motion.div>
        )}

        {/* 数字魔法 */}
        {appState === 'stage1_decode' && (
          <motion.div
            key="stage1_decode"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <MagicMainApp />
            <StageNavigation
              currentStage={1}
              onPrev={goTo('waiting', 'left')}
              onNext={goTo('stage1_imitate')}
            />
          </motion.div>
        )}

        {/* 仿写算式 */}
        {appState === 'stage1_imitate' && (
          <motion.div
            key="stage1_imitate"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <FormulaMagicStage />
            <StageNavigation
              currentStage={2}
              onPrev={goTo('stage1_decode', 'left')}
              onNext={goTo('stage3_module1')}
            />
          </motion.div>
        )}

        {/* 第三关 - 和为44 */}
        {appState === 'stage3_module1' && (
          <motion.div
            key="stage3_module1"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Stage3Module
              title="算式创造关"
              targetSum={44}
              onContinue={goTo('stage3_module2')}
              onBack={goTo('stage1_imitate', 'left')}
            />
          </motion.div>
        )}

        {/* 第三关 - 和为99 */}
        {appState === 'stage3_module2' && (
          <motion.div
            key="stage3_module2"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Stage3Module
              title="算式创造关"
              targetSum={99}
              onContinue={goTo('stage3_group')}
              onBack={goTo('stage3_module1', 'left')}
            />
          </motion.div>
        )}

        {/* 第三关 - 小组合作倒计时 */}
        {appState === 'stage3_group' && (
          <motion.div
            key="stage3_group"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Stage3GroupWork
              onContinue={goTo('stage4_codewall')}
              onBack={goTo('stage3_module2', 'left')}
            />
          </motion.div>
        )}

        {/* 第四关·智慧密码墙 */}
        {appState === 'stage4_codewall' && (
          <motion.div
            key="stage4_codewall"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Stage4CodeWall
              onContinue={goTo('stage5_stairs')}
              onBack={goTo('stage3_group', 'left')}
            />
          </motion.div>
        )}

        {/* 第五关·数字楼梯 */}
        {appState === 'stage5_stairs' && (
          <motion.div
            key="stage5_stairs"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Stage5NumberStairs
              onContinue={goTo('stage5_video')}
              onBack={goTo('stage4_codewall', 'left')}
            />
          </motion.div>
        )}

        {/* 侦探拓展任务 */}
        {appState === 'stage5_video' && (
          <motion.div
            key="stage5_video"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Stage5Video
              onContinue={goTo('stage6_detective')}
              onBack={goTo('stage5_stairs', 'left')}
            />
          </motion.div>
        )}

        {appState === 'stage6_detective' && (
          <motion.div
            key="stage6_detective"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Stage6DetectiveTask
              onContinue={goTo('complete')}
              onBack={goTo('stage5_video', 'left')}
            />
          </motion.div>
        )}

        {appState === 'complete' && (
          <motion.div
            key="complete"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <MagicEnding onRestart={goTo('waiting', 'left')} onBack={goTo('stage6_detective', 'left')} />
          </motion.div>
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
    { id: 1, label: '1', name: '数字魔法' },
    { id: 2, label: '2', name: '✍仿写算式' },
    { id: 3, label: '3', name: '有趣算式' },
    { id: 4, label: '4', name: '侦探能量操' }
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
        <span>{currentStage === 1 ? '返回封面' : stages[currentStage - 2].name}</span>
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

const NavButton = styled(motion.button) <{ position: 'left' | 'right' }>`
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

const StagePoint = styled(motion.div) <{ active: boolean }>`
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

export default App
