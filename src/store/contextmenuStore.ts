import {ref, watch} from "vue";

export enum RIGHT_CLICK_ACTIONS  {
    DELETE = "DELETE",
    RENAME = "RENAME",
    DOWNLOAD = "DOWNLOAD",
    SHARE = "SHARE"
}

export enum RIGHT_CLICK_TYPE {
    MESSAGE = "MESSAGE",
    LOCAL_FILE = "LOCAL_FILE"
}

interface ICurrentRightClickItem {
    type: RIGHT_CLICK_TYPE
    data: object
}

export const currentRightClickedItem = ref<ICurrentRightClickItem | null>(null)
export const rightClickItemAction = ref<RIGHT_CLICK_ACTIONS | null>(null)
export const triggerWatchOnRightClickItem = ref<boolean>(false)

