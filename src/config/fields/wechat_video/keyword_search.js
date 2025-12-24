/**
 * 微信视频号 - 关键词搜索视频
 *
 * API: /api/v1/tools/wechat_channels/fetch_default_search
 * 参数: keywords, session_buffer
 */

export default {
  // 输入参数（表单字段）
  inputFields: [
    {
      key: 'keywords',
      label: '搜索关键词',
      type: 'input',
      placeholder: '请输入搜索关键词（如：美食、旅游）',
      required: true
    },
    {
      key: 'session_buffer',
      label: '会话标识（可选）',
      type: 'input',
      placeholder: '一般留空，翻页采集时自动回填',
      required: false,
      default: ''
    }
  ],

  // API 配置
  api: {
    url: 'https://i-sync.cn/api/v1/tools/wechat_channels/fetch_default_search',
    method: 'GET',
    params: ['keywords', 'session_buffer'],
    dataPath: 'data.data', // 数据在 data.data 数组中
    pagination: {
      paramName: 'session_buffer',
      responsePath: 'data.last_buff',
      hasMorePath: ''
    },
    estimatePerPage: 30,
    allowCollectAll: false // 搜索结果可能很多，不建议全部采集
  },

  // 导出字段（多维表格列定义）
  // 数据结构：data.data[].xxx
  exportFields: [
    { key: 'id', label: '视频ID', type: 'text', source: 'id' },
    { key: 'description', label: '描述', type: 'text', source: 'description' },
    { key: 'cover_url', label: '封面链接', type: 'text', source: 'cover_url' },
    { key: 'thumb_url', label: '缩略图链接', type: 'text', source: 'thumb_url' },
    { key: 'video_url', label: '视频链接', type: 'text', source: 'video_url' },
    { key: 'decode_key', label: '解密密钥', type: 'text', source: 'decode_key' },
    {
      key: 'duration',
      label: '时长',
      type: 'text',
      source: 'duration',
      transform: 'duration' // 秒数转 mm:ss 格式
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
      transform: 'timestamp' // 时间戳转日期时间
    },
    { key: 'ip_region', label: 'IP属地', type: 'text', source: 'ip_region' },
    {
      key: 'author_username',
      label: '作者ID',
      type: 'text',
      source: 'author.username'
    },
    {
      key: 'author_nickname',
      label: '作者昵称',
      type: 'text',
      source: 'author.nickname'
    },
    {
      key: 'author_head_url',
      label: '作者头像',
      type: 'text',
      source: 'author.head_url'
    },
    {
      key: 'author_signature',
      label: '作者简介',
      type: 'text',
      source: 'author.signature'
    },
    {
      key: 'author_auth_profession',
      label: '作者认证信息',
      type: 'text',
      source: 'author.auth_profession',
      transform: 'default:' // 默认空字符串
    }
  ]
}

