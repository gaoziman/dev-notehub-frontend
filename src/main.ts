import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import { MotionPlugin } from '@vueuse/motion'


import App from '@/App.vue';
import router from '@/router';

// 导入全局样式
import '@/assets/styles/base.css';

// 创建Pinia实例并使用持久化插件
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// 创建应用实例
const app = createApp(App);

// 注册插件
app.use(pinia);
app.use(router);
app.use(MotionPlugin)
app.use(Antd);

// 挂载应用
app.mount('#app');