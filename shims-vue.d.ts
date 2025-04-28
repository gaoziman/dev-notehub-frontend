declare module '*.vue' {
    import { DefineComponent } from 'vue'
    // 扩展组件定义，使其接受任何props
    const component: DefineComponent<any, {}, any>
    export default component
}