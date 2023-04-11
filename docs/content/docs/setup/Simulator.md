---
sidebar_position: 3
title: Simulator
---

Here we'll run your first xNFT inside the Backpack development simulator.

The simulator is an app that can be used for developing xNFTs directly inside Backpack with hot reloading.
### Clone the Quickstart Repo
First, setup your new xNFT repo. You can use the quickstart template [here](https://github.com/coral-xyz/xnft-quickstart).
1. ```git clone git@github.com:coral-xyz/xnft-quickstart.git ```
2. ```cd xnft-quickstart ```
3. ```yarn ```
4. ```yarn dev ```

This will start up the dev server for hot reloading.

### Open the Simulator
Now that you're running your xNFT development server, open up the Simulator app inside Backpack. Yuou need to turn on developer mode from the xnft settings for the simulator to appear in your xnfts.

!["Simulator"](./images/Screenshot%202023-04-12%20031028.png)

If everything is working, you should see ```Hello world``` rendered to the screen. And that's it! If you try changing the code, you should see the xNFT immediately reload with your changes.

!["Hello World"](./images/Screenshot%202023-04-12%20031002.png)

Now that you've got the basics setup for running your xNFT inside Backpack, we can cover the specific APIs of the ```react-xnft``` framework.