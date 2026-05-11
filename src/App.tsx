import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import styled from '@emotion/styled'
// keyframes removed - not used
import { preloadSounds } from './hooks/useSound'
import WaitingScreen from './components/WaitingScreen'

import MagicMainApp from './components/MagicMainApp'
// import FormulaMagicStage from './components/FormulaMagicStage'

// import CongRevealPage from './components/CongRevealPage'
import Stage3Module from './components/Stage3Module'
// import Stage3GroupWork from './components/Stage3GroupWork'
import Stage4CodeWall from './components/Stage4CodeWall'
import Stage5NumberStairs from './components/Stage5NumberStairs'
import Stage5Video from './components/Stage5Video'
import Stage6DetectiveTask from './components/Stage6DetectiveTask'
import MagicEnding from './components/MagicEnding'
// import { IoChevronBack, IoChevronForward, IoHome, IoCheckmarkCircle } from 'react-icons/io5'
import './App.css'

// 活动阶段：
// waiting -> stage1_decode (数字魔法)
// -> stage1_imitate (仿写算式)
// -> stage3_module1 (算式创造关 - 和为44)
// -> stage3_module66 (有趣算式 - 和为66)
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
  | 'stage2_cong'
  | 'stage3_module1'
  | 'stage3_module66'
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
            <SimpleNav>
              <SimpleNavBtn onClick={goTo('waiting', 'left')}>返回</SimpleNavBtn>
              <SimpleNavBtn primary onClick={goTo('stage3_module1')}>继续探索</SimpleNavBtn>
            </SimpleNav>
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
              onBack={goTo('stage1_decode', 'left')}
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
              onContinue={goTo('stage4_codewall')}
              onBack={goTo('stage3_module1', 'left')}
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
              onBack={goTo('stage3_module2', 'left')}
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

// 简单导航（第一关专用：返回 + 继续探索）
const SimpleNav = styled.div`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 1000;
`

const SimpleNavBtn = styled(motion.button)<{ primary?: boolean }>`
  padding: 12px 28px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  color: ${props => props.primary ? 'white' : '#475569'};
  background: ${props => props.primary
    ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)'
    : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'};
  box-shadow: ${props => props.primary
    ? '0 4px 15px rgba(99, 102, 241, 0.4)'
    : '0 4px 15px rgba(0, 0, 0, 0.1)'};

  &:hover {
    box-shadow: ${props => props.primary
    ? '0 8px 25px rgba(99, 102, 241, 0.45)'
    : '0 8px 25px rgba(0, 0, 0, 0.12)'};
    filter: brightness(1.03);
  }

  &:active {
    transform: translateY(1px);
  }
`

/*
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
      <NavButton onClick={onPrev} position="left">
        {currentStage === 1 ? <IoHome /> : <IoChevronBack />}
        <span>{currentStage === 1 ? '返回封面' : stages[currentStage - 2].name}</span>
      </NavButton>
      <StageIndicator>
        {stages.map((stage) => (
          <StagePoint key={stage.id} active={stage.id === currentStage}>
            <span>{stage.label}</span>
          </StagePoint>
        ))}
      </StageIndicator>
      <NavButton onClick={onNext} position="right">
        <span>{currentStage === 4 ? '完成活动' : stages[currentStage].name}</span>
        {currentStage === 4 ? <IoCheckmarkCircle /> : <IoChevronForward />}
      </NavButton>
    </NavContainer>
  )
}

const NavContainer = styled.div`
  ...
`
const NavButton = styled(motion.button) <{ position: 'left' | 'right' }>`
  ...
`
const StageIndicator = styled.div`
  ...
`
const StagePoint = styled(motion.div) <{ active: boolean }>`
  ...
`
*/

export default App
