<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// Token 相关
const token = ref('')
const tokenLoading = ref(false)
const saveLoading = ref(false)
const credits = ref(null)  // 资源点

// 从本地存储加载 token
onMounted(async () => {
  const savedToken = localStorage.getItem('user_token')
  if (savedToken) {
    token.value = savedToken
    // 自动获取资源点
    await fetchCredits()
  }
})

// 保存 token
const saveToken = async () => {
  if (!token.value.trim()) {
    ElMessage.warning('请输入 Token')
    return
  }
  saveLoading.value = true
  try {
    // 保存到本地
    localStorage.setItem('user_token', token.value.trim())
    // 验证并获取资源点
    await fetchCredits()
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败：' + (error.message || '连接失败'))
  } finally {
    saveLoading.value = false
  }
}

// 获取资源点
const fetchCredits = async () => {
  if (!token.value.trim()) {
    credits.value = null
    return
  }
  tokenLoading.value = true
  try {
    const response = await fetch('https://i-sync.cn/api/v1/credits/balance-by-key', {
      headers: {
        'Authorization': `Bearer ${token.value.trim()}`
      }
    })
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('API Key 无效')
      }
      throw new Error('请求失败')
    }
    const data = await response.json()
    credits.value = data.credits ?? 0
  } catch (error) {
    credits.value = null
    throw error
  } finally {
    tokenLoading.value = false
  }
}

// 刷新资源点
const refreshCredits = async () => {
  if (!token.value.trim()) {
    ElMessage.warning('请先输入 Token')
    return
  }
  try {
    await fetchCredits()
    ElMessage.success('刷新成功')
  } catch (error) {
    ElMessage.error('刷新失败：' + (error.message || '连接失败'))
  }
}

// 帮助中心链接配置
const helpLinks = [
  { title: '使用教程', emoji: '📖', url: 'https://example.com/tutorial', color: '#409EFF' },
  { title: '购买链接', emoji: '🛒', url: 'https://example.com/purchase', color: '#67C23A' },
  { title: '联系客服', emoji: '💬', url: 'https://example.com/support', color: '#E6A23C' },
  { title: '更多作品', emoji: '🎨', url: 'https://example.com/works', color: '#F56C6C' }
]

// 打开链接
const openLink = (url) => {
  window.open(url, '_blank')
}
</script>

<template>
  <div class="home-page">
    <!-- 个人中心卡片 -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">👤 个人中心</span>
      </div>
      <div class="card-body">
        <!-- 资源点显示 -->
        <div v-if="credits !== null" class="credits-display">
          <span class="credits-label">当前资源点</span>
          <span class="credits-value">{{ credits }}</span>
        </div>
        
        <div class="form-group">
          <label class="form-label">绑定 Token</label>
          <input 
            v-model="token"
            type="password"
            class="form-input"
            placeholder="请输入您的 Token"
          />
        </div>
        <div class="btn-group">
          <button 
            class="btn btn-primary" 
            :disabled="saveLoading"
            @click="saveToken"
          >
            {{ saveLoading ? '保存中...' : '保存' }}
          </button>
          <button 
            class="btn btn-default" 
            :disabled="tokenLoading"
            @click="refreshCredits"
          >
            {{ tokenLoading ? '刷新中...' : '刷新' }}
          </button>
        </div>
        <div class="tip">Token 用于身份验证和数据同步，请妥善保管</div>
      </div>
    </div>

    <!-- 帮助中心卡片 -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">❓ 帮助中心</span>
      </div>
      <div class="card-body">
        <div class="help-grid">
          <div 
            v-for="item in helpLinks" 
            :key="item.title"
            class="help-item"
            @click="openLink(item.url)"
          >
            <div class="help-icon" :style="{ backgroundColor: item.color }">
              <span>{{ item.emoji }}</span>
            </div>
            <span class="help-title">{{ item.title }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
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
  padding: 16px;
}

/* 表单样式 */
.form-group {
  margin-bottom: 14px;
}

.form-label {
  display: block;
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  color: #303133;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #409eff;
}

.form-input::placeholder {
  color: #c0c4cc;
}

/* 按钮组 */
.btn-group {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #409eff;
  color: #fff;
}

.btn-primary:hover {
  background: #66b1ff;
}

.btn-default {
  background: #f5f7fa;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn-default:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background: #ecf5ff;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tip {
  font-size: 12px;
  color: #909399;
}

/* 资源点显示 */
.credits-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  margin-bottom: 14px;
}

.credits-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.credits-value {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

/* 帮助中心网格 */
.help-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.help-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border-radius: 8px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;
  gap: 8px;
}

.help-item:hover {
  background: #f0f7ff;
  transform: translateY(-2px);
}

.help-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.help-title {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}
</style>
