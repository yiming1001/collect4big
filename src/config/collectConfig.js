/**
 * 数据采集配置
 * 平台、功能、表单字段配置
 */

// ============ 全局功能定义（通用） ============
export const allFunctions = {
  search_user: { id: 'search_user', name: '搜索用户', icon: '🔍', description: '根据关键词搜索用户' },
  user_videos: { id: 'user_videos', name: '用户作品', icon: '📹', description: '采集用户发布的视频' },
  search_video: { id: 'search_video', name: '搜索视频（作品）', icon: '🎬', description: '根据关键词搜索视频（作品）' },
  video_comments: { id: 'video_comments', name: '视频评论（作品）', icon: '💬', description: '采集视频（作品）评论' },
  search_note: { id: 'search_note', name: '搜索笔记', icon: '�', description: '根据关键词搜索笔记' },
  user_notes: { id: 'user_notes', name: '用户笔记', icon: '�', description: '采集用户发布的笔记' },
  hot_list: { id: 'hot_list', name: '热榜', icon: '🔥', description: '获取平台热榜/热搜榜数据' }
}

// ============ 平台配置 ============
// enabledFunctions: 该平台开启的功能ID列表
export const platforms = [
  {
    id: 'wechat_video',
    name: '微信视频号',
    icon: 'icons/wx_video.png',
    description: '微信视频号数据采集',
    enabledFunctions: ['search_user', 'user_videos']
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    icon: '📕',
    description: '小红书热搜榜数据采集',
    enabledFunctions: ['hot_list']
  },
  {
    id: 'zhihu',
    name: '知乎',
    icon: '❓',
    description: '知乎热榜数据采集',
    enabledFunctions: ['hot_list']
  },
  {
    id: 'bilibili',
    name: 'B站',
    icon: '📺',
    description: '哔哩哔哩热门视频数据采集',
    enabledFunctions: ['hot_list']
  },
  {
    id: 'weibo',
    name: '微博',
    icon: '💬',
    description: '微博热搜榜数据采集',
    enabledFunctions: ['hot_list']
  },
  {
    id: 'douyin',
    name: '抖音',
    icon: '🎵',
    description: '抖音热榜数据采集',
    enabledFunctions: ['hot_list']
  }
]

// ============ 功能配置（按平台/功能分文件） ============
// 从各平台配置文件导入
import wechatVideoConfigs from './fields/wechat_video/index.js'
import xiaohongshuConfigs from './fields/xiaohongshu/index.js'
import zhihuConfigs from './fields/zhihu/index.js'
import bilibiliConfigs from './fields/bilibili/index.js'
import weiboConfigs from './fields/weibo/index.js'
import douyinConfigs from './fields/douyin/index.js'

// 平台功能配置映射
const platformConfigs = {
  wechat_video: wechatVideoConfigs,
  xiaohongshu: xiaohongshuConfigs,
  zhihu: zhihuConfigs,
  bilibili: bilibiliConfigs,
  weibo: weiboConfigs,
  douyin: douyinConfigs
}

// ============ 辅助方法 ============

/**
 * 获取平台开启的功能列表
 */
export function getFunctions(platformId) {
  const platform = platforms.find(p => p.id === platformId)
  if (!platform) return []
  return platform.enabledFunctions.map(funcId => allFunctions[funcId]).filter(Boolean)
}

/**
 * 获取功能配置
 */
export function getFunctionConfig(platformId, functionId) {
  const configs = platformConfigs[platformId]
  if (!configs) return null
  return configs[functionId] || null
}

/**
 * 获取输入字段配置（表单）
 */
export function getInputFields(platformId, functionId) {
  const config = getFunctionConfig(platformId, functionId)
  return config?.inputFields || []
}

/**
 * 获取导出字段配置（多维表格列）
 */
export function getExportFields(platformId, functionId) {
  const config = getFunctionConfig(platformId, functionId)
  return config?.exportFields || []
}

/**
 * 获取 API 配置
 */
export function getApiConfig(platformId, functionId) {
  const config = getFunctionConfig(platformId, functionId)
  return config?.api || null
}

/**
 * 获取字段映射（用于 dataMigration）
 * 将 exportFields 转换为 { key: label } 格式
 */
export function getFieldMapping(platformId, functionId) {
  const exportFields = getExportFields(platformId, functionId)
  const mapping = {}
  for (const field of exportFields) {
    mapping[field.key] = field.label
  }
  return mapping
}

/**
 * 获取字段类型映射（用于创建表时指定字段类型）
 * 返回 { label: type } 格式
 */
export function getFieldTypes(platformId, functionId) {
  const exportFields = getExportFields(platformId, functionId)
  const types = {}
  for (const field of exportFields) {
    types[field.label] = field.type
  }
  return types
}

// ============ 注册方法（动态扩展用） ============

/**
 * 注册新平台
 */
export function registerPlatform(platform) {
  const exists = platforms.find(p => p.id === platform.id)
  if (!exists) {
    platforms.push(platform)
  }
}

/**
 * 注册新的全局功能
 */
export function registerGlobalFunction(func) {
  if (!allFunctions[func.id]) {
    allFunctions[func.id] = func
  }
}

/**
 * 为平台开启功能
 */
export function enableFunction(platformId, functionId) {
  const platform = platforms.find(p => p.id === platformId)
  if (platform && !platform.enabledFunctions.includes(functionId)) {
    platform.enabledFunctions.push(functionId)
  }
}

/**
 * 为平台关闭功能
 */
export function disableFunction(platformId, functionId) {
  const platform = platforms.find(p => p.id === platformId)
  if (platform) {
    platform.enabledFunctions = platform.enabledFunctions.filter(id => id !== functionId)
  }
}

/**
 * 注册表单字段配置
 */
export function registerFormFields(platformId, functionId, fields) {
  const key = `${platformId}_${functionId}`
  formFields[key] = fields
}
