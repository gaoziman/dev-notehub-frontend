<!-- src/pages/video/VideoManagePage.vue -->
<template>
  <div class="video-manage-container">
    <!-- 顶部区域 -->
    <div class="header-section">
      <div class="header-content">
        <div class="navigation-path">
          <n-breadcrumb separator="/">
            <n-breadcrumb-item @click="router.push('/video')">
              <div class="nav-item">
                <icon-font type="icon-video" :size="14" />
                <span>视频学习</span>
              </div>
            </n-breadcrumb-item>
            <n-breadcrumb-item>
              <div class="nav-item">
                <icon-font type="icon-manage" :size="14" />
                <span>视频管理</span>
              </div>
            </n-breadcrumb-item>
          </n-breadcrumb>
        </div>

        <div class="header-main-content">
          <div class="title-section">
            <h1 class="page-headline">视频管理</h1>
            <p class="subtitle">管理所有视频、课程和章节</p>
          </div>

          <div class="header-actions">
            <n-button class="upload-button" @click="router.push('/video/upload')">
              <template #icon>
                <icon-font type="icon-upload" :size="16" />
              </template>
              上传视频
            </n-button>

            <n-dropdown :options="createOptions" trigger="click" @select="handleDropdownSelect">
              <n-button type="primary" class="create-button">
                <template #icon>
                  <icon-font type="icon-plus" :size="16" />
                </template>
                创建
              </n-button>
            </n-dropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-container">
      <div class="filter-row">
        <div class="filter-group">
          <div class="filter-item">
            <span class="filter-label">分类:</span>
            <n-select
                v-model:value="filterCategory"
                placeholder="选择分类"
                clearable
                size="small"
                class="filter-select"
                :options="categoryOptions"
            />
          </div>

          <div class="filter-item">
            <span class="filter-label">课程:</span>
            <n-select
                v-model:value="filterCourse"
                placeholder="选择课程"
                clearable
                size="small"
                class="filter-select"
                :options="courseOptions"
                :disabled="!filterCategory"
            />
          </div>

          <div class="filter-item">
            <span class="filter-label">类型:</span>
            <n-select
                v-model:value="filterType"
                placeholder="视频类型"
                clearable
                size="small"
                class="filter-select"
                :options="typeOptions"
            />
          </div>

          <div class="filter-item tag-filter">
            <span class="filter-label">标签:</span>
            <n-select
                v-model:value="filterTags"
                placeholder="选择标签"
                clearable
                multiple
                size="small"
                class="filter-select"
                :options="tagOptions"
            />
          </div>
        </div>

        <div class="filter-status">
          <span class="filter-label">状态:</span>
          <n-radio-group v-model:value="filterStatus" size="small">
            <n-radio-button value="all">全部</n-radio-button>
            <n-radio-button value="popular">热门</n-radio-button>
            <n-radio-button value="recent">最近</n-radio-button>
          </n-radio-group>
        </div>

        <div class="filter-actions">
          <n-button size="small" class="reset-btn" @click="resetFilters">
            重置
          </n-button>
          <n-button size="small" type="primary" class="apply-btn" @click="applyFilters">
            应用筛选
          </n-button>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-container">
      <n-spin :show="videoStore.isLoading" class="loading-spinner">
        <div class="video-table-header">
          <div class="table-info">
            <div class="video-count">共 {{ filteredVideos.length }} 个视频</div>
            <n-button quaternary size="small" class="refresh-button" @click="refreshData">
              <template #icon>
                <icon-font type="icon-refresh" :size="14" />
              </template>
              刷新
            </n-button>
          </div>

          <div class="table-actions">
            <n-dropdown trigger="click" :options="sortOptions" @select="handleSort">
              <n-button quaternary size="small" class="sort-button">
                <template #icon>
                  <icon-font type="icon-sort" :size="14" />
                </template>
                {{ currentSortLabel }}
                <icon-font type="icon-chevron-down" :size="14" class="dropdown-icon" />
              </n-button>
            </n-dropdown>

            <n-button quaternary size="small" class="sort-order-button" @click="toggleSortOrder">
              <icon-font :type="sortOrderIcon" :size="14" />
            </n-button>
          </div>
        </div>

        <!-- 批量操作工具栏 -->
        <transition name="fade">
          <div v-if="selectedRowKeys.length > 0" class="batch-action-bar">
            <div class="selection-info">
              已选择 <span class="selection-count">{{ selectedRowKeys.length }}</span> 项
              <n-button text size="small" @click="handleClearSelection">清空</n-button>
            </div>
            <div class="batch-actions">
              <n-button type="error" size="small" @click="handleBatchDelete">
                <template #icon>
                  <icon-font type="icon-delete" :size="14" />
                </template>
                批量删除
              </n-button>
              <n-button type="primary" size="small" @click="handleBatchDownload">
                <template #icon>
                  <icon-font type="icon-download" :size="14" />
                </template>
                批量下载
              </n-button>
            </div>
          </div>
        </transition>

        <!-- 视频表格 -->
        <div class="video-table-wrapper">
          <n-data-table
              ref="dataTable"
              v-if="filteredVideos.length > 0"
              :columns="videoColumns"
              :data="displayVideos"
              :pagination="false"
              :bordered="false"
              :row-key="rowKey"
              :row-props="rowProps"
              :row-class-name="rowClassName"
              @update:checked-row-keys="handleCheckedRowKeysChange"
              striped
              class="video-table"
              :max-height="tableMaxHeight"
          />

          <div v-else class="empty-state">
            <div class="empty-illustration">
              <icon-font type="icon-video-empty" :size="48" />
            </div>
            <p class="empty-desc">暂无视频数据</p>
            <n-button type="primary" size="small" @click="router.push('/video/upload')">
              上传视频
            </n-button>
          </div>

          <!-- 分页 -->
          <div v-if="filteredVideos.length > 0" class="pagination-wrapper">
            <n-pagination
                v-model:page="pagination.page"
                v-model:page-size="pagination.pageSize"
                :page-count="Math.ceil(filteredVideos.length / pagination.pageSize)"
                :page-sizes="pagination.pageSizes"
                :show-size-picker="true"
            />
          </div>
        </div>
      </n-spin>
    </div>

    <!-- 视频详情模态框 -->
    <n-modal v-model:show="showDetailModal" preset="card" class="detail-modal">
      <template #header>
        <div class="modal-header">
          <div class="header-icon">
            <icon-font type="icon-video-detail" :size="20" />
          </div>
          <span class="header-title">视频详情</span>
        </div>
      </template>

      <template #default>
        <div v-if="selectedVideo" class="modal-content">
          <div class="detail-preview">
            <div class="preview-thumbnail">
              <img :src="selectedVideo.coverImage" :alt="selectedVideo.title" />
              <div class="preview-overlay">
                <div class="preview-play-button" @click="router.push(`/video/watch/${selectedVideo.id}`)">
                  <icon-font type="icon-play" :size="32" />
                </div>
              </div>
              <span class="preview-duration">{{ selectedVideo.duration }}</span>
              <span class="preview-type" :class="selectedVideo.type">
                {{ getVideoTypeName(selectedVideo.type) }}
              </span>
            </div>
          </div>

          <div class="detail-header">
            <h2 class="detail-title">{{ selectedVideo.title }}</h2>
            <div class="detail-meta">
              <div class="meta-item">
                <icon-font type="icon-eye" :size="16" class="meta-icon" />
                <span>{{ formatViewCount(selectedVideo.viewCount) }}次观看</span>
              </div>
              <div class="meta-item">
                <icon-font type="icon-calendar" :size="16" class="meta-icon" />
                <span>{{ formatDate(selectedVideo.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-sections">
            <div class="detail-section">
              <div class="section-header">
                <icon-font type="icon-course" :size="16" class="section-icon" />
                <h3 class="section-title">所属课程</h3>
              </div>
              <div class="section-content">
                <n-tag type="primary" size="medium">{{ getCourseNameById(selectedVideo.courseId) }}</n-tag>
              </div>
            </div>

            <div class="detail-section">
              <div class="section-header">
                <icon-font type="icon-chapter" :size="16" class="section-icon" />
                <h3 class="section-title">所属章节</h3>
              </div>
              <div class="section-content">
                <n-tag type="info" size="medium">{{ selectedVideo.chapterName || '未指定章节' }}</n-tag>
              </div>
            </div>

            <div class="detail-section">
              <div class="section-header">
                <icon-font type="icon-tag" :size="16" class="section-icon" />
                <h3 class="section-title">标签</h3>
              </div>
              <div class="section-content">
                <n-space>
                  <n-tag
                      v-for="tag in selectedVideo.tags"
                      :key="tag"
                      size="small"
                      class="detail-tag"
                  >
                    {{ tag }}
                  </n-tag>
                  <n-tag v-if="!selectedVideo.tags.length" class="empty-tag">暂无标签</n-tag>
                </n-space>
              </div>
            </div>

            <div class="detail-section">
              <div class="section-header">
                <icon-font type="icon-description" :size="16" class="section-icon" />
                <h3 class="section-title">描述</h3>
              </div>
              <div class="section-content">
                <p class="description-text">{{ selectedVideo.description || '暂无描述' }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="modal-footer">
          <n-button class="close-button" @click="showDetailModal = false">关闭</n-button>
          <n-button type="primary" class="watch-button" @click="router.push(`/video/watch/${selectedVideo?.id}`)">
            <template #icon>
              <icon-font type="icon-play" :size="16" />
            </template>
            观看视频
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- 批量删除确认对话框 -->
    <n-modal
        v-model:show="showBatchDeleteModal"
        preset="dialog"
        title="批量删除确认"
        content="确定要删除选中的视频吗？此操作不可恢复。"
        positive-text="确认删除"
        negative-text="取消"
        type="error"
        @positive-click="confirmBatchDelete"
        @negative-click="cancelBatchDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { h, ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage, type DataTableColumns } from 'naive-ui';
import { useVideoStore } from '@/stores/video';
import type { DropdownOption } from 'naive-ui';
import type { VideoItem } from '@/types/video';
import IconFont from "@/components/common/IconFont.vue";

const router = useRouter();
const message = useMessage();
const videoStore = useVideoStore();
const dataTable = ref(null);

// 筛选状态
const filterCategory = ref('');
const filterCourse = ref('');
const filterType = ref('');
const filterTags = ref([]);
const filterStatus = ref('all');

// 排序状态
const currentSort = ref('latest');
const sortOrder = ref('desc'); // 'desc' 为降序，'asc' 为升序

// 模态框状态
const showDetailModal = ref(false);
const selectedVideo = ref<VideoItem | null>(null);

// 批量操作状态
const selectedRowKeys = ref<Array<string>>([]);
const showBatchDeleteModal = ref(false);

// 表格高度设置
const tableMaxHeight = ref('');

// 窗口大小调整处理
const handleResize = () => {
  // 动态设置表格高度，让它能够适应屏幕高度
  const windowHeight = window.innerHeight;
  tableMaxHeight.value = `${windowHeight - 350}px`;
};

// 行设置
const rowKey = (row: VideoItem) => row.id;
const rowProps = (row: VideoItem) => {
  return {
    onClick: () => {
      // 点击行时不执行任何操作，以便选择框可以正常工作
    }
  };
};
const rowClassName = (row: VideoItem) => {
  return selectedRowKeys.value.includes(row.id) ? 'row-selected' : '';
};

// 排序图标
const sortOrderIcon = computed(() => {
  return sortOrder.value === 'desc' ? 'icon-arrow-down' : 'icon-arrow-up';
});

// 切换排序顺序
function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
  applyFilters();
}

// 批量选择变更处理
function handleCheckedRowKeysChange(keys: string[]) {
  selectedRowKeys.value = keys;
}

// 清空选择
function handleClearSelection() {
  selectedRowKeys.value = [];
}

// 批量删除处理
function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的视频');
    return;
  }
  showBatchDeleteModal.value = true;
}

// 确认批量删除
function confirmBatchDelete() {
  // 这里应该调用API进行实际的删除操作
  // 这里仅做模拟
  const deletedCount = selectedRowKeys.value.length;
  videoStore.videos = videoStore.videos.filter(video => !selectedRowKeys.value.includes(video.id));
  selectedRowKeys.value = [];
  message.success(`成功删除${deletedCount}个视频`);
  showBatchDeleteModal.value = false;
}

// 取消批量删除
function cancelBatchDelete() {
  showBatchDeleteModal.value = false;
}

// 批量下载
function handleBatchDownload() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要下载的视频');
    return;
  }
  message.info(`开始下载${selectedRowKeys.value.length}个视频`);
  // 这里应该实现实际的下载逻辑
}

