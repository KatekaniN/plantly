module.exports = function(api) {
api.cache(true);

return {
  presets: ['babel-preset-expo'],
  plugins: [
    // Reanimated plugin must come first
    'react-native-reanimated/plugin',
    
    // Optional: Add other common plugins if needed
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    
    // If you're using TypeScript paths
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
        },
      },
    ],
  ],
};
};