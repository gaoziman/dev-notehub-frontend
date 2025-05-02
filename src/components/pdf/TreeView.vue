<template>
  <div class="tree-view">
    <div v-for="node in data" :key="node.id" class="tree-node">
      <tree-node
          :node="node"
          @node-click="handleNodeClick"
          :default-expand="defaultExpandAll"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue';
import TreeNode from './TreeNode.vue';

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  defaultExpandAll: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['node-click']);

// 处理节点点击
const handleNodeClick = (node) => {
  emit('node-click', node);
};

// 提供全局展开状态控制
provide('defaultExpandAll', props.defaultExpandAll);
</script>

<style scoped>
.tree-view {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 14px;
  width: 100%;
}
</style>