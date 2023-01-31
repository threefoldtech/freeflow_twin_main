export const debounceFunction = (fn: any, delay: number) => {
    let timer;
    return (() => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(), delay);
    })();
};
