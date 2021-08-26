interface IConfig {
    baseUrl: string,
    appBackend: string,
    documentServerUrl: string,
    giphyApiKey: string,
}

//@ts-ignore
const config = <IConfig>window.config

export default config;
