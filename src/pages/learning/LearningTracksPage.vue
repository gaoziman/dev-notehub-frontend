<template>
  <div class="learning-tracks-page">
    <!-- 页面顶部信息区域 -->
    <div class="header-section">
      <n-card :bordered="false" class="header-card">
        <div class="header-content">
          <div class="header-left">
            <div class="header-icon">
              <icon-font type="icon-xuexi" :size="40" color="var(--primary-color)"/>
            </div>
            <div class="header-info">
              <h1 class="page-title">学习追踪中心</h1>
              <p class="page-subtitle">记录你的学习历程，管理知识成长路径</p>
            </div>
          </div>
          <div class="header-right">
            <n-space align="center">
              <n-button-group>
                <n-button
                    v-for="option in viewOptions"
                    :key="option.value"
                    :type="viewMode === option.value ? 'primary' : 'default'"
                    @click="viewMode = option.value"
                >
                  <template #icon>
                    <icon-font :type="option.icon" :size="16" />
                  </template>
                  {{ option.label }}
                </n-button>
              </n-button-group>
              <n-button type="primary" @click="showCreateModal = true">
                <template #icon>
                  <icon-font type="icon-add" :size="16" />
                </template>
                添加学习内容
              </n-button>
            </n-space>
          </div>
        </div>

        <!-- 学习汇总统计区域 -->
        <div class="statistics-section mt-4">
          <n-grid :cols="4" :x-gap="16">
            <n-gi v-for="(stat, index) in statisticsData" :key="index">
              <n-card :bordered="false" class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon" :class="`stat-icon-${stat.type}`">
                    <icon-font :type="stat.icon" :size="28" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ stat.value }}</div>
                    <div class="stat-label">{{ stat.label }}</div>
                  </div>
                </div>
                <div class="stat-footer">
                  <span :class="`trend-${stat.trend}`">
                    <icon-font :type="stat.trend === 'up' ? 'icon-arrow-up' : 'icon-arrow-down'" :size="12" />
                    {{ stat.change }}
                  </span>
                  <span class="trend-period">{{ stat.period }}</span>
                </div>
              </n-card>
            </n-gi>
          </n-grid>
        </div>
      </n-card>
    </div>

    <!-- 学习进度趋势图 -->
    <n-card v-if="viewMode === 'dashboard'" title="学习趋势分析" class="mt-4 chart-card">
      <div class="chart-tabs-container">
        <n-tabs type="line" animated size="medium" v-model:value="activeChartTab">
          <n-tab-pane name="weekly" tab="每周学习时长">
            <div class="chart-container">
              <LearningTimeChart
                  :chart-data="weeklyLearningData"
                  period="weekly"
                  height="360px"
              />
            </div>
          </n-tab-pane>
          <n-tab-pane name="monthly" tab="月度完成情况">
            <div class="chart-container">
              <LearningTimeChart
                  :chart-data="monthlyLearningData"
                  period="monthly"
                  height="360px"
              />
            </div>
          </n-tab-pane>
          <n-tab-pane name="skills" tab="技能雷达图">
            <div class="chart-container">
              <SkillRadarChart :skills="skillsData" height="360px" />
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
      <template #header-extra>
        <n-select
            v-model:value="timeRange"
            :options="timeRangeOptions"
            size="small"
            style="width: 140px;"
        />
      </template>
    </n-card>

    <!-- 学习记录流 -->
    <n-card v-if="viewMode === 'dashboard'" title="学习动态" class="mt-4 activity-card">
      <n-tabs type="segment" animated>
        <n-tab-pane name="all" tab="所有活动">
          <div class="activity-stream">
            <n-timeline>
              <n-timeline-item
                  v-for="activity in learningActivities"
                  :key="activity.id"
                  :type="activity.type"
                  :title="activity.title"
                  :time="activity.time"
                  :content="activity.description"
                  :color="getActivityColor(activity.type)"
              >
                <template #icon>
                  <icon-font :type="activity.icon" :size="16" />
                </template>
                <div class="activity-content">
                  <n-space vertical>
                    <div class="activity-header">
                      <n-space>
                        <n-tag :type="activity.tagType" size="small" round>{{ activity.tag }}</n-tag>
                        <span class="activity-source">{{ activity.source }}</span>
                      </n-space>
                    </div>
                    <p>{{ activity.description }}</p>
                    <div class="activity-details" v-if="activity.details">
                      <n-collapse-transition :show="activity.expanded">
                        <div class="activity-details-content">
                          <div class="details-card">
                            <div v-html="activity.details"></div>
                          </div>
                        </div>
                      </n-collapse-transition>
                      <n-button text size="small" @click="activity.expanded = !activity.expanded">
                        {{ activity.expanded ? '收起详情' : '查看详情' }}
                      </n-button>
                    </div>
                  </n-space>
                </div>
              </n-timeline-item>
            </n-timeline>
          </div>
        </n-tab-pane>
        <n-tab-pane name="progress" tab="进度更新">
          <n-empty description="暂无数据" />
        </n-tab-pane>
        <n-tab-pane name="notes" tab="学习笔记">
          <n-empty description="暂无数据" />
        </n-tab-pane>
        <n-tab-pane name="certificates" tab="获得证书">
          <n-empty description="暂无数据" />
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- 今日学习计划 -->
    <n-card v-if="viewMode === 'dashboard'" title="今日计划" class="mt-4">
      <div class="daily-plan-container">
        <div class="daily-plan-header">
          <n-statistic>
            <template #prefix>
              <icon-font type="icon-rili" :size="18" />
            </template>
            <template #suffix>
              <span class="today-stats">已完成 {{ todayCompleted }} / {{ todayTotal }}</span>
            </template>
            {{ today }}
          </n-statistic>
          <n-progress
              type="line"
              :percentage="todayProgress"
              :indicator-placement="'inside'"
              :rail-style="{ background: 'var(--primary-color-suppl)' }"
              :color="getTodayProgressColor(todayProgress)"
          />
        </div>

        <div class="daily-tasks">
          <n-list hoverable clickable>
            <n-list-item v-for="task in todayTasks" :key="task.id">
              <div class="task-item">
                <div class="task-check">
                  <n-checkbox
                      :checked="task.completed"
                      @update:checked="toggleTask(task.id)"
                  />
                </div>
                <div class="task-content" :class="{ 'task-completed': task.completed }">
                  <div class="task-title">{{ task.title }}</div>
                  <div class="task-details">
                    <n-space>
                      <n-tag size="small" :type="task.priority">{{ getPriorityLabel(task.priority) }}</n-tag>
                      <span class="task-duration">
                        <icon-font type="icon-shijian" :size="14" />
                        {{ task.duration }}分钟
                      </span>
                      <span class="task-course" v-if="task.courseTitle">
                        <icon-font type="icon-course" :size="14" />
                        {{ task.courseTitle }}
                      </span>
                    </n-space>
                  </div>
                </div>
                <div class="task-actions">
                  <n-space>
                    <n-tooltip>
                      <template #trigger>
                        <n-button size="small" text @click="startLearning(task)">
                          <template #icon>
                            <icon-font type="icon-play" :size="16" />
                          </template>
                        </n-button>
                      </template>
                      开始学习
                    </n-tooltip>
                    <n-tooltip>
                      <template #trigger>
                        <n-button size="small" text @click="editTask(task)">
                          <template #icon>
                            <icon-font type="icon-bianji" :size="16" />
                          </template>
                        </n-button>
                      </template>
                      编辑任务
                    </n-tooltip>
                  </n-space>
                </div>
              </div>
            </n-list-item>
          </n-list>
          <div class="add-task-button">
            <n-button block dashed @click="showAddTaskModal = true">
              <template #icon>
                <icon-font type="icon-add" :size="16" />
              </template>
              添加今日学习任务
            </n-button>
          </div>
        </div>
      </div>
    </n-card>

    <!-- 学习内容看板 -->
    <template v-if="viewMode === 'kanban'">
      <div class="mt-4 kanban-container">
        <n-grid :cols="3" :x-gap="16">
          <n-gi v-for="column in kanbanColumns" :key="column.id">
            <n-card :bordered="false" class="kanban-column">
              <template #header>
                <div class="column-header">
                  <span class="column-title">
                    <icon-font :type="column.icon" :size="18" :color="column.color" />
                    {{ column.title }}
                  </span>
                  <n-badge :value="column.courses.length" :max="99" />
                </div>
              </template>
              <div class="kanban-items-container">
                <div
                    class="kanban-drop-zone"
                    :class="{ 'active-drop-zone': isDropTarget(column.id) }"
                    @dragover.prevent="dragOverColumn(column.id)"
                    @drop.prevent="dropOnColumn(column.id)"
                >
                  <transition-group name="list" tag="div" class="kanban-items">
                    <n-collapse-transition :show="column.courses.length > 0">
                      <div class="kanban-items-list">
                        <LearningCard
                            v-for="course in column.courses"
                            :key="course.id"
                            :course="course"
                            :draggable="true"
                            @update="handleCourseUpdate"
                            @click="showCourseDetails(course)"
                            @drag-start="handleDragStart"
                            @drag-end="handleDragEnd"
                        />
                      </div>
                    </n-collapse-transition>
                  </transition-group>
                  <n-empty
                      v-if="column.courses.length === 0"
                      size="small"
                      description="暂无内容"
                  />
                </div>
                <div class="add-card-button">
                  <n-button
                      dashed
                      block
                      @click="handleAddToColumn(column.id)"
                  >
                    <template #icon>
                      <icon-font type="icon-add" :size="16" />
                    </template>
                    添加学习项目
                  </n-button>
                </div>
              </div>
            </n-card>
          </n-gi>
        </n-grid>
      </div>
    </template>

    <!-- 学习项目列表 -->
    <n-card v-if="viewMode === 'list'" title="学习内容管理" class="mt-4">
      <div class="list-controls">
        <n-space justify="space-between">
          <n-space>
            <n-input
                v-model:value="searchQuery"
                placeholder="搜索学习内容"
                clearable
            >
              <template #prefix>
                <icon-font type="icon-search" :size="16" />
              </template>
            </n-input>
            <n-select
                v-model:value="filterType"
                :options="typeFilterOptions"
                placeholder="内容类型"
                clearable
                style="min-width: 120px"
            />
            <n-select
                v-model:value="filterPriority"
                :options="priorityFilterOptions"
                placeholder="优先级"
                clearable
                style="min-width: 120px"
            />
            <n-select
                v-model:value="filterStatus"
                :options="statusFilterOptions"
                placeholder="状态"
                clearable
                style="min-width: 120px"
            />
          </n-space>
          <n-space>
            <n-button @click="refreshList">
              <template #icon>
                <icon-font type="icon-refresh" :size="16" />
              </template>
              刷新
            </n-button>
            <n-button type="primary" @click="showCreateModal = true">
              <template #icon>
                <icon-font type="icon-add" :size="16" />
              </template>
              添加
            </n-button>
          </n-space>
        </n-space>
      </div>

      <div class="learning-table mt-3">
        <n-data-table
            :columns="courseColumns"
            :data="filteredCourseList"
            :pagination="pagination"
            :bordered="false"
            striped
            :row-key="row => row.id"
            @update:sorter="handleSort"
            @update:filters="handleFilter"
        />
      </div>
    </n-card>

    <!-- 学习日历视图 -->
    <n-card v-if="viewMode === 'calendar'" title="学习日历" class="mt-4">
      <div class="calendar-container">
        <div class="calendar-toolbar">
          <n-space justify="space-between">
            <n-space>
              <n-button-group>
                <n-button @click="prevMonth">
                  <template #icon>
                    <icon-font type="icon-arrow-left" :size="16" />
                  </template>
                </n-button>
                <n-button @click="currentMonth">今天</n-button>
                <n-button @click="nextMonth">
                  <template #icon>
                    <icon-font type="icon-arrow-right" :size="16" />
                  </template>
                </n-button>
              </n-button-group>
              <h3 class="current-month">{{ currentMonthLabel }}</h3>
            </n-space>
            <n-space>
              <n-select
                  v-model:value="calendarView"
                  :options="calendarViewOptions"
                  size="small"
                  style="width: 120px"
              />
            </n-space>
          </n-space>
        </div>

        <n-calendar
            v-model:value="calendarValue"
            #="{ year, month, date, timestamp, today }"
            @update:value="handleCalendarSelect"
        >
          <div
              class="calendar-cell"
              :class="{
              'calendar-cell-today': today,
              'calendar-cell-has-events': hasEvents(year, month, date)
            }"
          >
            <div class="calendar-date">{{ date }}</div>
            <div class="calendar-events">
              <div
                  v-for="event in getCalendarEvents(year, month, date)"
                  :key="event.id"
                  class="calendar-event"
                  :style="{ backgroundColor: event.color + '33', borderLeftColor: event.color }"
                  @click.stop="showEventDetails(event)"
              >
                <div class="event-time">{{ event.timeLabel }}</div>
                <div class="event-title">{{ event.title }}</div>
              </div>
            </div>
          </div>
        </n-calendar>
      </div>
    </n-card>

    <!-- 学习目标跟踪区域 -->
    <n-card v-if="viewMode === 'dashboard'" title="学习目标追踪" class="mt-4 goals-card">
      <div class="goals-container">
        <n-grid :cols="2" :x-gap="16" :y-gap="16">
          <n-gi v-for="goal in learningGoals" :key="goal.id">
            <n-card :bordered="false" class="goal-card" :class="getGoalCardClass(goal)">
              <div class="goal-header">
                <div class="goal-icon">
                  <icon-font :type="goal.icon" :size="28" :color="goal.color" />
                </div>
                <div class="goal-info">
                  <div class="goal-title">{{ goal.title }}</div>
                  <div class="goal-deadline">
                    <icon-font type="icon-deadline" :size="14" />
                    {{ getDeadlineText(goal.dueDate) }}
                  </div>
                </div>
                <div class="goal-status">
                  <n-tag :type="getGoalTagType(goal.progress)">{{ getGoalStatus(goal.progress) }}</n-tag>
                </div>
              </div>
              <div class="goal-progress">
                <n-progress
                    type="line"
                    :percentage="goal.progress"
                    :color="goal.color"
                    :indicator-placement="'inside'"
                    :height="12"
                    :processing="isGoalActive(goal)"
                />
                <div class="goal-metrics">
                  <div class="goal-metric">
                    <div class="metric-label">当前进度</div>
                    <div class="metric-value">{{ goal.progress }}%</div>
                  </div>
                  <div class="goal-metric">
                    <div class="metric-label">剩余时间</div>
                    <div class="metric-value">{{ getDaysRemaining(goal.dueDate) }}</div>
                  </div>
                  <div class="goal-metric">
                    <div class="metric-label">相关课程</div>
                    <div class="metric-value">{{ goal.relatedCourses || 0 }}个</div>
                  </div>
                </div>
              </div>
              <div class="goal-actions">
                <n-space>
                  <n-button size="small" @click="updateGoalProgress(goal.id)">
                    <template #icon>
                      <icon-font type="icon-update" :size="16" />
                    </template>
                    更新进度
                  </n-button>
                  <n-button size="small" @click="viewGoalDetails(goal)">
                    <template #icon>
                      <icon-font type="icon-detail" :size="16" />
                    </template>
                    查看详情
                  </n-button>
                </n-space>
              </div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card :bordered="false" class="add-goal-card">
              <div class="add-goal-content" @click="showGoalModal = true">
                <div class="add-icon">
                  <icon-font type="icon-add" :size="36" />
                </div>
                <div class="add-text">添加新的学习目标</div>
              </div>
            </n-card>
          </n-gi>
        </n-grid>
      </div>
    </n-card>

    <!-- 学习资源库 -->
    <n-card v-if="viewMode === 'dashboard'" title="学习资源库" class="mt-4 resources-card">
      <template #header-extra>
        <n-button text @click="showResourceManager = true">
          <template #icon>
            <icon-font type="icon-manage" :size="16" />
          </template>
          管理资源库
        </n-button>
      </template>
      <div class="resource-tabs">
        <n-tabs type="line" animated>
          <n-tab-pane name="recent" tab="最近使用">
            <div class="resources-grid">
              <n-grid :cols="4" :x-gap="16" :y-gap="16">
                <n-gi v-for="resource in recentResources" :key="resource.id">
                  <ResourceCard :resource="resource" @click="openResource(resource)" />
                </n-gi>
              </n-grid>
              <div class="more-resources" v-if="resourcesCount > recentResources.length">
                <n-button text @click="showAllResources">
                  查看全部 {{ resourcesCount }} 个资源
                  <template #icon>
                    <icon-font type="icon-arrow-right" :size="16" />
                  </template>
                </n-button>
              </div>
            </div>
          </n-tab-pane>
          <n-tab-pane name="favorite" tab="收藏资源">
            <div class="resources-grid">
              <n-grid :cols="4" :x-gap="16" :y-gap="16">
                <n-gi v-for="resource in favoriteResources" :key="resource.id">
                  <ResourceCard :resource="resource" @click="openResource(resource)" />
                </n-gi>
              </n-grid>
            </div>
          </n-tab-pane>
          <n-tab-pane name="bookmarks" tab="书签集">
            <div class="bookmarks-container">
              <n-empty description="正在构建中" />
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </n-card>

    <!-- 技能发展路径 -->
    <n-card v-if="viewMode === 'dashboard'" title="技能发展路径" class="mt-4 skills-card">
      <template #header-extra>
        <n-space>
          <n-select
              v-model:value="selectedSkillPath"
              :options="skillPathOptions"
              placeholder="选择技能路径"
              size="small"
              style="width: 160px"
          />
          <n-button text size="small" @click="editSkillPath">
            <template #icon>
              <icon-font type="icon-edit" :size="16" />
            </template>
            编辑路径
          </n-button>
        </n-space>
      </template>
      <div class="skill-path-container">
        <div class="skill-path-visualization">
          <SkillPathVisualization
              :nodes="currentSkillPath.nodes"
              :links="currentSkillPath.links"
              :current-node="currentSkillPath.currentNode"
              @node-click="selectSkillNode"
          />
        </div>
        <n-card
            v-if="selectedSkillNode"
            :title="selectedSkillNode.name"
            class="skill-node-detail"
            :bordered="false"
            size="small"
        >
          <div class="skill-node-content">
            <div class="skill-node-status">
              <n-progress
                  type="circle"
                  :percentage="selectedSkillNode.progress"
                  :color="selectedSkillNode.color"
                  :indicator-text-color="selectedSkillNode.color"
                  size="small"
              />
            </div>
            <div class="skill-node-info">
              <div class="skill-node-description">{{ selectedSkillNode.description }}</div>
              <div class="skill-node-resources mt-2">
                <div class="resources-title">相关资源:</div>
                <div class="node-resources-list">
                  <n-space vertical size="small">
                    <n-tag
                        v-for="(resource, index) in selectedSkillNode.resources"
                        :key="index"
                        :type="resource.type"
                        size="small"
                    >
                      {{ resource.name }}
                    </n-tag>
                  </n-space>
                </div>
              </div>
            </div>
          </div>
          <template #action>
            <div class="skill-node-actions">
              <n-button size="small" @click="startLearningSkill(selectedSkillNode)">
                开始学习
              </n-button>
              <n-button size="small" @click="updateSkillProgress(selectedSkillNode)">
                更新进度
              </n-button>
            </div>
          </template>
        </n-card>
      </div>
    </n-card>

    <!-- 学习笔记区域 -->
    <n-card v-if="viewMode === 'dashboard'" title="学习笔记" class="mt-4 notes-card">
      <template #header-extra>
        <n-button type="primary" ghost @click="createNewNote">
          <template #icon>
            <icon-font type="icon-create" :size="16" />
          </template>
          新建笔记
        </n-button>
      </template>
      <div class="notes-container">
        <n-tabs type="segment" animated>
          <n-tab-pane name="recent" tab="最近笔记">
            <div class="notes-grid">
              <n-grid :cols="3" :x-gap="16" :y-gap="16">
                <n-gi v-for="note in recentNotes" :key="note.id">
                  <NoteCard :note="note" @click="openNote(note)" />
                </n-gi>
              </n-grid>
            </div>
          </n-tab-pane>
          <n-tab-pane name="all" tab="全部笔记">
            <n-empty description="正在构建中" />
          </n-tab-pane>
        </n-tabs>
      </div>
    </n-card>

    <!-- 创建学习内容弹窗 -->
    <n-modal v-model:show="showCreateModal" preset="card" title="添加学习内容" style="width: 700px;" class="create-modal">
      <n-form ref="createFormRef" :model="createForm" :rules="createRules" label-placement="left" label-width="100px">
        <n-grid :cols="2" :x-gap="24">
          <n-form-item-gi span="2" label="标题" path="title">
            <n-input v-model:value="createForm.title" placeholder="请输入学习内容标题" />
          </n-form-item-gi>

          <n-form-item-gi span="2" label="描述" path="description">
            <n-input
                v-model:value="createForm.description"
                type="textarea"
                placeholder="请输入详细描述"
                :autosize="{ minRows: 3, maxRows: 5 }"
            />
          </n-form-item-gi>

          <n-form-item-gi label="学习类型" path="type">
            <n-select
                v-model:value="createForm.type"
                :options="typeOptions"
                placeholder="请选择学习类型"
            />
          </n-form-item-gi>

          <n-form-item-gi label="优先级" path="priority">
            <n-select
                v-model:value="createForm.priority"
                :options="priorityOptions"
                placeholder="请选择优先级"
            >
              <template #option="{ option }">
                <div class="priority-option">
                  <div class="priority-color" :style="{ backgroundColor: getPriorityColor(option.value) }"></div>
                  {{ option.label }}
                </div>
              </template>
            </n-select>
          </n-form-item-gi>

          <n-form-item-gi label="截止日期" path="dueDate">
            <n-date-picker v-model:value="createForm.dueDate" type="date" clearable />
          </n-form-item-gi>

          <n-form-item-gi label="计划时间" path="estimatedHours">
            <n-input-number
                v-model:value="createForm.estimatedHours"
                :min="0"
                :max="1000"
                placeholder="预计学习时间(小时)"
            />
          </n-form-item-gi>

          <n-form-item-gi label="状态" path="status">
            <n-select
                v-model:value="createForm.status"
                :options="statusOptions"
                placeholder="请选择状态"
            />
          </n-form-item-gi>

          <n-form-item-gi label="关联目标" path="relatedGoal">
            <n-select
                v-model:value="createForm.relatedGoal"
                :options="goalOptions"
                placeholder="请选择关联目标"
                clearable
            />
          </n-form-item-gi>

          <n-form-item-gi span="2" label="标签" path="tags">
            <n-dynamic-tags v-model:value="createForm.tags" />
          </n-form-item-gi>

          <n-form-item-gi span="2" label="相关资源" path="resources">
            <n-dynamic-input
                v-model:value="createForm.resources"
                placeholder="添加学习资源链接"
                :min="0"
                :max="5"
            >
              <template #create-button-default>
                添加资源
              </template>
              <template #action="{ index }">
                <n-popselect
                    v-model:value="createForm.resourceTypes[index]"
                    :options="resourceTypeOptions"
                    trigger="click"
                >
                  <n-button size="small" quaternary circle>
                    <template #icon>
                      <icon-font type="icon-tag" :size="14" />
                    </template>
                  </n-button>
                </n-popselect>
              </template>
            </n-dynamic-input>
          </n-form-item-gi>
        </n-grid>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-space justify="end">
            <n-button @click="showCreateModal = false">取消</n-button>
            <n-button type="primary" @click="createCourse">创建</n-button>
          </n-space>
        </div>
      </template>
    </n-modal>

    <!-- 添加目标弹窗 -->
    <n-modal v-model:show="showGoalModal" preset="card" title="添加学习目标" style="width: 600px;">
      <n-form ref="goalFormRef" :model="goalForm" :rules="goalRules" label-placement="left" label-width="100px">
        <n-form-item label="目标标题" path="title">
          <n-input v-model:value="goalForm.title" placeholder="请输入目标标题" />
        </n-form-item>

        <n-form-item label="描述" path="description">
          <n-input
              v-model:value="goalForm.description"
              type="textarea"
              placeholder="请输入目标描述"
              :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </n-form-item>

        <n-form-item label="截止日期" path="dueDate">
          <n-date-picker v-model:value="goalForm.dueDate" type="date" />
        </n-form-item>

        <n-form-item label="图标" path="icon">
          <n-select v-model:value="goalForm.icon" :options="iconOptions" placeholder="选择图标">
            <template #default="{ option }">
              <div class="flex items-center">
                <icon-font :type="option.value" :size="18" />
                <span class="ml-2">{{ option.label }}</span>
              </div>
            </template>
          </n-select>
        </n-form-item>

        <n-form-item label="颜色" path="color">
          <n-color-picker v-model:value="goalForm.color" :swatches="colorSwatches" />
        </n-form-item>

        <n-form-item label="目标类型" path="type">
          <n-radio-group v-model:value="goalForm.type">
            <n-space>
              <n-radio value="skill">技能目标</n-radio>
              <n-radio value="course">课程目标</n-radio>
              <n-radio value="certification">认证目标</n-radio>
              <n-radio value="project">项目目标</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="提醒" path="reminders">
          <n-switch v-model:value="goalForm.enableReminders" />
          <n-select
              v-if="goalForm.enableReminders"
              v-model:value="goalForm.reminderFrequency"
              :options="reminderOptions"
              placeholder="提醒频率"
              class="mt-2"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-space justify="end">
            <n-button @click="showGoalModal = false">取消</n-button>
            <n-button type="primary" @click="createGoal">创建</n-button>
          </n-space>
        </div>
      </template>
    </n-modal>

    <!-- 添加今日任务弹窗 -->
    <n-modal v-model:show="showAddTaskModal" preset="card" title="添加今日学习任务" style="width: 500px;">
      <n-form ref="taskFormRef" :model="taskForm" :rules="taskRules" label-placement="left" label-width="80px">
        <n-form-item label="任务标题" path="title">
          <n-input v-model:value="taskForm.title" placeholder="请输入任务标题" />
        </n-form-item>

        <n-form-item label="关联课程" path="courseId">
          <n-select
              v-model:value="taskForm.courseId"
              :options="courseOptions"
              placeholder="选择关联课程"
              clearable
          />
        </n-form-item>

        <n-form-item label="预计时长" path="duration">
          <n-input-number
              v-model:value="taskForm.duration"
              :min="5"
              :max="480"
              :step="5"
              placeholder="分钟"
          />
        </n-form-item>

        <n-form-item label="优先级" path="priority">
          <n-radio-group v-model:value="taskForm.priority">
            <n-space>
              <n-radio value="error">高</n-radio>
              <n-radio value="warning">中</n-radio>
              <n-radio value="success">低</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="备注" path="notes">
          <n-input
              v-model:value="taskForm.notes"
              type="textarea"
              placeholder="可选备注信息"
              :autosize="{ minRows: 2, maxRows: 3 }"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-space justify="end">
            <n-button @click="showAddTaskModal = false">取消</n-button>
            <n-button type="primary" @click="addTask">添加</n-button>
          </n-space>
        </div>
      </template>
    </n-modal>

    <!-- 事件详情弹窗 -->
    <n-modal v-model:show="showEventModal" preset="card" :title="selectedEvent?.title || '事件详情'" style="width: 500px;">
      <div class="event-detail" v-if="selectedEvent">
        <div class="event-meta">
          <n-descriptions :column="1" label-placement="left" label-width="80px">
            <n-descriptions-item label="日期">
              <n-space align="center">
                <icon-font type="icon-rili" :size="16" />
                {{ selectedEvent.date }}
              </n-space>
            </n-descriptions-item>
            <n-descriptions-item label="时间" v-if="selectedEvent.timeLabel">
              <n-space align="center">
                <icon-font type="icon-shijian" :size="16" />
                {{ selectedEvent.timeLabel }}
              </n-space>
            </n-descriptions-item>
            <n-descriptions-item label="类型">
              <n-tag :type="selectedEvent.tagType">{{ selectedEvent.typeLabel }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="状态" v-if="selectedEvent.status">
              <n-tag :type="getTagTypeByStatus(selectedEvent.status)">
                {{ getStatusLabel(selectedEvent.status) }}
              </n-tag>
            </n-descriptions-item>
          </n-descriptions>
        </div>

        <n-divider />

        <div class="event-description">
          <div class="description-title">描述</div>
          <div class="description-content">{{ selectedEvent.description || '暂无描述' }}</div>
        </div>

        <n-divider v-if="selectedEvent.relatedResources && selectedEvent.relatedResources.length" />

        <div class="event-resources" v-if="selectedEvent.relatedResources && selectedEvent.relatedResources.length">
          <div class="resources-title">相关资源</div>
          <n-list>
            <n-list-item v-for="(resource, index) in selectedEvent.relatedResources" :key="index">
              <n-thing :title="resource.title">
                <template #description>
                  <div class="resource-type">{{ resource.type }}</div>
                </template>
                <template #avatar>
                  <icon-font :type="getResourceIcon(resource.type)" :size="20" />
                </template>
                <template #footer>
                  <n-button text size="small" @click="openEventResource(resource)">
                    查看资源
                  </n-button>
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-space>
            <n-button @click="showEventModal = false">关闭</n-button>
            <n-button type="primary" v-if="canStartEvent(selectedEvent)" @click="startEvent(selectedEvent)">
              开始学习
            </n-button>
            <n-button v-if="canEditEvent(selectedEvent)" @click="editEvent(selectedEvent)">
              编辑事件
            </n-button>
          </n-space>
        </div>
      </template>
    </n-modal>

    <!-- 课程详情弹窗 -->
    <n-modal v-model:show="showCourseDetailModal" preset="card" :title="selectedCourse?.title || '课程详情'" style="width: 700px;">
      <div class="course-detail" v-if="selectedCourse">
        <div class="course-header">
          <div class="course-type">
            <n-tag :type="getTagTypeByType(selectedCourse.type)">
              {{ getTypeLabel(selectedCourse.type) }}
            </n-tag>
          </div>
          <div class="course-meta">
            <n-space>
              <n-tag :type="getTagTypeByPriority(selectedCourse.priority)">
                {{ getPriorityLabel(selectedCourse.priority) }}优先级
              </n-tag>
              <n-tag :type="getTagTypeByStatus(selectedCourse.status || '')">
                {{ getStatusLabel(selectedCourse.status || '') }}
              </n-tag>
            </n-space>
          </div>
        </div>

        <div class="course-body">
          <n-tabs type="line" animated>
            <n-tab-pane name="info" tab="基本信息">
              <div class="course-description mt-2">
                {{ selectedCourse.description }}
              </div>

              <n-divider />

              <n-descriptions :column="2" label-placement="left">
                <n-descriptions-item label="截止日期">
                  <n-space align="center">
                    <icon-font type="icon-rili" :size="16" />
                    {{ selectedCourse.dueDate || '无截止日期' }}
                  </n-space>
                </n-descriptions-item>
                <n-descriptions-item label="预计学习时间">
                  <n-space align="center">
                    <icon-font type="icon-shijian" :size="16" />
                    {{ selectedCourse.estimatedHours || 0 }}小时
                  </n-space>
                </n-descriptions-item>
                <n-descriptions-item label="已学习时间">
                  <n-space align="center">
                    <icon-font type="icon-shichang" :size="16" />
                    {{ selectedCourse.timeSpent || 0 }}小时
                  </n-space>
                </n-descriptions-item>
                <n-descriptions-item label="进度">
                  <n-progress
                      type="line"
                      :percentage="selectedCourse.progress || 0"
                      :color="getPriorityColor(selectedCourse.priority)"
                      :height="12"
                  />
                </n-descriptions-item>
              </n-descriptions>

              <n-divider />

              <div class="course-tags">
                <div class="section-title">标签</div>
                <div class="tags-list">
                  <n-space>
                    <n-tag
                        v-for="tag in selectedCourse.tags"
                        :key="tag"
                        round
                        size="small"
                    >
                      {{ tag }}
                    </n-tag>
                    <n-button text size="small" v-if="!selectedCourse.tags || selectedCourse.tags.length === 0">
                      添加标签
                    </n-button>
                  </n-space>
                </div>
              </div>

              <n-divider v-if="selectedCourse.resources && selectedCourse.resources.length" />

              <div class="course-resources" v-if="selectedCourse.resources && selectedCourse.resources.length">
                <div class="section-title">相关资源</div>
                <n-list bordered>
                  <n-list-item v-for="(resource, index) in selectedCourse.resources" :key="index">
                    <n-thing>
                      <template #header>
                        <a href="#" @click.prevent="openCourseResource(resource)">{{ resource }}</a>
                      </template>
                      <template #avatar>
                        <icon-font type="icon-link" :size="16" />
                      </template>
                    </n-thing>
                  </n-list-item>
                </n-list>
              </div>
            </n-tab-pane>

            <n-tab-pane name="progress" tab="学习记录">
              <div class="learning-records">
                <div class="section-title">学习历程</div>
                <n-timeline>
                  <n-timeline-item
                      v-for="record in courseRecords"
                      :key="record.id"
                      :type="record.type"
                      :title="record.title"
                      :time="record.time"
                      :content="record.content"
                  >
                    <template #icon>
                      <icon-font :type="record.icon" :size="16" />
                    </template>
                  </n-timeline-item>
                </n-timeline>
                <n-empty v-if="!courseRecords || courseRecords.length === 0" description="暂无学习记录" />
              </div>

              <n-divider />

              <div class="add-record">
                <n-button block @click="addLearningRecord">
                  <template #icon>
                    <icon-font type="icon-add" :size="16" />
                  </template>
                  记录学习进度
                </n-button>
              </div>
            </n-tab-pane>

            <n-tab-pane name="notes" tab="学习笔记">
              <div class="course-notes">
                <div class="notes-list">
                  <n-collapse>
                    <n-collapse-item
                        v-for="note in courseNotes"
                        :key="note.id"
                        :title="note.title"
                        :name="note.id"
                    >
                      <div class="note-meta">
                        <n-space align="center">
                          <icon-font type="icon-shijian" :size="14" />
                          <span>{{ note.createdAt }}</span>
                        </n-space>
                      </div>
                      <div class="note-content" v-html="note.content"></div>
                    </n-collapse-item>
                  </n-collapse>
                  <n-empty v-if="!courseNotes || courseNotes.length === 0" description="暂无笔记" />
                </div>
                <div class="add-note mt-3">
                  <n-button block @click="addCourseNote">
                    <template #icon>
                      <icon-font type="icon-biji" :size="16" />
                    </template>
                    添加笔记
                  </n-button>
                </div>
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-space>
            <n-button @click="showCourseDetailModal = false">关闭</n-button>
            <n-button type="primary" @click="startCourse(selectedCourse)">
              开始学习
            </n-button>
            <n-button @click="editCourse(selectedCourse)">
              编辑课程
            </n-button>
          </n-space>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h } from 'vue'
