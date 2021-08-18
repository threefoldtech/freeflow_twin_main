const plugin = require('tailwindcss/plugin');

module.exports = {
    purge: ['./public/**/*.html', './src/**/*.vue', './src/**/*.ts'],
    mode: 'jit',
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                accent: '#4EC48F',
                icon: '#44A687',
                my: '#d0f0c0',
                btngreen: '#16a085',
                btnred: '#ef4444',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        plugin(function({ addVariant, e }) {
            addVariant('my-message', ({ modifySelectors, separator }) => {
                modifySelectors(({ className }) => {
                    return `.my-message .${e(`my-message${separator}${className}`)}`;
                });
            });

            addVariant('collapsed-bar', ({ modifySelectors, separator }) => {
                modifySelectors(({ className }) => {
                    return `.collapsed-bar .${e(`collapsed-bar${separator}${className}`)}`;
                });
            });
        }),
        require('@tailwindcss/aspect-ratio'),
        require('tailwindcss-debug-screens'),
    ],
};