// 视频分页设置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  pageSizes: [10, 20, 30, 50],
  onChange: (page: number) => {
    pagination.page = page;
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
  }
});

// 视频表格列定义
const videoColumns = computed<DataTableColumns<VideoItem>>(() => [
  {
    type: 'selection',
    width: 40,
    align: 'center',
    fixed: 'left'
  },
  {
    title: '缩略图',
    key: 'coverImage',
    width: 130,
    align: 'center',
    render(row) {
      return h('div', { class: 'table-thumbnail' }, [
        h('img', {
          src: row.coverImage,
          alt: row.title,
          class: 'thumbnail-img',
          onClick: (e) => {
            e.stopPropagation();
            handleViewVideo(row);
          }
        }),
        h('div', { class: `type-badge ${row.type}` }, getVideoTypeShort(row.type)),
        h('div', { class: 'duration-badge' }, row.duration)
      ]);
    }
  },
  {
    title: '标题',
    key: 'title',
    width: 250,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return h('div', {
        class: 'title-cell',
        onClick: (e) => {
          e.stopPropagation();
          handleViewVideo(row);
        }
      }, [
        h('span', { class: 'video-title' }, row.title),
        h('div', { class: 'tags-container' },
            row.tags.slice(0, 3).map(tag =>
                h('n-tag', { size: 'tiny', class: 'table-tag' }, { default: () => tag })
            )
        )
      ]);
    }
  },
  {
    title: '所属课程',
    key: 'courseId',
    width: 150,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return h('span', {}, getCourseNameById(row.courseId));
    }
  },
  {
    title: '类型',
    key: 'type',
    width: 100,
    align: 'center',
    render(row) {
      return h('n-tag', {
        type: getTagTypeByVideoType(row.type),
        size: 'small'
      }, { default: () => getVideoTypeName(row.type) });
    }
  },
  {
    title: '观看次数',
    key: 'viewCount',
    width: 90,
    align: 'center',
    render(row) {
      return h('div', { class: 'view-count' }, [
        h(IconFont, { type: 'icon-eye', size: 14, class: 'count-icon' }),
        h('span', {}, formatViewCount(row.viewCount))
      ]);
    }
  },
  {
    title: '上传时间',
    key: 'createdAt',
    width: 100,
    align: 'center',
    render(row) {
      return h('span', {}, formatDate(row.createdAt));
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    align: 'center',
    fixed: 'right',
    render(row) {
      return h('div', { class: 'table-actions' }, [
        h(
            'n-button',
            {
              size: 'small',
              type: 'primary',
              secondary: true,
              class: 'action-btn',
              onClick: (e) => {
                e.stopPropagation();
                router.push(`/video/watch/${row.id}`);
              }
            },
            {
              default: () => '播放',
              icon: () => h(IconFont, { type: 'icon-play', size: 14 })
            }
        ),
        h(
            'n-button',
            {
              size: 'small',
              type: 'info',
              secondary: true,
              class: 'action-btn',
              onClick: (e) => {
                e.stopPropagation();
                handleEditVideo(row);
              }
            },
            {
              default: () => '编辑',
              icon: () => h(IconFont, { type: 'icon-edit', size: 14 })
            }
        ),
        h(
            'n-button',
            {
              size: 'small',
              type: 'error',
              secondary: true,
              class: 'action-btn',
              onClick: (e) => {
                e.stopPropagation();
                handleDeleteVideo(row);
              }
            },
            {
              default: () => '删除',
              icon: () => h(IconFont, { type: 'icon-delete', size: 14 })
            }
        )
      ]);
    }
  }
]);

