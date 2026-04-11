import { useState, useCallback } from 'react'

export interface NumberEntry {
  input: number
  output: number
  revealed: boolean
  timestamp: number
}

export interface MagicBoxState {
  pendingNumbers: NumberEntry[]
  history: NumberEntry[]
  patternRevealed: boolean
}

// 鼓励语
const encouragements = [
  '太棒了！你真聪明！🌟',
  '哇，你做得真好！✨',
  '继续加油！你正在发现数字的秘密！💪',
  '你是小小数学家！🎓',
  '太厉害了！再试试看！🚀',
  '完美！你的思维真敏捷！⚡',
]

// 魔法提示语
const magicHints = [
  '魔盒正在转动……你猜猜会出来什么数？🎲',
  '嗡嗡嗡～魔盒开始工作了！猜猜看结果是什么？✨',
  '魔法正在施展中……你能预测结果吗？🔮',
  '魔盒收到了你的数字，它正在变魔法呢！🪄',
  '叮叮叮～数字进入了魔盒！你觉得会变成什么？💫',
]

// 第二次输入提示
const secondHints = [
  '再想想，这次魔盒会怎么变？🤔',
  '哇，又一个数字！仔细观察，你发现规律了吗？👀',
  '很好！试着找找两个数之间的联系！🔍',
  '魔盒又转起来了！你能猜到答案吗？🎡',
  '太棒了！再仔细看看，有什么特别的地方？💡',
]

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

export function useMagicBox() {
  const [state, setState] = useState<MagicBoxState>({
    pendingNumbers: [],
    history: [],
    patternRevealed: false
  })

  // 交换数字
  const swapDigits = useCallback((num: number): number => {
    const tens = Math.floor(num / 10)
    const ones = num % 10
    return ones * 10 + tens
  }, [])

  // 验证输入
  const validateInput = useCallback((input: string) => {
    const num = parseInt(input, 10)
    if (isNaN(num) || num < 10 || num > 99) {
      return {
        valid: false,
        message: '请输入一个两位数（10-99）哦！比如：12、35、78 🔢'
      }
    }
    return { valid: true, number: num }
  }, [])

  // 处理输入数字
  const processNumber = useCallback((number: number) => {
    const output = swapDigits(number)
    const entry: NumberEntry = {
      input: number,
      output,
      revealed: false,
      timestamp: Date.now()
    }

    setState(prev => ({
      ...prev,
      pendingNumbers: [...prev.pendingNumbers, entry],
      history: [...prev.history, entry]
    }))

    const pendingCount = state.pendingNumbers.length + 1
    const message = pendingCount === 1 
      ? getRandomItem(magicHints) 
      : getRandomItem(secondHints)

    return {
      success: true,
      input: number,
      tens: Math.floor(number / 10),
      ones: number % 10,
      pendingCount,
      message
    }
  }, [state.pendingNumbers.length, swapDigits])

  // 打开魔盒
  const openBox = useCallback(() => {
    if (state.pendingNumbers.length === 0) {
      return {
        success: false,
        message: '魔盒里还没有数字呢！先放一个两位数进去吧！📦'
      }
    }

    const lastPending = state.pendingNumbers[state.pendingNumbers.length - 1]
    if (lastPending.revealed) {
      return {
        success: false,
        message: '这个数字已经揭示过啦！再放一个新数字试试？🎲'
      }
    }

    setState(prev => ({
      ...prev,
      pendingNumbers: prev.pendingNumbers.map((p, i) => 
        i === prev.pendingNumbers.length - 1 ? { ...p, revealed: true } : p
      ),
      history: prev.history.map(h => 
        h.input === lastPending.input && h.timestamp === lastPending.timestamp 
          ? { ...h, revealed: true } 
          : h
      )
    }))

    return {
      success: true,
      input: lastPending.input,
      output: lastPending.output,
      inputTens: Math.floor(lastPending.input / 10),
      inputOnes: lastPending.input % 10,
      outputTens: Math.floor(lastPending.output / 10),
      outputOnes: lastPending.output % 10,
      message: `✨ 叮！魔盒打开了！${lastPending.input} 变成了 ${lastPending.output}！`,
      encouragement: getRandomItem(encouragements)
    }
  }, [state.pendingNumbers])

  // 揭示规律
  const revealPattern = useCallback(() => {
    if (state.pendingNumbers.length === 0) {
      return {
        success: false,
        message: '先放几个数字进魔盒，然后我再告诉你规律哦！📚'
      }
    }

    const results = state.pendingNumbers.map(item => ({
      input: item.input,
      output: item.output
    }))

    setState(prev => ({
      ...prev,
      pendingNumbers: prev.pendingNumbers.map(p => ({ ...p, revealed: true })),
      history: prev.history.map(h => ({ ...h, revealed: true })),
      patternRevealed: true
    }))

    const resultText = results.map(r => `${r.input} ➡️ ${r.output}`).join('、')

    return {
      success: true,
      results,
      message: '🎉 好的，让我来告诉你魔盒的秘密！',
      explanation: [
        `看看这些变化：${resultText}`,
        '',
        '🔮 魔盒的规律是：',
        '把两位数的【十位】和【个位】交换位置！',
        '',
        `比如 ${results[0].input}：`,
        `• 十位是 ${Math.floor(results[0].input / 10)}`,
        `• 个位是 ${results[0].input % 10}`,
        `• 交换后就变成了 ${results[0].output}！`,
        '',
        '🌟 你发现这个规律了吗？真是太聪明了！'
      ],
      encouragement: '你已经掌握了数字魔盒的秘密！🏆'
    }
  }, [state.pendingNumbers])

  // 清空历史
  const clearHistory = useCallback(() => {
    setState({
      pendingNumbers: [],
      history: [],
      patternRevealed: false
    })
  }, [])

  return {
    ...state,
    validateInput,
    processNumber,
    openBox,
    revealPattern,
    clearHistory
  }
}
