export default {
  showCollectSettings: false,
  inputFields: [],
  api: {
    url: 'https://i-sync.cn/api/v1/tools/weibo/fetch_hot_search_summary',
    method: 'GET',
    params: [],
    dataPath: 'data.data',
    estimatePerPage: 50,
    allowCollectAll: false
  },
  exportFields: [
    { key: 'rank',         label: '排名',       type: 'number', source: 'rank' },
    { key: 'is_top',       label: '置顶',       type: 'text',   source: 'is_top' },
    { key: 'keyword',      label: '关键词',     type: 'text',   source: 'keyword' },
    { 
      key: 'keyword_url', 
      label: '话题链接', 
      type: 'text', 
      source: 'keyword_url',
      transform: (value) => {
        if (!value) return ''
        if (value.startsWith('http')) return value
        return `https://s.weibo.com${value}`
      }
    },
    { key: 'tag',          label: '标签',       type: 'text',   source: 'tag' },
    { key: 'heat',         label: '热度',       type: 'text',   source: 'heat' }
  ]
}
