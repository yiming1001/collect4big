/**
 * 数据迁移工具类
 * 将 JSON 数据批量写入飞书多维表格
 */
import { bitable, FieldType } from '@lark-base-open/js-sdk';

/**
 * 数据迁移配置
 * @typedef {Object} MigrationConfig
 * @property {Array<Object>} json_data - JSON 对象数组
 * @property {Object<string, string>} mapping - 字段映射 { json字段名: 多维表中文字段名 }
 * @property {string} table_name - 目标表名
 */

/**
 * 迁移结果
 * @typedef {Object} MigrationResult
 * @property {boolean} success - 是否成功
 * @property {number} total - 总记录数
 * @property {number} inserted - 成功插入数
 * @property {number} failed - 失败数
 * @property {Array<string>} errors - 错误信息列表
 */

class DataMigration {
  constructor() {
    this.base = bitable.base;
  }

  /**
   * 执行数据迁移
   * @param {MigrationConfig} config - 迁移配置
   * @returns {Promise<MigrationResult>} 迁移结果
   */
  async migrate(config) {
    const { json_data, mapping, table_name } = config;
    
    const result = {
      success: false,
      total: json_data.length,
      inserted: 0,
      failed: 0,
      errors: []
    };

    try {
      // 1. 获取目标表
      const table = await this.getTableByName(table_name);
      if (!table) {
        result.errors.push(`找不到名为 "${table_name}" 的数据表`);
        return result;
      }

      // 2. 获取表的字段信息，建立字段名到字段ID的映射
      const fieldMap = await this.buildFieldMap(table);
      
      // 3. 验证映射的字段是否存在
      const missingFields = this.validateMapping(mapping, fieldMap);
      if (missingFields.length > 0) {
        result.errors.push(`以下字段在表中不存在: ${missingFields.join(', ')}`);
        return result;
      }

      // 4. 批量插入数据
      const batchSize = 100; // 每批处理100条
      for (let i = 0; i < json_data.length; i += batchSize) {
        const batch = json_data.slice(i, i + batchSize);
        const batchResult = await this.insertBatch(table, batch, mapping, fieldMap);
        
        result.inserted += batchResult.inserted;
        result.failed += batchResult.failed;
        result.errors.push(...batchResult.errors);
      }

      result.success = result.failed === 0;
      return result;

    } catch (error) {
      result.errors.push(`迁移过程出错: ${error.message}`);
      return result;
    }
  }

  /**
   * 通过表名获取表实例
   * @param {string} tableName - 表名
   * @returns {Promise<ITable|null>}
   */
  async getTableByName(tableName) {
    try {
      return await this.base.getTableByName(tableName);
    } catch (error) {
      console.error('获取表失败:', error);
      return null;
    }
  }

  /**
   * 构建字段名到字段信息的映射
   * @param {ITable} table - 表实例
   * @returns {Promise<Map<string, {id: string, type: FieldType}>>}
   */
  async buildFieldMap(table) {
    const fieldMap = new Map();
    const fieldList = await table.getFieldMetaList();
    
    for (const field of fieldList) {
      fieldMap.set(field.name, {
        id: field.id,
        type: field.type
      });
    }
    
    return fieldMap;
  }

  /**
   * 验证映射中的字段是否都存在于表中
   * @param {Object} mapping - 字段映射
   * @param {Map} fieldMap - 字段信息映射
   * @returns {Array<string>} 缺失的字段名列表
   */
  validateMapping(mapping, fieldMap) {
    const missingFields = [];
    
    for (const targetFieldName of Object.values(mapping)) {
      if (!fieldMap.has(targetFieldName)) {
        missingFields.push(targetFieldName);
      }
    }
    
    return missingFields;
  }

