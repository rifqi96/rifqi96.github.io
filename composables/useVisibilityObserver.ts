/**
 * A composable to handle section visibility and animations
 */

export function useVisibilityObserver() {
  const observedElements = ref<HTMLElement[]>([]);
  let observer: IntersectionObserver | null = null;

  const initObserver = () => {
    // Only create the observer on the client side
    if (!import.meta.client) return;

    const options = {
      threshold: 0.2,
      rootMargin: "0px 0px -10% 0px",
    };

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Force a reflow before adding the class
          (entry.target as HTMLElement).style.opacity;
          entry.target.classList.add("section-visible");

          // Once visible, stop observing this element
          if (observer) observer.unobserve(entry.target);
        }
      });
    }, options);
  };

  // Observe an element
  const observe = (element: HTMLElement | null) => {
    // Skip if not in client or element doesn't exist
    if (!import.meta.client || !element) return;

    if (!observer) {
      initObserver();
    }

    observer?.observe(element);
    observedElements.value.push(element);
  };

  // Clean up observer
  const cleanup = () => {
    if (observer) {
      observedElements.value.forEach((element) => {
        if (element instanceof HTMLElement) {
          observer?.unobserve(element);
        }
      });
      observer = null;
      observedElements.value = [];
    }
  };

  // Set up on mount and clean up on unmount
  onMounted(() => {
    if (import.meta.client) {
      initObserver();
    }
  });

  onUnmounted(() => {
    if (import.meta.client) {
      cleanup();
    }
  });

  return {
    observe,
    cleanup,
  };
}
