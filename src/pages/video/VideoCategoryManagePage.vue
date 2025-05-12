<!-- src/pages/video/VideoCategoryManagePage.vue -->
<template>
  <div class="category-manage-container">
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
                <icon-font type="icon-category" :size="14" />
                <span>分类管理</span>
              </div>
            </n-breadcrumb-item>
          </n-breadcrumb>
        </div>

        <div class="header-main-content">
          <div class="title-section">
            <h1 class="page-headline">视频分类管理</h1>
            <p class="subtitle">管理所有视频分类，组织您的课程体系</p>
          </div>

          <div class="header-actions">
            <n-button class="import-button" @click="handleImportCategory">
              <template #icon>
                <icon-font type="icon-import" :size="16" />
              </template>
              导入分类
            </n-button>

            <n-button type="primary" class="create-button" @click="showCreateCategoryModal = true">
              <template #icon>
                <icon-font type="icon-plus" :size="16" />
              </template>
              新建分类
            </n-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选区域 - 使用 n-form 和 n-form-item 重构 -->
    <n-card class="filter-container" :bordered="false" size="small">
      <n-form inline label-placement="left" label-width="auto" size="small">
        <n-form-item label="状态">
          <n-radio-group v-model:value="filterStatus" size="small">
            <n-radio-button value="all">全部</n-radio-button>
            <n-radio-button value="used">使用中</n-radio-button>
            <n-radio-button value="empty">空分类</n-radio-button>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="分类图标">
          <n-select
              v-model:value="filterIcon"
              placeholder="选择图标分类"
              :options="iconGroupOptions"
              clearable
              size="small"
              style="width: 150px;"
          />
        </n-form-item>

        <n-form-item label="搜索">
          <n-input
              v-model:value="searchKeyword"
              placeholder="搜索分类名称或描述"
              clearable
              size="small"
              style="width: 220px;"
          >
            <template #prefix>
              <icon-font type="icon-search" :size="14" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item class="filter-actions">
          <n-space>
            <n-button size="small" class="reset-btn" @click="resetFilters">
              <template #icon>
                <icon-font type="icon-refresh" :size="14" />
              </template>
              重置
            </n-button>
            <n-button size="small" type="primary" class="apply-btn" @click="applyFilters">
              <template #icon>
                <icon-font type="icon-filter" :size="14" />
              </template>
              应用筛选
            </n-button>
          </n-space>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 内容区域 -->
    <n-card class="content-container" :bordered="false">
      <n-spin :show="videoStore.isLoading" class="loading-spinner">
        <div class="category-table-header">
          <div class="table-info">
            <n-space align="center">
              <div class="category-count">
                <n-tag type="info" size="small">共 {{ filteredCategories.length }} 个分类</n-tag>
              </div>
              <div class="usage-stats">
                <n-tag type="success" size="small" class="stat-item used">{{ usedCount }} 个使用中</n-tag>
                <n-tag type="warning" size="small" class="stat-item empty">{{ emptyCount }} 个空分类</n-tag>
              </div>
              <n-button quaternary size="small" class="refresh-button" @click="refreshData">
                <template #icon>
                  <icon-font type="icon-refresh" :size="14" />
                </template>
                刷新
              </n-button>
            </n-space>
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
          <n-card v-if="selectedRowKeys.length > 0" class="batch-action-bar" size="small">
            <div class="selection-info">
              已选择 <n-tag type="primary" size="small" class="selection-count">{{ selectedRowKeys.length }}</n-tag> 项
              <n-button text size="small" @click="handleClearSelection">清空</n-button>
            </div>
            <div class="batch-actions">
              <n-button type="error" size="small" @click="handleBatchDelete">
                <template #icon>
                  <icon-font type="icon-delete" :size="14" />
                </template>
                批量删除
              </n-button>
              <n-button type="primary" size="small" @click="handleBatchExport">
                <template #icon>
                  <icon-font type="icon-export" :size="14" />
                </template>
                批量导出
              </n-button>
            </div>
          </n-card>
        </transition>

        <!-- 分类表格 -->
        <div class="category-table-wrapper">
          <n-data-table
              ref="dataTable"
              v-if="filteredCategories.length > 0"
              :columns="categoryColumns"
              :data="displayCategories"
              :pagination="false"
              :bordered="false"
              :row-key="rowKey"
              :row-props="rowProps"
              :row-class-name="rowClassName"
              @update:checked-row-keys="handleCheckedRowKeysChange"
              striped
              class="category-table"
              :max-height="tableMaxHeight"
          />

          <n-empty v-else description="暂无分类数据" class="empty-state">
            <template #icon>
              <icon-font type="icon-category-empty" :size="48" />
            </template>
            <template #extra>
              <p class="empty-tip">创建您的第一个分类，开始组织您的课程</p>
              <n-button type="primary" size="small" @click="showCreateCategoryModal = true">
                <template #icon>
                  <icon-font type="icon-plus" :size="14" />
                </template>
                新建分类
              </n-button>
            </template>
          </n-empty>

          <!-- 分页 -->
          <div v-if="filteredCategories.length > 0" class="pagination-wrapper">
            <n-pagination
                v-model:page="pagination.page"
                v-model:page-size="pagination.pageSize"
                :page-count="Math.ceil(filteredCategories.length / pagination.pageSize)"
                :page-sizes="pagination.pageSizes"
                :show-size-picker="true"
            />
          </div>
        </div>
      </n-spin>
    </n-card>

    <!-- 新建分类对话框 - 重新设计 -->
    <n-modal
        v-model:show="showCreateCategoryModal"
        class="redesigned-modal create-modal"
        preset="card"
        :title="false"
        :close-on-esc="true"
        transform-origin="center"
        style="width: 500px; max-width: 90vw;"
    >
      <template #header>
        <div class="modal-custom-header">
          <div class="header-icon-wrapper">
            <icon-font type="icon-folder-add" :size="20" class="header-icon" />
          </div>
          <div class="header-title">新建分类</div>
        </div>
      </template>

      <div class="modal-content">
        <n-form
            :model="categoryForm"
            :rules="categoryRules"
            ref="formRef"
            label-placement="left"
            label-width="90px"
            require-mark-placement="right-hanging"
        >
          <n-form-item label="分类名称" path="name" required>
            <n-input
                v-model:value="categoryForm.name"
                placeholder="请输入分类名称"
                show-count
                :max-length="30"
                autosize
            />
          </n-form-item>

          <n-form-item label="分类图标" path="icon" required>
            <div class="icon-selection">
              <n-select
                  v-model:value="categoryForm.icon"
                  placeholder="请选择图标"
                  :options="iconOptions"
                  filterable
              >
                <template #option="{ option }">
                  <div class="icon-option">
                    <icon-font :type="option.value" :size="20" class="option-icon" />
                    <span class="option-label">{{ option.label }}</span>
                  </div>
                </template>
              </n-select>
              <div v-if="categoryForm.icon" class="icon-preview">
                <icon-font :type="categoryForm.icon" :size="24" />
              </div>
            </div>
          </n-form-item>

          <n-form-item label="分类描述" path="description">
            <n-input
                v-model:value="categoryForm.description"
                type="textarea"
                placeholder="请输入分类描述"
                show-count
                :max-length="200"
                :autosize="{
                  minRows: 3,
                  maxRows: 6
                }"
            />
          </n-form-item>

          <n-form-item label="排序权重" path="sort">
            <n-input-number
                v-model:value="categoryForm.sort"
                placeholder="数字越小排序越靠前"
                :min="0"
                :max="9999"
                class="sort-input"
            />
          </n-form-item>
        </n-form>
      </div>

      <template #footer>
        <div class="modal-footer">
          <n-button quaternary class="cancel-button" @click="showCreateCategoryModal = false">取消</n-button>
          <n-button type="primary" class="confirm-button" :loading="creating" @click="handleCreateCategory">
            <template #icon>
              <icon-font type="icon-check" :size="16" />
            </template>
            确认创建
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- 编辑分类对话框 - 重新设计 -->
    <n-modal
        v-model:show="showEditCategoryModal"
        class="redesigned-modal edit-modal"
        preset="card"
        :title="false"
        :close-on-esc="true"
        transform-origin="center"
        style="width: 500px; max-width: 90vw;"
    >
      <template #header>
        <div class="modal-custom-header">
          <div class="header-icon-wrapper">
            <icon-font type="icon-edit" :size="20" class="header-icon" />
          </div>
          <div class="header-title">编辑分类</div>
        </div>
      </template>

      <div class="modal-content">
        <n-form
            :model="editCategoryForm"
            :rules="categoryRules"
            ref="editFormRef"
            label-placement="left"
            label-width="90px"
            require-mark-placement="right-hanging"
        >
          <n-form-item label="分类名称" path="name" required>
            <n-input
                v-model:value="editCategoryForm.name"
                placeholder="请输入分类名称"
                show-count
                :max-length="30"
            />
          </n-form-item>

          <n-form-item label="分类图标" path="icon" required>
            <div class="icon-selection">
              <n-select
                  v-model:value="editCategoryForm.icon"
                  placeholder="请选择图标"
                  :options="iconOptions"
                  filterable
              >
                <template #option="{ option }">
                  <div class="icon-option">
                    <icon-font :type="option.value" :size="20" class="option-icon" />
                    <span class="option-label">{{ option.label }}</span>
                  </div>
                </template>
              </n-select>
              <div v-if="editCategoryForm.icon" class="icon-preview">
                <icon-font :type="editCategoryForm.icon" :size="24" />
              </div>
            </div>
          </n-form-item>

          <n-form-item label="分类描述" path="description">
            <n-input
                v-model:value="editCategoryForm.description"
                type="textarea"
                placeholder="请输入分类描述"
                show-count
                :max-length="200"
                :autosize="{
                  minRows: 3,
                  maxRows: 6
                }"
            />
          </n-form-item>

          <n-form-item label="排序权重" path="sort">
            <n-input-number
                v-model:value="editCategoryForm.sort"
                placeholder="数字越小排序越靠前"
                :min="0"
                :max="9999"
                class="sort-input"
            />
          </n-form-item>
        </n-form>

        <!-- 使用统计 -->
        <n-divider>使用统计</n-divider>
        <div class="usage-statistics">
          <div class="stats-grid">
            <n-card class="stat-item-card" size="small">
              <template #header>
                <div class="stat-item-header">
                  <icon-font type="icon-course" :size="18" />
                  <span>课程数量</span>
                </div>
              </template>
              <div class="stat-item-value">{{ getCategoryStats(editCategoryForm.id).courseCount }}</div>
            </n-card>

            <n-card class="stat-item-card" size="small">
              <template #header>
                <div class="stat-item-header">
                  <icon-font type="icon-video" :size="18" />
                  <span>视频数量</span>
                </div>
              </template>
              <div class="stat-item-value">{{ getCategoryStats(editCategoryForm.id).videoCount }}</div>
            </n-card>

            <n-card class="stat-item-card" size="small">
              <template #header>
                <div class="stat-item-header">
                  <icon-font type="icon-eye" :size="18" />
                  <span>总观看次数</span>
                </div>
              </template>
              <div class="stat-item-value">{{ formatViewCount(getCategoryStats(editCategoryForm.id).totalViews) }}</div>
            </n-card>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="modal-footer">
          <n-button quaternary class="cancel-button" @click="showEditCategoryModal = false">取消</n-button>
          <n-button type="primary" class="confirm-button" :loading="editing" @click="handleEditCategory">
            <template #icon>
              <icon-font type="icon-save" :size="16" />
            </template>
            保存修改
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- 分类详情模态框 - 重新设计 -->
    <n-modal
        v-model:show="showDetailModal"
        class="redesigned-modal detail-modal"
        preset="card"
        :title="false"
        :close-on-esc="true"
        transform-origin="center"
        style="width: 600px; max-width: 90vw;"
    >
      <template #header>
        <div class="modal-custom-header">
          <div class="header-icon-wrapper">
            <icon-font type="icon-category-detail" :size="20" class="header-icon" />
          </div>
          <div class="header-title">分类详情</div>
        </div>
      </template>

      <div v-if="selectedCategory" class="modal-content">
        <n-card class="detail-hero" :bordered="false">
          <div class="category-info-container">
            <div class="category-icon-container">
              <icon-font :type="selectedCategory.icon" :size="40" />
            </div>
            <div class="category-main-info">
              <h2 class="category-title">{{ selectedCategory.name }}</h2>
              <p class="category-description">{{ selectedCategory.description || '暂无描述' }}</p>
            </div>
          </div>
        </n-card>

        <n-divider>使用统计</n-divider>
        <div class="detail-stats">
          <div class="stats-grid">
            <n-card class="stat-item-card" size="small">
              <template #header>
                <div class="stat-item-header">
                  <icon-font type="icon-course" :size="18" />
                  <span>课程数量</span>
                </div>
              </template>
              <div class="stat-item-value">{{ getCategoryStats(selectedCategory.id).courseCount }}</div>
            </n-card>

            <n-card class="stat-item-card" size="small">
              <template #header>
                <div class="stat-item-header">
                  <icon-font type="icon-video" :size="18" />
                  <span>视频数量</span>
                </div>
              </template>
              <div class="stat-item-value">{{ getCategoryStats(selectedCategory.id).videoCount }}</div>
            </n-card>

            <n-card class="stat-item-card" size="small">
              <template #header>
                <div class="stat-item-header">
                  <icon-font type="icon-eye" :size="18" />
                  <span>总观看次数</span>
                </div>
              </template>
              <div class="stat-item-value">{{ formatViewCount(getCategoryStats(selectedCategory.id).totalViews) }}</div>
            </n-card>
          </div>
        </div>

        <n-divider>关联课程</n-divider>
        <div class="detail-courses">
          <div v-if="getCategoryCoursesForDetail(selectedCategory.id).length > 0" class="courses-list">
            <n-scrollbar style="max-height: 300px">
              <div
                  v-for="course in getCategoryCoursesForDetail(selectedCategory.id)"
                  :key="course.id"
                  class="course-card"
              >
                <n-card size="small" hoverable @click="router.push(`/video/course/${course.id}`)">
                  <div class="course-card-content">
                    <div class="course-card-icon">
                      <icon-font type="icon-course" :size="20" />
                    </div>
                    <div class="course-card-info">
                      <div class="course-card-name">{{ course.name }}</div>
                      <div class="course-card-meta">
                        <n-tag size="small" type="info" class="course-card-count">
                          <template #icon>
                            <icon-font type="icon-video" :size="14" />
                          </template>
                          {{ getCourseFinalStats(course.id).videoCount }} 个视频
                        </n-tag>
                        <n-tag size="small" type="success" class="course-card-views">
                          <template #icon>
                            <icon-font type="icon-eye" :size="14" />
                          </template>
                          {{ formatViewCount(getCourseFinalStats(course.id).totalViews) }} 次观看
                        </n-tag>
                      </div>
                    </div>
                    <div class="course-card-arrow">
                      <icon-font type="icon-arrow-right" :size="16" />
                    </div>
                  </div>
                </n-card>
              </div>
            </n-scrollbar>
          </div>

          <n-empty v-else description="该分类下暂无课程" class="empty-courses">
            <template #icon>
              <icon-font type="icon-empty" :size="32" />
            </template>
          </n-empty>
        </div>
      </div>

      <template #footer>
        <div class="modal-footer">
          <n-button quaternary class="cancel-button" @click="showDetailModal = false">关闭</n-button>
          <n-button type="primary" class="confirm-button" @click="handleQuickEdit(selectedCategory)">
            <template #icon>
              <icon-font type="icon-edit" :size="16" />
            </template>
            编辑分类
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- 删除确认对话框 - 重新设计 -->
    <n-modal
        v-model:show="showDeleteModal"
        class="redesigned-modal delete-modal"
        preset="card"
        :title="false"
        :close-on-esc="true"
        transform-origin="center"
        style="width: 440px; max-width: 90vw;"
    >
      <template #header>
        <div class="modal-custom-header delete-header">
          <div class="header-icon-wrapper delete-icon-wrapper">
            <icon-font type="icon-warning" :size="20" class="header-icon" />
          </div>
          <div class="header-title">删除确认</div>
        </div>
      </template>

      <div class="modal-content">
        <div class="delete-content">
          <div class="delete-message">
            <p>确定要删除分类 <n-tag type="error">{{ categoryToDelete?.name }}</n-tag> 吗？</p>
          </div>
          <n-alert type="warning" class="delete-warning">
            <template #icon>
              <icon-font type="icon-warning" :size="16" class="warning-icon" />
            </template>
            此操作将永久删除该分类，且不可恢复。
          </n-alert>

          <div v-if="hasCategoryWithCourses" class="delete-error">
            <n-alert type="error">
              <template #icon>
                <icon-font type="icon-error" :size="16" class="error-icon" />
              </template>
              该分类下存在 {{ getCategoryStats(categoryToDelete?.id).courseCount }} 个课程，请先移除关联课程再进行删除。
            </n-alert>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="modal-footer">
          <n-button quaternary class="cancel-button" @click="cancelDelete">取消</n-button>
          <n-button type="error" class="confirm-button" :disabled="hasCategoryWithCourses" @click="confirmDelete">
            <template #icon>
              <icon-font type="icon-delete" :size="16" />
            </template>
            确认删除
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- 批量删除确认对话框 - 重新设计 -->
    <n-modal
        v-model:show="showBatchDeleteModal"
        class="redesigned-modal delete-modal"
        preset="card"
        :title="false"
        :close-on-esc="true"
        transform-origin="center"
        style="width: 440px; max-width: 90vw;"
    >
      <template #header>
        <div class="modal-custom-header delete-header">
          <div class="header-icon-wrapper delete-icon-wrapper">
            <icon-font type="icon-warning" :size="20" class="header-icon" />
          </div>
          <div class="header-title">批量删除确认</div>
        </div>
      </template>

      <div class="modal-content">
        <div class="delete-content">
          <div class="delete-message">
            <p>确定要删除选中的 <n-tag type="error">{{ selectedRowKeys.length }}</n-tag> 个分类吗？</p>
          </div>
          <n-alert type="warning" class="delete-warning">
            <template #icon>
              <icon-font type="icon-warning" :size="16" class="warning-icon" />
            </template>
            此操作将永久删除选中的分类，且不可恢复。
          </n-alert>

          <div v-if="hasCategoriesWithCourses" class="delete-error">
            <n-alert type="error">
              <template #icon>
                <icon-font type="icon-error" :size="16" class="error-icon" />
              </template>
              选中的分类中有包含课程的分类，请先移除关联课程再进行删除。
            </n-alert>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="modal-footer">
          <n-button quaternary class="cancel-button" @click="cancelBatchDelete">取消</n-button>
          <n-button type="error" class="confirm-button" :disabled="hasCategoriesWithCourses" @click="confirmBatchDelete">
            <template #icon>
              <icon-font type="icon-delete" :size="16" />
            </template>
            确认删除
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { h, ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage, type DataTableColumns } from 'naive-ui';
import { useVideoStore } from '@/stores/video';
import type { DropdownOption } from 'naive-ui';
import type { VideoCategory } from '@/types/video';
import IconFont from "@/components/common/IconFont.vue";

