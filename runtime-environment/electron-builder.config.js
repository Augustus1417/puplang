/**
 * @type {import('electron-builder').Configuration}
 */

const config = {
  appId: "com.puplang.app",
  productName: "PupLang",
  generateUpdatesFilesForAllChannels: true,
  asar: true,
  asarUnpack: ["interpreter/**/*"],
  directories: {
    buildResources: "public",
    output: "dist",
  },  
  publish: null,
  artifactName: process.env.CHANNEL === 'beta' ? 'Setup-${productName}${version}.${ext}' : 'Setup-${productName}${version}.${ext}',
  win: {
    icon: 'public/icon.png',
    target: [
      {
        target: "nsis",
        arch: ["x64"],
      },
    ],
  },
  linux: {
    target: [
      {
        target: "deb",
        arch: ["x64"],
      },
      {
        target: "AppImage",
        arch: ["x64"],
      },
    ],
  },
}

module.exports = config;
