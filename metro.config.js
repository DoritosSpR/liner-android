const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const config = mergeConfig(getDefaultConfig(__dirname), {
  resolver: {
    assetExts: [...getDefaultConfig(__dirname).resolver.assetExts, "db"],
  },
});

module.exports = config;
