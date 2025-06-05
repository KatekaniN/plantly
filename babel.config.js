module.exports = function (api) {
    api.cache(true);

    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // Reanimated plugin must come first
            'react-native-reanimated/plugin',

            [
                'module-resolver',
                {
                    root: ['./'],
                    extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
                    alias: {
                        '@': './',
                        'components': './components',
                    },
                },
            ],
        ],
    };
};