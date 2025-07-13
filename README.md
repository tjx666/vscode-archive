# VSCode archive

<div align="center">

[![Version](https://img.shields.io/visual-studio-marketplace/v/YuTengjing.vscode-archive)](https://marketplace.visualstudio.com/items/YuTengjing.vscode-archive/changelog) [![Installs](https://img.shields.io/visual-studio-marketplace/i/YuTengjing.vscode-archive)](https://marketplace.visualstudio.com/items?itemName=YuTengjing.vscode-archive) [![Downloads](https://img.shields.io/visual-studio-marketplace/d/YuTengjing.vscode-archive)](https://marketplace.visualstudio.com/items?itemName=YuTengjing.vscode-archive) [![Rating Star](https://img.shields.io/visual-studio-marketplace/stars/YuTengjing.vscode-archive)](https://marketplace.visualstudio.com/items?itemName=YuTengjing.vscode-archive&ssr=false#review-details) [![Last Updated](https://img.shields.io/visual-studio-marketplace/last-updated/YuTengjing.vscode-archive)](https://github.com/tjx666/vscode-archive)

[![CI](https://github.com/tjx666/vscode-archive/actions/workflows/ci.yml/badge.svg)](https://github.com/tjx666/vscode-archive/actions/workflows/test.yml) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com) [![Github Open Issue](https://img.shields.io/github/issues/tjx666/vscode-archive)](https://github.com/tjx666/vscode-archive/issues) [![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg?style=flat-square)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

</div>

compress/decompress .zip/.vsix/.crx(v3)/.asar/.tgz/.gzip/.br/.tar

## Feature

### decompress

decompress .zip, .vsix, .crx(v3), .asar, .tgz, .gzip, .br, .tar

![decompress](https://github.com/tjx666/vscode-archive/blob/main/assets/decompress.gif?raw=true)

#### Smart Flatten

Automatically flattens redundant top-level folders that have the same name as the archive. This prevents creating unnecessary nested folders like:

```plaintext
Before: archive.zip → archive/ → archive/ → files...
After:  archive.zip → archive/ → files...
```

This feature is enabled by default and can be controlled via the `vscode-archive.smartFlatten` setting.

### compress

compress to .zip, .vsix, .asar, .tgz, .gzip, .br, .tar

![compress](https://github.com/tjx666/vscode-archive/blob/main/assets/compress.png?raw=true)

## Configuration

### Smart Flatten

- **Setting**: `vscode-archive.smartFlatten`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Automatically flatten single top-level folder with same name as archive to avoid redundant nested folders.

To disable this feature, add the following to your VSCode settings:

```json
{
  "vscode-archive.smartFlatten": false
}
```

## Note

### Bzip2

If you want to compress/decompress `bzip2`, the `bzip2` executable program must be installed in your system and can be accessed from shell.

For **MacOS** and **Linux** users, the `bzip2` normally had been pre-installed by system.

But for **windows** users, you need to [install it](https://www.google.com/search?q=bzip2+windows).

### 7zip

For compress/decompress `7zip`, you need to install `7zip` and make sure executable program `7z` accessible from shell.

You can find `7zip` installation info from [7-zip official website](https://www.7-zip.org/)

## Thanks

- [compressing](https://github.com/node-modules/compressing) provide easy to used api for compress/decompress

## My extensions

- [Open in External App](https://github.com/tjx666/open-in-external-app)
- [Package Manager Enhancer](https://github.com/tjx666/package-manager-enhancer)
- [Neo File Utils](https://github.com/tjx666/vscode-archive)
- [Reload Can Solve Any Problems](https://github.com/tjx666/reload-can-solve-any-problems)
- [VSCode FE Helper](https://github.com/tjx666/vscode-fe-helper)
- [Better Colorizer](https://github.com/tjx666/better-colorizer)
- [Modify File Warning](https://github.com/tjx666/modify-file-warning)
- [Power Edit](https://github.com/tjx666/power-edit)
- [Adobe Extension Development Tools](https://github.com/tjx666/vscode-adobe-extension-devtools)
- [Scripting Listener](https://github.com/tjx666/scripting-listener)

Check all here: [publishers/YuTengjing](https://marketplace.visualstudio.com/publishers/YuTengjing)
