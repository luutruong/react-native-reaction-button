const path = require('path');
const {getDefaultConfig} = require('expo/metro-config');

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch the parent repo so changes to the linked library hot-reload.
config.watchFolders = [repoRoot];

// Force Metro to resolve every package from the example's own node_modules
// to avoid duplicate React/RN/Reanimated copies pulled via `link:..`.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
