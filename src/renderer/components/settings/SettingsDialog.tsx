import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { useTheme } from '../../hooks/useTheme';

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>设置</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* 外观设置 */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">外观</h3>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <div className="font-medium">暗黑模式</div>
                                <div className="text-sm text-muted-foreground">
                                    切换深色主题，保护您的视力
                                </div>
                            </div>
                            <Button
                                variant={theme === 'dark' ? 'default' : 'outline'}
                                size="sm"
                                onClick={toggleTheme}
                            >
                                {theme === 'dark' ? '已开启' : '已关闭'}
                            </Button>
                        </div>
                    </div>

                    {/* 其他设置区域（预留） */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">通用设置</h3>
                        <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                            更多设置选项即将推出...
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SettingsDialog;
