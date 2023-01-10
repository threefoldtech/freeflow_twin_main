import axios from 'axios';
import config from '../config';
import { useAuthState } from '@/store/authStore';
import { sleep } from '@/utils';

export interface PostNotificationDto {
    message: string;
    sender: string;
    group: string;
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

    if (!identifier || identifier == '') return;

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

export const sendNotificationToBackend = async (notificationData: PostNotificationDto): Promise<void> => {
    console.log('Posting notification to backend');
    const { user } = useAuthState();

    const timestamp = new Date().getTime();
    const appId = user.id + '.' + config.getAppId();

    const data = {
        timestamp: timestamp.toString(),
        message: notificationData.message,
        sender: notificationData.sender,
        group: notificationData.group,
        me: user.id,
        appId: appId,
    };

    console.log('Posting to :', `${config.baseUrl}api/v2/firebase/notifiy`);
    console.log('Data: ', data);
    try {
        await axios.post(`${config.baseUrl}api/v2/firebase/notify`, data);
    } catch (e) {
        console.log(e);
        return;
    }
};