// 下拉菜单选项
const createOptions = [
  {
    label: '创建课程',
    key: 'course',
    icon: () => h(IconFont, { type: 'icon-course', size: 16 })
  },
  {
    label: '创建分类',
    key: 'category',
    icon: () => h(IconFont, { type: 'icon-folder-add', size: 16 })
  },
  {
    label: '创建章节',
    key: 'chapter',
    icon: () => h(IconFont, { type: 'icon-chapter', size: 16 })
  }
];

// 排序选项
const sortOptions = [
  { label: '最新上传', key: 'latest' },
  { label: '最多观看', key: 'views' },
  { label: '标题排序', key: 'title' },
  { label: '时长排序', key: 'duration' }
];

// 视频类型选项
const typeOptions = [
  { label: '上传视频', value: 'upload' },
  { label: 'YouTube视频', value: 'youtube' },
  { label: '哔哩哔哩视频', value: 'bilibili' }
];

// 分类选项
const categoryOptions = computed(() => {
  return videoStore.categories.map(category => ({
    label: category.name,
    value: category.id
  }));
});

// 课程选项
const courseOptions = computed(() => {
  if (!filterCategory.value) return [];

  return videoStore.courses
      .filter(course => course.categoryId === filterCategory.value)
      .map(course => ({
        label: course.name,
        value: course.id
      }));
});