const router = useRouter();
const message = useMessage();
const videoStore = useVideoStore();
const dataTable = ref(null);

// 筛选状态
const filterStatus = ref('all');
const filterIcon = ref('');
const searchKeyword = ref('');

// 排序状态
const currentSort = ref('name');
const sortOrder = ref('asc'); // 'desc' 为降序，'asc' 为升序

// 模态框状态
const showCreateCategoryModal = ref(false);
const showEditCategoryModal = ref(false);
const showDetailModal = ref(false);
const showDeleteModal = ref(false);
const showBatchDeleteModal = ref(false);
const selectedCategory = ref<VideoCategory | null>(null);
const categoryToDelete = ref<VideoCategory | null>(null);

// 表单状态
const creating = ref(false);
const editing = ref(false);

// 批量操作状态
const selectedRowKeys = ref<Array<string>>([]);

// 表格高度设置
const tableMaxHeight = ref('');

// 分类表单
const categoryForm = ref({
  name: '',
  icon: '',
  description: '',
  sort: 0
});

// 编辑表单
const editCategoryForm = ref({
  id: '',
  name: '',
  icon: '',
  description: '',
  sort: 0
});

// 表单引用
const formRef = ref(null);
const editFormRef = ref(null);

// 表单验证规则
const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 30, message: '分类名称长度应在 2-30 个字符之间', trigger: 'blur' }
  ],
  icon: [
    { required: true, message: '请选择分类图标', trigger: 'change' }
  ],
  description: [
    { max: 200, message: '描述长度不能超过 200 个字符', trigger: 'blur' }
  ]
};

