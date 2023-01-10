import axios from 'axios';
import config from '../config';
import { useAuthState } from '@/store/authStore';
import { sleep } from '@/utils';

export interface PostNotificationDto {
    timestamp: string;
    message: string;
    sender: string;
    group: string;
    me: string;
    appId: string;
}

export const retrieveFirebaseIdentifier = async (): Promise<string> => {
    // Sleep is needed due race conditions
    await sleep(1);

    let firebaseIdentifier = await globalThis.flutter_inappwebview.callHandler('RETRIEVE_IDENTIFIER');

    return firebaseIdentifier ?? '';
};

export const sendIdentifierToBackend = async (): Promise<void> => {
    console.log('Saving identifier to backend');
    const { user } = useAuthState();

    const identifier = await retrieveFirebaseIdentifier();
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