  /**
   * 批量插入数据
   * @param {ITable} table - 表实例
   * @param {Array<Object>} batch - 数据批次
   * @param {Object} mapping - 字段映射
   * @param {Map} fieldMap - 字段信息映射
   * @returns {Promise<{inserted: number, failed: number, errors: Array}>}
   */
  async insertBatch(table, batch, mapping, fieldMap) {
    const batchResult = {
      inserted: 0,
      failed: 0,
      errors: []
    };

    const records = [];

    for (let i = 0; i < batch.length; i++) {
      const item = batch[i];
      try {
        const fields = this.transformRecord(item, mapping, fieldMap);
        records.push({ fields });
      } catch (error) {
        batchResult.failed++;
        batchResult.errors.push(`第 ${i + 1} 条数据转换失败: ${error.message}`);
      }
    }

    if (records.length > 0) {
      try {
        // 使用 addRecords 批量插入
        await table.addRecords(records);
        batchResult.inserted = records.length;
      } catch (error) {
        // 如果批量插入失败，尝试逐条插入
        console.warn('批量插入失败，尝试逐条插入:', error);
        for (const record of records) {
          try {
            await table.addRecord(record);
            batchResult.inserted++;
          } catch (singleError) {
            batchResult.failed++;
            batchResult.errors.push(`插入记录失败: ${singleError.message}`);
          }
        }
      }
    }

    return batchResult;
  }

  /**
   * 转换单条记录
   * @param {Object} item - 原始数据对象
   * @param {Object} mapping - 字段映射
   * @param {Map} fieldMap - 字段信息映射
   * @returns {Object} 转换后的 fields 对象
   */
  transformRecord(item, mapping, fieldMap) {
    const fields = {};

    for (const [sourceKey, targetFieldName] of Object.entries(mapping)) {
      if (item.hasOwnProperty(sourceKey)) {
        const fieldInfo = fieldMap.get(targetFieldName);
        if (fieldInfo) {
          const value = this.formatValue(item[sourceKey], fieldInfo.type);
          if (value !== null && value !== undefined) {
            fields[fieldInfo.id] = value;
          }
        }
      }
    }

    return fields;
  }

  /**
   * 根据字段类型格式化值
   * @param {any} value - 原始值
   * @param {FieldType} fieldType - 字段类型
   * @returns {any} 格式化后的值
   */
  formatValue(value, fieldType) {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    switch (fieldType) {
      case FieldType.Text:
        // 多行文本需要特殊格式
        return [{
          type: 'text',
          text: String(value)
        }];

      case FieldType.Number:
        const num = Number(value);
        return isNaN(num) ? null : num;

      case FieldType.DateTime:
        // 日期时间需要时间戳（毫秒）
        if (typeof value === 'number') {
          return value;
        }
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date.getTime();

      case FieldType.Checkbox:
        return Boolean(value);

      case FieldType.SingleSelect:
        // 单选直接返回选项文本
        return String(value);

      case FieldType.MultiSelect:
        // 多选返回选项文本数组
        if (Array.isArray(value)) {
          return value.map(v => String(v));
        }
        return [String(value)];

      case FieldType.Url:
        // URL 字段格式
        return {
          link: String(value),
          text: String(value)
        };

      case FieldType.Phone:
        return String(value);

      case FieldType.Email:
        return String(value);

      default:
        // 其他类型尝试直接返回
        return value;
    }
  }

  /**
   * 获取所有表的元信息
   * @returns {Promise<Array<{id: string, name: string}>>}
   */
  async getTableList() {
    return await this.base.getTableMetaList();
  }

  /**
   * 获取指定表的字段列表
   * @param {string} tableName - 表名
   * @returns {Promise<Array<{id: string, name: string, type: FieldType}>>}
   */
  async getFieldList(tableName) {
    const table = await this.getTableByName(tableName);
    if (!table) {
      return [];
    }
    return await table.getFieldMetaList();
  }