import { useMessage, useDialog, NTag, NButton, NSpace, NProgress, NIcon } from 'naive-ui'
import IconFont from '@/components/common/IconFont.vue'
import LearningCard from '@/components/learning/LearningCard.vue'
import LearningTimeChart from '@/components/learning/LearningTimeChart.vue'
import SkillRadarChart from '@/components/learning/SkillRadarChart.vue'
import ResourceCard from '@/components/learning/ResourceCard.vue'
import NoteCard from '@/components/learning/NoteCard.vue'
import SkillPathVisualization from '@/components/learning/SkillPathVisualization.vue'

// 使用消息提示和对话框
const message = useMessage()
const dialog = useDialog()

// 页面视图模式
const viewMode = ref('dashboard')
const viewOptions = [
  { label: '看板', value: 'kanban', icon: 'icon-kanban' },
  { label: '列表', value: 'list', icon: 'icon-liebiao' },
  { label: '日历', value: 'calendar', icon: 'icon-rili' },
  { label: '概览', value: 'dashboard', icon: 'icon-dashboard' }
]

// 图表相关
const activeChartTab = ref('weekly')
const timeRange = ref('month')
const timeRangeOptions = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本季度', value: 'quarter' },
  { label: '本年', value: 'year' }
]

// 日历相关
const calendarValue = ref(new Date())
const calendarView = ref('month')
const calendarViewOptions = [
  { label: '月视图', value: 'month' },
  { label: '周视图', value: 'week' },
  { label: '日视图', value: 'day' }
]
const currentMonthLabel = computed(() => {
  const date = calendarValue.value
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
})

