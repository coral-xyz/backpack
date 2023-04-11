---
sidebar_position: 2
title: Navigation
---

Navigators are a foundational primitive for building UIs. React xNFT provides two navigators very similar in spirit to the React Native APIs: ```Tab``` and ```Stack```. These two handle much of the boilerplate of basic UI layout and screen transition animations.

### Tab Navigator

The ```Tab``` navigator allows you to transition from one screen to another with a bottom bar component.
For example, let's take a look at the DeGods xNFT.

!["Tab Navigator](./Images/Screenshot%202023-04-12%20032907.png)

At the bottom of the screen you can see two tab bar buttons. Currently, the left button is selected showing the current screen, but if we click the second tab on the right, we can transition to a new screen:

!["My Gods](./Images/Screenshot%202023-04-12%20033037.png)

For more, see the API reference.

### Stack Navigator

The Stack navigator works by creating a "stack" allowing you to "push" and "pop" screens on top of it. Continuing the above example, if you were to click on one of the gods, you can "push" onto the stack a new screen. For example

!["Stack Navigator](./Images/Screenshot%202023-04-12%20033233.png)

Other than transitioning to a new screen, notice a couple of things here. First we have a top nav bar, the title of which can be easily customized. Second, we have a back button. This is automatically added and allows us to "pop" screens of the stack, returning us to the previous page.

For more, see the API reference.