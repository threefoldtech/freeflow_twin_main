import { GiphyFetch } from '@giphy/js-fetch-api/dist';
import config from '../../public/config/config';

const gf = new GiphyFetch(config.giphyApiKey);

export const fetchGif = (search: string = null) => {
    if (!search) {
        return gf.trending({ limit: 10 });
    }

    return gf.search(search, { limit: 10 });
};
