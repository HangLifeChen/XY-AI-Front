<template>
  <div class="file-storage-manager">
    <div class="manager-header">
      <h3>云存储</h3>
      <div class="header-actions">
        <el-upload
          class="upload-demo"
          action=""
          :auto-upload="false"
          :on-change="handleFileUpload"
          :show-file-list="false"
        >
          <el-button type="primary">
            <el-icon><Upload /></el-icon>
            上传文件
          </el-button>
        </el-upload>
      </div>
    </div>

    <div class="manager-content">
      <div class="file-filters">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文件"
          style="width: 300px; margin-right: 16px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="fileTypeFilter"
          placeholder="文件类型"
          style="width: 150px; margin-right: 16px"
          @change="handleFilterChange"
        >
          <el-option label="全部" value=""></el-option>
          <el-option label="图片" value="image"></el-option>
          <el-option label="文档" value="document"></el-option>
          <el-option label="视频" value="video"></el-option>
          <el-option label="音频" value="audio"></el-option>
        </el-select>

        <el-button @click="loadFiles">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>

      <el-table :data="filteredFiles" style="width: 100%" v-loading="loading" stripe>
        <el-table-column label="文件名" width="300">
          <template #default="scope">
            <div class="file-info">
              <el-icon class="file-icon" :size="20">
                <component :is="getFileIcon(scope.row.type)" />
              </el-icon>
              <div class="file-name">
                <div>{{ scope.row.name }}</div>
                <div class="file-path">{{ scope.row.path }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="120" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="source" label="来源" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.source === 'aliyun'" type="primary">阿里云OSS</el-tag>
            <el-tag v-else-if="scope.row.source === 'qiniu'" type="success">七牛云</el-tag>
            <el-tag v-else type="info">未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="modified" label="修改时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.modified) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handlePreviewFile(scope.row)"> 预览 </el-button>
            <el-button size="small" @click="handleCopyUrl(scope.row)"> 复制URL </el-button>
            <el-button size="small" type="danger" @click="handleDeleteFile(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalFiles"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <div class="empty-state" v-if="!loading && files.length === 0">
        <el-empty description="暂无文件">
          <el-upload
            class="upload-demo"
            action=""
            :auto-upload="false"
            :on-change="handleFileUpload"
            :show-file-list="false"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              上传第一个文件
            </el-button>
          </el-upload>
        </el-empty>
      </div>
    </div>

    <!-- 文件预览对话框 -->
    <el-dialog v-model="previewDialogVisible" :title="previewFile.name" width="60%">
      <div class="file-preview">
        <img
          v-if="isImageFile(previewFile)"
          :src="previewFile.url"
          :alt="previewFile.name"
          class="preview-image"
        />
        <div v-else class="preview-placeholder">
          <el-icon :size="64"><Document /></el-icon>
          <p>{{ previewFile.name }}</p>
          <p class="file-size">{{ previewFile.size }}</p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleDownloadFile(previewFile)">
            <el-icon><Download /></el-icon>
            下载
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Upload,
  Search,
  Refresh,
  Download,
  Picture,
  Document,
  VideoCamera,
  Headset,
  Folder,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FileStorageService } from '@/api/cloudStorageService'
import type { StorageFile, StorageFileUploadRequest } from '@/types/cloudStorage'
import { formatDate } from '@/utils/date'

