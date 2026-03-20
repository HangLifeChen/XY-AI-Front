<template>
  <div class="model-management-container">
    <el-card class="model-management-card">
      <template #header>
        <div class="card-header">
          <span>模型管理</span>
          <div>
            <el-button type="primary" @click="openVendorDialog()">
              <el-icon><Plus /></el-icon>
              添加厂商配置
            </el-button>
            <el-button type="success" @click="openModelDialog()" style="margin-left: 10px">
              <el-icon><Plus /></el-icon>
              添加模型
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="厂商配置" name="vendor">
          <el-table :data="vendorConfigs" style="width: 100%" v-loading="loading">
            <el-table-column prop="name" label="名字" width="150">
              <template #default="scope">
                <el-tag :type="getProviderTagType(scope.row.name)">
                  {{ getProviderName(scope.row.name) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="provider" label="标识" width="150">
              <template #default="scope">
                <el-tag :type="getProviderTagType(scope.row.provider)">
                  {{ getProviderName(scope.row.provider) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="apiBase" label="API地址" show-overflow-tooltip />
            <el-table-column prop="apiKey" label="API密钥" width="150">
              <template #default="scope">
                <span v-if="scope.row.apiKey">
                  {{ maskApiKey(scope.row.apiKey) }}
                </span>
                <span v-else class="empty-text">未设置</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)">
                  {{ getStatusName(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button size="small" @click="openVendorDialog(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteVendorConfig(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-if="vendorPagination.total > 0"
            layout="total, prev, pager, next"
            :total="vendorPagination.total"
            :page-size="vendorPagination.pageSize"
            v-model:current-page="vendorPagination.currentPage"
            @current-change="handleVendorPageChange"
            style="margin-top: 20px; justify-content: center"
          />
        </el-tab-pane>

        <el-tab-pane label="对话模型" name="custom">
          <el-table :data="customModels" style="width: 100%" v-loading="loading">
            <el-table-column prop="providerConfig.name" label="厂商名字" width="150">
              <template #default="scope">
                <el-tag :type="getProviderTagType(scope.row.providerConfinameg?.provider)">
                  {{ getProviderName(scope.row.providerConfig?.name) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="providerConfig.provider" label="厂商标识" width="150">
              <template #default="scope">
                <el-tag :type="getProviderTagType(scope.row.providerConfig?.provider)">
                  {{ getProviderName(scope.row.providerConfig?.provider) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="providerConfig.apiBase" label="API地址" show-overflow-tooltip />
            <el-table-column prop="name" label="模型名称" width="200" />
            <el-table-column prop="modelName" label="模型标识" width="200" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)">
                  {{ getStatusName(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button size="small" @click="openModelDialog(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteModel(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-if="modelPagination.total > 0"
            layout="total, prev, pager, next"
            :total="modelPagination.total"
            :page-size="modelPagination.pageSize"
            v-model:current-page="modelPagination.currentPage"
            @current-change="handleModelPageChange"
            style="margin-top: 20px; justify-content: center"
          />
        </el-tab-pane>

        <el-tab-pane label="向量模型" name="embedding">
          <el-table :data="embeddingModels" style="width: 100%" v-loading="loading">
            <el-table-column prop="providerConfig.name" label="厂商名字" width="150">
              <template #default="scope">
                <el-tag :type="getProviderTagType(scope.row.providerConfig?.name)">
                  {{ getProviderName(scope.row.providerConfig?.name) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="providerConfig.provider" label="厂商标识" width="150">
              <template #default="scope">
                <el-tag :type="getProviderTagType(scope.row.providerConfig?.provider)">
                  {{ getProviderName(scope.row.providerConfig?.provider) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="providerConfig.apiBase" label="API地址" show-overflow-tooltip />
            <el-table-column prop="name" label="模型名称" width="200" />
            <el-table-column prop="modelName" label="模型标识" width="200" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)">
                  {{ getStatusName(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button size="small" @click="openModelDialog(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteModel(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-if="embeddingPagination.total > 0"
            layout="total, prev, pager, next"
            :total="embeddingPagination.total"
            :page-size="embeddingPagination.pageSize"
            v-model:current-page="embeddingPagination.currentPage"
            @current-change="handleEmbeddingPageChange"
            style="margin-top: 20px; justify-content: center"
          />
        </el-tab-pane>

        <el-tab-pane label="视觉模型" name="vision">
          <el-table :data="visionModels" style="width: 100%" v-loading="loading">
            <el-table-column prop="providerConfig.name" label="厂商名字" width="150">
              <template #default="scope">
                <el-tag :type="getProviderTagType(scope.row.providerConfig?.name)">
                  {{ getProviderName(scope.row.providerConfig?.name) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="providerConfig.provider" label="厂商标识" width="150">
              <template #default="scope">
                <el-tag :type="getProviderTagType(scope.row.providerConfig?.provider)">
                  {{ getProviderName(scope.row.providerConfig?.provider) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="providerConfig.apiBase" label="API地址" show-overflow-tooltip />
            <el-table-column prop="name" label="模型名称" width="200" />
            <el-table-column prop="modelName" label="模型标识" width="200" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)">
                  {{ getStatusName(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button size="small" @click="openModelDialog(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteModel(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-if="visionPagination.total > 0"
            layout="total, prev, pager, next"
            :total="visionPagination.total"
            :page-size="visionPagination.pageSize"
            v-model:current-page="visionPagination.currentPage"
            @current-change="handleVisionPageChange"
            style="margin-top: 20px; justify-content: center"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 厂商配置对话框 -->
    <el-dialog
      v-model="vendorDialogVisible"
      :title="editingVendor.id ? '编辑厂商配置' : '添加厂商配置'"
      width="500px"
      @close="resetVendorForm"
    >
      <el-form ref="vendorFormRef" :model="vendorForm" :rules="vendorFormRules" label-width="100px">
        <el-form-item label="提供商名称" prop="name">
          <el-input v-model="vendorForm.name" placeholder="请输入提供商名称" />
        </el-form-item>
        <el-form-item label="提供商标识" prop="provider">
          <el-input v-model="vendorForm.provider" placeholder="请输入提供商标识" />
        </el-form-item>

        <el-form-item label="API地址" prop="apiBase">
          <el-input v-model="vendorForm.apiBase" placeholder="请输入API地址" />
        </el-form-item>

        <el-form-item label="API密钥" prop="apiKey">
          <el-input
            v-model="vendorForm.apiKey"
            type="password"
            show-password
            placeholder="请输入API密钥"
          />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="vendorForm.description"
            type="textarea"
            :rows="2"
            placeholder="请输入描述信息"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="vendorForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="vendorDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveVendorConfig" :loading="saving">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 模型编辑对话框 -->
    <el-dialog
      v-model="modelDialogVisible"
      :title="editingModel.id ? '编辑模型' : '添加模型'"
      width="500px"
      @close="resetModelForm"
    >
      <el-form ref="modelFormRef" :model="modelForm" :rules="modelFormRules" label-width="100px">
        <el-form-item label="模型类型" prop="modelType">
          <el-select
            v-model="modelForm.modelType"
            placeholder="请选择模型类型"
            style="width: 100%"
            @change="handleModelTypeChange"
          >
            <el-option label="对话模型" value="chat" />
            <el-option label="向量模型" value="embedding" />
            <el-option label="视觉模型" value="vision" />
          </el-select>
        </el-form-item>

        <el-form-item label="厂商配置" prop="providerConfigId">
          <el-select
            v-model="modelForm.providerConfigId"
            placeholder="请选择厂商配置"
            style="width: 100%"
          >
            <el-option
              v-for="config in vendorConfigs"
              :key="config.id"
              :label="`${getProviderName(config.provider)} - ${config.apiBase}`"
              :value="config.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="模型名称" prop="name">
          <el-input v-model="modelForm.name" placeholder="请输入模型名称" />
        </el-form-item>

        <el-form-item label="模型标识" prop="modelName">
          <el-input
            v-model="modelForm.modelName"
            placeholder="请输入模型标识（API调用时的模型名称）"
          />
        </el-form-item>

        <el-form-item label="默认参数">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-input-number
                v-model="modelForm.config.temperature"
                :min="0"
                :max="1"
                :step="0.1"
                placeholder="温度"
                style="width: 100%"
              />
              <div class="param-label">温度</div>
            </el-col>
            <el-col :span="12">
              <el-input-number
                v-model="modelForm.config.maxTokens"
                :min="1"
                :max="10000000"
                :step="100"
                placeholder="最大Token数"
                style="width: 100%"
              />
              <div class="param-label">最大Token数</div>
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="modelForm.description"
            type="textarea"
            :rows="2"
            placeholder="请输入描述信息"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="modelForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="modelDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveModel" :loading="saving">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { ModelService } from '@/api/modelService'

const loading = ref(false)
const saving = ref(false)
const activeTab = ref('vendor')
const vendorDialogVisible = ref(false)
const modelDialogVisible = ref(false)
const vendorFormRef = ref()
const modelFormRef = ref()

const vendorConfigs = ref([])
const customModels = ref([])
const embeddingModels = ref([])
const visionModels = ref([])
const editingVendor = ref({})
const editingModel = ref({})

const vendorPagination = reactive({
  total: 0,
  currentPage: 1,
  pageSize: 10,
})

const modelPagination = reactive({
  total: 0,
  currentPage: 1,
  pageSize: 10,
})

const embeddingPagination = reactive({
  total: 0,
  currentPage: 1,
  pageSize: 10,
})

const visionPagination = reactive({
  total: 0,
  currentPage: 1,
  pageSize: 10,
})

const vendorForm = reactive({
  provider: '',
  apiBase: '',
  apiKey: '',
  description: '',
  status: 'active',
})

const modelForm = reactive({
  modelType: 'chat',
  name: '',
  description: '',
  providerConfigId: null,
  modelName: '',
  config: {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0,
  },
  status: 'active',
})

const vendorFormRules = {
  name: [{ required: true, message: '请输入提供商名称', trigger: 'blur' }],
  provider: [{ required: true, message: '请输入提供商标识', trigger: 'blur' }],
  apiBase: [
    { required: true, message: '请输入API地址', trigger: 'blur' },
    { type: 'url', message: '请输入正确的URL格式', trigger: ['blur', 'change'] },
  ],
  apiKey: [
    {
      required: true,
      message: '请输入API密钥',
      trigger: 'blur',
    },
  ],
}

const modelFormRules = {
  name: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  providerConfigId: [{ required: true, message: '请选择厂商配置', trigger: 'change' }],
  modelName: [{ required: true, message: '请输入模型标识', trigger: 'blur' }],
  modelType: [{ required: true, message: '请选择模型类型', trigger: 'change' }],
}

// 获取提供商显示名称
const getProviderName = (provider) => {
  // 直接返回提供商名称，因为现在是自由添加的
  return provider || '未知提供商'
}

// 获取提供商标签类型
const getProviderTagType = (provider) => {
  const typeMap = {
    openai: 'success',
    azure_openai: 'primary',
    anthropic: 'warning',
    google: 'danger',
    local: 'info',
    ollama: 'info',
    bailian: 'primary',
    baichuan: 'warning',
    zhipu: 'success',
    tencent: 'primary',
    deepseek: 'info',
  }
  return typeMap[provider] || 'info'
}

// 获取状态显示名称
const getStatusName = (status) => {
  const statusMap = {
    active: '启用',
    inactive: '禁用',
  }
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    active: 'success',
    inactive: 'warning',
  }
  return typeMap[status] || 'info'
}

// 遮蔽API密钥显示
const maskApiKey = (key) => {
  if (!key) return ''
  if (key.length <= 8) return '*'.repeat(key.length)
  return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4)
}

// 处理标签页切换
const handleTabChange = (tabName) => {
  if (tabName === 'vendor') {
    loadVendorConfigs()
  } else if (tabName === 'custom') {
    loadChatModels()
  } else if (tabName === 'embedding') {
    loadEmbeddingModels()
  } else if (tabName === 'vision') {
    loadVisionModels()
  }
}

// 处理厂商分页变化
const handleVendorPageChange = (page) => {
  vendorPagination.currentPage = page
  loadVendorConfigs()
}

// 处理模型分页变化
const handleModelPageChange = (page) => {
  modelPagination.currentPage = page
  loadChatModels()
}

// 处理向量模型分页变化
const handleEmbeddingPageChange = (page) => {
  embeddingPagination.currentPage = page
  loadEmbeddingModels()
}

// 处理视觉模型分页变化
const handleVisionPageChange = (page) => {
  visionPagination.currentPage = page
  loadVisionModels()
}

// 加载厂商配置列表
const loadVendorConfigs = async () => {
  try {
    loading.value = true
    const data = await ModelService.listProviderConfigs()
    vendorConfigs.value = data.providerConfigs
    vendorPagination.total = data.total
  } catch (error) {
    ElMessage.error('加载厂商配置列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 加载对话模型列表
const loadChatModels = async () => {
  try {
    loading.value = true
    const data = await ModelService.listLLMs({ modelType: 'chat' })
    customModels.value = data.llms
    modelPagination.total = data.total
  } catch (error) {
    ElMessage.error('加载对话模型列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 加载向量模型列表
const loadEmbeddingModels = async () => {
  try {
    loading.value = true
    const data = await ModelService.listLLMs({ modelType: 'embedding' })
    embeddingModels.value = data.llms
    embeddingPagination.total = data.total
  } catch (error) {
    ElMessage.error('加载向量模型列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 加载视觉模型列表
const loadVisionModels = async () => {
  try {
    loading.value = true
    const data = await ModelService.listLLMs({ modelType: 'vision' })
    visionModels.value = data.llms
    visionPagination.total = data.total
  } catch (error) {
    ElMessage.error('加载视觉模型列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 打开厂商配置对话框
const openVendorDialog = (vendor = null) => {
  if (vendor) {
    editingVendor.value = vendor
    Object.assign(vendorForm, {
      ...vendor,
    })
  } else {
    editingVendor.value = {}
    resetVendorForm()
  }
  vendorDialogVisible.value = true
}

// 重置厂商表单
const resetVendorForm = () => {
  Object.assign(vendorForm, {
    provider: '',
    apiBase: '',
    apiKey: '',
    description: '',
    status: 'active',
  })
}

// 保存厂商配置
const saveVendorConfig = async () => {
  if (!vendorFormRef.value) return

  await vendorFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        saving.value = true
        if (editingVendor.value.id) {
          // 更新厂商配置
          const { id, ...updateData } = vendorForm
          const updatedVendor = await ModelService.updateProviderConfig(
            editingVendor.value.id,
            updateData,
          )
          const index = vendorConfigs.value.findIndex((v) => v.id === editingVendor.value.id)
          if (index !== -1) {
            vendorConfigs.value[index] = updatedVendor
          }
          ElMessage.success('厂商配置更新成功')
        } else {
          // 添加厂商配置
          const newVendor = await ModelService.createProviderConfig(vendorForm)
          vendorConfigs.value.push(newVendor)
          vendorPagination.total++
          ElMessage.success('厂商配置添加成功')
        }

        vendorDialogVisible.value = false
        if (activeTab.value === 'vendor') {
          loadVendorConfigs()
        }
      } catch (error) {
        ElMessage.error('保存厂商配置失败: ' + (error.message || '未知错误'))
      } finally {
        saving.value = false
      }
    }
  })
}

// 删除厂商配置
const deleteVendorConfig = (vendor) => {
  ElMessageBox.confirm(`确定要删除厂商配置 "${vendor.provider}" 吗？此操作不可恢复。`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await ModelService.deleteProviderConfig(vendor.id)
        const index = vendorConfigs.value.findIndex((v) => v.id === vendor.id)
        if (index !== -1) {
          vendorConfigs.value.splice(index, 1)
          vendorPagination.total--
        }
        ElMessage.success('厂商配置删除成功')
      } catch (error) {
        ElMessage.error('删除厂商配置失败: ' + (error.message || '未知错误'))
      }
    })
    .catch(() => {
      // 用户取消删除
    })
}

// 打开模型对话框
const openModelDialog = (model = null) => {
  if (model) {
    editingModel.value = model
    Object.assign(modelForm, {
      ...model,
      config: { ...model.config },
    })
  } else {
    editingModel.value = {}
    resetModelForm()
  }
  modelDialogVisible.value = true
}

// 重置模型表单
const resetModelForm = () => {
  Object.assign(modelForm, {
    modelType: 'chat',
    name: '',
    description: '',
    providerConfigId: null,
    modelName: '',
    config: {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 1.0,
    },
    status: 'active',
  })
}

// 保存模型
const saveModel = async () => {
  if (!modelFormRef.value) return

  await modelFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        saving.value = true

        if (editingModel.value.id) {
          // 更新模型
          const { id, ...updateData } = modelForm
          const updatedModel = await ModelService.updateLLM(editingModel.value.id, updateData)
          // 更新对应的模型列表
          if (modelForm.modelType === 'embedding') {
            const index = embeddingModels.value.findIndex((m) => m.id === editingModel.value.id)
            if (index !== -1) {
              embeddingModels.value[index] = updatedModel
            }
          } else if (modelForm.modelType === 'vision') {
            const index = visionModels.value.findIndex((m) => m.id === editingModel.value.id)
            if (index !== -1) {
              visionModels.value[index] = updatedModel
            }
          } else {
            const index = customModels.value.findIndex((m) => m.id === editingModel.value.id)
            if (index !== -1) {
              customModels.value[index] = updatedModel
            }
          }
          ElMessage.success('模型更新成功')
        } else {
          // 添加模型
          const newModel = await ModelService.createLLM(modelForm)
          // 添加到对应的模型列表
          if (modelForm.modelType === 'embedding') {
            embeddingModels.value.push(newModel)
            embeddingPagination.total++
          } else if (modelForm.modelType === 'vision') {
            visionModels.value.push(newModel)
            visionPagination.total++
          } else {
            customModels.value.push(newModel)
            modelPagination.total++
          }
          ElMessage.success('模型添加成功')
        }

        modelDialogVisible.value = false
        // 重新加载当前标签页的数据
        if (activeTab.value === 'custom') {
          loadChatModels()
        } else if (activeTab.value === 'embedding') {
          loadEmbeddingModels()
        } else if (activeTab.value === 'vision') {
          loadVisionModels()
        }
      } catch (error) {
        ElMessage.error('保存模型失败: ' + (error.message || '未知错误'))
      } finally {
        saving.value = false
      }
    }
  })
}

// 删除模型
const deleteModel = (model) => {
  ElMessageBox.confirm(`确定要删除模型 "${model.name}" 吗？此操作不可恢复。`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await ModelService.deleteLLM(model.id)
        if (model.modelType === 'embedding') {
          const index = embeddingModels.value.findIndex((m) => m.id === model.id)
          if (index !== -1) {
            embeddingModels.value.splice(index, 1)
            embeddingPagination.total--
          }
        } else if (model.modelType === 'vision') {
          const index = visionModels.value.findIndex((m) => m.id === model.id)
          if (index !== -1) {
            visionModels.value.splice(index, 1)
            visionPagination.total--
          }
        } else {
          const index = customModels.value.findIndex((m) => m.id === model.id)
          if (index !== -1) {
            customModels.value.splice(index, 1)
            modelPagination.total--
          }
        }
        ElMessage.success('模型删除成功')
      } catch (error) {
        ElMessage.error('删除模型失败: ' + (error.message || '未知错误'))
      }
    })
    .catch(() => {
      // 用户取消删除
    })
}

// 页面加载时获取数据
onMounted(() => {
  loadVendorConfigs()
})
</script>

<style scoped>
.model-management-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.model-management-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.param-label {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  text-align: center;
}

.empty-text {
  color: #999;
  font-style: italic;
}

.form-item-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>
