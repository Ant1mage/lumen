'use client'

import { useState, useEffect } from "react"
import { RotateCcw } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@renderer/components/ui/button"
import { AILogo } from "@renderer/components/ui/ai-logo"
import { logger } from "@renderer/tools/logger"

interface SplashScreenProps {
    onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
    const { t, i18n } = useTranslation()
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState('')
    const [isVisible, setIsVisible] = useState(true)
    const [isError, setIsError] = useState(false)
    const [isRetrying, setIsRetrying] = useState(false)
    const [avatarStage, setAvatarStage] = useState<'normal' | 'enlarge' | 'shrink'>('normal')
    const [bgOpacity, setBgOpacity] = useState(1)
    const [hasStarted, setHasStarted] = useState(false)

    // 启动时才开始加载 LumenCore
    useEffect(() => {
        logger.info('开始加载 LumenCore', 'SplashScreen')
        setHasStarted(true)
        setStatus(i18n.t('splash.initializing'))

        // 非线性进度条动画
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) return prev // 在 90% 等待完成
                const increment = (100 - prev) * 0.1 // 非线性增长
                return Math.min(prev + increment, 90)
            })
        }, 200)

        return () => clearInterval(progressInterval)
    }, []) // 移除 t 依赖

    useEffect(() => {
        logger.debug('useEffect 初始化', 'SplashScreen', { hasLumenCore: !!window.lumen_core })

        // 监听 LumenCore 初始化状态
        if (window.lumen_core && hasStarted) {
            const unsubscribe = window.lumen_core.onStateChange((state) => {
                logger.debug('收到状态更新', 'SplashScreen', state)

                // 根据状态更新进度条和文字
                switch (state.status) {
                    case 'initializing':
                        // 正在初始化
                        setIsError(false)
                        setStatus(state.progress || i18n.t('splash.initializing'))
                        break
                    case 'ready':
                        // 准备就绪 - 开始淡出动画
                        logger.info('系统已就绪，开始淡出', 'SplashScreen')
                        setProgress(100)
                        setStatus(i18n.t('splash.ready'))

                        // 动画时序（使用 tailwindcss-animate）：
                        // 1. 先放大到 1.2 倍（0.3 秒）- animate-ping 自定义版本
                        // 2. 然后缩小到 0（1 秒）- 自定义 animate-shrink
                        // 3. 最后背景淡出（1 秒）

                        // 第 1 步：放大到 1.2 倍
                        setTimeout(() => {
                            setAvatarStage('enlarge')
                        }, 50)

                        // 第 2 步：等待 0.3 秒后开始缩小
                        setTimeout(() => {
                            setAvatarStage('shrink')
                        }, 350) // 50ms + 300ms

                        // 第 3 步：缩小完成后背景淡出（再等 1 秒）
                        setTimeout(() => {
                            setBgOpacity(0)
                        }, 1400) // 350ms + 1000ms + 50ms 缓冲

                        // 第 4 步：完全隐藏（再等 1 秒）
                        setTimeout(() => {
                            logger.info('执行隐藏', 'SplashScreen')
                            setIsVisible(false)
                            onComplete()
                        }, 2450) // 1400ms + 1000ms + 50ms 缓冲
                        break
                    case 'error':
                        // 错误状态
                        logger.error(`初始化错误：${state.error}`, 'SplashScreen')
                        setIsError(true)
                        setStatus(i18n.t('splash.error'))
                        setProgress(0)
                        break
                }
            })

            return () => {
                logger.debug('清理监听器', 'SplashScreen')
                unsubscribe()
            }
        } else if (!hasStarted) {
            logger.debug('等待启动...', 'SplashScreen')
        } else {
            logger.warn('window.lumen_core 不存在', 'SplashScreen')
        }
    }, [onComplete, hasStarted]) // 移除 t 依赖

    const handleRetry = async () => {
        logger.info('重试加载 LumenCore', 'SplashScreen')
        setIsRetrying(true)
        setIsError(false)
        setProgress(0)
        setAvatarStage('normal') // 重置 Avatar 状态
        setBgOpacity(1)          // 重置背景透明度
        setStatus(i18n.t('splash.initializing'))

        try {
            // 调用主进程的重新初始化接口
            if (window.lumen_core?.reinitialize) {
                const result = await window.lumen_core.reinitialize()
                logger.info(`LumenCore 重新初始化结果：${JSON.stringify(result)}`, 'SplashScreen')
                if (!result.success) {
                    throw new Error(result.error)
                }
            } else {
                throw new Error('lumen_core.reinitialize not available')
            }
        } catch (error) {
            logger.error(`重试失败：${error}`, 'SplashScreen')
            setIsError(true)
            setStatus(i18n.t('splash.error'))
            setProgress(0)
        } finally {
            setIsRetrying(false)
        }
    }

    if (!isVisible) return null

    return (
        <div
            className="fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-background transition-opacity duration-1000 ease-out"
            style={{ opacity: bgOpacity }}
        >
            <div className="flex flex-col items-center space-y-12">
                {/* AI Avatar - 顺时针旋转动画 */}
                <div
                    className={`transition-all ${avatarStage === 'enlarge' ? 'animate-splash-enlarge' :
                        avatarStage === 'shrink' ? 'animate-splash-shrink' :
                            ''
                        }`}
                >
                    <AILogo
                        size="lg"
                        className={isError ? '' : 'animate-spin'}
                        style={{
                            animationDuration: isError ? '0s' : '2s',
                            animationTimingFunction: 'linear',
                            animationIterationCount: 'infinite'
                        }}
                    />
                </div>

                {/* 进度条或重试按钮 */}
                <div className="w-80 space-y-3">
                    {!isError ? (
                        // 正常加载状态：显示进度条
                        <>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-splash-progress-bg">
                                <div
                                    className="h-full bg-primary transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-center text-sm text-muted-foreground">
                                {status}
                            </p>
                        </>
                    ) : (
                        // 错误状态：显示重试按钮
                        <Button
                            onClick={handleRetry}
                            disabled={isRetrying}
                            className="w-full gap-2 bg-primary hover:bg-primary/90"
                        >
                            <RotateCcw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                            {isRetrying ? i18n.t('splash.retrying') : i18n.t('splash.retry')}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