// 技能路径
const selectedSkillPath = ref('frontend')
const skillPathOptions = [
  { label: '前端开发路径', value: 'frontend' },
  { label: '后端开发路径', value: 'backend' },
  { label: '全栈开发路径', value: 'fullstack' },
  { label: '数据科学路径', value: 'datascience' }
]
const selectedSkillNode = ref(null)

// 弹窗控制
const showCreateModal = ref(false)
const showGoalModal = ref(false)
const showAddTaskModal = ref(false)
const showEventModal = ref(false)
const showCourseDetailModal = ref(false)
const showResourceManager = ref(false)

// 表单引用
const createFormRef = ref(null)
const goalFormRef = ref(null)
const taskFormRef = ref(null)

// 选中的数据
const selectedEvent = ref(null)
const selectedCourse = ref(null)

// 拖拽相关
const currentDragItem = ref(null)
const dropTarget = ref(null)

// 列表相关
const searchQuery = ref('')
const filterType = ref(null)
const filterPriority = ref(null)
const filterStatus = ref(null)

// 统计数据
const statisticsData = reactive([
  {
    label: '学习项目',
    value: '12',
    icon: 'icon-course',
    type: 'primary',
    trend: 'up',
    change: '25%',
    period: '本月'
  },
  {
    label: '累计学习时间',
    value: '87h',
    icon: 'icon-shijian',
    type: 'success',
    trend: 'up',
    change: '12h',
    period: '本周'
  },
  {
    label: '完成率',
    value: '68%',
    icon: 'icon-wancheng',
    type: 'info',
    trend: 'up',
    change: '5%',
    period: '本月'
  },
  {
    label: '学习连续天数',
    value: '7',
    icon: 'icon-huoyan',
    type: 'error',
    trend: 'up',
    change: '2天',
    period: '本周'
  }
])

