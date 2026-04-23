import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import styled from '@emotion/styled'
// keyframes removed - not used
import { preloadSounds } from './hooks/useSound'
import WaitingScreen from './components/WaitingScreen'
import MagicIntro from './components/MagicIntro'
import MagicMainApp from './components/MagicMainApp'
import FormulaMagicStage from './components/FormulaMagicStage'
import StageAnnounce from './components/StageAnnounce'
import Stage3Module from './components/Stage3Module'
import Stage3GroupWork from './components/Stage3GroupWork'
import Stage4CodeWall from './components/Stage4CodeWall'
import Stage5NumberStairs from './components/Stage5NumberStairs'
import Stage6DetectiveTask from './components/Stage6DetectiveTask'
import MagicEnding from './components/MagicEnding'
import { IoChevronBack, IoChevronForward, IoHome, IoCheckmarkCircle } from 'react-icons/io5'
import './App.css'

// 活动阶段：
// waiting -> intro
// -> stage1_announce (第一关介绍)
// -> stage1_decode (数字解码关 - 数字魔盒)
// -> stage2_announce (算式探秘关 - 标题页)
// -> stage1_imitate (仿写算式)
// -> stage3_announce (第三关 - 标题页)
// -> stage3_module1 (算式创造关 - 和为44)
// -> stage3_module2 (算式创造关 - 和为99)
// -> stage3_group (小组合作倒计时)
// -> stage4_codewall (智慧密码墙)
// -> stage5_stairs (数字楼梯)
// -> stage6_detective (侦探拓展任务)
// -> complete (结局)
type AppState = 
  | 'waiting' 
  | 'intro' 
  | 'stage1_announce'
  | 'stage1_decode' 
  | 'stage2_announce'
  | 'stage1_imitate'
  | 'stage3_announce'
  | 'stage3_module1'
  | 'stage3_module2'
  | 'stage3_group'
  | 'stage4_codewall'
  | 'stage5_stairs'
  | 'stage6_detective'
  | 'complete'
  | 'complete'
type TransitionDirection = 'left' | 'right' | null

// 密室主题切页动画 - 石门关闭效果

const TransitionOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  overflow: hidden;
`

const DoorLeft = styled(motion.div)`
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, #1e293b 0%, #334155 100%);
  transform-origin: left center;
  box-shadow: inset -20px 0 40px rgba(0,0,0,0.5);
  
  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    width: 8px;
    height: 100%;
    background: linear-gradient(90deg, #475569, #64748b);
  }
