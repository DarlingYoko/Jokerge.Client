import { useSyncExternalStore } from 'react';

const subscribe = (query: string) => (callback: () => void) => {
  const mediaQueryList = window.matchMedia(query);
  mediaQueryList.addEventListener('change', callback);
  return () => mediaQueryList.removeEventListener('change', callback);
};

// SSR-safe: matches nothing on the server / before hydration, then syncs to the real viewport.
export const useMediaQuery = (query: string) => {
  return useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
};