// 图表数据
const weeklyLearningData = reactive([
  { day: '周一', hours: 1.5, completed: 2 },
  { day: '周二', hours: 2.3, completed: 1 },
  { day: '周三', hours: 3.2, completed: 3 },
  { day: '周四', hours: 0.8, completed: 0 },
  { day: '周五', hours: 1.7, completed: 1 },
  { day: '周六', hours: 4.1, completed: 2 },
  { day: '周日', hours: 2.8, completed: 1 }
])

const monthlyLearningData = reactive([
  { month: '1月', hours: 32, completed: 8 },
  { month: '2月', hours: 28, completed: 5 },
  { month: '3月', hours: 36, completed: 9 },
  { month: '4月', hours: 42, completed: 11 },
  { month: '5月', hours: 35, completed: 7 }
])

const skillsData = reactive([
  { name: 'Vue', value: 85 },
  { name: 'TypeScript', value: 65 },
  { name: 'CSS', value: 70 },
  { name: '性能优化', value: 55 },
  { name: '组件设计', value: 75 },
  { name: '状态管理', value: 80 },
  { name: '测试', value: 45 },
  { name: '构建工具', value: 60 }
])

// 课程技能路径数据
const skillPaths = reactive({
  frontend: {
    nodes: [
      { id: 1, name: 'HTML/CSS基础', progress: 100, color: 'var(--success-color)', description: '掌握HTML5和CSS3的基础知识', resources: [{ name: 'MDN文档', type: 'info' }, { name: 'CSS教程', type: 'success' }] },
      { id: 2, name: 'JavaScript基础', progress: 90, color: 'var(--success-color)', description: '掌握JavaScript语言基础与DOM操作', resources: [{ name: 'JavaScript指南', type: 'info' }] },
      { id: 3, name: 'Vue基础', progress: 75, color: 'var(--primary-color)', description: '学习Vue.js框架的基本概念和用法', resources: [{ name: 'Vue文档', type: 'primary' }] },
      { id: 4, name: 'Vue组件开发', progress: 60, color: 'var(--primary-color)', description: '深入组件开发与组件通信方式', resources: [{ name: '组件开发实战', type: 'warning' }] },
      { id: 5, name: 'Vue Router', progress: 50, color: 'var(--warning-color)', description: '前端路由与页面导航', resources: [{ name: 'Router文档', type: 'info' }] },
      { id: 6, name: 'Pinia状态管理', progress: 40, color: 'var(--warning-color)', description: '状态管理模式与工具', resources: [{ name: 'Pinia文档', type: 'primary' }] },
      { id: 7, name: 'TypeScript集成', progress: 20, color: 'var(--error-color)', description: '在Vue中使用TypeScript', resources: [{ name: 'TS文档', type: 'error' }] },
      { id: 8, name: '性能优化', progress: 10, color: 'var(--error-color)', description: '前端应用性能优化策略', resources: [{ name: '性能优化指南', type: 'warning' }] },
      { id: 9, name: '高级组件模式', progress: 0, color: 'var(--text-color-disabled)', description: '高级组件设计与模式', resources: [{ name: '高级指南', type: 'info' }] }
    ],
    links: [
      { source: 1, target: 2 },
      { source: 2, target: 3 },
      { source: 3, target: 4 },
      { source: 3, target: 5 },
      { source: 4, target: 6 },
      { source: 6, target: 7 },
      { source: 7, target: 8 },
      { source: 8, target: 9 }
    ],
    currentNode: 6
  },
  backend: {
    nodes: [
      { id: 1, name: 'Java基础', progress: 100, color: 'var(--success-color)', description: 'Java语言基础知识' },
      { id: 2, name: '数据结构', progress: 90, color: 'var(--success-color)', description: '常用数据结构与算法' },
      { id: 3, name: 'Spring框架', progress: 70, color: 'var(--primary-color)', description: 'Spring框架基础' },
      { id: 4, name: 'Spring Boot', progress: 60, color: 'var(--primary-color)', description: 'Spring Boot应用开发' },
      { id: 5, name: '数据库', progress: 75, color: 'var(--primary-color)', description: '关系型数据库与SQL' },
      { id: 6, name: 'MyBatis', progress: 50, color: 'var(--warning-color)', description: 'MyBatis框架' },
      { id: 7, name: 'Spring Cloud', progress: 20, color: 'var(--error-color)', description: '微服务架构与实践' },
      { id: 8, name: 'DevOps', progress: 10, color: 'var(--error-color)', description: '持续集成与部署' }
    ],
    links: [
      { source: 1, target: 2 },
      { source: 2, target: 3 },
      { source: 3, target: 4 },
      { source: 3, target: 5 },
      { source: 4, target: 6 },
      { source: 5, target: 6 },
      { source: 6, target: 7 },
      { source: 7, target: 8 }
    ],
    currentNode: 5
  },
  fullstack: {
    nodes: [
      { id: 1, name: '前端基础', progress: 90, color: 'var(--success-color)', description: 'HTML/CSS/JavaScript基础' },
      { id: 2, name: '后端基础', progress: 80, color: 'var(--success-color)', description: '后端语言与框架基础' },
      { id: 3, name: '数据库', progress: 75, color: 'var(--primary-color)', description: '数据库设计与查询优化' },
      { id: 4, name: 'API设计', progress: 65, color: 'var(--primary-color)', description: 'RESTful API设计与实现' },
      { id: 5, name: '前后端交互', progress: 60, color: 'var(--primary-color)', description: '前后端数据交互与状态管理' },
      { id: 6, name: '认证授权', progress: 40, color: 'var(--warning-color)', description: '用户认证与权限控制' },
      { id: 7, name: '部署运维', progress: 30, color: 'var(--warning-color)', description: '应用部署与运维' }
    ],
    links: [
      { source: 1, target: 3 },
      { source: 2, target: 3 },
      { source: 3, target: 4 },
      { source: 4, target: 5 },
      { source: 5, target: 6 },
      { source: 6, target: 7 }
    ],
    currentNode: 4
  },
  datascience: {
    nodes: [
      { id: 1, name: 'Python基础', progress: 95, color: 'var(--success-color)', description: 'Python编程基础' },
      { id: 2, name: '数据分析', progress: 80, color: 'var(--success-color)', description: '数据处理与分析基础' },
      { id: 3, name: '数据可视化', progress: 70, color: 'var(--primary-color)', description: '数据可视化技术与工具' },
      { id: 4, name: '统计学基础', progress: 60, color: 'var(--primary-color)', description: '应用统计学基础知识' },
      { id: 5, name: '机器学习', progress: 40, color: 'var(--warning-color)', description: '机器学习算法与应用' },
      { id: 6, name: '深度学习', progress: 20, color: 'var(--error-color)', description: '神经网络与深度学习' }
    ],
    links: [
      { source: 1, target: 2 },
      { source: 2, target: 3 },
      { source: 2, target: 4 },
      { source: 3, target: 5 },
      { source: 4, target: 5 },
      { source: 5, target: 6 }
    ],
    currentNode: 3
  }
})

// 计算当前技能路径
const currentSkillPath = computed(() => {
  return skillPaths[selectedSkillPath.value] || skillPaths.frontend
})

