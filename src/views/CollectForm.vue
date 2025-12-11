<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { platforms, getFunctions, getInputFields, getExportFields, getFieldMapping, getApiConfig, getFunctionConfig } from '@/config/collectConfig.js'
import { dataMigration } from '@/utils/dataMigration.js'
import { collect } from '@/utils/collector.js'
import CollectSettings from '@/components/CollectSettings.vue'
import DrawerMessage from '@/components/DrawerMessage.vue'

const router = useRouter()
const route = useRoute()

const platform = ref('')
const functionType = ref('')
const formData = ref({})
const exportMode = ref('new')
const newTableName = ref('')
const existingTableId = ref('')
const tableList = ref([])
const tableLoading = ref(false)
const collecting = ref(false)
const fieldCheckResult = ref(null)
const fieldChecking = ref(false)

// Toast 消息
const drawerVisible = ref(false)
const drawerType = ref('info')
const drawerTitle = ref('')
const drawerMessage = ref('')

// 显示 Toast 消息
const showDrawer = (type, title, message) => {
  drawerType.value = type
  drawerTitle.value = title
  drawerMessage.value = message
  drawerVisible.value = true
}

// 采集设置
const collectMode = ref('times')
const collectTimes = ref(5)
const apiConfig = computed(() => getApiConfig(platform.value, functionType.value))

const currentPlatform = computed(() => platforms.find(p => p.id === platform.value) || {})
const currentFunction = computed(() => {
  const funcs = getFunctions(platform.value)
  return funcs.find(f => f.id === functionType.value) || {}
})
const currentFields = computed(() => getInputFields(platform.value, functionType.value))
const exportFields = computed(() => getExportFields(platform.value, functionType.value))

onMounted(async () => {
  platform.value = route.query.platform || ''
  functionType.value = route.query.function || ''
  if (!platform.value || !functionType.value) {
    ElMessage.warning('参数错误')
    router.push('/platform')
    return
  }
  const fields = getInputFields(platform.value, functionType.value)
  fields.forEach(field => {
    formData.value[field.key] = field.default !== undefined ? field.default : ''
  })
  await loadTableList()
  await generateDefaultTableName()
})

// 生成默认表名（平台+功能，重复则加数字后缀）
const generateDefaultTableName = async () => {
  const baseName = `${currentPlatform.value.name || ''}${currentFunction.value.name || ''}`
  if (!baseName) return
  
  // 检查是否重复，重复则加数字
  const existingNames = new Set(tableList.value.map(t => t.name))
  if (!existingNames.has(baseName)) {
    newTableName.value = baseName
    return
  }
  
  let counter = 1
  let uniqueName = `${baseName}${counter}`
  while (existingNames.has(uniqueName)) {
    counter++
    uniqueName = `${baseName}${counter}`
  }
  newTableName.value = uniqueName
}

const loadTableList = async () => {
  tableLoading.value = true
  try {
    tableList.value = await dataMigration.getTableList()
  } catch (error) {
    console.error('获取表列表失败:', error)
  } finally {
    tableLoading.value = false
  }
}

const goBack = () => router.push('/platform')

// 监听表选择变化，自动检查字段
watch(existingTableId, async (newVal) => {
  if (newVal && exportMode.value === 'existing') {
    await checkTableFields()
  } else {
    fieldCheckResult.value = null
  }
})

// 检查表字段是否匹配
const checkTableFields = async () => {
  if (!existingTableId.value) return
  
  fieldChecking.value = true
  fieldCheckResult.value = null
  
  try {
    // 获取选中表的名称
    const selectedTable = tableList.value.find(t => t.id === existingTableId.value)
    if (!selectedTable) return
    
    // 获取表的字段列表
    const tableFields = await dataMigration.getFieldList(selectedTable.name)
    const tableFieldNames = tableFields.map(f => f.name)
    
    // 获取需要的导出字段
    const requiredFields = exportFields.value
    
    // 对比字段
    const matched = []
    const missing = []
    
    for (const field of requiredFields) {
      if (tableFieldNames.includes(field.label)) {
        matched.push(field.label)
      } else {
        missing.push(field.label)
      }
    }
    
    fieldCheckResult.value = {
      total: requiredFields.length,
      matched,
      missing,
      isValid: missing.length === 0
    }
  } catch (error) {
    console.error('检查字段失败:', error)
    fieldCheckResult.value = { error: error.message }
  } finally {
    fieldChecking.value = false
  }
}

