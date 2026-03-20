<template>
  <div class="relational-database-manager">
    <div class="manager-header">
      <h3>关系型数据库</h3>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreateTable">
          <el-icon><Plus /></el-icon>
          创建表
        </el-button>
      </div>
    </div>
    
    <div class="manager-content">
      <el-table 
        :data="tables" 
        style="width: 100%" 
        v-loading="loading"
        stripe
      >
        <el-table-column prop="name" label="表名" />
        <el-table-column prop="rows" label="行数" />
        <el-table-column prop="size" label="大小" />
        <el-table-column prop="engine" label="存储引擎" />
        <el-table-column prop="created" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleViewTable(scope.row)">
              查看
            </el-button>
            <el-button size="small" type="danger" @click="handleDeleteTable(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="empty-state" v-if="!loading && tables.length === 0">
        <el-empty description="暂无数据表">
          <el-button type="primary" @click="handleCreateTable">
            创建第一个数据表
          </el-button>
        </el-empty>
      </div>
    </div>
    
    <!-- 创建表对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建数据表"
      width="600px"
    >
      <el-form :model="newTable" label-width="100px">
        <el-form-item label="表名" required>
          <el-input v-model="newTable.name" placeholder="请输入表名" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="newTable.description" 
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
            @click="confirmCreateTable" 
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
import { RelationalDatabaseService } from '@/api/cloudStorageService'
import type { RelationalTable, RelationalTableCreateRequest } from '@/types/cloudStorage'

const tables = ref<RelationalTable[]>([])
const loading = ref(false)
const createDialogVisible = ref(false)
const creating = ref(false)

const newTable = ref<RelationalTableCreateRequest>({
  name: '',
  columns: [],
  description: ''
})

// 组件挂载时加载数据
onMounted(() => {
  loadTables()
})

// 加载表数据
const loadTables = async () => {
  try {
    loading.value = true
    const response = await RelationalDatabaseService.getTables()
    tables.value = response.tables
  } catch (error: any) {
    ElMessage.error('加载表列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 创建表
const handleCreateTable = () => {
  newTable.value = {
    name: '',
    columns: [],
    description: ''
  }
  createDialogVisible.value = true
}

// 确认创建表
const confirmCreateTable = async () => {
  if (!newTable.value.name) {
    ElMessage.warning('请输入表名')
    return
  }
  
  try {
    creating.value = true
    await RelationalDatabaseService.createTable(newTable.value)
    ElMessage.success('表创建成功')
    createDialogVisible.value = false
    loadTables()
  } catch (error: any) {
    ElMessage.error('创建表失败: ' + (error.message || '未知错误'))
  } finally {
    creating.value = false
  }
}

// 查看表详情
const handleViewTable = (table: RelationalTable) => {
  ElMessage.info(`查看表: ${table.name}`)
}

// 删除表
const handleDeleteTable = (table: RelationalTable) => {
  ElMessageBox.confirm(
    `确定要删除表 "${table.name}" 吗？此操作不可撤销。`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await RelationalDatabaseService.deleteTable(table.id)
      ElMessage.success('删除成功')
      loadTables()
    } catch (error: any) {
      ElMessage.error('删除失败: ' + (error.message || '未知错误'))
    }
  }).catch(() => {
    // 用户取消删除
  })
}
</script>

<style scoped>
.relational-database-manager {
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