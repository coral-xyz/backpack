(() => {
  var e = [
      (e) => {
        (e.exports = function (e) {
          return e && e.__esModule ? e : { default: e };
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e) => {
        "use strict";
        e.exports = require("react");
      },
      (e) => {
        "use strict";
        e.exports = require("react-native");
      },
      (e, t, r) => {
        var n = r(33);
        (e.exports = function (e, t) {
          if (null == e) return {};
          var r,
            o,
            a = n(e, t);
          if (Object.getOwnPropertySymbols) {
            var i = Object.getOwnPropertySymbols(e);
            for (o = 0; o < i.length; o++)
              (r = i[o]),
                t.indexOf(r) >= 0 ||
                  (Object.prototype.propertyIsEnumerable.call(e, r) &&
                    (a[r] = e[r]));
          }
          return a;
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e) => {
        "use strict";
        e.exports = require("@react-navigation/native");
      },
      (e) => {
        function t() {
          return (
            (e.exports = t =
              Object.assign
                ? Object.assign.bind()
                : function (e) {
                    for (var t = 1; t < arguments.length; t++) {
                      var r = arguments[t];
                      for (var n in r)
                        Object.prototype.hasOwnProperty.call(r, n) &&
                          (e[n] = r[n]);
                    }
                    return e;
                  }),
            (e.exports.__esModule = !0),
            (e.exports.default = e.exports),
            t.apply(this, arguments)
          );
        }
        (e.exports = t),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e, t, r) => {
        var n = r(39),
          o = r(40),
          a = r(18),
          i = r(41);
        (e.exports = function (e, t) {
          return n(e) || o(e, t) || a(e, t) || i();
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 });
        var o = {
          Assets: !0,
          Background: !0,
          getDefaultHeaderHeight: !0,
          getHeaderTitle: !0,
          Header: !0,
          HeaderBackButton: !0,
          HeaderBackContext: !0,
          HeaderBackground: !0,
          HeaderHeightContext: !0,
          HeaderShownContext: !0,
          HeaderTitle: !0,
          useHeaderHeight: !0,
          MissingIcon: !0,
          PlatformPressable: !0,
          ResourceSavingView: !0,
          SafeAreaProviderCompat: !0,
          Screen: !0,
        };
        Object.defineProperty(t, "Background", {
          enumerable: !0,
          get: function () {
            return a.default;
          },
        }),
          Object.defineProperty(t, "getDefaultHeaderHeight", {
            enumerable: !0,
            get: function () {
              return i.default;
            },
          }),
          Object.defineProperty(t, "getHeaderTitle", {
            enumerable: !0,
            get: function () {
              return l.default;
            },
          }),
          Object.defineProperty(t, "Header", {
            enumerable: !0,
            get: function () {
              return u.default;
            },
          }),
          Object.defineProperty(t, "HeaderBackButton", {
            enumerable: !0,
            get: function () {
              return s.default;
            },
          }),
          Object.defineProperty(t, "HeaderBackContext", {
            enumerable: !0,
            get: function () {
              return c.default;
            },
          }),
          Object.defineProperty(t, "HeaderBackground", {
            enumerable: !0,
            get: function () {
              return d.default;
            },
          }),
          Object.defineProperty(t, "HeaderHeightContext", {
            enumerable: !0,
            get: function () {
              return f.default;
            },
          }),
          Object.defineProperty(t, "HeaderShownContext", {
            enumerable: !0,
            get: function () {
              return p.default;
            },
          }),
          Object.defineProperty(t, "HeaderTitle", {
            enumerable: !0,
            get: function () {
              return h.default;
            },
          }),
          Object.defineProperty(t, "useHeaderHeight", {
            enumerable: !0,
            get: function () {
              return v.default;
            },
          }),
          Object.defineProperty(t, "MissingIcon", {
            enumerable: !0,
            get: function () {
              return y.default;
            },
          }),
          Object.defineProperty(t, "PlatformPressable", {
            enumerable: !0,
            get: function () {
              return g.default;
            },
          }),
          Object.defineProperty(t, "ResourceSavingView", {
            enumerable: !0,
            get: function () {
              return b.default;
            },
          }),
          Object.defineProperty(t, "SafeAreaProviderCompat", {
            enumerable: !0,
            get: function () {
              return m.default;
            },
          }),
          Object.defineProperty(t, "Screen", {
            enumerable: !0,
            get: function () {
              return w.default;
            },
          }),
          (t.Assets = void 0);
        var a = n(r(47)),
          i = n(r(21)),
          l = n(r(67)),
          u = n(r(68)),
          s = n(r(69)),
          c = n(r(71)),
          d = n(r(48)),
          f = n(r(26)),
          p = n(r(22)),
          h = n(r(49)),
          v = n(r(72)),
          y = n(r(73)),
          g = n(r(50)),
          b = n(r(74)),
          m = n(r(75)),
          w = n(r(76)),
          O = r(77);
        Object.keys(O).forEach(function (e) {
          "default" !== e &&
            "__esModule" !== e &&
            (Object.prototype.hasOwnProperty.call(o, e) ||
              (e in t && t[e] === O[e]) ||
              Object.defineProperty(t, e, {
                enumerable: !0,
                get: function () {
                  return O[e];
                },
              }));
        });
        var S = [r(24), r(25)];
        t.Assets = S;
      },
      (e) => {
        "use strict";
        e.exports = require("react-native-safe-area-context");
      },
      (e) => {
        function t(r) {
          return (
            (e.exports = t =
              "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                ? function (e) {
                    return typeof e;
                  }
                : function (e) {
                    return e &&
                      "function" == typeof Symbol &&
                      e.constructor === Symbol &&
                      e !== Symbol.prototype
                      ? "symbol"
                      : typeof e;
                  }),
            (e.exports.__esModule = !0),
            (e.exports.default = e.exports),
            t(r)
          );
        }
        (e.exports = t),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e) => {
        function t(r) {
          return (
            (e.exports = t =
              Object.setPrototypeOf
                ? Object.getPrototypeOf.bind()
                : function (e) {
                    return e.__proto__ || Object.getPrototypeOf(e);
                  }),
            (e.exports.__esModule = !0),
            (e.exports.default = e.exports),
            t(r)
          );
        }
        (e.exports = t),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e) => {
        (e.exports = function (e, t) {
          if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function");
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e, t, r) => {
        var n = r(19);
        function o(e, t) {
          for (var r = 0; r < t.length; r++) {
            var o = t[r];
            (o.enumerable = o.enumerable || !1),
              (o.configurable = !0),
              "value" in o && (o.writable = !0),
              Object.defineProperty(e, n(o.key), o);
          }
        }
        (e.exports = function (e, t, r) {
          return (
            t && o(e.prototype, t),
            r && o(e, r),
            Object.defineProperty(e, "prototype", { writable: !1 }),
            e
          );
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e, t, r) => {
        var n = r(32);
        (e.exports = function (e, t) {
          if ("function" != typeof t && null !== t)
            throw new TypeError(
              "Super expression must either be null or a function"
            );
          (e.prototype = Object.create(t && t.prototype, {
            constructor: { value: e, writable: !0, configurable: !0 },
          })),
            Object.defineProperty(e, "prototype", { writable: !1 }),
            t && n(e, t);
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e, t, r) => {
        var n = r(9).default,
          o = r(38);
        (e.exports = function (e, t) {
          if (t && ("object" === n(t) || "function" == typeof t)) return t;
          if (void 0 !== t)
            throw new TypeError(
              "Derived constructors may only return object or undefined"
            );
          return o(e);
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.forHorizontalIOS = function (e) {
            var t = e.current,
              r = e.next,
              n = e.inverted,
              o = e.layouts.screen,
              a = l(
                t.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [o.width, 0],
                  extrapolate: "clamp",
                }),
                n
              ),
              i = r
                ? l(
                    r.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -0.3 * o.width],
                      extrapolate: "clamp",
                    }),
                    n
                  )
                : 0,
              u = t.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.07],
                extrapolate: "clamp",
              }),
              s = t.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
                extrapolate: "clamp",
              });
            return {
              cardStyle: { transform: [{ translateX: a }, { translateX: i }] },
              overlayStyle: { opacity: u },
              shadowStyle: { shadowOpacity: s },
            };
          }),
          (t.forVerticalIOS = function (e) {
            var t = e.current,
              r = e.inverted,
              n = e.layouts.screen;
            return {
              cardStyle: {
                transform: [
                  {
                    translateY: l(
                      t.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [n.height, 0],
                        extrapolate: "clamp",
                      }),
                      r
                    ),
                  },
                ],
              },
            };
          }),
          (t.forModalPresentationIOS = function (e) {
            var t = e.index,
              r = e.current,
              n = e.next,
              a = e.inverted,
              u = e.layouts.screen,
              s = e.insets,
              c =
                "ios" === o.Platform.OS &&
                !o.Platform.isPad &&
                !o.Platform.isTV &&
                s.top > 20,
              d = u.width > u.height,
              f = d ? 0 : 10,
              p = s.top,
              h = u.height / u.width,
              v = i(
                r.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                  extrapolate: "clamp",
                }),
                n
                  ? n.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                      extrapolate: "clamp",
                    })
                  : 0
              ),
              y = 0 === t,
              g = l(
                v.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: [u.height, y ? 0 : f, (y ? p : 0) - f * h],
                }),
                a
              ),
              b = v.interpolate({
                inputRange: [0, 1, 1.0001, 2],
                outputRange: [0, 0.3, 1, 1],
              }),
              m = d
                ? 1
                : v.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [1, 1, u.width ? 1 - (2 * f) / u.width : 1],
                  }),
              w = d
                ? 0
                : y
                ? v.interpolate({
                    inputRange: [0, 1, 1.0001, 2],
                    outputRange: [0, 0, c ? 38 : 0, 10],
                  })
                : 10;
            return {
              cardStyle: {
                overflow: "hidden",
                borderTopLeftRadius: w,
                borderTopRightRadius: w,
                borderBottomLeftRadius: c ? w : 0,
                borderBottomRightRadius: c ? w : 0,
                marginTop: y ? 0 : p,
                marginBottom: y ? 0 : f,
                transform: [{ translateY: g }, { scale: m }],
              },
              overlayStyle: { opacity: b },
            };
          }),
          (t.forFadeFromBottomAndroid = function (e) {
            var t = e.current,
              r = e.inverted,
              n = e.layouts.screen,
              o = e.closing,
              i = l(
                t.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.08 * n.height, 0],
                  extrapolate: "clamp",
                }),
                r
              );
            return {
              cardStyle: {
                opacity: (0, a.default)(
                  o,
                  t.progress,
                  t.progress.interpolate({
                    inputRange: [0, 0.5, 0.9, 1],
                    outputRange: [0, 0.25, 0.7, 1],
                    extrapolate: "clamp",
                  })
                ),
                transform: [{ translateY: i }],
              },
            };
          }),
          (t.forRevealFromBottomAndroid = function (e) {
            var t = e.current,
              r = e.next,
              n = e.inverted,
              o = e.layouts.screen,
              a = l(
                t.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [o.height, 0],
                  extrapolate: "clamp",
                }),
                n
              ),
              i = l(
                t.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [o.height * (95.9 / 100) * -1, 0],
                  extrapolate: "clamp",
                }),
                n
              ),
              u = r
                ? l(
                    r.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.02 * o.height * -1],
                      extrapolate: "clamp",
                    }),
                    n
                  )
                : 0,
              s = t.progress.interpolate({
                inputRange: [0, 0.36, 1],
                outputRange: [0, 0.1, 0.1],
                extrapolate: "clamp",
              });
            return {
              containerStyle: {
                overflow: "hidden",
                transform: [{ translateY: a }],
              },
              cardStyle: { transform: [{ translateY: i }, { translateY: u }] },
              overlayStyle: { opacity: s },
            };
          }),
          (t.forScaleFromCenterAndroid = function (e) {
            var t = e.current,
              r = e.next,
              n = e.closing,
              o = i(
                t.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                  extrapolate: "clamp",
                }),
                r
                  ? r.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                      extrapolate: "clamp",
                    })
                  : 0
              ),
              l = o.interpolate({
                inputRange: [0, 0.75, 0.875, 1, 1.0825, 1.2075, 2],
                outputRange: [0, 0, 1, 1, 1, 1, 0],
              }),
              u = (0, a.default)(
                n,
                t.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.925, 1],
                  extrapolate: "clamp",
                }),
                o.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: [0.85, 1, 1.075],
                })
              );
            return { cardStyle: { opacity: l, transform: [{ scale: u }] } };
          }),
          (t.forBottomSheetAndroid = function (e) {
            var t = e.current,
              r = e.inverted,
              n = e.layouts.screen,
              o = e.closing,
              i = l(
                t.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8 * n.height, 0],
                  extrapolate: "clamp",
                }),
                r
              ),
              u = (0, a.default)(
                o,
                t.progress,
                t.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                  extrapolate: "clamp",
                })
              ),
              s = t.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
                extrapolate: "clamp",
              });
            return {
              cardStyle: { opacity: u, transform: [{ translateY: i }] },
              overlayStyle: { opacity: s },
            };
          }),
          (t.forFadeFromCenter = function (e) {
            var t = e.current.progress;
            return {
              cardStyle: {
                opacity: t.interpolate({
                  inputRange: [0, 0.5, 0.9, 1],
                  outputRange: [0, 0.25, 0.7, 1],
                }),
              },
              overlayStyle: {
                opacity: t.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                  extrapolate: "clamp",
                }),
              },
            };
          }),
          (t.forNoAnimation = function () {
            return {};
          });
        var o = r(2),
          a = n(r(65)),
          i = o.Animated.add,
          l = o.Animated.multiply;
      },
      (e, t, r) => {
        var n = r(34),
          o = r(35),
          a = r(18),
          i = r(36);
        (e.exports = function (e) {
          return n(e) || o(e) || a(e) || i();
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e) => {
        (e.exports = function (e, t) {
          (null == t || t > e.length) && (t = e.length);
          for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
          return n;
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e, t, r) => {
        var n = r(17);
        (e.exports = function (e, t) {
          if (e) {
            if ("string" == typeof e) return n(e, t);
            var r = Object.prototype.toString.call(e).slice(8, -1);
            return (
              "Object" === r && e.constructor && (r = e.constructor.name),
              "Map" === r || "Set" === r
                ? Array.from(e)
                : "Arguments" === r ||
                  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
                ? n(e, t)
                : void 0
            );
          }
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e, t, r) => {
        var n = r(9).default,
          o = r(37);
        (e.exports = function (e) {
          var t = o(e, "string");
          return "symbol" === n(t) ? t : String(t);
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.forUIKit = function (e) {
            var t = e.current,
              r = e.next,
              a = e.layouts,
              i = a.leftLabel
                ? (a.screen.width - a.leftLabel.width) / 2 - 27
                : 100,
              l = a.title ? (a.screen.width - a.title.width) / 2 - 27 : 100,
              u = a.screen.width / 4,
              s = o(
                t.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                  extrapolate: "clamp",
                }),
                r
                  ? r.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                      extrapolate: "clamp",
                    })
                  : 0
              );
            return {
              leftButtonStyle: {
                opacity: s.interpolate({
                  inputRange: [0.3, 1, 1.5],
                  outputRange: [0, 1, 0],
                }),
              },
              leftLabelStyle: {
                transform: [
                  {
                    translateX: s.interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: n.I18nManager.getConstants().isRTL
                        ? [-u, 0, i]
                        : [i, 0, -u],
                    }),
                  },
                ],
              },
              rightButtonStyle: {
                opacity: s.interpolate({
                  inputRange: [0.3, 1, 1.5],
                  outputRange: [0, 1, 0],
                }),
              },
              titleStyle: {
                opacity: s.interpolate({
                  inputRange: [0, 0.4, 1, 1.5],
                  outputRange: [0, 0.1, 1, 0],
                }),
                transform: [
                  {
                    translateX: s.interpolate({
                      inputRange: [0.5, 1, 2],
                      outputRange: n.I18nManager.getConstants().isRTL
                        ? [-l, 0, u]
                        : [u, 0, -l],
                    }),
                  },
                ],
              },
              backgroundStyle: {
                transform: [
                  {
                    translateX: s.interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: n.I18nManager.getConstants().isRTL
                        ? [-a.screen.width, 0, a.screen.width]
                        : [a.screen.width, 0, -a.screen.width],
                    }),
                  },
                ],
              },
            };
          }),
          (t.forFade = function (e) {
            var t = e.current,
              r = e.next,
              n = o(
                t.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                  extrapolate: "clamp",
                }),
                r
                  ? r.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                      extrapolate: "clamp",
                    })
                  : 0
              ),
              a = n.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [0, 1, 0],
              });
            return {
              leftButtonStyle: { opacity: a },
              rightButtonStyle: { opacity: a },
              titleStyle: { opacity: a },
              backgroundStyle: {
                opacity: n.interpolate({
                  inputRange: [0, 1, 1.9, 2],
                  outputRange: [0, 1, 1, 0],
                }),
              },
            };
          }),
          (t.forSlideLeft = function (e) {
            var t = e.current,
              r = e.next,
              a = e.layouts.screen,
              i = [
                {
                  translateX: o(
                    t.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                      extrapolate: "clamp",
                    }),
                    r
                      ? r.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                          extrapolate: "clamp",
                        })
                      : 0
                  ).interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: n.I18nManager.getConstants().isRTL
                      ? [-a.width, 0, a.width]
                      : [a.width, 0, -a.width],
                  }),
                },
              ];
            return {
              leftButtonStyle: { transform: i },
              rightButtonStyle: { transform: i },
              titleStyle: { transform: i },
              backgroundStyle: { transform: i },
            };
          }),
          (t.forSlideRight = function (e) {
            var t = e.current,
              r = e.next,
              a = e.layouts.screen,
              i = [
                {
                  translateX: o(
                    t.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                      extrapolate: "clamp",
                    }),
                    r
                      ? r.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                          extrapolate: "clamp",
                        })
                      : 0
                  ).interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: n.I18nManager.getConstants().isRTL
                      ? [a.width, 0, -a.width]
                      : [-a.width, 0, a.width],
                  }),
                },
              ];
            return {
              leftButtonStyle: { transform: i },
              rightButtonStyle: { transform: i },
              titleStyle: { transform: i },
              backgroundStyle: { transform: i },
            };
          }),
          (t.forSlideUp = function (e) {
            var t = e.current,
              r = e.next,
              n = e.layouts.header,
              a = [
                {
                  translateY: o(
                    t.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                      extrapolate: "clamp",
                    }),
                    r
                      ? r.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                          extrapolate: "clamp",
                        })
                      : 0
                  ).interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [-n.height, 0, -n.height],
                  }),
                },
              ];
            return {
              leftButtonStyle: { transform: a },
              rightButtonStyle: { transform: a },
              titleStyle: { transform: a },
              backgroundStyle: { transform: a },
            };
          }),
          (t.forNoAnimation = function () {
            return {};
          });
        var n = r(2),
          o = n.Animated.add;
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e, t, r) {
            var o,
              a = e.width > e.height;
            o =
              "ios" === n.Platform.OS
                ? n.Platform.isPad || n.Platform.isTV
                  ? t
                    ? 56
                    : 50
                  : a
                  ? 32
                  : t
                  ? 56
                  : 44
                : "android" === n.Platform.OS
                ? 56
                : 64;
            return o + r;
          });
        var n = r(2);
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var o = (0, n(r(23)).default)("HeaderShownContext", !1);
        t.default = o;
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e, t) {
            var n = r.g[i].get(e);
            if (n) return n;
            return (
              ((n = o.createContext(t)).displayName = e), r.g[i].set(e, n), n
            );
          });
        var n,
          o = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = a(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var i in e)
              if (
                "default" !== i &&
                Object.prototype.hasOwnProperty.call(e, i)
              ) {
                var l = o ? Object.getOwnPropertyDescriptor(e, i) : null;
                l && (l.get || l.set)
                  ? Object.defineProperty(n, i, l)
                  : (n[i] = e[i]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1));
        function a(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (a = function (e) {
            return e ? r : t;
          })(e);
        }
        var i = "__react_navigation__elements_contexts";
        r.g[i] = null != (n = r.g[i]) ? n : new Map();
      },
      (e, t, r) => {
        var n = r(51);
        e.exports = n.registerAsset({
          httpServerLocation: r.p + "/assets",
          name: "node_modules_reactnavigation_elements_lib_module_assets_backicon",
          width: 96,
          height: 96,
          type: "png",
          hash: "35ba0eaec5a4f5ed12ca16fabeae451d",
          fileHashes: ["35ba0eaec5a4f5ed12ca16fabeae451d"],
          scales: [1],
        });
      },
      (e, t, r) => {
        var n = r(51);
        e.exports = n.registerAsset({
          httpServerLocation: r.p + "/assets",
          name: "node_modules_reactnavigation_elements_lib_module_assets_backiconmask",
          width: 50,
          height: 85,
          type: "png",
          hash: "5223c8d9b0d08b82a5670fb5f71faf78",
          fileHashes: ["5223c8d9b0d08b82a5670fb5f71faf78"],
          scales: [1],
        });
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var o = (0, n(r(23)).default)("HeaderHeightContext", void 0);
        t.default = o;
      },
      (e, t, r) => {
        function n(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (n = function (e) {
            return e ? r : t;
          })(e);
        }
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var o = (function (e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" != typeof e && "function" != typeof e))
            return { default: e };
          var r = n(t);
          if (r && r.has(e)) return r.get(e);
          var o = {},
            a = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var i in e)
            if ("default" !== i && Object.prototype.hasOwnProperty.call(e, i)) {
              var l = a ? Object.getOwnPropertyDescriptor(e, i) : null;
              l && (l.get || l.set)
                ? Object.defineProperty(o, i, l)
                : (o[i] = e[i]);
            }
          (o.default = e), r && r.set(e, o);
          return o;
        })(r(1)).createContext(!1);
        t.default = o;
      },
      (e, t, r) => {
        var n = r(0),
          o = n(r(6)),
          a = n(r(16));
        function i(e, t) {
          var r =
            ("undefined" != typeof Symbol && e[Symbol.iterator]) ||
            e["@@iterator"];
          if (r) return (r = r.call(e)).next.bind(r);
          if (
            Array.isArray(e) ||
            (r = (function (e, t) {
              if (!e) return;
              if ("string" == typeof e) return l(e, t);
              var r = Object.prototype.toString.call(e).slice(8, -1);
              "Object" === r && e.constructor && (r = e.constructor.name);
              if ("Map" === r || "Set" === r) return Array.from(e);
              if (
                "Arguments" === r ||
                /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
              )
                return l(e, t);
            })(e)) ||
            (t && e && "number" == typeof e.length)
          ) {
            r && (e = r);
            var n = 0;
            return function () {
              return n >= e.length ? { done: !0 } : { done: !1, value: e[n++] };
            };
          }
          throw new TypeError(
            "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
          );
        }
        function l(e, t) {
          (null == t || t > e.length) && (t = e.length);
          for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
          return n;
        }
        for (
          var u = r(55),
            s = r(58),
            c = ["keyword", "gray", "hex"],
            d = {},
            f = 0,
            p = Object.keys(s);
          f < p.length;
          f++
        ) {
          var h = p[f];
          d[(0, a.default)(s[h].labels).sort().join("")] = h;
        }
        var v = {};
        function y(e, t) {
          if (!(this instanceof y)) return new y(e, t);
          if ((t && t in c && (t = null), t && !(t in s)))
            throw new Error("Unknown model: " + t);
          var r, n;
          if (null == e)
            (this.model = "rgb"), (this.color = [0, 0, 0]), (this.valpha = 1);
          else if (e instanceof y)
            (this.model = e.model),
              (this.color = (0, a.default)(e.color)),
              (this.valpha = e.valpha);
          else if ("string" == typeof e) {
            var o = u.get(e);
            if (null === o)
              throw new Error("Unable to parse color from string: " + e);
            (this.model = o.model),
              (n = s[this.model].channels),
              (this.color = o.value.slice(0, n)),
              (this.valpha = "number" == typeof o.value[n] ? o.value[n] : 1);
          } else if (e.length > 0) {
            (this.model = t || "rgb"), (n = s[this.model].channels);
            var i = Array.prototype.slice.call(e, 0, n);
            (this.color = k(i, n)),
              (this.valpha = "number" == typeof e[n] ? e[n] : 1);
          } else if ("number" == typeof e)
            (this.model = "rgb"),
              (this.color = [(e >> 16) & 255, (e >> 8) & 255, 255 & e]),
              (this.valpha = 1);
          else {
            this.valpha = 1;
            var l = Object.keys(e);
            "alpha" in e &&
              (l.splice(l.indexOf("alpha"), 1),
              (this.valpha = "number" == typeof e.alpha ? e.alpha : 0));
            var f = l.sort().join("");
            if (!(f in d))
              throw new Error(
                "Unable to parse color from object: " + JSON.stringify(e)
              );
            this.model = d[f];
            var p = s[this.model].labels,
              h = [];
            for (r = 0; r < p.length; r++) h.push(e[p[r]]);
            this.color = k(h);
          }
          if (v[this.model])
            for (n = s[this.model].channels, r = 0; r < n; r++) {
              var g = v[this.model][r];
              g && (this.color[r] = g(this.color[r]));
            }
          (this.valpha = Math.max(0, Math.min(1, this.valpha))),
            Object.freeze && Object.freeze(this);
        }
        y.prototype = {
          toString: function () {
            return this.string();
          },
          toJSON: function () {
            return this[this.model]();
          },
          string: function (e) {
            var t = this.model in u.to ? this : this.rgb(),
              r =
                1 === (t = t.round("number" == typeof e ? e : 1)).valpha
                  ? t.color
                  : [].concat((0, a.default)(t.color), [this.valpha]);
            return u.to[t.model](r);
          },
          percentString: function (e) {
            var t = this.rgb().round("number" == typeof e ? e : 1),
              r =
                1 === t.valpha
                  ? t.color
                  : [].concat((0, a.default)(t.color), [this.valpha]);
            return u.to.rgb.percent(r);
          },
          array: function () {
            return 1 === this.valpha
              ? (0, a.default)(this.color)
              : [].concat((0, a.default)(this.color), [this.valpha]);
          },
          object: function () {
            for (
              var e = {},
                t = s[this.model].channels,
                r = s[this.model].labels,
                n = 0;
              n < t;
              n++
            )
              e[r[n]] = this.color[n];
            return 1 !== this.valpha && (e.alpha = this.valpha), e;
          },
          unitArray: function () {
            var e = this.rgb().color;
            return (
              (e[0] /= 255),
              (e[1] /= 255),
              (e[2] /= 255),
              1 !== this.valpha && e.push(this.valpha),
              e
            );
          },
          unitObject: function () {
            var e = this.rgb().object();
            return (
              (e.r /= 255),
              (e.g /= 255),
              (e.b /= 255),
              1 !== this.valpha && (e.alpha = this.valpha),
              e
            );
          },
          round: function (e) {
            return (
              (e = Math.max(e || 0, 0)),
              new y(
                [].concat(
                  (0, a.default)(
                    this.color.map(
                      (function (e) {
                        return function (t) {
                          return (function (e, t) {
                            return Number(e.toFixed(t));
                          })(t, e);
                        };
                      })(e)
                    )
                  ),
                  [this.valpha]
                ),
                this.model
              )
            );
          },
          alpha: function (e) {
            return void 0 !== e
              ? new y(
                  [].concat((0, a.default)(this.color), [
                    Math.max(0, Math.min(1, e)),
                  ]),
                  this.model
                )
              : this.valpha;
          },
          red: w("rgb", 0, O(255)),
          green: w("rgb", 1, O(255)),
          blue: w("rgb", 2, O(255)),
          hue: w(["hsl", "hsv", "hsl", "hwb", "hcg"], 0, function (e) {
            return ((e % 360) + 360) % 360;
          }),
          saturationl: w("hsl", 1, O(100)),
          lightness: w("hsl", 2, O(100)),
          saturationv: w("hsv", 1, O(100)),
          value: w("hsv", 2, O(100)),
          chroma: w("hcg", 1, O(100)),
          gray: w("hcg", 2, O(100)),
          white: w("hwb", 1, O(100)),
          wblack: w("hwb", 2, O(100)),
          cyan: w("cmyk", 0, O(100)),
          magenta: w("cmyk", 1, O(100)),
          yellow: w("cmyk", 2, O(100)),
          black: w("cmyk", 3, O(100)),
          x: w("xyz", 0, O(95.047)),
          y: w("xyz", 1, O(100)),
          z: w("xyz", 2, O(108.833)),
          l: w("lab", 0, O(100)),
          a: w("lab", 1),
          b: w("lab", 2),
          keyword: function (e) {
            return void 0 !== e ? new y(e) : s[this.model].keyword(this.color);
          },
          hex: function (e) {
            return void 0 !== e ? new y(e) : u.to.hex(this.rgb().round().color);
          },
          hexa: function (e) {
            if (void 0 !== e) return new y(e);
            var t = this.rgb().round().color,
              r = Math.round(255 * this.valpha)
                .toString(16)
                .toUpperCase();
            return 1 === r.length && (r = "0" + r), u.to.hex(t) + r;
          },
          rgbNumber: function () {
            var e = this.rgb().color;
            return ((255 & e[0]) << 16) | ((255 & e[1]) << 8) | (255 & e[2]);
          },
          luminosity: function () {
            for (
              var e, t = [], r = i(this.rgb().color.entries());
              !(e = r()).done;

            ) {
              var n = e.value,
                a = (0, o.default)(n, 2),
                l = a[0],
                u = a[1] / 255;
              t[l] =
                u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4);
            }
            return 0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2];
          },
          contrast: function (e) {
            var t = this.luminosity(),
              r = e.luminosity();
            return t > r ? (t + 0.05) / (r + 0.05) : (r + 0.05) / (t + 0.05);
          },
          level: function (e) {
            var t = this.contrast(e);
            return t >= 7 ? "AAA" : t >= 4.5 ? "AA" : "";
          },
          isDark: function () {
            var e = this.rgb().color;
            return (2126 * e[0] + 7152 * e[1] + 722 * e[2]) / 1e4 < 128;
          },
          isLight: function () {
            return !this.isDark();
          },
          negate: function () {
            for (var e = this.rgb(), t = 0; t < 3; t++)
              e.color[t] = 255 - e.color[t];
            return e;
          },
          lighten: function (e) {
            var t = this.hsl();
            return (t.color[2] += t.color[2] * e), t;
          },
          darken: function (e) {
            var t = this.hsl();
            return (t.color[2] -= t.color[2] * e), t;
          },
          saturate: function (e) {
            var t = this.hsl();
            return (t.color[1] += t.color[1] * e), t;
          },
          desaturate: function (e) {
            var t = this.hsl();
            return (t.color[1] -= t.color[1] * e), t;
          },
          whiten: function (e) {
            var t = this.hwb();
            return (t.color[1] += t.color[1] * e), t;
          },
          blacken: function (e) {
            var t = this.hwb();
            return (t.color[2] += t.color[2] * e), t;
          },
          grayscale: function () {
            var e = this.rgb().color,
              t = 0.3 * e[0] + 0.59 * e[1] + 0.11 * e[2];
            return y.rgb(t, t, t);
          },
          fade: function (e) {
            return this.alpha(this.valpha - this.valpha * e);
          },
          opaquer: function (e) {
            return this.alpha(this.valpha + this.valpha * e);
          },
          rotate: function (e) {
            var t = this.hsl(),
              r = t.color[0];
            return (
              (r = (r = (r + e) % 360) < 0 ? 360 + r : r), (t.color[0] = r), t
            );
          },
          mix: function (e, t) {
            if (!e || !e.rgb)
              throw new Error(
                'Argument to "mix" was not a Color instance, but rather an instance of ' +
                  typeof e
              );
            var r = e.rgb(),
              n = this.rgb(),
              o = void 0 === t ? 0.5 : t,
              a = 2 * o - 1,
              i = r.alpha() - n.alpha(),
              l = ((a * i == -1 ? a : (a + i) / (1 + a * i)) + 1) / 2,
              u = 1 - l;
            return y.rgb(
              l * r.red() + u * n.red(),
              l * r.green() + u * n.green(),
              l * r.blue() + u * n.blue(),
              r.alpha() * o + n.alpha() * (1 - o)
            );
          },
        };
        for (
          var g = function (e) {
              if (c.includes(e)) return "continue";
              var t = s[e].channels;
              (y.prototype[e] = function () {
                if (this.model === e) return new y(this);
                for (
                  var t = arguments.length, r = new Array(t), n = 0;
                  n < t;
                  n++
                )
                  r[n] = arguments[n];
                return r.length > 0
                  ? new y(r, e)
                  : new y(
                      [].concat(
                        (0, a.default)(S(s[this.model][e].raw(this.color))),
                        [this.valpha]
                      ),
                      e
                    );
              }),
                (y[e] = function () {
                  for (
                    var r = arguments.length, n = new Array(r), o = 0;
                    o < r;
                    o++
                  )
                    n[o] = arguments[o];
                  var a = n[0];
                  return "number" == typeof a && (a = k(n, t)), new y(a, e);
                });
            },
            b = 0,
            m = Object.keys(s);
          b < m.length;
          b++
        )
          g(m[b]);
        function w(e, t, r) {
          for (
            var n, o = i((e = Array.isArray(e) ? e : [e]));
            !(n = o()).done;

          ) {
            var a = n.value;
            (v[a] || (v[a] = []))[t] = r;
          }
          return (
            (e = e[0]),
            function (n) {
              var o;
              return void 0 !== n
                ? (r && (n = r(n)), ((o = this[e]()).color[t] = n), o)
                : ((o = this[e]().color[t]), r && (o = r(o)), o);
            }
          );
        }
        function O(e) {
          return function (t) {
            return Math.max(0, Math.min(e, t));
          };
        }
        function S(e) {
          return Array.isArray(e) ? e : [e];
        }
        function k(e, t) {
          for (var r = 0; r < t; r++) "number" != typeof e[r] && (e[r] = 0);
          return e;
        }
        e.exports = y;
      },
      (e) => {
        "use strict";
        e.exports = {
          aliceblue: [240, 248, 255],
          antiquewhite: [250, 235, 215],
          aqua: [0, 255, 255],
          aquamarine: [127, 255, 212],
          azure: [240, 255, 255],
          beige: [245, 245, 220],
          bisque: [255, 228, 196],
          black: [0, 0, 0],
          blanchedalmond: [255, 235, 205],
          blue: [0, 0, 255],
          blueviolet: [138, 43, 226],
          brown: [165, 42, 42],
          burlywood: [222, 184, 135],
          cadetblue: [95, 158, 160],
          chartreuse: [127, 255, 0],
          chocolate: [210, 105, 30],
          coral: [255, 127, 80],
          cornflowerblue: [100, 149, 237],
          cornsilk: [255, 248, 220],
          crimson: [220, 20, 60],
          cyan: [0, 255, 255],
          darkblue: [0, 0, 139],
          darkcyan: [0, 139, 139],
          darkgoldenrod: [184, 134, 11],
          darkgray: [169, 169, 169],
          darkgreen: [0, 100, 0],
          darkgrey: [169, 169, 169],
          darkkhaki: [189, 183, 107],
          darkmagenta: [139, 0, 139],
          darkolivegreen: [85, 107, 47],
          darkorange: [255, 140, 0],
          darkorchid: [153, 50, 204],
          darkred: [139, 0, 0],
          darksalmon: [233, 150, 122],
          darkseagreen: [143, 188, 143],
          darkslateblue: [72, 61, 139],
          darkslategray: [47, 79, 79],
          darkslategrey: [47, 79, 79],
          darkturquoise: [0, 206, 209],
          darkviolet: [148, 0, 211],
          deeppink: [255, 20, 147],
          deepskyblue: [0, 191, 255],
          dimgray: [105, 105, 105],
          dimgrey: [105, 105, 105],
          dodgerblue: [30, 144, 255],
          firebrick: [178, 34, 34],
          floralwhite: [255, 250, 240],
          forestgreen: [34, 139, 34],
          fuchsia: [255, 0, 255],
          gainsboro: [220, 220, 220],
          ghostwhite: [248, 248, 255],
          gold: [255, 215, 0],
          goldenrod: [218, 165, 32],
          gray: [128, 128, 128],
          green: [0, 128, 0],
          greenyellow: [173, 255, 47],
          grey: [128, 128, 128],
          honeydew: [240, 255, 240],
          hotpink: [255, 105, 180],
          indianred: [205, 92, 92],
          indigo: [75, 0, 130],
          ivory: [255, 255, 240],
          khaki: [240, 230, 140],
          lavender: [230, 230, 250],
          lavenderblush: [255, 240, 245],
          lawngreen: [124, 252, 0],
          lemonchiffon: [255, 250, 205],
          lightblue: [173, 216, 230],
          lightcoral: [240, 128, 128],
          lightcyan: [224, 255, 255],
          lightgoldenrodyellow: [250, 250, 210],
          lightgray: [211, 211, 211],
          lightgreen: [144, 238, 144],
          lightgrey: [211, 211, 211],
          lightpink: [255, 182, 193],
          lightsalmon: [255, 160, 122],
          lightseagreen: [32, 178, 170],
          lightskyblue: [135, 206, 250],
          lightslategray: [119, 136, 153],
          lightslategrey: [119, 136, 153],
          lightsteelblue: [176, 196, 222],
          lightyellow: [255, 255, 224],
          lime: [0, 255, 0],
          limegreen: [50, 205, 50],
          linen: [250, 240, 230],
          magenta: [255, 0, 255],
          maroon: [128, 0, 0],
          mediumaquamarine: [102, 205, 170],
          mediumblue: [0, 0, 205],
          mediumorchid: [186, 85, 211],
          mediumpurple: [147, 112, 219],
          mediumseagreen: [60, 179, 113],
          mediumslateblue: [123, 104, 238],
          mediumspringgreen: [0, 250, 154],
          mediumturquoise: [72, 209, 204],
          mediumvioletred: [199, 21, 133],
          midnightblue: [25, 25, 112],
          mintcream: [245, 255, 250],
          mistyrose: [255, 228, 225],
          moccasin: [255, 228, 181],
          navajowhite: [255, 222, 173],
          navy: [0, 0, 128],
          oldlace: [253, 245, 230],
          olive: [128, 128, 0],
          olivedrab: [107, 142, 35],
          orange: [255, 165, 0],
          orangered: [255, 69, 0],
          orchid: [218, 112, 214],
          palegoldenrod: [238, 232, 170],
          palegreen: [152, 251, 152],
          paleturquoise: [175, 238, 238],
          palevioletred: [219, 112, 147],
          papayawhip: [255, 239, 213],
          peachpuff: [255, 218, 185],
          peru: [205, 133, 63],
          pink: [255, 192, 203],
          plum: [221, 160, 221],
          powderblue: [176, 224, 230],
          purple: [128, 0, 128],
          rebeccapurple: [102, 51, 153],
          red: [255, 0, 0],
          rosybrown: [188, 143, 143],
          royalblue: [65, 105, 225],
          saddlebrown: [139, 69, 19],
          salmon: [250, 128, 114],
          sandybrown: [244, 164, 96],
          seagreen: [46, 139, 87],
          seashell: [255, 245, 238],
          sienna: [160, 82, 45],
          silver: [192, 192, 192],
          skyblue: [135, 206, 235],
          slateblue: [106, 90, 205],
          slategray: [112, 128, 144],
          slategrey: [112, 128, 144],
          snow: [255, 250, 250],
          springgreen: [0, 255, 127],
          steelblue: [70, 130, 180],
          tan: [210, 180, 140],
          teal: [0, 128, 128],
          thistle: [216, 191, 216],
          tomato: [255, 99, 71],
          turquoise: [64, 224, 208],
          violet: [238, 130, 238],
          wheat: [245, 222, 179],
          white: [255, 255, 255],
          whitesmoke: [245, 245, 245],
          yellow: [255, 255, 0],
          yellowgreen: [154, 205, 50],
        };
      },
      (e, t, r) => {
        for (
          var n = r(0)(r(6)), o = r(29), a = {}, i = 0, l = Object.keys(o);
          i < l.length;
          i++
        ) {
          var u = l[i];
          a[o[u]] = u;
        }
        var s = {
          rgb: { channels: 3, labels: "rgb" },
          hsl: { channels: 3, labels: "hsl" },
          hsv: { channels: 3, labels: "hsv" },
          hwb: { channels: 3, labels: "hwb" },
          cmyk: { channels: 4, labels: "cmyk" },
          xyz: { channels: 3, labels: "xyz" },
          lab: { channels: 3, labels: "lab" },
          lch: { channels: 3, labels: "lch" },
          hex: { channels: 1, labels: ["hex"] },
          keyword: { channels: 1, labels: ["keyword"] },
          ansi16: { channels: 1, labels: ["ansi16"] },
          ansi256: { channels: 1, labels: ["ansi256"] },
          hcg: { channels: 3, labels: ["h", "c", "g"] },
          apple: { channels: 3, labels: ["r16", "g16", "b16"] },
          gray: { channels: 1, labels: ["gray"] },
        };
        e.exports = s;
        for (var c = 0, d = Object.keys(s); c < d.length; c++) {
          var f = d[c];
          if (!("channels" in s[f]))
            throw new Error("missing channels property: " + f);
          if (!("labels" in s[f]))
            throw new Error("missing channel labels property: " + f);
          if (s[f].labels.length !== s[f].channels)
            throw new Error("channel and label counts mismatch: " + f);
          var p = s[f],
            h = p.channels,
            v = p.labels;
          delete s[f].channels,
            delete s[f].labels,
            Object.defineProperty(s[f], "channels", { value: h }),
            Object.defineProperty(s[f], "labels", { value: v });
        }
        (s.rgb.hsl = function (e) {
          var t,
            r = e[0] / 255,
            n = e[1] / 255,
            o = e[2] / 255,
            a = Math.min(r, n, o),
            i = Math.max(r, n, o),
            l = i - a;
          i === a
            ? (t = 0)
            : r === i
            ? (t = (n - o) / l)
            : n === i
            ? (t = 2 + (o - r) / l)
            : o === i && (t = 4 + (r - n) / l),
            (t = Math.min(60 * t, 360)) < 0 && (t += 360);
          var u = (a + i) / 2;
          return [
            t,
            100 * (i === a ? 0 : u <= 0.5 ? l / (i + a) : l / (2 - i - a)),
            100 * u,
          ];
        }),
          (s.rgb.hsv = function (e) {
            var t,
              r,
              n,
              o,
              a,
              i = e[0] / 255,
              l = e[1] / 255,
              u = e[2] / 255,
              s = Math.max(i, l, u),
              c = s - Math.min(i, l, u),
              d = function (e) {
                return (s - e) / 6 / c + 0.5;
              };
            return (
              0 === c
                ? ((o = 0), (a = 0))
                : ((a = c / s),
                  (t = d(i)),
                  (r = d(l)),
                  (n = d(u)),
                  i === s
                    ? (o = n - r)
                    : l === s
                    ? (o = 1 / 3 + t - n)
                    : u === s && (o = 2 / 3 + r - t),
                  o < 0 ? (o += 1) : o > 1 && (o -= 1)),
              [360 * o, 100 * a, 100 * s]
            );
          }),
          (s.rgb.hwb = function (e) {
            var t = e[0],
              r = e[1],
              n = e[2];
            return [
              s.rgb.hsl(e)[0],
              100 * ((1 / 255) * Math.min(t, Math.min(r, n))),
              100 * (n = 1 - (1 / 255) * Math.max(t, Math.max(r, n))),
            ];
          }),
          (s.rgb.cmyk = function (e) {
            var t = e[0] / 255,
              r = e[1] / 255,
              n = e[2] / 255,
              o = Math.min(1 - t, 1 - r, 1 - n);
            return [
              100 * ((1 - t - o) / (1 - o) || 0),
              100 * ((1 - r - o) / (1 - o) || 0),
              100 * ((1 - n - o) / (1 - o) || 0),
              100 * o,
            ];
          }),
          (s.rgb.keyword = function (e) {
            var t = a[e];
            if (t) return t;
            for (
              var r, n, i, l = 1 / 0, u = 0, s = Object.keys(o);
              u < s.length;
              u++
            ) {
              var c = s[u],
                d = o[c],
                f =
                  ((n = e),
                  (i = d),
                  Math.pow(n[0] - i[0], 2) +
                    Math.pow(n[1] - i[1], 2) +
                    Math.pow(n[2] - i[2], 2));
              f < l && ((l = f), (r = c));
            }
            return r;
          }),
          (s.keyword.rgb = function (e) {
            return o[e];
          }),
          (s.rgb.xyz = function (e) {
            var t = e[0] / 255,
              r = e[1] / 255,
              n = e[2] / 255;
            return [
              100 *
                (0.4124 *
                  (t =
                    t > 0.04045
                      ? Math.pow((t + 0.055) / 1.055, 2.4)
                      : t / 12.92) +
                  0.3576 *
                    (r =
                      r > 0.04045
                        ? Math.pow((r + 0.055) / 1.055, 2.4)
                        : r / 12.92) +
                  0.1805 *
                    (n =
                      n > 0.04045
                        ? Math.pow((n + 0.055) / 1.055, 2.4)
                        : n / 12.92)),
              100 * (0.2126 * t + 0.7152 * r + 0.0722 * n),
              100 * (0.0193 * t + 0.1192 * r + 0.9505 * n),
            ];
          }),
          (s.rgb.lab = function (e) {
            var t = s.rgb.xyz(e),
              r = t[0],
              n = t[1],
              o = t[2];
            return (
              (n /= 100),
              (o /= 108.883),
              (r =
                (r /= 95.047) > 0.008856
                  ? Math.pow(r, 1 / 3)
                  : 7.787 * r + 16 / 116),
              [
                116 *
                  (n =
                    n > 0.008856 ? Math.pow(n, 1 / 3) : 7.787 * n + 16 / 116) -
                  16,
                500 * (r - n),
                200 *
                  (n -
                    (o =
                      o > 0.008856
                        ? Math.pow(o, 1 / 3)
                        : 7.787 * o + 16 / 116)),
              ]
            );
          }),
          (s.hsl.rgb = function (e) {
            var t,
              r,
              n,
              o = e[0] / 360,
              a = e[1] / 100,
              i = e[2] / 100;
            if (0 === a) return [(n = 255 * i), n, n];
            for (
              var l = 2 * i - (t = i < 0.5 ? i * (1 + a) : i + a - i * a),
                u = [0, 0, 0],
                s = 0;
              s < 3;
              s++
            )
              (r = o + (1 / 3) * -(s - 1)) < 0 && r++,
                r > 1 && r--,
                (n =
                  6 * r < 1
                    ? l + 6 * (t - l) * r
                    : 2 * r < 1
                    ? t
                    : 3 * r < 2
                    ? l + (t - l) * (2 / 3 - r) * 6
                    : l),
                (u[s] = 255 * n);
            return u;
          }),
          (s.hsl.hsv = function (e) {
            var t = e[0],
              r = e[1] / 100,
              n = e[2] / 100,
              o = r,
              a = Math.max(n, 0.01);
            return (
              (r *= (n *= 2) <= 1 ? n : 2 - n),
              (o *= a <= 1 ? a : 2 - a),
              [
                t,
                100 * (0 === n ? (2 * o) / (a + o) : (2 * r) / (n + r)),
                100 * ((n + r) / 2),
              ]
            );
          }),
          (s.hsv.rgb = function (e) {
            var t = e[0] / 60,
              r = e[1] / 100,
              n = e[2] / 100,
              o = Math.floor(t) % 6,
              a = t - Math.floor(t),
              i = 255 * n * (1 - r),
              l = 255 * n * (1 - r * a),
              u = 255 * n * (1 - r * (1 - a));
            switch (((n *= 255), o)) {
              case 0:
                return [n, u, i];
              case 1:
                return [l, n, i];
              case 2:
                return [i, n, u];
              case 3:
                return [i, l, n];
              case 4:
                return [u, i, n];
              case 5:
                return [n, i, l];
            }
          }),
          (s.hsv.hsl = function (e) {
            var t,
              r,
              n = e[0],
              o = e[1] / 100,
              a = e[2] / 100,
              i = Math.max(a, 0.01);
            r = (2 - o) * a;
            var l = (2 - o) * i;
            return (
              (t = o * i),
              [n, 100 * (t = (t /= l <= 1 ? l : 2 - l) || 0), 100 * (r /= 2)]
            );
          }),
          (s.hwb.rgb = function (e) {
            var t,
              r = e[0] / 360,
              n = e[1] / 100,
              o = e[2] / 100,
              a = n + o;
            a > 1 && ((n /= a), (o /= a));
            var i = Math.floor(6 * r),
              l = 1 - o;
            (t = 6 * r - i), 0 != (1 & i) && (t = 1 - t);
            var u,
              s,
              c,
              d = n + t * (l - n);
            switch (i) {
              default:
              case 6:
              case 0:
                (u = l), (s = d), (c = n);
                break;
              case 1:
                (u = d), (s = l), (c = n);
                break;
              case 2:
                (u = n), (s = l), (c = d);
                break;
              case 3:
                (u = n), (s = d), (c = l);
                break;
              case 4:
                (u = d), (s = n), (c = l);
                break;
              case 5:
                (u = l), (s = n), (c = d);
            }
            return [255 * u, 255 * s, 255 * c];
          }),
          (s.cmyk.rgb = function (e) {
            var t = e[0] / 100,
              r = e[1] / 100,
              n = e[2] / 100,
              o = e[3] / 100;
            return [
              255 * (1 - Math.min(1, t * (1 - o) + o)),
              255 * (1 - Math.min(1, r * (1 - o) + o)),
              255 * (1 - Math.min(1, n * (1 - o) + o)),
            ];
          }),
          (s.xyz.rgb = function (e) {
            var t,
              r,
              n,
              o = e[0] / 100,
              a = e[1] / 100,
              i = e[2] / 100;
            return (
              (r = -0.9689 * o + 1.8758 * a + 0.0415 * i),
              (n = 0.0557 * o + -0.204 * a + 1.057 * i),
              (t =
                (t = 3.2406 * o + -1.5372 * a + -0.4986 * i) > 0.0031308
                  ? 1.055 * Math.pow(t, 1 / 2.4) - 0.055
                  : 12.92 * t),
              (r =
                r > 0.0031308
                  ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055
                  : 12.92 * r),
              (n =
                n > 0.0031308
                  ? 1.055 * Math.pow(n, 1 / 2.4) - 0.055
                  : 12.92 * n),
              [
                255 * (t = Math.min(Math.max(0, t), 1)),
                255 * (r = Math.min(Math.max(0, r), 1)),
                255 * (n = Math.min(Math.max(0, n), 1)),
              ]
            );
          }),
          (s.xyz.lab = function (e) {
            var t = e[0],
              r = e[1],
              n = e[2];
            return (
              (r /= 100),
              (n /= 108.883),
              (t =
                (t /= 95.047) > 0.008856
                  ? Math.pow(t, 1 / 3)
                  : 7.787 * t + 16 / 116),
              [
                116 *
                  (r =
                    r > 0.008856 ? Math.pow(r, 1 / 3) : 7.787 * r + 16 / 116) -
                  16,
                500 * (t - r),
                200 *
                  (r -
                    (n =
                      n > 0.008856
                        ? Math.pow(n, 1 / 3)
                        : 7.787 * n + 16 / 116)),
              ]
            );
          }),
          (s.lab.xyz = function (e) {
            var t,
              r,
              n,
              o = e[0];
            (t = e[1] / 500 + (r = (o + 16) / 116)), (n = r - e[2] / 200);
            var a = Math.pow(r, 3),
              i = Math.pow(t, 3),
              l = Math.pow(n, 3);
            return (
              (r = a > 0.008856 ? a : (r - 16 / 116) / 7.787),
              (t = i > 0.008856 ? i : (t - 16 / 116) / 7.787),
              (n = l > 0.008856 ? l : (n - 16 / 116) / 7.787),
              [(t *= 95.047), (r *= 100), (n *= 108.883)]
            );
          }),
          (s.lab.lch = function (e) {
            var t,
              r = e[0],
              n = e[1],
              o = e[2];
            return (
              (t = (360 * Math.atan2(o, n)) / 2 / Math.PI) < 0 && (t += 360),
              [r, Math.sqrt(n * n + o * o), t]
            );
          }),
          (s.lch.lab = function (e) {
            var t = e[0],
              r = e[1],
              n = (e[2] / 360) * 2 * Math.PI;
            return [t, r * Math.cos(n), r * Math.sin(n)];
          }),
          (s.rgb.ansi16 = function (e) {
            var t =
                arguments.length > 1 && void 0 !== arguments[1]
                  ? arguments[1]
                  : null,
              r = (0, n.default)(e, 3),
              o = r[0],
              a = r[1],
              i = r[2],
              l = null === t ? s.rgb.hsv(e)[2] : t;
            if (0 === (l = Math.round(l / 50))) return 30;
            var u =
              30 +
              ((Math.round(i / 255) << 2) |
                (Math.round(a / 255) << 1) |
                Math.round(o / 255));
            return 2 === l && (u += 60), u;
          }),
          (s.hsv.ansi16 = function (e) {
            return s.rgb.ansi16(s.hsv.rgb(e), e[2]);
          }),
          (s.rgb.ansi256 = function (e) {
            var t = e[0],
              r = e[1],
              n = e[2];
            return t === r && r === n
              ? t < 8
                ? 16
                : t > 248
                ? 231
                : Math.round(((t - 8) / 247) * 24) + 232
              : 16 +
                  36 * Math.round((t / 255) * 5) +
                  6 * Math.round((r / 255) * 5) +
                  Math.round((n / 255) * 5);
          }),
          (s.ansi16.rgb = function (e) {
            var t = e % 10;
            if (0 === t || 7 === t)
              return e > 50 && (t += 3.5), [(t = (t / 10.5) * 255), t, t];
            var r = 0.5 * (1 + ~~(e > 50));
            return [
              (1 & t) * r * 255,
              ((t >> 1) & 1) * r * 255,
              ((t >> 2) & 1) * r * 255,
            ];
          }),
          (s.ansi256.rgb = function (e) {
            if (e >= 232) {
              var t = 10 * (e - 232) + 8;
              return [t, t, t];
            }
            var r;
            return (
              (e -= 16),
              [
                (Math.floor(e / 36) / 5) * 255,
                (Math.floor((r = e % 36) / 6) / 5) * 255,
                ((r % 6) / 5) * 255,
              ]
            );
          }),
          (s.rgb.hex = function (e) {
            var t = (
              ((255 & Math.round(e[0])) << 16) +
              ((255 & Math.round(e[1])) << 8) +
              (255 & Math.round(e[2]))
            )
              .toString(16)
              .toUpperCase();
            return "000000".substring(t.length) + t;
          }),
          (s.hex.rgb = function (e) {
            var t = e.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
            if (!t) return [0, 0, 0];
            var r = t[0];
            3 === t[0].length &&
              (r = r
                .split("")
                .map(function (e) {
                  return e + e;
                })
                .join(""));
            var n = parseInt(r, 16);
            return [(n >> 16) & 255, (n >> 8) & 255, 255 & n];
          }),
          (s.rgb.hcg = function (e) {
            var t,
              r = e[0] / 255,
              n = e[1] / 255,
              o = e[2] / 255,
              a = Math.max(Math.max(r, n), o),
              i = Math.min(Math.min(r, n), o),
              l = a - i;
            return (
              (t =
                l <= 0
                  ? 0
                  : a === r
                  ? ((n - o) / l) % 6
                  : a === n
                  ? 2 + (o - r) / l
                  : 4 + (r - n) / l),
              (t /= 6),
              [360 * (t %= 1), 100 * l, 100 * (l < 1 ? i / (1 - l) : 0)]
            );
          }),
          (s.hsl.hcg = function (e) {
            var t = e[1] / 100,
              r = e[2] / 100,
              n = r < 0.5 ? 2 * t * r : 2 * t * (1 - r),
              o = 0;
            return (
              n < 1 && (o = (r - 0.5 * n) / (1 - n)), [e[0], 100 * n, 100 * o]
            );
          }),
          (s.hsv.hcg = function (e) {
            var t = e[1] / 100,
              r = e[2] / 100,
              n = t * r,
              o = 0;
            return n < 1 && (o = (r - n) / (1 - n)), [e[0], 100 * n, 100 * o];
          }),
          (s.hcg.rgb = function (e) {
            var t = e[0] / 360,
              r = e[1] / 100,
              n = e[2] / 100;
            if (0 === r) return [255 * n, 255 * n, 255 * n];
            var o,
              a = [0, 0, 0],
              i = (t % 1) * 6,
              l = i % 1,
              u = 1 - l;
            switch (Math.floor(i)) {
              case 0:
                (a[0] = 1), (a[1] = l), (a[2] = 0);
                break;
              case 1:
                (a[0] = u), (a[1] = 1), (a[2] = 0);
                break;
              case 2:
                (a[0] = 0), (a[1] = 1), (a[2] = l);
                break;
              case 3:
                (a[0] = 0), (a[1] = u), (a[2] = 1);
                break;
              case 4:
                (a[0] = l), (a[1] = 0), (a[2] = 1);
                break;
              default:
                (a[0] = 1), (a[1] = 0), (a[2] = u);
            }
            return (
              (o = (1 - r) * n),
              [255 * (r * a[0] + o), 255 * (r * a[1] + o), 255 * (r * a[2] + o)]
            );
          }),
          (s.hcg.hsv = function (e) {
            var t = e[1] / 100,
              r = t + (e[2] / 100) * (1 - t),
              n = 0;
            return r > 0 && (n = t / r), [e[0], 100 * n, 100 * r];
          }),
          (s.hcg.hsl = function (e) {
            var t = e[1] / 100,
              r = (e[2] / 100) * (1 - t) + 0.5 * t,
              n = 0;
            return (
              r > 0 && r < 0.5
                ? (n = t / (2 * r))
                : r >= 0.5 && r < 1 && (n = t / (2 * (1 - r))),
              [e[0], 100 * n, 100 * r]
            );
          }),
          (s.hcg.hwb = function (e) {
            var t = e[1] / 100,
              r = t + (e[2] / 100) * (1 - t);
            return [e[0], 100 * (r - t), 100 * (1 - r)];
          }),
          (s.hwb.hcg = function (e) {
            var t = e[1] / 100,
              r = 1 - e[2] / 100,
              n = r - t,
              o = 0;
            return n < 1 && (o = (r - n) / (1 - n)), [e[0], 100 * n, 100 * o];
          }),
          (s.apple.rgb = function (e) {
            return [
              (e[0] / 65535) * 255,
              (e[1] / 65535) * 255,
              (e[2] / 65535) * 255,
            ];
          }),
          (s.rgb.apple = function (e) {
            return [
              (e[0] / 255) * 65535,
              (e[1] / 255) * 65535,
              (e[2] / 255) * 65535,
            ];
          }),
          (s.gray.rgb = function (e) {
            return [(e[0] / 100) * 255, (e[0] / 100) * 255, (e[0] / 100) * 255];
          }),
          (s.gray.hsl = function (e) {
            return [0, 0, e[0]];
          }),
          (s.gray.hsv = s.gray.hsl),
          (s.gray.hwb = function (e) {
            return [0, 100, e[0]];
          }),
          (s.gray.cmyk = function (e) {
            return [0, 0, 0, e[0]];
          }),
          (s.gray.lab = function (e) {
            return [e[0], 0, 0];
          }),
          (s.gray.hex = function (e) {
            var t = 255 & Math.round((e[0] / 100) * 255),
              r = ((t << 16) + (t << 8) + t).toString(16).toUpperCase();
            return "000000".substring(r.length) + r;
          }),
          (s.rgb.gray = function (e) {
            return [((e[0] + e[1] + e[2]) / 3 / 255) * 100];
          });
      },
      (e, t, r) => {
        function n(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (n = function (e) {
            return e ? r : t;
          })(e);
        }
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var o = (function (e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" != typeof e && "function" != typeof e))
            return { default: e };
          var r = n(t);
          if (r && r.has(e)) return r.get(e);
          var o = {},
            a = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var i in e)
            if ("default" !== i && Object.prototype.hasOwnProperty.call(e, i)) {
              var l = a ? Object.getOwnPropertyDescriptor(e, i) : null;
              l && (l.get || l.set)
                ? Object.defineProperty(o, i, l)
                : (o[i] = e[i]);
            }
          (o.default = e), r && r.set(e, o);
          return o;
        })(r(1)).createContext(void 0);
        t.default = o;
      },
      (e) => {
        function t(r, n) {
          return (
            (e.exports = t =
              Object.setPrototypeOf
                ? Object.setPrototypeOf.bind()
                : function (e, t) {
                    return (e.__proto__ = t), e;
                  }),
            (e.exports.__esModule = !0),
            (e.exports.default = e.exports),
            t(r, n)
          );
        }
        (e.exports = t),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e) => {
        (e.exports = function (e, t) {
          if (null == e) return {};
          var r,
            n,
            o = {},
            a = Object.keys(e);
          for (n = 0; n < a.length; n++)
            (r = a[n]), t.indexOf(r) >= 0 || (o[r] = e[r]);
          return o;
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e, t, r) => {
        var n = r(17);
        (e.exports = function (e) {
          if (Array.isArray(e)) return n(e);
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e) => {
        (e.exports = function (e) {
          if (
            ("undefined" != typeof Symbol && null != e[Symbol.iterator]) ||
            null != e["@@iterator"]
          )
            return Array.from(e);
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e) => {
        (e.exports = function () {
          throw new TypeError(
            "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
          );
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e, t, r) => {
        var n = r(9).default;
        (e.exports = function (e, t) {
          if ("object" !== n(e) || null === e) return e;
          var r = e[Symbol.toPrimitive];
          if (void 0 !== r) {
            var o = r.call(e, t || "default");
            if ("object" !== n(o)) return o;
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return ("string" === t ? String : Number)(e);
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e) => {
        (e.exports = function (e) {
          if (void 0 === e)
            throw new ReferenceError(
              "this hasn't been initialised - super() hasn't been called"
            );
          return e;
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e) => {
        (e.exports = function (e) {
          if (Array.isArray(e)) return e;
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e) => {
        (e.exports = function (e, t) {
          var r =
            null == e
              ? null
              : ("undefined" != typeof Symbol && e[Symbol.iterator]) ||
                e["@@iterator"];
          if (null != r) {
            var n,
              o,
              a,
              i,
              l = [],
              u = !0,
              s = !1;
            try {
              if (((a = (r = r.call(e)).next), 0 === t)) {
                if (Object(r) !== r) return;
                u = !1;
              } else
                for (
                  ;
                  !(u = (n = a.call(r)).done) &&
                  (l.push(n.value), l.length !== t);
                  u = !0
                );
            } catch (e) {
              (s = !0), (o = e);
            } finally {
              try {
                if (
                  !u &&
                  null != r.return &&
                  ((i = r.return()), Object(i) !== i)
                )
                  return;
              } finally {
                if (s) throw o;
              }
            }
            return l;
          }
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e) => {
        (e.exports = function () {
          throw new TypeError(
            "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
          );
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e, t, r) => {
        var n = r(19);
        (e.exports = function (e, t, r) {
          return (
            (t = n(t)) in e
              ? Object.defineProperty(e, t, {
                  value: r,
                  enumerable: !0,
                  configurable: !0,
                  writable: !0,
                })
              : (e[t] = r),
            e
          );
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.ModalTransition =
            t.DefaultTransition =
            t.ModalFadeTransition =
            t.BottomSheetAndroid =
            t.ScaleFromCenterAndroid =
            t.RevealFromBottomAndroid =
            t.FadeFromBottomAndroid =
            t.ModalPresentationIOS =
            t.ModalSlideFromBottomIOS =
            t.SlideFromRightIOS =
              void 0);
        var n = r(2),
          o = r(15),
          a = r(20),
          i = r(44),
          l = {
            gestureDirection: "horizontal",
            transitionSpec: {
              open: i.TransitionIOSSpec,
              close: i.TransitionIOSSpec,
            },
            cardStyleInterpolator: o.forHorizontalIOS,
            headerStyleInterpolator: a.forFade,
          };
        t.SlideFromRightIOS = l;
        var u = {
          gestureDirection: "vertical",
          transitionSpec: {
            open: i.TransitionIOSSpec,
            close: i.TransitionIOSSpec,
          },
          cardStyleInterpolator: o.forVerticalIOS,
          headerStyleInterpolator: a.forFade,
        };
        t.ModalSlideFromBottomIOS = u;
        var s = {
          gestureDirection: "vertical",
          transitionSpec: {
            open: i.TransitionIOSSpec,
            close: i.TransitionIOSSpec,
          },
          cardStyleInterpolator: o.forModalPresentationIOS,
          headerStyleInterpolator: a.forFade,
        };
        t.ModalPresentationIOS = s;
        var c = {
          gestureDirection: "vertical",
          transitionSpec: {
            open: i.FadeInFromBottomAndroidSpec,
            close: i.FadeOutToBottomAndroidSpec,
          },
          cardStyleInterpolator: o.forFadeFromBottomAndroid,
          headerStyleInterpolator: a.forFade,
        };
        t.FadeFromBottomAndroid = c;
        var d = {
          gestureDirection: "vertical",
          transitionSpec: {
            open: i.RevealFromBottomAndroidSpec,
            close: i.RevealFromBottomAndroidSpec,
          },
          cardStyleInterpolator: o.forRevealFromBottomAndroid,
          headerStyleInterpolator: a.forFade,
        };
        t.RevealFromBottomAndroid = d;
        var f = {
          gestureDirection: "horizontal",
          transitionSpec: {
            open: i.ScaleFromCenterAndroidSpec,
            close: i.ScaleFromCenterAndroidSpec,
          },
          cardStyleInterpolator: o.forScaleFromCenterAndroid,
          headerStyleInterpolator: a.forFade,
        };
        t.ScaleFromCenterAndroid = f;
        var p = {
          gestureDirection: "vertical",
          transitionSpec: {
            open: i.BottomSheetSlideInSpec,
            close: i.BottomSheetSlideOutSpec,
          },
          cardStyleInterpolator: o.forBottomSheetAndroid,
          headerStyleInterpolator: a.forFade,
        };
        t.BottomSheetAndroid = p;
        var h = {
          gestureDirection: "vertical",
          transitionSpec: {
            open: i.BottomSheetSlideInSpec,
            close: i.BottomSheetSlideOutSpec,
          },
          cardStyleInterpolator: o.forFadeFromCenter,
          headerStyleInterpolator: a.forFade,
        };
        t.ModalFadeTransition = h;
        var v = n.Platform.select({
          ios: l,
          android:
            n.Platform.Version >= 29 ? f : n.Platform.Version >= 28 ? d : c,
          default: f,
        });
        t.DefaultTransition = v;
        var y = n.Platform.select({ ios: s, default: p });
        t.ModalTransition = y;
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.BottomSheetSlideOutSpec =
            t.BottomSheetSlideInSpec =
            t.ScaleFromCenterAndroidSpec =
            t.RevealFromBottomAndroidSpec =
            t.FadeOutToBottomAndroidSpec =
            t.FadeInFromBottomAndroidSpec =
            t.TransitionIOSSpec =
              void 0);
        var n = r(2);
        t.TransitionIOSSpec = {
          animation: "spring",
          config: {
            stiffness: 1e3,
            damping: 500,
            mass: 3,
            overshootClamping: !0,
            restDisplacementThreshold: 10,
            restSpeedThreshold: 10,
          },
        };
        var o = {
          animation: "timing",
          config: { duration: 350, easing: n.Easing.out(n.Easing.poly(5)) },
        };
        t.FadeInFromBottomAndroidSpec = o;
        var a = {
          animation: "timing",
          config: { duration: 150, easing: n.Easing.in(n.Easing.linear) },
        };
        t.FadeOutToBottomAndroidSpec = a;
        var i = {
          animation: "timing",
          config: { duration: 425, easing: n.Easing.bezier(0.35, 0.45, 0, 1) },
        };
        t.RevealFromBottomAndroidSpec = i;
        var l = {
          animation: "timing",
          config: { duration: 400, easing: n.Easing.bezier(0.35, 0.45, 0, 1) },
        };
        t.ScaleFromCenterAndroidSpec = l;
        var u = {
          animation: "timing",
          config: {
            duration: 250,
            easing: function (e) {
              return Math.cos((e + 1) * Math.PI) / 2 + 0.5;
            },
          },
        };
        t.BottomSheetSlideInSpec = u;
        var s = {
          animation: "timing",
          config: {
            duration: 200,
            easing: function (e) {
              return 1 === e ? 1 : Math.pow(e, 2);
            },
          },
        };
        t.BottomSheetSlideOutSpec = s;
      },
      (e) => {
        new Set();
        e.exports = function (e) {};
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var o = n(r(16)),
          a = n(r(3)),
          i = n(r(5)),
          l = n(r(11)),
          u = n(r(12)),
          s = n(r(13)),
          c = n(r(14)),
          d = n(r(10)),
          f = r(7),
          p = r(4),
          h = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = O(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          v = r(2),
          y = r(8),
          g = n(r(27)),
          b = r(52),
          m = n(r(78)),
          w = n(r(81));
        function O(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (O = function (e) {
            return e ? r : t;
          })(e);
        }
        function S(e) {
          var t = (function () {
            if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
            if (Reflect.construct.sham) return !1;
            if ("function" == typeof Proxy) return !0;
            try {
              return (
                Boolean.prototype.valueOf.call(
                  Reflect.construct(Boolean, [], function () {})
                ),
                !0
              );
            } catch (e) {
              return !1;
            }
          })();
          return function () {
            var r,
              n = (0, d.default)(e);
            if (t) {
              var o = (0, d.default)(this).constructor;
              r = Reflect.construct(n, arguments, o);
            } else r = n.apply(this, arguments);
            return (0, c.default)(this, r);
          };
        }
        function k() {
          return (k = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(this, arguments);
        }
        var P =
            null != b.GestureHandlerRootView
              ? b.GestureHandlerRootView
              : v.View,
          M = (function (e) {
            (0, s.default)(r, e);
            var t = S(r);
            function r() {
              var e;
              (0, l.default)(this, r);
              for (
                var n = arguments.length, o = new Array(n), a = 0;
                a < n;
                a++
              )
                o[a] = arguments[a];
              return (
                ((e = t.call.apply(t, [this].concat(o))).state = {
                  routes: [],
                  previousRoutes: [],
                  previousDescriptors: {},
                  openingRouteKeys: [],
                  closingRouteKeys: [],
                  replacingRouteKeys: [],
                  descriptors: {},
                }),
                (e.getPreviousRoute = function (t) {
                  var r = t.route,
                    n = e.state,
                    o = n.closingRouteKeys,
                    a = n.replacingRouteKeys,
                    i = e.state.routes.filter(function (e) {
                      return (
                        e.key === r.key ||
                        (!o.includes(e.key) && !a.includes(e.key))
                      );
                    }),
                    l = i.findIndex(function (e) {
                      return e.key === r.key;
                    });
                  return i[l - 1];
                }),
                (e.renderScene = function (t) {
                  var r = t.route,
                    n =
                      e.state.descriptors[r.key] || e.props.descriptors[r.key];
                  return n ? n.render() : null;
                }),
                (e.renderHeader = function (e) {
                  return h.createElement(m.default, e);
                }),
                (e.handleOpenRoute = function (t) {
                  var r = t.route,
                    n = e.props,
                    o = n.state,
                    a = n.navigation,
                    i = e.state,
                    l = i.closingRouteKeys,
                    u = i.replacingRouteKeys;
                  l.some(function (e) {
                    return e === r.key;
                  }) &&
                  u.every(function (e) {
                    return e !== r.key;
                  }) &&
                  o.routeNames.includes(r.name) &&
                  !o.routes.some(function (e) {
                    return e.key === r.key;
                  })
                    ? a.navigate(r)
                    : e.setState(function (e) {
                        return {
                          routes: e.replacingRouteKeys.length
                            ? e.routes.filter(function (t) {
                                return !e.replacingRouteKeys.includes(t.key);
                              })
                            : e.routes,
                          openingRouteKeys: e.openingRouteKeys.filter(function (
                            e
                          ) {
                            return e !== r.key;
                          }),
                          closingRouteKeys: e.closingRouteKeys.filter(function (
                            e
                          ) {
                            return e !== r.key;
                          }),
                          replacingRouteKeys: [],
                        };
                      });
                }),
                (e.handleCloseRoute = function (t) {
                  var r = t.route,
                    n = e.props,
                    o = n.state,
                    a = n.navigation;
                  o.routes.some(function (e) {
                    return e.key === r.key;
                  })
                    ? a.dispatch(
                        (0, i.default)({}, p.StackActions.pop(), {
                          source: r.key,
                          target: o.key,
                        })
                      )
                    : e.setState(function (e) {
                        return {
                          routes: e.routes.filter(function (e) {
                            return e.key !== r.key;
                          }),
                          openingRouteKeys: e.openingRouteKeys.filter(function (
                            e
                          ) {
                            return e !== r.key;
                          }),
                          closingRouteKeys: e.closingRouteKeys.filter(function (
                            e
                          ) {
                            return e !== r.key;
                          }),
                        };
                      });
                }),
                (e.handleTransitionStart = function (t, r) {
                  var n = t.route;
                  return e.props.navigation.emit({
                    type: "transitionStart",
                    data: { closing: r },
                    target: n.key,
                  });
                }),
                (e.handleTransitionEnd = function (t, r) {
                  var n = t.route;
                  return e.props.navigation.emit({
                    type: "transitionEnd",
                    data: { closing: r },
                    target: n.key,
                  });
                }),
                (e.handleGestureStart = function (t) {
                  var r = t.route;
                  e.props.navigation.emit({
                    type: "gestureStart",
                    target: r.key,
                  });
                }),
                (e.handleGestureEnd = function (t) {
                  var r = t.route;
                  e.props.navigation.emit({
                    type: "gestureEnd",
                    target: r.key,
                  });
                }),
                (e.handleGestureCancel = function (t) {
                  var r = t.route;
                  e.props.navigation.emit({
                    type: "gestureCancel",
                    target: r.key,
                  });
                }),
                e
              );
            }
            return (
              (0, u.default)(
                r,
                [
                  {
                    key: "render",
                    value: function () {
                      var e = this,
                        t = this.props,
                        r = t.state,
                        n =
                          (t.descriptors,
                          (0, a.default)(t, ["state", "descriptors"])),
                        o = this.state,
                        i = o.routes,
                        l = o.descriptors,
                        u = o.openingRouteKeys,
                        s = o.closingRouteKeys;
                      return h.createElement(
                        P,
                        { style: x.container },
                        h.createElement(
                          f.SafeAreaProviderCompat,
                          null,
                          h.createElement(
                            y.SafeAreaInsetsContext.Consumer,
                            null,
                            function (t) {
                              return h.createElement(
                                g.default.Consumer,
                                null,
                                function (o) {
                                  return h.createElement(
                                    f.HeaderShownContext.Consumer,
                                    null,
                                    function (a) {
                                      return h.createElement(
                                        w.default,
                                        k(
                                          {
                                            insets: t,
                                            isParentHeaderShown: a,
                                            isParentModal: o,
                                            getPreviousRoute:
                                              e.getPreviousRoute,
                                            routes: i,
                                            openingRouteKeys: u,
                                            closingRouteKeys: s,
                                            onOpenRoute: e.handleOpenRoute,
                                            onCloseRoute: e.handleCloseRoute,
                                            onTransitionStart:
                                              e.handleTransitionStart,
                                            onTransitionEnd:
                                              e.handleTransitionEnd,
                                            renderHeader: e.renderHeader,
                                            renderScene: e.renderScene,
                                            state: r,
                                            descriptors: l,
                                            onGestureStart:
                                              e.handleGestureStart,
                                            onGestureEnd: e.handleGestureEnd,
                                            onGestureCancel:
                                              e.handleGestureCancel,
                                          },
                                          n
                                        )
                                      );
                                    }
                                  );
                                }
                              );
                            }
                          )
                        )
                      );
                    },
                  },
                ],
                [
                  {
                    key: "getDerivedStateFromProps",
                    value: function (e, t) {
                      if (
                        (e.state.routes === t.previousRoutes ||
                          ((u = e.state.routes.map(function (e) {
                            return e.key;
                          })),
                          (s = t.previousRoutes.map(function (e) {
                            return e.key;
                          })),
                          u.length === s.length &&
                            u.every(function (e, t) {
                              return e === s[t];
                            }))) &&
                        t.routes.length
                      ) {
                        var r = t.routes,
                          n = t.previousRoutes,
                          a = e.descriptors,
                          i = t.previousDescriptors;
                        if (
                          (e.descriptors !== t.previousDescriptors &&
                            ((a = t.routes.reduce(function (r, n) {
                              return (
                                (r[n.key] =
                                  e.descriptors[n.key] || t.descriptors[n.key]),
                                r
                              );
                            }, {})),
                            (i = e.descriptors)),
                          e.state.routes !== t.previousRoutes)
                        ) {
                          var l = e.state.routes.reduce(function (e, t) {
                            return (e[t.key] = t), e;
                          }, {});
                          (r = t.routes.map(function (e) {
                            return l[e.key] || e;
                          })),
                            (n = e.state.routes);
                        }
                        return {
                          routes: r,
                          previousRoutes: n,
                          descriptors: a,
                          previousDescriptors: i,
                        };
                      }
                      var u,
                        s,
                        c,
                        d,
                        f =
                          e.state.index < e.state.routes.length - 1
                            ? e.state.routes.slice(0, e.state.index + 1)
                            : e.state.routes,
                        p = t.openingRouteKeys,
                        h = t.closingRouteKeys,
                        v = t.replacingRouteKeys,
                        y = t.previousRoutes,
                        g = y[y.length - 1],
                        b = f[f.length - 1],
                        m = function (r) {
                          var n = e.descriptors[r] || t.descriptors[r];
                          return !n || !1 !== n.options.animationEnabled;
                        };
                      if (g && g.key !== b.key)
                        y.some(function (e) {
                          return e.key === b.key;
                        })
                          ? f.some(function (e) {
                              return e.key === g.key;
                            }) ||
                            (m(g.key) &&
                              !h.includes(g.key) &&
                              ((h = [].concat((0, o.default)(h), [g.key])),
                              (p = p.filter(function (e) {
                                return e !== g.key;
                              })),
                              (v = v.filter(function (e) {
                                return e !== g.key;
                              })),
                              (f = [].concat((0, o.default)(f), [g]))))
                          : m(b.key) &&
                            !p.includes(b.key) &&
                            ((p = [].concat((0, o.default)(p), [b.key])),
                            (h = h.filter(function (e) {
                              return e !== b.key;
                            })),
                            (v = v.filter(function (e) {
                              return e !== b.key;
                            })),
                            f.some(function (e) {
                              return e.key === g.key;
                            }) ||
                              ((p = p.filter(function (e) {
                                return e !== g.key;
                              })),
                              "pop" ===
                              ((c = b.key),
                              null !=
                              (d = (e.descriptors[c] || t.descriptors[c])
                                .options.animationTypeForReplace)
                                ? d
                                : "push")
                                ? ((h = [].concat((0, o.default)(h), [g.key])),
                                  (p = p.filter(function (e) {
                                    return e !== b.key;
                                  })),
                                  (f = [].concat((0, o.default)(f), [g])))
                                : ((v = [].concat((0, o.default)(v), [g.key])),
                                  (h = h.filter(function (e) {
                                    return e !== g.key;
                                  })),
                                  (f = f.slice()).splice(f.length - 1, 0, g))));
                      else if (v.length || h.length) {
                        var w;
                        (w = f = f.slice()).splice.apply(
                          w,
                          [f.length - 1, 0].concat(
                            (0, o.default)(
                              t.routes.filter(function (e) {
                                var t = e.key;
                                return (
                                  !!m(t) && (v.includes(t) || h.includes(t))
                                );
                              })
                            )
                          )
                        );
                      }
                      if (!f.length)
                        throw new Error(
                          "There should always be at least one route in the navigation state."
                        );
                      var O = f.reduce(function (r, n) {
                        return (
                          (r[n.key] =
                            e.descriptors[n.key] || t.descriptors[n.key]),
                          r
                        );
                      }, {});
                      return {
                        routes: f,
                        previousRoutes: e.state.routes,
                        previousDescriptors: e.descriptors,
                        openingRouteKeys: p,
                        closingRouteKeys: h,
                        replacingRouteKeys: v,
                        descriptors: O,
                      };
                    },
                  },
                ]
              ),
              r
            );
          })(h.Component);
        t.default = M;
        var x = v.StyleSheet.create({ container: { flex: 1 } });
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.style,
              r = (0, o.default)(e, ["style"]),
              n = (0, a.useTheme)().colors;
            return i.createElement(
              l.View,
              s({}, r, {
                style: [{ flex: 1, backgroundColor: n.background }, t],
              })
            );
          });
        var o = n(r(3)),
          a = r(4),
          i = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = u(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          l = r(2);
        function u(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (u = function (e) {
            return e ? r : t;
          })(e);
        }
        function s() {
          return (s = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(this, arguments);
        }
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.style,
              r = (0, a.default)(e, ["style"]),
              n = (0, i.useTheme)().colors;
            return l.createElement(
              u.Animated.View,
              c(
                {
                  style: [
                    d.container,
                    {
                      backgroundColor: n.card,
                      borderBottomColor: n.border,
                      shadowColor: n.border,
                    },
                    t,
                  ],
                },
                r
              )
            );
          });
        var o = n(r(5)),
          a = n(r(3)),
          i = r(4),
          l = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = s(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          u = r(2);
        function s(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (s = function (e) {
            return e ? r : t;
          })(e);
        }
        function c() {
          return (c = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(this, arguments);
        }
        var d = u.StyleSheet.create({
          container: (0, o.default)(
            { flex: 1 },
            u.Platform.select({
              android: { elevation: 4 },
              ios: {
                shadowOpacity: 0.85,
                shadowRadius: 0,
                shadowOffset: { width: 0, height: u.StyleSheet.hairlineWidth },
              },
              default: { borderBottomWidth: u.StyleSheet.hairlineWidth },
            })
          ),
        });
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.tintColor,
              r = e.style,
              n = (0, o.default)(e, ["tintColor", "style"]),
              u = (0, a.useTheme)().colors;
            return i.createElement(
              l.Animated.Text,
              s(
                {
                  accessibilityRole: "header",
                  "aria-level": "1",
                  numberOfLines: 1,
                },
                n,
                { style: [c.title, { color: void 0 === t ? u.text : t }, r] }
              )
            );
          });
        var o = n(r(3)),
          a = r(4),
          i = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = u(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          l = r(2);
        function u(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (u = function (e) {
            return e ? r : t;
          })(e);
        }
        function s() {
          return (s = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(this, arguments);
        }
        var c = l.StyleSheet.create({
          title: l.Platform.select({
            ios: { fontSize: 17, fontWeight: "600" },
            android: {
              fontSize: 20,
              fontFamily: "sans-serif-medium",
              fontWeight: "normal",
            },
            default: { fontSize: 18, fontWeight: "500" },
          }),
        });
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.onPressIn,
              r = e.onPressOut,
              n = e.android_ripple,
              c = e.pressColor,
              h = e.pressOpacity,
              v = void 0 === h ? 0.3 : h,
              y = e.style,
              g = (0, i.default)(e, [
                "onPressIn",
                "onPressOut",
                "android_ripple",
                "pressColor",
                "pressOpacity",
                "style",
              ]),
              b = (0, l.useTheme)().dark,
              m = u.useState(function () {
                return new s.Animated.Value(1);
              }),
              w = (0, a.default)(m, 1)[0],
              O = function (e, t) {
                p ||
                  s.Animated.timing(w, {
                    toValue: e,
                    duration: t,
                    easing: s.Easing.inOut(s.Easing.quad),
                    useNativeDriver: !0,
                  }).start();
              };
            return u.createElement(
              f,
              d(
                {
                  onPressIn: function (e) {
                    O(v, 0), null == t || t(e);
                  },
                  onPressOut: function (e) {
                    O(1, 200), null == r || r(e);
                  },
                  android_ripple: p
                    ? (0, o.default)(
                        {
                          color:
                            void 0 !== c
                              ? c
                              : b
                              ? "rgba(255, 255, 255, .32)"
                              : "rgba(0, 0, 0, .32)",
                        },
                        n
                      )
                    : void 0,
                  style: [{ opacity: p ? 1 : w }, y],
                },
                g
              )
            );
          });
        var o = n(r(5)),
          a = n(r(6)),
          i = n(r(3)),
          l = r(4),
          u = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = c(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          s = r(2);
        function c(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (c = function (e) {
            return e ? r : t;
          })(e);
        }
        function d() {
          return (d = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(this, arguments);
        }
        var f = s.Animated.createAnimatedComponent(s.Pressable),
          p = "android" === s.Platform.OS && s.Platform.Version >= 21;
      },
      (e) => {
        "use strict";
        e.exports = require("AssetRegistry");
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.GestureState =
            t.GestureHandlerRootView =
            t.PanGestureHandler =
              void 0);
        var n = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = a(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var i in e)
              if (
                "default" !== i &&
                Object.prototype.hasOwnProperty.call(e, i)
              ) {
                var l = o ? Object.getOwnPropertyDescriptor(e, i) : null;
                l && (l.get || l.set)
                  ? Object.defineProperty(n, i, l)
                  : (n[i] = e[i]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          o = r(2);
        function a(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (a = function (e) {
            return e ? r : t;
          })(e);
        }
        var i = function (e) {
          var t = e.children;
          return n.createElement(n.Fragment, null, t);
        };
        t.PanGestureHandler = i;
        var l = o.View;
        t.GestureHandlerRootView = l;
        t.GestureState = {
          UNDETERMINED: 0,
          FAILED: 1,
          BEGAN: 2,
          CANCELLED: 3,
          ACTIVE: 4,
          END: 5,
        };
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var o = n(r(5)),
          a = r(7),
          i = r(4),
          l = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = f(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          u = r(8),
          s = n(r(79)),
          c = n(r(27)),
          d = n(r(80));
        function f(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (f = function (e) {
            return e ? r : t;
          })(e);
        }
        function p() {
          return (p = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(this, arguments);
        }
        var h = l.memo(function (e) {
          var t,
            r = e.back,
            n = e.layout,
            f = e.progress,
            h = e.options,
            v = e.route,
            y = e.navigation,
            g = e.styleInterpolator,
            b = (0, u.useSafeAreaInsets)();
          void 0 !== h.headerBackTitle
            ? (t = h.headerBackTitle)
            : r && (t = r.title);
          var m = l.useCallback(
              (0, s.default)(function () {
                y.isFocused() &&
                  y.canGoBack() &&
                  y.dispatch(
                    (0, o.default)({}, i.StackActions.pop(), { source: v.key })
                  );
              }, 50),
              [y, v.key]
            ),
            w = l.useContext(c.default),
            O = l.useContext(a.HeaderShownContext),
            S =
              void 0 !== h.headerStatusBarHeight
                ? h.headerStatusBarHeight
                : w || O
                ? 0
                : b.top;
          return l.createElement(
            d.default,
            p({}, h, {
              title: (0, a.getHeaderTitle)(h, v.name),
              progress: f,
              layout: n,
              modal: w,
              headerBackTitle:
                void 0 !== h.headerBackTitle ? h.headerBackTitle : t,
              headerStatusBarHeight: S,
              onGoBack: r ? m : void 0,
              styleInterpolator: g,
            })
          );
        });
        t.default = h;
      },
      (e, t) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t, r;
            return function () {
              for (
                var n = !1, o = arguments.length, a = new Array(o), i = 0;
                i < o;
                i++
              )
                a[i] = arguments[i];
              if (t) {
                if (t.length !== a.length) n = !0;
                else
                  for (var l = 0; l < t.length; l++)
                    if (t[l] !== a[l]) {
                      n = !0;
                      break;
                    }
              } else n = !0;
              return (
                (t = a), (n || void 0 === r) && (r = e.apply(void 0, a)), r
              );
            };
          });
      },
      (e, t, r) => {
        var n = r(29),
          o = r(56),
          a = Object.hasOwnProperty,
          i = Object.create(null);
        for (var l in n) a.call(n, l) && (i[n[l]] = l);
        var u = (e.exports = { to: {}, get: {} });
        function s(e, t, r) {
          return Math.min(Math.max(t, e), r);
        }
        function c(e) {
          var t = Math.round(e).toString(16).toUpperCase();
          return t.length < 2 ? "0" + t : t;
        }
        (u.get = function (e) {
          var t, r;
          switch (e.substring(0, 3).toLowerCase()) {
            case "hsl":
              (t = u.get.hsl(e)), (r = "hsl");
              break;
            case "hwb":
              (t = u.get.hwb(e)), (r = "hwb");
              break;
            default:
              (t = u.get.rgb(e)), (r = "rgb");
          }
          return t ? { model: r, value: t } : null;
        }),
          (u.get.rgb = function (e) {
            if (!e) return null;
            var t,
              r,
              o,
              i = [0, 0, 0, 1];
            if ((t = e.match(/^#([a-f0-9]{6})([a-f0-9]{2})?$/i))) {
              for (o = t[2], t = t[1], r = 0; r < 3; r++) {
                var l = 2 * r;
                i[r] = parseInt(t.slice(l, l + 2), 16);
              }
              o && (i[3] = parseInt(o, 16) / 255);
            } else if ((t = e.match(/^#([a-f0-9]{3,4})$/i))) {
              for (o = (t = t[1])[3], r = 0; r < 3; r++)
                i[r] = parseInt(t[r] + t[r], 16);
              o && (i[3] = parseInt(o + o, 16) / 255);
            } else if (
              (t = e.match(
                /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/
              ))
            ) {
              for (r = 0; r < 3; r++) i[r] = parseInt(t[r + 1], 0);
              t[4] &&
                (t[5]
                  ? (i[3] = 0.01 * parseFloat(t[4]))
                  : (i[3] = parseFloat(t[4])));
            } else {
              if (
                !(t = e.match(
                  /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/
                ))
              )
                return (t = e.match(/^(\w+)$/))
                  ? "transparent" === t[1]
                    ? [0, 0, 0, 0]
                    : a.call(n, t[1])
                    ? (((i = n[t[1]])[3] = 1), i)
                    : null
                  : null;
              for (r = 0; r < 3; r++)
                i[r] = Math.round(2.55 * parseFloat(t[r + 1]));
              t[4] &&
                (t[5]
                  ? (i[3] = 0.01 * parseFloat(t[4]))
                  : (i[3] = parseFloat(t[4])));
            }
            for (r = 0; r < 3; r++) i[r] = s(i[r], 0, 255);
            return (i[3] = s(i[3], 0, 1)), i;
          }),
          (u.get.hsl = function (e) {
            if (!e) return null;
            var t = e.match(
              /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d\.]+)%\s*,?\s*([+-]?[\d\.]+)%\s*(?:[,|\/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/
            );
            if (t) {
              var r = parseFloat(t[4]);
              return [
                ((parseFloat(t[1]) % 360) + 360) % 360,
                s(parseFloat(t[2]), 0, 100),
                s(parseFloat(t[3]), 0, 100),
                s(isNaN(r) ? 1 : r, 0, 1),
              ];
            }
            return null;
          }),
          (u.get.hwb = function (e) {
            if (!e) return null;
            var t = e.match(
              /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/
            );
            if (t) {
              var r = parseFloat(t[4]);
              return [
                ((parseFloat(t[1]) % 360) + 360) % 360,
                s(parseFloat(t[2]), 0, 100),
                s(parseFloat(t[3]), 0, 100),
                s(isNaN(r) ? 1 : r, 0, 1),
              ];
            }
            return null;
          }),
          (u.to.hex = function () {
            var e = o(arguments);
            return (
              "#" +
              c(e[0]) +
              c(e[1]) +
              c(e[2]) +
              (e[3] < 1 ? c(Math.round(255 * e[3])) : "")
            );
          }),
          (u.to.rgb = function () {
            var e = o(arguments);
            return e.length < 4 || 1 === e[3]
              ? "rgb(" +
                  Math.round(e[0]) +
                  ", " +
                  Math.round(e[1]) +
                  ", " +
                  Math.round(e[2]) +
                  ")"
              : "rgba(" +
                  Math.round(e[0]) +
                  ", " +
                  Math.round(e[1]) +
                  ", " +
                  Math.round(e[2]) +
                  ", " +
                  e[3] +
                  ")";
          }),
          (u.to.rgb.percent = function () {
            var e = o(arguments),
              t = Math.round((e[0] / 255) * 100),
              r = Math.round((e[1] / 255) * 100),
              n = Math.round((e[2] / 255) * 100);
            return e.length < 4 || 1 === e[3]
              ? "rgb(" + t + "%, " + r + "%, " + n + "%)"
              : "rgba(" + t + "%, " + r + "%, " + n + "%, " + e[3] + ")";
          }),
          (u.to.hsl = function () {
            var e = o(arguments);
            return e.length < 4 || 1 === e[3]
              ? "hsl(" + e[0] + ", " + e[1] + "%, " + e[2] + "%)"
              : "hsla(" +
                  e[0] +
                  ", " +
                  e[1] +
                  "%, " +
                  e[2] +
                  "%, " +
                  e[3] +
                  ")";
          }),
          (u.to.hwb = function () {
            var e = o(arguments),
              t = "";
            return (
              e.length >= 4 && 1 !== e[3] && (t = ", " + e[3]),
              "hwb(" + e[0] + ", " + e[1] + "%, " + e[2] + "%" + t + ")"
            );
          }),
          (u.to.keyword = function (e) {
            return i[e.slice(0, 3)];
          });
      },
      (e, t, r) => {
        "use strict";
        var n = r(57),
          o = Array.prototype.concat,
          a = Array.prototype.slice,
          i = (e.exports = function (e) {
            for (var t = [], r = 0, i = e.length; r < i; r++) {
              var l = e[r];
              n(l) ? (t = o.call(t, a.call(l))) : t.push(l);
            }
            return t;
          });
        i.wrap = function (e) {
          return function () {
            return e(i(arguments));
          };
        };
      },
      (e) => {
        e.exports = function (e) {
          return (
            !(!e || "string" == typeof e) &&
            (e instanceof Array ||
              Array.isArray(e) ||
              (e.length >= 0 &&
                (e.splice instanceof Function ||
                  (Object.getOwnPropertyDescriptor(e, e.length - 1) &&
                    "String" !== e.constructor.name))))
          );
        };
      },
      (e, t, r) => {
        var n = r(30),
          o = r(59),
          a = {};
        Object.keys(n).forEach(function (e) {
          (a[e] = {}),
            Object.defineProperty(a[e], "channels", { value: n[e].channels }),
            Object.defineProperty(a[e], "labels", { value: n[e].labels });
          var t = o(e);
          Object.keys(t).forEach(function (r) {
            var n = t[r];
            (a[e][r] = (function (e) {
              var t = function () {
                for (
                  var t = arguments.length, r = new Array(t), n = 0;
                  n < t;
                  n++
                )
                  r[n] = arguments[n];
                var o = r[0];
                if (null == o) return o;
                o.length > 1 && (r = o);
                var a = e(r);
                if ("object" == typeof a)
                  for (var i = a.length, l = 0; l < i; l++)
                    a[l] = Math.round(a[l]);
                return a;
              };
              return "conversion" in e && (t.conversion = e.conversion), t;
            })(n)),
              (a[e][r].raw = (function (e) {
                var t = function () {
                  for (
                    var t = arguments.length, r = new Array(t), n = 0;
                    n < t;
                    n++
                  )
                    r[n] = arguments[n];
                  var o = r[0];
                  return null == o ? o : (o.length > 1 && (r = o), e(r));
                };
                return "conversion" in e && (t.conversion = e.conversion), t;
              })(n));
          });
        }),
          (e.exports = a);
      },
      (e, t, r) => {
        var n = r(30);
        function o(e) {
          var t = (function () {
              for (
                var e = {}, t = Object.keys(n), r = t.length, o = 0;
                o < r;
                o++
              )
                e[t[o]] = { distance: -1, parent: null };
              return e;
            })(),
            r = [e];
          for (t[e].distance = 0; r.length; )
            for (
              var o = r.pop(), a = Object.keys(n[o]), i = a.length, l = 0;
              l < i;
              l++
            ) {
              var u = a[l],
                s = t[u];
              -1 === s.distance &&
                ((s.distance = t[o].distance + 1),
                (s.parent = o),
                r.unshift(u));
            }
          return t;
        }
        function a(e, t) {
          return function (r) {
            return t(e(r));
          };
        }
        function i(e, t) {
          for (
            var r = [t[e].parent, e], o = n[t[e].parent][e], i = t[e].parent;
            t[i].parent;

          )
            r.unshift(t[i].parent),
              (o = a(n[t[i].parent][i], o)),
              (i = t[i].parent);
          return (o.conversion = r), o;
        }
        e.exports = function (e) {
          for (
            var t = o(e), r = {}, n = Object.keys(t), a = n.length, l = 0;
            l < a;
            l++
          ) {
            var u = n[l];
            null !== t[u].parent && (r[u] = i(u, t));
          }
          return r;
        };
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e, t) {
            var r = (0, o.default)(t);
            switch (t) {
              case "vertical":
              case "vertical-inverted":
                return e.height * r;
              case "horizontal":
              case "horizontal-inverted":
                return e.width * r;
            }
          });
        var o = n(r(61));
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            switch (e) {
              case "vertical":
                return 1;
              case "vertical-inverted":
                return -1;
              case "horizontal":
                return n.I18nManager.getConstants().isRTL ? -1 : 1;
              case "horizontal-inverted":
                return n.I18nManager.getConstants().isRTL ? 1 : -1;
            }
          });
        var n = r(2);
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.getIsModalPresentation = t.default = void 0);
        var o = n(r(3)),
          a = n(r(5)),
          i = n(r(11)),
          l = n(r(12)),
          u = n(r(13)),
          s = n(r(14)),
          c = n(r(10)),
          d = n(r(28)),
          f = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = S(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          p = r(2),
          h = r(15),
          v = n(r(31)),
          y = n(r(60)),
          g = n(r(61)),
          b = n(r(54)),
          m = r(52),
          w = n(r(85)),
          O = n(r(86));
        function S(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (S = function (e) {
            return e ? r : t;
          })(e);
        }
        function k(e) {
          var t = (function () {
            if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
            if (Reflect.construct.sham) return !1;
            if ("function" == typeof Proxy) return !0;
            try {
              return (
                Boolean.prototype.valueOf.call(
                  Reflect.construct(Boolean, [], function () {})
                ),
                !0
              );
            } catch (e) {
              return !1;
            }
          })();
          return function () {
            var r,
              n = (0, c.default)(e);
            if (t) {
              var o = (0, c.default)(this).constructor;
              r = Reflect.construct(n, arguments, o);
            } else r = n.apply(this, arguments);
            return (0, s.default)(this, r);
          };
        }
        function P() {
          return (P = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(this, arguments);
        }
        var M = "web" !== p.Platform.OS,
          x = (function (e) {
            (0, u.default)(r, e);
            var t = k(r);
            function r() {
              var e;
              (0, i.default)(this, r);
              for (
                var n = arguments.length, o = new Array(n), l = 0;
                l < n;
                l++
              )
                o[l] = arguments[l];
              return (
                ((e = t.call.apply(t, [this].concat(o))).isCurrentlyMounted =
                  !1),
                (e.isClosing = new p.Animated.Value(0)),
                (e.inverted = new p.Animated.Value(
                  (0, g.default)(e.props.gestureDirection)
                )),
                (e.layout = {
                  width: new p.Animated.Value(e.props.layout.width),
                  height: new p.Animated.Value(e.props.layout.height),
                }),
                (e.isSwiping = new p.Animated.Value(0)),
                (e.animate = function (t) {
                  var r = t.closing,
                    n = t.velocity,
                    o = e.props,
                    i = o.gesture,
                    l = o.transitionSpec,
                    u = o.onOpen,
                    s = o.onClose,
                    c = o.onTransition,
                    d = e.getAnimateToValue(
                      (0, a.default)({}, e.props, { closing: r })
                    );
                  (e.lastToValue = d), e.isClosing.setValue(r ? 1 : 0);
                  var f = r ? l.close : l.open,
                    h =
                      "spring" === f.animation
                        ? p.Animated.spring
                        : p.Animated.timing;
                  e.setPointerEventsEnabled(!r),
                    e.handleStartInteraction(),
                    clearTimeout(e.pendingGestureCallback),
                    null == c || c({ closing: r, gesture: void 0 !== n }),
                    h(
                      i,
                      (0, a.default)({}, f.config, {
                        velocity: n,
                        toValue: d,
                        useNativeDriver: M,
                        isInteraction: !1,
                      })
                    ).start(function (t) {
                      var n = t.finished;
                      e.handleEndInteraction(),
                        clearTimeout(e.pendingGestureCallback),
                        n &&
                          (r ? s() : u(),
                          e.isCurrentlyMounted && e.forceUpdate());
                    });
                }),
                (e.getAnimateToValue = function (e) {
                  var t = e.closing,
                    r = e.layout,
                    n = e.gestureDirection;
                  return t ? (0, y.default)(r, n) : 0;
                }),
                (e.setPointerEventsEnabled = function (t) {
                  var r,
                    n = t ? "box-none" : "none";
                  null === (r = e.ref.current) ||
                    void 0 === r ||
                    r.setPointerEvents(n);
                }),
                (e.handleStartInteraction = function () {
                  void 0 === e.interactionHandle &&
                    (e.interactionHandle =
                      p.InteractionManager.createInteractionHandle());
                }),
                (e.handleEndInteraction = function () {
                  void 0 !== e.interactionHandle &&
                    (p.InteractionManager.clearInteractionHandle(
                      e.interactionHandle
                    ),
                    (e.interactionHandle = void 0));
                }),
                (e.handleGestureStateChange = function (t) {
                  var r = t.nativeEvent,
                    n = e.props,
                    o = n.layout,
                    a = n.onClose,
                    i = n.onGestureBegin,
                    l = n.onGestureCanceled,
                    u = n.onGestureEnd,
                    s = n.gestureDirection,
                    c = n.gestureVelocityImpact;
                  switch (r.state) {
                    case m.GestureState.ACTIVE:
                      e.isSwiping.setValue(1),
                        e.handleStartInteraction(),
                        null == i || i();
                      break;
                    case m.GestureState.CANCELLED:
                      e.isSwiping.setValue(0), e.handleEndInteraction();
                      var d =
                        "vertical" === s || "vertical-inverted" === s
                          ? r.velocityY
                          : r.velocityX;
                      e.animate({ closing: e.props.closing, velocity: d }),
                        null == l || l();
                      break;
                    case m.GestureState.END:
                      var f, p, h;
                      e.isSwiping.setValue(0),
                        "vertical" === s || "vertical-inverted" === s
                          ? ((f = o.height),
                            (p = r.translationY),
                            (h = r.velocityY))
                          : ((f = o.width),
                            (p = r.translationX),
                            (h = r.velocityX));
                      var v =
                        (p + h * c) * (0, g.default)(s) > f / 2
                          ? 0 !== h || 0 !== p
                          : e.props.closing;
                      e.animate({ closing: v, velocity: h }),
                        v &&
                          (e.pendingGestureCallback = setTimeout(function () {
                            a(), e.forceUpdate();
                          }, 32)),
                        null == u || u();
                  }
                }),
                (e.getInterpolatedStyle = (0, b.default)(function (e, t) {
                  return e(t);
                })),
                (e.getCardAnimation = (0, b.default)(function (
                  t,
                  r,
                  n,
                  o,
                  a,
                  i,
                  l,
                  u
                ) {
                  return {
                    index: t,
                    current: { progress: r },
                    next: n && { progress: n },
                    closing: e.isClosing,
                    swiping: e.isSwiping,
                    inverted: e.inverted,
                    layouts: { screen: o },
                    insets: { top: a, right: i, bottom: l, left: u },
                  };
                })),
                (e.ref = f.createRef()),
                e
              );
            }
            return (
              (0, l.default)(r, [
                {
                  key: "componentDidMount",
                  value: function () {
                    this.animate({ closing: this.props.closing }),
                      (this.isCurrentlyMounted = !0);
                  },
                },
                {
                  key: "componentDidUpdate",
                  value: function (e) {
                    var t = this.props,
                      r = t.layout,
                      n = t.gestureDirection,
                      o = t.closing,
                      a = r.width,
                      i = r.height;
                    a !== e.layout.width && this.layout.width.setValue(a),
                      i !== e.layout.height && this.layout.height.setValue(i),
                      n !== e.gestureDirection &&
                        this.inverted.setValue((0, g.default)(n));
                    var l = this.getAnimateToValue(this.props);
                    (this.getAnimateToValue(e) === l &&
                      this.lastToValue === l) ||
                      this.animate({ closing: o });
                  },
                },
                {
                  key: "componentWillUnmount",
                  value: function () {
                    this.props.gesture.stopAnimation(),
                      (this.isCurrentlyMounted = !1),
                      this.handleEndInteraction();
                  },
                },
                {
                  key: "gestureActivationCriteria",
                  value: function () {
                    var e = this.props,
                      t = e.layout,
                      r = e.gestureDirection,
                      n = e.gestureResponseDistance,
                      o = !0,
                      a =
                        void 0 !== n
                          ? n
                          : "vertical" === r || "vertical-inverted" === r
                          ? 135
                          : 50;
                    if ("vertical" === r)
                      return {
                        maxDeltaX: 15,
                        minOffsetY: 5,
                        hitSlop: { bottom: -t.height + a },
                        enableTrackpadTwoFingerGesture: o,
                      };
                    if ("vertical-inverted" === r)
                      return {
                        maxDeltaX: 15,
                        minOffsetY: -5,
                        hitSlop: { top: -t.height + a },
                        enableTrackpadTwoFingerGesture: o,
                      };
                    var i = -t.width + a;
                    return 1 === (0, g.default)(r)
                      ? {
                          minOffsetX: 5,
                          maxDeltaY: 20,
                          hitSlop: { right: i },
                          enableTrackpadTwoFingerGesture: o,
                        }
                      : {
                          minOffsetX: -5,
                          maxDeltaY: 20,
                          hitSlop: { left: i },
                          enableTrackpadTwoFingerGesture: o,
                        };
                  },
                },
                {
                  key: "render",
                  value: function () {
                    var e,
                      t = this.props,
                      r = t.styleInterpolator,
                      n = t.interpolationIndex,
                      a = t.current,
                      i = t.gesture,
                      l = t.next,
                      u = t.layout,
                      s = t.insets,
                      c = t.overlay,
                      h = t.overlayEnabled,
                      y = t.shadowEnabled,
                      g = t.gestureEnabled,
                      b = t.gestureDirection,
                      S = t.pageOverflowEnabled,
                      k = t.headerDarkContent,
                      x = t.children,
                      _ = t.containerStyle,
                      C = t.contentStyle,
                      E = (0, o.default)(t, [
                        "styleInterpolator",
                        "interpolationIndex",
                        "current",
                        "gesture",
                        "next",
                        "layout",
                        "insets",
                        "overlay",
                        "overlayEnabled",
                        "shadowEnabled",
                        "gestureEnabled",
                        "gestureDirection",
                        "pageOverflowEnabled",
                        "headerDarkContent",
                        "children",
                        "containerStyle",
                        "contentStyle",
                      ]),
                      I = this.getCardAnimation(
                        n,
                        a,
                        l,
                        u,
                        s.top,
                        s.right,
                        s.bottom,
                        s.left
                      ),
                      T = this.getInterpolatedStyle(r, I),
                      A = T.containerStyle,
                      B = T.cardStyle,
                      D = T.overlayStyle,
                      H = T.shadowStyle,
                      W = g
                        ? p.Animated.event(
                            [
                              {
                                nativeEvent:
                                  "vertical" === b || "vertical-inverted" === b
                                    ? { translationY: i }
                                    : { translationX: i },
                              },
                            ],
                            { useNativeDriver: M }
                          )
                        : void 0,
                      F = p.StyleSheet.flatten(C || {}).backgroundColor,
                      L =
                        "string" == typeof F && 0 === (0, d.default)(F).alpha();
                    return f.createElement(
                      v.default.Provider,
                      { value: I },
                      "ios" === p.Platform.OS && h && l && j(r)
                        ? f.createElement(w.default, {
                            dark: k,
                            layout: u,
                            insets: s,
                            style: B,
                          })
                        : null,
                      f.createElement(p.Animated.View, {
                        style: { opacity: a },
                        collapsable: !1,
                      }),
                      f.createElement(
                        p.View,
                        P({ pointerEvents: "box-none" }, E),
                        h
                          ? f.createElement(
                              p.View,
                              {
                                pointerEvents: "box-none",
                                style: p.StyleSheet.absoluteFill,
                              },
                              c({ style: D })
                            )
                          : null,
                        f.createElement(
                          p.Animated.View,
                          {
                            style: [R.container, A, _],
                            pointerEvents: "box-none",
                          },
                          f.createElement(
                            m.PanGestureHandler,
                            P(
                              {
                                enabled: 0 !== u.width && g,
                                onGestureEvent: W,
                                onHandlerStateChange:
                                  this.handleGestureStateChange,
                              },
                              this.gestureActivationCriteria()
                            ),
                            f.createElement(
                              p.Animated.View,
                              {
                                needsOffscreenAlphaCompositing:
                                  ((e = B),
                                  !!e &&
                                    null != p.StyleSheet.flatten(e).opacity),
                                style: [R.container, B],
                              },
                              y && H && !L
                                ? f.createElement(p.Animated.View, {
                                    style: [
                                      R.shadow,
                                      "horizontal" === b
                                        ? [R.shadowHorizontal, R.shadowLeft]
                                        : "horizontal-inverted" === b
                                        ? [R.shadowHorizontal, R.shadowRight]
                                        : "vertical" === b
                                        ? [R.shadowVertical, R.shadowTop]
                                        : [R.shadowVertical, R.shadowBottom],
                                      { backgroundColor: F },
                                      H,
                                    ],
                                    pointerEvents: "none",
                                  })
                                : null,
                              f.createElement(
                                O.default,
                                {
                                  ref: this.ref,
                                  enabled: S,
                                  layout: u,
                                  style: C,
                                },
                                x
                              )
                            )
                          )
                        )
                      )
                    );
                  },
                },
              ]),
              r
            );
          })(f.Component);
        (t.default = x),
          (x.defaultProps = {
            shadowEnabled: !1,
            gestureEnabled: !0,
            gestureVelocityImpact: 0.3,
            overlay: function (e) {
              var t = e.style;
              return t
                ? f.createElement(p.Animated.View, {
                    pointerEvents: "none",
                    style: [R.overlay, t],
                  })
                : null;
            },
          });
        var j = function (e) {
          return (
            e === h.forModalPresentationIOS ||
            "forModalPresentationIOS" === e.name
          );
        };
        t.getIsModalPresentation = j;
        var R = p.StyleSheet.create({
          container: { flex: 1 },
          overlay: { flex: 1, backgroundColor: "#000" },
          shadow: {
            position: "absolute",
            shadowRadius: 5,
            shadowColor: "#000",
            shadowOpacity: 0.3,
          },
          shadowHorizontal: {
            top: 0,
            bottom: 0,
            width: 3,
            shadowOffset: { width: -1, height: 1 },
          },
          shadowLeft: { left: 0 },
          shadowRight: { right: 0 },
          shadowVertical: {
            left: 0,
            right: 0,
            height: 3,
            shadowOffset: { width: 1, height: -1 },
          },
          shadowTop: { top: 0 },
          shadowBottom: { bottom: 0 },
        });
      },
      (e, t, r) => {
        function n(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (n = function (e) {
            return e ? r : t;
          })(e);
        }
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var o = (function (e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" != typeof e && "function" != typeof e))
            return { default: e };
          var r = n(t);
          if (r && r.has(e)) return r.get(e);
          var o = {},
            a = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var i in e)
            if ("default" !== i && Object.prototype.hasOwnProperty.call(e, i)) {
              var l = a ? Object.getOwnPropertyDescriptor(e, i) : null;
              l && (l.get || l.set)
                ? Object.defineProperty(o, i, l)
                : (o[i] = e[i]);
            }
          (o.default = e), r && r.set(e, o);
          return o;
        })(r(1)).createContext(null);
        t.default = o;
      },
      ,
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e, t, r) {
            return o(
              a(e, t),
              a(e.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), r)
            );
          });
        var n = r(2),
          o = n.Animated.add,
          a = n.Animated.multiply;
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var o = n(r(5)),
          a = n(r(3)),
          i = r(4),
          l = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = c(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          u = n(r(45)),
          s = n(r(46));
        function c(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (c = function (e) {
            return e ? r : t;
          })(e);
        }
        function d() {
          return (d = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(this, arguments);
        }
        var f = (0, i.createNavigatorFactory)(function (e) {
          var t = e.id,
            r = e.initialRouteName,
            n = e.children,
            c = e.screenListeners,
            f = e.screenOptions,
            p = (0, a.default)(e, [
              "id",
              "initialRouteName",
              "children",
              "screenListeners",
              "screenOptions",
            ]),
            h = p.mode;
          (0,
          u.default)(null != h, "Stack Navigator: 'mode=\"" + h + "\"' is deprecated. Use 'presentation: \"" + h + "\"' in 'screenOptions' instead.\n\nSee https://reactnavigation.org/docs/stack-navigator#presentation for more details.");
          var v = p.headerMode;
          (0, u.default)(
            "none" === v,
            "Stack Navigator: 'headerMode=\"none\"' is deprecated. Use 'headerShown: false' in 'screenOptions' instead.\n\nSee https://reactnavigation.org/docs/stack-navigator/#headershown for more details."
          ),
            (0, u.default)(
              null != v && "none" !== v,
              "Stack Navigator: 'headerMode' is moved to 'options'. Moved it to 'screenOptions' to keep current behavior.\n\nSee https://reactnavigation.org/docs/stack-navigator/#headermode for more details."
            );
          var y = p.keyboardHandlingEnabled;
          (0,
          u.default)(void 0 !== y, "Stack Navigator: 'keyboardHandlingEnabled' is moved to 'options'. Moved it to 'screenOptions' to keep current behavior.\n\nSee https://reactnavigation.org/docs/stack-navigator/#keyboardhandlingenabled for more details.");
          var g = {
              presentation: h,
              headerShown: !v || "none" !== v,
              headerMode: v && "none" !== v ? v : void 0,
              keyboardHandlingEnabled: y,
            },
            b = (0, i.useNavigationBuilder)(i.StackRouter, {
              id: t,
              initialRouteName: r,
              children: n,
              screenListeners: c,
              screenOptions: f,
              defaultScreenOptions: g,
            }),
            m = b.state,
            w = b.descriptors,
            O = b.navigation,
            S = b.NavigationContent;
          return (
            l.useEffect(
              function () {
                var e;
                return null === (e = O.addListener) || void 0 === e
                  ? void 0
                  : e.call(O, "tabPress", function (e) {
                      var t = O.isFocused();
                      requestAnimationFrame(function () {
                        m.index > 0 &&
                          t &&
                          !e.defaultPrevented &&
                          O.dispatch(
                            (0, o.default)({}, i.StackActions.popToTop(), {
                              target: m.key,
                            })
                          );
                      });
                    });
              },
              [O, m.index, m.key]
            ),
            l.createElement(
              S,
              null,
              l.createElement(
                s.default,
                d({}, p, { state: m, descriptors: w, navigation: O })
              )
            )
          );
        });
        t.default = f;
      },
      (e, t) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e, t) {
            return "string" == typeof e.headerTitle
              ? e.headerTitle
              : void 0 !== e.title
              ? e.title
              : t;
          });
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = (0, l.useSafeAreaInsets)(),
              r = (0, l.useSafeAreaFrame)(),
              n = a.useContext(c.default),
              f = e.layout,
              h = void 0 === f ? r : f,
              v = e.modal,
              y = void 0 !== v && v,
              g = e.title,
              b = e.headerTitle,
              m = e.headerTitleAlign,
              w =
                void 0 === m
                  ? i.Platform.select({ ios: "center", default: "left" })
                  : m,
              O = e.headerLeft,
              S = e.headerLeftLabelVisible,
              k = e.headerTransparent,
              P = e.headerTintColor,
              M = e.headerBackground,
              x = e.headerRight,
              j = e.headerTitleAllowFontScaling,
              R = e.headerTitleStyle,
              _ = e.headerLeftContainerStyle,
              C = e.headerRightContainerStyle,
              E = e.headerTitleContainerStyle,
              I = e.headerBackgroundContainerStyle,
              T = e.headerStyle,
              A = e.headerShadowVisible,
              B = e.headerPressColor,
              D = e.headerPressOpacity,
              H = e.headerStatusBarHeight,
              W = void 0 === H ? (n ? 0 : t.top) : H,
              F = (0, u.default)(h, y, W),
              L = i.StyleSheet.flatten(T || {}),
              V = L.height,
              G = void 0 === V ? F : V,
              z = L.minHeight,
              N = L.maxHeight,
              K = L.backgroundColor,
              q = L.borderBottomColor,
              U = L.borderBottomEndRadius,
              X = L.borderBottomLeftRadius,
              Y = L.borderBottomRightRadius,
              $ = L.borderBottomStartRadius,
              J = L.borderBottomWidth,
              Q = L.borderColor,
              Z = L.borderEndColor,
              ee = L.borderEndWidth,
              te = L.borderLeftColor,
              re = L.borderLeftWidth,
              ne = L.borderRadius,
              oe = L.borderRightColor,
              ae = L.borderRightWidth,
              ie = L.borderStartColor,
              le = L.borderStartWidth,
              ue = L.borderStyle,
              se = L.borderTopColor,
              ce = L.borderTopEndRadius,
              de = L.borderTopLeftRadius,
              fe = L.borderTopRightRadius,
              pe = L.borderTopStartRadius,
              he = L.borderTopWidth,
              ve = L.borderWidth,
              ye = L.boxShadow,
              ge = L.elevation,
              be = L.shadowColor,
              me = L.shadowOffset,
              we = L.shadowOpacity,
              Oe = L.shadowRadius,
              Se = L.opacity,
              ke = L.transform;
            (0, o.default)(L, [
              "height",
              "minHeight",
              "maxHeight",
              "backgroundColor",
              "borderBottomColor",
              "borderBottomEndRadius",
              "borderBottomLeftRadius",
              "borderBottomRightRadius",
              "borderBottomStartRadius",
              "borderBottomWidth",
              "borderColor",
              "borderEndColor",
              "borderEndWidth",
              "borderLeftColor",
              "borderLeftWidth",
              "borderRadius",
              "borderRightColor",
              "borderRightWidth",
              "borderStartColor",
              "borderStartWidth",
              "borderStyle",
              "borderTopColor",
              "borderTopEndRadius",
              "borderTopLeftRadius",
              "borderTopRightRadius",
              "borderTopStartRadius",
              "borderTopWidth",
              "borderWidth",
              "boxShadow",
              "elevation",
              "shadowColor",
              "shadowOffset",
              "shadowOpacity",
              "shadowRadius",
              "opacity",
              "transform",
            ]);
            0;
            var Pe = {
              backgroundColor: K,
              borderBottomColor: q,
              borderBottomEndRadius: U,
              borderBottomLeftRadius: X,
              borderBottomRightRadius: Y,
              borderBottomStartRadius: $,
              borderBottomWidth: J,
              borderColor: Q,
              borderEndColor: Z,
              borderEndWidth: ee,
              borderLeftColor: te,
              borderLeftWidth: re,
              borderRadius: ne,
              borderRightColor: oe,
              borderRightWidth: ae,
              borderStartColor: ie,
              borderStartWidth: le,
              borderStyle: ue,
              borderTopColor: se,
              borderTopEndRadius: ce,
              borderTopLeftRadius: de,
              borderTopRightRadius: fe,
              borderTopStartRadius: pe,
              borderTopWidth: he,
              borderWidth: ve,
              boxShadow: ye,
              elevation: ge,
              shadowColor: be,
              shadowOffset: me,
              shadowOpacity: we,
              shadowRadius: Oe,
              opacity: Se,
              transform: ke,
            };
            for (var Me in Pe) void 0 === Pe[Me] && delete Pe[Me];
            var xe = [
                Pe,
                !1 === A && {
                  elevation: 0,
                  shadowOpacity: 0,
                  borderBottomWidth: 0,
                },
              ],
              je = O
                ? O({
                    tintColor: P,
                    pressColor: B,
                    pressOpacity: D,
                    labelVisible: S,
                  })
                : null,
              Re = x
                ? x({ tintColor: P, pressColor: B, pressOpacity: D })
                : null,
              _e =
                "function" != typeof b
                  ? function (e) {
                      return a.createElement(d.default, e);
                    }
                  : b;
            return a.createElement(
              a.Fragment,
              null,
              a.createElement(
                i.Animated.View,
                {
                  pointerEvents: "box-none",
                  style: [i.StyleSheet.absoluteFill, { zIndex: 0 }, I],
                },
                M
                  ? M({ style: xe })
                  : k
                  ? null
                  : a.createElement(s.default, { style: xe })
              ),
              a.createElement(
                i.Animated.View,
                {
                  pointerEvents: "box-none",
                  style: [
                    {
                      height: G,
                      minHeight: z,
                      maxHeight: N,
                      opacity: Se,
                      transform: ke,
                    },
                  ],
                },
                a.createElement(i.View, {
                  pointerEvents: "none",
                  style: { height: W },
                }),
                a.createElement(
                  i.View,
                  { pointerEvents: "box-none", style: p.content },
                  a.createElement(
                    i.Animated.View,
                    {
                      pointerEvents: "box-none",
                      style: [
                        p.left,
                        "center" === w && p.expand,
                        { marginStart: t.left },
                        _,
                      ],
                    },
                    je
                  ),
                  a.createElement(
                    i.Animated.View,
                    {
                      pointerEvents: "box-none",
                      style: [
                        p.title,
                        {
                          maxWidth:
                            "center" === w
                              ? h.width -
                                2 *
                                  ((je ? (!1 !== S ? 80 : 32) : 16) +
                                    Math.max(t.left, t.right))
                              : h.width -
                                ((je ? 72 : 16) +
                                  (Re ? 72 : 16) +
                                  t.left -
                                  t.right),
                        },
                        E,
                      ],
                    },
                    _e({
                      children: g,
                      allowFontScaling: j,
                      tintColor: P,
                      style: R,
                    })
                  ),
                  a.createElement(
                    i.Animated.View,
                    {
                      pointerEvents: "box-none",
                      style: [p.right, p.expand, { marginEnd: t.right }, C],
                    },
                    Re
                  )
                )
              )
            );
          });
        var o = n(r(3)),
          a = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = f(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          i = r(2),
          l = r(8),
          u = n(r(21)),
          s = n(r(48)),
          c = n(r(22)),
          d = n(r(49));
        function f(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (f = function (e) {
            return e ? r : t;
          })(e);
        }
        var p = i.StyleSheet.create({
          content: { flex: 1, flexDirection: "row", alignItems: "stretch" },
          title: { marginHorizontal: 16, justifyContent: "center" },
          left: { justifyContent: "center", alignItems: "flex-start" },
          right: { justifyContent: "center", alignItems: "flex-end" },
          expand: { flexGrow: 1, flexBasis: 0 },
        });
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.disabled,
              n = e.allowFontScaling,
              o = e.backImage,
              d = e.label,
              p = e.labelStyle,
              h = e.labelVisible,
              v = e.onLabelLayout,
              y = e.onPress,
              g = e.pressColor,
              b = e.pressOpacity,
              m = e.screenLayout,
              w = e.tintColor,
              O = e.titleLayout,
              S = e.truncatedLabel,
              k = void 0 === S ? "Back" : S,
              P = e.accessibilityLabel,
              M =
                void 0 === P
                  ? d && "Back" !== d
                    ? d + ", back"
                    : "Go back"
                  : P,
              x = e.testID,
              j = e.style,
              R = (0, i.useTheme)().colors,
              _ = l.useState(void 0),
              C = (0, a.default)(_, 2),
              E = C[0],
              I = C[1],
              T =
                void 0 !== w
                  ? w
                  : u.Platform.select({ ios: R.primary, default: R.text }),
              A = function (e) {
                null == v || v(e),
                  I(e.nativeEvent.layout.x + e.nativeEvent.layout.width);
              };
            return l.createElement(
              c.default,
              {
                disabled: t,
                accessible: !0,
                accessibilityRole: "button",
                accessibilityLabel: M,
                testID: x,
                onPress: t
                  ? void 0
                  : function () {
                      return y && requestAnimationFrame(y);
                    },
                pressColor: g,
                pressOpacity: b,
                android_ripple: { borderless: !0 },
                style: [f.container, t && f.disabled, j],
                hitSlop: u.Platform.select({
                  ios: void 0,
                  default: { top: 16, right: 16, bottom: 16, left: 16 },
                }),
              },
              l.createElement(
                l.Fragment,
                null,
                o
                  ? o({ tintColor: T })
                  : l.createElement(u.Image, {
                      style: [
                        f.icon,
                        Boolean(h) && f.iconWithLabel,
                        Boolean(T) && { tintColor: T },
                      ],
                      source: r(24),
                      fadeDuration: 0,
                    }),
                (function () {
                  var e =
                    !d || (E && O && m && (m.width - O.width) / 2 < E + 26)
                      ? k
                      : d;
                  if (!h || void 0 === e) return null;
                  var t = l.createElement(
                    u.View,
                    {
                      style: m
                        ? [f.labelWrapper, { minWidth: m.width / 2 - 27 }]
                        : null,
                    },
                    l.createElement(
                      u.Animated.Text,
                      {
                        accessible: !1,
                        onLayout: e === d ? A : void 0,
                        style: [f.label, T ? { color: T } : null, p],
                        numberOfLines: 1,
                        allowFontScaling: !!n,
                      },
                      e
                    )
                  );
                  return o || "ios" !== u.Platform.OS
                    ? t
                    : l.createElement(
                        s.default,
                        {
                          maskElement: l.createElement(
                            u.View,
                            { style: f.iconMaskContainer },
                            l.createElement(u.Image, {
                              source: r(25),
                              style: f.iconMask,
                            }),
                            l.createElement(u.View, {
                              style: f.iconMaskFillerRect,
                            })
                          ),
                        },
                        t
                      );
                })()
              )
            );
          });
        var o = n(r(5)),
          a = n(r(6)),
          i = r(4),
          l = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = d(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          u = r(2),
          s = n(r(70)),
          c = n(r(50));
        function d(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (d = function (e) {
            return e ? r : t;
          })(e);
        }
        var f = u.StyleSheet.create({
          container: (0, o.default)(
            {
              alignItems: "center",
              flexDirection: "row",
              minWidth: u.StyleSheet.hairlineWidth,
            },
            u.Platform.select({
              ios: null,
              default: { marginVertical: 3, marginHorizontal: 11 },
            })
          ),
          disabled: { opacity: 0.5 },
          label: { fontSize: 17, letterSpacing: 0.35 },
          labelWrapper: { flexDirection: "row", alignItems: "flex-start" },
          icon: u.Platform.select({
            ios: {
              height: 21,
              width: 13,
              marginLeft: 8,
              marginRight: 22,
              marginVertical: 12,
              resizeMode: "contain",
              transform: [
                { scaleX: u.I18nManager.getConstants().isRTL ? -1 : 1 },
              ],
            },
            default: {
              height: 24,
              width: 24,
              margin: 3,
              resizeMode: "contain",
              transform: [
                { scaleX: u.I18nManager.getConstants().isRTL ? -1 : 1 },
              ],
            },
          }),
          iconWithLabel: "ios" === u.Platform.OS ? { marginRight: 6 } : {},
          iconMaskContainer: {
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
          },
          iconMaskFillerRect: { flex: 1, backgroundColor: "#000" },
          iconMask: {
            height: 21,
            width: 13,
            marginLeft: -14.5,
            marginVertical: 12,
            alignSelf: "center",
            resizeMode: "contain",
            transform: [
              { scaleX: u.I18nManager.getConstants().isRTL ? -1 : 1 },
            ],
          },
        });
      },
      (e, t) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            return e.children;
          });
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var o = (0, n(r(23)).default)("HeaderBackContext", void 0);
        t.default = o;
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function () {
            var e = o.useContext(a.default);
            if (void 0 === e)
              throw new Error(
                "Couldn't find the header height. Are you inside a screen in a navigator with a header?"
              );
            return e;
          });
        var o = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = i(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var l = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                l && (l.get || l.set)
                  ? Object.defineProperty(n, a, l)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          a = n(r(26));
        function i(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (i = function (e) {
            return e ? r : t;
          })(e);
        }
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.color,
              r = e.size,
              a = e.style;
            return n.createElement(
              o.Text,
              { style: [i.icon, { color: t, fontSize: r }, a] },
              "⏷"
            );
          });
        var n = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = a(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var i in e)
              if (
                "default" !== i &&
                Object.prototype.hasOwnProperty.call(e, i)
              ) {
                var l = o ? Object.getOwnPropertyDescriptor(e, i) : null;
                l && (l.get || l.set)
                  ? Object.defineProperty(n, i, l)
                  : (n[i] = e[i]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          o = r(2);
        function a(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (a = function (e) {
            return e ? r : t;
          })(e);
        }
        var i = o.StyleSheet.create({
          icon: { backgroundColor: "transparent" },
        });
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.visible,
              r = e.children,
              n = e.style,
              l = (0, o.default)(e, ["visible", "children", "style"]);
            if ("web" === i.Platform.OS)
              return a.createElement(
                i.View,
                u(
                  {
                    hidden: !t,
                    style: [{ display: t ? "flex" : "none" }, s.container, n],
                    pointerEvents: t ? "auto" : "none",
                  },
                  l
                ),
                r
              );
            return a.createElement(
              i.View,
              { style: [s.container, n], pointerEvents: t ? "auto" : "none" },
              a.createElement(
                i.View,
                {
                  collapsable: !1,
                  removeClippedSubviews:
                    ("ios" !== i.Platform.OS && "macos" !== i.Platform.OS) ||
                    !t,
                  pointerEvents: t ? "auto" : "none",
                  style: t ? s.attached : s.detached,
                },
                r
              )
            );
          });
        var o = n(r(3)),
          a = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = l(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          i = r(2);
        function l(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (l = function (e) {
            return e ? r : t;
          })(e);
        }
        function u() {
          return (u = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(this, arguments);
        }
        var s = i.StyleSheet.create({
          container: { flex: 1, overflow: "hidden" },
          attached: { flex: 1 },
          detached: { flex: 1, top: 3e4 },
        });
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }), (t.default = p);
        var n = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = i(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var l = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                l && (l.get || l.set)
                  ? Object.defineProperty(n, a, l)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          o = r(2),
          a = r(8);
        function i(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (i = function (e) {
            return e ? r : t;
          })(e);
        }
        var l = o.Dimensions.get("window"),
          u = l.width,
          s = void 0 === u ? 0 : u,
          c = l.height,
          d = void 0 === c ? 0 : c,
          f =
            "web" === o.Platform.OS || null == a.initialWindowMetrics
              ? {
                  frame: { x: 0, y: 0, width: s, height: d },
                  insets: { top: 0, left: 0, right: 0, bottom: 0 },
                }
              : a.initialWindowMetrics;
        function p(e) {
          var t = e.children,
            r = e.style;
          return n.createElement(
            a.SafeAreaInsetsContext.Consumer,
            null,
            function (e) {
              return e
                ? n.createElement(o.View, { style: [h.container, r] }, t)
                : n.createElement(
                    a.SafeAreaProvider,
                    { initialMetrics: f, style: r },
                    t
                  );
            }
          );
        }
        p.initialMetrics = f;
        var h = o.StyleSheet.create({ container: { flex: 1 } });
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = (0, u.useSafeAreaFrame)(),
              r = (0, u.useSafeAreaInsets)(),
              n = i.useContext(f.default),
              p = i.useContext(d.default),
              v = e.focused,
              y = e.modal,
              g = void 0 !== y && y,
              b = e.header,
              m = e.headerShown,
              w = void 0 === m || m,
              O = e.headerTransparent,
              S = e.headerStatusBarHeight,
              k = void 0 === S ? (n ? 0 : r.top) : S,
              P = e.navigation,
              M = e.route,
              x = e.children,
              j = e.style,
              R = i.useState(function () {
                return (0, c.default)(t, g, k);
              }),
              _ = (0, o.default)(R, 2),
              C = _[0],
              E = _[1];
            return i.createElement(
              s.default,
              {
                accessibilityElementsHidden: !v,
                importantForAccessibility: v ? "auto" : "no-hide-descendants",
                style: [h.container, j],
              },
              i.createElement(
                l.View,
                { style: h.content },
                i.createElement(
                  f.default.Provider,
                  { value: n || !1 !== w },
                  i.createElement(
                    d.default.Provider,
                    { value: w ? C : null != p ? p : 0 },
                    x
                  )
                )
              ),
              w
                ? i.createElement(
                    a.NavigationContext.Provider,
                    { value: P },
                    i.createElement(
                      a.NavigationRouteContext.Provider,
                      { value: M },
                      i.createElement(
                        l.View,
                        {
                          onLayout: function (e) {
                            var t = e.nativeEvent.layout.height;
                            E(t);
                          },
                          style: O ? h.absolute : null,
                        },
                        b
                      )
                    )
                  )
                : null
            );
          });
        var o = n(r(6)),
          a = r(4),
          i = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = p(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          l = r(2),
          u = r(8),
          s = n(r(47)),
          c = n(r(21)),
          d = n(r(26)),
          f = n(r(22));
        function p(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (p = function (e) {
            return e ? r : t;
          })(e);
        }
        var h = l.StyleSheet.create({
          container: { flex: 1, flexDirection: "column-reverse" },
          content: { flex: 1 },
          absolute: { position: "absolute", top: 0, left: 0, right: 0 },
        });
      },
      (e, t) => {
        Object.defineProperty(t, "__esModule", { value: !0 });
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.mode,
              r = e.scenes,
              n = e.layout,
              c = e.getPreviousScene,
              f = e.getFocusedRoute,
              p = e.onContentHeightChange,
              h = e.style,
              v = f(),
              y = i.useContext(o.HeaderBackContext);
            return i.createElement(
              l.Animated.View,
              { pointerEvents: "box-none", style: h },
              r.slice(-3).map(function (e, r, f) {
                var h, g;
                if (("screen" === t && r !== f.length - 1) || !e) return null;
                var b = e.descriptor.options,
                  m = b.header,
                  w = b.headerMode,
                  O = b.headerShown,
                  S = void 0 === O || O,
                  k = b.headerTransparent,
                  P = b.headerStyleInterpolator;
                if (w !== t || !S) return null;
                var M = v.key === e.descriptor.route.key,
                  x = c({ route: e.descriptor.route }),
                  j = y;
                if (x) {
                  var R = x.descriptor,
                    _ = R.options,
                    C = R.route;
                  j = x ? { title: (0, o.getHeaderTitle)(_, C.name) } : y;
                }
                var E =
                    null === (h = f[r - 1]) || void 0 === h
                      ? void 0
                      : h.descriptor,
                  I =
                    null === (g = f[r + 1]) || void 0 === g
                      ? void 0
                      : g.descriptor,
                  T = (null == E ? void 0 : E.options) || {},
                  A = T.headerShown,
                  B = void 0 === A || A,
                  D = T.headerMode,
                  H = f.slice(r + 1).find(function (e) {
                    var t = (null == e ? void 0 : e.descriptor.options) || {},
                      r = t.headerShown,
                      n = void 0 === r || r,
                      o = t.headerMode;
                    return !1 === n || "screen" === o;
                  }),
                  W = ((null == H ? void 0 : H.descriptor.options) || {})
                    .gestureDirection,
                  F = ((!1 === B || "screen" === D) && !I) || H,
                  L = {
                    layout: n,
                    back: j,
                    progress: e.progress,
                    options: e.descriptor.options,
                    route: e.descriptor.route,
                    navigation: e.descriptor.navigation,
                    styleInterpolator:
                      "float" === t
                        ? F
                          ? "vertical" === W || "vertical-inverted" === W
                            ? u.forSlideUp
                            : "horizontal-inverted" === W
                            ? u.forSlideRight
                            : u.forSlideLeft
                          : P
                        : u.forNoAnimation,
                  };
                return i.createElement(
                  a.NavigationContext.Provider,
                  {
                    key: e.descriptor.route.key,
                    value: e.descriptor.navigation,
                  },
                  i.createElement(
                    a.NavigationRouteContext.Provider,
                    { value: e.descriptor.route },
                    i.createElement(
                      l.View,
                      {
                        onLayout: p
                          ? function (t) {
                              var r = t.nativeEvent.layout.height;
                              p({ route: e.descriptor.route, height: r });
                            }
                          : void 0,
                        pointerEvents: M ? "box-none" : "none",
                        accessibilityElementsHidden: !M,
                        importantForAccessibility: M
                          ? "auto"
                          : "no-hide-descendants",
                        style: ("float" === t && !M) || k ? d.header : null,
                      },
                      void 0 !== m ? m(L) : i.createElement(s.default, L)
                    )
                  )
                );
              })
            );
          });
        var o = r(7),
          a = r(4),
          i = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = c(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          l = r(2),
          u = r(20),
          s = n(r(53));
        function c(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (c = function (e) {
            return e ? r : t;
          })(e);
        }
        var d = l.StyleSheet.create({
          header: { position: "absolute", top: 0, left: 0, right: 0 },
        });
      },
      (e, t) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e, t) {
            var r;
            return function () {
              if (!r) {
                for (
                  var n = arguments.length, o = new Array(n), a = 0;
                  a < n;
                  a++
                )
                  o[a] = arguments[a];
                e.apply(this, o),
                  (r = setTimeout(function () {
                    r = void 0;
                  }, t));
              }
            };
          });
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = u.useState(void 0),
              r = (0, i.default)(t, 2),
              n = r[0],
              d = r[1],
              p = u.useState(void 0),
              h = (0, i.default)(p, 2),
              v = h[0],
              y = h[1],
              g = function (e) {
                var t = e.nativeEvent.layout,
                  r = t.height,
                  n = t.width;
                y(function (e) {
                  return e && r === e.height && n === e.width
                    ? e
                    : { height: r, width: n };
                });
              },
              b = function (e) {
                var t = e.nativeEvent.layout,
                  r = t.height,
                  o = t.width;
                (n && r === n.height && o === n.width) ||
                  d({ height: r, width: o });
              },
              m = (0, c.default)(function (e, t, r, n, o, a, i) {
                return e({
                  current: { progress: r },
                  next: n && { progress: n },
                  layouts: {
                    header: { height: i, width: t.width },
                    screen: t,
                    title: o,
                    leftLabel: a,
                  },
                });
              }),
              w = e.progress,
              O = e.layout,
              S = e.modal,
              k = e.onGoBack,
              P = e.headerTitle,
              M = e.headerLeft,
              x =
                void 0 === M
                  ? k
                    ? function (e) {
                        return u.createElement(l.HeaderBackButton, e);
                      }
                    : void 0
                  : M,
              j = e.headerRight,
              R = e.headerBackImage,
              _ = e.headerBackTitle,
              C = e.headerBackTitleVisible,
              E = void 0 === C ? "ios" === s.Platform.OS : C,
              I = e.headerTruncatedBackTitle,
              T = e.headerBackAccessibilityLabel,
              A = e.headerBackTestID,
              B = e.headerBackAllowFontScaling,
              D = e.headerBackTitleStyle,
              H = e.headerTitleContainerStyle,
              W = e.headerLeftContainerStyle,
              F = e.headerRightContainerStyle,
              L = e.headerBackgroundContainerStyle,
              V = e.headerStyle,
              G = e.headerStatusBarHeight,
              z = e.styleInterpolator,
              N = (0, a.default)(e, [
                "progress",
                "layout",
                "modal",
                "onGoBack",
                "headerTitle",
                "headerLeft",
                "headerRight",
                "headerBackImage",
                "headerBackTitle",
                "headerBackTitleVisible",
                "headerTruncatedBackTitle",
                "headerBackAccessibilityLabel",
                "headerBackTestID",
                "headerBackAllowFontScaling",
                "headerBackTitleStyle",
                "headerTitleContainerStyle",
                "headerLeftContainerStyle",
                "headerRightContainerStyle",
                "headerBackgroundContainerStyle",
                "headerStyle",
                "headerStatusBarHeight",
                "styleInterpolator",
              ]),
              K = (0, l.getDefaultHeaderHeight)(O, S, G),
              q = s.StyleSheet.flatten(V || {}).height,
              U = void 0 === q ? K : q,
              X = m(
                z,
                O,
                w.current,
                w.next,
                v,
                _ ? n : void 0,
                "number" == typeof U ? U : K
              ),
              Y = X.titleStyle,
              $ = X.leftButtonStyle,
              J = X.leftLabelStyle,
              Q = X.rightButtonStyle,
              Z = X.backgroundStyle,
              ee = x
                ? function (e) {
                    return x(
                      (0, o.default)({}, e, {
                        backImage: R,
                        accessibilityLabel: T,
                        testID: A,
                        allowFontScaling: B,
                        onPress: k,
                        label: _,
                        truncatedLabel: I,
                        labelStyle: [J, D],
                        onLabelLayout: b,
                        screenLayout: O,
                        titleLayout: v,
                        canGoBack: Boolean(k),
                      })
                    );
                  }
                : void 0,
              te = j
                ? function (e) {
                    return j((0, o.default)({}, e, { canGoBack: Boolean(k) }));
                  }
                : void 0,
              re =
                "function" != typeof P
                  ? function (e) {
                      return u.createElement(
                        l.HeaderTitle,
                        f({}, e, { onLayout: g })
                      );
                    }
                  : function (e) {
                      return P((0, o.default)({}, e, { onLayout: g }));
                    };
            return u.createElement(
              l.Header,
              f(
                {
                  modal: S,
                  layout: O,
                  headerTitle: re,
                  headerLeft: ee,
                  headerLeftLabelVisible: E,
                  headerRight: te,
                  headerTitleContainerStyle: [Y, H],
                  headerLeftContainerStyle: [$, W],
                  headerRightContainerStyle: [Q, F],
                  headerBackgroundContainerStyle: [Z, L],
                  headerStyle: V,
                  headerStatusBarHeight: G,
                },
                N
              )
            );
          });
        var o = n(r(5)),
          a = n(r(3)),
          i = n(r(6)),
          l = r(7),
          u = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = d(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          s = r(2),
          c = n(r(54));
        function d(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (d = function (e) {
            return e ? r : t;
          })(e);
        }
        function f() {
          return (f = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(this, arguments);
        }
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var o = n(r(42)),
          a = n(r(5)),
          i = n(r(11)),
          l = n(r(12)),
          u = n(r(13)),
          s = n(r(14)),
          c = n(r(10)),
          d = r(7),
          f = n(r(28)),
          p = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = S(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          h = r(2),
          v = r(15),
          y = r(43),
          g = n(r(82)),
          b = n(r(60)),
          m = r(83),
          w = r(62),
          O = n(r(87));
        function S(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (S = function (e) {
            return e ? r : t;
          })(e);
        }
        function k(e) {
          var t = (function () {
            if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
            if (Reflect.construct.sham) return !1;
            if ("function" == typeof Proxy) return !0;
            try {
              return (
                Boolean.prototype.valueOf.call(
                  Reflect.construct(Boolean, [], function () {})
                ),
                !0
              );
            } catch (e) {
              return !1;
            }
          })();
          return function () {
            var r,
              n = (0, c.default)(e);
            if (t) {
              var o = (0, c.default)(this).constructor;
              r = Reflect.construct(n, arguments, o);
            } else r = n.apply(this, arguments);
            return (0, s.default)(this, r);
          };
        }
        var P = Object.freeze({ options: {} }),
          M = function (e, t) {
            for (
              var r = e[t].descriptor.options.cardStyleInterpolator,
                n = 0,
                o = t - 1;
              o >= 0;
              o--
            ) {
              var a;
              if (
                (null === (a = e[o]) || void 0 === a
                  ? void 0
                  : a.descriptor.options.cardStyleInterpolator) !== r
              )
                break;
              n++;
            }
            return n;
          },
          x = function (e, t, r) {
            if (r) return !0;
            var n = e.descriptor.options.cardStyleInterpolator;
            return (0, w.getIsModalPresentation)(n) && 0 !== t;
          },
          j = function (e, t, r, n, o, a) {
            return e.reduce(function (i, l, u) {
              var s = l.descriptor.options,
                c = s.headerStatusBarHeight,
                f = void 0 === c ? (r ? 0 : t.top) : c,
                p = s.headerStyle,
                v = h.StyleSheet.flatten(p || {}),
                y =
                  "height" in v && "number" == typeof v.height
                    ? v.height
                    : a[l.route.key],
                g = M(e, u),
                b = x(l, g, n);
              return (
                (i[l.route.key] =
                  "number" == typeof y
                    ? y
                    : (0, d.getDefaultHeaderHeight)(o, b, f)),
                i
              );
            }, {});
          },
          R = function (e, t) {
            var r = (null == t ? void 0 : t.options) || {},
              n = r.presentation,
              o = r.gestureDirection,
              a =
                void 0 === o
                  ? "modal" === n
                    ? y.ModalTransition.gestureDirection
                    : y.DefaultTransition.gestureDirection
                  : o;
            return (0, b.default)(e, a);
          },
          _ = function (e, t, r) {
            var n = R(
              { width: Math.max(1, t.width), height: Math.max(1, t.height) },
              r
            );
            return n > 0
              ? e.interpolate({ inputRange: [0, n], outputRange: [1, 0] })
              : e.interpolate({ inputRange: [n, 0], outputRange: [0, 1] });
          },
          C = (function (e) {
            (0, u.default)(r, e);
            var t = k(r);
            function r(e) {
              var n;
              return (
                (0, i.default)(this, r),
                ((n = t.call(this, e)).handleLayout = function (e) {
                  var t = e.nativeEvent.layout,
                    r = t.height,
                    o = t.width,
                    a = { width: o, height: r };
                  n.setState(function (e, t) {
                    return r === e.layout.height && o === e.layout.width
                      ? null
                      : {
                          layout: a,
                          headerHeights: j(
                            e.scenes,
                            t.insets,
                            t.isParentHeaderShown,
                            t.isParentModal,
                            a,
                            e.headerHeights
                          ),
                        };
                  });
                }),
                (n.handleHeaderLayout = function (e) {
                  var t = e.route,
                    r = e.height;
                  n.setState(function (e) {
                    var n = e.headerHeights;
                    return n[t.key] === r
                      ? null
                      : {
                          headerHeights: (0, a.default)(
                            {},
                            n,
                            (0, o.default)({}, t.key, r)
                          ),
                        };
                  });
                }),
                (n.getFocusedRoute = function () {
                  var e = n.props.state;
                  return e.routes[e.index];
                }),
                (n.getPreviousScene = function (e) {
                  var t = e.route,
                    r = n.props.getPreviousRoute,
                    o = n.state.scenes,
                    a = r({ route: t });
                  if (a)
                    return o.find(function (e) {
                      return e.descriptor.route.key === a.key;
                    });
                }),
                (n.state = {
                  routes: [],
                  scenes: [],
                  gestures: {},
                  layout: d.SafeAreaProviderCompat.initialMetrics.frame,
                  descriptors: n.props.descriptors,
                  headerHeights: {},
                }),
                n
              );
            }
            return (
              (0, l.default)(
                r,
                [
                  {
                    key: "render",
                    value: function () {
                      for (
                        var e = this,
                          t = this.props,
                          r = t.insets,
                          n = t.state,
                          o = t.routes,
                          a = t.closingRouteKeys,
                          i = t.onOpenRoute,
                          l = t.onCloseRoute,
                          u = t.renderHeader,
                          s = t.renderScene,
                          c = t.isParentHeaderShown,
                          y = t.isParentModal,
                          b = t.onTransitionStart,
                          S = t.onTransitionEnd,
                          k = t.onGestureStart,
                          P = t.onGestureEnd,
                          j = t.onGestureCancel,
                          R = t.detachInactiveScreens,
                          _ =
                            void 0 === R
                              ? "web" === h.Platform.OS ||
                                "android" === h.Platform.OS ||
                                "ios" === h.Platform.OS
                              : R,
                          C = this.state,
                          I = C.scenes,
                          T = C.layout,
                          A = C.gestures,
                          B = C.headerHeights,
                          D = n.routes[n.index],
                          H = B[D.key],
                          W = this.state.scenes.slice(-2).some(function (e) {
                            var t,
                              r = null != (t = e.descriptor.options) ? t : {},
                              n = r.headerMode,
                              o = r.headerTransparent,
                              a = r.headerShown;
                            return !(
                              !o &&
                              !1 !== (void 0 === a || a) &&
                              "screen" !== n
                            );
                          }),
                          F = 1,
                          L = I.length - 1;
                        L >= 0;
                        L--
                      ) {
                        var V = I[L].descriptor.options,
                          G = V.detachPreviousScreen;
                        if (
                          !1 ===
                          (void 0 === G
                            ? "transparentModal" !== V.presentation &&
                              (!(0, w.getIsModalPresentation)(
                                V.cardStyleInterpolator
                              ) ||
                                L !==
                                  (0, g.default)(I, function (e) {
                                    var t =
                                      e.descriptor.options
                                        .cardStyleInterpolator;
                                    return (
                                      t === v.forModalPresentationIOS ||
                                      "forModalPresentationIOS" ===
                                        (null == t ? void 0 : t.name)
                                    );
                                  }))
                            : G)
                        )
                          F++;
                        else if (L <= I.length - 2) break;
                      }
                      var z = p.createElement(
                        p.Fragment,
                        { key: "header" },
                        u({
                          mode: "float",
                          layout: T,
                          scenes: I,
                          getPreviousScene: this.getPreviousScene,
                          getFocusedRoute: this.getFocusedRoute,
                          onContentHeightChange: this.handleHeaderLayout,
                          style: [E.floating, W && [{ height: H }, E.absolute]],
                        })
                      );
                      return p.createElement(
                        d.Background,
                        null,
                        W ? null : z,
                        p.createElement(
                          m.MaybeScreenContainer,
                          {
                            enabled: _,
                            style: E.container,
                            onLayout: this.handleLayout,
                          },
                          o.map(function (t, n, o) {
                            var d,
                              v,
                              g = D.key === t.key,
                              w = A[t.key],
                              R = I[n],
                              C = 1;
                            if (n < o.length - F - 1) C = 0;
                            else {
                              var E = I[o.length - 1],
                                H =
                                  n === o.length - 1
                                    ? 2
                                    : n >= o.length - F
                                    ? 1
                                    : 0;
                              C = E
                                ? E.progress.current.interpolate({
                                    inputRange: [0, 0.99999, 1],
                                    outputRange: [1, 1, H],
                                    extrapolate: "clamp",
                                  })
                                : 1;
                            }
                            var L,
                              V = R.descriptor.options,
                              G = V.headerShown,
                              z = void 0 === G || G,
                              N = V.headerTransparent,
                              K = V.headerStyle,
                              q = V.headerTintColor,
                              U = V.freezeOnBlur,
                              X = r.top,
                              Y = r.right,
                              $ = r.bottom,
                              J = r.left,
                              Q = !1 !== z ? B[t.key] : 0;
                            if (z)
                              if ("string" == typeof q)
                                L = (0, f.default)(q).isDark();
                              else {
                                var Z = h.StyleSheet.flatten(K);
                                Z &&
                                  "backgroundColor" in Z &&
                                  "string" == typeof Z.backgroundColor &&
                                  (L = !(0, f.default)(
                                    Z.backgroundColor
                                  ).isDark());
                              }
                            var ee = M(I, n),
                              te = x(R, ee, y),
                              re =
                                "transparentModal" ===
                                (null === (d = I[n + 1]) || void 0 === d
                                  ? void 0
                                  : d.descriptor.options.presentation),
                              ne =
                                !1 !==
                                (null === (v = I[n + 1]) || void 0 === v
                                  ? void 0
                                  : v.descriptor.options.detachPreviousScreen);
                            return p.createElement(
                              m.MaybeScreen,
                              {
                                key: t.key,
                                style: h.StyleSheet.absoluteFill,
                                enabled: _,
                                active: C,
                                freezeOnBlur: U,
                                pointerEvents: "box-none",
                              },
                              p.createElement(O.default, {
                                index: n,
                                interpolationIndex: ee,
                                modal: te,
                                active: n === o.length - 1,
                                focused: g,
                                closing: a.includes(t.key),
                                layout: T,
                                gesture: w,
                                scene: R,
                                safeAreaInsetTop: X,
                                safeAreaInsetRight: Y,
                                safeAreaInsetBottom: $,
                                safeAreaInsetLeft: J,
                                onGestureStart: k,
                                onGestureCancel: j,
                                onGestureEnd: P,
                                headerHeight: Q,
                                isParentHeaderShown: c,
                                onHeaderHeightChange: e.handleHeaderLayout,
                                getPreviousScene: e.getPreviousScene,
                                getFocusedRoute: e.getFocusedRoute,
                                headerDarkContent: L,
                                hasAbsoluteFloatHeader: W && !N,
                                renderHeader: u,
                                renderScene: s,
                                onOpenRoute: i,
                                onCloseRoute: l,
                                onTransitionStart: b,
                                onTransitionEnd: S,
                                isNextScreenTransparent: re,
                                detachCurrentScreen: ne,
                              })
                            );
                          })
                        ),
                        W ? z : null
                      );
                    },
                  },
                ],
                [
                  {
                    key: "getDerivedStateFromProps",
                    value: function (e, t) {
                      if (
                        e.routes === t.routes &&
                        e.descriptors === t.descriptors
                      )
                        return null;
                      var r = e.routes.reduce(function (r, n) {
                          var o = e.descriptors[n.key],
                            a = ((null == o ? void 0 : o.options) || {})
                              .animationEnabled;
                          return (
                            (r[n.key] =
                              t.gestures[n.key] ||
                              new h.Animated.Value(
                                e.openingRouteKeys.includes(n.key) && !1 !== a
                                  ? R(t.layout, o)
                                  : 0
                              )),
                            r
                          );
                        }, {}),
                        n = e.routes.map(function (n, o, i) {
                          var l,
                            u = i[o - 1],
                            s = i[o + 1],
                            c = t.scenes[o],
                            d = r[n.key],
                            f = u ? r[u.key] : void 0,
                            p = s ? r[s.key] : void 0,
                            g =
                              e.descriptors[n.key] ||
                              t.descriptors[n.key] ||
                              (c ? c.descriptor : P),
                            b =
                              e.descriptors[null == s ? void 0 : s.key] ||
                              t.descriptors[null == s ? void 0 : s.key],
                            m =
                              e.descriptors[null == u ? void 0 : u.key] ||
                              t.descriptors[null == u ? void 0 : u.key],
                            O =
                              o !== i.length - 1 &&
                              b &&
                              "transparentModal" !== b.options.presentation
                                ? b.options
                                : g.options,
                            S =
                              "modal" === O.presentation
                                ? y.ModalTransition
                                : "transparentModal" === O.presentation
                                ? y.ModalFadeTransition
                                : y.DefaultTransition,
                            k = O.animationEnabled,
                            M =
                              void 0 === k
                                ? "web" !== h.Platform.OS &&
                                  "windows" !== h.Platform.OS &&
                                  "macos" !== h.Platform.OS
                                : k,
                            x = O.gestureEnabled,
                            j = void 0 === x ? "ios" === h.Platform.OS && M : x,
                            R = O.gestureDirection,
                            C = void 0 === R ? S.gestureDirection : R,
                            E = O.transitionSpec,
                            I = void 0 === E ? S.transitionSpec : E,
                            T = O.cardStyleInterpolator,
                            A =
                              void 0 === T
                                ? !1 === M
                                  ? v.forNoAnimation
                                  : S.cardStyleInterpolator
                                : T,
                            B = O.headerStyleInterpolator,
                            D = void 0 === B ? S.headerStyleInterpolator : B,
                            H = O.cardOverlayEnabled,
                            W =
                              void 0 === H
                                ? ("ios" !== h.Platform.OS &&
                                    "transparentModal" !== O.presentation) ||
                                  (0, w.getIsModalPresentation)(A)
                                : H,
                            F =
                              null != (l = g.options.headerMode)
                                ? l
                                : "modal" === O.presentation ||
                                  "transparentModal" === O.presentation ||
                                  "modal" ===
                                    (null == b
                                      ? void 0
                                      : b.options.presentation) ||
                                  "transparentModal" ===
                                    (null == b
                                      ? void 0
                                      : b.options.presentation) ||
                                  (0, w.getIsModalPresentation)(A) ||
                                  "ios" !== h.Platform.OS ||
                                  void 0 !== g.options.header
                                ? "screen"
                                : "float",
                            L = {
                              route: n,
                              descriptor: (0, a.default)({}, g, {
                                options: (0, a.default)({}, g.options, {
                                  animationEnabled: M,
                                  cardOverlayEnabled: W,
                                  cardStyleInterpolator: A,
                                  gestureDirection: C,
                                  gestureEnabled: j,
                                  headerStyleInterpolator: D,
                                  transitionSpec: I,
                                  headerMode: F,
                                }),
                              }),
                              progress: {
                                current: _(d, t.layout, g),
                                next:
                                  p &&
                                  "transparentModal" !==
                                    (null == b
                                      ? void 0
                                      : b.options.presentation)
                                    ? _(p, t.layout, b)
                                    : void 0,
                                previous: f ? _(f, t.layout, m) : void 0,
                              },
                              __memo: [t.layout, g, b, m, d, p, f],
                            };
                          return c &&
                            L.__memo.every(function (e, t) {
                              return c.__memo[t] === e;
                            })
                            ? c
                            : L;
                        });
                      return {
                        routes: e.routes,
                        scenes: n,
                        gestures: r,
                        descriptors: e.descriptors,
                        headerHeights: j(
                          n,
                          e.insets,
                          e.isParentHeaderShown,
                          e.isParentModal,
                          t.layout,
                          t.headerHeights
                        ),
                      };
                    },
                  },
                ]
              ),
              r
            );
          })(p.Component);
        t.default = C;
        var E = h.StyleSheet.create({
          container: { flex: 1 },
          absolute: { position: "absolute", top: 0, left: 0, right: 0 },
          floating: { zIndex: 1 },
        });
      },
      (e, t) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e, t) {
            for (var r = e.length - 1; r >= 0; r--) if (t(e[r])) return r;
            return -1;
          });
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.MaybeScreen = t.MaybeScreenContainer = void 0);
        var o,
          a = n(r(3)),
          i = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = u(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          l = r(2);
        function u(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (u = function (e) {
            return e ? r : t;
          })(e);
        }
        function s() {
          return (s = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(this, arguments);
        }
        try {
          o = r(84);
        } catch (e) {}
        t.MaybeScreenContainer = function (e) {
          var t = e.enabled,
            r = (0, a.default)(e, ["enabled"]);
          return null != o
            ? i.createElement(o.ScreenContainer, s({ enabled: t }, r))
            : i.createElement(l.View, r);
        };
        t.MaybeScreen = function (e) {
          var t = e.enabled,
            r = e.active,
            n = (0, a.default)(e, ["enabled", "active"]);
          return null != o
            ? i.createElement(o.Screen, s({ enabled: t, activityState: r }, n))
            : i.createElement(l.View, n);
        };
      },
      (e) => {
        "use strict";
        e.exports = require("react-native-screens");
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t,
              r,
              n = e.dark,
              u = e.layout,
              s = e.insets,
              c = e.style,
              d = (0, a.useTheme)().dark,
              f = i.useState(!0),
              p = (0, o.default)(f, 2),
              h = p[0],
              v = p[1],
              y = 1 - 20 / u.width,
              g = (s.top - 34) * y,
              b = l.StyleSheet.flatten(c),
              m =
                null == b ||
                null === (t = b.transform) ||
                void 0 === t ||
                null ===
                  (r = t.find(function (e) {
                    return void 0 !== e.translateY;
                  })) ||
                void 0 === r
                  ? void 0
                  : r.translateY;
            i.useEffect(
              function () {
                var e =
                  null == m
                    ? void 0
                    : m.addListener(function (e) {
                        var t = e.value;
                        v(t < g);
                      });
                return function () {
                  return null == m ? void 0 : m.removeListener(e);
                };
              },
              [g, m]
            );
            var w = null != n ? n : !d;
            return i.createElement(l.StatusBar, {
              animated: !0,
              barStyle: h && w ? "dark-content" : "light-content",
            });
          });
        var o = n(r(6)),
          a = r(4),
          i = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = u(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          l = r(2);
        function u(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (u = function (e) {
            return e ? r : t;
          })(e);
        }
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var o = n(r(6)),
          a = n(r(3)),
          i = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = u(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          l = r(2);
        function u(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (u = function (e) {
            return e ? r : t;
          })(e);
        }
        function s() {
          return (s = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(this, arguments);
        }
        var c = i.forwardRef(function (e, t) {
          var r = e.enabled,
            n = e.layout,
            u = e.style,
            c = (0, a.default)(e, ["enabled", "layout", "style"]),
            f = i.useState(!1),
            p = (0, o.default)(f, 2),
            h = p[0],
            v = p[1],
            y = i.useState("auto"),
            g = (0, o.default)(y, 2),
            b = g[0],
            m = g[1];
          return (
            i.useImperativeHandle(t, function () {
              return { setPointerEvents: m };
            }),
            i.useEffect(
              function () {
                if ("undefined" != typeof document && document.body) {
                  var e = document.body.clientWidth,
                    t = document.body.clientHeight;
                  v(e === n.width && t === n.height);
                }
              },
              [n.height, n.width]
            ),
            i.createElement(
              l.View,
              s({}, c, {
                pointerEvents: b,
                style: [r && h ? d.page : d.card, u],
              })
            )
          );
        });
        t.default = c;
        var d = l.StyleSheet.create({
          page: { minHeight: "100%" },
          card: { flex: 1, overflow: "hidden" },
        });
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var o = n(r(6)),
          a = r(7),
          i = r(4),
          l = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = f(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, a, i)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          u = r(2),
          s = n(r(27)),
          c = n(r(88)),
          d = n(r(62));
        function f(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (f = function (e) {
            return e ? r : t;
          })(e);
        }
        var p = l.memo(function (e) {
          var t = e.interpolationIndex,
            r = e.index,
            n = e.active,
            f = e.closing,
            p = e.gesture,
            v = e.focused,
            y = e.modal,
            g = e.getPreviousScene,
            b = e.getFocusedRoute,
            m = e.headerDarkContent,
            w = e.hasAbsoluteFloatHeader,
            O = e.headerHeight,
            S = e.onHeaderHeightChange,
            k = e.isParentHeaderShown,
            P = e.isNextScreenTransparent,
            M = e.detachCurrentScreen,
            x = e.layout,
            j = e.onCloseRoute,
            R = e.onOpenRoute,
            _ = e.onGestureCancel,
            C = e.onGestureEnd,
            E = e.onGestureStart,
            I = e.onTransitionEnd,
            T = e.onTransitionStart,
            A = e.renderHeader,
            B = e.renderScene,
            D = e.safeAreaInsetBottom,
            H = e.safeAreaInsetLeft,
            W = e.safeAreaInsetRight,
            F = e.safeAreaInsetTop,
            L = e.scene,
            V = l.useContext(a.HeaderHeightContext),
            G = (0, c.default)(
              l.useCallback(
                function () {
                  var e = L.descriptor,
                    t = e.options;
                  return (
                    e.navigation.isFocused() && !1 !== t.keyboardHandlingEnabled
                  );
                },
                [L.descriptor]
              )
            ),
            z = G.onPageChangeStart,
            N = G.onPageChangeCancel,
            K = G.onPageChangeConfirm,
            q = { top: F, right: W, bottom: D, left: H },
            U = (0, i.useTheme)().colors,
            X = l.useState("box-none"),
            Y = (0, o.default)(X, 2),
            $ = Y[0],
            J = Y[1];
          l.useEffect(
            function () {
              var e,
                t,
                r =
                  null === (e = L.progress.next) ||
                  void 0 === e ||
                  null === (t = e.addListener) ||
                  void 0 === t
                    ? void 0
                    : t.call(e, function (e) {
                        var t = e.value;
                        J(t <= 0.1 ? "box-none" : "none");
                      });
              return function () {
                var e, t;
                r &&
                  (null === (e = L.progress.next) ||
                    void 0 === e ||
                    null === (t = e.removeListener) ||
                    void 0 === t ||
                    t.call(e, r));
              };
            },
            [$, L.progress.next]
          );
          var Q,
            Z = L.descriptor.options,
            ee = Z.presentation,
            te = Z.animationEnabled,
            re = Z.cardOverlay,
            ne = Z.cardOverlayEnabled,
            oe = Z.cardShadowEnabled,
            ae = Z.cardStyle,
            ie = Z.cardStyleInterpolator,
            le = Z.gestureDirection,
            ue = Z.gestureEnabled,
            se = Z.gestureResponseDistance,
            ce = Z.gestureVelocityImpact,
            de = Z.headerMode,
            fe = Z.headerShown,
            pe = Z.transitionSpec,
            he = g({ route: L.descriptor.route });
          if (he) {
            var ve = he.descriptor,
              ye = ve.options,
              ge = ve.route;
            Q = (0, a.getHeaderTitle)(ye, ge.name);
          }
          var be = l.useMemo(
            function () {
              return void 0 !== Q ? { title: Q } : void 0;
            },
            [Q]
          );
          return l.createElement(
            d.default,
            {
              interpolationIndex: t,
              gestureDirection: le,
              layout: x,
              insets: q,
              gesture: p,
              current: L.progress.current,
              next: L.progress.next,
              closing: f,
              onOpen: function () {
                var e = L.descriptor.route;
                I({ route: e }, !1), R({ route: e });
              },
              onClose: function () {
                var e = L.descriptor.route;
                I({ route: e }, !0), j({ route: e });
              },
              overlay: re,
              overlayEnabled: ne,
              shadowEnabled: oe,
              onTransition: function (e) {
                var t = e.closing,
                  r = e.gesture,
                  o = L.descriptor.route;
                r
                  ? n && t
                    ? null == K || K(!1)
                    : null == N || N()
                  : null == K || K(!0),
                  null == T || T({ route: o }, t);
              },
              onGestureBegin: function () {
                var e = L.descriptor.route;
                z(), E({ route: e });
              },
              onGestureCanceled: function () {
                var e = L.descriptor.route;
                N(), _({ route: e });
              },
              onGestureEnd: function () {
                var e = L.descriptor.route;
                C({ route: e });
              },
              gestureEnabled: 0 !== r && ue,
              gestureResponseDistance: se,
              gestureVelocityImpact: ce,
              transitionSpec: pe,
              styleInterpolator: ie,
              accessibilityElementsHidden: !v,
              importantForAccessibility: v ? "auto" : "no-hide-descendants",
              pointerEvents: n ? "box-none" : $,
              pageOverflowEnabled: "float" !== de && "modal" !== ee,
              headerDarkContent: m,
              containerStyle: w && "screen" !== de ? { marginTop: O } : null,
              contentStyle: [
                {
                  backgroundColor:
                    "transparentModal" === ee ? "transparent" : U.background,
                },
                ae,
              ],
              style: [
                {
                  overflow: n ? void 0 : "hidden",
                  display:
                    !1 !== te || !1 !== P || !1 === M || v ? "flex" : "none",
                },
                u.StyleSheet.absoluteFill,
              ],
            },
            l.createElement(
              u.View,
              { style: h.container },
              l.createElement(
                s.default.Provider,
                { value: y },
                l.createElement(
                  u.View,
                  { style: h.scene },
                  l.createElement(
                    a.HeaderBackContext.Provider,
                    { value: be },
                    l.createElement(
                      a.HeaderShownContext.Provider,
                      { value: k || !1 !== fe },
                      l.createElement(
                        a.HeaderHeightContext.Provider,
                        { value: fe ? O : null != V ? V : 0 },
                        B({ route: L.descriptor.route })
                      )
                    )
                  )
                ),
                "float" !== de
                  ? A({
                      mode: "screen",
                      layout: x,
                      scenes: [he, L],
                      getPreviousScene: g,
                      getFocusedRoute: b,
                      onContentHeightChange: S,
                    })
                  : null
              )
            )
          );
        });
        t.default = p;
        var h = u.StyleSheet.create({
          container: { flex: 1, flexDirection: "column-reverse" },
          scene: { flex: 1 },
        });
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = n.useRef(void 0),
              r = n.useRef(0),
              a = n.useRef(),
              i = n.useCallback(function () {
                void 0 !== a.current &&
                  (clearTimeout(a.current), (a.current = void 0));
              }, []),
              l = n.useCallback(
                function () {
                  if (e()) {
                    i();
                    var n = o.TextInput.State.currentlyFocusedInput();
                    null == n || n.blur(),
                      (t.current = n),
                      (r.current = Date.now());
                  }
                },
                [i, e]
              ),
              u = n.useCallback(
                function (r) {
                  if (e()) {
                    if ((i(), r)) o.Keyboard.dismiss();
                    else {
                      var n = t.current;
                      null == n || n.blur();
                    }
                    t.current = void 0;
                  }
                },
                [i, e]
              ),
              s = n.useCallback(
                function () {
                  if (e()) {
                    i();
                    var n = t.current;
                    n &&
                      (Date.now() - r.current < 100
                        ? (a.current = setTimeout(function () {
                            null == n || n.focus(), (t.current = void 0);
                          }, 100))
                        : (null == n || n.focus(), (t.current = void 0)));
                  }
                },
                [i, e]
              );
            return (
              n.useEffect(
                function () {
                  return function () {
                    return i();
                  };
                },
                [i]
              ),
              {
                onPageChangeStart: l,
                onPageChangeConfirm: u,
                onPageChangeCancel: s,
              }
            );
          });
        var n = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = a(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var i in e)
              if (
                "default" !== i &&
                Object.prototype.hasOwnProperty.call(e, i)
              ) {
                var l = o ? Object.getOwnPropertyDescriptor(e, i) : null;
                l && (l.get || l.set)
                  ? Object.defineProperty(n, i, l)
                  : (n[i] = e[i]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          o = r(2);
        function a(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (a = function (e) {
            return e ? r : t;
          })(e);
        }
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function () {
            var e = o.useContext(a.default);
            if (void 0 === e)
              throw new Error(
                "Couldn't find values for card animation. Are you inside a screen in Stack?"
              );
            return e;
          });
        var o = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = i(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var l = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                l && (l.get || l.set)
                  ? Object.defineProperty(n, a, l)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          a = n(r(31));
        function i(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (i = function (e) {
            return e ? r : t;
          })(e);
        }
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function () {
            var e = o.useContext(a.default);
            if (void 0 === e)
              throw new Error(
                "Couldn't find a ref for gesture handler. Are you inside a screen in Stack?"
              );
            return e;
          });
        var o = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = i(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var a in e)
              if (
                "default" !== a &&
                Object.prototype.hasOwnProperty.call(e, a)
              ) {
                var l = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                l && (l.get || l.set)
                  ? Object.defineProperty(n, a, l)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          a = n(r(63));
        function i(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (i = function (e) {
            return e ? r : t;
          })(e);
        }
      },
    ],
    t = {};
  function r(n) {
    var o = t[n];
    if (void 0 !== o) return o.exports;
    var a = (t[n] = { exports: {} });
    return e[n](a, a.exports, r), a.exports;
  }
  (r.g = (function () {
    if ("object" == typeof globalThis) return globalThis;
    try {
      return this || new Function("return this")();
    } catch (e) {
      if ("object" == typeof window) return window;
    }
  })()),
    (r.p =
      "https://d37p21p3n8r8ug.cloudfront.net/snackager-1%2F%40react-navigation~stack%406.3.16-web");
  var n = {};
  (() => {
    var e = n,
      t = r(0);
    Object.defineProperty(e, "__esModule", { value: !0 }),
      Object.defineProperty(e, "createStackNavigator", {
        enumerable: !0,
        get: function () {
          return u.default;
        },
      }),
      Object.defineProperty(e, "Header", {
        enumerable: !0,
        get: function () {
          return s.default;
        },
      }),
      Object.defineProperty(e, "StackView", {
        enumerable: !0,
        get: function () {
          return c.default;
        },
      }),
      Object.defineProperty(e, "CardAnimationContext", {
        enumerable: !0,
        get: function () {
          return d.default;
        },
      }),
      Object.defineProperty(e, "GestureHandlerRefContext", {
        enumerable: !0,
        get: function () {
          return f.default;
        },
      }),
      Object.defineProperty(e, "useCardAnimation", {
        enumerable: !0,
        get: function () {
          return p.default;
        },
      }),
      Object.defineProperty(e, "useGestureHandlerRef", {
        enumerable: !0,
        get: function () {
          return h.default;
        },
      }),
      (e.TransitionSpecs =
        e.TransitionPresets =
        e.HeaderStyleInterpolators =
        e.CardStyleInterpolators =
          void 0);
    var o = y(r(15));
    e.CardStyleInterpolators = o;
    var a = y(r(20));
    e.HeaderStyleInterpolators = a;
    var i = y(r(43));
    e.TransitionPresets = i;
    var l = y(r(44));
    e.TransitionSpecs = l;
    var u = t(r(66)),
      s = t(r(53)),
      c = t(r(46)),
      d = t(r(31)),
      f = t(r(63)),
      p = t(r(89)),
      h = t(r(90));
    function v(e) {
      if ("function" != typeof WeakMap) return null;
      var t = new WeakMap(),
        r = new WeakMap();
      return (v = function (e) {
        return e ? r : t;
      })(e);
    }
    function y(e, t) {
      if (!t && e && e.__esModule) return e;
      if (null === e || ("object" != typeof e && "function" != typeof e))
        return { default: e };
      var r = v(t);
      if (r && r.has(e)) return r.get(e);
      var n = {},
        o = Object.defineProperty && Object.getOwnPropertyDescriptor;
      for (var a in e)
        if ("default" !== a && Object.prototype.hasOwnProperty.call(e, a)) {
          var i = o ? Object.getOwnPropertyDescriptor(e, a) : null;
          i && (i.get || i.set)
            ? Object.defineProperty(n, a, i)
            : (n[a] = e[a]);
        }
      return (n.default = e), r && r.set(e, n), n;
    }
  })(),
    (exports["@react-navigation/stack"] = n);
})();
