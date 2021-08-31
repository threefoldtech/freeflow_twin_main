interface IConfig {
    baseUrl: string,
    appBackend: string,
    documentServerLocation: string,
    giphyApiKey: string,
}

//@ts-ignore
const config = <IConfig>window.config

export default config;
