<template>
  <a-row :gutter="24" class="overview-cards">
    <a-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6" v-for="stat in stats" :key="stat.key">
      <a-card class="stat-card card-hover">
        <div class="stat-content">
          <div :class="['stat-icon', `${stat.icon}-icon`]">
            <component :is="`${stat.icon}-outlined`" />
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-value">{{ stat.value }}</span>
          </div>
        </div>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
defineProps<{
  stats: Array<{
    key: string;
    value: number;
    icon: string;
    label: string;
  }>;
}>();
</script>

<style scoped>
/* 概览卡片样式 */
.overview-cards {
  margin-bottom: 32px;
}

.stat-card {
  border-radius: 12px;
  height: 100%;
}

.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.book-icon {
  background-color: #e6f2ff;
  color: #1C4ED8;
}

.check-icon {
  background-color: #e6fffa;
  color: #38b2ac;
}

.clock-icon {
  background-color: #fffbeb;
  color: #ecc94b;
}

.bookmark-icon {
  background-color: #f3e8ff;
  color: #9f7aea;
}

.stat-info {
  margin-left: 16px;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 14px;
  color: #4b5563;
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}
</style>