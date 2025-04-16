
import { useEffect, useRef } from 'react';

export const useInfiniteScroll = (
  callback: () => void,
  options?: {
    threshold?: number;
    root?: Element | null;
    rootMargin?: string;
  }
) => {
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      {
        threshold: options?.threshold || 0.1,
        root: options?.root || null,
        rootMargin: options?.rootMargin || '100px',
      }
    );

    const currentTarget = observerTarget.current;

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [callback, options]);

  return observerTarget;
};
