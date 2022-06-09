import { DtId } from './../types/index';
import axios from 'axios';
import { ref } from 'vue';
import { reactive } from '@vue/reactivity';
import { useAuthState } from '@/store/authStore';
import { calcExternalResourceLink } from '../services/urlService';
import { Contact } from '@/types';

export const statusList = reactive<Object>({});
export const fetching: string[] = [];
export const watchingUsers = [];
export const showUserOfflineMessage = ref<boolean>(false);

export const fetchStatus = async (digitalTwinId: DtId) => {
    const { user } = useAuthState();
    const locationApiEndpoint = '/api/v2/user/status';
    let location = '';
    if (digitalTwinId == user.id) {
        location = `${window.location.origin}${locationApiEndpoint}`;
    } else {
        location = calcExternalResourceLink(
            `https://[${watchingUsers[<string>digitalTwinId].location}]${locationApiEndpoint}`
        );
    }
    try {
        const { data } = await axios.get(location, { timeout: 5000 });
        statusList[<string>digitalTwinId] = data;
        return data;
    } catch (error) {
        showUserOfflineMessage.value = true;
    }
};

export const startFetchStatusLoop = async (contact: Contact) => {
    if (watchingUsers.find(wu => wu === contact.id)) {
        return;
    }
    watchingUsers.push(contact.id);
    watchingUsers[<string>contact.id] = {
        location: contact.location,
    };
    fetching.push(<string>contact.id);

    await fetchStatus(contact.id);
    fetching.splice(fetching.indexOf(<string>contact.id), 1);
    // setInterval(async () => {
    //     try {
    //         if (fetching.indexOf(<string>contact.id) !== -1) {
    //             return;
    //         }
    //         fetching.push(<string>contact.id);
    //         await fetchStatus(contact.id);

    //         fetching.splice(fetching.indexOf(<string>contact.id), 1);
    //     } catch (e) {
    //         setTimeout(() => {
    //             fetching.splice(fetching.indexOf(<string>contact.id), 1);
    //         }, 10000);
    //     }
    // }, 5000);
};
