<template>
  <el-dialog v-model="visible" title="添加知识库" width="50%">
    <el-form :model="form" label-width="100px">
      <el-form-item label="知识库">
        <el-select v-model="form.knowledge_base_id" placeholder="请选择知识库">
          <el-option
            v-for="kb in availableKnowledgeBases"
            :key="kb.id"
            :label="kb.name"
            :value="kb.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级">
        <el-input-number v-model="form.priority" :min="1" :max="100" />
      </el-form-item>
      <el-form-item label="触发条件">
        <el-input v-model="form.trigger_condition" placeholder="触发条件表达式" />
      </el-form-item>
      <el-form-item label="状态">
        <el-switch
          v-model="form.status"
          active-value="enabled"
          inactive-value="disabled"
          active-text="启用"
          inactive-text="禁用"
        />
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
    formData: {
      type: Object,
      default: () => ({
        knowledge_base_id: '',
        priority: 1,
        trigger_condition: '',
        status: 'enabled',
      }),
    },
    availableKnowledgeBases: {
      type: Array,
      default: () => [],
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
