<script>
import { ref, onMounted, computed } from 'vue';
import { dataMigration } from '../utils/dataMigration.js';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElInput,
  ElAlert,
  ElCard,
  ElTag,
  ElDivider,
  ElMessage,
  ElLoading,
} from 'element-plus';

export default {
  name: 'DataMigration',
  components: {
    ElButton,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
    ElInput,
    ElAlert,
    ElCard,
    ElTag,
    ElDivider,
  },
  setup() {
    // 表单数据
    const formData = ref({
      tableName: '',
      jsonData: '',
      mapping: {}
    });

    // 表列表
    const tableList = ref([]);
    // 当前选中表的字段列表
    const fieldList = ref([]);
    // 解析后的 JSON 数据
    const parsedJsonData = ref([]);
    // JSON 数据的字段列表
    const jsonFields = ref([]);
    // 迁移结果
    const migrationResult = ref(null);
    // 加载状态
    const loading = ref(false);
    // JSON 解析错误
    const jsonError = ref('');

    // 初始化：获取表列表
    onMounted(async () => {
      try {
        tableList.value = await dataMigration.getTableList();
      } catch (error) {
        console.error('获取表列表失败:', error);
      }
    });

    // 当选择表时，获取字段列表
    const onTableChange = async (tableName) => {
      if (!tableName) {
        fieldList.value = [];
        return;
      }
      try {
        fieldList.value = await dataMigration.getFieldList(tableName);
        // 重置映射
        formData.value.mapping = {};
      } catch (error) {
        console.error('获取字段列表失败:', error);
        fieldList.value = [];
      }
    };

    // 解析 JSON 数据
    const parseJsonData = () => {
      jsonError.value = '';
      parsedJsonData.value = [];
      jsonFields.value = [];

      const jsonStr = formData.value.jsonData.trim();
      if (!jsonStr) {
        return;
      }

      try {
        const data = JSON.parse(jsonStr);
        
        if (!Array.isArray(data)) {
          jsonError.value = 'JSON 数据必须是数组格式';
          return;
        }

        if (data.length === 0) {
          jsonError.value = 'JSON 数组不能为空';
          return;
        }

        parsedJsonData.value = data;

        // 提取所有可能的字段
        const fieldSet = new Set();
        data.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            Object.keys(item).forEach(key => fieldSet.add(key));
          }
        });
        jsonFields.value = Array.from(fieldSet);

        // 自动初始化映射
        jsonFields.value.forEach(field => {
          if (!formData.value.mapping[field]) {
            formData.value.mapping[field] = '';
          }
        });

      } catch (error) {
        jsonError.value = `JSON 解析错误: ${error.message}`;
      }
    };

    // 执行迁移
    const executeMigration = async () => {
      migrationResult.value = null;

      // 验证
      if (!formData.value.tableName) {
        ElMessage.warning('请选择目标数据表');
        return;
      }

      if (parsedJsonData.value.length === 0) {
        ElMessage.warning('请先输入并解析 JSON 数据');
        return;
      }

      // 构建有效的映射（过滤掉未映射的字段）
      const validMapping = {};
      for (const [jsonField, tableField] of Object.entries(formData.value.mapping)) {
        if (tableField) {
          validMapping[jsonField] = tableField;
        }
      }

      if (Object.keys(validMapping).length === 0) {
        ElMessage.warning('请至少配置一个字段映射');
        return;
      }

      loading.value = true;

      try {
        const result = await dataMigration.migrate({
          json_data: parsedJsonData.value,
          mapping: validMapping,
          table_name: formData.value.tableName
        });

        migrationResult.value = result;

        if (result.success) {
          ElMessage.success(`成功导入 ${result.inserted} 条数据`);
        } else {
          ElMessage.warning(`导入完成，成功 ${result.inserted} 条，失败 ${result.failed} 条`);
        }
      } catch (error) {
        ElMessage.error(`迁移失败: ${error.message}`);
      } finally {
        loading.value = false;
      }
    };

    // 清空表单
    const resetForm = () => {
      formData.value = {
        tableName: '',
        jsonData: '',
        mapping: {}
      };
      parsedJsonData.value = [];
      jsonFields.value = [];
      fieldList.value = [];
      migrationResult.value = null;
      jsonError.value = '';
    };

    // 计算属性：是否可以执行迁移
    const canMigrate = computed(() => {
      return formData.value.tableName && 
             parsedJsonData.value.length > 0 && 
             Object.values(formData.value.mapping).some(v => v);
    });

    return {
      formData,
      tableList,
      fieldList,
      parsedJsonData,
      jsonFields,
      migrationResult,
      loading,
      jsonError,
      canMigrate,
      onTableChange,
      parseJsonData,
      executeMigration,
      resetForm,
    };
  },
};
</script>

