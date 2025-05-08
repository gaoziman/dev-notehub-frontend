<template>
  <div class="home-container">
    <!-- 欢迎页面组件 -->
    <welcome-page
        @show-login="showLoginModal"
        @show-register="showRegisterModal"
    />

    <!-- 登录/注册模态框 -->
    <auth-modal
        v-model:show="authModalVisible"
        :default-mode="authModalMode"
        @login-success="handleLoginSuccess"
        @register-success="handleRegisterSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WelcomePage from '@/pages/welcome/WelcomePage.vue'
import AuthModal from '@/components/auth/AuthModal.vue'

// 控制模态框
const authModalVisible = ref(false)
const authModalMode = ref<'login' | 'register'>('login')

// 显示登录模态框
const showLoginModal = () => {
  authModalMode.value = 'login'
  authModalVisible.value = true
}

// 显示注册模态框
const showRegisterModal = () => {
  authModalMode.value = 'register'
  authModalVisible.value = true
}

// 登录成功回调
const handleLoginSuccess = () => {
  console.log('登录成功')
  // 可以添加额外的逻辑，比如欢迎通知等
}

// 注册成功回调
const handleRegisterSuccess = (username: string, password: string) => {
  console.log('注册成功:', username)
  // 可以添加额外的逻辑
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  position: relative;
}
</style>