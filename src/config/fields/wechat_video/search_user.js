/**
 * 微信视频号 - 搜索用户
 */

export default {
  // 输入参数（表单字段）
  inputFields: [
    {
      key: 'keyword',
      label: '搜索关键词',
      type: 'input',
      placeholder: '请输入搜索关键词',
      required: true
    },
    {
      key: 'maxCount',
      label: '最大采集数量',
      type: 'number',
      default: 100,
      min: 1,
      max: 10000
    }
  ],

  // 导出字段（多维表格列定义）
  exportFields: [
    { key: 'nickname', label: '昵称', type: 'text' },
    { key: 'avatar', label: '头像', type: 'url' },
    { key: 'signature', label: '简介', type: 'text' },
    { key: 'fansCount', label: '粉丝数', type: 'number' },
    { key: 'videoCount', label: '作品数', type: 'number' },
    { key: 'likeCount', label: '获赞数', type: 'number' },
    { key: 'profileUrl', label: '主页链接', type: 'url' },
    { key: 'collectTime', label: '采集时间', type: 'datetime' }
  ]
}
