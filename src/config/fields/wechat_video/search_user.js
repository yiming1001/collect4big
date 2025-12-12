/**
 * 微信视频号 - 搜索用户
 * 
 * API: /api/v1/tools/wechat_channels/fetch_user_search
 * 参数: keywords, page
 */

export default {
  // 输入参数（表单字段）
  inputFields: [
    {
      key: 'keywords',
      label: '搜索关键词',
      type: 'input',
      placeholder: '请输入搜索关键词（如：美食博主）',
      required: true
    }
  ],

  // API 配置
  api: {
    url: 'https://i-sync.cn/api/v1/tools/wechat_channels/fetch_user_search',
    method: 'GET',
    params: ['keywords'],
    dataPath: 'data.data',  // 数据在 data.data 数组中
    pagination: {
      paramName: 'page',
      type: 'page',  // 页码分页，从1开始
      startPage: 1
    },
    estimatePerPage: 60,
    allowCollectAll: false  // 搜索结果可能很多，不建议全部采集
  },

  // 导出字段（多维表格列定义）
  // 数据结构：data.data[].contact.xxx
  exportFields: [
    { key: 'username', label: '用户ID', type: 'text', source: 'contact.username' },
    { key: 'nickname', label: '昵称', type: 'text', source: 'contact.nickname' },
    { key: 'head_url', label: '头像', type: 'text', source: 'contact.head_url' },
    { key: 'signature', label: '简介', type: 'text', source: 'contact.signature' },
    { 
      key: 'auth_profession', 
      label: '认证信息', 
      type: 'text', 
      source: 'contact.auth_info.auth_profession',
      transform: 'default:'  // 默认空字符串
    }
  ]
}