// 分页设置
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

// 图标组选项
const iconGroupOptions = [
  { label: '编程语言', value: 'programming' },
  { label: '技术栈', value: 'technology' },
  { label: '工具/框架', value: 'tools' },
  { label: '行业领域', value: 'industry' },
  { label: '通用图标', value: 'general' }
];

// 图标选项（分组显示）
const iconOptions = [
  // 编程语言组
  { label: 'Java', value: 'icon-java', group: 'programming' },
  { label: 'Python', value: 'icon-python', group: 'programming' },
  { label: 'JavaScript', value: 'icon-javascript', group: 'programming' },
  { label: 'C++', value: 'icon-cpp', group: 'programming' },
  { label: 'Go', value: 'icon-go', group: 'programming' },
  { label: 'Rust', value: 'icon-rust', group: 'programming' },
  // 技术栈组
  { label: 'HTML5', value: 'icon-html', group: 'technology' },
  { label: 'CSS3', value: 'icon-css', group: 'technology' },
  { label: 'Vue.js', value: 'icon-vue', group: 'technology' },
  { label: 'React', value: 'icon-react', group: 'technology' },
  { label: 'Angular', value: 'icon-angular', group: 'technology' },
  { label: 'Node.js', value: 'icon-nodejs', group: 'technology' },
  // 数据库组
  { label: 'MySQL', value: 'icon-mysql', group: 'tools' },
  { label: 'MongoDB', value: 'icon-mongodb', group: 'tools' },
  { label: 'Redis', value: 'icon-redis', group: 'tools' },
  { label: 'PostgreSQL', value: 'icon-postgresql', group: 'tools' },
  // 行业领域组
  { label: '人工智能', value: 'icon-ai', group: 'industry' },
  { label: '区块链', value: 'icon-blockchain', group: 'industry' },
  { label: '物联网', value: 'icon-iot', group: 'industry' },
  { label: '云计算', value: 'icon-cloud', group: 'industry' },
  // 通用图标组
  { label: '前端开发', value: 'icon-frontend', group: 'general' },
  { label: '后端开发', value: 'icon-backend', group: 'general' },
  { label: '移动开发', value: 'icon-mobile', group: 'general' },
  { label: '游戏开发', value: 'icon-game', group: 'general' },
  { label: '数据分析', value: 'icon-analytics', group: 'general' },
  { label: '网络安全', value: 'icon-security', group: 'general' },
  { label: '测试/运维', value: 'icon-devops', group: 'general' },
  { label: '其他', value: 'icon-other', group: 'general' }
];

