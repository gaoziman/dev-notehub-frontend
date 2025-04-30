<template>
  <div>
    <n-dropdown
        trigger="manual"
        placement="bottom-start"
        :show="visible"
        :options="contextMenuOptions"
        :x="x"
        :y="y"
        @select="handleSelect"
        @clickoutside="close"
    />
  </div>
</template>

<script setup>
import {ref, h, computed} from 'vue'
import { useMessage } from 'naive-ui'
import IconFont from '@/components/common/IconFont.vue'

const message = useMessage()

const props = defineProps({
  bookmark: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits([
  'edit',
  'delete',
  'toggle-star',
  'select',
  'copy-url',
  'open-url',
  'add-to-folder',
  'share'
])

// 上下文菜单状态
const visible = ref(false)
const x = ref(0)
const y = ref(0)

// 上下文菜单选项
const contextMenuOptions = computed(() => [
  {
    label: '在新标签页打开',
    key: 'open',
    icon: () => h(IconFont, { type: 'icon-open-external', size: 16 })
  },
  {
    label: '复制链接',
    key: 'copy',
    icon: () => h(IconFont, { type: 'icon-copy', size: 16 })
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: props.bookmark?.starred ? '取消收藏' : '收藏书签',
    key: 'toggle-star',
    icon: () => h(IconFont, {
      type: props.bookmark?.starred ? 'icon-star-filled' : 'icon-star',
      size: 16,
      color: props.bookmark?.starred ? '#f0a020' : undefined
    })
  },
  {
    label: '选择',
    key: 'select',
    icon: () => h(IconFont, { type: 'icon-check-square', size: 16 })
  },
  {
    type: 'divider',
    key: 'd2'
  },
  {
    label: '编辑书签',
    key: 'edit',
    icon: () => h(IconFont, { type: 'icon-edit', size: 16 })
  },
  {
    label: '添加到文件夹',
    key: 'add-to-folder',
    icon: () => h(IconFont, { type: 'icon-folder-add', size: 16 }),
    children: [
      {
        label: '新建文件夹...',
        key: 'new-folder',
        icon: () => h(IconFont, { type: 'icon-folder-new', size: 16 })
      },
      {
        type: 'divider',
        key: 'd3'
      },
      {
        label: '前端资源',
        key: 'folder-frontend',
        icon: () => h(IconFont, { type: 'icon-folder', size: 16 })
      },
      {
        label: '后端开发',
        key: 'folder-backend',
        icon: () => h(IconFont, { type: 'icon-folder', size: 16 })
      },
      {
        label: '学习资料',
        key: 'folder-learning',
        icon: () => h(IconFont, { type: 'icon-folder', size: 16 })
      },
      {
        label: '工具资源',
        key: 'folder-tools',
        icon: () => h(IconFont, { type: 'icon-folder', size: 16 })
      }
    ]
  },
  {
    label: '分享',
    key: 'share',
    icon: () => h(IconFont, { type: 'icon-share', size: 16 }),
    children: [
      {
        label: '复制分享链接',
        key: 'share-copy',
        icon: () => h(IconFont, { type: 'icon-link1', size: 16 })
      },
      {
        label: '生成二维码',
        key: 'share-qrcode',
        icon: () => h(IconFont, { type: 'icon-qrcode', size: 16 })
      },
      {
        label: '发送到微信',
        key: 'share-wechat',
        icon: () => h(IconFont, { type: 'icon-wechat', size: 16 })
      }
    ]
  },
  {
    type: 'divider',
    key: 'd4'
  },
  {
    label: '删除书签',
    key: 'delete',
    icon: () => h(IconFont, { type: 'icon-delete', size: 16 }),
    props: {
      style: 'color: var(--error-color)'
    }
  }
])

// 打开上下文菜单
function open(e) {
  e.preventDefault()
  x.value = e.clientX
  y.value = e.clientY
  visible.value = true
}

// 关闭上下文菜单
function close() {
  visible.value = false
}

// 处理菜单项选择
function handleSelect(key) {
  close()

  switch (key) {
    case 'open':
      window.open(props.bookmark.url, '_blank')
      emit('open-url', props.bookmark)
      break
    case 'copy':
      navigator.clipboard.writeText(props.bookmark.url)
          .then(() => message.success('链接已复制到剪贴板'))
          .catch(() => message.error('复制失败'))
      emit('copy-url', props.bookmark)
      break
    case 'toggle-star':
      emit('toggle-star', props.bookmark)
      break
    case 'select':
      emit('select', props.bookmark)
      break
    case 'edit':
      emit('edit', props.bookmark)
      break
    case 'delete':
      emit('delete', props.bookmark)
      break
    case 'new-folder':
    case 'folder-frontend':
    case 'folder-backend':
    case 'folder-learning':
    case 'folder-tools':
      const folderName = key === 'new-folder'
          ? '新建文件夹'
          : key.replace('folder-', '').replace(/^\w/, c => c.toUpperCase())
      emit('add-to-folder', props.bookmark, folderName)
      break
    case 'share-copy':
    case 'share-qrcode':
    case 'share-wechat':
      const shareType = key.replace('share-', '')
      emit('share', props.bookmark, shareType)
      break
  }
}

// 暴露方法
defineExpose({
  open,
  close
})
</script>