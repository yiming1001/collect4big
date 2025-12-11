<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 导航项
const navItems = [
  { key: 'home', label: '首页', path: '/' },
  { key: 'collect', label: '数据采集', path: '/platform' }
]

// 当前激活的导航
const activeNav = computed(() => {
  if (route.path === '/' || route.path === '/home') return 'home'
  return 'collect'
})

// 导航点击
const handleNav = (item) => {
  router.push(item.path)
}
</script>

<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="nav-header">
      <nav class="nav-bar">
        <div 
          v-for="item in navItems"
          :key="item.key"
          class="nav-item"
          :class="{ active: activeNav === item.key }"
          @click="handleNav(item)"
        >
          {{ item.label }}
        </div>
      </nav>
    </header>
    
    <!-- 路由视图 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.nav-header {
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-bar {
  display: flex;
  padding: 0 16px;
}

.nav-item {
  padding: 14px 20px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.nav-item:hover {
  color: #409eff;
}

.nav-item.active {
  color: #409eff;
  font-weight: 500;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 2px;
  background: #409eff;
  border-radius: 1px;
}

.main-content {
  flex: 1;
  overflow-y: auto;
}
</style>

<style>
/* 全局样式 */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

* {
  box-sizing: border-box;
}
</style>
