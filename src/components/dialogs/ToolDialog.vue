<template>
  <el-dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :title="isEditing ? '编辑工具' : '添加工具'" width="50%">
    <el-form :model="form" label-width="100px">
      <el-form-item label="名称">
        <el-input v-model="form.name" placeholder="请输入工具名称" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入工具描述"
        />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="form.type" placeholder="请选择工具类型">
          <el-option label="API" value="api" />
          <el-option label="函数" value="function" />
          <el-option label="工作流" value="workflow" />
        </el-select>
      </el-form-item>
      <el-form-item label="配置" v-if="form.type === 'api'">
        <el-input v-model="form.config.url" placeholder="API URL" />
        <el-select v-model="form.config.method" placeholder="请求方法">
          <el-option label="GET" value="get" />
          <el-option label="POST" value="post" />
          <el-option label="PUT" value="put" />
          <el-option label="DELETE" value="delete" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('cancel')">取消</el-button>
        <el-button type="primary" @click="$emit('submit', form)">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
    formData: {
      type: Object,
      default: () => ({
        name: '',
        description: '',
        type: '',
        config: {
          url: '',
          method: '',
        },
      }),
    },
  },
  data() {
    return {
      form: { ...this.formData },
    }
  },
  watch: {
    formData: {
      handler(newVal) {
        this.form = { ...newVal }
      },
      deep: true,
    },
  },
}
</script>
