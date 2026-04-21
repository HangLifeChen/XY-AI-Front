<template>
  <div class="session-manager">
    <div class="session-controls">
      <el-button type="primary" :icon="Plus" @click="createNewSession"> 新建会话 </el-button>
    </div>

    <div class="session-list">
      <el-empty v-if="!sessions || sessions.length === 0" description="暂无会话历史" />

      <el-timeline v-else>
        <el-timeline-item
          v-for="session in sessions"
          :key="session.id"
          :timestamp="formatTime(session.timestamp)"
          :type="session.id === currentSession?.id ? 'primary' : 'info'"
          :hollow="session.id !== currentSession?.id"
          placement="top"
        >
          <el-card
            :class="{ 'current-session': session.id === currentSession?.id }"
            shadow="hover"
            @click="switchSession(session)"
          >
            <template #header>
              <div class="session-header">
                <div class="session-title">
                  <span class="session-name">{{ session.title || '未命名会话' }}</span>
                  <el-tag
                    v-if="session.id === currentSession?.id"
                    type="success"
                    size="small"
                    effect="dark"
                  >
                    当前
                  </el-tag>
                </div>
                <div class="session-actions">
                  <el-dropdown @command="handleSessionAction">
                    <el-button type="default" size="small">
                      <el-icon><More /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item :command="{ action: 'rename', session }">
                          重命名
                        </el-dropdown-item>
                        <el-dropdown-item
                          :command="{ action: 'delete', session }"
                          divided
                          style="color: #f56c6c"
                        >
                          删除会话
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </template>
            <div class="session-content">
              <p class="session-description">{{ getSessionPreview(session) }}</p>
              <div class="session-meta">
                <div class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ formatTime(session.createdAt) }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>

    <!-- 重命名对话框 -->
    <el-dialog
      v-model="renameDialogVisible"
      title="重命名会话"
      width="400px"
      :before-close="handleRenameClose"
    >
      <el-input v-model="sessionName" placeholder="请输入会话名称" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="renameDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmRename">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Refresh, More, ChatLineRound, Calendar } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { AgentService } from '@/api/agentService'

const props = defineProps({
  agentId: {
    type: String,
    required: true,
  },
  sessions: {
    type: Array,
    default: () => [],
  },
  currentSession: {
    type: Object,
    default: () => null,
  },
})

const emit = defineEmits(['switchSession', 'refreshSessions', 'createNewSession'])

// 会话数据
const renameDialogVisible = ref(false)
const sessionName = ref('')
const sessionToRename = ref(null)

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''

  try {
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
  } catch (error) {
    console.error('时间格式化错误:', error)
    return timestamp.toString()
  }
}

// 获取会话预览
const getSessionPreview = (session) => {
  if (!session.messages || session.messages.length === 0) {
    return '暂无消息'
  }

  // 获取最后一条消息的内容作为预览
  const lastMessage = session.messages[session.messages.length - 1]
  if (lastMessage.content) {
    if (lastMessage.role === 'user') {
      return lastMessage.content > 50
        ? lastMessage.content.substring(0, 50) + '...'
        : lastMessage.content
    }
    const content = lastMessage.content
    const obj = JSON.parse(content)
    if (obj.content) {
      return obj.content.length > 50 ? obj.content.substring(0, 50) + '...' : obj.content
    }
    if (obj.reasoningContent) {
      return obj.reasoningContent.length > 50
        ? obj.reasoningContent.substring(0, 50) + '...'
        : obj.reasoningContent
    }
    return '暂无内容'
  }
  return '暂无内容'
}

// 创建新会话
const createNewSession = () => {
  emit('createNewSession')
}

// 切换会话
const switchSession = (session) => {
  if (session.id !== props.currentSession?.id) {
    emit('switchSession', session)
  }
}

// 刷新会话列表
const refreshSessions = () => {
  emit('refreshSessions')
}

// 处理会话操作
const handleSessionAction = (command) => {
  const { action, session } = command

  switch (action) {
    case 'rename':
      sessionToRename.value = session
      sessionName.value = session.name || ''
      renameDialogVisible.value = true
      break
    case 'delete':
      deleteSession(session)
      break
  }
}

// 删除会话
const deleteSession = async (session) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除会话 "${session.name || '未命名会话'}" 吗？此操作不可撤销。`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
      },
    )

    // 删除会话
    await AgentService.deleteSession(session.id)

    // 刷新会话列表
    refreshSessions()

    ElMessage.success('会话删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`删除失败: ${error.message || '未知错误'}`)
    }
  }
}

// 处理重命名关闭
const handleRenameClose = (done) => {
  ElMessageBox.confirm('确定要关闭吗？未保存的更改将会丢失')
    .then(() => {
      done()
    })
    .catch(() => {
      // 用户取消关闭
    })
}

// 确认重命名
const confirmRename = async () => {
  if (!sessionToRename.value) return

  try {
    // 更新会话名称
    await AgentService.updateSession(sessionToRename.value.id, {
      name: sessionName.value,
    })

    // 刷新会话列表
    refreshSessions()

    ElMessage.success('会话重命名成功')

    renameDialogVisible.value = false
    sessionToRename.value = null
    sessionName.value = ''
  } catch (error) {
    ElMessage.error(`重命名失败: ${error.message || '未知错误'}`)
  }
}

// 组件挂载时加载会话列表
onMounted(() => {
  refreshSessions()
})
</script>

<style scoped>
.session-manager {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.session-controls {
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.session-name {
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
}

.session-content {
  padding: 8px 0;
  cursor: pointer;
}

.session-description {
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
  cursor: pointer;
}

.session-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 12px;
  color: #999;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.current-session {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary);
}

.session-actions :deep(.el-button) {
  padding: 4px 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .session-controls {
    flex-direction: column;
  }

  .session-meta {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