// 标签选项
const tagOptions = computed(() => {
  return videoStore.tags.map(tag => ({
    label: `${tag.name} (${tag.count})`,
    value: tag.name
  }));
});

// 当前排序标签
const currentSortLabel = computed(() => {
  const option = sortOptions.find(opt => opt.key === currentSort.value);
  return option ? option.label : '排序方式';
});

// 根据视频类型获取标签类型
function getTagTypeByVideoType(type: string) {
  if (type === 'youtube') {
    return 'error';
  } else if (type === 'bilibili') {
    return 'info';
  } else {
    return 'success';
  }
}

// 筛选后的视频
const filteredVideos = computed(() => {
  let result = [...videoStore.videos];

  // 应用筛选
  if (filterCategory.value) {
    result = result.filter(video => {
      const course = videoStore.courses.find(c => c.id === video.courseId);
      return course && course.categoryId === filterCategory.value;
    });
  }

  if (filterCourse.value) {
    result = result.filter(video => video.courseId === filterCourse.value);
  }

  if (filterType.value) {
    result = result.filter(video => video.type === filterType.value);
  }

  if (filterTags.value.length > 0) {
    result = result.filter(video =>
        filterTags.value.some(tag => video.tags.includes(tag))
    );
  }

  // 应用排序
  if (currentSort.value === 'latest') {
    result.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder.value === 'desc' ? bTime - aTime : aTime - bTime;
    });
  } else if (currentSort.value === 'views') {
    result.sort((a, b) => {
      return sortOrder.value === 'desc' ? b.viewCount - a.viewCount : a.viewCount - b.viewCount;
    });
  } else if (currentSort.value === 'title') {
    result.sort((a, b) => {
      const compare = a.title.localeCompare(b.title);
      return sortOrder.value === 'desc' ? -compare : compare;
    });
  } else if (currentSort.value === 'duration') {
    result.sort((a, b) => {
      const getDurationInSeconds = (duration: string) => {
        const parts = duration.split(':').map(Number);
        if (parts.length === 3) {
          return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          return parts[0] * 60 + parts[1];
        }
        return 0;
      };
      const aDuration = getDurationInSeconds(a.duration);
      const bDuration = getDurationInSeconds(b.duration);
      return sortOrder.value === 'desc' ? bDuration - aDuration : aDuration - bDuration;
    });
  }

  // 应用状态筛选
  if (filterStatus.value === 'popular') {
    result.sort((a, b) => b.viewCount - a.viewCount);
  } else if (filterStatus.value === 'recent') {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return result;
});

