import { useState, useEffect } from 'react';
import type { SectionId } from '@/types';

const SECTION_IDS: SectionId[] = ['overview', 'zone-compare', 'club-compare', 'day-analysis', 'court-details'];

export function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>('overview');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActive(id);
          }
        },
        { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  return active;
}
