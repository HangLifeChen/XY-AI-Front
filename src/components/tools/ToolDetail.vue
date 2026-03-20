<template>
  <div class="tool-detail">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="工具名称">{{ tool.name }}</el-descriptions-item>
      <el-descriptions-item label="工具描述">{{ tool.description }}</el-descriptions-item>
      <el-descriptions-item label="工具类型">
        <el-tag :type="tool.toolType === 'mcp' ? 'primary' : 'success'">{{
          tool.toolType === 'mcp' ? 'MCP工具' : '系统工具'
        }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{
        formatDate(tool.createdAt!)
      }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{
        tool.updatedAt ? formatDate(tool.updatedAt) : '暂无'
      }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="tool.isEnable ? 'success' : 'danger'">
          {{ tool.isEnable ? '启用' : '禁用' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item v-if="tool.version" label="版本">{{
        tool.version
      }}</el-descriptions-item>
    </el-descriptions>

    <el-card v-if="tool.parametersSchema" class="params-card">
      <template #header>
        <div class="card-header">
          <span>参数信息</span>
        </div>
      </template>
      <div v-if="parametersList && parametersList.length > 0">
        <el-table :data="parametersList" style="width: 100%" border>
          <el-table-column prop="name" label="参数名" width="180" />
          <el-table-column prop="type" label="类型" width="120" />
          <el-table-column prop="required" label="是否必填" width="100">
            <template #default="{ row }">
              <el-tag :type="row.required ? 'danger' : 'info'">
                {{ row.required ? '必填' : '可选' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" />
        </el-table>
      </div>
      <div v-else>
        <el-empty description="暂无参数信息" />
      </div>
    </el-card>

    <div class="detail-actions">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Tool, ParametersSchema } from '@/types/tool'
import {
  ElButton,
  ElDescriptions,
  ElDescriptionsItem,
  ElTag,
  ElCard,
  ElTable,
  ElTableColumn,
  ElEmpty,
} from 'element-plus'

const props = defineProps<{
  tool: Tool
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const handleClose = () => {
  emit('close')
}

const parametersList = computed(() => {
  // 检查parametersSchema是否存在且为Record类型
  if (!props.tool.parametersSchema) return []
  
  // 将Record转换为数组进行展示
  const paramsArray: {
    name: string
    type: string
    required: boolean
    description: string
  }[] = []

  Object.entries(props.tool.parametersSchema).forEach(([paramName, paramSchema]) => {
    paramsArray.push({
      name: paramName,
      type: paramSchema.Type || 'unknown',
      required: paramSchema.Required || false,
      description: paramSchema.Desc || '',
    })
  })
  
  return paramsArray
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}
</script>

<style scoped>
.tool-detail {
  padding: 20px;
}

.params-card {
  margin-top: 20px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.detail-actions {
  margin-top: 20px;
  text-align: right;
}
</style>
