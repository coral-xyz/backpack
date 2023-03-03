(() => {
  var e = [
      (e) => {
        "use strict";
        e.exports = require("react");
      },
      (e) => {
        (e.exports = function (e) {
          return e && e.__esModule ? e : { default: e };
        }),
          (e.exports.default = e.exports),
          (e.exports.__esModule = !0);
      },
      (e) => {
        function t() {
          return (
            (e.exports = t =
              Object.assign ||
              function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }),
            (e.exports.default = e.exports),
            (e.exports.__esModule = !0),
            t.apply(this, arguments)
          );
        }
        (e.exports = t),
          (e.exports.default = e.exports),
          (e.exports.__esModule = !0);
      },
      (e, t, r) => {
        var n = r(30),
          o = r(31),
          a = r(16),
          u = r(32);
        (e.exports = function (e, t) {
          return n(e) || o(e, t) || a(e, t) || u();
        }),
          (e.exports.default = e.exports),
          (e.exports.__esModule = !0);
      },
      (e, t, r) => {
        var n = r(33),
          o = r(34),
          a = r(16),
          u = r(35);
        (e.exports = function (e) {
          return n(e) || o(e) || a(e) || u();
        }),
          (e.exports.default = e.exports),
          (e.exports.__esModule = !0);
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 });
        var o = {
          BaseNavigationContainer: !0,
          createNavigationContainerRef: !0,
          createNavigatorFactory: !0,
          CurrentRenderContext: !0,
          findFocusedRoute: !0,
          getActionFromState: !0,
          getFocusedRouteNameFromRoute: !0,
          getPathFromState: !0,
          getStateFromPath: !0,
          NavigationContainerRefContext: !0,
          NavigationContext: !0,
          NavigationHelpersContext: !0,
          NavigationRouteContext: !0,
          useFocusEffect: !0,
          useIsFocused: !0,
          useNavigation: !0,
          useNavigationBuilder: !0,
          useNavigationContainerRef: !0,
          useNavigationState: !0,
          useRoute: !0,
          validatePathConfig: !0,
        };
        Object.defineProperty(t, "BaseNavigationContainer", {
          enumerable: !0,
          get: function () {
            return a.default;
          },
        }),
          Object.defineProperty(t, "createNavigationContainerRef", {
            enumerable: !0,
            get: function () {
              return u.default;
            },
          }),
          Object.defineProperty(t, "createNavigatorFactory", {
            enumerable: !0,
            get: function () {
              return i.default;
            },
          }),
          Object.defineProperty(t, "CurrentRenderContext", {
            enumerable: !0,
            get: function () {
              return f.default;
            },
          }),
          Object.defineProperty(t, "findFocusedRoute", {
            enumerable: !0,
            get: function () {
              return l.default;
            },
          }),
          Object.defineProperty(t, "getActionFromState", {
            enumerable: !0,
            get: function () {
              return c.default;
            },
          }),
          Object.defineProperty(t, "getFocusedRouteNameFromRoute", {
            enumerable: !0,
            get: function () {
              return s.default;
            },
          }),
          Object.defineProperty(t, "getPathFromState", {
            enumerable: !0,
            get: function () {
              return d.default;
            },
          }),
          Object.defineProperty(t, "getStateFromPath", {
            enumerable: !0,
            get: function () {
              return p.default;
            },
          }),
          Object.defineProperty(t, "NavigationContainerRefContext", {
            enumerable: !0,
            get: function () {
              return v.default;
            },
          }),
          Object.defineProperty(t, "NavigationContext", {
            enumerable: !0,
            get: function () {
              return y.default;
            },
          }),
          Object.defineProperty(t, "NavigationHelpersContext", {
            enumerable: !0,
            get: function () {
              return g.default;
            },
          }),
          Object.defineProperty(t, "NavigationRouteContext", {
            enumerable: !0,
            get: function () {
              return b.default;
            },
          }),
          Object.defineProperty(t, "useFocusEffect", {
            enumerable: !0,
            get: function () {
              return h.default;
            },
          }),
          Object.defineProperty(t, "useIsFocused", {
            enumerable: !0,
            get: function () {
              return O.default;
            },
          }),
          Object.defineProperty(t, "useNavigation", {
            enumerable: !0,
            get: function () {
              return j.default;
            },
          }),
          Object.defineProperty(t, "useNavigationBuilder", {
            enumerable: !0,
            get: function () {
              return P.default;
            },
          }),
          Object.defineProperty(t, "useNavigationContainerRef", {
            enumerable: !0,
            get: function () {
              return w.default;
            },
          }),
          Object.defineProperty(t, "useNavigationState", {
            enumerable: !0,
            get: function () {
              return k.default;
            },
          }),
          Object.defineProperty(t, "useRoute", {
            enumerable: !0,
            get: function () {
              return _.default;
            },
          }),
          Object.defineProperty(t, "validatePathConfig", {
            enumerable: !0,
            get: function () {
              return M.default;
            },
          });
        var a = n(r(63)),
          u = n(r(20)),
          i = n(r(71)),
          f = n(r(47)),
          l = n(r(22)),
          c = n(r(72)),
          s = n(r(73)),
          d = n(r(74)),
          p = n(r(76)),
          v = n(r(23)),
          y = n(r(12)),
          g = n(r(54)),
          b = n(r(10)),
          m = r(25);
        Object.keys(m).forEach(function (e) {
          "default" !== e &&
            "__esModule" !== e &&
            (Object.prototype.hasOwnProperty.call(o, e) ||
              (e in t && t[e] === m[e]) ||
              Object.defineProperty(t, e, {
                enumerable: !0,
                get: function () {
                  return m[e];
                },
              }));
        });
        var h = n(r(77)),
          O = n(r(78)),
          j = n(r(14)),
          P = n(r(79)),
          w = n(r(96)),
          k = n(r(97)),
          _ = n(r(98)),
          M = n(r(24)),
          x = r(8);
        Object.keys(x).forEach(function (e) {
          "default" !== e &&
            "__esModule" !== e &&
            (Object.prototype.hasOwnProperty.call(o, e) ||
              (e in t && t[e] === x[e]) ||
              Object.defineProperty(t, e, {
                enumerable: !0,
                get: function () {
                  return x[e];
                },
              }));
        });
      },
      (e, t, r) => {
        var n = r(29);
        (e.exports = function (e, t) {
          if (null == e) return {};
          var r,
            o,
            a = n(e, t);
          if (Object.getOwnPropertySymbols) {
            var u = Object.getOwnPropertySymbols(e);
            for (o = 0; o < u.length; o++)
              (r = u[o]),
                t.indexOf(r) >= 0 ||
                  (Object.prototype.propertyIsEnumerable.call(e, r) &&
                    (a[r] = e[r]));
          }
          return a;
        }),
          (e.exports.default = e.exports),
          (e.exports.__esModule = !0);
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
          for (var u in e)
            if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {
              var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
              i && (i.get || i.set)
                ? Object.defineProperty(o, u, i)
                : (o[u] = e[u]);
            }
          (o.default = e), r && r.set(e, o);
          return o;
        })(r(0)).createContext({
          onDispatchAction: function () {},
          onOptionsChange: function () {},
        });
        t.default = o;
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 });
        var o = {
          CommonActions: !0,
          BaseRouter: !0,
          DrawerActions: !0,
          DrawerRouter: !0,
          StackActions: !0,
          StackRouter: !0,
          TabActions: !0,
          TabRouter: !0,
        };
        Object.defineProperty(t, "BaseRouter", {
          enumerable: !0,
          get: function () {
            return u.default;
          },
        }),
          Object.defineProperty(t, "DrawerActions", {
            enumerable: !0,
            get: function () {
              return i.DrawerActions;
            },
          }),
          Object.defineProperty(t, "DrawerRouter", {
            enumerable: !0,
            get: function () {
              return i.default;
            },
          }),
          Object.defineProperty(t, "StackActions", {
            enumerable: !0,
            get: function () {
              return f.StackActions;
            },
          }),
          Object.defineProperty(t, "StackRouter", {
            enumerable: !0,
            get: function () {
              return f.default;
            },
          }),
          Object.defineProperty(t, "TabActions", {
            enumerable: !0,
            get: function () {
              return l.TabActions;
            },
          }),
          Object.defineProperty(t, "TabRouter", {
            enumerable: !0,
            get: function () {
              return l.default;
            },
          }),
          (t.CommonActions = void 0);
        var a = d(r(64));
        t.CommonActions = a;
        var u = n(r(19)),
          i = d(r(65)),
          f = d(r(66)),
          l = d(r(38)),
          c = r(67);
        function s(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (s = function (e) {
            return e ? r : t;
          })(e);
        }
        function d(e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" != typeof e && "function" != typeof e))
            return { default: e };
          var r = s(t);
          if (r && r.has(e)) return r.get(e);
          var n = {},
            o = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var a in e)
            if ("default" !== a && Object.prototype.hasOwnProperty.call(e, a)) {
              var u = o ? Object.getOwnPropertyDescriptor(e, a) : null;
              u && (u.get || u.set)
                ? Object.defineProperty(n, a, u)
                : (n[a] = e[a]);
            }
          return (n.default = e), r && r.set(e, n), n;
        }
        Object.keys(c).forEach(function (e) {
          "default" !== e &&
            "__esModule" !== e &&
            (Object.prototype.hasOwnProperty.call(o, e) ||
              (e in t && t[e] === c[e]) ||
              Object.defineProperty(t, e, {
                enumerable: !0,
                get: function () {
                  return c[e];
                },
              }));
        });
      },
      (e) => {
        e.exports = {
          nanoid: (e = 21) => {
            let t = "",
              r = e;
            for (; r--; )
              t +=
                "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW"[
                  (64 * Math.random()) | 0
                ];
            return t;
          },
          customAlphabet: (e, t) => () => {
            let r = "",
              n = t;
            for (; n--; ) r += e[(Math.random() * e.length) | 0];
            return r;
          },
        };
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
          for (var u in e)
            if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {
              var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
              i && (i.get || i.set)
                ? Object.defineProperty(o, u, i)
                : (o[u] = e[u]);
            }
          (o.default = e), r && r.set(e, o);
          return o;
        })(r(0)).createContext(void 0);
        t.default = o;
      },
      (e) => {
        (e.exports = function (e, t, r) {
          return (
            t in e
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
          (e.exports.default = e.exports),
          (e.exports.__esModule = !0);
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
          for (var u in e)
            if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {
              var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
              i && (i.get || i.set)
                ? Object.defineProperty(o, u, i)
                : (o[u] = e[u]);
            }
          (o.default = e), r && r.set(e, o);
          return o;
        })(r(0)).createContext(void 0);
        t.default = o;
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var n = (function (e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" != typeof e && "function" != typeof e))
            return { default: e };
          var r = o(t);
          if (r && r.has(e)) return r.get(e);
          var n = {},
            a = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var u in e)
            if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {
              var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
              i && (i.get || i.set)
                ? Object.defineProperty(n, u, i)
                : (n[u] = e[u]);
            }
          (n.default = e), r && r.set(e, n);
          return n;
        })(r(0));
        function o(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (o = function (e) {
            return e ? r : t;
          })(e);
        }
        var a =
            "Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'? See https://reactnavigation.org/docs/getting-started for setup instructions.",
          u = n.createContext({
            isDefault: !0,
            get getKey() {
              throw new Error(a);
            },
            get setKey() {
              throw new Error(a);
            },
            get getState() {
              throw new Error(a);
            },
            get setState() {
              throw new Error(a);
            },
            get getIsInitial() {
              throw new Error(a);
            },
          });
        t.default = u;
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function () {
            var e = o.useContext(a.default),
              t = o.useContext(u.default);
            if (void 0 === t && void 0 === e)
              throw new Error(
                "Couldn't find a navigation object. Is your component inside NavigationContainer?"
              );
            return null != t ? t : e;
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
          })(r(0)),
          a = n(r(23)),
          u = n(r(12));
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
        "use strict";
        var n = r(1),
          o = n(r(11)),
          a = n(r(3)),
          u = n(r(2)),
          i = n(r(4));
        function f(e, t) {
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
        var c = r(49),
          s = r(50),
          d = r(51),
          p = r(52),
          v = Symbol("encodeFragmentIdentifier");
        function y(e) {
          if ("string" != typeof e || 1 !== e.length)
            throw new TypeError(
              "arrayFormatSeparator must be single character string"
            );
        }
        function g(e, t) {
          return t.encode ? (t.strict ? c(e) : encodeURIComponent(e)) : e;
        }
        function b(e, t) {
          return t.decode ? s(e) : e;
        }
        function m(e) {
          return Array.isArray(e)
            ? e.sort()
            : "object" == typeof e
            ? m(Object.keys(e))
                .sort(function (e, t) {
                  return Number(e) - Number(t);
                })
                .map(function (t) {
                  return e[t];
                })
            : e;
        }
        function h(e) {
          var t = e.indexOf("#");
          return -1 !== t && (e = e.slice(0, t)), e;
        }
        function O(e) {
          var t = (e = h(e)).indexOf("?");
          return -1 === t ? "" : e.slice(t + 1);
        }
        function j(e, t) {
          return (
            t.parseNumbers &&
            !Number.isNaN(Number(e)) &&
            "string" == typeof e &&
            "" !== e.trim()
              ? (e = Number(e))
              : !t.parseBooleans ||
                null === e ||
                ("true" !== e.toLowerCase() && "false" !== e.toLowerCase()) ||
                (e = "true" === e.toLowerCase()),
            e
          );
        }
        function P(e, t) {
          y(
            (t = (0, u.default)(
              {
                decode: !0,
                sort: !0,
                arrayFormat: "none",
                arrayFormatSeparator: ",",
                parseNumbers: !1,
                parseBooleans: !1,
              },
              t
            )).arrayFormatSeparator
          );
          var r = (function (e) {
              var t;
              switch (e.arrayFormat) {
                case "index":
                  return function (e, r, n) {
                    (t = /\[(\d*)\]$/.exec(e)),
                      (e = e.replace(/\[\d*\]$/, "")),
                      t
                        ? (void 0 === n[e] && (n[e] = {}), (n[e][t[1]] = r))
                        : (n[e] = r);
                  };
                case "bracket":
                  return function (e, r, n) {
                    (t = /(\[\])$/.exec(e)),
                      (e = e.replace(/\[\]$/, "")),
                      t
                        ? void 0 !== n[e]
                          ? (n[e] = [].concat(n[e], r))
                          : (n[e] = [r])
                        : (n[e] = r);
                  };
                case "comma":
                case "separator":
                  return function (t, r, n) {
                    var o =
                        "string" == typeof r &&
                        r.includes(e.arrayFormatSeparator),
                      a =
                        "string" == typeof r &&
                        !o &&
                        b(r, e).includes(e.arrayFormatSeparator);
                    r = a ? b(r, e) : r;
                    var u =
                      o || a
                        ? r.split(e.arrayFormatSeparator).map(function (t) {
                            return b(t, e);
                          })
                        : null === r
                        ? r
                        : b(r, e);
                    n[t] = u;
                  };
                case "bracket-separator":
                  return function (t, r, n) {
                    var o = /(\[\])$/.test(t);
                    if (((t = t.replace(/\[\]$/, "")), o)) {
                      var a =
                        null === r
                          ? []
                          : r.split(e.arrayFormatSeparator).map(function (t) {
                              return b(t, e);
                            });
                      void 0 !== n[t]
                        ? (n[t] = [].concat(n[t], a))
                        : (n[t] = a);
                    } else n[t] = r ? b(r, e) : r;
                  };
                default:
                  return function (e, t, r) {
                    void 0 !== r[e] ? (r[e] = [].concat(r[e], t)) : (r[e] = t);
                  };
              }
            })(t),
            n = Object.create(null);
          if ("string" != typeof e) return n;
          if (!(e = e.trim().replace(/^[?#&]/, ""))) return n;
          for (var o, i = f(e.split("&")); !(o = i()).done; ) {
            var l = o.value;
            if ("" !== l) {
              var c = d(t.decode ? l.replace(/\+/g, " ") : l, "="),
                s = (0, a.default)(c, 2),
                p = s[0],
                v = s[1];
              (v =
                void 0 === v
                  ? null
                  : ["comma", "separator", "bracket-separator"].includes(
                      t.arrayFormat
                    )
                  ? v
                  : b(v, t)),
                r(b(p, t), v, n);
            }
          }
          for (var g = 0, h = Object.keys(n); g < h.length; g++) {
            var O = h[g],
              P = n[O];
            if ("object" == typeof P && null !== P)
              for (var w = 0, k = Object.keys(P); w < k.length; w++) {
                var _ = k[w];
                P[_] = j(P[_], t);
              }
            else n[O] = j(P, t);
          }
          return !1 === t.sort
            ? n
            : (!0 === t.sort
                ? Object.keys(n).sort()
                : Object.keys(n).sort(t.sort)
              ).reduce(function (e, t) {
                var r = n[t];
                return (
                  Boolean(r) && "object" == typeof r && !Array.isArray(r)
                    ? (e[t] = m(r))
                    : (e[t] = r),
                  e
                );
              }, Object.create(null));
        }
        (t.extract = O),
          (t.parse = P),
          (t.stringify = function (e, t) {
            if (!e) return "";
            y(
              (t = (0, u.default)(
                {
                  encode: !0,
                  strict: !0,
                  arrayFormat: "none",
                  arrayFormatSeparator: ",",
                },
                t
              )).arrayFormatSeparator
            );
            for (
              var r = function (r) {
                  return (
                    (t.skipNull && null == e[r]) ||
                    (t.skipEmptyString && "" === e[r])
                  );
                },
                n = (function (e) {
                  switch (e.arrayFormat) {
                    case "index":
                      return function (t) {
                        return function (r, n) {
                          var o = r.length;
                          return void 0 === n ||
                            (e.skipNull && null === n) ||
                            (e.skipEmptyString && "" === n)
                            ? r
                            : [].concat(
                                (0, i.default)(r),
                                null === n
                                  ? [[g(t, e), "[", o, "]"].join("")]
                                  : [
                                      [
                                        g(t, e),
                                        "[",
                                        g(o, e),
                                        "]=",
                                        g(n, e),
                                      ].join(""),
                                    ]
                              );
                        };
                      };
                    case "bracket":
                      return function (t) {
                        return function (r, n) {
                          return void 0 === n ||
                            (e.skipNull && null === n) ||
                            (e.skipEmptyString && "" === n)
                            ? r
                            : [].concat(
                                (0, i.default)(r),
                                null === n
                                  ? [[g(t, e), "[]"].join("")]
                                  : [[g(t, e), "[]=", g(n, e)].join("")]
                              );
                        };
                      };
                    case "comma":
                    case "separator":
                    case "bracket-separator":
                      var t =
                        "bracket-separator" === e.arrayFormat ? "[]=" : "=";
                      return function (r) {
                        return function (n, o) {
                          return void 0 === o ||
                            (e.skipNull && null === o) ||
                            (e.skipEmptyString && "" === o)
                            ? n
                            : ((o = null === o ? "" : o),
                              0 === n.length
                                ? [[g(r, e), t, g(o, e)].join("")]
                                : [[n, g(o, e)].join(e.arrayFormatSeparator)]);
                        };
                      };
                    default:
                      return function (t) {
                        return function (r, n) {
                          return void 0 === n ||
                            (e.skipNull && null === n) ||
                            (e.skipEmptyString && "" === n)
                            ? r
                            : [].concat(
                                (0, i.default)(r),
                                null === n
                                  ? [g(t, e)]
                                  : [[g(t, e), "=", g(n, e)].join("")]
                              );
                        };
                      };
                  }
                })(t),
                o = {},
                a = 0,
                f = Object.keys(e);
              a < f.length;
              a++
            ) {
              var l = f[a];
              r(l) || (o[l] = e[l]);
            }
            var c = Object.keys(o);
            return (
              !1 !== t.sort && c.sort(t.sort),
              c
                .map(function (r) {
                  var o = e[r];
                  return void 0 === o
                    ? ""
                    : null === o
                    ? g(r, t)
                    : Array.isArray(o)
                    ? 0 === o.length && "bracket-separator" === t.arrayFormat
                      ? g(r, t) + "[]"
                      : o.reduce(n(r), []).join("&")
                    : g(r, t) + "=" + g(o, t);
                })
                .filter(function (e) {
                  return e.length > 0;
                })
                .join("&")
            );
          }),
          (t.parseUrl = function (e, t) {
            t = (0, u.default)({ decode: !0 }, t);
            var r = d(e, "#"),
              n = (0, a.default)(r, 2),
              o = n[0],
              i = n[1];
            return (0, u.default)(
              { url: o.split("?")[0] || "", query: P(O(e), t) },
              t && t.parseFragmentIdentifier && i
                ? { fragmentIdentifier: b(i, t) }
                : {}
            );
          }),
          (t.stringifyUrl = function (e, r) {
            r = (0, u.default)(
              (0, o.default)({ encode: !0, strict: !0 }, v, !0),
              r
            );
            var n = h(e.url).split("?")[0] || "",
              a = t.extract(e.url),
              i = t.parse(a, { sort: !1 }),
              f = (0, u.default)(i, e.query),
              l = t.stringify(f, r);
            l && (l = "?" + l);
            var c = (function (e) {
              var t = "",
                r = e.indexOf("#");
              return -1 !== r && (t = e.slice(r)), t;
            })(e.url);
            return (
              e.fragmentIdentifier &&
                (c =
                  "#" +
                  (r[v] ? g(e.fragmentIdentifier, r) : e.fragmentIdentifier)),
              "" + n + l + c
            );
          }),
          (t.pick = function (e, r, n) {
            n = (0, u.default)(
              (0, o.default)({ parseFragmentIdentifier: !0 }, v, !1),
              n
            );
            var a = t.parseUrl(e, n),
              i = a.url,
              f = a.query,
              l = a.fragmentIdentifier;
            return t.stringifyUrl(
              { url: i, query: p(f, r), fragmentIdentifier: l },
              n
            );
          }),
          (t.exclude = function (e, r, n) {
            var o = Array.isArray(r)
              ? function (e) {
                  return !r.includes(e);
                }
              : function (e, t) {
                  return !r(e, t);
                };
            return t.pick(e, o, n);
          });
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
          (e.exports.default = e.exports),
          (e.exports.__esModule = !0);
      },
      (e) => {
        (e.exports = function (e, t) {
          (null == t || t > e.length) && (t = e.length);
          for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
          return n;
        }),
          (e.exports.default = e.exports),
          (e.exports.__esModule = !0);
      },
      (e) => {
        "use strict";
        e.exports = require("react-native");
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var o = n(r(2)),
          a = r(9),
          u = {
            getStateForAction: function (e, t) {
              switch (t.type) {
                case "SET_PARAMS":
                  var r = t.source
                    ? e.routes.findIndex(function (e) {
                        return e.key === t.source;
                      })
                    : e.index;
                  return -1 === r
                    ? null
                    : (0, o.default)({}, e, {
                        routes: e.routes.map(function (e, n) {
                          return n === r
                            ? (0, o.default)({}, e, {
                                params: (0, o.default)(
                                  {},
                                  e.params,
                                  t.payload.params
                                ),
                              })
                            : e;
                        }),
                      });
                case "RESET":
                  var n = t.payload;
                  return 0 === n.routes.length ||
                    n.routes.some(function (t) {
                      return !e.routeNames.includes(t.name);
                    })
                    ? null
                    : !1 === n.stale
                    ? e.routeNames.length !== n.routeNames.length ||
                      n.routeNames.some(function (t) {
                        return !e.routeNames.includes(t);
                      })
                      ? null
                      : (0, o.default)({}, n, {
                          routes: n.routes.map(function (e) {
                            return e.key
                              ? e
                              : (0, o.default)({}, e, {
                                  key: e.name + "-" + (0, a.nanoid)(),
                                });
                          }),
                        })
                    : n;
                default:
                  return null;
              }
            },
            shouldActionChangeFocus: function (e) {
              return "NAVIGATE" === e.type;
            },
          };
        t.default = u;
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function () {
            var e = [].concat((0, a.default)(Object.keys(u.CommonActions)), [
                "addListener",
                "removeListener",
                "resetRoot",
                "dispatch",
                "canGoBack",
                "getRootState",
                "getState",
                "getParent",
                "getCurrentRoute",
                "getCurrentOptions",
              ]),
              t = (0, o.default)(
                {},
                e.reduce(function (e, r) {
                  return (
                    (e[r] = function () {
                      var e;
                      if (null != t.current)
                        return (e = t.current)[r].apply(e, arguments);
                      console.error(i);
                    }),
                    e
                  );
                }, {}),
                {
                  isReady: function () {
                    return null != t.current && t.current.isReady();
                  },
                  current: null,
                }
              );
            return t;
          }),
          (t.NOT_INITIALIZED_ERROR = void 0);
        var o = n(r(2)),
          a = n(r(4)),
          u = r(8),
          i =
            "The 'navigation' object hasn't been initialized yet. This might happen if you don't have a navigator mounted, or if the navigator hasn't finished mounting. See https://reactnavigation.org/docs/navigating-without-navigation-prop#handling-initialization for more details.";
        t.NOT_INITIALIZED_ERROR = i;
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.children,
              r = n.useRef(),
              o = n.useMemo(function () {
                return {
                  register: function (e) {
                    var t = r.current;
                    if (void 0 !== t && e !== t)
                      throw new Error(
                        'Another navigator is already registered for this container. You likely have multiple navigators under a single "NavigationContainer" or "Screen". Make sure each navigator is under a separate "Screen" container. See https://reactnavigation.org/docs/nesting-navigators for a guide on nesting.'
                      );
                    r.current = e;
                  },
                  unregister: function (e) {
                    e === r.current && (r.current = void 0);
                  },
                };
              }, []);
            return n.createElement(a.Provider, { value: o }, t);
          }),
          (t.SingleNavigatorContext = void 0);
        var n = (function (e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" != typeof e && "function" != typeof e))
            return { default: e };
          var r = o(t);
          if (r && r.has(e)) return r.get(e);
          var n = {},
            a = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var u in e)
            if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {
              var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
              i && (i.get || i.set)
                ? Object.defineProperty(n, u, i)
                : (n[u] = e[u]);
            }
          (n.default = e), r && r.set(e, n);
          return n;
        })(r(0));
        function o(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (o = function (e) {
            return e ? r : t;
          })(e);
        }
        var a = n.createContext(void 0);
        t.SingleNavigatorContext = a;
      },
      (e, t) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t,
              r,
              n,
              o = e;
            for (
              ;
              null !=
              (null === (a = o) || void 0 === a
                ? void 0
                : a.routes[null !== (u = o.index) && void 0 !== u ? u : 0]
                    .state);

            ) {
              var a, u, i;
              o =
                o.routes[null !== (i = o.index) && void 0 !== i ? i : 0].state;
            }
            return null === (t = o) || void 0 === t
              ? void 0
              : t.routes[
                  null !==
                    (r = null === (n = o) || void 0 === n ? void 0 : n.index) &&
                  void 0 !== r
                    ? r
                    : 0
                ];
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
          for (var u in e)
            if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {
              var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
              i && (i.get || i.set)
                ? Object.defineProperty(o, u, i)
                : (o[u] = e[u]);
            }
          (o.default = e), r && r.set(e, o);
          return o;
        })(r(0)).createContext(void 0);
        t.default = o;
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function e(t) {
            var r =
                !(arguments.length > 1 && void 0 !== arguments[1]) ||
                arguments[1],
              n = ["initialRouteName", "screens"];
            r || n.push("path", "exact", "stringify", "parse");
            var u = Object.keys(t).filter(function (e) {
              return !n.includes(e);
            });
            if (u.length)
              throw new Error(
                "Found invalid properties in the configuration:\n" +
                  a(u) +
                  "\n\nDid you forget to specify them under a 'screens' property?\n\nYou can only specify the following properties:\n" +
                  a(n) +
                  "\n\nSee https://reactnavigation.org/docs/configuring-links for more details on how to specify a linking configuration."
              );
            t.screens &&
              Object.entries(t.screens).forEach(function (t) {
                var r = (0, o.default)(t, 2),
                  n = (r[0], r[1]);
                "string" != typeof n && e(n, !1);
              });
          });
        var o = n(r(3)),
          a = function (e) {
            return e
              .map(function (e) {
                return "- " + e;
              })
              .join("\n");
          };
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.PrivateValueStore = void 0);
        var o = n(r(36));
        t.PrivateValueStore = function e() {
          var t, r, n;
          (0, o.default)(this, e),
            (n = void 0),
            (r = "") in (t = this)
              ? Object.defineProperty(t, r, {
                  value: n,
                  enumerable: !0,
                  configurable: !0,
                  writable: !0,
                })
              : (t[r] = n);
        };
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
          for (var u in e)
            if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {
              var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
              i && (i.get || i.set)
                ? Object.defineProperty(o, u, i)
                : (o[u] = e[u]);
            }
          (o.default = e), r && r.set(e, o);
          return o;
        })(r(0)).createContext({ options: void 0 });
        o.displayName = "LinkingContext";
        var a = o;
        t.default = a;
      },
      (e, t) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var r = {
          dark: !1,
          colors: {
            primary: "rgb(0, 122, 255)",
            background: "rgb(242, 242, 242)",
            card: "rgb(255, 255, 255)",
            text: "rgb(28, 28, 30)",
            border: "rgb(216, 216, 216)",
            notification: "rgb(255, 59, 48)",
          },
        };
        t.default = r;
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 });
        var o = {
          Link: !0,
          NavigationContainer: !0,
          ServerContainer: !0,
          DarkTheme: !0,
          DefaultTheme: !0,
          ThemeProvider: !0,
          useTheme: !0,
          useLinkBuilder: !0,
          useLinkProps: !0,
          useLinkTo: !0,
          useScrollToTop: !0,
        };
        Object.defineProperty(t, "Link", {
          enumerable: !0,
          get: function () {
            return a.default;
          },
        }),
          Object.defineProperty(t, "NavigationContainer", {
            enumerable: !0,
            get: function () {
              return u.default;
            },
          }),
          Object.defineProperty(t, "ServerContainer", {
            enumerable: !0,
            get: function () {
              return i.default;
            },
          }),
          Object.defineProperty(t, "DarkTheme", {
            enumerable: !0,
            get: function () {
              return f.default;
            },
          }),
          Object.defineProperty(t, "DefaultTheme", {
            enumerable: !0,
            get: function () {
              return l.default;
            },
          }),
          Object.defineProperty(t, "ThemeProvider", {
            enumerable: !0,
            get: function () {
              return c.default;
            },
          }),
          Object.defineProperty(t, "useTheme", {
            enumerable: !0,
            get: function () {
              return s.default;
            },
          }),
          Object.defineProperty(t, "useLinkBuilder", {
            enumerable: !0,
            get: function () {
              return p.default;
            },
          }),
          Object.defineProperty(t, "useLinkProps", {
            enumerable: !0,
            get: function () {
              return v.default;
            },
          }),
          Object.defineProperty(t, "useLinkTo", {
            enumerable: !0,
            get: function () {
              return y.default;
            },
          }),
          Object.defineProperty(t, "useScrollToTop", {
            enumerable: !0,
            get: function () {
              return g.default;
            },
          });
        var a = n(r(62)),
          u = n(r(99)),
          i = n(r(104)),
          f = n(r(105)),
          l = n(r(27)),
          c = n(r(57)),
          s = n(r(106)),
          d = r(107);
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
        var p = n(r(108)),
          v = n(r(37)),
          y = n(r(56)),
          g = n(r(109)),
          b = r(5);
        Object.keys(b).forEach(function (e) {
          "default" !== e &&
            "__esModule" !== e &&
            (Object.prototype.hasOwnProperty.call(o, e) ||
              (e in t && t[e] === b[e]) ||
              Object.defineProperty(t, e, {
                enumerable: !0,
                get: function () {
                  return b[e];
                },
              }));
        });
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
          (e.exports.default = e.exports),
          (e.exports.__esModule = !0);
      },
      (e) => {
        (e.exports = function (e) {
          if (Array.isArray(e)) return e;
        }),
          (e.exports.default = e.exports),
          (e.exports.__esModule = !0);
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
              a = [],
              u = !0,
              i = !1;
            try {
              for (
                r = r.call(e);
                !(u = (n = r.next()).done) &&
                (a.push(n.value), !t || a.length !== t);
                u = !0
              );
            } catch (e) {
              (i = !0), (o = e);
            } finally {
              try {
                u || null == r.return || r.return();
              } finally {
                if (i) throw o;
              }
            }
            return a;
          }
        }),
          (e.exports.default = e.exports),
          (e.exports.__esModule = !0);
      },
      (e) => {
        (e.exports = function () {
          throw new TypeError(
            "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
          );
        }),
          (e.exports.default = e.exports),
          (e.exports.__esModule = !0);
      },
      (e, t, r) => {
        var n = r(17);
        (e.exports = function (e) {
          if (Array.isArray(e)) return n(e);
        }),
          (e.exports.default = e.exports),
          (e.exports.__esModule = !0);
      },
      (e) => {
        (e.exports = function (e) {
          if (
            ("undefined" != typeof Symbol && null != e[Symbol.iterator]) ||
            null != e["@@iterator"]
          )
            return Array.from(e);
        }),
          (e.exports.default = e.exports),
          (e.exports.__esModule = !0);
      },
      (e) => {
        (e.exports = function () {
          throw new TypeError(
            "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
          );
        }),
          (e.exports.default = e.exports),
          (e.exports.__esModule = !0);
      },
      (e) => {
        (e.exports = function (e, t) {
          if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function");
        }),
          (e.exports.default = e.exports),
          (e.exports.__esModule = !0);
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.to,
              r = e.action,
              n = a.useContext(o.NavigationContainerRefContext),
              f = a.useContext(o.NavigationHelpersContext),
              l = (0, i.default)();
            return {
              href: t,
              accessibilityRole: "link",
              onPress: function (e) {
                var o,
                  a = !1;
                if (
                  ("web" === u.Platform.OS && e
                    ? e.defaultPrevented ||
                      e.metaKey ||
                      e.altKey ||
                      e.ctrlKey ||
                      e.shiftKey ||
                      (null != e.button && 0 !== e.button) ||
                      ![void 0, null, "", "self"].includes(
                        null === (o = e.currentTarget) || void 0 === o
                          ? void 0
                          : o.target
                      ) ||
                      (e.preventDefault(), (a = !0))
                    : (a = !e || !e.defaultPrevented),
                  a)
                )
                  if (r)
                    if (f) f.dispatch(r);
                    else {
                      if (!n)
                        throw new Error(
                          "Couldn't find a navigation object. Is your component inside NavigationContainer?"
                        );
                      n.dispatch(r);
                    }
                  else l(t);
              },
            };
          });
        var o = r(5),
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
                var u = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                u && (u.get || u.set)
                  ? Object.defineProperty(n, a, u)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(0)),
          u = r(18),
          i = n(r(56));
        function f(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (f = function (e) {
            return e ? r : t;
          })(e);
        }
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.initialRouteName,
              r = e.backBehavior,
              n = void 0 === r ? "firstRoute" : r;
            return (0, o.default)({}, u.default, {
              type: "tab",
              getInitialState: function (e) {
                var r = e.routeNames,
                  o = e.routeParamList,
                  u = void 0 !== t && r.includes(t) ? r.indexOf(t) : 0,
                  i = r.map(function (e) {
                    return {
                      name: e,
                      key: e + "-" + (0, a.nanoid)(),
                      params: o[e],
                    };
                  }),
                  f = l(i, u, n, t);
                return {
                  stale: !1,
                  type: "tab",
                  key: "tab-" + (0, a.nanoid)(),
                  index: u,
                  routeNames: r,
                  history: f,
                  routes: i,
                };
              },
              getRehydratedState: function (e, r) {
                var u,
                  i,
                  f,
                  l,
                  s = r.routeNames,
                  d = r.routeParamList,
                  p = e;
                if (!1 === p.stale) return p;
                var v = s.map(function (e) {
                    var t = p.routes.find(function (t) {
                      return t.name === e;
                    });
                    return (0,
                    o.default)({}, t, { name: e, key: t && t.name === e && t.key ? t.key : e + "-" + (0, a.nanoid)(), params: void 0 !== d[e] ? (0, o.default)({}, d[e], t ? t.params : void 0) : t ? t.params : void 0 });
                  }),
                  y = Math.min(
                    Math.max(
                      s.indexOf(
                        null ===
                          (u =
                            p.routes[
                              null !== (i = null == p ? void 0 : p.index) &&
                              void 0 !== i
                                ? i
                                : 0
                            ]) || void 0 === u
                          ? void 0
                          : u.name
                      ),
                      0
                    ),
                    v.length - 1
                  ),
                  g =
                    null !==
                      (f =
                        null === (l = p.history) || void 0 === l
                          ? void 0
                          : l.filter(function (e) {
                              return v.find(function (t) {
                                return t.key === e.key;
                              });
                            })) && void 0 !== f
                      ? f
                      : [];
                return c(
                  {
                    stale: !1,
                    type: "tab",
                    key: "tab-" + (0, a.nanoid)(),
                    index: y,
                    routeNames: s,
                    history: g,
                    routes: v,
                  },
                  y,
                  n,
                  t
                );
              },
              getStateForRouteNamesChange: function (e, r) {
                var u = r.routeNames,
                  i = r.routeParamList,
                  f = u.map(function (t) {
                    return (
                      e.routes.find(function (e) {
                        return e.name === t;
                      }) || {
                        name: t,
                        key: t + "-" + (0, a.nanoid)(),
                        params: i[t],
                      }
                    );
                  }),
                  c = Math.max(0, u.indexOf(e.routes[e.index].name)),
                  s = e.history.filter(function (e) {
                    return (
                      "route" !== e.type ||
                      f.find(function (t) {
                        return t.key === e.key;
                      })
                    );
                  });
                return (
                  s.length || (s = l(f, c, n, t)),
                  (0, o.default)({}, e, {
                    history: s,
                    routeNames: u,
                    routes: f,
                    index: c,
                  })
                );
              },
              getStateForRouteFocus: function (e, r) {
                var o = e.routes.findIndex(function (e) {
                  return e.key === r;
                });
                return -1 === o || o === e.index ? e : c(e, o, n, t);
              },
              getStateForAction: function (e, r, a) {
                var i = a.routeParamList;
                switch (r.type) {
                  case "JUMP_TO":
                  case "NAVIGATE":
                    var f = -1;
                    return -1 ===
                      (f =
                        "NAVIGATE" === r.type && r.payload.key
                          ? e.routes.findIndex(function (e) {
                              return e.key === r.payload.key;
                            })
                          : e.routes.findIndex(function (e) {
                              return e.name === r.payload.name;
                            }))
                      ? null
                      : c(
                          (0, o.default)({}, e, {
                            routes: e.routes.map(function (e, t) {
                              if (t !== f) return e;
                              var n;
                              n =
                                "NAVIGATE" === r.type && r.payload.merge
                                  ? void 0 !== r.payload.params ||
                                    void 0 !== i[e.name]
                                    ? (0, o.default)(
                                        {},
                                        i[e.name],
                                        e.params,
                                        r.payload.params
                                      )
                                    : e.params
                                  : r.payload.params;
                              var a =
                                "NAVIGATE" === r.type && null != r.payload.path
                                  ? r.payload.path
                                  : e.path;
                              return n !== e.params || a !== e.path
                                ? (0, o.default)({}, e, { path: a, params: n })
                                : e;
                            }),
                          }),
                          f,
                          n,
                          t
                        );
                  case "GO_BACK":
                    if (1 === e.history.length) return null;
                    var l = e.history[e.history.length - 2].key,
                      s = e.routes.findIndex(function (e) {
                        return e.key === l;
                      });
                    return -1 === s
                      ? null
                      : (0, o.default)({}, e, {
                          history: e.history.slice(0, -1),
                          index: s,
                        });
                  default:
                    return u.default.getStateForAction(e, r);
                }
              },
              shouldActionChangeFocus: function (e) {
                return "NAVIGATE" === e.type;
              },
              actionCreators: f,
            });
          }),
          (t.TabActions = void 0);
        var o = n(r(2)),
          a = r(9),
          u = n(r(19)),
          i = "route",
          f = {
            jumpTo: function (e, t) {
              return { type: "JUMP_TO", payload: { name: e, params: t } };
            },
          };
        t.TabActions = f;
        var l = function (e, t, r, n) {
            var o,
              a = [{ type: i, key: e[t].key }];
            switch (r) {
              case "order":
                for (var u = t; u > 0; u--)
                  a.unshift({ type: i, key: e[u - 1].key });
                break;
              case "firstRoute":
                0 !== t && a.unshift({ type: i, key: e[0].key });
                break;
              case "initialRoute":
                t !==
                  (o =
                    -1 ===
                    (o = e.findIndex(function (e) {
                      return e.name === n;
                    }))
                      ? 0
                      : o) && a.unshift({ type: i, key: e[o].key });
            }
            return a;
          },
          c = function (e, t, r, n) {
            var a;
            if ("history" === r) {
              var u = e.routes[t].key;
              a = e.history
                .filter(function (e) {
                  return "route" === e.type && e.key !== u;
                })
                .concat({ type: i, key: u });
            } else a = l(e.routes, t, r, n);
            return (0, o.default)({}, e, { index: t, history: a });
          };
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
          for (var u in e)
            if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {
              var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
              i && (i.get || i.set)
                ? Object.defineProperty(o, u, i)
                : (o[u] = e[u]);
            }
          (o.default = e), r && r.set(e, o);
          return o;
        })(r(0)).createContext(void 0);
        t.default = o;
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function () {
            var e = n.useRef({ action: [], focus: [] }).current,
              t = n.useCallback(
                function (t, r) {
                  return (
                    e[t].push(r),
                    function () {
                      var n = e[t].indexOf(r);
                      e[t].splice(n, 1);
                    }
                  );
                },
                [e]
              );
            return { listeners: e, addListener: t };
          });
        var n = (function (e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" != typeof e && "function" != typeof e))
            return { default: e };
          var r = o(t);
          if (r && r.has(e)) return r.get(e);
          var n = {},
            a = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var u in e)
            if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {
              var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
              i && (i.get || i.set)
                ? Object.defineProperty(n, u, i)
                : (n[u] = e[u]);
            }
          (n.default = e), r && r.set(e, n);
          return n;
        })(r(0));
        function o(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (o = function (e) {
            return e ? r : t;
          })(e);
        }
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = a.useRef(e);
            a.useEffect(function () {
              t.current = e;
            });
            var r = a.useRef({}),
              n = a.useCallback(function (e) {
                var t = function (t, n) {
                  var o = r.current[t] ? r.current[t][e] : void 0;
                  if (o) {
                    var a = o.indexOf(n);
                    o.splice(a, 1);
                  }
                };
                return {
                  addListener: function (n, o) {
                    return (
                      (r.current[n] = r.current[n] || {}),
                      (r.current[n][e] = r.current[n][e] || []),
                      r.current[n][e].push(o),
                      function () {
                        return t(n, o);
                      }
                    );
                  },
                  removeListener: t,
                };
              }, []),
              u = a.useCallback(function (e) {
                var n,
                  a,
                  u,
                  i = e.type,
                  f = e.data,
                  l = e.target,
                  c = e.canPreventDefault,
                  s = r.current[i] || {},
                  d =
                    void 0 !== l
                      ? null === (a = s[l]) || void 0 === a
                        ? void 0
                        : a.slice()
                      : (n = []).concat
                          .apply(
                            n,
                            (0, o.default)(
                              Object.keys(s).map(function (e) {
                                return s[e];
                              })
                            )
                          )
                          .filter(function (e, t, r) {
                            return r.lastIndexOf(e) === t;
                          }),
                  p = {
                    get type() {
                      return i;
                    },
                  };
                if (
                  (void 0 !== l &&
                    Object.defineProperty(p, "target", {
                      enumerable: !0,
                      get: function () {
                        return l;
                      },
                    }),
                  void 0 !== f &&
                    Object.defineProperty(p, "data", {
                      enumerable: !0,
                      get: function () {
                        return f;
                      },
                    }),
                  c)
                ) {
                  var v = !1;
                  Object.defineProperties(p, {
                    defaultPrevented: {
                      enumerable: !0,
                      get: function () {
                        return v;
                      },
                    },
                    preventDefault: {
                      enumerable: !0,
                      value: function () {
                        v = !0;
                      },
                    },
                  });
                }
                return (
                  null === (u = t.current) || void 0 === u || u.call(t, p),
                  null == d ||
                    d.forEach(function (e) {
                      return e(p);
                    }),
                  p
                );
              }, []);
            return a.useMemo(
              function () {
                return { create: n, emit: u };
              },
              [n, u]
            );
          });
        var o = n(r(4)),
          a = (function (e, t) {
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
          })(r(0));
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
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function () {
            var e = n.useRef({ getState: {}, beforeRemove: {} }).current,
              t = n.useCallback(
                function (t, r, n) {
                  return (
                    (e[t][r] = n),
                    function () {
                      e[t][r] = void 0;
                    }
                  );
                },
                [e]
              );
            return { keyedListeners: e, addKeyedListener: t };
          });
        var n = (function (e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" != typeof e && "function" != typeof e))
            return { default: e };
          var r = o(t);
          if (r && r.has(e)) return r.get(e);
          var n = {},
            a = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var u in e)
            if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {
              var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
              i && (i.get || i.set)
                ? Object.defineProperty(n, u, i)
                : (n[u] = e[u]);
            }
          (n.default = e), r && r.set(e, n);
          return n;
        })(r(0));
        function o(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (o = function (e) {
            return e ? r : t;
          })(e);
        }
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.key,
              r = e.options,
              n = e.navigation,
              i = o.useRef(r),
              f = o.useRef({}),
              l = o.useContext(a.default).onOptionsChange,
              c = o.useContext(u.default).addOptionsGetter,
              s = o.useCallback(
                function () {
                  var e,
                    t,
                    r =
                      null === (e = null == n ? void 0 : n.isFocused()) ||
                      void 0 === e ||
                      e,
                    o = Object.keys(f.current).length;
                  r &&
                    !o &&
                    l(null !== (t = i.current) && void 0 !== t ? t : {});
                },
                [n, l]
              );
            o.useEffect(
              function () {
                return (
                  (i.current = r),
                  s(),
                  null == n ? void 0 : n.addListener("focus", s)
                );
              },
              [n, r, s]
            );
            var d = o.useCallback(function () {
                for (var e in f.current)
                  if (f.current.hasOwnProperty(e)) {
                    var t,
                      r,
                      n =
                        null === (t = (r = f.current)[e]) || void 0 === t
                          ? void 0
                          : t.call(r);
                    if (null !== n) return n;
                  }
                return null;
              }, []),
              p = o.useCallback(
                function () {
                  var e;
                  if (
                    !(
                      null === (e = null == n ? void 0 : n.isFocused()) ||
                      void 0 === e ||
                      e
                    )
                  )
                    return null;
                  var t = d();
                  return null !== t ? t : i.current;
                },
                [n, d]
              );
            return (
              o.useEffect(
                function () {
                  return null == c ? void 0 : c(t, p);
                },
                [p, c, t]
              ),
              {
                addOptionsGetter: o.useCallback(
                  function (e, t) {
                    return (
                      (f.current[e] = t),
                      s(),
                      function () {
                        delete f.current[e], s();
                      }
                    );
                  },
                  [s]
                ),
                getCurrentOptions: p,
              }
            );
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
          })(r(0)),
          a = n(r(7)),
          u = n(r(13));
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
            var t = n.useContext(u),
              r = t.scheduleUpdate,
              o = t.flushUpdates;
            r(e), n.useEffect(o);
          }),
          (t.ScheduleUpdateContext = void 0);
        var n = (function (e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" != typeof e && "function" != typeof e))
            return { default: e };
          var r = o(t);
          if (r && r.has(e)) return r.get(e);
          var n = {},
            a = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var u in e)
            if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {
              var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
              i && (i.get || i.set)
                ? Object.defineProperty(n, u, i)
                : (n[u] = e[u]);
            }
          (n.default = e), r && r.set(e, n);
          return n;
        })(r(0));
        function o(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (o = function (e) {
            return e ? r : t;
          })(e);
        }
        var a = "Couldn't find a schedule context.",
          u = n.createContext({
            scheduleUpdate: function () {
              throw new Error(a);
            },
            flushUpdates: function () {
              throw new Error(a);
            },
          });
        t.ScheduleUpdateContext = u;
      },
      (e, t) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            return null;
          });
      },
      (e, t) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            return null;
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
          for (var u in e)
            if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {
              var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
              i && (i.get || i.set)
                ? Object.defineProperty(o, u, i)
                : (o[u] = e[u]);
            }
          (o.default = e), r && r.set(e, o);
          return o;
        })(r(0)).createContext(void 0);
        t.default = o;
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = a.useMemo(function () {
              return { current: new Map() };
            }, []);
            return e;
            return (
              (t.current = e.reduce(function (e, r) {
                var n = t.current.get(r);
                if (n) e.set(r, n);
                else {
                  var a = r.state,
                    u = (0, o.default)(r, ["state"]);
                  Object.defineProperty(u, i, { enumerable: !1, value: a }),
                    e.set(r, u);
                }
                return e;
              }, new Map())),
              Array.from(t.current.values())
            );
          }),
          (t.CHILD_STATE = void 0);
        var o = n(r(6)),
          a = (function (e, t) {
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
          })(r(0));
        function u(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (u = function (e) {
            return e ? r : t;
          })(e);
        }
        var i = Symbol("CHILD_STATE");
        t.CHILD_STATE = i;
      },
      (e) => {
        "use strict";
        e.exports = function (e) {
          return encodeURIComponent(e).replace(/[!'()*]/g, function (e) {
            return "%" + e.charCodeAt(0).toString(16).toUpperCase();
          });
        };
      },
      (e) => {
        "use strict";
        var t = "%[a-f0-9]{2}",
          r = new RegExp(t, "gi"),
          n = new RegExp("(" + t + ")+", "gi");
        function o(e, t) {
          try {
            return decodeURIComponent(e.join(""));
          } catch (e) {}
          if (1 === e.length) return e;
          t = t || 1;
          var r = e.slice(0, t),
            n = e.slice(t);
          return Array.prototype.concat.call([], o(r), o(n));
        }
        function a(e) {
          try {
            return decodeURIComponent(e);
          } catch (a) {
            for (var t = e.match(r), n = 1; n < t.length; n++)
              t = (e = o(t, n).join("")).match(r);
            return e;
          }
        }
        e.exports = function (e) {
          if ("string" != typeof e)
            throw new TypeError(
              "Expected `encodedURI` to be of type `string`, got `" +
                typeof e +
                "`"
            );
          try {
            return (e = e.replace(/\+/g, " ")), decodeURIComponent(e);
          } catch (t) {
            return (function (e) {
              for (
                var t = { "%FE%FF": "��", "%FF%FE": "��" }, r = n.exec(e);
                r;

              ) {
                try {
                  t[r[0]] = decodeURIComponent(r[0]);
                } catch (e) {
                  var o = a(r[0]);
                  o !== r[0] && (t[r[0]] = o);
                }
                r = n.exec(e);
              }
              t["%C2"] = "�";
              for (var u = Object.keys(t), i = 0; i < u.length; i++) {
                var f = u[i];
                e = e.replace(new RegExp(f, "g"), t[f]);
              }
              return e;
            })(e);
          }
        };
      },
      (e) => {
        "use strict";
        e.exports = function (e, t) {
          if ("string" != typeof e || "string" != typeof t)
            throw new TypeError(
              "Expected the arguments to be of type `string`"
            );
          if ("" === t) return [e];
          var r = e.indexOf(t);
          return -1 === r ? [e] : [e.slice(0, r), e.slice(r + t.length)];
        };
      },
      (e) => {
        "use strict";
        e.exports = function (e, t) {
          for (
            var r = {}, n = Object.keys(e), o = Array.isArray(t), a = 0;
            a < n.length;
            a++
          ) {
            var u = n[a],
              i = e[u];
            (o ? -1 !== t.indexOf(u) : t(u, i, e)) && (r[u] = i);
          }
          return r;
        };
      },
      (e) => {
        "use strict";
        e.exports = function (e) {
          if ("string" != typeof e) throw new TypeError("Expected a string");
          return e
            .replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
            .replace(/-/g, "\\x2d");
        };
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
          for (var u in e)
            if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {
              var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
              i && (i.get || i.set)
                ? Object.defineProperty(o, u, i)
                : (o[u] = e[u]);
            }
          (o.default = e), r && r.set(e, o);
          return o;
        })(r(0)).createContext(void 0);
        t.default = o;
      },
      (e, t) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e, t) {
            return (
              e.length === t.length &&
              e.every(function (e, r) {
                return e === t[r];
              })
            );
          });
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function () {
            var e = a.useContext(o.NavigationContainerRefContext),
              t = a.useContext(u.default);
            return a.useCallback(
              function (r) {
                if (void 0 === e)
                  throw new Error(
                    "Couldn't find a navigation object. Is your component inside NavigationContainer?"
                  );
                if ("string" == typeof r) {
                  if (!r.startsWith("/"))
                    throw new Error(
                      "The path must start with '/' (" + r + ")."
                    );
                  var n = t.options,
                    a =
                      null != n && n.getStateFromPath
                        ? n.getStateFromPath(r, n.config)
                        : (0, o.getStateFromPath)(
                            r,
                            null == n ? void 0 : n.config
                          );
                  if (!a)
                    throw new Error(
                      "Failed to parse the path to a navigation state."
                    );
                  var u = (0, o.getActionFromState)(
                    a,
                    null == n ? void 0 : n.config
                  );
                  void 0 !== u ? e.dispatch(u) : e.reset(a);
                } else root.navigate(r.screen, r.params);
              },
              [t, e]
            );
          });
        var o = r(5),
          a = (function (e, t) {
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
          })(r(0)),
          u = n(r(26));
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
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.value,
              r = e.children;
            return o.createElement(a.default.Provider, { value: t }, r);
          });
        var o = (function (e, t) {
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
          })(r(0)),
          a = n(r(58));
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
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var o = (function (e, t) {
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
          })(r(0)),
          a = n(r(27));
        function u(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (u = function (e) {
            return e ? r : t;
          })(e);
        }
        var i = o.createContext(a.default);
        i.displayName = "ThemeContext";
        var f = i;
        t.default = f;
      },
      (e, t, r) => {
        e.exports = r(60);
      },
      (e) => {
        var t = (function (e) {
          "use strict";
          var t,
            r = Object.prototype,
            n = r.hasOwnProperty,
            o = "function" == typeof Symbol ? Symbol : {},
            a = o.iterator || "@@iterator",
            u = o.asyncIterator || "@@asyncIterator",
            i = o.toStringTag || "@@toStringTag";
          function f(e, t, r) {
            return (
              Object.defineProperty(e, t, {
                value: r,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              }),
              e[t]
            );
          }
          try {
            f({}, "");
          } catch (e) {
            f = function (e, t, r) {
              return (e[t] = r);
            };
          }
          function l(e, t, r, n) {
            var o = t && t.prototype instanceof g ? t : g,
              a = Object.create(o.prototype),
              u = new S(n || []);
            return (
              (a._invoke = (function (e, t, r) {
                var n = s;
                return function (o, a) {
                  if (n === p) throw new Error("Generator is already running");
                  if (n === v) {
                    if ("throw" === o) throw a;
                    return R();
                  }
                  for (r.method = o, r.arg = a; ; ) {
                    var u = r.delegate;
                    if (u) {
                      var i = _(u, r);
                      if (i) {
                        if (i === y) continue;
                        return i;
                      }
                    }
                    if ("next" === r.method) r.sent = r._sent = r.arg;
                    else if ("throw" === r.method) {
                      if (n === s) throw ((n = v), r.arg);
                      r.dispatchException(r.arg);
                    } else "return" === r.method && r.abrupt("return", r.arg);
                    n = p;
                    var f = c(e, t, r);
                    if ("normal" === f.type) {
                      if (((n = r.done ? v : d), f.arg === y)) continue;
                      return { value: f.arg, done: r.done };
                    }
                    "throw" === f.type &&
                      ((n = v), (r.method = "throw"), (r.arg = f.arg));
                  }
                };
              })(e, r, u)),
              a
            );
          }
          function c(e, t, r) {
            try {
              return { type: "normal", arg: e.call(t, r) };
            } catch (e) {
              return { type: "throw", arg: e };
            }
          }
          e.wrap = l;
          var s = "suspendedStart",
            d = "suspendedYield",
            p = "executing",
            v = "completed",
            y = {};
          function g() {}
          function b() {}
          function m() {}
          var h = {};
          f(h, a, function () {
            return this;
          });
          var O = Object.getPrototypeOf,
            j = O && O(O(C([])));
          j && j !== r && n.call(j, a) && (h = j);
          var P = (m.prototype = g.prototype = Object.create(h));
          function w(e) {
            ["next", "throw", "return"].forEach(function (t) {
              f(e, t, function (e) {
                return this._invoke(t, e);
              });
            });
          }
          function k(e, t) {
            function r(o, a, u, i) {
              var f = c(e[o], e, a);
              if ("throw" !== f.type) {
                var l = f.arg,
                  s = l.value;
                return s && "object" == typeof s && n.call(s, "__await")
                  ? t.resolve(s.__await).then(
                      function (e) {
                        r("next", e, u, i);
                      },
                      function (e) {
                        r("throw", e, u, i);
                      }
                    )
                  : t.resolve(s).then(
                      function (e) {
                        (l.value = e), u(l);
                      },
                      function (e) {
                        return r("throw", e, u, i);
                      }
                    );
              }
              i(f.arg);
            }
            var o;
            this._invoke = function (e, n) {
              function a() {
                return new t(function (t, o) {
                  r(e, n, t, o);
                });
              }
              return (o = o ? o.then(a, a) : a());
            };
          }
          function _(e, r) {
            var n = e.iterator[r.method];
            if (n === t) {
              if (((r.delegate = null), "throw" === r.method)) {
                if (
                  e.iterator.return &&
                  ((r.method = "return"),
                  (r.arg = t),
                  _(e, r),
                  "throw" === r.method)
                )
                  return y;
                (r.method = "throw"),
                  (r.arg = new TypeError(
                    "The iterator does not provide a 'throw' method"
                  ));
              }
              return y;
            }
            var o = c(n, e.iterator, r.arg);
            if ("throw" === o.type)
              return (
                (r.method = "throw"), (r.arg = o.arg), (r.delegate = null), y
              );
            var a = o.arg;
            return a
              ? a.done
                ? ((r[e.resultName] = a.value),
                  (r.next = e.nextLoc),
                  "return" !== r.method && ((r.method = "next"), (r.arg = t)),
                  (r.delegate = null),
                  y)
                : a
              : ((r.method = "throw"),
                (r.arg = new TypeError("iterator result is not an object")),
                (r.delegate = null),
                y);
          }
          function M(e) {
            var t = { tryLoc: e[0] };
            1 in e && (t.catchLoc = e[1]),
              2 in e && ((t.finallyLoc = e[2]), (t.afterLoc = e[3])),
              this.tryEntries.push(t);
          }
          function x(e) {
            var t = e.completion || {};
            (t.type = "normal"), delete t.arg, (e.completion = t);
          }
          function S(e) {
            (this.tryEntries = [{ tryLoc: "root" }]),
              e.forEach(M, this),
              this.reset(!0);
          }
          function C(e) {
            if (e) {
              var r = e[a];
              if (r) return r.call(e);
              if ("function" == typeof e.next) return e;
              if (!isNaN(e.length)) {
                var o = -1,
                  u = function r() {
                    for (; ++o < e.length; )
                      if (n.call(e, o))
                        return (r.value = e[o]), (r.done = !1), r;
                    return (r.value = t), (r.done = !0), r;
                  };
                return (u.next = u);
              }
            }
            return { next: R };
          }
          function R() {
            return { value: t, done: !0 };
          }
          return (
            (b.prototype = m),
            f(P, "constructor", m),
            f(m, "constructor", b),
            (b.displayName = f(m, i, "GeneratorFunction")),
            (e.isGeneratorFunction = function (e) {
              var t = "function" == typeof e && e.constructor;
              return (
                !!t &&
                (t === b || "GeneratorFunction" === (t.displayName || t.name))
              );
            }),
            (e.mark = function (e) {
              return (
                Object.setPrototypeOf
                  ? Object.setPrototypeOf(e, m)
                  : ((e.__proto__ = m), f(e, i, "GeneratorFunction")),
                (e.prototype = Object.create(P)),
                e
              );
            }),
            (e.awrap = function (e) {
              return { __await: e };
            }),
            w(k.prototype),
            f(k.prototype, u, function () {
              return this;
            }),
            (e.AsyncIterator = k),
            (e.async = function (t, r, n, o, a) {
              void 0 === a && (a = Promise);
              var u = new k(l(t, r, n, o), a);
              return e.isGeneratorFunction(r)
                ? u
                : u.next().then(function (e) {
                    return e.done ? e.value : u.next();
                  });
            }),
            w(P),
            f(P, i, "Generator"),
            f(P, a, function () {
              return this;
            }),
            f(P, "toString", function () {
              return "[object Generator]";
            }),
            (e.keys = function (e) {
              var t = [];
              for (var r in e) t.push(r);
              return (
                t.reverse(),
                function r() {
                  for (; t.length; ) {
                    var n = t.pop();
                    if (n in e) return (r.value = n), (r.done = !1), r;
                  }
                  return (r.done = !0), r;
                }
              );
            }),
            (e.values = C),
            (S.prototype = {
              constructor: S,
              reset: function (e) {
                if (
                  ((this.prev = 0),
                  (this.next = 0),
                  (this.sent = this._sent = t),
                  (this.done = !1),
                  (this.delegate = null),
                  (this.method = "next"),
                  (this.arg = t),
                  this.tryEntries.forEach(x),
                  !e)
                )
                  for (var r in this)
                    "t" === r.charAt(0) &&
                      n.call(this, r) &&
                      !isNaN(+r.slice(1)) &&
                      (this[r] = t);
              },
              stop: function () {
                this.done = !0;
                var e = this.tryEntries[0].completion;
                if ("throw" === e.type) throw e.arg;
                return this.rval;
              },
              dispatchException: function (e) {
                if (this.done) throw e;
                var r = this;
                function o(n, o) {
                  return (
                    (i.type = "throw"),
                    (i.arg = e),
                    (r.next = n),
                    o && ((r.method = "next"), (r.arg = t)),
                    !!o
                  );
                }
                for (var a = this.tryEntries.length - 1; a >= 0; --a) {
                  var u = this.tryEntries[a],
                    i = u.completion;
                  if ("root" === u.tryLoc) return o("end");
                  if (u.tryLoc <= this.prev) {
                    var f = n.call(u, "catchLoc"),
                      l = n.call(u, "finallyLoc");
                    if (f && l) {
                      if (this.prev < u.catchLoc) return o(u.catchLoc, !0);
                      if (this.prev < u.finallyLoc) return o(u.finallyLoc);
                    } else if (f) {
                      if (this.prev < u.catchLoc) return o(u.catchLoc, !0);
                    } else {
                      if (!l)
                        throw new Error(
                          "try statement without catch or finally"
                        );
                      if (this.prev < u.finallyLoc) return o(u.finallyLoc);
                    }
                  }
                }
              },
              abrupt: function (e, t) {
                for (var r = this.tryEntries.length - 1; r >= 0; --r) {
                  var o = this.tryEntries[r];
                  if (
                    o.tryLoc <= this.prev &&
                    n.call(o, "finallyLoc") &&
                    this.prev < o.finallyLoc
                  ) {
                    var a = o;
                    break;
                  }
                }
                a &&
                  ("break" === e || "continue" === e) &&
                  a.tryLoc <= t &&
                  t <= a.finallyLoc &&
                  (a = null);
                var u = a ? a.completion : {};
                return (
                  (u.type = e),
                  (u.arg = t),
                  a
                    ? ((this.method = "next"), (this.next = a.finallyLoc), y)
                    : this.complete(u)
                );
              },
              complete: function (e, t) {
                if ("throw" === e.type) throw e.arg;
                return (
                  "break" === e.type || "continue" === e.type
                    ? (this.next = e.arg)
                    : "return" === e.type
                    ? ((this.rval = this.arg = e.arg),
                      (this.method = "return"),
                      (this.next = "end"))
                    : "normal" === e.type && t && (this.next = t),
                  y
                );
              },
              finish: function (e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                  var r = this.tryEntries[t];
                  if (r.finallyLoc === e)
                    return this.complete(r.completion, r.afterLoc), x(r), y;
                }
              },
              catch: function (e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                  var r = this.tryEntries[t];
                  if (r.tryLoc === e) {
                    var n = r.completion;
                    if ("throw" === n.type) {
                      var o = n.arg;
                      x(r);
                    }
                    return o;
                  }
                }
                throw new Error("illegal catch attempt");
              },
              delegateYield: function (e, r, n) {
                return (
                  (this.delegate = {
                    iterator: C(e),
                    resultName: r,
                    nextLoc: n,
                  }),
                  "next" === this.method && (this.arg = t),
                  y
                );
              },
            }),
            e
          );
        })(e.exports);
        try {
          regeneratorRuntime = t;
        } catch (e) {
          "object" == typeof globalThis
            ? (globalThis.regeneratorRuntime = t)
            : Function("r", "regeneratorRuntime = r")(t);
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
          for (var u in e)
            if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {
              var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
              i && (i.get || i.set)
                ? Object.defineProperty(o, u, i)
                : (o[u] = e[u]);
            }
          (o.default = e), r && r.set(e, o);
          return o;
        })(r(0)).createContext(void 0);
        t.default = o;
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.to,
              r = e.action,
              n = (0, a.default)(e, ["to", "action"]),
              l = (0, f.default)({ to: t, action: r }),
              c = function (e) {
                var t;
                "onPress" in n &&
                  (null === (t = n.onPress) || void 0 === t || t.call(n, e));
                l.onPress(e);
              };
            return u.createElement(
              i.Text,
              (0, o.default)(
                {},
                l,
                n,
                i.Platform.select({
                  web: { onClick: c },
                  default: { onPress: c },
                })
              )
            );
          });
        var o = n(r(2)),
          a = n(r(6)),
          u = (function (e, t) {
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
                var u = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                u && (u.get || u.set)
                  ? Object.defineProperty(n, a, u)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(0)),
          i = r(18),
          f = n(r(37));
        function l(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (l = function (e) {
            return e ? r : t;
          })(e);
        }
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var o = n(r(3)),
          a = n(r(2)),
          u = n(r(6)),
          i = r(8),
          f = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = k(t);
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
          })(r(0)),
          l = (n(r(68)), n(r(69)), r(20)),
          c = n(r(21)),
          s = n(r(22)),
          d = n(r(7)),
          p = n(r(23)),
          v = n(r(12)),
          y = n(r(10)),
          g = n(r(13)),
          b = n(r(39)),
          m = n(r(40)),
          h = n(r(41)),
          O = n(r(42)),
          j = n(r(43)),
          P = r(44),
          w = n(r(70));
        function k(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (k = function (e) {
            return e ? r : t;
          })(e);
        }
        var _ = function e(t) {
            if (void 0 !== t) {
              t.key, t.routeNames;
              var r = (0, u.default)(t, ["key", "routeNames"]);
              return (0, a.default)({}, r, {
                stale: !0,
                routes: t.routes.map(function (t) {
                  return void 0 === t.state
                    ? t
                    : (0, a.default)({}, t, { state: e(t.state) });
                }),
              });
            }
          },
          M = f.forwardRef(function (e, t) {
            var r = e.initialState,
              n = e.onStateChange,
              u = e.onUnhandledAction,
              k = e.independent,
              M = e.children;
            if (!f.useContext(g.default).isDefault && !k)
              throw new Error(
                "Looks like you have nested a 'NavigationContainer' inside another. Normally you need only one container at the root of the app, so this was probably an error. If this was intentional, pass 'independent={true}' explicitly. Note that this will make the child navigators disconnected from the parent and you won't be able to navigate between them."
              );
            var x = (0, w.default)(function () {
                return _(null == r ? void 0 : r);
              }),
              S = (0, o.default)(x, 5),
              C = S[0],
              R = S[1],
              E = S[2],
              W = S[3],
              A = S[4],
              N = f.useRef(!0),
              D = f.useRef(),
              L = f.useCallback(function () {
                return D.current;
              }, []),
              F = f.useCallback(function (e) {
                D.current = e;
              }, []),
              I = (0, m.default)(),
              T = I.listeners,
              G = I.addListener,
              $ = (0, O.default)(),
              U = $.keyedListeners,
              B = $.addKeyedListener,
              K = f.useCallback(
                function (e) {
                  null == T.focus[0]
                    ? console.error(l.NOT_INITIALIZED_ERROR)
                    : T.focus[0](function (t) {
                        return t.dispatch(e);
                      });
                },
                [T.focus]
              ),
              V = f.useCallback(
                function () {
                  if (null == T.focus[0]) return !1;
                  var e = T.focus[0](function (e) {
                      return e.canGoBack();
                    }),
                    t = e.result;
                  return !!e.handled && t;
                },
                [T.focus]
              ),
              H = f.useCallback(
                function (e) {
                  var t,
                    r,
                    n,
                    o =
                      null !== (t = null == e ? void 0 : e.key) && void 0 !== t
                        ? t
                        : null === (r = (n = U.getState).root) || void 0 === r
                        ? void 0
                        : r.call(n).key;
                  null == o
                    ? console.error(l.NOT_INITIALIZED_ERROR)
                    : T.focus[0](function (t) {
                        return t.dispatch(
                          (0, a.default)({}, i.CommonActions.reset(e), {
                            target: o,
                          })
                        );
                      });
                },
                [U.getState, T.focus]
              ),
              z = f.useCallback(
                function () {
                  var e, t;
                  return null === (e = (t = U.getState).root) || void 0 === e
                    ? void 0
                    : e.call(t);
                },
                [U.getState]
              ),
              Y = f.useCallback(
                function () {
                  var e = z();
                  if (null != e) return (0, s.default)(e);
                },
                [z]
              ),
              q = (0, h.default)(),
              Z = (0, j.default)({}),
              J = Z.addOptionsGetter,
              Q = Z.getCurrentOptions,
              X = f.useMemo(
                function () {
                  return (0, a.default)(
                    {},
                    Object.keys(i.CommonActions).reduce(function (e, t) {
                      return (
                        (e[t] = function () {
                          return K(
                            i.CommonActions[t].apply(i.CommonActions, arguments)
                          );
                        }),
                        e
                      );
                    }, {}),
                    q.create("root"),
                    {
                      resetRoot: H,
                      dispatch: K,
                      canGoBack: V,
                      getRootState: z,
                      getState: function () {
                        return ce.current;
                      },
                      getParent: function () {},
                      getCurrentRoute: Y,
                      getCurrentOptions: Q,
                      isReady: function () {
                        return null != T.focus[0];
                      },
                    }
                  );
                },
                [V, K, q, Q, Y, z, T.focus, H]
              );
            f.useImperativeHandle(
              t,
              function () {
                return X;
              },
              [X]
            );
            var ee = f.useCallback(
                function (e, t) {
                  q.emit({
                    type: "__unsafe_action__",
                    data: { action: e, noop: t, stack: ne.current },
                  });
                },
                [q]
              ),
              te = f.useRef(),
              re = f.useCallback(
                function (e) {
                  te.current !== e &&
                    ((te.current = e),
                    q.emit({ type: "options", data: { options: e } }));
                },
                [q]
              ),
              ne = f.useRef(),
              oe = f.useMemo(
                function () {
                  return {
                    addListener: G,
                    addKeyedListener: B,
                    onDispatchAction: ee,
                    onOptionsChange: re,
                    stackRef: ne,
                  };
                },
                [G, B, ee, re]
              ),
              ae = f.useMemo(
                function () {
                  return { scheduleUpdate: W, flushUpdates: A };
                },
                [W, A]
              ),
              ue = f.useRef(!0),
              ie = f.useCallback(function () {
                return ue.current;
              }, []),
              fe = f.useMemo(
                function () {
                  return {
                    state: C,
                    getState: R,
                    setState: E,
                    getKey: L,
                    setKey: F,
                    getIsInitial: ie,
                    addOptionsGetter: J,
                  };
                },
                [C, R, E, L, F, ie, J]
              ),
              le = f.useRef(n),
              ce = f.useRef(C);
            f.useEffect(function () {
              (ue.current = !1), (le.current = n), (ce.current = C);
            }),
              f.useEffect(
                function () {
                  var e = z();
                  q.emit({ type: "state", data: { state: C } }),
                    !N.current && le.current && le.current(e),
                    (N.current = !1);
                },
                [z, q, C]
              );
            var se = f.useCallback(function (e) {}, []),
              de = f.createElement(
                p.default.Provider,
                { value: X },
                f.createElement(
                  P.ScheduleUpdateContext.Provider,
                  { value: ae },
                  f.createElement(
                    d.default.Provider,
                    { value: oe },
                    f.createElement(
                      g.default.Provider,
                      { value: fe },
                      f.createElement(
                        b.default.Provider,
                        { value: null != u ? u : se },
                        f.createElement(c.default, null, M)
                      )
                    )
                  )
                )
              );
            return (
              k &&
                (de = f.createElement(
                  y.default.Provider,
                  { value: void 0 },
                  f.createElement(v.default.Provider, { value: void 0 }, de)
                )),
              de
            );
          });
        t.default = M;
      },
      (e, t) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.goBack = function () {
            return { type: "GO_BACK" };
          }),
          (t.navigate = function () {
            if (
              "string" == typeof (arguments.length <= 0 ? void 0 : arguments[0])
            )
              return {
                type: "NAVIGATE",
                payload: {
                  name: arguments.length <= 0 ? void 0 : arguments[0],
                  params: arguments.length <= 1 ? void 0 : arguments[1],
                },
              };
            var e = (arguments.length <= 0 ? void 0 : arguments[0]) || {};
            if (!e.hasOwnProperty("key") && !e.hasOwnProperty("name"))
              throw new Error(
                "You need to specify name or key when calling navigate with an object as the argument. See https://reactnavigation.org/docs/navigation-actions#navigate for usage."
              );
            return { type: "NAVIGATE", payload: e };
          }),
          (t.reset = function (e) {
            return { type: "RESET", payload: e };
          }),
          (t.setParams = function (e) {
            return { type: "SET_PARAMS", payload: { params: e } };
          });
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.defaultStatus,
              r = (0, o.default)(e, ["defaultStatus"]),
              n = (0, f.default)(r);
            return (0, u.default)({}, n, {
              type: "drawer",
              getInitialState: function (e) {
                var r = e.routeNames,
                  o = e.routeParamList,
                  a = e.routeGetIdList,
                  f = n.getInitialState({
                    routeNames: r,
                    routeParamList: o,
                    routeGetIdList: a,
                  });
                return (
                  "open" === t && (f = d(f)),
                  (0, u.default)({}, f, {
                    stale: !1,
                    type: "drawer",
                    key: "drawer-" + (0, i.nanoid)(),
                  })
                );
              },
              getRehydratedState: function (e, t) {
                var r = t.routeNames,
                  o = t.routeParamList,
                  a = t.routeGetIdList;
                if (!1 === e.stale) return e;
                var f = n.getRehydratedState(e, {
                  routeNames: r,
                  routeParamList: o,
                  routeGetIdList: a,
                });
                return (
                  s(e) && (f = d(f)),
                  (0, u.default)({}, f, {
                    type: "drawer",
                    key: "drawer-" + (0, i.nanoid)(),
                  })
                );
              },
              getStateForRouteFocus: function (e, r) {
                var o = n.getStateForRouteFocus(e, r);
                return "open" === t ? d(o) : p(o);
              },
              getStateForAction: function (e, r, o) {
                switch (r.type) {
                  case "OPEN_DRAWER":
                    return d(e);
                  case "CLOSE_DRAWER":
                    return p(e);
                  case "TOGGLE_DRAWER":
                    return s(e) ? p(e) : d(e);
                  case "GO_BACK":
                    if ("open" === t) {
                      if (!s(e)) return d(e);
                    } else if (s(e)) return p(e);
                    return n.getStateForAction(e, r, o);
                  default:
                    return n.getStateForAction(e, r, o);
                }
              },
              actionCreators: c,
            });
          }),
          (t.DrawerActions = void 0);
        var o = n(r(6)),
          a = n(r(4)),
          u = n(r(2)),
          i = r(9),
          f = (function (e, t) {
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
                var u = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                u && (u.get || u.set)
                  ? Object.defineProperty(n, a, u)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(38));
        function l(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (l = function (e) {
            return e ? r : t;
          })(e);
        }
        var c = (0, u.default)({}, f.TabActions, {
          openDrawer: function () {
            return { type: "OPEN_DRAWER" };
          },
          closeDrawer: function () {
            return { type: "CLOSE_DRAWER" };
          },
          toggleDrawer: function () {
            return { type: "TOGGLE_DRAWER" };
          },
        });
        t.DrawerActions = c;
        var s = function (e) {
            var t;
            return Boolean(
              null === (t = e.history) || void 0 === t
                ? void 0
                : t.some(function (e) {
                    return "drawer" === e.type;
                  })
            );
          },
          d = function (e) {
            return s(e)
              ? e
              : (0, u.default)({}, e, {
                  history: [].concat((0, a.default)(e.history), [
                    { type: "drawer", status: "open" },
                  ]),
                });
          },
          p = function (e) {
            return s(e)
              ? (0, u.default)({}, e, {
                  history: e.history.filter(function (e) {
                    return "drawer" !== e.type;
                  }),
                })
              : e;
          };
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = (0, a.default)({}, i.default, {
              type: "stack",
              getInitialState: function (t) {
                var r = t.routeNames,
                  n = t.routeParamList,
                  o =
                    void 0 !== e.initialRouteName &&
                    r.includes(e.initialRouteName)
                      ? e.initialRouteName
                      : r[0];
                return {
                  stale: !1,
                  type: "stack",
                  key: "stack-" + (0, u.nanoid)(),
                  index: 0,
                  routeNames: r,
                  routes: [
                    { key: o + "-" + (0, u.nanoid)(), name: o, params: n[o] },
                  ],
                };
              },
              getRehydratedState: function (t, r) {
                var n = r.routeNames,
                  o = r.routeParamList,
                  i = t;
                if (!1 === i.stale) return i;
                var f = i.routes
                  .filter(function (e) {
                    return n.includes(e.name);
                  })
                  .map(function (e) {
                    return (0,
                    a.default)({}, e, { key: e.key || e.name + "-" + (0, u.nanoid)(), params: void 0 !== o[e.name] ? (0, a.default)({}, o[e.name], e.params) : e.params });
                  });
                if (0 === f.length) {
                  var l =
                    void 0 !== e.initialRouteName ? e.initialRouteName : n[0];
                  f.push({
                    key: l + "-" + (0, u.nanoid)(),
                    name: l,
                    params: o[l],
                  });
                }
                return {
                  stale: !1,
                  type: "stack",
                  key: "stack-" + (0, u.nanoid)(),
                  index: f.length - 1,
                  routeNames: n,
                  routes: f,
                };
              },
              getStateForRouteNamesChange: function (t, r) {
                var n = r.routeNames,
                  o = r.routeParamList,
                  i = t.routes.filter(function (e) {
                    return n.includes(e.name);
                  });
                if (0 === i.length) {
                  var f =
                    void 0 !== e.initialRouteName &&
                    n.includes(e.initialRouteName)
                      ? e.initialRouteName
                      : n[0];
                  i.push({
                    key: f + "-" + (0, u.nanoid)(),
                    name: f,
                    params: o[f],
                  });
                }
                return (0, a.default)({}, t, {
                  routeNames: n,
                  routes: i,
                  index: Math.min(t.index, i.length - 1),
                });
              },
              getStateForRouteFocus: function (e, t) {
                var r = e.routes.findIndex(function (e) {
                  return e.key === t;
                });
                return -1 === r || r === e.index
                  ? e
                  : (0, a.default)({}, e, {
                      index: r,
                      routes: e.routes.slice(0, r + 1),
                    });
              },
              getStateForAction: function (e, r, n) {
                var f = n.routeParamList;
                switch (r.type) {
                  case "REPLACE":
                    var l =
                      r.target === e.key && r.source
                        ? e.routes.findIndex(function (e) {
                            return e.key === r.source;
                          })
                        : e.index;
                    if (-1 === l) return null;
                    var c = r.payload,
                      s = c.name,
                      d = c.key,
                      p = c.params;
                    return e.routeNames.includes(s)
                      ? (0, a.default)({}, e, {
                          routes: e.routes.map(function (e, t) {
                            return t === l
                              ? {
                                  key:
                                    void 0 !== d
                                      ? d
                                      : s + "-" + (0, u.nanoid)(),
                                  name: s,
                                  params:
                                    void 0 !== f[s]
                                      ? (0, a.default)({}, f[s], p)
                                      : p,
                                }
                              : e;
                          }),
                        })
                      : null;
                  case "PUSH":
                    if (e.routeNames.includes(r.payload.name)) {
                      var v,
                        y = n.routeGetIdList[r.payload.name],
                        g =
                          null == y ? void 0 : y({ params: r.payload.params }),
                        b = g
                          ? e.routes.find(function (e) {
                              return (
                                e.name === r.payload.name &&
                                g ===
                                  (null == y ? void 0 : y({ params: e.params }))
                              );
                            })
                          : void 0;
                      return (
                        b
                          ? (v = e.routes.filter(function (e) {
                              return e.key !== b.key;
                            })).push(
                              (0, a.default)({}, b, {
                                params:
                                  void 0 !== f[r.payload.name]
                                    ? (0, a.default)(
                                        {},
                                        f[r.payload.name],
                                        r.payload.params
                                      )
                                    : r.payload.params,
                              })
                            )
                          : (v = [].concat((0, o.default)(e.routes), [
                              {
                                key: r.payload.name + "-" + (0, u.nanoid)(),
                                name: r.payload.name,
                                params:
                                  void 0 !== f[r.payload.name]
                                    ? (0, a.default)(
                                        {},
                                        f[r.payload.name],
                                        r.payload.params
                                      )
                                    : r.payload.params,
                              },
                            ])),
                        (0, a.default)({}, e, {
                          index: v.length - 1,
                          routes: v,
                        })
                      );
                    }
                    return null;
                  case "POP":
                    var m =
                      r.target === e.key && r.source
                        ? e.routes.findIndex(function (e) {
                            return e.key === r.source;
                          })
                        : e.index;
                    if (m > 0) {
                      var h = Math.max(m - r.payload.count + 1, 1),
                        O = e.routes.slice(0, h).concat(e.routes.slice(m + 1));
                      return (0, a.default)({}, e, {
                        index: O.length - 1,
                        routes: O,
                      });
                    }
                    return null;
                  case "POP_TO_TOP":
                    return t.getStateForAction(
                      e,
                      { type: "POP", payload: { count: e.routes.length - 1 } },
                      n
                    );
                  case "NAVIGATE":
                    if (
                      void 0 !== r.payload.name &&
                      !e.routeNames.includes(r.payload.name)
                    )
                      return null;
                    if (r.payload.key || r.payload.name) {
                      var j,
                        P = -1,
                        w =
                          void 0 === r.payload.key && void 0 !== r.payload.name
                            ? n.routeGetIdList[r.payload.name]
                            : void 0,
                        k =
                          null == w ? void 0 : w({ params: r.payload.params });
                      if (k)
                        P = e.routes.findIndex(function (e) {
                          return (
                            e.name === r.payload.name &&
                            k === (null == w ? void 0 : w({ params: e.params }))
                          );
                        });
                      else if (
                        (e.routes[e.index].name === r.payload.name &&
                          void 0 === r.payload.key) ||
                        e.routes[e.index].key === r.payload.key
                      )
                        P = e.index;
                      else
                        for (var _ = e.routes.length - 1; _ >= 0; _--)
                          if (
                            (e.routes[_].name === r.payload.name &&
                              void 0 === r.payload.key) ||
                            e.routes[_].key === r.payload.key
                          ) {
                            P = _;
                            break;
                          }
                      if (
                        -1 === P &&
                        r.payload.key &&
                        void 0 === r.payload.name
                      )
                        return null;
                      if (-1 === P && void 0 !== r.payload.name) {
                        var M,
                          x = [].concat((0, o.default)(e.routes), [
                            {
                              key:
                                null !== (M = r.payload.key) && void 0 !== M
                                  ? M
                                  : r.payload.name + "-" + (0, u.nanoid)(),
                              name: r.payload.name,
                              path: r.payload.path,
                              params:
                                void 0 !== f[r.payload.name]
                                  ? (0, a.default)(
                                      {},
                                      f[r.payload.name],
                                      r.payload.params
                                    )
                                  : r.payload.params,
                            },
                          ]);
                        return (0, a.default)({}, e, {
                          routes: x,
                          index: x.length - 1,
                        });
                      }
                      var S,
                        C = e.routes[P];
                      return (
                        (S = r.payload.merge
                          ? void 0 !== r.payload.params || void 0 !== f[C.name]
                            ? (0, a.default)(
                                {},
                                f[C.name],
                                C.params,
                                r.payload.params
                              )
                            : C.params
                          : r.payload.params),
                        (0, a.default)({}, e, {
                          index: P,
                          routes: [].concat(
                            (0, o.default)(e.routes.slice(0, P)),
                            [
                              S !== C.params ||
                              (r.payload.path && r.payload.path !== C.path)
                                ? (0, a.default)({}, C, {
                                    path:
                                      null !== (j = r.payload.path) &&
                                      void 0 !== j
                                        ? j
                                        : C.path,
                                    params: S,
                                  })
                                : e.routes[P],
                            ]
                          ),
                        })
                      );
                    }
                    return null;
                  case "GO_BACK":
                    return e.index > 0
                      ? t.getStateForAction(
                          e,
                          {
                            type: "POP",
                            payload: { count: 1 },
                            target: r.target,
                            source: r.source,
                          },
                          n
                        )
                      : null;
                  default:
                    return i.default.getStateForAction(e, r);
                }
              },
              actionCreators: f,
            });
            return t;
          }),
          (t.StackActions = void 0);
        var o = n(r(4)),
          a = n(r(2)),
          u = r(9),
          i = n(r(19)),
          f = {
            replace: function (e, t) {
              return { type: "REPLACE", payload: { name: e, params: t } };
            },
            push: function (e, t) {
              return { type: "PUSH", payload: { name: e, params: t } };
            },
            pop: function () {
              var e =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : 1;
              return { type: "POP", payload: { count: e } };
            },
            popToTop: function () {
              return { type: "POP_TO_TOP" };
            },
          };
        t.StackActions = f;
      },
      (e, t) => {
        Object.defineProperty(t, "__esModule", { value: !0 });
      },
      (e, t) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = [];
            return (
              (function e(r, n) {
                n.routes.forEach(function (n) {
                  var o,
                    a,
                    u = r ? r + " > " + n.name : n.name;
                  null === (o = n.state) ||
                    void 0 === o ||
                    null === (a = o.routeNames) ||
                    void 0 === a ||
                    a.forEach(function (e) {
                      e === n.name && t.push([u, u + " > " + n.name]);
                    }),
                    n.state && e(u, n.state);
                });
              })("", e),
              t
            );
          });
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            return a(e, new Set(), []);
          });
        var o = n(r(4)),
          a = function e(t, r, n) {
            if (
              null == t ||
              "boolean" == typeof t ||
              "number" == typeof t ||
              "string" == typeof t
            )
              return { serializable: !0 };
            if (
              "[object Object]" !== Object.prototype.toString.call(t) &&
              !Array.isArray(t)
            )
              return {
                serializable: !1,
                location: n,
                reason: "function" == typeof t ? "Function" : String(t),
              };
            if (r.has(t))
              return {
                serializable: !1,
                reason: "Circular reference",
                location: n,
              };
            if ((r.add(t), Array.isArray(t)))
              for (var a = 0; a < t.length; a++) {
                var u = e(t[a], new Set(r), [].concat((0, o.default)(n), [a]));
                if (!u.serializable) return u;
              }
            else
              for (var i in t) {
                var f = e(t[i], new Set(r), [].concat((0, o.default)(n), [i]));
                if (!f.serializable) return f;
              }
            return { serializable: !0 };
          };
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = a.useRef(i),
              r = a.useRef(!1),
              n = a.useRef(!0);
            a.useEffect(function () {
              return (
                (n.current = !0),
                function () {
                  n.current = !1;
                }
              );
            }, []),
              t.current === i && (t.current = "function" == typeof e ? e() : e);
            var u = a.useState(t.current),
              f = (0, o.default)(u, 2),
              l = f[0],
              c = f[1],
              s = a.useCallback(function () {
                return t.current;
              }, []),
              d = a.useCallback(function (e) {
                e !== t.current &&
                  n.current &&
                  ((t.current = e), r.current || c(e));
              }, []),
              p = a.useCallback(function (e) {
                r.current = !0;
                try {
                  e();
                } finally {
                  r.current = !1;
                }
              }, []),
              v = a.useCallback(function () {
                n.current && c(t.current);
              }, []);
            l !== t.current && c(t.current);
            var y = t.current;
            return a.useDebugValue(y), [y, s, d, p, v];
          });
        var o = n(r(3)),
          a = (function (e, t) {
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
          })(r(0));
        function u(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (u = function (e) {
            return e ? r : t;
          })(e);
        }
        var i = {};
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            return function () {
              if (void 0 !== arguments[0])
                throw new Error(
                  "Creating a navigator doesn't take an argument. Maybe you are trying to use React Navigation 4 API with React Navigation 5? See https://reactnavigation.org/docs/upgrading-from-4.x for migration guide."
                );
              return { Navigator: e, Group: o.default, Screen: a.default };
            };
          });
        var o = n(r(45)),
          a = n(r(46));
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e, t) {
            var r,
              n,
              o = t ? u(t) : {},
              i = null != e.index ? e.routes.slice(0, e.index + 1) : e.routes;
            if (0 === i.length) return;
            if (
              !(
                (1 === i.length && void 0 === i[0].key) ||
                (2 === i.length &&
                  void 0 === i[0].key &&
                  i[0].name === (null == o ? void 0 : o.initialRouteName) &&
                  void 0 === i[1].key)
              )
            )
              return { type: "RESET", payload: e };
            var f =
                e.routes[
                  null !== (r = e.index) && void 0 !== r
                    ? r
                    : e.routes.length - 1
                ],
              l = null == f ? void 0 : f.state,
              c =
                null == o || null === (n = o.screens) || void 0 === n
                  ? void 0
                  : n[null == f ? void 0 : f.name],
              s = (0, a.default)({}, f.params),
              d = f ? { name: f.name, path: f.path, params: s } : void 0;
            for (; l; ) {
              var p, v, y;
              if (0 === l.routes.length) return;
              var g =
                  null != l.index ? l.routes.slice(0, l.index + 1) : l.routes,
                b = g[g.length - 1];
              if (
                ((0, a.default)(s, {
                  initial: void 0,
                  screen: void 0,
                  params: void 0,
                  state: void 0,
                }),
                1 === g.length && void 0 === g[0].key)
              )
                (s.initial = !0), (s.screen = b.name);
              else {
                if (
                  2 !== g.length ||
                  void 0 !== g[0].key ||
                  g[0].name !==
                    (null === (p = c) || void 0 === p
                      ? void 0
                      : p.initialRouteName) ||
                  void 0 !== g[1].key
                ) {
                  s.state = l;
                  break;
                }
                (s.initial = !1), (s.screen = b.name);
              }
              b.state
                ? ((s.params = (0, a.default)({}, b.params)), (s = s.params))
                : ((s.path = b.path), (s.params = b.params)),
                (l = b.state),
                (c =
                  null === (v = c) ||
                  void 0 === v ||
                  null === (y = v.screens) ||
                  void 0 === y
                    ? void 0
                    : y[b.name]);
            }
            if (!d) return;
            return { type: "NAVIGATE", payload: d };
          });
        var o = n(r(3)),
          a = n(r(2));
        var u = function (e) {
            return "object" == typeof e && null != e
              ? {
                  initialRouteName: e.initialRouteName,
                  screens: null != e.screens ? i(e.screens) : void 0,
                }
              : {};
          },
          i = function (e) {
            return Object.entries(e).reduce(function (e, t) {
              var r = (0, o.default)(t, 2),
                n = r[0],
                a = r[1];
              return (e[n] = u(a)), e;
            }, {});
          };
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t,
              r,
              o = null !== (t = e[n.CHILD_STATE]) && void 0 !== t ? t : e.state,
              a = e.params;
            return o
              ? o.routes[
                  null !== (r = o.index) && void 0 !== r
                    ? r
                    : "string" == typeof o.type && "stack" !== o.type
                    ? 0
                    : o.routes.length - 1
                ].name
              : "string" == typeof (null == a ? void 0 : a.screen)
              ? a.screen
              : void 0;
          });
        var n = r(48);
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e, t) {
            if (null == e)
              throw Error(
                "Got 'undefined' for the navigation state. You must pass a valid state object."
              );
            t && (0, l.default)(t);
            var r =
                null != t && t.screens ? y(null == t ? void 0 : t.screens) : {},
              n = "/",
              o = e,
              c = {},
              p = function () {
                for (
                  var t = "number" == typeof o.index ? o.index : 0,
                    l = o.routes[t],
                    p = void 0,
                    y = void 0,
                    b = s(e),
                    m = r,
                    h = [],
                    O = !0;
                  l.name in m && O;

                )
                  if (
                    ((p = m[l.name].pattern),
                    h.push(l.name),
                    l.params &&
                      (function () {
                        var e =
                            null === (v = m[l.name]) || void 0 === v
                              ? void 0
                              : v.stringify,
                          t = (0, f.default)(
                            Object.entries(l.params).map(function (t) {
                              var r = (0, u.default)(t, 2),
                                n = r[0],
                                o = r[1];
                              return [
                                n,
                                null != e && e[n] ? e[n](o) : String(o),
                              ];
                            })
                          );
                        p && (0, a.default)(c, t),
                          b === l &&
                            ((y = (0, a.default)({}, t)),
                            null === (g = p) ||
                              void 0 === g ||
                              g
                                .split("/")
                                .filter(function (e) {
                                  return e.startsWith(":");
                                })
                                .forEach(function (e) {
                                  var t = d(e);
                                  y && delete y[t];
                                }));
                      })(),
                    m[l.name].screens && void 0 !== l.state)
                  ) {
                    t =
                      "number" == typeof l.state.index
                        ? l.state.index
                        : l.state.routes.length - 1;
                    var j = l.state.routes[t],
                      P = m[l.name].screens;
                    P && j.name in P ? ((l = j), (m = P)) : (O = !1);
                  } else O = !1;
                if (
                  (void 0 === p && (p = h.join("/")),
                  void 0 !== m[l.name]
                    ? (n += p
                        .split("/")
                        .map(function (e) {
                          var t = d(e);
                          if ("*" === e) return l.name;
                          if (e.startsWith(":")) {
                            var r = c[t];
                            return void 0 === r && e.endsWith("?")
                              ? ""
                              : encodeURIComponent(r);
                          }
                          return encodeURIComponent(e);
                        })
                        .join("/"))
                    : (n += encodeURIComponent(l.name)),
                  y || (y = b.params),
                  l.state)
                )
                  n += "/";
                else if (y) {
                  for (var w in y) "undefined" === y[w] && delete y[w];
                  var k = i.stringify(y, { sort: !1 });
                  k && (n += "?" + k);
                }
                o = l.state;
              };
            for (; o; ) {
              var v, g;
              p();
            }
            return (n =
              (n = n.replace(/\/+/g, "/")).length > 1
                ? n.replace(/\/$/, "")
                : n);
          });
        var o = n(r(4)),
          a = n(r(2)),
          u = n(r(3)),
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
                var u = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                u && (u.get || u.set)
                  ? Object.defineProperty(n, a, u)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(15)),
          f = n(r(75)),
          l = n(r(24));
        function c(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (c = function (e) {
            return e ? r : t;
          })(e);
        }
        var s = function e(t) {
          var r =
            "number" == typeof t.index
              ? t.routes[t.index]
              : t.routes[t.routes.length - 1];
          return r.state ? e(r.state) : r;
        };
        var d = function (e) {
            return e.replace(/^:/, "").replace(/\?$/, "");
          },
          p = function () {
            for (
              var e, t = arguments.length, r = new Array(t), n = 0;
              n < t;
              n++
            )
              r[n] = arguments[n];
            return (e = []).concat
              .apply(
                e,
                (0, o.default)(
                  r.map(function (e) {
                    return e.split("/");
                  })
                )
              )
              .filter(Boolean)
              .join("/");
          },
          v = function (e, t) {
            var r, n;
            if ("string" == typeof e) return { pattern: t ? p(t, e) : e };
            if (e.exact && void 0 === e.path)
              throw new Error(
                "A 'path' needs to be specified when specifying 'exact: true'. If you don't want this screen in the URL, specify it as empty string, e.g. `path: ''`."
              );
            n = !0 !== e.exact ? p(t || "", e.path || "") : e.path || "";
            var o = e.screens ? y(e.screens, n) : void 0;
            return {
              pattern:
                null === (r = n) || void 0 === r
                  ? void 0
                  : r.split("/").filter(Boolean).join("/"),
              stringify: e.stringify,
              screens: o,
            };
          },
          y = function (e, t) {
            return (0, f.default)(
              Object.entries(e).map(function (e) {
                var r = (0, u.default)(e, 2),
                  n = r[0],
                  o = r[1];
                return [n, v(o, t)];
              })
            );
          };
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            return e.reduce(function (e, t) {
              var r = (0, o.default)(t, 2),
                n = r[0],
                a = r[1];
              if (e.hasOwnProperty(n))
                throw new Error(
                  "A value for key '" + n + "' already exists in the object."
                );
              return (e[n] = a), e;
            }, {});
          });
        var o = n(r(3));
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e, t) {
            var r;
            t && (0, c.default)(t);
            var n = [];
            null != t &&
              t.initialRouteName &&
              n.push({
                initialRouteName: t.initialRouteName,
                parentScreens: [],
              });
            var i = null == t ? void 0 : t.screens,
              f = e
                .replace(/\/+/g, "/")
                .replace(/^\//, "")
                .replace(/\?.*$/, "");
            if (((f = f.endsWith("/") ? f : f + "/"), void 0 === i)) {
              var l = f
                .split("/")
                .filter(Boolean)
                .map(function (e) {
                  return { name: decodeURIComponent(e) };
                });
              return l.length ? O(e, l, n) : void 0;
            }
            var s,
              d,
              p = (r = []).concat
                .apply(
                  r,
                  (0, u.default)(
                    Object.keys(i).map(function (e) {
                      return g(e, i, [], n, []);
                    })
                  )
                )
                .sort(function (e, t) {
                  if (e.pattern === t.pattern)
                    return t.routeNames
                      .join(">")
                      .localeCompare(e.routeNames.join(">"));
                  if (e.pattern.startsWith(t.pattern)) return -1;
                  if (t.pattern.startsWith(e.pattern)) return 1;
                  for (
                    var r = e.pattern.split("/"),
                      n = t.pattern.split("/"),
                      o = 0;
                    o < Math.max(r.length, n.length);
                    o++
                  ) {
                    if (null == r[o]) return 1;
                    if (null == n[o]) return -1;
                    var a = "*" === r[o] || r[o].startsWith(":"),
                      u = "*" === n[o] || n[o].startsWith(":");
                    if (!a || !u) {
                      if (a) return 1;
                      if (u) return -1;
                    }
                  }
                  return n.length - r.length;
                });
            if (
              (p.reduce(function (e, t) {
                if (e[t.pattern]) {
                  var r = e[t.pattern].routeNames,
                    n = t.routeNames;
                  if (
                    !(r.length > n.length
                      ? n.every(function (e, t) {
                          return r[t] === e;
                        })
                      : r.every(function (e, t) {
                          return n[t] === e;
                        }))
                  )
                    throw new Error(
                      "Found conflicting screens with the same pattern. The pattern '" +
                        t.pattern +
                        "' resolves to both '" +
                        r.join(" > ") +
                        "' and '" +
                        n.join(" > ") +
                        "'. Patterns must be unique and cannot resolve to more than one screen."
                    );
                }
                return (0, a.default)(e, (0, o.default)({}, t.pattern, t));
              }, {}),
              "/" === f)
            ) {
              var v = p.find(function (e) {
                return (
                  "" === e.path &&
                  e.routeNames.every(function (e) {
                    var t;
                    return !(
                      null !==
                        (t = p.find(function (t) {
                          return t.screen === e;
                        })) &&
                      void 0 !== t &&
                      t.path
                    );
                  })
                );
              });
              return v
                ? O(
                    e,
                    v.routeNames.map(function (e) {
                      return { name: e };
                    }),
                    n,
                    p
                  )
                : void 0;
            }
            var b = y(
                f,
                p.map(function (e) {
                  return (0,
                  a.default)({}, e, { regex: e.regex ? new RegExp(e.regex.source + "$") : void 0 });
                })
              ),
              m = b.routes,
              h = b.remainingPath;
            void 0 !== m && ((d = O(e, m, n, p)), (f = h), (s = d));
            if (null == d || null == s) return;
            return s;
          });
        var o = n(r(11)),
          a = n(r(2)),
          u = n(r(4)),
          i = n(r(53)),
          f = (function (e, t) {
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
                var u = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                u && (u.get || u.set)
                  ? Object.defineProperty(n, a, u)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(15)),
          l = n(r(22)),
          c = n(r(24));
        function s(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (s = function (e) {
            return e ? r : t;
          })(e);
        }
        function d(e, t) {
          var r =
            ("undefined" != typeof Symbol && e[Symbol.iterator]) ||
            e["@@iterator"];
          if (r) return (r = r.call(e)).next.bind(r);
          if (
            Array.isArray(e) ||
            (r = (function (e, t) {
              if (!e) return;
              if ("string" == typeof e) return p(e, t);
              var r = Object.prototype.toString.call(e).slice(8, -1);
              "Object" === r && e.constructor && (r = e.constructor.name);
              if ("Map" === r || "Set" === r) return Array.from(e);
              if (
                "Arguments" === r ||
                /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
              )
                return p(e, t);
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
        function p(e, t) {
          (null == t || t > e.length) && (t = e.length);
          for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
          return n;
        }
        var v = function () {
            for (
              var e, t = arguments.length, r = new Array(t), n = 0;
              n < t;
              n++
            )
              r[n] = arguments[n];
            return (e = []).concat
              .apply(
                e,
                (0, u.default)(
                  r.map(function (e) {
                    return e.split("/");
                  })
                )
              )
              .filter(Boolean)
              .join("/");
          },
          y = function (e, t) {
            for (
              var r,
                n,
                u = e,
                i = function (e) {
                  if (!e.regex) return "continue";
                  var n = u.match(e.regex);
                  if (n) {
                    var i =
                      null === (l = e.pattern) || void 0 === l
                        ? void 0
                        : l
                            .split("/")
                            .filter(function (e) {
                              return e.startsWith(":");
                            })
                            .reduce(function (e, t, r) {
                              return (0,
                              a.default)(e, (0, o.default)({}, t, n[2 * (r + 1)].replace(/\//, "")));
                            }, {});
                    return (
                      (r = e.routeNames.map(function (e) {
                        var r,
                          n = t.find(function (t) {
                            return t.screen === e;
                          }),
                          o =
                            null == n || null === (r = n.path) || void 0 === r
                              ? void 0
                              : r
                                  .split("/")
                                  .filter(function (e) {
                                    return e.startsWith(":");
                                  })
                                  .reduce(function (e, t) {
                                    var r = i[t];
                                    if (r) {
                                      var o,
                                        a = t
                                          .replace(/^:/, "")
                                          .replace(/\?$/, "");
                                      e[a] =
                                        null !== (o = n.parse) &&
                                        void 0 !== o &&
                                        o[a]
                                          ? n.parse[a](r)
                                          : r;
                                    }
                                    return e;
                                  }, {});
                        return o && Object.keys(o).length
                          ? { name: e, params: o }
                          : { name: e };
                      })),
                      (u = u.replace(n[1], "")),
                      "break"
                    );
                  }
                },
                f = d(t);
              !(n = f()).done;

            ) {
              var l,
                c = i(n.value);
              if ("continue" !== c && "break" === c) break;
            }
            return { routes: r, remainingPath: u };
          },
          g = function e(t, r) {
            var n =
                arguments.length > 2 && void 0 !== arguments[2]
                  ? arguments[2]
                  : [],
              o = arguments.length > 3 ? arguments[3] : void 0,
              a = arguments.length > 4 ? arguments[4] : void 0,
              i = arguments.length > 5 ? arguments[5] : void 0,
              f = [];
            n.push(t), a.push(t);
            var l = r[t];
            if ("string" == typeof l) {
              var c = i ? v(i, l) : l;
              f.push(b(t, n, c, l));
            } else if ("object" == typeof l) {
              var s;
              if ("string" == typeof l.path) {
                if (l.exact && void 0 === l.path)
                  throw new Error(
                    "A 'path' needs to be specified when specifying 'exact: true'. If you don't want this screen in the URL, specify it as empty string, e.g. `path: ''`."
                  );
                (s = !0 !== l.exact ? v(i || "", l.path || "") : l.path || ""),
                  f.push(b(t, n, s, l.path, l.parse));
              }
              l.screens &&
                (l.initialRouteName &&
                  o.push({
                    initialRouteName: l.initialRouteName,
                    parentScreens: a,
                  }),
                Object.keys(l.screens).forEach(function (t) {
                  var r,
                    c = e(
                      t,
                      l.screens,
                      n,
                      o,
                      (0, u.default)(a),
                      null !== (r = s) && void 0 !== r ? r : i
                    );
                  f.push.apply(f, (0, u.default)(c));
                }));
            }
            return n.pop(), f;
          },
          b = function (e, t, r, n, o) {
            return {
              screen: e,
              regex: (r = r.split("/").filter(Boolean).join("/"))
                ? new RegExp(
                    "^(" +
                      r
                        .split("/")
                        .map(function (e) {
                          return e.startsWith(":")
                            ? "(([^/]+\\/)" + (e.endsWith("?") ? "?" : "") + ")"
                            : ("*" === e ? ".*" : (0, i.default)(e)) + "\\/";
                        })
                        .join("") +
                      ")"
                  )
                : void 0,
              pattern: r,
              path: n,
              routeNames: (0, u.default)(t),
              parse: o,
            };
          },
          m = function (e, t, r) {
            for (var n, o = d(r); !(n = o()).done; ) {
              var a = n.value;
              if (t.length === a.parentScreens.length) {
                for (var u = !0, i = 0; i < t.length; i++)
                  if (0 !== t[i].localeCompare(a.parentScreens[i])) {
                    u = !1;
                    break;
                  }
                if (u)
                  return e !== a.initialRouteName ? a.initialRouteName : void 0;
              }
            }
          },
          h = function (e, t, r) {
            return r
              ? e
                ? { index: 1, routes: [{ name: e }, t] }
                : { routes: [t] }
              : e
              ? {
                  index: 1,
                  routes: [
                    { name: e },
                    (0, a.default)({}, t, { state: { routes: [] } }),
                  ],
                }
              : { routes: [(0, a.default)({}, t, { state: { routes: [] } })] };
          },
          O = function (e, t, r, n) {
            var o,
              u = t.shift(),
              i = [],
              f = m(u.name, i, r);
            if ((i.push(u.name), (o = h(f, u, 0 === t.length)), t.length > 0))
              for (var c = o; (u = t.shift()); ) {
                f = m(u.name, i, r);
                var s = c.index || c.routes.length - 1;
                (c.routes[s].state = h(f, u, 0 === t.length)),
                  t.length > 0 && (c = c.routes[s].state),
                  i.push(u.name);
              }
            (u = (0, l.default)(o)).path = e;
            var p = j(
              e,
              n
                ? (function (e, t) {
                    for (var r, n = d(t); !(r = n()).done; ) {
                      var o = r.value;
                      if (e === o.routeNames[o.routeNames.length - 1])
                        return o.parse;
                    }
                  })(u.name, n)
                : void 0
            );
            return p && (u.params = (0, a.default)({}, u.params, p)), o;
          },
          j = function (e, t) {
            var r = e.split("?")[1],
              n = f.parse(r);
            return (
              t &&
                Object.keys(n).forEach(function (e) {
                  t[e] && "string" == typeof n[e] && (n[e] = t[e](n[e]));
                }),
              Object.keys(n).length ? n : void 0
            );
          };
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = (0, a.default)();
            if (void 0 !== arguments[1]) {
              var r =
                "You passed a second argument to 'useFocusEffect', but it only accepts one argument. If you want to pass a dependency array, you can use 'React.useCallback':\n\nuseFocusEffect(\n  React.useCallback(() => {\n    // Your code here\n  }, [depA, depB])\n);\n\nSee usage guide: https://reactnavigation.org/docs/use-focus-effect";
              console.error(r);
            }
            o.useEffect(
              function () {
                var r,
                  n = !1,
                  o = function () {
                    var t = e();
                    if (void 0 === t || "function" == typeof t) return t;
                  };
                t.isFocused() && ((r = o()), (n = !0));
                var a = t.addListener("focus", function () {
                    n || (void 0 !== r && r(), (r = o()), (n = !0));
                  }),
                  u = t.addListener("blur", function () {
                    void 0 !== r && r(), (r = void 0), (n = !1);
                  });
                return function () {
                  void 0 !== r && r(), a(), u();
                };
              },
              [e, t]
            );
          });
        var o = (function (e, t) {
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
          })(r(0)),
          a = n(r(14));
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
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function () {
            var e = (0, u.default)(),
              t = (0, a.useState)(e.isFocused),
              r = (0, o.default)(t, 2),
              n = r[0],
              i = r[1],
              f = e.isFocused();
            n !== f && i(f);
            return (
              a.useEffect(
                function () {
                  var t = e.addListener("focus", function () {
                      return i(!0);
                    }),
                    r = e.addListener("blur", function () {
                      return i(!1);
                    });
                  return function () {
                    t(), r();
                  };
                },
                [e]
              ),
              a.useDebugValue(f),
              f
            );
          });
        var o = n(r(3)),
          a = (function (e, t) {
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
          })(r(0)),
          u = n(r(14));
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
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e, t) {
            var r = (0, R.default)(),
              n = c.useContext(v.default),
              s = t.children,
              g = t.screenListeners,
              b = (0, i.default)(t, ["children", "screenListeners"]),
              W = c.useRef(
                e(
                  (0, u.default)(
                    {},
                    b,
                    null != n &&
                      n.params &&
                      null == n.params.state &&
                      !1 !== n.params.initial &&
                      "string" == typeof n.params.screen
                      ? { initialRouteName: n.params.screen }
                      : null
                  )
                )
              ).current,
              N = A(s),
              D = N.reduce(function (e, t) {
                if (t[1].name in e)
                  throw new Error(
                    "A navigator cannot contain multiple 'Screen' components with the same name (found duplicate screen named '" +
                      t[1].name +
                      "')"
                  );
                return (e[t[1].name] = t), e;
              }, {}),
              L = N.map(function (e) {
                return e[1].name;
              }),
              F = L.reduce(function (e, t) {
                var r = D[t][1].initialParams;
                return (e[t] = r), e;
              }, {}),
              I = L.reduce(function (e, t) {
                return (0, u.default)(e, (0, a.default)({}, t, D[t][1].getId));
              }, {});
            if (!L.length)
              throw new Error(
                "Couldn't find any screens for the navigator. Have you defined any screens as its children?"
              );
            var T = c.useCallback(
                function (e) {
                  return void 0 === e.type || e.type === W.type;
                },
                [W.type]
              ),
              G = c.useCallback(
                function (e) {
                  return void 0 !== e && !1 === e.stale && T(e);
                },
                [T]
              ),
              $ = c.useContext(y.default),
              U = $.state,
              B = $.getState,
              K = $.setState,
              V = $.setKey,
              H = $.getKey,
              z = $.getIsInitial,
              Y = c.useRef(!1),
              q = c.useCallback(
                function () {
                  K(void 0), (Y.current = !0);
                },
                [K]
              ),
              Z = c.useCallback(
                function (e) {
                  Y.current || K(e);
                },
                [K]
              ),
              J = c.useMemo(
                function () {
                  var e,
                    t,
                    r,
                    o = L.reduce(function (e, t) {
                      var r,
                        o,
                        a,
                        i = D[t][1].initialParams,
                        f =
                          null ==
                            (null == n ||
                            null === (r = n.params) ||
                            void 0 === r
                              ? void 0
                              : r.state) &&
                          !1 !==
                            (null == n ||
                            null === (o = n.params) ||
                            void 0 === o
                              ? void 0
                              : o.initial) &&
                          (null == n || null === (a = n.params) || void 0 === a
                            ? void 0
                            : a.screen) === t
                            ? n.params.params
                            : void 0;
                      return (
                        (e[t] =
                          void 0 !== i || void 0 !== f
                            ? (0, u.default)({}, i, f)
                            : void 0),
                        e
                      );
                    }, {});
                  return (void 0 !== U && T(U)) ||
                    null !=
                      (null == n || null === (e = n.params) || void 0 === e
                        ? void 0
                        : e.state)
                    ? [
                        W.getRehydratedState(
                          null !==
                            (t =
                              null == n ||
                              null === (r = n.params) ||
                              void 0 === r
                                ? void 0
                                : r.state) && void 0 !== t
                            ? t
                            : U,
                          {
                            routeNames: L,
                            routeParamList: o,
                            routeGetIdList: I,
                          }
                        ),
                        !1,
                      ]
                    : [
                        W.getInitialState({
                          routeNames: L,
                          routeParamList: o,
                          routeGetIdList: I,
                        }),
                        !0,
                      ];
                },
                [U, W, T]
              ),
              Q = (0, o.default)(J, 2),
              X = Q[0],
              ee = Q[1],
              te = G(U) ? U : X,
              re = te;
            (0, d.default)(te.routeNames, L) ||
              (re = W.getStateForRouteNamesChange(te, {
                routeNames: L,
                routeParamList: F,
                routeGetIdList: I,
              }));
            var ne = c.useRef(null == n ? void 0 : n.params);
            if (
              (c.useEffect(
                function () {
                  ne.current = null == n ? void 0 : n.params;
                },
                [null == n ? void 0 : n.params]
              ),
              null != n && n.params)
            ) {
              var oe,
                ae = ne.current;
              "object" == typeof n.params.state &&
              null != n.params.state &&
              n.params !== ae
                ? (oe = l.CommonActions.reset(n.params.state))
                : "string" == typeof n.params.screen &&
                  ((!1 === n.params.initial && ee) || n.params !== ae) &&
                  (oe = l.CommonActions.navigate({
                    name: n.params.screen,
                    params: n.params.params,
                    path: n.params.path,
                  }));
              var ue = oe
                ? W.getStateForAction(re, oe, {
                    routeNames: L,
                    routeParamList: F,
                    routeGetIdList: I,
                  })
                : null;
              re =
                null !== ue
                  ? W.getRehydratedState(ue, {
                      routeNames: L,
                      routeParamList: F,
                      routeGetIdList: I,
                    })
                  : re;
            }
            var ie = te !== re;
            (0, E.default)(function () {
              ie && Z(re);
            }),
              (te = re),
              c.useEffect(function () {
                return (
                  V(r),
                  z() || Z(re),
                  function () {
                    setTimeout(function () {
                      void 0 !== B() && H() === r && q();
                    }, 0);
                  }
                );
              }, []);
            var fe = c.useRef();
            fe.current = X;
            var le = c.useCallback(
                function () {
                  var e = B();
                  return G(e) ? e : fe.current;
                },
                [B, G]
              ),
              ce = (0, P.default)(function (e) {
                var t,
                  r,
                  n,
                  o = [];
                e.target
                  ? null !==
                      (n = r =
                        te.routes.find(function (t) {
                          return t.key === e.target;
                        })) &&
                    void 0 !== n &&
                    n.name &&
                    o.push(r.name)
                  : ((r = te.routes[te.index]),
                    o.push.apply(
                      o,
                      (0, f.default)(
                        Object.keys(D).filter(function (e) {
                          var t;
                          return (
                            (null === (t = r) || void 0 === t
                              ? void 0
                              : t.name) === e
                          );
                        })
                      )
                    ));
                if (null != r) {
                  var a = Oe[r.key].navigation;
                  (t = []).concat
                    .apply(
                      t,
                      (0, f.default)(
                        [g]
                          .concat(
                            (0, f.default)(
                              o.map(function (e) {
                                return D[e][1].listeners;
                              })
                            )
                          )
                          .map(function (t) {
                            var n =
                              "function" == typeof t
                                ? t({ route: r, navigation: a })
                                : t;
                            return n
                              ? Object.keys(n)
                                  .filter(function (t) {
                                    return t === e.type;
                                  })
                                  .map(function (e) {
                                    return null == n ? void 0 : n[e];
                                  })
                              : void 0;
                          })
                      )
                    )
                    .filter(function (e, t, r) {
                      return e && r.lastIndexOf(e) === t;
                    })
                    .forEach(function (t) {
                      return null == t ? void 0 : t(e);
                    });
                }
              });
            (0, k.default)({ state: te, emitter: ce }),
              c.useEffect(
                function () {
                  ce.emit({ type: "state", data: { state: te } });
                },
                [ce, te]
              );
            var se = (0, m.default)(),
              de = se.listeners,
              pe = se.addListener,
              ve = (0, _.default)(),
              ye = ve.keyedListeners,
              ge = ve.addKeyedListener,
              be = (0, x.default)({
                router: W,
                getState: le,
                setState: Z,
                key: null == n ? void 0 : n.key,
                actionListeners: de.action,
                beforeRemoveListeners: ye.beforeRemove,
                routerConfigOptions: {
                  routeNames: L,
                  routeParamList: F,
                  routeGetIdList: I,
                },
                emitter: ce,
              }),
              me = (0, C.default)({
                router: W,
                key: null == n ? void 0 : n.key,
                getState: le,
                setState: Z,
              }),
              he = (0, M.default)({
                onAction: be,
                getState: le,
                emitter: ce,
                router: W,
              });
            (0, w.default)({ navigation: he, focusedListeners: de.focus }),
              (0, S.default)({ getState: le, getStateListeners: ye.getState });
            var Oe = (0, j.default)({
              state: te,
              screens: D,
              navigation: he,
              screenOptions: t.screenOptions,
              defaultScreenOptions: t.defaultScreenOptions,
              onAction: be,
              getState: le,
              setState: Z,
              onRouteFocus: me,
              addListener: pe,
              addKeyedListener: ge,
              router: W,
              emitter: ce,
            });
            (0, O.default)({ state: te, navigation: he, descriptors: Oe });
            var je = (0, h.default)(p.default.Provider, { value: he });
            return {
              state: te,
              navigation: he,
              descriptors: Oe,
              NavigationContent: je,
            };
          });
        var o = n(r(3)),
          a = n(r(11)),
          u = n(r(2)),
          i = n(r(6)),
          f = n(r(4)),
          l = r(8),
          c = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = W(t);
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
          })(r(0)),
          s = (r(80), n(r(45))),
          d = n(r(55)),
          p = n(r(54)),
          v = n(r(10)),
          y = n(r(13)),
          g = n(r(46)),
          b = r(25),
          m = n(r(40)),
          h = n(r(82)),
          O = n(r(83)),
          j = n(r(84)),
          P = n(r(41)),
          w = n(r(88)),
          k = n(r(89)),
          _ = n(r(42)),
          M = n(r(90)),
          x = n(r(91)),
          S = n(r(93)),
          C = n(r(94)),
          R = n(r(95)),
          E = n(r(44));
        function W(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (W = function (e) {
            return e ? r : t;
          })(e);
        }
        b.PrivateValueStore;
        var A = function e(t, r) {
          return c.Children.toArray(t).reduce(function (t, n) {
            var o, a;
            if (c.isValidElement(n)) {
              if (n.type === g.default) return t.push([r, n.props]), t;
              if (n.type === c.Fragment || n.type === s.default)
                return (
                  t.push.apply(
                    t,
                    (0, f.default)(
                      e(
                        n.props.children,
                        n.type !== s.default
                          ? r
                          : null != r
                          ? [].concat((0, f.default)(r), [
                              n.props.screenOptions,
                            ])
                          : [n.props.screenOptions]
                      )
                    )
                  ),
                  t
                );
            }
            throw new Error(
              "A navigator can only contain 'Screen', 'Group' or 'React.Fragment' as its direct children (found " +
                (c.isValidElement(n)
                  ? "'" +
                    ("string" == typeof n.type
                      ? n.type
                      : null === (o = n.type) || void 0 === o
                      ? void 0
                      : o.name) +
                    "'" +
                    (null !== (a = n.props) && void 0 !== a && a.name
                      ? " for the screen '" + n.props.name + "'"
                      : "")
                  : "object" == typeof n
                  ? JSON.stringify(n)
                  : "'" + String(n) + "'") +
                "). To render this component in the navigator, pass it in the 'component' prop to 'Screen'."
            );
          }, []);
        };
      },
      (e, t, r) => {
        "use strict";
        e.exports = r(81);
      },
      (e, t) => {
        "use strict";
        /** @license React v16.13.1
         * react-is.production.min.js
         *
         * Copyright (c) Facebook, Inc. and its affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */ var r = "function" == typeof Symbol && Symbol.for,
          n = r ? Symbol.for("react.element") : 60103,
          o = r ? Symbol.for("react.portal") : 60106,
          a = r ? Symbol.for("react.fragment") : 60107,
          u = r ? Symbol.for("react.strict_mode") : 60108,
          i = r ? Symbol.for("react.profiler") : 60114,
          f = r ? Symbol.for("react.provider") : 60109,
          l = r ? Symbol.for("react.context") : 60110,
          c = r ? Symbol.for("react.async_mode") : 60111,
          s = r ? Symbol.for("react.concurrent_mode") : 60111,
          d = r ? Symbol.for("react.forward_ref") : 60112,
          p = r ? Symbol.for("react.suspense") : 60113,
          v = r ? Symbol.for("react.suspense_list") : 60120,
          y = r ? Symbol.for("react.memo") : 60115,
          g = r ? Symbol.for("react.lazy") : 60116,
          b = r ? Symbol.for("react.block") : 60121,
          m = r ? Symbol.for("react.fundamental") : 60117,
          h = r ? Symbol.for("react.responder") : 60118,
          O = r ? Symbol.for("react.scope") : 60119;
        function j(e) {
          if ("object" == typeof e && null !== e) {
            var t = e.$$typeof;
            switch (t) {
              case n:
                switch ((e = e.type)) {
                  case c:
                  case s:
                  case a:
                  case i:
                  case u:
                  case p:
                    return e;
                  default:
                    switch ((e = e && e.$$typeof)) {
                      case l:
                      case d:
                      case g:
                      case y:
                      case f:
                        return e;
                      default:
                        return t;
                    }
                }
              case o:
                return t;
            }
          }
        }
        function P(e) {
          return j(e) === s;
        }
        (t.AsyncMode = c),
          (t.ConcurrentMode = s),
          (t.ContextConsumer = l),
          (t.ContextProvider = f),
          (t.Element = n),
          (t.ForwardRef = d),
          (t.Fragment = a),
          (t.Lazy = g),
          (t.Memo = y),
          (t.Portal = o),
          (t.Profiler = i),
          (t.StrictMode = u),
          (t.Suspense = p),
          (t.isAsyncMode = function (e) {
            return P(e) || j(e) === c;
          }),
          (t.isConcurrentMode = P),
          (t.isContextConsumer = function (e) {
            return j(e) === l;
          }),
          (t.isContextProvider = function (e) {
            return j(e) === f;
          }),
          (t.isElement = function (e) {
            return "object" == typeof e && null !== e && e.$$typeof === n;
          }),
          (t.isForwardRef = function (e) {
            return j(e) === d;
          }),
          (t.isFragment = function (e) {
            return j(e) === a;
          }),
          (t.isLazy = function (e) {
            return j(e) === g;
          }),
          (t.isMemo = function (e) {
            return j(e) === y;
          }),
          (t.isPortal = function (e) {
            return j(e) === o;
          }),
          (t.isProfiler = function (e) {
            return j(e) === i;
          }),
          (t.isStrictMode = function (e) {
            return j(e) === u;
          }),
          (t.isSuspense = function (e) {
            return j(e) === p;
          }),
          (t.isValidElementType = function (e) {
            return (
              "string" == typeof e ||
              "function" == typeof e ||
              e === a ||
              e === s ||
              e === i ||
              e === u ||
              e === p ||
              e === v ||
              ("object" == typeof e &&
                null !== e &&
                (e.$$typeof === g ||
                  e.$$typeof === y ||
                  e.$$typeof === f ||
                  e.$$typeof === l ||
                  e.$$typeof === d ||
                  e.$$typeof === m ||
                  e.$$typeof === h ||
                  e.$$typeof === O ||
                  e.$$typeof === b))
            );
          }),
          (t.typeOf = j);
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e, t) {
            var r = n.useRef(t);
            return (
              (r.current = t),
              n.useEffect(function () {
                r.current = null;
              }),
              n.useRef(function (t) {
                var o = r.current;
                if (null === o)
                  throw new Error(
                    "The returned component must be rendered in the same render phase as the hook."
                  );
                return n.createElement(e, a({}, o, t));
              }).current
            );
          });
        var n = (function (e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" != typeof e && "function" != typeof e))
            return { default: e };
          var r = o(t);
          if (r && r.has(e)) return r.get(e);
          var n = {},
            a = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var u in e)
            if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {
              var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
              i && (i.get || i.set)
                ? Object.defineProperty(n, u, i)
                : (n[u] = e[u]);
            }
          (n.default = e), r && r.set(e, n);
          return n;
        })(r(0));
        function o(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (o = function (e) {
            return e ? r : t;
          })(e);
        }
        function a() {
          return (a =
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
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.state,
              r = e.navigation,
              n = e.descriptors,
              u = o.useContext(a.default);
            u &&
              r.isFocused() &&
              (u.options = n[t.routes[t.index].key].options);
          });
        var o = (function (e, t) {
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
          })(r(0)),
          a = n(r(47));
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
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.state,
              r = e.screens,
              n = e.navigation,
              y = e.screenOptions,
              b = e.defaultScreenOptions,
              m = e.onAction,
              h = e.getState,
              O = e.setState,
              j = e.addListener,
              P = e.addKeyedListener,
              w = e.onRouteFocus,
              k = e.router,
              _ = e.emitter,
              M = f.useState({}),
              x = (0, i.default)(M, 2),
              S = x[0],
              C = x[1],
              R = f.useContext(l.default),
              E = R.onDispatchAction,
              W = R.onOptionsChange,
              A = R.stackRef,
              N = f.useMemo(
                function () {
                  return {
                    navigation: n,
                    onAction: m,
                    addListener: j,
                    addKeyedListener: P,
                    onRouteFocus: w,
                    onDispatchAction: E,
                    onOptionsChange: W,
                    stackRef: A,
                  };
                },
                [n, m, j, P, w, E, W, A]
              ),
              D = (0, p.default)({
                state: t,
                getState: h,
                navigation: n,
                setOptions: C,
                router: k,
                emitter: _,
              });
            return (0, v.default)(t.routes).reduce(function (e, n, i) {
              var p = r[n.name],
                v = p[1],
                m = D[n.key],
                j = [y]
                  .concat((0, u.default)(p[0] ? p[0].filter(Boolean) : []), [
                    v.options,
                    S[n.key],
                  ])
                  .reduce(function (e, t) {
                    return (0,
                    a.default)(e, "function" != typeof t ? t : t({ route: n, navigation: m }));
                  }, {}),
                P = (0, a.default)(
                  {},
                  "function" == typeof b
                    ? b({ route: n, navigation: m, options: j })
                    : b,
                  j
                ),
                w = function () {
                  return C(function (e) {
                    if (n.key in e) {
                      var t = n.key;
                      e[t];
                      return (0, o.default)(e, [t].map(g));
                    }
                    return e;
                  });
                };
              return (
                (e[n.key] = {
                  route: n,
                  navigation: m,
                  render: function () {
                    return f.createElement(
                      l.default.Provider,
                      { key: n.key, value: N },
                      f.createElement(
                        c.default.Provider,
                        { value: m },
                        f.createElement(
                          s.default.Provider,
                          { value: n },
                          f.createElement(d.default, {
                            navigation: m,
                            route: n,
                            screen: v,
                            routeState: t.routes[i].state,
                            getState: h,
                            setState: O,
                            options: P,
                            clearOptions: w,
                          })
                        )
                      )
                    );
                  },
                  options: P,
                }),
                e
              );
            }, {});
          });
        var o = n(r(6)),
          a = n(r(2)),
          u = n(r(4)),
          i = n(r(3)),
          f = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = y(t);
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
          })(r(0)),
          l = n(r(7)),
          c = n(r(12)),
          s = n(r(10)),
          d = n(r(85)),
          p = n(r(87)),
          v = n(r(48));
        function y(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (y = function (e) {
            return e ? r : t;
          })(e);
        }
        function g(e) {
          var t = (function (e, t) {
            if ("object" != typeof e || null === e) return e;
            var r = e[Symbol.toPrimitive];
            if (void 0 !== r) {
              var n = r.call(e, t || "default");
              if ("object" != typeof n) return n;
              throw new TypeError(
                "@@toPrimitive must return a primitive value."
              );
            }
            return ("string" === t ? String : Number)(e);
          })(e, "string");
          return "symbol" == typeof t ? t : String(t);
        }
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.screen,
              r = e.route,
              n = e.navigation,
              c = e.routeState,
              s = e.getState,
              d = e.setState,
              p = e.options,
              v = e.clearOptions,
              y = a.useRef(),
              g = a.useCallback(function () {
                return y.current;
              }, []),
              b = (0, l.default)({
                key: r.key,
                options: p,
                navigation: n,
              }).addOptionsGetter,
              m = a.useCallback(function (e) {
                y.current = e;
              }, []),
              h = a.useCallback(
                function () {
                  var e = s().routes.find(function (e) {
                    return e.key === r.key;
                  });
                  return e ? e.state : void 0;
                },
                [s, r.key]
              ),
              O = a.useCallback(
                function (e) {
                  var t = s();
                  d(
                    (0, o.default)({}, t, {
                      routes: t.routes.map(function (t) {
                        return t.key === r.key
                          ? (0, o.default)({}, t, { state: e })
                          : t;
                      }),
                    })
                  );
                },
                [s, r.key, d]
              ),
              j = a.useRef(!0);
            a.useEffect(function () {
              j.current = !1;
            }),
              a.useEffect(function () {
                return v;
              }, []);
            var P = a.useCallback(function () {
                return j.current;
              }, []),
              w = a.useMemo(
                function () {
                  return {
                    state: c,
                    getState: h,
                    setState: O,
                    getKey: g,
                    setKey: m,
                    getIsInitial: P,
                    addOptionsGetter: b,
                  };
                },
                [c, h, O, g, m, P, b]
              ),
              k = t.getComponent ? t.getComponent() : t.component;
            return a.createElement(
              i.default.Provider,
              { value: w },
              a.createElement(
                u.default,
                null,
                a.createElement(
                  f.default,
                  {
                    name: t.name,
                    render: k || t.children,
                    navigation: n,
                    route: r,
                  },
                  void 0 !== k
                    ? a.createElement(k, { navigation: n, route: r })
                    : void 0 !== t.children
                    ? t.children({ navigation: n, route: r })
                    : null
                )
              )
            );
          });
        var o = n(r(2)),
          a = (function (e, t) {
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
                var u = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                u && (u.get || u.set)
                  ? Object.defineProperty(n, a, u)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(0)),
          u = n(r(21)),
          i = n(r(13)),
          f = n(r(86)),
          l = n(r(43));
        function c(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (c = function (e) {
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
          for (var u in e)
            if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {
              var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
              i && (i.get || i.set)
                ? Object.defineProperty(o, u, i)
                : (o[u] = e[u]);
            }
          (o.default = e), r && r.set(e, o);
          return o;
        })(r(0)).memo(
          function (e) {
            return e.children;
          },
          function (e, t) {
            var r = Object.keys(e),
              n = Object.keys(t);
            if (r.length !== n.length) return !1;
            for (var o = 0, a = r; o < a.length; o++) {
              var u = a[o];
              if ("children" !== u && e[u] !== t[u]) return !1;
            }
            return !0;
          }
        );
        t.default = o;
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.state,
              r = e.getState,
              n = e.navigation,
              c = e.setOptions,
              s = e.router,
              d = e.emitter,
              p =
                (f.useContext(l.default).stackRef,
                f.useMemo(
                  function () {
                    return { current: {} };
                  },
                  [r, n, c, s, d]
                )),
              v = (0, u.default)({}, s.actionCreators, i.CommonActions);
            return (
              (p.current = t.routes.reduce(function (e, t) {
                var i = p.current[t.key];
                if (i) e[t.key] = i;
                else {
                  n.emit;
                  var f = (0, a.default)(n, ["emit"]),
                    l = function (e) {
                      var o = "function" == typeof e ? e(r()) : e;
                      null != o &&
                        n.dispatch((0, u.default)({ source: t.key }, o));
                    },
                    s = function (e) {
                      try {
                        0, e();
                      } finally {
                        !1;
                      }
                    },
                    y = Object.keys(v).reduce(function (e, t) {
                      return (
                        (e[t] = function () {
                          for (
                            var e = arguments.length, r = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            r[n] = arguments[n];
                          return s(function () {
                            return l(v[t].apply(v, r));
                          });
                        }),
                        e
                      );
                    }, {});
                  e[t.key] = (0, u.default)({}, f, y, d.create(t.key), {
                    dispatch: function (e) {
                      return s(function () {
                        return l(e);
                      });
                    },
                    setOptions: function (e) {
                      return c(function (r) {
                        return (0,
                        u.default)({}, r, (0, o.default)({}, t.key, (0, u.default)({}, r[t.key], e)));
                      });
                    },
                    isFocused: function () {
                      var e = r();
                      return (
                        e.routes[e.index].key === t.key && (!n || n.isFocused())
                      );
                    },
                  });
                }
                return e;
              }, {})),
              p.current
            );
          });
        var o = n(r(11)),
          a = n(r(6)),
          u = n(r(2)),
          i = r(8),
          f = (function (e, t) {
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
                var u = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                u && (u.get || u.set)
                  ? Object.defineProperty(n, a, u)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(0)),
          l = n(r(7));
        function c(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (c = function (e) {
            return e ? r : t;
          })(e);
        }
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.navigation,
              r = e.focusedListeners,
              n = o.useContext(a.default).addListener,
              u = o.useCallback(
                function (e) {
                  if (t.isFocused()) {
                    for (
                      var n,
                        o = (function (e, t) {
                          var r =
                            ("undefined" != typeof Symbol &&
                              e[Symbol.iterator]) ||
                            e["@@iterator"];
                          if (r) return (r = r.call(e)).next.bind(r);
                          if (
                            Array.isArray(e) ||
                            (r = (function (e, t) {
                              if (!e) return;
                              if ("string" == typeof e) return i(e, t);
                              var r = Object.prototype.toString
                                .call(e)
                                .slice(8, -1);
                              "Object" === r &&
                                e.constructor &&
                                (r = e.constructor.name);
                              if ("Map" === r || "Set" === r)
                                return Array.from(e);
                              if (
                                "Arguments" === r ||
                                /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(
                                  r
                                )
                              )
                                return i(e, t);
                            })(e)) ||
                            (t && e && "number" == typeof e.length)
                          ) {
                            r && (e = r);
                            var n = 0;
                            return function () {
                              return n >= e.length
                                ? { done: !0 }
                                : { done: !1, value: e[n++] };
                            };
                          }
                          throw new TypeError(
                            "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
                          );
                        })(r);
                      !(n = o()).done;

                    ) {
                      var a = (0, n.value)(e),
                        u = a.handled,
                        f = a.result;
                      if (u) return { handled: u, result: f };
                    }
                    return { handled: !0, result: e(t) };
                  }
                  return { handled: !1, result: null };
                },
                [r, t]
              );
            o.useEffect(
              function () {
                return null == n ? void 0 : n("focus", u);
              },
              [n, u]
            );
          });
        var o = (function (e, t) {
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
          })(r(0)),
          a = n(r(7));
        function u(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (u = function (e) {
            return e ? r : t;
          })(e);
        }
        function i(e, t) {
          (null == t || t > e.length) && (t = e.length);
          for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
          return n;
        }
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.state,
              r = e.emitter,
              n = o.useContext(a.default),
              u = o.useRef(),
              i = t.routes[t.index].key;
            o.useEffect(
              function () {
                return null == n
                  ? void 0
                  : n.addListener("focus", function () {
                      (u.current = i), r.emit({ type: "focus", target: i });
                    });
              },
              [i, r, n]
            ),
              o.useEffect(
                function () {
                  return null == n
                    ? void 0
                    : n.addListener("blur", function () {
                        (u.current = void 0),
                          r.emit({ type: "blur", target: i });
                      });
                },
                [i, r, n]
              ),
              o.useEffect(
                function () {
                  var e = u.current;
                  (u.current = i),
                    void 0 !== e || n || r.emit({ type: "focus", target: i }),
                    e === i ||
                      (n && !n.isFocused()) ||
                      (void 0 !== e &&
                        (r.emit({ type: "blur", target: e }),
                        r.emit({ type: "focus", target: i })));
                },
                [i, r, n]
              );
          });
        var o = (function (e, t) {
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
          })(r(0)),
          a = n(r(12));
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
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.onAction,
              r = e.getState,
              n = e.emitter,
              f = e.router,
              c = u.useContext(l.default),
              s = u.useContext(i.default);
            return u.useMemo(
              function () {
                var e = function (e) {
                    var n = "function" == typeof e ? e(r()) : e;
                    t(n) || null == c || c(n);
                  },
                  u = (0, o.default)({}, f.actionCreators, a.CommonActions),
                  i = Object.keys(u).reduce(function (t, r) {
                    return (
                      (t[r] = function () {
                        return e(u[r].apply(u, arguments));
                      }),
                      t
                    );
                  }, {});
                return (0, o.default)({}, s, i, {
                  dispatch: e,
                  emit: n.emit,
                  isFocused: s
                    ? s.isFocused
                    : function () {
                        return !0;
                      },
                  canGoBack: function () {
                    var e = r();
                    return (
                      null !==
                        f.getStateForAction(e, a.CommonActions.goBack(), {
                          routeNames: e.routeNames,
                          routeParamList: {},
                          routeGetIdList: {},
                        }) ||
                      (null == s ? void 0 : s.canGoBack()) ||
                      !1
                    );
                  },
                  getParent: function () {
                    return s;
                  },
                  getState: r,
                });
              },
              [n.emit, r, t, c, s, f]
            );
          });
        var o = n(r(2)),
          a = r(8),
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
                var u = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                u && (u.get || u.set)
                  ? Object.defineProperty(n, a, u)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(0)),
          i = n(r(12)),
          f = r(25),
          l = n(r(39));
        function c(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (c = function (e) {
            return e ? r : t;
          })(e);
        }
        f.PrivateValueStore;
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.router,
              r = e.getState,
              n = e.setState,
              i = e.key,
              f = e.actionListeners,
              l = e.beforeRemoveListeners,
              c = e.routerConfigOptions,
              s = e.emitter,
              d = o.useContext(a.default),
              p = d.onAction,
              v = d.onRouteFocus,
              y = d.addListener,
              g = d.onDispatchAction,
              b = o.useRef(c);
            o.useEffect(function () {
              b.current = c;
            });
            var m = o.useCallback(
              function (e) {
                var o =
                    arguments.length > 1 && void 0 !== arguments[1]
                      ? arguments[1]
                      : new Set(),
                  a = r();
                if (o.has(a.key)) return !1;
                if (
                  (o.add(a.key),
                  "string" != typeof e.target || e.target === a.key)
                ) {
                  var c = t.getStateForAction(a, e, b.current);
                  if (null !== (c = null === c && e.target === a.key ? a : c)) {
                    if ((g(e, a === c), a !== c)) {
                      var d = (0, u.shouldPreventRemove)(
                        s,
                        l,
                        a.routes,
                        c.routes,
                        e
                      );
                      if (d) return !0;
                      n(c);
                    }
                    if (void 0 !== v) {
                      var y = t.shouldActionChangeFocus(e);
                      y && void 0 !== i && v(i);
                    }
                    return !0;
                  }
                }
                if (void 0 !== p && p(e, o)) return !0;
                for (var m = f.length - 1; m >= 0; m--) {
                  var h = f[m];
                  if (h(e, o)) return !0;
                }
                return !1;
              },
              [f, l, s, r, i, p, g, v, t, n]
            );
            return (
              (0, u.default)({
                getState: r,
                emitter: s,
                beforeRemoveListeners: l,
              }),
              o.useEffect(
                function () {
                  return null == y ? void 0 : y("action", m);
                },
                [y, m]
              ),
              m
            );
          });
        var o = f(r(0)),
          a = n(r(7)),
          u = f(r(92));
        function i(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (i = function (e) {
            return e ? r : t;
          })(e);
        }
        function f(e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" != typeof e && "function" != typeof e))
            return { default: e };
          var r = i(t);
          if (r && r.has(e)) return r.get(e);
          var n = {},
            o = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var a in e)
            if ("default" !== a && Object.prototype.hasOwnProperty.call(e, a)) {
              var u = o ? Object.getOwnPropertyDescriptor(e, a) : null;
              u && (u.get || u.set)
                ? Object.defineProperty(n, a, u)
                : (n[a] = e[a]);
            }
          return (n.default = e), r && r.set(e, n), n;
        }
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.getState,
              r = e.emitter,
              n = e.beforeRemoveListeners,
              o = u.useContext(i.default).addKeyedListener,
              a = u.useContext(f.default),
              l = null == a ? void 0 : a.key;
            u.useEffect(
              function () {
                if (l)
                  return null == o
                    ? void 0
                    : o("beforeRemove", l, function (e) {
                        var o = t();
                        return p(r, n, o.routes, [], e);
                      });
              },
              [o, n, r, t, l]
            );
          }),
          (t.shouldPreventRemove = void 0);
        var o = n(r(11)),
          a = n(r(2)),
          u = (function (e, t) {
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
                var u = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                u && (u.get || u.set)
                  ? Object.defineProperty(n, a, u)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(0)),
          i = n(r(7)),
          f = n(r(10));
        function l(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (l = function (e) {
            return e ? r : t;
          })(e);
        }
        function c(e, t) {
          var r =
            ("undefined" != typeof Symbol && e[Symbol.iterator]) ||
            e["@@iterator"];
          if (r) return (r = r.call(e)).next.bind(r);
          if (
            Array.isArray(e) ||
            (r = (function (e, t) {
              if (!e) return;
              if ("string" == typeof e) return s(e, t);
              var r = Object.prototype.toString.call(e).slice(8, -1);
              "Object" === r && e.constructor && (r = e.constructor.name);
              if ("Map" === r || "Set" === r) return Array.from(e);
              if (
                "Arguments" === r ||
                /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
              )
                return s(e, t);
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
        function s(e, t) {
          (null == t || t > e.length) && (t = e.length);
          for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
          return n;
        }
        var d = Symbol("VISITED_ROUTE_KEYS"),
          p = function (e, t, r, n, u) {
            for (
              var i,
                f,
                l = n.map(function (e) {
                  return e.key;
                }),
                s = r
                  .filter(function (e) {
                    return !l.includes(e.key);
                  })
                  .reverse(),
                p = null !== (i = u[d]) && void 0 !== i ? i : new Set(),
                v = (0, a.default)({}, u, (0, o.default)({}, d, p)),
                y = c(s);
              !(f = y()).done;

            ) {
              var g,
                b = f.value;
              if (!p.has(b.key)) {
                if (
                  null === (g = t[b.key]) || void 0 === g
                    ? void 0
                    : g.call(t, v)
                )
                  return !0;
                if (
                  (p.add(b.key),
                  e.emit({
                    type: "beforeRemove",
                    target: b.key,
                    data: { action: v },
                    canPreventDefault: !0,
                  }).defaultPrevented)
                )
                  return !0;
              }
            }
            return !1;
          };
        t.shouldPreventRemove = p;
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.getState,
              r = e.getStateListeners,
              n = a.useContext(i.default).addKeyedListener,
              l = a.useContext(f.default),
              c = l ? l.key : "root",
              s = a.useCallback(
                function () {
                  var e = t(),
                    n = e.routes.map(function (e) {
                      var t,
                        n =
                          null === (t = r[e.key]) || void 0 === t
                            ? void 0
                            : t.call(r);
                      return e.state === n
                        ? e
                        : (0, o.default)({}, e, { state: n });
                    });
                  return (0, u.default)(e.routes, n)
                    ? e
                    : (0, o.default)({}, e, { routes: n });
                },
                [t, r]
              );
            a.useEffect(
              function () {
                return null == n ? void 0 : n("getState", c, s);
              },
              [n, s, c]
            );
          });
        var o = n(r(2)),
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
                var u = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                u && (u.get || u.set)
                  ? Object.defineProperty(n, a, u)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(0)),
          u = n(r(55)),
          i = n(r(7)),
          f = n(r(10));
        function l(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (l = function (e) {
            return e ? r : t;
          })(e);
        }
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.router,
              r = e.getState,
              n = e.key,
              u = e.setState,
              i = o.useContext(a.default).onRouteFocus;
            return o.useCallback(
              function (e) {
                var o = r(),
                  a = t.getStateForRouteFocus(o, e);
                a !== o && u(a), void 0 !== i && void 0 !== n && i(n);
              },
              [r, i, t, u, n]
            );
          });
        var o = (function (e, t) {
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
          })(r(0)),
          a = n(r(7));
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
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function () {
            var e = u.useState(function () {
                return (0, a.nanoid)();
              }),
              t = (0, o.default)(e, 1)[0],
              r = u.useContext(i.SingleNavigatorContext);
            if (void 0 === r)
              throw new Error(
                "Couldn't register the navigator. Have you wrapped your app with 'NavigationContainer'?"
              );
            return (
              u.useEffect(
                function () {
                  var e = r.register,
                    n = r.unregister;
                  return (
                    e(t),
                    function () {
                      return n(t);
                    }
                  );
                },
                [r, t]
              ),
              t
            );
          });
        var o = n(r(3)),
          a = r(9),
          u = (function (e, t) {
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
                var u = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                u && (u.get || u.set)
                  ? Object.defineProperty(n, a, u)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(0)),
          i = r(21);
        function f(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (f = function (e) {
            return e ? r : t;
          })(e);
        }
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function () {
            var e = o.useRef(null);
            null == e.current && (e.current = (0, a.default)());
            return e.current;
          });
        var o = (function (e, t) {
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
          })(r(0)),
          a = n(r(20));
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
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = (0, u.default)(),
              r = a.useState(function () {
                return e(t.getState());
              }),
              n = (0, o.default)(r, 2)[1],
              i = a.useRef(e);
            return (
              a.useEffect(function () {
                i.current = e;
              }),
              a.useEffect(
                function () {
                  return t.addListener("state", function (e) {
                    n(i.current(e.data.state));
                  });
                },
                [t]
              ),
              e(t.getState())
            );
          });
        var o = n(r(3)),
          a = (function (e, t) {
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
          })(r(0)),
          u = n(r(14));
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
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function () {
            var e = o.useContext(a.default);
            if (void 0 === e)
              throw new Error(
                "Couldn't find a route object. Is your component inside a screen in a navigator?"
              );
            return e;
          });
        var o = (function (e, t) {
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
          })(r(0)),
          a = n(r(10));
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
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var o = n(r(3)),
          a = n(r(2)),
          u = n(r(6)),
          i = r(5),
          f = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = g(t);
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
          })(r(0)),
          l = n(r(26)),
          c = n(r(27)),
          s = n(r(57)),
          d = n(r(100)),
          p = n(r(101)),
          v = n(r(102)),
          y = n(r(103));
        function g(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (g = function (e) {
            return e ? r : t;
          })(e);
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
        r.g.REACT_NAVIGATION_DEVTOOLS = new WeakMap();
        var m = f.forwardRef(function (e, t) {
          var r = e.theme,
            n = void 0 === r ? c.default : r,
            g = e.linking,
            m = e.fallback,
            h = void 0 === m ? null : m,
            O = e.documentTitle,
            j = e.onReady,
            P = (0, u.default)(e, [
              "theme",
              "linking",
              "fallback",
              "documentTitle",
              "onReady",
            ]),
            w = !!g && !1 !== g.enabled;
          null != g && g.config && (0, i.validatePathConfig)(g.config);
          var k = f.useRef(null);
          (0, d.default)(k), (0, p.default)(k, O);
          var _ = (0, v.default)(
            k,
            (0, a.default)(
              { independent: P.independent, enabled: w, prefixes: [] },
              g
            )
          ).getInitialState;
          f.useEffect(function () {
            k.current &&
              REACT_NAVIGATION_DEVTOOLS.set(k.current, {
                get linking() {
                  var e, t, r, n;
                  return (0, a.default)({}, g, {
                    enabled: w,
                    prefixes:
                      null !== (e = null == g ? void 0 : g.prefixes) &&
                      void 0 !== e
                        ? e
                        : [],
                    getStateFromPath:
                      null !== (t = null == g ? void 0 : g.getStateFromPath) &&
                      void 0 !== t
                        ? t
                        : i.getStateFromPath,
                    getPathFromState:
                      null !== (r = null == g ? void 0 : g.getPathFromState) &&
                      void 0 !== r
                        ? r
                        : i.getPathFromState,
                    getActionFromState:
                      null !==
                        (n = null == g ? void 0 : g.getActionFromState) &&
                      void 0 !== n
                        ? n
                        : i.getActionFromState,
                  });
                },
              });
          });
          var M = (0, y.default)(_),
            x = (0, o.default)(M, 2),
            S = x[0],
            C = x[1];
          f.useImperativeHandle(t, function () {
            return k.current;
          });
          var R = f.useMemo(
              function () {
                return { options: g };
              },
              [g]
            ),
            E = null != P.initialState || !w || S,
            W = f.useRef(j);
          return (
            f.useEffect(function () {
              W.current = j;
            }),
            f.useEffect(
              function () {
                var e;
                E && (null === (e = W.current) || void 0 === e || e.call(W));
              },
              [E]
            ),
            E
              ? f.createElement(
                  l.default.Provider,
                  { value: R },
                  f.createElement(
                    s.default,
                    { value: n },
                    f.createElement(
                      i.BaseNavigationContainer,
                      b({}, P, {
                        initialState:
                          null == P.initialState ? C : P.initialState,
                        ref: k,
                      })
                    )
                  )
                )
              : h
          );
        });
        t.default = m;
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            n.useEffect(
              function () {
                var t = o.BackHandler.addEventListener(
                  "hardwareBackPress",
                  function () {
                    var t = e.current;
                    return null != t && !!t.canGoBack() && (t.goBack(), !0);
                  }
                );
                return function () {
                  return t.remove();
                };
              },
              [e]
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
            for (var u in e)
              if (
                "default" !== u &&
                Object.prototype.hasOwnProperty.call(e, u)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, u) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, u, i)
                  : (n[u] = e[u]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(0)),
          o = r(18);
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
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t =
                arguments.length > 1 && void 0 !== arguments[1]
                  ? arguments[1]
                  : {},
              r = t.enabled,
              o = void 0 === r || r,
              a = t.formatter,
              u =
                void 0 === a
                  ? function (e, t) {
                      var r;
                      return null !== (r = null == e ? void 0 : e.title) &&
                        void 0 !== r
                        ? r
                        : null == t
                        ? void 0
                        : t.name;
                    }
                  : a;
            n.useEffect(function () {
              if (o) {
                var t = e.current;
                if (t) {
                  var r = u(t.getCurrentOptions(), t.getCurrentRoute());
                  document.title = r;
                }
                return null == t
                  ? void 0
                  : t.addListener("options", function (e) {
                      var r = u(
                        e.data.options,
                        null == t ? void 0 : t.getCurrentRoute()
                      );
                      document.title = r;
                    });
              }
            });
          });
        var n = (function (e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" != typeof e && "function" != typeof e))
            return { default: e };
          var r = o(t);
          if (r && r.has(e)) return r.get(e);
          var n = {},
            a = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var u in e)
            if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) {
              var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
              i && (i.get || i.set)
                ? Object.defineProperty(n, u, i)
                : (n[u] = e[u]);
            }
          (n.default = e), r && r.set(e, n);
          return n;
        })(r(0));
        function o(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (o = function (e) {
            return e ? r : t;
          })(e);
        }
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e, t) {
            var r = t.independent,
              n = t.enabled,
              i = void 0 === n || n,
              c = t.config,
              v = t.getStateFromPath,
              y = void 0 === v ? u.getStateFromPath : v,
              g = t.getPathFromState,
              b = void 0 === g ? u.getPathFromState : g,
              m = t.getActionFromState,
              h = void 0 === m ? u.getActionFromState : m;
            f.useEffect(function () {
              if (!r) {
                if (!1 !== i && p)
                  throw new Error(
                    [
                      "Looks like you have configured linking in multiple places. This is likely an error since URL integration should only be handled in one place to avoid conflicts. Make sure that:",
                      "- You are not using both 'linking' prop and 'useLinking'",
                      "- You don't have 'useLinking' in multiple components",
                    ]
                      .join("\n")
                      .trim()
                  );
                return (
                  (p = !1 !== i),
                  function () {
                    p = !1;
                  }
                );
              }
            });
            var O = f.useState(s),
              j = (0, o.default)(O, 1)[0],
              P = f.useRef(i),
              w = f.useRef(c),
              k = f.useRef(y),
              _ = f.useRef(b),
              M = f.useRef(h);
            f.useEffect(function () {
              (P.current = i),
                (w.current = c),
                (k.current = y),
                (_.current = b),
                (M.current = h);
            });
            var x = f.useContext(l.default),
              S = f.useCallback(function () {
                var e;
                if (P.current) {
                  var t,
                    r =
                      null !== (t = null == x ? void 0 : x.location) &&
                      void 0 !== t
                        ? t
                        : "undefined" != typeof window
                        ? window.location
                        : void 0,
                    n = r ? r.pathname + r.search : void 0;
                  n && (e = k.current(n, w.current));
                }
                var o = {
                  then: function (t) {
                    return Promise.resolve(t ? t(e) : e);
                  },
                  catch: function () {
                    return o;
                  },
                };
                return o;
              }, []),
              C = f.useRef(void 0),
              R = f.useRef(void 0),
              E = f.useRef(void 0);
            return (
              f.useEffect(
                function () {
                  return (
                    (C.current = j.index),
                    j.listen(function () {
                      var t,
                        r = e.current;
                      if (r && i) {
                        var n = location.pathname + location.search,
                          o = j.index,
                          a = null !== (t = C.current) && void 0 !== t ? t : 0;
                        (C.current = o), (E.current = n);
                        var u = j.get(o);
                        if (
                          (null == u ? void 0 : u.path) === n &&
                          null != u &&
                          u.state
                        )
                          r.resetRoot(u.state);
                        else {
                          var f = k.current(n, w.current);
                          if (f) {
                            var l = r.getRootState();
                            if (
                              f.routes.some(function (e) {
                                return !(
                                  null != l && l.routeNames.includes(e.name)
                                );
                              })
                            )
                              return void console.warn(
                                "The navigation state parsed from the URL contains routes not present in the root navigator. This usually means that the linking configuration doesn't match the navigation structure. See https://reactnavigation.org/docs/configuring-links for more details on how to specify a linking configuration."
                              );
                            if (o > a) {
                              var c = M.current(f, w.current);
                              if (void 0 !== c)
                                try {
                                  r.dispatch(c);
                                } catch (e) {
                                  console.warn(
                                    "An error occurred when trying to handle the link '" +
                                      n +
                                      "': " +
                                      e.message
                                  );
                                }
                              else r.resetRoot(f);
                            } else r.resetRoot(f);
                          } else r.resetRoot(f);
                        }
                      }
                    })
                  );
                },
                [i, j, e]
              ),
              f.useEffect(function () {
                var t;
                if (i) {
                  if (e.current) {
                    var r = e.current.getRootState();
                    if (r) {
                      var n,
                        f = (0, u.findFocusedRoute)(r),
                        l =
                          null !== (n = null == f ? void 0 : f.path) &&
                          void 0 !== n
                            ? n
                            : _.current(r, w.current);
                      void 0 === R.current && (R.current = r),
                        j.replace({ path: l, state: r });
                    }
                  }
                  var c, s, p, v;
                  return null === (t = e.current) || void 0 === t
                    ? void 0
                    : t.addListener(
                        "state",
                        ((c = function () {
                          var t, r, n, f, l, c, s, p, v, y, g, b, m, h;
                          return a.default.async(
                            function (O) {
                              for (;;)
                                switch ((O.prev = O.next)) {
                                  case 0:
                                    if ((r = e.current) && i) {
                                      O.next = 3;
                                      break;
                                    }
                                    return O.abrupt("return");
                                  case 3:
                                    if (
                                      ((n = R.current),
                                      (f = r.getRootState()),
                                      (l = E.current),
                                      (c = (0, u.findFocusedRoute)(f)),
                                      (s =
                                        null !==
                                          (t = null == c ? void 0 : c.path) &&
                                        void 0 !== t
                                          ? t
                                          : _.current(f, w.current)),
                                      (R.current = f),
                                      (E.current = void 0),
                                      (p = d(n, f)),
                                      (v = (0, o.default)(p, 2)),
                                      (y = v[0]),
                                      (g = v[1]),
                                      !y || !g || s === l)
                                    ) {
                                      O.next = 38;
                                      break;
                                    }
                                    if (
                                      !(
                                        (b =
                                          (g.history
                                            ? g.history.length
                                            : g.routes.length) -
                                          (y.history
                                            ? y.history.length
                                            : y.routes.length)) > 0
                                      )
                                    ) {
                                      O.next = 17;
                                      break;
                                    }
                                    j.push({ path: s, state: f }),
                                      (O.next = 36);
                                    break;
                                  case 17:
                                    if (!(b < 0)) {
                                      O.next = 35;
                                      break;
                                    }
                                    if (
                                      ((m = j.backIndex({ path: s })),
                                      (h = j.index),
                                      (O.prev = 20),
                                      !(-1 !== m && m < h))
                                    ) {
                                      O.next = 26;
                                      break;
                                    }
                                    return (
                                      (O.next = 24),
                                      a.default.awrap(j.go(m - h))
                                    );
                                  case 24:
                                    O.next = 28;
                                    break;
                                  case 26:
                                    return (
                                      (O.next = 28), a.default.awrap(j.go(b))
                                    );
                                  case 28:
                                    j.replace({ path: s, state: f }),
                                      (O.next = 33);
                                    break;
                                  case 31:
                                    (O.prev = 31), (O.t0 = O.catch(20));
                                  case 33:
                                    O.next = 36;
                                    break;
                                  case 35:
                                    j.replace({ path: s, state: f });
                                  case 36:
                                    O.next = 39;
                                    break;
                                  case 38:
                                    j.replace({ path: s, state: f });
                                  case 39:
                                  case "end":
                                    return O.stop();
                                }
                            },
                            null,
                            null,
                            [[20, 31]],
                            Promise
                          );
                        }),
                        (s = !1),
                        (p = []),
                        (v = function () {
                          var e;
                          return a.default.async(
                            function (t) {
                              for (;;)
                                switch ((t.prev = t.next)) {
                                  case 0:
                                    if (((t.prev = 0), !s)) {
                                      t.next = 4;
                                      break;
                                    }
                                    return p.unshift(v), t.abrupt("return");
                                  case 4:
                                    return (
                                      (s = !0),
                                      (t.next = 7),
                                      a.default.awrap(c())
                                    );
                                  case 7:
                                    return (
                                      (t.prev = 7),
                                      (s = !1),
                                      p.length &&
                                        (null == (e = p.pop()) || e()),
                                      t.finish(7)
                                    );
                                  case 11:
                                  case "end":
                                    return t.stop();
                                }
                            },
                            null,
                            null,
                            [[0, , 7, 11]],
                            Promise
                          );
                        }))
                      );
                }
              }),
              { getInitialState: S }
            );
          });
        var o = n(r(3)),
          a = n(r(59)),
          u = r(5),
          i = r(9),
          f = (function (e, t) {
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
                var u = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                u && (u.get || u.set)
                  ? Object.defineProperty(n, a, u)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(0)),
          l = n(r(61));
        function c(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (c = function (e) {
            return e ? r : t;
          })(e);
        }
        var s = function () {
            var e = 0,
              t = [],
              r = [],
              n = function () {
                r.forEach(function (e) {
                  var t = e.cb;
                  e.cb = function () {
                    return t(!0);
                  };
                });
              };
            return {
              get index() {
                var e,
                  r =
                    null === (e = window.history.state) || void 0 === e
                      ? void 0
                      : e.id;
                if (r) {
                  var n = t.findIndex(function (e) {
                    return e.id === r;
                  });
                  return n > -1 ? n : 0;
                }
                return 0;
              },
              get: function (e) {
                return t[e];
              },
              backIndex: function (r) {
                for (var n = r.path, o = e - 1; o >= 0; o--) {
                  if (t[o].path === n) return o;
                }
                return -1;
              },
              push: function (r) {
                var o = r.path,
                  a = r.state;
                n();
                var u = (0, i.nanoid)();
                (t = t.slice(0, e + 1)).push({ path: o, state: a, id: u }),
                  (e = t.length - 1),
                  window.history.pushState({ id: u }, "", o);
              },
              replace: function (r) {
                var o,
                  a,
                  u = r.path,
                  f = r.state;
                n();
                var l =
                  null !==
                    (o =
                      null === (a = window.history.state) || void 0 === a
                        ? void 0
                        : a.id) && void 0 !== o
                    ? o
                    : (0, i.nanoid)();
                t.length
                  ? (t[e] = { path: u, state: f, id: l })
                  : t.push({ path: u, state: f, id: l }),
                  window.history.replaceState({ id: l }, "", u);
              },
              go: function (o) {
                if (
                  (n(),
                  o > 0
                    ? (o = Math.min(o, t.length - 1))
                    : o < 0 && (o = e + o < 0 ? -e : o),
                  0 !== o)
                )
                  return (
                    (e += o),
                    new Promise(function (e, t) {
                      var n = function (r) {
                        if ((clearTimeout(a), r))
                          t(
                            new Error("History was changed during navigation.")
                          );
                        else {
                          var n = window.document.title;
                          (window.document.title = ""),
                            (window.document.title = n),
                            e();
                        }
                      };
                      r.push({ ref: n, cb: n });
                      var a = setTimeout(function () {
                        var e = r.findIndex(function (e) {
                          return e.ref === n;
                        });
                        e > -1 && (r[e].cb(), r.splice(e, 1));
                      }, 100);
                      window.addEventListener("popstate", function e() {
                        var t = r.pop();
                        window.removeEventListener("popstate", e),
                          null == t || t.cb();
                      }),
                        window.history.go(o);
                    })
                  );
              },
              listen: function (e) {
                var t = function () {
                  r.length || e();
                };
                return (
                  window.addEventListener("popstate", t),
                  function () {
                    return window.removeEventListener("popstate", t);
                  }
                );
              },
            };
          },
          d = function e(t, r) {
            if (void 0 === t || void 0 === r || t.key !== r.key)
              return [void 0, void 0];
            var n = t.history ? t.history.length : t.routes.length,
              o = r.history ? r.history.length : r.routes.length,
              a = t.routes[t.index],
              u = r.routes[r.index],
              i = a.state,
              f = u.state;
            return n !== o ||
              a.key !== u.key ||
              void 0 === i ||
              void 0 === f ||
              i.key !== f.key
              ? [t, r]
              : e(i, f);
          },
          p = !1;
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = u.useState(e),
              r = (0, a.default)(t, 1)[0],
              n = [!1, void 0];
            r.then(function (e) {
              n = [!0, e];
            });
            var i = u.useState(n),
              f = (0, a.default)(i, 2),
              l = f[0],
              c = f[1],
              s = (0, a.default)(l, 1)[0];
            return (
              u.useEffect(
                function () {
                  var e,
                    t = !1;
                  return (
                    s ||
                      o.default.async(
                        function (n) {
                          for (;;)
                            switch ((n.prev = n.next)) {
                              case 0:
                                return (
                                  (n.prev = 0), (n.next = 3), o.default.awrap(r)
                                );
                              case 3:
                                e = n.sent;
                              case 4:
                                return (
                                  (n.prev = 4), t || c([!0, e]), n.finish(4)
                                );
                              case 7:
                              case "end":
                                return n.stop();
                            }
                        },
                        null,
                        null,
                        [[0, , 4, 7]],
                        Promise
                      ),
                    function () {
                      t = !0;
                    }
                  );
                },
                [r, s]
              ),
              l
            );
          });
        var o = n(r(59)),
          a = n(r(3)),
          u = (function (e, t) {
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
          })(r(0));
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
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var o = r(5),
          a = (function (e, t) {
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
          })(r(0)),
          u = n(r(61));
        function i(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (i = function (e) {
            return e ? r : t;
          })(e);
        }
        var f = a.forwardRef(function (e, t) {
          var r = e.children,
            n = e.location;
          a.useEffect(function () {
            console.error(
              "'ServerContainer' should only be used on the server with 'react-dom/server' for SSR."
            );
          }, []);
          var i = {};
          if (t) {
            var f = {
              getCurrentOptions: function () {
                return i.options;
              },
            };
            "function" == typeof t ? t(f) : (t.current = f);
          }
          return a.createElement(
            u.default.Provider,
            { value: { location: n } },
            a.createElement(o.CurrentRenderContext.Provider, { value: i }, r)
          );
        });
        t.default = f;
      },
      (e, t) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var r = {
          dark: !0,
          colors: {
            primary: "rgb(10, 132, 255)",
            background: "rgb(1, 1, 1)",
            card: "rgb(18, 18, 18)",
            text: "rgb(229, 229, 231)",
            border: "rgb(39, 39, 41)",
            notification: "rgb(255, 69, 58)",
          },
        };
        t.default = r;
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function () {
            return o.useContext(a.default);
          });
        var o = (function (e, t) {
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
          })(r(0)),
          a = n(r(58));
        function u(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (u = function (e) {
            return e ? r : t;
          })(e);
        }
      },
      (e, t) => {
        Object.defineProperty(t, "__esModule", { value: !0 });
      },
      (e, t, r) => {
        var n = r(1);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function () {
            var e = u.useContext(a.NavigationHelpersContext),
              t = u.useContext(i.default);
            return u.useCallback(
              function (r, n) {
                var o = t.options;
                if (!1 !== (null == o ? void 0 : o.enabled)) {
                  var u = e
                    ? l(e, { index: 0, routes: [{ name: r, params: n }] })
                    : { index: 0, routes: [{ name: r, params: n }] };
                  return null != o && o.getPathFromState
                    ? o.getPathFromState(u, null == o ? void 0 : o.config)
                    : (0, a.getPathFromState)(u, null == o ? void 0 : o.config);
                }
              },
              [t, e]
            );
          });
        var o = n(r(2)),
          a = r(5),
          u = (function (e, t) {
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
                var u = o ? Object.getOwnPropertyDescriptor(e, a) : null;
                u && (u.get || u.set)
                  ? Object.defineProperty(n, a, u)
                  : (n[a] = e[a]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(0)),
          i = n(r(26));
        function f(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (f = function (e) {
            return e ? r : t;
          })(e);
        }
        var l = function e(t, r) {
          var n = t.getParent();
          if (n) {
            var a = n.getState();
            return e(n, {
              index: 0,
              routes: [(0, o.default)({}, a.routes[a.index], { state: r })],
            });
          }
          return r;
        };
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = (0, n.useNavigation)(),
              r = (0, n.useRoute)();
            o.useEffect(
              function () {
                for (var n = t; n && "tab" !== n.getState().type; )
                  n = n.getParent();
                if (n)
                  return n.addListener("tabPress", function (o) {
                    var a = t.isFocused(),
                      u = t === n || t.getState().routes[0].key === r.key;
                    requestAnimationFrame(function () {
                      var t = (function (e) {
                        if (null == e.current) return null;
                        return "scrollToTop" in e.current ||
                          "scrollTo" in e.current ||
                          "scrollToOffset" in e.current ||
                          "scrollResponderScrollTo" in e.current
                          ? e.current
                          : "getScrollResponder" in e.current
                          ? e.current.getScrollResponder()
                          : "getNode" in e.current
                          ? e.current.getNode()
                          : e.current;
                      })(e);
                      a &&
                        u &&
                        t &&
                        !o.defaultPrevented &&
                        ("scrollToTop" in t
                          ? t.scrollToTop()
                          : "scrollTo" in t
                          ? t.scrollTo({ y: 0, animated: !0 })
                          : "scrollToOffset" in t
                          ? t.scrollToOffset({ offset: 0, animated: !0 })
                          : "scrollResponderScrollTo" in t &&
                            t.scrollResponderScrollTo({ y: 0, animated: !0 }));
                    });
                  });
              },
              [t, e, r.key]
            );
          });
        var n = r(5),
          o = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = a(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              o = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var u in e)
              if (
                "default" !== u &&
                Object.prototype.hasOwnProperty.call(e, u)
              ) {
                var i = o ? Object.getOwnPropertyDescriptor(e, u) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, u, i)
                  : (n[u] = e[u]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(0));
        function a(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (a = function (e) {
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
  r.g = (function () {
    if ("object" == typeof globalThis) return globalThis;
    try {
      return this || new Function("return this")();
    } catch (e) {
      if ("object" == typeof window) return window;
    }
  })();
  var n = r(28);
  exports["@react-navigation/native"] = n;
})();
