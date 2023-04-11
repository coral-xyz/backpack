---
sidebar_position: 3
title: Peristent Storage
---

Use the `LocalStorage` API to read and write local storage.
Keys must be strings and values must be any JSON serializible object.

```ts
import { LocalStorage } from "react-xnft";


function main() {
  // Read from local storage.
  const value = await LocalStorage.get("key");


  // Write to local storage.
  await LocalStorage.set("key", value);
}

```