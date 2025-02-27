/**
 * A composable to handle section visibility and animations
 */
import { ref, onMounted, onUnmounted } from "vue";

export function useVisibilityObserver() {
  const observedElements = ref<HTMLElement[]>([]);
  let observer: IntersectionObserver | null = null;

  const initObserver = () => {
    const options = {
      threshold: 0.2,
      rootMargin: "0px 0px -10% 0px",
    };

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Add debugging
        // console.log("Intersection detected:", {
        //   target: entry.target,
        //   isIntersecting: entry.isIntersecting,
        //   intersectionRatio: entry.intersectionRatio,
        // });

        if (entry.isIntersecting) {
          // Force a reflow before adding the class
          (entry.target as HTMLElement).style.opacity;
          entry.target.classList.add("section-visible");

          // Once visible, stop observing this element
          observer?.unobserve(entry.target);
        }
      });
    }, options);
  };

  // Observe an element
  const observe = (element: HTMLElement | null) => {
    if (!element) return;

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
        observer?.unobserve(element);
      });
      observer = null;
      observedElements.value = [];
    }
  };

  // Set up on mount and clean up on unmount
  onMounted(() => {
    initObserver();
  });

  onUnmounted(() => {
    cleanup();
  });

  return {
    observe,
    cleanup,
  };
}