// 排序选项
const sortOptions = [
  { label: '按名称排序', key: 'name' },
  { label: '按创建时间', key: 'createTime' },
  { label: '按课程数量', key: 'courseCount' },
  { label: '按使用频率', key: 'usageCount' }
];

// 窗口大小调整处理
const handleResize = () => {
  // 动态设置表格高度，让它能够适应屏幕高度
  const windowHeight = window.innerHeight;
  tableMaxHeight.value = `${windowHeight - 380}px`;
};

// 行设置
const rowKey = (row: VideoCategory) => row.id;
const rowProps = (row: VideoCategory) => {
  return {
    onClick: () => {
      // 点击行时不执行任何操作，以便选择框可以正常工作
    }
  };
};
const rowClassName = (row: VideoCategory) => {
  return selectedRowKeys.value.includes(row.id) ? 'row-selected' : '';
};

// 排序图标
const sortOrderIcon = computed(() => {
  return sortOrder.value === 'desc' ? 'icon-arrow-down' : 'icon-arrow-up';
});

// 当前排序标签
const currentSortLabel = computed(() => {
  const option = sortOptions.find(opt => opt.key === currentSort.value);
  return option ? option.label : '排序方式';
});

// 分类表格列定义
const categoryColumns = computed<DataTableColumns<VideoCategory>>(() => [
  {
    type: 'selection',
    width: 40,
    align: 'center',
    fixed: 'left'
  },
  {
    title: '分类名称',
    key: 'name',
    width: 200,
    render(row) {
      return h('div', { class: 'category-name-cell' }, [
        h('div', { class: 'category-icon', style: `color: ${getIconColor(row.icon)}` },
            h(IconFont, { type: row.icon, size: 20 })
        ),
        h('div', { class: 'category-info' }, [
          h('span', {
            class: 'category-title',
            onClick: (e) => {
              e.stopPropagation();
              handleViewCategory(row);
            }
          }, row.name),
          h('div', { class: 'category-sort' }, [
            h('n-tag', { size: 'tiny', type: 'info' }, `权重: ${row.sort || 0}`)
          ])
        ])
      ]);
    }
  },
  {
    title: '描述',
    key: 'description',
    width: 250,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return h('div', { class: 'description-cell' }, [
        h('span', { class: 'description-text' }, row.description || '暂无描述')
      ]);
    }
  },
  {
    title: '使用统计',
    key: 'usage',
    width: 160,
    align: 'center',
    render(row) {
      const stats = getCategoryStats(row.id);
      return h('div', { class: 'usage-stats-cell' }, [
        h('div', { class: 'stat-item' }, [
          h('span', { class: 'stat-label' }, '课程: '),
          h('span', { class: 'stat-value primary' }, stats.courseCount)
        ]),
        h('div', { class: 'stat-item' }, [
          h('span', { class: 'stat-label' }, '视频: '),
          h('span', { class: 'stat-value' }, stats.videoCount)
        ])
      ]);
    }
  },
  {
    title: '总观看次数',
    key: 'viewCount',
    width: 120,
    align: 'center',
    render(row) {
      const stats = getCategoryStats(row.id);
      return h('div', { class: 'view-count-cell' }, [
        h(IconFont, { type: 'icon-eye', size: 14, class: 'view-icon' }),
        h('span', { class: 'view-count' }, formatViewCount(stats.totalViews))
      ]);
    }
  },
  {
    title: '创建时间',
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
    width: 210,
    align: 'center',
    fixed: 'right',
    render(row) {
      return h('div', { class: 'table-actions' }, [
        h(
            'n-button',
            {
              size: 'small',
              type: 'info',
              secondary: true,
              class: 'action-btn',
              onClick: (e) => {
                e.stopPropagation();
                handleViewCategory(row);
              }
            },
            {
              default: () => '查看',
              icon: () => h(IconFont, { type: 'icon-view', size: 14 })
            }
        ),
        h(
            'n-button',
            {
              size: 'small',
              type: 'primary',
              secondary: true,
              class: 'action-btn',
              onClick: (e) => {
                e.stopPropagation();
                handleEditClick(row);
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
                handleDeleteClick(row);
              }
            },
            {
              default: () => '删除',
              icon: () => h(IconFont, { type: 'icon-delete', size: 14 })
            }
        ),
        h(
            'n-button',
            {
              size: 'small',
              type: 'warning',
              secondary: true,
              class: 'action-btn',
              onClick: (e) => {
                e.stopPropagation();
                handleExportClick(row);
              }
            },
            {
              default: () => '导出',
              icon: () => h(IconFont, { type: 'icon-export', size: 14 })
            }
        )
      ]);
    }
  }
]);

