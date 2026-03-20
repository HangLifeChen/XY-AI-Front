<template>
  <div class="vector-database-manager">
    <div class="manager-header">
      <h3>向量数据库</h3>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreateCollection">
          <el-icon><Plus /></el-icon>
          创建集合
        </el-button>
      </div>
    </div>
    
    <div class="manager-content">
      <el-table 
        :data="collections" 
        style="width: 100%" 
        v-loading="loading"
        stripe
      >
        <el-table-column prop="name" label="集合名称" />
        <el-table-column prop="dimension" label="维度" />
        <el-table-column prop="count" label="向量数量" />
        <el-table-column prop="created" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleViewCollection(scope.row)">
              查看
            </el-button>
            <el-button size="small" type="danger" @click="handleDeleteCollection(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="empty-state" v-if="!loading && collections.length === 0">
        <el-empty description="暂无向量数据库集合">
          <el-button type="primary" @click="handleCreateCollection">
            创建第一个集合
          </el-button>
        </el-empty>
      </div>
    </div>
    
    <!-- 创建集合对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建向量数据库集合"
      width="500px"
    >
      <el-form :model="newCollection" label-width="100px">
        <el-form-item label="集合名称" required>
          <el-input v-model="newCollection.name" placeholder="请输入集合名称" />
        </el-form-item>
        <el-form-item label="维度" required>
          <el-input-number 
            v-model="newCollection.dimension" 
            :min="1" 
            :max="2048" 
            placeholder="请输入维度"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="newCollection.description" 
            type="textarea" 
            placeholder="请输入描述（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="confirmCreateCollection" 
            :loading="creating"
          >
            创建
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VectorDatabaseService } from '@/api/cloudStorageService'
import type { VectorCollection, VectorCollectionCreateRequest } from '@/types/cloudStorage'

const collections = ref<VectorCollection[]>([])
const loading = ref(false)
const createDialogVisible = ref(false)
const creating = ref(false)

const newCollection = ref<VectorCollectionCreateRequest>({
  name: '',
  dimension: 1536,
  description: ''
})

// 组件挂载时加载数据
onMounted(() => {
  loadCollections()
})

// 加载集合数据
const loadCollections = async () => {
  try {
    loading.value = true
    const response = await VectorDatabaseService.getCollections()
    collections.value = response.collections
  } catch (error: any) {
    ElMessage.error('加载集合列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 创建集合
const handleCreateCollection = () => {
  newCollection.value = {
    name: '',
    dimension: 1536,
    description: ''
  }
  createDialogVisible.value = true
}

// 确认创建集合
const confirmCreateCollection = async () => {
  if (!newCollection.value.name) {
    ElMessage.warning('请输入集合名称')
    return
  }
  
  if (!newCollection.value.dimension) {
    ElMessage.warning('请输入维度')
    return
  }
  
  try {
    creating.value = true
    await VectorDatabaseService.createCollection(newCollection.value)
    ElMessage.success('集合创建成功')
    createDialogVisible.value = false
    loadCollections()
  } catch (error: any) {
    ElMessage.error('创建集合失败: ' + (error.message || '未知错误'))
  } finally {
    creating.value = false
  }
}

// 查看集合详情
const handleViewCollection = (collection: VectorCollection) => {
  ElMessage.info(`查看集合: ${collection.name}`)
}

// 删除集合
const handleDeleteCollection = (collection: VectorCollection) => {
  ElMessageBox.confirm(
    `确定要删除集合 "${collection.name}" 吗？此操作不可撤销。`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await VectorDatabaseService.deleteCollection(collection.id)
      ElMessage.success('删除成功')
      loadCollections()
    } catch (error: any) {
      ElMessage.error('删除失败: ' + (error.message || '未知错误'))
    }
  }).catch(() => {
    // 用户取消删除
  })
}
</script>

<style scoped>
.vector-database-manager {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.manager-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.manager-content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>