/**
 * 数据转换工具
 * 根据 exportFields 配置，将 API 返回的原始数据转换为多维表格需要的格式
 */

/**
 * 内置转换器
 */
const transformers = {
  /**
   * 秒级时间戳转毫秒级时间戳
   * @param {number} value - Unix 时间戳（秒）
   * @returns {number} - 毫秒级时间戳
   */
  timestamp: (value) => {
    if (!value) return 0
    return value * 1000
  },

  /**
   * 秒数转时长格式
   * @param {number} value - 秒数
   * @returns {string} - 格式化的时长 HH:mm:ss 或 mm:ss
   */
  duration: (value) => {
    if (!value || value <= 0) return '00:00'
    const hours = Math.floor(value / 3600)
    const minutes = Math.floor((value % 3600) / 60)
    const seconds = Math.floor(value % 60)
    const pad = (n) => String(n).padStart(2, '0')
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    }
    return `${pad(minutes)}:${pad(seconds)}`
  },

  /**
   * 当前时间（毫秒级时间戳）
   * @returns {number} - 当前毫秒级时间戳
   */
  now: () => {
    return Date.now()
  }
}

/**
 * 从嵌套对象中获取值
 * @param {Object} obj - 源对象
 * @param {string} path - 路径，如 'author.nickname'
 * @returns {any} - 获取到的值
 */
function getNestedValue(obj, path) {
  if (!path || !obj) return undefined
  const keys = path.split('.')
  let value = obj
  for (const key of keys) {
    if (value === null || value === undefined) return undefined
    value = value[key]
  }
  return value
}

/**
 * 解析转换配置
 * @param {string|Function} transform - 转换配置
 * @returns {Function} - 转换函数
 */
function parseTransform(transform) {
  if (!transform) return (v) => v
  if (typeof transform === 'function') return transform

  // 解析字符串配置
  if (transform.startsWith('default:')) {
    const defaultValue = transform.split(':')[1] || ''
    return (value) => (value === null || value === undefined || value === '') ? defaultValue : value
  }

  // 内置转换器
  if (transformers[transform]) {
    return transformers[transform]
  }

  // 未知转换，返回原值
  return (v) => v
}

/**
 * 转换单条数据
 * @param {Object} item - 原始数据项
 * @param {Array} exportFields - 导出字段配置
 * @returns {Object} - 转换后的数据
 */
export function transformItem(item, exportFields) {
  const result = {}
  
  for (const field of exportFields) {
    const { key, source, transform } = field
    
    // 获取原始值
    let value
    if (source === null || source === undefined) {
      // 无数据来源，使用转换器生成
      value = undefined
    } else {
      value = getNestedValue(item, source)
    }
    
    // 应用转换
    const transformFn = parseTransform(transform)
    result[key] = transformFn(value, item)
  }
  
  return result
}

/**
 * 批量转换数据
 * @param {Array} items - 原始数据数组
 * @param {Array} exportFields - 导出字段配置
 * @returns {Array} - 转换后的数据数组
 */
export function transformData(items, exportFields) {
  if (!Array.isArray(items)) return []
  return items.map(item => transformItem(item, exportFields))
}

/**
 * 从响应中提取数据
 * @param {Object} response - API 响应
 * @param {string} dataPath - 数据路径，如 'data.videos'
 * @returns {Array} - 提取的数据数组
 */
export function extractData(response, dataPath) {
  if (!dataPath) return response
  return getNestedValue(response, dataPath) || []
}

/**
 * 生成字段映射（用于 dataMigration）
 * @param {Array} exportFields - 导出字段配置
 * @returns {Object} - { key: label } 映射
 */
export function generateMapping(exportFields) {
  const mapping = {}
  for (const field of exportFields) {
    mapping[field.key] = field.label
  }
  return mapping
}

export default {
  transformItem,
  transformData,
  extractData,
  generateMapping,
  transformers
}