// 近期活动数据
const learningActivities = reactive([
  {
    id: 1,
    title: '完成了 Vue3 高级组件设计课程',
    time: '今天 14:30',
    type: 'success',
    icon: 'icon-wancheng',
    tag: '已完成',
    tagType: 'success',
    source: 'Vue3 高级组件设计',
    description: '学习了 3 小时，完成了所有课程内容和练习',
    details: '<p>本课程涵盖了以下内容：</p><ul><li>组件通信高级模式</li><li>自定义Hook设计</li><li>渲染函数与JSX</li><li>高阶组件封装</li><li>性能优化实践</li></ul>',
    expanded: false
  },
  {
    id: 2,
    title: '开始学习 TypeScript 类型体操',
    time: '昨天 10:15',
    type: 'info',
    icon: 'icon-xuexi',
    tag: '进行中',
    tagType: 'info',
    source: 'TypeScript 进阶课程',
    description: '完成了基础类型部分，计划继续学习高级类型',
    details: '<p>今天学习了TypeScript的以下内容：</p><ul><li>基础类型系统</li><li>接口与类型别名</li><li>泛型入门</li><li>类型断言与类型守卫</li></ul><p>下一步计划学习：条件类型、映射类型、类型推断等高级特性。</p>',
    expanded: false
  },
  {
    id: 3,
    title: '添加了新的学习目标',
    time: '2天前 18:45',
    type: 'warning',
    icon: 'icon-mubiao',
    tag: '新目标',
    tagType: 'warning',
    source: '学习规划',
    description: '6月底前掌握微前端架构与实践',
    details: null,
    expanded: false
  },
  {
    id: 4,
    title: '更新了 Java 后端学习进度',
    time: '3天前 09:20',
    type: 'default',
    icon: 'icon-gengxin',
    tag: '更新',
    tagType: 'default',
    source: 'Java 后端开发',
    description: '进度从 35% 更新到 42%，已完成 Spring Boot 部分',
    details: '<p>完成了Spring Boot的以下模块：</p><ul><li>自动配置原理</li><li>Web应用开发</li><li>数据访问集成</li><li>安全控制</li></ul><p>下一步将学习：Spring Boot的高级特性、API设计最佳实践等内容。</p>',
    expanded: false
  },
  {
    id: 5,
    title: '记录了学习笔记',
    time: '4天前 16:10',
    type: 'info',
    icon: 'icon-biji',
    tag: '笔记',
    tagType: 'info',
    source: 'Vue3状态管理',
    description: 'Pinia与Vuex对比与最佳实践',
    details: null,
    expanded: false
  }
])

// 今日学习计划
const today = computed(() => {
  const date = new Date()
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
})

const todayTasks = reactive([
  {
    id: 1,
    title: '学习 Vue3 组合式 API 高级用法',
    priority: 'error',
    duration: 60,
    completed: true,
    courseTitle: 'Vue3 进阶课程'
  },
  {
    id: 2,
    title: '完成 TypeScript 类型体操练习',
    priority: 'warning',
    duration: 45,
    completed: false,
    courseTitle: 'TypeScript 高级特性'
  },
  {
    id: 3,
    title: '阅读微前端架构文章',
    priority: 'success',
    duration: 30,
    completed: false,
    courseTitle: null
  },
  {
    id: 4,
    title: '复习 CSS Grid 布局',
    priority: 'info',
    duration: 25,
    completed: false,
    courseTitle: 'CSS 现代布局'
  }
])

const todayCompleted = computed(() => {
  return todayTasks.filter(task => task.completed).length
})

const todayTotal = computed(() => {
  return todayTasks.length
})

const todayProgress = computed(() => {
  if (todayTotal.value === 0) return 0
  return Math.round((todayCompleted.value / todayTotal.value) * 100)
})

// 看板列数据
const kanbanColumns = reactive([
  {
    id: 'not-started',
    title: '待学习',
    icon: 'icon-daiban',
    color: 'var(--primary-color)',
    courses: [
      {
        id: 1,
        title: 'TypeScript 高级类型体操实战',
        description: '深入学习 TypeScript 类型系统，掌握复杂类型定义',
        priority: 'high',
        type: 'tutorial',
        dueDate: '2025-05-20',
        progress: 0,
        estimatedHours: 15,
        tags: ['typescript', '前端']
      },
      {
        id: 2,
        title: 'Vue3 源码解析与实现',
        description: '分析 Vue3 响应式系统、渲染机制和编译优化',
        priority: 'medium',
        type: 'documentation',
        dueDate: '2025-06-10',
        progress: 0,
        estimatedHours: 20,
        tags: ['vue', '源码']
      }
    ]
  },
  {
    id: 'in-progress',
    title: '进行中',
    icon: 'icon-jinxingzhong',
    color: 'var(--warning-color)',
    courses: [
      {
        id: 3,
        title: 'React 服务端渲染最佳实践',
        description: '学习 React SSR 框架与性能优化策略',
        priority: 'high',
        type: 'project',
        dueDate: '2025-05-15',
        progress: 35,
        estimatedHours: 12,
        tags: ['react', 'ssr']
      },
      {
        id: 4,
        title: '微前端架构与实践',
        description: '研究微前端架构模式、框架对比与落地方案',
        priority: 'medium',
        type: 'video',
        dueDate: '2025-06-30',
        progress: 25,
        estimatedHours: 18,
        tags: ['架构', '微前端']
      },
      {
        id: 5,
        title: 'CSS 现代布局精通',
        description: '深入学习 Grid、Flexbox 和 Container Queries',
        priority: 'low',
        type: 'tutorial',
        dueDate: '2025-05-30',
        progress: 60,
        estimatedHours: 10,
        tags: ['css', '布局']
      }
    ]
  },
  {
    id: 'completed',
    title: '已完成',
    icon: 'icon-wancheng',
    color: 'var(--success-color)',
    courses: [
      {
        id: 6,
        title: 'Vue3 组合式 API 实战',
        description: '掌握 Vue3 组合式 API 开发复杂应用',
        priority: 'high',
        type: 'video',
        dueDate: '2025-05-01',
        progress: 100,
        estimatedHours: 8,
        completedDate: '2025-05-02',
        tags: ['vue', '组合式API']
      },
      {
        id: 7,
        title: 'JavaScript 异步编程深度解析',
        description: '掌握 Promise、async/await 和异步模式',
        priority: 'medium',
        type: 'book',
        dueDate: '2025-04-28',
        progress: 100,
        estimatedHours: 12,
        completedDate: '2025-04-25',
        tags: ['javascript', '异步']
      }
    ]
  }
])

// 学习目标数据
const learningGoals = reactive([
  {
    id: 1,
    title: '成为 Vue3 技术专家',
    description: '深入学习Vue3全家桶，包括组合式API、性能优化等',
    progress: 75,
    dueDate: '2025-07-30',
    icon: 'icon-mubiao',
    color: 'var(--primary-color)',
    relatedCourses: 3
  },
  {
    id: 2,
    title: '掌握微前端架构',
    description: '学习微前端架构理念、实现方案与最佳实践',
    progress: 30,
    dueDate: '2025-06-15',
    icon: 'icon-jiagou',
    color: 'var(--info-color)',
    relatedCourses: 1
  },
  {
    id: 3,
    title: '精通 TypeScript 类型体操',
    description: '深入学习TypeScript的高级类型系统，提升类型编程能力',
    progress: 45,
    dueDate: '2025-05-30',
    icon: 'icon-code',
    color: 'var(--success-color)',
    relatedCourses: 2
  }
])

// 资源库数据
const recentResources = reactive([
  {
    id: 1,
    title: 'Vue3官方文档',
    type: 'documentation',
    icon: 'icon-wendang',
    url: 'https://vuejs.org/guide/introduction.html',
    lastAccessed: '今天',
    favorite: true
  },
  {
    id: 2,
    title: 'TypeScript高级类型编程',
    type: 'tutorial',
    icon: 'icon-jiaocheng',
    url: 'https://example.com/ts-advanced',
    lastAccessed: '2天前',
    favorite: true
  },
  {
    id: 3,
    title: '微前端架构演进与实践',
    type: 'article',
    icon: 'icon-article',
    url: 'https://example.com/micro-frontend',
    lastAccessed: '3天前',
    favorite: false
  },
  {
    id: 4,
    title: 'CSS Grid完全指南',
    type: 'ebook',
    icon: 'icon-book',
    url: 'https://example.com/css-grid-guide',
    lastAccessed: '5天前',
    favorite: false
  }
])

const favoriteResources = computed(() => {
  return recentResources.filter(resource => resource.favorite)
})

const resourcesCount = 15

// 学习笔记数据
const recentNotes = reactive([
  {
    id: 1,
    title: 'Vue3组合式API最佳实践',
    content: '今天学习了Vue3组合式API的高级用法，包括：\n\n1. 提取可复用的组合式函数\n2. 生命周期钩子的优雅使用\n3. 响应式数据的性能优化\n\n特别要注意ref和reactive的使用场景区别...',
    createdAt: '2025-05-05 14:30',
    updatedAt: '2025-05-05 15:45',
    tags: ['vue3', '组合式API', '最佳实践'],
    courseId: 6
  },
  {
    id: 2,
    title: 'TypeScript类型体操笔记',
    content: 'TypeScript高级类型技巧：\n\n- 条件类型（Conditional Types）\n- 映射类型（Mapped Types）\n- 联合分散条件类型\n- infer关键字的使用\n\n示例代码：\n```typescript\ntype Unpacked<T> = T extends (infer U)[] ? U : T;\n```',
    createdAt: '2025-05-03 10:15',
    updatedAt: '2025-05-03 11:20',
    tags: ['typescript', '类型系统', '高级类型'],
    courseId: 1
  },
  {
    id: 3,
    title: '微前端架构研究',
    content: '微前端的几种实现方案对比：\n\n1. 基于路由分发\n2. 使用iframe\n3. Web Components\n4. JavaScript模块化\n5. 构建时集成\n\n各有优缺点，需要根据实际场景选择...',
    createdAt: '2025-05-01 16:45',
    updatedAt: '2025-05-02 09:30',
    tags: ['微前端', '架构', '模块联邦'],
    courseId: 4
  }
])

// 课程记录数据
const courseRecords = reactive([
  {
    id: 1,
    title: '开始学习课程',
    time: '2025-05-01 09:30',
    type: 'info',
    icon: 'icon-start',
    content: '开始学习《Vue3 组合式 API》课程'
  },
  {
    id: 2,
    title: '完成章节',
    time: '2025-05-01 11:45',
    type: 'success',
    icon: 'icon-wancheng',
    content: '完成了《组合式函数封装》章节'
  },
  {
    id: 3,
    title: '记录笔记',
    time: '2025-05-01 14:20',
    type: 'info',
    icon: 'icon-biji',
    content: '添加了学习笔记'
  },
  {
    id: 4,
    title: '完成作业',
    time: '2025-05-02 10:15',
    type: 'warning',
    icon: 'icon-zuoye',
    content: '提交了实战练习：封装自定义Hook'
  },
  {
    id: 5,
    title: '课程完成',
    time: '2025-05-02 16:30',
    type: 'success',
    icon: 'icon-certification',
    content: '完成全部课程内容，获得课程证书'
  }
])