  /**
   * 创建新数据表并添加字段
   * @param {string} tableName - 表名
   * @param {Array<{label: string, type: string}>} exportFields - 导出字段配置
   * @returns {Promise<{success: boolean, tableId: string, error?: string}>}
   */
  async createTable(tableName, exportFields) {
    try {
      // 创建表
      const { tableId } = await this.base.addTable({
        name: tableName,
        fields: []
      });

      // 获取表实例
      const table = await this.base.getTableById(tableId);

      // 获取默认字段列表（飞书会自动创建一个默认文本字段，无法删除）
      const fieldList = await table.getFieldList();
      const defaultField = fieldList && fieldList.length > 0 ? fieldList[0] : null;

      // 添加自定义字段（跳过第一个，用默认字段改名代替）
      for (let i = 0; i < exportFields.length; i++) {
        const field = exportFields[i];
        const fieldType = this.mapFieldType(field.type);
        
        if (i === 0 && defaultField) {
          // 第一个字段：将默认字段改名（类型保持文本）
          await table.setField(defaultField.id, {
            name: field.label
          });
        } else {
          // 其他字段：新增
          await table.addField({
            name: field.label,
            type: fieldType
          });
        }
      }

      return { success: true, tableId };
    } catch (error) {
      console.error('创建表失败:', error);
      return { success: false, tableId: null, error: error.message };
    }
  }

  /**
   * 将配置中的类型字符串映射为 FieldType 枚举
   * @param {string} typeStr - 类型字符串 (text, number, url, datetime 等)
   * @returns {FieldType}
   */
  mapFieldType(typeStr) {
    const typeMap = {
      'text': FieldType.Text,
      'number': FieldType.Number,
      'url': FieldType.Url,
      'datetime': FieldType.DateTime,
      'checkbox': FieldType.Checkbox,
      'singleSelect': FieldType.SingleSelect,
      'multiSelect': FieldType.MultiSelect,
      'phone': FieldType.Phone,
      'email': FieldType.Email
    };
    return typeMap[typeStr] || FieldType.Text;
  }

  /**
   * 生成唯一表名（如果重复则加数字后缀）
   * @param {string} baseName - 基础表名
   * @returns {Promise<string>} 唯一的表名
   */
  async generateUniqueTableName(baseName) {
    const tableList = await this.getTableList();
    const existingNames = new Set(tableList.map(t => t.name));

    if (!existingNames.has(baseName)) {
      return baseName;
    }

    // 表名重复，加数字后缀
    let counter = 1;
    let newName = `${baseName}${counter}`;
    while (existingNames.has(newName)) {
      counter++;
      newName = `${baseName}${counter}`;
    }
    return newName;
  }

  /**
   * 创建表并写入数据（完整流程）
   * @param {string} tableName - 表名
   * @param {Array<Object>} jsonData - JSON 数据
   * @param {Object} mapping - 字段映射 { json字段名: 多维表中文字段名 }
   * @param {Array<{label: string, type: string}>} exportFields - 导出字段配置
   * @returns {Promise<MigrationResult>}
   */
  async createTableAndMigrate(tableName, jsonData, mapping, exportFields) {
    const result = {
      success: false,
      total: jsonData.length,
      inserted: 0,
      failed: 0,
      errors: [],
      tableName: null
    };

    try {
      // 1. 生成唯一表名
      const uniqueName = await this.generateUniqueTableName(tableName);
      result.tableName = uniqueName;

      // 2. 创建表
      const createResult = await this.createTable(uniqueName, exportFields);
      if (!createResult.success) {
        result.errors.push(`创建表失败: ${createResult.error}`);
        return result;
      }

      // 3. 写入数据
      const migrateResult = await this.migrate({
        json_data: jsonData,
        mapping,
        table_name: uniqueName
      });

      result.success = migrateResult.success;
      result.inserted = migrateResult.inserted;
      result.failed = migrateResult.failed;
      result.errors = migrateResult.errors;

      return result;
    } catch (error) {
      result.errors.push(`创建表并迁移数据失败: ${error.message}`);
      return result;
    }
  }
}

// 导出单例
export const dataMigration = new DataMigration();

// 导出类供需要时使用
export default DataMigration;
