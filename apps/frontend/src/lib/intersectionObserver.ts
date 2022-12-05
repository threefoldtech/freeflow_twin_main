import { onMounted, Ref, ref, onUnmounted, watch } from 'vue';

export const useIntersectionObserver = (
    target: Ref<HTMLElement>,
    options: IntersectionObserverInit = { root: null, rootMargin: '0px' }
) => {
    const intersectionRatio = ref(0);
    const isIntersecting = ref(false);
    const isFullyInView = ref(false);
    const isObserved = ref(false);

    let observer: IntersectionObserver;

    onMounted(() => {
        observer = new IntersectionObserver(([entry]) => {
            intersectionRatio.value = entry.intersectionRatio;
            if (entry.intersectionRatio > 0) {
                isIntersecting.value = true;
                isFullyInView.value = entry.intersectionRatio >= 1;
                return;
            }

            isIntersecting.value = false;
        }, options);
    });

    const unobserve = () => {
        if (!observer) return;

        if (target.value) {
            observer.unobserve(target.value);
        }
    };

    onUnmounted(unobserve);

    watch(target, () => {
        if (isObserved.value || !target.value) return;
        observer.observe(target.value);
    });

    return {
        intersectionRatio,
        isIntersecting,
        isFullyInView,
        unobserve,
    };
};
