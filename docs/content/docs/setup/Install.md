---
sidebar_position: 2
title: Install
---

> **WARNING!**
> You should not follow these directions if you don't know what you're doing. Be vigilant and careful about installing anything on your machine. This page is for developers only.

### Install Backpack

1. To get started, first install Backpack.
2. Grab the latest alpha release from the [releases page](https://github.com/coral-xyz/backpack/releases). Then install it:
Open chrome, select the extensions puzzle icon, and click ```Manage Extensions```.
Enable ```Developer mode``` by selecting the switch at the top right of the ```Manage Extensions``` screen.
3. Click ```Load unpacked``` and select your newly extracted ```build``` directory.
4. Pin the extension on your toolbar and you're done installing.

### Install NPM Packages

Next you'll need to install packages to build your UI. You can skip this section for now.
#### Install the CLI
You'll need the CLI to bundle xNFTs. Run

``` bash
yarn add @coral-xyz/xnft-cli
```

#### Install React xNFT
You'll need the ```react-xnft``` package to build components. Run
``` bash
yarn add react-xnft
```

#### Build Versions
Note that packages are published and tagged corresponding to each Backpack build. If you have unexpected problems, make sure your package version corresponds with your version of Backpack.

To check your Backpack version, open up settings -> preferences and see the bottom of the screen.

![open up settings -> preferences and see the bottom of the screen.](./images/Screenshot%202023-04-12%20030309.png "Build Version")