// 筛选后的分类
const filteredCategories = computed(() => {
  let result = [...videoStore.categories];

  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(category =>
        category.name.toLowerCase().includes(keyword) ||
        (category.description && category.description.toLowerCase().includes(keyword))
    );
  }

  // 状态筛选
  if (filterStatus.value === 'used') {
    result = result.filter(category => {
      const stats = getCategoryStats(category.id);
      return stats.courseCount > 0;
    });
  } else if (filterStatus.value === 'empty') {
    result = result.filter(category => {
      const stats = getCategoryStats(category.id);
      return stats.courseCount === 0;
    });
  }

  // 图标筛选
  if (filterIcon.value) {
    result = result.filter(category => {
      const iconGroup = iconOptions.find(icon => icon.value === category.icon)?.group;
      return iconGroup === filterIcon.value;
    });
  }

  // 应用排序
  if (currentSort.value === 'name') {
    result.sort((a, b) => {
      const compare = a.name.localeCompare(b.name);
      return sortOrder.value === 'desc' ? -compare : compare;
    });
  } else if (currentSort.value === 'createTime') {
    result.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder.value === 'desc' ? bTime - aTime : aTime - bTime;
    });
  } else if (currentSort.value === 'courseCount') {
    result.sort((a, b) => {
      const aCount = getCategoryStats(a.id).courseCount;
      const bCount = getCategoryStats(b.id).courseCount;
      return sortOrder.value === 'desc' ? bCount - aCount : aCount - bCount;
    });
  } else if (currentSort.value === 'usageCount') {
    result.sort((a, b) => {
      const aUsage = getCategoryStats(a.id).totalViews;
      const bUsage = getCategoryStats(b.id).totalViews;
      return sortOrder.value === 'desc' ? bUsage - aUsage : aUsage - bUsage;
    });
  }

  return result;
});

