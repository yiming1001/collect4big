/**
 * 微信视频号 - 用户作品
 * 
 * API: http://i-sync.cn/wechat_channels/fetch_home_page
 * 参数: username, last_buffer
 */

export default {
  // 输入参数（表单字段）
  inputFields: [
    {
      key: 'username',
      label: '用户 username',
      type: 'input',
      placeholder: '请输入用户 username（如 v2_060000231003b20f...@finder）',
      required: true
    }
  ],

  // API 配置
  api: {
    url: 'https://i-sync.cn/api/v1/tools/wechat_channels/fetch_home_page',
    method: 'GET',
    params: ['username'],
    dataPath: 'data.videos',
    pagination: {
      paramName: 'last_buffer',
      responsePath: 'data.last_buffer',
      hasMorePath: ''
    },
    estimatePerPage: 15,
    allowCollectAll: true  // 允许全部采集（用户作品数量有限，不会无限）
  },

  // 导出字段（多维表格列定义）
  // key: 输出字段名（写入多维表格时用）
  // label: 多维表格列名
  // type: 字段类型
  // source: 数据来源路径（支持嵌套，如 'author.nickname'）
  // transform: 数据转换方式
  //   - 'timestamp': 时间戳转日期时间
  //   - 'duration': 秒数转时长格式 (mm:ss)
  //   - 'default:VALUE': 默认值
  //   - 函数: 自定义转换 (value, item) => newValue
  exportFields: [
    { key: 'id', label: '视频ID', type: 'text', source: 'id' },
    { key: 'short_title', label: '标题', type: 'text', source: 'short_title' },
    { key: 'description', label: '描述', type: 'text', source: 'description' },
    { key: 'cover_url', label: '封面链接', type: 'text', source: 'cover_url' },
    { key: 'video_url', label: '视频链接', type: 'text', source: 'video_url' },
    { 
      key: 'duration', 
      label: '时长', 
      type: 'text', 
      source: 'duration',
      transform: 'duration'  // 秒数转 mm:ss 格式
    },
    { key: 'like_count', label: '点赞数', type: 'number', source: 'like_count' },
    { key: 'comment_count', label: '评论数', type: 'number', source: 'comment_count' },
    { key: 'forward_count', label: '转发数', type: 'number', source: 'forward_count' },
    { key: 'fav_count', label: '收藏数', type: 'number', source: 'fav_count' },
    { 
      key: 'createtime', 
      label: '发布时间', 
      type: 'datetime', 
      source: 'createtime',
      transform: 'timestamp'  // 时间戳转日期时间
    },
    { key: 'ip_region', label: 'IP属地', type: 'text', source: 'ip_region' },
    // 嵌套字段：author.nickname
    { 
      key: 'author_nickname', 
      label: '作者昵称', 
      type: 'text', 
      source: 'author.nickname' 
    },
    { 
      key: 'author_avatar', 
      label: '作者头像', 
      type: 'text', 
      source: 'author.avatar' 
    },
    { key: 'author_signature', label: '作者简介', type: 'text', source: 'author.signature' },
    { 
      key: 'author_auth_info', 
      label: '作者认证', 
      type: 'text', 
      source: 'author.auth_info',
      transform: 'default:'  // 默认空字符串
    }
  ]
}
