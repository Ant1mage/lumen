import * as React from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@renderer/lib/utils';

// 使用简化的可调整面板实现
interface PanelGroupProps {
  children: React.ReactNode;
  direction: 'horizontal' | 'vertical';
  className?: string;
}

interface PanelProps {
  children: React.ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
}

interface PanelResizeHandleProps {
  className?: string;
  withHandle?: boolean;
}

export const ResizablePanelGroup: React.FC<PanelGroupProps> = ({
  children,
  direction,
  className
}) => {
  return (
    <div
      className={cn(
        'flex h-full w-full',
        direction === 'horizontal' ? 'flex-row' : 'flex-col',
        className
      )}
    >
      {children}
    </div>
  );
};

export const ResizablePanel: React.FC<PanelProps> = ({
  children,
  defaultSize = 50,
  minSize = 10,
  className
}) => {
  const [size, setSize] = React.useState(defaultSize);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const isResizing = React.useRef(false);
  const startPos = React.useRef(0);
  const startSize = React.useRef(0);
  const direction = 'horizontal'; // 简化实现，暂时只支持水平方向

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || !panelRef.current?.parentElement) return;

      const parent = panelRef.current.parentElement;
      const delta = e.clientX - startPos.current;
      const parentSize = direction === 'horizontal' ? parent.clientWidth : parent.clientHeight;
      const deltaPercent = (delta / parentSize) * 100;

      let newSize = startSize.current + deltaPercent;
      newSize = Math.max(minSize, Math.min(newSize, 100));

      setSize(newSize);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing.current) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    // 这个函数会被 resize handle 调用
  };

  return (
    <div
      ref={panelRef}
      className={cn('overflow-auto', className)}
      style={{ flex: `1 1 ${size}%`, minWidth: `${minSize}%` }}
    >
      {children}
    </div>
  );
};

export const ResizableHandle: React.FC<PanelResizeHandleProps & { direction?: 'horizontal' | 'vertical' }> = ({
  className,
  withHandle = true,
  direction = 'horizontal'
}) => {
  const handleRef = React.useRef<HTMLDivElement>(null);
  const isResizing = React.useRef(false);
  const startPos = React.useRef(0);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!handleRef.current?.parentElement) return;

      const parent = handleRef.current.parentElement;
      const prevSibling = parent.firstElementChild as HTMLElement;
      const nextSibling = parent.lastElementChild as HTMLElement;

      if (!prevSibling || !nextSibling) return;

      const delta = e.clientX - startPos.current;
      const parentSize = parent.clientWidth;
      const deltaPercent = (delta / parentSize) * 100;

      const prevStyle = window.getComputedStyle(prevSibling);
      const prevWidth = parseFloat(prevStyle.width) || prevSibling.clientWidth;
      const prevWidthPercent = (prevWidth / parentSize) * 100;

      const newPrevWidth = prevWidthPercent + deltaPercent;
      prevSibling.style.flex = `0 0 ${newPrevWidth}%`;
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      handleRef.current?.classList.remove('bg-primary', 'opacity-100');
      handleRef.current?.classList.add('bg-border');
    };

    if (isResizing.current) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startPos.current = e.clientX;
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    handleRef.current?.classList.remove('bg-border');
    handleRef.current?.classList.add('bg-primary', 'opacity-100');
  };

  return (
    <div
      ref={handleRef}
      onMouseDown={handleMouseDown}
      className={cn(
        'flex items-center justify-center bg-border',
        'hover:bg-primary/50 transition-colors cursor-col-resize',
        'w-2 relative z-10',
        className
      )}
    >
      {withHandle && (
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );
};

// 类型定义
export type ImperativePanelHandle = HTMLDivElement;

// 也导出原始名称以兼容现有代码
export { ResizablePanelGroup as PanelGroup, ResizablePanel as Panel, ResizableHandle as PanelResizeHandle };
