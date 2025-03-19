/**
 * 安全地复制对象，移除循环引用
 * @param {Object} obj - 要复制的对象
 * @return {Object} - 安全的对象副本
 */
export function safeClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    try {
        // 使用这种方法进行深拷贝，会自动去除不可序列化的属性
        return JSON.parse(JSON.stringify(obj));
    } catch (error) {
        console.error('无法安全序列化对象:', error);

        // 发生错误时，创建一个基本对象
        const result = Array.isArray(obj) ? [] : {};

        // 手动复制可序列化的基本属性
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                // 仅复制原始类型和简单对象
                if (
                    value === null ||
                    typeof value !== 'object' ||
                    value instanceof Date ||
                    value instanceof RegExp
                ) {
                    result[key] = value;
                } else {
                    // 跳过复杂对象和函数
                    continue;
                }
            }
        }
        return result;
    }
}