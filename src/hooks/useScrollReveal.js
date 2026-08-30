import { useEffect } from 'react';

const useScrollReveal = (selector = '.reveal', options = {}) => {
  useEffect(() => {
    const defaultOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
      ...options
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Optional: observer.unobserve(entry.target) to only animate once
        }
      });
    }, defaultOptions);

    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [selector, options]);
};

export default useScrollReveal;