// 显示的视频（分页）
const displayVideos = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return filteredVideos.value.slice(start, end);
});

// 刷新数据
function refreshData() {
  videoStore.fetchVideos();
  videoStore.fetchCourses();
  videoStore.fetchCategories();
  videoStore.fetchTags();
  message.success('数据已刷新');
}

// 视频排序处理
function handleSort(key: string) {
  currentSort.value = key;
  applyFilters();
}

// 下拉菜单选择处理
function handleDropdownSelect(key: string) {
  if (key === 'course') {
    router.push('/video/upload?tab=course');
  } else if (key === 'category') {
    router.push('/video/categories');
  } else if (key === 'chapter') {
    // 这里可以弹出章节创建对话框
    message.info('章节创建功能即将上线');
  }
}

// 重置筛选条件
function resetFilters() {
  filterCategory.value = '';
  filterCourse.value = '';
  filterType.value = '';
  filterTags.value = [];
  filterStatus.value = 'all';
  message.success('筛选条件已重置');
}

// 应用筛选
function applyFilters() {
  // 在实际项目中，这里可能需要重新从服务器获取数据
  message.success('筛选条件已应用');
}

// 查看视频详情
function handleViewVideo(video: VideoItem) {
  selectedVideo.value = video;
  showDetailModal.value = true;
}

// 编辑视频
function handleEditVideo(video: VideoItem) {
  // 在实际项目中，这里应该跳转到编辑页面或打开编辑对话框
  message.info('视频编辑功能即将上线');
}

