export function useChatScroll(
    getScrollRef: () => HTMLDivElement | undefined,
    getCount: () => number,
    shouldScroll: boolean = true
) {
    $effect(() => {
        const scrollRef = getScrollRef();
        const _ = getCount(); // Access for reactivity
        if (shouldScroll && scrollRef) {
            const bottom = scrollRef.scrollHeight;
            scrollRef.scrollTo({
                top: bottom,
                behavior: 'smooth'
            });
        }
    });
}
