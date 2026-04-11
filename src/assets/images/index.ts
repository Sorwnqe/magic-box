// 疯狂动物城主题素材索引

// 角色图片
export const characters = {
  // 朱迪 (Judy)
  judy: new URL('./characters/bunny-officer.png', import.meta.url).href,
  judyLeft: new URL('./characters/bunny-officer-l.png', import.meta.url).href,
  
  // 尼克 (Nick)
  nick: new URL('./characters/nick.png', import.meta.url).href,
  nickRight: new URL('./characters/nick-r.png', import.meta.url).href,
  
  // 闪电 (Flash)
  flash: new URL('./characters/flash-sloth.png', import.meta.url).href,
  flashRight: new URL('./characters/flash-sloth-r.png', import.meta.url).href,
  
  // 狮子市长 (Lionheart)
  lionheart: new URL('./characters/lionheart.png', import.meta.url).href,
}

// 背景图片
export const backgrounds = {
  // 动物城天际线 - 入场动画
  skyline: new URL('./backgrounds/bg-zootopia-skyline.png', import.meta.url).href,
  
  // 警局 - 第一关
  policeStation: new URL('./backgrounds/bg-police-station.png', import.meta.url).href,
  
  // 神秘小巷 - 第二关
  mysticAlley: new URL('./backgrounds/bg-mystic-alley.png', import.meta.url).href,
  
  // 城市广场 - 第三关
  cityPlaza: new URL('./backgrounds/bg-city-plaza.png', import.meta.url).href,
  
  // 市政厅塔楼 - 第四关
  cityHallTower: new URL('./backgrounds/bg-city-hall-tower.png', import.meta.url).href,
}

// 表情图片
export const expressions = {
  // 朱迪表情
  judyHappy: new URL('./expressions/judy-happy.png', import.meta.url).href,
  judySurprised: new URL('./expressions/judy-surprised.png', import.meta.url).href,
  
  // 尼克表情
  nickThumbsup: new URL('./expressions/nick-thumbsup.png', import.meta.url).href,
  nickSmirk: new URL('./expressions/nick-smirk.png', import.meta.url).href,
  nickSurprised: new URL('./expressions/nick-surprised.png', import.meta.url).href,
  
  // 组合表情
  judyNickHighfive: new URL('./expressions/judy-nick-highfive.png', import.meta.url).href,
  teamVictory: new URL('./expressions/team-victory.png', import.meta.url).href,
}

// UI元素
export const ui = {
  dialogBunny: new URL('./ui/ui-dialog-bunny.png', import.meta.url).href,
  dialogFox: new URL('./ui/ui-dialog-fox.png', import.meta.url).href,
}

// 道具图片
export const items = {
  // 魔法盒 - 第一关
  magicBox: new URL('./items/item-magic-box.png', import.meta.url).href,
  
  // 魔法天秤 - 第二关
  magicScale: new URL('./items/item-magic-scale.png', import.meta.url).href,
  
  // 魔法阵 - 第三关
  magicCircle: new URL('./items/item-magic-circle.png', import.meta.url).href,
  
  // 魔法钥匙 - 第四关
  magicKey: new URL('./items/item-magic-key.png', import.meta.url).href,
  
  // 胜利徽章
  victoryBadge: new URL('./items/item-victory-badge.png', import.meta.url).href,
}

// 动物城主题配色
export const zootopiaColors = {
  // 主色调 - 警服蓝
  primary: '#1e40af',
  primaryLight: '#3b82f6',
  primaryDark: '#1e3a8a',
  
  // 辅助色 - 温暖橙
  accent: '#f97316',
  accentLight: '#fb923c',
  accentDark: '#ea580c',
  
  // 成功绿
  success: '#22c55e',
  successLight: '#4ade80',
  
  // 金色 - 高亮
  gold: '#fbbf24',
  goldLight: '#fde68a',
  
  // 紫色 - 魔法
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  
  // 背景色
  bgLight: '#f0f9ff',
  bgWarm: '#fffbeb',
  
  // 文字色
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
}

export default {
  characters,
  backgrounds,
  expressions,
  ui,
  items,
  colors: zootopiaColors,
}
