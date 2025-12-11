<template>
  <Teleport to="body">
    <Transition name="toast-slide">
      <div v-if="visible" class="toast-container" :class="type">
        <div class="toast-icon">
          <span v-if="type === 'success'">✅</span>
          <span v-else-if="type === 'error'">❌</span>
          <span v-else-if="type === 'warning'">⚠️</span>
          <span v-else>ℹ️</span>
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ title }}</div>
          <div v-if="message" class="toast-message">{{ message }}</div>
        </div>
        <div class="toast-close" @click="close">×</div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info', // success, error, warning, info
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 4000 // 自动关闭时间，0 表示不自动关闭
  }
})

const emit = defineEmits(['update:visible'])

const close = () => {
  emit('update:visible', false)
}

// 自动关闭
let timer = null
watch(() => props.visible, (val) => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (val && props.duration > 0) {
    timer = setTimeout(() => {
      close()
    }, props.duration)
  }
}, { immediate: true })
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 280px;
  max-width: 360px;
  padding: 14px 16px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  z-index: 9999;
}

.toast-container.success {
  border-left: 4px solid #67c23a;
}

.toast-container.error {
  border-left: 4px solid #f56c6c;
}

.toast-container.warning {
  border-left: 4px solid #e6a23c;
}

.toast-container.info {
  border-left: 4px solid #409eff;
}

.toast-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.toast-message {
  font-size: 13px;
  color: #606266;
  margin-top: 4px;
  line-height: 1.4;
  word-break: break-word;
}

.toast-close {
  font-size: 18px;
  color: #909399;
  cursor: pointer;
  flex-shrink: 0;
  line-height: 1;
}

.toast-close:hover {
  color: #606266;
}

/* 动画 */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
