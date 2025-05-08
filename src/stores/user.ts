// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 用户信息接口
interface UserInfo {
    username: string
    avatar?: string
    email?: string
    role?: string
    lastLoginTime?: string
}

// 定义用户存储
export const useUserStore = defineStore('user', () => {
    // 状态
    const token = ref<string>('')
    const userInfo = ref<UserInfo | null>(null)
    const isLoggedIn = computed(() => !!token.value && !!userInfo.value)

    // 模拟用户数据库（实际环境中会从后端获取）
    const userDatabase = ref<Record<string, { password: string, userInfo: UserInfo }>>({})

    // 登录方法 - 修改：如果用户不存在则自动创建，并且不验证密码
    const login = (username: string, password: string): Promise<boolean> => {
        return new Promise((resolve) => {
            // 模拟API请求延迟
            setTimeout(() => {
                let user = userDatabase.value[username]

                // 如果用户不存在，则自动创建用户
                if (!user) {
                    // 自动创建用户
                    userDatabase.value[username] = {
                        password: password, // 保存用户输入的密码，虽然不会验证它
                        userInfo: {
                            username,
                            avatar: 'http://leocoder.cn:9000/coder-devnotehub/images/20250507/c8561a6ba75d47369449db03eae70cea.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20250507%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250507T120757Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=0f3f503c34e93e2382e5269f13e3aaa8d43950c151d051116426c3633aeb4647', // 默认头像
                            role: 'user',
                            lastLoginTime: new Date().toLocaleString()
                        }
                    }

                    // 更新用户引用
                    user = userDatabase.value[username]
                }

                // 登录成功 - 不检查密码，且如果用户不存在则自动创建
                token.value = `mock-token-${Date.now()}`
                // 更新最后登录时间
                user.userInfo.lastLoginTime = new Date().toLocaleString()
                userInfo.value = { ...user.userInfo }
                resolve(true)
            }, 300)
        })
    }

    // 注册方法
    const register = (username: string, password: string): Promise<boolean> => {
        return new Promise((resolve) => {
            // 模拟API请求延迟
            setTimeout(() => {
                // 检查用户是否已存在
                if (userDatabase.value[username]) {
                    resolve(false)
                    return
                }

                // 创建新用户
                userDatabase.value[username] = {
                    password,
                    userInfo: {
                        username,
                        avatar: 'http://leocoder.cn:9000/coder-devnotehub/images/20250507/6f0d07bcc2df4eea82750b674f6a30a8.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20250507%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250507T150803Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=d71b6052f4462fb875bab3b7bd7fe0b35b3a4f09d3fbcae0ef51ffa357572202', // 默认头像
                        role: 'user',
                        lastLoginTime: new Date().toLocaleString()
                    }
                }

                resolve(true)
            }, 300)
        })
    }

    // 登出方法
    const logout = () => {
        token.value = ''
        userInfo.value = null
    }

    // 更新用户信息
    const updateUserInfo = (info: Partial<UserInfo>) => {
        if (userInfo.value && userDatabase.value[userInfo.value.username]) {
            userInfo.value = { ...userInfo.value, ...info }
            userDatabase.value[userInfo.value.username].userInfo = { ...userInfo.value }
        }
    }

    return {
        token,
        userInfo,
        isLoggedIn,
        login,
        register,
        logout,
        updateUserInfo
    }
}, {
    persist: {
        storage: window.localStorage,
        paths: ['token', 'userInfo', 'userDatabase']
    }
})