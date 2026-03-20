<template>
  <div class="workflow-association">
    <div class="header">
      <h3>工作流关联管理</h3>
      <div class="actions">
        <el-button type="primary" size="small" @click="handleAdd"> 添加关联 </el-button>
        <el-button size="small" @click="handleBatchDisconnect"> 批量解除 </el-button>
      </div>
    </div>

    <div class="association-container">
      <div class="agent-list">
        <h4>当前智能体</h4>
        <el-input v-model="agentSearch" placeholder="搜索智能体" clearable size="small" />
        <el-tree
          ref="agentTree"
          :data="filteredAgents"
          node-key="id"
          show-checkbox
          :props="agentProps"
          @check-change="handleAgentCheck"
        />
      </div>

      <div class="workflow-list">
        <h4>可用工作流</h4>
        <el-input v-model="workflowSearch" placeholder="搜索工作流" clearable size="small" />
        <el-tree
          ref="workflowTree"
          :data="filteredWorkflows"
          node-key="id"
          show-checkbox
          :props="workflowProps"
          @check-change="handleWorkflowCheck"
        />
      </div>
    </div>

    <div class="association-visualization">
      <h4>关联关系图</h4>
      <div ref="visualization" class="visualization-canvas"></div>
    </div>

    <!-- 添加关联对话框 -->
    <el-dialog v-model="dialogVisible" title="添加工作流关联" width="50%">
      <el-form :model="newAssociation">
        <el-form-item label="关联类型">
          <el-select v-model="newAssociation.type" placeholder="请选择关联类型">
            <el-option
              v-for="type in associationTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number v-model="newAssociation.priority" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="条件表达式">
          <el-input
            v-model="newAssociation.condition"
            type="textarea"
            placeholder="输入条件表达式"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddAssociation"> 确认 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import type { ElTree } from 'element-plus'

interface Association {
  id?: string
  agentId: string
  workflowId: string
  type: string
  priority: number
  condition?: string
}

const props = defineProps({
  agentId: {
    type: String,
    required: true,
  },
  workflows: {
    type: Array as () => any[],
    default: () => [],
  },
  associations: {
    type: Array as () => Association[],
    default: () => [],
  },
})

const emit = defineEmits(['add', 'remove', 'update'])

const agentSearch = ref('')
const workflowSearch = ref('')
const dialogVisible = ref(false)
const agentTree = ref<InstanceType<typeof ElTree>>()
const workflowTree = ref<InstanceType<typeof ElTree>>()

const newAssociation = reactive<Omit<Association, 'id'>>({
  agentId: props.agentId,
  workflowId: '',
  type: 'sequential',
  priority: 1,
  condition: '',
})

const agentProps = {
  label: 'name',
  children: 'children',
}

const workflowProps = {
  label: 'name',
  children: 'children',
}

const associationTypes = [
  { value: 'sequential', label: '顺序执行' },
  { value: 'parallel', label: '并行执行' },
  { value: 'conditional', label: '条件执行' },
]

const filteredAgents = computed(() => {
  // 实际应用中这里应该过滤agents数据
  return []
})

const filteredWorkflows = computed(() => {
  return props.workflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(workflowSearch.value.toLowerCase()),
  )
})

const handleAdd = () => {
  dialogVisible.value = true
}

const handleAgentCheck = () => {
  // 处理智能体选择变化
}

const handleWorkflowCheck = () => {
  // 处理工作流选择变化
}

const handleBatchDisconnect = () => {
  // 处理批量解除关联
}

const confirmAddAssociation = () => {
  emit('add', { ...newAssociation })
  dialogVisible.value = false
  resetNewAssociation()
}

const resetNewAssociation = () => {
  Object.assign(newAssociation, {
    workflowId: '',
    type: 'sequential',
    priority: 1,
    condition: '',
  })
}

onMounted(() => {
  // 初始化可视化
})
</script>

<style scoped>
.workflow-association {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.association-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.agent-list,
.workflow-list {
  flex: 1;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  height: 400px;
  overflow: auto;
}

.association-visualization {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  height: 300px;
}

.visualization-canvas {
  width: 100%;
  height: 100%;
  background-color: #f9f9f9;
}
</style>
