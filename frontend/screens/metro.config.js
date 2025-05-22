const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts }
  } = await getDefaultConfig();
  
  return {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      sourceExts,
      assetExts,
      extraNodeModules: {
        crypto: require.resolve('react-native-crypto'),
        stream: require.resolve('readable-stream'),
        buffer: require.resolve('buffer'),
      }
    }
  };
})();