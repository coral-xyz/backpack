import express from "express";
import https from "https";

const router = express.Router();

const getUrl = (hash = "45b6c8d") =>
  `https://mobile-service-worker.xnfts.dev/background-scripts/${hash}`;

// Serve the HTML file
router.get("/loader", (_req, res) => {
  const baseUrl = getUrl();
  const url = `${baseUrl}/service-worker-loader.html`;

  https.get(url, (remoteRes) => {
    const headers = {
      ...remoteRes.headers,
      "Service-Worker-Allowed": "/",
    };

    res.set(headers);
    res.writeHead(remoteRes.statusCode || 200, "OK");
    remoteRes.pipe(res);
  });
});

// Serve the service worker file
router.get("/service-worker.js", (req, res) => {
  const baseUrl = getUrl();
  const url = `${baseUrl}/service-worker.js`;

  https.get(url, (remoteRes) => {
    const headers = {
      ...remoteRes.headers,
      "Service-Worker-Allowed": "/",
    };

    res.set(headers);
    res.writeHead(remoteRes.statusCode || 200, "OK");
    remoteRes.pipe(res);
  });
});

export default router;
