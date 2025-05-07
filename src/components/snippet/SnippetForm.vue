<template>
  <div class="snippet-form">
    <n-form
        ref="formRef"
        :model="formValue"
        :rules="rules"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
    >
      <n-form-item label="标题" path="title">
        <n-input v-model:value="formValue.title" placeholder="输入代码片段标题" />
      </n-form-item>

      <n-form-item label="描述" path="description">
        <n-input
            v-model:value="formValue.description"
            type="textarea"
            placeholder="简要描述代码片段的功能和用途"
            :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </n-form-item>

      <n-form-item label="技术栈" path="technology">
        <n-select
            v-model:value="formValue.technology"
            placeholder="选择技术栈"
            :options="techOptions"
        />
      </n-form-item>

      <n-form-item label="组件类型" path="category">
        <n-select
            v-model:value="formValue.category"
            placeholder="选择组件类型"
            :options="categoryOptions"
        />
      </n-form-item>

      <n-form-item label="使用场景" path="usage">
        <n-select
            v-model:value="formValue.usage"
            placeholder="选择使用场景"
            :options="usageOptions"
        />
      </n-form-item>

      <n-form-item label="标签" path="tags">
        <n-dynamic-tags v-model:value="formValue.tags" />
        <template #help>
          添加关键词标签，按Enter键确认
        </template>
      </n-form-item>

      <n-form-item label="代码" path="code">
        <div class="code-editor-container">
          <n-input
              v-model:value="formValue.code"
              type="textarea"
              placeholder="粘贴您的代码片段"
              :autosize="{ minRows: 10, maxRows: 20 }"
          />
        </div>
      </n-form-item>

      <n-form-item v-if="!isEdit" label="作者" path="author">
        <n-input v-model:value="formValue.author" placeholder="输入您的名字" />
      </n-form-item>

      <div class="form-actions">
        <n-space>
          <n-button @click="$emit('cancel')">取消</n-button>
          <n-button type="primary" @click="handleSubmit">{{ isEdit ? '保存修改' : '提交' }}</n-button>
        </n-space>
      </div>
    </n-form>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue'
import { useMessage } from 'naive-ui'

const props = defineProps({
  snippet: {
    type: Object,
    default: null
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])
const message = useMessage()
const formRef = ref(null)

// 默认表单数据
const defaultFormValue = {
  title: '',
  description: '',
  technology: null,
  category: null,
  usage: null,
  tags: [],
  code: '',
  author: ''
}

// 表单数据
const formValue = ref({ ...defaultFormValue })

// 表单规则
const rules = {
  title: {
    required: true,
    message: '请输入标题',
    trigger: 'blur'
  },
  description: {
    required: true,
    message: '请输入描述',
    trigger: 'blur'
  },
  technology: {
    required: true,
    message: '请选择技术栈',
    trigger: 'change'
  },
  category: {
    required: true,
    message: '请选择组件类型',
    trigger: 'change'
  },
  usage: {
    required: true,
    message: '请选择使用场景',
    trigger: 'change'
  },
  code: {
    required: true,
    message: '请输入代码',
    trigger: 'blur'
  },
  author: {
    required: !props.isEdit,
    message: '请输入作者名称',
    trigger: 'blur'
  }
}

// 技术栈选项
const techOptions = [
  { label: 'Vue 3', value: 'vue3' },
  { label: 'React', value: 'react' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'HTML/CSS', value: 'html-css' },
  { label: 'Spring Boot', value: 'spring-boot' },
  { label: 'Java', value: 'java' }
]

// 组件类型选项
const categoryOptions = [
  { label: '表单组件', value: 'form' },
  { label: '导航组件', value: 'navigation' },
  { label: '数据展示', value: 'data-display' },
  { label: '功能组件', value: 'utility' },
  { label: '布局组件', value: 'layout' },
  { label: '动画效果', value: 'animation' }
]

// 使用场景选项
const usageOptions = [
  { label: '后台管理', value: 'admin' },
  { label: '移动端应用', value: 'mobile' },
  { label: '数据可视化', value: 'data-viz' },
  { label: '用户认证', value: 'auth' },
  { label: '常见业务逻辑', value: 'business-logic' }
]

// 提交表单
const handleSubmit = (e) => {
  e.preventDefault()
  formRef.value?.validate((errors) => {
    if (!errors) {
      // 克隆表单数据，避免引用问题
      const formData = { ...formValue.value }
      // 确保标签是数组
      if (typeof formData.tags === 'string') {
        formData.tags = formData.tags.split(',').map(tag => tag.trim())
      }

      emit('submit', formData)

      // 如果不是编辑模式，重置表单
      if (!props.isEdit) {
        formValue.value = { ...defaultFormValue }
      }
    } else {
      message.error('请完善表单信息')
    }
  })
}

// 初始化表单数据（编辑模式）
onMounted(() => {
  if (props.isEdit && props.snippet) {
    formValue.value = {
      title: props.snippet.title,
      description: props.snippet.description,
      technology: props.snippet.technology,
      category: props.snippet.category,
      usage: props.snippet.usage,
      tags: [...props.snippet.tags],
      code: props.snippet.code,
      author: props.snippet.author
    }
  }
})
</script>

<style scoped>
.snippet-form {
  max-width: 100%;
}

.code-editor-container {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  font-family: monospace;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}
</style>