<template>
  <el-dialog 
    :model-value="visible" 
    @update:model-value="$emit('update:visible', $event)"
    title="添加知识库" 
    width="600px"
  >
    <el-table
      :data="availableKnowledgeBases"
      @selection-change="handleSelectionChange"
      style="width: 100%"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="description" label="描述" />
    </el-table>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('cancel')">取消</el-button>
        <el-button type="primary" @click="$emit('submit', selectedKnowledgeBases)">确定</el-button>
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
    availableKnowledgeBases: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:visible', 'cancel', 'submit'],
  data() {
    return {
      selectedKnowledgeBases: [],
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.selectedKnowledgeBases = val
    },
  },
}
</script>
