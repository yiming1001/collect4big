<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { platforms, getFunctions } from '@/config/collectConfig.js'

const router = useRouter()

// 选中的平台
const selectedPlatform = ref('')
// 选中的功能
const selectedFunction = ref('')

// 当前平台的功能列表
const currentFunctions = computed(() => {
  return getFunctions(selectedPlatform.value)
})

// 选择平台
const selectPlatform = (platformId) => {
  if (selectedPlatform.value === platformId) {
    selectedPlatform.value = ''
  } else {
    selectedPlatform.value = platformId
  }
  selectedFunction.value = ''
}

// 选择功能
const selectFunction = (functionId) => {
  if (selectedFunction.value === functionId) {
    selectedFunction.value = ''
  } else {
    selectedFunction.value = functionId
  }
}

// 确定按钮
const handleConfirm = () => {
  if (!selectedPlatform.value) {
    ElMessage.warning('请选择平台')
    return
  }
  if (!selectedFunction.value) {
    ElMessage.warning('请选择功能')
    return
  }
  router.push({
    path: '/collect',
    query: {
      platform: selectedPlatform.value,
      function: selectedFunction.value
    }
  })
}
</script>

<template>
  <div class="platform-select">
    <!-- 选择平台卡片 -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">📱 选择平台</span>
      </div>
      <div class="card-body">
        <div class="option-list">
          <div 
            v-for="platform in platforms"
            :key="platform.id"
            class="option-item"
            :class="{ selected: selectedPlatform === platform.id }"
            @click="selectPlatform(platform.id)"
          >
            <img v-if="platform.icon.startsWith('/')" :src="platform.icon" class="option-icon-img" />
            <span v-else class="option-icon">{{ platform.icon }}</span>
            <div class="option-info">
              <div class="option-name">{{ platform.name }}</div>
              <div class="option-desc">{{ platform.description }}</div>
            </div>
            <span v-if="selectedPlatform === platform.id" class="check">✓</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 选择功能卡片（选择平台后显示） -->
    <div v-if="selectedPlatform && currentFunctions.length > 0" class="card">
      <div class="card-header">
        <span class="card-title">⚙️ 选择功能</span>
      </div>
      <div class="card-body">
        <div class="option-list">
          <div 
            v-for="func in currentFunctions"
            :key="func.id"
            class="option-item"
            :class="{ selected: selectedFunction === func.id }"
            @click="selectFunction(func.id)"
          >
            <img v-if="func.icon.startsWith('/')" :src="func.icon" class="option-icon-img" />
            <span v-else class="option-icon">{{ func.icon }}</span>
            <div class="option-info">
              <div class="option-name">{{ func.name }}</div>
              <div class="option-desc">{{ func.description }}</div>
            </div>
            <span v-if="selectedFunction === func.id" class="check">✓</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 确定按钮 -->
    <div v-if="selectedFunction" class="action-bar">
      <button class="confirm-btn" @click="handleConfirm">
        确定
      </button>
    </div>
  </div>
</template>

<style scoped>
.platform-select {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 卡片样式 */
.card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
}

.card-header {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.card-body {
  padding: 12px;
}

/* 选项列表 */
.option-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  background: #f9fafb;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-item:hover {
  background: #f0f7ff;
  border-color: #d4e8ff;
}

.option-item.selected {
  background: #ecf5ff;
  border-color: #409eff;
}

.option-icon {
  font-size: 24px;
  margin-right: 12px;
  flex-shrink: 0;
}

.option-icon-img {
  width: 28px;
  height: 28px;
  margin-right: 12px;
  flex-shrink: 0;
  object-fit: contain;
}

.option-info {
  flex: 1;
  min-width: 0;
}

.option-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.option-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.check {
  width: 20px;
  height: 20px;
  background: #409eff;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

/* 确定按钮 */
.action-bar {
  margin-top: 8px;
}

.confirm-btn {
  width: 100%;
  padding: 14px 20px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-btn:hover {
  background: #66b1ff;
}
</style>
