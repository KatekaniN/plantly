module.exports = function (api) {
    api.cache(true);

    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // Reanimated plugin must come first
            'react-native-reanimated/plugin',

            // Update path resolution to match your project structure
            [
                'module-resolver',
                {
                    root: ['./'],
                    extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
                    alias: {
                        // Update this to match your actual project structure
                        '@': './',
                        'components': './components',
                    },
                },
            ],
        ],
    };
};