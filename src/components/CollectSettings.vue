<script setup>
/**
 * 采集设置组件
 * 通用的采集次数/全部采集控制
 */
import { computed } from 'vue'

const props = defineProps({
  // 采集模式: 'times' | 'all'
  mode: {
    type: String,
    default: 'times'
  },
  // 采集次数
  times: {
    type: Number,
    default: 5
  },
  // 每次约多少条（用于估算）
  estimatePerPage: {
    type: Number,
    default: 20
  },
  // 是否允许全部采集
  allowCollectAll: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:mode', 'update:times'])

// 估算数据条数
const estimateCount = computed(() => {
  return props.times * props.estimatePerPage
})

// 切换模式
const setMode = (newMode) => {
  emit('update:mode', newMode)
}

// 更新次数
const updateTimes = (e) => {
  const val = parseInt(e.target.value, 10)
  if (!isNaN(val) && val >= 1) {
    emit('update:times', val)
  }
}
</script>

<template>
  <div class="collect-settings">
    <div class="settings-row">
      <div class="times-input" :class="{ disabled: mode === 'all' }">
        <label class="label">采集次数</label>
        <div class="input-group">
          <input 
            type="number" 
            :value="times" 
            @input="updateTimes"
            :disabled="mode === 'all'"
            min="1"
            max="100"
            class="num-input"
          />
          <span class="unit">次</span>
        </div>
        <span class="estimate">约 {{ estimateCount }} 条数据</span>
      </div>
    </div>
    
    <div v-if="allowCollectAll" class="settings-row">
      <div class="all-switch" @click="setMode(mode === 'all' ? 'times' : 'all')">
        <div class="checkbox" :class="{ checked: mode === 'all' }">
          <span v-if="mode === 'all'" class="check-icon">✓</span>
        </div>
        <span class="switch-label">全部采集（直到没有更多数据）</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.collect-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-row {
  display: flex;
  align-items: center;
}

.times-input {
  display: flex;
  align-items: center;
  gap: 12px;
}

.times-input.disabled {
  opacity: 0.5;
}

.label {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.num-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.num-input:focus {
  outline: none;
  border-color: #409eff;
}

.num-input:disabled {
  background: #f5f7fa;
  cursor: not-allowed;
}

.unit {
  font-size: 13px;
  color: #606266;
}

.estimate {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.all-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.checkbox {
  width: 16px;
  height: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.checkbox.checked {
  background: #409eff;
  border-color: #409eff;
}

.check-icon {
  color: #fff;
  font-size: 12px;
  line-height: 1;
}

.switch-label {
  font-size: 13px;
  color: #606266;
}
</style>
