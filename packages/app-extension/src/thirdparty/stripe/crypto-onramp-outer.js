!(function () {
  function t(n) {
    var o = r[n];
    if (void 0 !== o) return o.exports;
    var i = (r[n] = { exports: {} });
    return e[n](i, i.exports, t), i.exports;
  }
  var e = {
      723: function (t, e, r) {
        "use strict";
        function n(t) {
          l.length || (a(), !0), (l[l.length] = t);
        }
        function o() {
          for (; f < l.length; ) {
            var t = f;
            if (((f += 1), l[t].call(), f > 1024)) {
              for (var e = 0, r = l.length - f; e < r; e++) l[e] = l[e + f];
              (l.length -= f), (f = 0);
            }
          }
          (l.length = 0), (f = 0), !1;
        }
        function i(t) {
          return function () {
            function e() {
              clearTimeout(r), clearInterval(n), t();
            }
            var r = setTimeout(e, 0),
              n = setInterval(e, 50);
          };
        }
        t.exports = n;
        var a,
          c,
          u,
          s,
          l = [],
          f = 0,
          p = void 0 !== r.g ? r.g : self,
          h = p.MutationObserver || p.WebKitMutationObserver;
        "function" == typeof h
          ? ((c = 1),
            (u = new h(o)),
            (s = document.createTextNode("")),
            u.observe(s, { characterData: !0 }),
            (a = function () {
              (c = -c), (s.data = c);
            }))
          : (a = i(o)),
          (n.requestFlush = a),
          (n.makeRequestCallFromTimer = i);
      },
      4322: function (t, e, r) {
        t.exports = r(5666);
      },
      3434: function (t, e, r) {
        "use strict";
        function n() {}
        function o(t) {
          if ("object" != typeof this)
            throw new TypeError("Promises must be constructed via new");
          if ("function" != typeof t) throw new TypeError("not a function");
          (this._45 = 0),
            (this._81 = 0),
            (this._65 = null),
            (this._54 = null),
            t !== n && l(t, this);
        }
        function i(t, e) {
          for (; 3 === t._81; ) t = t._65;
          if ((o._10 && o._10(t), 0 === t._81))
            return 0 === t._45
              ? ((t._45 = 1), void (t._54 = e))
              : 1 === t._45
              ? ((t._45 = 2), void (t._54 = [t._54, e]))
              : void t._54.push(e);
          !(function (t, e) {
            f(function () {
              var r = 1 === t._81 ? e.onFulfilled : e.onRejected;
              if (null !== r) {
                var n = (function (t, e) {
                  try {
                    return t(e);
                  } catch (t) {
                    return (p = t), h;
                  }
                })(r, t._65);
                n === h ? c(e.promise, p) : a(e.promise, n);
              } else 1 === t._81 ? a(e.promise, t._65) : c(e.promise, t._65);
            });
          })(t, e);
        }
        function a(t, e) {
          if (e === t)
            return c(
              t,
              new TypeError("A promise cannot be resolved with itself.")
            );
          if (e && ("object" == typeof e || "function" == typeof e)) {
            var r = (function (t) {
              try {
                return t.then;
              } catch (t) {
                return (p = t), h;
              }
            })(e);
            if (r === h) return c(t, p);
            if (r === t.then && e instanceof o)
              return (t._81 = 3), (t._65 = e), void u(t);
            if ("function" == typeof r) return void l(r.bind(e), t);
          }
          (t._81 = 1), (t._65 = e), u(t);
        }
        function c(t, e) {
          (t._81 = 2), (t._65 = e), o._97 && o._97(t, e), u(t);
        }
        function u(t) {
          if ((1 === t._45 && (i(t, t._54), (t._54 = null)), 2 === t._45)) {
            for (var e = 0; e < t._54.length; e++) i(t, t._54[e]);
            t._54 = null;
          }
        }
        function s(t, e, r) {
          (this.onFulfilled = "function" == typeof t ? t : null),
            (this.onRejected = "function" == typeof e ? e : null),
            (this.promise = r);
        }
        function l(t, e) {
          var r = !1,
            n = (function (t, e, r) {
              try {
                t(e, r);
              } catch (t) {
                return (p = t), h;
              }
            })(
              t,
              function (t) {
                r || ((r = !0), a(e, t));
              },
              function (t) {
                r || ((r = !0), c(e, t));
              }
            );
          r || n !== h || ((r = !0), c(e, p));
        }
        var f = r(723),
          p = null,
          h = {};
        (t.exports = o),
          (o._10 = null),
          (o._97 = null),
          (o._61 = n),
          (o.prototype.then = function (t, e) {
            if (this.constructor !== o)
              return (function (t, e, r) {
                return new t.constructor(function (a, c) {
                  var u = new o(n);
                  u.then(a, c), i(t, new s(e, r, u));
                });
              })(this, t, e);
            var r = new o(n);
            return i(this, new s(t, e, r)), r;
          });
      },
      1803: function (t, e, r) {
        "use strict";
        function n(t) {
          var e = new o(o._61);
          return (e._81 = 1), (e._65 = t), e;
        }
        var o = r(3434);
        t.exports = o;
        var i = n(!0),
          a = n(!1),
          c = n(null),
          u = n(void 0),
          s = n(0),
          l = n("");
        (o.resolve = function (t) {
          if (t instanceof o) return t;
          if (null === t) return c;
          if (void 0 === t) return u;
          if (!0 === t) return i;
          if (!1 === t) return a;
          if (0 === t) return s;
          if ("" === t) return l;
          if ("object" == typeof t || "function" == typeof t)
            try {
              var e = t.then;
              if ("function" == typeof e) return new o(e.bind(t));
            } catch (t) {
              return new o(function (e, r) {
                r(t);
              });
            }
          return n(t);
        }),
          (o.all = function (t) {
            var e = Array.prototype.slice.call(t);
            return new o(function (t, r) {
              function n(a, c) {
                if (c && ("object" == typeof c || "function" == typeof c)) {
                  if (c instanceof o && c.then === o.prototype.then) {
                    for (; 3 === c._81; ) c = c._65;
                    return 1 === c._81
                      ? n(a, c._65)
                      : (2 === c._81 && r(c._65),
                        void c.then(function (t) {
                          n(a, t);
                        }, r));
                  }
                  var u = c.then;
                  if ("function" == typeof u)
                    return void new o(u.bind(c)).then(function (t) {
                      n(a, t);
                    }, r);
                }
                (e[a] = c), 0 == --i && t(e);
              }
              if (0 === e.length) return t([]);
              for (var i = e.length, a = 0; a < e.length; a++) n(a, e[a]);
            });
          }),
          (o.reject = function (t) {
            return new o(function (e, r) {
              r(t);
            });
          }),
          (o.race = function (t) {
            return new o(function (e, r) {
              t.forEach(function (t) {
                o.resolve(t).then(e, r);
              });
            });
          }),
          (o.prototype.catch = function (t) {
            return this.then(null, t);
          });
      },
      8029: function (t, e, r) {
        "use strict";
        var n = r(3434);
        (t.exports = n),
          (n.prototype.finally = function (t) {
            return this.then(
              function (e) {
                return n.resolve(t()).then(function () {
                  return e;
                });
              },
              function (e) {
                return n.resolve(t()).then(function () {
                  throw e;
                });
              }
            );
          });
      },
      5666: function (t) {
        var e = (function (t) {
          "use strict";
          function e(t, e, r) {
            return (
              Object.defineProperty(t, e, {
                value: r,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              }),
              t[e]
            );
          }
          function r(t, e, r, i) {
            var a = e && e.prototype instanceof o ? e : o,
              c = Object.create(a.prototype),
              u = new p(i || []);
            return (
              (c._invoke = (function (t, e, r) {
                var o = O;
                return function (i, a) {
                  if (o === S) throw new Error("Generator is already running");
                  if (o === k) {
                    if ("throw" === i) throw a;
                    return y();
                  }
                  for (r.method = i, r.arg = a; ; ) {
                    var c = r.delegate;
                    if (c) {
                      var u = s(c, r);
                      if (u) {
                        if (u === j) continue;
                        return u;
                      }
                    }
                    if ("next" === r.method) r.sent = r._sent = r.arg;
                    else if ("throw" === r.method) {
                      if (o === O) throw ((o = k), r.arg);
                      r.dispatchException(r.arg);
                    } else "return" === r.method && r.abrupt("return", r.arg);
                    o = S;
                    var l = n(t, e, r);
                    if ("normal" === l.type) {
                      if (((o = r.done ? k : E), l.arg === j)) continue;
                      return { value: l.arg, done: r.done };
                    }
                    "throw" === l.type &&
                      ((o = k), (r.method = "throw"), (r.arg = l.arg));
                  }
                };
              })(t, r, u)),
              c
            );
          }
          function n(t, e, r) {
            try {
              return { type: "normal", arg: t.call(e, r) };
            } catch (t) {
              return { type: "throw", arg: t };
            }
          }
          function o() {}
          function i() {}
          function a() {}
          function c(t) {
            ["next", "throw", "return"].forEach(function (r) {
              e(t, r, function (t) {
                return this._invoke(r, t);
              });
            });
          }
          function u(t, e) {
            function r(o, i, a, c) {
              var u = n(t[o], t, i);
              if ("throw" !== u.type) {
                var s = u.arg,
                  l = s.value;
                return l && "object" == typeof l && m.call(l, "__await")
                  ? e.resolve(l.__await).then(
                      function (t) {
                        r("next", t, a, c);
                      },
                      function (t) {
                        r("throw", t, a, c);
                      }
                    )
                  : e.resolve(l).then(
                      function (t) {
                        (s.value = t), a(s);
                      },
                      function (t) {
                        return r("throw", t, a, c);
                      }
                    );
              }
              c(u.arg);
            }
            var o;
            this._invoke = function (t, n) {
              function i() {
                return new e(function (e, o) {
                  r(t, n, e, o);
                });
              }
              return (o = o ? o.then(i, i) : i());
            };
          }
          function s(t, e) {
            var r = t.iterator[e.method];
            if (r === d) {
              if (((e.delegate = null), "throw" === e.method)) {
                if (
                  t.iterator.return &&
                  ((e.method = "return"),
                  (e.arg = d),
                  s(t, e),
                  "throw" === e.method)
                )
                  return j;
                (e.method = "throw"),
                  (e.arg = new TypeError(
                    "The iterator does not provide a 'throw' method"
                  ));
              }
              return j;
            }
            var o = n(r, t.iterator, e.arg);
            if ("throw" === o.type)
              return (
                (e.method = "throw"), (e.arg = o.arg), (e.delegate = null), j
              );
            var i = o.arg;
            return i
              ? i.done
                ? ((e[t.resultName] = i.value),
                  (e.next = t.nextLoc),
                  "return" !== e.method && ((e.method = "next"), (e.arg = d)),
                  (e.delegate = null),
                  j)
                : i
              : ((e.method = "throw"),
                (e.arg = new TypeError("iterator result is not an object")),
                (e.delegate = null),
                j);
          }
          function l(t) {
            var e = { tryLoc: t[0] };
            1 in t && (e.catchLoc = t[1]),
              2 in t && ((e.finallyLoc = t[2]), (e.afterLoc = t[3])),
              this.tryEntries.push(e);
          }
          function f(t) {
            var e = t.completion || {};
            (e.type = "normal"), delete e.arg, (t.completion = e);
          }
          function p(t) {
            (this.tryEntries = [{ tryLoc: "root" }]),
              t.forEach(l, this),
              this.reset(!0);
          }
          function h(t) {
            if (t) {
              var e = t[b];
              if (e) return e.call(t);
              if ("function" == typeof t.next) return t;
              if (!isNaN(t.length)) {
                var r = -1,
                  n = function e() {
                    for (; ++r < t.length; )
                      if (m.call(t, r))
                        return (e.value = t[r]), (e.done = !1), e;
                    return (e.value = d), (e.done = !0), e;
                  };
                return (n.next = n);
              }
            }
            return { next: y };
          }
          function y() {
            return { value: d, done: !0 };
          }
          var d,
            v = Object.prototype,
            m = v.hasOwnProperty,
            g = "function" == typeof Symbol ? Symbol : {},
            b = g.iterator || "@@iterator",
            w = g.asyncIterator || "@@asyncIterator",
            _ = g.toStringTag || "@@toStringTag";
          try {
            e({}, "");
          } catch (t) {
            e = function (t, e, r) {
              return (t[e] = r);
            };
          }
          t.wrap = r;
          var O = "suspendedStart",
            E = "suspendedYield",
            S = "executing",
            k = "completed",
            j = {},
            x = {};
          e(x, b, function () {
            return this;
          });
          var A = Object.getPrototypeOf,
            T = A && A(A(h([])));
          T && T !== v && m.call(T, b) && (x = T);
          var I = (a.prototype = o.prototype = Object.create(x));
          return (
            (i.prototype = a),
            e(I, "constructor", a),
            e(a, "constructor", i),
            (i.displayName = e(a, _, "GeneratorFunction")),
            (t.isGeneratorFunction = function (t) {
              var e = "function" == typeof t && t.constructor;
              return (
                !!e &&
                (e === i || "GeneratorFunction" === (e.displayName || e.name))
              );
            }),
            (t.mark = function (t) {
              return (
                Object.setPrototypeOf
                  ? Object.setPrototypeOf(t, a)
                  : ((t.__proto__ = a), e(t, _, "GeneratorFunction")),
                (t.prototype = Object.create(I)),
                t
              );
            }),
            (t.awrap = function (t) {
              return { __await: t };
            }),
            c(u.prototype),
            e(u.prototype, w, function () {
              return this;
            }),
            (t.AsyncIterator = u),
            (t.async = function (e, n, o, i, a) {
              void 0 === a && (a = Promise);
              var c = new u(r(e, n, o, i), a);
              return t.isGeneratorFunction(n)
                ? c
                : c.next().then(function (t) {
                    return t.done ? t.value : c.next();
                  });
            }),
            c(I),
            e(I, _, "Generator"),
            e(I, b, function () {
              return this;
            }),
            e(I, "toString", function () {
              return "[object Generator]";
            }),
            (t.keys = function (t) {
              var e = [];
              for (var r in t) e.push(r);
              return (
                e.reverse(),
                function r() {
                  for (; e.length; ) {
                    var n = e.pop();
                    if (n in t) return (r.value = n), (r.done = !1), r;
                  }
                  return (r.done = !0), r;
                }
              );
            }),
            (t.values = h),
            (p.prototype = {
              constructor: p,
              reset: function (t) {
                if (
                  ((this.prev = 0),
                  (this.next = 0),
                  (this.sent = this._sent = d),
                  (this.done = !1),
                  (this.delegate = null),
                  (this.method = "next"),
                  (this.arg = d),
                  this.tryEntries.forEach(f),
                  !t)
                )
                  for (var e in this)
                    "t" === e.charAt(0) &&
                      m.call(this, e) &&
                      !isNaN(+e.slice(1)) &&
                      (this[e] = d);
              },
              stop: function () {
                this.done = !0;
                var t = this.tryEntries[0].completion;
                if ("throw" === t.type) throw t.arg;
                return this.rval;
              },
              dispatchException: function (t) {
                function e(e, n) {
                  return (
                    (i.type = "throw"),
                    (i.arg = t),
                    (r.next = e),
                    n && ((r.method = "next"), (r.arg = d)),
                    !!n
                  );
                }
                if (this.done) throw t;
                for (
                  var r = this, n = this.tryEntries.length - 1;
                  n >= 0;
                  --n
                ) {
                  var o = this.tryEntries[n],
                    i = o.completion;
                  if ("root" === o.tryLoc) return e("end");
                  if (o.tryLoc <= this.prev) {
                    var a = m.call(o, "catchLoc"),
                      c = m.call(o, "finallyLoc");
                    if (a && c) {
                      if (this.prev < o.catchLoc) return e(o.catchLoc, !0);
                      if (this.prev < o.finallyLoc) return e(o.finallyLoc);
                    } else if (a) {
                      if (this.prev < o.catchLoc) return e(o.catchLoc, !0);
                    } else {
                      if (!c)
                        throw new Error(
                          "try statement without catch or finally"
                        );
                      if (this.prev < o.finallyLoc) return e(o.finallyLoc);
                    }
                  }
                }
              },
              abrupt: function (t, e) {
                for (var r = this.tryEntries.length - 1; r >= 0; --r) {
                  var n = this.tryEntries[r];
                  if (
                    n.tryLoc <= this.prev &&
                    m.call(n, "finallyLoc") &&
                    this.prev < n.finallyLoc
                  ) {
                    var o = n;
                    break;
                  }
                }
                o &&
                  ("break" === t || "continue" === t) &&
                  o.tryLoc <= e &&
                  e <= o.finallyLoc &&
                  (o = null);
                var i = o ? o.completion : {};
                return (
                  (i.type = t),
                  (i.arg = e),
                  o
                    ? ((this.method = "next"), (this.next = o.finallyLoc), j)
                    : this.complete(i)
                );
              },
              complete: function (t, e) {
                if ("throw" === t.type) throw t.arg;
                return (
                  "break" === t.type || "continue" === t.type
                    ? (this.next = t.arg)
                    : "return" === t.type
                    ? ((this.rval = this.arg = t.arg),
                      (this.method = "return"),
                      (this.next = "end"))
                    : "normal" === t.type && e && (this.next = e),
                  j
                );
              },
              finish: function (t) {
                for (var e = this.tryEntries.length - 1; e >= 0; --e) {
                  var r = this.tryEntries[e];
                  if (r.finallyLoc === t)
                    return this.complete(r.completion, r.afterLoc), f(r), j;
                }
              },
              catch: function (t) {
                for (var e = this.tryEntries.length - 1; e >= 0; --e) {
                  var r = this.tryEntries[e];
                  if (r.tryLoc === t) {
                    var n = r.completion;
                    if ("throw" === n.type) {
                      var o = n.arg;
                      f(r);
                    }
                    return o;
                  }
                }
                throw new Error("illegal catch attempt");
              },
              delegateYield: function (t, e, r) {
                return (
                  (this.delegate = {
                    iterator: h(t),
                    resultName: e,
                    nextLoc: r,
                  }),
                  "next" === this.method && (this.arg = d),
                  j
                );
              },
            }),
            t
          );
        })(t.exports);
        try {
          regeneratorRuntime = e;
        } catch (t) {
          "object" == typeof globalThis
            ? (globalThis.regeneratorRuntime = e)
            : Function("r", "regeneratorRuntime = r")(e);
        }
      },
    },
    r = {};
  (t.n = function (e) {
    var r =
      e && e.__esModule
        ? function () {
            return e.default;
          }
        : function () {
            return e;
          };
    return t.d(r, { a: r }), r;
  }),
    (t.d = function (e, r) {
      for (var n in r)
        t.o(r, n) &&
          !t.o(e, n) &&
          Object.defineProperty(e, n, { enumerable: !0, get: r[n] });
    }),
    (t.g = (function () {
      if ("object" == typeof globalThis) return globalThis;
      try {
        return this || new Function("return this")();
      } catch (t) {
        if ("object" == typeof window) return window;
      }
    })()),
    (t.o = function (t, e) {
      return Object.prototype.hasOwnProperty.call(t, e);
    }),
    (function () {
      "use strict";
      function e(t, e) {
        (null == e || e > t.length) && (e = t.length);
        for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
        return n;
      }
      function r(t, r) {
        if (t) {
          if ("string" == typeof t) return e(t, r);
          var n = Object.prototype.toString.call(t).slice(8, -1);
          return (
            "Object" === n && t.constructor && (n = t.constructor.name),
            "Map" === n || "Set" === n
              ? Array.from(t)
              : "Arguments" === n ||
                /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
              ? e(t, r)
              : void 0
          );
        }
      }
      function n(t, e) {
        return (
          (function (t) {
            if (Array.isArray(t)) return t;
          })(t) ||
          (function (t, e) {
            if ("undefined" != typeof Symbol && Symbol.iterator in Object(t)) {
              var r = [],
                n = !0,
                o = !1,
                i = void 0;
              try {
                for (
                  var a, c = t[Symbol.iterator]();
                  !(n = (a = c.next()).done) &&
                  (r.push(a.value), !e || r.length !== e);
                  n = !0
                );
              } catch (t) {
                (o = !0), (i = t);
              } finally {
                try {
                  n || null == c.return || c.return();
                } finally {
                  if (o) throw i;
                }
              }
              return r;
            }
          })(t, e) ||
          r(t, e) ||
          (function () {
            throw new TypeError(
              "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
            );
          })()
        );
      }
      function o(t, e, r) {
        return (
          e in t
            ? Object.defineProperty(t, e, {
                value: r,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (t[e] = r),
          t
        );
      }
      function i(t, e) {
        var r = Object.keys(t);
        if (Object.getOwnPropertySymbols) {
          var n = Object.getOwnPropertySymbols(t);
          e &&
            (n = n.filter(function (e) {
              return Object.getOwnPropertyDescriptor(t, e).enumerable;
            })),
            r.push.apply(r, n);
        }
        return r;
      }
      function a(t) {
        for (var e = 1; e < arguments.length; e++) {
          var r = null != arguments[e] ? arguments[e] : {};
          e % 2
            ? i(Object(r), !0).forEach(function (e) {
                o(t, e, r[e]);
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
            : i(Object(r)).forEach(function (e) {
                Object.defineProperty(
                  t,
                  e,
                  Object.getOwnPropertyDescriptor(r, e)
                );
              });
        }
        return t;
      }
      function c(t, e, r, n, o, i, a) {
        try {
          var c = t[i](a),
            u = c.value;
        } catch (t) {
          return void r(t);
        }
        c.done ? e(u) : Promise.resolve(u).then(n, o);
      }
      function u(t) {
        return function () {
          var e = this,
            r = arguments;
          return new Promise(function (n, o) {
            function i(t) {
              c(u, n, o, i, a, "next", t);
            }
            function a(t) {
              c(u, n, o, i, a, "throw", t);
            }
            var u = t.apply(e, r);
            i(void 0);
          });
        };
      }
      function s(t) {
        if (void 0 === t)
          throw new ReferenceError(
            "this hasn't been initialised - super() hasn't been called"
          );
        return t;
      }
      function l(t, e) {
        return (
          (l =
            Object.setPrototypeOf ||
            function (t, e) {
              return (t.__proto__ = e), t;
            }),
          l(t, e)
        );
      }
      function f(t, e) {
        if ("function" != typeof e && null !== e)
          throw new TypeError(
            "Super expression must either be null or a function"
          );
        (t.prototype = Object.create(e && e.prototype, {
          constructor: { value: t, writable: !0, configurable: !0 },
        })),
          e && l(t, e);
      }
      function p(t) {
        return (
          (p = Object.setPrototypeOf
            ? Object.getPrototypeOf
            : function (t) {
                return t.__proto__ || Object.getPrototypeOf(t);
              }),
          p(t)
        );
      }
      function h() {
        if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
        if (Reflect.construct.sham) return !1;
        if ("function" == typeof Proxy) return !0;
        try {
          return (
            Date.prototype.toString.call(
              Reflect.construct(Date, [], function () {})
            ),
            !0
          );
        } catch (t) {
          return !1;
        }
      }
      function y(t) {
        return (
          (y =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
              ? function (t) {
                  return typeof t;
                }
              : function (t) {
                  return t &&
                    "function" == typeof Symbol &&
                    t.constructor === Symbol &&
                    t !== Symbol.prototype
                    ? "symbol"
                    : typeof t;
                }),
          y(t)
        );
      }
      function d(t, e) {
        return !e || ("object" !== y(e) && "function" != typeof e) ? s(t) : e;
      }
      function v(t) {
        var e = h();
        return function () {
          var r,
            n = p(t);
          if (e) {
            var o = p(this).constructor;
            r = Reflect.construct(n, arguments, o);
          } else r = n.apply(this, arguments);
          return d(this, r);
        };
      }
      function m(t, e) {
        for (var r = 0; r < e.length; r++) {
          var n = e[r];
          (n.enumerable = n.enumerable || !1),
            (n.configurable = !0),
            "value" in n && (n.writable = !0),
            Object.defineProperty(t, n.key, n);
        }
      }
      function g() {
        return (
          (g =
            Object.assign ||
            function (t) {
              for (var e = 1; e < arguments.length; e++) {
                var r = arguments[e];
                for (var n in r)
                  Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
              }
              return t;
            }),
          g.apply(this, arguments)
        );
      }
      function b() {
        return (
          (b = h()
            ? Reflect.construct
            : function (t, e, r) {
                var n = [null];
                n.push.apply(n, e);
                var o = new (Function.bind.apply(t, n))();
                return r && l(o, r.prototype), o;
              }),
          b.apply(null, arguments)
        );
      }
      function w(t) {
        var e = "function" == typeof Map ? new Map() : void 0;
        return (
          (w = function (t) {
            function r() {
              return b(t, arguments, p(this).constructor);
            }
            if (
              null === t ||
              ((n = t),
              -1 === Function.toString.call(n).indexOf("[native code]"))
            )
              return t;
            var n;
            if ("function" != typeof t)
              throw new TypeError(
                "Super expression must either be null or a function"
              );
            if (void 0 !== e) {
              if (e.has(t)) return e.get(t);
              e.set(t, r);
            }
            return (
              (r.prototype = Object.create(t.prototype, {
                constructor: {
                  value: r,
                  enumerable: !1,
                  writable: !0,
                  configurable: !0,
                },
              })),
              l(r, t)
            );
          }),
          w(t)
        );
      }
      function _(t) {
        return (
          (function (t) {
            if (Array.isArray(t)) return e(t);
          })(t) ||
          (function (t) {
            if ("undefined" != typeof Symbol && Symbol.iterator in Object(t))
              return Array.from(t);
          })(t) ||
          r(t) ||
          (function () {
            throw new TypeError(
              "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
            );
          })()
        );
      }
      var O,
        E = t(4322),
        S = t.n(E),
        k = function (t, e) {
          for (var r = 0; r < t.length; r++)
            if (t[r] === e) {
              t.splice(r, 1);
              break;
            }
        },
        j = /^(http(s)?):\/\//,
        x = function (t) {
          if (
            !(function (t) {
              return j.test(t);
            })(t)
          )
            return null;
          var e = document.createElement("a");
          e.href = t;
          var r = e.protocol,
            n = e.host,
            o = e.pathname,
            i = /:80$/,
            a = /:443$/;
          return (
            "http:" === r && i.test(n)
              ? (n = n.replace(i, ""))
              : "https:" === r && a.test(n) && (n = n.replace(a, "")),
            {
              host: n,
              protocol: r,
              origin: "".concat(r, "//").concat(n),
              path: o,
            }
          );
        },
        A = x("https://payments.stripe.com"),
        T =
          (A && A.origin,
          function (t, e) {
            var r = x(t),
              n = x(e);
            return !(!r || !n) && r.origin === n.origin;
          }),
        I = function (t) {
          return (
            (function (t) {
              return T(t, "https://b.stripecdn.com/crypto-onramp-srv/assets/");
            })(t) ||
            (function (t) {
              var e = x(t),
                r = e ? e.host : "";
              return "stripe.com" === r || !!r.match(/\.stripe\.(com|me)$/);
            })(t) ||
            (function (t) {
              var e = x(t),
                r = e ? e.host : "";
              return "link.co" === r || !!r.match(/\.link\.(co)$/);
            })(t)
          );
        },
        P = t(1803),
        R = t.n(P),
        L =
          (t(8029),
          window.Promise || R(),
          function (t, e) {
            for (var r = 0; r < t.length; r++) if (e(t[r])) return t[r];
          }),
        N = function (t) {
          return (
            t &&
            "object" == typeof t &&
            (t.constructor === Array || t.constructor === Object)
          );
        },
        D = function (t) {
          return N(t)
            ? Array.isArray(t)
              ? t.slice(0, t.length)
              : g({}, t)
            : t;
        },
        C = function t(e) {
          return function () {
            for (var r = arguments.length, n = new Array(r), o = 0; o < r; o++)
              n[o] = arguments[o];
            if (Array.isArray(n[0]) && e) return D(n[0]);
            var i = Array.isArray(n[0]) ? [] : {};
            return (
              n.forEach(function (r) {
                r &&
                  Object.keys(r).forEach(function (n) {
                    var o = i[n],
                      a = r[n],
                      c = N(o) && !(e && Array.isArray(o));
                    "object" == typeof a && c
                      ? (i[n] = t(e)(o, D(a)))
                      : void 0 !== a
                      ? (i[n] = N(a) ? t(e)(a) : D(a))
                      : void 0 !== o && (i[n] = o);
                  });
              }),
              i
            );
          };
        },
        M =
          (C(!1),
          C(!0),
          function (t, e) {
            return {
              type: "ONRAMP_WEBAUTHN_SUPPORTED_RESPONSE",
              supported: t,
              origin: e,
            };
          }),
        F = function (t, e) {
          return { type: "ONRAMP_WEBAUTHN_ERROR", code: t, challenges: e };
        },
        U = function (t, e, r) {
          var n;
          null === (n = t.contentWindow) || void 0 === n || n.postMessage(e, r);
        },
        G = function (t) {
          for (var e = new Uint8Array(t), r = "", n = 0; n < e.length; n++) {
            var o = e[n];
            r += String.fromCharCode(o);
          }
          return btoa(r)
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, "");
        },
        K = {
          border: "none",
          margin: "0",
          padding: "0",
          "aspect-ratio": "2 / 3",
          width: "100%",
          "min-width": "320px",
          "min-height": "480px",
          "max-width": "500px",
          "max-height": "750px",
          overflow: "hidden",
          display: "block",
          "user-select": "none",
          transform: "translate(0)",
          "color-scheme": "only light",
        },
        z = (function (t) {
          function e(t) {
            var e;
            return (
              ((e = r.call(this)).mount = function (t) {
                if (!t) throw new Error("domElement is a required argument");
                if ("string" != typeof t) t.appendChild(e._frame);
                else {
                  var r = t.replace(/^#/, ""),
                    n = document.getElementById(r);
                  if (!n)
                    throw new Error(
                      "Tried to mount onramp to #".concat(
                        r,
                        " but it did not exist"
                      )
                    );
                  n.appendChild(e._frame);
                }
                return s(e);
              }),
              (e._webAuthnSupported = (function () {
                var t = u(
                  S().mark(function t(r) {
                    var n, o;
                    return S().wrap(function (t) {
                      for (;;)
                        switch ((t.prev = t.next)) {
                          case 0:
                            if (((t.t1 = window.PublicKeyCredential), !t.t1)) {
                              t.next = 5;
                              break;
                            }
                            return (
                              (t.next = 4),
                              PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
                            );
                          case 4:
                            t.t1 = t.sent;
                          case 5:
                            if (((t.t0 = t.t1), !t.t0)) {
                              t.next = 8;
                              break;
                            }
                            t.t0 = !0;
                          case 8:
                            (n = t.t0),
                              (o = window.location.hostname),
                              null == r ||
                                r.postMessage(M(n, o), {
                                  targetOrigin: e._frameSrc.origin,
                                });
                          case 11:
                          case "end":
                            return t.stop();
                        }
                    }, t);
                  })
                );
                return function (e) {
                  return t.apply(this, arguments);
                };
              })()),
              (e._webAuthn = (function () {
                var t = u(
                  S().mark(function t(r, n) {
                    var o, i, c, u, s, l, f, p;
                    return S().wrap(
                      function (t) {
                        for (;;)
                          switch ((t.prev = t.next)) {
                            case 0:
                              if (
                                !(null ===
                                  (o = r.requestOptions.allowCredentials) ||
                                void 0 === o
                                  ? void 0
                                  : o.length)
                              ) {
                                t.next = 25;
                                break;
                              }
                              return (
                                (i = null),
                                (t.prev = 2),
                                (t.next = 5),
                                navigator.credentials.get({
                                  publicKey: r.requestOptions,
                                })
                              );
                            case 5:
                              (i = t.sent), (t.next = 16);
                              break;
                            case 8:
                              if (
                                ((t.prev = 8),
                                (t.t0 = t.catch(2)),
                                !t.t0.message ||
                                  !/(relying party|RP ID|domain suffix)/.test(
                                    t.t0.message
                                  ))
                              ) {
                                t.next = 15;
                                break;
                              }
                              return (
                                null == n ||
                                  n.postMessage(F("INCORRECT_DOMAIN", r), {
                                    targetOrigin: e._frameSrc.origin,
                                  }),
                                t.abrupt("return")
                              );
                            case 15:
                              t.t0.message &&
                                /(The operation either timed out or was not allowed.)/.test(
                                  t.t0.message
                                ) &&
                                (null == n ||
                                  n.postMessage(F("LOGIN_FAILED", r), {
                                    targetOrigin: e._frameSrc.origin,
                                  }));
                            case 16:
                              if (i) {
                                t.next = 20;
                                break;
                              }
                              return (
                                (h = r.creationOptions),
                                (y = a(
                                  a({}, r.requestOptions),
                                  {},
                                  { allowCredentials: [] }
                                )),
                                (c = {
                                  type: "ONRAMP_WEBAUTHN",
                                  creationOptions: h,
                                  requestOptions: y,
                                }),
                                null == n ||
                                  n.postMessage(F("LOGIN_FAILED", c), {
                                    targetOrigin: e._frameSrc.origin,
                                  }),
                                t.abrupt("return")
                              );
                            case 20:
                              (u = i.response),
                                (s = {
                                  type: i.type,
                                  id: i.id,
                                  rawId: G(i.rawId),
                                  response: {
                                    clientDataJSON: G(u.clientDataJSON),
                                    authenticatorData: G(u.authenticatorData),
                                    signature: G(u.signature),
                                    userHandle: u.userHandle
                                      ? G(u.userHandle)
                                      : null,
                                  },
                                }),
                                null == n ||
                                  n.postMessage(
                                    { pk_with_assertion: JSON.stringify(s) },
                                    { targetOrigin: e._frameSrc.origin }
                                  ),
                                (t.next = 46);
                              break;
                            case 25:
                              return (
                                (l = null),
                                (t.prev = 26),
                                (t.next = 29),
                                navigator.credentials.create({
                                  publicKey: r.creationOptions,
                                })
                              );
                            case 29:
                              (l = t.sent), (t.next = 40);
                              break;
                            case 32:
                              if (
                                ((t.prev = 32),
                                (t.t1 = t.catch(26)),
                                !t.t1.message ||
                                  !/(relying party|RP ID|domain suffix)/.test(
                                    t.t1.message
                                  ))
                              ) {
                                t.next = 39;
                                break;
                              }
                              return (
                                null == n ||
                                  n.postMessage(F("INCORRECT_DOMAIN", r), {
                                    targetOrigin: e._frameSrc.origin,
                                  }),
                                t.abrupt("return")
                              );
                            case 39:
                              t.t1.message &&
                                /(The operation either timed out or was not allowed.)/.test(
                                  t.t1.message
                                ) &&
                                (null == n ||
                                  n.postMessage(F("REGISTER_FAILED", r), {
                                    targetOrigin: e._frameSrc.origin,
                                  }));
                            case 40:
                              if (l) {
                                t.next = 43;
                                break;
                              }
                              return (
                                null == n ||
                                  n.postMessage(F("REGISTER_FAILED", r), {
                                    targetOrigin: e._frameSrc.origin,
                                  }),
                                t.abrupt("return")
                              );
                            case 43:
                              (f = l.response),
                                (p = {
                                  type: l.type,
                                  id: l.id,
                                  rawId: G(l.rawId),
                                  response: {
                                    clientDataJSON: G(f.clientDataJSON),
                                    attestationObject: G(f.attestationObject),
                                  },
                                }),
                                null == n ||
                                  n.postMessage(
                                    { pk_with_attestation: JSON.stringify(p) },
                                    { targetOrigin: e._frameSrc.origin }
                                  );
                            case 46:
                            case "end":
                              return t.stop();
                          }
                        var h, y;
                      },
                      t,
                      null,
                      [
                        [2, 8],
                        [26, 32],
                      ]
                    );
                  })
                );
                return function (e, r) {
                  return t.apply(this, arguments);
                };
              })()),
              (e._runIdentitySession = (function () {
                var t = u(
                  S().mark(function t(r) {
                    var n, o, i, a;
                    return S().wrap(function (t) {
                      for (;;)
                        switch ((t.prev = t.next)) {
                          case 0:
                            return (
                              (n = r.clientSecret),
                              (o = window.Stripe(e._options.apiKey)),
                              (t.next = 4),
                              o.verifyIdentity(n)
                            );
                          case 4:
                            (i = t.sent).error
                              ? ((c = i.error.message),
                                (a = {
                                  type: "IDENTITY_ERROR",
                                  error: { type: c.type, code: c.code },
                                }))
                              : (a = { type: "IDENTITY_COMPLETE" }),
                              U(e._frame, a, e._frameSrc.origin);
                          case 7:
                          case "end":
                            return t.stop();
                        }
                      var c;
                    }, t);
                  })
                );
                return function (e) {
                  return t.apply(this, arguments);
                };
              })()),
              (e._setFrameSrc = function () {
                var t,
                  r = e._options,
                  o = r.apiKey,
                  i = (function (t) {
                    var e = t.parsedSecret,
                      r = t.publishableKey;
                    return new URLSearchParams({
                      clientSecret: e.client_secret,
                      publishableKey: r,
                    }).toString();
                  })({ parsedSecret: r.parsedSecret, publishableKey: o });
                if (
                  "https://api.stripe.com/v1/".match(
                    /^https:\/\/[a-z]+-api\.tunnel\.stripe\.me\/v1\/$/g
                  )
                ) {
                  var a = n(
                    new URL("https://api.stripe.com/v1/").hostname.split(
                      "-api.tunnel.stripe.me"
                    ),
                    1
                  )[0];
                  t = "https://".concat(
                    a,
                    "-stripejs-crypto-onramp.tunnel.stripe.me/crypto-onramp"
                  );
                } else
                  t = "".concat(
                    "https://b.stripecdn.com/crypto-onramp-srv/assets/",
                    "crypto-onramp-hosted.html"
                  );
                return new URL("".concat(t, "?").concat(i));
              }),
              (e._createFrame = function () {
                var t = document.createElement("iframe");
                return (
                  t.setAttribute("frameborder", "0"),
                  t.setAttribute("tabindex", "0"),
                  t.setAttribute("allowTransparency", "true"),
                  t.setAttribute("scrolling", "no"),
                  t.setAttribute("allow", "payment *; camera"),
                  t.setAttribute("title", "onramp frame"),
                  t.setAttribute("name", "onramp"),
                  (t.src = e._frameSrc.toString()),
                  t
                );
              }),
              (e._updateStyle = function (t) {
                Object.keys(t).forEach(function (r) {
                  e._frame.style[r] = t[r];
                });
              }),
              (e._options = t),
              (e._frameSrc = e._setFrameSrc()),
              (e._frame = e._createFrame()),
              e._updateStyle(K),
              (e.session = null),
              window.addEventListener("message", function (t) {
                if (t.origin === e._frameSrc.origin) {
                  var r,
                    n = t.data,
                    o = t.source;
                  if ("object" == typeof n)
                    if (
                      "type" in (r = n) &&
                      "ONRAMP_READY" === r.type &&
                      "session" in r
                    )
                      (e.session = n.session),
                        e.dispatchEvent({
                          type: "onramp_ui_loaded",
                          payload: { session: n.session },
                        });
                    else if (
                      (function (t) {
                        return (
                          "type" in t &&
                          "ONRAMP_SESSION_UPDATE" === t.type &&
                          "session" in t
                        );
                      })(n)
                    )
                      (e.session = n.session),
                        e.dispatchEvent({
                          type: "onramp_session_updated",
                          payload: { session: n.session },
                        });
                    else {
                      if (
                        (function (t) {
                          return (
                            "type" in t &&
                            "ONRAMP_ERROR" === t.type &&
                            "error" in t &&
                            "string" === t.error
                          );
                        })(n)
                      )
                        throw new Error(n.error);
                      !(function (t) {
                        return "ONRAMP_WEBAUTHN_SUPPORTED_REQUEST" === t.type;
                      })(n)
                        ? !(function (t) {
                            return "object" == typeof t.creationOptions;
                          })(n)
                          ? (function (t) {
                              return (
                                "IDENTITY_START" === t.type &&
                                "string" == typeof t.clientSecret
                              );
                            })(n) && e._runIdentitySession(n)
                          : e._webAuthn(n, o)
                        : e._webAuthnSupported(o);
                    }
                }
              }),
              e
            );
          }
          f(e, t);
          var r = v(e);
          return e;
        })(
          (function (t) {
            function e() {
              for (
                var t, e = arguments.length, r = new Array(e), n = 0;
                n < e;
                n++
              )
                r[n] = arguments[n];
              return (
                ((t = i.call.apply(i, [this].concat(r)))._callbacks = {}),
                (t._globalCallbacks = []),
                (t.dispatchEvent = function (e) {
                  var r = e.type,
                    n = t._callbacks[r];
                  return (
                    n &&
                      n.forEach(function (t) {
                        return t(e);
                      }),
                    t._globalCallbacks.forEach(function (t) {
                      return t(e);
                    }),
                    s(t)
                  );
                }),
                (t.addEventListener = t.addEventListener.bind(s(t))),
                (t.removeEventListener = t.removeEventListener.bind(s(t))),
                t
              );
            }
            f(e, t);
            var r,
              n,
              o,
              i = v(e);
            return (
              (r = e),
              (n = [
                {
                  key: "addEventListener",
                  value: function (t, e) {
                    return (
                      "*" === t
                        ? this._globalCallbacks.push(e)
                        : (this._callbacks[t] || (this._callbacks[t] = []),
                          this._callbacks[t].push(e)),
                      this
                    );
                  },
                },
                {
                  key: "removeEventListener",
                  value: function (t, e) {
                    if ("*" === t) return k(this._globalCallbacks, e), this;
                    var r = this._callbacks[t];
                    return r
                      ? (k(r, e),
                        0 === r.length && delete this._callbacks[t],
                        this)
                      : this;
                  },
                },
              ]) && m(r.prototype, n),
              o && m(r, o),
              e
            );
          })(function () {})
        ),
        H = z,
        B = (function () {
          if (document.currentScript && "src" in document.currentScript) {
            var t = x(document.currentScript.src);
            return !t || I(t.origin);
          }
          return !0;
        })(),
        Y =
          (Error,
          (function (t) {
            function e(t) {
              var e;
              return (
                (e = r.call(this, t)),
                window.__stripeElementsController &&
                  window.__stripeElementsController.reportIntegrationError(t),
                (e.name = "IntegrationError"),
                Object.defineProperty(s(e), "message", {
                  value: e.message,
                  enumerable: !0,
                }),
                e
              );
            }
            f(e, t);
            var r = v(e);
            return e;
          })(w(Error))),
        q =
          (Error,
          Error,
          {
            AE: "AE",
            AT: "AT",
            AU: "AU",
            BE: "BE",
            BG: "BG",
            BR: "BR",
            CA: "CA",
            CH: "CH",
            CI: "CI",
            CR: "CR",
            CY: "CY",
            CZ: "CZ",
            DE: "DE",
            DK: "DK",
            DO: "DO",
            EE: "EE",
            ES: "ES",
            FI: "FI",
            FR: "FR",
            GB: "GB",
            GI: "GI",
            GR: "GR",
            GT: "GT",
            HK: "HK",
            HR: "HR",
            HU: "HU",
            ID: "ID",
            IE: "IE",
            IN: "IN",
            IT: "IT",
            JP: "JP",
            LI: "LI",
            LT: "LT",
            LU: "LU",
            LV: "LV",
            MT: "MT",
            MX: "MX",
            MY: "MY",
            NL: "NL",
            NO: "NO",
            NZ: "NZ",
            PE: "PE",
            PH: "PH",
            PL: "PL",
            PT: "PT",
            RO: "RO",
            SE: "SE",
            SG: "SG",
            SI: "SI",
            SK: "SK",
            SN: "SN",
            TH: "TH",
            TT: "TT",
            US: "US",
            UY: "UY",
          }),
        J = Object.keys(q),
        $ = { live: "live", test: "test", unknown: "unknown" },
        W = function (t, e, r) {
          var n = r.path.reduce(function (t, e, r) {
            return 0 === r
              ? e
              : 0 === e.indexOf(".")
              ? "".concat(t, '["').concat(e, '"]')
              : "".concat(t, ".").concat(e);
          }, "");
          return "undefined" === e
            ? "Missing value for "
                .concat(r.label, ": ")
                .concat(n || "value", " should be ")
                .concat(t, ".")
            : "Invalid value for "
                .concat(r.label, ": ")
                .concat(n || "value", " should be ")
                .concat(t, ". You specified: ")
                .concat(e, ".");
        },
        Z = function (t) {
          var e =
            arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [];
          return { type: "valid", value: t, warnings: e };
        },
        V = function (t) {
          return { error: t, errorType: "full", type: "error" };
        },
        X = function (t, e, r) {
          return {
            expected: t,
            actual: String(e),
            options: r,
            errorType: "mismatch",
            type: "error",
          };
        },
        Q = function (t, e) {
          return a(a({}, t), {}, { path: [].concat(_(t.path), [e]) });
        },
        tt = function (t, e) {
          return function (r, n) {
            var o = L(t, function (t) {
              return t === r;
            });
            if (void 0 === o) {
              var i = e
                ? "a recognized string."
                : "one of the following strings: ".concat(t.join(", "));
              return X(i, r, n);
            }
            return Z(o);
          };
        },
        et = function () {
          for (var t = arguments.length, e = new Array(t), r = 0; r < t; r++)
            e[r] = arguments[r];
          return tt(e, !1);
        },
        rt =
          (et.apply(void 0, _(J)),
          et.apply(
            void 0,
            _([
              "aed",
              "afn",
              "all",
              "amd",
              "ang",
              "aoa",
              "ars",
              "aud",
              "awg",
              "azn",
              "bam",
              "bbd",
              "bdt",
              "bgn",
              "bhd",
              "bif",
              "bmd",
              "bnd",
              "bob",
              "brl",
              "bsd",
              "btn",
              "bwp",
              "byn",
              "byr",
              "bzd",
              "cad",
              "cdf",
              "chf",
              "clf",
              "clp",
              "cny",
              "cop",
              "crc",
              "cuc",
              "cup",
              "cve",
              "czk",
              "djf",
              "dkk",
              "dop",
              "dzd",
              "egp",
              "ern",
              "etb",
              "eur",
              "fjd",
              "fkp",
              "gbp",
              "gel",
              "ghs",
              "gip",
              "gmd",
              "gnf",
              "gtq",
              "gyd",
              "hkd",
              "hnl",
              "hrk",
              "htg",
              "huf",
              "idr",
              "ils",
              "inr",
              "iqd",
              "irr",
              "isk",
              "jmd",
              "jod",
              "jpy",
              "kes",
              "kgs",
              "khr",
              "kmf",
              "kpw",
              "krw",
              "kwd",
              "kyd",
              "kzt",
              "lak",
              "lbp",
              "lkr",
              "lrd",
              "lsl",
              "ltl",
              "lvl",
              "lyd",
              "mad",
              "mdl",
              "mga",
              "mkd",
              "mmk",
              "mnt",
              "mop",
              "mro",
              "mur",
              "mvr",
              "mwk",
              "mxn",
              "myr",
              "mzn",
              "nad",
              "ngn",
              "nio",
              "nok",
              "npr",
              "nzd",
              "omr",
              "pab",
              "pen",
              "pgk",
              "php",
              "pkr",
              "pln",
              "pyg",
              "qar",
              "ron",
              "rsd",
              "rub",
              "rwf",
              "sar",
              "sbd",
              "scr",
              "sdg",
              "sek",
              "sgd",
              "shp",
              "skk",
              "sll",
              "sos",
              "srd",
              "ssp",
              "std",
              "svc",
              "syp",
              "szl",
              "thb",
              "tjs",
              "tmt",
              "tnd",
              "top",
              "try",
              "ttd",
              "twd",
              "tzs",
              "uah",
              "ugx",
              "usd",
              "uyu",
              "uzs",
              "vef",
              "vnd",
              "vuv",
              "wst",
              "xaf",
              "xag",
              "xau",
              "xcd",
              "xdr",
              "xof",
              "xpf",
              "yer",
              "zar",
              "zmk",
              "zmw",
              "btc",
              "jep",
              "eek",
              "ghc",
              "mtl",
              "tmm",
              "yen",
              "zwd",
              "zwl",
              "zwn",
              "zwr",
            ])
          ),
          et.apply(void 0, _(Object.keys($))),
          function (t, e) {
            return "string" == typeof t ? Z(t) : X("a string", t, e);
          }),
        nt = function (t) {
          return function (e, r) {
            return Array.isArray(e)
              ? e
                  .map(function (e, n) {
                    return t(e, Q(r, String(n)));
                  })
                  .reduce(function (t, e) {
                    return "error" === t.type
                      ? t
                      : "error" === e.type
                      ? e
                      : Z(
                          [].concat(_(t.value), [e.value]),
                          [].concat(_(t.warnings), _(e.warnings))
                        );
                  }, Z([]))
              : X("array", e, r);
          };
        },
        ot = function (t) {
          return function (e) {
            return function (r, n) {
              if (r && "object" == typeof r && !Array.isArray(r)) {
                var i = r,
                  c = L(Object.keys(i), function (t) {
                    return !e[t];
                  });
                if (c && t)
                  return V(
                    new Y(
                      "Invalid "
                        .concat(n.label, " parameter: ")
                        .concat(
                          [].concat(_(n.path), [c]).join("."),
                          " is not an accepted parameter."
                        )
                    )
                  );
                var u = Object.keys(i),
                  s = Z({});
                return (
                  c &&
                    (s = u.reduce(function (t, r) {
                      return e[r]
                        ? t
                        : Z(
                            t.value,
                            [].concat(_(t.warnings), [
                              "Unrecognized "
                                .concat(n.label, " parameter: ")
                                .concat(
                                  [].concat(_(n.path), [r]).join("."),
                                  " is not a recognized parameter. This may cause issues with your integration in the future."
                                ),
                            ])
                          );
                    }, s)),
                  Object.keys(e).reduce(function (t, r) {
                    if ("error" === t.type) return t;
                    var c = (0, e[r])(i[r], Q(n, r));
                    return "valid" === c.type && void 0 !== c.value
                      ? Z(
                          a(a({}, t.value), {}, o({}, r, c.value)),
                          [].concat(_(t.warnings), _(c.warnings))
                        )
                      : "valid" === c.type
                      ? Z(t.value, [].concat(_(t.warnings), _(c.warnings)))
                      : c;
                  }, s)
                );
              }
              return X("an object", r, n);
            };
          };
        },
        it = (ot(!0), ot(!1)),
        at = function (t, e, r, n) {
          var o = (function (t, e, r, n) {
            var o = n || {},
              i = t(e, {
                authenticatedOrigin: o.authenticatedOrigin || "",
                element: o.element || "",
                label: r,
                path: o.path || [],
              });
            return "valid" === i.type || "full" === i.errorType
              ? i
              : {
                  type: "error",
                  errorType: "full",
                  error: new Y(W(i.expected, i.actual, i.options)),
                };
          })(t, e, r, n);
          switch (o.type) {
            case "valid":
              return { value: o.value, warnings: o.warnings };
            case "error":
              throw o.error;
            default:
              return (function (t) {
                throw new Error(
                  arguments.length > 1 && void 0 !== arguments[1]
                    ? arguments[1]
                    : "absurd"
                );
              })(o);
          }
        },
        ct = {
          _componentName: rt,
          _implementation: it({ _frame: it({ id: rt }) }),
        },
        ut = it(ct),
        st = {
          clientSecret:
            ((O = it({ id: rt, clientSecret: rt, type: rt })),
            function (t, e) {
              return void 0 === t ? Z(t) : O(t, e);
            }),
        },
        lt = it(st),
        ft =
          (it({ _elements: nt(ut), _id: rt, _commonOptions: lt }),
          it({ apiKey: rt })),
        pt = it({ clientSecret: rt }),
        ht = function (t) {
          var e = this;
          (this.createSession = function (t) {
            var r = at(pt, t || {}, "OnrampSession()").value.clientSecret,
              o = (function (t) {
                var e = t.trim().match(/^((cos)_[^_]+)_secret_[^-]+$/);
                if (e) {
                  var r = n(e, 3),
                    o = r[0],
                    i = r[1];
                  if ("cos" === r[2])
                    return { crypto_onramp_session: i, client_secret: o };
                }
                return { error: "Failed to parse client secret" };
              })(r);
            if ("error" in o) throw new Y("Invalid client secret: ".concat(r));
            return new H({ apiKey: e._apiKey, parsedSecret: o });
          }),
            (this._ensureEnvironment = function () {
              if (window.self !== window.top)
                throw new Y(
                  "Stripe Crypto Onramp is not able to run in an iframe. Please redirect to Onramp at the top level."
                );
              if (!B)
                throw new Y(
                  "Crypto.js must be loaded from js.stripe.com. For more information TODO Docs Link"
                );
              if (!window.hasOwnProperty("Stripe"))
                throw new Y(
                  "Please include StripeJS alongside Stripe Crypto Onramp. See https://stripe.com/docs/js/including"
                );
            });
          var r = at(ft, t || {}, "Onramp()").value.apiKey;
          (this._apiKey = r.trim()), this._ensureEnvironment();
        },
        yt = function (t) {
          return new ht({ apiKey: t });
        };
      window.StripeOnramp
        ? window.console &&
          console.warn(
            "It looks like Stripe Crypto Onramp was loaded multiple times. Please only load it once per page."
          )
        : (window.StripeOnramp = yt);
    })();
})();
