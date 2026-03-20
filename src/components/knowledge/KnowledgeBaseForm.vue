<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" style="padding: 20px">
    <el-form-item label="名称" prop="name">
      <el-input
        v-model="formData.name"
        placeholder="输入知识库名称"
        maxlength="100"
        show-word-limit
      />
    </el-form-item>

    <el-form-item label="描述" prop="description">
      <el-input
        v-model="formData.description"
        type="textarea"
        placeholder="输入知识库描述"
        :rows="4"
        maxlength="500"
        show-word-limit
      />
    </el-form-item>

    <el-form-item label="标签" prop="tags">
      <el-select
        v-model="formData.tags"
        multiple
        filterable
        allow-create
        default-first-option
        placeholder="请输入标签，按回车确认"
        style="width: 100%"
      >
        <el-option v-for="tag in uniqueTags" :key="tag" :label="tag" :value="tag" />
      </el-select>
      <div class="tag-hint">
        <el-text type="info" size="small">可创建新标签或选择现有标签，按回车确认</el-text>
      </div>
    </el-form-item>

    <!-- 嵌入模型配置 -->
    <el-divider content-position="left">向量模型配置</el-divider>

    <el-form-item label="模型提供商">
      <el-select
        v-model="formData.embeddingModelProvider"
        placeholder="请选择向量模型提供商"
        style="width: 100%"
        @change="handleEmbeddingProviderChange"
      >
        <el-option
          v-for="provider in embeddingModelProviders"
          :key="provider.id"
          :label="provider.name"
          :value="provider.provider"
        />
      </el-select>
      <div class="model-hint">
        <el-text type="info" size="small">选择用于处理知识库内容向量化的模型提供商</el-text>
      </div>
    </el-form-item>

    <el-form-item label="向量模型">
      <el-select
        v-model="formData.embeddingModelName"
        placeholder="请选择向量模型"
        style="width: 100%"
        :disabled="!formData.embeddingModelProvider || loadingEmbeddingModels"
        :loading="loadingEmbeddingModels"
      >
        <el-option
          v-for="model in embeddingModels"
          :key="model.id"
          :label="model.name"
          :value="model.modelName"
        />
      </el-select>
      <div class="model-hint">
        <el-text type="info" size="small">选择用于处理知识库内容向量化的模型</el-text>
      </div>
    </el-form-item>

    <!-- 对话模型配置 -->
    <el-divider content-position="left">对话模型配置</el-divider>

    <el-form-item label="对话模型提供商">
      <el-select
        v-model="formData.chatModelProvider"
        placeholder="请选择对话模型提供商"
        style="width: 100%"
        @change="handleChatProviderChange"
      >
        <el-option
          v-for="provider in chatModelProviders"
          :key="provider.id"
          :label="provider.name"
          :value="provider.provider"
        />
      </el-select>
      <div class="model-hint">
        <el-text type="info" size="small">选择用于知识库对话的模型提供商</el-text>
      </div>
    </el-form-item>

    <el-form-item label="对话模型">
      <el-select
        v-model="formData.chatModelName"
        placeholder="请选择对话模型"
        style="width: 100%"
        :disabled="!formData.chatModelProvider || loadingChatModels"
        :loading="loadingChatModels"
      >
        <el-option
          v-for="model in chatModels"
          :key="model.id"
          :label="model.name"
          :value="model.modelName"
        />
      </el-select>
      <div class="model-hint">
        <el-text type="info" size="small">选择用于知识库对话的模型</el-text>
      </div>
    </el-form-item>

    <div class="form-actions">
      <el-space>
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="isLoading"
          :disabled="isSubmitDisabled"
        >
          {{ knowledgeBase ? '更新' : '创建' }}
        </el-button>
      </el-space>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { KnowledgeBase, CreateKnowledgeBaseForm } from '@/types/knowledgeBase'
import { ModelService } from '@/api/modelService'
import type { LLM, ProviderConfig } from '@/types/model'

const props = defineProps<{
  knowledgeBase?: KnowledgeBase
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'submit', form: CreateKnowledgeBaseForm): void
}>()

const formRef = ref<FormInstance | null>(null)

// 表单数据
const formData = reactive<CreateKnowledgeBaseForm>({
  name: '',
  description: '',
  tags: [],
  embeddingModelProvider: '',
  embeddingModelName: '',
  chatModelProvider: '',
  chatModelName: '',
})

// 嵌入模型相关数据
const embeddingModelProviders = ref<ProviderConfig[]>([])
const allEmbeddingModels = ref<LLM[]>([])
const embeddingModels = ref<LLM[]>([])
const loadingEmbeddingModels = ref(false)

// 对话模型相关数据
const chatModelProviders = ref<ProviderConfig[]>([])
const allChatModels = ref<LLM[]>([])
const chatModels = ref<LLM[]>([])
const loadingChatModels = ref(false)

