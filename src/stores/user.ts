import { defineStore } from 'pinia';
import { ref } from 'vue';
import { message } from 'ant-design-vue';

// 用户信息接口
interface UserInfo {
    id: string;
    username: string;
    avatar: string;
    role: string;
    email: string;
}

export const useUserStore = defineStore('user', () => {
    // 用户信息状态
    const userInfo = ref<UserInfo | null>(null);

    // 判断用户是否已登录 - 保持为方法形式以兼容现有代码
    const isLoggedIn = () => !!userInfo.value;

    // 设置用户信息
    const setUserInfo = (info: UserInfo) => {
        userInfo.value = info;
    };

    // 清除用户信息（登出）
    const clearUserInfo = () => {
        userInfo.value = null;
    };

    // 退出登录
    const logout = () => {
        // 可以在这里添加登出API调用
        // await api.auth.logout();

        // 清除用户数据
        clearUserInfo();

        // 可以添加额外的清理操作，如清除本地缓存等
        localStorage.removeItem('user-preferences');
        sessionStorage.clear();

        // 返回操作成功
        return true;
    };

    // 返回状态和方法
    return {
        userInfo,
        isLoggedIn,
        setUserInfo,
        clearUserInfo,
        logout
    };
}, {
    persist: {
        // 启用持久化
        enabled: true,
        // 使用localStorage存储
        storage: window.localStorage,
        // 只持久化userInfo
        paths: ['userInfo']
    }
});