// 文件数据
const files = ref<StorageFile[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const fileTypeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalFiles = ref(0)
const previewDialogVisible = ref(false)
const previewFile = ref<StorageFile>({} as StorageFile)

// 计算过滤后的文件列表
const filteredFiles = computed(() => {
  return files.value
})

// 组件挂载时加载数据
onMounted(() => {
  loadFiles()
})

// 加载文件数据
const loadFiles = async () => {
  try {
    loading.value = true
    const response = await FileStorageService.getFiles({
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchKeyword.value,
      fileType: fileTypeFilter.value,
    })
    files.value = response.files
    totalFiles.value = response.total
  } catch (error: any) {
    ElMessage.error('加载文件列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 处理文件上传
const handleFileUpload = async (file: any) => {
  try {
    const uploadRequest: StorageFileUploadRequest = {
      file: file.raw,
    }

    await FileStorageService.uploadFile(uploadRequest)
    ElMessage.success(`文件 "${file.name}" 上传成功`)
    // 重新加载文件列表
    loadFiles()
  } catch (error: any) {
    ElMessage.error('文件上传失败: ' + (error.message || '未知错误'))
  }
  return false // 阻止自动上传
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  loadFiles()
}

// 处理筛选变化
const handleFilterChange = () => {
  currentPage.value = 1
  loadFiles()
}

// 获取文件图标
const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'image':
      return Picture
    case 'document':
      return Document
    case 'video':
      return VideoCamera
    case 'audio':
      return Headset
    default:
      return Folder
  }
}

// 判断是否为图片文件
const isImageFile = (file: StorageFile) => {
  // 通过文件扩展名判断是否为图片
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
  const fileName = file.name.toLowerCase()
  return imageExtensions.some((ext) => fileName.endsWith(ext))
}

// 格式化日期时间
const formatDateTime = (dateString: string) => {
  return formatDate(dateString, 'YYYY-MM-DD HH:mm:ss')
}

// 预览文件
const handlePreviewFile = async (file: StorageFile) => {
  try {
    // 获取预览URL
    const previewResponse = await FileStorageService.getFilePreviewUrl(file.id)
    previewFile.value = {
      ...file,
      url: previewResponse.url,
    }
    console.log(previewFile.value)
    previewDialogVisible.value = true
  } catch (error: any) {
    ElMessage.error('获取预览失败: ' + (error.message || '未知错误'))
    // 即使预览失败，仍然显示文件信息
    previewFile.value = file
    previewDialogVisible.value = true
  }
}

// 下载文件
const handleDownloadFile = async (file: StorageFile) => {
  try {
    const blob = await FileStorageService.downloadFile(file.id)
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('文件下载成功')
    previewDialogVisible.value = false
  } catch (error: any) {
    ElMessage.error('文件下载失败: ' + (error.message || '未知错误'))
  }
}

// 复制文件URL
const handleCopyUrl = async (file: StorageFile) => {
  try {
    // 获取文件URL
    const response = await FileStorageService.getFilePreviewUrl(file.id)
    const fileUrl = response.url

    // 复制到剪贴板
    await navigator.clipboard.writeText(fileUrl)
    ElMessage.success('URL已复制到剪贴板')
  } catch (error: any) {
    ElMessage.error('复制URL失败: ' + (error.message || '未知错误'))
  }
}

// 删除文件
const handleDeleteFile = (file: StorageFile) => {
  ElMessageBox.confirm(`确定要删除文件 "${file.name}" 吗？此操作不可撤销。`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await FileStorageService.deleteFile(file.id)
        ElMessage.success('删除成功')
        // 重新加载数据
        loadFiles()
      } catch (error: any) {
        ElMessage.error('删除失败: ' + (error.message || '未知错误'))
      }
    })
    .catch(() => {
      // 用户取消删除
    })
}

// 分页相关方法
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadFiles()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadFiles()
}
</script>

<style scoped>
.file-storage-manager {
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
  display: flex;
  flex-direction: column;
}

.file-filters {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.file-info {
  display: flex;
  align-items: center;
}

.file-icon {
  margin-right: 12px;
  color: var(--el-color-primary);
}

.file-name {
  display: flex;
  flex-direction: column;
}

.file-path {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.file-preview {
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 60vh;
  border-radius: 4px;
}

.preview-placeholder {
  padding: 40px 0;
}

.preview-placeholder .file-size {
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

@media (max-width: 768px) {
  .file-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .file-filters > * {
    margin-right: 0 !important;
    margin-bottom: 12px;
  }

  .manager-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
}
</style>
