import { readonly, ref } from 'vue';
const showSideBar = ref(false);

export const getShowSideBar = () => readonly(showSideBar);
export const toggleSideBar = () => {
    showSideBar.value = !showSideBar.value;
};
