# 数据采集插件开发指南

## 项目结构

```
src/
├── config/
│   ├── collectConfig.js           # 主配置（平台、功能定义）
│   └── fields/                    # 功能配置（按平台/功能分文件）
│       ├── wechat_video/          # 微信视频号
│       │   ├── index.js           # 汇总导出
│       │   ├── search_user.js     # 搜索用户功能
│       │   └── user_videos.js     # 用户作品功能
│       ├── douyin/                # 抖音
│       │   ├── index.js
│       │   ├── search_user.js
│       │   └── ...
│       └── xiaohongshu/           # 小红书
│           └── ...
├── views/
│   ├── HomePage.vue               # 首页（个人中心 + 帮助中心）
│   ├── PlatformSelect.vue         # 平台/功能选择页
│   └── CollectForm.vue            # 采集表单页（动态渲染）
└── utils/
    └── dataMigration.js           # 飞书多维表格 SDK 封装
```

---

## 核心概念

### 1. 功能是全局通用的
所有功能定义在 `allFunctions` 中，各平台只需开启/关闭即可：

```javascript
// collectConfig.js
export const allFunctions = {
  search_user: { id: 'search_user', name: '搜索用户', icon: '🔍', description: '根据关键词搜索用户' },
  user_videos: { id: 'user_videos', name: '用户作品', icon: '📹', description: '采集用户发布的视频' },
  search_video: { id: 'search_video', name: '搜索视频', icon: '🎬', description: '根据关键词搜索视频' },
  video_comments: { id: 'video_comments', name: '视频评论', icon: '💬', description: '采集视频评论' },
  search_note: { id: 'search_note', name: '搜索笔记', icon: '📝', description: '根据关键词搜索笔记' },
  user_notes: { id: 'user_notes', name: '用户笔记', icon: '📓', description: '采集用户发布的笔记' }
}
```

### 2. 平台只需声明开启哪些功能
```javascript
export const platforms = [
  {
    id: 'wechat_video',
    name: '微信视频号',
    icon: '📺',
    description: '微信视频号数据采集',
    enabledFunctions: ['search_user', 'user_videos']  // 开启的功能
  }
]
```

### 3. 表单字段按平台分文件
每个平台的字段配置放在独立文件中，便于维护。

---

## 如何添加新平台

### 步骤 1：在 collectConfig.js 中注册平台

```javascript
export const platforms = [
  // ... 已有平台
  {
    id: 'douyin',
    name: '抖音',
    icon: '🎵',
    description: '抖音短视频数据采集',
    enabledFunctions: ['search_user', 'user_videos', 'search_video', 'video_comments']
  }
]
```

### 步骤 2：创建功能配置目录

创建 `src/config/fields/douyin/` 目录，每个功能一个文件：

**search_user.js**
```javascript
/**
 * 抖音 - 搜索用户
 */
export default {
  // 输入参数（表单字段）
  inputFields: [
    { key: 'keyword', label: '搜索关键词', type: 'input', placeholder: '请输入关键词', required: true },
    { key: 'maxCount', label: '最大采集数量', type: 'number', default: 100, min: 1, max: 5000 }
  ],

  // 导出字段（多维表格列定义）
  exportFields: [
    { key: 'nickname', label: '昵称', type: 'text' },
    { key: 'avatar', label: '头像', type: 'url' },
    { key: 'fansCount', label: '粉丝数', type: 'number' },
    { key: 'profileUrl', label: '主页链接', type: 'url' },
    { key: 'collectTime', label: '采集时间', type: 'datetime' }
  ]
}
```

**index.js**（汇总导出）
```javascript
import search_user from './search_user.js'
import user_videos from './user_videos.js'

export default {
  search_user,
  user_videos
}
```

### 步骤 3：在 collectConfig.js 中导入

```javascript
import wechatVideoConfigs from './fields/wechat_video/index.js'
import douyinConfigs from './fields/douyin/index.js'  // 新增

const platformConfigs = {
  wechat_video: wechatVideoConfigs,
  douyin: douyinConfigs  // 新增
}
```

---

## 如何添加新的全局功能

如果需要添加一个全新的功能类型：

```javascript
// 在 allFunctions 中添加
export const allFunctions = {
  // ... 已有功能
  live_room: { id: 'live_room', name: '直播间', icon: '📡', description: '采集直播间数据' }
}

// 然后在需要的平台中开启
{
  id: 'douyin',
  enabledFunctions: ['search_user', 'user_videos', 'live_room']  // 添加 live_room
}
```

---

## 动态开启/关闭功能

```javascript
import { enableFunction, disableFunction } from '@/config/collectConfig.js'

// 为抖音开启直播间功能
enableFunction('douyin', 'live_room')

// 为抖音关闭视频评论功能
disableFunction('douyin', 'video_comments')
```

---

## 支持的表单字段类型

| 类型 | 说明 | 配置项 |
|------|------|--------|
| `input` | 文本输入框 | `placeholder`, `required` |
| `number` | 数字输入框 | `default`, `min`, `max`, `required` |
| `select` | 下拉选择框 | `options: [{value, label}]`, `required` |
| `switch` | 开关 | `default`, `description` |

### 字段通用配置

```javascript
{
  key: 'fieldName',      // 字段名（必填）
  label: '显示标签',      // 标签文字（必填）
  type: 'input',         // 字段类型（必填）
  required: false,       // 是否必填
  default: '',           // 默认值
  placeholder: '',       // 占位文字（input 类型）
  description: '',       // 描述文字（switch 类型）
  options: [],           // 选项列表（select 类型）
  min: 0,                // 最小值（number 类型）
  max: 10000             // 最大值（number 类型）
}
```

---

## 完整示例：添加小红书平台

### 1. 注册平台（collectConfig.js）

```javascript
export const platforms = [
  // ... 已有平台
  {
    id: 'xiaohongshu',
    name: '小红书',
    icon: '📕',
    description: '小红书笔记数据采集',
    enabledFunctions: ['search_note', 'user_notes']
  }
]
```

### 2. 创建字段配置（fields/xiaohongshu.js）

```javascript
export const fields = {
  xiaohongshu_search_note: [
    { key: 'keyword', label: '搜索关键词', type: 'input', placeholder: '请输入关键词', required: true },
    { key: 'noteType', label: '笔记类型', type: 'select', options: [
      { value: 'all', label: '全部' },
      { value: 'video', label: '视频笔记' },
      { value: 'image', label: '图文笔记' }
    ]},
    { key: 'maxCount', label: '最大采集数量', type: 'number', default: 50, min: 1, max: 1000 }
  ],

  xiaohongshu_user_notes: [
    { key: 'userUrl', label: '用户主页链接', type: 'input', placeholder: '请输入用户主页链接', required: true },
    { key: 'maxCount', label: '最大采集数量', type: 'number', default: 100, min: 1, max: 2000 }
  ]
}
```

### 3. 导入配置（collectConfig.js）

```javascript
import { fields as xiaohongshuFields } from './fields/xiaohongshu.js'

export const formFields = {
  ...wechatVideoFields,
  ...xiaohongshuFields
}
```

---

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```
