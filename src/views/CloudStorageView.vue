<template>
  <div class="cloud-storage-view">
    <div class="header">
      <h2>云存储</h2>
      <p>管理您的向量数据库、关系型数据库和云存储文件</p>
    </div>
    
    <div class="storage-layout">
      <!-- 左侧数据库类型导航 -->
      <div class="database-nav">
        <el-menu
          :default-active="activeDatabaseType"
          class="database-menu"
          @select="handleDatabaseTypeSelect"
        >
          <el-menu-item index="vector">
            <el-icon><Collection /></el-icon>
            <span>向量数据库</span>
          </el-menu-item>
          <el-menu-item index="relational">
            <el-icon><DataLine /></el-icon>
            <span>关系型数据库</span>
          </el-menu-item>
          <el-menu-item index="file">
            <el-icon><Folder /></el-icon>
            <span>云存储</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <!-- 右侧数据库管理内容 -->
      <div class="database-content">
        <component 
          :is="currentDatabaseComponent" 
          :database-type="activeDatabaseType"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Collection, DataLine, Folder } from '@element-plus/icons-vue'
import VectorDatabaseManager from '@/components/storage/VectorDatabaseManager.vue'
import RelationalDatabaseManager from '@/components/storage/RelationalDatabaseManager.vue'
import FileStorageManager from '@/components/storage/FileStorageManager.vue'

// 当前选中的数据库类型
const activeDatabaseType = ref('file')

// 根据选中的数据库类型动态切换组件
const currentDatabaseComponent = computed(() => {
  switch (activeDatabaseType.value) {
    case 'vector':
      return VectorDatabaseManager
    case 'relational':
      return RelationalDatabaseManager
    case 'file':
      return FileStorageManager
    default:
      return FileStorageManager
  }
})

// 处理数据库类型选择
const handleDatabaseTypeSelect = (index: string) => {
  activeDatabaseType.value = index
}
</script>

<style scoped>
.cloud-storage-view {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 24px;
}

.header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.header p {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.storage-layout {
  display: flex;
  flex: 1;
  gap: 20px;
  overflow: hidden;
}

.database-nav {
  width: 240px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  overflow: hidden;
}

.database-menu {
  border-right: none;
}

.database-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}

.database-menu :deep(.el-menu-item.is-active) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-right: 3px solid var(--el-color-primary);
}

.database-content {
  flex: 1;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .storage-layout {
    flex-direction: column;
  }
  
  .database-nav {
    width: 100%;
  }
}
</style>