// 课程笔记数据
const courseNotes = reactive([
  {
    id: 1,
    title: '组合式API基础概念',
    createdAt: '2025-05-01 10:30',
    content: '<p>组合式API的核心思想是将相关功能的代码组织在一起，而不是按照选项来组织。</p><p>核心函数：</p><ul><li><strong>ref</strong> - 创建独立的响应式值</li><li><strong>reactive</strong> - 创建响应式对象</li><li><strong>computed</strong> - 创建计算属性</li><li><strong>watch/watchEffect</strong> - 侦听响应式数据变化</li></ul>'
  },
  {
    id: 2,
    title: '生命周期钩子使用',
    createdAt: '2025-05-01 15:15',
    content: '<p>组合式API中的生命周期钩子:</p><ul><li><strong>onMounted</strong> - 组件挂载完成</li><li><strong>onUpdated</strong> - 组件更新完成</li><li><strong>onUnmounted</strong> - 组件卸载完成</li><li><strong>onBeforeMount</strong> - 组件挂载前</li><li><strong>onBeforeUpdate</strong> - 组件更新前</li><li><strong>onBeforeUnmount</strong> - 组件卸载前</li></ul><p>注意：需要在setup中同步调用生命周期钩子。</p>'
  },
  {
    id: 3,
    title: '自定义Hook设计模式',
    createdAt: '2025-05-02 09:45',
    content: '<p>自定义Hook是组合式API的核心优势之一，可以将可复用的逻辑提取到单独的函数中。</p><p>设计原则：</p><ol><li>单一职责，一个Hook只做一件事</li><li>命名以"use"开头</li><li>返回值应当是响应式的</li><li>参数设计应灵活可配置</li></ol><p>示例：</p><pre><code>function useCounter(initialValue = 0) {\n  const count = ref(initialValue);\n  const increment = () => { count.value++ };\n  const decrement = () => { count.value-- };\n  return { count, increment, decrement };\n}</code></pre>'
  }
])

// 创建课程表单
const createForm = reactive({
  title: '',
  description: '',
  type: null,
  priority: 'medium',
  dueDate: null,
  estimatedHours: 0,
  status: 'not-started',
  relatedGoal: null,
  tags: [],
  resources: [],
  resourceTypes: []
})

// 创建目标表单
const goalForm = reactive({
  title: '',
  description: '',
  dueDate: null,
  icon: 'icon-mubiao',
  color: 'var(--primary-color)',
  type: 'skill',
  enableReminders: false,
  reminderFrequency: 'weekly'
})

// 创建任务表单
const taskForm = reactive({
  title: '',
  courseId: null,
  duration: 30,
  priority: 'warning',
  notes: ''
})

// 表单验证规则
const createRules = {
  title: {
    required: true,
    message: '请输入标题',
    trigger: 'blur'
  },
  type: {
    required: true,
    message: '请选择类型',
    trigger: 'change'
  }
}

const goalRules = {
  title: {
    required: true,
    message: '请输入目标标题',
    trigger: 'blur'
  },
  dueDate: {
    required: true,
    message: '请选择截止日期',
    trigger: 'change'
  }
}

const taskRules = {
  title: {
    required: true,
    message: '请输入任务标题',
    trigger: 'blur'
  },
  duration: {
    required: true,
    type: 'number',
    message: '请输入预计时长',
    trigger: 'change'
  }
}

// 表单选项
const typeOptions = [
  { label: '视频课程', value: 'video' },
  { label: '在线教程', value: 'tutorial' },
  { label: '实践项目', value: 'project' },
  { label: '技术书籍', value: 'book' },
  { label: '技术文档', value: 'documentation' },
  { label: '学习笔记', value: 'notes' }
]

const typeFilterOptions = typeOptions.map(option => ({ ...option }))

const priorityOptions = [
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' }
]

const priorityFilterOptions = priorityOptions.map(option => ({ ...option }))

const statusOptions = [
  { label: '未开始', value: 'not-started' },
  { label: '进行中', value: 'in-progress' },
  { label: '已暂停', value: 'paused' },
  { label: '已完成', value: 'completed' }
]

const statusFilterOptions = statusOptions.map(option => ({ ...option }))

const iconOptions = [
  { label: '目标', value: 'icon-mubiao' },
  { label: '学习', value: 'icon-xuexi' },
  { label: '书籍', value: 'icon-book' },
  { label: '视频', value: 'icon-shipin' },
  { label: '编程', value: 'icon-code' },
  { label: '证书', value: 'icon-zhengshu' },
  { label: '架构', value: 'icon-jiagou' },
  { label: '前端', value: 'icon-html' },
  { label: '后端', value: 'icon-server' },
  { label: '数据', value: 'icon-data' }
]

const colorSwatches = [
  'var(--primary-color)',
  'var(--success-color)',
  'var(--warning-color)',
  'var(--error-color)',
  'var(--info-color)'
]

const resourceTypeOptions = [
  { label: '文档', value: 'documentation' },
  { label: '视频', value: 'video' },
  { label: '网站', value: 'website' },
  { label: '书籍', value: 'book' },
  { label: '代码', value: 'code' }
]

const reminderOptions = [
  { label: '每天', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每两周', value: 'biweekly' },
  { label: '每月', value: 'monthly' }
]

// 将看板数据转换为列表视图
const courseList = computed(() => {
  let list = []
  kanbanColumns.forEach(column => {
    column.courses.forEach(course => {
      list.push({
        ...course,
        status: column.id
      })
    })
  })
  return list
})

// 筛选后的课程列表
const filteredCourseList = computed(() => {
  return courseList.value.filter(course => {
    // 搜索筛选
    if (searchQuery.value && !course.title.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false
    }

    // 类型筛选
    if (filterType.value && course.type !== filterType.value) {
      return false
    }

    // 优先级筛选
    if (filterPriority.value && course.priority !== filterPriority.value) {
      return false
    }

    // 状态筛选
    if (filterStatus.value && course.status !== filterStatus.value) {
      return false
    }

    return true
  })
})

// 课程选项
const courseOptions = computed(() => {
  return courseList.value.map(course => ({
    label: course.title,
    value: course.id
  }))
})

// 目标选项
const goalOptions = computed(() => {
  return learningGoals.map(goal => ({
    label: goal.title,
    value: goal.id
  }))
})

// 列表视图的列定义
const courseColumns = [
  {
    title: '标题',
    key: 'title',
    sorter: 'default',
    render(row) {
      return h('div', { class: 'flex items-center gap-2' }, [
        h(IconFont, { type: getIconByType(row.type), size: 20 }),
        h('span', null, row.title)
      ])
    }
  },
  {
    title: '类型',
    key: 'type',
    width: 100,
    filters: typeOptions.map(option => ({
      label: option.label,
      value: option.value
    })),
    filterOptionValue: null,
    render(row) {
      return h(NTag, { type: getTagTypeByType(row.type) }, { default: () => getTypeLabel(row.type) })
    }
  },
  {
    title: '优先级',
    key: 'priority',
    width: 90,
    sorter: (a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    },
    render(row) {
      return h(NTag, { type: getTagTypeByPriority(row.priority) }, { default: () => getPriorityLabel(row.priority) })
    }
  },
  {
    title: '进度',
    key: 'progress',
    width: 160,
    sorter: (a, b) => a.progress - b.progress,
    render(row) {
      return h(NProgress, { type: 'line', percentage: row.progress, color: getPriorityColor(row.priority) })
    }
  },
  {
    title: '截止日期',
    key: 'dueDate',
    width: 110,
    sorter: (a, b) => new Date(a.dueDate || '2099-12-31') - new Date(b.dueDate || '2099-12-31'),
    render(row) {
      if (!row.dueDate) return h('span', { class: 'text-tertiary' }, '无截止日期')
      const daysLeft = getDaysUntil(row.dueDate)
      let dueText = row.dueDate
      let className = ''

      if (daysLeft < 0) {
        dueText = `已逾期${Math.abs(daysLeft)}天`
        className = 'text-error'
      } else if (daysLeft === 0) {
        dueText = '今日截止'
        className = 'text-warning'
      } else if (daysLeft <= 3) {
        dueText = `${daysLeft}天后`
        className = 'text-warning'
      }

      return h('span', { class: className }, dueText)
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    filters: statusOptions.map(option => ({
      label: option.label,
      value: option.value
    })),
    filterOptionValue: null,
    render(row) {
      return h(NTag, { type: getTagTypeByStatus(row.status) }, { default: () => getStatusLabel(row.status) })
    }
  },
  {
    title: '预计时间',
    key: 'estimatedHours',
    width: 90,
    render(row) {
      return h('div', { class: 'flex items-center' }, [
        h(IconFont, { type: 'icon-shijian', size: 14, class: 'mr-1' }),
        h('span', null, `${row.estimatedHours || 0}小时`)
      ])
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render(row) {
      return h(NSpace, { align: 'center' }, {
        default: () => [
          h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                ghost: true,
                onClick: () => showCourseDetails(row)
              },
              { default: () => '详情' }
          ),
          h(
              NButton,
              {
                size: 'small',
                type: 'info',
                ghost: true,
                onClick: () => updateCourseProgress(row)
              },
              { default: () => '进度' }
          ),
          h(
              NButton,
              {
                size: 'small',
                type: 'error',
                ghost: true,
                onClick: () => deleteCourse(row)
              },
              { default: () => '删除' }
          )
        ]
      })
    }
  }
]

// 列表分页设置
const pagination = {
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page) => {
    console.log(page)
  },
  onUpdatePageSize: (pageSize) => {
    pagination.pageSize = pageSize
  }
}