// 显示的分类（分页）
const displayCategories = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return filteredCategories.value.slice(start, end);
});

// 使用中的分类数量
const usedCount = computed(() => {
  return videoStore.categories.filter(category => {
    const stats = getCategoryStats(category.id);
    return stats.courseCount > 0;
  }).length;
});

// 空分类数量
const emptyCount = computed(() => {
  return videoStore.categories.filter(category => {
    const stats = getCategoryStats(category.id);
    return stats.courseCount === 0;
  }).length;
});

// 检查选中的分类是否包含课程
const hasCategoriesWithCourses = computed(() => {
  return selectedRowKeys.value.some(id => {
    const stats = getCategoryStats(id);
    return stats.courseCount > 0;
  });
});

// 检查要删除的分类是否包含课程
const hasCategoryWithCourses = computed(() => {
  if (!categoryToDelete.value) return false;
  const stats = getCategoryStats(categoryToDelete.value.id);
  return stats.courseCount > 0;
});

// 获取分类统计信息
function getCategoryStats(categoryId: string) {
  if (!categoryId) return { courseCount: 0, videoCount: 0, totalViews: 0 };

  const courses = videoStore.courses.filter(course => course.categoryId === categoryId);
  const courseIds = courses.map(course => course.id);

  // 计算视频数量和总观看次数
  let videoCount = 0;
  let totalViews = 0;

  videoStore.videos.forEach(video => {
    if (courseIds.includes(video.courseId)) {
      videoCount++;
      totalViews += video.viewCount || 0;
    }
  });

  return {
    courseCount: courses.length,
    videoCount,
    totalViews
  };
}

// 获取分类关联的课程（详情页用）
function getCategoryCoursesForDetail(categoryId: string) {
  return videoStore.courses.filter(course => course.categoryId === categoryId);
}

// 获取课程统计信息（详情页用）
function getCourseFinalStats(courseId: string) {
  const videos = videoStore.videos.filter(video => video.courseId === courseId);
  return {
    videoCount: videos.length,
    totalViews: videos.reduce((sum, video) => sum + (video.viewCount || 0), 0)
  };
}

