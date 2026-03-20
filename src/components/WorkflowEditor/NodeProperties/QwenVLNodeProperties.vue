<template>
  <div class="qwen-vl-properties">
    <el-form label-position="top">
      <!-- 模型厂商选择 -->
      <el-form-item label="模型厂商" required>
        <el-select
          v-model="localData.providers.fieldValue"
          placeholder="请选择模型厂商"
          style="width: 100%"
          @change="onProviderChange"
          value-key="id"
        >
          <el-option
            v-for="provider in providerOptions"
            :key="provider.value"
            :label="provider.label"
            :value="provider.value"
          />
        </el-select>
        <div class="field-description">选择模型厂商</div>
      </el-form-item>

      <!-- 模型选择 -->
      <el-form-item label="模型">
        <el-select
          v-model="localData.model.fieldValue"
          placeholder="请选择模型"
          style="width: 100%"
          @change="updateNodeData"
        >
          <el-option
            v-for="model in modelOptions"
            :key="model.value"
            :label="model.label"
            :value="model.value"
          />
        </el-select>
        <div class="field-description">选择Qwen-VL模型版本</div>
      </el-form-item>

      <!-- 图片上传 -->
      <el-form-item label="上传图片">
        <el-upload
          v-if="localData.image.fieldType === FieldType.UPLOAD"
          class="image-uploader"
          drag
          action=""
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleImageUpload"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">将图片拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">支持jpg、jpeg、png格式，大小不超过5MB</div>
          </template>
        </el-upload>
        <el-input
          v-else
          v-model="localData.image.fieldValue"
          placeholder="请输入图片URL"
          style="width: 100%"
          @change="updateNodeData"
        />
        <div
          v-if="localData.image.fieldValue && localData.image.fieldType === 'upload'"
          class="uploaded-image-preview"
        >
          <el-image
            :src="localData.image.fieldValue"
            fit="cover"
            class="preview-image"
            :preview-src-list="[localData.image.fieldValue]"
          />
          <el-button type="danger" link @click="removeImage" class="remove-image-btn">
            删除图片
          </el-button>
        </div>
        <div class="field-description">上传本地图片文件或输入图片URL</div>
      </el-form-item>

      <!-- 图片链接 -->
      <el-form-item label="图片链接">
        <el-input
          v-model="localData.imageUrl.fieldValue"
          placeholder="请输入图片链接"
          @input="updateNodeData"
        />
        <div class="field-description">图片的URL链接（与上传图片二选一）</div>
      </el-form-item>

      <!-- 提示词类型 -->
      <el-form-item label="提示词类型">
        <el-select
          v-model="localData.promptType.fieldValue"
          placeholder="请选择提示词类型"
          style="width: 100%"
          @change="updateNodeData"
        >
          <el-option
            v-for="option in localData.promptType.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <div class="field-description">选择提示词类型</div>
      </el-form-item>

      <!-- 温度 -->
      <el-form-item label="温度">
        <el-slider
          v-model="localData.temperature.fieldValue"
          :min="0"
          :max="1"
          :step="0.1"
          show-input
          @change="updateNodeData"
        />
        <div class="field-description">控制生成文本的随机性，0表示最确定，1表示最随机</div>
      </el-form-item>

      <!-- 最大token数 -->
      <el-form-item label="最大token数">
        <el-input-number
          v-model="localData.maxTokens.fieldValue"
          :min="1"
          :max="30000"
          :step="100"
          style="width: 100%"
          @change="updateNodeData"
        />
        <div class="field-description">限制生成文本的最大长度</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { FieldType, type NodeProps, type QwenVLNodeData } from '@/types/node'
import { ModelService } from '@/api/modelService'
import type { ProviderConfig, LLM } from '@/types/model'
import { FileStorageService } from '@/api/cloudStorageService'
import type { StorageFileUploadRequest } from '@/types/cloudStorage'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  node: NodeProps<QwenVLNodeData>
}>()

const emit = defineEmits<{
  (e: 'update:node', node: NodeProps<QwenVLNodeData>): void
}>()

const providerOptions = ref<Array<{ label: string; value: any }>>([])
const modelOptions = ref<Array<{ label: string; value: string }>>([])

// 获取厂商配置列表
const fetchProviderConfigs = async () => {
  try {
    const response = await ModelService.listProviderConfigs()
    providerOptions.value = response.providerConfigs.map((config) => ({
      label: config.name,
      value: config,
    }))
  } catch (error) {
    console.error('获取厂商配置列表失败:', error)
  }
}

// 根据厂商获取模型列表
const fetchModels = async (providerConfigId: number) => {
  try {
    const response = await ModelService.listLLMs({ modelType: 'vision' })
    // 过滤出指定提供商的模型
    const filteredModels = response.llms.filter(
      (model) => model.providerConfigId === providerConfigId,
    )

    modelOptions.value = filteredModels.map((model: LLM) => ({
      label: model.name,
      value: model.modelName,
    }))

    // 如果还没有选择模型，且有模型列表，则默认选择第一个
    if (!localData.model.fieldValue && modelOptions.value.length > 0) {
      localData.model.fieldValue = modelOptions.value[0].value
      updateNodeData()
    }
  } catch (error) {
    console.error('获取模型列表失败:', error)
  }
}

