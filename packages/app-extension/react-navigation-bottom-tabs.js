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
        var n = r(23);
        (e.exports = function (e, t) {
          if (null == e) return {};
          var r,
            a,
            o = n(e, t);
          if (Object.getOwnPropertySymbols) {
            var i = Object.getOwnPropertySymbols(e);
            for (a = 0; a < i.length; a++)
              (r = i[a]),
                t.indexOf(r) >= 0 ||
                  (Object.prototype.propertyIsEnumerable.call(e, r) &&
                    (o[r] = e[r]));
          }
          return o;
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e, t, r) => {
        var n = r(27),
          a = r(28),
          o = r(11),
          i = r(29);
        (e.exports = function (e, t) {
          return n(e) || a(e, t) || o(e, t) || i();
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
      (e) => {
        "use strict";
        e.exports = require("react-native-safe-area-context");
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 });
        var a = {
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
            return o.default;
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
              return h.default;
            },
          }),
          Object.defineProperty(t, "HeaderTitle", {
            enumerable: !0,
            get: function () {
              return p.default;
            },
          }),
          Object.defineProperty(t, "useHeaderHeight", {
            enumerable: !0,
            get: function () {
              return b.default;
            },
          }),
          Object.defineProperty(t, "MissingIcon", {
            enumerable: !0,
            get: function () {
              return v.default;
            },
          }),
          Object.defineProperty(t, "PlatformPressable", {
            enumerable: !0,
            get: function () {
              return y.default;
            },
          }),
          Object.defineProperty(t, "ResourceSavingView", {
            enumerable: !0,
            get: function () {
              return g.default;
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
        var o = n(r(32)),
          i = n(r(12)),
          l = n(r(45)),
          u = n(r(46)),
          s = n(r(47)),
          c = n(r(49)),
          d = n(r(33)),
          f = n(r(17)),
          h = n(r(13)),
          p = n(r(34)),
          b = n(r(50)),
          v = n(r(51)),
          y = n(r(35)),
          g = n(r(52)),
          m = n(r(53)),
          w = n(r(54)),
          O = r(55);
        Object.keys(O).forEach(function (e) {
          "default" !== e &&
            "__esModule" !== e &&
            (Object.prototype.hasOwnProperty.call(a, e) ||
              (e in t && t[e] === O[e]) ||
              Object.defineProperty(t, e, {
                enumerable: !0,
                get: function () {
                  return O[e];
                },
              }));
        });
        var j = [r(15), r(16)];
        t.Assets = j;
      },
      (e, t, r) => {
        var n = r(24),
          a = r(25),
          o = r(11),
          i = r(26);
        (e.exports = function (e) {
          return n(e) || a(e) || o(e) || i();
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
        var n = r(10);
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
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e, t, r) {
            var a,
              o = e.width > e.height;
            a =
              "ios" === n.Platform.OS
                ? n.Platform.isPad || n.Platform.isTV
                  ? t
                    ? 56
                    : 50
                  : o
                  ? 32
                  : t
                  ? 56
                  : 44
                : "android" === n.Platform.OS
                ? 56
                : 64;
            return a + r;
          });
        var n = r(2);
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var a = (0, n(r(14)).default)("HeaderShownContext", !1);
        t.default = a;
      },
      (e, t, r) => {
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e, t) {
            var n = r.g[i].get(e);
            if (n) return n;
            return (
              ((n = a.createContext(t)).displayName = e), r.g[i].set(e, n), n
            );
          });
        var n,
          a = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = o(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              a = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var i in e)
              if (
                "default" !== i &&
                Object.prototype.hasOwnProperty.call(e, i)
              ) {
                var l = a ? Object.getOwnPropertyDescriptor(e, i) : null;
                l && (l.get || l.set)
                  ? Object.defineProperty(n, i, l)
                  : (n[i] = e[i]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1));
        function o(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (o = function (e) {
            return e ? r : t;
          })(e);
        }
        var i = "__react_navigation__elements_contexts";
        r.g[i] = null != (n = r.g[i]) ? n : new Map();
      },
      (e, t, r) => {
        var n = r(36);
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
        var n = r(36);
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
        var a = (0, n(r(14)).default)("HeaderHeightContext", void 0);
        t.default = a;
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
        var a = (function (e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" != typeof e && "function" != typeof e))
            return { default: e };
          var r = n(t);
          if (r && r.has(e)) return r.get(e);
          var a = {},
            o = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var i in e)
            if ("default" !== i && Object.prototype.hasOwnProperty.call(e, i)) {
              var l = o ? Object.getOwnPropertyDescriptor(e, i) : null;
              l && (l.get || l.set)
                ? Object.defineProperty(a, i, l)
                : (a[i] = e[i]);
            }
          (a.default = e), r && r.set(e, a);
          return a;
        })(r(1)).createContext(void 0);
        t.default = a;
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
        var a = (function (e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" != typeof e && "function" != typeof e))
            return { default: e };
          var r = n(t);
          if (r && r.has(e)) return r.get(e);
          var a = {},
            o = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var i in e)
            if ("default" !== i && Object.prototype.hasOwnProperty.call(e, i)) {
              var l = o ? Object.getOwnPropertyDescriptor(e, i) : null;
              l && (l.get || l.set)
                ? Object.defineProperty(a, i, l)
                : (a[i] = e[i]);
            }
          (a.default = e), r && r.set(e, a);
          return a;
        })(r(1)).createContext(void 0);
        t.default = a;
      },
      (e, t, r) => {
        var n = r(0),
          a = n(r(4)),
          o = n(r(9));
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
          var u = r(38),
            s = r(41),
            c = ["keyword", "gray", "hex"],
            d = {},
            f = 0,
            h = Object.keys(s);
          f < h.length;
          f++
        ) {
          var p = h[f];
          d[(0, o.default)(s[p].labels).sort().join("")] = p;
        }
        var b = {};
        function v(e, t) {
          if (!(this instanceof v)) return new v(e, t);
          if ((t && t in c && (t = null), t && !(t in s)))
            throw new Error("Unknown model: " + t);
          var r, n;
          if (null == e)
            (this.model = "rgb"), (this.color = [0, 0, 0]), (this.valpha = 1);
          else if (e instanceof v)
            (this.model = e.model),
              (this.color = (0, o.default)(e.color)),
              (this.valpha = e.valpha);
          else if ("string" == typeof e) {
            var a = u.get(e);
            if (null === a)
              throw new Error("Unable to parse color from string: " + e);
            (this.model = a.model),
              (n = s[this.model].channels),
              (this.color = a.value.slice(0, n)),
              (this.valpha = "number" == typeof a.value[n] ? a.value[n] : 1);
          } else if (e.length > 0) {
            (this.model = t || "rgb"), (n = s[this.model].channels);
            var i = Array.prototype.slice.call(e, 0, n);
            (this.color = P(i, n)),
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
            var h = s[this.model].labels,
              p = [];
            for (r = 0; r < h.length; r++) p.push(e[h[r]]);
            this.color = P(p);
          }
          if (b[this.model])
            for (n = s[this.model].channels, r = 0; r < n; r++) {
              var y = b[this.model][r];
              y && (this.color[r] = y(this.color[r]));
            }
          (this.valpha = Math.max(0, Math.min(1, this.valpha))),
            Object.freeze && Object.freeze(this);
        }
        v.prototype = {
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
                  : [].concat((0, o.default)(t.color), [this.valpha]);
            return u.to[t.model](r);
          },
          percentString: function (e) {
            var t = this.rgb().round("number" == typeof e ? e : 1),
              r =
                1 === t.valpha
                  ? t.color
                  : [].concat((0, o.default)(t.color), [this.valpha]);
            return u.to.rgb.percent(r);
          },
          array: function () {
            return 1 === this.valpha
              ? (0, o.default)(this.color)
              : [].concat((0, o.default)(this.color), [this.valpha]);
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
              new v(
                [].concat(
                  (0, o.default)(
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
              ? new v(
                  [].concat((0, o.default)(this.color), [
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
            return void 0 !== e ? new v(e) : s[this.model].keyword(this.color);
          },
          hex: function (e) {
            return void 0 !== e ? new v(e) : u.to.hex(this.rgb().round().color);
          },
          hexa: function (e) {
            if (void 0 !== e) return new v(e);
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
                o = (0, a.default)(n, 2),
                l = o[0],
                u = o[1] / 255;
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
            return v.rgb(t, t, t);
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
              a = void 0 === t ? 0.5 : t,
              o = 2 * a - 1,
              i = r.alpha() - n.alpha(),
              l = ((o * i == -1 ? o : (o + i) / (1 + o * i)) + 1) / 2,
              u = 1 - l;
            return v.rgb(
              l * r.red() + u * n.red(),
              l * r.green() + u * n.green(),
              l * r.blue() + u * n.blue(),
              r.alpha() * a + n.alpha() * (1 - a)
            );
          },
        };
        for (
          var y = function (e) {
              if (c.includes(e)) return "continue";
              var t = s[e].channels;
              (v.prototype[e] = function () {
                if (this.model === e) return new v(this);
                for (
                  var t = arguments.length, r = new Array(t), n = 0;
                  n < t;
                  n++
                )
                  r[n] = arguments[n];
                return r.length > 0
                  ? new v(r, e)
                  : new v(
                      [].concat(
                        (0, o.default)(j(s[this.model][e].raw(this.color))),
                        [this.valpha]
                      ),
                      e
                    );
              }),
                (v[e] = function () {
                  for (
                    var r = arguments.length, n = new Array(r), a = 0;
                    a < r;
                    a++
                  )
                    n[a] = arguments[a];
                  var o = n[0];
                  return "number" == typeof o && (o = P(n, t)), new v(o, e);
                });
            },
            g = 0,
            m = Object.keys(s);
          g < m.length;
          g++
        )
          y(m[g]);
        function w(e, t, r) {
          for (
            var n, a = i((e = Array.isArray(e) ? e : [e]));
            !(n = a()).done;

          ) {
            var o = n.value;
            (b[o] || (b[o] = []))[t] = r;
          }
          return (
            (e = e[0]),
            function (n) {
              var a;
              return void 0 !== n
                ? (r && (n = r(n)), ((a = this[e]()).color[t] = n), a)
                : ((a = this[e]().color[t]), r && (a = r(a)), a);
            }
          );
        }
        function O(e) {
          return function (t) {
            return Math.max(0, Math.min(e, t));
          };
        }
        function j(e) {
          return Array.isArray(e) ? e : [e];
        }
        function P(e, t) {
          for (var r = 0; r < t; r++) "number" != typeof e[r] && (e[r] = 0);
          return e;
        }
        e.exports = v;
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
          var n = r(0)(r(4)), a = r(21), o = {}, i = 0, l = Object.keys(a);
          i < l.length;
          i++
        ) {
          var u = l[i];
          o[a[u]] = u;
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
          var h = s[f],
            p = h.channels,
            b = h.labels;
          delete s[f].channels,
            delete s[f].labels,
            Object.defineProperty(s[f], "channels", { value: p }),
            Object.defineProperty(s[f], "labels", { value: b });
        }
        (s.rgb.hsl = function (e) {
          var t,
            r = e[0] / 255,
            n = e[1] / 255,
            a = e[2] / 255,
            o = Math.min(r, n, a),
            i = Math.max(r, n, a),
            l = i - o;
          i === o
            ? (t = 0)
            : r === i
            ? (t = (n - a) / l)
            : n === i
            ? (t = 2 + (a - r) / l)
            : a === i && (t = 4 + (r - n) / l),
            (t = Math.min(60 * t, 360)) < 0 && (t += 360);
          var u = (o + i) / 2;
          return [
            t,
            100 * (i === o ? 0 : u <= 0.5 ? l / (i + o) : l / (2 - i - o)),
            100 * u,
          ];
        }),
          (s.rgb.hsv = function (e) {
            var t,
              r,
              n,
              a,
              o,
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
                ? ((a = 0), (o = 0))
                : ((o = c / s),
                  (t = d(i)),
                  (r = d(l)),
                  (n = d(u)),
                  i === s
                    ? (a = n - r)
                    : l === s
                    ? (a = 1 / 3 + t - n)
                    : u === s && (a = 2 / 3 + r - t),
                  a < 0 ? (a += 1) : a > 1 && (a -= 1)),
              [360 * a, 100 * o, 100 * s]
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
              a = Math.min(1 - t, 1 - r, 1 - n);
            return [
              100 * ((1 - t - a) / (1 - a) || 0),
              100 * ((1 - r - a) / (1 - a) || 0),
              100 * ((1 - n - a) / (1 - a) || 0),
              100 * a,
            ];
          }),
          (s.rgb.keyword = function (e) {
            var t = o[e];
            if (t) return t;
            for (
              var r, n, i, l = 1 / 0, u = 0, s = Object.keys(a);
              u < s.length;
              u++
            ) {
              var c = s[u],
                d = a[c],
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
            return a[e];
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
              a = t[2];
            return (
              (n /= 100),
              (a /= 108.883),
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
                    (a =
                      a > 0.008856
                        ? Math.pow(a, 1 / 3)
                        : 7.787 * a + 16 / 116)),
              ]
            );
          }),
          (s.hsl.rgb = function (e) {
            var t,
              r,
              n,
              a = e[0] / 360,
              o = e[1] / 100,
              i = e[2] / 100;
            if (0 === o) return [(n = 255 * i), n, n];
            for (
              var l = 2 * i - (t = i < 0.5 ? i * (1 + o) : i + o - i * o),
                u = [0, 0, 0],
                s = 0;
              s < 3;
              s++
            )
              (r = a + (1 / 3) * -(s - 1)) < 0 && r++,
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
              a = r,
              o = Math.max(n, 0.01);
            return (
              (r *= (n *= 2) <= 1 ? n : 2 - n),
              (a *= o <= 1 ? o : 2 - o),
              [
                t,
                100 * (0 === n ? (2 * a) / (o + a) : (2 * r) / (n + r)),
                100 * ((n + r) / 2),
              ]
            );
          }),
          (s.hsv.rgb = function (e) {
            var t = e[0] / 60,
              r = e[1] / 100,
              n = e[2] / 100,
              a = Math.floor(t) % 6,
              o = t - Math.floor(t),
              i = 255 * n * (1 - r),
              l = 255 * n * (1 - r * o),
              u = 255 * n * (1 - r * (1 - o));
            switch (((n *= 255), a)) {
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
              a = e[1] / 100,
              o = e[2] / 100,
              i = Math.max(o, 0.01);
            r = (2 - a) * o;
            var l = (2 - a) * i;
            return (
              (t = a * i),
              [n, 100 * (t = (t /= l <= 1 ? l : 2 - l) || 0), 100 * (r /= 2)]
            );
          }),
          (s.hwb.rgb = function (e) {
            var t,
              r = e[0] / 360,
              n = e[1] / 100,
              a = e[2] / 100,
              o = n + a;
            o > 1 && ((n /= o), (a /= o));
            var i = Math.floor(6 * r),
              l = 1 - a;
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
              a = e[3] / 100;
            return [
              255 * (1 - Math.min(1, t * (1 - a) + a)),
              255 * (1 - Math.min(1, r * (1 - a) + a)),
              255 * (1 - Math.min(1, n * (1 - a) + a)),
            ];
          }),
          (s.xyz.rgb = function (e) {
            var t,
              r,
              n,
              a = e[0] / 100,
              o = e[1] / 100,
              i = e[2] / 100;
            return (
              (r = -0.9689 * a + 1.8758 * o + 0.0415 * i),
              (n = 0.0557 * a + -0.204 * o + 1.057 * i),
              (t =
                (t = 3.2406 * a + -1.5372 * o + -0.4986 * i) > 0.0031308
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
              a = e[0];
            (t = e[1] / 500 + (r = (a + 16) / 116)), (n = r - e[2] / 200);
            var o = Math.pow(r, 3),
              i = Math.pow(t, 3),
              l = Math.pow(n, 3);
            return (
              (r = o > 0.008856 ? o : (r - 16 / 116) / 7.787),
              (t = i > 0.008856 ? i : (t - 16 / 116) / 7.787),
              (n = l > 0.008856 ? l : (n - 16 / 116) / 7.787),
              [(t *= 95.047), (r *= 100), (n *= 108.883)]
            );
          }),
          (s.lab.lch = function (e) {
            var t,
              r = e[0],
              n = e[1],
              a = e[2];
            return (
              (t = (360 * Math.atan2(a, n)) / 2 / Math.PI) < 0 && (t += 360),
              [r, Math.sqrt(n * n + a * a), t]
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
              a = r[0],
              o = r[1],
              i = r[2],
              l = null === t ? s.rgb.hsv(e)[2] : t;
            if (0 === (l = Math.round(l / 50))) return 30;
            var u =
              30 +
              ((Math.round(i / 255) << 2) |
                (Math.round(o / 255) << 1) |
                Math.round(a / 255));
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
              a = e[2] / 255,
              o = Math.max(Math.max(r, n), a),
              i = Math.min(Math.min(r, n), a),
              l = o - i;
            return (
              (t =
                l <= 0
                  ? 0
                  : o === r
                  ? ((n - a) / l) % 6
                  : o === n
                  ? 2 + (a - r) / l
                  : 4 + (r - n) / l),
              (t /= 6),
              [360 * (t %= 1), 100 * l, 100 * (l < 1 ? i / (1 - l) : 0)]
            );
          }),
          (s.hsl.hcg = function (e) {
            var t = e[1] / 100,
              r = e[2] / 100,
              n = r < 0.5 ? 2 * t * r : 2 * t * (1 - r),
              a = 0;
            return (
              n < 1 && (a = (r - 0.5 * n) / (1 - n)), [e[0], 100 * n, 100 * a]
            );
          }),
          (s.hsv.hcg = function (e) {
            var t = e[1] / 100,
              r = e[2] / 100,
              n = t * r,
              a = 0;
            return n < 1 && (a = (r - n) / (1 - n)), [e[0], 100 * n, 100 * a];
          }),
          (s.hcg.rgb = function (e) {
            var t = e[0] / 360,
              r = e[1] / 100,
              n = e[2] / 100;
            if (0 === r) return [255 * n, 255 * n, 255 * n];
            var a,
              o = [0, 0, 0],
              i = (t % 1) * 6,
              l = i % 1,
              u = 1 - l;
            switch (Math.floor(i)) {
              case 0:
                (o[0] = 1), (o[1] = l), (o[2] = 0);
                break;
              case 1:
                (o[0] = u), (o[1] = 1), (o[2] = 0);
                break;
              case 2:
                (o[0] = 0), (o[1] = 1), (o[2] = l);
                break;
              case 3:
                (o[0] = 0), (o[1] = u), (o[2] = 1);
                break;
              case 4:
                (o[0] = l), (o[1] = 0), (o[2] = 1);
                break;
              default:
                (o[0] = 1), (o[1] = 0), (o[2] = u);
            }
            return (
              (a = (1 - r) * n),
              [255 * (r * o[0] + a), 255 * (r * o[1] + a), 255 * (r * o[2] + a)]
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
              a = 0;
            return n < 1 && (a = (r - n) / (1 - n)), [e[0], 100 * n, 100 * a];
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
      (e) => {
        (e.exports = function (e, t) {
          if (null == e) return {};
          var r,
            n,
            a = {},
            o = Object.keys(e);
          for (n = 0; n < o.length; n++)
            (r = o[n]), t.indexOf(r) >= 0 || (a[r] = e[r]);
          return a;
        }),
          (e.exports.__esModule = !0),
          (e.exports.default = e.exports);
      },
      (e, t, r) => {
        var n = r(10);
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
              a,
              o,
              i,
              l = [],
              u = !0,
              s = !1;
            try {
              if (((o = (r = r.call(e)).next), 0 === t)) {
                if (Object(r) !== r) return;
                u = !1;
              } else
                for (
                  ;
                  !(u = (n = o.call(r)).done) &&
                  (l.push(n.value), l.length !== t);
                  u = !0
                );
            } catch (e) {
              (s = !0), (a = e);
            } finally {
              try {
                if (
                  !u &&
                  null != r.return &&
                  ((i = r.return()), Object(i) !== i)
                )
                  return;
              } finally {
                if (s) throw a;
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
      (e) => {
        new Set();
        e.exports = function (e) {};
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.tabBar,
              r =
                void 0 === t
                  ? function (e) {
                      return u.createElement(h.default, e);
                    }
                  : t,
              n = e.state,
              b = e.navigation,
              v = e.descriptors,
              m = e.safeAreaInsets,
              w = e.detachInactiveScreens,
              O =
                void 0 === w
                  ? "web" === s.Platform.OS ||
                    "android" === s.Platform.OS ||
                    "ios" === s.Platform.OS
                  : w,
              j = e.sceneContainerStyle,
              P = n.routes[n.index].key,
              M = u.useState([P]),
              S = (0, i.default)(M, 2),
              x = S[0],
              k = S[1];
            x.includes(P) || k([].concat((0, o.default)(x), [P]));
            var _ = l.SafeAreaProviderCompat.initialMetrics.frame,
              C = u.useState(function () {
                return (0,
                h.getTabBarHeight)({ state: n, descriptors: v, dimensions: _, layout: { width: _.width, height: 0 }, insets: (0, a.default)({}, l.SafeAreaProviderCompat.initialMetrics.insets, e.safeAreaInsets), style: v[n.routes[n.index].key].options.tabBarStyle });
              }),
              B = (0, i.default)(C, 2),
              E = B[0],
              W = B[1],
              A = n.routes;
            return u.createElement(
              l.SafeAreaProviderCompat,
              null,
              u.createElement(
                p.MaybeScreenContainer,
                { enabled: O, hasTwoStates: !0, style: g.container },
                A.map(function (e, t) {
                  var r = v[e.key],
                    a = r.options,
                    o = a.lazy,
                    i = void 0 === o || o,
                    c = a.unmountOnBlur,
                    d = n.index === t;
                  if (c && !d) return null;
                  if (i && !x.includes(e.key) && !d) return null;
                  var h = r.options,
                    b = h.freezeOnBlur,
                    g = h.header,
                    m =
                      void 0 === g
                        ? function (t) {
                            var r = t.layout,
                              n = t.options;
                            return u.createElement(
                              l.Header,
                              y({}, n, {
                                layout: r,
                                title: (0, l.getHeaderTitle)(n, e.name),
                              })
                            );
                          }
                        : g,
                    w = h.headerShown,
                    P = h.headerStatusBarHeight,
                    M = h.headerTransparent;
                  return u.createElement(
                    p.MaybeScreen,
                    {
                      key: e.key,
                      style: [
                        s.StyleSheet.absoluteFill,
                        { zIndex: d ? 0 : -1 },
                      ],
                      visible: d,
                      enabled: O,
                      freezeOnBlur: b,
                    },
                    u.createElement(
                      f.default.Provider,
                      { value: E },
                      u.createElement(
                        l.Screen,
                        {
                          focused: d,
                          route: r.route,
                          navigation: r.navigation,
                          headerShown: w,
                          headerStatusBarHeight: P,
                          headerTransparent: M,
                          header: m({
                            layout: _,
                            route: r.route,
                            navigation: r.navigation,
                            options: r.options,
                          }),
                          style: j,
                        },
                        r.render()
                      )
                    )
                  );
                })
              ),
              u.createElement(
                d.default.Provider,
                { value: W },
                u.createElement(
                  c.SafeAreaInsetsContext.Consumer,
                  null,
                  function (e) {
                    var t, a, o, i, l, u, s, c;
                    return r({
                      state: n,
                      descriptors: v,
                      navigation: b,
                      insets: {
                        top:
                          null !=
                          (t =
                            null != (a = null == m ? void 0 : m.top)
                              ? a
                              : null == e
                              ? void 0
                              : e.top)
                            ? t
                            : 0,
                        right:
                          null !=
                          (o =
                            null != (i = null == m ? void 0 : m.right)
                              ? i
                              : null == e
                              ? void 0
                              : e.right)
                            ? o
                            : 0,
                        bottom:
                          null !=
                          (l =
                            null != (u = null == m ? void 0 : m.bottom)
                              ? u
                              : null == e
                              ? void 0
                              : e.bottom)
                            ? l
                            : 0,
                        left:
                          null !=
                          (s =
                            null != (c = null == m ? void 0 : m.left)
                              ? c
                              : null == e
                              ? void 0
                              : e.left)
                            ? s
                            : 0,
                      },
                    });
                  }
                )
              )
            );
          });
        var a = n(r(6)),
          o = n(r(9)),
          i = n(r(4)),
          l = r(8),
          u = v(r(1)),
          s = r(2),
          c = r(7),
          d = n(r(18)),
          f = n(r(19)),
          h = v(r(37)),
          p = r(60);
        function b(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (b = function (e) {
            return e ? r : t;
          })(e);
        }
        function v(e, t) {
          if (!t && e && e.__esModule) return e;
          if (null === e || ("object" != typeof e && "function" != typeof e))
            return { default: e };
          var r = b(t);
          if (r && r.has(e)) return r.get(e);
          var n = {},
            a = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var o in e)
            if ("default" !== o && Object.prototype.hasOwnProperty.call(e, o)) {
              var i = a ? Object.getOwnPropertyDescriptor(e, o) : null;
              i && (i.get || i.set)
                ? Object.defineProperty(n, o, i)
                : (n[o] = e[o]);
            }
          return (n.default = e), r && r.set(e, n), n;
        }
        function y() {
          return (y = Object.assign
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
        var g = s.StyleSheet.create({
          container: { flex: 1, overflow: "hidden" },
        });
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.style,
              r = (0, a.default)(e, ["style"]),
              n = (0, o.useTheme)().colors;
            return i.createElement(
              l.View,
              s({}, r, {
                style: [{ flex: 1, backgroundColor: n.background }, t],
              })
            );
          });
        var a = n(r(3)),
          o = r(5),
          i = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = u(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              a = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var o in e)
              if (
                "default" !== o &&
                Object.prototype.hasOwnProperty.call(e, o)
              ) {
                var i = a ? Object.getOwnPropertyDescriptor(e, o) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, o, i)
                  : (n[o] = e[o]);
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
              r = (0, o.default)(e, ["style"]),
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
        var a = n(r(6)),
          o = n(r(3)),
          i = r(5),
          l = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = s(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              a = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var o in e)
              if (
                "default" !== o &&
                Object.prototype.hasOwnProperty.call(e, o)
              ) {
                var i = a ? Object.getOwnPropertyDescriptor(e, o) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, o, i)
                  : (n[o] = e[o]);
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
          container: (0, a.default)(
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
              n = (0, a.default)(e, ["tintColor", "style"]),
              u = (0, o.useTheme)().colors;
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
        var a = n(r(3)),
          o = r(5),
          i = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = u(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              a = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var o in e)
              if (
                "default" !== o &&
                Object.prototype.hasOwnProperty.call(e, o)
              ) {
                var i = a ? Object.getOwnPropertyDescriptor(e, o) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, o, i)
                  : (n[o] = e[o]);
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
              p = e.pressOpacity,
              b = void 0 === p ? 0.3 : p,
              v = e.style,
              y = (0, i.default)(e, [
                "onPressIn",
                "onPressOut",
                "android_ripple",
                "pressColor",
                "pressOpacity",
                "style",
              ]),
              g = (0, l.useTheme)().dark,
              m = u.useState(function () {
                return new s.Animated.Value(1);
              }),
              w = (0, o.default)(m, 1)[0],
              O = function (e, t) {
                h ||
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
                    O(b, 0), null == t || t(e);
                  },
                  onPressOut: function (e) {
                    O(1, 200), null == r || r(e);
                  },
                  android_ripple: h
                    ? (0, a.default)(
                        {
                          color:
                            void 0 !== c
                              ? c
                              : g
                              ? "rgba(255, 255, 255, .32)"
                              : "rgba(0, 0, 0, .32)",
                        },
                        n
                      )
                    : void 0,
                  style: [{ opacity: h ? 1 : w }, v],
                },
                y
              )
            );
          });
        var a = n(r(6)),
          o = n(r(4)),
          i = n(r(3)),
          l = r(5),
          u = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = c(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              a = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var o in e)
              if (
                "default" !== o &&
                Object.prototype.hasOwnProperty.call(e, o)
              ) {
                var i = a ? Object.getOwnPropertyDescriptor(e, o) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, o, i)
                  : (n[o] = e[o]);
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
          h = "android" === s.Platform.OS && s.Platform.Version >= 21;
      },
      (e) => {
        "use strict";
        e.exports = require("AssetRegistry");
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.state,
              r = e.navigation,
              n = e.descriptors,
              i = e.insets,
              w = e.style,
              O = (0, u.useTheme)().colors,
              j = (0, u.useLinkBuilder)(),
              P = t.routes[t.index],
              M = n[P.key].options,
              S = M.tabBarShowLabel,
              x = M.tabBarHideOnKeyboard,
              k = void 0 !== x && x,
              _ = M.tabBarVisibilityAnimationConfig,
              C = M.tabBarStyle,
              B = M.tabBarBackground,
              E = M.tabBarActiveTintColor,
              W = M.tabBarInactiveTintColor,
              A = M.tabBarActiveBackgroundColor,
              T = M.tabBarInactiveBackgroundColor,
              L = (0, d.useSafeAreaFrame)(),
              R = (0, h.default)(),
              D = s.default.useContext(f.default),
              H = !(k && R),
              I = s.default.useRef(_);
            s.default.useEffect(function () {
              I.current = _;
            });
            var z = s.default.useState(!H),
              V = (0, a.default)(z, 2),
              F = V[0],
              N = V[1],
              q = s.default.useState(function () {
                return new c.Animated.Value(H ? 1 : 0);
              }),
              K = (0, a.default)(q, 1)[0];
            s.default.useEffect(
              function () {
                var e,
                  t,
                  r,
                  n,
                  a = I.current;
                H
                  ? ("spring" ===
                      (null == a || null === (e = a.show) || void 0 === e
                        ? void 0
                        : e.animation)
                      ? c.Animated.spring
                      : c.Animated.timing)(
                      K,
                      (0, o.default)(
                        { toValue: 1, useNativeDriver: b, duration: 250 },
                        null == a || null === (t = a.show) || void 0 === t
                          ? void 0
                          : t.config
                      )
                    ).start(function (e) {
                      e.finished && N(!1);
                    })
                  : (N(!0),
                    ("spring" ===
                      (null == a || null === (r = a.hide) || void 0 === r
                        ? void 0
                        : r.animation)
                      ? c.Animated.spring
                      : c.Animated.timing)(
                      K,
                      (0, o.default)(
                        { toValue: 0, useNativeDriver: b, duration: 200 },
                        null == a || null === (n = a.hide) || void 0 === n
                          ? void 0
                          : n.config
                      )
                    ).start());
                return function () {
                  return K.stopAnimation();
                };
              },
              [K, H]
            );
            var U = s.default.useState({ height: 0, width: L.width }),
              $ = (0, a.default)(U, 2),
              J = $[0],
              X = $[1],
              G = t.routes,
              Y = y(i),
              Q = g({
                state: t,
                descriptors: n,
                insets: i,
                dimensions: L,
                layout: J,
                style: [C, w],
              }),
              Z = v({ state: t, descriptors: n, dimensions: L, layout: J }),
              ee = null == B ? void 0 : B();
            return s.default.createElement(
              c.Animated.View,
              {
                style: [
                  m.tabBar,
                  {
                    backgroundColor: null != ee ? "transparent" : O.card,
                    borderTopColor: O.border,
                  },
                  {
                    transform: [
                      {
                        translateY: K.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                            J.height + Y + c.StyleSheet.hairlineWidth,
                            0,
                          ],
                        }),
                      },
                    ],
                    position: F ? "absolute" : null,
                  },
                  {
                    height: Q,
                    paddingBottom: Y,
                    paddingHorizontal: Math.max(i.left, i.right),
                  },
                  C,
                ],
                pointerEvents: F ? "none" : "auto",
                onLayout: function (e) {
                  var t = e.nativeEvent.layout,
                    r = t.height,
                    n = t.width;
                  null == D || D(r),
                    X(function (e) {
                      return r === e.height && n === e.width
                        ? e
                        : { height: r, width: n };
                    });
                },
              },
              s.default.createElement(
                c.View,
                { pointerEvents: "none", style: c.StyleSheet.absoluteFill },
                ee
              ),
              s.default.createElement(
                c.View,
                { accessibilityRole: "tablist", style: m.content },
                G.map(function (e, a) {
                  var i,
                    d = a === t.index,
                    f = n[e.key].options,
                    h =
                      void 0 !== f.tabBarLabel
                        ? f.tabBarLabel
                        : void 0 !== f.title
                        ? f.title
                        : e.name,
                    b =
                      void 0 !== f.tabBarAccessibilityLabel
                        ? f.tabBarAccessibilityLabel
                        : "string" == typeof h && "ios" === c.Platform.OS
                        ? h + ", tab, " + (a + 1) + " of " + G.length
                        : void 0;
                  return s.default.createElement(
                    u.NavigationContext.Provider,
                    { key: e.key, value: n[e.key].navigation },
                    s.default.createElement(
                      u.NavigationRouteContext.Provider,
                      { value: e },
                      s.default.createElement(p.default, {
                        route: e,
                        descriptor: n[e.key],
                        focused: d,
                        horizontal: Z,
                        onPress: function () {
                          var n = r.emit({
                            type: "tabPress",
                            target: e.key,
                            canPreventDefault: !0,
                          });
                          d ||
                            n.defaultPrevented ||
                            r.dispatch(
                              (0, o.default)(
                                {},
                                u.CommonActions.navigate({
                                  name: e.name,
                                  merge: !0,
                                }),
                                { target: t.key }
                              )
                            );
                        },
                        onLongPress: function () {
                          r.emit({ type: "tabLongPress", target: e.key });
                        },
                        accessibilityLabel: b,
                        to: j(e.name, e.params),
                        testID: f.tabBarTestID,
                        allowFontScaling: f.tabBarAllowFontScaling,
                        activeTintColor: E,
                        inactiveTintColor: W,
                        activeBackgroundColor: A,
                        inactiveBackgroundColor: T,
                        button: f.tabBarButton,
                        icon:
                          null != (i = f.tabBarIcon)
                            ? i
                            : function (e) {
                                var t = e.color,
                                  r = e.size;
                                return s.default.createElement(l.MissingIcon, {
                                  color: t,
                                  size: r,
                                });
                              },
                        badge: f.tabBarBadge,
                        badgeStyle: f.tabBarBadgeStyle,
                        label: h,
                        showLabel: S,
                        labelStyle: f.tabBarLabelStyle,
                        iconStyle: f.tabBarIconStyle,
                        style: f.tabBarItemStyle,
                      })
                    )
                  );
                })
              )
            );
          }),
          (t.getTabBarHeight = void 0);
        var a = n(r(4)),
          o = n(r(6)),
          i = n(r(3)),
          l = r(8),
          u = r(5),
          s = n(r(1)),
          c = r(2),
          d = r(7),
          f = n(r(18)),
          h = n(r(56)),
          p = n(r(57)),
          b = "web" !== c.Platform.OS,
          v = function (e) {
            var t = e.state,
              r = e.descriptors,
              n = e.layout,
              a = e.dimensions,
              o = r[t.routes[t.index].key].options.tabBarLabelPosition;
            if (o)
              switch (o) {
                case "beside-icon":
                  return !0;
                case "below-icon":
                  return !1;
              }
            return n.width >= 768
              ? t.routes.reduce(function (e, t) {
                  var n = r[t.key].options.tabBarItemStyle,
                    a = c.StyleSheet.flatten(n);
                  if (a) {
                    if ("number" == typeof a.width) return e + a.width;
                    if ("number" == typeof a.maxWidth) return e + a.maxWidth;
                  }
                  return e + 125;
                }, 0) <= n.width
              : a.width > a.height;
          },
          y = function (e) {
            return Math.max(
              e.bottom - c.Platform.select({ ios: 4, default: 0 }),
              0
            );
          },
          g = function (e) {
            var t,
              r = e.state,
              n = e.descriptors,
              a = e.dimensions,
              l = e.insets,
              u = e.style,
              s = (0, i.default)(e, [
                "state",
                "descriptors",
                "dimensions",
                "insets",
                "style",
              ]),
              d =
                null === (t = c.StyleSheet.flatten(u)) || void 0 === t
                  ? void 0
                  : t.height;
            if ("number" == typeof d) return d;
            var f = a.width > a.height,
              h = v(
                (0, o.default)({ state: r, descriptors: n, dimensions: a }, s)
              ),
              p = y(l);
            return "ios" === c.Platform.OS && !c.Platform.isPad && f && h
              ? 32 + p
              : 49 + p;
          };
        t.getTabBarHeight = g;
        var m = c.StyleSheet.create({
          tabBar: {
            left: 0,
            right: 0,
            bottom: 0,
            borderTopWidth: c.StyleSheet.hairlineWidth,
            elevation: 8,
          },
          content: { flex: 1, flexDirection: "row" },
        });
      },
      (e, t, r) => {
        var n = r(21),
          a = r(39),
          o = Object.hasOwnProperty,
          i = Object.create(null);
        for (var l in n) o.call(n, l) && (i[n[l]] = l);
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
              a,
              i = [0, 0, 0, 1];
            if ((t = e.match(/^#([a-f0-9]{6})([a-f0-9]{2})?$/i))) {
              for (a = t[2], t = t[1], r = 0; r < 3; r++) {
                var l = 2 * r;
                i[r] = parseInt(t.slice(l, l + 2), 16);
              }
              a && (i[3] = parseInt(a, 16) / 255);
            } else if ((t = e.match(/^#([a-f0-9]{3,4})$/i))) {
              for (a = (t = t[1])[3], r = 0; r < 3; r++)
                i[r] = parseInt(t[r] + t[r], 16);
              a && (i[3] = parseInt(a + a, 16) / 255);
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
                    : o.call(n, t[1])
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
            var e = a(arguments);
            return (
              "#" +
              c(e[0]) +
              c(e[1]) +
              c(e[2]) +
              (e[3] < 1 ? c(Math.round(255 * e[3])) : "")
            );
          }),
          (u.to.rgb = function () {
            var e = a(arguments);
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
            var e = a(arguments),
              t = Math.round((e[0] / 255) * 100),
              r = Math.round((e[1] / 255) * 100),
              n = Math.round((e[2] / 255) * 100);
            return e.length < 4 || 1 === e[3]
              ? "rgb(" + t + "%, " + r + "%, " + n + "%)"
              : "rgba(" + t + "%, " + r + "%, " + n + "%, " + e[3] + ")";
          }),
          (u.to.hsl = function () {
            var e = a(arguments);
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
            var e = a(arguments),
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
        var n = r(40),
          a = Array.prototype.concat,
          o = Array.prototype.slice,
          i = (e.exports = function (e) {
            for (var t = [], r = 0, i = e.length; r < i; r++) {
              var l = e[r];
              n(l) ? (t = a.call(t, o.call(l))) : t.push(l);
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
        var n = r(22),
          a = r(42),
          o = {};
        Object.keys(n).forEach(function (e) {
          (o[e] = {}),
            Object.defineProperty(o[e], "channels", { value: n[e].channels }),
            Object.defineProperty(o[e], "labels", { value: n[e].labels });
          var t = a(e);
          Object.keys(t).forEach(function (r) {
            var n = t[r];
            (o[e][r] = (function (e) {
              var t = function () {
                for (
                  var t = arguments.length, r = new Array(t), n = 0;
                  n < t;
                  n++
                )
                  r[n] = arguments[n];
                var a = r[0];
                if (null == a) return a;
                a.length > 1 && (r = a);
                var o = e(r);
                if ("object" == typeof o)
                  for (var i = o.length, l = 0; l < i; l++)
                    o[l] = Math.round(o[l]);
                return o;
              };
              return "conversion" in e && (t.conversion = e.conversion), t;
            })(n)),
              (o[e][r].raw = (function (e) {
                var t = function () {
                  for (
                    var t = arguments.length, r = new Array(t), n = 0;
                    n < t;
                    n++
                  )
                    r[n] = arguments[n];
                  var a = r[0];
                  return null == a ? a : (a.length > 1 && (r = a), e(r));
                };
                return "conversion" in e && (t.conversion = e.conversion), t;
              })(n));
          });
        }),
          (e.exports = o);
      },
      (e, t, r) => {
        var n = r(22);
        function a(e) {
          var t = (function () {
              for (
                var e = {}, t = Object.keys(n), r = t.length, a = 0;
                a < r;
                a++
              )
                e[t[a]] = { distance: -1, parent: null };
              return e;
            })(),
            r = [e];
          for (t[e].distance = 0; r.length; )
            for (
              var a = r.pop(), o = Object.keys(n[a]), i = o.length, l = 0;
              l < i;
              l++
            ) {
              var u = o[l],
                s = t[u];
              -1 === s.distance &&
                ((s.distance = t[a].distance + 1),
                (s.parent = a),
                r.unshift(u));
            }
          return t;
        }
        function o(e, t) {
          return function (r) {
            return t(e(r));
          };
        }
        function i(e, t) {
          for (
            var r = [t[e].parent, e], a = n[t[e].parent][e], i = t[e].parent;
            t[i].parent;

          )
            r.unshift(t[i].parent),
              (a = o(n[t[i].parent][i], a)),
              (i = t[i].parent);
          return (a.conversion = r), a;
        }
        e.exports = function (e) {
          for (
            var t = a(e), r = {}, n = Object.keys(t), o = n.length, l = 0;
            l < o;
            l++
          ) {
            var u = n[l];
            null !== t[u].parent && (r[u] = i(u, t));
          }
          return r;
        };
      },
      ,
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = void 0);
        var a = n(r(6)),
          o = n(r(3)),
          i = r(5),
          l = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = c(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              a = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var o in e)
              if (
                "default" !== o &&
                Object.prototype.hasOwnProperty.call(e, o)
              ) {
                var i = a ? Object.getOwnPropertyDescriptor(e, o) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, o, i)
                  : (n[o] = e[o]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          u = n(r(30)),
          s = n(r(31));
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
          var t,
            r = e.id,
            n = e.initialRouteName,
            c = e.backBehavior,
            f = e.children,
            h = e.screenListeners,
            p = e.screenOptions,
            b = e.sceneContainerStyle,
            v = (0, o.default)(e, [
              "id",
              "initialRouteName",
              "backBehavior",
              "children",
              "screenListeners",
              "screenOptions",
              "sceneContainerStyle",
            ]),
            y = v.lazy,
            g = v.tabBarOptions,
            m = (0, o.default)(v, ["lazy", "tabBarOptions"]),
            w = {};
          g &&
            ((0, a.default)(w, {
              tabBarHideOnKeyboard: g.keyboardHidesTabBar,
              tabBarActiveTintColor: g.activeTintColor,
              tabBarInactiveTintColor: g.inactiveTintColor,
              tabBarActiveBackgroundColor: g.activeBackgroundColor,
              tabBarInactiveBackgroundColor: g.inactiveBackgroundColor,
              tabBarAllowFontScaling: g.allowFontScaling,
              tabBarShowLabel: g.showLabel,
              tabBarLabelStyle: g.labelStyle,
              tabBarIconStyle: g.iconStyle,
              tabBarItemStyle: g.tabStyle,
              tabBarLabelPosition:
                null != (t = g.labelPosition)
                  ? t
                  : !1 === g.adaptive
                  ? "below-icon"
                  : void 0,
              tabBarStyle: [
                { display: g.tabBarVisible ? "none" : "flex" },
                w.tabBarStyle,
              ],
            }),
            Object.keys(w).forEach(function (e) {
              void 0 === w[e] && delete w[e];
            }),
            (0, u.default)(
              g,
              "Bottom Tab Navigator: 'tabBarOptions' is deprecated. Migrate the options to 'screenOptions' instead.\n\nPlace the following in 'screenOptions' in your code to keep current behavior:\n\n" +
                JSON.stringify(w, null, 2) +
                "\n\nSee https://reactnavigation.org/docs/bottom-tab-navigator#options for more details."
            )),
            "boolean" == typeof y &&
              ((w.lazy = y),
              (0, u.default)(
                !0,
                "Bottom Tab Navigator: 'lazy' in props is deprecated. Move it to 'screenOptions' instead.\n\nSee https://reactnavigation.org/docs/bottom-tab-navigator/#lazy for more details."
              ));
          var O = (0, i.useNavigationBuilder)(i.TabRouter, {
              id: r,
              initialRouteName: n,
              backBehavior: c,
              children: f,
              screenListeners: h,
              screenOptions: p,
              defaultScreenOptions: w,
            }),
            j = O.state,
            P = O.descriptors,
            M = O.navigation,
            S = O.NavigationContent;
          return l.createElement(
            S,
            null,
            l.createElement(
              s.default,
              d({}, m, {
                state: j,
                navigation: M,
                descriptors: P,
                sceneContainerStyle: b,
              })
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
              n = o.useContext(c.default),
              f = e.layout,
              p = void 0 === f ? r : f,
              b = e.modal,
              v = void 0 !== b && b,
              y = e.title,
              g = e.headerTitle,
              m = e.headerTitleAlign,
              w =
                void 0 === m
                  ? i.Platform.select({ ios: "center", default: "left" })
                  : m,
              O = e.headerLeft,
              j = e.headerLeftLabelVisible,
              P = e.headerTransparent,
              M = e.headerTintColor,
              S = e.headerBackground,
              x = e.headerRight,
              k = e.headerTitleAllowFontScaling,
              _ = e.headerTitleStyle,
              C = e.headerLeftContainerStyle,
              B = e.headerRightContainerStyle,
              E = e.headerTitleContainerStyle,
              W = e.headerBackgroundContainerStyle,
              A = e.headerStyle,
              T = e.headerShadowVisible,
              L = e.headerPressColor,
              R = e.headerPressOpacity,
              D = e.headerStatusBarHeight,
              H = void 0 === D ? (n ? 0 : t.top) : D,
              I = (0, u.default)(p, v, H),
              z = i.StyleSheet.flatten(A || {}),
              V = z.height,
              F = void 0 === V ? I : V,
              N = z.minHeight,
              q = z.maxHeight,
              K = z.backgroundColor,
              U = z.borderBottomColor,
              $ = z.borderBottomEndRadius,
              J = z.borderBottomLeftRadius,
              X = z.borderBottomRightRadius,
              G = z.borderBottomStartRadius,
              Y = z.borderBottomWidth,
              Q = z.borderColor,
              Z = z.borderEndColor,
              ee = z.borderEndWidth,
              te = z.borderLeftColor,
              re = z.borderLeftWidth,
              ne = z.borderRadius,
              ae = z.borderRightColor,
              oe = z.borderRightWidth,
              ie = z.borderStartColor,
              le = z.borderStartWidth,
              ue = z.borderStyle,
              se = z.borderTopColor,
              ce = z.borderTopEndRadius,
              de = z.borderTopLeftRadius,
              fe = z.borderTopRightRadius,
              he = z.borderTopStartRadius,
              pe = z.borderTopWidth,
              be = z.borderWidth,
              ve = z.boxShadow,
              ye = z.elevation,
              ge = z.shadowColor,
              me = z.shadowOffset,
              we = z.shadowOpacity,
              Oe = z.shadowRadius,
              je = z.opacity,
              Pe = z.transform;
            (0, a.default)(z, [
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
            var Me = {
              backgroundColor: K,
              borderBottomColor: U,
              borderBottomEndRadius: $,
              borderBottomLeftRadius: J,
              borderBottomRightRadius: X,
              borderBottomStartRadius: G,
              borderBottomWidth: Y,
              borderColor: Q,
              borderEndColor: Z,
              borderEndWidth: ee,
              borderLeftColor: te,
              borderLeftWidth: re,
              borderRadius: ne,
              borderRightColor: ae,
              borderRightWidth: oe,
              borderStartColor: ie,
              borderStartWidth: le,
              borderStyle: ue,
              borderTopColor: se,
              borderTopEndRadius: ce,
              borderTopLeftRadius: de,
              borderTopRightRadius: fe,
              borderTopStartRadius: he,
              borderTopWidth: pe,
              borderWidth: be,
              boxShadow: ve,
              elevation: ye,
              shadowColor: ge,
              shadowOffset: me,
              shadowOpacity: we,
              shadowRadius: Oe,
              opacity: je,
              transform: Pe,
            };
            for (var Se in Me) void 0 === Me[Se] && delete Me[Se];
            var xe = [
                Me,
                !1 === T && {
                  elevation: 0,
                  shadowOpacity: 0,
                  borderBottomWidth: 0,
                },
              ],
              ke = O
                ? O({
                    tintColor: M,
                    pressColor: L,
                    pressOpacity: R,
                    labelVisible: j,
                  })
                : null,
              _e = x
                ? x({ tintColor: M, pressColor: L, pressOpacity: R })
                : null,
              Ce =
                "function" != typeof g
                  ? function (e) {
                      return o.createElement(d.default, e);
                    }
                  : g;
            return o.createElement(
              o.Fragment,
              null,
              o.createElement(
                i.Animated.View,
                {
                  pointerEvents: "box-none",
                  style: [i.StyleSheet.absoluteFill, { zIndex: 0 }, W],
                },
                S
                  ? S({ style: xe })
                  : P
                  ? null
                  : o.createElement(s.default, { style: xe })
              ),
              o.createElement(
                i.Animated.View,
                {
                  pointerEvents: "box-none",
                  style: [
                    {
                      height: F,
                      minHeight: N,
                      maxHeight: q,
                      opacity: je,
                      transform: Pe,
                    },
                  ],
                },
                o.createElement(i.View, {
                  pointerEvents: "none",
                  style: { height: H },
                }),
                o.createElement(
                  i.View,
                  { pointerEvents: "box-none", style: h.content },
                  o.createElement(
                    i.Animated.View,
                    {
                      pointerEvents: "box-none",
                      style: [
                        h.left,
                        "center" === w && h.expand,
                        { marginStart: t.left },
                        C,
                      ],
                    },
                    ke
                  ),
                  o.createElement(
                    i.Animated.View,
                    {
                      pointerEvents: "box-none",
                      style: [
                        h.title,
                        {
                          maxWidth:
                            "center" === w
                              ? p.width -
                                2 *
                                  ((ke ? (!1 !== j ? 80 : 32) : 16) +
                                    Math.max(t.left, t.right))
                              : p.width -
                                ((ke ? 72 : 16) +
                                  (_e ? 72 : 16) +
                                  t.left -
                                  t.right),
                        },
                        E,
                      ],
                    },
                    Ce({
                      children: y,
                      allowFontScaling: k,
                      tintColor: M,
                      style: _,
                    })
                  ),
                  o.createElement(
                    i.Animated.View,
                    {
                      pointerEvents: "box-none",
                      style: [h.right, h.expand, { marginEnd: t.right }, B],
                    },
                    _e
                  )
                )
              )
            );
          });
        var a = n(r(3)),
          o = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = f(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              a = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var o in e)
              if (
                "default" !== o &&
                Object.prototype.hasOwnProperty.call(e, o)
              ) {
                var i = a ? Object.getOwnPropertyDescriptor(e, o) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, o, i)
                  : (n[o] = e[o]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          i = r(2),
          l = r(7),
          u = n(r(12)),
          s = n(r(33)),
          c = n(r(13)),
          d = n(r(34));
        function f(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (f = function (e) {
            return e ? r : t;
          })(e);
        }
        var h = i.StyleSheet.create({
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
              a = e.backImage,
              d = e.label,
              h = e.labelStyle,
              p = e.labelVisible,
              b = e.onLabelLayout,
              v = e.onPress,
              y = e.pressColor,
              g = e.pressOpacity,
              m = e.screenLayout,
              w = e.tintColor,
              O = e.titleLayout,
              j = e.truncatedLabel,
              P = void 0 === j ? "Back" : j,
              M = e.accessibilityLabel,
              S =
                void 0 === M
                  ? d && "Back" !== d
                    ? d + ", back"
                    : "Go back"
                  : M,
              x = e.testID,
              k = e.style,
              _ = (0, i.useTheme)().colors,
              C = l.useState(void 0),
              B = (0, o.default)(C, 2),
              E = B[0],
              W = B[1],
              A =
                void 0 !== w
                  ? w
                  : u.Platform.select({ ios: _.primary, default: _.text }),
              T = function (e) {
                null == b || b(e),
                  W(e.nativeEvent.layout.x + e.nativeEvent.layout.width);
              };
            return l.createElement(
              c.default,
              {
                disabled: t,
                accessible: !0,
                accessibilityRole: "button",
                accessibilityLabel: S,
                testID: x,
                onPress: t
                  ? void 0
                  : function () {
                      return v && requestAnimationFrame(v);
                    },
                pressColor: y,
                pressOpacity: g,
                android_ripple: { borderless: !0 },
                style: [f.container, t && f.disabled, k],
                hitSlop: u.Platform.select({
                  ios: void 0,
                  default: { top: 16, right: 16, bottom: 16, left: 16 },
                }),
              },
              l.createElement(
                l.Fragment,
                null,
                a
                  ? a({ tintColor: A })
                  : l.createElement(u.Image, {
                      style: [
                        f.icon,
                        Boolean(p) && f.iconWithLabel,
                        Boolean(A) && { tintColor: A },
                      ],
                      source: r(15),
                      fadeDuration: 0,
                    }),
                (function () {
                  var e =
                    !d || (E && O && m && (m.width - O.width) / 2 < E + 26)
                      ? P
                      : d;
                  if (!p || void 0 === e) return null;
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
                        onLayout: e === d ? T : void 0,
                        style: [f.label, A ? { color: A } : null, h],
                        numberOfLines: 1,
                        allowFontScaling: !!n,
                      },
                      e
                    )
                  );
                  return a || "ios" !== u.Platform.OS
                    ? t
                    : l.createElement(
                        s.default,
                        {
                          maskElement: l.createElement(
                            u.View,
                            { style: f.iconMaskContainer },
                            l.createElement(u.Image, {
                              source: r(16),
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
        var a = n(r(6)),
          o = n(r(4)),
          i = r(5),
          l = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = d(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              a = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var o in e)
              if (
                "default" !== o &&
                Object.prototype.hasOwnProperty.call(e, o)
              ) {
                var i = a ? Object.getOwnPropertyDescriptor(e, o) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, o, i)
                  : (n[o] = e[o]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          u = r(2),
          s = n(r(48)),
          c = n(r(35));
        function d(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (d = function (e) {
            return e ? r : t;
          })(e);
        }
        var f = u.StyleSheet.create({
          container: (0, a.default)(
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
        var a = (0, n(r(14)).default)("HeaderBackContext", void 0);
        t.default = a;
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function () {
            var e = a.useContext(o.default);
            if (void 0 === e)
              throw new Error(
                "Couldn't find the header height. Are you inside a screen in a navigator with a header?"
              );
            return e;
          });
        var a = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = i(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              a = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var o in e)
              if (
                "default" !== o &&
                Object.prototype.hasOwnProperty.call(e, o)
              ) {
                var l = a ? Object.getOwnPropertyDescriptor(e, o) : null;
                l && (l.get || l.set)
                  ? Object.defineProperty(n, o, l)
                  : (n[o] = e[o]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          o = n(r(17));
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
              o = e.style;
            return n.createElement(
              a.Text,
              { style: [i.icon, { color: t, fontSize: r }, o] },
              "⏷"
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
            for (var i in e)
              if (
                "default" !== i &&
                Object.prototype.hasOwnProperty.call(e, i)
              ) {
                var l = a ? Object.getOwnPropertyDescriptor(e, i) : null;
                l && (l.get || l.set)
                  ? Object.defineProperty(n, i, l)
                  : (n[i] = e[i]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          a = r(2);
        function o(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (o = function (e) {
            return e ? r : t;
          })(e);
        }
        var i = a.StyleSheet.create({
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
              l = (0, a.default)(e, ["visible", "children", "style"]);
            if ("web" === i.Platform.OS)
              return o.createElement(
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
            return o.createElement(
              i.View,
              { style: [s.container, n], pointerEvents: t ? "auto" : "none" },
              o.createElement(
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
        var a = n(r(3)),
          o = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = l(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              a = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var o in e)
              if (
                "default" !== o &&
                Object.prototype.hasOwnProperty.call(e, o)
              ) {
                var i = a ? Object.getOwnPropertyDescriptor(e, o) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, o, i)
                  : (n[o] = e[o]);
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
        Object.defineProperty(t, "__esModule", { value: !0 }), (t.default = h);
        var n = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = i(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              a = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var o in e)
              if (
                "default" !== o &&
                Object.prototype.hasOwnProperty.call(e, o)
              ) {
                var l = a ? Object.getOwnPropertyDescriptor(e, o) : null;
                l && (l.get || l.set)
                  ? Object.defineProperty(n, o, l)
                  : (n[o] = e[o]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          a = r(2),
          o = r(7);
        function i(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (i = function (e) {
            return e ? r : t;
          })(e);
        }
        var l = a.Dimensions.get("window"),
          u = l.width,
          s = void 0 === u ? 0 : u,
          c = l.height,
          d = void 0 === c ? 0 : c,
          f =
            "web" === a.Platform.OS || null == o.initialWindowMetrics
              ? {
                  frame: { x: 0, y: 0, width: s, height: d },
                  insets: { top: 0, left: 0, right: 0, bottom: 0 },
                }
              : o.initialWindowMetrics;
        function h(e) {
          var t = e.children,
            r = e.style;
          return n.createElement(
            o.SafeAreaInsetsContext.Consumer,
            null,
            function (e) {
              return e
                ? n.createElement(a.View, { style: [p.container, r] }, t)
                : n.createElement(
                    o.SafeAreaProvider,
                    { initialMetrics: f, style: r },
                    t
                  );
            }
          );
        }
        h.initialMetrics = f;
        var p = a.StyleSheet.create({ container: { flex: 1 } });
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = (0, u.useSafeAreaFrame)(),
              r = (0, u.useSafeAreaInsets)(),
              n = i.useContext(f.default),
              h = i.useContext(d.default),
              b = e.focused,
              v = e.modal,
              y = void 0 !== v && v,
              g = e.header,
              m = e.headerShown,
              w = void 0 === m || m,
              O = e.headerTransparent,
              j = e.headerStatusBarHeight,
              P = void 0 === j ? (n ? 0 : r.top) : j,
              M = e.navigation,
              S = e.route,
              x = e.children,
              k = e.style,
              _ = i.useState(function () {
                return (0, c.default)(t, y, P);
              }),
              C = (0, a.default)(_, 2),
              B = C[0],
              E = C[1];
            return i.createElement(
              s.default,
              {
                accessibilityElementsHidden: !b,
                importantForAccessibility: b ? "auto" : "no-hide-descendants",
                style: [p.container, k],
              },
              i.createElement(
                l.View,
                { style: p.content },
                i.createElement(
                  f.default.Provider,
                  { value: n || !1 !== w },
                  i.createElement(
                    d.default.Provider,
                    { value: w ? B : null != h ? h : 0 },
                    x
                  )
                )
              ),
              w
                ? i.createElement(
                    o.NavigationContext.Provider,
                    { value: M },
                    i.createElement(
                      o.NavigationRouteContext.Provider,
                      { value: S },
                      i.createElement(
                        l.View,
                        {
                          onLayout: function (e) {
                            var t = e.nativeEvent.layout.height;
                            E(t);
                          },
                          style: O ? p.absolute : null,
                        },
                        g
                      )
                    )
                  )
                : null
            );
          });
        var a = n(r(4)),
          o = r(5),
          i = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = h(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              a = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var o in e)
              if (
                "default" !== o &&
                Object.prototype.hasOwnProperty.call(e, o)
              ) {
                var i = a ? Object.getOwnPropertyDescriptor(e, o) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, o, i)
                  : (n[o] = e[o]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          l = r(2),
          u = r(7),
          s = n(r(32)),
          c = n(r(12)),
          d = n(r(17)),
          f = n(r(13));
        function h(e) {
          if ("function" != typeof WeakMap) return null;
          var t = new WeakMap(),
            r = new WeakMap();
          return (h = function (e) {
            return e ? r : t;
          })(e);
        }
        var p = l.StyleSheet.create({
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
          (t.default = function () {
            var e = o.useState(!1),
              t = (0, a.default)(e, 2),
              r = t[0],
              n = t[1];
            return (
              o.useEffect(function () {
                var e,
                  t = function () {
                    return n(!0);
                  },
                  r = function () {
                    return n(!1);
                  };
                return (
                  (e =
                    "ios" === i.Platform.OS
                      ? [
                          i.Keyboard.addListener("keyboardWillShow", t),
                          i.Keyboard.addListener("keyboardWillHide", r),
                        ]
                      : [
                          i.Keyboard.addListener("keyboardDidShow", t),
                          i.Keyboard.addListener("keyboardDidHide", r),
                        ]),
                  function () {
                    e.forEach(function (e) {
                      return e.remove();
                    });
                  }
                );
              }, []),
              r
            );
          });
        var a = n(r(4)),
          o = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = l(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              a = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var o in e)
              if (
                "default" !== o &&
                Object.prototype.hasOwnProperty.call(e, o)
              ) {
                var i = a ? Object.getOwnPropertyDescriptor(e, o) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, o, i)
                  : (n[o] = e[o]);
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
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.focused,
              r = e.route,
              n = e.descriptor,
              f = e.label,
              h = e.icon,
              p = e.badge,
              b = e.badgeStyle,
              v = e.to,
              y = e.button,
              g =
                void 0 === y
                  ? function (e) {
                      var t = e.children,
                        r = e.style,
                        n = e.onPress,
                        i = e.to,
                        s = e.accessibilityRole,
                        f = (0, a.default)(e, [
                          "children",
                          "style",
                          "onPress",
                          "to",
                          "accessibilityRole",
                        ]);
                      return "web" === u.Platform.OS && i
                        ? l.default.createElement(
                            o.Link,
                            c({}, f, {
                              to: i,
                              style: [d.button, r],
                              onPress: function (e) {
                                e.metaKey ||
                                  e.altKey ||
                                  e.ctrlKey ||
                                  e.shiftKey ||
                                  (null != e.button && 0 !== e.button) ||
                                  (e.preventDefault(), null == n || n(e));
                              },
                            }),
                            t
                          )
                        : l.default.createElement(
                            u.Pressable,
                            c({}, f, {
                              accessibilityRole: s,
                              onPress: n,
                              style: r,
                            }),
                            t
                          );
                    }
                  : y,
              m = e.accessibilityLabel,
              w = e.testID,
              O = e.onPress,
              j = e.onLongPress,
              P = e.horizontal,
              M = e.activeTintColor,
              S = e.inactiveTintColor,
              x = e.activeBackgroundColor,
              k = void 0 === x ? "transparent" : x,
              _ = e.inactiveBackgroundColor,
              C = void 0 === _ ? "transparent" : _,
              B = e.showLabel,
              E = void 0 === B || B,
              W = e.allowFontScaling,
              A = e.labelStyle,
              T = e.iconStyle,
              L = e.style,
              R = (0, o.useTheme)().colors,
              D = void 0 === M ? R.primary : M,
              H =
                void 0 === S
                  ? (0, i.default)(R.text)
                      .mix((0, i.default)(R.card), 0.5)
                      .hex()
                  : S,
              I = { route: r, focused: t },
              z = t ? k : C;
            return g({
              to: v,
              onPress: O,
              onLongPress: j,
              testID: w,
              accessibilityLabel: m,
              accessibilityRole: u.Platform.select({
                ios: "button",
                default: "tab",
              }),
              accessibilityState: { selected: t },
              accessibilityStates: t ? ["selected"] : [],
              style: [
                d.tab,
                { backgroundColor: z },
                P ? d.tabLandscape : d.tabPortrait,
                L,
              ],
              children: l.default.createElement(
                l.default.Fragment,
                null,
                (function (e) {
                  var t = e.focused;
                  if (void 0 === h) return null;
                  var n = t ? 1 : 0,
                    a = t ? 0 : 1;
                  return l.default.createElement(s.default, {
                    route: r,
                    horizontal: P,
                    badge: p,
                    badgeStyle: b,
                    activeOpacity: n,
                    inactiveOpacity: a,
                    activeTintColor: D,
                    inactiveTintColor: H,
                    renderIcon: h,
                    style: T,
                  });
                })(I),
                (function (e) {
                  var t = e.focused;
                  if (!1 === E) return null;
                  var a = t ? D : H;
                  if ("string" == typeof f)
                    return l.default.createElement(
                      u.Text,
                      {
                        numberOfLines: 1,
                        style: [
                          d.label,
                          { color: a },
                          P ? d.labelBeside : d.labelBeneath,
                          A,
                        ],
                        allowFontScaling: W,
                      },
                      f
                    );
                  var o = n.options,
                    i =
                      "string" == typeof o.tabBarLabel
                        ? o.tabBarLabel
                        : void 0 !== o.title
                        ? o.title
                        : r.name;
                  return f({
                    focused: t,
                    color: a,
                    position: P ? "beside-icon" : "below-icon",
                    children: i,
                  });
                })(I)
              ),
            });
          });
        var a = n(r(3)),
          o = r(5),
          i = n(r(20)),
          l = n(r(1)),
          u = r(2),
          s = n(r(58));
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
          tab: { flex: 1, alignItems: "center" },
          tabPortrait: { justifyContent: "flex-end", flexDirection: "column" },
          tabLandscape: { justifyContent: "center", flexDirection: "row" },
          label: { textAlign: "center", backgroundColor: "transparent" },
          labelBeneath: { fontSize: 10 },
          labelBeside: { fontSize: 13, marginLeft: 20, marginTop: 3 },
          button: { display: "flex" },
        });
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            e.route;
            var t = e.horizontal,
              r = e.badge,
              n = e.badgeStyle,
              u = e.activeOpacity,
              s = e.inactiveOpacity,
              c = e.activeTintColor,
              d = e.inactiveTintColor,
              f = e.renderIcon,
              h = e.style;
            return a.default.createElement(
              o.View,
              { style: [t ? l.iconHorizontal : l.iconVertical, h] },
              a.default.createElement(
                o.View,
                { style: [l.icon, { opacity: u }] },
                f({ focused: !0, size: 25, color: c })
              ),
              a.default.createElement(
                o.View,
                { style: [l.icon, { opacity: s }] },
                f({ focused: !1, size: 25, color: d })
              ),
              a.default.createElement(
                i.default,
                {
                  visible: null != r,
                  style: [l.badge, t ? l.badgeHorizontal : l.badgeVertical, n],
                  size: 75 / 4,
                },
                r
              )
            );
          });
        var a = n(r(1)),
          o = r(2),
          i = n(r(59));
        var l = o.StyleSheet.create({
          icon: {
            position: "absolute",
            alignSelf: "center",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
            minWidth: 25,
          },
          iconVertical: { flex: 1 },
          iconHorizontal: { height: "100%", marginTop: 3 },
          badge: { position: "absolute", left: 3 },
          badgeVertical: { top: 3 },
          badgeHorizontal: { top: 7 },
        });
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function (e) {
            var t = e.children,
              r = e.style,
              n = e.visible,
              c = void 0 === n || n,
              h = e.size,
              p = void 0 === h ? 18 : h,
              b = (0, o.default)(e, ["children", "style", "visible", "size"]),
              v = u.useState(function () {
                return new s.Animated.Value(c ? 1 : 0);
              }),
              y = (0, a.default)(v, 1)[0],
              g = u.useState(c),
              m = (0, a.default)(g, 2),
              w = m[0],
              O = m[1],
              j = (0, i.useTheme)();
            if (
              (u.useEffect(
                function () {
                  if (w)
                    return (
                      s.Animated.timing(y, {
                        toValue: c ? 1 : 0,
                        duration: 150,
                        useNativeDriver: !0,
                      }).start(function (e) {
                        e.finished && !c && O(!1);
                      }),
                      function () {
                        return y.stopAnimation();
                      }
                    );
                },
                [y, w, c]
              ),
              !w)
            ) {
              if (!c) return null;
              O(!0);
            }
            var P = s.StyleSheet.flatten(r) || {},
              M = P.backgroundColor,
              S = void 0 === M ? j.colors.notification : M,
              x = (0, o.default)(P, ["backgroundColor"]),
              k = (0, l.default)(S).isLight() ? "black" : "white",
              _ = p / 2,
              C = Math.floor((3 * p) / 4);
            return u.createElement(
              s.Animated.Text,
              d(
                {
                  numberOfLines: 1,
                  style: [
                    {
                      transform: [
                        {
                          scale: y.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 1],
                          }),
                        },
                      ],
                      color: k,
                      lineHeight: p - 1,
                      height: p,
                      minWidth: p,
                      opacity: y,
                      backgroundColor: S,
                      fontSize: C,
                      borderRadius: _,
                    },
                    f.container,
                    x,
                  ],
                },
                b
              ),
              t
            );
          });
        var a = n(r(4)),
          o = n(r(3)),
          i = r(5),
          l = n(r(20)),
          u = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = c(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              a = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var o in e)
              if (
                "default" !== o &&
                Object.prototype.hasOwnProperty.call(e, o)
              ) {
                var i = a ? Object.getOwnPropertyDescriptor(e, o) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, o, i)
                  : (n[o] = e[o]);
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
        var f = s.StyleSheet.create({
          container: {
            alignSelf: "flex-end",
            textAlign: "center",
            paddingHorizontal: 4,
            overflow: "hidden",
          },
        });
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.MaybeScreen = function (e) {
            var t,
              r,
              n = e.visible,
              u = e.children,
              s = (0, o.default)(e, ["visible", "children"]);
            if (
              null !== (t = a) &&
              void 0 !== t &&
              null !== (r = t.screensEnabled) &&
              void 0 !== r &&
              r.call(t)
            )
              return l.createElement(
                a.Screen,
                c({ activityState: n ? 2 : 0 }, s),
                u
              );
            return l.createElement(
              i.ResourceSavingView,
              c({ visible: n }, s),
              u
            );
          }),
          (t.MaybeScreenContainer = void 0);
        var a,
          o = n(r(3)),
          i = r(8),
          l = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = s(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              a = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var o in e)
              if (
                "default" !== o &&
                Object.prototype.hasOwnProperty.call(e, o)
              ) {
                var i = a ? Object.getOwnPropertyDescriptor(e, o) : null;
                i && (i.get || i.set)
                  ? Object.defineProperty(n, o, i)
                  : (n[o] = e[o]);
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
        try {
          a = r(61);
        } catch (e) {}
        t.MaybeScreenContainer = function (e) {
          var t,
            r,
            n = e.enabled,
            i = (0, o.default)(e, ["enabled"]);
          return null !== (t = a) &&
            void 0 !== t &&
            null !== (r = t.screensEnabled) &&
            void 0 !== r &&
            r.call(t)
            ? l.createElement(a.ScreenContainer, c({ enabled: n }, i))
            : l.createElement(u.View, i);
        };
      },
      (e) => {
        "use strict";
        e.exports = require("react-native-screens");
      },
      (e, t, r) => {
        var n = r(0);
        Object.defineProperty(t, "__esModule", { value: !0 }),
          (t.default = function () {
            var e = a.useContext(o.default);
            if (void 0 === e)
              throw new Error(
                "Couldn't find the bottom tab bar height. Are you inside a screen in Bottom Tab Navigator?"
              );
            return e;
          });
        var a = (function (e, t) {
            if (!t && e && e.__esModule) return e;
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return { default: e };
            var r = i(t);
            if (r && r.has(e)) return r.get(e);
            var n = {},
              a = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var o in e)
              if (
                "default" !== o &&
                Object.prototype.hasOwnProperty.call(e, o)
              ) {
                var l = a ? Object.getOwnPropertyDescriptor(e, o) : null;
                l && (l.get || l.set)
                  ? Object.defineProperty(n, o, l)
                  : (n[o] = e[o]);
              }
            (n.default = e), r && r.set(e, n);
            return n;
          })(r(1)),
          o = n(r(19));
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
    var a = t[n];
    if (void 0 !== a) return a.exports;
    var o = (t[n] = { exports: {} });
    return e[n](o, o.exports, r), o.exports;
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
      "https://d37p21p3n8r8ug.cloudfront.net/snackager-1%2F%40react-navigation~bottom-tabs%406.5.7-web");
  var n = {};
  (() => {
    var e = n,
      t = r(0);
    Object.defineProperty(e, "__esModule", { value: !0 }),
      Object.defineProperty(e, "createBottomTabNavigator", {
        enumerable: !0,
        get: function () {
          return a.default;
        },
      }),
      Object.defineProperty(e, "BottomTabBar", {
        enumerable: !0,
        get: function () {
          return o.default;
        },
      }),
      Object.defineProperty(e, "BottomTabView", {
        enumerable: !0,
        get: function () {
          return i.default;
        },
      }),
      Object.defineProperty(e, "BottomTabBarHeightCallbackContext", {
        enumerable: !0,
        get: function () {
          return l.default;
        },
      }),
      Object.defineProperty(e, "BottomTabBarHeightContext", {
        enumerable: !0,
        get: function () {
          return u.default;
        },
      }),
      Object.defineProperty(e, "useBottomTabBarHeight", {
        enumerable: !0,
        get: function () {
          return s.default;
        },
      });
    var a = t(r(44)),
      o = t(r(37)),
      i = t(r(31)),
      l = t(r(18)),
      u = t(r(19)),
      s = t(r(62));
  })(),
    (exports["@react-navigation/bottom-tabs"] = n);
})();
