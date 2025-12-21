import { createRouter, createWebHashHistory } from 'vue-router'

import HomePage from '@/views/HomePage.vue'
import PlatformSelect from '@/views/PlatformSelect.vue'
import CollectForm from '@/views/CollectForm.vue'

const routes = [
  {
    path: '/',
    name: 'PlatformSelect',
    component: PlatformSelect,
    meta: { title: '数据采集' }
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { title: '个人中心' }
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
