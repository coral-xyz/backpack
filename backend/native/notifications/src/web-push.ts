import url from "url";
import { encrypt } from "./encryption-helper";
import urlBase64 from 'urlsafe-base64';
import { getVapidHeaders } from "./vapid-helper";
const vapidKeys = {
    publicKey:
        'BA_9ntbAGy7SAn9oUzkGiWQXqCqc1BQs-7OK6C4fMkC7Y0nWiPqhNPder3-nklzley4IetxjSCd6cI8jHgZ01us',
    privateKey: 'vuTZva3AJNUvmwQG6VGZTM3QIiy6xpuBktn3wPtQB2w',
}

let gcmAPIKey = '';
let vapidDetails = {
    subject: 'mailto:harkirat@200ms.io',
    publicKey: vapidKeys.publicKey,
    privateKey: vapidKeys.privateKey
};
const DEFAULT_TTL = 2419200;

export const webPushConstants = {
    supportedContentEncodings: {
        AES_GCM: 'aesgcm',
        AES_128_GCM: 'aes128gcm'
    }
};


const generateRequestDetails = (subscription: any, payload: any, options: any) => {
    if (!subscription || !subscription.endpoint) {
        throw new Error('You must pass in a subscription with at least '
            + 'an endpoint.');
    }

    if (typeof subscription.endpoint !== 'string'
        || subscription.endpoint.length === 0) {
        throw new Error('The subscription endpoint must be a string with '
            + 'a valid URL.');
    }

    if (payload) {
        // Validate the subscription keys
        if (typeof subscription !== 'object' || !subscription.keys
            || !subscription.keys.p256dh
            || !subscription.keys.auth) {
            throw new Error('To send a message with a payload, the '
                + 'subscription must have \'auth\' and \'p256dh\' keys.');
        }
    }

    let currentGCMAPIKey = gcmAPIKey;
    let currentVapidDetails = vapidDetails;
    let timeToLive = DEFAULT_TTL;
    let extraHeaders = {};
    let contentEncoding = webPushConstants.supportedContentEncodings.AES_128_GCM;
    let proxy;
    let agent;
    let timeout;

    if (options) {
        const validOptionKeys = [
            'headers',
            'gcmAPIKey',
            'vapidDetails',
            'TTL',
            'contentEncoding',
            'proxy',
            'agent',
            'timeout'
        ];
        const optionKeys = Object.keys(options);
        for (let i = 0; i < optionKeys.length; i += 1) {
            const optionKey = optionKeys[i];
            if (validOptionKeys.indexOf(optionKey) === -1) {
                throw new Error('\'' + optionKey + '\' is an invalid option. '
                    + 'The valid options are [\'' + validOptionKeys.join('\', \'')
                    + '\'].');
            }
        }

        if (options.headers) {
            extraHeaders = options.headers;
            let duplicates = Object.keys(extraHeaders)
                .filter(function (header) {
                    return typeof options[header] !== 'undefined';
                });

            if (duplicates.length > 0) {
                throw new Error('Duplicated headers defined ['
                    + duplicates.join(',') + ']. Please either define the header in the'
                    + 'top level options OR in the \'headers\' key.');
            }
        }

        if (options.gcmAPIKey) {
            currentGCMAPIKey = options.gcmAPIKey;
        }

        // Falsy values are allowed here so one can skip Vapid `else if` below and use FCM
        if (options.vapidDetails !== undefined) {
            currentVapidDetails = options.vapidDetails;
        }

        if (options.TTL !== undefined) {
            timeToLive = Number(options.TTL);
            if (timeToLive < 0) {
                throw new Error('TTL should be a number and should be at least 0');
            }
        }

        if (options.contentEncoding) {
            if ((options.contentEncoding === webPushConstants.supportedContentEncodings.AES_128_GCM
                || options.contentEncoding === webPushConstants.supportedContentEncodings.AES_GCM)) {
                contentEncoding = options.contentEncoding;
            } else {
                throw new Error('Unsupported content encoding specified.');
            }
        }

        if (options.proxy) {
            if (typeof options.proxy === 'string'
                || typeof options.proxy.host === 'string') {
                proxy = options.proxy;
            } else {
                console.warn('Attempt to use proxy option, but invalid type it should be a string or proxy options object.');
            }
        }

        // if (options.agent) {
        //     if (options.agent instanceof https.Agent) {
        //         if (proxy) {
        //             console.warn('Agent option will be ignored because proxy option is defined.');
        //         }
        //
        //         agent = options.agent;
        //     } else {
        //         console.warn('Wrong type for the agent option, it should be an instance of https.Agent.');
        //     }
        // }

        if (typeof options.timeout === 'number') {
            timeout = options.timeout;
        }
    }

    if (typeof timeToLive === 'undefined') {
        timeToLive = DEFAULT_TTL;
    }

    const requestDetails: any = {
        method: 'POST',
        headers: {
            TTL: timeToLive
        }
    };
    Object.keys(extraHeaders).forEach(function (header: any) {
        //@ts-ignore
        requestDetails.headers[header] = extraHeaders[header];
    });
    let requestPayload = null;

    if (payload) {
        const encrypted = encrypt(subscription.keys.p256dh, subscription.keys.auth, payload, contentEncoding);

        requestDetails.headers['Content-Length'] = encrypted.cipherText.length;
        requestDetails.headers['Content-Type'] = 'application/octet-stream';

        if (contentEncoding === webPushConstants.supportedContentEncodings.AES_128_GCM) {
            requestDetails.headers['Content-Encoding'] = webPushConstants.supportedContentEncodings.AES_128_GCM;
        } else if (contentEncoding === webPushConstants.supportedContentEncodings.AES_GCM) {
            requestDetails.headers['Content-Encoding'] = webPushConstants.supportedContentEncodings.AES_GCM;
            requestDetails.headers.Encryption = 'salt=' + encrypted.salt;
            requestDetails.headers['Crypto-Key'] = 'dh=' + urlBase64.encode(encrypted.localPublicKey);
        }

        requestPayload = encrypted.cipherText;
    } else {
        requestDetails.headers['Content-Length'] = 0;
    }

    const isGCM = subscription.endpoint.indexOf('https://android.googleapis.com/gcm/send') === 0;
    const isFCM = subscription.endpoint.indexOf('https://fcm.googleapis.com/fcm/send') === 0;
    // VAPID isn't supported by GCM hence the if, else if.
    if (isGCM) {
        if (!currentGCMAPIKey) {
            console.warn('Attempt to send push notification to GCM endpoint, '
                + 'but no GCM key is defined. Please use setGCMApiKey() or add '
                + '\'gcmAPIKey\' as an option.');
        } else {
            requestDetails.headers.Authorization = 'key=' + currentGCMAPIKey;
        }
    } else if (currentVapidDetails) {
        const parsedUrl = url.parse(subscription.endpoint);
        const audience = parsedUrl.protocol + '//'
            + parsedUrl.host;

        const vapidHeaders = getVapidHeaders(
            audience,
            currentVapidDetails.subject,
            currentVapidDetails.publicKey,
            currentVapidDetails.privateKey,
            contentEncoding
        );

        requestDetails.headers.Authorization = vapidHeaders.Authorization;

        if (contentEncoding === webPushConstants.supportedContentEncodings.AES_GCM) {
            if (requestDetails.headers['Crypto-Key']) {
                requestDetails.headers['Crypto-Key'] += ';'
                    + vapidHeaders['Crypto-Key'];
            } else {
                requestDetails.headers['Crypto-Key'] = vapidHeaders['Crypto-Key'];
            }
        }
    } else if (isFCM && currentGCMAPIKey) {
        requestDetails.headers.Authorization = 'key=' + currentGCMAPIKey;
    }

    requestDetails.body = requestPayload;
    requestDetails.endpoint = subscription.endpoint;

    if (proxy) {
        requestDetails.proxy = proxy;
    }

    if (agent) {
        requestDetails.agent = agent;
    }

    if (timeout) {
        requestDetails.timeout = timeout;
    }

    return requestDetails;
};


export const sendNotification = function(subscription: any, payload: any, options: any) {
    let requestDetails: any;
    try {
        requestDetails = generateRequestDetails(subscription, payload, options);
        console.log(requestDetails);
    } catch (err) {
        console.error(err);
        return Promise.reject(err);
    }
    return fetch(requestDetails.endpoint, {
        method: requestDetails.method,
        headers: requestDetails.headers,
    });
};

