import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

type UseResizableSplitOptions = {
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
};

export function useResizableSplit({
  initialWidth = 58,
  minWidth = 45,
  maxWidth = 63,
}: UseResizableSplitOptions = {}) {
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const [leftPaneWidth, setLeftPaneWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isResizing) return;

    const onMouseMove = (event: MouseEvent) => {
      const container = splitContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = ((event.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(maxWidth, Math.max(minWidth, pct));
      setLeftPaneWidth(clamped);
    };

    const onMouseUp = () => setIsResizing(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing, maxWidth, minWidth]);

  const splitStyle = useMemo(
    () => ({ '--left-pane': `${leftPaneWidth}%` }) as CSSProperties,
    [leftPaneWidth],
  );

  const startResizing = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsResizing(true);
  };

  return {
    splitContainerRef,
    splitStyle,
    startResizing,
  };
}
