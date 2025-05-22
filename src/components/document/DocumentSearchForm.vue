<template>
  <div class="search-form">
    <n-form
        inline
        :model="searchForm"
        @submit.prevent="handleSubmit"
        class="form-container"
    >
      <!-- 搜索框组件 -->
      <n-form-item path="keyword" class="search-box">
        <n-input-group>
          <n-input
              v-model:value="searchForm.keyword"
              placeholder="搜索文档标题、内容或标签..."
              clearable
          >
            <template #prefix>
              <icon-font type="icon-search" :size="18" />
            </template>
          </n-input>
          <n-button type="primary" @click="handleSubmit">
            搜索
          </n-button>
        </n-input-group>
      </n-form-item>

      <!-- 日期范围选择器 -->
      <n-form-item path="dateRange" class="date-range">
        <n-date-picker
            v-model:value="searchForm.dateRange"
            type="daterange"
            clearable
            placeholder="选择时间范围"
            :shortcuts="dateShortcuts"
        />
      </n-form-item>

      <!-- 搜索按钮 -->
      <n-form-item class="search-buttons">
        <n-space>
          <n-button
              @click="handleReset"
              :disabled="loading"
          >
            <template #icon>
              <icon-font type="icon-reset" />
            </template>
            重置
          </n-button>
        </n-space>
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import IconFont from '@/components/common/IconFont.vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['search'])

// 基础搜索表单
const searchForm = reactive({
  keyword: '',
  dateRange: null
})

// 日期快捷选项
const dateShortcuts = {
  '今天': [new Date(), new Date()],
  '昨天': [
    new Date(Date.now() - 86400000),
    new Date(Date.now() - 86400000)
  ],
  '本周': [
    new Date(Date.now() - (new Date().getDay() - 1) * 86400000),
    new Date()
  ],
  '本月': [
    new Date(new Date().setDate(1)),
    new Date()
  ],
  '最近7天': [
    new Date(Date.now() - 7 * 86400000),
    new Date()
  ],
  '最近30天': [
    new Date(Date.now() - 30 * 86400000),
    new Date()
  ]
}

// 处理搜索提交
const handleSubmit = () => {
  emit('search', searchForm)
}

// 重置搜索条件
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    dateRange: null
  })

  emit('search', searchForm)
}
</script>

<style scoped>
.search-form {
  padding: 8px 0;
}

.form-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.search-box {
  flex-grow: 1;
  min-width: 280px;
}

.date-range {
  min-width: 300px;
}

.search-buttons {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .search-box,
  .date-range {
    width: 100%;
    min-width: 100%;
  }

  .search-buttons {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>