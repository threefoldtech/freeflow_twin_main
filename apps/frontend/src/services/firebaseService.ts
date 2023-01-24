import axios from 'axios';
import config from '../config';
import { useAuthState } from '@/store/authStore';
import { retrieveFirebaseIdentifier } from '@/utils/webview.utils';
import { ref } from 'vue';

export let isFromMobileApp = ref<boolean>(false);

export const sendIdentifierToBackend = async (): Promise<void> => {
    console.log('Saving identifier to backend');
    const { user } = useAuthState();

    const identifier = await retrieveFirebaseIdentifier();

    if (!identifier || identifier == '') {
        return;
    }
    isFromMobileApp.value = true;

    const appId = user.id + '.' + config.getAppId();

    console.log('Posting to :', `${config.baseUrl}api/v2/firebase/identify`);
    console.log('Data: ', { appId: appId, identifier: identifier });
    try {
        await axios.post(`${config.baseUrl}api/v2/firebase/identify`, { appId: appId, identifier: identifier });
    } catch (e) {
        console.log(e);
        return;
    }
};
