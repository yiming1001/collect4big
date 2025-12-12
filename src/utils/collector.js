/**
 * 数据采集器
 * 负责循环请求 API 并收集数据
 */

import { transformData, extractData } from './dataTransform.js'

/**
 * 从嵌套对象中获取值
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
 * 采集配置
 * @typedef {Object} CollectConfig
 * @property {Object} api - API 配置
 * @property {Array} exportFields - 导出字段配置
 */

/**
 * 采集设置
 * @typedef {Object} CollectSettings
 * @property {'times'|'all'} mode - 采集模式
 * @property {number} times - 采集次数（mode='times' 时有效）
 */

/**
 * 采集回调
 * @typedef {Object} CollectCallbacks
 * @property {Function} onProgress - 进度回调 (currentTimes, totalItems)
 * @property {Function} onPageData - 每页数据回调 (items)
 */

/**
 * 执行数据采集
 * @param {CollectConfig} config - 功能配置
 * @param {Object} inputParams - 用户输入的参数
 * @param {CollectSettings} settings - 采集设置
 * @param {string} token - API Token
 * @param {CollectCallbacks} callbacks - 回调函数
 * @returns {Promise<Array>} - 采集到的所有数据
 */
export async function collect(config, inputParams, settings, token, callbacks = {}) {
  const { api, exportFields } = config
  const { onProgress, onPageData } = callbacks
  
  let allData = []
  let cursorValue = ''  // 分页游标值（游标分页用）
  let pageNumber = api.pagination?.startPage || 1  // 页码（页码分页用）
  let prevCursorValue = ''  // 上一次的游标值（用于兜底检测）
  let sameCursorCount = 0  // 连续相同游标计数
  let currentTimes = 0
  
  while (true) {
    // 构建请求参数
    const requestParams = { ...inputParams }
    
    // 添加分页参数
    if (api.pagination) {
      if (api.pagination.type === 'page') {
        // 页码分页：page=1, 2, 3...
        requestParams[api.pagination.paramName] = pageNumber
      } else {
        // 游标分页：始终添加，第一次为空字符串
        requestParams[api.pagination.paramName] = cursorValue || ''
      }
    }
    
    // 发起请求
    console.log(`[采集] 第${currentTimes + 1}次请求，参数:`, requestParams)
    const response = await fetchApi(api.url, api.method, requestParams, token)
    
    // 检查响应
    if (!response || response.code !== 200) {
      throw new Error(response?.message || '请求失败')
    }
    
    // 提取数据
    const rawItems = extractData(response, api.dataPath)
    
    // 转换数据
    const items = transformData(rawItems, exportFields)
    
    // 累加数据
    allData = allData.concat(items)
    currentTimes++
    
    // 回调
    if (onProgress) onProgress(currentTimes, allData.length)
    if (onPageData) onPageData(items)
    
    // 判断是否继续
    // 页码分页模式
    if (api.pagination?.type === 'page') {
      // 页码分页：本页数据为空则结束
      if (items.length === 0) {
        console.log('采集完成：本页无数据')
        break
      }
      
      // 达到次数限制
      if (settings.mode === 'times' && currentTimes >= settings.times) {
        console.log('采集完成：达到次数限制', currentTimes)
        break
      }
      
      // 递增页码
      pageNumber++
      continue
    }
    
    // 游标分页模式
    // 1. 获取下一页游标
    const newCursorValue = api.pagination 
      ? (getNestedValue(response, api.pagination.responsePath) || '')
      : ''
    
    // 2. 检查是否有更多数据（如果接口提供了 hasMore 字段）
    let hasMore = true
    if (api.pagination?.hasMorePath) {
      const hasMoreValue = getNestedValue(response, api.pagination.hasMorePath)
      hasMore = hasMoreValue === true || hasMoreValue === 1 || hasMoreValue === '1'
    }
    
    // 3. 兜底逻辑：检查游标是否连续相同（针对没有 hasMore 的接口）
    if (newCursorValue && newCursorValue === prevCursorValue) {
      sameCursorCount++
    } else {
      sameCursorCount = 0
    }
    
    // 更新游标
    prevCursorValue = cursorValue
    cursorValue = newCursorValue
    
    // 终止条件
    // a. 没有更多数据（接口明确返回）
    if (!hasMore) {
      console.log('采集完成：没有更多数据')
      break
    }
    
    // b. 没有游标了
    if (!cursorValue) {
      console.log('采集完成：没有分页游标')
      break
    }
    
    // c. 兜底：游标连续2次相同，视为已到末尾
    if (sameCursorCount >= 2) {
      console.log('采集完成：分页游标连续相同，已到末尾')
      break
    }
    
    // d. 达到次数限制（非全部采集模式）
    if (settings.mode === 'times' && currentTimes >= settings.times) {
      console.log('采集完成：达到次数限制', currentTimes)
      break
    }
  }
  
  return allData
}

/**
 * 发起 API 请求
 * @param {string} url - API 地址
 * @param {string} method - 请求方法
 * @param {Object} params - 请求参数
 * @param {string} token - API Token
 * @returns {Promise<Object>} - 响应数据
 */
async function fetchApi(url, method, params, token) {
  const headers = {
    'Content-Type': 'application/json'
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  let requestUrl = url
  let body = null
  
  if (method === 'GET') {
    // GET 请求，参数拼接到 URL
    // 只过滤 null 和 undefined，保留空字符串（某些 API 需要空字符串参数）
    const filteredParams = {}
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        filteredParams[key] = value
      }
    }
    const queryString = new URLSearchParams(filteredParams).toString()
    if (queryString) {
      requestUrl = `${url}?${queryString}`
    }
  } else {
    // POST 等请求，参数放 body
    body = JSON.stringify(params)
  }
  
  const response = await fetch(requestUrl, {
    method,
    headers,
    body
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  return response.json()
}

export default {
  collect
}
