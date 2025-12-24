export default {
  showCollectSettings: false,
  inputFields: [],
  api: {
    url: 'https://i-sync.cn/api/v1/tools/xiaohongshu/fetch_hot_list',
    method: 'GET',
    params: [],
    dataPath: 'data.data.items',
    estimatePerPage: 50,
    allowCollectAll: false
  },
  exportFields: [
    { key: 'id', label: 'ID', type: 'text', source: 'id' },
    { key: 'title', label: '标题', type: 'text', source: 'title' },
    { key: 'score', label: '热度分', type: 'text', source: 'score' },
    { key: 'rank_change', label: '排名变化', type: 'number', source: 'rank_change' },
    { key: 'type', label: '类型', type: 'text', source: 'type' },
    { key: 'word_type', label: '话题标记', type: 'text', source: 'word_type' },
    { key: 'icon', label: '图标', type: 'text', source: 'icon' },
    { key: 'title_img', label: '标题图', type: 'text', source: 'title_img' }
  ]
}