`

const DoorRight = styled(motion.div)`
  position: absolute;
  right: 0;
  top: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(270deg, #1e293b 0%, #334155 100%);
  transform-origin: right center;
  box-shadow: inset 20px 0 40px rgba(0,0,0,0.5);
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 8px;
    height: 100%;
    background: linear-gradient(270deg, #475569, #64748b);
  }
`

const TransitionContent = styled(motion.div)`
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`

const TransitionEmoji = styled(motion.span)`
  font-size: 4rem;
  filter: drop-shadow(0 4px 20px rgba(251, 191, 36, 0.6));
`

const TransitionText = styled(motion.span)`
  font-size: 1.5rem;
  font-weight: 700;
  color: #fbbf24;
  text-shadow: 0 2px 15px rgba(251, 191, 36, 0.5);
`

function App() {
  const [appState, setAppState] = useState<AppState>('waiting')
  const [, setTransitionDirection] = useState<TransitionDirection>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionInfo, setTransitionInfo] = useState<{ emoji: string; text: string } | null>(null)

  // 预加载音效
  useEffect(() => {
    preloadSounds()
  }, [])

  // 获取关卡信息
  const getStageInfo = (state: AppState): { emoji: string; text: string } => {
    switch (state) {
      case 'waiting': return { emoji: '📖', text: '课前准备' }
      case 'intro': return { emoji: '🚪', text: '数字密室' }
      case 'stage1_announce': return { emoji: '🔍', text: '第一关' }
      case 'stage1_decode': return { emoji: '🔍', text: '数字解码关' }
      case 'stage2_announce': return { emoji: '🔮', text: '算式探秘关' }
      case 'stage1_imitate': return { emoji: '✍️', text: '仿写算式' }
      case 'stage3_announce': return { emoji: '🔮', text: '第三关' }
      case 'stage3_module1': return { emoji: '🔮', text: '和为44' }
      case 'stage3_module2': return { emoji: '🏆', text: '和为99' }
      case 'stage3_group': return { emoji: '👥', text: '小组合作' }
      case 'stage4_codewall': return { emoji: '🔐', text: '智慧密码墙' }
      case 'stage5_stairs': return { emoji: '🧱', text: '数字楼梯' }
      case 'stage6_detective': return { emoji: '🔎', text: '拓展任务' }
      case 'complete': return { emoji: '🎊', text: '结局' }
      default: return { emoji: '✨', text: '加载中' }
    }
  }

  // 带过渡效果的状态切换
  const transitionTo = (newState: AppState, direction: TransitionDirection) => {
    setTransitionInfo(getStageInfo(newState))
    setIsTransitioning(true)
    setTransitionDirection(direction)
    
    // 在遮罩完全显示后切换状态
    setTimeout(() => {
      setAppState(newState)
    }, 300)
    
    // 遮罩消失
    setTimeout(() => {
      setIsTransitioning(false)
    }, 700)
  }

  // 从等待页开始上课
  const handleStartClass = () => {
    transitionTo('intro', 'right')
  }

  const handleIntroComplete = () => {
    transitionTo('stage1_announce', 'right')
  }

  // 为了便利将每个跳转封装
  const goTo = (state: AppState, direction: TransitionDirection = 'right') => 
    () => transitionTo(state, direction)

  // 密室主题切页动画 - 淡入淡出
  const getSlideVariants = () => ({
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    }
  })

  const variants = getSlideVariants()

  return (
    <div className="app">
      {/* 密室石门切换遮罩 */}
      <AnimatePresence>
        {isTransitioning && transitionInfo && (
          <TransitionOverlay
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <DoorLeft
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            />
            <DoorRight
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            />
            <TransitionContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <TransitionEmoji
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {transitionInfo.emoji}
              </TransitionEmoji>
              <TransitionText>{transitionInfo.text}</TransitionText>
            </TransitionContent>
          </TransitionOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {appState === 'waiting' && (
          <WaitingScreen key="waiting" onStart={handleStartClass} />
        )}

        {appState === 'intro' && (
          <MagicIntro key="intro" onComplete={handleIntroComplete} />
        )}

        {/* 第一关介绍 - 不需要动画 */}
        {appState === 'stage1_announce' && (
          <div
            key="stage1_announce"
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <StageAnnounce
              stageNumber={1}
              stageTitle="数字解码关"
              challengeText="密室第一道门出现了——探索数字魔盒的奥秘，解开反转数的密码！"
              onContinue={goTo('stage1_decode')}
            />
          </div>
        )}

        {/* 第一关·数字解码关 - 数字魔盒 */}
        {appState === 'stage1_decode' && (
          <motion.div
            key="stage1_decode"
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
              onPrev={goTo('waiting', 'left')}
              onNext={goTo('stage2_announce')}
            />
          </motion.div>
        )}

        {/* 第二关·算式探秘关 - 标题页 */}
        {appState === 'stage2_announce' && (
          <div
            key="stage2_announce"
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Stage3Module
              tagLabel="第二关"
              title="算式探秘关"
              onContinue={goTo('stage1_imitate')}
              onBack={goTo('stage1_decode', 'left')}
            />
          </div>
        )}

        {/* 仿写算式 */}
        {appState === 'stage1_imitate' && (
          <motion.div
            key="stage1_imitate"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <FormulaMagicStage />
            <StageNavigation
              currentStage={2}
              onPrev={goTo('stage2_announce', 'left')}
              onNext={goTo('stage3_announce')}
            />
          </motion.div>
        )}

        {/* 第三关 - 标题页 */}
        {appState === 'stage3_announce' && (
          <div
            key="stage3_announce"
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Stage3Module
              tagLabel="第三关"
              title="算式创造关"
              onContinue={goTo('stage3_module1')}
              onBack={goTo('stage1_imitate', 'left')}
            />
          </div>
        )}

        {/* 第三关 - 和为44 */}
        {appState === 'stage3_module1' && (
          <div
            key="stage3_module1"
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Stage3Module
              tagLabel="第三关"
              title="算式创造关"
              targetSum={44}
              onContinue={goTo('stage3_module2')}
              onBack={goTo('stage3_announce', 'left')}
            />
          </div>
        )}

        {/* 第三关 - 和为99 */}
        {appState === 'stage3_module2' && (
          <div
            key="stage3_module2"
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Stage3Module
              tagLabel="第三关"
              title="算式创造关"
              targetSum={99}
              onContinue={goTo('stage3_group')}
              onBack={goTo('stage3_module1', 'left')}
            />
          </div>
        )}

        {/* 第三关 - 小组合作倒计时 */}
        {appState === 'stage3_group' && (
          <div
            key="stage3_group"
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Stage3GroupWork
              onContinue={goTo('stage4_codewall')}
              onBack={goTo('stage3_module2', 'left')}
            />
          </div>
        )}

        {/* 第四关·智慧密码墙 */}
        {appState === 'stage4_codewall' && (
          <div
            key="stage4_codewall"
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Stage4CodeWall
              onContinue={goTo('stage5_stairs')}
              onBack={goTo('stage3_group', 'left')}
            />
          </div>
        )}

        {/* 第五关·数字楼梯 */}
        {appState === 'stage5_stairs' && (
          <div
            key="stage5_stairs"
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Stage5NumberStairs
              onContinue={goTo('stage6_detective')}
              onBack={goTo('stage4_codewall', 'left')}
            />
          </div>
        )}

        {/* 侦探拓展任务 */}
        {appState === 'stage6_detective' && (
          <div
            key="stage6_detective"
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Stage6DetectiveTask
              onContinue={goTo('complete')}
              onBack={goTo('stage5_stairs', 'left')}
            />
          </div>
        )}

        {appState === 'complete' && (
          <MagicEnding 
            key="complete" 
            onRestart={goTo('waiting', 'left')}
          />
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
    { id: 1, label: '1', name: '数字解码关' },
    { id: 2, label: '2', name: '算式探秘关' },
    { id: 3, label: '3', name: '算式创造关' },
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