const validateForm = () => {
  for (const field of currentFields.value) {
    if (field.required && !formData.value[field.key]) {
      ElMessage.warning('请填写' + field.label)
      return false
    }
  }
  if (exportMode.value === 'new' && !newTableName.value.trim()) {
    ElMessage.warning('请输入新表名称')
    return false
  }
  if (exportMode.value === 'existing' && !existingTableId.value) {
    showDrawer('warning', '请选择数据表', '')
    return false
  }
  return true
}

const startCollect = async () => {
  if (!validateForm()) return
  collecting.value = true
  try {
    console.log('采集参数:', formData.value)
    
    // 获取功能配置
    const config = getFunctionConfig(platform.value, functionType.value)
    if (!config || !config.api) {
      showDrawer('error', '配置错误', '未找到API配置')
      return
    }
    
    // 采集设置
    const settings = {
      mode: collectMode.value,
      times: collectTimes.value
    }
    
    // 从 localStorage 获取 token
    const userToken = localStorage.getItem('user_token') || ''
    if (!userToken) {
      showDrawer('warning', '未配置 Token', '请先在首页绑定 Token')
      return
    }
    
    // 调用采集器获取数据
    const collectedData = await collect(
      config,
      formData.value,
      settings,
      userToken,
      {
        onProgress: (times, total) => {
          console.log(`采集进度: 第${times}次，共${total}条`)
        }
      }
    )
    
    console.log('采集到的数据:', collectedData)
    
    if (collectedData.length === 0) {
      showDrawer('warning', '采集结果', '未采集到数据')
      return
    }
    
    // 获取字段映射
    const mapping = getFieldMapping(platform.value, functionType.value)
    
    let result
    if (exportMode.value === 'new') {
      // 新建数据表并写入数据
      result = await dataMigration.createTableAndMigrate(
        newTableName.value.trim(),
        collectedData,
        mapping,
        exportFields.value
      )
      if (result.success) {
        showDrawer('success', '采集完成', `已创建表「${result.tableName}」，写入 ${result.inserted} 条数据`)
        // 刷新表列表
        await loadTableList()
      } else {
        showDrawer('error', '采集失败', result.errors.join('\n'))
      }
    } else {
      // 写入已有数据表
      const selectedTable = tableList.value.find(t => t.id === existingTableId.value)
      if (!selectedTable) {
        showDrawer('error', '错误', '未找到选中的数据表')
        return
      }
      result = await dataMigration.migrate({
        json_data: collectedData,
        mapping,
        table_name: selectedTable.name
      })
      if (result.success) {
        showDrawer('success', '采集完成', `已写入 ${result.inserted} 条数据到「${selectedTable.name}」`)
      } else {
        showDrawer('error', '采集失败', result.errors.join('\n'))
      }
    }
  } catch (error) {
    console.error('采集错误:', error)
    showDrawer('error', '采集失败', error.message)
  } finally {
    collecting.value = false
  }
}

</script>

