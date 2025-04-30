<template>
  <!-- 无可见内容的功能组件 -->
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useMessage } from 'naive-ui'

const message = useMessage()

const props = defineProps({
  shortcuts: {
    type: Object,
    default: () => ({})
  },
  enabled: {
    type: Boolean,
    default: true
  },
  showToast: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['action'])

// 快捷键处理函数
function handleKeyDown(event) {
  if (!props.enabled) return

  // 阻止在输入框中触发快捷键
  if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.isContentEditable
  ) {
    return
  }

  // 构建快捷键字符串
  let shortcutStr = ''
  if (event.ctrlKey) shortcutStr += 'Ctrl+'
  if (event.altKey) shortcutStr += 'Alt+'
  if (event.shiftKey) shortcutStr += 'Shift+'

  // 如果仅按下修饰键，则不继续处理
  if (event.key === 'Control' || event.key === 'Alt' || event.key === 'Shift') {
    return
  }

  // 添加主键
  const keyName = event.key === ' ' ? 'Space' : event.key
  shortcutStr += keyName.charAt(0).toUpperCase() + keyName.slice(1)

  // 查找匹配的快捷键
  let actionFound = false
  let actionKey = null

  for (const [action, shortcutObj] of Object.entries(props.shortcuts)) {
    if (shortcutObj.key && normalizeShortcut(shortcutObj.key) === normalizeShortcut(shortcutStr)) {
      actionFound = true
      actionKey = action
      break
    }
  }

  // 如果找到匹配的快捷键，则触发动作
  if (actionFound && actionKey) {
    event.preventDefault()

    // 显示提示
    if (props.showToast) {
      const shortcutLabel = props.shortcuts[actionKey]?.label || actionKey
      message.info(`执行: ${shortcutLabel} (${shortcutStr})`)
    }

    // 触发动作
    emit('action', actionKey, event)
  }
}

// 标准化快捷键字符串以便于比较
function normalizeShortcut(shortcut) {
  return shortcut.toLowerCase().replace(/\s+/g, '')
}

// 挂载时添加事件监听器
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

// 卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// 当快捷键设置发生变化时，重新注册
watch(() => props.shortcuts, (newShortcuts) => {
  // 快捷键配置更新，无需特殊处理
  console.log('快捷键设置已更新:', newShortcuts)
}, { deep: true })
</script>