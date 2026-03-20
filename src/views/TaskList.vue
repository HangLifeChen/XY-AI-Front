<template>
  <div class="task-list">
    <el-page-header @back="$router.push('/')" content="任务列表" />

    <div class="toolbar">
      <el-select
        v-model="filterStatus"
        placeholder="筛选状态"
        clearable
        style="width: 150px; margin-right: 15px"
      >
        <el-option
          v-for="status in statusOptions"
          :key="status.value"
          :label="status.label"
          :value="status.value"
        />
      </el-select>
      <el-date-picker
        v-model="filterDate"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 300px; margin-right: 15px"
      />
      <el-button type="primary" @click="refreshTasks">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <el-table :data="filteredTasks" border style="width: 100%; margin-top: 20px">
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="name" label="任务名称" width="180" />
      <el-table-column prop="workflow" label="所属工作流" width="180" />
      <el-table-column label="状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="180" />
      <el-table-column prop="endTime" label="结束时间" width="180" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button
            size="small"
            @click="showTaskDetail(scope.row)"
            :disabled="scope.row.status !== 'completed'"
          >
            查看结果
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="cancelTask(scope.row)"
            :disabled="scope.row.status !== 'running'"
          >
            取消
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="totalTasks"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px"
    />

    <!-- 任务详情对话框 -->
    <el-dialog v-model="detailVisible" title="任务详情" width="70%">
      <div v-if="currentTask">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务ID">{{ currentTask.id }}</el-descriptions-item>
          <el-descriptions-item label="任务名称">{{ currentTask.name }}</el-descriptions-item>
          <el-descriptions-item label="工作流">{{ currentTask.workflow }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentTask.status)">
              {{ currentTask.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ currentTask.startTime }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ currentTask.endTime }}</el-descriptions-item>
        </el-descriptions>

        <el-tabs v-model="detailTab" type="border-card" style="margin-top: 20px">
          <el-tab-pane label="执行日志" name="logs">
            <pre class="log-content">{{ currentTask.logs }}</pre>
          </el-tab-pane>
          <el-tab-pane label="输出结果" name="output">
            <pre class="output-content">{{ currentTask.output }}</pre>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'

interface Task {
  id: string
  name: string
  workflow: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  startTime: string
  endTime: string
  logs: string
  output: string
}

// 模拟数据
const tasks = ref<Task[]>([
  {
    id: '1',
    name: '数据分析任务',
    workflow: '数据分析流程',
    status: 'completed',
    startTime: '2023-07-01 10:00:00',
    endTime: '2023-07-01 10:05:23',
    logs: '任务开始...\n加载数据...\n分析数据...\n生成报告...\n任务完成',
    output: '{"result": "数据分析完成", "metrics": {"accuracy": 0.95}}',
  },
  {
    id: '2',
    name: '客户服务任务',
    workflow: '客户服务流程',
    status: 'running',
    startTime: '2023-07-02 14:30:00',
    endTime: '',
    logs: '任务开始...\n接收客户请求...\n处理请求中...',
    output: '',
  },
  {
    id: '3',
    name: '报告生成任务',
    workflow: '报告生成流程',
    status: 'failed',
    startTime: '2023-06-30 09:15:00',
    endTime: '2023-06-30 09:20:45',
    logs: '任务开始...\n加载模板失败...\n任务失败',
    output: '',
  },
])

const filterStatus = ref('')
const filterDate = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const detailTab = ref('logs')
const currentTask = ref<Task | null>(null)

const statusOptions = [
  { value: 'pending', label: '等待中' },
  { value: 'running', label: '运行中' },
  { value: 'completed', label: '已完成' },
  { value: 'failed', label: '失败' },
  { value: 'cancelled', label: '已取消' },
]

const totalTasks = computed(() => tasks.value.length)

const filteredTasks = computed(() => {
  let result = tasks.value
  if (filterStatus.value) {
    result = result.filter((task) => task.status === filterStatus.value)
  }
  if (filterDate.value && filterDate.value.length === 2) {
    const [start, end] = filterDate.value
    result = result.filter((task) => {
      const taskDate = new Date(task.startTime)
      return taskDate >= start && taskDate <= end
    })
  }
  return result
})

const getStatusType = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'running':
      return 'primary'
    case 'failed':
      return 'danger'
    case 'cancelled':
      return 'warning'
    default:
      return 'info'
  }
}

const refreshTasks = () => {
  // 实际项目中这里应该调用API刷新任务列表
  console.log('刷新任务列表')
}

const showTaskDetail = (task: Task) => {
  currentTask.value = task
  detailVisible.value = true
}

const cancelTask = (task: Task) => {
  // 实际项目中这里应该调用API取消任务
  const index = tasks.value.findIndex((t) => t.id === task.id)
  if (index !== -1) {
    tasks.value[index].status = 'cancelled'
    tasks.value[index].endTime = new Date().toISOString()
  }
}
</script>

<style scoped>
.task-list {
  padding: 20px;
}
.toolbar {
  margin: 20px 0;
  display: flex;
  align-items: center;
}
.log-content,
.output-content {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  max-height: 400px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
