# Change Log

## [0.9.0] 2025-01-13

### Added

- Smart flatten feature: automatically flattens redundant top-level folders with same name as archive
- Configuration option `vscode-archive.smartFlatten` to control smart flatten behavior (enabled by default)

### Fixed

- Resolved issue with redundant nested folders when extracting archives that contain a single top-level folder matching the archive name

## [0.8.0] 2024-03-09

### Added

- notify user when archive program not installed

## [0.7.0] 2024-03-09

### Added

- support compress/decompress `7zip`

## [0.6.2] 2024-03-09

### Fixed

- compression not working in remote sessions #4

## [0.6.0] 2024-03-08

### Added

- support bzip2 compress/decompress

## [0.5.0] 2023-07-16

### Fixed

- can't recognize gzip when use .gz extension

## [0.4.0] 2023-04-28

### Added

- support decompress/compress br
- log decompress/compress info

## [0.3.2] 2023-04-19

### Fixed

- fix compress usage screenshot link

## [0.3.1] 2023-04-19

### Changed

- add thanks and my extension recommendation parts to README

## [0.3.0] 2023-04-19

### Added

- support compress to .zip, .vsix, .asar, .tgz, .gzip, .tar

## [0.2.0] 2023-04-18

### Added

- support decompress .tgz/.gzip/.tar

## [0.1.6] 2023-03-20

### Changed

- reduce extension size
- adjust esbuild target

## [0.1.5] 2023-03-20

### Changed

- some code refactor

## [0.1.4] 2023-03-11

### Changed

- add usage gif

## [0.1.3] 2023-01-22

### Changed

- upgrade deps
- bundle extension by esbuild

## [0.1.2] 2022-04-30

### Added

- extension icon

## [0.1.1] 2022-02-20

### Changed

- optimize extension build size

## [0.1.0] 2022-02-19

### Added

- support decompress .asar

### Changed

- improve the startup speed

## [0.0.1]

### Added

- support decompress .zip, .vsix, .crx(v3)