// 日历事件处理
const getCalendarEvents = (year, month, date) => {
  // 模拟日历事件数据
  const dateString = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`

  // 检查是否有计划在这一天的课程
  let events = []

  kanbanColumns.forEach(column => {
    column.courses.forEach(course => {
      if (course.dueDate === dateString) {
        events.push({
          id: course.id,
          title: course.title,
          color: getPriorityColor(course.priority),
          date: dateString,
          timeLabel: '全天',
          typeLabel: getTypeLabel(course.type),
          tagType: getTagTypeByPriority(course.priority),
          description: course.description,
          status: getStatusFromColumn(column.id),
          relatedResources: course.resources ? course.resources.map((resource, index) => ({
            id: `${course.id}-resource-${index}`,
            title: resource,
            type: '学习资源'
          })) : []
        })
      }
    })
  })

  return events
}

const hasEvents = (year, month, date) => {
  const events = getCalendarEvents(year, month, date)
  return events.length > 0
}

// 拖拽处理函数
const isDropTarget = (columnId) => {
  return dropTarget.value === columnId
}

const dragOverColumn = (columnId) => {
  dropTarget.value = columnId
}

const handleDragStart = (course) => {
  currentDragItem.value = course
}

const handleDragEnd = () => {
  currentDragItem.value = null
  dropTarget.value = null
}

const dropOnColumn = (columnId) => {
  if (!currentDragItem.value) return

  // 查找当前拖拽项所在的列
  let sourceColumnId = null
  let sourceIndex = -1

  kanbanColumns.forEach(column => {
    const index = column.courses.findIndex(c => c.id === currentDragItem.value.id)
    if (index !== -1) {
      sourceColumnId = column.id
      sourceIndex = index
    }
  })

  if (sourceColumnId === columnId || sourceIndex === -1) {
    dropTarget.value = null
    return
  }

  // 找到源列和目标列
  const sourceColumn = kanbanColumns.find(col => col.id === sourceColumnId)
  const targetColumn = kanbanColumns.find(col => col.id === columnId)

  if (!sourceColumn || !targetColumn) {
    dropTarget.value = null
    return
  }

  // 从源列中移除
  const [course] = sourceColumn.courses.splice(sourceIndex, 1)

  // 更新课程状态
  course.status = columnId

  // 如果移动到已完成列，设置进度为100%
  if (columnId === 'completed' && course.progress < 100) {
    course.progress = 100
    course.completedDate = new Date().toISOString().split('T')[0]
  }

  // 添加到目标列
  targetColumn.courses.unshift(course)

  message.success(`已将"${course.title}"移动到"${targetColumn.title}"`)

  dropTarget.value = null
}

// 日历导航方法
const prevMonth = () => {
  const date = new Date(calendarValue.value)
  date.setMonth(date.getMonth() - 1)
  calendarValue.value = date
}

const nextMonth = () => {
  const date = new Date(calendarValue.value)
  date.setMonth(date.getMonth() + 1)
  calendarValue.value = date
}

const currentMonth = () => {
  calendarValue.value = new Date()
}

// 辅助函数
const getStatusFromColumn = (columnId) => {
  return columnId
}

const getIconByType = (type) => {
  switch (type) {
    case 'video': return 'icon-shipin'
    case 'tutorial': return 'icon-jiaocheng'
    case 'project': return 'icon-xiangmu'
    case 'book': return 'icon-book'
    case 'documentation': return 'icon-wendang'
    case 'notes': return 'icon-biji'
    default: return 'icon-xuexi'
  }
}

const getTypeLabel = (type) => {
  return typeOptions.find(option => option.value === type)?.label || '未知'
}

const getPriorityLabel = (priority) => {
  return priorityOptions.find(option => option.value === priority)?.label || '未知'
}

const getStatusLabel = (status) => {
  return statusOptions.find(option => option.value === status)?.label || '未知'
}

const getTagTypeByPriority = (priority) => {
  switch (priority) {
    case 'high': return 'error'
    case 'medium': return 'warning'
    case 'low': return 'success'
    default: return 'default'
  }
}

const getTagTypeByStatus = (status) => {
  switch (status) {
    case 'not-started': return 'default'
    case 'in-progress': return 'info'
    case 'paused': return 'warning'
    case 'completed': return 'success'
    default: return 'default'
  }
}

const getTagTypeByType = (type) => {
  switch (type) {
    case 'video': return 'info'
    case 'tutorial': return 'success'
    case 'project': return 'warning'
    case 'book': return 'error'
    case 'documentation': return 'primary'
    case 'notes': return 'default'
    default: return 'default'
  }
}

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'var(--error-color)'
    case 'medium': return 'var(--warning-color)'
    case 'low': return 'var(--success-color)'
    default: return 'var(--primary-color)'
  }
}

const getGoalTagType = (progress) => {
  if (progress >= 100) return 'success'
  if (progress >= 50) return 'info'
  if (progress >= 25) return 'warning'
  return 'default'
}

const getGoalStatus = (progress) => {
  if (progress >= 100) return '已完成'
  if (progress >= 75) return '即将完成'
  if (progress >= 50) return '进行中'
  if (progress >= 25) return '刚开始'
  return '规划中'
}

const getActivityColor = (type) => {
  switch (type) {
    case 'success': return 'var(--success-color)'
    case 'info': return 'var(--info-color)'
    case 'warning': return 'var(--warning-color)'
    case 'error': return 'var(--error-color)'
    default: return 'var(--primary-color)'
  }
}

const getDaysUntil = (dateString) => {
  if (!dateString) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = new Date(dateString)
  targetDate.setHours(0, 0, 0, 0)

  const diffTime = targetDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

const getDeadlineText = (dateString) => {
  const daysLeft = getDaysUntil(dateString)

  if (!daysLeft) return '无截止日期'
  if (daysLeft < 0) return `已逾期 ${Math.abs(daysLeft)} 天`
  if (daysLeft === 0) return '今日截止'
  if (daysLeft === 1) return '明日截止'
  if (daysLeft < 7) return `${daysLeft} 天后截止`
  if (daysLeft < 30) return `${Math.floor(daysLeft / 7)} 周后截止`
  return dateString
}

const getDaysRemaining = (dateString) => {
  const daysLeft = getDaysUntil(dateString)

  if (!daysLeft) return '无截止日期'
  if (daysLeft < 0) return `已逾期 ${Math.abs(daysLeft)} 天`
  if (daysLeft === 0) return '今日截止'
  if (daysLeft === 1) return '剩余 1 天'
  if (daysLeft < 30) return `剩余 ${daysLeft} 天`

  const months = Math.floor(daysLeft / 30)
  const remainingDays = daysLeft % 30

  if (remainingDays === 0) return `剩余 ${months} 个月`
  return `剩余 ${months} 个月 ${remainingDays} 天`
}

const getGoalCardClass = (goal) => {
  if (goal.progress >= 100) return 'goal-completed'

  const daysLeft = getDaysUntil(goal.dueDate)

  if (daysLeft !== null && daysLeft < 0) return 'goal-overdue'
  if (daysLeft !== null && daysLeft <= 7) return 'goal-urgent'

  return ''
}

const isGoalActive = (goal) => {
  return goal.progress > 0 && goal.progress < 100
}

const getResourceIcon = (type) => {
  switch (type) {
    case 'documentation': return 'icon-wendang'
    case 'video': return 'icon-shipin'
    case 'website': return 'icon-lianjie'
    case 'book': return 'icon-book'
    case 'code': return 'icon-code'
    default: return 'icon-attachment'
  }
}

const canStartEvent = (event) => {
  if (!event) return false
  return event.status !== 'completed'
}

const canEditEvent = (event) => {
  if (!event) return false
  return true
}

const getTodayProgressColor = (progress) => {
  if (progress >= 75) return 'var(--success-color)'
  if (progress >= 50) return 'var(--primary-color)'
  if (progress >= 25) return 'var(--warning-color)'
  return 'var(--error-color)'
}

// 事件处理函数
const handleCourseUpdate = (course) => {
  // 查找并更新课程
  for (const column of kanbanColumns) {
    const index = column.courses.findIndex(c => c.id === course.id)
    if (index !== -1) {
      column.courses[index] = { ...column.courses[index], ...course }

      // 如果进度达到100%，移动到完成列
      if (course.progress === 100 && column.id !== 'completed') {
        const completedColumn = kanbanColumns.find(col => col.id === 'completed')
        if (completedColumn) {
          column.courses.splice(index, 1)
          completedColumn.courses.unshift(course)

          message.success(`课程 "${course.title}" 已完成并移动到已完成列！`)
        }
      }

      break
    }
  }
}

const handleCalendarSelect = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const events = getCalendarEvents(year, month, day)

  if (events.length > 0) {
    message.info(`${events.length} 个学习计划在 ${year}年${month}月${day}日`)
  }
}

const handleSort = (sorter) => {
  console.log('Sort changed:', sorter)
}

const handleFilter = (filters) => {
  console.log('Filters changed:', filters)
}

const refreshList = () => {
  message.success('数据已刷新')
}

const createCourse = () => {
  createFormRef.value?.validate((errors) => {
    if (!errors) {
      // 模拟添加课程
      const newCourse = {
        id: Date.now(),
        title: createForm.title,
        description: createForm.description,
        type: createForm.type,
        priority: createForm.priority,
        dueDate: createForm.dueDate,
        estimatedHours: createForm.estimatedHours,
        progress: 0,
        tags: createForm.tags,
        resources: createForm.resources
      }

      // 添加到看板的待学习列
      const notStartedColumn = kanbanColumns.find(col => col.id === 'not-started')
      if (notStartedColumn) {
        notStartedColumn.courses.unshift(newCourse)
      }

      message.success('添加学习内容成功')
      showCreateModal.value = false

      // 重置表单
      Object.assign(createForm, {
        title: '',
        description: '',
        type: null,
        priority: 'medium',
        dueDate: null,
        estimatedHours: 0,
        status: 'not-started',
        relatedGoal: null,
        tags: [],
        resources: [],
        resourceTypes: []
      })
    }
  })
}

const createGoal = () => {
  goalFormRef.value?.validate((errors) => {
    if (!errors) {
      // 模拟添加目标
      const newGoal = {
        id: Date.now(),
        title: goalForm.title,
        description: goalForm.description,
        progress: 0,
        dueDate: goalForm.dueDate,
        icon: goalForm.icon,
        color: goalForm.color,
        type: goalForm.type,
        relatedCourses: 0
      }

      // 添加到目标列表
      learningGoals.unshift(newGoal)

      message.success('添加学习目标成功')
      showGoalModal.value = false

      // 重置表单
      Object.assign(goalForm, {
        title: '',
        description: '',
        dueDate: null,
        icon: 'icon-mubiao',
        color: 'var(--primary-color)',
        type: 'skill',
        enableReminders: false,
        reminderFrequency: 'weekly'
      })
    }
  })
}

const addTask = () => {
  taskFormRef.value?.validate((errors) => {
    if (!errors) {
      // 模拟添加任务
      const newTask = {
        id: Date.now(),
        title: taskForm.title,
        priority: taskForm.priority,
        duration: taskForm.duration,
        completed: false,
        courseTitle: null
      }

      // 如果关联了课程，获取课程标题
      if (taskForm.courseId) {
        const course = courseList.value.find(c => c.id === taskForm.courseId)
        if (course) {
          newTask.courseTitle = course.title
        }
      }

      // 添加到今日任务
      todayTasks.unshift(newTask)

      message.success('添加今日学习任务成功')
      showAddTaskModal.value = false

      // 重置表单
      Object.assign(taskForm, {
        title: '',
        courseId: null,
        duration: 30,
        priority: 'warning',
        notes: ''
      })
    }
  })
}

const toggleTask = (id) => {
  const task = todayTasks.find(t => t.id === id)
  if (task) {
    task.completed = !task.completed

    if (task.completed) {
      message.success('恭喜完成学习任务！')
    }
  }
}

const updateGoalProgress = (id) => {
  const goal = learningGoals.find(g => g.id === id)
  if (goal) {
    // 在实际应用中，这里会打开一个进度更新对话框
    dialog.info({
      title: '更新目标进度',
      content: '请选择更新后的进度值',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        // 模拟更新，将进度增加10%
        const newProgress = Math.min(100, goal.progress + 10)
        goal.progress = newProgress

        message.success(`目标"${goal.title}"进度已更新至${goal.progress}%`)
      }
    })
  }
}

const viewGoalDetails = (goal) => {
  // 在实际应用中，这里会打开一个目标详情页面或对话框
  message.info(`查看目标"${goal.title}"的详情`)
}

const deleteCourse = (course) => {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除"${course.title}"吗？此操作不可撤销。`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      // 从各列中查找并删除课程
      for (const column of kanbanColumns) {
        const index = column.courses.findIndex(c => c.id === course.id)
        if (index !== -1) {
          column.courses.splice(index, 1)
          message.success('删除成功')
          break
        }
      }
    }
  })
}

const showCourseDetails = (course) => {
  selectedCourse.value = course
  showCourseDetailModal.value = true
}

const showEventDetails = (event) => {
  selectedEvent.value = event
  showEventModal.value = true
}

const startEvent = (event) => {
  message.success(`开始学习: ${event.title}`)
  showEventModal.value = false
}

const editEvent = (event) => {
  message.info(`编辑事件: ${event.title}`)
  showEventModal.value = false
}

const startCourse = (course) => {
  message.success(`开始学习课程: ${course.title}`)
  showCourseDetailModal.value = false
}

const editCourse = (course) => {
  message.info(`编辑课程: ${course.title}`)
  showCourseDetailModal.value = false
}

