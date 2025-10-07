# Scroll Lock Hook

This directory contains a custom React hook for preventing background scrolling when modals or overlays are open.

## useScrollLock

A React hook that prevents the background page from scrolling when a modal or overlay is open. This improves user experience by keeping focus on the modal content.

### Features

- Prevents background scrolling on both desktop and mobile
- Maintains scroll position when modal closes
- Prevents layout shift by accounting for scrollbar width
- Automatically cleans up when component unmounts

### Usage

```tsx
import { useScrollLock } from '../hooks/useScrollLock';

function MyModal({ isOpen }) {
  // Prevent background scrolling when modal is open
  useScrollLock(isOpen);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      {/* Modal content */}
    </div>
  );
}
```

### API

#### useScrollLock(isLocked: boolean)

- `isLocked`: Boolean indicating whether scroll should be locked
- Returns: void

#### useSimpleScrollLock(isLocked: boolean)

Alternative hook for simpler scroll prevention without position restoration.

- `isLocked`: Boolean indicating whether scroll should be locked
- Returns: void

### Implementation Details

The hook:
1. Calculates the current scroll position
2. Calculates scrollbar width to prevent layout shift
3. Applies fixed positioning to the body element
4. Restores original styles and scroll position on cleanup

### Browser Support

Works in all modern browsers. The hook handles edge cases like:
- Mobile devices with different scroll behaviors
- Pages with different scrollbar widths
- Dynamic content that changes page height
