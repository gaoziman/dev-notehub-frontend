<!-- DocumentViewSwitch.vue -->
<template>
  <div class="view-switch">
    <n-button-group>
      <n-tooltip trigger="hover" placement="top" :delay="500">
        <template #trigger>
          <n-button
              :type="viewMode === 'card' ? 'primary' : 'default'"
              @click="updateViewMode('card')"
          >
            <template #icon>
              <icon-font type="icon-kapian" />
            </template>
          </n-button>
        </template>
        卡片视图
      </n-tooltip>
      <n-tooltip trigger="hover" placement="top" :delay="500">
        <template #trigger>
          <n-button
              :type="viewMode === 'list' ? 'primary' : 'default'"
              @click="updateViewMode('list')"
          >
            <template #icon>
              <icon-font type="icon-liebiao" />
            </template>
          </n-button>
        </template>
        列表视图
      </n-tooltip>
    </n-button-group>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import IconFont from "@/components/common/IconFont.vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: 'card'
  }
})

const emit = defineEmits(['update:viewMode'])

const viewMode = computed(() => props.modelValue)

const updateViewMode = (mode) => {
  emit('update:viewMode', mode)
}
</script>

<style scoped>
.view-switch {
  display: flex;
  align-items: center;
}
</style>