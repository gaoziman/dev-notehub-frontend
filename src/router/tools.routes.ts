import { RouteRecordRaw } from 'vue-router';
import ColorPicker from "@/pages/tools/ColorPicker.vue";

const ToolsPage = () => import('@/pages/tools/ToolsPage.vue');
const JsonFormatter = () => import('@/pages/tools/JsonFormatter.vue');
const RegexTester = () => import('@/pages/tools/RegexTester.vue');
const SqlFormatter = () => import('@/pages/tools/SqlFormatter.vue');
const DevToolkit = () => import('@/pages/tools/DevToolkit.vue');

// 工具集路由
const toolsRoutes: RouteRecordRaw[] = [
    {
        path: '/tools',
        name: 'tools',
        component: ToolsPage,
        meta: {
            title: '开发工具集',
            icon: 'icon-tools',
            requiresAuth: false
        }
    },
    {
        path: '/tools/json-formatter',
        name: 'json-formatter',
        component: JsonFormatter,
        meta: {
            title: 'JSON格式化工具',
            requiresAuth: false,
            hideInMenu: true
        }
    },
    {
        path: '/tools/regex-tester',
        name: 'regex-tester',
        component: RegexTester,
        meta: {
            title: '正则表达式测试器',
            requiresAuth: false,
            hideInMenu: true
        }
    },
    {
        path: '/tools/sql-formatter',
        name: 'sql-formatter',
        component: SqlFormatter,
        meta: {
            title: 'SQL格式化工具',
            requiresAuth: false,
            hideInMenu: true
        }
    },
    {
        path: '/tools/color-picker',
        name: 'color-picker',
        component: ColorPicker,
        meta: {
            title: '配色方案生成器',
            requiresAuth: false,
            hideInMenu: true
        }
    },
    {
        path: '/tools/dev-toolkit',
        name: 'dev-toolkit',
        component: DevToolkit,
        meta: {
            title: '效率工具箱',
            requiresAuth: false,
            hideInMenu: true
        }
    },
];

export default toolsRoutes;