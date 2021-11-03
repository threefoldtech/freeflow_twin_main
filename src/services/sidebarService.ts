import { readonly, ref } from 'vue';

const getDefaultStatusSidebar = () => {
    const width = document.documentElement.clientWidth;
    if (width < 1024) return false;

    return true;
};

export const showSideBar = ref(getDefaultStatusSidebar());

export const getShowSideBar = () => readonly(showSideBar);
export const toggleSideBar = () => {
    showSideBar.value = !showSideBar.value;
};
export const disableSidebar = () => {
    showSideBar.value = false;
};
