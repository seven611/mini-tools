/*
 * Original for 随手口袋工具 (GPL-3.0).
 * 工具元数据总枢纽：驱动首页网格、搜索、最近/收藏、关于页署名与隐私声明。
 */

export type ToolSource = 'it-tools' | 'original'

export interface ToolMeta {
  id: string
  name: string
  description: string
  keywords: string[]
  icon: string
  color: string
  pagePath: string
  source: ToolSource
  upstreamPath?: string
  privacy: ('clipboard' | 'album')[]
}

export const TOOLS: ToolMeta[] = [
  {
    id: 'qr-code',
    name: '二维码生成器',
    description: '文字/链接转二维码，可保存分享',
    keywords: ['二维码', '生成', 'erweima', 'qr', '扫码', '制作'],
    icon: '▦',
    color: '#21B573',
    pagePath: '/pages-tools/qr-code/index',
    source: 'it-tools',
    upstreamPath: 'src/tools/qr-code-generator',
    privacy: ['clipboard', 'album'],
  },
  {
    id: 'wifi-qr',
    name: 'WiFi 二维码',
    description: '扫码即连 WiFi，待客神器',
    keywords: ['wifi', '无线', '扫码连网', 'wangluo', '二维码', '网络'],
    icon: '≋',
    color: '#3B82F6',
    pagePath: '/pages-tools/wifi-qr/index',
    source: 'it-tools',
    upstreamPath: 'src/tools/wifi-qr-code-generator',
    privacy: ['clipboard', 'album'],
  },
  {
    id: 'password-generator',
    name: '随机密码生成器',
    description: '加密安全随机，长度字符可选',
    keywords: ['密码', '生成', 'mima', '随机', 'password', '安全'],
    icon: '✱',
    color: '#8B5CF6',
    pagePath: '/pages-tools/password-generator/index',
    source: 'it-tools',
    upstreamPath: 'src/tools/token-generator',
    privacy: ['clipboard'],
  },
  {
    id: 'password-strength',
    name: '密码强度检测',
    description: '熵值与破解时间估算',
    keywords: ['密码', '强度', '检测', 'mima', 'qiangdu', '安全', 'password'],
    icon: '✓',
    color: '#F59E0B',
    pagePath: '/pages-tools/password-strength/index',
    source: 'it-tools',
    upstreamPath: 'src/tools/password-strength-analyser',
    privacy: ['clipboard'],
  },
  {
    id: 'text-statistics',
    name: '字数统计',
    description: '字数/字符/行数/字节，写作必备',
    keywords: ['字数', '统计', 'zishu', '字符', '作文', '小红书', '公众号'],
    icon: '¶',
    color: '#EC4899',
    pagePath: '/pages-tools/text-statistics/index',
    source: 'it-tools',
    upstreamPath: 'src/tools/text-statistics',
    privacy: ['clipboard'],
  },
  {
    id: 'percentage-calculator',
    name: '百分比计算器',
    description: '折扣/占比/涨跌幅一键算',
    keywords: ['百分比', '折扣', 'baifenbi', '涨幅', '计算', 'percent'],
    icon: '%',
    color: '#EF4444',
    pagePath: '/pages-tools/percentage-calculator/index',
    source: 'it-tools',
    upstreamPath: 'src/tools/percentage-calculator',
    privacy: ['clipboard'],
  },
  {
    id: 'temperature-converter',
    name: '温度换算',
    description: '摄氏/华氏/开尔文等 8 种单位',
    keywords: ['温度', '换算', 'wendu', '摄氏', '华氏', '烘焙', '烤箱'],
    icon: '℃',
    color: '#F97316',
    pagePath: '/pages-tools/temperature-converter/index',
    source: 'it-tools',
    upstreamPath: 'src/tools/temperature-converter',
    privacy: ['clipboard'],
  },
  {
    id: 'datetime-converter',
    name: '时间戳转换',
    description: 'Unix 时间戳与日期互转',
    keywords: ['时间戳', 'unix', 'shijianchuo', '日期', '转换', 'timestamp'],
    icon: '◷',
    color: '#06B6D4',
    pagePath: '/pages-tools/datetime-converter/index',
    source: 'it-tools',
    upstreamPath: 'src/tools/date-time-converter',
    privacy: ['clipboard'],
  },
  {
    id: 'rmb-uppercase',
    name: '人民币大写转换',
    description: '报销/发票金额转中文大写',
    keywords: ['人民币', '大写', 'daxie', '金额', '报销', '发票', '财务'],
    icon: '¥',
    color: '#DC2626',
    pagePath: '/pages-tools-cn/rmb-uppercase/index',
    source: 'original',
    privacy: ['clipboard'],
  },
]

export function getTool(id: string): ToolMeta | undefined {
  return TOOLS.find(tool => tool.id === id)
}

export function searchTools(query: string): ToolMeta[] {
  const q = query.trim().toLowerCase()
  if (!q) {
    return TOOLS
  }
  return TOOLS.filter(tool =>
    tool.name.toLowerCase().includes(q)
    || tool.description.toLowerCase().includes(q)
    || tool.keywords.some(keyword => keyword.toLowerCase().includes(q)),
  )
}