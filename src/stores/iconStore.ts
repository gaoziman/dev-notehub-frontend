import { defineStore } from 'pinia'

export const useIconStore = defineStore('icon', {
    state: () => ({
        iconUrl: '//at.alicdn.com/t/c/font_4909170_xn92u1cx56o.js', // 默认值与index.html相同
    }),
    actions: {
        updateIconUrl(newUrl :any) {
            this.iconUrl = newUrl;
            this.updateIconScript();
        },
        updateIconScript() {
            // 移除旧的图标库脚本
            const oldScript = document.getElementById('iconfont-script');
            if (oldScript) {
                document.head.removeChild(oldScript);
            }

            // 创建新的图标库脚本
            const script = document.createElement('script');
            script.id = 'iconfont-script';
            script.src = this.iconUrl.startsWith('//') ? this.iconUrl : `//${this.iconUrl}`;
            document.head.appendChild(script);
        }
    },
    persist: true, // 启用状态持久化
})