// 删除视频
function handleDeleteVideo(video: VideoItem) {
  message.warning('确定要删除该视频吗？', {
    closable: true,
    duration: 5000,
    render(props) {
      return h('div', { class: 'delete-confirm' }, [
        h('div', { class: 'confirm-title' }, [
          h(IconFont, { type: 'icon-warning', size: 20, class: 'warning-icon' }),
          '删除确认'
        ]),
        h('div', { class: 'confirm-content' }, [
          h('p', null, `确定要删除视频"${video.title}"吗？`),
          h('p', { class: 'confirm-warning' }, '此操作将无法恢复！')
        ]),
        h('div', { class: 'confirm-footer' }, [
          h(
              'n-button',
              {
                class: 'cancel-btn',
                onClick: () => {
                  props.close();
                }
              },
              { default: () => '取消' }
          ),
          h(
              'n-button',
              {
                type: 'error',
                class: 'confirm-btn',
                onClick: () => {
                  deleteVideo(video.id);
                  props.close();
                }
              },
              { default: () => '确认删除' }
          )
        ])
      ]);
    }
  });
}

// 删除视频
function deleteVideo(id: string) {
  // 在实际项目中这里应该是实际的删除逻辑
  // 这里我们简单地在本地删除
  const index = videoStore.videos.findIndex(v => v.id === id);
  if (index !== -1) {
    videoStore.videos.splice(index, 1);
    message.success('视频删除成功！');
  }
}

// 通过课程ID获取课程名称
function getCourseNameById(id: string) {
  const course = videoStore.courses.find(c => c.id === id);
  return course ? course.name : '未分类课程';
}

// 获取分类名称
function getCategoryName(id: string) {
  const category = videoStore.categories.find(c => c.id === id);
  return category ? category.name : '未分类';
}

// 格式化日期
function formatDate(dateString: string) {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
}

// 格式化观看次数
function formatViewCount(count: number) {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万';
  }
  return count;
}

// 获取视频类型简称
function getVideoTypeShort(type: string) {
  if (type === 'youtube') {
    return 'YT';
  } else if (type === 'bilibili') {
    return 'B站';
  } else {
    return '自制';
  }
}

// 获取视频类型名称
function getVideoTypeName(type: string) {
  if (type === 'youtube') {
    return 'YouTube视频';
  } else if (type === 'bilibili') {
    return '哔哩哔哩视频';
  } else {
    return '上传视频';
  }
}

