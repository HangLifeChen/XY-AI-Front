<template>
  <div class="agent-tester">
    <div class="tester-header">
      <h3>智能体测试</h3>
      <div class="tester-actions">
        <el-button size="small" @click="handleClear">清空</el-button>
        <el-button type="primary" size="small" @click="handleRunTest"> 运行测试 </el-button>
        <el-button size="small" @click="handleSaveCase">保存用例</el-button>
      </div>
    </div>

    <div class="tester-container">
      <div class="input-section">
        <h4>测试输入</h4>
        <el-input v-model="testInput" type="textarea" :rows="5" placeholder="输入测试内容..." />
        <div class="input-params">
          <el-form :inline="true" size="small">
            <el-form-item label="用户角色">
              <el-input v-model="userRole" placeholder="用户角色" />
            </el-form-item>
            <el-form-item label="测试环境">
              <el-select v-model="testEnv" placeholder="选择环境">
                <el-option label="开发" value="dev" />
                <el-option label="测试" value="test" />
                <el-option label="生产" value="prod" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <div class="output-section">
        <h4>测试结果</h4>
        <div class="output-content" v-loading="isTesting">
          <pre v-if="testResult">{{ testResult }}</pre>
          <div v-else class="empty-result">暂无测试结果</div>
        </div>
      </div>
    </div>

    <div class="test-cases">
      <h4>测试用例</h4>
      <el-table :data="testCases" height="250" style="width: 100%">
        <el-table-column prop="name" label="用例名称" width="180" />
        <el-table-column prop="input" label="输入内容" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" @click="loadTestCase(scope.row)"> 加载 </el-button>
            <el-button size="small" type="danger" @click="deleteTestCase(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 保存测试用例对话框 -->
    <el-dialog v-model="saveDialogVisible" title="保存测试用例" width="30%">
      <el-form :model="newTestCase">
        <el-form-item label="用例名称">
          <el-input v-model="newTestCase.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newTestCase.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="saveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSaveCase">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useAgentStore } from '@/stores/agentStore'

interface TestCase {
  id?: string
  name: string
  input: string
  description?: string
  userRole?: string
  testEnv?: string
  createdAt?: string
}

const props = defineProps({
  agentId: {
    type: String,
    required: true,
  },
})

const agentStore = useAgentStore()
const testInput = ref('')
const testResult = ref('')
const isTesting = ref(false)
const userRole = ref('')
const testEnv = ref('dev')
const saveDialogVisible = ref(false)
const testCases = ref<TestCase[]>([])
const newTestCase = reactive<Omit<TestCase, 'id'>>({
  name: '',
  input: '',
  description: '',
})

const handleRunTest = async () => {
  if (!testInput.value.trim()) {
    return
  }

  isTesting.value = true
  testResult.value = ''

  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000))
    testResult.value =
      `测试时间: ${new Date().toLocaleString()}\n\n` +
      `用户角色: ${userRole.value || '未指定'}\n` +
      `测试环境: ${testEnv.value}\n\n` +
      `输入内容:\n${testInput.value}\n\n` +
      `测试结果:\n这是智能体对输入内容的模拟响应。在实际应用中，这里会显示真实的API响应。`
  } catch (err) {
    testResult.value = `测试失败: ${err instanceof Error ? err.message : String(err)}`
  } finally {
    isTesting.value = false
  }
}

const handleClear = () => {
  testInput.value = ''
  testResult.value = ''
  userRole.value = ''
  testEnv.value = 'dev'
}

const handleSaveCase = () => {
  if (!testInput.value.trim()) {
    return
  }

  newTestCase.input = testInput.value
  newTestCase.name = `测试用例 ${testCases.value.length + 1}`
  newTestCase.description = ''
  saveDialogVisible.value = true
}

const confirmSaveCase = () => {
  const caseToSave: TestCase = {
    ...newTestCase,
    id: Date.now().toString(),
    createdAt: new Date().toLocaleString(),
  }

  testCases.value.push(caseToSave)
  saveDialogVisible.value = false
}

const loadTestCase = (testCase: TestCase) => {
  testInput.value = testCase.input
  // 可以加载更多测试用例属性
}

const deleteTestCase = (id: string) => {
  testCases.value = testCases.value.filter((c) => c.id !== id)
}
</script>

<style scoped>
.agent-tester {
  padding: 20px;
}

.tester-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tester-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.input-section,
.output-section {
  flex: 1;
}

.input-params {
  margin-top: 10px;
}

.output-content {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  min-height: 200px;
  background-color: #f9f9f9;
}

.empty-result {
  color: #909399;
  text-align: center;
  padding: 20px;
}

.test-cases {
  margin-top: 20px;
}
</style>
