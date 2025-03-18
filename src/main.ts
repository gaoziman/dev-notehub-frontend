import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

// 创建 Pinia 实例并配置持久化插件
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 创建 Vue 应用实例
const app = createApp(App)

// 注册全局组件和插件
app.use(router)
app.use(pinia)
app.use(Antd)



// 挂载应用
app.mount('#app')