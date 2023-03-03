(() => {
  var e = [
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
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 });
        var o = {
          enableScreens: !0,
          screensEnabled: !0,
          enableFreeze: !0,
          NativeScreen: !0,
          Screen: !0,
          InnerScreen: !0,
          ScreenContext: !0,
          ScreenContainer: !0,
          NativeScreenContainer: !0,
          NativeScreenNavigationContainer: !0,
          ScreenStack: !0,
          FullWindowOverlay: !0,
          ScreenStackHeaderBackButtonImage: !0,
          ScreenStackHeaderRightView: !0,
          ScreenStackHeaderLeftView: !0,
          ScreenStackHeaderCenterView: !0,
          ScreenStackHeaderSearchBarView: !0,
          ScreenStackHeaderConfig: !0,
          SearchBar: !0,
          ScreenStackHeaderSubview: !0,
          shouldUseActivityState: !0,
          useTransitionProgress: !0,
          isSearchBarAvailableForCurrentPlatform: !0,
          executeNativeBackPress: !0,
        };
        (t.enableScreens = function () {
          var e =
            !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0];
          x = e;
        }),
          (t.screensEnabled = function () {
            return x;
          }),
          (t.enableFreeze = function () {}),
          Object.defineProperty(t, "useTransitionProgress", {
            enumerable: !0,
            get: function () {
              return v.default;
            },
          }),
          Object.defineProperty(t, "isSearchBarAvailableForCurrentPlatform", {
            enumerable: !0,
            get: function () {
              return S.isSearchBarAvailableForCurrentPlatform;
            },
          }),
          Object.defineProperty(t, "executeNativeBackPress", {
            enumerable: !0,
            get: function () {
              return S.executeNativeBackPress;
            },
          }),
          (t.shouldUseActivityState =
            t.ScreenStackHeaderSubview =
            t.SearchBar =
            t.ScreenStackHeaderConfig =
            t.ScreenStackHeaderSearchBarView =
            t.ScreenStackHeaderCenterView =
            t.ScreenStackHeaderLeftView =
            t.ScreenStackHeaderRightView =
            t.ScreenStackHeaderBackButtonImage =
            t.FullWindowOverlay =
            t.ScreenStack =
            t.NativeScreenNavigationContainer =
            t.NativeScreenContainer =
            t.ScreenContainer =
            t.ScreenContext =
            t.InnerScreen =
            t.Screen =
            t.NativeScreen =
              void 0);
        var a = n(r(6)),
          i = n(r(8)),
          u = n(r(9)),
          c = n(r(12)),
          l = n(r(13)),
          f = n(r(4)),
          s = n(r(2)),
          p = r(15),
          d = r(16);
        Object.keys(d).forEach(function (e) {
          "default" !== e &&
            "__esModule" !== e &&
            (Object.prototype.hasOwnProperty.call(o, e) ||
              (e in t && t[e] === d[e]) ||
              Object.defineProperty(t, e, {
                enumerable: !0,
                get: function () {
                  return d[e];
                },
              }));
        });
        var v = n(r(17)),
          S = r(19);
        function y(e) {
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
              n = (0, f.default)(e);
            if (t) {
              var o = (0, f.default)(this).constructor;
              r = Reflect.construct(n, arguments, o);
            } else r = n.apply(this, arguments);
            return (0, l.default)(this, r);
          };
        }
        function b() {
          return (b =
            Object.assign ||
            function (e) {
              for (var t = 1; t < arguments.length; t++) {
                var r = arguments[t];
                for (var n in r)
                  Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
              }
              return e;
            }).apply(this, arguments);
        }
        var x = !0;
        var w = (function (e) {
          (0, c.default)(r, e);
          var t = y(r);
          function r() {
            return (0, i.default)(this, r), t.apply(this, arguments);
          }
          return (
            (0, u.default)(r, [
              {
                key: "render",
                value: function () {
                  var e = this.props,
                    t = e.active,
                    r = e.activityState,
                    n = e.style,
                    o = e.enabled,
                    i = void 0 === o ? x : o,
                    u = (0, a.default)(e, [
                      "active",
                      "activityState",
                      "style",
                      "enabled",
                    ]);
                  return i
                    ? (void 0 !== t && void 0 === r && (r = 0 !== t ? 2 : 0),
                      s.default.createElement(
                        p.View,
                        b(
                          {
                            hidden: 0 === r,
                            style: [n, { display: 0 !== r ? "flex" : "none" }],
                          },
                          u
                        )
                      ))
                    : s.default.createElement(p.View, u);
                },
              },
            ]),
            r
          );
        })(s.default.Component);
        t.NativeScreen = w;
        var O = p.Animated.createAnimatedComponent(w);
        t.Screen = O;
        var _ = p.View;
        t.InnerScreen = _;
        var h = s.default.createContext(O);
        t.ScreenContext = h;
        var m = p.View;
        t.ScreenContainer = m;
        var P = p.View;
        t.NativeScreenContainer = P;
        var g = p.View;
        t.NativeScreenNavigationContainer = g;
        var k = p.View;
        t.ScreenStack = k;
        var j = p.View;
        t.FullWindowOverlay = j;
        t.ScreenStackHeaderBackButtonImage = function (e) {
          return s.default.createElement(
            p.View,
            null,
            s.default.createElement(
              p.Image,
              b({ resizeMode: "center", fadeDuration: 0 }, e)
            )
          );
        };
        t.ScreenStackHeaderRightView = function (e) {
          return s.default.createElement(p.View, e);
        };
        t.ScreenStackHeaderLeftView = function (e) {
          return s.default.createElement(p.View, e);
        };
        t.ScreenStackHeaderCenterView = function (e) {
          return s.default.createElement(p.View, e);
        };
        t.ScreenStackHeaderSearchBarView = function (e) {
          return s.default.createElement(p.View, e);
        };
        var M = p.View;
        t.ScreenStackHeaderConfig = M;
        var C = p.View;
        t.SearchBar = C;
        var V = p.View;
        t.ScreenStackHeaderSubview = V;
        t.shouldUseActivityState = !0;
      },
      (e, t, r) => {
        var n = r(7);
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
      (e) => {
        (e.exports = function (e, t) {
          if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function");
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e, t, r) => {
        var n = r(10);
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
        var n = r(0).default,
          o = r(11);
        (e.exports = function (e) {
          var t = o(e, "string");
          return "symbol" === n(t) ? t : String(t);
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e, t, r) => {
        var n = r(0).default;
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
      (e, t, r) => {
        var n = r(3);
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
        var n = r(0).default,
          o = r(14);
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
        "use strict";
        e.exports = require("react-native");
      },
      () => {},
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function () {
            var e = o.useContext(a.default);
            if (void 0 === e)
              throw new Error(
                "Couldn't find values for transition progress. Are you inside a screen in Native Stack?"
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
                var u = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                u && (u.get || u.set)
                  ? Object.defineProperty(n, a, u)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(2)),
          a = n(r(18));
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
              var u = a ? Object.getOwnPropertyDescriptor(e, i) : null;
              u && (u.get || u.set)
                ? Object.defineProperty(o, i, u)
                : (o[i] = e[i]);
            }
          (o.default = e), r && r.set(e, o);
          return o;
        })(r(2)).createContext(void 0);
        t.default = o;
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.executeNativeBackPress = function () {
            return n.BackHandler.exitApp(), !0;
          }),
          (t.isSearchBarAvailableForCurrentPlatform = void 0);
        var n = r(15),
          o = ["ios", "android"].includes(n.Platform.OS);
        t.isSearchBarAvailableForCurrentPlatform = o;
      },
    ],
    t = {};
  var r = (function r(n) {
    var o = t[n];
    if (void 0 !== o) return o.exports;
    var a = (t[n] = { exports: {} });
    return e[n](a, a.exports, r), a.exports;
  })(5);
  exports["react-native-screens"] = r;
})();