const addLearningRecord = () => {
  if (!selectedCourse.value) return

  dialog.info({
    title: '记录学习进度',
    content: '请输入学习时长和完成的内容',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      // 模拟添加学习记录
      courseRecords.unshift({
        id: Date.now(),
        title: '学习进度更新',
        time: new Date().toLocaleString(),
        type: 'info',
        icon: 'icon-xuexi',
        content: '学习了2小时，完成了组件封装部分的内容'
      })

      message.success('学习记录已添加')
    }
  })
}

const addCourseNote = () => {
  if (!selectedCourse.value) return

  dialog.info({
    title: '添加学习笔记',
    content: '此功能正在开发中',
    positiveText: '确定'
  })
}

const startLearning = (task) => {
  message.success(`开始学习任务: ${task.title}`)
}

const editTask = (task) => {
  message.info(`编辑任务: ${task.title}`)
}

const handleAddToColumn = (columnId) => {
  showCreateModal.value = true
  createForm.status = columnId
}

const updateCourseProgress = (course) => {
  dialog.info({
    title: '更新课程进度',
    content: '请选择更新后的进度值',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      // 模拟更新，将进度增加15%
      const newProgress = Math.min(100, course.progress + 15)

      for (const column of kanbanColumns) {
        const index = column.courses.findIndex(c => c.id === course.id)
        if (index !== -1) {
          column.courses[index].progress = newProgress

          // 如果进度达到100%，移动到完成列
          if (newProgress === 100 && column.id !== 'completed') {
            const completedColumn = kanbanColumns.find(col => col.id === 'completed')
            if (completedColumn) {
              const [movedCourse] = column.courses.splice(index, 1)
              completedColumn.courses.unshift({ ...movedCourse, progress: 100, completedDate: new Date().toISOString().split('T')[0] })

              message.success(`课程 "${course.title}" 已完成并移动到已完成列！`)
            }
          } else {
            message.success(`课程"${course.title}"进度已更新至${newProgress}%`)
          }

          break
        }
      }
    }
  })
}

const showAllResources = () => {
  message.info('查看全部资源功能正在开发中')
}

const createNewNote = () => {
  message.info('创建新笔记功能正在开发中')
}

const openResource = (resource) => {
  message.info(`打开资源: ${resource.title}`)
}

const openEventResource = (resource) => {
  message.info(`打开资源: ${resource.title}`)
}

const openCourseResource = (resource) => {
  message.info(`打开资源: ${resource}`)
}

const openNote = (note) => {
  message.info(`打开笔记: ${note.title}`)
}

const selectSkillNode = (node) => {
  selectedSkillNode.value = node
}

const editSkillPath = () => {
  message.info('编辑技能路径功能正在开发中')
}

const startLearningSkill = (node) => {
  message.success(`开始学习技能: ${node.name}`)
}

const updateSkillProgress = (node) => {
  dialog.info({
    title: '更新技能进度',
    content: '请选择更新后的进度值',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      // 模拟更新，将进度增加10%
      const newProgress = Math.min(100, node.progress + 10)

      // 在实际应用中，这里需要更新技能路径数据
      const nodePath = currentSkillPath.value.nodes.find(n => n.id === node.id)
      if (nodePath) {
        nodePath.progress = newProgress
        message.success(`技能"${node.name}"进度已更新至${newProgress}%`)
      }
    }
  })
}

// 生命周期钩子
onMounted(() => {
  // 在实际应用中，这里会从服务器加载数据
  message.success('学习追踪系统已加载完成')
})
</script>
<style scoped>
.learning-tracks-page {
  padding: var(--content-padding);
}

/* 页面头部样式 */
.header-card {
  background: linear-gradient(135deg, var(--primary-color-suppl) 0%, var(--card-color) 100%);
  border-radius: var(--border-radius-large);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  box-shadow: var(--box-shadow-1);
}

.header-info {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: var(--text-color-base);
}

.page-subtitle {
  font-size: 14px;
  margin: 4px 0 0 0;
  color: var(--text-color-secondary);
}

/* 统计卡片样式 */
.statistics-section {
  margin-top: 16px;
}

.stat-card {
  height: 100%;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--box-shadow-2);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

.stat-icon-primary {
  background-color: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}

.stat-icon-success {
  background-color: rgba(24, 160, 88, 0.1);
  color: var(--success-color);
}

.stat-icon-info {
  background-color: rgba(32, 128, 240, 0.1);
  color: var(--info-color);
}

.stat-icon-error {
  background-color: rgba(208, 48, 80, 0.1);
  color: var(--error-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-color-base);
}

.stat-label {
  font-size: 14px;
  color: var(--text-color-secondary);
}

.stat-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 13px;
}

.trend-up {
  color: var(--success-color);
}

.trend-down {
  color: var(--error-color);
}

.trend-period {
  color: var(--text-color-tertiary);
}

/* 图表卡片样式 */
.chart-card {
  height: 460px;
}

.chart-container {
  height: 360px;
  width: 100%;
}

/* 活动流样式 */
.activity-card {
  min-height: 400px;
}

.activity-stream {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 16px;
}

.activity-content {
  padding: 8px 0;
}

.activity-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.activity-source {
  font-size: 13px;
  color: var(--text-color-tertiary);
}

.activity-details {
  margin-top: 8px;
}

.activity-details-content {
  margin: 8px 0;
}

.details-card {
  background-color: var(--body-color);
  border-radius: var(--border-radius);
  padding: 12px;
  font-size: 13px;
}

/* 看板样式 */
.kanban-container {
  min-height: 700px;
}

.kanban-column {
  height: 100%;
  background-color: var(--body-color);
  transition: all 0.3s ease;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.column-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.kanban-items-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.kanban-drop-zone {
  flex: 1;
  min-height: 200px;
  border-radius: var(--border-radius);
  border: 2px dashed transparent;
  padding: 4px;
  transition: all 0.2s ease;
}

.active-drop-zone {
  border-color: var(--primary-color);
  background-color: rgba(99, 102, 241, 0.05);
}

.kanban-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 4px;
}

.add-card-button {
  margin-top: 12px;
}

/* 列表控件样式 */
.list-controls {
  margin-bottom: 16px;
}

/* 日历视图样式 */
.calendar-container {
  min-height: 700px;
}

.calendar-toolbar {
  margin-bottom: 16px;
}

.current-month {
  margin: 0 0 0 16px;
  font-size: 18px;
  font-weight: 500;
}

.calendar-cell {
  height: 100%;
  min-height: 100px;
  padding: 8px;
  position: relative;
}

.calendar-date {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 16px;
  color: var(--text-color-tertiary);
}

.calendar-cell-today .calendar-date {
  color: var(--primary-color);
  font-weight: 600;
}

.calendar-cell-has-events {
  background-color: rgba(99, 102, 241, 0.03);
}

.calendar-events {
  padding-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calendar-event {
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  border-left: 3px solid;
  cursor: pointer;
  transition: all 0.2s ease;
}

.calendar-event:hover {
  transform: translateX(2px);
}

.event-time {
  font-size: 11px;
  color: var(--text-color-tertiary);
}

.event-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 今日计划样式 */
.daily-plan-container {
  display: flex;
  flex-direction: column;
}

.daily-plan-header {
  margin-bottom: 16px;
}

.today-stats {
  font-size: 14px;
  color: var(--text-color-tertiary);
  margin-left: 8px;
}

.daily-tasks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-content {
  flex: 1;
}

.task-completed {
  text-decoration: line-through;
  opacity: 0.7;
}

.task-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.task-details {
  font-size: 13px;
  color: var(--text-color-tertiary);
}

.task-duration, .task-course {
  display: flex;
  align-items: center;
  gap: 4px;
}

.add-task-button {
  margin-top: 16px;
}

/* 目标卡片样式 */
.goals-card {
  min-height: 320px;
}

.goals-container {
  margin: 8px 0;
}

.goal-card {
  height: 100%;
  transition: all 0.3s ease;
  border-left: 4px solid;
  border-left-color: var(--primary-color);
}

.goal-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--box-shadow-2);
}

.goal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.goal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.05);
}

.goal-info {
  flex: 1;
}

.goal-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.goal-deadline {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-color-tertiary);
}

.goal-progress {
  margin-bottom: 16px;
}

.goal-metrics {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.goal-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-label {
  font-size: 12px;
  color: var(--text-color-tertiary);
  margin-bottom: 4px;
}

.metric-value {
  font-weight: 500;
  font-size: 14px;
}

.goal-actions {
  display: flex;
  justify-content: flex-end;
}

.goal-completed {
  border-left-color: var(--success-color);
  background-color: rgba(24, 160, 88, 0.05);
}

.goal-overdue {
  border-left-color: var(--error-color);
  background-color: rgba(208, 48, 80, 0.05);
}

.goal-urgent {
  border-left-color: var(--warning-color);
  background-color: rgba(240, 160, 32, 0.05);
}

.add-goal-card {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--border-color);
  background-color: transparent;
  transition: all 0.3s ease;
  cursor: pointer;
}

.add-goal-card:hover {
  border-color: var(--primary-color);
  background-color: rgba(99, 102, 241, 0.05);
}

.add-goal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.add-icon {
  color: var(--text-color-tertiary);
}

.add-text {
  font-size: 16px;
  color: var(--text-color-secondary);
}

/* 资源库样式 */
.resources-card {
  min-height: 320px;
}

.resources-grid {
  margin: 8px 0;
}

.more-resources {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

/* 技能路径样式 */
.skills-card {
  min-height: 400px;
}

.skill-path-container {
  display: flex;
  gap: 24px;
  height: 500px;
}

.skill-path-visualization {
  flex: 1;
  border-radius: var(--border-radius);
  background-color: var(--body-color);
  padding: 16px;
  height: 100%;
}

.skill-node-detail {
  width: 300px;
  max-height: 100%;
  overflow-y: auto;
}

.skill-node-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skill-node-status {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.skill-node-description {
  color: var(--text-color-secondary);
  font-size: 14px;
  line-height: 1.5;
}

.skill-node-resources {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resources-title {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
}

.node-resources-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-node-actions {
  display: flex;
  justify-content: space-between;
}

/* 笔记样式 */
.notes-card {
  min-height: 320px;
}

.notes-grid {
  margin: 8px 0;
}

/* 弹窗样式 */
.create-modal .priority-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.priority-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

/* 事件详情样式 */
.event-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.event-meta {
  background-color: var(--body-color);
  border-radius: var(--border-radius);
  padding: 12px;
}

.event-description {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.description-title, .resources-title {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 8px;
}

.description-content {
  color: var(--text-color-secondary);
  line-height: 1.6;
}

.event-resources {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.resource-type {
  font-size: 12px;
  color: var(--text-color-tertiary);
}

/* 课程详情样式 */
.course-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.course-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.course-description {
  color: var(--text-color-secondary);
  line-height: 1.6;
}

.section-title {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 8px;
}

.course-tags {
  margin-top: 8px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.note-meta {
  font-size: 12px;
  color: var(--text-color-tertiary);
  margin-bottom: 8px;
}

.note-content {
  color: var(--text-color-secondary);
  line-height: 1.5;
}

/* 移动端响应式适配 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-right {
    width: 100%;
  }

  .skill-path-container {
    flex-direction: column;
    height: auto;
  }

  .skill-path-visualization {
    height: 400px;
  }

  .skill-node-detail {
    width: 100%;
  }
}

/* 过渡动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 暗色模式适配 */
:deep(.dark-theme) .header-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, var(--card-color) 100%);
}
</style>