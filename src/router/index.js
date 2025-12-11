import { createRouter, createWebHashHistory } from 'vue-router'

// 页面组件
import HomePage from '@/views/HomePage.vue'
import PlatformSelect from '@/views/PlatformSelect.vue'
import CollectForm from '@/views/CollectForm.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { title: '首页' }
  },
  {
    path: '/platform',
    name: 'PlatformSelect',
    component: PlatformSelect,
    meta: { title: '选择平台' }
  },
  {
    path: '/collect',
    name: 'CollectForm',
    component: CollectForm,
    meta: { title: '数据采集' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
