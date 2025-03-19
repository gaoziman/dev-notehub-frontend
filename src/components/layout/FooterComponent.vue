<template>
  <a-layout-footer class="footer">
    <div class="footer-content">
      <div class="footer-main">
        <div class="footer-logo">
          <div class="logo-box">
            <code-outlined class="logo-icon" />
          </div>
          <div class="footer-logo-text">
            <div class="logo-title">DevNoteHub</div>
            <div class="logo-slogan">记录、组织、分享你的技术笔记</div>
          </div>
        </div>

        <div class="social-links">
          <a href="#" class="social-link"><github-outlined /></a>
          <a href="#" class="social-link"><twitter-outlined /></a>
          <a href="#" class="social-link"><linkedin-outlined /></a>
          <a href="#" class="social-link"><mail-outlined /></a>
        </div>
      </div>

      <div class="footer-links-container">
        <div class="footer-section">
          <h3 class="footer-heading">快速导航</h3>
          <div class="link-grid">
            <a href="#">主页</a>
            <a href="#">我的笔记</a>
            <a href="#">学习进度</a>
            <a href="#">收藏资源</a>
          </div>
        </div>

        <div class="footer-section">
          <h3 class="footer-heading">帮助与支持</h3>
          <div class="link-grid">
            <a href="#">使用指南</a>
            <a href="#">常见问题</a>
            <a href="#">API文档</a>
            <a href="#">联系我们</a>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="copyright">© {{ currentYear }} DevNoteHub. 保留所有权利.</div>
      <div class="footer-bottom-links">
        <a href="#">隐私政策</a>
        <a href="#">使用条款</a>
        <a href="#">Cookie设置</a>
      </div>
    </div>
  </a-layout-footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  CodeOutlined,
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  MailOutlined
} from '@ant-design/icons-vue';

// 获取当前年份用于版权信息
const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.footer {
  background-color: #ffffff;
  padding: 0;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 24px 16px;
  display: flex;
  justify-content: space-between;
  gap: 40px;
}

.footer-main {
  max-width: 280px;
}

.footer-logo {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.logo-box {
  width: 32px;
  height: 32px;
  background: var(--primary-gradient);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.logo-icon {
  color: white;
  font-size: 18px;
}

.logo-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.logo-slogan {
  font-size: 12px;
  color: #8c8c8c;
}

.social-links {
  display: flex;
  gap: 10px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #f5f5f5;
  color: #595959;
  transition: all 0.2s;
}

.social-link:hover {
  background-color: var(--primary-color);
  color: white;
}

.footer-links-container {
  display: flex;
  gap: 60px;
}

.footer-heading {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 12px;
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 24px;
}

.link-grid a {
  color: #595959;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s;
}

.link-grid a:hover {
  color: var(--primary-color);
}

.footer-bottom {
  border-top: 1px solid #f0f0f0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.copyright {
  color: #8c8c8c;
  font-size: 13px;
}

.footer-bottom-links {
  display: flex;
  gap: 16px;
}

.footer-bottom-links a {
  color: #8c8c8c;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-bottom-links a:hover {
  color: var(--primary-color);
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 24px;
  }

  .footer-main {
    max-width: 100%;
  }

  .footer-links-container {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .footer-links-container {
    flex-direction: column;
    gap: 24px;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>