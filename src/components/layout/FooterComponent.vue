<template>
  <a-layout-footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <div class="footer-logo">
          <div class="logo-box">
            <code-outlined class="logo-icon" />
          </div>
          <div class="footer-logo-text">
            <div class="logo-title">DevNoteHub</div>
            <div class="logo-slogan">记录、组织、分享你的技术笔记</div>
          </div>
        </div>
        <p class="footer-description">
          DevNoteHub 是一个专为开发者设计的笔记管理平台，帮助你高效整理学习资源、跟踪学习进度、构建个人知识体系。
        </p>
        <div class="social-links">
          <a href="#" class="social-link">
            <github-outlined />
          </a>
          <a href="#" class="social-link">
            <twitter-outlined />
          </a>
          <a href="#" class="social-link">
            <linkedin-outlined />
          </a>
          <a href="#" class="social-link">
            <mail-outlined />
          </a>
        </div>
      </div>

      <div class="footer-section links-section">
        <h3 class="footer-heading">快速导航</h3>
        <ul class="footer-links">
          <li><a href="#">主页</a></li>
          <li><a href="#">我的笔记</a></li>
          <li><a href="#">学习进度</a></li>
          <li><a href="#">收藏资源</a></li>
          <li><a href="#">标签管理</a></li>
        </ul>
      </div>

      <div class="footer-section links-section">
        <h3 class="footer-heading">帮助与支持</h3>
        <ul class="footer-links">
          <li><a href="#">使用指南</a></li>
          <li><a href="#">常见问题</a></li>
          <li><a href="#">API文档</a></li>
          <li><a href="#">联系我们</a></li>
        </ul>
      </div>

      <div class="footer-section links-section">
        <h3 class="footer-heading">加入社区</h3>
        <ul class="footer-links">
          <li><a href="#">技术论坛</a></li>
          <li><a href="#">用户反馈</a></li>
          <li><a href="#">开发者文档</a></li>
          <li><a href="#">贡献指南</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="copyright">
        © {{ currentYear }} DevNoteHub. 保留所有权利.
      </div>
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
  padding: 40px 24px 32px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
}

.footer-section {
  display: flex;
  flex-direction: column;
}

.footer-logo {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.logo-box {
  width: 36px;
  height: 36px;
  background: var(--primary-gradient);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.logo-icon {
  color: white;
  font-size: 20px;
}

.footer-logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.logo-slogan {
  font-size: 12px;
  color: #8c8c8c;
}

.footer-description {
  color: #595959;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f5f5f5;
  color: #595959;
  transition: all 0.2s;
}

.social-link:hover {
  background-color: var(--primary-color);
  color: white;
}

.footer-heading {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 20px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: #595959;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: var(--primary-color);
}

.footer-bottom {
  border-top: 1px solid #f0f0f0;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.copyright {
  color: #8c8c8c;
  font-size: 14px;
}

.footer-bottom-links {
  display: flex;
  gap: 24px;
}

.footer-bottom-links a {
  color: #8c8c8c;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-bottom-links a:hover {
  color: var(--primary-color);
}

/* 响应式布局调整 */
@media (max-width: 992px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 40px 24px;
  }

  .footer-section:first-child {
    grid-column: span 2;
  }
}

@media (max-width: 576px) {
  .footer-content {
    grid-template-columns: 1fr;
  }

  .footer-section:first-child {
    grid-column: span 1;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>