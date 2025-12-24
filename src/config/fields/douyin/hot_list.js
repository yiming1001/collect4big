export default {
  inputFields: [
    {
      key: 'func',
      label: '热榜类型',
      type: 'select',
      required: true,
      default: 'high_play',
      options: [
        { value: 'high_play', label: '高完播榜' },
        { value: 'low_fan', label: '低粉热榜' },
        { value: 'total', label: '综合热榜' },
        { value: 'high_like', label: '高点赞榜' },
        { value: 'high_fan', label: '高涨粉榜' }
      ]
    },
    {
      key: 'tags',
      label: '垂类标签（可选）',
      type: 'select',
      default: [],
      multiple: true,
      options: [
        { value: '628', label: '美食' },
        { value: '629', label: '旅行' },
        { value: '634', label: '休闲娱乐' },
        { value: '624', label: '文化' },
        { value: '612', label: '舞蹈' },
        { value: '626', label: '教育校园' },
        { value: '632', label: '艺术' },
        { value: '610', label: '公益' },
        { value: '631', label: '时尚' },
        { value: '635', label: '汽车' },
        { value: '613', label: '动物' },
        { value: '614', label: '三农' },
        { value: '605', label: '电视剧' },
        { value: '607', label: '二次元' },
        { value: '633', label: '体育' },
        { value: '621', label: '医疗健康' },
        { value: '604', label: '电影' },
        { value: '606', label: '音乐' },
        { value: '602', label: '明星' },
        { value: '627', label: '摄影摄像' },
        { value: '611', label: '随拍' },
        { value: '619', label: '生活家居' },
        { value: '641', label: '颜值' },
        { value: '623', label: '情感' },
        { value: '638', label: '人文社科' },
        { value: '616', label: '财经' },
        { value: '615', label: '科技' },
        { value: '622', label: '科普' },
        { value: '625', label: '职场' },
        { value: '603', label: '综艺' },
        { value: '617', label: '母婴' },
        { value: '636', label: '生活记录' },
        { value: '620', label: '法律' },
        { value: '618', label: '亲子' },
        { value: '601', label: '剧情' },
        { value: '608', label: '游戏' }
      ]
    },
    {
      key: 'page',
      label: '页码',
      type: 'number',
      default: 1,
      min: 1
    },
    {
      key: 'page_size',
      label: '每页数量',
      type: 'number',
      default: 40,
      min: 1,
      max: 100
    },
    {
      key: 'data_window',
      label: '数据窗口（小时）',
      type: 'number',
      default: 24,
      min: 1,
      max: 72
    }
  ],
  api: {
    url: 'https://i-sync.cn/api/v1/tools/douyin/fetch_hot_total_high_play_list',
    method: 'POST',
    params: ['page', 'page_size', 'data_window', 'func', 'tags'],
    stringParams: ['page', 'page_size', 'data_window', 'func'],
    transformParams: (params) => {
      if (Array.isArray(params.tags) && params.tags.length > 0) {
        params.tags = params.tags.map(id => ({
          value: Number(id)
        }))
      } else {
        delete params.tags
      }
    },
    dataPath: 'data.data.objs',
    pagination: {
      type: 'page',
      paramName: 'page',
      startPage: 1
    },
    estimatePerPage: 40,
    allowCollectAll: true
  },
  exportFields: [
    { key: 'item_id', label: '作品ID', type: 'text', source: 'item_id' },
    { key: 'item_title', label: '标题', type: 'text', source: 'item_title' },
    { key: 'item_cover_url', label: '封面图', type: 'text', source: 'item_cover_url' },
    {
      key: 'item_duration',
      label: '时长',
      type: 'text',
      source: 'item_duration',
      transform: 'duration'
    },
    { key: 'nick_name', label: '作者昵称', type: 'text', source: 'nick_name' },
    { key: 'avatar_url', label: '作者头像', type: 'text', source: 'avatar_url' },
    { key: 'fans_cnt', label: '粉丝数', type: 'number', source: 'fans_cnt' },
    { key: 'play_cnt', label: '播放量', type: 'number', source: 'play_cnt' },
    {
      key: 'publish_time',
      label: '发布时间',
      type: 'datetime',
      source: 'publish_time',
      transform: 'timestamp'
    },
    { key: 'score', label: '热度得分', type: 'number', source: 'score' },
    { key: 'item_url', label: '作品链接', type: 'text', source: 'item_url' },
    { key: 'like_cnt', label: '点赞数', type: 'number', source: 'like_cnt' },
    { key: 'follow_cnt', label: '涨粉数', type: 'number', source: 'follow_cnt' },
    { key: 'follow_rate', label: '涨粉率', type: 'number', source: 'follow_rate' },
    { key: 'like_rate', label: '点赞率', type: 'number', source: 'like_rate' },
    { key: 'media_type', label: '媒体类型', type: 'number', source: 'media_type' },
    { key: 'favorite_id', label: '收藏ID', type: 'number', source: 'favorite_id' },
    { key: 'is_favorite', label: '是否收藏', type: 'text', source: 'is_favorite' },
    { key: 'image_cnt', label: '图片数量', type: 'number', source: 'image_cnt' },
    { key: 'selected_tags', label: '话题', type: 'text', source: null }
  ]
}
