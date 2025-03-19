<template>
  <div class="not-found-page">
    <div class="content">
      <div class="error-code">404</div>
      <h1 class="title">页面未找到</h1>
      <p class="description">抱歉，您访问的页面不存在或已被移除。</p>
      <div class="actions">
        <a-button type="primary" size="large" @click="$router.push('/')">
          返回首页
        </a-button>
        <a-button size="large" @click="$router.go(-1)">
          返回上一页
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404页面不需要额外的逻辑
</script>

<style scoped>
.not-found-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  padding: 20px;
}

.content {
  text-align: center;
  max-width: 500px;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: #1c4ed8;
  line-height: 1;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #1c4ed8 0%, #3662d9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title {
  font-size: 32px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.description {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 32px;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 100px;
  }

  .title {
    font-size: 28px;
  }

  .description {
    font-size: 16px;
  }

  .actions {
    flex-direction: column;
    gap: 12px;
  }
}
</style>