<template>
  <div class="data-migration">
    <el-card class="section-card">
      <template #header>
        <span class="card-title">数据迁移工具</span>
      </template>

      <el-form label-position="top" :model="formData">
        <!-- 步骤1：选择目标表 -->
        <el-form-item label="1. 选择目标数据表" size="large">
          <el-select 
            v-model="formData.tableName" 
            placeholder="请选择数据表" 
            style="width: 100%"
            @change="onTableChange"
          >
            <el-option
              v-for="table in tableList"
              :key="table.id"
              :label="table.name"
              :value="table.name"
            />
          </el-select>
        </el-form-item>

        <!-- 显示表字段 -->
        <div v-if="fieldList.length > 0" class="field-tags">
          <span class="label">表字段：</span>
          <el-tag 
            v-for="field in fieldList" 
            :key="field.id"
            size="small"
            class="field-tag"
          >
            {{ field.name }}
          </el-tag>
        </div>

        <el-divider />

        <!-- 步骤2：输入 JSON 数据 -->
        <el-form-item label="2. 输入 JSON 数据" size="large">
          <el-input
            v-model="formData.jsonData"
            type="textarea"
            :rows="8"
            placeholder='请输入 JSON 数组，例如：
[
  {"name": "张三", "age": 25, "email": "zhangsan@example.com"},
  {"name": "李四", "age": 30, "email": "lisi@example.com"}
]'
          />
          <el-button 
            type="primary" 
            plain 
            size="default" 
            style="margin-top: 10px"
            @click="parseJsonData"
          >
            解析 JSON
          </el-button>
        </el-form-item>

        <!-- JSON 解析错误 -->
        <el-alert
          v-if="jsonError"
          :title="jsonError"
          type="error"
          show-icon
          :closable="false"
          style="margin-bottom: 16px"
        />

        <!-- JSON 解析成功提示 -->
        <el-alert
          v-if="parsedJsonData.length > 0"
          :title="`成功解析 ${parsedJsonData.length} 条数据，包含 ${jsonFields.length} 个字段`"
          type="success"
          show-icon
          :closable="false"
          style="margin-bottom: 16px"
        />

        <el-divider v-if="jsonFields.length > 0" />

        <!-- 步骤3：配置字段映射 -->
        <el-form-item 
          v-if="jsonFields.length > 0 && fieldList.length > 0" 
          label="3. 配置字段映射"
          size="large"
        >
          <div class="mapping-container">
            <div 
              v-for="jsonField in jsonFields" 
              :key="jsonField"
              class="mapping-row"
            >
              <span class="json-field">{{ jsonField }}</span>
              <span class="arrow">→</span>
              <el-select
                v-model="formData.mapping[jsonField]"
                placeholder="选择对应字段"
                clearable
                size="default"
                style="width: 200px"
              >
                <el-option
                  v-for="field in fieldList"
                  :key="field.id"
                  :label="field.name"
                  :value="field.name"
                />
              </el-select>
            </div>
          </div>
        </el-form-item>

        <el-divider />

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button 
            type="primary" 
            size="large" 
            :loading="loading"
            :disabled="!canMigrate"
            @click="executeMigration"
          >
            {{ loading ? '迁移中...' : '执行迁移' }}
          </el-button>
          <el-button 
            size="large" 
            @click="resetForm"
          >
            重置
          </el-button>
        </div>

        <!-- 迁移结果 -->
        <div v-if="migrationResult" class="migration-result">
          <el-divider />
          <el-alert
            :title="migrationResult.success ? '迁移成功' : '迁移完成（部分失败）'"
            :type="migrationResult.success ? 'success' : 'warning'"
            show-icon
            :closable="false"
          >
            <template #default>
              <div class="result-details">
                <p>总记录数：{{ migrationResult.total }}</p>
                <p>成功插入：{{ migrationResult.inserted }}</p>
                <p>失败数量：{{ migrationResult.failed }}</p>
                <div v-if="migrationResult.errors.length > 0" class="errors">
                  <p>错误信息：</p>
                  <ul>
                    <li v-for="(error, index) in migrationResult.errors.slice(0, 5)" :key="index">
                      {{ error }}
                    </li>
                    <li v-if="migrationResult.errors.length > 5">
                      ... 还有 {{ migrationResult.errors.length - 5 }} 条错误
                    </li>
                  </ul>
                </div>
              </div>
            </template>
          </el-alert>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.data-migration {
  padding: 16px;
}

.section-card {
  margin-bottom: 16px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
}

.field-tags {
  margin-bottom: 16px;
}

.field-tags .label {
  font-size: 14px;
  color: #606266;
  margin-right: 8px;
}

.field-tag {
  margin-right: 6px;
  margin-bottom: 6px;
}

.mapping-container {
  width: 100%;
}

.mapping-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.json-field {
  min-width: 120px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
}

.arrow {
  color: #909399;
  font-size: 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.migration-result {
  margin-top: 16px;
}

.result-details {
  margin-top: 8px;
}

.result-details p {
  margin: 4px 0;
}

.errors {
  margin-top: 8px;
}

.errors ul {
  margin: 4px 0;
  padding-left: 20px;
}

.errors li {
  color: #f56c6c;
  font-size: 12px;
}
</style>