onMounted(async () => {
  await Promise.all([
    videoStore.fetchCategories(),
    videoStore.fetchCourses(),
    videoStore.fetchVideos(),
    videoStore.fetchTags()
  ]);

  // 设置初始表格高度
  handleResize();
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  // 移除窗口大小变化监听
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* 全局容器 */
.video-manage-container {
  min-height: 100vh;
  width: 100%;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 20px;
  color: #1f2937;
}

/* 顶部区域 */
.header-section {
  background: linear-gradient(135deg, #5a67d8 0%, #4c51bf 100%);
  color: white;
  padding: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.header-content {
  width: 100%;
  max-width: 100%;
  padding: 16px 24px;
}

.navigation-path {
  margin-bottom: 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.header-main-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  flex: 1;
}

.page-headline {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: white;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.upload-button {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.upload-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.create-button {
  background-color: white;
  color: #4c51bf;
  border: none;
  font-weight: 500;
}

/* 筛选区域 */
.filter-container {
  background-color: white;
  padding: 16px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin: 0 8px;
  width: calc(100% - 16px);
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-label {
  font-size: 13px;
  color: #6b7280;
  margin-right: 8px;
  white-space: nowrap;
  font-weight: 500;
}

.filter-select {
  width: 130px;
}

.filter-item.tag-filter .filter-select {
  width: 180px;
}

.filter-status {
  display: flex;
  align-items: center;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.reset-btn {
  color: #6b7280;
  background-color: #f3f4f6;
  border: none;
}

.apply-btn {
  background-color: #4f46e5;
  border: none;
}

/* 内容区域 */
.content-container {
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin: 0 8px;
  flex: 1;
  width: calc(100% - 16px);
}

.loading-spinner {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.video-count {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
}

.refresh-button {
  font-size: 13px;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sort-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dropdown-icon {
  margin-left: 4px;
}

/* 批量操作栏 */
.batch-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9fafb;
  border-radius: 6px;
  padding: 10px 16px;
  margin-bottom: 16px;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4b5563;
}

.selection-count {
  font-weight: 600;
  color: #4f46e5;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

/* 过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 视频表格容器 */
.video-table-wrapper {
  width: 100%;
}

.video-table {
  width: 100%;
}

/* 行选中样式 */
:deep(.row-selected) {
  background-color: rgba(79, 70, 229, 0.05) !important;
}

/* 表格宽度调整 */
:deep(.n-data-table .n-data-table-th) {
  padding: 10px 8px;
}

:deep(.n-data-table .n-data-table-td) {
  padding: 8px;
}

/* 表格缩略图 */
.table-thumbnail {
  position: relative;
  width: 120px;
  height: 68px;
  border-radius: 4px;
  overflow: hidden;
  margin: 0 auto;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.table-thumbnail:hover .thumbnail-img {
  transform: scale(1.05);
}

.type-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: 500;
  z-index: 1;
}

.type-badge.youtube {
  background-color: #ff0000;
  color: white;
}

.type-badge.bilibili {
  background-color: #00a1d6;
  color: white;
}

.type-badge.upload {
  background-color: #10b981;
  color: white;
}

.duration-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 2px;
  z-index: 1;
}

/* 标题单元格 */
.title-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  padding: 4px 0;
}

.video-title {
  font-weight: 500;
  color: #1f2937;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-title:hover {
  color: #4f46e5;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.table-tag {
  height: 18px;
  padding: 0 6px;
  font-size: 10px;
  background-color: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
  border: none;
}

.view-count {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.count-icon {
  color: #9ca3af;
}

/* 操作按钮 */
.table-actions {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.action-btn {
  min-width: auto;
  padding: 0 6px;
  margin: 0 2px;
}

/* 空状态 */
.empty-state {
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: #f9fafb;
  border-radius: 6px;
  border: 1px dashed #e5e7eb;
  margin: 20px 0;
}

.empty-illustration {
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #6b7280;
}

/* 分页样式 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* 详情模态框样式 */
.detail-modal :deep(.n-card-header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  color: #4f46e5;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.modal-content {
  padding: 0;
}

.detail-preview {
  position: relative;
  overflow: hidden;
  margin: -16px -20px 16px;
}

.preview-thumbnail {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  overflow: hidden;
}

.preview-thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.preview-overlay:hover {
  opacity: 1;
}

.preview-play-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4f46e5;
  cursor: pointer;
  transform: scale(0.8);
  transition: all 0.3s ease;
}

.preview-overlay:hover .preview-play-button {
  transform: scale(1);
}

.preview-duration {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.preview-type {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.preview-type.youtube {
  background-color: #ff0000;
  color: #fff;
}

.preview-type.bilibili {
  background-color: #00a1d6;
  color: #fff;
}

.preview-type.upload {
  background-color: #10b981;
  color: #fff;
}

.detail-header {
  margin-bottom: 20px;
}

.detail-title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  color: #1f2937;
}

.detail-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  color: #4f46e5;
}

.section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.section-content {
  font-size: 14px;
  color: #4b5563;
}

.detail-tag {
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  background-color: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
  border: none;
}

.empty-tag {
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  background-color: #f3f4f6;
  color: #9ca3af;
  border: none;
}

.description-text {
  margin: 0;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.close-button, .watch-button {
  min-width: 80px;
}

/* 确认对话框样式 */
.delete-confirm {
  padding: 16px 8px 8px;
}

.confirm-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
}

.warning-icon {
  color: #ef4444;
}

.confirm-content {
  padding: 0 8px;
  margin-bottom: 20px;
}

.confirm-warning {
  color: #ef4444;
  font-size: 13px;
  margin-top: 8px;
}

.confirm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .filter-group {
    width: 100%;
  }

  .filter-status {
    margin-top: 8px;
  }

  .filter-actions {
    margin-left: auto;
    margin-top: 8px;
  }

  .action-btn {
    padding: 0 4px;
  }
}

@media (max-width: 768px) {
  .header-main-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    margin-top: 12px;
    width: 100%;
  }

  .video-table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .table-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .batch-action-bar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .batch-actions {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .content-container,
  .filter-container {
    margin: 0 4px;
    padding: 10px;
    width: calc(100% - 8px);
  }

  .header-content {
    padding: 12px;
  }
}
</style>