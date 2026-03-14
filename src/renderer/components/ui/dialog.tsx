import * as React from 'react';
import { cn } from '@renderer/lib/utils';

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 背景遮罩 */}
            <div
                className="fixed inset-0 bg-black/80 animate-in fade-in"
                onClick={() => onOpenChange(false)}
            />

            {/* 对话框容器 */}
            <div className="relative z-50 w-full max-w-lg animate-in zoom-in-95">
                {children}
            </div>
        </div>
    );
};

interface DialogContentProps {
    className?: string;
    children: React.ReactNode;
}

export const DialogContent: React.FC<DialogContentProps> = ({ className, children }) => {
    return (
        <div className={cn(
            "bg-background border rounded-lg shadow-lg",
            className
        )}>
            {children}
        </div>
    );
};

interface DialogHeaderProps {
    className?: string;
    children: React.ReactNode;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ className, children }) => {
    return (
        <div className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}>
            {children}
        </div>
    );
};

interface DialogTitleProps {
    className?: string;
    children: React.ReactNode;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ className, children }) => {
    return (
        <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
            {children}
        </h2>
    );
};
