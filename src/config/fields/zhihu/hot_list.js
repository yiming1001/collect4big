export default {
  showCollectSettings: false,
  inputFields: [
    {
      key: 'limit',
      label: '返回数量',
      type: 'number',
      default: 50,
      min: 1,
      max: 50
    },
    {
      key: 'desktop',
      label: '桌面端样式',
      type: 'switch',
      default: true,
      description: '是否按桌面端样式返回'
    }
  ],
  api: {
    url: 'https://i-sync.cn/api/v1/tools/zhihu/fetch_hot_list',
    method: 'POST',
    params: ['limit', 'desktop'],
    stringParams: ['limit', 'desktop'],
    dataPath: 'data.list',
    estimatePerPage: 50,
    allowCollectAll: false
  },
  exportFields: [
    { key: 'id', label: 'ID', type: 'text', source: 'id' },
    { key: 'title', label: '标题', type: 'text', source: 'title' },
    { key: 'url', label: '链接', type: 'text', source: 'url' },
    {
      key: 'created',
      label: '创建时间',
      type: 'datetime',
      source: 'created',
      transform: 'timestamp'
    },
    { key: 'answer_count', label: '回答数', type: 'number', source: 'answer_count' },
    { key: 'follower_count', label: '关注数', type: 'number', source: 'follower_count' },
    { key: 'excerpt', label: '摘要', type: 'text', source: 'excerpt' },
    { key: 'author_name', label: '作者昵称', type: 'text', source: 'author.name' },
    { key: 'author_avatar', label: '作者头像', type: 'text', source: 'author.avatar_url' },
    { key: 'detail_text', label: '热度描述', type: 'text', source: 'detail_text' },
    { key: 'thumbnail', label: '封面图', type: 'text', source: 'thumbnail' }
  ]
}
