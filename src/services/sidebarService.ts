import { readonly, ref } from 'vue';
export const showSideBar = ref(false);

export const getShowSideBar = () => readonly(showSideBar);
export const toggleSideBar = () => {
    showSideBar.value = !showSideBar.value;
};
export const disableSidebar = () => {
    showSideBar.value = false;
};