// 获取图标颜色（根据图标类型）
function getIconColor(iconType: string): string {
  const iconInfo = iconOptions.find(icon => icon.value === iconType);
  if (!iconInfo) return '#4f46e5';

  // 根据图标组返回不同颜色
  const colorMap = {
    'programming': '#ef4444', // 红色
    'technology': '#3b82f6',  // 蓝色
    'tools': '#10b981',       // 绿色
    'industry': '#f59e0b',    // 黄色
    'general': '#8b5cf6'      // 紫色
  };

  return colorMap[iconInfo.group] || '#4f46e5';
}

// 搜索处理
function handleSearch() {
  pagination.page = 1;
}

// 切换排序顺序
function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
  applyFilters();
}

// 排序处理
function handleSort(key: string) {
  currentSort.value = key;
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
    message.warning('请先选择要删除的分类');
    return;
  }
  showBatchDeleteModal.value = true;
}

// 确认批量删除
function confirmBatchDelete() {
  if (hasCategoriesWithCourses.value) {
    message.error('选中的分类中包含已关联课程的分类，无法删除');
    return;
  }

  // 执行删除操作
  const deletedCount = selectedRowKeys.value.length;
  videoStore.categories = videoStore.categories.filter(category => !selectedRowKeys.value.includes(category.id));
  selectedRowKeys.value = [];
  message.success(`成功删除${deletedCount}个分类`);
  showBatchDeleteModal.value = false;
}

// 取消批量删除
function cancelBatchDelete() {
  showBatchDeleteModal.value = false;
}

// 批量导出
function handleBatchExport() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要导出的分类');
    return;
  }
  message.info(`开始导出${selectedRowKeys.value.length}个分类配置`);
  // 这里应该实现实际的导出逻辑
}

// 导入分类
function handleImportCategory() {
  message.info('分类导入功能即将上线');
  // 这里应该实现实际的导入逻辑
}

// 刷新数据
function refreshData() {
  Promise.all([
    videoStore.fetchCategories(),
    videoStore.fetchCourses(),
    videoStore.fetchVideos()
  ]);
  message.success('数据已刷新');
}

// 重置筛选条件
function resetFilters() {
  filterStatus.value = 'all';
  filterIcon.value = '';
  searchKeyword.value = '';
  pagination.page = 1;
  message.success('筛选条件已重置');
}

// 应用筛选
function applyFilters() {
  pagination.page = 1;
  message.success('筛选条件已应用');
}

// 查看分类详情
function handleViewCategory(category: VideoCategory) {
  selectedCategory.value = category;
  showDetailModal.value = true;
}

// 导出单个分类
function handleExportClick(row: VideoCategory) {
  message.info(`开始导出分类"${row.name}"的配置`);
  // 这里应该实现实际的导出逻辑
}

// 快速编辑（从详情页跳转到编辑）
function handleQuickEdit(category: VideoCategory) {
  showDetailModal.value = false;
  // 延迟一下再打开编辑对话框，让关闭动画完成
  setTimeout(() => {
    handleEditClick(category);
  }, 200);
}

// 创建分类
async function handleCreateCategory() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    creating.value = true;

    // 检查分类名称是否重复
    const existingCategory = videoStore.categories.find(cat => cat.name === categoryForm.value.name);
    if (existingCategory) {
      message.error('分类名称已存在');
      creating.value = false;
      return;
    }

    // 模拟创建进度
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 创建新分类
    const newCategory = {
      id: Date.now().toString(),
      ...categoryForm.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await videoStore.addCategory(newCategory);

    message.success('分类创建成功！');
    resetCategoryForm();
    showCreateCategoryModal.value = false;

  } catch (err) {
    console.error('表单验证失败', err);
    message.error('请检查表单填写是否完整');
  } finally {
    creating.value = false;
  }
}

// 重置分类表单
function resetCategoryForm() {
  if (formRef.value) {
    formRef.value.restoreValidation();
  }

  categoryForm.value = {
    name: '',
    icon: '',
    description: '',
    sort: 0
  };
}

// 编辑点击
function handleEditClick(row: VideoCategory) {
  editCategoryForm.value = { ...row, sort: row.sort || 0 };
  showEditCategoryModal.value = true;
}

// 保存编辑
async function handleEditCategory() {
  if (!editFormRef.value) return;

  try {
    await editFormRef.value.validate();

    editing.value = true;

    // 检查分类名称是否重复（排除自己）
    const existingCategory = videoStore.categories.find(cat =>
        cat.name === editCategoryForm.value.name && cat.id !== editCategoryForm.value.id
    );
    if (existingCategory) {
      message.error('分类名称已存在');
      editing.value = false;
      return;
    }

    // 模拟编辑进度
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 更新分类
    const index = videoStore.categories.findIndex(c => c.id === editCategoryForm.value.id);
    if (index !== -1) {
      videoStore.categories[index] = {
        ...editCategoryForm.value,
        updatedAt: new Date().toISOString()
      };
    }

    message.success('分类更新成功！');
    showEditCategoryModal.value = false;

  } catch (err) {
    console.error('表单验证失败', err);
    message.error('请检查表单填写是否完整');
  } finally {
    editing.value = false;
  }
}

// 删除点击 - 重新设计
function handleDeleteClick(row: VideoCategory) {
  categoryToDelete.value = row;
  showDeleteModal.value = true;
}

