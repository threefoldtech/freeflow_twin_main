import { ref, readonly} from 'vue';

const imageSrc = ref<string>();

export const getImageSrc = () => readonly(imageSrc);
export const clearImageSrc = () => {
    setImageSrc(undefined);
}
export const setImageSrc = (src: string) => {
    imageSrc.value = src;
}