// 预定义标签（可以从API获取）
const predefinedTags = ref<string[]>([
  '技术文档',
  '用户手册',
  '产品说明',
  'FAQ',
  '教程',
  '规范',
  '参考资料',
])

// 去重后的标签列表
const uniqueTags = computed(() => {
  const allTags = [...predefinedTags.value, ...formData.tags]
  return [...new Set(allTags)]
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入知识库名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度应在 2 到 100 个字符之间', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入知识库描述', trigger: 'blur' },
    { min: 5, max: 500, message: '长度应在 5 到 500 个字符之间', trigger: 'blur' },
  ],
  tags: [{ type: 'array', message: '标签必须是数组格式', trigger: 'change' }],
}

// 是否禁用提交按钮
const isSubmitDisabled = computed(() => {
  return !formData.name || !formData.description || props.isLoading
})

const handleEmbeddingProvider = async (provider: string) => {
  embeddingModels.value = []
  allEmbeddingModels.value.forEach((model) => {
    if (model.providerConfig) {
      if (model.providerConfig?.provider == provider) {
        embeddingModels.value.push(model)
      }
    }
  })
}
// 处理对话模型提供商变更
const handleChatProvider = async (provider: string) => {
  chatModels.value = []
  allChatModels.value.forEach((model) => {
    if (model.providerConfig) {
      if (model.providerConfig?.provider == provider) {
        chatModels.value.push(model)
      }
    }
  })
}
// 处理嵌入模型提供商变更
const handleEmbeddingProviderChange = async (provider: string) => {
  formData.embeddingModelName = undefined
  embeddingModels.value = []
  allEmbeddingModels.value.forEach((model) => {
    if (model.providerConfig) {
      if (model.providerConfig?.provider == provider) {
        embeddingModels.value.push(model)
      }
    }
  })
}

// 处理对话模型提供商变更
const handleChatProviderChange = async (provider: string) => {
  formData.chatModelName = undefined
  chatModels.value = []
  allChatModels.value.forEach((model) => {
    if (model.providerConfig) {
      if (model.providerConfig?.provider == provider) {
        chatModels.value.push(model)
      }
    }
  })
}

// 初始化
onMounted(async () => {
  if (props.knowledgeBase) {
    formData.name = props.knowledgeBase.name
    formData.description = props.knowledgeBase.description
    formData.tags = [...props.knowledgeBase.tags]
    formData.embeddingModelProvider = props.knowledgeBase.embeddingModelProvider
    formData.embeddingModelName = props.knowledgeBase.embeddingModelName
    formData.chatModelProvider = props.knowledgeBase.chatModelProvider
    formData.chatModelName = props.knowledgeBase.chatModelName
  }
  try {
    const data = await ModelService.listProviderConfigs()
    embeddingModelProviders.value = data.providerConfigs
    chatModelProviders.value = data.providerConfigs
  } catch (error) {
    ElMessage.error('加载厂商配置列表失败: ' + (error || '未知错误'))
  } finally {
  }

  // 加载嵌入模型提供商
  try {
    loadingEmbeddingModels.value = true
    const data = await ModelService.listAllLLMs({ modelType: 'embedding' })
    allEmbeddingModels.value = data
  } catch (error) {
    console.error('获取向量模型提供商列表失败:', error)
  } finally {
    loadingEmbeddingModels.value = false
  }

  // 加载对话模型
  try {
    loadingChatModels.value = true
    const data = await ModelService.listAllLLMs({ modelType: 'chat' })
    allChatModels.value = data
  } catch (error) {
    console.error('获取对话模型列表失败:', error)
  } finally {
    loadingChatModels.value = false
  }
  // 初始化向量模型选项
  if (formData.embeddingModelProvider) {
    handleEmbeddingProvider(formData.embeddingModelProvider)
  }
  console.log('初始化向量模型选项', embeddingModels.value, formData.embeddingModelName)
  // 初始化对话模型选项
  if (formData.chatModelProvider) {
    handleChatProvider(formData.chatModelProvider)
  }
})

// 提交表单
const handleSubmit = () => {
  if (!formRef.value) return

  formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', {
        name: formData.name.trim(),
        description: formData.description.trim(),
        tags: [...formData.tags],
        embeddingModelProvider: formData.embeddingModelProvider,
        embeddingModelName: formData.embeddingModelName,
        chatModelProvider: formData.chatModelProvider,
        chatModelName: formData.chatModelName,
      })
    } else {
      console.error('表单验证失败')
    }
  })
}

// 取消
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.form-actions {
  padding: 16px;
  text-align: right;
  border-top: 1px solid var(--el-border-color-light);
  margin-top: 20px;
}

.tag-hint {
  margin-top: 5px;
}

.model-hint {
  margin-top: 5px;
}
</style>
