const plugin = require('tailwindcss/plugin');
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    purge: ['./public/**/*.html', './src/**/*.vue', './src/**/*.ts', './index.html'],
    mode: 'jit',
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                accent: {
                    50: '#f8fafb',
                    100: '#e9f1fc',
                    200: '#d1daf8',
                    300: '#abb5ee',
                    400: '#898ce1',
                    500: '#6f67d5',
                    600: '#5a4bc1',
                    700: '#44389d',
                    800: '#2e266f',
                    900: '#1a1743',
                },
                icon: '#2e266f',
                my: '#d0f0c0',
                btnred: '#D43838',
                bordergrey: '#E1E6EB',
                primary: '#1F0F5B',
                primarylight: '#7878EF',
                text: '#1F0933',
                secondary: '#D46638',
                secondarylight: '#F06930',
                interfacelight: '#E7E7EE',
                interface: '#A8A4B8',
                interfacedark: '#79758A',
                redcolor: '#D43838',
                redlight: '#EA5C5C',
                gradienta: '#544297',
                gradientb: '#36127C',
            },
        },
        fontFamily: {
            sans: ['inter', ...defaultTheme.fontFamily.sans],
            serif: [...defaultTheme.fontFamily.serif],
            mono: [...defaultTheme.fontFamily.mono],
        },
    },
    plugins: [
        plugin(function ({ addVariant, e }) {
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
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        require('tailwindcss-debug-screens'),
        require('tailwindcss-hero-patterns'),
    ],
};
