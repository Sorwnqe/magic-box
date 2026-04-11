import { keyframes } from '@emotion/react'

// 优雅的缓动函数
export const EASING = {
  // 柔和弹性
  gentle: [0.25, 0.1, 0.25, 1],
  // 优雅进出
  elegant: [0.4, 0, 0.2, 1],
  // 柔和弹跳
  softBounce: [0.34, 1.56, 0.64, 1],
  // 呼吸感
  breath: [0.45, 0, 0.55, 1],
  // 快出慢入
  quickOut: [0.0, 0, 0.2, 1],
  // 慢出快入
  slowIn: [0.4, 0, 1, 1],
}

// Framer Motion 过渡配置
export const TRANSITIONS = {
  // 默认柔和过渡
  default: {
    type: 'tween',
    duration: 0.4,
    ease: EASING.elegant,
  },
  // 弹性过渡
  spring: {
    type: 'spring',
    damping: 25,
    stiffness: 300,
    mass: 0.8,
  },
  // 柔和弹性
  gentleSpring: {
    type: 'spring',
    damping: 30,
    stiffness: 200,
    mass: 1,
  },
  // 快速响应
  quick: {
    type: 'tween',
    duration: 0.2,
    ease: EASING.quickOut,
  },
  // 慢速优雅
  slow: {
    type: 'tween',
    duration: 0.6,
    ease: EASING.breath,
  },
  // 页面切换
  page: {
    type: 'tween',
    duration: 0.5,
    ease: EASING.elegant,
  },
  // 弹窗
  modal: {
    type: 'spring',
    damping: 22,
    stiffness: 280,
  },
}

// 按钮点击动画配置
export const BUTTON_VARIANTS = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.03,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 400,
    }
  },
  tap: { 
    scale: 0.97,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 500,
    }
  },
}

// 卡片动画配置
export const CARD_VARIANTS = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.96,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: TRANSITIONS.gentleSpring,
  },
  hover: {
    y: -4,
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    }
  },
}

// 输入框动画配置
export const INPUT_VARIANTS = {
  inactive: {
    scale: 1,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  active: {
    scale: 1.02,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 350,
    }
  },
  error: {
    x: [0, -8, 8, -6, 6, -4, 4, 0],
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    }
  },
}

// 浮动动画 - 用于装饰元素
export const FLOAT_VARIANTS = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  },
}

// 脉冲动画
export const PULSE_VARIANTS = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.9, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  },
}

// 渐入动画
export const FADE_IN_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: EASING.elegant,
    }
  },
}

// 从下方滑入
export const SLIDE_UP_VARIANTS = {
  hidden: { 
    opacity: 0, 
    y: 30,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: TRANSITIONS.gentleSpring,
  },
}

// 从左侧滑入
export const SLIDE_LEFT_VARIANTS = {
  hidden: { 
    opacity: 0, 
    x: -30,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: TRANSITIONS.gentleSpring,
  },
}

// 从右侧滑入
export const SLIDE_RIGHT_VARIANTS = {
  hidden: { 
    opacity: 0, 
    x: 30,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: TRANSITIONS.gentleSpring,
  },
}

// 缩放弹出
export const SCALE_VARIANTS = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: TRANSITIONS.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: TRANSITIONS.quick,
  },
}

// 交错子元素动画
export const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    }
  },
}

export const STAGGER_ITEM = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: TRANSITIONS.gentleSpring,
  },
}

// CSS Keyframes 动画
export const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

export const gentlePulse = keyframes`
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.02);
    opacity: 0.95;
  }
`

export const gentleFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`

export const softGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  50% { 
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`

export const breathe = keyframes`
  0%, 100% { 
    transform: scale(1);
    filter: brightness(1);
  }
  50% { 
    transform: scale(1.01);
    filter: brightness(1.05);
  }
`

export const softShake = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
`

export const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 0.5;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
`

// 颜色过渡
export const colorShift = keyframes`
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(15deg); }
`

// 旋转闪烁
export const sparkle = keyframes`
  0%, 100% { 
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% { 
    transform: scale(1.2) rotate(180deg);
    opacity: 0.8;
  }
`
