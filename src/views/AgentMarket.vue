<template>
  <div class="agent-market">
    <el-card class="market-card">
      <template #header>
        <div class="card-header">
          <span>Agent市场</span>
          <div>
            <el-button type="primary" @click="handleAddAgent">
              <el-icon><Plus /></el-icon>
              添加远程Agent
            </el-button>
          </div>
        </div>
      </template>

      <!-- Agent卡片列表 -->
      <div v-loading="loading" class="agents-grid">
        <el-card v-for="agent in agents" :key="agent.url" class="agent-card-item">
          <div class="agent-card-content">
            <div class="agent-header">
              <h3 class="agent-name">{{ agent.name }}</h3>
            </div>

            <div class="agent-description">
              {{ agent.description || '暂无描述' }}
            </div>

            <div class="agent-actions">
              <el-button size="small" @click="handleViewDetails(agent)"> 查看详情 </el-button>
              <el-button size="small" type="danger" @click="handleDeleteAgent(agent)">
                删除
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 空状态 -->
        <div v-if="agents.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无远程Agent" />
          <el-button type="primary" @click="handleAddAgent">
            <el-icon><Plus /></el-icon>
            添加第一个远程Agent
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 添加Agent对话框 -->
    <el-dialog v-model="showAddDialog" title="添加远程Agent" width="600px">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="120px">
        <el-form-item label="Agent URL" prop="url">
          <el-input v-model="addForm.agentUrl" placeholder="例如: https://api.example.com" />
          <div class="form-tip">
            请输入远程Agent的域名，系统会自动请求 https://域名/.well-known/agent.json
          </div>
        </el-form-item>
        <el-form-item label="Handler Path" prop="handlerPath">
          <el-input v-model="addForm.handlerPath" placeholder="例如: /a2a" />
          <div class="form-tip">请输入处理请求的路径前缀，默认为 /a2a</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="saveAgent" :loading="saving">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Agent详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="Agent详情" width="800px">
      <div v-if="selectedAgent" class="agent-detail">
        <el-alert title="Agent Card JSON" type="info" :closable="false" />
        <pre class="json-display">{{ JSON.stringify(selectedAgent, null, 2) }}</pre>
        <div style="margin-top: 20px; text-align: right">
          <el-button @click="showDetailDialog = false">关闭</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { a2aService } from '@/api/a2aService'
import type { AgentCard, AgentMarket } from '@/types/a2a'

// 状态
const loading = ref(false)
const saving = ref(false)
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const agents = ref<AgentMarket[]>([])
const selectedAgent = ref<AgentCard | null>(null)
const fetchedAgentCard = ref<AgentCard | null>(null)

// 表单引用
const addFormRef = ref<InstanceType<typeof ElForm>>()

// 添加表单数据
const addForm = ref({
  agentUrl: 'http://localhost:8777',
  handlerPath: '/a2a',
})

// 表单验证规则
const addRules = {
  agentUrl: [{ required: true, message: '请输入Agent URL', trigger: 'blur' }],
  handlerPath: [{ required: false, message: '请输入Handler Path', trigger: 'blur' }],
}

// 生命周期
onMounted(() => {
  loadAgents()
})

// 方法
async function loadAgents() {
  loading.value = true
  try {
    a2aService.listAgentMarkets().then((response) => {
      agents.value = response || []
    })
  } catch (error) {
    ElMessage.error('加载Agent列表失败')
  } finally {
    loading.value = false
  }
}

function handleAddAgent() {
  showAddDialog.value = true
  // 重置表单
  addForm.value = {
    agentUrl: 'http://localhost:8777',
    handlerPath: '/a2a',
  }
  fetchedAgentCard.value = null
}

function handleViewDetails(agent: any) {
  // 调用getAgentCard接口获取详细信息
  a2aService
    .getAgentCard(agent.url)
    .then((agentCard) => {
      selectedAgent.value = agentCard
      showDetailDialog.value = true
    })
    .catch((error) => {
      ElMessage.error('获取Agent详情失败: ' + (error instanceof Error ? error.message : '未知错误'))
    })
}

async function handleDeleteAgent(agent: any) {
  try {
    await ElMessageBox.confirm(`确定要删除Agent "${agent.name}" 吗？`, '确认删除', {
      type: 'warning',
    })
    await a2aService.deleteAgentMarket(agent.id)
    // 这里应该调用实际的API来删除Agent
    ElMessage.success('删除成功')
    loadAgents()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

function saveAgent() {
  addFormRef.value?.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        await a2aService.saveAgentCard(addForm.value.agentUrl, addForm.value.handlerPath)
        // 这里应该调用实际的API来保存Agent
        ElMessage.success('添加成功')
        showAddDialog.value = false
        loadAgents()
      } catch (error) {
        ElMessage.error('添加失败: ' + (error instanceof Error ? error.message : '未知错误'))
      } finally {
        saving.value = false
      }
    }
  })
}
</script>

<style scoped>
.agent-market {
  padding: 20px;
  height: 100%;
  overflow: auto;
}

.market-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.agent-card-item {
  transition: all 0.3s ease;
}

.agent-card-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.agent-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.agent-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.agent-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  flex: 1;
  margin-right: 10px;
}

.agent-description {
  flex: 1;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.agent-provider {
  font-size: 12px;
  color: #909399;
  margin-bottom: 16px;
}

.agent-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: auto;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 0;
}

.agent-detail h4 {
  margin: 0 0 12px 0;
  font-weight: 600;
}

.agent-detail h5 {
  margin: 0 0 8px 0;
  font-weight: 500;
  font-size: 14px;
}

.json-display {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  max-height: 500px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 15px 0;
}

.capabilities,
.auth-schemes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.mode-section {
  margin-bottom: 20px;
}

.modes {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.capability-tag,
.scheme-tag,
.mode-tag,
.tag-item {
  margin-bottom: 4px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
