export default {
  inputFields: [
    {
      key: 'pn',
      label: '起始页码',
      type: 'number',
      default: 1,
      min: 1,
      max: 100
    }
  ],
  api: {
    url: 'https://i-sync.cn/api/v1/tools/bilibili/fetch_com_popular',
    method: 'POST',
    params: ['pn'],
    dataPath: 'data.list',
    pagination: {
      type: 'page',
      paramName: 'pn',
      startPage: 1
    },
    estimatePerPage: 20,
    allowCollectAll: false
  },
  exportFields: [
    { key: 'aid', label: '稿件ID', type: 'text', source: 'aid' },
    { key: 'bvid', label: 'BVID', type: 'text', source: 'bvid' },
    { key: 'title', label: '标题', type: 'text', source: 'title' },
    { key: 'tname', label: '分区', type: 'text', source: 'tname' },
    {
      key: 'pubdate',
      label: '发布时间',
      type: 'datetime',
      source: 'pubdate',
      transform: 'timestamp'
    },
    {
      key: 'duration',
      label: '时长',
      type: 'text',
      source: 'duration',
      transform: 'duration'
    },
    { key: 'pub_location', label: '发布地区', type: 'text', source: 'pub_location' },
    { key: 'view', label: '播放量', type: 'number', source: 'view' },
    { key: 'danmaku', label: '弹幕数', type: 'number', source: 'danmaku' },
    { key: 'reply', label: '评论数', type: 'number', source: 'reply' },
    { key: 'favorite', label: '收藏数', type: 'number', source: 'favorite' },
    { key: 'coin', label: '投币数', type: 'number', source: 'coin' },
    { key: 'share', label: '分享数', type: 'number', source: 'share' },
    { key: 'like', label: '点赞数', type: 'number', source: 'like' },
    { key: 'short_link_v2', label: '短链接', type: 'text', source: 'short_link_v2' },
    { key: 'pic', label: '封面图', type: 'text', source: 'pic' },
    { key: 'owner_mid', label: 'UP主ID', type: 'number', source: 'owner.mid' },
    { key: 'owner_name', label: 'UP主昵称', type: 'text', source: 'owner.name' },
    { key: 'owner_face', label: 'UP主头像', type: 'text', source: 'owner.face' }
  ]
}

