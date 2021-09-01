interface IConfig {
    baseUrl: string,
    appBackend: string,
    documentServerLocation: string,
    giphyApiKey: string,
    beta: boolean | null;
}

//@ts-ignore
const config = <IConfig>window.config;

export default config;
