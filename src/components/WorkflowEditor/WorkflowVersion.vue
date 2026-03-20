<template>
  <div class="workflow-version">
    <div class="version-header">
      <h3>版本历史</h3>
      <el-button @click="refreshVersions" type="primary" :icon="Refresh" circle />
    </div>

    <div class="version-list">
      <div
        v-for="version in versions"
        :key="version.id"
        class="version-item"
        :class="{ 'current-version': version.isCurrent }"
      >
        <div class="version-info">
          <span class="version-number">v{{ version.number }}</span>
          <span class="version-date">{{ formatDate(version.createdAt) }}</span>
          <span class="version-author">{{ version.author }}</span>
        </div>
        <div class="version-actions">
          <el-button @click="viewVersion(version.id)" size="small">
            查看
          </el-button>
          <el-button
            @click="restoreVersion(version.id)"
            size="small"
            type="success"
            :disabled="version.isCurrent"
          >
            恢复
          </el-button>
        </div>
      </div>

      <div v-if="versions.length === 0" class="empty-state">
        <el-empty description="暂无版本历史记录" />
      </div>
    </div>

    <VersionDiffModal
      v-if="showDiffModal"
      :current="currentWorkflow"
      :version="selectedVersion"
      @close="showDiffModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'
import { useRoute } from 'vue-router'
import VersionDiffModal from './VersionDiffModal.vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElEmpty } from 'element-plus'

const route = useRoute()
const workflowStore = useWorkflowStore()

const versions = ref([])
const currentWorkflow = ref(null)
const selectedVersion = ref(null)
const showDiffModal = ref(false)

// 格式化日期显示
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return (
    date.toLocaleDateString('zh-CN') +
    ' ' +
    date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  )
}

const loadVersions = async () => {
  // 暂时使用模拟数据，因为实际的版本管理功能需要后端支持
  const workflowId = route.params.id

  // 模拟版本数据
  versions.value = [
    {
      id: 1,
      number: '1.0',
      createdAt: new Date().toISOString(),
      author: '当前用户',
      isCurrent: true,
    },
    {
      id: 2,
      number: '0.9',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1天前
      author: '当前用户',
      isCurrent: false,
    },
    {
      id: 3,
      number: '0.8',
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2天前
      author: '当前用户',
      isCurrent: false,
    },
  ]

  // 获取当前工作流数据
  currentWorkflow.value = workflowStore.currentWorkflow
}

const refreshVersions = () => loadVersions()

const viewVersion = (versionId) => {
  selectedVersion.value = versions.value.find((v) => v.id === versionId)
  showDiffModal.value = true
}

const restoreVersion = async (versionId) => {
  // 模拟版本恢复功能
  console.log(`恢复到版本 ${versionId}`)
  // 实际实现需要调用后端API
}

onMounted(() => {
  loadVersions()
})
</script>

<style scoped>
.workflow-version {
  padding: 20px;
  height: 80vh;
  width: 60vw;
  display: flex;
  flex-direction: column;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-right: 40px; /* 为关闭按钮留出空间 */
}

.version-list {
  flex: 1;
  overflow-y: auto;
}

.version-item {
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 6px;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.version-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.current-version {
  background: #e6f7ff;
  border-left: 4px solid #1890ff;
}

.version-info {
  display: flex;
  gap: 24px;
  align-items: center;
}

.version-number {
  font-weight: bold;
  color: #1890ff;
  font-size: 16px;
}

.version-date {
  color: #666;
  font-size: 14px;
}

.version-author {
  color: #999;
  font-size: 14px;
}

.version-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
