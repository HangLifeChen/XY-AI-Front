<template>
  <div class="trigger-properties">
    <el-form label-position="top">
      <el-form-item label="触发类型">
        <el-select 
          v-model="localData.type.fieldValue" 
          @change="updateNodeData"
          placeholder="请选择触发类型"
          style="width: 100%"
        >
          <el-option
            v-for="option in localData.type.options"
            :key="option"
            :label="getTriggerTypeLabel(option)"
            :value="option"
          />
        </el-select>
        <div class="field-description">触发器类型</div>
      </el-form-item>
      
      <el-form-item label="调度表达式">
        <el-input
          v-model="localData.schedule.fieldValue"
          placeholder="请输入调度表达式"
          @input="updateNodeData"
        />
        <div class="field-description">
          <span v-if="localData.type.fieldValue === 'cron'">Cron表达式，例如: 0 0 * * * 表示每天凌晨执行</span>
          <span v-else>间隔时间(秒)</span>
        </div>
      </el-form-item>
      
      <el-form-item label="是否启用">
        <el-switch
          v-model="localData.enabled.fieldValue"
          @change="updateNodeData"
        />
        <div class="field-description">触发器是否启用</div>
      </el-form-item>
      
      <div class="trigger-preview">
        <el-alert
          :title="getTriggerDescription(localData.type.fieldValue, localData.schedule.fieldValue)"
          type="info"
          :closable="false"
        />
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue'
import type { NodeProps } from '@/types/node'
import type { TriggerNodeData } from '@/types/node'
import { FieldType } from '@/types/node'

const props = defineProps<{
  node: NodeProps<TriggerNodeData>
}>()

const emit = defineEmits<{
  (e: 'update:node', node: NodeProps<TriggerNodeData>): void
}>()

// 创建本地响应式数据
const localData = reactive<TriggerNodeData>({
  type: {
    fieldName: '触发类型',
    fieldValue: 'cron',
    fieldDesc: '触发器类型',
    fieldType: FieldType.SELECT,
    list: false,
    options: ['cron', 'interval'],
    show: true,
    required: true,
  },
  schedule: {
    fieldName: '调度表达式',
    fieldValue: '0 0 * * *',
    fieldDesc: 'Cron表达式或间隔时间',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  enabled: {
    fieldName: '是否启用',
    fieldValue: true,
    fieldDesc: '触发器是否启用',
    fieldType: FieldType.SWITCH,
    list: false,
    options: [],
    show: true,
    required: true,
  }
})

// 初始化本地数据
onMounted(() => {
  if (props.node.data) {
    Object.assign(localData, props.node.data)
  }
})

// 更新节点数据
const updateNodeData = () => {
  if (props.node.id) {
    props.node.data = { ...localData }
    const updatedNode = { ...props.node }
    emit('update:node', updatedNode)
  }
}

// 获取触发类型标签
const getTriggerTypeLabel = (type: string) => {
  switch (type) {
    case 'cron':
      return 'Cron调度'
    case 'interval':
      return '间隔调度'
    default:
      return type
  }
}

// 获取触发器描述
const getTriggerDescription = (type?: string, schedule?: string) => {
  if (!type || !schedule) {
    return '请配置触发类型和调度表达式'
  }
  
  if (type === 'cron') {
    return `Cron调度: ${schedule} - 按照Cron表达式定时触发`
  } else {
    return `间隔调度: 每隔${schedule}秒触发一次`
  }
}

// 监听节点数据变化
watch(
  () => props.node.data,
  (newData) => {
    if (newData) {
      Object.assign(localData, newData)
    }
  },
  { deep: true },
)
</script>

<style scoped>
.trigger-properties {
  padding: 16px;
}

.field-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

.trigger-preview {
  margin-top: 16px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input-number .el-input__wrapper) {
  padding-left: 11px;
  padding-right: 11px;
}

:deep(.el-select .el-input__wrapper) {
  padding-left: 11px;
  padding-right: 11px;
}

:deep(.el-form-item__label) {
  padding-bottom: 4px;
  font-weight: 500;
}
</style>