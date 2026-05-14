const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite's web worker imports wa-sqlite.wasm via a JS import statement.
// Metro will only resolve that import for extensions listed in assetExts;
// without "wasm" here the worker.bundle request fails with a 500.
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

// The COI service worker sets COOP/COEP on the document, but Web Workers
// created from the page inherit COEP `require-corp` and then fetch their own
// scripts (e.g. expo-sqlite's worker.bundle) directly from Metro — those
// fetches do NOT go through the SW, so they need CORP set at the source or
// COEP blocks them and importScripts fails. Setting CORP here on every Metro
// response unblocks the worker bundle and the wa-sqlite WASM.
config.server = config.server || {};
const previousEnhance = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const wrapped = previousEnhance ? previousEnhance(middleware, server) : middleware;
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    return wrapped(req, res, next);
  };
};

module.exports = config;