<template>
  <div class="collect-form">
    <div class="top-bar">
      <div class="back-btn" @click="goBack">← 返回</div>
      <div class="page-info">
        <span class="tag platform">
          <img v-if="currentPlatform.icon?.startsWith('/')" :src="currentPlatform.icon" class="tag-icon" />
          <span v-else>{{ currentPlatform.icon }}</span>
          {{ currentPlatform.name }}
        </span>
        <span class="tag function">
          <img v-if="currentFunction.icon?.startsWith('/')" :src="currentFunction.icon" class="tag-icon" />
          <span v-else>{{ currentFunction.icon }}</span>
          {{ currentFunction.name }}
        </span>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">📝 采集参数</span>
      </div>
      <div class="card-body">
        <template v-for="field in currentFields" :key="field.key">
          <div v-if="field.type === 'input'" class="form-group">
            <label class="form-label">{{ field.label }}<span v-if="field.required" class="required">*</span></label>
            <input v-model="formData[field.key]" type="text" class="form-input" :placeholder="field.placeholder" />
          </div>
          <div v-else-if="field.type === 'number'" class="form-group">
            <label class="form-label">{{ field.label }}<span v-if="field.required" class="required">*</span></label>
            <input v-model.number="formData[field.key]" type="number" class="form-input" :min="field.min" :max="field.max" />
          </div>
          <div v-else-if="field.type === 'switch'" class="form-group switch-group">
            <div class="switch-row">
              <label class="form-label">{{ field.label }}</label>
              <div class="switch" :class="{ active: formData[field.key] }" @click="formData[field.key] = !formData[field.key]">
                <div class="switch-handle"></div>
              </div>
            </div>
            <div v-if="field.description" class="field-desc">{{ field.description }}</div>
          </div>
          <div v-else-if="field.type === 'select'" class="form-group">
            <label class="form-label">{{ field.label }}<span v-if="field.required" class="required">*</span></label>
            <select v-model="formData[field.key]" class="form-select">
              <option value="">请选择</option>
              <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </template>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">⚙️ 采集设置</span>
      </div>
      <div class="card-body">
        <CollectSettings
          v-model:mode="collectMode"
          v-model:times="collectTimes"
          :estimatePerPage="apiConfig?.estimatePerPage || 20"
          :allowCollectAll="apiConfig?.allowCollectAll || false"
        />
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">📤 导出到数据表</span>
      </div>
      <div class="card-body">
        <div class="mode-selector">
          <div class="mode-item" :class="{ active: exportMode === 'new' }" @click="exportMode = 'new'">
            <span class="mode-radio"></span><span>新建数据表</span>
          </div>
          <div class="mode-item" :class="{ active: exportMode === 'existing' }" @click="exportMode = 'existing'">
            <span class="mode-radio"></span><span>已有数据表</span>
          </div>
        </div>
        <div v-if="exportMode === 'new'" class="form-group">
          <label class="form-label">表名称 <span class="required">*</span></label>
          <input v-model="newTableName" type="text" class="form-input" placeholder="请输入新表名称" />
        </div>
        <div v-else class="form-group">
          <label class="form-label">选择数据表 <span class="required">*</span></label>
          <div class="table-select-row">
            <select v-model="existingTableId" class="form-select">
              <option value="">请选择数据表</option>
              <option v-for="table in tableList" :key="table.id" :value="table.id">{{ table.name }}</option>
            </select>
          </div>
          <!-- 字段检查结果 -->
          <div v-if="fieldChecking" class="field-check checking">
            <span class="check-icon">⏳</span> 检查中...
          </div>
          <div v-else-if="fieldCheckResult" class="field-check" :class="{ valid: fieldCheckResult.isValid, invalid: !fieldCheckResult.isValid && !fieldCheckResult.error }">
            <template v-if="fieldCheckResult.error">
              <span class="check-icon">⚠️</span> 检查失败: {{ fieldCheckResult.error }}
            </template>
            <template v-else-if="fieldCheckResult.isValid">
              <span class="check-icon">✅</span> 字段匹配 ({{ fieldCheckResult.matched.length }}/{{ fieldCheckResult.total }})
            </template>
            <template v-else>
              <div class="check-header">
                <span class="check-icon">❌</span> 缺少 {{ fieldCheckResult.missing.length }} 个字段
              </div>
              <div class="missing-fields">
                <span v-for="field in fieldCheckResult.missing" :key="field" class="missing-tag">{{ field }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="action-bar">
      <button class="collect-btn" :class="{ loading: collecting }" :disabled="collecting" @click="startCollect">
        {{ collecting ? '采集中...' : '开始采集' }}
      </button>
    </div>

    <!-- 右侧浮动 Toast 提示 -->
    <DrawerMessage
      v-model:visible="drawerVisible"
      :type="drawerType"
      :title="drawerTitle"
      :message="drawerMessage"
    />
  </div>
</template>

<style scoped>
.collect-form { padding: 16px; display: flex; flex-direction: column; gap: 16px; }
.top-bar { display: flex; align-items: center; justify-content: space-between; }
.back-btn { color: #606266; cursor: pointer; font-size: 14px; }
.back-btn:hover { color: #409eff; }
.page-info { display: flex; gap: 8px; }
.tag { font-size: 12px; padding: 4px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; }
.tag.platform { background: #ecf5ff; color: #409eff; }
.tag.function { background: #f0f9eb; color: #67c23a; }
.tag-icon { width: 14px; height: 14px; object-fit: contain; }
.card { background: #fff; border-radius: 10px; overflow: hidden; }
.card-header { padding: 14px 16px; border-bottom: 1px solid #f0f0f0; }
.card-title { font-size: 15px; font-weight: 600; color: #303133; }
.card-body { padding: 16px; }
.form-group { margin-bottom: 16px; }
.form-group:last-child { margin-bottom: 0; }
.form-label { display: block; font-size: 13px; color: #606266; margin-bottom: 8px; }
.required { color: #f56c6c; }
.form-input, .form-select { width: 100%; padding: 10px 12px; border: 1px solid #dcdfe6; border-radius: 6px; font-size: 14px; color: #303133; background: #fff; transition: border-color 0.2s; box-sizing: border-box; }
.form-input:focus, .form-select:focus { outline: none; border-color: #409eff; }
.form-input::placeholder { color: #c0c4cc; }
.switch-group { margin-bottom: 16px; }
.switch-row { display: flex; align-items: center; justify-content: space-between; }
.switch-row .form-label { margin-bottom: 0; }
.switch { width: 44px; height: 24px; background: #dcdfe6; border-radius: 12px; position: relative; cursor: pointer; transition: background 0.2s; }
.switch.active { background: #409eff; }
.switch-handle { width: 20px; height: 20px; background: #fff; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.switch.active .switch-handle { left: 22px; }
.field-desc { font-size: 12px; color: #909399; margin-top: 6px; }
.mode-selector { display: flex; gap: 20px; margin-bottom: 16px; }
.mode-item { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #606266; }
.mode-radio { width: 16px; height: 16px; border: 2px solid #dcdfe6; border-radius: 50%; position: relative; transition: all 0.2s; }
.mode-item.active .mode-radio { border-color: #409eff; }
.mode-item.active .mode-radio::after { content: ''; position: absolute; top: 3px; left: 3px; width: 6px; height: 6px; background: #409eff; border-radius: 50%; }
.action-bar { margin-top: 8px; }
.collect-btn { width: 100%; padding: 14px 20px; background: #67c23a; color: #fff; border: none; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.collect-btn:hover:not(:disabled) { background: #85ce61; }
.collect-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.collect-btn.loading { background: #909399; }

/* 字段检查样式 */
.table-select-row { display: flex; gap: 8px; }
.table-select-row .form-select { flex: 1; }
.field-check { margin-top: 10px; padding: 10px 12px; border-radius: 6px; font-size: 13px; }
.field-check.checking { background: #f4f4f5; color: #909399; }
.field-check.valid { background: #f0f9eb; color: #67c23a; }
.field-check.invalid { background: #fef0f0; color: #f56c6c; }
.check-icon { margin-right: 4px; }
.check-header { margin-bottom: 8px; }
.missing-fields { display: flex; flex-wrap: wrap; gap: 6px; }
.missing-tag { background: #fde2e2; color: #f56c6c; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
</style>