import { useState, useEffect } from 'react';

function getBreakpoint() {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

const LIMITS = {
  desktop: { preview: 8, detail: 16 },
  tablet:  { preview: 6, detail: 12 },
  mobile:  { preview: 4, detail: 8  },
};

export function useResponsiveLimit(isAuthenticated) {
  const [bp, setBp] = useState(getBreakpoint);

  useEffect(() => {
    const onResize = () => setBp(getBreakpoint());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!isAuthenticated) return { preview: 3, detail: LIMITS[bp].detail };
  return LIMITS[bp];
}
