<template>
  <div class="agent-info-panel">
    <div class="agent-header">
      <el-avatar :size="64" :src="agent?.icon || ''">
        <img v-if="agent?.icon" :src="agent.icon" alt="Agent Icon" />
        <span v-else>{{ agent?.name?.substring(0, 2).toUpperCase() || 'AI' }}</span>
      </el-avatar>
      <div class="agent-title">
        <h3>{{ agent?.name || '智能体' }}</h3>
        <div class="agent-status">
          <el-tag size="small" :type="getAgentStatusType(agent?.status)">
            {{ getAgentStatusLabel(agent?.status) }}
          </el-tag>
          <el-button
            v-if="agent?.status !== 'published'"
            type="primary"
            size="small"
            @click="editAgentBasicInfo"
            class="edit-button"
          >
            编辑信息
          </el-button>
        </div>
      </div>
    </div>

    <div class="agent-details">
      <p class="agent-description">{{ agent?.description || '暂无描述' }}</p>

      <!-- 模型信息 -->
      <div class="info-section">
        <div class="section-header">
          <h4>模型信息</h4>
          <el-button
            v-if="agent?.status !== 'published'"
            type="primary"
            size="small"
            @click="editModelInfo"
          >
            编辑模型
          </el-button>
        </div>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="提供商">
            {{ agent?.modelProvider || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="模型">{{ agent?.modelName || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 开场白 -->
      <div class="info-section">
        <div class="section-header">
          <h4>开场白</h4>
          <el-button
            v-if="agent?.status !== 'published'"
            type="primary"
            size="small"
            @click="editOpeningDialogue"
          >
            编辑开场白
          </el-button>
        </div>
        <div class="opening-dialogue">
          <p>{{ agent?.openingDialogue || '暂无开场白' }}</p>
        </div>
      </div>

      <!-- 工具列表 -->
      <div class="info-section">
        <div class="section-header">
          <h4>可用工具 ({{ agent?.tools?.length || 0 }})</h4>
          <div class="section-actions">
            <el-button
              v-if="agent?.status !== 'published'"
              type="primary"
              size="small"
              @click="addTool"
            >
              <el-icon><Plus /></el-icon>添加工具
            </el-button>
            <el-button
              v-if="agent?.status !== 'published'"
              type="success"
              size="small"
              @click="associateTool"
            >
              <el-icon><Plus /></el-icon>关联工具
            </el-button>
          </div>
        </div>
        <el-empty v-if="!agent?.tools?.length" description="暂无工具" />
        <el-collapse v-else>
          <el-collapse-item v-for="tool in agent?.tools" :key="tool.id" :name="tool.id">
            <template #title>
              <div class="tool-title">
                <el-icon><Tools /></el-icon>
                <span class="tool-name">{{ tool.name }}</span>
              </div>
            </template>
            <div class="tool-details">
              <p>{{ tool.description || '暂无描述' }}</p>
              <p class="tool-type">类型: {{ getToolTypeLabel(tool.type) }}</p>
              <div class="tool-actions" v-if="agent?.status !== 'published'">
                <el-button type="primary" size="small" @click.stop="editTool(tool)">编辑</el-button>
                <el-button type="danger" size="small" @click.stop="removeTool(tool)"
                  >移除</el-button
                >
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 工作流列表 -->
      <div class="info-section">
        <div class="section-header">
          <h4>工作流 ({{ agent?.workflows?.length || 0 }})</h4>
          <div class="section-actions">
            <el-button
              v-if="agent?.status !== 'published'"
              type="primary"
              size="small"
              @click="addWorkflow"
            >
              <el-icon><Plus /></el-icon>添加工作流
            </el-button>
            <el-button
              v-if="agent?.status !== 'published'"
              type="success"
              size="small"
              @click="associateWorkflow"
            >
              <el-icon><Plus /></el-icon>关联工作流
            </el-button>
          </div>
        </div>
        <el-empty v-if="!agent?.workflows?.length" description="暂无工作流" />
        <el-collapse v-else>
          <el-collapse-item
            v-for="workflow in agent?.workflows"
            :key="workflow.id"
            :name="workflow.id"
          >
            <template #title>
              <div class="workflow-title">
                <el-icon><Connection /></el-icon>
                <span class="workflow-name">{{ getWorkflowName(workflow) }}</span>
                <el-tag v-if="workflow.is_default" size="small" type="success">默认</el-tag>
              </div>
            </template>
            <div class="workflow-details">
              <p>优先级: {{ workflow.priority }}</p>
              <p>状态: {{ workflow.status === 'enabled' ? '已启用' : '已禁用' }}</p>
              <p v-if="workflow.trigger_condition">触发条件: {{ workflow.trigger_condition }}</p>
              <div class="workflow-actions" v-if="agent?.status !== 'published'">
                <el-button type="primary" size="small" @click.stop="editWorkflow(workflow)"
                  >编辑</el-button
                >
                <el-button type="danger" size="small" @click.stop="removeWorkflow(workflow)"
                  >移除</el-button
                >
                <el-button
                  v-if="!workflow.is_default"
                  type="success"
                  size="small"
                  @click.stop="setDefaultWorkflow(workflow)"
                >
                  设为默认
                </el-button>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 知识库列表 -->
      <div class="info-section">
        <div class="section-header">
          <h4>知识库 ({{ agent?.knowledge_bases?.length || 0 }})</h4>
          <div class="section-actions">
            <el-button
              v-if="agent?.status !== 'published'"
              type="primary"
              size="small"
              @click="addKnowledgeBase"
            >
              <el-icon><Plus /></el-icon>添加知识库
            </el-button>
            <el-button
              v-if="agent?.status !== 'published'"
              type="success"
              size="small"
              @click="associateKnowledgeBase"
            >
              关联知识库
            </el-button>
          </div>
        </div>
        <el-empty v-if="!agent?.knowledge_bases?.length" description="暂无知识库" />
        <el-collapse v-else>
          <el-collapse-item v-for="kb in agent?.knowledge_bases" :key="kb.id" :name="kb.id">
            <template #title>
              <div class="kb-title">
                <el-icon><Reading /></el-icon>
                <span class="kb-name">{{ kb.name }}</span>
              </div>
            </template>
            <div class="kb-details">
              <p>{{ kb.description || '暂无描述' }}</p>
              <p>文件数量: {{ kb.file_count }}</p>
              <p>存储类型: {{ kb.storage_type }}</p>
              <div class="kb-actions" v-if="agent?.status !== 'published'">
                <el-button type="danger" size="small" @click.stop="removeKnowledgeBase(kb)"
                  >移除</el-button
                >
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { Plus, Tools, Connection, Reading } from '@element-plus/icons-vue'

const props = defineProps({
  agent: Object,
})

const emit = defineEmits([
  'editAgentBasicInfo',
  'editModelInfo',
  'editOpeningDialogue',
  'addTool',
  'associateTool',
  'editTool',
  'removeTool',
  'addWorkflow',
  'associateWorkflow',
  'editWorkflow',
  'removeWorkflow',
  'setDefaultWorkflow',
  'addKnowledgeBase',
  'associateKnowledgeBase',
  'removeKnowledgeBase',
])

const getAgentStatusType = (status) => {
  switch (status) {
    case 'published':
      return 'success'
    case 'draft':
      return 'warning'
    case 'archived':
      return 'info'
    default:
      return 'info'
  }
}

const getAgentStatusLabel = (status) => {
  switch (status) {
    case 'published':
      return '已发布'
    case 'draft':
      return '草稿'
    case 'archived':
      return '已归档'
    default:
      return '未知状态'
  }
}

const getToolTypeLabel = (type) => {
  // 根据工具类型返回对应的标签
  switch (type) {
    case 'API':
      return 'API 接口'
    case '函数':
      return '函数调用'
    case '命令行':
      return '命令行工具'
    case '数据库':
      return '数据库操作'
    case '自定义':
      return '自定义工具'
    default:
      return type
  }
}

const getWorkflowName = (workflow) => {
  // 工作流名称逻辑
  if (!workflow) return '未命名工作流'
  
  // 如果有名称，直接返回
  if (workflow.name) return workflow.name
  
  // 如果没有名称但有ID，返回ID
  if (workflow.id) return `工作流 #${workflow.id}`
  
  // 默认返回
  return '未命名工作流'
}

// 添加智能体基本信息编辑方法
const editAgentBasicInfo = () => {
  emit('editAgentBasicInfo')
}

// 添加模型信息编辑方法
const editModelInfo = () => {
  emit('editModelInfo')
}

// 添加开场白编辑方法
const editOpeningDialogue = () => {
  emit('editOpeningDialogue')
}

// 添加工具相关方法
const addTool = () => {
  emit('addTool')
}

const associateTool = () => {
  emit('associateTool')
}

const editTool = (tool) => {
  emit('editTool', tool)
}

const removeTool = (tool) => {
  emit('removeTool', tool)
}

// 添加工作流相关方法
const addWorkflow = () => {
  emit('addWorkflow')
}

const associateWorkflow = () => {
  emit('associateWorkflow')
}

const editWorkflow = (workflow) => {
  emit('editWorkflow', workflow)
}

const removeWorkflow = (workflow) => {
  emit('removeWorkflow', workflow)
}

const setDefaultWorkflow = (workflow) => {
  emit('setDefaultWorkflow', workflow)
}

// 添加知识库相关方法
const addKnowledgeBase = () => {
  emit('addKnowledgeBase')
}

const associateKnowledgeBase = () => {
  emit('associateKnowledgeBase')
}

const removeKnowledgeBase = (kb) => {
  emit('removeKnowledgeBase', kb)
}
</script>

<style scoped>
.agent-info-panel {
  padding: 16px;
}

.agent-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.agent-title {
  margin-left: 16px;
}

.agent-status {
  display: flex;
  align-items: center;
  margin-top: 8px;
  gap: 8px;
}

.edit-button {
  height: 24px;
  padding: 4px 8px;
}

.agent-description {
  margin-bottom: 16px;
  color: #666;
  line-height: 1.5;
}

.info-section {
  margin-bottom: 24px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--el-fill-color-light);
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
}

.section-actions {
  display: flex;
  gap: 8px;
}

.tool-title,
.workflow-title,
.kb-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-name,
.workflow-name,
.kb-name {
  font-weight: 500;
}

.tool-details,
.workflow-details,
.kb-details {
  padding: 12px 16px;
}

.tool-type {
  color: #666;
  font-size: 14px;
  margin: 8px 0;
}

.tool-actions,
.workflow-actions,
.kb-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
</style>