// 创建本地响应式数据
const localData = reactive<QwenVLNodeData>({
  model: {
    fieldName: '模型',
    fieldValue: 'Qwen-VL-Plus', // 设置默认值
    fieldDesc: '选择Qwen-VL模型版本',
    fieldType: FieldType.SELECT,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  providers: {
    fieldName: '模型厂商',
    fieldValue: [],
    fieldDesc: '选择模型厂商',
    fieldType: FieldType.SELECT,
    list: true,
    options: [],
    show: true,
    required: true,
  },
  image: {
    fieldName: '图片',
    fieldValue: '',
    fieldDesc: '上传图片文件',
    fieldType: FieldType.UPLOAD,
    list: false,
    options: [],
    show: true,
    required: false,
  },
  imageUrl: {
    fieldName: '图片链接',
    fieldValue: '',
    fieldDesc: '图片的URL链接',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: false,
  },
  promptType: {
    fieldName: '提示词类型',
    fieldValue: 'image',
    fieldDesc: '提示词类型',
    fieldType: FieldType.SELECT,
    list: false,
    options: [
      { label: 'Image', value: 'image' },
      { label: 'Image URL', value: 'imageUrl' },
    ],
    show: true,
    required: false,
  },
  temperature: {
    fieldName: '温度',
    fieldValue: 0.7,
    fieldDesc: '控制生成文本的随机性',
    fieldType: FieldType.INPUT_NUMBER,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  maxTokens: {
    fieldName: '最大token数',
    fieldValue: 10000,
    fieldDesc: '限制生成文本的最大长度',
    fieldType: FieldType.INPUT_NUMBER,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  responseFormat: {
    fieldName: '响应格式',
    fieldValue: 'html',
    fieldDesc: '输出格式',
    fieldType: FieldType.SELECT,
    list: false,
    options: ['html'],
    show: true,
    required: true,
  },
})

// 初始化本地数据
onMounted(() => {
  if (props.node.data) {
    Object.assign(localData, props.node.data)
  }
  fetchProviderConfigs()

  // 如果已经有厂商配置，获取对应的模型列表
  if (localData.providers.fieldValue && localData.providers.fieldValue.id) {
    fetchModels(localData.providers.fieldValue.id)
  }
})

// 处理厂商变更
const onProviderChange = (provider: any) => {
  // 清空已选择的模型
  localData.model.fieldValue = ''
  modelOptions.value = []

  // 获取新厂商的模型列表
  if (provider && provider.id) {
    fetchModels(provider.id)
  }

  updateNodeData()
}

// 更新节点数据
const updateNodeData = () => {
  if (props.node.id) {
    props.node.data = { ...localData }
    const updatedNode = { ...props.node }
    emit('update:node', updatedNode)
  }
}

// 处理图片上传
const handleImageUpload = async (file: any) => {
  try {
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.raw.type)) {
      ElMessage.error('只支持 JPG、PNG 格式的图片')
      return false
    }

    // 检查文件大小 (5MB)
    if (file.raw.size > 5 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过 5MB')
      return false
    }

    // 上传到云存储
    const uploadRequest: StorageFileUploadRequest = {
      file: file.raw,
    }

    const response = await FileStorageService.uploadFile(uploadRequest)
    localData.image.fieldValue = response.url
    updateNodeData()
    ElMessage.success('图片上传成功')
  } catch (error: any) {
    ElMessage.error('图片上传失败: ' + (error.message || '未知错误'))
  }
  return false // 阻止自动上传
}

// 删除图片
const removeImage = () => {
  localData.image.fieldValue = ''
  updateNodeData()
}

// 监听节点数据变化
watch(
  () => props.node.data,
  (newData) => {
    if (newData) {
      Object.assign(localData, newData)

      // 如果厂商改变，更新模型列表
      // if (newData.providers.fieldValue && newData.providers.fieldValue.id) {
      //   fetchModels(newData.providers.fieldValue.id)
      // }
    }
  },
  { deep: true },
)
</script>

<style scoped>
.qwen-vl-properties {
  padding: 16px;
}

.field-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

.image-uploader {
  width: 100%;
}

.uploaded-image-preview {
  margin-top: 12px;
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
}

.remove-image-btn {
  margin-top: 8px;
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

:deep(.el-textarea__inner) {
  font-family: var(--el-font-family);
}

:deep(.el-input-number.is-controls-right .el-input-number__decrease),
:deep(.el-input-number.is-controls-right .el-input-number__increase) {
  background-color: var(--el-fill-color-light);
}

:deep(.el-slider) {
  margin-top: 8px;
}
</style>
