import config from '/config/config.json' assert { type: 'json' };

config.baseUrl = `${window.location.origin}/`;

window.config = config;
