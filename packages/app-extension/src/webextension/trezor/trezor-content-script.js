/******/ (() => {
  // webpackBootstrap
  /******/ var __webpack_modules__ = {
    /***/ 312: /***/ (
      __unused_webpack_module,
      exports,
      __webpack_require__
    ) => {
      "use strict";
      var __webpack_unused_export__;

      __webpack_unused_export__ = {
        value: true,
      };
      exports.E = void 0;
      const connect_common_1 = __webpack_require__(424);
      class WindowServiceWorkerChannel extends connect_common_1.AbstractMessageChannel {
        constructor({ name, channel }) {
          super({
            channel,
            sendFn: (message) => {
              if (!this.port) throw new Error("port not assigned");
              this.port.postMessage(message);
            },
          });
          const port = chrome.runtime.connect({
            name,
          });
          this.port = port;
          this.connect();
        }
        connect() {
          var _a;
          (_a = this.port) === null || _a === void 0
            ? void 0
            : _a.onMessage.addListener((message) => {
                if (message.channel.here === this.channel.here) return;
                this.onMessage(message);
              });
          this.isConnected = true;
        }
        disconnect() {
          var _a;
          if (!this.isConnected) return;
          (_a = this.port) === null || _a === void 0 ? void 0 : _a.disconnect();
          this.isConnected = false;
        }
      }
      exports.E = WindowServiceWorkerChannel;

      /***/
    },

    /***/ 424: /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      "use strict";
      // ESM COMPAT FLAG
      __webpack_require__.r(__webpack_exports__);

      // EXPORTS
      __webpack_require__.d(__webpack_exports__, {
        AbstractMessageChannel: () => /* reexport */ AbstractMessageChannel,
        getInstallerPackage: () => /* reexport */ getInstallerPackage,
        getSystemInfo: () => /* reexport */ getSystemInfo,
        storage: () => /* reexport */ storage,
      });

      // EXTERNAL MODULE: ../../node_modules/events/events.js
      var events = __webpack_require__(928); // CONCATENATED MODULE: ../utils/src/typedEventEmitter.ts
      /*
Usage example:
type EventMap = {
    obj: { id: string };
    primitive: boolean | number | string | symbol;
    noArgs: undefined;
    multipleArgs: (a: number, b: string, c: boolean) => void;
    [type: `dynamic/${string}`]: boolean;
};
*/

      // NOTE: case 1. looks like case 4. but works differently. the order matters

      // 4. default

      // eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
      class TypedEmitter extends events.EventEmitter {
        // implement at least one function
        listenerCount(eventName) {
          return super.listenerCount(eventName);
        }
      } // CONCATENATED MODULE: ../connect-common/src/storage.ts
      // https://github.com/trezor/connect/blob/develop/src/js/storage/index.js

      const storageVersion = 2;
      const storageName = `storage_v${storageVersion}`;

      /**
       * remembered:
       *  - physical device from webusb pairing dialogue
       *  - passphrase to be used
       */

      // TODO: move storage somewhere else. Having it here brings couple of problems:
      // - We can not import types from connect (would cause cyclic dependency)
      // - it has here dependency on window object, not good

      const getEmptyState = () => ({
        origin: {},
      });
      let memoryStorage = getEmptyState();
      const getPermanentStorage = () => {
        const ls = localStorage.getItem(storageName);
        return ls ? JSON.parse(ls) : getEmptyState();
      };
      class Storage extends TypedEmitter {
        save(getNewState, temporary = false) {
          if (temporary || !__webpack_require__.g.window) {
            memoryStorage = getNewState(memoryStorage);
            return;
          }
          try {
            const newState = getNewState(getPermanentStorage());
            localStorage.setItem(storageName, JSON.stringify(newState));
            this.emit("changed", newState);
          } catch (err) {
            // memory storage is fallback of the last resort
            console.warn("long term storage not available");
            memoryStorage = getNewState(memoryStorage);
          }
        }
        saveForOrigin(getNewState, origin, temporary = false) {
          this.save(
            (state) => ({
              ...state,
              origin: {
                ...state.origin,
                [origin]: getNewState(state.origin?.[origin] || {}),
              },
            }),
            temporary
          );
        }
        load(temporary = false) {
          if (temporary || !__webpack_require__.g?.window?.localStorage) {
            return memoryStorage;
          }
          try {
            return getPermanentStorage();
          } catch (err) {
            // memory storage is fallback of the last resort
            console.warn("long term storage not available");
            return memoryStorage;
          }
        }
        loadForOrigin(origin, temporary = false) {
          const state = this.load(temporary);
          return state.origin?.[origin] || {};
        }
      }
      const storage = new Storage(); // CONCATENATED MODULE: ../utils/src/createDeferred.ts

      // unwrap promise response from Deferred

      const createDeferred = (id) => {
        let localResolve = () => {};
        let localReject = () => {};
        const promise = new Promise((resolve, reject) => {
          localResolve = resolve;
          localReject = reject;
        });
        return {
          id,
          resolve: localResolve,
          reject: localReject,
          promise,
        };
      }; // CONCATENATED MODULE: ../utils/src/scheduleAction.ts
      // Ignored when attempts is AttemptParams[]

      const isArray = (attempts) => Array.isArray(attempts);
      const abortedBySignal = () => new Error("Aborted by signal");
      const abortedByDeadline = () => new Error("Aborted by deadline");
      const abortedByTimeout = () => new Error("Aborted by timeout");
      const resolveAfterMs = (ms, clear) =>
        new Promise((resolve, reject) => {
          if (clear.aborted) return reject();
          if (ms === undefined) return resolve();
          const timeout = setTimeout(resolve, ms);
          const onClear = () => {
            clearTimeout(timeout);
            clear.removeEventListener("abort", onClear);
            reject();
          };
          clear.addEventListener("abort", onClear);
        });
      const rejectAfterMs = (ms, reason, clear) =>
        new Promise((_, reject) => {
          if (clear.aborted) return reject();
          const timeout =
            ms !== undefined
              ? setTimeout(() => reject(reason()), ms)
              : undefined;
          const onClear = () => {
            clearTimeout(timeout);
            clear.removeEventListener("abort", onClear);
            reject();
          };
          clear.addEventListener("abort", onClear);
        });
      const rejectWhenAborted = (signal, clear) =>
        new Promise((_, reject) => {
          if (clear.aborted) return reject();
          if (signal?.aborted) return reject(abortedBySignal());
          const onAbort = () => reject(abortedBySignal());
          signal?.addEventListener("abort", onAbort);
          const onClear = () => {
            signal?.removeEventListener("abort", onAbort);
            clear.removeEventListener("abort", onClear);
            reject();
          };
          clear.addEventListener("abort", onClear);
        });
      const resolveAction = async (action, clear) => {
        const aborter = new AbortController();
        const onClear = () => aborter.abort();
        if (clear.aborted) onClear();
        clear.addEventListener("abort", onClear);
        try {
          return await new Promise((resolve) =>
            resolve(action(aborter.signal))
          );
        } finally {
          clear.removeEventListener("abort", onClear);
        }
      };
      const attemptLoop = async (attempts, attempt, failure, clear) => {
        // Tries only (attempts - 1) times, because the last attempt throws its error
        for (let a = 0; a < attempts - 1; a++) {
          if (clear.aborted) break;
          const aborter = new AbortController();
          const onClear = () => aborter.abort();
          clear.addEventListener("abort", onClear);
          try {
            return await attempt(a, aborter.signal);
          } catch {
            onClear();
            await failure(a);
          } finally {
            clear.removeEventListener("abort", onClear);
          }
        }
        return clear.aborted ? Promise.reject() : attempt(attempts - 1, clear);
      };
      const scheduleAction = async (action, params) => {
        const { signal, delay, attempts, timeout, deadline, gap } = params;
        const deadlineMs = deadline && deadline - Date.now();
        const attemptCount = isArray(attempts)
          ? attempts.length
          : attempts ?? (deadline ? Infinity : 1);
        const clearAborter = new AbortController();
        const clear = clearAborter.signal;
        const getParams = isArray(attempts)
          ? (attempt) => attempts[attempt]
          : () => ({
              timeout,
              gap,
            });
        try {
          return await Promise.race([
            rejectWhenAborted(signal, clear),
            rejectAfterMs(deadlineMs, abortedByDeadline, clear),
            resolveAfterMs(delay, clear).then(() =>
              attemptLoop(
                attemptCount,
                (attempt, abort) =>
                  Promise.race([
                    rejectAfterMs(
                      getParams(attempt).timeout,
                      abortedByTimeout,
                      clear
                    ),
                    resolveAction(action, abort),
                  ]),
                (attempt) => resolveAfterMs(getParams(attempt).gap ?? 0, clear),
                clear
              )
            ),
          ]);
        } finally {
          clearAborter.abort();
        }
      }; // CONCATENATED MODULE: ../connect-common/src/messageChannel/abstract.ts
      /**
       * IMPORTS WARNING
       * this file is bundled into content script so be careful what you are importing not to bloat the bundle
       */

      // TODO: so logger should be probably moved to connect common, or this file should be moved to connect
      // import type { Log } from '@trezor/connect/lib/utils/debug';

      /**
       * concepts:
       * - it handshakes automatically with the other side of the channel
       * - it queues messages fired before handshake and sends them after handshake is done
       */
      class AbstractMessageChannel extends TypedEmitter {
        messagePromises = {};
        /** queue of messages that were scheduled before handshake */
        messagesQueue = [];
        messageID = 0;
        isConnected = false;
        handshakeMaxRetries = 5;
        handshakeRetryInterval = 2000;

        /**
         * function that passes data to the other side of the channel
         */

        /**
         * channel identifiers that pairs AbstractMessageChannel instances on sending and receiving end together
         */

        constructor({
          sendFn,
          channel,
          logger,
          lazyHandshake = false,
          legacyMode = false,
        }) {
          super();
          this.channel = channel;
          this.sendFn = sendFn;
          this.lazyHandshake = lazyHandshake;
          this.legacyMode = legacyMode;
          this.logger = logger;
        }

        /**
         * initiates handshake sequence with peer. resolves after communication with peer is established
         */
        init() {
          if (!this.handshakeFinished) {
            this.handshakeFinished = createDeferred();
            if (this.legacyMode) {
              // Bypass handshake for communication with legacy components
              // We add a delay for enough time for the other side to be ready
              setTimeout(() => {
                this.handshakeFinished?.resolve();
              }, 500);
            }
            if (!this.lazyHandshake) {
              // When `lazyHandshake` handshakeWithPeer will start when received channel-handshake-request.
              this.handshakeWithPeer();
            }
          }
          return this.handshakeFinished.promise;
        }

        /**
         * handshake between both parties of the channel.
         * both parties initiate handshake procedure and keep asking over time in a loop until they time out or receive confirmation from peer
         */
        handshakeWithPeer() {
          this.logger?.log(this.channel.here, "handshake");
          return scheduleAction(
            async () => {
              this.postMessage(
                {
                  type: "channel-handshake-request",
                  data: {
                    success: true,
                    payload: undefined,
                  },
                },
                {
                  usePromise: false,
                  useQueue: false,
                }
              );
              await this.handshakeFinished?.promise;
            },
            {
              attempts: this.handshakeMaxRetries,
              timeout: this.handshakeRetryInterval,
            }
          )
            .then(() => {
              this.logger?.log(this.channel.here, "handshake confirmed");
              this.messagesQueue.forEach((message) => {
                message.channel = this.channel;
                this.sendFn(message);
              });
              this.messagesQueue = [];
            })
            .catch(() => {
              this.handshakeFinished?.reject(new Error("handshake failed"));
              this.handshakeFinished = undefined;
            });
        }

        /**
         * message received from communication channel in descendants of this class
         * should be handled by this common onMessage method
         */
        onMessage(_message) {
          // Older code used to send message as a data property of the message object.
          // This is a workaround to keep backward compatibility.
          let message = _message;
          if (
            this.legacyMode &&
            message.type === undefined &&
            "data" in message &&
            typeof message.data === "object" &&
            message.data !== null &&
            "type" in message.data &&
            typeof message.data.type === "string"
          ) {
            // @ts-expect-error
            message = message.data;
          }
          const { channel, id, type, payload, success } = message;

          // Don't verify channel in legacy mode
          if (!this.legacyMode) {
            if (!channel?.peer || channel.peer !== this.channel.here) {
              // To wrong peer
              return;
            }
            if (!channel?.here || this.channel.peer !== channel.here) {
              // From wrong peer
              return;
            }
          }
          if (type === "channel-handshake-request") {
            this.postMessage(
              {
                type: "channel-handshake-confirm",
                data: {
                  success: true,
                  payload: undefined,
                },
              },
              {
                usePromise: false,
                useQueue: false,
              }
            );
            if (this.lazyHandshake) {
              // When received channel-handshake-request in lazyHandshake mode we start from this side.
              this.handshakeWithPeer();
            }
            return;
          }
          if (type === "channel-handshake-confirm") {
            this.handshakeFinished?.resolve(undefined);
            return;
          }
          if (this.messagePromises[id]) {
            this.messagePromises[id].resolve({
              id,
              payload,
              success,
            });
            delete this.messagePromises[id];
          }
          const messagePromisesLength = Object.keys(
            this.messagePromises
          ).length;
          if (messagePromisesLength > 5) {
            this.logger?.warn(
              `too many message promises (${messagePromisesLength}). this feels unexpected!`
            );
          }

          // @ts-expect-error TS complains for odd reasons
          this.emit("message", message);
        }

        // todo: outgoing messages should be typed
        postMessage(message, { usePromise = true, useQueue = true } = {}) {
          message.channel = this.channel;
          if (!usePromise) {
            try {
              this.sendFn(message);
            } catch (err) {
              if (useQueue) {
                this.messagesQueue.push(message);
              }
            }
            return;
          }
          this.messageID++;
          message.id = this.messageID;
          this.messagePromises[message.id] = createDeferred();
          try {
            this.sendFn(message);
          } catch (err) {
            if (useQueue) {
              this.messagesQueue.push(message);
            }
          }
          return this.messagePromises[message.id].promise;
        }
        resolveMessagePromises(resolvePayload) {
          // This is used when we know that the connection has been interrupted but there might be something waiting for it.
          Object.keys(this.messagePromises).forEach((id) =>
            this.messagePromises[id].resolve({
              id,
              payload: resolvePayload,
            })
          );
        }
        clear() {
          this.handshakeFinished = undefined;
        }
      }
      // EXTERNAL MODULE: ../../node_modules/ua-parser-js/src/ua-parser.js
      var ua_parser = __webpack_require__(332);
      var ua_parser_default = /*#__PURE__*/ __webpack_require__.n(ua_parser); // CONCATENATED MODULE: ../env-utils/src/envUtils.ts
      const isWeb = () => process.env.SUITE_TYPE === "web";
      const isDesktop = () => process.env.SUITE_TYPE === "desktop";
      const isNative = () => false;
      const getEnvironment = () => {
        if (isWeb()) return "web";
        return "desktop";
      };
      let userAgentParser;

      /* This way, we can override simple utils, which helps to polyfill methods which are not available in react-native. */
      const getUserAgent = () => window.navigator.userAgent;
      const getUserAgentParser = () => {
        if (!userAgentParser) {
          const ua = getUserAgent();
          userAgentParser = new (ua_parser_default())(ua);
        }
        return userAgentParser;
      };
      const isAndroid = () => /Android/.test(getUserAgent());
      const isChromeOs = () => /CrOS/.test(getUserAgent());
      const getBrowserVersion = () =>
        getUserAgentParser().getBrowser().version || "";
      const getCommitHash = () => process.env.COMMITHASH || "";

      /* Not correct for Linux as there is many different distributions in different versions */
      const getOsVersion = () => getUserAgentParser().getOS().version || "";
      const getSuiteVersion = () => process.env.VERSION || "";
      const getBrowserName = () => {
        const browserName = getUserAgentParser().getBrowser().name;
        return browserName?.toLowerCase() || "";
      };
      const isFirefox = () => getBrowserName() === "firefox";

      // List of platforms https://docker.apachezone.com/blog/74
      const getPlatform = () => window.navigator.platform;
      const getPlatformLanguages = () => window.navigator.languages;
      const getScreenWidth = () => window.screen.width;
      const getScreenHeight = () => window.screen.height;
      const getWindowWidth = () => window.innerWidth;
      const getWindowHeight = () => window.innerHeight;
      const getLocationOrigin = () => window.location.origin;
      const getLocationHostname = () => window.location.hostname;
      const getProcessPlatform = () =>
        typeof process !== "undefined" ? process.platform : "";
      const isMacOs = () => {
        if (getProcessPlatform() === "darwin") return true;
        if (typeof window === "undefined") return;
        return getPlatform().startsWith("Mac");
      };
      const isWindows = () => {
        if (getProcessPlatform() === "win32") return true;
        if (typeof window === "undefined") return;
        return getPlatform().startsWith("Win");
      };
      const isIOs = () => ["iPhone", "iPad", "iPod"].includes(getPlatform());
      const isLinux = () => {
        if (getProcessPlatform() === "linux") return true;
        if (typeof window === "undefined") return;

        // exclude Android and Chrome OS as window.navigator.platform of those OS is Linux
        if (isAndroid() || isChromeOs()) return false;
        return getPlatform().startsWith("Linux");
      };
      const isCodesignBuild = () => process.env.IS_CODESIGN_BUILD === "true";
      const getOsName = () => {
        if (isWindows()) return "windows";
        if (isMacOs()) return "macos";
        if (isAndroid()) return "android";
        if (isChromeOs()) return "chromeos";
        if (isLinux()) return "linux";
        if (isIOs()) return "ios";
        return "";
      };
      const getOsNameWeb = () => getUserAgentParser().getOS().name;
      const getOsFamily = () => {
        const osName = getUserAgentParser().getOS().name;
        if (osName === "Windows") {
          return "Windows";
        }
        if (osName === "Mac OS") {
          return "MacOS";
        }
        return "Linux";
      };
      const getDeviceType = () => getUserAgentParser().getDevice().type;
      const envUtils = {
        isWeb,
        isDesktop,
        isNative,
        getEnvironment,
        getUserAgent,
        isAndroid,
        isChromeOs,
        getOsVersion,
        getBrowserName,
        getBrowserVersion,
        getCommitHash,
        getDeviceType,
        getSuiteVersion,
        isFirefox,
        getPlatform,
        getPlatformLanguages,
        getScreenWidth,
        getScreenHeight,
        getWindowWidth,
        getWindowHeight,
        getLocationOrigin,
        getLocationHostname,
        getProcessPlatform,
        isMacOs,
        isWindows,
        isIOs,
        isLinux,
        isCodesignBuild,
        getOsName,
        getOsNameWeb,
        getOsFamily,
      }; // CONCATENATED MODULE: ../env-utils/src/index.ts
      const {
        isWeb: src_isWeb,
        isDesktop: src_isDesktop,
        isNative: src_isNative,
        getEnvironment: src_getEnvironment,
        getUserAgent: src_getUserAgent,
        isAndroid: src_isAndroid,
        isChromeOs: src_isChromeOs,
        getBrowserVersion: src_getBrowserVersion,
        getBrowserName: src_getBrowserName,
        getCommitHash: src_getCommitHash,
        getDeviceType: src_getDeviceType,
        getOsVersion: src_getOsVersion,
        getSuiteVersion: src_getSuiteVersion,
        isFirefox: src_isFirefox,
        getPlatform: src_getPlatform,
        getPlatformLanguages: src_getPlatformLanguages,
        getScreenWidth: src_getScreenWidth,
        getScreenHeight: src_getScreenHeight,
        getWindowWidth: src_getWindowWidth,
        getWindowHeight: src_getWindowHeight,
        getLocationOrigin: src_getLocationOrigin,
        getLocationHostname: src_getLocationHostname,
        getProcessPlatform: src_getProcessPlatform,
        isMacOs: src_isMacOs,
        isWindows: src_isWindows,
        isIOs: src_isIOs,
        isLinux: src_isLinux,
        isCodesignBuild: src_isCodesignBuild,
        getOsName: src_getOsName,
        getOsNameWeb: src_getOsNameWeb,
        getOsFamily: src_getOsFamily,
      } = envUtils; // CONCATENATED MODULE: ../connect-common/src/systemInfo.ts
      const getInstallerPackage = () => {
        const agent = src_getUserAgent();
        switch (src_getOsFamily()) {
          case "MacOS":
            return "mac";
          case "Windows": {
            const arch = agent.match(/(Win64|WOW64)/) ? "64" : "32";
            return `win${arch}`;
          }
          case "Linux": {
            const isRpm = agent.match(
              /CentOS|Fedora|Mandriva|Mageia|Red Hat|Scientific|SUSE/
            )
              ? "rpm"
              : "deb";
            const is64x = agent.match(/Linux i[3456]86/) ? "32" : "64";
            return `${isRpm}${is64x}`;
          }
          default:
          // no default, type safe
        }
      };
      const getSystemInfo = (supportedBrowsers) => {
        const browserName = src_getBrowserName();
        const browserVersion = src_getBrowserVersion();
        const supportedBrowser = browserName
          ? supportedBrowsers[browserName.toLowerCase()]
          : undefined;
        const outdatedBrowser = supportedBrowser
          ? supportedBrowser.version > parseInt(browserVersion, 10)
          : false;
        const mobile = src_getDeviceType() === "mobile";
        const supportedMobile = mobile ? "usb" in navigator : true;
        const supported = !!(
          supportedBrowser &&
          !outdatedBrowser &&
          supportedMobile
        );
        return {
          os: {
            family: src_getOsFamily(),
            mobile,
          },
          browser: {
            supported,
            outdated: outdatedBrowser,
          },
        };
      }; // CONCATENATED MODULE: ../connect-common/src/index.ts

      /***/
    },

    /***/ 928: /***/ (module) => {
      "use strict";
      // Copyright Joyent, Inc. and other Node contributors.
      //
      // Permission is hereby granted, free of charge, to any person obtaining a
      // copy of this software and associated documentation files (the
      // "Software"), to deal in the Software without restriction, including
      // without limitation the rights to use, copy, modify, merge, publish,
      // distribute, sublicense, and/or sell copies of the Software, and to permit
      // persons to whom the Software is furnished to do so, subject to the
      // following conditions:
      //
      // The above copyright notice and this permission notice shall be included
      // in all copies or substantial portions of the Software.
      //
      // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
      // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
      // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
      // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
      // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
      // USE OR OTHER DEALINGS IN THE SOFTWARE.

      var R = typeof Reflect === "object" ? Reflect : null;
      var ReflectApply =
        R && typeof R.apply === "function"
          ? R.apply
          : function ReflectApply(target, receiver, args) {
              return Function.prototype.apply.call(target, receiver, args);
            };

      var ReflectOwnKeys;
      if (R && typeof R.ownKeys === "function") {
        ReflectOwnKeys = R.ownKeys;
      } else if (Object.getOwnPropertySymbols) {
        ReflectOwnKeys = function ReflectOwnKeys(target) {
          return Object.getOwnPropertyNames(target).concat(
            Object.getOwnPropertySymbols(target)
          );
        };
      } else {
        ReflectOwnKeys = function ReflectOwnKeys(target) {
          return Object.getOwnPropertyNames(target);
        };
      }

      function ProcessEmitWarning(warning) {
        if (console && console.warn) console.warn(warning);
      }

      var NumberIsNaN =
        Number.isNaN ||
        function NumberIsNaN(value) {
          return value !== value;
        };

      function EventEmitter() {
        EventEmitter.init.call(this);
      }
      module.exports = EventEmitter;
      module.exports.once = once;

      // Backwards-compat with node 0.10.x
      EventEmitter.EventEmitter = EventEmitter;

      EventEmitter.prototype._events = undefined;
      EventEmitter.prototype._eventsCount = 0;
      EventEmitter.prototype._maxListeners = undefined;

      // By default EventEmitters will print a warning if more than 10 listeners are
      // added to it. This is a useful default which helps finding memory leaks.
      var defaultMaxListeners = 10;

      function checkListener(listener) {
        if (typeof listener !== "function") {
          throw new TypeError(
            'The "listener" argument must be of type Function. Received type ' +
              typeof listener
          );
        }
      }

      Object.defineProperty(EventEmitter, "defaultMaxListeners", {
        enumerable: true,
        get: function () {
          return defaultMaxListeners;
        },
        set: function (arg) {
          if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
            throw new RangeError(
              'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
                arg +
                "."
            );
          }
          defaultMaxListeners = arg;
        },
      });

      EventEmitter.init = function () {
        if (
          this._events === undefined ||
          this._events === Object.getPrototypeOf(this)._events
        ) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        }

        this._maxListeners = this._maxListeners || undefined;
      };

      // Obviously not all Emitters should be limited to 10. This function allows
      // that to be increased. Set to zero for unlimited.
      EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
        if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) {
          throw new RangeError(
            'The value of "n" is out of range. It must be a non-negative number. Received ' +
              n +
              "."
          );
        }
        this._maxListeners = n;
        return this;
      };

      function _getMaxListeners(that) {
        if (that._maxListeners === undefined)
          return EventEmitter.defaultMaxListeners;
        return that._maxListeners;
      }

      EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
        return _getMaxListeners(this);
      };

      EventEmitter.prototype.emit = function emit(type) {
        var args = [];
        for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
        var doError = type === "error";

        var events = this._events;
        if (events !== undefined)
          doError = doError && events.error === undefined;
        else if (!doError) return false;

        // If there is no 'error' event listener then throw.
        if (doError) {
          var er;
          if (args.length > 0) er = args[0];
          if (er instanceof Error) {
            // Note: The comments on the `throw` lines are intentional, they show
            // up in Node's output if this results in an unhandled exception.
            throw er; // Unhandled 'error' event
          }
          // At least give some kind of context to the user
          var err = new Error(
            "Unhandled error." + (er ? " (" + er.message + ")" : "")
          );
          err.context = er;
          throw err; // Unhandled 'error' event
        }

        var handler = events[type];

        if (handler === undefined) return false;

        if (typeof handler === "function") {
          ReflectApply(handler, this, args);
        } else {
          var len = handler.length;
          var listeners = arrayClone(handler, len);
          for (var i = 0; i < len; ++i) ReflectApply(listeners[i], this, args);
        }

        return true;
      };

      function _addListener(target, type, listener, prepend) {
        var m;
        var events;
        var existing;

        checkListener(listener);

        events = target._events;
        if (events === undefined) {
          events = target._events = Object.create(null);
          target._eventsCount = 0;
        } else {
          // To avoid recursion in the case that type === "newListener"! Before
          // adding it to the listeners, first emit "newListener".
          if (events.newListener !== undefined) {
            target.emit(
              "newListener",
              type,
              listener.listener ? listener.listener : listener
            );

            // Re-assign `events` because a newListener handler could have caused the
            // this._events to be assigned to a new object
            events = target._events;
          }
          existing = events[type];
        }

        if (existing === undefined) {
          // Optimize the case of one listener. Don't need the extra array object.
          existing = events[type] = listener;
          ++target._eventsCount;
        } else {
          if (typeof existing === "function") {
            // Adding the second element, need to change to array.
            existing = events[type] = prepend
              ? [listener, existing]
              : [existing, listener];
            // If we've already got an array, just append.
          } else if (prepend) {
            existing.unshift(listener);
          } else {
            existing.push(listener);
          }

          // Check for listener leak
          m = _getMaxListeners(target);
          if (m > 0 && existing.length > m && !existing.warned) {
            existing.warned = true;
            // No error code for this since it is a Warning
            // eslint-disable-next-line no-restricted-syntax
            var w = new Error(
              "Possible EventEmitter memory leak detected. " +
                existing.length +
                " " +
                String(type) +
                " listeners " +
                "added. Use emitter.setMaxListeners() to " +
                "increase limit"
            );
            w.name = "MaxListenersExceededWarning";
            w.emitter = target;
            w.type = type;
            w.count = existing.length;
            ProcessEmitWarning(w);
          }
        }

        return target;
      }

      EventEmitter.prototype.addListener = function addListener(
        type,
        listener
      ) {
        return _addListener(this, type, listener, false);
      };

      EventEmitter.prototype.on = EventEmitter.prototype.addListener;

      EventEmitter.prototype.prependListener = function prependListener(
        type,
        listener
      ) {
        return _addListener(this, type, listener, true);
      };

      function onceWrapper() {
        if (!this.fired) {
          this.target.removeListener(this.type, this.wrapFn);
          this.fired = true;
          if (arguments.length === 0) return this.listener.call(this.target);
          return this.listener.apply(this.target, arguments);
        }
      }

      function _onceWrap(target, type, listener) {
        var state = {
          fired: false,
          wrapFn: undefined,
          target: target,
          type: type,
          listener: listener,
        };
        var wrapped = onceWrapper.bind(state);
        wrapped.listener = listener;
        state.wrapFn = wrapped;
        return wrapped;
      }

      EventEmitter.prototype.once = function once(type, listener) {
        checkListener(listener);
        this.on(type, _onceWrap(this, type, listener));
        return this;
      };

      EventEmitter.prototype.prependOnceListener = function prependOnceListener(
        type,
        listener
      ) {
        checkListener(listener);
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
      };

      // Emits a 'removeListener' event if and only if the listener was removed.
      EventEmitter.prototype.removeListener = function removeListener(
        type,
        listener
      ) {
        var list, events, position, i, originalListener;

        checkListener(listener);

        events = this._events;
        if (events === undefined) return this;

        list = events[type];
        if (list === undefined) return this;

        if (list === listener || list.listener === listener) {
          if (--this._eventsCount === 0) this._events = Object.create(null);
          else {
            delete events[type];
            if (events.removeListener)
              this.emit("removeListener", type, list.listener || listener);
          }
        } else if (typeof list !== "function") {
          position = -1;

          for (i = list.length - 1; i >= 0; i--) {
            if (list[i] === listener || list[i].listener === listener) {
              originalListener = list[i].listener;
              position = i;
              break;
            }
          }

          if (position < 0) return this;

          if (position === 0) list.shift();
          else {
            spliceOne(list, position);
          }

          if (list.length === 1) events[type] = list[0];

          if (events.removeListener !== undefined)
            this.emit("removeListener", type, originalListener || listener);
        }

        return this;
      };

      EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

      EventEmitter.prototype.removeAllListeners = function removeAllListeners(
        type
      ) {
        var listeners, events, i;

        events = this._events;
        if (events === undefined) return this;

        // not listening for removeListener, no need to emit
        if (events.removeListener === undefined) {
          if (arguments.length === 0) {
            this._events = Object.create(null);
            this._eventsCount = 0;
          } else if (events[type] !== undefined) {
            if (--this._eventsCount === 0) this._events = Object.create(null);
            else delete events[type];
          }
          return this;
        }

        // emit removeListener for all listeners on all events
        if (arguments.length === 0) {
          var keys = Object.keys(events);
          var key;
          for (i = 0; i < keys.length; ++i) {
            key = keys[i];
            if (key === "removeListener") continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners("removeListener");
          this._events = Object.create(null);
          this._eventsCount = 0;
          return this;
        }

        listeners = events[type];

        if (typeof listeners === "function") {
          this.removeListener(type, listeners);
        } else if (listeners !== undefined) {
          // LIFO order
          for (i = listeners.length - 1; i >= 0; i--) {
            this.removeListener(type, listeners[i]);
          }
        }

        return this;
      };

      function _listeners(target, type, unwrap) {
        var events = target._events;

        if (events === undefined) return [];

        var evlistener = events[type];
        if (evlistener === undefined) return [];

        if (typeof evlistener === "function")
          return unwrap ? [evlistener.listener || evlistener] : [evlistener];

        return unwrap
          ? unwrapListeners(evlistener)
          : arrayClone(evlistener, evlistener.length);
      }

      EventEmitter.prototype.listeners = function listeners(type) {
        return _listeners(this, type, true);
      };

      EventEmitter.prototype.rawListeners = function rawListeners(type) {
        return _listeners(this, type, false);
      };

      EventEmitter.listenerCount = function (emitter, type) {
        if (typeof emitter.listenerCount === "function") {
          return emitter.listenerCount(type);
        } else {
          return listenerCount.call(emitter, type);
        }
      };

      EventEmitter.prototype.listenerCount = listenerCount;
      function listenerCount(type) {
        var events = this._events;

        if (events !== undefined) {
          var evlistener = events[type];

          if (typeof evlistener === "function") {
            return 1;
          } else if (evlistener !== undefined) {
            return evlistener.length;
          }
        }

        return 0;
      }

      EventEmitter.prototype.eventNames = function eventNames() {
        return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
      };

      function arrayClone(arr, n) {
        var copy = new Array(n);
        for (var i = 0; i < n; ++i) copy[i] = arr[i];
        return copy;
      }

      function spliceOne(list, index) {
        for (; index + 1 < list.length; index++) list[index] = list[index + 1];
        list.pop();
      }

      function unwrapListeners(arr) {
        var ret = new Array(arr.length);
        for (var i = 0; i < ret.length; ++i) {
          ret[i] = arr[i].listener || arr[i];
        }
        return ret;
      }

      function once(emitter, name) {
        return new Promise(function (resolve, reject) {
          function errorListener(err) {
            emitter.removeListener(name, resolver);
            reject(err);
          }

          function resolver() {
            if (typeof emitter.removeListener === "function") {
              emitter.removeListener("error", errorListener);
            }
            resolve([].slice.call(arguments));
          }

          eventTargetAgnosticAddListener(emitter, name, resolver, {
            once: true,
          });
          if (name !== "error") {
            addErrorHandlerIfEventEmitter(emitter, errorListener, {
              once: true,
            });
          }
        });
      }

      function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
        if (typeof emitter.on === "function") {
          eventTargetAgnosticAddListener(emitter, "error", handler, flags);
        }
      }

      function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
        if (typeof emitter.on === "function") {
          if (flags.once) {
            emitter.once(name, listener);
          } else {
            emitter.on(name, listener);
          }
        } else if (typeof emitter.addEventListener === "function") {
          // EventTarget does not have `error` event semantics like Node
          // EventEmitters, we do not listen for `error` events here.
          emitter.addEventListener(name, function wrapListener(arg) {
            // IE does not have builtin `{ once: true }` support so we
            // have to do it manually.
            if (flags.once) {
              emitter.removeEventListener(name, wrapListener);
            }
            listener(arg);
          });
        } else {
          throw new TypeError(
            'The "emitter" argument must be of type EventEmitter. Received type ' +
              typeof emitter
          );
        }
      }

      /***/
    },

    /***/ 332: /***/ function (module, exports, __webpack_require__) {
      var __WEBPACK_AMD_DEFINE_RESULT__; /////////////////////////////////////////////////////////////////////////////////
      /* UAParser.js v1.0.37
   Copyright © 2012-2021 Faisal Salman <f@faisalman.com>
   MIT License */ /*
   Detect Browser, Engine, OS, CPU, and Device type/model from User-Agent data.
   Supports browser & node.js environment. 
   Demo   : https://faisalman.github.io/ua-parser-js
   Source : https://github.com/faisalman/ua-parser-js */
      /////////////////////////////////////////////////////////////////////////////////

      (function (window, undefined) {
        "use strict";

        //////////////
        // Constants
        /////////////

        var LIBVERSION = "1.0.37",
          EMPTY = "",
          UNKNOWN = "?",
          FUNC_TYPE = "function",
          UNDEF_TYPE = "undefined",
          OBJ_TYPE = "object",
          STR_TYPE = "string",
          MAJOR = "major",
          MODEL = "model",
          NAME = "name",
          TYPE = "type",
          VENDOR = "vendor",
          VERSION = "version",
          ARCHITECTURE = "architecture",
          CONSOLE = "console",
          MOBILE = "mobile",
          TABLET = "tablet",
          SMARTTV = "smarttv",
          WEARABLE = "wearable",
          EMBEDDED = "embedded",
          UA_MAX_LENGTH = 500;

        var AMAZON = "Amazon",
          APPLE = "Apple",
          ASUS = "ASUS",
          BLACKBERRY = "BlackBerry",
          BROWSER = "Browser",
          CHROME = "Chrome",
          EDGE = "Edge",
          FIREFOX = "Firefox",
          GOOGLE = "Google",
          HUAWEI = "Huawei",
          LG = "LG",
          MICROSOFT = "Microsoft",
          MOTOROLA = "Motorola",
          OPERA = "Opera",
          SAMSUNG = "Samsung",
          SHARP = "Sharp",
          SONY = "Sony",
          XIAOMI = "Xiaomi",
          ZEBRA = "Zebra",
          FACEBOOK = "Facebook",
          CHROMIUM_OS = "Chromium OS",
          MAC_OS = "Mac OS";

        ///////////
        // Helper
        //////////

        var extend = function (regexes, extensions) {
            var mergedRegexes = {};
            for (var i in regexes) {
              if (extensions[i] && extensions[i].length % 2 === 0) {
                mergedRegexes[i] = extensions[i].concat(regexes[i]);
              } else {
                mergedRegexes[i] = regexes[i];
              }
            }
            return mergedRegexes;
          },
          enumerize = function (arr) {
            var enums = {};
            for (var i = 0; i < arr.length; i++) {
              enums[arr[i].toUpperCase()] = arr[i];
            }
            return enums;
          },
          has = function (str1, str2) {
            return typeof str1 === STR_TYPE
              ? lowerize(str2).indexOf(lowerize(str1)) !== -1
              : false;
          },
          lowerize = function (str) {
            return str.toLowerCase();
          },
          majorize = function (version) {
            return typeof version === STR_TYPE
              ? version.replace(/[^\d\.]/g, EMPTY).split(".")[0]
              : undefined;
          },
          trim = function (str, len) {
            if (typeof str === STR_TYPE) {
              str = str.replace(/^\s\s*/, EMPTY);
              return typeof len === UNDEF_TYPE
                ? str
                : str.substring(0, UA_MAX_LENGTH);
            }
          };

        ///////////////
        // Map helper
        //////////////

        var rgxMapper = function (ua, arrays) {
            var i = 0,
              j,
              k,
              p,
              q,
              matches,
              match;

            // loop through all regexes maps
            while (i < arrays.length && !matches) {
              var regex = arrays[i], // even sequence (0,2,4,..)
                props = arrays[i + 1]; // odd sequence (1,3,5,..)
              j = k = 0;

              // try matching uastring with regexes
              while (j < regex.length && !matches) {
                if (!regex[j]) {
                  break;
                }
                matches = regex[j++].exec(ua);

                if (!!matches) {
                  for (p = 0; p < props.length; p++) {
                    match = matches[++k];
                    q = props[p];
                    // check if given property is actually array
                    if (typeof q === OBJ_TYPE && q.length > 0) {
                      if (q.length === 2) {
                        if (typeof q[1] == FUNC_TYPE) {
                          // assign modified match
                          this[q[0]] = q[1].call(this, match);
                        } else {
                          // assign given value, ignore regex match
                          this[q[0]] = q[1];
                        }
                      } else if (q.length === 3) {
                        // check whether function or regex
                        if (
                          typeof q[1] === FUNC_TYPE &&
                          !(q[1].exec && q[1].test)
                        ) {
                          // call function (usually string mapper)
                          this[q[0]] = match
                            ? q[1].call(this, match, q[2])
                            : undefined;
                        } else {
                          // sanitize match using given regex
                          this[q[0]] = match
                            ? match.replace(q[1], q[2])
                            : undefined;
                        }
                      } else if (q.length === 4) {
                        this[q[0]] = match
                          ? q[3].call(this, match.replace(q[1], q[2]))
                          : undefined;
                      }
                    } else {
                      this[q] = match ? match : undefined;
                    }
                  }
                }
              }
              i += 2;
            }
          },
          strMapper = function (str, map) {
            for (var i in map) {
              // check if current value is array
              if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
                for (var j = 0; j < map[i].length; j++) {
                  if (has(map[i][j], str)) {
                    return i === UNKNOWN ? undefined : i;
                  }
                }
              } else if (has(map[i], str)) {
                return i === UNKNOWN ? undefined : i;
              }
            }
            return str;
          };

        ///////////////
        // String map
        //////////////

        // Safari < 3.0
        var oldSafariMap = {
            "1.0": "/8",
            1.2: "/1",
            1.3: "/3",
            "2.0": "/412",
            "2.0.2": "/416",
            "2.0.3": "/417",
            "2.0.4": "/419",
            "?": "/",
          },
          windowsVersionMap = {
            ME: "4.90",
            "NT 3.11": "NT3.51",
            "NT 4.0": "NT4.0",
            2000: "NT 5.0",
            XP: ["NT 5.1", "NT 5.2"],
            Vista: "NT 6.0",
            7: "NT 6.1",
            8: "NT 6.2",
            8.1: "NT 6.3",
            10: ["NT 6.4", "NT 10.0"],
            RT: "ARM",
          };

        //////////////
        // Regex map
        /////////////

        var regexes = {
          browser: [
            [
              /\b(?:crmo|crios)\/([\w\.]+)/i, // Chrome for Android/iOS
            ],
            [VERSION, [NAME, "Chrome"]],
            [
              /edg(?:e|ios|a)?\/([\w\.]+)/i, // Microsoft Edge
            ],
            [VERSION, [NAME, "Edge"]],
            [
              // Presto based
              /(opera mini)\/([-\w\.]+)/i, // Opera Mini
              /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i, // Opera Mobi/Tablet
              /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i, // Opera
            ],
            [NAME, VERSION],
            [
              /opios[\/ ]+([\w\.]+)/i, // Opera mini on iphone >= 8.0
            ],
            [VERSION, [NAME, OPERA + " Mini"]],
            [
              /\bopr\/([\w\.]+)/i, // Opera Webkit
            ],
            [VERSION, [NAME, OPERA]],
            [
              // Mixed
              /\bb[ai]*d(?:uhd|[ub]*[aekoprswx]{5,6})[\/ ]?([\w\.]+)/i, // Baidu
            ],
            [VERSION, [NAME, "Baidu"]],
            [
              /(kindle)\/([\w\.]+)/i, // Kindle
              /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i, // Lunascape/Maxthon/Netfront/Jasmine/Blazer
              // Trident based
              /(avant|iemobile|slim)\s?(?:browser)?[\/ ]?([\w\.]*)/i, // Avant/IEMobile/SlimBrowser
              /(?:ms|\()(ie) ([\w\.]+)/i, // Internet Explorer

              // Webkit/KHTML based                                               // Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser/QupZilla/Falkon
              /(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i,
              // Rekonq/Puffin/Brave/Whale/QQBrowserLite/QQ, aka ShouQ
              /(heytap|ovi)browser\/([\d\.]+)/i, // Heytap/Ovi
              /(weibo)__([\d\.]+)/i, // Weibo
            ],
            [NAME, VERSION],
            [
              /(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i, // UCBrowser
            ],
            [VERSION, [NAME, "UC" + BROWSER]],
            [
              /microm.+\bqbcore\/([\w\.]+)/i, // WeChat Desktop for Windows Built-in Browser
              /\bqbcore\/([\w\.]+).+microm/i,
              /micromessenger\/([\w\.]+)/i, // WeChat
            ],
            [VERSION, [NAME, "WeChat"]],
            [
              /konqueror\/([\w\.]+)/i, // Konqueror
            ],
            [VERSION, [NAME, "Konqueror"]],
            [
              /trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i, // IE11
            ],
            [VERSION, [NAME, "IE"]],
            [
              /ya(?:search)?browser\/([\w\.]+)/i, // Yandex
            ],
            [VERSION, [NAME, "Yandex"]],
            [
              /slbrowser\/([\w\.]+)/i, // Smart Lenovo Browser
            ],
            [VERSION, [NAME, "Smart Lenovo " + BROWSER]],
            [
              /(avast|avg)\/([\w\.]+)/i, // Avast/AVG Secure Browser
            ],
            [[NAME, /(.+)/, "$1 Secure " + BROWSER], VERSION],
            [
              /\bfocus\/([\w\.]+)/i, // Firefox Focus
            ],
            [VERSION, [NAME, FIREFOX + " Focus"]],
            [
              /\bopt\/([\w\.]+)/i, // Opera Touch
            ],
            [VERSION, [NAME, OPERA + " Touch"]],
            [
              /coc_coc\w+\/([\w\.]+)/i, // Coc Coc Browser
            ],
            [VERSION, [NAME, "Coc Coc"]],
            [
              /dolfin\/([\w\.]+)/i, // Dolphin
            ],
            [VERSION, [NAME, "Dolphin"]],
            [
              /coast\/([\w\.]+)/i, // Opera Coast
            ],
            [VERSION, [NAME, OPERA + " Coast"]],
            [
              /miuibrowser\/([\w\.]+)/i, // MIUI Browser
            ],
            [VERSION, [NAME, "MIUI " + BROWSER]],
            [
              /fxios\/([-\w\.]+)/i, // Firefox for iOS
            ],
            [VERSION, [NAME, FIREFOX]],
            [
              /\bqihu|(qi?ho?o?|360)browser/i, // 360
            ],
            [[NAME, "360 " + BROWSER]],
            [/(oculus|sailfish|huawei|vivo)browser\/([\w\.]+)/i],
            [[NAME, /(.+)/, "$1 " + BROWSER], VERSION],
            [
              // Oculus/Sailfish/HuaweiBrowser/VivoBrowser
              /samsungbrowser\/([\w\.]+)/i, // Samsung Internet
            ],
            [VERSION, [NAME, SAMSUNG + " Internet"]],
            [
              /(comodo_dragon)\/([\w\.]+)/i, // Comodo Dragon
            ],
            [[NAME, /_/g, " "], VERSION],
            [
              /metasr[\/ ]?([\d\.]+)/i, // Sogou Explorer
            ],
            [VERSION, [NAME, "Sogou Explorer"]],
            [
              /(sogou)mo\w+\/([\d\.]+)/i, // Sogou Mobile
            ],
            [[NAME, "Sogou Mobile"], VERSION],
            [
              /(electron)\/([\w\.]+) safari/i, // Electron-based App
              /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i, // Tesla
              /m?(qqbrowser|2345Explorer)[\/ ]?([\w\.]+)/i, // QQBrowser/2345 Browser
            ],
            [NAME, VERSION],
            [
              /(lbbrowser)/i, // LieBao Browser
              /\[(linkedin)app\]/i, // LinkedIn App for iOS & Android
            ],
            [NAME],
            [
              // WebView
              /((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i, // Facebook App for iOS & Android
            ],
            [[NAME, FACEBOOK], VERSION],
            [
              /(Klarna)\/([\w\.]+)/i, // Klarna Shopping Browser for iOS & Android
              /(kakao(?:talk|story))[\/ ]([\w\.]+)/i, // Kakao App
              /(naver)\(.*?(\d+\.[\w\.]+).*\)/i, // Naver InApp
              /safari (line)\/([\w\.]+)/i, // Line App for iOS
              /\b(line)\/([\w\.]+)\/iab/i, // Line App for Android
              /(alipay)client\/([\w\.]+)/i, // Alipay
              /(chromium|instagram|snapchat)[\/ ]([-\w\.]+)/i, // Chromium/Instagram/Snapchat
            ],
            [NAME, VERSION],
            [
              /\bgsa\/([\w\.]+) .*safari\//i, // Google Search Appliance on iOS
            ],
            [VERSION, [NAME, "GSA"]],
            [
              /musical_ly(?:.+app_?version\/|_)([\w\.]+)/i, // TikTok
            ],
            [VERSION, [NAME, "TikTok"]],
            [
              /headlesschrome(?:\/([\w\.]+)| )/i, // Chrome Headless
            ],
            [VERSION, [NAME, CHROME + " Headless"]],
            [
              / wv\).+(chrome)\/([\w\.]+)/i, // Chrome WebView
            ],
            [[NAME, CHROME + " WebView"], VERSION],
            [
              /droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i, // Android Browser
            ],
            [VERSION, [NAME, "Android " + BROWSER]],
            [
              /(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i, // Chrome/OmniWeb/Arora/Tizen/Nokia
            ],
            [NAME, VERSION],
            [
              /version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i, // Mobile Safari
            ],
            [VERSION, [NAME, "Mobile Safari"]],
            [
              /version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i, // Safari & Safari Mobile
            ],
            [VERSION, NAME],
            [
              /webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i, // Safari < 3.0
            ],
            [NAME, [VERSION, strMapper, oldSafariMap]],
            [/(webkit|khtml)\/([\w\.]+)/i],
            [NAME, VERSION],
            [
              // Gecko based
              /(navigator|netscape\d?)\/([-\w\.]+)/i, // Netscape
            ],
            [[NAME, "Netscape"], VERSION],
            [
              /mobile vr; rv:([\w\.]+)\).+firefox/i, // Firefox Reality
            ],
            [VERSION, [NAME, FIREFOX + " Reality"]],
            [
              /ekiohf.+(flow)\/([\w\.]+)/i, // Flow
              /(swiftfox)/i, // Swiftfox
              /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i,
              // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror/Klar
              /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,
              // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
              /(firefox)\/([\w\.]+)/i, // Other Firefox-based
              /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i, // Mozilla

              // Other
              /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,
              // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir/Obigo/Mosaic/Go/ICE/UP.Browser
              /(links) \(([\w\.]+)/i, // Links
              /panasonic;(viera)/i, // Panasonic Viera
            ],
            [NAME, VERSION],
            [
              /(cobalt)\/([\w\.]+)/i, // Cobalt
            ],
            [NAME, [VERSION, /master.|lts./, ""]],
          ],

          cpu: [
            [
              /(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i, // AMD64 (x64)
            ],
            [[ARCHITECTURE, "amd64"]],
            [
              /(ia32(?=;))/i, // IA32 (quicktime)
            ],
            [[ARCHITECTURE, lowerize]],
            [
              /((?:i[346]|x)86)[;\)]/i, // IA32 (x86)
            ],
            [[ARCHITECTURE, "ia32"]],
            [
              /\b(aarch64|arm(v?8e?l?|_?64))\b/i, // ARM64
            ],
            [[ARCHITECTURE, "arm64"]],
            [
              /\b(arm(?:v[67])?ht?n?[fl]p?)\b/i, // ARMHF
            ],
            [[ARCHITECTURE, "armhf"]],
            [
              // PocketPC mistakenly identified as PowerPC
              /windows (ce|mobile); ppc;/i,
            ],
            [[ARCHITECTURE, "arm"]],
            [
              /((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i, // PowerPC
            ],
            [[ARCHITECTURE, /ower/, EMPTY, lowerize]],
            [
              /(sun4\w)[;\)]/i, // SPARC
            ],
            [[ARCHITECTURE, "sparc"]],
            [
              /((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i,
              // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
            ],
            [[ARCHITECTURE, lowerize]],
          ],

          device: [
            [
              //////////////////////////
              // MOBILES & TABLETS
              /////////////////////////

              // Samsung
              /\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i,
            ],
            [MODEL, [VENDOR, SAMSUNG], [TYPE, TABLET]],
            [
              /\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i,
              /samsung[- ]([-\w]+)/i,
              /sec-(sgh\w+)/i,
            ],
            [MODEL, [VENDOR, SAMSUNG], [TYPE, MOBILE]],
            [
              // Apple
              /(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i, // iPod/iPhone
            ],
            [MODEL, [VENDOR, APPLE], [TYPE, MOBILE]],
            [
              /\((ipad);[-\w\),; ]+apple/i, // iPad
              /applecoremedia\/[\w\.]+ \((ipad)/i,
              /\b(ipad)\d\d?,\d\d?[;\]].+ios/i,
            ],
            [MODEL, [VENDOR, APPLE], [TYPE, TABLET]],
            [/(macintosh);/i],
            [MODEL, [VENDOR, APPLE]],
            [
              // Sharp
              /\b(sh-?[altvz]?\d\d[a-ekm]?)/i,
            ],
            [MODEL, [VENDOR, SHARP], [TYPE, MOBILE]],
            [
              // Huawei
              /\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i,
            ],
            [MODEL, [VENDOR, HUAWEI], [TYPE, TABLET]],
            [
              /(?:huawei|honor)([-\w ]+)[;\)]/i,
              /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i,
            ],
            [MODEL, [VENDOR, HUAWEI], [TYPE, MOBILE]],
            [
              // Xiaomi
              /\b(poco[\w ]+|m2\d{3}j\d\d[a-z]{2})(?: bui|\))/i, // Xiaomi POCO
              /\b; (\w+) build\/hm\1/i, // Xiaomi Hongmi 'numeric' models
              /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i, // Xiaomi Hongmi
              /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i, // Xiaomi Redmi
              /oid[^\)]+; (m?[12][0-389][01]\w{3,6}[c-y])( bui|; wv|\))/i, // Xiaomi Redmi 'numeric' models
              /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i, // Xiaomi Mi
            ],
            [
              [MODEL, /_/g, " "],
              [VENDOR, XIAOMI],
              [TYPE, MOBILE],
            ],
            [
              /oid[^\)]+; (2\d{4}(283|rpbf)[cgl])( bui|\))/i, // Redmi Pad
              /\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i, // Mi Pad tablets
            ],
            [
              [MODEL, /_/g, " "],
              [VENDOR, XIAOMI],
              [TYPE, TABLET],
            ],
            [
              // OPPO
              /; (\w+) bui.+ oppo/i,
              /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i,
            ],
            [MODEL, [VENDOR, "OPPO"], [TYPE, MOBILE]],
            [
              // Vivo
              /vivo (\w+)(?: bui|\))/i,
              /\b(v[12]\d{3}\w?[at])(?: bui|;)/i,
            ],
            [MODEL, [VENDOR, "Vivo"], [TYPE, MOBILE]],
            [
              // Realme
              /\b(rmx[1-3]\d{3})(?: bui|;|\))/i,
            ],
            [MODEL, [VENDOR, "Realme"], [TYPE, MOBILE]],
            [
              // Motorola
              /\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,
              /\bmot(?:orola)?[- ](\w*)/i,
              /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i,
            ],
            [MODEL, [VENDOR, MOTOROLA], [TYPE, MOBILE]],
            [/\b(mz60\d|xoom[2 ]{0,2}) build\//i],
            [MODEL, [VENDOR, MOTOROLA], [TYPE, TABLET]],
            [
              // LG
              /((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i,
            ],
            [MODEL, [VENDOR, LG], [TYPE, TABLET]],
            [
              /(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,
              /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i,
              /\blg-?([\d\w]+) bui/i,
            ],
            [MODEL, [VENDOR, LG], [TYPE, MOBILE]],
            [
              // Lenovo
              /(ideatab[-\w ]+)/i,
              /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i,
            ],
            [MODEL, [VENDOR, "Lenovo"], [TYPE, TABLET]],
            [
              // Nokia
              /(?:maemo|nokia).*(n900|lumia \d+)/i,
              /nokia[-_ ]?([-\w\.]*)/i,
            ],
            [
              [MODEL, /_/g, " "],
              [VENDOR, "Nokia"],
              [TYPE, MOBILE],
            ],
            [
              // Google
              /(pixel c)\b/i, // Google Pixel C
            ],
            [MODEL, [VENDOR, GOOGLE], [TYPE, TABLET]],
            [
              /droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i, // Google Pixel
            ],
            [MODEL, [VENDOR, GOOGLE], [TYPE, MOBILE]],
            [
              // Sony
              /droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i,
            ],
            [MODEL, [VENDOR, SONY], [TYPE, MOBILE]],
            [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i],
            [
              [MODEL, "Xperia Tablet"],
              [VENDOR, SONY],
              [TYPE, TABLET],
            ],
            [
              // OnePlus
              / (kb2005|in20[12]5|be20[12][59])\b/i,
              /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i,
            ],
            [MODEL, [VENDOR, "OnePlus"], [TYPE, MOBILE]],
            [
              // Amazon
              /(alexa)webm/i,
              /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i, // Kindle Fire without Silk / Echo Show
              /(kf[a-z]+)( bui|\)).+silk\//i, // Kindle Fire HD
            ],
            [MODEL, [VENDOR, AMAZON], [TYPE, TABLET]],
            [
              /((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i, // Fire Phone
            ],
            [
              [MODEL, /(.+)/g, "Fire Phone $1"],
              [VENDOR, AMAZON],
              [TYPE, MOBILE],
            ],
            [
              // BlackBerry
              /(playbook);[-\w\),; ]+(rim)/i, // BlackBerry PlayBook
            ],
            [MODEL, VENDOR, [TYPE, TABLET]],
            [
              /\b((?:bb[a-f]|st[hv])100-\d)/i,
              /\(bb10; (\w+)/i, // BlackBerry 10
            ],
            [MODEL, [VENDOR, BLACKBERRY], [TYPE, MOBILE]],
            [
              // Asus
              /(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i,
            ],
            [MODEL, [VENDOR, ASUS], [TYPE, TABLET]],
            [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i],
            [MODEL, [VENDOR, ASUS], [TYPE, MOBILE]],
            [
              // HTC
              /(nexus 9)/i, // HTC Nexus 9
            ],
            [MODEL, [VENDOR, "HTC"], [TYPE, TABLET]],
            [
              /(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i, // HTC

              // ZTE
              /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,
              /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i, // Alcatel/GeeksPhone/Nexian/Panasonic/Sony
            ],
            [VENDOR, [MODEL, /_/g, " "], [TYPE, MOBILE]],
            [
              // Acer
              /droid.+; ([ab][1-7]-?[0178a]\d\d?)/i,
            ],
            [MODEL, [VENDOR, "Acer"], [TYPE, TABLET]],
            [
              // Meizu
              /droid.+; (m[1-5] note) bui/i,
              /\bmz-([-\w]{2,})/i,
            ],
            [MODEL, [VENDOR, "Meizu"], [TYPE, MOBILE]],
            [
              // Ulefone
              /; ((?:power )?armor(?:[\w ]{0,8}))(?: bui|\))/i,
            ],
            [MODEL, [VENDOR, "Ulefone"], [TYPE, MOBILE]],
            [
              // MIXED
              /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron|infinix|tecno)[-_ ]?([-\w]*)/i,
              // BlackBerry/BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron
              /(hp) ([\w ]+\w)/i, // HP iPAQ
              /(asus)-?(\w+)/i, // Asus
              /(microsoft); (lumia[\w ]+)/i, // Microsoft Lumia
              /(lenovo)[-_ ]?([-\w]+)/i, // Lenovo
              /(jolla)/i, // Jolla
              /(oppo) ?([\w ]+) bui/i, // OPPO
            ],
            [VENDOR, MODEL, [TYPE, MOBILE]],
            [
              /(kobo)\s(ereader|touch)/i, // Kobo
              /(archos) (gamepad2?)/i, // Archos
              /(hp).+(touchpad(?!.+tablet)|tablet)/i, // HP TouchPad
              /(kindle)\/([\w\.]+)/i, // Kindle
              /(nook)[\w ]+build\/(\w+)/i, // Nook
              /(dell) (strea[kpr\d ]*[\dko])/i, // Dell Streak
              /(le[- ]+pan)[- ]+(\w{1,9}) bui/i, // Le Pan Tablets
              /(trinity)[- ]*(t\d{3}) bui/i, // Trinity Tablets
              /(gigaset)[- ]+(q\w{1,9}) bui/i, // Gigaset Tablets
              /(vodafone) ([\w ]+)(?:\)| bui)/i, // Vodafone
            ],
            [VENDOR, MODEL, [TYPE, TABLET]],
            [
              /(surface duo)/i, // Surface Duo
            ],
            [MODEL, [VENDOR, MICROSOFT], [TYPE, TABLET]],
            [
              /droid [\d\.]+; (fp\du?)(?: b|\))/i, // Fairphone
            ],
            [MODEL, [VENDOR, "Fairphone"], [TYPE, MOBILE]],
            [
              /(u304aa)/i, // AT&T
            ],
            [MODEL, [VENDOR, "AT&T"], [TYPE, MOBILE]],
            [
              /\bsie-(\w*)/i, // Siemens
            ],
            [MODEL, [VENDOR, "Siemens"], [TYPE, MOBILE]],
            [
              /\b(rct\w+) b/i, // RCA Tablets
            ],
            [MODEL, [VENDOR, "RCA"], [TYPE, TABLET]],
            [
              /\b(venue[\d ]{2,7}) b/i, // Dell Venue Tablets
            ],
            [MODEL, [VENDOR, "Dell"], [TYPE, TABLET]],
            [
              /\b(q(?:mv|ta)\w+) b/i, // Verizon Tablet
            ],
            [MODEL, [VENDOR, "Verizon"], [TYPE, TABLET]],
            [
              /\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i, // Barnes & Noble Tablet
            ],
            [MODEL, [VENDOR, "Barnes & Noble"], [TYPE, TABLET]],
            [/\b(tm\d{3}\w+) b/i],
            [MODEL, [VENDOR, "NuVision"], [TYPE, TABLET]],
            [
              /\b(k88) b/i, // ZTE K Series Tablet
            ],
            [MODEL, [VENDOR, "ZTE"], [TYPE, TABLET]],
            [
              /\b(nx\d{3}j) b/i, // ZTE Nubia
            ],
            [MODEL, [VENDOR, "ZTE"], [TYPE, MOBILE]],
            [
              /\b(gen\d{3}) b.+49h/i, // Swiss GEN Mobile
            ],
            [MODEL, [VENDOR, "Swiss"], [TYPE, MOBILE]],
            [
              /\b(zur\d{3}) b/i, // Swiss ZUR Tablet
            ],
            [MODEL, [VENDOR, "Swiss"], [TYPE, TABLET]],
            [
              /\b((zeki)?tb.*\b) b/i, // Zeki Tablets
            ],
            [MODEL, [VENDOR, "Zeki"], [TYPE, TABLET]],
            [
              /\b([yr]\d{2}) b/i,
              /\b(dragon[- ]+touch |dt)(\w{5}) b/i, // Dragon Touch Tablet
            ],
            [[VENDOR, "Dragon Touch"], MODEL, [TYPE, TABLET]],
            [
              /\b(ns-?\w{0,9}) b/i, // Insignia Tablets
            ],
            [MODEL, [VENDOR, "Insignia"], [TYPE, TABLET]],
            [
              /\b((nxa|next)-?\w{0,9}) b/i, // NextBook Tablets
            ],
            [MODEL, [VENDOR, "NextBook"], [TYPE, TABLET]],
            [
              /\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i, // Voice Xtreme Phones
            ],
            [[VENDOR, "Voice"], MODEL, [TYPE, MOBILE]],
            [
              /\b(lvtel\-)?(v1[12]) b/i, // LvTel Phones
            ],
            [[VENDOR, "LvTel"], MODEL, [TYPE, MOBILE]],
            [
              /\b(ph-1) /i, // Essential PH-1
            ],
            [MODEL, [VENDOR, "Essential"], [TYPE, MOBILE]],
            [
              /\b(v(100md|700na|7011|917g).*\b) b/i, // Envizen Tablets
            ],
            [MODEL, [VENDOR, "Envizen"], [TYPE, TABLET]],
            [
              /\b(trio[-\w\. ]+) b/i, // MachSpeed Tablets
            ],
            [MODEL, [VENDOR, "MachSpeed"], [TYPE, TABLET]],
            [
              /\btu_(1491) b/i, // Rotor Tablets
            ],
            [MODEL, [VENDOR, "Rotor"], [TYPE, TABLET]],
            [
              /(shield[\w ]+) b/i, // Nvidia Shield Tablets
            ],
            [MODEL, [VENDOR, "Nvidia"], [TYPE, TABLET]],
            [
              /(sprint) (\w+)/i, // Sprint Phones
            ],
            [VENDOR, MODEL, [TYPE, MOBILE]],
            [
              /(kin\.[onetw]{3})/i, // Microsoft Kin
            ],
            [
              [MODEL, /\./g, " "],
              [VENDOR, MICROSOFT],
              [TYPE, MOBILE],
            ],
            [
              /droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i, // Zebra
            ],
            [MODEL, [VENDOR, ZEBRA], [TYPE, TABLET]],
            [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i],
            [MODEL, [VENDOR, ZEBRA], [TYPE, MOBILE]],
            [
              ///////////////////
              // SMARTTVS
              ///////////////////

              /smart-tv.+(samsung)/i, // Samsung
            ],
            [VENDOR, [TYPE, SMARTTV]],
            [/hbbtv.+maple;(\d+)/i],
            [
              [MODEL, /^/, "SmartTV"],
              [VENDOR, SAMSUNG],
              [TYPE, SMARTTV],
            ],
            [
              /(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i, // LG SmartTV
            ],
            [
              [VENDOR, LG],
              [TYPE, SMARTTV],
            ],
            [
              /(apple) ?tv/i, // Apple TV
            ],
            [VENDOR, [MODEL, APPLE + " TV"], [TYPE, SMARTTV]],
            [
              /crkey/i, // Google Chromecast
            ],
            [
              [MODEL, CHROME + "cast"],
              [VENDOR, GOOGLE],
              [TYPE, SMARTTV],
            ],
            [
              /droid.+aft(\w+)( bui|\))/i, // Fire TV
            ],
            [MODEL, [VENDOR, AMAZON], [TYPE, SMARTTV]],
            [
              /\(dtv[\);].+(aquos)/i,
              /(aquos-tv[\w ]+)\)/i, // Sharp
            ],
            [MODEL, [VENDOR, SHARP], [TYPE, SMARTTV]],
            [
              /(bravia[\w ]+)( bui|\))/i, // Sony
            ],
            [MODEL, [VENDOR, SONY], [TYPE, SMARTTV]],
            [
              /(mitv-\w{5}) bui/i, // Xiaomi
            ],
            [MODEL, [VENDOR, XIAOMI], [TYPE, SMARTTV]],
            [
              /Hbbtv.*(technisat) (.*);/i, // TechniSAT
            ],
            [VENDOR, MODEL, [TYPE, SMARTTV]],
            [
              /\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, // Roku
              /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i, // HbbTV devices
            ],
            [
              [VENDOR, trim],
              [MODEL, trim],
              [TYPE, SMARTTV],
            ],
            [
              /\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i, // SmartTV from Unidentified Vendors
            ],
            [[TYPE, SMARTTV]],
            [
              ///////////////////
              // CONSOLES
              ///////////////////

              /(ouya)/i, // Ouya
              /(nintendo) ([wids3utch]+)/i, // Nintendo
            ],
            [VENDOR, MODEL, [TYPE, CONSOLE]],
            [
              /droid.+; (shield) bui/i, // Nvidia
            ],
            [MODEL, [VENDOR, "Nvidia"], [TYPE, CONSOLE]],
            [
              /(playstation [345portablevi]+)/i, // Playstation
            ],
            [MODEL, [VENDOR, SONY], [TYPE, CONSOLE]],
            [
              /\b(xbox(?: one)?(?!; xbox))[\); ]/i, // Microsoft Xbox
            ],
            [MODEL, [VENDOR, MICROSOFT], [TYPE, CONSOLE]],
            [
              ///////////////////
              // WEARABLES
              ///////////////////

              /((pebble))app/i, // Pebble
            ],
            [VENDOR, MODEL, [TYPE, WEARABLE]],
            [
              /(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i, // Apple Watch
            ],
            [MODEL, [VENDOR, APPLE], [TYPE, WEARABLE]],
            [
              /droid.+; (glass) \d/i, // Google Glass
            ],
            [MODEL, [VENDOR, GOOGLE], [TYPE, WEARABLE]],
            [/droid.+; (wt63?0{2,3})\)/i],
            [MODEL, [VENDOR, ZEBRA], [TYPE, WEARABLE]],
            [
              /(quest( 2| pro)?)/i, // Oculus Quest
            ],
            [MODEL, [VENDOR, FACEBOOK], [TYPE, WEARABLE]],
            [
              ///////////////////
              // EMBEDDED
              ///////////////////

              /(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i, // Tesla
            ],
            [VENDOR, [TYPE, EMBEDDED]],
            [
              /(aeobc)\b/i, // Echo Dot
            ],
            [MODEL, [VENDOR, AMAZON], [TYPE, EMBEDDED]],
            [
              ////////////////////
              // MIXED (GENERIC)
              ///////////////////

              /droid .+?; ([^;]+?)(?: bui|; wv\)|\) applew).+? mobile safari/i, // Android Phones from Unidentified Vendors
            ],
            [MODEL, [TYPE, MOBILE]],
            [
              /droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i, // Android Tablets from Unidentified Vendors
            ],
            [MODEL, [TYPE, TABLET]],
            [
              /\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i, // Unidentifiable Tablet
            ],
            [[TYPE, TABLET]],
            [
              /(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i, // Unidentifiable Mobile
            ],
            [[TYPE, MOBILE]],
            [
              /(android[-\w\. ]{0,9});.+buil/i, // Generic Android Device
            ],
            [MODEL, [VENDOR, "Generic"]],
          ],

          engine: [
            [
              /windows.+ edge\/([\w\.]+)/i, // EdgeHTML
            ],
            [VERSION, [NAME, EDGE + "HTML"]],
            [
              /webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i, // Blink
            ],
            [VERSION, [NAME, "Blink"]],
            [
              /(presto)\/([\w\.]+)/i, // Presto
              /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m/Goanna
              /ekioh(flow)\/([\w\.]+)/i, // Flow
              /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i, // KHTML/Tasman/Links
              /(icab)[\/ ]([23]\.[\d\.]+)/i, // iCab
              /\b(libweb)/i,
            ],
            [NAME, VERSION],
            [
              /rv\:([\w\.]{1,9})\b.+(gecko)/i, // Gecko
            ],
            [VERSION, NAME],
          ],

          os: [
            [
              // Windows
              /microsoft (windows) (vista|xp)/i, // Windows (iTunes)
            ],
            [NAME, VERSION],
            [
              /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i, // Windows Phone
            ],
            [NAME, [VERSION, strMapper, windowsVersionMap]],
            [
              /windows nt 6\.2; (arm)/i, // Windows RT
              /windows[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i,
              /(?:win(?=3|9|n)|win 9x )([nt\d\.]+)/i,
            ],
            [
              [VERSION, strMapper, windowsVersionMap],
              [NAME, "Windows"],
            ],
            [
              // iOS/macOS
              /ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, // iOS
              /(?:ios;fbsv\/|iphone.+ios[\/ ])([\d\.]+)/i,
              /cfnetwork\/.+darwin/i,
            ],
            [
              [VERSION, /_/g, "."],
              [NAME, "iOS"],
            ],
            [
              /(mac os x) ?([\w\. ]*)/i,
              /(macintosh|mac_powerpc\b)(?!.+haiku)/i, // Mac OS
            ],
            [
              [NAME, MAC_OS],
              [VERSION, /_/g, "."],
            ],
            [
              // Mobile OSes
              /droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i, // Android-x86/HarmonyOS
            ],
            [VERSION, NAME],
            [
              // Android/WebOS/QNX/Bada/RIM/Maemo/MeeGo/Sailfish OS
              /(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i,
              /(blackberry)\w*\/([\w\.]*)/i, // Blackberry
              /(tizen|kaios)[\/ ]([\w\.]+)/i, // Tizen/KaiOS
              /\((series40);/i, // Series 40
            ],
            [NAME, VERSION],
            [
              /\(bb(10);/i, // BlackBerry 10
            ],
            [VERSION, [NAME, BLACKBERRY]],
            [
              /(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i, // Symbian
            ],
            [VERSION, [NAME, "Symbian"]],
            [
              /mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i, // Firefox OS
            ],
            [VERSION, [NAME, FIREFOX + " OS"]],
            [
              /web0s;.+rt(tv)/i,
              /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i, // WebOS
            ],
            [VERSION, [NAME, "webOS"]],
            [
              /watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i, // watchOS
            ],
            [VERSION, [NAME, "watchOS"]],
            [
              // Google Chromecast
              /crkey\/([\d\.]+)/i, // Google Chromecast
            ],
            [VERSION, [NAME, CHROME + "cast"]],
            [
              /(cros) [\w]+(?:\)| ([\w\.]+)\b)/i, // Chromium OS
            ],
            [[NAME, CHROMIUM_OS], VERSION],
            [
              // Smart TVs
              /panasonic;(viera)/i, // Panasonic Viera
              /(netrange)mmh/i, // Netrange
              /(nettv)\/(\d+\.[\w\.]+)/i, // NetTV

              // Console
              /(nintendo|playstation) ([wids345portablevuch]+)/i, // Nintendo/Playstation
              /(xbox); +xbox ([^\);]+)/i, // Microsoft Xbox (360, One, X, S, Series X, Series S)

              // Other
              /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i, // Joli/Palm
              /(mint)[\/\(\) ]?(\w*)/i, // Mint
              /(mageia|vectorlinux)[; ]/i, // Mageia/VectorLinux
              /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,
              // Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware/Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus/Raspbian/Plan9/Minix/RISCOS/Contiki/Deepin/Manjaro/elementary/Sabayon/Linspire
              /(hurd|linux) ?([\w\.]*)/i, // Hurd/Linux
              /(gnu) ?([\w\.]*)/i, // GNU
              /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, // FreeBSD/NetBSD/OpenBSD/PC-BSD/GhostBSD/DragonFly
              /(haiku) (\w+)/i, // Haiku
            ],
            [NAME, VERSION],
            [
              /(sunos) ?([\w\.\d]*)/i, // Solaris
            ],
            [[NAME, "Solaris"], VERSION],
            [
              /((?:open)?solaris)[-\/ ]?([\w\.]*)/i, // Solaris
              /(aix) ((\d)(?=\.|\)| )[\w\.])*/i, // AIX
              /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i, // BeOS/OS2/AmigaOS/MorphOS/OpenVMS/Fuchsia/HP-UX/SerenityOS
              /(unix) ?([\w\.]*)/i, // UNIX
            ],
            [NAME, VERSION],
          ],
        };

        /////////////////
        // Constructor
        ////////////////

        var UAParser = function (ua, extensions) {
          if (typeof ua === OBJ_TYPE) {
            extensions = ua;
            ua = undefined;
          }

          if (!(this instanceof UAParser)) {
            return new UAParser(ua, extensions).getResult();
          }

          var _navigator =
            typeof window !== UNDEF_TYPE && window.navigator
              ? window.navigator
              : undefined;
          var _ua =
            ua ||
            (_navigator && _navigator.userAgent ? _navigator.userAgent : EMPTY);
          var _uach =
            _navigator && _navigator.userAgentData
              ? _navigator.userAgentData
              : undefined;
          var _rgxmap = extensions ? extend(regexes, extensions) : regexes;
          var _isSelfNav = _navigator && _navigator.userAgent == _ua;

          this.getBrowser = function () {
            var _browser = {};
            _browser[NAME] = undefined;
            _browser[VERSION] = undefined;
            rgxMapper.call(_browser, _ua, _rgxmap.browser);
            _browser[MAJOR] = majorize(_browser[VERSION]);
            // Brave-specific detection
            if (
              _isSelfNav &&
              _navigator &&
              _navigator.brave &&
              typeof _navigator.brave.isBrave == FUNC_TYPE
            ) {
              _browser[NAME] = "Brave";
            }
            return _browser;
          };
          this.getCPU = function () {
            var _cpu = {};
            _cpu[ARCHITECTURE] = undefined;
            rgxMapper.call(_cpu, _ua, _rgxmap.cpu);
            return _cpu;
          };
          this.getDevice = function () {
            var _device = {};
            _device[VENDOR] = undefined;
            _device[MODEL] = undefined;
            _device[TYPE] = undefined;
            rgxMapper.call(_device, _ua, _rgxmap.device);
            if (_isSelfNav && !_device[TYPE] && _uach && _uach.mobile) {
              _device[TYPE] = MOBILE;
            }
            // iPadOS-specific detection: identified as Mac, but has some iOS-only properties
            if (
              _isSelfNav &&
              _device[MODEL] == "Macintosh" &&
              _navigator &&
              typeof _navigator.standalone !== UNDEF_TYPE &&
              _navigator.maxTouchPoints &&
              _navigator.maxTouchPoints > 2
            ) {
              _device[MODEL] = "iPad";
              _device[TYPE] = TABLET;
            }
            return _device;
          };
          this.getEngine = function () {
            var _engine = {};
            _engine[NAME] = undefined;
            _engine[VERSION] = undefined;
            rgxMapper.call(_engine, _ua, _rgxmap.engine);
            return _engine;
          };
          this.getOS = function () {
            var _os = {};
            _os[NAME] = undefined;
            _os[VERSION] = undefined;
            rgxMapper.call(_os, _ua, _rgxmap.os);
            if (
              _isSelfNav &&
              !_os[NAME] &&
              _uach &&
              _uach.platform != "Unknown"
            ) {
              _os[NAME] = _uach.platform
                .replace(/chrome os/i, CHROMIUM_OS)
                .replace(/macos/i, MAC_OS); // backward compatibility
            }
            return _os;
          };
          this.getResult = function () {
            return {
              ua: this.getUA(),
              browser: this.getBrowser(),
              engine: this.getEngine(),
              os: this.getOS(),
              device: this.getDevice(),
              cpu: this.getCPU(),
            };
          };
          this.getUA = function () {
            return _ua;
          };
          this.setUA = function (ua) {
            _ua =
              typeof ua === STR_TYPE && ua.length > UA_MAX_LENGTH
                ? trim(ua, UA_MAX_LENGTH)
                : ua;
            return this;
          };
          this.setUA(_ua);
          return this;
        };

        UAParser.VERSION = LIBVERSION;
        UAParser.BROWSER = enumerize([NAME, VERSION, MAJOR]);
        UAParser.CPU = enumerize([ARCHITECTURE]);
        UAParser.DEVICE = enumerize([
          MODEL,
          VENDOR,
          TYPE,
          CONSOLE,
          MOBILE,
          SMARTTV,
          TABLET,
          WEARABLE,
          EMBEDDED,
        ]);
        UAParser.ENGINE = UAParser.OS = enumerize([NAME, VERSION]);

        ///////////
        // Export
        //////////

        // check js environment
        if (typeof exports !== UNDEF_TYPE) {
          // nodejs env
          if ("object" !== UNDEF_TYPE && module.exports) {
            exports = module.exports = UAParser;
          }
          exports.UAParser = UAParser;
        } else {
          // requirejs env (optional)
          if ("function" === FUNC_TYPE && __webpack_require__.amdO) {
            !((__WEBPACK_AMD_DEFINE_RESULT__ = function () {
              return UAParser;
            }.call(exports, __webpack_require__, exports, module)),
            __WEBPACK_AMD_DEFINE_RESULT__ !== undefined &&
              (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
          } else if (typeof window !== UNDEF_TYPE) {
            // browser env
            window.UAParser = UAParser;
          }
        }

        // jQuery/Zepto specific (optional)
        // Note:
        //   In AMD env the global scope should be kept clean, but jQuery is an exception.
        //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
        //   and we should catch that.
        var $ = typeof window !== UNDEF_TYPE && (window.jQuery || window.Zepto);
        if ($ && !$.ua) {
          var parser = new UAParser();
          $.ua = parser.getResult();
          $.ua.get = function () {
            return parser.getUA();
          };
          $.ua.set = function (ua) {
            parser.setUA(ua);
            var result = parser.getResult();
            for (var prop in result) {
              $.ua[prop] = result[prop];
            }
          };
        }
      })(typeof window === "object" ? window : this);

      /***/
    },

    /******/
  };
  /************************************************************************/
  /******/ // The module cache
  /******/ var __webpack_module_cache__ = {};
  /******/
  /******/ // The require function
  /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ var cachedModule = __webpack_module_cache__[moduleId];
    /******/ if (cachedModule !== undefined) {
      /******/ return cachedModule.exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/ var module = (__webpack_module_cache__[moduleId] = {
      /******/ // no module.id needed
      /******/ // no module.loaded needed
      /******/ exports: {},
      /******/
    });
    /******/
    /******/ // Execute the module function
    /******/ __webpack_modules__[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    );
    /******/
    /******/ // Return the exports of the module
    /******/ return module.exports;
    /******/
  }
  /******/
  /************************************************************************/
  /******/ /* webpack/runtime/amd options */
  /******/ (() => {
    /******/ __webpack_require__.amdO = {};
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/compat get default export */
  /******/ (() => {
    /******/ // getDefaultExport function for compatibility with non-harmony modules
    /******/ __webpack_require__.n = (module) => {
      /******/ var getter =
        module && module.__esModule
          ? /******/ () => module["default"]
          : /******/ () => module;
      /******/ __webpack_require__.d(getter, { a: getter });
      /******/ return getter;
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/define property getters */
  /******/ (() => {
    /******/ // define getter functions for harmony exports
    /******/ __webpack_require__.d = (exports, definition) => {
      /******/ for (var key in definition) {
        /******/ if (
          __webpack_require__.o(definition, key) &&
          !__webpack_require__.o(exports, key)
        ) {
          /******/ Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key],
          });
          /******/
        }
        /******/
      }
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/global */
  /******/ (() => {
    /******/ __webpack_require__.g = (function () {
      /******/ if (typeof globalThis === "object") return globalThis;
      /******/ try {
        /******/ return this || new Function("return this")();
        /******/
      } catch (e) {
        /******/ if (typeof window === "object") return window;
        /******/
      }
      /******/
    })();
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/hasOwnProperty shorthand */
  /******/ (() => {
    /******/ __webpack_require__.o = (obj, prop) =>
      Object.prototype.hasOwnProperty.call(obj, prop);
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/make namespace object */
  /******/ (() => {
    /******/ // define __esModule on exports
    /******/ __webpack_require__.r = (exports) => {
      /******/ if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        /******/ Object.defineProperty(exports, Symbol.toStringTag, {
          value: "Module",
        });
        /******/
      }
      /******/ Object.defineProperty(exports, "__esModule", { value: true });
      /******/
    };
    /******/
  })();
  /******/
  /************************************************************************/
  var __webpack_exports__ = {};
  // This entry need to be wrapped in an IIFE because it need to be in strict mode.
  (() => {
    "use strict";
    /* harmony import */ var _trezor_connect_web_lib_channels_window_serviceworker__WEBPACK_IMPORTED_MODULE_0__ =
      __webpack_require__(312);

    /**
     * communication between service worker and both webextension and popup manager
     */
    const channel =
      new _trezor_connect_web_lib_channels_window_serviceworker__WEBPACK_IMPORTED_MODULE_0__ /* .WindowServiceWorkerChannel */.E(
        {
          name: "trezor-connect",
          channel: {
            here: "@trezor/connect-content-script",
            peer: "@trezor/connect-webextension",
          },
        }
      );
    channel.init().then(() => {
      // once script is loaded. send information about the webextension that injected it into the popup
      window.postMessage(
        {
          type: "popup-content-script-loaded",
          payload: {
            ...chrome.runtime.getManifest(),
            id: chrome.runtime.id,
          },
        },
        window.location.origin
      );

      /**
       * Passing messages from service worker to popup
       */
      channel.on("message", (message) => {
        window.postMessage(message, window.location.origin);
      });

      /*
       * Passing messages from popup to service worker
       */
      window.addEventListener("message", (event) => {
        if (
          event.data?.channel?.here === "@trezor/connect-webextension" ||
          event.data?.type === "popup-content-script-loaded"
        ) {
          return;
        }
        if (event.source === window && event.data) {
          channel.postMessage(event.data, {
            usePromise: false,
          });
        }
      });
      window.addEventListener("beforeunload", () => {
        window.postMessage(
          {
            type: "popup-closed",
          },
          window.location.origin
        );
      });
    });
  })();

  /******/
})();
