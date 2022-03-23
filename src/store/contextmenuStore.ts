import { ref, watch } from 'vue';
import { Chat } from '@/types';

/************
 *
 *  Actions
 *
 ************/

export enum RIGHT_CLICK_ACTIONS_FILEBROWSER_ITEM {
    DELETE = 'DELETE',
    RENAME = 'RENAME',
    DOWNLOAD = 'DOWNLOAD',
    SHARE = 'SHARE',
}

export enum RIGHT_CLICK_ACTIONS_MESSAGE {
    REPLY = 'REPLY',
    EDIT = 'EDIT',
    DELETE = 'DELETE',
}
export enum RIGHT_CLICK_ACTIONS_CHAT_CARD {
    BLOCK = 'BLOCK',
    DELETE = 'DELETE',
    OPEN_CHAT = 'OPEN_CHAT',
}

export type RIGHT_CLICK_ACTIONS = RIGHT_CLICK_ACTIONS_MESSAGE | RIGHT_CLICK_ACTIONS_CHAT_CARD | RIGHT_CLICK_ACTIONS_FILEBROWSER_ITEM;

/**********
 *
 *  Types
 *
 **********/

export enum RIGHT_CLICK_TYPE {
    MESSAGE = 'MESSAGE',
    LOCAL_FILE = 'LOCAL_FILE',
    CHAT_CARD = 'CHAT_CARD',
}

/**********
 *
 *  State
 *
 **********/

interface ICurrentRightClickItem {
    type: RIGHT_CLICK_TYPE;
    data: Chat;
}

export const currentRightClickedItem = ref<ICurrentRightClickItem | null>(null);
export const rightClickItemAction = ref<RIGHT_CLICK_ACTIONS | null>(null);
export const triggerWatchOnRightClickItem = ref<boolean>(false);
export const openBlockDialogFromOtherFile = ref<boolean>(false);
export const openDeleteDialogFromOtherFile = ref<boolean>(false);

//This is so used to rerender a component
export const conversationComponentRerender = ref<number>(0);

export const setCurrentRightClickedItem = (item: Chat, type: RIGHT_CLICK_TYPE) => {
    triggerWatchOnRightClickItem.value = !triggerWatchOnRightClickItem;
    currentRightClickedItem.value = {
        type: type,
        data: item,
    };
};