// 确认删除
function confirmDelete() {
  if (!categoryToDelete.value) return;

  if (hasCategoryWithCourses.value) {
    message.error(`该分类下存在课程，无法删除！`);
    return;
  }

  // 执行删除操作
  const index = videoStore.categories.findIndex(c => c.id === categoryToDelete.value?.id);
  if (index !== -1) {
    videoStore.categories.splice(index, 1);
    message.success('分类删除成功！');
  }

  // 关闭弹窗并清空删除对象
  showDeleteModal.value = false;
  categoryToDelete.value = null;
}

// 取消删除
function cancelDelete() {
  showDeleteModal.value = false;
  categoryToDelete.value = null;
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
  return count.toString();
}

onMounted(async () => {
  await Promise.all([
    videoStore.fetchCategories(),
    videoStore.fetchCourses(),
    videoStore.fetchVideos()
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
.category-manage-container {
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

.import-button {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.import-button:hover {
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
  margin: 0 8px;
  width: calc(100% - 16px);
  background-color: white;
}

.filter-actions {
  margin-left: auto;
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
  margin: 0 8px;
  flex: 1;
  width: calc(100% - 16px);
  background-color: white;
}

.loading-spinner {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.category-count {
  font-weight: 500;
}

.usage-stats {
  display: flex;
  gap: 12px;
}

.stat-item.used {
  color: #10b981;
}

.stat-item.empty {
  color: #f59e0b;
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
  margin-bottom: 16px;
  background-color: #f9fafb;
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

/* 分类表格容器 */
.category-table-wrapper {
  width: 100%;
}

.category-table {
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

/* 分类名称单元格 */
.category-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: rgba(240, 240, 240, 0.3);
}

.category-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-title {
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
  line-height: 1.4;
}

.category-title:hover {
  color: #4f46e5;
}

.category-sort {
  display: flex;
  gap: 4px;
}

/* 描述单元格 */
.description-cell {
  padding: 4px 0;
}

.description-text {
  color: #6b7280;
  line-height: 1.4;
}

/* 使用统计单元格 */
.usage-stats-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.stat-label {
  color: #9ca3af;
  margin-right: 2px;
}

.stat-value {
  color: #1f2937;
  font-weight: 500;
}

.stat-value.primary {
  color: #4f46e5;
}

/* 观看次数单元格 */
.view-count-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.view-icon {
  color: #9ca3af;
}

.view-count {
  font-weight: 500;
}

/* 操作按钮 */
.table-actions {
  display: flex;
  justify-content: center;
  gap: 6px;
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
  margin: 20px 0;
}

.empty-tip {
  margin: 8px 0 16px;
  font-size: 13px;
  color: #9ca3af;
}

/* 分页样式 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* ======================== */
/* 重新设计的模态框样式 */
/* ======================== */

/* 通用模态框样式 */
.redesigned-modal {
  --modal-border-radius: 12px;
  --modal-header-height: 60px;
  --modal-primary-color: #4f46e5;
  --modal-background: #fff;
  --modal-content-padding: 24px;
}

/* 自定义模态框标题 */
.modal-custom-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.header-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(79, 70, 229, 0.1);
}

.header-icon {
  color: var(--modal-primary-color);
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

/* 删除确认模态框 */
.delete-header {
  border-bottom-color: #fee2e2;
}

.delete-icon-wrapper {
  background-color: rgba(220, 38, 38, 0.1);
}

.delete-header .header-icon {
  color: #dc2626;
}

.delete-content {
  padding: 16px 0;
}

.delete-message {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 16px;
}

.delete-warning {
  margin-bottom: 16px;
}

.warning-icon {
  color: #f59e0b;
}

.delete-error {
  margin-top: 16px;
}

.error-icon {
  color: #dc2626;
}

/* 详情模态框样式 */
.detail-hero {
  margin-bottom: 16px;
}

.category-info-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.category-icon-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  background-color: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  color: var(--modal-primary-color);
}

.category-main-info {
  flex: 1;
}

.category-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
}

.category-description {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.detail-stats {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item-card {
  transition: all 0.2s;
}

.stat-item-card:hover {
  transform: translateY(-2px);
}

.stat-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
}

.stat-item-value {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  padding: 8px 0;
}

.course-card {
  margin-bottom: 12px;
}

.course-card-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.course-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: rgba(79, 70, 229, 0.05);
  color: var(--modal-primary-color);
}

.course-card-info {
  flex: 1;
  min-width: 0;
}

.course-card-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-card-meta {
  display: flex;
  gap: 8px;
}

.course-card-arrow {
  color: #9ca3af;
}

.empty-courses {
  padding: 32px;
  text-align: center;
}

/* 编辑页面的使用统计 */
.usage-statistics {
  margin-top: 16px;
}

/* 模态框底部 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
}

.cancel-button {
  color: #6b7280;
}

.confirm-button {
  min-width: 120px;
}

/* 其他样式 */
.icon-selection {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background-color: #f3f4f6;
  color: var(--modal-primary-color);
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-icon {
  color: var(--modal-primary-color);
}

.option-label {
  font-size: 14px;
}

.sort-input {
  width: 100%;
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .action-btn {
    padding: 0 4px;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
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

  .category-table-header {
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

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .category-info-container {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .content-container,
  .filter-container {
    margin: 0 4px;
    width: calc(100% - 8px);
  }

  .header-content {
    padding: 12px;
  }

  .action-btn {
    padding: 0 2px;
    min-width: 0;
  }
}
</style>