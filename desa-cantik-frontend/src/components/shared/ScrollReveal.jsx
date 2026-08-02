// src/components/shared/ScrollReveal.jsx
import React, { useEffect, useRef, useState } from 'react';

export default function ScrollReveal({ children, className = '', delay = 0, duration = 700 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      setIsVisible(true);
      return;
    }

    // Fail-safe: force visibility after 1.5s if observer doesn't fire
    const timeoutId = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
          clearTimeout(timeoutId);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.01, // trigger as soon as 1% is visible
        rootMargin: '0px 0px -20px 0px', // trigger slightly before entering viewport fully
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      clearTimeout(timeoutId);
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
