import { useEffect } from 'react';

/**
 * Custom hook to prevent background scrolling when a modal is open
 * Handles both desktop and mobile devices properly
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    // Get the current scroll position
    const scrollY = window.scrollY;
    
    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Store original styles
    const originalStyle = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
      marginRight: document.body.style.marginRight,
    };

    // Apply scroll lock styles
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.marginRight = `${scrollbarWidth}px`;

    // Cleanup function to restore original styles
    return () => {
      document.body.style.position = originalStyle.position;
      document.body.style.top = originalStyle.top;
      document.body.style.width = originalStyle.width;
      document.body.style.overflow = originalStyle.overflow;
      document.body.style.marginRight = originalStyle.marginRight;
      
      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}

/**
 * Alternative hook for simpler scroll prevention (without position restoration)
 * Use this if you don't need to maintain scroll position
 */
export function useSimpleScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Store original overflow and margin
      const originalOverflow = document.body.style.overflow;
      const originalMarginRight = document.body.style.marginRight;
      
      // Apply scroll lock
      document.body.style.overflow = 'hidden';
      document.body.style.marginRight = `${scrollbarWidth}px`;
      
      // Cleanup function
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.marginRight = originalMarginRight;
      };
    }
  }, [isLocked]);
}
