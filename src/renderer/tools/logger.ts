/**
 * Renderer 进程统一日志模块
 * 
 * 提供全局可用的 logger 对象，用于在 React 组件或 Zustand Store 中输出日志
 * 所有日志通过 IPC 转发到主进程，由主进程的 Logger 统一管理
 * 
 * @example
 * // 在 React 组件中使用
 * logger.info('组件已加载', 'ComponentName');
 * logger.error('数据加载失败', 'API', error);
 * 
 * @example
 * // 在 Zustand Store 中使用
 * const useStore = create((set) => ({
 *   fetchData: async () => {
 *     logger.info('开始获取数据', 'Store');
 *     try {
 *       const data = await api.getData();
 *       set({ data });
 *     } catch (error) {
 *       logger.error('获取数据失败', 'Store', error);
 *     }
 *   }
 * }));
 */

import { LogLevel, LogSource } from '@shared/types';

/**
 * Window 接口扩展
 * 添加 preload 暴露的 logger 属性
 */
declare global {
    interface Window {
        logger: {
            info(message: string, context?: string, data?: any): void;
            warn(message: string, context?: string, data?: any): void;
            error(message: string, context?: string, data?: any): void;
            debug(message: string, context?: string, data?: any): void;
        };
    }
}

/**
 * 日志接口定义
 */
export interface RendererLogger {
    /**
     * 输出 Info 级别日志
     * @param message 日志消息
     * @param context 上下文标签（可选）
     * @param data 附加数据（可选）
     */
    info(message: string, context?: string, data?: any): void;

    /**
     * 输出 Warn 级别日志
     * @param message 日志消息
     * @param context 上下文标签（可选）
     * @param data 附加数据（可选）
     */
    warn(message: string, context?: string, data?: any): void;

    /**
     * 输出 Error 级别日志
     * @param message 日志消息
     * @param context 上下文标签（可选）
     * @param data 附加数据（可选）
     */
    error(message: string, context?: string, data?: any): void;

    /**
     * 输出 Debug 级别日志
     * @param message 日志消息
     * @param context 上下文标签（可选）
     * @param data 附加数据（可选）
     */
    debug(message: string, context?: string, data?: any): void;
}

/**
 * 内部日志发送函数
 * 使用 window.logger（由 preload 暴露）发送日志到主进程
 */
const sendLog = (
    level: LogLevel,
    message: string,
    context?: string,
    data?: any
) => {
    // 检查 window.logger 是否可用（生产环境/开发环境都需支持）
    if (typeof window !== 'undefined' && window.logger) {
        switch (level) {
            case LogLevel.Debug:
                window.logger.debug(message, context, data);
                break;
            case LogLevel.Info:
                window.logger.info(message, context, data);
                break;
            case LogLevel.Warn:
                window.logger.warn(message, context, data);
                break;
            case LogLevel.Error:
                window.logger.error(message, context, data);
                break;
        }
    } else {
        // Fallback: 在开发环境下使用 console.log（仅用于调试）
        if (process.env.NODE_ENV === 'development') {
            const timestamp = new Date().toISOString();
            const ctx = context || 'RENDERER';
            console.log(`[${timestamp}] [${level.toUpperCase()}] [${ctx}] ${message}`, data || '');
        }
    }
};

/**
 * Renderer Logger 实例
 * 
 * 提供类型安全的日志输出方法
 * 所有日志自动添加时间戳和来源标识
 */
export const logger: RendererLogger = {
    /**
     * 输出 Info 级别日志
     * @param message 日志消息
     * @param context 上下文标签（可选），默认为 'RENDERER'
     * @param data 附加数据（可选）
     */
    info(message: string, context?: string, data?: any) {
        sendLog(LogLevel.Info, message, context, data);
    },

    /**
     * 输出 Warn 级别日志
     * @param message 日志消息
     * @param context 上下文标签（可选），默认为 'RENDERER'
     * @param data 附加数据（可选）
     */
    warn(message: string, context?: string, data?: any) {
        sendLog(LogLevel.Warn, message, context, data);
    },

    /**
     * 输出 Error 级别日志
     * @param message 日志消息
     * @param context 上下文标签（可选），默认为 'RENDERER'
     * @param data 附加数据（可选），通常为 Error 对象
     */
    error(message: string, context?: string, data?: any) {
        sendLog(LogLevel.Error, message, context, data);
    },

    /**
     * 输出 Debug 级别日志
     * @param message 日志消息
     * @param context 上下文标签（可选），默认为 'RENDERER'
     * @param data 附加数据（可选）
     */
    debug(message: string, context?: string, data?: any) {
        sendLog(LogLevel.Debug, message, context, data);
    },
};

/**
 * 创建带上下文的 logger 实例
 * 
 * @param defaultContext 默认上下文标签
 * @returns 新的 logger 实例，所有方法都会使用默认的 context
 * 
 * @example
 * const apiLogger = createLogger('API');
 * apiLogger.info('请求成功'); // 等同于 logger.info('请求成功', 'API')
 */
export function createLogger(defaultContext: string): RendererLogger {
    return {
        info: (message: string, data?: any) => logger.info(message, defaultContext, data),
        warn: (message: string, data?: any) => logger.warn(message, defaultContext, data),
        error: (message: string, data?: any) => logger.error(message, defaultContext, data),
        debug: (message: string, data?: any) => logger.debug(message, defaultContext, data),
    };
}
