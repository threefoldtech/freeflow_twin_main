const plugin = require('tailwindcss/plugin');

module.exports = {
    purge: ['./public/**/*.html', './src/**/*.vue', './src/**/*.ts', './index.html'],
    mode: 'jit',
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                accent: {
                    50: '#eef5f2',
                    100: '#cff0ed',
                    200: '#97e8d5',
                    300: '#5bcfa9',
                    400: '#20b27a',
                    500: '#169951',
                    600: '#14833c',
                    700: '#146631',
                    800: '#0f4627',
                    900: '#0b2b1f',
                },
                icon: '#44A687',
                my: '#d0f0c0',
                btnred: '#D43838',
                bordergrey: '#E1E6EB',
                primary:"#1F0F5B",
                primarylight:"#7878EF",
                text:"#1F0933",
                secondary:"#D46638",
                secondarylight:"#F06930",
                interfacelight:"#E7E7EE",
                interface:"#A8A4B8",
                interfacedark:"#79758A",
                redcolor:"#D43838",
                redlight:"#EA5C5C",
                gradienta:"#544297",
                gradientb:"#36127C"
            },
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
