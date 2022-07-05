import { Router } from 'express';
import axios from 'axios';
import { fetchChatList } from '../service/dockerService';

export const router = Router();

router.get('/', async (request, respose) => {
    const digitaltwinNames = await fetchChatList();
    const digitalTwinProfiles = digitaltwinNames.map(async digitaltwin => {
        const yggdrasilAddress = await axios.get(`http://${digitaltwin}-chat/api/yggdrasil_address`);
        return {
            id: digitaltwin,
            location: yggdrasilAddress.data,
        };
    });
    Promise.all(digitalTwinProfiles).then(data => {
        console.log('data', data);
        respose.json(data);
    });
});
