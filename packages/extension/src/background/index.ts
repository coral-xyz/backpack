import { start } from "@200ms/background";

//
// Only run in the context of a service worker.
//
console.log("armani here testing!", navigator, navigator.serviceWorker);
//if (navigator.serviceWorker === undefined) {
start();
//}

//import {} from "@200ms/common";
