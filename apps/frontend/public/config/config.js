const config = {
    appBackend: 'https://login.staging.jimber.io/',
    documentServerLocation: 'https://documentserver.digitaltwin-test.jimbertesting.be/',
    giphyApiKey: 'uk3XRSO0vYrPDEQKDPZJ2wGz33qzIxST',
    beta: true,
};

config.baseUrl = `${window.location.origin}/`;

window.config = config;
