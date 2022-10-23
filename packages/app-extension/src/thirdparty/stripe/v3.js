!(function () {
  function e(t) {
    var n = o[t];
    if (void 0 !== n) return n.exports;
    var i = (o[t] = { exports: {} });
    return r[t](i, i.exports, e), i.exports;
  }
  var t,
    n,
    r = {
      723: function (e, t, n) {
        "use strict";
        function r(e) {
          l.length || (a(), !0), (l[l.length] = e);
        }
        function o() {
          for (; p < l.length; ) {
            var e = p;
            if (((p += 1), l[e].call(), p > 1024)) {
              for (var t = 0, n = l.length - p; t < n; t++) l[t] = l[t + p];
              (l.length -= p), (p = 0);
            }
          }
          (l.length = 0), (p = 0), !1;
        }
        function i(e) {
          return function () {
            function t() {
              clearTimeout(n), clearInterval(r), e();
            }
            var n = setTimeout(t, 0),
              r = setInterval(t, 50);
          };
        }
        e.exports = r;
        var a,
          c,
          s,
          u,
          l = [],
          p = 0,
          d = void 0 !== n.g ? n.g : self,
          m = d.MutationObserver || d.WebKitMutationObserver;
        "function" == typeof m
          ? ((c = 1),
            (s = new m(o)),
            (u = document.createTextNode("")),
            s.observe(u, { characterData: !0 }),
            (a = function () {
              (c = -c), (u.data = c);
            }))
          : (a = i(o)),
          (r.requestFlush = a),
          (r.makeRequestCallFromTimer = i);
      },
      3407: function (e, t, n) {
        e.exports =
          n.p + "fingerprinted/img/amex-3440dd14f9308959e71dfef65267235f.svg";
      },
      8037: function (e, t, n) {
        e.exports =
          n.p +
          "fingerprinted/img/mastercard-4868931ddf88ab0fc551d18a1a859ff7.svg";
      },
      3637: function (e, t, n) {
        e.exports =
          n.p + "fingerprinted/img/visa-0daded1e4b9a21ae5304a6794bb9e46a.svg";
      },
      3434: function (e, t, n) {
        "use strict";
        function r() {}
        function o(e) {
          if ("object" != typeof this)
            throw new TypeError("Promises must be constructed via new");
          if ("function" != typeof e) throw new TypeError("not a function");
          (this._45 = 0),
            (this._81 = 0),
            (this._65 = null),
            (this._54 = null),
            e !== r && l(e, this);
        }
        function i(e, t) {
          for (; 3 === e._81; ) e = e._65;
          if ((o._10 && o._10(e), 0 === e._81))
            return 0 === e._45
              ? ((e._45 = 1), void (e._54 = t))
              : 1 === e._45
              ? ((e._45 = 2), void (e._54 = [e._54, t]))
              : void e._54.push(t);
          !(function (e, t) {
            p(function () {
              var n = 1 === e._81 ? t.onFulfilled : t.onRejected;
              if (null !== n) {
                var r = (function (e, t) {
                  try {
                    return e(t);
                  } catch (e) {
                    return (d = e), m;
                  }
                })(n, e._65);
                r === m ? c(t.promise, d) : a(t.promise, r);
              } else 1 === e._81 ? a(t.promise, e._65) : c(t.promise, e._65);
            });
          })(e, t);
        }
        function a(e, t) {
          if (t === e)
            return c(
              e,
              new TypeError("A promise cannot be resolved with itself.")
            );
          if (t && ("object" == typeof t || "function" == typeof t)) {
            var n = (function (e) {
              try {
                return e.then;
              } catch (e) {
                return (d = e), m;
              }
            })(t);
            if (n === m) return c(e, d);
            if (n === e.then && t instanceof o)
              return (e._81 = 3), (e._65 = t), void s(e);
            if ("function" == typeof n) return void l(n.bind(t), e);
          }
          (e._81 = 1), (e._65 = t), s(e);
        }
        function c(e, t) {
          (e._81 = 2), (e._65 = t), o._97 && o._97(e, t), s(e);
        }
        function s(e) {
          if ((1 === e._45 && (i(e, e._54), (e._54 = null)), 2 === e._45)) {
            for (var t = 0; t < e._54.length; t++) i(e, e._54[t]);
            e._54 = null;
          }
        }
        function u(e, t, n) {
          (this.onFulfilled = "function" == typeof e ? e : null),
            (this.onRejected = "function" == typeof t ? t : null),
            (this.promise = n);
        }
        function l(e, t) {
          var n = !1,
            r = (function (e, t, n) {
              try {
                e(t, n);
              } catch (e) {
                return (d = e), m;
              }
            })(
              e,
              function (e) {
                n || ((n = !0), a(t, e));
              },
              function (e) {
                n || ((n = !0), c(t, e));
              }
            );
          n || r !== m || ((n = !0), c(t, d));
        }
        var p = n(723),
          d = null,
          m = {};
        (e.exports = o),
          (o._10 = null),
          (o._97 = null),
          (o._61 = r),
          (o.prototype.then = function (e, t) {
            if (this.constructor !== o)
              return (function (e, t, n) {
                return new e.constructor(function (a, c) {
                  var s = new o(r);
                  s.then(a, c), i(e, new u(t, n, s));
                });
              })(this, e, t);
            var n = new o(r);
            return i(this, new u(e, t, n)), n;
          });
      },
      1803: function (e, t, n) {
        "use strict";
        function r(e) {
          var t = new o(o._61);
          return (t._81 = 1), (t._65 = e), t;
        }
        var o = n(3434);
        e.exports = o;
        var i = r(!0),
          a = r(!1),
          c = r(null),
          s = r(void 0),
          u = r(0),
          l = r("");
        (o.resolve = function (e) {
          if (e instanceof o) return e;
          if (null === e) return c;
          if (void 0 === e) return s;
          if (!0 === e) return i;
          if (!1 === e) return a;
          if (0 === e) return u;
          if ("" === e) return l;
          if ("object" == typeof e || "function" == typeof e)
            try {
              var t = e.then;
              if ("function" == typeof t) return new o(t.bind(e));
            } catch (e) {
              return new o(function (t, n) {
                n(e);
              });
            }
          return r(e);
        }),
          (o.all = function (e) {
            var t = Array.prototype.slice.call(e);
            return new o(function (e, n) {
              function r(a, c) {
                if (c && ("object" == typeof c || "function" == typeof c)) {
                  if (c instanceof o && c.then === o.prototype.then) {
                    for (; 3 === c._81; ) c = c._65;
                    return 1 === c._81
                      ? r(a, c._65)
                      : (2 === c._81 && n(c._65),
                        void c.then(function (e) {
                          r(a, e);
                        }, n));
                  }
                  var s = c.then;
                  if ("function" == typeof s)
                    return void new o(s.bind(c)).then(function (e) {
                      r(a, e);
                    }, n);
                }
                (t[a] = c), 0 == --i && e(t);
              }
              if (0 === t.length) return e([]);
              for (var i = t.length, a = 0; a < t.length; a++) r(a, t[a]);
            });
          }),
          (o.reject = function (e) {
            return new o(function (t, n) {
              n(e);
            });
          }),
          (o.race = function (e) {
            return new o(function (t, n) {
              e.forEach(function (e) {
                o.resolve(e).then(t, n);
              });
            });
          }),
          (o.prototype.catch = function (e) {
            return this.then(null, e);
          });
      },
      8029: function (e, t, n) {
        "use strict";
        var r = n(3434);
        (e.exports = r),
          (r.prototype.finally = function (e) {
            return this.then(
              function (t) {
                return r.resolve(e()).then(function () {
                  return t;
                });
              },
              function (t) {
                return r.resolve(e()).then(function () {
                  throw t;
                });
              }
            );
          });
      },
      2375: function (e, t, n) {
        "use strict";
        n.d(t, {
          UH: function () {
            return l;
          },
          ZV: function () {
            return d;
          },
          ef: function () {
            return p;
          },
          gC: function () {
            return c;
          },
          mZ: function () {
            return o;
          },
          qF: function () {
            return a;
          },
          t0: function () {
            return u;
          },
          tX: function () {
            return s;
          },
        });
        var r = n(1873),
          o = (0, r.mC)({
            phone: (0, r.jt)((0, r.kw)("auto", "always", "never")),
          }),
          i = (0, r.mC)({ required: (0, r.kw)("auto", "always", "never") }),
          a = (0, r.mC)({ phone: (0, r.jt)(i) }),
          c = "shipping",
          s = (0, r.or)(
            (0, r.mC)({ mode: (0, r.kw)("automatic", "disabled") }),
            (0, r.mC)({ mode: (0, r.kw)("google_maps_api"), apiKey: r.Z_ })
          ),
          u = {
            automatic: "automatic",
            disabled: "disabled",
            google_maps_api: "google_maps_api",
          },
          l = { stripe: "stripe", merchant: "merchant" },
          p = (0, r.mC)({
            name: (0, r.jt)((0, r.kw)("full", "split", "organization")),
          }),
          d = "split";
      },
      9083: function (e, t, n) {
        "use strict";
        n.d(t, {
          A2: function () {
            return s;
          },
          YA: function () {
            return a.Z;
          },
          _0: function () {
            return l;
          },
          _y: function () {
            return p;
          },
        });
        var r,
          o,
          i = n(6222),
          a = n(3259),
          c = n(276),
          s = "__PrivateStripeElement",
          u = ["brand"],
          l =
            ((r = {}),
            (0, i.Z)(r, c.Yj.card, u),
            (0, i.Z)(r, c.Yj.cardNumber, u),
            (0, i.Z)(r, c.Yj.iban, ["country", "bankName"]),
            (0, i.Z)(r, c.Yj.auBankAccount, ["bankName", "branchName"]),
            r),
          p =
            ((o = {}),
            (0, i.Z)(o, c.Yj.idealBank, { secondary: c.Yj.idealBankSecondary }),
            (0, i.Z)(o, c.Yj.p24Bank, { secondary: c.Yj.p24BankSecondary }),
            (0, i.Z)(o, c.Yj.fpxBank, { secondary: c.Yj.fpxBankSecondary }),
            (0, i.Z)(o, c.Yj.netbankingBank, {
              secondary: c.Yj.netbankingBankSecondary,
            }),
            (0, i.Z)(o, c.Yj.epsBank, { secondary: c.Yj.epsBankSecondary }),
            o);
      },
      3259: function (e, t, n) {
        "use strict";
        var r,
          o = n(6222),
          i = n(276),
          a =
            ((r = {}),
            (0, o.Z)(r, i.Yj.card, {
              unique: !0,
              conflict: [
                i.Yj.cardNumber,
                i.Yj.cardExpiry,
                i.Yj.cardCvc,
                i.Yj.postalCode,
              ],
              beta: !1,
              implementation: "legacy",
            }),
            (0, o.Z)(r, i.Yj.cardNumber, {
              unique: !0,
              conflict: [i.Yj.card],
              beta: !1,
              implementation: "legacy",
            }),
            (0, o.Z)(r, i.Yj.cardExpiry, {
              unique: !0,
              conflict: [i.Yj.card],
              beta: !1,
              implementation: "legacy",
            }),
            (0, o.Z)(r, i.Yj.cardCvc, {
              unique: !0,
              conflict: [i.Yj.card],
              beta: !1,
              implementation: "legacy",
            }),
            (0, o.Z)(r, i.Yj.postalCode, {
              unique: !0,
              conflict: [i.Yj.card],
              beta: !1,
              implementation: "legacy",
            }),
            (0, o.Z)(r, i.Yj.paymentRequestButton, {
              unique: !0,
              conflict: [],
              beta: !1,
              implementation: "legacy",
            }),
            (0, o.Z)(r, i.Yj.iban, {
              unique: !0,
              conflict: [],
              beta: !1,
              implementation: "legacy",
            }),
            (0, o.Z)(r, i.Yj.idealBank, {
              unique: !0,
              conflict: [],
              beta: !1,
              implementation: "legacy",
            }),
            (0, o.Z)(r, i.Yj.p24Bank, {
              unique: !0,
              conflict: [],
              beta: !1,
              implementation: "legacy",
            }),
            (0, o.Z)(r, i.Yj.auBankAccount, {
              unique: !0,
              beta: !1,
              conflict: [],
              implementation: "legacy",
            }),
            (0, o.Z)(r, i.Yj.fpxBank, {
              unique: !0,
              beta: !1,
              conflict: [],
              implementation: "legacy",
            }),
            (0, o.Z)(r, i.Yj.netbankingBank, {
              unique: !0,
              beta: !0,
              conflict: [],
              implementation: "legacy",
            }),
            (0, o.Z)(r, i.Yj.issuingCardCopyButton, {
              unique: !1,
              beta: !0,
              conflict: [],
              implementation: "legacy",
            }),
            (0, o.Z)(r, i.Yj.issuingCardNumberDisplay, {
              unique: !1,
              beta: !0,
              conflict: [],
              implementation: "legacy",
            }),
            (0, o.Z)(r, i.Yj.issuingCardCvcDisplay, {
              unique: !1,
              beta: !0,
              conflict: [],
              implementation: "legacy",
            }),
            (0, o.Z)(r, i.Yj.issuingCardExpiryDisplay, {
              unique: !1,
              beta: !0,
              conflict: [],
              implementation: "legacy",
            }),
            (0, o.Z)(r, i.Yj.issuingCardPinDisplay, {
              unique: !1,
              beta: !0,
              conflict: [],
              implementation: "legacy",
            }),
            (0, o.Z)(r, i.Yj.epsBank, {
              unique: !0,
              conflict: [],
              beta: !0,
              implementation: "legacy",
            }),
            (0, o.Z)(r, i.Yj.affirmMessage, {
              unique: !1,
              conflict: [],
              beta: !1,
              implementation: "affirm_message",
            }),
            (0, o.Z)(r, i.Yj.afterpayClearpayMessage, {
              unique: !1,
              conflict: [],
              beta: !1,
              implementation: "afterpay_message",
            }),
            (0, o.Z)(r, i.Yj.unifiedMessage, {
              unique: !1,
              conflict: [],
              beta: !0,
              implementation: "unified_message",
            }),
            (0, o.Z)(r, i.Yj.paymentMethodMessaging, {
              unique: !1,
              conflict: [],
              beta: !0,
              implementation: "unified_message",
            }),
            (0, o.Z)(r, i.Yj.linkAuthentication, {
              unique: !0,
              conflict: [],
              beta: !0,
              implementation: "frame",
            }),
            (0, o.Z)(r, i.Yj.payment, {
              unique: !0,
              conflict: [],
              beta: !0,
              implementation: "frame",
            }),
            (0, o.Z)(r, i.Yj.shippingAddress, {
              unique: !0,
              conflict: [i.Yj.address],
              beta: !0,
              implementation: "frame",
            }),
            (0, o.Z)(r, i.Yj.address, {
              unique: !0,
              conflict: [i.Yj.shippingAddress],
              beta: !0,
              implementation: "frame",
            }),
            (0, o.Z)(r, i.Yj.cart, {
              unique: !0,
              conflict: [],
              beta: !0,
              implementation: "cart",
            }),
            (0, o.Z)(r, i.Yj.expressCheckout, {
              unique: !0,
              conflict: [],
              beta: !0,
              implementation: "express_checkout",
            }),
            r);
        t.Z = a;
      },
      3608: function (e, t, n) {
        "use strict";
        n.d(t, {
          Tj: function () {
            return o;
          },
          qg: function () {
            return i;
          },
        });
        var r = n(7904),
          o =
            (n(1873),
            n(6977),
            n(6617),
            function (e) {
              var t = e.trim().match(/^((order)_[^_]+)_secret_[^-]+$/);
              if (t) {
                var n = (0, r.Z)(t, 3),
                  o = n[0],
                  i = n[1];
                if ("order" === n[2])
                  return { id: i, clientSecret: o, type: "ORDER" };
              }
              return null;
            }),
          i = function (e) {
            var t = e.trim().match(/^((cart_session)_[^_]+)_secret_[^-]+$/);
            if (t) {
              var n = (0, r.Z)(t, 3),
                o = n[0],
                i = n[1];
              if ("cart_session" === n[2])
                return { id: i, clientSecret: o, type: "CART_SESSION" };
            }
            return null;
          };
      },
      6856: function (e, t, n) {
        "use strict";
        n.d(t, {
          Ee: function () {
            return k;
          },
          FC: function () {
            return h;
          },
          I2: function () {
            return f;
          },
          R5: function () {
            return p;
          },
          iU: function () {
            return u;
          },
          jX: function () {
            return v;
          },
          mZ: function () {
            return _;
          },
          xR: function () {
            return y;
          },
          xl: function () {
            return w;
          },
          zf: function () {
            return b;
          },
        });
        var r,
          o = n(3696),
          i = n(6222),
          a = n(276),
          c = n(1873),
          s = ["external_paypal"],
          u = (0, c.CT)(c.kw.apply(void 0, s)),
          l =
            ([
              "affirm",
              "afterpay_clearpay",
              "alipay",
              "au_becs_debit",
              "bancontact",
              "blik",
              "boleto",
              "card",
              "customer_balance",
              "eps",
              "fpx",
              "giropay",
              "grabpay",
              "id_bank_transfer",
              "ideal",
              "klarna",
              "konbini",
              "link",
              "oxxo",
              "p24",
              "pay_by_bank",
              "paynow",
              "paypal",
              "promptpay",
              "qris",
              "sepa_debit",
              "sofort",
              "us_bank_account",
              "upi",
              "wechat_pay",
              "nz_bank_account",
              "bacs_debit",
              "apple_pay",
              "google_pay",
            ].concat(s),
            {
              VISA: "visa",
              MASTERCARD: "mastercard",
              AMEX: "amex",
              DISCOVER_NETWORK: "discover_global_network",
            }),
          p =
            ((r = {}),
            (0, i.Z)(r, l.VISA, [a.rM.VISA]),
            (0, i.Z)(r, l.MASTERCARD, [a.rM.MASTERCARD]),
            (0, i.Z)(r, l.AMEX, [a.rM.AMEX]),
            (0, i.Z)(r, l.DISCOVER_NETWORK, [
              a.rM.DISCOVER,
              a.rM.DINERS,
              a.rM.JCB,
              a.rM.UNIONPAY,
              a.rM.ELO,
            ]),
            Object.keys(l).map(function (e) {
              return l[e];
            })),
          d = c.kw.apply(void 0, (0, o.Z)(p)),
          m = (0, c.mC)({
            email: (0, c.jt)((0, c.AG)(c.Z_)),
            name: (0, c.jt)((0, c.AG)(c.Z_)),
            phone: (0, c.jt)((0, c.AG)(c.Z_)),
            address: (0, c.jt)(
              (0, c.mC)({
                city: (0, c.jt)((0, c.AG)(c.Z_)),
                country: (0, c.jt)((0, c.AG)(c.Z_)),
                line1: (0, c.jt)((0, c.AG)(c.Z_)),
                line2: (0, c.jt)((0, c.AG)(c.Z_)),
                postal_code: (0, c.jt)((0, c.AG)(c.Z_)),
                state: (0, c.jt)((0, c.AG)(c.Z_)),
              })
            ),
          }),
          f = (0, c.mC)({ billingDetails: (0, c.jt)(m) }),
          _ = (0, c.mC)({
            billingDetails: (0, c.jt)(
              (0, c.or)(
                (0, c.kw)("never", "auto"),
                (0, c.mC)({
                  name: (0, c.jt)((0, c.kw)("never", "auto")),
                  phone: (0, c.jt)((0, c.kw)("never", "auto")),
                  email: (0, c.jt)((0, c.kw)("never", "auto")),
                  address: (0, c.jt)(
                    (0, c.or)(
                      (0, c.kw)("never", "auto"),
                      (0, c.mC)({
                        country: (0, c.jt)((0, c.kw)("never", "auto")),
                        postalCode: (0, c.jt)((0, c.kw)("never", "auto")),
                        state: (0, c.jt)((0, c.kw)("never", "auto")),
                        city: (0, c.jt)((0, c.kw)("never", "auto")),
                        line1: (0, c.jt)((0, c.kw)("never", "auto")),
                        line2: (0, c.jt)((0, c.kw)("never", "auto")),
                      })
                    )
                  ),
                })
              )
            ),
          }),
          h = (0, c.mC)({
            bancontact: (0, c.jt)((0, c.kw)("auto", "always", "never")),
            card: (0, c.jt)((0, c.kw)("auto", "always", "never")),
            ideal: (0, c.jt)((0, c.kw)("auto", "always", "never")),
            sepaDebit: (0, c.jt)((0, c.kw)("auto", "always", "never")),
            sofort: (0, c.jt)((0, c.kw)("auto", "always", "never")),
            auBecsDebit: (0, c.jt)((0, c.kw)("auto", "always", "never")),
            usBankAccount: (0, c.jt)((0, c.kw)("auto", "always", "never")),
          }),
          y = (0, c.mC)({
            applePay: (0, c.jt)((0, c.kw)("auto", "never")),
            googlePay: (0, c.jt)((0, c.kw)("auto", "never")),
          }),
          v = (0, c.CT)(d),
          g = (0, c.kw)("accordion", "tabs", "auto"),
          b = (0, c.or)(g, c.Ry),
          w = (0, c.mC)({
            type: g,
            radios: (0, c.jt)(c.Xg),
            spacedAccordionItems: (0, c.jt)(c.Xg),
            defaultCollapsed: (0, c.jt)(c.Xg),
          }),
          k = (0, c.mC)({
            type: g,
            radios: (0, c.jt)(c.Xg),
            spacedAccordionItems: (0, c.jt)(c.Xg),
          });
        (0, c.or)(
          g,
          (0, c.or)(
            (0, c.mC)({ type: (0, c.kw)("tabs", "auto") }),
            (0, c.mC)({
              type: (0, c.kw)("accordion"),
              radios: (0, c.jt)(c.Xg),
              spacedAccordionItems: (0, c.jt)(c.Xg),
            })
          )
        ),
          (0, c.or)(
            g,
            (0, c.or)(
              (0, c.mC)({
                type: (0, c.kw)("tabs", "auto"),
                defaultCollapsed: (0, c.jt)(c.HM),
              }),
              (0, c.mC)({
                type: (0, c.kw)("accordion"),
                defaultCollapsed: (0, c.jt)(c.HM),
                radios: (0, c.jt)(c.HM),
                spacedAccordionItems: (0, c.jt)(c.HM),
              })
            )
          );
      },
      7955: function (e, t, n) {
        "use strict";
        n.d(t, {
          C1: function () {
            return v;
          },
          DA: function () {
            return m;
          },
          Eu: function () {
            return p;
          },
          S6: function () {
            return y;
          },
          VZ: function () {
            return _;
          },
          YR: function () {
            return g;
          },
          _m: function () {
            return h;
          },
          pu: function () {
            return f;
          },
        });
        var r = n(3696),
          o = n(3608),
          i = n(6856),
          a = n(6977),
          c = n(1873),
          s = n(8812),
          u = n(2024),
          l = n(2375),
          p = function (e, t) {
            if ("string" != typeof e)
              return (0, c.$3)("a client_secret string", e, t);
            var n = (0, a.RY)(e) || (0, o.Tj)(e);
            return null === n
              ? (0, c.$3)(
                  "a client secret of the form ${id}_secret_${secret}",
                  e,
                  t
                )
              : (0, c.x4)(n, []);
          },
          d = function (e, t) {
            if ("string" != typeof e)
              return (0, c.$3)("a client_secret string", e, t);
            var n = (0, o.Tj)(e);
            return null === n
              ? (0, c.$3)(
                  "a client secret of the form ${id}_secret_${secret}",
                  e,
                  t
                )
              : (0, c.x4)(n, []);
          },
          m = function (e, t) {
            return (0, c.Gu)(d, e, "stripe.".concat(t, " order secret")).value;
          },
          f = function (e, t) {
            if ("string" != typeof e)
              return (0, c.$3)("a client_secret string", e, t);
            var n = (0, o.qg)(e);
            return null === n
              ? (0, c.$3)(
                  "a client secret of the form ${id}_secret_${secret}",
                  e,
                  t
                )
              : (0, c.x4)(n, []);
          },
          _ = function () {
            var e,
              t,
              n,
              r =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : {};
            if (
              (null == r || null === (e = r.allowedCardBrands) || void 0 === e
                ? void 0
                : e.length) &&
              (null == r ||
              null === (t = r.disallowedCardBrands) ||
              void 0 === t
                ? void 0
                : t.length)
            )
              throw new s.No(
                "You cannot specify both disallowedCardBrands and allowedCardBrands. Please specify only one of those parameters."
              );
            if (
              (null == r ||
              null === (n = r.disallowedCardBrands) ||
              void 0 === n
                ? void 0
                : n.length) === i.R5.length
            )
              throw new s.No("You cannot block all available card brands.");
          },
          h = function () {
            var e =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : {},
              t = arguments.length > 1 ? arguments[1] : void 0,
              n = arguments.length > 2 ? arguments[2] : void 0,
              o = e.layout;
            if (!o || "string" == typeof o) return [];
            var a = (0, c.mC)({ layout: t ? i.Ee : i.xl }),
              s = (0, c.Gu)(a, { layout: o }, n),
              u = s.warnings,
              l = o,
              p = l.type;
            return (
              "accordion" !== p &&
                (o.hasOwnProperty("spacedAccordionItems") &&
                  (u = [].concat((0, r.Z)(u), [
                    "options.layout.spacedAccordionItems is only supported with the 'accordion' layout type.",
                  ])),
                o.hasOwnProperty("radios") &&
                  (u = [].concat((0, r.Z)(u), [
                    "options.layout.radios is only supported with the 'accordion' layout type.",
                  ]))),
              u
            );
          },
          y = function (e) {
            var t, n;
            if (
              (null === (t = e.defaultValues) || void 0 === t
                ? void 0
                : t.phone) &&
              "always" !==
                (null === (n = e.fields) || void 0 === n ? void 0 : n.phone)
            )
              throw new s.No(
                "You cannot specify defaultValues.phone without setting fields.phone to always."
              );
          },
          v = function (e) {
            var t, n, r, o, i;
            if (
              ((null === (t = e.defaultValues) || void 0 === t
                ? void 0
                : t.firstName) ||
                (null === (n = e.defaultValues) || void 0 === n
                  ? void 0
                  : n.lastName)) &&
              (null === (r = e.display) || void 0 === r ? void 0 : r.name) !==
                l.ZV
            )
              throw new s.No(
                "You cannot specify defaultValues.firstName or defaultValues.lastName without setting display.name to split."
              );
            if (
              (null === (o = e.display) || void 0 === o ? void 0 : o.name) ===
                l.ZV &&
              (null === (i = e.defaultValues) || void 0 === i ? void 0 : i.name)
            )
              throw new s.No(
                "You cannot specify defaultValues.name when you have display.name set to split."
              );
          },
          g = function (e) {
            var t = e.contacts,
              n = e.fields,
              r = e.validation;
            if (t) {
              var o,
                i = (0, u.cx)(t, function (e) {
                  return e.hasOwnProperty("phone");
                });
              if (-1 !== i)
                if (
                  "always" !== (null == n ? void 0 : n.phone) ||
                  "always" !==
                    (null == r || null === (o = r.phone) || void 0 === o
                      ? void 0
                      : o.required)
                )
                  throw new s.No(
                    "You cannot specify contacts[".concat(
                      i,
                      "].phone without \n        setting fields.phone to 'always' and validation.phone.required to 'always'. \n        Phone options should only be 'always' when absolutely necessary."
                    )
                  );
            }
          };
      },
      3852: function (e, t, n) {
        "use strict";
        n.d(t, {
          E: function () {
            return o;
          },
        });
        var r = n(7904),
          o = function () {
            var e = [];
            return {
              addEventListener: function (t, n, r, o) {
                t.addEventListener(n, r, o), e.push([t, n, r, o]);
              },
              removeEventListener: function (t, n, o, i) {
                t.removeEventListener(n, o, i),
                  (e = e.filter(function (e) {
                    return (function (e, t) {
                      var n = (0, r.Z)(e, 4),
                        o = n[0],
                        i = n[1],
                        a = n[2],
                        c = n[3],
                        s = (0, r.Z)(t, 4),
                        u = s[0],
                        l = s[1],
                        p = s[2],
                        d = s[3];
                      return (
                        u !== o ||
                        l !== i ||
                        p !== a ||
                        (!0 === ("object" == typeof c && c ? c.capture : c)) !=
                          (!0 === ("object" == typeof d && d ? d.capture : d))
                      );
                    })([t, n, o, i], e);
                  }));
              },
            };
          };
      },
      1849: function (e, t, n) {
        "use strict";
        n.d(t, {
          U: function () {
            return o;
          },
          d: function () {
            return i;
          },
        });
        var r = n(6589),
          o = function (e) {
            return new r.J(function (t) {
              var n = setTimeout(function () {
                t({
                  type: "error",
                  error: {
                    code: "redirect_error",
                    message: "Failed to redirect to ".concat(e),
                  },
                  locale: "en",
                });
              }, 6e4);
              window.addEventListener("pagehide", function () {
                clearTimeout(n);
              }),
                (window.top.location.href = e);
            });
          },
          i = function (e, t, n) {
            e.report("redirect_error", { initiator: t, error: n.error });
          };
      },
      6977: function (e, t, n) {
        "use strict";
        n.d(t, {
          G2: function () {
            return d;
          },
          LD: function () {
            return i;
          },
          O3: function () {
            return l;
          },
          PA: function () {
            return c;
          },
          QS: function () {
            return a;
          },
          RY: function () {
            return u;
          },
          e3: function () {
            return s;
          },
          mD: function () {
            return p;
          },
        });
        var r = n(8489),
          o = n(1873),
          i = (n(276), "webauthn"),
          a = "spc",
          c = function (e, t) {
            switch (e.type) {
              case "object":
                return { paymentIntent: e.object };
              case "error":
                var n = t ? { payment_intent: t } : {};
                return { error: (0, r.Z)((0, r.Z)({}, n), e.error) };
              default:
                return (0, o.Rz)(e);
            }
          },
          s = function (e, t) {
            switch (e.type) {
              case "error":
                return {
                  error: (0, r.Z)(
                    (0, r.Z)({}, t ? { setup_intent: t } : {}),
                    e.error
                  ),
                };
              case "object":
                return { setupIntent: e.object };
              default:
                return (0, o.Rz)(e);
            }
          },
          u = function (e) {
            var t = e.trim().match(/^((seti|pi)_[^_]+)_secret_[^-]+$/);
            return t
              ? "pi" === t[2]
                ? { id: t[1], clientSecret: t[0], type: "PAYMENT_INTENT" }
                : { id: t[1], clientSecret: t[0], type: "SETUP_INTENT" }
              : null;
          },
          l = function (e) {
            return "payment_intent" === e.object
              ? {
                  id: e.id,
                  clientSecret: e.client_secret,
                  type: "PAYMENT_INTENT",
                }
              : {
                  id: e.id,
                  clientSecret: e.client_secret,
                  type: "SETUP_INTENT",
                };
          },
          p = function (e) {
            return "requires_source_action" === e || "requires_action" === e;
          },
          d = function (e) {
            return "requires_source_action" === e.status ||
              "requires_action" === e.status
              ? e.next_action
              : null;
          };
      },
      2141: function (e, t, n) {
        "use strict";
        n.d(t, {
          J$: function () {
            return r.J;
          },
        });
        var r = n(4832);
      },
      4832: function (e, t, n) {
        "use strict";
        n.d(t, {
          J: function () {
            return o;
          },
        });
        var r = {
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
          },
          o = Object.keys(r);
      },
      1765: function (e, t, n) {
        "use strict";
        n.d(t, {
          M4: function () {
            return c;
          },
          MJ: function () {
            return s;
          },
          P3: function () {
            return _;
          },
          ub: function () {
            return m;
          },
          Lv: function () {
            return u;
          },
          uN: function () {
            return l;
          },
          dZ: function () {
            return f;
          },
          jk: function () {
            return h;
          },
        });
        var r,
          o = n(3696),
          i = n(6617),
          a = n(1873),
          c = {
            checkout_beta_2: "checkout_beta_2",
            checkout_beta_3: "checkout_beta_3",
            checkout_beta_4: "checkout_beta_4",
            checkout_beta_testcards: "checkout_beta_testcards",
            payment_intent_beta_1: "payment_intent_beta_1",
            payment_intent_beta_2: "payment_intent_beta_2",
            payment_intent_beta_3: "payment_intent_beta_3",
            google_pay_beta_1: "google_pay_beta_1",
            acss_debit_beta_1: "acss_debit_beta_1",
            acss_debit_beta_2: "acss_debit_beta_2",
            afterpay_clearpay_setup_intents_beta:
              "afterpay_clearpay_setup_intents_beta",
            bacs_debit_beta: "bacs_debit_beta",
            fpx_bank_beta_1: "fpx_bank_beta_1",
            ideal_pm_beta_1: "ideal_pm_beta_1",
            line_items_beta_1: "line_items_beta_1",
            mobilepay_pm_beta_1: "mobilepay_pm_beta_1",
            oxxo_pm_beta_1: "oxxo_pm_beta_1",
            paypal_pm_beta_1: "paypal_pm_beta_1",
            revolut_pay_pm_beta_1: "revolut_pay_pm_beta_1",
            sepa_pm_beta_1: "sepa_pm_beta_1",
            tax_product_beta_1: "tax_product_beta_1",
            wechat_pay_pm_beta_1: "wechat_pay_pm_beta_1",
            wechat_pay_pm_beta_2: "wechat_pay_pm_beta_2",
            wechat_pay_pm_beta_3: "wechat_pay_pm_beta_3",
            paynow_pm_beta_1: "paynow_pm_beta_1",
            checkout_beta_locales: "checkout_beta_locales",
            stripe_js_beta_locales: "stripe_js_beta_locales",
            upi_beta_1: "upi_beta_1",
            issuing_elements_1: "issuing_elements_1",
            issuing_elements_2: "issuing_elements_2",
            return_intents_beta_1: "return_intents_beta_1",
            netbanking_beta_1: "netbanking_beta_1",
            netbanking_bank_beta_1: "netbanking_bank_beta_1",
            instant_debits_beta_1: "instant_debits_beta_1",
            link_beta_1: "link_beta_1",
            link_beta_2: "link_beta_2",
            link_beta_3: "link_beta_3",
            link_default_integration_beta_1: "link_default_integration_beta_1",
            link_default_integration_beta_2: "link_default_integration_beta_2",
            link_suggest_email_domain_correction_1:
              "link_suggest_email_domain_correction_1",
            payment_element_beta_1: "payment_element_beta_1",
            elements_customers_beta_1: "elements_customers_beta_1",
            card_country_event_beta_1: "card_country_event_beta_1",
            id_bank_transfer_beta_1: "id_bank_transfer_beta_1",
            id_bank_transfer_beta_2: "id_bank_transfer_beta_2",
            us_bank_account_beta_2: "us_bank_account_beta_2",
            cup_apple_pay_beta_1: "cup_apple_pay_beta_1",
            nz_bank_account_beta_1: "nz_bank_account_beta_1",
            payment_element_apple_pay_beta_1:
              "payment_element_apple_pay_beta_1",
            link_autofill_modal_beta_1: "link_autofill_modal_beta_1",
            shipping_address_element_beta_1: "shipping_address_element_beta_1",
            address_element_beta_1: "address_element_beta_1",
            process_order_beta_1: "process_order_beta_1",
            server_side_confirmation_beta_1: "server_side_confirmation_beta_1",
            cart_beta_1: "cart_beta_1",
            pay_by_bank_beta_1: "pay_by_bank_beta_1",
            blocked_card_brands_beta_1: "blocked_card_brands_beta_1",
            qris_beta_1: "qris_beta_1",
            ume_beta_1: "ume_beta_1",
            networks_change_1: "networks_change_1",
            express_checkout_beta_1: "express_checkout_beta_1",
            link_in_prb_beta_1: "link_in_prb_beta_1",
            link_in_card_element_beta_1: "link_in_card_element_beta_1",
            payment_element_vertical_layout_beta_1:
              "payment_element_vertical_layout_beta_1",
            elements_enable_deferred_intent_beta_1:
              "elements_enable_deferred_intent_beta_1",
            zip_beta_1: "zip_beta_1",
            cashapp_beta_1: "cashapp_beta_1",
            cartes_bancaires_apple_pay_beta_1:
              "cartes_bancaires_apple_pay_beta_1",
          },
          s = Object.freeze({
            netbankingBank: "netbanking_bank_beta_1",
            shippingAddress: [
              "shipping_address_element_beta_1",
              "link_beta_1",
              "link_beta_2",
              "link_beta_3",
            ],
            address: "address_element_beta_1",
            cart: "cart_beta_1",
            unifiedMessage: "ume_beta_1",
            paymentMethodMessaging: "ume_beta_1",
            expressCheckout: "express_checkout_beta_1",
          }),
          u = Object.keys(c),
          l = function (e, t) {
            return Array.isArray(t)
              ? t.some(function (t) {
                  return e.indexOf(t) > -1;
                })
              : e.indexOf(t) > -1;
          },
          p = window.location.hash.substring(1).split("?")[0],
          d = (0, a.ld)(
            (0, a.mC)({
              betas: (0, a.Wc)(
                (0, a.CT)(a.kw.apply(void 0, (0, o.Z)(u))),
                function () {
                  return [];
                }
              ),
            }),
            (0, i.vB)(p),
            "internal"
          ),
          m = "valid" === d.type ? d.value.betas : [],
          f = function (e) {
            var t = [],
              n = [];
            if (
              (e &&
                e.forEach(function (e) {
                  u.indexOf(e) > -1 ? t.push(c[e]) : n.push(e);
                }),
              n.length > 0)
            ) {
              var r =
                "The following betas are unrecognized for Stripe() parameter:\n\n- ".concat(
                  n.join("\n- "),
                  "\n\n They are either invalid or expired betas, please remove these beta flags to prevent future integration issues."
                );
              return { validBetas: t, betaWarning: r };
            }
            return { validBetas: t };
          },
          _ = [],
          h =
            ((r = _),
            function (e, t) {
              return l(t, c.stripe_js_beta_locales) || -1 === r.indexOf(e)
                ? e
                : "auto";
            });
      },
      4071: function (e, t, n) {
        "use strict";
        n.d(t, {
          Ah: function () {
            return h;
          },
          Bh: function () {
            return m;
          },
          D$: function () {
            return C;
          },
          D1: function () {
            return b;
          },
          G9: function () {
            return k;
          },
          Gx: function () {
            return T;
          },
          JW: function () {
            return f;
          },
          P0: function () {
            return d;
          },
          PB: function () {
            return A;
          },
          Wt: function () {
            return E;
          },
          ZR: function () {
            return I;
          },
          aS: function () {
            return P;
          },
          cE: function () {
            return N;
          },
          j3: function () {
            return S;
          },
          q$: function () {
            return y;
          },
          s$: function () {
            return g;
          },
          sV: function () {
            return v;
          },
          tS: function () {
            return _;
          },
          x5: function () {
            return j;
          },
          xz: function () {
            return w;
          },
        });
        var r = function (e) {
            return /Edge\//i.test(e);
          },
          o = function (e) {
            return /Edg\//i.test(e);
          },
          i = function (e) {
            return /(MSIE ([0-9]{1,}[.0-9]{0,})|Trident\/)/i.test(e);
          },
          a = function (e) {
            return /SamsungBrowser/.test(e);
          },
          c = function (e) {
            return /iPad|iPhone/i.test(e) && !i(e);
          },
          s = function (e) {
            return /Opera Mini/i.test(e);
          },
          u = function (e) {
            return /^((?!chrome|android).)*safari/i.test(e) && !a(e);
          },
          l = function (e) {
            return /Android/i.test(e) && !i(e);
          },
          p = window.navigator.userAgent,
          d = r(p),
          m = o(p),
          f = (/Edge\/((1[0-6]\.)|0\.)/i.test(p), i(p)),
          _ = (function (e) {
            return /MSIE ([0-9]{1,}[.0-9]{0,})/i.test(e);
          })(p),
          h = c(p),
          y =
            ((function (e) {
              /iPad/i.test(e) && i(e);
            })(p),
            (function (e) {
              return c(e) || l(e);
            })(p)),
          v = l(p),
          g =
            ((function (e) {
              /Android 4\./i.test(e) && !/Chrome/i.test(e) && l(e);
            })(p),
            u(p)),
          b =
            ((function (e) {
              u(e) && c(e);
            })(p),
            (function (e) {
              return /Firefox\//i.test(e);
            })(p)),
          w =
            ((function (e) {
              /Firefox\/(50|51|[0-4]?\d)([^\d]|$)/i.test(e);
            })(p),
            a(p)),
          k = (function (e) {
            return /Chrome\//i.test(e);
          })(p),
          E =
            ((function (e) {
              /Chrome\/(6[6-9]|[7-9]\d+|[1-9]\d{2,})/i.test(e);
            })(p),
            (function (e) {
              return (
                /AppleWebKit/i.test(e) && !/Chrome/i.test(e) && !r(e) && !i(e)
              );
            })(p)),
          S = (function (e) {
            return /Chrome/i.test(e) && !r(e);
          })(p),
          P =
            ((function (e) {
              /CriOS/i.test(e);
            })(p),
            (function (e) {
              return /FxiOS/i.test(e);
            })(p)),
          A = (function (e) {
            return /EdgiOS/i.test(e);
          })(p),
          C = (function (e) {
            return /\belectron\b/i.test(e);
          })(p),
          N = s(p),
          I = (function (e) {
            return /Macintosh.*AppleWebKit(?!.*Safari)/i.test(e);
          })(p),
          T = g && "download" in document.createElement("a"),
          M =
            (!!window.navigator.brave && window.navigator.brave.isBrave,
            window.navigator &&
              "standalone" in window.navigator &&
              window.navigator.standalone),
          j =
            (function (e) {
              return /(iPhone|iPod|iPad).*AppleWebKit((?!.*Safari)|(.*\([^)]*like[^)]*Safari[^)]*\)))/i.test(
                e
              );
            })(p) ||
            (function (e) {
              return l(e) && /wv|Version\/\d+\.\d+/.test(e) && !s(e);
            })(p) ||
            (function (e) {
              return /FBAN/.test(e) || /FBAV/.test(e);
            })(p) ||
            M;
      },
      9294: function (e, t, n) {
        "use strict";
        n.d(t, {
          Ah: function () {
            return r.Ah;
          },
          Bh: function () {
            return r.Bh;
          },
          D$: function () {
            return r.D$;
          },
          D1: function () {
            return r.D1;
          },
          G9: function () {
            return r.G9;
          },
          Gx: function () {
            return r.Gx;
          },
          JW: function () {
            return r.JW;
          },
          P0: function () {
            return r.P0;
          },
          PB: function () {
            return r.PB;
          },
          UT: function () {
            return i.U;
          },
          Wt: function () {
            return r.Wt;
          },
          ZR: function () {
            return r.ZR;
          },
          aS: function () {
            return r.aS;
          },
          cE: function () {
            return r.cE;
          },
          gG: function () {
            return o.g;
          },
          j3: function () {
            return r.j3;
          },
          q$: function () {
            return r.q$;
          },
          s$: function () {
            return r.s$;
          },
          sV: function () {
            return r.sV;
          },
          tS: function () {
            return r.tS;
          },
          x5: function () {
            return r.x5;
          },
          xz: function () {
            return r.xz;
          },
        });
        var r = n(4071),
          o = n(9949),
          i = n(5395);
      },
      5395: function (e, t, n) {
        "use strict";
        n.d(t, {
          U: function () {
            return r;
          },
        });
        var r = function () {
          return (
            (window.navigator.languages || [])[0] ||
            window.navigator.userLanguage ||
            window.navigator.language ||
            ""
          );
        };
      },
      9949: function (e, t, n) {
        "use strict";
        n.d(t, {
          g: function () {
            return o;
          },
        });
        var r = n(9294),
          o = function () {
            return !(r.x5 || r.D$ || r.ZR || r.aS || r.PB || r.cE);
          };
      },
      2024: function (e, t, n) {
        "use strict";
        n.d(t, {
          CE: function () {
            return f;
          },
          G: function () {
            return i;
          },
          PM: function () {
            return g;
          },
          TS: function () {
            return v;
          },
          VO: function () {
            return l;
          },
          Xy: function () {
            return u;
          },
          cx: function () {
            return c;
          },
          dq: function () {
            return p;
          },
          ei: function () {
            return m;
          },
          qk: function () {
            return d;
          },
          sE: function () {
            return a;
          },
        });
        var r = n(9043),
          o = n(6589),
          i = function (e, t) {
            for (var n = -1, r = null == e ? 0 : e.length; ++n < r; )
              if (t(e[n])) return !0;
            return !1;
          },
          a = function (e, t) {
            for (var n = 0; n < e.length; n++) if (t(e[n])) return e[n];
          },
          c = function (e, t) {
            for (var n = 0; n < e.length; n++) if (t(e[n])) return n;
            return -1;
          },
          s = "[object Object]",
          u = function e(t, n) {
            if ("object" != typeof t || "object" != typeof n) return t === n;
            if (null === t || null === n) return t === n;
            var r = Array.isArray(t);
            if (r !== Array.isArray(n)) return !1;
            var o = Object.prototype.toString.call(t) === s;
            if (o !== (Object.prototype.toString.call(n) === s)) return !1;
            if (!o && !r) return !1;
            var i = Object.keys(t),
              a = Object.keys(n);
            if (i.length !== a.length) return !1;
            for (var c = {}, u = 0; u < i.length; u++) c[i[u]] = !0;
            for (var l = 0; l < a.length; l++) c[a[l]] = !0;
            var p = Object.keys(c);
            if (p.length !== i.length) return !1;
            var d = t,
              m = n;
            return p.every(function (t) {
              return e(d[t], m[t]);
            });
          },
          l = function (e) {
            return Object.keys(e).map(function (t) {
              return e[t];
            });
          },
          p = function (e, t) {
            for (var n = {}, r = 0; r < t.length; r++) n[t[r]] = !0;
            for (var o = [], i = 0; i < e.length; i++) n[e[i]] && o.push(e[i]);
            return o;
          },
          d = function (e, t) {
            var n = 0,
              r = function r(o) {
                for (var i = Date.now(); n < e.length && Date.now() - i < 50; )
                  t(e[n]), n++;
                n === e.length
                  ? o()
                  : setTimeout(function () {
                      return r(o);
                    });
              };
            return new o.J(function (e) {
              return r(e);
            });
          },
          m = function (e, t) {
            for (var n = {}, r = 0; r < t.length; r++)
              void 0 !== e[t[r]] && (n[t[r]] = e[t[r]]);
            return n;
          },
          f = function (e, t) {
            return (function (e, t) {
              for (var n = {}, r = Object.keys(e), o = 0; o < r.length; o++)
                t(r[o], e[r[o]]) && (n[r[o]] = e[r[o]]);
              return n;
            })(e, function (e) {
              return -1 === t.indexOf(e);
            });
          },
          _ = function (e) {
            return (
              e &&
              "object" == typeof e &&
              (e.constructor === Array || e.constructor === Object)
            );
          },
          h = function (e) {
            return _(e)
              ? Array.isArray(e)
                ? e.slice(0, e.length)
                : (0, r.Z)({}, e)
              : e;
          },
          y = function e(t) {
            return function () {
              for (
                var n = arguments.length, r = new Array(n), o = 0;
                o < n;
                o++
              )
                r[o] = arguments[o];
              if (Array.isArray(r[0]) && t) return h(r[0]);
              var i = Array.isArray(r[0]) ? [] : {};
              return (
                r.forEach(function (n) {
                  n &&
                    Object.keys(n).forEach(function (r) {
                      var o = i[r],
                        a = n[r],
                        c = _(o) && !(t && Array.isArray(o));
                      "object" == typeof a && c
                        ? (i[r] = e(t)(o, h(a)))
                        : void 0 !== a
                        ? (i[r] = _(a) ? e(t)(a) : h(a))
                        : void 0 !== o && (i[r] = o);
                    });
                }),
                i
              );
            };
          },
          v = y(!1),
          g = y(!0);
      },
      5305: function (e, t, n) {
        "use strict";
        n.d(t, {
          Y: function () {
            return r;
          },
        });
        var r = {
          card: "card",
          cardNumber: "cardNumber",
          cardExpiry: "cardExpiry",
          cardCvc: "cardCvc",
          postalCode: "postalCode",
          iban: "iban",
          idealBank: "idealBank",
          p24Bank: "p24Bank",
          paymentRequestButton: "paymentRequestButton",
          auBankAccount: "auBankAccount",
          fpxBank: "fpxBank",
          netbankingBank: "netbankingBank",
          epsBank: "epsBank",
          affirmMessage: "affirmMessage",
          afterpayClearpayMessage: "afterpayClearpayMessage",
          unifiedMessage: "unifiedMessage",
          paymentMethodMessaging: "paymentMethodMessaging",
          linkAuthentication: "linkAuthentication",
          payment: "payment",
          shippingAddress: "shippingAddress",
          address: "address",
          cart: "cart",
          expressCheckout: "expressCheckout",
          idealBankSecondary: "idealBankSecondary",
          p24BankSecondary: "p24BankSecondary",
          auBankAccountNumber: "auBankAccountNumber",
          auBsb: "auBsb",
          fpxBankSecondary: "fpxBankSecondary",
          netbankingBankSecondary: "netbankingBankSecondary",
          issuingCardNumberDisplay: "issuingCardNumberDisplay",
          issuingCardCopyButton: "issuingCardCopyButton",
          issuingCardCvcDisplay: "issuingCardCvcDisplay",
          issuingCardExpiryDisplay: "issuingCardExpiryDisplay",
          issuingCardPinDisplay: "issuingCardPinDisplay",
          epsBankSecondary: "epsBankSecondary",
          affirmMessageModal: "affirmMessageModal",
          afterpayClearpayMessageModal: "afterpayClearpayMessageModal",
          unifiedMessageModal: "unifiedMessageModal",
          autocompleteSuggestions: "autocompleteSuggestions",
          achBankSearchResults: "achBankSearchResults",
          linkInfoModal: "linkInfoModal",
          loaderUi: "loaderUi",
        };
      },
      3088: function (e, t, n) {
        "use strict";
        n.d(t, {
          s: function () {
            return o;
          },
        });
        var r = n(5305),
          o = [
            r.Y.card,
            r.Y.cardNumber,
            r.Y.cardExpiry,
            r.Y.cardCvc,
            r.Y.postalCode,
          ];
      },
      2631: function (e, t, n) {
        "use strict";
        n.d(t, {
          Ht: function () {
            return p;
          },
          Lo: function () {
            return s;
          },
          Pp: function () {
            return f;
          },
          QL: function () {
            return m;
          },
          T2: function () {
            return _;
          },
          XK: function () {
            return v;
          },
          Xk: function () {
            return i;
          },
          iw: function () {
            return y;
          },
          jQ: function () {
            return c;
          },
          kE: function () {
            return d;
          },
          kO: function () {
            return u;
          },
          rM: function () {
            return h;
          },
          zT: function () {
            return l;
          },
        });
        var r = n(6617),
          o = n(5305),
          i = "https://js.stripe.com/v3/",
          a = (0, r.Ds)(i),
          c = a ? a.origin : "",
          s = i,
          u = 5,
          l = [
            "stripe_3ds2_challenge",
            "stripe_3ds2_fingerprint",
            "three_d_secure_redirect",
            "intent_cardimageverification_challenge",
          ],
          p = "https://verify.stripe.com/",
          d = {
            PAYMENT_INTENT: "PAYMENT_INTENT",
            SETUP_INTENT: "SETUP_INTENT",
          },
          m = {
            family: "font-family",
            src: "src",
            unicodeRange: "unicode-range",
            style: "font-style",
            variant: "font-variant",
            stretch: "font-stretch",
            weight: "font-weight",
            display: "font-display",
          },
          f = Object.keys(m).reduce(function (e, t) {
            return (e[m[t]] = t), e;
          }, {}),
          _ = [
            o.Y.issuingCardCopyButton,
            o.Y.idealBank,
            o.Y.p24Bank,
            o.Y.netbankingBank,
            o.Y.idealBankSecondary,
            o.Y.p24BankSecondary,
            o.Y.netbankingBankSecondary,
            o.Y.fpxBank,
            o.Y.fpxBankSecondary,
            o.Y.epsBank,
            o.Y.epsBankSecondary,
          ],
          h =
            (Object.keys({
              visa: "visa",
              amex: "amex",
              discover: "discover",
              mastercard: "mastercard",
              jcb: "jcb",
              diners: "diners",
              unionpay: "unionpay",
              elo: "elo",
              unknown: "unknown",
            }),
            {
              VISA: "visa",
              MASTERCARD: "mastercard",
              AMEX: "amex",
              DISCOVER: "discover",
              JCB: "jcb",
              DINERS: "diners",
              UNIONPAY: "unionpay",
              ELO: "elo",
            }),
          y = Object.keys(h).map(function (e) {
            return h[e];
          }),
          v = "2cc41e478";
      },
      4624: function (e, t, n) {
        "use strict";
        n.d(t, {
          D3: function () {
            return i;
          },
          om: function () {
            return r;
          },
          wW: function () {
            return o;
          },
        });
        var r = "elements_enable_link_in_prb_experiment_aa",
          o = "elements_enable_link_in_prb_experiment",
          i = {
            elements_session: "elements_session",
            elements_assignment: "elements_assignment",
          };
      },
      276: function (e, t, n) {
        "use strict";
        n.d(t, {
          D3: function () {
            return c.D3;
          },
          Ht: function () {
            return i.Ht;
          },
          J_: function () {
            return a.J_;
          },
          Lo: function () {
            return i.Lo;
          },
          Pp: function () {
            return i.Pp;
          },
          QL: function () {
            return i.QL;
          },
          T2: function () {
            return i.T2;
          },
          XK: function () {
            return i.XK;
          },
          Xk: function () {
            return i.Xk;
          },
          Yj: function () {
            return r.Y;
          },
          iw: function () {
            return i.iw;
          },
          jQ: function () {
            return i.jQ;
          },
          kE: function () {
            return i.kE;
          },
          kO: function () {
            return i.kO;
          },
          om: function () {
            return c.om;
          },
          rM: function () {
            return i.rM;
          },
          sL: function () {
            return o.s;
          },
          wW: function () {
            return c.wW;
          },
          zT: function () {
            return i.zT;
          },
        });
        var r = n(5305),
          o = n(3088),
          i = n(2631),
          a = n(111),
          c = n(4624);
      },
      111: function (e, t, n) {
        "use strict";
        n.d(t, {
          J_: function () {
            return c;
          },
        });
        var r = n(2631),
          o = "stripe.js/".concat(r.XK),
          i = "".concat(o, "; stripe-js-v3/").concat(r.XK),
          a =
            ("".concat(i, "; raw-card"),
            "".concat(i, "; create-source-card-data"),
            "checkout"),
          c =
            ("".concat(i, "; ").concat(a),
            "".concat(i, "; ").concat("payment-link", "; ").concat(a),
            "".concat(i, "; hip"),
            "".concat(i, "; payment-element"),
            "dashboard");
      },
      4020: function (e, t, n) {
        "use strict";
        n.d(t, {
          Fe: function () {
            return i;
          },
          mo: function () {
            return o;
          },
        });
        var r = {
            bif: 1,
            clp: 1,
            djf: 1,
            gnf: 1,
            jpy: 1,
            kmf: 1,
            krw: 1,
            mga: 1,
            pyg: 1,
            rwf: 1,
            vnd: 1,
            vuv: 1,
            xaf: 1,
            xof: 1,
            xpf: 1,
            bhd: 1e3,
            jod: 1e3,
            kwd: 1e3,
            omr: 1e3,
            tnd: 1e3,
          },
          o = function (e) {
            var t = r[e.toLowerCase()] || 100;
            return {
              unitSize: 1 / t,
              fractionDigits: Math.ceil(Math.log(t) / Math.log(10)),
            };
          },
          i = function (e, t) {
            var n = o(t),
              r = n.unitSize,
              i = n.fractionDigits;
            return (e * r).toFixed(i);
          };
      },
      6241: function (e, t, n) {
        "use strict";
        n.d(t, {
          Fe: function () {
            return r.Fe;
          },
          QT: function () {
            return o.Q;
          },
          mo: function () {
            return r.mo;
          },
        });
        var r = n(4020),
          o = n(462);
      },
      462: function (e, t, n) {
        "use strict";
        n.d(t, {
          Q: function () {
            return r;
          },
        });
        var r = [
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
        ];
      },
      9608: function (e, t, n) {
        "use strict";
        n.d(t, {
          Tf: function () {
            return a;
          },
        });
        var r = "1.2em",
          o = "14px",
          i = function (e) {
            var t = e.split(" ").map(function (e) {
              return parseInt(e.trim(), 10);
            });
            return 1 === t.length || 2 === t.length
              ? 2 * t[0]
              : 3 === t.length || 4 === t.length
              ? t[0] + t[2]
              : 0;
          },
          a = function () {
            var e =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : r,
              t =
                arguments.length > 1 && void 0 !== arguments[1]
                  ? arguments[1]
                  : o,
              n =
                arguments.length > 2 && void 0 !== arguments[2]
                  ? arguments[2]
                  : "0",
              a = i(n);
            if ("string" == typeof e && /^[0-9.]+px$/.test(e)) {
              var c = parseFloat(e.toString().replace(/[^0-9.]/g, ""));
              return "".concat(c + a, "px");
            }
            var s,
              u = parseFloat(e.toString().replace(/[^0-9.]/g, "")),
              l = parseFloat(o.replace(/[^0-9.]/g, "")),
              p = parseFloat(t.toString().replace(/[^0-9.]/g, ""));
            if ("string" == typeof t && /^(\d+|\d*\.\d+)px$/.test(t)) s = p;
            else if ("string" == typeof t && /^(\d+|\d*\.\d+)em$/.test(t))
              s = p * l;
            else if ("string" == typeof t && /^(\d+|\d*\.\d+)%$/.test(t))
              s = (p / 100) * l;
            else {
              if (
                "string" != typeof t ||
                (!/^[\d.]+$/.test(t) && !/^\d*\.(px|em|%)$/.test(t))
              )
                return "100%";
              s = l;
            }
            var d = u * s + a,
              m = "".concat(d, "px");
            return /^[0-9.]+px$/.test(m) ? m : "100%";
          };
      },
      133: function (e, t, n) {
        "use strict";
        n.d(t, {
          W3: function () {
            return u;
          },
          dh: function () {
            return c;
          },
          gl: function () {
            return s;
          },
        });
        var r = n(4245),
          o = n(2024),
          i = n(8357),
          a = function () {
            return Array.prototype.slice
              .call(
                document.querySelectorAll(
                  "a[href], area[href], input:not([disabled]),\n  select:not([disabled]), textarea:not([disabled]), button:not([disabled]),\n  object, embed, *[tabindex], *[contenteditable]"
                )
              )
              .filter(function (e) {
                var t = e.getAttribute("tabindex"),
                  n = !t || parseInt(t, 10) >= 0,
                  r = e.getBoundingClientRect(),
                  o = (0, i.D)(e),
                  a =
                    r.width > 0 &&
                    r.height > 0 &&
                    o &&
                    "hidden" !== o.getPropertyValue("visibility");
                return n && a;
              });
          },
          c = function (e, t) {
            var n = a();
            return n[
              (0, o.cx)(n, function (t) {
                return t === e || e.contains(t);
              }) + ("previous" === t ? -1 : 1)
            ];
          },
          s = function (e, t) {
            return e.then(function () {
              return (0, o.qk)(t, function (e) {
                var t = e.element,
                  n = e.tabIndex;
                "" === n
                  ? t.removeAttribute("tabindex")
                  : t.setAttribute("tabindex", n);
              });
            });
          },
          u = function (e) {
            var t = [],
              n = (0, o.qk)(document.querySelectorAll("*"), function (n) {
                var r = n.getAttribute("tabindex") || "";
                e !== n && (n.tabIndex = -1),
                  t.push({ element: n, tabIndex: r });
              }),
              i = (0, r.$M)(function () {
                s(n, t);
              });
            return { lockedPromise: n, lockedElements: t, restoreFocus: i };
          };
      },
      7855: function (e, t, n) {
        "use strict";
        n(6617), n(3534);
      },
      8357: function (e, t, n) {
        "use strict";
        n.d(t, {
          D: function () {
            return r;
          },
        });
        var r = function (e, t) {
          return e ? window.getComputedStyle(e, t) : null;
        };
      },
      3534: function (e, t, n) {
        "use strict";
        n.d(t, {
          Hb: function () {
            return u;
          },
          Ql: function () {
            return p;
          },
          SV: function () {
            return s;
          },
          Xq: function () {
            return l;
          },
          mb: function () {
            return i;
          },
          qW: function () {
            return f;
          },
          yq: function () {
            return a;
          },
        });
        var r = n(7904),
          o = n(8812),
          i = function (e, t) {
            var n = {},
              o = {};
            e.className.split(/\s+/).forEach(function (e) {
              e && (n[e] = !0);
            }),
              t.forEach(function (e) {
                var t = (0, r.Z)(e, 2),
                  i = t[0],
                  a = t[1];
                i.split(/\s+/).forEach(function (e) {
                  e && ((o[e] = o[e] || a), (n[e] = o[e]));
                });
              }),
              (e.className = Object.keys(n)
                .filter(function (e) {
                  return n[e];
                })
                .join(" "));
          },
          a = function (e, t) {
            e.style.cssText = Object.keys(t)
              .map(function (e) {
                return "".concat(e, ": ").concat(t[e], " !important;");
              })
              .join(" ");
          },
          c = {
            border: "none",
            margin: "0",
            padding: "0",
            width: "1px",
            "min-width": "100%",
            overflow: "hidden",
            display: "block",
            visibility: "hidden",
            position: "fixed",
            height: "1px",
            "pointer-events": "none",
            "user-select": "none",
          },
          s = function (e) {
            a(e, c);
          },
          u = function (e) {
            try {
              return window.parent.frames[e];
            } catch (e) {
              return null;
            }
          },
          l = function () {
            if (!document.body)
              throw new o.No(
                "Stripe.js requires that your page has a <body> element."
              );
            return document.body;
          },
          p = function (e) {
            return setTimeout(e, 16);
          },
          d = function (e, t) {
            return !!e.documentElement && e.documentElement.contains(t);
          },
          m =
            "isConnected" in window.Node.prototype
              ? function (e, t) {
                  return t.isConnected && t.ownerDocument === e;
                }
              : d,
          f = function (e, t) {
            return !d(e, t) && m(e, t);
          };
      },
      1002: function (e, t, n) {
        "use strict";
        n.d(t, {
          BO: function () {
            return u.BO;
          },
          Dx: function () {
            return i.D;
          },
          Hb: function () {
            return a.Hb;
          },
          MV: function () {
            return s.M;
          },
          Ql: function () {
            return a.Ql;
          },
          SV: function () {
            return a.SV;
          },
          Tf: function () {
            return r.Tf;
          },
          W3: function () {
            return o.W3;
          },
          Xq: function () {
            return a.Xq;
          },
          a0: function () {
            return c.a;
          },
          dh: function () {
            return o.dh;
          },
          gl: function () {
            return o.gl;
          },
          mb: function () {
            return a.mb;
          },
          qW: function () {
            return a.qW;
          },
          xc: function () {
            return u.xc;
          },
          xz: function () {
            return u.xz;
          },
          yq: function () {
            return a.yq;
          },
        });
        var r = n(9608),
          o = n(133),
          i = (n(7855), n(8357)),
          a = n(3534),
          c = n(877),
          s = n(3765),
          u = n(5784);
      },
      877: function (e, t, n) {
        "use strict";
        n.d(t, {
          a: function () {
            return o;
          },
        });
        var r = [
            "button",
            "checkbox",
            "file",
            "hidden",
            "image",
            "submit",
            "radio",
            "reset",
          ],
          o = function (e) {
            var t = e.tagName;
            if (e.isContentEditable || "TEXTAREA" === t) return !0;
            if ("INPUT" !== t) return !1;
            var n = e.getAttribute("type");
            return -1 === r.indexOf(n);
          };
      },
      3765: function (e, t, n) {
        "use strict";
        n.d(t, {
          M: function () {
            return i;
          },
        });
        var r = n(4245),
          o = n(3534),
          i = function () {
            var e = (0, o.Xq)(),
              t = e.style.overflow;
            e.style.overflow = "hidden";
            var n = { passive: !1 },
              i = function (e) {
                return e.preventDefault();
              },
              a = function () {};
            return (
              window.addEventListener("touchmove", a, n),
              e.addEventListener("touchstart", a, n),
              e.addEventListener("touchmove", i, n),
              (0, r.$M)(function () {
                (e.style.overflow = t || ""),
                  window.removeEventListener("touchmove", a, n),
                  e.removeEventListener("touchstart", a, n),
                  e.removeEventListener("touchmove", i, n);
              })
            );
          };
      },
      5784: function (e, t, n) {
        "use strict";
        n.d(t, {
          BO: function () {
            return i;
          },
          xc: function () {
            return a;
          },
          xz: function () {
            return r;
          },
        });
        var r = function () {
            var e = document.querySelectorAll("meta[name=viewport][content]"),
              t = e[e.length - 1];
            return t && t instanceof HTMLMetaElement ? t.content : "";
          },
          o = function (e) {
            return r().match(e);
          },
          i = function (e) {
            o("width=device-width") ||
              e(
                'Elements requires "width=device-width" be set in your page\'s viewport meta tag.\n       For more information: https://stripe.com/docs/js/appendix/viewport_meta_requirements'
              );
          },
          a = function (e) {
            o("minimum-scale=1") ||
              e(
                'The Financial Connections authentication flow requires "minimum-scale=1" to be set in your page\'s viewport meta tag.'
              );
          };
      },
      4086: function (e, t, n) {
        "use strict";
        n.d(t, {
          k: function () {
            return a;
          },
        });
        var r = n(7853),
          o = n(1020),
          i = n(8992),
          a = (function (e) {
            function t(e, o) {
              var i;
              return (
                (0, r.Z)(this, t),
                ((i = n.call(this)).name = "FetchError"),
                (i.type = "fetch_error"),
                (i.message = "Error fetching ".concat(o)),
                (i.requestUrl = o),
                "string" == typeof e
                  ? (i.message += ": ".concat(e))
                  : ((i.originalError = e),
                    (i.message += ": ".concat(e.message))),
                i
              );
            }
            (0, o.Z)(t, e);
            var n = (0, i.Z)(t);
            return t;
          })((0, n(4909).Z)(Error));
      },
      3973: function (e, t, n) {
        "use strict";
        n.d(t, {
          N: function () {
            return c;
          },
        });
        var r = n(7853),
          o = n(6148),
          i = n(1020),
          a = n(8992),
          c = (function (e) {
            function t(e) {
              var i;
              return (
                (0, r.Z)(this, t),
                (i = n.call(this, e)),
                window.__stripeElementsController &&
                  window.__stripeElementsController.reportIntegrationError(e),
                (i.name = "IntegrationError"),
                Object.defineProperty((0, o.Z)(i), "message", {
                  value: i.message,
                  enumerable: !0,
                }),
                i
              );
            }
            (0, i.Z)(t, e);
            var n = (0, a.Z)(t);
            return t;
          })((0, n(4909).Z)(Error));
      },
      8102: function (e, t, n) {
        "use strict";
        var r = n(7853),
          o = n(1020),
          i = n(8992);
        Error;
      },
      51: function (e, t, n) {
        "use strict";
        n.d(t, {
          F: function () {
            return a;
          },
        });
        var r = n(7853),
          o = n(1020),
          i = n(8992),
          a = (function (e) {
            function t(e) {
              var o;
              return (
                (0, r.Z)(this, t),
                ((o = n.call(this, e)).name = "NetworkError"),
                (o.type = "network_error"),
                (o.requestUrl = e),
                o
              );
            }
            (0, o.Z)(t, e);
            var n = (0, i.Z)(t);
            return t;
          })((0, n(4909).Z)(Error));
      },
      8812: function (e, t, n) {
        "use strict";
        n.d(t, {
          F7: function () {
            return i.F;
          },
          No: function () {
            return o.N;
          },
          kp: function () {
            return r.k;
          },
        });
        var r = n(4086),
          o = n(3973),
          i = (n(8102), n(51));
      },
      9439: function (e, t, n) {
        "use strict";
        n.d(t, {
          h: function () {
            return l;
          },
        });
        var r = n(8489),
          o = n(6617),
          i = n(6589),
          a = n(8812),
          c = function (e) {
            var t = e.data,
              n = e.contentType,
              r = void 0 === n ? "application/x-www-form-urlencoded" : n,
              i = e.method,
              a = e.url,
              c = "";
            return (
              t && "application/x-www-form-urlencoded" === r
                ? (c = (0, o.qC)(t))
                : t && "application/json" === r && (c = JSON.stringify(t)),
              {
                requestUrl: "GET" === i && c ? "".concat(a, "?").concat(c) : a,
                requestData: "GET" === i ? "" : c,
                contentType: r,
              }
            );
          },
          s = function (e) {
            return new i.J(function (t, n) {
              var o = e.method,
                s = e.headers,
                u = e.withCredentials,
                p = c(e),
                d = p.requestUrl,
                m = p.requestData,
                f = p.contentType,
                _ = new XMLHttpRequest();
              u && (_.withCredentials = u),
                _.open(o, d, !0),
                _.setRequestHeader("Accept", "application/json"),
                _.setRequestHeader("Content-Type", f),
                (_.json = function () {
                  return new i.J(function (e, t) {
                    try {
                      e(JSON.parse(_.responseText));
                    } catch (e) {
                      t(new a.kp(e, d));
                    }
                  });
                }),
                s &&
                  Object.keys(s).forEach(function (e) {
                    var t = s[e];
                    "string" == typeof t && _.setRequestHeader(e, t);
                  }),
                (_.onreadystatechange = function () {
                  4 === _.readyState &&
                    ((_.onreadystatechange = function () {}),
                    0 === _.status
                      ? u
                        ? n(new a.F7(d))
                        : l(
                            (0, r.Z)(
                              (0, r.Z)({}, e),
                              {},
                              { withCredentials: !0 }
                            )
                          ).then(t, n)
                      : t(_));
                });
              try {
                _.send(m);
              } catch (e) {
                n(new a.kp(e, d));
              }
            });
          },
          u = function e(t) {
            return new i.J(function (n, o) {
              var s = t.method,
                u = t.headers,
                l = void 0 === u ? {} : u,
                p = t.keepalive,
                d = t.withCredentials,
                m = t.priority,
                f = void 0 === m ? "auto" : m,
                _ = c(t),
                h = _.requestUrl,
                y = _.requestData,
                v = {
                  Accept: "application/json",
                  "Content-Type": _.contentType,
                };
              l &&
                Object.keys(l).forEach(function (e) {
                  var t = l[e];
                  "string" == typeof t && (v[e] = t);
                }),
                window
                  .fetch(h, {
                    method: s,
                    keepalive: p,
                    headers: v,
                    body: y || void 0,
                    mode: "cors",
                    credentials: d ? "include" : "omit",
                    priority: f,
                  })
                  .then(function (c) {
                    if (0 === c.status) {
                      if (!d)
                        return e(
                          (0, r.Z)((0, r.Z)({}, t), {}, { withCredentials: !0 })
                        ).then(n, o);
                      o(new a.F7(h));
                    }
                    return c.text().then(function (e) {
                      n({
                        responseURL: c.url,
                        status: c.status,
                        json: function () {
                          return i.J.resolve(JSON.parse(e));
                        },
                        getResponseHeader: function (e) {
                          return c.headers.get(e) || "";
                        },
                        responseText: e,
                      });
                    });
                  })
                  .catch(function (e) {
                    o(new a.kp(e, h));
                  });
            });
          },
          l = function (e) {
            return "function" == typeof window.fetch ? u(e) : s(e);
          };
      },
      2445: function (e, t, n) {
        "use strict";
        n.d(t, {
          N: function () {
            return r;
          },
        });
        var r = {
          CARD_ELEMENT: "CARD_ELEMENT",
          CONTROLLER: "CONTROLLER",
          METRICS_CONTROLLER: "METRICS_CONTROLLER",
          PAYMENT_REQUEST_ELEMENT: "PAYMENT_REQUEST_ELEMENT",
          PAYMENT_REQUEST_BROWSER: "PAYMENT_REQUEST_BROWSER",
          PAYMENT_REQUEST_GOOGLE_PAY: "PAYMENT_REQUEST_GOOGLE_PAY",
          IBAN_ELEMENT: "IBAN_ELEMENT",
          IDEAL_BANK_ELEMENT: "IDEAL_BANK_ELEMENT",
          P24_BANK_ELEMENT: "P24_BANK_ELEMENT",
          AUTHORIZE_WITH_URL: "AUTHORIZE_WITH_URL",
          STRIPE_3DS2_CHALLENGE: "STRIPE_3DS2_CHALLENGE",
          STRIPE_3DS2_FINGERPRINT: "STRIPE_3DS2_FINGERPRINT",
          AU_BANK_ACCOUNT_ELEMENT: "AU_BANK_ACCOUNT_ELEMENT",
          FPX_BANK_ELEMENT: "FPX_BANK_ELEMENT",
          LIGHTBOX_APP: "LIGHTBOX_APP",
          ISSUING_CARD_NUMBER_DISPLAY_ELEMENT:
            "ISSUING_CARD_NUMBER_DISPLAY_ELEMENT",
          ISSUING_CARD_COPY_BUTTON_ELEMENT: "ISSUING_CARD_COPY_BUTTON_ELEMENT",
          ISSUING_CARD_CVC_DISPLAY_ELEMENT: "ISSUING_CARD_CVC_DISPLAY_ELEMENT",
          ISSUING_CARD_EXPIRY_DISPLAY_ELEMENT:
            "ISSUING_CARD_EXPIRY_DISPLAY_ELEMENT",
          ISSUING_CARD_PIN_DISPLAY_ELEMENT: "ISSUING_CARD_PIN_DISPLAY_ELEMENT",
          EPS_BANK_ELEMENT: "EPS_BANK_ELEMENT",
          HCAPTCHA_APP: "HCAPTCHA_APP",
          NETBANKING_BANK_ELEMENT: "NETBANKING_BANK_ELEMENT",
          AFFIRM_MESSAGE_ELEMENT: "AFFIRM_MESSAGE_ELEMENT",
          AFFIRM_MESSAGE_MODAL_ELEMENT: "AFFIRM_MESSAGE_MODAL_ELEMENT",
          AFTERPAY_MESSAGE_MODAL_ELEMENT: "AFTERPAY_MESSAGE_MODAL_ELEMENT",
          UNIFIED_MESSAGE_MODAL_ELEMENT: "UNIFIED_MESSAGE_MODAL_ELEMENT",
          AUTOCOMPLETE_SUGGESTIONS_ELEMENT: "AUTOCOMPLETE_SUGGESTIONS_ELEMENT",
          ACH_BANK_SEARCH_RESULTS_ELEMENT: "ACH_BANK_SEARCH_RESULTS_ELEMENT",
          INSTANT_DEBITS_APP: "INSTANT_DEBITS_APP",
          LINK_AUTHENTICATION_ELEMENT: "LINK_AUTHENTICATION_ELEMENT",
          PAYMENT_ELEMENT: "PAYMENT_ELEMENT",
          LINKED_ACCOUNTS_INNER: "LINKED_ACCOUNTS_INNER",
          WECHAT_PAY_INNER: "WECHAT_PAY_INNER",
          PAYNOW_INNER: "PAYNOW_INNER",
          BLIK_INNER: "BLIK_INNER",
          PIX_INNER: "PIX_INNER",
          PROMPTPAY_INNER: "PROMPTPAY_INNER",
          ADDRESS_ELEMENT: "ADDRESS_ELEMENT",
          LINK_AUTOFILL_MODAL: "LINK_AUTOFILL_MODAL",
          LINK_INFO_MODAL: "LINK_INFO_MODAL",
          GOOGLE_MAPS_APP: "GOOGLE_MAPS_APP",
          LOADER_UI_APP: "LOADER_UI_APP",
          CART_ELEMENT: "CART_ELEMENT",
          BACS_MANDATE_CONFIRMATION_APP: "BACS_MANDATE_CONFIRMATION_APP",
          BACS_CONFIRMATION_INNER: "BACS_CONFIRMATION_INNER",
          EXPRESS_CHECKOUT_ELEMENT: "EXPRESS_CHECKOUT_ELEMENT",
          BUY_BUTTON_APP: "BUY_BUTTON_APP",
          LINK_BUTTON_FOR_CARD_ELEMENT: "LINK_BUTTON_FOR_CARD_ELEMENT",
        };
      },
      262: function (e, t, n) {
        "use strict";
        n.d(t, {
          i: function () {
            return i;
          },
        });
        var r = n(9294),
          o = n(97),
          i = function (e) {
            var t = {
                frameborder: "0",
                allowTransparency: "true",
                scrolling: "no",
                role: "presentation",
              },
              n = !r.D1;
            if ((n && (t.allow = "payment *"), "STRIPE_3DS2_CHALLENGE" === e)) {
              var i = "publickey-credentials-get ".concat((0, o.x)());
              t.allow = n ? "payment *; ".concat(i) : i;
            }
            if ("PAYMENT_REQUEST_GOOGLE_PAY" === e) {
              (t.sandbox = [
                "allow-scripts",
                "allow-forms",
                "allow-popups",
                "allow-popups-to-escape-sandbox",
                "allow-same-origin",
              ].join(" ")),
                (t.referrerpolicy = "origin");
            }
            return t;
          };
      },
      4044: function (e, t, n) {
        "use strict";
        n.d(t, {
          D: function () {
            return i;
          },
        });
        var r = n(1873),
          o = n(97),
          i = function (e) {
            switch (e) {
              case "CARD_ELEMENT":
                return (0, o.x)(
                  "elements-inner-card-e8f918831206a7c484a5bf6bbd0eb16d.html"
                );
              case "CONTROLLER":
                return (0, o.x)(
                  "controller-b03e58da512ea9575605ed3b16c92dd0.html"
                );
              case "METRICS_CONTROLLER":
                return (0, o.x)(
                  "m-outer-3437aaddcdf6922d623e172c2d6f9278.html"
                );
              case "PAYMENT_REQUEST_ELEMENT":
                return (0, o.x)(
                  "elements-inner-payment-request-ea07f93924db1458dc68aa7d3d260e5e.html"
                );
              case "PAYMENT_REQUEST_BROWSER":
                return (0, o.x)(
                  "payment-request-inner-browser-7cd95a88d50c881546584b540ce89239.html"
                );
              case "PAYMENT_REQUEST_GOOGLE_PAY":
                return (0, o.x)(
                  "payment-request-inner-google-pay-262234c277c490ed7efbff17ba7b19e5.html"
                );
              case "IBAN_ELEMENT":
                return (0, o.x)(
                  "elements-inner-iban-5eec6069d646dcf3565380f3f98c22b3.html"
                );
              case "IDEAL_BANK_ELEMENT":
                return (0, o.x)(
                  "elements-inner-ideal-bank-66866ceed48fc18aa792b8f1ee91e164.html"
                );
              case "P24_BANK_ELEMENT":
                return (0, o.x)(
                  "elements-inner-p24-bank-aa25cfdc5fa72e33e945ce87b97775c6.html"
                );
              case "AUTHORIZE_WITH_URL":
                return (0, o.x)(
                  "authorize-with-url-inner-c6f95b3fca8bf30c4f72691cd3a50b1e.html"
                );
              case "STRIPE_3DS2_CHALLENGE":
                return (0, o.x)(
                  "three-ds-2-challenge-dbe835ebaaa5f0cece09d41142d2da36.html"
                );
              case "STRIPE_3DS2_FINGERPRINT":
                return (0, o.x)(
                  "three-ds-2-fingerprint-95d7a15a7ac8a316f6e99adefcf51252.html"
                );
              case "AU_BANK_ACCOUNT_ELEMENT":
                return (0, o.x)(
                  "elements-inner-au-bank-account-5259409a75672696be7437606c1232c2.html"
                );
              case "FPX_BANK_ELEMENT":
                return (0, o.x)(
                  "elements-inner-fpx-bank-350dc0bdb4fd4c9e8553e800b2491453.html"
                );
              case "LIGHTBOX_APP":
                return (0, o.x)(
                  "lightbox-inner-f238e0c898e3061f3663a1e0b0a628bb.html"
                );
              case "ISSUING_CARD_NUMBER_DISPLAY_ELEMENT":
                return (0, o.x)(
                  "elements-inner-issuing-card-number-display-14dcb956fba101c1530b69fd108c7dba.html"
                );
              case "ISSUING_CARD_COPY_BUTTON_ELEMENT":
                return (0, o.x)(
                  "elements-inner-issuing-card-copy-button-f82fa29726bd341001fdf5dc21a0bdae.html"
                );
              case "ISSUING_CARD_CVC_DISPLAY_ELEMENT":
                return (0, o.x)(
                  "elements-inner-issuing-card-cvc-display-d7a40534d5e3beca830c9fe2f910b901.html"
                );
              case "ISSUING_CARD_EXPIRY_DISPLAY_ELEMENT":
                return (0, o.x)(
                  "elements-inner-issuing-card-expiry-display-2c096a3d43bfa235a6374e77295fa9de.html"
                );
              case "ISSUING_CARD_PIN_DISPLAY_ELEMENT":
                return (0, o.x)(
                  "elements-inner-issuing-card-pin-display-3ba1affcb149788664b26d63c5e720db.html"
                );
              case "EPS_BANK_ELEMENT":
                return (0, o.x)(
                  "elements-inner-eps-bank-a44f1e5524b5da58d6e38da7a615aab5.html"
                );
              case "HCAPTCHA_APP":
                return (0, o.x)(
                  "hcaptcha-inner-074cc1a4b67e4a558cb749928d19d29e.html"
                );
              case "NETBANKING_BANK_ELEMENT":
                return (0, o.x)(
                  "elements-inner-netbanking-bank-30dfe76310444bfc4e2b4601924ff452.html"
                );
              case "AFFIRM_MESSAGE_ELEMENT":
                return (0, o.x)(
                  "elements-inner-affirm-message-ea977d951b9e76338afa501781d4d9e5.html"
                );
              case "AFFIRM_MESSAGE_MODAL_ELEMENT":
                return (0, o.x)(
                  "elements-inner-affirm-message-modal-2cb029533e6083af04293c56dad52683.html"
                );
              case "AFTERPAY_MESSAGE_MODAL_ELEMENT":
                return (0, o.x)(
                  "elements-inner-afterpay-message-modal-dc43101bf67498e5055dd35c9fdd158a.html"
                );
              case "UNIFIED_MESSAGE_MODAL_ELEMENT":
                return (0, o.x)(
                  "elements-inner-unified-message-modal-16a1b225a40d7b35674043b89298471c.html"
                );
              case "INSTANT_DEBITS_APP":
                return (0, o.x)(
                  "instant-debits-app-f2ba66ff63b3a23defa2a60c397e18a6.html"
                );
              case "LINK_AUTHENTICATION_ELEMENT":
                return (0, o.x)(
                  "elements-inner-authentication-8baba9fc6831bc0f1c4fa90e142d9b63.html"
                );
              case "PAYMENT_ELEMENT":
                return (0, o.x)(
                  "elements-inner-payment-a721d4cacd563e13956c6a8a279a3b5e.html"
                );
              case "LINKED_ACCOUNTS_INNER":
                return (0, o.x)(
                  "linked-accounts-inner-987fc593c97358739dabdccfd308c724.html"
                );
              case "WECHAT_PAY_INNER":
                return (0, o.x)(
                  "wechat-pay-inner-cc785de5424c5cec04f99d8c31d2d54c.html"
                );
              case "PAYNOW_INNER":
                return (0, o.x)(
                  "paynow-inner-23b940657cd71a93929dd754a025820c.html"
                );
              case "BLIK_INNER":
                return (0, o.x)(
                  "blik-inner-b77fbd7001b89fd990605e85a6178b77.html"
                );
              case "PIX_INNER":
              case "PROMPTPAY_INNER":
              case "BACS_CONFIRMATION_INNER":
                return (0, o.x)("");
              case "ADDRESS_ELEMENT":
                return (0, o.x)(
                  "elements-inner-address-ed02c7115557358be5e10778e3c015e8.html"
                );
              case "LINK_AUTOFILL_MODAL":
                return (0, o.x)(
                  "link-autofill-modal-inner-e4ba2ba737679302b907b32e5fad3aa6.html"
                );
              case "GOOGLE_MAPS_APP":
                return (0, o.x)(
                  "google-maps-inner-f38008f0be49cec0fb825e66afc48a36.html"
                );
              case "AUTOCOMPLETE_SUGGESTIONS_ELEMENT":
                return (0, o.x)(
                  "elements-inner-autocomplete-suggestions-fd46ec397294693536d638b0f41e6aea.html"
                );
              case "ACH_BANK_SEARCH_RESULTS_ELEMENT":
                return (0, o.x)(
                  "elements-inner-ach-bank-search-results-8707db68807768378d28af72c66aa7c6.html"
                );
              case "LINK_INFO_MODAL":
                return (0, o.x)(
                  "elements-inner-link-info-modal-83a9a6f797e09491fa89d24f9f723b6c.html"
                );
              case "LOADER_UI_APP":
                return (0, o.x)(
                  "elements-inner-loader-ui-5c2914e691b34c415340c8f5a76e4313.html"
                );
              case "CART_ELEMENT":
                return (0, o.x)(
                  "elements-inner-cart-01b233afd12c81a2e3012955d897569a.html"
                );
              case "BACS_MANDATE_CONFIRMATION_APP":
                return (0, o.x)(
                  "bacs-mandate-confirmation-inner-eade66e227a1074a54f2d8fc248adb2b.html"
                );
              case "EXPRESS_CHECKOUT_ELEMENT":
                return (0, o.x)(
                  "elements-inner-express-checkout-e43e0b28b63a34511f883951abb74b0f.html"
                );
              case "BUY_BUTTON_APP":
                return (0, o.x)("buy-button-app.html");
              case "LINK_BUTTON_FOR_CARD_ELEMENT":
                return (0, o.x)(
                  "elements-inner-link-button-for-card-b3017f963e61584d190e6e97d374df67.html"
                );
              default:
                return (0, r.Rz)(e);
            }
          };
      },
      97: function (e, t, n) {
        "use strict";
        n.d(t, {
          x: function () {
            return r;
          },
        });
        var r = function (e) {
          return "".concat("https://js.stripe.com/v3/").concat(e || "");
        };
      },
      755: function (e, t, n) {
        "use strict";
        n.d(t, {
          $G: function () {
            return a.$;
          },
          NC: function () {
            return o.N;
          },
          i7: function () {
            return r.i;
          },
          jr: function () {
            return c.j;
          },
          oi: function () {
            return a.o;
          },
          xS: function () {
            return i.x;
          },
        });
        var r = n(262),
          o = n(2445),
          i = n(97),
          a = n(5311),
          c = n(6810);
      },
      5311: function (e, t, n) {
        "use strict";
        n.d(t, {
          $: function () {
            return c;
          },
          o: function () {
            return a;
          },
        });
        var r = n(8489),
          o = (n(1873), n(276)),
          i = n(1002),
          a = function (e) {
            var t,
              n = e.controllerId,
              a = e.frameId,
              c = e.targetOrigin,
              s = e.type,
              u = c;
            if (
              ("controller" === s
                ? (t = (0, i.Hb)(a))
                : "group" === s
                ? (t = (0, i.Hb)(n))
                : "outer" === s || "hosted" === s
                ? (t = window.frames[a])
                : "inner" === s && ((u = u || "*"), (t = window.parent)),
              (u = u || o.jQ),
              t && "function" == typeof t.postMessage)
            ) {
              var l = e.message.delegate
                ? { targetOrigin: u, delegate: e.message.delegate }
                : u;
              t.postMessage(
                JSON.stringify(
                  (0, r.Z)((0, r.Z)({}, e), {}, { __stripeJsV3: !0 })
                ),
                l
              );
            }
          },
          c = function (e) {
            try {
              var t = "string" == typeof e ? JSON.parse(e) : e;
              return t.__stripeJsV3 ? t : null;
            } catch (e) {
              return null;
            }
          };
      },
      6810: function (e, t, n) {
        "use strict";
        n.d(t, {
          j: function () {
            return r;
          },
        });
        n(276);
        var r = function (e) {
          return e;
        };
      },
      3048: function (e, t, n) {
        "use strict";
        n(9294), n(4245);
      },
      8148: function (e, t, n) {
        "use strict";
        n.d(t, {
          i3: function () {
            return r;
          },
        });
        var r = function (e) {
          return e.replace(/_./g, function (e) {
            return e[1].toUpperCase();
          });
        };
      },
      9617: function (e, t, n) {
        "use strict";
        n.d(t, {
          $M: function () {
            return a;
          },
          AO: function () {
            return i;
          },
          HP: function () {
            return o;
          },
        });
        var r = n(8812),
          o =
            (n(6589),
            function (e) {
              var t = {},
                n = {};
              return function (r) {
                var o = "_".concat(r);
                if ("string" == typeof r && void 0 !== t[o]) return t[o];
                if ("number" == typeof r && void 0 !== n[o]) return n[o];
                var i = e(r);
                return (
                  "string" == typeof r && (t[o] = i),
                  "number" == typeof r && (n[o] = i),
                  i
                );
              };
            }),
          i = function (e, t) {
            var n = !1;
            return function () {
              if (n) throw new r.No(t);
              n = !0;
              try {
                return e.apply(void 0, arguments).then(
                  function (e) {
                    return (n = !1), e;
                  },
                  function (e) {
                    throw ((n = !1), e);
                  }
                );
              } catch (e) {
                throw ((n = !1), e);
              }
            };
          },
          a = function (e) {
            var t = e;
            return function () {
              t && (t.apply(void 0, arguments), (t = null));
            };
          };
      },
      6940: function (e, t, n) {
        "use strict";
        n(6589);
      },
      4245: function (e, t, n) {
        "use strict";
        n.d(t, {
          $M: function () {
            return r.$M;
          },
          AO: function () {
            return r.AO;
          },
          HP: function () {
            return r.HP;
          },
          i3: function () {
            return i.i3;
          },
          tN: function () {
            return o.t;
          },
        });
        var r = n(9617),
          o = (n(807), n(6103)),
          i = (n(9220), n(6940), n(8148));
        n(3048);
      },
      807: function (e, t, n) {
        "use strict";
        n(6589);
      },
      6103: function (e, t, n) {
        "use strict";
        n.d(t, {
          t: function () {
            return o;
          },
        });
        var r = n(6589),
          o = function (e, t) {
            return e.reduce(function (e, n) {
              return e.then(function (e) {
                return "SATISFIED" === e.type
                  ? e
                  : n().then(function (e) {
                      return t(e)
                        ? { type: "SATISFIED", value: e }
                        : { type: "UNSATISFIED" };
                    });
              });
            }, r.J.resolve({ type: "UNSATISFIED" }));
          };
      },
      9220: function (e, t, n) {
        "use strict";
        n(6589);
      },
      9803: function (e, t, n) {
        "use strict";
        n.d(t, {
          T: function () {
            return i;
          },
          V: function () {
            return a;
          },
        });
        var r = "00".concat(Math.floor(1e3 * Math.random())).slice(-3),
          o = 0,
          i = function (e) {
            return ""
              .concat(e)
              .concat(r)
              .concat(o++);
          },
          a = function e() {
            var t =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : "";
            return t
              ? (
                  parseInt(t, 10) ^
                  ((16 * Math.random()) >> (parseInt(t, 10) / 4))
                ).toString(16)
              : "00000000-0000-4000-8000-000000000000".replace(/[08]/g, e);
          };
      },
      7412: function (e, t, n) {
        "use strict";
        n.d(t, {
          To: function () {
            return r.T;
          },
          Vj: function () {
            return r.V;
          },
        });
        var r = n(9803);
      },
      9620: function (e, t, n) {
        "use strict";
        n.d(t, {
          Kl: function () {
            return r.Kl;
          },
          Tj: function () {
            return o.T;
          },
          lO: function () {
            return r.lO;
          },
          pF: function () {
            return r.pF;
          },
        });
        var r = n(1834),
          o = n(7049);
      },
      1834: function (e, t, n) {
        "use strict";
        n.d(t, {
          Kl: function () {
            return o;
          },
          lO: function () {
            return i;
          },
          pF: function () {
            return a;
          },
        });
        var r = n(8812),
          o = { live: "live", test: "test", unknown: "unknown" },
          i = function (e) {
            return /^pk_test_/.test(e)
              ? o.test
              : /^pk_live_/.test(e)
              ? o.live
              : o.unknown;
          },
          a = function (e) {
            if (e === o.unknown)
              throw new r.No(
                "It looks like you're using an older Stripe key. In order to use this API, you'll need to use a modern API key, which is prefixed with 'pk_live_' or 'pk_test_'.\n    You can roll your publishable key here: https://dashboard.stripe.com/account/apikeys"
              );
          };
      },
      7049: function (e, t, n) {
        "use strict";
        n.d(t, {
          T: function () {
            return l;
          },
        });
        var r = n(8812),
          o = "publishable",
          i = "secret",
          a = "ephemeral",
          c = "restricted",
          s = "unknown",
          u = function (e) {
            switch (e.split("_", 1)[0]) {
              case "pk":
                return o;
              case "sk":
                return i;
              case "ek":
                return a;
              case "rk":
                return c;
              default:
                return s;
            }
          },
          l = function (e) {
            if ("" === e)
              throw new r.No(
                "Please call Stripe() with your publishable key. You used an empty string."
              );
            switch (u(e)) {
              case i:
                throw new r.No(
                  "You should not use your secret key with Stripe.js.\n          Please pass a publishable key instead."
                );
              case a:
                throw new r.No(
                  "You should not use an ephemeral key with Stripe.js.\n          Please pass a publishable key instead."
                );
              case c:
                throw new r.No(
                  "You should not use a restricted key with Stripe.js.\n          Please pass a publishable key instead."
                );
            }
          };
      },
      248: function (e, t, n) {
        "use strict";
        n.d(t, {
          _b: function () {
            return c;
          },
          GS: function () {
            return a;
          },
          ke: function () {
            return s;
          },
          ZX: function () {
            return u;
          },
        });
        var r,
          o = n(6222),
          i = n(276),
          a = {
            alipay: "alipay",
            affirm: "affirm",
            afterpay_clearpay: "afterpay_clearpay",
            au_becs_debit: "au_becs_debit",
            acss_debit: "acss_debit",
            bacs_debit: "bacs_debit",
            bancontact: "bancontact",
            blik: "blik",
            boleto: "boleto",
            card: "card",
            cashapp: "cashapp",
            customer_balance: "customer_balance",
            eps: "eps",
            fpx: "fpx",
            giropay: "giropay",
            grabpay: "grabpay",
            ideal: "ideal",
            klarna: "klarna",
            konbini: "konbini",
            mobilepay: "mobilepay",
            nz_bank_account: "nz_bank_account",
            oxxo: "oxxo",
            p24: "p24",
            pay_by_bank: "pay_by_bank",
            paypal: "paypal",
            sepa_debit: "sepa_debit",
            sofort: "sofort",
            three_d_secure: "three_d_secure",
            upi: "upi",
            us_bank_account: "us_bank_account",
            wechat_pay: "wechat_pay",
            paynow: "paynow",
            pix: "pix",
            promptpay: "promptpay",
            qris: "qris",
            revolut_pay: "revolut_pay",
            netbanking: "netbanking",
            id_bank_transfer: "id_bank_transfer",
            link: "link",
            apple_pay: "apple_pay",
            google_pay: "google_pay",
            zip: "zip",
          },
          c =
            ((r = {}),
            (0, o.Z)(r, i.Yj.auBankAccount, a.au_becs_debit),
            (0, o.Z)(r, i.Yj.card, a.card),
            (0, o.Z)(r, i.Yj.cardNumber, a.card),
            (0, o.Z)(r, i.Yj.cardExpiry, a.card),
            (0, o.Z)(r, i.Yj.cardCvc, a.card),
            (0, o.Z)(r, i.Yj.postalCode, a.card),
            (0, o.Z)(r, i.Yj.iban, a.sepa_debit),
            (0, o.Z)(r, i.Yj.idealBank, a.ideal),
            (0, o.Z)(r, i.Yj.fpxBank, a.fpx),
            (0, o.Z)(r, i.Yj.p24Bank, a.p24),
            (0, o.Z)(r, i.Yj.netbankingBank, a.netbanking),
            (0, o.Z)(r, i.Yj.epsBank, a.eps),
            r),
          s = function (e) {
            return -1 === i.sL.indexOf(e);
          },
          u = function (e, t) {
            return null != t ? t : s(e) ? null : c[e] || null;
          };
      },
      6589: function (e, t, n) {
        "use strict";
        n.d(t, {
          J: function () {
            return r.J;
          },
        });
        var r = n(7802);
      },
      7802: function (e, t, n) {
        "use strict";
        n.d(t, {
          J: function () {
            return i;
          },
        });
        var r = n(1803),
          o = n.n(r),
          i = (n(8029), window.Promise ? Promise : o());
      },
      3110: function (e) {
        e.exports = function (e) {
          var t = e
            .split("")
            .map(function (e) {
              return e.charCodeAt(0);
            })
            .reduce(function (e, t) {
              return ((e << 5) - e + t) & ((e << 5) - e + t);
            }, 0)
            .toString();
          return "_".concat(t.replace(/[-.]/g, "_"));
        };
      },
      9792: function (e, t, n) {
        "use strict";
        n.d(t, {
          E: function () {
            return s;
          },
        });
        var r = n(7853),
          o = n(4531),
          i = Date.now
            ? function () {
                return Date.now();
              }
            : function () {
                return new Date().getTime();
              },
          a = i(),
          c =
            window.performance && window.performance.now
              ? function () {
                  return window.performance.now();
                }
              : function () {
                  return i() - a;
                },
          s = (function () {
            function e(t) {
              (0, r.Z)(this, e), (this.timestampValue = null != t ? t : c());
            }
            return (
              (0, o.Z)(
                e,
                [
                  {
                    key: "getAsPosixTime",
                    value: function () {
                      return i() - this.getElapsedTime();
                    },
                  },
                  {
                    key: "getElapsedTime",
                    value: function (e) {
                      return Math.round(
                        (e ? e.timestampValue : c()) - this.timestampValue
                      );
                    },
                  },
                  {
                    key: "valueOf",
                    value: function () {
                      return Math.round(this.timestampValue);
                    },
                  },
                ],
                [
                  {
                    key: "fromPosixTime",
                    value: function (t) {
                      return new e(t - i() + c());
                    },
                  },
                ]
              ),
              e
            );
          })();
      },
      1216: function (e, t, n) {
        "use strict";
        var r = (0, n(6617).Ds)("https://payments.stripe.com");
        r && r.origin;
      },
      7600: function (e, t, n) {
        "use strict";
        n.d(t, {
          v: function () {
            return o;
          },
        });
        var r = function (e, t) {
            return Object.prototype.hasOwnProperty.call(e, t);
          },
          o = function (e) {
            var t = {};
            return (
              e
                .replace(/\+/g, " ")
                .split("&")
                .forEach(function (e) {
                  var n,
                    o = e.split("="),
                    i = decodeURIComponent(o[0]),
                    a = t,
                    c = 0,
                    s = i.split("]["),
                    u = s.length - 1;
                  if (
                    (/\[/.test(s[0]) && /\]$/.test(s[u])
                      ? ((s[u] = s[u].replace(/\]$/, "")),
                        (u = (s = s.shift().split("[").concat(s)).length - 1))
                      : (u = 0),
                    !(s.indexOf("__proto__") >= 0))
                  )
                    if (2 === o.length)
                      if (((n = decodeURIComponent(o[1])), u))
                        for (; c <= u; c++) {
                          if (
                            ((i = "" === s[c] ? a.length : s[c]),
                            !r(a, i) && a[i])
                          )
                            return;
                          (a[i] =
                            c < u
                              ? a[i] || (s[c + 1] && isNaN(s[c + 1]) ? {} : [])
                              : n),
                            (a = a[i]);
                        }
                      else if (Array.isArray(t[i])) t[i].push(n);
                      else if (void 0 !== t[i]) {
                        if (!r(t, i)) return;
                        t[i] = [t[i], n];
                      } else t[i] = n;
                    else i && (t[i] = "");
                }),
              t
            );
          };
      },
      6617: function (e, t, n) {
        "use strict";
        n.d(t, {
          Ds: function () {
            return i.Ds;
          },
          P$: function () {
            return i.P$;
          },
          Qg: function () {
            return a.Qg;
          },
          qC: function () {
            return o.q;
          },
          sD: function () {
            return i.sD;
          },
          uW: function () {
            return a.uW;
          },
          vB: function () {
            return r.v;
          },
          v_: function () {
            return i.v_;
          },
          vo: function () {
            return a.vo;
          },
        });
        var r = n(7600),
          o = n(4469),
          i = n(3745),
          a = n(7306);
      },
      7306: function (e, t, n) {
        "use strict";
        n.d(t, {
          Qg: function () {
            return a;
          },
          uW: function () {
            return o;
          },
          vo: function () {
            return i;
          },
        });
        var r = n(3745),
          o =
            (n(1216),
            function (e, t) {
              var n = (0, r.Ds)(e),
                o = (0, r.Ds)(t);
              return !(!n || !o) && n.origin === o.origin;
            }),
          i = function (e) {
            return o(e, "https://js.stripe.com/v3/");
          },
          a = function (e) {
            return (
              i(e) ||
              (function (e) {
                var t = (0, r.Ds)(e),
                  n = t ? t.host : "";
                return "stripe.com" === n || !!n.match(/\.stripe\.(com|me)$/);
              })(e) ||
              (function (e) {
                var t = (0, r.Ds)(e),
                  n = t ? t.host : "";
                return "link.co" === n || !!n.match(/\.link\.(co)$/);
              })(e)
            );
          };
      },
      4469: function (e, t, n) {
        "use strict";
        n.d(t, {
          q: function () {
            return o;
          },
        });
        var r = n(3696),
          o = function e(t, n) {
            var o = [];
            return (
              Object.keys(t).forEach(function (i) {
                var a = t[i],
                  c = n ? "".concat(n, "[").concat(i, "]") : i;
                if (a && "object" == typeof a) {
                  var s = e(a, c);
                  "" !== s && (o = [].concat((0, r.Z)(o), [s]));
                } else null != a && (o = [].concat((0, r.Z)(o), ["".concat(c, "=").concat(encodeURIComponent(String(a)))]));
              }),
              o.join("&").replace(/%20/g, "+")
            );
          };
      },
      3745: function (e, t, n) {
        "use strict";
        n.d(t, {
          Ds: function () {
            return i;
          },
          P$: function () {
            return a;
          },
          sD: function () {
            return o;
          },
          v_: function () {
            return c;
          },
        });
        var r = /^(http(s)?):\/\//,
          o = function (e) {
            return r.test(e);
          },
          i = function (e) {
            if (!o(e)) return null;
            var t = document.createElement("a");
            t.href = e;
            var n = t.protocol,
              r = t.host,
              i = t.pathname,
              a = /:80$/,
              c = /:443$/;
            return (
              "http:" === n && a.test(r)
                ? (r = r.replace(a, ""))
                : "https:" === n && c.test(r) && (r = r.replace(c, "")),
              {
                host: r,
                protocol: n,
                origin: "".concat(n, "//").concat(r),
                path: i,
              }
            );
          },
          a = function (e) {
            var t = i(e);
            return t ? t.origin : null;
          },
          c = function (e, t) {
            if ("/" === t[0]) {
              var n = i(e);
              return n ? "".concat(n.origin).concat(t) : t;
            }
            var r = e.replace(/\/[^/]*$/, "/");
            return "".concat(r).concat(t);
          };
      },
      2580: function (e, t, n) {
        "use strict";
        n.d(t, {
          R: function () {
            return r;
          },
        });
        var r = function () {
          var e =
            arguments.length > 1 && void 0 !== arguments[1]
              ? arguments[1]
              : "absurd";
          throw new Error(e);
        };
      },
      9605: function (e, t, n) {
        "use strict";
        n.d(t, {
          IN: function () {
            return i;
          },
          MO: function () {
            return p;
          },
          oQ: function () {
            return l;
          },
          rX: function () {
            return a;
          },
        });
        var r = n(7974),
          o = {
            _componentName: r.Z_,
            _implementation: (0, r.mC)({ _frame: (0, r.mC)({ id: r.Z_ }) }),
          },
          i = (0, r.mC)(o),
          a = function (e) {
            var t = (0, r.ld)(i, e, "");
            return "error" === t.type ? null : t.value;
          },
          c = {
            clientSecret: (0, r.jt)(
              (0, r.mC)({ id: r.Z_, clientSecret: r.Z_, type: r.Z_ })
            ),
          },
          s = (0, r.mC)(c),
          u = { _elements: (0, r.CT)(i), _id: r.Z_, _commonOptions: s },
          l = (0, r.mC)(u),
          p = function (e) {
            var t = (0, r.ld)(l, e, "");
            return "error" === t.type ? null : t.value;
          };
      },
      1873: function (e, t, n) {
        "use strict";
        n.d(t, {
          $3: function () {
            return i.$3;
          },
          AG: function () {
            return i.AG;
          },
          Ao: function () {
            return i.Ao;
          },
          Bi: function () {
            return i.Bi;
          },
          CT: function () {
            return i.CT;
          },
          Gu: function () {
            return i.Gu;
          },
          HM: function () {
            return i.HM;
          },
          IN: function () {
            return o.IN;
          },
          M2: function () {
            return i.M2;
          },
          M4: function () {
            return i.M4;
          },
          MO: function () {
            return o.MO;
          },
          MZ: function () {
            return i.MZ;
          },
          NM: function () {
            return i.NM;
          },
          NQ: function () {
            return i.NQ;
          },
          RH: function () {
            return i.RH;
          },
          Rx: function () {
            return i.Rx;
          },
          Ry: function () {
            return i.Ry;
          },
          Rz: function () {
            return r.R;
          },
          Wc: function () {
            return i.Wc;
          },
          Xg: function () {
            return i.Xg;
          },
          Z_: function () {
            return i.Z_;
          },
          cV: function () {
            return i.cV;
          },
          ci: function () {
            return i.ci;
          },
          hN: function () {
            return i.hN;
          },
          jt: function () {
            return i.jt;
          },
          kw: function () {
            return i.kw;
          },
          ld: function () {
            return i.ld;
          },
          mC: function () {
            return i.mC;
          },
          n2: function () {
            return i.n2;
          },
          oQ: function () {
            return o.oQ;
          },
          or: function () {
            return i.or;
          },
          p3: function () {
            return i.p3;
          },
          rS: function () {
            return i.rS;
          },
          rX: function () {
            return o.rX;
          },
          ui: function () {
            return i.ui;
          },
          uw: function () {
            return i.uw;
          },
          x4: function () {
            return i.x4;
          },
          xe: function () {
            return i.xe;
          },
          yv: function () {
            return i.yv;
          },
          z$: function () {
            return i.z$;
          },
          zS: function () {
            return i.zS;
          },
        });
        var r = n(2580),
          o = n(9605),
          i = n(7974);
      },
      7974: function (e, t, n) {
        "use strict";
        n.d(t, {
          $3: function () {
            return h;
          },
          AG: function () {
            return g;
          },
          Ao: function () {
            return d;
          },
          Bi: function () {
            return B;
          },
          CT: function () {
            return U;
          },
          Gu: function () {
            return V;
          },
          HM: function () {
            return T;
          },
          M2: function () {
            return x;
          },
          M4: function () {
            return Z;
          },
          MZ: function () {
            return q;
          },
          NM: function () {
            return z;
          },
          NQ: function () {
            return y;
          },
          RH: function () {
            return _;
          },
          Rx: function () {
            return O;
          },
          Ry: function () {
            return F;
          },
          Wc: function () {
            return M;
          },
          Xg: function () {
            return j;
          },
          Z_: function () {
            return I;
          },
          cV: function () {
            return N;
          },
          ci: function () {
            return K;
          },
          hN: function () {
            return C;
          },
          jt: function () {
            return v;
          },
          kw: function () {
            return P;
          },
          ld: function () {
            return W;
          },
          mC: function () {
            return J;
          },
          n2: function () {
            return w;
          },
          or: function () {
            return b;
          },
          p3: function () {
            return L;
          },
          rS: function () {
            return R;
          },
          ui: function () {
            return S;
          },
          uw: function () {
            return G;
          },
          x4: function () {
            return m;
          },
          xe: function () {
            return E;
          },
          yv: function () {
            return Y;
          },
          z$: function () {
            return A;
          },
          zS: function () {
            return f;
          },
        });
        var r = n(6222),
          o = n(3696),
          i = n(8489),
          a = n(8812),
          c = n(2024),
          s = n(6241),
          u = n(2141),
          l = n(9620),
          p = (n(6617), n(2580)),
          d = function (e, t, n) {
            var r = n.path.reduce(function (e, t, n) {
              return 0 === n
                ? t
                : 0 === t.indexOf(".")
                ? "".concat(e, '["').concat(t, '"]')
                : "".concat(e, ".").concat(t);
            }, "");
            return "undefined" === t
              ? "Missing value for "
                  .concat(n.label, ": ")
                  .concat(r || "value", " should be ")
                  .concat(e, ".")
              : "Invalid value for "
                  .concat(n.label, ": ")
                  .concat(r || "value", " should be ")
                  .concat(e, ". You specified: ")
                  .concat(t, ".");
          },
          m = function (e) {
            var t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : [];
            return { type: "valid", value: e, warnings: t };
          },
          f = function (e) {
            return { error: e, errorType: "full", type: "error" };
          },
          _ = function (e, t, n) {
            var r = new a.No(d(e, t, n));
            return f(r);
          },
          h = function (e, t, n) {
            return {
              expected: e,
              actual: String(t),
              options: n,
              errorType: "mismatch",
              type: "error",
            };
          },
          y = function (e, t) {
            return (0, i.Z)(
              (0, i.Z)({}, e),
              {},
              { path: [].concat((0, o.Z)(e.path), [t]) }
            );
          },
          v = function (e) {
            return function (t, n) {
              return void 0 === t ? m(t) : e(t, n);
            };
          },
          g = function (e) {
            return function (t, n) {
              return null === t ? m(t) : e(t, n);
            };
          },
          b = function (e, t) {
            return function (n, r) {
              var o = function (e) {
                  var t = e.options.path.join(".") || "value";
                  return {
                    error: "".concat(t, " should be ").concat(e.expected),
                    actual: "".concat(t, " as ").concat(e.actual),
                  };
                },
                i = function (e, t, n) {
                  return f(
                    new a.No(
                      "Invalid value for "
                        .concat(e, ": ")
                        .concat(t, ". You specified ")
                        .concat(n, ".")
                    )
                  );
                },
                c = e(n, r),
                s = t(n, r);
              if ("error" === c.type && "error" === s.type) {
                if ("mismatch" === c.errorType && "mismatch" === s.errorType) {
                  var u = o(c),
                    l = u.error,
                    p = u.actual,
                    d = o(s),
                    m = d.error,
                    _ = d.actual;
                  return i(
                    r.label,
                    l === m ? l : "".concat(l, " or ").concat(m),
                    p === _ ? p : "".concat(p, " and ").concat(_)
                  );
                }
                if ("mismatch" === c.errorType) {
                  var h = o(c),
                    y = h.error,
                    v = h.actual;
                  return i(r.label, y, v);
                }
                if ("mismatch" === s.errorType) {
                  var g = o(s),
                    b = g.error,
                    w = g.actual;
                  return i(r.label, b, w);
                }
                return f(c.error);
              }
              return "valid" === c.type ? c : s;
            };
          },
          w = function (e, t) {
            return function (n, r) {
              return n instanceof e
                ? m(n)
                : h("a ".concat(t, " instance"), n, r);
            };
          },
          k = function (e, t) {
            return function (n, r) {
              var o = (0, c.sE)(e, function (e) {
                return e === n;
              });
              if (void 0 === o) {
                var i = t
                  ? "a recognized string."
                  : "one of the following strings: ".concat(e.join(", "));
                return h(i, n, r);
              }
              return m(o);
            };
          },
          E = function (e) {
            return function (t, n) {
              return "string" == typeof t && 0 === t.indexOf(e)
                ? m(t)
                : h("a string starting with ".concat(e), t, n);
            };
          },
          S = function (e, t) {
            return function (n, r) {
              return "string" == typeof n && n.length >= e && n.length <= t
                ? m(n)
                : h(
                    e === t
                      ? "a string of ".concat(e, " characters")
                      : "a string with "
                          .concat(e, " to ")
                          .concat(t, " characters"),
                    n,
                    r
                  );
            };
          },
          P = function () {
            for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
              t[n] = arguments[n];
            return k(t, !1);
          },
          A = function () {
            for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
              t[n] = arguments[n];
            return k(t, !0);
          },
          C = P.apply(void 0, (0, o.Z)(u.J$)),
          N = P.apply(void 0, (0, o.Z)(s.QT)),
          I =
            (P.apply(void 0, (0, o.Z)(Object.keys(l.Kl))),
            function (e, t) {
              return "string" == typeof e ? m(e) : h("a string", e, t);
            }),
          T = function (e, t) {
            return "true" === e
              ? m(!0)
              : "false" === e
              ? m(!1)
              : h("a boolean", "" === e ? '""' : e, t);
          },
          M = function (e, t) {
            return function (n, r) {
              return void 0 === n ? m(t()) : e(n, r);
            };
          },
          j = function (e, t) {
            return "boolean" == typeof e ? m(e) : h("a boolean", e, t);
          },
          O = function (e, t) {
            return "number" == typeof e ? m(e) : h("a number", e, t);
          },
          R = function (e, t) {
            return function (n, r) {
              var o = Number(n);
              return "string" == typeof n && o >= e && o <= t
                ? m(o)
                : h("a number from ".concat(e, " to ").concat(t), n, r);
            };
          },
          Z = function (e) {
            return function (t, n) {
              return "number" == typeof t && t > e
                ? m(t)
                : h("a number greater than ".concat(e), t, n);
            };
          },
          x = function (e) {
            return function (t, n) {
              return "number" == typeof t && t >= e
                ? m(t)
                : h("a number greater than or equal to ".concat(e), t, n);
            };
          },
          L = function (e, t) {
            return function (n, r) {
              return n === e ? m(e) : h(t || String(e), n, r);
            };
          },
          D = function (e) {
            return function (t, n) {
              return "number" == typeof t &&
                t === parseInt(t, 10) &&
                (!e || t >= 0)
                ? m(t)
                : h(
                    e
                      ? "a positive amount in the currency's subunit"
                      : "an amount in the currency's subunit",
                    t,
                    n
                  );
            };
          },
          B = function (e, t) {
            return D(!1)(e, t);
          },
          q = function (e, t) {
            return D(!0)(e, t);
          },
          F = function (e, t) {
            return e && "object" == typeof e ? m(e) : h("an object", e, t);
          },
          U = function (e) {
            return function (t, n) {
              return Array.isArray(t)
                ? t
                    .map(function (t, r) {
                      return e(t, y(n, String(r)));
                    })
                    .reduce(function (e, t) {
                      return "error" === e.type
                        ? e
                        : "error" === t.type
                        ? t
                        : m(
                            [].concat((0, o.Z)(e.value), [t.value]),
                            [].concat(
                              (0, o.Z)(e.warnings),
                              (0, o.Z)(t.warnings)
                            )
                          );
                    }, m([]))
                : h("array", t, n);
            };
          },
          G = function (e) {
            return function (t) {
              return function (n, r) {
                if (Array.isArray(n)) {
                  var o = t(n, r);
                  if ("valid" === o.type)
                    for (var i = {}, c = 0; c < o.value.length; c += 1) {
                      var s = o.value[c];
                      if (
                        "object" == typeof s &&
                        s &&
                        "string" == typeof s[e]
                      ) {
                        var u = s[e],
                          l = "_".concat(u);
                        if (i[l])
                          return f(
                            new a.No(
                              "Duplicate value for "
                                .concat(e, ": ")
                                .concat(u, ". The property '")
                                .concat(e, "' of '")
                                .concat(r.path.join("."), "' has to be unique.")
                            )
                          );
                        i[l] = !0;
                      }
                    }
                  return o;
                }
                return h("array", n, r);
              };
            };
          },
          Y = function (e) {
            return function (t, n) {
              return void 0 === t
                ? m(void 0)
                : h("used in ".concat(e, " instead"), t, n);
            };
          },
          z = function (e) {
            return function (t) {
              return void 0 === t ? m(void 0) : f(new a.No(e));
            };
          },
          H = function (e) {
            return function (t) {
              return function (n, s) {
                if (n && "object" == typeof n && !Array.isArray(n)) {
                  var u = n,
                    l = (0, c.sE)(Object.keys(u), function (e) {
                      return !t[e];
                    });
                  if (l && e)
                    return f(
                      new a.No(
                        "Invalid "
                          .concat(s.label, " parameter: ")
                          .concat(
                            [].concat((0, o.Z)(s.path), [l]).join("."),
                            " is not an accepted parameter."
                          )
                      )
                    );
                  var p = Object.keys(u),
                    d = m({});
                  return (
                    l &&
                      (d = p.reduce(function (e, n) {
                        return t[n]
                          ? e
                          : m(
                              e.value,
                              [].concat((0, o.Z)(e.warnings), [
                                "Unrecognized "
                                  .concat(s.label, " parameter: ")
                                  .concat(
                                    [].concat((0, o.Z)(s.path), [n]).join("."),
                                    " is not a recognized parameter. This may cause issues with your integration in the future."
                                  ),
                              ])
                            );
                      }, d)),
                    Object.keys(t).reduce(function (e, n) {
                      if ("error" === e.type) return e;
                      var a = (0, t[n])(u[n], y(s, n));
                      return "valid" === a.type && void 0 !== a.value
                        ? m(
                            (0, i.Z)(
                              (0, i.Z)({}, e.value),
                              {},
                              (0, r.Z)({}, n, a.value)
                            ),
                            [].concat(
                              (0, o.Z)(e.warnings),
                              (0, o.Z)(a.warnings)
                            )
                          )
                        : "valid" === a.type
                        ? m(
                            e.value,
                            [].concat(
                              (0, o.Z)(e.warnings),
                              (0, o.Z)(a.warnings)
                            )
                          )
                        : a;
                    }, d)
                  );
                }
                return h("an object", n, s);
              };
            };
          },
          K = H(!0),
          J = H(!1),
          W = function (e, t, n, r) {
            var o = r || {},
              i = e(t, {
                authenticatedOrigin: o.authenticatedOrigin || "",
                element: o.element || "",
                label: n,
                path: o.path || [],
              });
            return "valid" === i.type || "full" === i.errorType
              ? i
              : {
                  type: "error",
                  errorType: "full",
                  error: new a.No(d(i.expected, i.actual, i.options)),
                };
          },
          V = function (e, t, n, r) {
            var o = W(e, t, n, r);
            switch (o.type) {
              case "valid":
                return { value: o.value, warnings: o.warnings };
              case "error":
                throw o.error;
              default:
                return (0, p.R)(o);
            }
          };
      },
      7030: function (e, t, n) {
        "use strict";
        n.d(t, {
          Kb: function () {
            return s;
          },
          Nb: function () {
            return p;
          },
          P0: function () {
            return d;
          },
          et: function () {
            return l;
          },
          tk: function () {
            return u;
          },
        });
        var r,
          o = n(6222),
          i = n(9083),
          a = n(276),
          c = n(755),
          s = "".concat(i.A2, "-input"),
          u = ("".concat(i.A2, "-inputAfter"), "".concat(i.A2, "-safariInput")),
          l = "StripeElement",
          p = ["ready", "focus", "blur", "escape", "change", "loaderstart"],
          d =
            ((r = {}),
            (0, o.Z)(
              r,
              a.Yj.linkAuthentication,
              c.NC.LINK_AUTHENTICATION_ELEMENT
            ),
            (0, o.Z)(r, a.Yj.payment, c.NC.PAYMENT_ELEMENT),
            (0, o.Z)(r, a.Yj.shippingAddress, c.NC.ADDRESS_ELEMENT),
            (0, o.Z)(r, a.Yj.address, c.NC.ADDRESS_ELEMENT),
            (0, o.Z)(
              r,
              a.Yj.autocompleteSuggestions,
              c.NC.AUTOCOMPLETE_SUGGESTIONS_ELEMENT
            ),
            (0, o.Z)(
              r,
              a.Yj.achBankSearchResults,
              c.NC.ACH_BANK_SEARCH_RESULTS_ELEMENT
            ),
            r);
      },
      9144: function (e, t, n) {
        "use strict";
        n.d(t, {
          KC: function () {
            return r;
          },
          ZS: function () {
            return o;
          },
        });
        var r = {
            margin: "0",
            padding: "0",
            border: "none",
            display: "block",
            background: "transparent",
            position: "relative",
            opacity: "1",
            clear: "both",
          },
          o = {
            border: "none",
            display: "block",
            position: "absolute",
            height: "1px",
            top: "-1px",
            left: "0",
            padding: "0",
            margin: "0",
            width: "100%",
            opacity: "0",
            background: "transparent",
            "pointer-events": "none",
            "font-size": "16px",
          };
      },
      5326: function (e, t, n) {
        "use strict";
        n.d(t, {
          $o: function () {
            return l;
          },
          Eo: function () {
            return d;
          },
          NO: function () {
            return u;
          },
          ct: function () {
            return m;
          },
          yn: function () {
            return p;
          },
        });
        var r = n(1873),
          o = n(276),
          i = n(6589),
          a = n(6977),
          c = n(3849),
          s = function (e) {
            switch (e.type) {
              case "error":
                return { error: e.error };
              case "object":
                switch (e.object.object) {
                  case "payment_intent":
                    return { paymentIntent: e.object };
                  case "setup_intent":
                    return { setupIntent: e.object };
                  default:
                    return (0, r.Rz)(e.object);
                }
              default:
                return (0, r.Rz)(e);
            }
          },
          u = function (e, t, n, r, i) {
            return t === o.kE.PAYMENT_INTENT
              ? n.action
                  .retrievePaymentIntent({
                    hosted: false,
                    intentSecret: e,
                    locale: r,
                    asErrorIfNotSucceeded: true,
                    expandParam: i || [],
                  })
                  .then(s)
              : n.action
                  .retrieveSetupIntent({
                    hosted: false,
                    intentSecret: e,
                    locale: r,
                    asErrorIfNotSucceeded: true,
                    expandParam: i || [],
                  })
                  .then(s);
          },
          l = function (e, t, n, r, i, a, c) {
            return t === o.kE.PAYMENT_INTENT
              ? n.action
                  .cancelPaymentIntentSource({
                    intentSecret: e,
                    locale: i,
                    sourceId: r,
                    sourceIntentId: a,
                    publishableKey: c,
                  })
                  .then(s)
              : n.action
                  .cancelSetupIntentSource({
                    intentSecret: e,
                    locale: i,
                    sourceId: r,
                    sourceIntentId: a,
                    publishableKey: c,
                  })
                  .then(s);
          },
          p = function (e) {
            return (
              (e.error
                ? e.error.payment_intent || e.error.setup_intent
                : e.paymentIntent || e.setupIntent) || null
            );
          },
          d = function (e, t, n, r, o, i) {
            var a,
              c = !0,
              s = 3,
              l = 0;
            return (
              (function d() {
                (l += 1),
                  u(e, t, n, r, o).then(function (e) {
                    if (c) {
                      var t = p(e);
                      if (null !== t)
                        switch (((s = 3), t.status)) {
                          case "requires_action":
                          case "requires_source_action":
                            return void (a = setTimeout(d, 5e3));
                          case "processing":
                            return void (a = setTimeout(d, 1e3));
                          default:
                            i(e, l);
                        }
                      else if (s > 0) {
                        var n = 500 * Math.pow(2, 3 - s);
                        (a = setTimeout(d, n)), (s -= 1);
                      } else i(e, l);
                    }
                  });
              })(),
              function () {
                clearTimeout(a), (c = !1);
              }
            );
          },
          m = function (e) {
            var t = e.initialDelay,
              n = e.pollTimeGap,
              r = e.checkIntent,
              o = e.locale,
              u = e.controller,
              l = e.intent,
              p = e.expandParam,
              d = void 0 === p ? [] : p,
              m = e.shouldPoll,
              f =
                void 0 === m
                  ? function () {
                      return !0;
                    }
                  : m,
              _ =
                "payment_intent" === l.object
                  ? { paymentIntent: l }
                  : { setupIntent: l };
            return new i.J(function (e) {
              setTimeout(function () {
                var t = setInterval(function () {
                  if (!f()) return e(_), void clearInterval(t);
                  var n;
                  ((n = {
                    hosted: !1,
                    intentSecret: (0, a.O3)(l),
                    locale: o,
                    expandParam: d,
                  }),
                  "payment_intent" === l.object
                    ? u.action.retrievePaymentIntent(n)
                    : u.action.retrieveSetupIntent(n)).then(function (n) {
                    (_ = s(n)),
                      n.error
                        ? (u.action
                            .localizeError(c.I4)
                            .then(function (e) {
                              return { error: e };
                            })
                            .then(e),
                          clearInterval(t))
                        : r(n.object) && (e(_), clearInterval(t));
                  });
                }, n);
              }, t - n);
            });
          };
      },
      8147: function (e, t, n) {
        "use strict";
        n.d(t, {
          z: function () {
            return s;
          },
        });
        var r = n(6589),
          o = n(3849),
          i = n(755),
          a = n(9792),
          c = function (e) {
            return e
              ? "payment_intent" === e.object
                ? e.last_payment_error
                : e.last_setup_error
              : null;
          },
          s = function (e, t, n, s) {
            return new r.J(function (r) {
              var u = new a.E(),
                l = n.createLightboxFrame({
                  type: i.NC.HCAPTCHA_APP,
                  options: {
                    intentId: t.id,
                    clientSecret: t.client_secret,
                    locale: s,
                    sitekey: e.site_key,
                    verifyUrl: e.verification_url,
                    startTime: u.getAsPosixTime(),
                  },
                }),
                p = function (e) {
                  var t = o.I4;
                  return (
                    null != e && (t = e),
                    n.action.localizeError(t).then(function (e) {
                      return { error: e };
                    })
                  );
                };
              n.report("intent_confirmation_challenge.start"),
                l._on("load", function () {
                  n.report(
                    "intent_confirmation_challenge.stripe_js_frame_loaded",
                    { duration_since_start_ms: u.getElapsedTime() }
                  ),
                    l.fadeInBackdrop();
                }),
                l.show(),
                l._on("request-cancel", function (e) {
                  l.fadeOutBackdrop(),
                    l.destroy(!0),
                    n.report("intent_confirmation_challenge.cancel"),
                    r(p(c(null == e ? void 0 : e.intent)));
                }),
                l._on("request-close", function (e) {
                  l.fadeOutBackdrop(), l.destroy(!0);
                  var t = null == e ? void 0 : e.intent;
                  if (t) {
                    var i = c(t);
                    i
                      ? /Captcha/.test(i.message || "")
                        ? (n.report(
                            "intent_confirmation_challenge.verification_failed"
                          ),
                          r(p(i)))
                        : (n.report("intent_confirmation_challenge.success"),
                          r(p(i)))
                      : (n.report("intent_confirmation_challenge.success"),
                        (function (e, t) {
                          "payment_intent" === t.object
                            ? e({ paymentIntent: t })
                            : e({ setupIntent: t });
                        })(r, t));
                  } else n.report("intent_confirmation_challenge.verification_error"), r(p(o.I4));
                });
            });
          };
      },
      6790: function (e, t, n) {
        "use strict";
        n.d(t, {
          e: function () {
            return a;
          },
          k: function () {
            return i;
          },
        });
        var r = n(1849),
          o = n(6977),
          i = function (e, t, n) {
            return (0, r.U)(t).then(function (t) {
              return (0, r.d)(n, "next_action redirect", t), (0, o.PA)(t, e);
            });
          },
          a = function (e, t, n) {
            return (0, r.U)(t).then(function (t) {
              return (0, r.d)(n, "next_action redirect", t), (0, o.e3)(t, e);
            });
          };
      },
      122: function (e, t, n) {
        "use strict";
        n.d(t, {
          s: function () {
            return l;
          },
        });
        var r = n(7904),
          o = n(8489),
          i = n(1002),
          a = n(755),
          c = n(6589),
          s = n(5326),
          u = n(9792),
          l = function (e, t, n, l, p, d) {
            var m = (0, i.xz)(),
              f = new u.E(),
              _ = (function (e, t, n, r, i) {
                return e.createLightboxFrame({
                  type: a.NC.AUTHORIZE_WITH_URL,
                  options: (0, o.Z)(
                    { url: t, locale: i, intentId: n },
                    r ? { source: r } : {}
                  ),
                });
              })(l, e.url, t.id, e.source, p);
            return (
              _.show(),
              l.report("authorize_with_url.loading", {
                viewport: m,
                intentId: t.id,
              }),
              _._on("load", function () {
                l.report("authorize_with_url.loaded", {
                  loadDuration: f.getElapsedTime(),
                  intentId: t.id,
                }),
                  _.fadeInBackdrop();
              }),
              _._on("challenge_complete", function () {
                _.fadeOutBackdrop();
              }),
              new c.J(function (o) {
                var i = e.source;
                i &&
                  _._once("cancel", function () {
                    c.J.all([(0, s.$o)(t, n, l, i, p), _.destroy()]).then(
                      function (e) {
                        var t = (0, r.Z)(e, 1)[0];
                        return o(t);
                      }
                    );
                  }),
                  _._once("authorize_with_url_done", function () {
                    var e = _.destroy();
                    (0, s.Eo)(t, n, l, p, d, function (n, r) {
                      e.then(function () {
                        l.report("authorize_with_url.done", {
                          shownDuration: f.getElapsedTime(),
                          success: !("error" in n),
                          intentId: t.id,
                          iterations: r,
                        }),
                          o(n);
                      });
                    });
                  });
              })
            );
          };
      },
      7193: function (e, t, n) {
        "use strict";
        n.d(t, {
          A: function () {
            return F;
          },
        });
        var r = n(7904),
          o = n(6589),
          i = n(1873),
          a = n(9792),
          c = n(8489),
          s = n(508),
          u = n(755),
          l = function (e, t) {
            var n = t.intentSecret,
              r = t.controller,
              i = t.locale,
              a = t.hosted,
              c = r.createLightboxFrame({
                type: u.NC.STRIPE_3DS2_CHALLENGE,
                options: { intentId: n.id, hosted: a, locale: i },
              });
            r.report("3ds2.challenge_frame.loading", {
              intentId: n.id,
              hosted: a,
            }),
              c._on("challenge_complete", function () {
                c.fadeOutBackdrop();
              });
            var s = (function (e) {
              return new o.J(function (t) {
                e._on("load", function () {
                  return t(e);
                });
              });
            })(c);
            return (
              s.then(function () {
                return r.report("3ds2.challenge_frame.loaded", {
                  intentId: n.id,
                  hosted: a,
                });
              }),
              a &&
                (c.show(),
                c.action.show3DS2Spinner({ cardBrand: e.cardBrand })),
              s
            );
          },
          p = function (e, t) {
            var n = t.oneClickAuthnDeviceSupport,
              r = t.oneClickAuthnOptedOut,
              i = t.challengeFrame;
            return new o.J(function (t, o) {
              i.then(function (i) {
                var a = function () {
                  return o(new Error("User canceled"));
                };
                i._once("cancel", a),
                  i.isVisible || (i.show(), i.fadeInBackdrop());
                e.type;
                var l = e.optimizations,
                  p =
                    (e.oneClickAuthn,
                    (0, s.Z)(e, ["type", "optimizations", "oneClickAuthn"]));
                i.action
                  .perform3DS2Challenge(
                    (0, c.Z)(
                      (0, c.Z)({}, p),
                      {},
                      {
                        shouldSandbox: l.sandboxChallengeFrame,
                        recordFinalCres: l.recordFinalCres,
                        oneClickAuthnDeviceSupport: n,
                        oneClickAuthnOptedOut: r,
                        oneClickWebauthnEnrollmentAppUrl: (0, u.xS)(
                          "one-click-webauthn-enrollment-1549a9812f55dcc9126e78d768a4416e.html"
                        ),
                      }
                    )
                  )
                  .then(function () {
                    i._off("cancel", a), t();
                  });
              });
            });
          },
          d = n(5326),
          m = n(6222),
          f = function (e) {
            if (!e || "object" != typeof e || (!e.type && !e.code)) return e;
            var t = function (t) {
              return e[t] && "string" == typeof e[t]
                ? (0, m.Z)({}, "".concat(t, "_id"), e[t])
                : e[t] && "object" == typeof e[t] && "string" == typeof e[t].id
                ? (0, m.Z)({}, "".concat(t, "_id"), e[t].id)
                : null;
            };
            return (0, c.Z)(
              (0, c.Z)(
                (0, c.Z)(
                  (0, c.Z)(
                    { type: e.type, code: e.code, param: e.param },
                    t("payment_intent")
                  ),
                  t("setup_intent")
                ),
                t("payment_method")
              ),
              t("source")
            );
          },
          _ = function (e, t, n) {
            var r = t.intentSecret,
              o = t.intentType,
              i = t.controller,
              a = t.locale;
            return (0, d.NO)(r, o, i, a, n);
          },
          h = function (e, t) {
            var n = t.controller,
              r = t.intentSecret,
              o = t.intentType,
              i = t.locale;
            return (0, d.$o)(
              r,
              o,
              n,
              e.threeDS2Source,
              i,
              e.threeDS2Intent,
              e.publishableKey
            );
          },
          y = function (e, t) {
            var n = e.intentSecret,
              i = e.controller,
              a = e.hosted,
              s = t.intent,
              u = t.challengeFrame,
              l = t.startTimestamp;
            return o.J.all([
              s,
              u.then(function (e) {
                return e.destroy();
              }),
            ]).then(function (e) {
              var t = (0, r.Z)(e, 1)[0];
              return (
                i.report(
                  "3ds2.done",
                  (0, c.Z)(
                    {
                      intentId: n.id,
                      hosted: a,
                      totalDuration: l.getElapsedTime(),
                    },
                    t.error
                      ? { error: f(t.error), success: !1 }
                      : { success: !0 }
                  )
                ),
                t
              );
            });
          },
          v = function (e) {
            var t = e.intentSecret,
              n = e.controller,
              r = e.hosted,
              i = e.locale,
              a = n.createHiddenFrame(u.NC.STRIPE_3DS2_FINGERPRINT, {
                intentId: t.id,
                locale: i,
                hosted: r,
              });
            n.report("3ds2.fingerprint_frame.loading", {
              hosted: r,
              intentId: t.id,
            });
            var c = (function (e) {
              return new o.J(function (t) {
                e._on("load", function () {
                  return t(e);
                });
              });
            })(a);
            return (
              c.then(function () {
                n.report("3ds2.fingerprint_frame.loaded", {
                  hosted: r,
                  intentId: t.id,
                });
              }),
              c
            );
          },
          g = function (e, t) {
            var n = t.intentSecret,
              r = t.controller,
              i = t.hosted;
            return e.optimizations.skipFingerprint
              ? o.J.resolve({ fingerprintAttempted: !1, fingerprintData: null })
              : "" === e.methodUrl
              ? (r.report("3ds2.fingerprint.no_method_url", {
                  hosted: i,
                  intentId: n.id,
                }),
                o.J.resolve({
                  fingerprintAttempted: !1,
                  fingerprintData: null,
                }))
              : v(t).then(function (t) {
                  return t.action
                    .perform3DS2Fingerprint({
                      threeDS2Source: e.threeDS2Source,
                      merchant: e.merchant,
                      transactionId: e.transactionId,
                      methodUrl: e.methodUrl,
                      shouldSandbox: e.optimizations.sandboxFingerprintFrame,
                    })
                    .then(function (e) {
                      return t.destroy(), e;
                    });
                });
          },
          b = n(9294),
          w = function () {
            if (
              void 0 === window.PublicKeyCredential ||
              (function () {
                if (!/CrOS/i.test(window.navigator.userAgent)) return !1;
                var e =
                    window.navigator.userAgent.match(
                      /Chrome\/\d+\.\d+\.(\d+)\.(\d+)/
                    ) || [],
                  t = Number(e[1]),
                  n = Number(e[2]);
                return !(
                  (4389 === t && n >= 82) ||
                  (4430 === t && n >= 11) ||
                  t >= 4431
                );
              })() ||
              (function () {
                var e = /iPad|iPhone/i.test(window.navigator.userAgent),
                  t =
                    /^((?!chrome|android).)*safari/i.test(
                      window.navigator.userAgent
                    ) && !/SamsungBrowser/.test(window.navigator.userAgent);
                if (!e || t) return !1;
                var n =
                    window.navigator.userAgent.match(
                      /OS (\d+)_(\d+)(_\d+)? like Mac OS X/
                    ) || [],
                  r = parseInt(n[1], 10),
                  o = parseInt(n[2], 10);
                return (
                  !isNaN(r) && !isNaN(o) && ((15 === r && o >= 4) || r > 15)
                );
              })()
            )
              return o.J.resolve(!1);
            var e =
                window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(),
              t = new o.J(function (e) {
                return setTimeout(function () {
                  return e(!1);
                }, 500);
              });
            return o.J.race([e, t]).catch(function () {
              return !1;
            });
          },
          k = function () {
            if (void 0 === window.PaymentRequest) return o.J.resolve(!1);
            if (!/Chrome\/(9[5-9]|[1-9]\d\d)/.test(window.navigator.userAgent))
              return o.J.resolve(!1);
            try {
              var e = [
                {
                  supportedMethods: "secure-payment-confirmation",
                  data: {
                    action: "authenticate",
                    credentialIds: [new Uint8Array(1)],
                    challenge: new Uint8Array(1),
                    fallbackUrl: window.location,
                    rpId: "stripe.com",
                    payeeOrigin: "https://stripe.com",
                    instrument: {
                      displayName: "Mock ····1234",
                      icon: 'data:image/svg+xml;utf8,<svg width="28" height="18" xmlns="http://www.w3.org/2000/svg"></svg>',
                    },
                  },
                },
              ];
              return new window.PaymentRequest(e, {
                total: {
                  label: "Total",
                  amount: { currency: "USD", value: "0" },
                },
              })
                .canMakePayment()
                .catch(function () {
                  return !1;
                });
            } catch (e) {
              return o.J.resolve(!1);
            }
          },
          E = "stripe-js-one-click-authn",
          S = "W",
          P = "S",
          A = "SE/WA",
          C = function (e) {
            return btoa(String.fromCharCode.apply(null, new Uint8Array(e)))
              .replace(/\+/g, "-")
              .replace(/\//g, "_")
              .replace(/=/g, "");
          },
          N = function (e) {
            return atob(e.replace(/-/g, "+").replace(/_/g, "/"));
          },
          I = function (e) {
            var t = N(e);
            return Uint8Array.from(t, function (e) {
              return e.charCodeAt(0);
            });
          },
          T =
            (n(3637),
            n(3407),
            n(8037),
            function (e) {
              return "data:image/svg+xml,".concat(
                encodeURIComponent(e.replace(/\n/g, "").replace(/\s+/g, " "))
              );
            }),
          M = function (e) {
            switch (e) {
              case "visa":
                return T(
                  '<svg width="28" height="18" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg">\n  <g fill-rule="nonzero" fill="none">\n    <rect\n      stroke-opacity=".2"\n      stroke="#000"\n      stroke-width=".5"\n      fill="#FFF"\n      x=".3"\n      y=".3"\n      width="23.5"\n      height="15.5"\n      rx="2"\n    />\n    <path\n      d="M2.8 6c-.5-.4-1.1-.6-1.8-.8h2.8c.3 0 .6 0 .7.4l.6 2.9.2.8L7 5.1h1.8L6 11.3H4.3L2.8 5.9Zm7.3 5.3H8.4l1-6.2h1.8L10 11.3Zm6.2-6L16 6.6H16a3 3 0 0 0-1.3-.3c-.7 0-1 .3-1 .5 0 .3.4.5 1 .8 1 .4 1.4 1 1.4 1.7 0 1.2-1.2 2-3 2-.7 0-1.4 0-1.8-.3l.2-1.3h.2c.6.3 1 .4 1.6.4.5 0 1-.2 1-.6 0-.3-.2-.5-.8-.8-.7-.3-1.5-.8-1.5-1.7 0-1.2 1.2-2 2.8-2 .7 0 1.2.1 1.6.3ZM18.5 9H20l-.4-1.8v-.5l-.3.6-.7 1.7Zm2.1-4 1.4 6.2h-1.6l-.2-1H18l-.3 1h-1.8l2.5-5.7c.2-.4.5-.5 1-.5h1.2Z"\n      fill="#1434CB"\n    />\n  </g>\n</svg>'
                );
              case "amex":
                return T(
                  '<svg width="28" height="18" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg">\n  <g fill="none" fill-rule="evenodd">\n    <rect fill="#016fd0" height="16" rx="2" width="24" />\n    <path\n      d="M13.8 13.4V7.7h10.1v1.6l-1.2 1.2 1.2 1.3v1.6H22l-1-1.1-1 1.1z"\n      fill="#fffffe"\n    />\n    <path\n      d="M14.4 12.8V8.3h3.8v1h-2.5v.7h2.5v1h-2.5v.7h2.5v1zM18.2 12.8l2-2.3-2-2.2h1.6l1.3 1.4 1.3-1.4h1.5l-2 2.2 2 2.2h-1.6l-1.2-1.4-1.3 1.5z"\n      fill="#016fd0"\n    />\n    <path\n      d="M14.2 2.6h2.5l.8 2v-2h3l.6 1.5.5-1.5H24v5.7H11.7z"\n      fill="#fffffe"\n    />\n    <g fill="#016fd0">\n      <path d="m14.7 3.3-2 4.4h1.4l.4-.9h2l.3.9h1.4l-2-4.4zm.2 2.5.6-1.4.6 1.4zM18.2 7.7V3.3h2L21 6l1-2.7h1.8v4.4h-1.2v-3l-1 3h-1.2l-1-3v3z" />\n    </g>\n  </g>\n</svg>'
                );
              case "mastercard":
                return T(
                  '<svg width="28" height="18" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg">\n  <g fill="none" fill-rule="evenodd">\n    <rect fill="#252525" height="16" rx="2" width="24" />\n    <circle cx="9" cy="8" fill="#eb001b" r="5" />\n    <circle cx="15" cy="8" fill="#f79e1b" r="5" />\n    <path d="M12 4a5 5 0 0 1 0 8 5 5 0 0 1 0-8z" fill="#ff5f00" />\n  </g>\n</svg>'
                );
              case "unionpay":
              case "discover":
              case "jcb":
              case "diners":
              case "unknown":
              case "elo":
                return T(
                  '<svg width="28" height="18" xmlns="http://www.w3.org/2000/svg"></svg>'
                );
              default:
                return (0, i.Rz)(e);
            }
          },
          j = n(7412),
          O = n(6977),
          R = function (e, t, n) {
            var r = e.threeDS2Source,
              i = e.oneClickAuthn,
              a = t.controller,
              s = n.deviceSupport,
              u = n.startTimestamp,
              l = o.J.resolve({ authenticationAPIParam: null, optedOut: !1 });
            if (!i) return l;
            var p,
              d = i.credentials.filter(function (e) {
                return e.type === O.QS;
              });
            if (0 === d.length)
              return (
                a.report(
                  "one_click_authn.request_spc_authn.empty_credentials_list",
                  { client_id: E, source: r, device_support: s }
                ),
                l
              );
            try {
              var m = i.merchant.origin;
              if (!m)
                return (
                  a.report(
                    "one_click_authn.request_spc_authn.empty_merchant_origin",
                    { client_id: E, source: r, device_support: s }
                  ),
                  l
                );
              ((p = document.createElement("meta")).name = (0, j.To)(
                "__privateStripeMeta"
              )),
                (p.httpEquiv = "origin-trial"),
                (p.content =
                  "A9jhYwXRO3NPiLnZACCEXhtcpa/gzahH22dbcaOg/v0c8pngXUXu3XXoUzfa6LUumuJiS12jQS7azQx3rZdh8ggAAAB6eyJvcmlnaW4iOiJodHRwczovL2pzLnN0cmlwZS5jb206NDQzIiwiZmVhdHVyZSI6IlNlY3VyZVBheW1lbnRDb25maXJtYXRpb25PcHRPdXQiLCJleHBpcnkiOjE2NzU4MTQzOTksImlzVGhpcmRQYXJ0eSI6dHJ1ZX0="),
                document.head.appendChild(p);
              var f = new window.PaymentRequest(
                (function (e, t, n) {
                  var r = n.authenticationChallenge,
                    o = n.instrument,
                    i = o.cardBrand,
                    a = o.cardName,
                    c = o.cardLast4,
                    s = n.merchant;
                  return [
                    {
                      supportedMethods: "secure-payment-confirmation",
                      data: {
                        action: "authenticate",
                        rpId: "stripe.com",
                        credentialIds: e.map(function (e) {
                          return I(e.id);
                        }),
                        challenge: I(r),
                        timeout: 6e4,
                        fallbackUrl: window.location.toString(),
                        instrument: {
                          displayName: "".concat(a, " ····").concat(c),
                          icon: M(i),
                        },
                        payeeOrigin: t,
                        payeeName: s.name,
                        showOptOut: !0,
                      },
                    },
                  ];
                })(d, m, i),
                { total: { label: "Total", amount: i.amount } }
              );
              return (
                a.report("one_click_authn.request_spc_authn.prompted", {
                  client_id: E,
                  source: r,
                  timeToComplete: u.getElapsedTime(),
                  device_support: s,
                }),
                f
                  .show()
                  .then(function (e) {
                    var t;
                    return (
                      e.complete("success"),
                      a.report("one_click_authn.request_spc_authn.completed", {
                        client_id: E,
                        source: r,
                        timeToComplete: u.getElapsedTime(),
                        device_support: s,
                      }),
                      {
                        authenticationAPIParam: {
                          type: O.QS,
                          assertion:
                            ((t = e.details),
                            {
                              type: "public-key",
                              id: t.id,
                              raw_id: t.id,
                              response: {
                                authenticator_data: C(
                                  t.response.authenticatorData
                                ),
                                client_data_json: C(t.response.clientDataJSON),
                                signature: C(t.response.signature),
                              },
                            }),
                          payment_data: {
                            merchant_data: {
                              merchant_origin: m,
                              total: i.amount,
                            },
                            network_data: i.authenticationChallenge,
                          },
                        },
                        optedOut: !1,
                      }
                    );
                  })
                  .catch(function (e) {
                    if (
                      (function (e) {
                        return (
                          "AbortError" === e.name &&
                          -1 !== e.message.indexOf("opted out")
                        );
                      })(e)
                    )
                      return (
                        a.report(
                          "one_click_authn.request_spc_authn.opted_out",
                          {
                            client_id: E,
                            source: r,
                            timeToOptedOut: u.getElapsedTime(),
                            device_support: s,
                          }
                        ),
                        o.J.resolve({
                          authenticationAPIParam: null,
                          optedOut: !0,
                        })
                      );
                    var t =
                      {
                        AbortError: "request_aborted",
                        InvalidStateError: "payment_already_shown",
                        NotSupportedError: "payment_method_not_supported",
                        SecurityError: "security_error",
                      }[e.name] || "unexpected_error";
                    return (
                      a.report("one_click_authn.request_spc_authn.error", {
                        reason: t,
                        client_id: E,
                        source: r,
                        timeToError: u.getElapsedTime(),
                        device_support: s,
                        error: (0, c.Z)(
                          { name: e.name, message: e.message },
                          e
                        ),
                      }),
                      l
                    );
                  })
              );
            } catch (e) {
              a.report("one_click_authn.request_spc_authn.error", {
                client_id: E,
                reason: "unexpected_error",
                source: r,
                timeToError: u.getElapsedTime(),
                device_support: s,
                error: (0, c.Z)({ name: e.name, message: e.message }, e),
              });
            }
            return l;
          },
          Z = function (e, t, n) {
            var r = t.controller,
              i = n.deviceSupport,
              a = n.challengeFrame,
              c = n.startTimestamp,
              s = e.oneClickAuthn;
            if (!s) return o.J.resolve(null);
            var l = (function (e) {
                var t = e.spcEligible,
                  n = e.configurationType;
                return t && (n === P || n === A);
              })(i)
                ? O.QS
                : O.LD,
              p = s.credentials.filter(function (e) {
                return e.type === l;
              });
            return 0 === p.length
              ? (r.report(
                  "one_click_authn.request_webauthn_authn.empty_credentials_list",
                  { client_id: E, source: e.threeDS2Source, device_support: i }
                ),
                o.J.resolve(null))
              : new o.J(function (t, n) {
                  a.then(function (r) {
                    var o = function () {
                      return n(new Error("User canceled"));
                    };
                    r._once("cancel", o),
                      r.isVisible || (r.show(), r.fadeInBackdrop());
                    var a = {
                      amount: s.amount,
                      instrument: s.instrument,
                      merchant: s.merchant,
                      authenticationChallenge: s.authenticationChallenge,
                      layout: s.layout,
                      allowCredentials: p,
                    };
                    return r.action
                      .performOneClickWebauthnAuthentication({
                        threeDS2Source: e.threeDS2Source,
                        cardBrand: e.cardBrand,
                        appUrl: (0, u.xS)(
                          "one-click-webauthn-authentication-5ed8cdaa4b3728b1d06f7d5de55b474d.html"
                        ),
                        deviceSupport: i,
                        payload: a,
                        startPosixTime: c.getAsPosixTime(),
                      })
                      .then(function (e) {
                        r._off("cancel", o), t(e);
                      });
                  });
                });
          },
          x = function (e, t) {
            var n = e.threeDS2Source,
              r = e.oneClickAuthn,
              o = t.controller;
            if (!r) return null;
            var i = b.s$
              ? "safari"
              : b.D1
              ? "firefox"
              : b.P0 || b.Bh
              ? "edge"
              : b.G9
              ? b.sV
                ? "chrome_android"
                : /Chrome\/10[4-9]/.test(window.navigator.userAgent)
                ? "chrome_in_opt_out_trial"
                : "chrome"
              : null;
            if (!i)
              return (
                o.report("one_click_authn.configuration.error", {
                  client_id: E,
                  reason: "browser_not_found",
                  source: n,
                }),
                null
              );
            try {
              switch (new URLSearchParams(N(r.configuration)).get(i)) {
                case S:
                  return S;
                case P:
                  return P;
                case A:
                  return A;
                default:
                  return null;
              }
            } catch (e) {
              return (
                o.report("one_click_authn.configuration.error", {
                  client_id: E,
                  reason: "unexpected_error",
                  source: n,
                  error: (0, c.Z)({ name: e.name, message: e.message }, e),
                }),
                null
              );
            }
          },
          L = function () {
            try {
              return (
                0 ===
                "https://js.stripe.com/v3/".indexOf(window.top.location.origin)
              );
            } catch (e) {
              return !1;
            }
          },
          D = function () {
            var e = document.featurePolicy;
            if (!e) return !1;
            try {
              return (
                -1 !== e.allowedFeatures().indexOf("publickey-credentials-get")
              );
            } catch (e) {
              return !1;
            }
          },
          B = function (e, t) {
            return o.J.all([k(), w()]).then(function (n) {
              var o = (0, r.Z)(n, 2),
                i = o[0],
                a = o[1];
              return {
                sameOriginFrame: L(),
                spcEligible: i,
                webauthnEligible: a,
                publickeyCredentialsGetAllowed: D(),
                configurationType: x(e, t),
              };
            });
          },
          q = function (e, t, n) {
            var r = n.challengeFrame,
              o = n.startTimestamp;
            return B(e, t).then(function (n) {
              return (
                (a = (i = n).webauthnEligible),
                (c = i.configurationType),
                !a || (c !== S && c !== A)
                  ? (function (e) {
                      var t = e.spcEligible,
                        n = e.configurationType;
                      return t && n === P;
                    })(n)
                    ? R(e, t, { deviceSupport: n, startTimestamp: o }).then(
                        function (e) {
                          var t = e.authenticationAPIParam,
                            r = e.optedOut;
                          return {
                            deviceSupport: n,
                            authenticationAPIParam: t,
                            optedOut: r,
                          };
                        }
                      )
                    : {
                        deviceSupport: n,
                        authenticationAPIParam: null,
                        optedOut: !1,
                      }
                  : Z(e, t, {
                      deviceSupport: n,
                      challengeFrame: r,
                      startTimestamp: o,
                    }).then(function (e) {
                      return {
                        deviceSupport: n,
                        authenticationAPIParam: e,
                        optedOut: !1,
                      };
                    })
              );
              var i, a, c;
            });
          },
          F = function (e, t, n) {
            var c = new a.E(),
              s = l(e, t);
            switch (e.type) {
              case "3ds2-challenge":
                return B(e, t).then(function (r) {
                  return p(e, {
                    oneClickAuthnDeviceSupport: r,
                    oneClickAuthnOptedOut: !1,
                    challengeFrame: s,
                  }).then(
                    function () {
                      return y(t, {
                        intent: _(0, t, n),
                        challengeFrame: s,
                        startTimestamp: c,
                      });
                    },
                    function () {
                      return y(t, {
                        intent: h(e, t),
                        challengeFrame: s,
                        startTimestamp: c,
                      });
                    }
                  );
                });
              case "3ds2-fingerprint":
                return o.J.all([
                  g(e, t),
                  q(e, t, { challengeFrame: s, startTimestamp: c }),
                ])
                  .then(function (n) {
                    var i = (0, r.Z)(n, 2),
                      a = i[0],
                      c = i[1];
                    return (function (e, t, n) {
                      var r = n.fingerprintResult,
                        o = n.oneClickAuthn,
                        i = t.controller,
                        a = t.hosted,
                        c = t.intentSecret;
                      return (
                        i.report("3ds2.authenticate", {
                          hosted: a,
                          intentId: c.id,
                        }),
                        i.action
                          .authenticate3DS2({
                            threeDS2Source: e.threeDS2Source,
                            outerWindowWidth: window.innerWidth,
                            hosted: a,
                            fingerprintResult: r,
                            oneClickAuthnDeviceSupportAPIParam: {
                              hosted: a,
                              same_origin_frame:
                                o.deviceSupport.sameOriginFrame,
                              spc_eligible: o.deviceSupport.spcEligible,
                              webauthn_eligible:
                                o.deviceSupport.webauthnEligible,
                              publickey_credentials_get_allowed:
                                o.deviceSupport.publickeyCredentialsGetAllowed,
                            },
                            oneClickAuthnAuthenticationAPIParam:
                              o.authenticationAPIParam,
                            publishableKey: e.publishableKey,
                          })
                          .then(function (e) {
                            return (
                              "error" === e.type
                                ? i.report("3ds2.authenticate.error", {
                                    error: e.error,
                                    hosted: a,
                                    intentId: c.id,
                                  })
                                : i.report("3ds2.authenticate.success", {
                                    hosted: a,
                                    intentId: c.id,
                                  }),
                              e
                            );
                          })
                      );
                    })(e, t, { fingerprintResult: a, oneClickAuthn: c }).then(
                      function (n) {
                        return (function (e, t, n) {
                          var r = n.authenticateResponse,
                            i = n.oneClickAuthnDeviceSupport,
                            a = n.oneClickAuthnOptedOut,
                            c = n.challengeFrame,
                            s = t.controller,
                            u = t.hosted,
                            l = t.intentSecret;
                          if ("error" === r.type) return o.J.resolve();
                          var d = r.object,
                            m = d.state,
                            f = d.ares,
                            _ = d.creq;
                          return "delegated" === m || null === f
                            ? o.J.resolve()
                            : "C" !== f.transStatus || null == _
                            ? (s.report("3ds2.frictionless", {
                                hosted: u,
                                intentId: l.id,
                              }),
                              o.J.resolve())
                            : p(
                                {
                                  type: "3ds2-challenge",
                                  threeDS2Source: e.threeDS2Source,
                                  cardBrand: e.cardBrand,
                                  transactionId: e.transactionId,
                                  acsUrl: f.acsURL,
                                  acsTransactionId: f.acsTransID,
                                  optimizations: e.optimizations,
                                  oneClickAuthn: e.oneClickAuthn,
                                  creq: _,
                                  publishableKey: e.publishableKey,
                                },
                                {
                                  oneClickAuthnDeviceSupport: i,
                                  oneClickAuthnOptedOut: a,
                                  challengeFrame: c,
                                }
                              );
                        })(e, t, {
                          authenticateResponse: n,
                          oneClickAuthnDeviceSupport: c.deviceSupport,
                          oneClickAuthnOptedOut: c.optedOut,
                          challengeFrame: s,
                        });
                      }
                    );
                  })
                  .then(
                    function () {
                      return y(t, {
                        intent: _(0, t, n),
                        challengeFrame: s,
                        startTimestamp: c,
                      });
                    },
                    function () {
                      return y(t, {
                        intent: h(e, t),
                        challengeFrame: s,
                        startTimestamp: c,
                      });
                    }
                  );
              default:
                return (0, i.Rz)(e);
            }
          };
      },
      112: function (e, t, n) {
        "use strict";
        n.d(t, {
          $j: function () {
            return _;
          },
          Qw: function () {
            return h;
          },
        });
        var r = n(508),
          o = n(8489),
          i = n(1765),
          a = n(2024),
          c = n(1873),
          s = n(3849),
          u = n(8812),
          l = {
            clientSecret: (0, c.jt)(c.Z_),
            redirect: (0, c.jt)((0, c.kw)("always", "if_required")),
            confirmParams: (0, c.jt)(c.Ry),
            handleActions: (0, c.jt)(c.Xg),
          },
          p = (0, o.Z)((0, o.Z)({}, l), {}, { element: (0, c.jt)(c.Ry) }),
          d = (0, o.Z)((0, o.Z)({}, l), {}, { elements: (0, c.jt)(c.Ry) }),
          m = {
            "stripe.confirmPayment()": {
              link: "https://stripe.com/docs/js/payment_intents/payment_method",
              action: "Payment",
            },
            "stripe.confirmSetup()": {
              link: "https://stripe.com/docs/js/setup_intents/payment_method",
              action: "Setup",
            },
          },
          f = function (e, t, n) {
            var r = t.rawSecret,
              o = t.rawElement,
              s = t.rawElements,
              l = t.rawHandleActions,
              p = t.rawRedirect,
              d = t.validatedConfirmParams;
            if ((0, i.uN)(e, i.M4.payment_element_beta_1)) {
              var f = (0, c.rX)(o);
              if (!f)
                throw new u.No(
                  "Invalid value for "
                    .concat(
                      n,
                      ": `element` should be a Payment Element. You specified: "
                    )
                    .concat(typeof o, ".")
                );
              return { type: "elements", element: f };
            }
            if (
              ((function (e, t) {
                var n = e.rawSecret,
                  r = e.rawElements;
                if (n && r)
                  throw new u.No(
                    "".concat(
                      t,
                      ": expected either `elements` or `clientSecret`, but not both."
                    )
                  );
                if (!n && !r)
                  throw new u.No(
                    "".concat(
                      t,
                      ": expected either `elements` or `clientSecret`, but got neither."
                    )
                  );
              })({ rawElements: s, rawSecret: r }, n),
              p && !1 === l)
            )
              throw new u.No(
                "".concat(
                  n,
                  ": `redirect` not applicable when `handleActions` is false."
                )
              );
            if (r) {
              if (
                (null == d ? void 0 : d.payment_method) &&
                (null == d ? void 0 : d.payment_method_data)
              )
                throw new u.No(
                  "".concat(
                    n,
                    ": Expected either `payment_method` or `payment_method_data`, but not both."
                  )
                );
              return { type: "clientSecret", clientSecret: r };
            }
            var _ = (0, c.MO)(s);
            if (!_)
              throw new u.No(
                "Invalid value for "
                  .concat(
                    n,
                    ": elements should be an Elements group. You specified: "
                  )
                  .concat(typeof s, ".")
              );
            var h = (0, a.sE)(_._elements, function (e) {
              return "payment" === e._componentName;
            });
            if (!h)
              throw new u.No(
                "Invalid value for "
                  .concat(
                    n,
                    ": elements should have a mounted Payment Element. "
                  )
                  .concat(
                    (function (e, t) {
                      if (e && m[t]) {
                        var n = m[t],
                          r = n.link,
                          o = n.action;
                        return "It looks like you have other Elements on the page. Refer to "
                          .concat(r, " to confirm a ")
                          .concat(o, " Intent by payment method.");
                      }
                      return "";
                    })(!!_._elements.length, n)
                  )
              );
            return { type: "elements", elements: _, element: h };
          },
          _ = function (e) {
            return (0, i.uN)(e, i.M4.payment_element_beta_1) ? p : d;
          },
          h = function (e, t, n, a, l, p) {
            var d,
              m = (function (e) {
                var t = e.betas,
                  n = e.rawUpdateData,
                  r = e.errorMessageMethodName,
                  o = e.controller,
                  a = (0, c.Gu)((0, c.mC)(_(t)), n, r),
                  s = a.value,
                  l = s.element,
                  p = void 0 === l ? void 0 : l,
                  d = s.elements,
                  m = void 0 === d ? void 0 : d,
                  h = s.confirmParams,
                  y = s.clientSecret,
                  v = s.redirect,
                  g = s.handleActions,
                  b = a.warnings,
                  w = (0, c.Gu)(
                    (0, c.jt)(
                      (0, c.mC)({
                        return_url: (0, c.jt)(c.Z_),
                        payment_method: (0, c.jt)(c.Z_),
                        payment_method_data: (0, c.jt)(c.Ry),
                        payment_method_options: (0, c.jt)(c.Ry),
                        setup_future_usage: (0, c.NM)(
                          "".concat(
                            r,
                            ": do not pass setup_future_usage at confirm time. Instead, pass setup_future_usage when the PaymentIntent is created."
                          )
                        ),
                      })
                    ),
                    h,
                    r,
                    { path: ["confirmParams"] }
                  ).value,
                  k = f(
                    t,
                    {
                      rawSecret: y,
                      rawElement: p,
                      rawElements: m,
                      rawHandleActions: g,
                      rawRedirect: v,
                      validatedConfirmParams: w,
                    },
                    r
                  );
                if (
                  "clientSecret" === k.type &&
                  !(0, i.uN)(t, i.M4.server_side_confirmation_beta_1)
                )
                  throw new u.No(
                    "".concat(
                      r,
                      " with a `clientSecret` is not supported yet. Please use the Payment Element."
                    )
                  );
                var E = v || "always",
                  S = (null == w ? void 0 : w.return_url) || null;
                return (
                  b.forEach(function (e) {
                    return o.warn(e);
                  }),
                  {
                    validatedRedirect: E,
                    validatedReturnUrl: S,
                    validatedParams: k,
                    validatedConfirmParams: w,
                    validatedHandleActions: !1 !== g,
                    rawConfirmParams: h,
                  }
                );
              })({
                betas: n,
                rawUpdateData: a,
                controller: e,
                errorMessageMethodName: p,
              }),
              h = m.validatedParams,
              y = m.validatedConfirmParams,
              v = m.validatedRedirect,
              g = m.validatedHandleActions,
              b = m.validatedReturnUrl,
              w = m.rawConfirmParams,
              k = null != w ? w : {},
              E =
                (k.payment_method,
                k.payment_method_data,
                k.payment_method_options,
                (0, r.Z)(k, [
                  "payment_method",
                  "payment_method_data",
                  "payment_method_options",
                ]));
            if (
              ((d =
                "clientSecret" === h.type
                  ? (function (e) {
                      var t,
                        n = e.validatedParams,
                        r = e.validatedConfirmParams,
                        i = e.validatedHandleActions,
                        a = e.otherParams,
                        c = e.intentType,
                        u = e.mids,
                        l = null != r ? r : {},
                        p = l.payment_method_data,
                        d = l.payment_method,
                        m = l.payment_method_options,
                        f =
                          "payment" === c
                            ? (0, s.cn)(n.clientSecret, "confirmPayment")
                            : (0, s.jH)(n.clientSecret, "confirmSetup"),
                        _ = (0, s.k7)({ payment_method: p }),
                        h = {};
                      return (
                        ("none" !==
                          (t =
                            p && _
                              ? {
                                  intentSecret: f,
                                  tag: "paymentMethod-from-data",
                                  type: _,
                                  data: p,
                                  options: null != m ? m : {},
                                }
                              : d
                              ? {
                                  intentSecret: f,
                                  tag: "paymentMethod",
                                  paymentMethod: d,
                                  options: null != m ? m : {},
                                }
                              : { intentSecret: f, tag: "none" }).tag &&
                          "paymentMethod" !== t.tag) ||
                          (h = {
                            use_stripe_sdk: !0,
                            mandate_data: {
                              customer_acceptance: {
                                type: "online",
                                online: { infer_from_client: !0 },
                              },
                            },
                          }),
                        {
                          mids: u,
                          mode: t,
                          expectedType: _,
                          otherParams: (0, o.Z)((0, o.Z)({}, h), a),
                          options: { handleActions: i },
                        }
                      );
                    })({
                      validatedParams: h,
                      validatedConfirmParams: y,
                      validatedHandleActions: g,
                      otherParams: E,
                      intentType: l,
                      mids: t,
                    })
                  : (function (e) {
                      var t,
                        n,
                        r,
                        o,
                        i = e.validatedParams,
                        a = e.validatedConfirmParams,
                        c = e.validatedHandleActions,
                        s = e.otherParams,
                        u = e.mids;
                      return {
                        mode: {
                          tag: "elements",
                          groupId:
                            null === (t = i.elements) || void 0 === t
                              ? void 0
                              : t._id,
                          frameId:
                            null === (n = i.element) || void 0 === n
                              ? void 0
                              : n._implementation._frame.id,
                          data:
                            null !==
                              (r =
                                null == a ? void 0 : a.payment_method_data) &&
                            void 0 !== r
                              ? r
                              : {},
                          options:
                            null !==
                              (o =
                                null == a
                                  ? void 0
                                  : a.payment_method_options) && void 0 !== o
                              ? o
                              : {},
                        },
                        otherParams: s,
                        expectedType: null,
                        mids: u,
                        options: { handleActions: c },
                      };
                    })({
                      validatedParams: h,
                      validatedConfirmParams: y,
                      validatedHandleActions: g,
                      otherParams: E,
                      mids: t,
                    })),
              "if_required" === v)
            )
              return { intentMutationRequest: d, redirect: v, returnUrl: null };
            if ("always" === v && b)
              return { intentMutationRequest: d, redirect: v, returnUrl: b };
            throw new u.No(
              "".concat(
                p,
                ": the `confirmParams.return_url` argument is required unless passing `redirect: 'if_required'`"
              )
            );
          };
      },
      4167: function (e, t, n) {
        "use strict";
        n.d(t, {
          Fh: function () {
            return S;
          },
          nq: function () {
            return C;
          },
          gO: function () {
            return A;
          },
        });
        var r = n(6977),
          o = n(1765),
          i = n(7549),
          a = n(122),
          c = n(7193),
          s = n(6589),
          u = n(6042),
          l = n(755),
          p = n(8147),
          d = n(5326),
          m = n(8489),
          f = n(508),
          _ = n(9294),
          h = function (e) {
            return (
              "requires_action" !== e.status &&
              "requires_source_action" !== e.status
            );
          },
          y = function (e) {
            var t = e.controller,
              n = e.initialDelay,
              r = void 0 === n ? 5e3 : n,
              o = e.intent,
              i = e.lightboxOptions,
              a = e.locale,
              c = e.pollInterval,
              p = void 0 === c ? 2e3 : c,
              y = e.url,
              v = i.size,
              g = (0, f.Z)(i, ["size"]),
              b = (0, u.q)(
                t,
                (0, m.Z)(
                  {
                    url: (0, l.jr)(y),
                    size: _.q$ ? "fullScreen" : v || "400x600",
                    locale: a,
                    useLightboxHostedCloseButton: !1,
                  },
                  g
                )
              ),
              w = !1;
            return new s.J(function (e) {
              return (
                b._on("load", function () {
                  b.show(), b.fadeInBackdrop();
                }),
                b._once("request-close", function () {
                  (0, u.G)(b).then(function () {
                    (w = !0),
                      "payment_intent" === o.object && e({ paymentIntent: o }),
                      "setup_intent" === o.object && e({ setupIntent: o });
                  });
                }),
                b._on("complete", function (t) {
                  (0, u.G)(b).then(function () {
                    (w = !0), e(t);
                  });
                }),
                (0, d.ct)({
                  controller: t,
                  initialDelay: r,
                  pollTimeGap: p,
                  intent: o,
                  checkIntent: h,
                  shouldPoll: function () {
                    return !w;
                  },
                  locale: a,
                }).then(function (t) {
                  ("error" in t && t.error) ||
                    w ||
                    b.destroy(!0).then(function () {
                      e(t);
                    });
                })
              );
            });
          },
          v = function (e) {
            return (
              "requires_action" !== e.status &&
              "requires_source_action" !== e.status
            );
          },
          g = n(6790),
          b = n(8812),
          w = n(1873),
          k = n(276),
          E = function (e) {
            return (
              ["id_bank_account", "id_bank_transfer"].indexOf(
                e.bankTransferType
              ) > -1
            );
          },
          S = function (e) {
            switch (e.type) {
              case "error":
                var t = e.error;
                if (
                  "payment_intent_unexpected_state" === t.code &&
                  "object" == typeof t.payment_intent &&
                  null != t.payment_intent &&
                  "string" == typeof t.payment_intent.status &&
                  (0, r.mD)(t.payment_intent.status)
                ) {
                  var n = t.payment_intent;
                  return { type: "object", locale: e.locale, object: n };
                }
                return e;
              case "object":
                return e;
              default:
                return (0, w.Rz)(e);
            }
          },
          P = function (e, t, m, f, h, w) {
            var S = (0, i.l)((0, r.G2)(t)),
              P = (0, r.O3)(t);
            if (!S) return s.J.resolve({ paymentIntent: t });
            switch (S.type) {
              case "cardimageverification-challenge":
                return n
                  .e(428)
                  .then(n.bind(n, 5798))
                  .then(function (n) {
                    return (0, n.performCardImageVerification)(S, t, e, m);
                  });
              case "captcha-challenge":
                return (0, p.z)(S, t, e, m);
              case "3ds1-modal":
                return (0, a.s)(S, P, k.kE.PAYMENT_INTENT, e, m, h);
              case "3ds2-fingerprint":
              case "3ds2-challenge":
                return (0, c.A)(
                  S,
                  {
                    intentSecret: P,
                    intentType: k.kE.PAYMENT_INTENT,
                    controller: e,
                    locale: m,
                    hosted: f,
                  },
                  h
                );
              case "redirect":
                return (0, g.k)(t, S.redirectUrl, e);
              case "blik_authorize":
                return (function (e) {
                  var t = e.controller,
                    n = e.intent,
                    r = e.locale,
                    o = e.shouldDisplayInstructionsModal;
                  return new s.J(function (e) {
                    var i,
                      a = !1;
                    return (
                      o &&
                        ((i = t.createLightboxFrame({
                          type: l.NC.BLIK_INNER,
                          options: { locale: r },
                        }))._on("load", function () {
                          var e, t;
                          null === (e = i) || void 0 === e || e.show(),
                            null === (t = i) ||
                              void 0 === t ||
                              t.fadeInBackdrop();
                        }),
                        i._once("request-close", function () {
                          i &&
                            (0, u.G)(i).then(function () {
                              (a = !0), e({ paymentIntent: n });
                            });
                        })),
                      (0, d.ct)({
                        controller: t,
                        initialDelay: 8e3,
                        pollTimeGap: 5e3,
                        intent: n,
                        checkIntent: function (e) {
                          return (
                            "requires_action" !== e.status ||
                            "blik_authorize" !== e.next_action.type
                          );
                        },
                        locale: r,
                        shouldPoll: function () {
                          return !a;
                        },
                      }).then(function (t) {
                        var n;
                        (null === (n = i) || void 0 === n
                          ? void 0
                          : n.isVisible) && i.destroy(!0),
                          a || e(t);
                      })
                    );
                  });
                })({
                  controller: e,
                  intent: t,
                  locale: m,
                  shouldDisplayInstructionsModal: w,
                });
              case "boleto-display":
                if (void 0 === S.hostedVoucherUrl)
                  throw new b.No(
                    "Expect `next_action.boleto_display_details.hosted_voucher_url` of `PaymentIntent` to be not undefined. Please refer to \n\nhttps://stripe.com/docs/api/payment_intents/object#payment_intent_object-next_action-boleto_display_details-hosted_voucher_url"
                  );
                return (function (e) {
                  var t = e.controller,
                    n = e.url,
                    r = e.intent,
                    o = e.locale,
                    i = (0, u.q)(t, {
                      url: (0, l.jr)(n),
                      size: "600x700",
                      locale: o,
                      frameTitle: "boleto.voucher_frame_title",
                      useLightboxHostedCloseButton: !1,
                    });
                  return new s.J(function (e) {
                    i._on("request-close", function () {
                      (0, u.G)(i).then(function () {
                        e({ paymentIntent: r });
                      });
                    });
                  });
                })({
                  controller: e,
                  locale: m,
                  url: S.hostedVoucherUrl,
                  intent: t,
                });
              case "konbini-display":
                if (void 0 === S.hostedVoucherUrl)
                  throw new b.No(
                    "Expected option `handleActions` to be `false`. The Konbini pilot does not handle the next actions for you automatically yet (e.g. displaying Konbini payment details). Please refer to the Stripe Konbini integration guide for more info: \n\nhttps://stripe.com/docs/payments/konbini"
                  );
                return (function (e) {
                  var t = e.controller,
                    n = e.url,
                    r = e.intent,
                    o = e.locale,
                    i = (0, u.q)(t, {
                      url: (0, l.jr)(n),
                      size: "600x900",
                      locale: o,
                      frameTitle: "konbini.voucher_frame_title",
                      useLightboxHostedCloseButton: !1,
                    });
                  return new s.J(function (e) {
                    i._on("request-close", function () {
                      (0, u.G)(i).then(function () {
                        e({ paymentIntent: r });
                      });
                    });
                  });
                })({
                  controller: e,
                  locale: m,
                  url: S.hostedVoucherUrl,
                  intent: t,
                });
              case "oxxo-display":
                if (void 0 === S.hostedVoucherUrl)
                  throw new b.No(
                    "To handle the next actions automatically, set the API version to oxxo_beta=v2. Please refer to the Stripe OXXO integration guide for more info: \n\nhttps://stripe.com/docs/payments/oxxo"
                  );
                return (function (e) {
                  var t = e.controller,
                    n = e.url,
                    r = e.intent,
                    o = e.locale,
                    i = (0, u.q)(t, {
                      url: (0, l.jr)(n),
                      size: "600x700",
                      locale: o,
                      frameTitle: "oxxo.voucher_frame_title",
                      useLightboxHostedCloseButton: !1,
                    });
                  return new s.J(function (e) {
                    i._on("request-close", function () {
                      (0, u.G)(i).then(function () {
                        e({ paymentIntent: r });
                      });
                    });
                  });
                })({
                  controller: e,
                  locale: m,
                  url: S.hostedVoucherUrl,
                  intent: t,
                });
              case "upi_await_notification":
                return (function (e) {
                  var t = e.controller,
                    n = e.intentSecret,
                    r = e.intentType,
                    o = e.locale;
                  return new s.J(function (e) {
                    setTimeout(function i() {
                      (0, d.NO)(n, r, t, o).then(function (t) {
                        var n = (0, d.yn)(t);
                        null !== n &&
                          ("requires_action" !== n.status
                            ? e(t)
                            : setTimeout(i, 1e4));
                      });
                    }, 5e3);
                  });
                })({
                  controller: e,
                  intentSecret: P,
                  intentType: k.kE.PAYMENT_INTENT,
                  locale: m,
                });
              case "wechat_pay_display_qr_code":
                return (0, o.uN)(e._betas || [], o.M4.wechat_pay_pm_beta_3)
                  ? (function (e) {
                      var t = e.controller,
                        n = e.intent,
                        r = e.locale,
                        o = e.url;
                      return y({
                        controller: t,
                        intent: n,
                        locale: r,
                        url: o,
                        lightboxOptions: {
                          frameTitle:
                            "hosted_qr_code_instructions.wechat_pay.frame_title",
                          size: "440x560",
                        },
                      });
                    })({
                      controller: e,
                      locale: m,
                      url: S.hostedInstructionsUrl,
                      intent: t,
                      intentSecret: P,
                      intentType: k.kE.PAYMENT_INTENT,
                    })
                  : (function (e) {
                      var t = e.controller,
                        n = e.intent,
                        o = e.locale,
                        i = (0, r.G2)(n);
                      if (!i || "wechat_pay_display_qr_code" !== i.type)
                        throw new Error(
                          "Expected next_action.wechat_pay_display_qr_code"
                        );
                      var a = t.createLightboxFrame({
                          type: l.NC.WECHAT_PAY_INNER,
                          options: {
                            qrCodeData: i.wechat_pay_display_qr_code.data,
                            qrCodeUrl:
                              i.wechat_pay_display_qr_code.image_url_png,
                            locale: o,
                          },
                        }),
                        c = !1;
                      return new s.J(function (e) {
                        a._on("load", function () {
                          a.show(), a.fadeInBackdrop();
                        }),
                          a._once("request-close", function () {
                            (0, u.G)(a).then(function () {
                              (c = !0), e({ paymentIntent: n });
                            });
                          }),
                          (0, d.ct)({
                            controller: t,
                            initialDelay: 5e3,
                            pollTimeGap: 2e3,
                            intent: n,
                            checkIntent: function (e) {
                              return "requires_action" !== e.status;
                            },
                            shouldPoll: function () {
                              return !c;
                            },
                            locale: o,
                          }).then(function (t) {
                            t.error ||
                              a.destroy(!0).then(function () {
                                e(t);
                              });
                          });
                      });
                    })({ controller: e, locale: m, intent: t });
              case "paynow_display_qr_code":
                return (0, o.uN)(e._betas || [], o.M4.paynow_pm_beta_1)
                  ? (function (e) {
                      var t = e.controller,
                        n = e.intent,
                        r = e.locale,
                        o = e.url;
                      return y({
                        controller: t,
                        intent: n,
                        locale: r,
                        url: o,
                        lightboxOptions: {
                          frameTitle:
                            "hosted_qr_code_instructions.paynow.frame_title",
                          size: "440x560",
                        },
                      });
                    })({
                      controller: e,
                      locale: m,
                      url: S.hostedInstructionsUrl,
                      intent: t,
                      intentSecret: P,
                      intentType: k.kE.PAYMENT_INTENT,
                    })
                  : (function (e) {
                      var t = e.controller,
                        n = e.intent,
                        o = e.locale,
                        i = (0, r.G2)(n);
                      if (!i || "paynow_display_qr_code" !== i.type)
                        throw new Error(
                          "Expected next_action.paynow_display_qr_code"
                        );
                      var a = t.createLightboxFrame({
                          type: l.NC.PAYNOW_INNER,
                          options: {
                            qrCodeUrl: i.paynow_display_qr_code.image_url_svg,
                            qrCodeData: i.paynow_display_qr_code.data,
                            locale: o,
                          },
                        }),
                        c = !1;
                      return new s.J(function (e) {
                        return (
                          a._on("load", function () {
                            a.show(), a.fadeInBackdrop();
                          }),
                          a._once("request-close", function () {
                            (0, u.G)(a).then(function () {
                              (c = !0), e({ paymentIntent: n });
                            });
                          }),
                          a._on("complete", function (t) {
                            (0, u.G)(a).then(function () {
                              (c = !0), e(t);
                            });
                          }),
                          (0, d.ct)({
                            controller: t,
                            initialDelay: 5e3,
                            pollTimeGap: 2e3,
                            intent: n,
                            checkIntent: v,
                            shouldPoll: function () {
                              return !c;
                            },
                            locale: o,
                          }).then(function (t) {
                            ("error" in t && t.error) ||
                              c ||
                              a.destroy(!0).then(function () {
                                e(t);
                              });
                          })
                        );
                      });
                    })({
                      controller: e,
                      locale: m,
                      intent: t,
                      intentSecret: P,
                      intentType: k.kE.PAYMENT_INTENT,
                    });
              case "pix_display_qr_code":
                if (void 0 === S.hostedInstructionsUrl)
                  throw new b.No(
                    "Expect `next_action.pix_display_qr_code.hosted_instructions_url` of `PaymentIntent` to be not undefined. Please refer to \n\nhttps://stripe.com/docs/api/payment_intents/object#payment_intent_object-next_action-pix_display_qr_code-hosted_instructions_url"
                  );
                return (function (e) {
                  var t = e.controller,
                    n = e.intent,
                    r = e.intentSecret,
                    o = e.intentType,
                    i = e.locale,
                    a = e.url,
                    c = (0, u.q)(t, {
                      url: (0, l.jr)(a),
                      size: "450x750",
                      locale: i,
                      frameTitle: "pix.instructions_frame_title",
                      useLightboxHostedCloseButton: !1,
                    }),
                    p = null;
                  return new s.J(function (e) {
                    c._on("load", function () {
                      c.show(), c.fadeInBackdrop();
                    }),
                      c._once("request-close", function () {
                        (0, u.G)(c).then(function () {
                          p && clearTimeout(p), e({ paymentIntent: n });
                        });
                      }),
                      c._on("complete", function (t) {
                        (0, u.G)(c).then(function () {
                          p && clearTimeout(p), e(t);
                        });
                      }),
                      (p = setTimeout(function n() {
                        (0, d.NO)(r, o, t, i).then(function (t) {
                          var r = (0, d.yn)(t);
                          r &&
                            ("requires_action" !== r.status
                              ? c.destroy(!0).then(function () {
                                  "payment_intent" === r.object
                                    ? e({ paymentIntent: r })
                                    : e({ setupIntent: r });
                                })
                              : (p = setTimeout(n, 2e3)));
                        });
                      }, 5e3));
                  });
                })({
                  controller: e,
                  locale: m,
                  url: S.hostedInstructionsUrl,
                  intent: t,
                  intentSecret: P,
                  intentType: k.kE.PAYMENT_INTENT,
                });
              case "promptpay_display_qr_code":
                return (function (e) {
                  var t = e.controller,
                    n = e.intent,
                    r = e.locale,
                    o = e.url;
                  return y({
                    controller: t,
                    intent: n,
                    locale: r,
                    url: o,
                    lightboxOptions: {
                      frameTitle:
                        "hosted_qr_code_instructions.promptpay.frame_title",
                    },
                  });
                })({
                  controller: e,
                  locale: m,
                  intent: t,
                  intentSecret: P,
                  url: S.hostedInstructionsUrl,
                  intentType: k.kE.PAYMENT_INTENT,
                });
              case "display_bank_transfer_instructions":
                return (function (e, t) {
                  return (
                    !!E(e) && !(0, o.uN)(t || [], o.M4.id_bank_transfer_beta_1)
                  );
                })(S, e._betas)
                  ? (0, g.k)(t, S.hostedInstructionsUrl, e)
                  : (function (e) {
                      return !E(e);
                    })(S)
                  ? (function (e) {
                      var t = e.controller,
                        n = e.url,
                        r = e.intent,
                        o = e.locale,
                        i = (0, u.q)(t, {
                          url: (0, l.jr)(n),
                          size: "600x700",
                          locale: o,
                          frameTitle:
                            "display_bank_transfer_instructions.voucher_frame_title",
                          useLightboxHostedCloseButton: !1,
                        });
                      return new s.J(function (e) {
                        i._on("request-close", function () {
                          (0, u.G)(i).then(function () {
                            e({ paymentIntent: r });
                          });
                        });
                      });
                    })({
                      controller: e,
                      url: S.hostedInstructionsUrl,
                      intent: t,
                      locale: m,
                    })
                  : s.J.resolve({ paymentIntent: t });
              case "qris_display_qr_code":
                return (function (e) {
                  var t = e.controller,
                    n = e.intent,
                    r = e.locale,
                    o = e.url;
                  return y({
                    controller: t,
                    intent: n,
                    locale: r,
                    url: o,
                    lightboxOptions: {
                      frameTitle:
                        "hosted_qr_code_instructions.qris.frame_title",
                    },
                  });
                })({
                  controller: e,
                  locale: m,
                  intent: t,
                  intentSecret: P,
                  url: S.hostedInstructionsUrl,
                  intentType: k.kE.PAYMENT_INTENT,
                });
              case "cashapp_handle_redirect_or_display_qr_code":
                return (function (e) {
                  var t = e.controller,
                    n = e.intent,
                    o = (e.intentType, e.intentSecret, e.locale, (0, r.G2)(n));
                  if (
                    !o ||
                    "cashapp_handle_redirect_or_display_qr_code" !== o.type
                  )
                    throw new Error(
                      "Expected next_action.cashapp_handle_redirect_or_display_qr_code"
                    );
                  if (_.q$)
                    return (0, g.k)(
                      n,
                      o.cashapp_handle_redirect_or_display_qr_code
                        .mobile_auth_url,
                      t
                    );
                  throw new b.No("Cashapp display is not yet implemented");
                })({
                  controller: e,
                  locale: m,
                  intent: t,
                  intentSecret: P,
                  intentType: k.kE.PAYMENT_INTENT,
                });
              default:
                return s.J.resolve({ paymentIntent: t });
            }
          },
          A = function e(t, n, r, o, i, a) {
            var c =
              arguments.length > 6 && void 0 !== arguments[6]
                ? arguments[6]
                : 0;
            if (k.kO < c) throw new Error("max action recursion depth reached");
            return P(t, n, r, o, a || [], i).then(function (n) {
              if (n.setupIntent)
                throw new Error("Got unexpected SetupIntent response");
              if (
                n.paymentIntent &&
                null != n.paymentIntent.next_action &&
                "use_stripe_sdk" === n.paymentIntent.next_action.type &&
                -1 !==
                  k.zT.indexOf(n.paymentIntent.next_action.use_stripe_sdk.type)
              ) {
                var s = c;
                return e(t, n.paymentIntent, r, o, i, a, ++s);
              }
              return n;
            });
          },
          C = function (e, t, n, o, i) {
            return function (a) {
              var c = S(a);
              switch (c.type) {
                case "error":
                  var u = c.error,
                    l = u.payment_intent;
                  return t &&
                    l &&
                    "payment_intent_unexpected_state" === u.code &&
                    ("succeeded" === l.status ||
                      "requires_capture" === l.status)
                    ? s.J.resolve({ paymentIntent: l })
                    : s.J.resolve((0, r.PA)(a));
                case "object":
                  var p = c.object;
                  return A(e, p, c.locale, n, o, i || []);
                default:
                  return (0, w.Rz)(c);
              }
            };
          };
      },
      7549: function (e, t, n) {
        "use strict";
        n.d(t, {
          l: function () {
            return a;
          },
        });
        var r = function (e) {
            var t = {
              skipFingerprint: !1,
              sandboxFingerprintFrame: !1,
              sandboxChallengeFrame: !1,
              recordFinalCres: !1,
            };
            return (
              -1 !== e.indexOf("Y") && (t.skipFingerprint = !0),
              -1 !== e.indexOf("k") && (t.sandboxFingerprintFrame = !0),
              -1 !== e.indexOf("5") && (t.sandboxChallengeFrame = !0),
              -1 !== e.indexOf("f") && (t.recordFinalCres = !0),
              t
            );
          },
          o = function (e) {
            return e
              ? {
                  amount: e.amount,
                  instrument: {
                    cardBrand: e.instrument.card_brand,
                    cardName: e.instrument.card_name,
                    cardLast4: e.instrument.card_last4,
                  },
                  merchant: {
                    name: e.merchant.name,
                    origin: e.merchant.origin,
                  },
                  credentials: e.credentials,
                  authenticationChallenge: e.authentication_challenge,
                  configuration: e.configuration,
                  layout: e.layout,
                }
              : null;
          },
          i = function (e) {
            return (
              {
                american_express: "amex",
                visa: "visa",
                mastercard: "mastercard",
                discover: "discover",
                unionpay: "unionpay",
                jsecure: "jcb",
              }[e] || "unknown"
            );
          },
          a = function (e) {
            if (!e) return null;
            if ("use_stripe_sdk" === e.type) {
              var t = e.use_stripe_sdk;
              switch (t.type) {
                case "intent_cardimageverification_challenge":
                  return {
                    type: "cardimageverification-challenge",
                    civId: t.stripe_js.card_image_verification_id,
                    civClientSecret:
                      t.stripe_js.card_image_verification_client_secret,
                    previousScanFailed: t.stripe_js.previous_scan_failed,
                  };
                case "intent_confirmation_challenge":
                  return {
                    type: "captcha-challenge",
                    site_key: t.stripe_js.site_key,
                    verification_url: t.stripe_js.verification_url,
                  };
                case "stripe_3ds2_fingerprint":
                  return {
                    type: "3ds2-fingerprint",
                    threeDS2Source: t.three_d_secure_2_source,
                    merchant: t.merchant,
                    cardBrand: i(t.directory_server_name),
                    transactionId: t.server_transaction_id,
                    optimizations: r(t.three_ds_optimizations),
                    methodUrl: t.three_ds_method_url,
                    oneClickAuthn: o(t.one_click_authn),
                    publishableKey: t.publishable_key,
                    threeDS2Intent: t.three_d_secure_2_intent,
                  };
                case "stripe_3ds2_challenge":
                  return {
                    type: "3ds2-challenge",
                    threeDS2Source: t.stripe_js.three_d_secure_2_source,
                    cardBrand: i(t.stripe_js.directory_server_name),
                    transactionId: t.stripe_js.server_transaction_id,
                    optimizations: r(t.stripe_js.three_ds_optimizations),
                    acsTransactionId: t.stripe_js.acs_transaction_id,
                    acsUrl: t.stripe_js.acs_url,
                    oneClickAuthn: o(t.stripe_js.one_click_authn),
                    creq: t.stripe_js.creq,
                  };
                case "three_d_secure_redirect":
                  return {
                    type: "3ds1-modal",
                    url: t.stripe_js,
                    source: t.source,
                  };
              }
            }
            if ("redirect_to_url" === e.type)
              return { type: "redirect", redirectUrl: e.redirect_to_url.url };
            if ("alipay_handle_redirect" === e.type)
              return {
                type: "redirect",
                redirectUrl: e.alipay_handle_redirect.url,
              };
            if ("blik_authorize" === e.type) return { type: "blik_authorize" };
            if ("boleto_display_details" === e.type)
              return {
                type: "boleto-display",
                hostedVoucherUrl: e.boleto_display_details.hosted_voucher_url,
              };
            if ("display_oxxo_details" === e.type)
              return {
                type: "oxxo-display",
                hostedVoucherUrl: e.display_oxxo_details.hosted_voucher_url,
              };
            if ("konbini_display_details" === e.type)
              return {
                type: "konbini-display",
                hostedVoucherUrl: e.konbini_display_details.hosted_voucher_url,
              };
            if ("oxxo_display_details" === e.type)
              return {
                type: "oxxo-display",
                hostedVoucherUrl: e.oxxo_display_details.hosted_voucher_url,
              };
            if ("upi_await_notification" === e.type)
              return { type: "upi_await_notification" };
            if ("wechat_pay_display_qr_code" === e.type)
              return {
                type: "wechat_pay_display_qr_code",
                qrCodeUrl: e.wechat_pay_display_qr_code.image_url_png,
                hostedInstructionsUrl:
                  e.wechat_pay_display_qr_code.hosted_instructions_url,
              };
            if ("cashapp_handle_redirect_or_display_qr_code" === e.type)
              return {
                type: "cashapp_handle_redirect_or_display_qr_code",
                mobile_auth_url:
                  e.cashapp_handle_redirect_or_display_qr_code.mobile_auth_url,
                image_url_png:
                  e.cashapp_handle_redirect_or_display_qr_code.qr_code
                    .image_url_png,
                image_url_svg:
                  e.cashapp_handle_redirect_or_display_qr_code.qr_code
                    .image_url_svg,
                expires_at:
                  e.cashapp_handle_redirect_or_display_qr_code.qr_code
                    .expires_at,
              };
            if ("paynow_display_qr_code" === e.type)
              return {
                type: "paynow_display_qr_code",
                qrCodeUrl: e.paynow_display_qr_code.image_url_png,
                hostedInstructionsUrl:
                  e.paynow_display_qr_code.hosted_instructions_url,
              };
            if ("pix_display_qr_code" === e.type)
              return {
                type: "pix_display_qr_code",
                hostedInstructionsUrl:
                  e.pix_display_qr_code.hosted_instructions_url,
              };
            if ("promptpay_display_qr_code" === e.type)
              return {
                type: "promptpay_display_qr_code",
                qrCodeUrl: e.promptpay_display_qr_code.image_url_png,
                qrCodeData: e.promptpay_display_qr_code.data,
                hostedInstructionsUrl:
                  e.promptpay_display_qr_code.hosted_instructions_url,
              };
            if ("display_bank_transfer_instructions" === e.type) {
              var n,
                a =
                  e.display_bank_transfer_instructions.hosted_instructions_url;
              if (
                "id_bban" ===
                e.display_bank_transfer_instructions.financial_addresses[0].type
              )
                a =
                  null !== (n = a) && void 0 !== n
                    ? n
                    : e.display_bank_transfer_instructions
                        .financial_addresses[0].id_bban.hosted_instructions_url;
              return {
                type: "display_bank_transfer_instructions",
                hostedInstructionsUrl: a,
                bankTransferType: e.display_bank_transfer_instructions.type,
              };
            }
            return "qris_display_qr_code" === e.type
              ? {
                  type: "qris_display_qr_code",
                  hostedInstructionsUrl:
                    e.qris_display_qr_code.hosted_instructions_url,
                }
              : null;
          };
      },
      3849: function (e, t, n) {
        "use strict";
        n.d(t, {
          Bu: function () {
            return g;
          },
          I4: function () {
            return v;
          },
          LR: function () {
            return h;
          },
          OV: function () {
            return f;
          },
          TH: function () {
            return y;
          },
          cn: function () {
            return u;
          },
          el: function () {
            return d;
          },
          hC: function () {
            return b;
          },
          jH: function () {
            return l;
          },
          k7: function () {
            return p;
          },
          o1: function () {
            return m;
          },
          z2: function () {
            return _;
          },
          zb: function () {
            return w;
          },
        });
        var r = n(7904),
          o = n(1873),
          i = n(8812),
          a = n(248),
          c = n(8666),
          s = function (e) {
            var t = e
              .split(/(?=[A-Z])/)
              .join("-")
              .toLowerCase();
            return "https://stripe.com/docs/stripe-js/reference#stripe-".concat(
              t
            );
          },
          u = function (e, t) {
            return (0, o.Gu)(c.f4, e, "stripe.".concat(t, " intent secret"))
              .value;
          },
          l = function (e, t) {
            return (0, o.Gu)(c.Yj, e, "stripe.".concat(t, " intent secret"))
              .value;
          },
          p = function (e) {
            if (
              !e ||
              !e.payment_method ||
              !e.payment_method.type ||
              "string" != typeof e.payment_method.type
            )
              return null;
            var t = e.payment_method.type;
            return a.GS[t] || null;
          },
          d = function (e, t) {
            return (0, o.Gu)(c.SR, t, e).value;
          },
          m = function (e, t, n, r) {
            if ("valid" === (0, o.ld)(o.IN, n, t).type)
              throw new i.No(
                "Do not pass an Element to stripe.".concat(
                  t,
                  "() directly.\n"
                ) + "For more information: ".concat(s(t))
              );
            var a = (0, o.Gu)((0, c.bF)(e, t), n, t).value,
              u = a.source,
              l = a.paymentMethodData,
              p = a.paymentMethodOptions,
              d = a.paymentMethod,
              m = a.otherParams;
            if (null != u && (null != l || null != d))
              throw new i.No(
                "".concat(
                  t,
                  ": Expected either source or payment_method, but not both."
                )
              );
            if (l) {
              if (l.element)
                return {
                  mode: {
                    tag: "paymentMethod-from-element",
                    type: e,
                    elementName: l.element._componentName,
                    frameId: l.element._implementation._frame.id,
                    data: l.data,
                    options: p,
                    intentSecret: r,
                  },
                  otherParams: m,
                };
              if (e)
                return {
                  mode: {
                    tag: "paymentMethod-from-data",
                    type: e,
                    data: l.data,
                    options: p,
                    intentSecret: r,
                  },
                  otherParams: m,
                };
            } else {
              if (d)
                return {
                  mode: {
                    tag: "paymentMethod",
                    paymentMethod: d,
                    options: p,
                    intentSecret: r,
                  },
                  otherParams: m,
                };
              if (u)
                return {
                  mode: { tag: "source", source: u, intentSecret: r },
                  otherParams: m,
                };
            }
            return { mode: { tag: "none", intentSecret: r }, otherParams: m };
          },
          f = function (e, t) {
            if (
              "object" == typeof e &&
              null !== e &&
              void 0 !== e.handleActions
            )
              throw new i.No(
                "stripe."
                  .concat(
                    t,
                    " does not support a handleActions option. For more information, see "
                  )
                  .concat(s(t))
              );
          },
          _ = function (e, t) {
            var n = e.split("#"),
              o = (0, r.Z)(n, 2),
              i = o[0],
              a = o[1],
              c = i.split("?"),
              s = (0, r.Z)(c, 2),
              u = s[0],
              l = s[1],
              p = "?",
              d =
                "payment_intent" === t.object
                  ? [
                      "payment_intent",
                      "payment_intent_client_secret",
                      "redirect_status",
                    ]
                  : [
                      "setup_intent",
                      "setup_intent_client_secret",
                      "redirect_status",
                    ];
            (l || "").split("&").forEach(function (e) {
              var t = e.split("="),
                n = (0, r.Z)(t, 1)[0];
              -1 === d.indexOf(n) &&
                (p += "".concat("?" === p ? "" : "&").concat(e));
            });
            var m = "payment_intent" === t.object ? "payment" : "setup";
            (p += ""
              .concat("?" === p ? "" : "&")
              .concat(m, "_intent=")
              .concat(t.id)),
              (p += "&"
                .concat(m, "_intent_client_secret=")
                .concat(t.client_secret));
            var f = u + (p += "&redirect_status=succeeded");
            return a ? "".concat(f, "#").concat(a) : f;
          },
          h = { type: "validation_error", code: "incomplete_payment_details" },
          y = {
            type: "instant_verification_error",
            code: "instant_verification",
          },
          v = { type: "validation_error", code: "unexpected" },
          g = { type: "validation_error", code: "civ_unexpected" },
          b = {
            type: "validation_error",
            code: "payment_intent_authentication_failure",
          },
          w = {
            type: "instant_verification_incomplete_error",
            code: "instant_verification_incomplete",
          };
      },
      8666: function (e, t, n) {
        "use strict";
        function r(e) {
          var t = (function (e, t) {
            if ("object" !== (0, a.Z)(e) || null === e) return e;
            var n = e[Symbol.toPrimitive];
            if (void 0 !== n) {
              var r = n.call(e, t || "default");
              if ("object" !== (0, a.Z)(r)) return r;
              throw new TypeError(
                "@@toPrimitive must return a primitive value."
              );
            }
            return ("string" === t ? String : Number)(e);
          })(e, "string");
          return "symbol" === (0, a.Z)(t) ? t : String(t);
        }
        n.d(t, {
          as: function () {
            return w;
          },
          ZY: function () {
            return b;
          },
          SR: function () {
            return g;
          },
          bF: function () {
            return k;
          },
          q2: function () {
            return v;
          },
          LK: function () {
            return y;
          },
          Hv: function () {
            return f;
          },
          f4: function () {
            return _;
          },
          Yj: function () {
            return h;
          },
        });
        var o = n(8489),
          i = n(3696),
          a = n(9675),
          c = n(508),
          s = n(8812),
          u = n(1873),
          l = n(276),
          p = n(248),
          d = n(6977),
          m = n(1765),
          f = function (e, t) {
            if ("string" != typeof e)
              return (0, u.$3)("a client_secret string", e, t);
            var n = (0, d.RY)(e);
            return null === n
              ? (0, u.$3)(
                  "a client secret of the form ${id}_secret_${secret}",
                  e,
                  t
                )
              : (0, u.x4)(n, []);
          },
          _ = function (e, t) {
            var n = f(e, t);
            return "error" === n.type
              ? n
              : n.value.type === l.kE.SETUP_INTENT
              ? (0, u.zS)(
                  new s.No(
                    (0, u.Ao)(
                      "a PaymentIntent client secret",
                      "a SetupIntent client secret",
                      t
                    )
                  )
                )
              : (0, u.x4)(n.value, []);
          },
          h = function (e, t) {
            var n = f(e, t);
            return "error" === n.type
              ? n
              : n.value.type === l.kE.PAYMENT_INTENT
              ? (0, u.zS)(
                  new s.No(
                    (0, u.Ao)(
                      "a SetupIntent client secret",
                      "a PaymentIntent client secret",
                      t
                    )
                  )
                )
              : (0, u.x4)(n.value, []);
          },
          y = function (e, t) {
            if (null === e) return (0, u.RH)("object", "null", t);
            if ("object" != typeof e) return (0, u.RH)("object", typeof e, t);
            var n = e.client_secret,
              r = e.status,
              o = e.next_action,
              i = f(n, (0, u.NQ)(t, "client_secret"));
            if ("error" === i.type) return i;
            if ("string" != typeof r)
              return (0, u.RH)("string", typeof r, (0, u.NQ)(t, "status"));
            if (
              ("requires_source_action" === r || "requires_action" === r) &&
              "object" != typeof o
            )
              return (0, u.RH)("object", typeof o, (0, u.NQ)(t, "next_action"));
            if ("payment_intent" === e.object) {
              var a = e;
              return (0, u.x4)(a, []);
            }
            var c = e;
            return (0, u.x4)(c, []);
          },
          v = function (e, t) {
            return function (n, o) {
              if ("object" != typeof n) return (0, u.RH)("object", typeof n, o);
              if (null === n) return (0, u.RH)("object", "null", o);
              var a = (0, m.uN)(
                  t || [],
                  m.M4.elements_enable_deferred_intent_beta_1
                ),
                l = n.element,
                d = n.elements,
                f = n.params,
                _ = (0, c.Z)(n, ["element", "elements", "params"]);
              if (a && (l || d || f)) {
                var h = (0, u.rX)(l),
                  y = (0, u.MO)(d),
                  v = Object.keys(_);
                if (v.length) {
                  var g = new s.No(
                    "Unexpected "
                      .concat(v.length > 1 ? "properties" : "property", ": `")
                      .concat(
                        v.join("`, `"),
                        "`. Put additional API properties in `params`."
                      )
                  );
                  return (0, u.zS)(g);
                }
                if (h) {
                  var b = h._componentName,
                    w = p._b[b];
                  return (0, u.x4)({
                    type: w,
                    element: h,
                    elements: null,
                    data: f || {},
                  });
                }
                if (y)
                  return (0, u.x4)({
                    type: null,
                    element: null,
                    elements: y,
                    data: f || {},
                  });
                if (f)
                  return (0, u.x4)({
                    type: f.type,
                    element: null,
                    elements: null,
                    data: f,
                  });
              } else if (a && !n.type) {
                var k = new s.No(
                  "element, elements, or params must be provided."
                );
                return (0, u.zS)(k);
              }
              var E,
                S = n.type,
                P = (0, c.Z)(n, ["type"]);
              if (null === e) {
                if ("string" != typeof S)
                  return (0, u.RH)(
                    "a string such as 'card', 'ideal', or 'sepa_debit'",
                    typeof S,
                    (0, u.NQ)(o, "type")
                  );
                E = S;
              } else {
                if (void 0 !== S && S !== e)
                  return "string" != typeof S
                    ? (0, u.RH)(
                        "a string such as 'card', 'ideal', or 'sepa_debit'",
                        typeof S,
                        (0, u.NQ)(o, "type")
                      )
                    : (0, u.RH)(
                        '"'.concat(S, '"'),
                        '"'.concat(e, '"'),
                        (0, u.NQ)(o, "type")
                      );
                E = e;
              }
              var A = P[E],
                C = (P[E], (0, c.Z)(P, [E].map(r)));
              if (
                (-1 !==
                  [
                    "acss_debit",
                    "affirm",
                    "afterpay_clearpay",
                    "alipay",
                    "bancontact",
                    "customer_balance",
                    "eps",
                    "giropay",
                    "grabpay",
                    "klarna",
                    "konbini",
                    "mobilepay",
                    "oxxo",
                    "p24",
                    "paynow",
                    "paypal",
                    "pix",
                    "us_bank_account",
                    "wechat_pay",
                    "pay_by_bank",
                    "paynow",
                    "promptpay",
                    "qris",
                    "revolut_pay",
                    "zip",
                  ].indexOf(E) &&
                  void 0 === A &&
                  (A = {}),
                "object" != typeof A)
              )
                return (0, u.RH)(
                  "an object or element",
                  typeof n[E],
                  (0, u.NQ)(o, E)
                );
              if (null === A)
                return (0, u.RH)(
                  "an object or element",
                  "null",
                  (0, u.NQ)(o, E)
                );
              var N = (0, u.rX)(A);
              if (N) {
                var I = N._componentName;
                if (p._b[I] !== E) {
                  var T = [].concat((0, i.Z)(o.path), [E]).join("."),
                    M = o.label,
                    j = new s.No(
                      "Invalid value for "
                        .concat(M, ": ")
                        .concat(T, " was `")
                        .concat(I, "` Element, which cannot be used to create ")
                        .concat(E, " PaymentMethods.")
                    );
                  return (0, u.zS)(j);
                }
                return (0, u.x4)({
                  type: E,
                  element: N,
                  elements: null,
                  data: C,
                });
              }
              return (0, u.x4)({
                type: E,
                element: null,
                elements: null,
                data: P,
              });
            };
          },
          g = (0, u.Wc)(
            (0, u.mC)({
              handleActions: (0, u.Wc)(u.Xg, function () {
                return !0;
              }),
            }),
            function () {
              return { handleActions: !0 };
            }
          ),
          b = function (e) {
            return function (t, n) {
              if ("object" != typeof t) return (0, u.RH)("object", typeof t, n);
              if (null === t) return (0, u.RH)("object", "null", n);
              var r = t.billing_details,
                o = (0, c.Z)(t, ["billing_details"]);
              return (0, u.x4)({
                paymentMethodData: { type: "".concat(e), billing_details: r },
                otherParams: o,
              });
            };
          },
          w = function (e) {
            return function (t, n) {
              if ("object" != typeof t) return (0, u.RH)("object", typeof t, n);
              if (null === t) return (0, u.RH)("object", "null", n);
              var r = t.clientSecret,
                i = t.params,
                a = (0, c.Z)(t, ["clientSecret", "params"]),
                s = (0, u.ld)(e, r, n.label, { path: ["clientSecret"] });
              if ("error" === s.type) return s;
              if ("object" != typeof i)
                return (0, u.RH)("object", typeof i, (0, u.NQ)(n, "params"));
              if (null === i)
                return (0, u.RH)("object", "null", (0, u.NQ)(n, "params"));
              var l = i.payment_method_type,
                p = i.payment_method_data;
              return "string" != typeof l
                ? (0, u.RH)(
                    "string",
                    typeof l,
                    (0, u.NQ)((0, u.NQ)(n, "params"), "payment_method_type")
                  )
                : "object" != typeof p && void 0 !== p
                ? (0, u.RH)(
                    "object",
                    typeof p,
                    (0, u.NQ)((0, u.NQ)(n, "params"), "payment_method_data")
                  )
                : (0, u.x4)({
                    clientSecret: s.value,
                    paymentMethodData: (0, o.Z)(
                      { type: l },
                      (null == p ? void 0 : p.billing_details) && {
                        billing_details: null == p ? void 0 : p.billing_details,
                      }
                    ),
                    otherParams: a,
                  });
            };
          },
          k = function (e, t) {
            return function (n, r) {
              if (void 0 === n)
                return (0, u.x4)({
                  paymentMethodData: null,
                  paymentMethodOptions: null,
                  source: null,
                  paymentMethod: null,
                  otherParams: {},
                });
              if ("object" != typeof n) return (0, u.RH)("object", typeof n, r);
              if (null === n) return (0, u.RH)("object", "null", r);
              var a = n.source,
                p = n.source_data,
                d = n.payment_method_data,
                m = n.payment_method_options,
                f = n.payment_method,
                _ = (0, c.Z)(n, [
                  "source",
                  "source_data",
                  "payment_method_data",
                  "payment_method_options",
                  "payment_method",
                ]);
              if (null != p)
                throw new s.No(
                  "".concat(
                    t,
                    ": Expected payment_method, or source, not source_data."
                  )
                );
              if (null != d)
                throw new s.No(
                  "".concat(
                    t,
                    ": Expected payment_method, or source, not payment_method_data."
                  )
                );
              if (null != a && null != f)
                throw new s.No(
                  "".concat(
                    t,
                    ": Expected either payment_method or source, but not both."
                  )
                );
              if (null === e && null != f && "string" != typeof f)
                throw new s.No(
                  "".concat(
                    t,
                    ": Expected payment_method[type] to be set if payment_method is passed."
                  )
                );
              if (null != a) {
                if ("string" != typeof a)
                  return (0, u.RH)("string", typeof a, (0, u.NQ)(r, "source"));
                if ("updatePaymentIntent" === t)
                  throw new s.No(
                    "".concat(
                      t,
                      ": Expected payment_method, not source to be passed."
                    )
                  );
                return (0, u.x4)({
                  source: a,
                  paymentMethodData: null,
                  paymentMethodOptions: null,
                  paymentMethod: null,
                  otherParams: _,
                });
              }
              if (null != f && "string" != typeof f && "object" != typeof f)
                return (0, u.RH)(
                  "string or object",
                  typeof f,
                  (0, u.NQ)(r, "payment_method")
                );
              var h,
                y = (0, u.ld)(
                  ((h = e),
                  function (e, t) {
                    if (null == e) return (0, u.x4)(null);
                    if ("object" != typeof e)
                      return (0, u.RH)("object", typeof e, t);
                    var n = e.card,
                      r = (0, c.Z)(e, ["card"]);
                    if (!n || "object" != typeof n) return (0, u.x4)(e);
                    var i = n.cvc,
                      a = (0, c.Z)(n, ["cvc"]);
                    if (null == i) return (0, u.x4)(e);
                    var s = (0, u.rX)(i),
                      p = s ? s._componentName : "";
                    return l.Yj.cardCvc !== p
                      ? (0, u.RH)(
                          "`".concat(l.Yj.cardCvc, "` Element"),
                          p ? "`".concat(p, "` Element") : typeof i,
                          (0, u.NQ)(t, "".concat(h || "card", ".cvc"))
                        )
                      : (0, u.x4)(
                          (0, o.Z)(
                            (0, o.Z)({}, r),
                            {},
                            { card: (0, o.Z)((0, o.Z)({}, a), {}, { cvc: s }) }
                          )
                        );
                  }),
                  m,
                  t,
                  {
                    path: [].concat((0, i.Z)(r.path), [
                      "payment_method_options",
                    ]),
                  }
                );
              if ("error" === y.type) return y;
              if ("string" == typeof f)
                return (0, u.x4)({
                  source: null,
                  paymentMethodData: null,
                  paymentMethodOptions: y.value,
                  paymentMethod: f,
                  otherParams: _,
                });
              if ("object" == typeof f && null !== f) {
                var g = (0, u.ld)(v(e), f, t, {
                  path: [].concat((0, i.Z)(r.path), ["payment_method"]),
                });
                if ("error" === g.type) return g;
                var b = g.value;
                return (0, u.x4)({
                  source: null,
                  paymentMethod: null,
                  paymentMethodOptions: y.value,
                  paymentMethodData: b,
                  otherParams: _,
                });
              }
              return (0, u.x4)({
                source: null,
                paymentMethodData: null,
                paymentMethodOptions: null,
                paymentMethod: null,
                otherParams: _,
              });
            };
          };
      },
      6042: function (e, t, n) {
        "use strict";
        n.d(t, {
          G: function () {
            return i;
          },
          q: function () {
            return o;
          },
        });
        var r = n(755),
          o = function (e, t) {
            var n = e.createLightboxFrame({
              type: r.NC.LIGHTBOX_APP,
              options: t,
            });
            return (
              n.show(),
              n._on("nested-frame-loaded", function () {
                n.fadeInBackdrop(),
                  setTimeout(function () {
                    n.action.openLightboxFrame();
                  }, 200);
              }),
              n
            );
          },
          i = function (e) {
            return e.action.closeLightboxFrame(), e.destroy();
          };
      },
      1164: function (e, t, n) {
        "use strict";
        n.d(t, {
          vS: function () {
            return i;
          },
          ud: function () {
            return o;
          },
          jR: function () {
            return l;
          },
        });
        var r = {
            ar: "ar",
            bg: "bg",
            cs: "cs",
            da: "da",
            de: "de",
            el: "el",
            en: "en",
            es: "es",
            "es-419": "es-419",
            et: "et",
            fi: "fi",
            fil: "fil",
            fr: "fr",
            he: "he",
            hr: "hr",
            hu: "hu",
            id: "id",
            it: "it",
            ja: "ja",
            ko: "ko",
            lt: "lt",
            lv: "lv",
            ms: "ms",
            mt: "mt",
            nb: "nb",
            nl: "nl",
            no: "no",
            pl: "pl",
            pt: "pt",
            "pt-BR": "pt-BR",
            ru: "ru",
            ro: "ro",
            sk: "sk",
            sl: "sl",
            sv: "sv",
            th: "th",
            tr: "tr",
            vi: "vi",
            zh: "zh",
            "zh-HK": "zh-HK",
            "zh-TW": "zh-TW",
          },
          o = ["ar", "he"],
          i = "en",
          a = (Object.keys(r), r),
          c = n(9294),
          s = n(1765),
          u = function (e) {
            try {
              var t = (function (e) {
                  var t = e.split("-"),
                    n = t[0],
                    r = null,
                    o = null,
                    i = null;
                  if (
                    (t.length > 1 &&
                      (4 === t[1].length
                        ? (o = t[1])
                        : 2 === t[1].length || 3 === t[1].length
                        ? (r = t[1])
                        : (i = t[1])),
                    t.length > 2 &&
                      (2 === t[2].length || 3 === t[2].length
                        ? (r = t[2])
                        : (i = t[2])),
                    t.length > 3 && (i = t[3]),
                    2 !== n.length && 3 !== n.length)
                  )
                    throw new Error("invalid locale ".concat(e));
                  var a = n.toLowerCase(),
                    c = r ? r.toUpperCase() : null,
                    s = o
                      ? ""
                          .concat(o[0].toUpperCase())
                          .concat(o.substring(1).toLowerCase())
                      : null;
                  return {
                    locale:
                      a +
                      (s ? "-".concat(s) : "") +
                      (c ? "-".concat(c) : "") +
                      (i ? "-".concat(i) : ""),
                    language: a,
                    region: c,
                    script: s,
                    variant: i,
                  };
                })(e),
                n = t.locale,
                r = t.language;
              return n !== r ? [n, r, i] : [n, i];
            } catch (t) {
              return [e, i];
            }
          },
          l = function (e) {
            return (function (e) {
              for (var t = u(e), n = 0; n < t.length; n++) {
                var r = t[n];
                if (a[r]) {
                  var o = a[r];
                  if (
                    (0, s.uN)(s.ub, s.M4.stripe_js_beta_locales) ||
                    -1 === s.P3.indexOf(o)
                  )
                    return o;
                }
              }
              return "en";
            })("auto" === e ? (0, c.UT)() : e);
          };
      },
      4400: function (e, t, n) {
        "use strict";
        function r(e, t) {
          (null == t || t > e.length) && (t = e.length);
          for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
          return r;
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
      },
      2781: function (e, t, n) {
        "use strict";
        function r(e) {
          if (Array.isArray(e)) return e;
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
      },
      1764: function (e, t, n) {
        "use strict";
        function r(e) {
          if (Array.isArray(e)) return (0, o.Z)(e);
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
        var o = n(4400);
      },
      6148: function (e, t, n) {
        "use strict";
        function r(e) {
          if (void 0 === e)
            throw new ReferenceError(
              "this hasn't been initialised - super() hasn't been called"
            );
          return e;
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
      },
      7853: function (e, t, n) {
        "use strict";
        function r(e, t) {
          if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function");
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
      },
      3009: function (e, t, n) {
        "use strict";
        function r() {
          return (
            (r = (0, i.Z)()
              ? Reflect.construct
              : function (e, t, n) {
                  var r = [null];
                  r.push.apply(r, t);
                  var i = new (Function.bind.apply(e, r))();
                  return n && (0, o.Z)(i, n.prototype), i;
                }),
            r.apply(null, arguments)
          );
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
        var o = n(9384),
          i = n(3268);
      },
      4531: function (e, t, n) {
        "use strict";
        function r(e, t) {
          for (var n = 0; n < t.length; n++) {
            var r = t[n];
            (r.enumerable = r.enumerable || !1),
              (r.configurable = !0),
              "value" in r && (r.writable = !0),
              Object.defineProperty(e, r.key, r);
          }
        }
        function o(e, t, n) {
          return t && r(e.prototype, t), n && r(e, n), e;
        }
        n.d(t, {
          Z: function () {
            return o;
          },
        });
      },
      8992: function (e, t, n) {
        "use strict";
        function r(e) {
          var t = (0, i.Z)();
          return function () {
            var n,
              r = (0, o.Z)(e);
            if (t) {
              var i = (0, o.Z)(this).constructor;
              n = Reflect.construct(r, arguments, i);
            } else n = r.apply(this, arguments);
            return (0, a.Z)(this, n);
          };
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
        var o = n(3538),
          i = n(3268),
          a = n(5679);
      },
      6222: function (e, t, n) {
        "use strict";
        function r(e, t, n) {
          return (
            t in e
              ? Object.defineProperty(e, t, {
                  value: n,
                  enumerable: !0,
                  configurable: !0,
                  writable: !0,
                })
              : (e[t] = n),
            e
          );
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
      },
      9043: function (e, t, n) {
        "use strict";
        function r() {
          return (
            (r =
              Object.assign ||
              function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = arguments[t];
                  for (var r in n)
                    Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
                }
                return e;
              }),
            r.apply(this, arguments)
          );
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
      },
      3538: function (e, t, n) {
        "use strict";
        function r(e) {
          return (
            (r = Object.setPrototypeOf
              ? Object.getPrototypeOf
              : function (e) {
                  return e.__proto__ || Object.getPrototypeOf(e);
                }),
            r(e)
          );
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
      },
      1020: function (e, t, n) {
        "use strict";
        function r(e, t) {
          if ("function" != typeof t && null !== t)
            throw new TypeError(
              "Super expression must either be null or a function"
            );
          (e.prototype = Object.create(t && t.prototype, {
            constructor: { value: e, writable: !0, configurable: !0 },
          })),
            t && (0, o.Z)(e, t);
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
        var o = n(9384);
      },
      3043: function (e, t, n) {
        "use strict";
        function r(e) {
          return -1 !== Function.toString.call(e).indexOf("[native code]");
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
      },
      3268: function (e, t, n) {
        "use strict";
        function r() {
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
          } catch (e) {
            return !1;
          }
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
      },
      5253: function (e, t, n) {
        "use strict";
        function r(e) {
          if ("undefined" != typeof Symbol && Symbol.iterator in Object(e))
            return Array.from(e);
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
      },
      7090: function (e, t, n) {
        "use strict";
        function r(e, t) {
          if ("undefined" != typeof Symbol && Symbol.iterator in Object(e)) {
            var n = [],
              r = !0,
              o = !1,
              i = void 0;
            try {
              for (
                var a, c = e[Symbol.iterator]();
                !(r = (a = c.next()).done) &&
                (n.push(a.value), !t || n.length !== t);
                r = !0
              );
            } catch (e) {
              (o = !0), (i = e);
            } finally {
              try {
                r || null == c.return || c.return();
              } finally {
                if (o) throw i;
              }
            }
            return n;
          }
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
      },
      4501: function (e, t, n) {
        "use strict";
        function r() {
          throw new TypeError(
            "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
          );
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
      },
      2646: function (e, t, n) {
        "use strict";
        function r() {
          throw new TypeError(
            "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
          );
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
      },
      8489: function (e, t, n) {
        "use strict";
        function r(e, t) {
          var n = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var r = Object.getOwnPropertySymbols(e);
            t &&
              (r = r.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              n.push.apply(n, r);
          }
          return n;
        }
        function o(e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? r(Object(n), !0).forEach(function (t) {
                  (0, i.Z)(e, t, n[t]);
                })
              : Object.getOwnPropertyDescriptors
              ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
              : r(Object(n)).forEach(function (t) {
                  Object.defineProperty(
                    e,
                    t,
                    Object.getOwnPropertyDescriptor(n, t)
                  );
                });
          }
          return e;
        }
        n.d(t, {
          Z: function () {
            return o;
          },
        });
        var i = n(6222);
      },
      508: function (e, t, n) {
        "use strict";
        function r(e, t) {
          if (null == e) return {};
          var n,
            r,
            i = (0, o.Z)(e, t);
          if (Object.getOwnPropertySymbols) {
            var a = Object.getOwnPropertySymbols(e);
            for (r = 0; r < a.length; r++)
              (n = a[r]),
                t.indexOf(n) >= 0 ||
                  (Object.prototype.propertyIsEnumerable.call(e, n) &&
                    (i[n] = e[n]));
          }
          return i;
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
        var o = n(5178);
      },
      5178: function (e, t, n) {
        "use strict";
        function r(e, t) {
          if (null == e) return {};
          var n,
            r,
            o = {},
            i = Object.keys(e);
          for (r = 0; r < i.length; r++)
            (n = i[r]), t.indexOf(n) >= 0 || (o[n] = e[n]);
          return o;
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
      },
      5679: function (e, t, n) {
        "use strict";
        function r(e, t) {
          return !t || ("object" !== (0, o.Z)(t) && "function" != typeof t)
            ? (0, i.Z)(e)
            : t;
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
        var o = n(9675),
          i = n(6148);
      },
      9384: function (e, t, n) {
        "use strict";
        function r(e, t) {
          return (
            (r =
              Object.setPrototypeOf ||
              function (e, t) {
                return (e.__proto__ = t), e;
              }),
            r(e, t)
          );
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
      },
      7904: function (e, t, n) {
        "use strict";
        function r(e, t) {
          return (0, o.Z)(e) || (0, i.Z)(e, t) || (0, a.Z)(e, t) || (0, c.Z)();
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
        var o = n(2781),
          i = n(7090),
          a = n(2327),
          c = n(4501);
      },
      3696: function (e, t, n) {
        "use strict";
        function r(e) {
          return (0, o.Z)(e) || (0, i.Z)(e) || (0, a.Z)(e) || (0, c.Z)();
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
        var o = n(1764),
          i = n(5253),
          a = n(2327),
          c = n(2646);
      },
      9675: function (e, t, n) {
        "use strict";
        function r(e) {
          return (
            (r =
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
            r(e)
          );
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
      },
      2327: function (e, t, n) {
        "use strict";
        function r(e, t) {
          if (e) {
            if ("string" == typeof e) return (0, o.Z)(e, t);
            var n = Object.prototype.toString.call(e).slice(8, -1);
            return (
              "Object" === n && e.constructor && (n = e.constructor.name),
              "Map" === n || "Set" === n
                ? Array.from(e)
                : "Arguments" === n ||
                  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                ? (0, o.Z)(e, t)
                : void 0
            );
          }
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
        var o = n(4400);
      },
      4909: function (e, t, n) {
        "use strict";
        function r(e) {
          var t = "function" == typeof Map ? new Map() : void 0;
          return (
            (r = function (e) {
              function n() {
                return (0, c.Z)(e, arguments, (0, o.Z)(this).constructor);
              }
              if (null === e || !(0, a.Z)(e)) return e;
              if ("function" != typeof e)
                throw new TypeError(
                  "Super expression must either be null or a function"
                );
              if (void 0 !== t) {
                if (t.has(e)) return t.get(e);
                t.set(e, n);
              }
              return (
                (n.prototype = Object.create(e.prototype, {
                  constructor: {
                    value: n,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0,
                  },
                })),
                (0, i.Z)(n, e)
              );
            }),
            r(e)
          );
        }
        n.d(t, {
          Z: function () {
            return r;
          },
        });
        var o = n(3538),
          i = n(9384),
          a = n(3043),
          c = n(3009);
      },
    },
    o = {};
  (e.m = r),
    (e.n = function (t) {
      var n =
        t && t.__esModule
          ? function () {
              return t.default;
            }
          : function () {
              return t;
            };
      return e.d(n, { a: n }), n;
    }),
    (e.d = function (t, n) {
      for (var r in n)
        e.o(n, r) &&
          !e.o(t, r) &&
          Object.defineProperty(t, r, { enumerable: !0, get: n[r] });
    }),
    (e.f = {}),
    (e.e = function (t) {
      return Promise.all(
        Object.keys(e.f).reduce(function (n, r) {
          return e.f[r](t, n), n;
        }, [])
      );
    }),
    (e.u = function (e) {
      return (
        "fingerprinted/js/" +
        {
          1: "elements-affirm-modal",
          209: "elements-affirm-message",
          259: "elements-afterpay-clearpay-modal",
          404: "orders-outer",
          428: "payment-intent-outer-actions-cardimageverification",
          429: "elements-unified-message",
          557: "elements-unified-message-modal",
          578: "elements-afterpay-clearpay-message",
          913: "trusted-types-checker",
        }[e] +
        "-" +
        {
          1: "b8ac47241049d5a59e0b54a4a3240c3f",
          209: "450513b7be61a2eaa571c417bf018061",
          259: "9b78e6196519281e09f8a8b01f5d83a8",
          404: "b6f3504cdf472ca30048031a9656030b",
          428: "a3f202ea9dc92eb350944d752a13b6f8",
          429: "fdfcf28a0df9b0ab2c20d17777f8a49f",
          557: "6554e12a488889354b071e59e4ad5442",
          578: "c97d6a3c9bd53a83e2c27daae6271eec",
          913: "e3dccb45feb70a9564a749fc391bf7dd",
        }[e] +
        ".js"
      );
    }),
    (e.g = (function () {
      if ("object" == typeof globalThis) return globalThis;
      try {
        return this || new Function("return this")();
      } catch (e) {
        if ("object" == typeof window) return window;
      }
    })()),
    (e.o = function (e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }),
    (t = {}),
    (n = "stripe-js-v3:"),
    (e.l = function (r, o, i) {
      if (t[r]) t[r].push(o);
      else {
        var a, c;
        if (void 0 !== i)
          for (
            var s = document.getElementsByTagName("script"), u = 0;
            u < s.length;
            u++
          ) {
            var l = s[u];
            if (
              l.getAttribute("src") == r ||
              l.getAttribute("data-webpack") == n + i
            ) {
              a = l;
              break;
            }
          }
        a ||
          ((c = !0),
          ((a = document.createElement("script")).charset = "utf-8"),
          (a.timeout = 120),
          e.nc && a.setAttribute("nonce", e.nc),
          a.setAttribute("data-webpack", n + i),
          (a.src = r)),
          (t[r] = [o]);
        var p = function (e, n) {
            (a.onerror = a.onload = null), clearTimeout(d);
            var o = t[r];
            if (
              (delete t[r],
              a.parentNode && a.parentNode.removeChild(a),
              o &&
                o.forEach(function (e) {
                  return e(n);
                }),
              e)
            )
              return e(n);
          },
          d = setTimeout(
            p.bind(null, void 0, { type: "timeout", target: a }),
            12e4
          );
        (a.onerror = p.bind(null, a.onerror)),
          (a.onload = p.bind(null, a.onload)),
          c && document.head.appendChild(a);
      }
    }),
    (e.r = function (e) {
      "undefined" != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(e, "__esModule", { value: !0 });
    }),
    (e.p = "https://js.stripe.com/v3/"),
    (function () {
      var t = { 734: 0 };
      e.f.j = function (n, r) {
        var o = e.o(t, n) ? t[n] : void 0;
        if (0 !== o)
          if (o) r.push(o[2]);
          else {
            var i = new Promise(function (e, r) {
              o = t[n] = [e, r];
            });
            r.push((o[2] = i));
            var a = e.p + e.u(n),
              c = new Error();
            e.l(
              a,
              function (r) {
                if (e.o(t, n) && (0 !== (o = t[n]) && (t[n] = void 0), o)) {
                  var i = r && ("load" === r.type ? "missing" : r.type),
                    a = r && r.target && r.target.src;
                  (c.message =
                    "Loading chunk " + n + " failed.\n(" + i + ": " + a + ")"),
                    (c.name = "ChunkLoadError"),
                    (c.type = i),
                    (c.request = a),
                    o[1](c);
                }
              },
              "chunk-" + n,
              n
            );
          }
      };
      var n = function (n, r) {
          var o,
            i,
            a = r[0],
            c = r[1],
            s = r[2],
            u = 0;
          if (
            a.some(function (e) {
              return 0 !== t[e];
            })
          ) {
            for (o in c) e.o(c, o) && (e.m[o] = c[o]);
            if (s) s(e);
          }
          for (n && n(r); u < a.length; u++)
            (i = a[u]), e.o(t, i) && t[i] && t[i][0](), (t[i] = 0);
        },
        r = (window.webpackChunkstripe_js_v3 =
          window.webpackChunkstripe_js_v3 || []);
      r.forEach(n.bind(null, 0)), (r.push = n.bind(null, r.push.bind(r)));
    })(),
    (function () {
      "use strict";
      function t(e, n, r) {
        return (
          (t =
            "undefined" != typeof Reflect && Reflect.get
              ? Reflect.get
              : function (e, t, n) {
                  var r = (function (e, t) {
                    for (
                      ;
                      !Object.prototype.hasOwnProperty.call(e, t) &&
                      null !== (e = (0, Mt.Z)(e));

                    );
                    return e;
                  })(e, t);
                  if (r) {
                    var o = Object.getOwnPropertyDescriptor(r, t);
                    return o.get ? o.get.call(n) : o.value;
                  }
                }),
          t(e, n, r || e)
        );
      }
      var n,
        r,
        o,
        i,
        a,
        c = e(8489),
        s = e(3696),
        u = e(7853),
        l = e(4531),
        p = e(6222),
        d = e(508),
        m = e(1873),
        f = e(7412),
        _ = e(1002),
        h = e(9294),
        y = e(6617),
        v = e(1765),
        g = e(2024),
        b = e(8812),
        w = e(9439),
        k = e(276),
        E = function (e, t) {
          var n = e.reduce(function (e, n) {
            var r = (function (e, t) {
                var n = e.indexOf(":");
                if (-1 === n)
                  throw new b.No(
                    "Invalid css declaration in file from "
                      .concat(t, ': "')
                      .concat(e, '"')
                  );
                var r = e.slice(0, n).trim(),
                  o = k.Pp[r];
                if (!o)
                  throw new b.No(
                    "Unsupported css property in file from "
                      .concat(t, ': "')
                      .concat(r, '"')
                  );
                return { property: o, value: e.slice(n + 1).trim() };
              })(n, t),
              o = r.property,
              i = r.value;
            return (0, c.Z)((0, c.Z)({}, e), {}, (0, p.Z)({}, o, i));
          }, {});
          return (
            ["family", "src"].forEach(function (e) {
              if (!n[e])
                throw new b.No(
                  "Missing css property in file from "
                    .concat(t, ': "')
                    .concat(k.QL[e], '"')
                );
            }),
            n
          );
        },
        S = function (e) {
          return (0, w.h)({ url: e, method: "GET" })
            .then(function (e) {
              return e.responseText;
            })
            .then(function (t) {
              var n = (function (e, t) {
                var n = e.match(/@font-face[ ]?{[^}]*}/g);
                if (!n)
                  throw new b.No(
                    "No @font-face rules found in file from ".concat(t)
                  );
                return n;
              })(t, e);
              return n.map(function (t) {
                var n,
                  r = (function (e, t) {
                    var n = e.replace(/\/\*.*\*\//g, "").trim(),
                      r = (
                        n.length && /;$/.test(n) ? n : "".concat(n, ";")
                      ).match(/((([^;(]*\([^()]*\)[^;)]*)|[^;]+)+)(?=;)/g);
                    if (!r)
                      throw new b.No(
                        "Found @font-face rule containing no valid font-properties in file from ".concat(
                          t
                        )
                      );
                    return r;
                  })((n = t.match(/@font-face[ ]?{([^}]*)}/)) ? n[1] : "", e);
                return E(r, e);
              });
            });
        },
        P = /https?:\/\/([^/]*)\/[^:]*/g,
        A = function (e, t, n, r) {
          var o,
            i,
            a,
            c = e._isUserError || "IntegrationError" === e.name;
          throw (
            (t &&
              !c &&
              t.report("fatal.uncaught_error", {
                iframe: !1,
                name: e.name,
                element: "outer",
                message: e.message || e.description,
                fileName: e.fileName,
                lineNumber: e.lineNumber,
                columnNumber: e.columnNumber,
                stack:
                  e.stack &&
                  ((o = e.stack),
                  (i = o.match(P)),
                  (a = o),
                  i &&
                    i.forEach(function (e) {
                      -1 === e.indexOf("https://js.stripe.com") &&
                        (a = a.replace(e, "<external url>"));
                    }),
                  a.substring(0, 1e3)),
                inPromise: n,
                apiMethodName: r,
              }),
            e)
          );
        },
        C = function (e, t, n) {
          return function (r) {
            try {
              return e.call(this, r);
            } catch (e) {
              return A(e, t || (this && this._controller), !1, n);
            }
          };
        },
        N = function (e, t, n) {
          return function (r, o) {
            try {
              return e.call(this, r, o);
            } catch (e) {
              return A(e, t || (this && this._controller), !1, n);
            }
          };
        },
        I = function (e, t, n) {
          return function () {
            var r = this;
            try {
              return e.call(this).catch(function (e) {
                return A(e, t || (r && r._controller), !0, n);
              });
            } catch (e) {
              return A(e, t || (this && this._controller), !1, n);
            }
          };
        },
        T = function (e, t, n) {
          return function (r) {
            var o = this;
            try {
              return e.call(this, r).catch(function (e) {
                return A(e, t || (o && o._controller), !0, n);
              });
            } catch (e) {
              return A(e, t || (this && this._controller), !1, n);
            }
          };
        },
        M = function (e, t, n) {
          return function (r, o) {
            var i = this;
            try {
              return e.call(this, r, o).catch(function (e) {
                return A(e, t || (i && i._controller), !0, n);
              });
            } catch (e) {
              return A(e, t || (this && this._controller), !1, n);
            }
          };
        },
        j = function (e, t, n) {
          return function (r, o, i) {
            var a = this;
            try {
              return e.call(this, r, o, i).catch(function (e) {
                return A(e, t || (a && a._controller), !0, n);
              });
            } catch (e) {
              return A(e, t || (this && this._controller), !1, n);
            }
          };
        },
        O = e(9083),
        R = function (e, t) {
          var n,
            r =
              ("string" == typeof (n = e) &&
                (0, g.sE)(Object.keys(O.YA), function (e) {
                  return e === n;
                })) ||
              null;
          if (
            !r ||
            !(function (e, t) {
              var n = v.MJ[e];
              return !n || (0, v.uN)(t, n);
            })(r, t)
          ) {
            var o = "string" == typeof e ? e : typeof e;
            throw new b.No(
              "A valid Element name must be provided. Valid Elements are:\n  "
                .concat(
                  Object.keys(O.YA)
                    .filter(function (e) {
                      return !O.YA[e].beta;
                    })
                    .join(", "),
                  "; you passed: "
                )
                .concat(o, ".")
            );
          }
        },
        Z = e(6148),
        x = e(1020),
        L = e(8992),
        D = function e() {
          var t = this;
          (0, u.Z)(this, e),
            (this._emit = function (e) {
              for (
                var n = arguments.length,
                  r = new Array(n > 1 ? n - 1 : 0),
                  o = 1;
                o < n;
                o++
              )
                r[o - 1] = arguments[o];
              var i = t._callbacks[e] || [];
              return (
                i.forEach(function (n) {
                  var o = n.fn;
                  if (o._isUserCallback)
                    try {
                      o.apply(void 0, r);
                    } catch (n) {
                      throw (
                        ((n._isUserError = !0),
                        "checkout" === e &&
                          t._cancelCheckout &&
                          t._cancelCheckout(
                            n.message ||
                              "An unexpected error has occurred. Please refresh the page and try again."
                          ),
                        n)
                      );
                    }
                  else o.apply(void 0, r);
                }),
                t
              );
            }),
            (this._once = function (e, n) {
              return t._on(
                e,
                function r() {
                  t._off(e, r), n.apply(void 0, arguments);
                },
                n
              );
            }),
            (this._removeAllListeners = function () {
              return (t._callbacks = {}), t;
            }),
            (this._on = function (e, n, r) {
              return (
                (t._callbacks[e] = t._callbacks[e] || []),
                t._callbacks[e].push({ original: r, fn: n }),
                t
              );
            }),
            (this._validateUserOn = function () {}),
            (this._userOn = function (e, n) {
              if ("string" != typeof e)
                throw new b.No(
                  "When adding an event listener, the first argument should be a string event name."
                );
              if ("function" != typeof n)
                throw new b.No(
                  "When adding an event listener, the second argument should be a function callback."
                );
              return (
                t._validateUserOn(e, n), (n._isUserCallback = !0), t._on(e, n)
              );
            }),
            (this._hasRegisteredListener = function (e) {
              return t._callbacks[e] && t._callbacks[e].length > 0;
            }),
            (this._off = function (e, n) {
              if (n) {
                for (var r, o = t._callbacks[e], i = 0; i < o.length; i++)
                  if ((r = o[i]).fn === n || r.original === n) {
                    o.splice(i, 1);
                    break;
                  }
              } else delete t._callbacks[e];
              return t;
            }),
            (this._callbacks = {});
          var n,
            r,
            o,
            i = N(this._userOn),
            a = N(this._off),
            c = N(this._once),
            s = C(this._hasRegisteredListener),
            l = C(this._removeAllListeners),
            p =
              ((n = this._emit),
              function () {
                try {
                  for (
                    var e = arguments.length, t = new Array(e), i = 0;
                    i < e;
                    i++
                  )
                    t[i] = arguments[i];
                  return n.call.apply(n, [this].concat(t));
                } catch (e) {
                  return A(e, r || (this && this._controller), !1, o);
                }
              });
          (this.on = this.addListener = this.addEventListener = i),
            (this.off = this.removeListener = this.removeEventListener = a),
            (this.once = c),
            (this.hasRegisteredListener = s),
            (this.removeAllListeners = l),
            (this.emit = p);
        },
        B = e(6589),
        q = e(4245),
        F = {
          applePay: "applePay",
          googlePay: "googlePay",
          browserCard: "browserCard",
          link: "link",
        },
        U = function (e, t) {
          return e.indexOf(t) >= 0;
        },
        G = function () {
          return Object.keys(F);
        },
        Y = "40px",
        z = {
          success: "success",
          fail: "fail",
          invalid_shipping_address: "invalid_shipping_address",
        },
        H = { shipping: "shipping", delivery: "delivery", pickup: "pickup" },
        K = (0, c.Z)(
          { success: "success" },
          {
            fail: "fail",
            invalid_payer_name: "invalid_payer_name",
            invalid_payer_email: "invalid_payer_email",
            invalid_payer_phone: "invalid_payer_phone",
            invalid_shipping_address: "invalid_shipping_address",
          }
        ),
        J = { merchantCapabilities: ["supports3DS"], displayItems: [] },
        W = (0, m.mC)({ amount: m.MZ, label: m.Z_, pending: (0, m.jt)(m.Xg) }),
        V = (0, m.mC)({ amount: m.Bi, label: m.Z_, pending: (0, m.jt)(m.Xg) }),
        X = (0, m.mC)({
          amount: m.Bi,
          label: m.Z_,
          pending: (0, m.jt)(m.Xg),
          id: (0, m.Wc)(m.Z_, function () {
            return (0, f.To)("shippingOption");
          }),
          detail: (0, m.Wc)(m.Z_, function () {
            return "";
          }),
        }),
        Q = (0, m.mC)({ major: m.Rx, minor: m.Rx }),
        $ = m.kw.apply(void 0, (0, s.Z)(Object.keys(H))),
        ee = (0, m.mC)({ origin: m.Z_, name: m.Z_ }),
        te = (0, m.ci)({
          __merchantDetails: (0, m.jt)(ee),
          country: (0, m.jt)(m.hN),
          currency: (0, m.jt)(m.cV),
          displayItems: (0, m.jt)((0, m.CT)(V)),
          shippingOptions: (0, m.jt)((0, m.uw)("id")((0, m.CT)(X))),
          total: (0, m.jt)(W),
          blockedCardBrands: (0, m.jt)(
            (0, m.CT)(m.kw.apply(void 0, (0, s.Z)(k.iw)))
          ),
        }),
        ne = (0, m.mC)({
          displayItems: (0, m.jt)((0, m.CT)(V)),
          shippingOptions: (0, m.jt)((0, m.uw)("id")((0, m.CT)(X))),
          total: (0, m.jt)(W),
          status: function (e, t) {
            return m.kw.apply(void 0, (0, s.Z)(Object.keys(z)))(
              -1 !==
                [
                  "invalid_payer_name",
                  "invalid_payer_email",
                  "invalid_payer_phone",
                ].indexOf(e)
                ? "fail"
                : e,
              t
            );
          },
        }),
        re = m.kw.apply(void 0, (0, s.Z)(Object.keys(K))),
        oe = function (e) {
          var t = [];
          return window.ApplePaySession
            ? (U(e, F.applePay) && t.push("APPLE_PAY"),
              U(e, F.link) && t.push("LINK"),
              t)
            : (U(e, F.link) && t.push("LINK"),
              U(e, F.googlePay) &&
                (t.push("GOOGLE_PAY"), h.sV && t.push("BROWSER")),
              U(e, F.browserCard) &&
                -1 === t.indexOf("BROWSER") &&
                t.push("BROWSER"),
              t);
        },
        ie = function () {
          try {
            return window.location.origin === window.top.location.origin;
          } catch (e) {
            return !1;
          }
        },
        ae = (0, q.HP)(function (e) {
          return window.ApplePaySession.canMakePaymentsWithActiveCard(e);
        }),
        ce = function (e) {
          if (!window.ApplePaySession) return !1;
          try {
            return window.ApplePaySession.supportsVersion(e);
          } catch (e) {
            return !1;
          }
        },
        se = function (e, t, n, r) {
          var o =
            arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : 2;
          if ("https:" !== window.location.protocol) return B.J.resolve(!1);
          var i = Math.max(2, o);
          if (window.ApplePaySession) {
            if (ie()) {
              if (window.ApplePaySession.supportsVersion(i)) {
                var a = t ? [e, t] : [e],
                  c = "merchant.".concat(a.join("."), ".stripe");
                return ae(c).then(function (o) {
                  if (
                    (r("pr.apple_pay.can_make_payment_native_response", {
                      available: o,
                    }),
                    n && !o && window.console)
                  ) {
                    var i = t
                      ? "or stripeAccount parameter (".concat(t, ") ")
                      : "";
                    window.console.warn(
                      "Either you do not have a card saved to your Wallet or the current domain ("
                        .concat(e, ") ")
                        .concat(
                          i,
                          "is not registered for Apple Pay. Visit https://dashboard.stripe.com/account/apple_pay to register this domain."
                        )
                    );
                  }
                  return o;
                });
              }
              return (
                n &&
                  window.console &&
                  window.console.warn(
                    "This version of Safari does not support ApplePay JS version ".concat(
                      i,
                      "."
                    )
                  ),
                B.J.resolve(!1)
              );
            }
            return B.J.resolve(!1);
          }
          return B.J.resolve(!1);
        },
        ue =
          ((n = {}),
          (0, p.Z)(n, k.rM.VISA, "visa"),
          (0, p.Z)(n, k.rM.MASTERCARD, "masterCard"),
          (0, p.Z)(n, k.rM.AMEX, "amex"),
          (0, p.Z)(n, k.rM.DISCOVER, "discover"),
          (0, p.Z)(n, k.rM.JCB, "jcb"),
          (0, p.Z)(n, k.rM.UNIONPAY, "chinaUnionPay"),
          (0, p.Z)(n, k.rM.DINERS, null),
          (0, p.Z)(n, "MAESTRO", "maestro"),
          (0, p.Z)(n, "CARTES_BANCAIRES", "cartesBancaires"),
          n),
        le =
          ((r = {}),
          (0, p.Z)(r, k.rM.VISA, "VISA"),
          (0, p.Z)(r, k.rM.MASTERCARD, "MASTERCARD"),
          (0, p.Z)(r, k.rM.AMEX, "AMEX"),
          (0, p.Z)(r, k.rM.DISCOVER, "DISCOVER"),
          (0, p.Z)(r, k.rM.JCB, "JCB"),
          (0, p.Z)(r, k.rM.DINERS, null),
          [
            "AT",
            "AU",
            "BE",
            "CA",
            "CH",
            "DE",
            "DK",
            "EE",
            "ES",
            "FI",
            "FR",
            "GB",
            "GR",
            "HK",
            "IE",
            "IT",
            "JP",
            "LT",
            "LU",
            "LV",
            "MX",
            "NL",
            "NO",
            "NZ",
            "PL",
            "PT",
            "SE",
            "SG",
            "US",
          ]),
        pe = function (e, t, n) {
          var r = [];
          return (
            -1 !== le.indexOf(e) && r.push(k.rM.AMEX),
            ("US" === e || t) &&
              r.push.apply(r, [k.rM.DISCOVER, k.rM.DINERS, k.rM.JCB]),
            r.push.apply(r, [k.rM.MASTERCARD, k.rM.VISA]),
            r.filter(function (e) {
              return -1 === n.indexOf(e);
            })
          );
        },
        de = function (e, t, n) {
          return pe(e, t, n).reduce(function (e, t) {
            var n = ue[t];
            return n && e.push(n), e;
          }, []);
        },
        me = e(6241),
        fe = function (e, t) {
          return {
            amount: (0, me.Fe)(e.amount, t.currency),
            label: e.label,
            type: e.pending ? "pending" : "final",
          };
        },
        _e = function (e, t) {
          return new window.ApplePayError(e, t);
        },
        he = function (e) {
          return function (t) {
            return t[e] && "string" == typeof t[e] ? t[e].toUpperCase() : null;
          };
        },
        ye =
          ((o = {}),
          (0, p.Z)(o, K.success, 0),
          (0, p.Z)(o, K.fail, 1),
          (0, p.Z)(o, K.invalid_payer_name, 2),
          (0, p.Z)(o, K.invalid_shipping_address, 3),
          (0, p.Z)(o, K.invalid_payer_phone, 4),
          (0, p.Z)(o, K.invalid_payer_email, 4),
          o),
        ve =
          ((i = {}),
          (0, p.Z)(i, K.success, function () {
            return null;
          }),
          (0, p.Z)(i, K.fail, function () {
            return null;
          }),
          (0, p.Z)(i, K.invalid_payer_name, function () {
            return _e("billingContactInvalid", "name");
          }),
          (0, p.Z)(i, K.invalid_shipping_address, function () {
            return _e("shippingContactInvalid", "postalAddress");
          }),
          (0, p.Z)(i, K.invalid_payer_phone, function () {
            return _e("shippingContactInvalid", "phoneNumber");
          }),
          (0, p.Z)(i, K.invalid_payer_email, function () {
            return _e("shippingContactInvalid", "emailAddress");
          }),
          i),
        ge =
          ((a = {}),
          (0, p.Z)(a, H.pickup, "storePickup"),
          (0, p.Z)(a, H.shipping, "shipping"),
          (0, p.Z)(a, H.delivery, "delivery"),
          a),
        be = {
          total: function (e) {
            return fe(e.total, e);
          },
          lineItems: function (e) {
            return e.displayItems
              ? e.displayItems.map(function (t) {
                  return fe(t, e);
                })
              : [];
          },
          shippingMethods: function (e) {
            return e.shippingOptions
              ? e.shippingOptions.map(function (t) {
                  return (function (e, t) {
                    return {
                      amount: (0, me.Fe)(e.amount, t.currency),
                      label: e.label,
                      detail: e.detail,
                      identifier: e.id,
                    };
                  })(t, e);
                })
              : [];
          },
          applicationData: function (e) {
            return e.applicationData || null;
          },
        },
        we = {
          shippingType: function (e) {
            var t = e.shippingType;
            if (!t) return null;
            var n = ge[t];
            if (void 0 !== n) return n;
            throw new b.No("Invalid value for shippingType: ".concat(t));
          },
          requiredBillingContactFields: function (e) {
            return e.requestPayerName ? ["postalAddress"] : null;
          },
          requiredShippingContactFields: function (e) {
            var t = [];
            return (
              e.requestShipping && t.push("postalAddress"),
              e.requestPayerEmail && t.push("email"),
              e.requestPayerPhone && t.push("phone"),
              t.length ? t : null
            );
          },
          countryCode: he("country"),
          currencyCode: he("currency"),
          merchantCapabilities: function (e) {
            var t = e.merchantCapabilities || J.merchantCapabilities;
            return (
              e.__betas &&
                (0, v.uN)(e.__betas, "cup_apple_pay_beta_1") &&
                t.push("supportsEMV"),
              t
            );
          },
          supportedNetworks: function (e) {
            var t = de(
              e.country,
              e.jcbEnabled || !1,
              e.blockedCardBrands || []
            );
            return (
              ce(4) &&
                -1 === (e.blockedCardBrands || []).indexOf("mastercard") &&
                t.push("maestro"),
              e.__betas &&
                (0, v.uN)(e.__betas, "cup_apple_pay_beta_1") &&
                -1 === (e.blockedCardBrands || []).indexOf("unionpay") &&
                t.push("chinaUnionPay"),
              ce(4) &&
                e.__betas &&
                (0, v.uN)(e.__betas, "cartes_bancaires_apple_pay_beta_1") &&
                "eur" === e.currency &&
                t.unshift("cartesBancaires"),
              t
            );
          },
        },
        ke = {
          status: function (e) {
            var t = ye[e.status];
            return ce(3) && t > 1 ? 1 : t;
          },
          error: function (e) {
            return ce(3) ? ve[e.status]() : null;
          },
        },
        Ee = (0, c.Z)((0, c.Z)({}, be), we),
        Se = (0, c.Z)((0, c.Z)({}, be), ke),
        Pe = function (e) {
          return Object.keys(Se).reduce(function (t, n) {
            var r = (0, Se[n])(e);
            return null !== r
              ? (0, c.Z)((0, c.Z)({}, t), {}, (0, p.Z)({}, n, r))
              : t;
          }, {});
        },
        Ae = function (e) {
          return "string" == typeof e ? e : null;
        },
        Ce = function (e) {
          return e ? Ae(e.phoneNumber) : null;
        },
        Ne = function (e) {
          return e ? Ae(e.emailAddress) : null;
        },
        Ie = function (e) {
          return e
            ? [e.givenName, e.familyName]
                .filter(function (e) {
                  return e && "string" == typeof e;
                })
                .join(" ")
            : null;
        },
        Te = function (e) {
          var t = e.addressLines,
            n = e.countryCode,
            r = e.postalCode,
            o = e.administrativeArea,
            i = e.locality,
            a = e.phoneNumber,
            c = Ae(n);
          return {
            addressLine: Array.isArray(t)
              ? t.reduce(function (e, t) {
                  return "string" == typeof t ? [].concat((0, s.Z)(e), [t]) : e;
                }, [])
              : [],
            country: c ? c.toUpperCase() : "",
            postalCode: Ae(r) || "",
            recipient: Ie(e) || "",
            region: Ae(o) || "",
            city: Ae(i) || "",
            phone: Ae(a) || "",
            sortingCode: "",
            dependentLocality: "",
            organization: "",
          };
        },
        Me = function (e, t) {
          var n = e.identifier,
            r = e.label;
          return t.filter(function (e) {
            return e.id === n && e.label === r;
          })[0];
        },
        je = function (e, t) {
          var n = e.shippingContact,
            r = e.shippingMethod,
            o = e.billingContact;
          return {
            shippingOption:
              r && t.shippingOptions && t.shippingOptions.length
                ? Me(r, t.shippingOptions)
                : null,
            shippingAddress: n ? Te(n) : null,
            payerEmail: Ne(n),
            payerPhone: Ce(n),
            payerName: Ie(o),
            walletName: "applePay",
            methodName: "apple-pay",
          };
        },
        Oe = e(9620),
        Re = {
          austria: "AT",
          sterreich: "AT",
          csterreich: "AT",
          au: "AU",
          australia: "AU",
          belgium: "BE",
          br: "BR",
          brasil: "BR",
          brazil: "BR",
          ca: "CA",
          canada: "CA",
          ch: "CH",
          schweiz: "CH",
          switzerland: "CH",
          china: "CN",
          czechrepublic: "CZ",
          de: "DE",
          deutschland: "DE",
          germany: "DE",
          danmark: "DK",
          denmark: "DK",
          es: "ES",
          espaa: "ES",
          spain: "ES",
          finland: "FI",
          suomi: "FI",
          fr: "FR",
          hk: "HK",
          hongkong: "HK",
          england: "GB",
          gb: "GB",
          uk: "GB",
          unitedkingdom: "GB",
          scotland: "GB",
          wales: "GB",
          it: "IT",
          italy: "IT",
          italia: "IT",
          japan: "JP",
          lietuva: "LT",
          luxembourg: "LU",
          netherlands: "NL",
          nederland: "NL",
          norway: "NO",
          poland: "PL",
          polska: "PL",
          russia: "RU",
          saudiarabia: "SA",
          se: "SE",
          sweden: "SE",
          sverige: "SE",
          singapore: "SG",
          us: "US",
          usa: "US",
          unitedstatesofamerica: "US",
          unitedstates: "US",
          estadosunidos: "US",
        },
        Ze = function (e, t) {
          if (e.country && "string" == typeof e.country) {
            var n,
              r = e.country.toLowerCase().replace(/[^a-z]+/g, "");
            return (
              e.countryCode
                ? "string" == typeof e.countryCode &&
                  (n = e.countryCode.toUpperCase())
                : (n = Re[r]) || t(),
              (0, c.Z)((0, c.Z)({}, e), {}, { countryCode: n })
            );
          }
          return e;
        },
        xe = function (e, t) {
          return e && "object" == typeof e ? t(e) : null;
        },
        Le = (function () {
          function e(t) {
            var n = this;
            (0, u.Z)(this, e),
              (this._wasCompleted = !1),
              (this._onEvent = function () {}),
              (this.setEventHandler = function (e) {
                n._onEvent = e;
              }),
              (this.canMakePayment = function () {
                return se(
                  window.location.hostname,
                  n._authentication.accountId,
                  (0, Oe.lO)(n._authentication.apiKey) === Oe.Kl.test,
                  n._report,
                  n._minimumVersion
                );
              }),
              (this.update = function (e) {
                (n._initialPaymentRequest = (0, g.PM)(
                  n._paymentRequestOptions,
                  e
                )),
                  n._initializeSessionState();
              }),
              (this.show = function () {
                var e;
                n._wasCompleted && n._report("pr.show_called_after_completion"),
                  n._initializeSessionState();
                try {
                  e = new window.ApplePaySession(
                    n._minimumVersion,
                    (function (e) {
                      var t = (0, c.Z)((0, c.Z)({}, J), e);
                      return Object.keys(Ee).reduce(function (e, n) {
                        var r = (0, Ee[n])(t);
                        return null !== r
                          ? (0, c.Z)((0, c.Z)({}, e), {}, (0, p.Z)({}, n, r))
                          : e;
                      }, {});
                    })(n._paymentRequestOptions)
                  );
                } catch (e) {
                  throw "Must create a new ApplePaySession from a user gesture handler." ===
                    e.message
                    ? new b.No(
                        "show() must be called from a user gesture handler (such as a click handler, after the user clicks a button)."
                      )
                    : e;
                }
                (n._privateSession = e),
                  n._setupSession(e, n._usesButtonElement()),
                  e.begin(),
                  (n._isShowing = !0);
              }),
              (this.abort = function () {
                n._privateSession && n._privateSession.abort();
              }),
              (this._warn = function () {}),
              (this._report = function (e, t) {
                n._controller.report(
                  e,
                  (0, c.Z)(
                    (0, c.Z)({}, t),
                    {},
                    {
                      backingLibrary: "APPLE_PAY",
                      usesButtonElement: n._usesButtonElement(),
                    }
                  )
                );
              }),
              (this._validateMerchant = function (e, t) {
                return function (r) {
                  n._controller.action
                    .createApplePaySession({
                      data: {
                        validation_url: r.validationURL,
                        domain_name: window.location.hostname,
                        display_name: n._paymentRequestOptions.total.label,
                      },
                      usesButtonElement: t,
                    })
                    .then(function (t) {
                      if (n._isShowing)
                        switch (t.type) {
                          case "object":
                            e.completeMerchantValidation(
                              JSON.parse(t.object.session)
                            );
                            break;
                          case "error":
                            n._handleValidationError(e)(t.error);
                            break;
                          default:
                            (0, m.Rz)(t);
                        }
                    }, n._handleValidationError(e));
                };
              }),
              (this._handleValidationError = function (e) {
                return function (t) {
                  n._report("error.pr.apple_pay.session_creation_failed", {
                    error: t,
                  }),
                    e.abort();
                  var r = t.message;
                  "string" == typeof r && n._controller.warn(r);
                };
              }),
              (this._paymentAuthorized = function (e) {
                return function (t) {
                  var r = t.payment,
                    o = n._usesButtonElement()
                      ? k.Yj.paymentRequestButton
                      : null;
                  n._controller.action
                    .tokenizeWithData({
                      type: "apple_pay",
                      elementName: o,
                      tokenData: (0, c.Z)(
                        (0, c.Z)({}, r),
                        {},
                        {
                          billingContact: xe(
                            r.billingContact,
                            n._normalizeContact
                          ),
                        }
                      ),
                      mids: n._mids,
                    })
                    .then(function (t) {
                      if ("error" === t.type)
                        e.completePayment(
                          window.ApplePaySession.STATUS_FAILURE
                        ),
                          n._report("error.pr.create_token_failed", {
                            error: t.error,
                          });
                      else {
                        var o = xe(r.shippingContact, n._normalizeContact),
                          i = xe(r.billingContact, n._normalizeContact);
                        o &&
                          n._paymentRequestOptions.requestShipping &&
                          !o.countryCode &&
                          e.completePayment(
                            window.ApplePaySession
                              .STATUS_INVALID_SHIPPING_POSTAL_ADDRESS
                          );
                        var a = je(
                          { shippingContact: o, billingContact: i },
                          n._paymentRequestOptions
                        );
                        n._onToken(e)(
                          (0, c.Z)(
                            (0, c.Z)({}, a),
                            {},
                            {
                              shippingOption: n._privateShippingOption,
                              token: t.object,
                            }
                          )
                        );
                      }
                    });
                };
              }),
              (this._normalizeContact = function (e) {
                return Ze(e, function () {
                  n._report("warn.pr.apple_pay.missing_country_code", {
                    country: e.country,
                  });
                });
              }),
              (this._onToken = function (e) {
                return function (t) {
                  n._onEvent({
                    type: "paymentresponse",
                    payload: (0, c.Z)(
                      (0, c.Z)({}, t),
                      {},
                      { complete: C(n._completePayment(e)) }
                    ),
                  });
                };
              }),
              (this._completePayment = function (e) {
                return function (t) {
                  "success" === t && (n._wasCompleted = !0),
                    (n._paymentRequestOptions = (0, g.PM)(
                      n._paymentRequestOptions,
                      { status: t }
                    ));
                  var r = Pe(n._paymentRequestOptions),
                    o = r.status,
                    i = r.error;
                  n._isShowing &&
                    (i
                      ? e.completePayment({ status: o, errors: [i] })
                      : e.completePayment(o)),
                    (0 === o || (1 === o && null == i)) &&
                      ((n._isShowing = !1),
                      n._onEvent && n._onEvent({ type: "close" }));
                };
              }),
              (this._shippingContactSelected = function (e) {
                return function (t) {
                  n._onEvent({
                    type: "shippingaddresschange",
                    payload: {
                      shippingAddress: Te(
                        n._normalizeContact(t.shippingContact)
                      ),
                      updateWith: C(n._completeShippingContactSelection(e)),
                    },
                  });
                };
              }),
              (this._completeShippingContactSelection = function (e) {
                return function (t) {
                  var r;
                  (n._paymentRequestOptions = (0, g.PM)(
                    n._paymentRequestOptions,
                    t
                  )),
                    (null === (r = n._paymentRequestOptions.shippingOptions) ||
                    void 0 === r
                      ? void 0
                      : r.length) &&
                      (n._privateShippingOption =
                        n._paymentRequestOptions.shippingOptions[0]);
                  var o = Pe(n._paymentRequestOptions),
                    i = o.status,
                    a = o.shippingMethods,
                    c = o.total,
                    s = o.lineItems;
                  e.completeShippingContactSelection(i, a, c, s);
                };
              }),
              (this._shippingMethodSelected = function (e) {
                return function (t) {
                  if (n._paymentRequestOptions.shippingOptions) {
                    var r = Me(
                      t.shippingMethod,
                      n._paymentRequestOptions.shippingOptions
                    );
                    (n._privateShippingOption = r),
                      n._onEvent({
                        type: "shippingoptionchange",
                        payload: {
                          shippingOption: r,
                          updateWith: C(n._completeShippingMethodSelection(e)),
                        },
                      });
                  }
                };
              }),
              (this._completeShippingMethodSelection = function (e) {
                return function (t) {
                  n._paymentRequestOptions = (0, g.PM)(
                    n._paymentRequestOptions,
                    t
                  );
                  var r = Pe(n._paymentRequestOptions),
                    o = r.status,
                    i = r.total,
                    a = r.lineItems;
                  e.completeShippingMethodSelection(o, i, a);
                };
              });
            var r = t.controller,
              o = t.authentication,
              i = t.mids,
              a = t.options,
              s = t.usesButtonElement,
              l = t.listenerRegistry;
            (this._controller = r),
              (this._authentication = o),
              (this._mids = i),
              (this._minimumVersion = a.__minApplePayVersion || 2),
              (this._usesButtonElement = s),
              (this._listenerRegistry = l),
              (this._initialPaymentRequest = a),
              (this._isShowing = !1),
              this._initializeSessionState();
          }
          return (
            (0, l.Z)(e, [
              {
                key: "_initializeSessionState",
                value: function () {
                  var e = btoa(
                    this._authentication.accountId
                      ? ""
                          .concat(this._authentication.apiKey, ":")
                          .concat(this._authentication.accountId)
                      : this._authentication.apiKey
                  );
                  (this._paymentRequestOptions = (0, c.Z)(
                    (0, c.Z)((0, c.Z)({}, J), this._initialPaymentRequest),
                    {},
                    { status: K.success, applicationData: e }
                  )),
                    (this._privateSession = null),
                    (this._privateShippingOption = null);
                  var t = this._paymentRequestOptions.shippingOptions;
                  (null == t ? void 0 : t.length) &&
                    (this._privateShippingOption = t[0]);
                },
              },
              {
                key: "_setupSession",
                value: function (e, t) {
                  var n = this;
                  this._listenerRegistry.addEventListener(
                    e,
                    "validatemerchant",
                    C(this._validateMerchant(e, t))
                  ),
                    this._listenerRegistry.addEventListener(
                      e,
                      "paymentauthorized",
                      C(this._paymentAuthorized(e))
                    ),
                    this._listenerRegistry.addEventListener(
                      e,
                      "cancel",
                      C(function () {
                        (n._isShowing = !1),
                          n._onEvent({ type: "cancel" }),
                          n._onEvent({ type: "close" });
                      })
                    ),
                    this._listenerRegistry.addEventListener(
                      e,
                      "shippingcontactselected",
                      C(this._shippingContactSelected(e))
                    ),
                    this._listenerRegistry.addEventListener(
                      e,
                      "shippingmethodselected",
                      C(this._shippingMethodSelected(e))
                    );
                },
              },
            ]),
            e
          );
        })(),
        De = Le,
        Be = e(755),
        qe = {
          display: "block",
          position: "fixed",
          "z-index": "2147483647",
          background: "rgba(40,40,40,0)",
          transition: "background 400ms ease",
          "will-change": "background",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          margin: "0",
          padding: "0",
        },
        Fe = (0, c.Z)(
          (0, c.Z)({}, qe),
          {},
          { background: "rgba(40,40,40,0.75)" }
        ),
        Ue = function e(t) {
          var n = this,
            r = t.lockScrolling,
            o = t.lockFocus,
            i = t.lockFocusOn,
            a = t.listenerRegistry;
          (0, u.Z)(this, e),
            (this.domElement = document.createElement("div")),
            (this._runOnHide = []),
            (this.mount = function () {
              var e = (0, _.Xq)();
              (n.domElement.style.display = "none"),
                e.contains(n.domElement) ||
                  e.insertBefore(n.domElement, e.firstChild);
            }),
            (this.show = function () {
              if (((0, _.yq)(n.domElement, qe), n._lockScrolling)) {
                var e = (0, _.MV)();
                n._runOnHide.push(e);
              }
              if (n._lockFocus) {
                var t = (0, _.W3)(n._lockFocusOn).restoreFocus;
                n._runOnHide.push(t);
              }
            }),
            (this.fadeIn = function () {
              setTimeout(function () {
                (0, _.yq)(n.domElement, Fe);
              });
            }),
            (this.fadeOut = function () {
              return new B.J(function (e) {
                (0, _.yq)(n.domElement, qe),
                  setTimeout(e, 500),
                  n._listenerRegistry.addEventListener(
                    n.domElement,
                    "transitionend",
                    e
                  );
              }).then(function () {
                for (
                  n.domElement.style.display = "none";
                  n._runOnHide.length;

                ) {
                  var e;
                  null === (e = n._runOnHide.pop()) || void 0 === e || e();
                }
              });
            }),
            (this.unmount = function () {
              var e = (0, _.Xq)();
              e.contains(n.domElement) && e.removeChild(n.domElement);
            }),
            (this._lockScrolling = !!r),
            (this._lockFocus = !!o),
            (this._lockFocusOn = i || null),
            (this._listenerRegistry = a);
        },
        Ge = null;
      var Ye = function (e) {
          return (
            "https:" === window.location.protocol &&
            !(!h.Wt && !h.j3) &&
            !h.Bh &&
            !(!e.isCheckout && !window.PaymentRequest) &&
            !(!e.isCheckout && h.sV)
          );
        },
        ze = function e(t) {
          var n = this;
          (0, u.Z)(this, e),
            (this._mids = null),
            (this._frame = null),
            (this._initFrame = function (e) {
              var t = n._controller.createHiddenFrame(
                Be.NC.PAYMENT_REQUEST_GOOGLE_PAY,
                {
                  authentication: n._authentication,
                  mids: n._mids,
                  origin: n._origin,
                }
              );
              t.send({ action: "stripe-pr-initialize", payload: { data: e } }),
                n._initFrameEventHandlers(t),
                (n._frame = t);
            }),
            (this._initFrameEventHandlers = function (e) {
              e._on("pr-cancel", function () {
                n._onEvent({ type: "cancel" });
              }),
                e._on("pr-close", function () {
                  n._backdrop.fadeOut().then(function () {
                    n._backdrop.unmount();
                  }),
                    n._onEvent({ type: "close" });
                }),
                e._on("pr-error", function (e) {
                  n._onEvent({
                    type: "error",
                    payload: {
                      errorMessage: e.errorMessage,
                      errorCode: e.errorCode,
                    },
                  });
                }),
                e._on("pr-callback", function (t) {
                  var r = t.event,
                    o = t.options,
                    i = t.nonce;
                  switch (r) {
                    case "paymentresponse":
                      n._handlePaymentResponse(e, o, i);
                      break;
                    case "shippingaddresschange":
                      n._handleShippingAddressChange(e, o, i);
                      break;
                    case "shippingoptionchange":
                      n._handleShippingOptionChange(e, o, i);
                      break;
                    default:
                      throw new Error("Unexpected event name: ".concat(r));
                  }
                });
            }),
            (this._handlePaymentResponse = function (e, t, r) {
              n._onEvent({
                type: "paymentresponse",
                payload: (0, c.Z)(
                  (0, c.Z)({}, t),
                  {},
                  {
                    complete: function (t) {
                      e.send({
                        action: "stripe-pr-callback-complete",
                        payload: { nonce: r, data: { status: t } },
                      });
                    },
                  }
                ),
              });
            }),
            (this._handleShippingAddressChange = function (e, t, r) {
              n._onEvent({
                type: "shippingaddresschange",
                payload: (0, c.Z)(
                  (0, c.Z)({}, t),
                  {},
                  {
                    updateWith: function (t) {
                      e.send({
                        action: "stripe-pr-callback-complete",
                        payload: { nonce: r, data: t },
                      });
                    },
                  }
                ),
              });
            }),
            (this._handleShippingOptionChange = function (e, t, r) {
              n._onEvent({
                type: "shippingoptionchange",
                payload: (0, c.Z)(
                  (0, c.Z)({}, t),
                  {},
                  {
                    updateWith: function (t) {
                      e.send({
                        action: "stripe-pr-callback-complete",
                        payload: { nonce: r, data: t },
                      });
                    },
                  }
                ),
              });
            }),
            (this._destroy = function () {
              n._frame && (n._frame.destroy(), (n._frame = null));
            }),
            (this.setEventHandler = function (e) {
              n._onEvent = e;
            }),
            (this.canMakePayment = function () {
              if (!Ye({ isCheckout: n._isCheckout })) return B.J.resolve(!1);
              if (!n._frame) throw new Error("Frame not initialized.");
              var e,
                t = n._frame;
              return (
                (e = function () {
                  return t.action.checkCanMakePayment().then(function (e) {
                    return !0 === e.available;
                  });
                }),
                null !== Ge
                  ? B.J.resolve(Ge)
                  : e().then(function (e) {
                      return (Ge = e);
                    })
              );
            }),
            (this.show = function () {
              n._frame &&
                (n._frame.send({
                  delegate: "payment",
                  action: "stripe-pr-show",
                  payload: {
                    data: {
                      usesButtonElement: n._usesButtonElement(),
                      stripeJsId: n._controller._stripeJsId,
                      mids: n._controller.mids(),
                    },
                  },
                }),
                n._backdrop.mount(),
                n._backdrop.show(),
                n._backdrop.fadeIn());
            }),
            (this.update = function (e) {
              n._frame &&
                n._frame.send({
                  action: "stripe-pr-update",
                  payload: { data: e },
                });
            }),
            (this.abort = function () {
              n._frame &&
                n._frame.send({ action: "stripe-pr-abort", payload: {} });
            }),
            (this._controller = t.controller),
            (this._authentication = t.authentication),
            (this._mids = t.mids),
            (this._origin = t.origin),
            (this._usesButtonElement = t.usesButtonElement),
            (this._backdrop = new Ue({
              lockScrolling: !1,
              lockFocus: !0,
              lockFocusOn: null,
              listenerRegistry: t.listenerRegistry,
            })),
            (this._isCheckout = !!t.options.__isCheckout),
            Ye({ isCheckout: this._isCheckout }) &&
              this._controller &&
              (this._controller.action.fetchLocale({ locale: "auto" }),
              this._initFrame(t.options));
        },
        He = (function () {
          if (!window.PaymentRequest) return null;
          if (/CriOS\/59/.test(navigator.userAgent)) return null;
          if (
            /.*\(.*; wv\).*Chrome\/(?:53|54)\.\d.*/g.test(navigator.userAgent)
          )
            return null;
          if (h.xz) return null;
          var e = window.PaymentRequest;
          return (
            e.prototype.canMakePayment ||
              (e.prototype.canMakePayment = function () {
                return B.J.resolve(!1);
              }),
            e
          );
        })(),
        Ke = null,
        Je = function e(t) {
          var n = this;
          (0, u.Z)(this, e),
            (this._onEvent = function () {}),
            (this.setEventHandler = function (e) {
              n._onEvent = e;
            }),
            (this.canMakePayment = function () {
              return (
                (e = n._prFrame),
                (0, Oe.lO)(n._authentication.apiKey),
                Oe.Kl.test,
                "https:" !== window.location.protocol
                  ? B.J.resolve(!1)
                  : null !== Ke
                  ? B.J.resolve(Ke)
                  : He && e
                  ? e.action.checkCanMakePayment().then(function (e) {
                      var t = e.available;
                      return (Ke = !0 === t);
                    })
                  : B.J.resolve(!1)
              );
              var e;
            }),
            (this.update = function (e) {
              var t = n._prFrame;
              t && t.send({ action: "stripe-pr-update", payload: { data: e } });
            }),
            (this.show = function () {
              if (!n._prFrame)
                throw new b.No(
                  "Payment Request is not available in this browser."
                );
              n._prFrame.send({
                delegate: "payment",
                action: "stripe-pr-show",
                payload: {
                  data: {
                    usesButtonElement: n._usesButtonElement(),
                    stripeJsId: n._controller._stripeJsId,
                    mids: n._controller.mids(),
                  },
                },
              });
            }),
            (this.abort = function () {
              n._prFrame &&
                n._prFrame.send({ action: "stripe-pr-abort", payload: {} });
            }),
            (this._setupPrFrame = function (e, t) {
              e.send({ action: "stripe-pr-initialize", payload: { data: t } }),
                e._on("pr-cancel", function () {
                  n._onEvent({ type: "cancel" });
                }),
                e._on("pr-close", function () {
                  n._onEvent({ type: "close" });
                }),
                e._on("pr-error", function (e) {
                  n._onEvent({
                    type: "error",
                    payload: {
                      errorMessage: e.message || "",
                      errorCode: e.code || "",
                    },
                  });
                }),
                e._on("pr-callback", function (t) {
                  var r = t.event,
                    o = t.nonce,
                    i = t.options;
                  switch (r) {
                    case "token":
                      n._onEvent({
                        type: "paymentresponse",
                        payload: (0, c.Z)(
                          (0, c.Z)({}, i),
                          {},
                          {
                            complete: function (t) {
                              e.send({
                                action: "stripe-pr-callback-complete",
                                payload: { data: { status: t }, nonce: o },
                              });
                            },
                          }
                        ),
                      });
                      break;
                    case "shippingaddresschange":
                      n._onEvent({
                        type: "shippingaddresschange",
                        payload: {
                          shippingAddress: i.shippingAddress,
                          updateWith: function (t) {
                            e.send({
                              action: "stripe-pr-callback-complete",
                              payload: { nonce: o, data: t },
                            });
                          },
                        },
                      });
                      break;
                    case "shippingoptionchange":
                      n._onEvent({
                        type: "shippingoptionchange",
                        payload: {
                          shippingOption: i.shippingOption,
                          updateWith: function (t) {
                            e.send({
                              action: "stripe-pr-callback-complete",
                              payload: { nonce: o, data: t },
                            });
                          },
                        },
                      });
                      break;
                    default:
                      throw new Error(
                        "Unexpected event from PaymentRequest inner: ".concat(r)
                      );
                  }
                });
            });
          var r = t.authentication,
            o = t.controller,
            i = t.mids,
            a = t.origin,
            s = t.usesButtonElement,
            l = t.options;
          if (
            ((this._authentication = r),
            (this._controller = o),
            (this._usesButtonElement = s),
            He && "https:" === window.location.protocol)
          ) {
            this._controller.action.fetchLocale({ locale: "auto" });
            var p = this._controller.createHiddenFrame(
              Be.NC.PAYMENT_REQUEST_BROWSER,
              { authentication: r, mids: i, origin: a }
            );
            this._setupPrFrame(p, l), (this._prFrame = p);
          } else this._prFrame = null;
        },
        We = e(7904),
        Ve = e(1164),
        Xe = (function () {
          function e() {
            var t = this;
            (0, u.Z)(this, e),
              (this._state = "pending"),
              (this._state = "pending"),
              (this.promise = new B.J(function (e, n) {
                (t._resolve = e), (t._reject = n);
              })),
              this.promise.then(
                function () {
                  t._state = "resolved";
                },
                function () {
                  t._state = "rejected";
                }
              );
          }
          return (
            (0, l.Z)(e, [
              {
                key: "resolve",
                value: function (e) {
                  this._resolve(e);
                },
              },
              {
                key: "reject",
                value: function (e) {
                  this._reject(e);
                },
              },
              {
                key: "isResolved",
                value: function () {
                  return "resolved" === this._state;
                },
              },
              {
                key: "isRejected",
                value: function () {
                  return "rejected" === this._state;
                },
              },
              {
                key: "isPending",
                value: function () {
                  return "pending" === this._state;
                },
              },
            ]),
            e
          );
        })(),
        Qe = (function () {
          function e(t, n) {
            var r = this;
            (0, u.Z)(this, e),
              (this.callbacks = []),
              (this.listen = function (e) {
                0 === r.callbacks.length &&
                  window.addEventListener("message", r.handleMessage),
                  r.callbacks.push(e);
              }),
              (this.stopAllListeners = function () {
                window.removeEventListener("message", r.handleMessage),
                  (r.callbacks.length = 0);
              }),
              (this.postMessage = function (t) {
                if (r.target) {
                  var n = (0, c.Z)(
                    (0, c.Z)({}, t),
                    {},
                    (0, p.Z)({}, e.MESSAGE_TAG, !0)
                  );
                  r.target.postMessage(n, r.targetOrigin);
                }
              }),
              (this.handleMessage = function (e) {
                r.isValidPopupMessageEvent(e) &&
                  r.callbacks.forEach(function (t) {
                    return t(e.data);
                  });
              }),
              (this.getTarget = t),
              (this.targetOrigin = n);
          }
          return (
            (0, l.Z)(e, [
              {
                key: "target",
                get: function () {
                  return this.getTarget();
                },
              },
              {
                key: "isValidPopupMessageEvent",
                value: function (t) {
                  return (
                    ("*" === this.targetOrigin ||
                      t.origin === this.targetOrigin) &&
                    t.source === this.target &&
                    t.data &&
                    "object" == typeof t.data &&
                    e.MESSAGE_TAG in t.data
                  );
                },
              },
            ]),
            e
          );
        })();
      Qe.MESSAGE_TAG = "__stripeJsV3Popup";
      var $e = (function () {
        function e(t) {
          var n = this;
          (0, u.Z)(this, e),
            (this.messageQueue = []),
            (this.isDisconnected = !1),
            (this.runOnDisconnect = []),
            (this.callbacks = {}),
            (this.deferredMessageResponses = {}),
            (this.onClose = function () {}),
            (this.onDisconnect = function () {}),
            (this.on = function (e, t) {
              var r;
              ((r = n.callbacks)[e] || (r[e] = [])).push(t);
            }),
            (this.off = function (e, t) {
              var r;
              n.callbacks[e] =
                null === (r = n.callbacks[e]) || void 0 === r
                  ? void 0
                  : r.filter(function (e) {
                      return e !== t;
                    });
            }),
            (this.send = function (e, t) {
              n.isDisconnected;
              var r = (0, f.Vj)(),
                o = new Xe();
              return (
                (n.deferredMessageResponses[r] = o),
                n.postMessage({ mode: "request", nonce: r, req: t, type: e }),
                o.promise
              );
            }),
            (this.setNextHeartbeatTimeout = function (t) {
              var r =
                arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
              n.heartbeatTimeout && clearTimeout(n.heartbeatTimeout),
                n.runOnDisconnect.push(function () {
                  n.heartbeatTimeout && clearTimeout(n.heartbeatTimeout);
                }),
                (n.heartbeatTimeout = setTimeout(function () {
                  r
                    ? (n.disconnect(), n.onDisconnect())
                    : n.setNextHeartbeatTimeout(e.HEARTBEAT_TIMEOUT, !0);
                }, t));
            });
          var r = t.target,
            o = t.targetOrigin,
            i = t.isOpener,
            a =
              "function" == typeof r
                ? r
                : function () {
                    return r;
                  };
          if (((this.transport = this.setupTransport(a, o)), i)) {
            this.isTargetReadyForMessages = !1;
            var c = setInterval(function () {
              var e;
              (null === (e = a()) || void 0 === e ? void 0 : e.closed) &&
                (n.onClose(), n.disconnect());
            }, 100);
            this.runOnDisconnect.push(function () {
              return clearInterval(c);
            }),
              this.runOnDisconnect.push(function () {
                var e;
                return null === (e = a()) || void 0 === e ? void 0 : e.close();
              });
          } else
            (this.isTargetReadyForMessages = !0),
              this.postMessage({ type: "ready_for_messages", __private: !0 });
          this.sendRecurringHeartbeat(),
            this.setNextHeartbeatTimeout(e.INITIAL_HEARTBEAT_TIMEOUT);
        }
        return (
          (0, l.Z)(e, [
            {
              key: "setupTransport",
              value: function (e, t) {
                var n = this,
                  r = new Qe(e, t);
                return (
                  r.listen(function (e) {
                    "__private" in e
                      ? n.handlePrivateMessage(e)
                      : n.handleMessage(e);
                  }),
                  this.runOnDisconnect.push(function () {
                    return r.stopAllListeners();
                  }),
                  r
                );
              },
            },
            {
              key: "handlePrivateMessage",
              value: function (t) {
                var n = this;
                switch (t.type) {
                  case "ready_for_messages":
                    (this.isTargetReadyForMessages = !0),
                      this.messageQueue.forEach(function (e) {
                        n.postMessage(e);
                      }),
                      (this.messageQueue.length = 0);
                    break;
                  case "heartbeat":
                    this.setNextHeartbeatTimeout(e.HEARTBEAT_TIMEOUT);
                    break;
                  default:
                    (0, m.Rz)(t);
                }
              },
            },
            {
              key: "handleMessage",
              value: function (e) {
                var t,
                  n,
                  r = this,
                  o = e.nonce;
                switch (e.mode) {
                  case "request":
                    var i;
                    null === (i = this.callbacks[e.type]) ||
                      void 0 === i ||
                      i.forEach(function (t) {
                        (function (e) {
                          try {
                            return B.J.resolve(e());
                          } catch (e) {
                            return B.J.reject(e);
                          }
                        })(function () {
                          return t(e.req);
                        }).then(
                          function (e) {
                            r.postMessage({
                              mode: "response",
                              nonce: o,
                              res: e,
                            });
                          },
                          function (e) {
                            r.postMessage({
                              mode: "error",
                              nonce: o,
                              error: e,
                            });
                          }
                        );
                      });
                    break;
                  case "response":
                    null === (t = this.deferredMessageResponses[o]) ||
                      void 0 === t ||
                      t.resolve(e.res);
                    break;
                  case "error":
                    null === (n = this.deferredMessageResponses[o]) ||
                      void 0 === n ||
                      n.reject(e.error);
                    break;
                  default:
                    (0, m.Rz)(e);
                }
              },
            },
            {
              key: "disconnect",
              value: function () {
                this.runOnDisconnect.forEach(function (e) {
                  return e();
                }),
                  (this.runOnDisconnect.length = 0),
                  (this.isDisconnected = !0);
              },
            },
            {
              key: "sendRecurringHeartbeat",
              value: function () {
                var t = this;
                !(function n() {
                  t.isDisconnected ||
                    (t.isTargetReadyForMessages &&
                      t.postMessage({ type: "heartbeat", __private: !0 }),
                    setTimeout(n, e.HEARTBEAT_INTERVAL));
                })();
              },
            },
            {
              key: "postMessage",
              value: function (e) {
                this.isDisconnected ||
                  (this.isTargetReadyForMessages
                    ? this.transport.postMessage(e)
                    : this.messageQueue.push(e));
              },
            },
          ]),
          e
        );
      })();
      ($e.HEARTBEAT_INTERVAL = 1e3),
        ($e.INITIAL_HEARTBEAT_TIMEOUT = 7500),
        ($e.HEARTBEAT_TIMEOUT = 2500);
      var et,
        tt,
        nt = function (e, t, n) {
          var r,
            o,
            i,
            a,
            c,
            s =
              ((r = {
                outerHeight: window.outerHeight,
                outerWidth: window.outerWidth,
                screenY: window.screenY,
                screenX: window.screenX,
                popupHeight: t,
                popupWidth: n,
              }),
              (o = r.outerHeight),
              (i = r.outerWidth),
              (a = r.screenY),
              (c = r.screenX),
              {
                top: o / 2 + a - r.popupHeight / 2,
                left: i / 2 + c - r.popupWidth / 2,
              }),
            u = (function (e) {
              return Object.keys(e)
                .map(function (t) {
                  return "".concat(t, "=").concat(e[t]);
                })
                .join();
            })({
              toolbar: "no",
              directories: "no",
              status: "no",
              scrollbars: "no",
              resizable: "no",
              copyhistory: "no",
              height: t,
              width: n,
              top: s.top,
              left: s.left,
            });
          return window.open(e, "Link", u);
        },
        rt = function (e) {
          var t = e.path,
            n = e.onClose,
            r = e.onDisconnect,
            o = e.height,
            i = e.width,
            a = (function (e) {
              var t = e.popupRootUrl,
                n = e.stripeJsRootUrl,
                r = e.version,
                o = e.path,
                i = (0, y.P$)(t);
              if (!i)
                throw new Error('Invalid popup root URL: "'.concat(t, '"'));
              return t === n
                ? {
                    url:
                      t +
                      (r && "unknown" !== r
                        ? "link-popup-".concat(r, ".html#")
                        : "link-popup.html#") +
                      o,
                    origin: i,
                  }
                : {
                    url:
                      t + (r && "unknown" !== r ? "".concat(r, "/#") : "#") + o,
                    origin: i,
                  };
            })({
              popupRootUrl: "https://checkout.link.co/",
              stripeJsRootUrl: k.Xk,
              version: k.XK,
              path: t,
            }),
            c = a.url,
            s = a.origin,
            u = null,
            l = new $e({
              target: function () {
                return u;
              },
              targetOrigin: s,
              isOpener: !0,
            });
          return (
            (l.onDisconnect = r),
            (l.onClose = function () {
              window.focus(), n();
            }),
            (u = nt(c, o, i))
              ? {
                  messenger: l,
                  close: function () {
                    var e;
                    return null === (e = u) || void 0 === e
                      ? void 0
                      : e.close();
                  },
                  focus: function () {
                    var e;
                    return null === (e = u) || void 0 === e
                      ? void 0
                      : e.focus();
                  },
                }
              : null
          );
        },
        ot = (function () {
          function e(t) {
            var n = this;
            (0, u.Z)(this, e),
              (this.blockReopenOnShow = !1),
              (this.popup = null),
              (this.isDuringSuccessCushion = !1),
              (this.handleGetInitialState = function (e) {
                return function () {
                  return n.getControllerData(e).then(function (e) {
                    var t = e.locale,
                      r = e.linkConfigResult;
                    if ("error" === r.type || null == r.object.link_settings)
                      throw new Error("Invalid LinkConfig result");
                    var o = r.object.link_settings,
                      i = o.merchant_info,
                      a = { businessName: i.business_name, country: i.country },
                      c = o.customer_info;
                    return {
                      publishableKey: n.authentication.apiKey,
                      stripeAccount: n.authentication.accountId,
                      merchantInfo: a,
                      customerInfo: c,
                      integrationType: "prb",
                      paymentRequestOptions: n.paymentRequestOptions,
                      locale: t,
                      stripeJsId: n.controller._stripeJsId,
                      mids: n.controller.mids(),
                      referrer: window.location.href.toString(),
                      elementsSessionId: null,
                      elementsAssignmentId: null,
                    };
                  });
                };
              }),
              (this.getControllerData = function (e) {
                return B.J.all([
                  n.controller.action.resolveLocale({ locale: e || "auto" }),
                  n.controller.action.retrieveLinkConfig(),
                  n.controller.action.checkForLinkClientSecret(),
                ]).then(function (e) {
                  var t = (0, We.Z)(e, 3);
                  return {
                    locale: t[0],
                    linkConfigResult: t[1],
                    hasClientSecret: t[2],
                  };
                });
              }),
              (this.handlePaymentData = function (e) {
                var t = e.token,
                  r = e.payerName,
                  o = e.payerEmail,
                  i = e.payerPhone;
                return (
                  (n.blockReopenOnShow = !0),
                  new B.J(function (e) {
                    n.onEvent({
                      type: "paymentresponse",
                      payload: {
                        token: t,
                        payerName: r,
                        payerEmail: o,
                        payerPhone: i,
                        shippingOption: null,
                        shippingAddress: null,
                        walletName: "link",
                        methodName: "link",
                        complete: function (t) {
                          var r;
                          ("success" !== t
                            ? (n.blockReopenOnShow = !1)
                            : ((n.isDuringSuccessCushion = !0),
                              setTimeout(function () {
                                n.isDuringSuccessCushion = !1;
                              }, 2e3)),
                          h.q$ && "success" === t) &&
                            (null === (r = n.popup) ||
                              void 0 === r ||
                              r.close(),
                            (n.popup = null));
                          e({ status: t });
                        },
                      },
                    });
                  })
                );
              }),
              (this.setEventHandler = function (e) {
                n._onEvent = e;
              }),
              (this.show = function (e) {
                var t = e.locale;
                if (!n.usesButtonElement())
                  throw new Error(
                    "You cannot call show() directly for a PaymentRequest backed by Link. Use the paymentRequestButton Element instead."
                  );
                if (!n.isDuringSuccessCushion) {
                  if (n.popup) {
                    if (!h.q$) return void n.popup.focus();
                    if (n.blockReopenOnShow) return;
                    n.popup.close();
                  }
                  (n.popup = rt({
                    path: "/pay",
                    height: 708,
                    width: 500,
                    onDisconnect: function () {
                      n.onEvent({ type: "close" }), (n.popup = null);
                    },
                    onClose: function () {
                      n.onEvent({ type: "close" }), (n.popup = null);
                    },
                  })),
                    n.popup
                      ? (n.popup.messenger.on(
                          "get_initial_state",
                          n.handleGetInitialState(t)
                        ),
                        n.popup.messenger.on(
                          "link_prb_payment_data",
                          n.handlePaymentData
                        ))
                      : n.controller.report("pr.link.popup_blocked");
                }
              }),
              (this.update = function (e) {
                e.__merchantDetails;
                var t = (0, d.Z)(e, ["__merchantDetails"]);
                n.paymentRequestOptions = (0, g.PM)(n.paymentRequestOptions, t);
              }),
              (this.abort = function () {
                n.popup && (n.popup.close(), (n.popup = null));
              }),
              (this.canMakePayment = function (e) {
                return (h.Wt || h.j3) &&
                  (0, h.gG)() &&
                  n.usesButtonElement() &&
                  (function (e) {
                    var t = (0, v.uN)(e.__betas || [], v.M4.link_in_prb_beta_1);
                    return !(
                      (!t && (e.requestShipping || e.shippingOptions)) ||
                      (e.wallets && e.wallets.length) ||
                      (!t && e.disableWallets && e.disableWallets.length) ||
                      (e.blockedCardBrands && e.blockedCardBrands.length) ||
                      e.__isCheckout
                    );
                  })(n.paymentRequestOptions)
                  ? n
                      .getControllerData(e.locale)
                      .then(function (t) {
                        var r,
                          o = t.locale,
                          i = t.linkConfigResult,
                          a = t.hasClientSecret;
                        if (-1 !== Ve.ud.indexOf(o)) return { available: !1 };
                        if ("error" === i.type) return { available: !1 };
                        var c = i.object,
                          s =
                            null === (r = c.experiments) || void 0 === r
                              ? void 0
                              : r.experiment_assignments;
                        return c.link_available.payment_request_button &&
                          null != c.link_settings
                          ? e.skipEnrollmentCheck
                            ? { available: !0, linkExperimentAssignments: s }
                            : (a &&
                                n.controller.report(
                                  "pr.link.has_client_secret"
                                ),
                              { available: a, linkExperimentAssignments: s })
                          : { available: !1 };
                      })
                      .then(function (e) {
                        return (
                          n.controller.report(
                            "pr.link.can_make_payment_native_response",
                            { available: e.available }
                          ),
                          e
                        );
                      })
                  : B.J.resolve(!1);
              }),
              (this.controller = t.controller),
              (this.authentication = t.authentication),
              (this.usesButtonElement = t.usesButtonElement),
              (this.paymentRequestOptions = t.options);
          }
          return (
            (0, l.Z)(e, [
              {
                key: "onEvent",
                value: function (e) {
                  if (!this._onEvent)
                    throw new Error("Event handler has not been initialized");
                  this._onEvent(e);
                },
              },
            ]),
            e
          );
        })(),
        it = ot,
        at = e(9792),
        ct = !1,
        st = (function (e) {
          function t(e) {
            var r;
            (0, u.Z)(this, t),
              ((r = n.call(this))._usedByButtonElement = null),
              (r._showCalledByButtonElement = !1),
              (r._isShowing = !1),
              (r._backingLibraries = {
                APPLE_PAY: null,
                GOOGLE_PAY: null,
                BROWSER: null,
                LINK: null,
              }),
              (r._activeBackingLibraryName = null),
              (r._buttonTypeName = null),
              (r._activeBackingLibrary = null),
              (r._canMakePaymentAvailability = {
                APPLE_PAY: null,
                GOOGLE_PAY: null,
                BROWSER: null,
                LINK: null,
              }),
              (r._canMakePaymentResolved = !1),
              (r._validateUserOn = function (e) {
                "string" == typeof e &&
                  (("source" === e &&
                    r._hasRegisteredListener("paymentmethod")) ||
                    ("paymentmethod" === e &&
                      r._hasRegisteredListener("source"))) &&
                  (r._report("pr.double_callback_registration"),
                  r._controller.warn(
                    "Do not register event listeners for both `source` or `paymentmethod`. Only one of them will succeed."
                  ));
              }),
              (r._report = function (e, t) {
                r._controller.report(
                  e,
                  (0, c.Z)(
                    (0, c.Z)({}, t),
                    {},
                    {
                      activeBackingLibrary: r._activeBackingLibraryName,
                      usesButtonElement: r._usedByButtonElement || !1,
                      requestShipping: r._initialOptions
                        ? r._initialOptions.requestShipping || !1
                        : null,
                    }
                  )
                );
              }),
              (r._warn = function (e) {
                r._controller.warn(e);
              }),
              (r._registerElement = function () {
                r._usedByButtonElement = !0;
              }),
              (r._elementShow = function () {
                (r._showCalledByButtonElement = !0), r.show();
              }),
              (r._updateLocale = function (e) {
                r._locale = e;
              }),
              (r._initBackingLibraries = function (e) {
                r._queryStrategy.forEach(function (t) {
                  var n = {
                    controller: r._controller,
                    authentication: r._authentication,
                    mids: r._mids,
                    origin: window.location.origin,
                    options: e,
                    usesButtonElement: function () {
                      return !0 === r._usedByButtonElement;
                    },
                    listenerRegistry: r._listenerRegistry,
                  };
                  switch (t) {
                    case "APPLE_PAY":
                      (r._backingLibraries.APPLE_PAY = new De(n)),
                        r._backingLibraries.APPLE_PAY.setEventHandler(
                          r._handleInternalEvent
                        );
                      break;
                    case "GOOGLE_PAY":
                      (r._backingLibraries.GOOGLE_PAY = new ze(n)),
                        r._backingLibraries.GOOGLE_PAY.setEventHandler(
                          r._handleInternalEvent
                        );
                      break;
                    case "LINK":
                      (r._backingLibraries.LINK = new it(n)),
                        r._backingLibraries.LINK.setEventHandler(
                          r._handleInternalEvent
                        );
                      break;
                    case "BROWSER":
                      (r._backingLibraries.BROWSER = new Je(n)),
                        r._backingLibraries.BROWSER.setEventHandler(
                          r._handleInternalEvent
                        );
                      break;
                    default:
                      (0, m.Rz)(t);
                  }
                });
              }),
              (r._handleInternalEvent = function (e) {
                switch (e.type) {
                  case "paymentresponse":
                    r._emitPaymentResponse(e.payload);
                    break;
                  case "error":
                    r._report("error.pr.internal_error", { error: e.payload });
                    break;
                  case "close":
                    r._isShowing = !1;
                    break;
                  default:
                    r._emitExternalEvent(e);
                }
              }),
              (r._emitExternalEvent = function (e) {
                switch (e.type) {
                  case "cancel":
                    r._emit("cancel");
                    break;
                  case "shippingoptionchange":
                  case "shippingaddresschange":
                    var t = e.type,
                      n = e.payload,
                      o = null,
                      i = !1,
                      a = !1,
                      s = function (c) {
                        if (a && i)
                          return (
                            r._report("pr.update_with_called_after_timeout", {
                              event: t,
                            }),
                            void r._controller.warn(
                              "Call to updateWith() was ignored because it has already timed out. Please ensure that updateWith is called within 30 seconds."
                            )
                          );
                        if (i)
                          return (
                            r._report("pr.update_with_double_call", {
                              event: t,
                            }),
                            void r._controller.warn(
                              "Call to updateWith() was ignored because it has already been called. Do not call updateWith more than once."
                            )
                          );
                        o && clearTimeout(o),
                          (i = !0),
                          r._report("pr.update_with", { event: t });
                        var s = (0, m.Gu)(
                            ne,
                            c || {},
                            "".concat(t, " callback")
                          ),
                          u = s.value;
                        s.warnings.forEach(function (e) {
                          return r._controller.warn(e);
                        });
                        var l = u,
                          p = !1;
                        if (
                          r._initialOptions.__isCheckout &&
                          "APPLE_PAY" === r._activeBackingLibraryName &&
                          u.shippingOptions &&
                          1 === u.shippingOptions.length &&
                          0 === u.shippingOptions[0].amount
                        ) {
                          u.shippingOptions;
                          (l = (0, d.Z)(u, ["shippingOptions"])), (p = !0);
                        }
                        var f =
                          u.shippingOptions ||
                          r._initialOptions.shippingOptions;
                        if (
                          !(
                            p ||
                            "shippingaddresschange" !== e.type ||
                            u.status !== K.success ||
                            (f && f.length)
                          )
                        )
                          throw new b.No(
                            "When requesting shipping information, you must specify shippingOptions once a shipping address is selected.\nEither provide shippingOptions in stripe.paymentRequest(...) or listen for the shippingaddresschange event and provide shippingOptions to the updateWith callback there."
                          );
                        l.total && (r._reportOnlyTotal = l.total),
                          n.updateWith(l);
                      };
                    r._hasRegisteredListener(e.type)
                      ? ((o = setTimeout(function () {
                          (a = !0),
                            r._report("pr.update_with_timed_out", { event: t }),
                            r._controller.warn(
                              'Timed out waiting for a call to updateWith(). If you listen to "'
                                .concat(
                                  e.type,
                                  '" events, then you must call event.updateWith in the "'
                                )
                                .concat(e.type, '" handler within 30 seconds.')
                            ),
                            s({ status: "fail" });
                        }, 29900)),
                        r._emit(
                          t,
                          (0, c.Z)((0, c.Z)({}, n), {}, { updateWith: s })
                        ))
                      : s({ status: "success" });
                    break;
                  case "token":
                  case "source":
                  case "paymentmethod":
                    var u = e.type,
                      l = e.payload,
                      p = null,
                      f = !1,
                      _ = !1,
                      h = function (e) {
                        if (f && _)
                          return (
                            r._report("pr.complete_called_after_timeout"),
                            void r._controller.warn(
                              "Call to complete() was ignored because it has already timed out. Please ensure that complete is called within 30 seconds."
                            )
                          );
                        if (_)
                          return (
                            r._report("pr.complete_double_call"),
                            void r._controller.warn(
                              "Call to complete() was ignored because it has already been called. Do not call complete more than once."
                            )
                          );
                        p && clearTimeout(p), (_ = !0);
                        var t = (0, m.Gu)(
                            re,
                            e,
                            "status for PaymentRequest completion"
                          ),
                          n = t.value;
                        t.warnings.forEach(function (e) {
                          return r._controller.warn(e);
                        }),
                          l.complete(n);
                      };
                    (p = setTimeout(function () {
                      (f = !0),
                        r._report("pr.complete_timed_out"),
                        r._controller.warn(
                          'Timed out waiting for a call to complete(). Once you have processed the payment in the "'.concat(
                            e.type,
                            '" handler, you must call event.complete within 30 seconds.'
                          )
                        ),
                        h("fail");
                    }, 29900)),
                      r._emit(
                        u,
                        (0, c.Z)((0, c.Z)({}, l), {}, { complete: h })
                      );
                    break;
                  default:
                    (0, m.Rz)(e);
                }
              }),
              (r._logExperimentExposure = function (e) {
                r._controller.report("experiment_exposure", {
                  experiment_name: e,
                  stripe_account: r._authentication.accountId,
                });
              }),
              (r._maybeEmitPaymentResponse = function (e) {
                r._isShowing && r._emitExternalEvent(e);
              }),
              (r._emitPaymentResponse = function (e) {
                var t;
                r._report("pr.payment_authorized", {
                  amount:
                    null === (t = r._reportOnlyTotal) || void 0 === t
                      ? void 0
                      : t.amount,
                  currency: r._reportOnlyCurrency,
                });
                var n = e.token,
                  o = (0, d.Z)(e, ["token"]),
                  i = o.payerEmail,
                  a = o.payerPhone,
                  s = o.complete,
                  u = r._showCalledByButtonElement
                    ? k.Yj.paymentRequestButton
                    : null;
                r._hasRegisteredListener("token") &&
                  ("googlePay" === o.walletName &&
                    r._controller.action.removeElementsExperimentId({
                      experimentKey: k.D3.elements_session,
                    }),
                  r._maybeEmitPaymentResponse({ type: "token", payload: e })),
                  r._hasRegisteredListener("paymentmethod")
                    ? r._controller.action
                        .createPaymentMethodWithData({
                          elementName: u,
                          type: "card",
                          paymentMethodData: {
                            card: { token: n.id },
                            billing_details: {
                              email:
                                r._initialOptions
                                  .__billingDetailsEmailOverride || i,
                              phone: a,
                            },
                          },
                          mids: null,
                        })
                        .then(function (e) {
                          "error" === e.type
                            ? e.error.code && "email_invalid" === e.error.code
                              ? s("invalid_payer_email")
                              : (r._report(
                                  "fatal.pr.token_to_payment_method_failed",
                                  { error: e.error, token: n.id }
                                ),
                                s("fail"))
                            : r._maybeEmitPaymentResponse({
                                type: "paymentmethod",
                                payload: (0, c.Z)(
                                  (0, c.Z)({}, o),
                                  {},
                                  { paymentMethod: e.object }
                                ),
                              });
                        })
                    : r._hasRegisteredListener("source") &&
                      r._controller.action
                        .createSourceWithData({
                          elementName: u,
                          type: "card",
                          sourceData: {
                            token: n.id,
                            owner: {
                              email:
                                r._initialOptions
                                  .__billingDetailsEmailOverride || i,
                              phone: a,
                            },
                          },
                          mids: null,
                        })
                        .then(function (e) {
                          "error" === e.type
                            ? e.error.code && "email_invalid" === e.error.code
                              ? s("invalid_payer_email")
                              : (r._report("fatal.pr.token_to_source_failed", {
                                  error: e.error,
                                  token: n.id,
                                }),
                                s("fail"))
                            : r._maybeEmitPaymentResponse({
                                type: "source",
                                payload: (0, c.Z)(
                                  (0, c.Z)({}, o),
                                  {},
                                  { source: e.object }
                                ),
                              });
                        });
              }),
              (r._canMakePaymentForBackingLibrary = function (e) {
                var t =
                    arguments.length > 1 && void 0 !== arguments[1]
                      ? arguments[1]
                      : { skipEnrollmentCheck: !1 },
                  n = r._backingLibraries[e];
                if (!n)
                  throw new Error(
                    "Unexpectedly calling canMakePayment on uninitialized backing library."
                  );
                return B.J.race([
                  new B.J(function (e) {
                    return setTimeout(e, 1e4);
                  }).then(function () {
                    return !1;
                  }),
                  n.canMakePayment({
                    skipEnrollmentCheck: t.skipEnrollmentCheck,
                    locale: r._locale,
                  }),
                ]).then(function (t) {
                  var n,
                    o = null;
                  return (
                    "LINK" === e && "boolean" != typeof t
                      ? ((n = t.available), (o = t.linkExperimentAssignments))
                      : (n = !!t),
                    (r._canMakePaymentAvailability = (0, c.Z)(
                      (0, c.Z)({}, r._canMakePaymentAvailability),
                      {},
                      (0, p.Z)({}, e, n)
                    )),
                    {
                      backingLibraryName: e,
                      available: n,
                      linkExperimentAssignments: o,
                    }
                  );
                });
              }),
              (r._isGooglePayOnAndroid = function () {
                var e = r._initialOptions.wallets,
                  t = e && -1 === e.indexOf("googlePay"),
                  n = !!r._canMakePaymentAvailability.BROWSER;
                return h.sV && !t && n;
              }),
              (r._isInLinkBeta = function () {
                return (
                  void 0 !== r._initialOptions.__betas &&
                  (0, v.uN)(r._initialOptions.__betas, v.M4.link_in_prb_beta_1)
                );
              }),
              (r._canIncludeLink = function () {
                return !!r._usedByButtonElement;
              }),
              (r._constructCanMakePaymentResponse = function () {
                var e = r._isGooglePayOnAndroid(),
                  t = {
                    applePay: !!r._canMakePaymentAvailability.APPLE_PAY,
                    googlePay: !!r._canMakePaymentAvailability.GOOGLE_PAY || e,
                  };
                return (
                  r._canIncludeLink() &&
                    ((t.link = !!r._canMakePaymentAvailability.LINK),
                    r._report("pr.link_in_can_make_payment_response", {
                      betas: r._initialOptions.__betas,
                    })),
                  t
                );
              }),
              (r.canMakePayment = C(function () {
                if (
                  (r._report("pr.can_make_payment"), r._canMakePaymentResolved)
                ) {
                  var e,
                    t =
                      null !== r._activeBackingLibrary
                        ? r._constructCanMakePaymentResponse()
                        : null;
                  return (
                    r._report("pr.can_make_payment_response", {
                      response: t,
                      cached: !0,
                      activeBackingLibrary: r._activeBackingLibrary,
                      amount:
                        null === (e = r._reportOnlyTotal) || void 0 === e
                          ? void 0
                          : e.amount,
                      currency: r._reportOnlyCurrency,
                    }),
                    B.J.resolve(t)
                  );
                }
                if ("https:" !== window.location.protocol)
                  return (
                    ct ||
                      (r._controller.warn(
                        "If you are testing Apple Pay or Google Pay, you must serve this page over HTTPS as it will not work over HTTP. Please read https://stripe.com/docs/stripe-js/elements/payment-request-button#html-js-prerequisites for more details."
                      ),
                      (ct = !0)),
                    (r._canMakePaymentResolved = !0),
                    B.J.resolve(null)
                  );
                var n = r._canIncludeLink()
                    ? r._queryStrategy
                    : r._queryStrategy.filter(function (e) {
                        return "LINK" !== e;
                      }),
                  o = n.map(function (e) {
                    return function () {
                      return r._canMakePaymentForBackingLibrary(e);
                    };
                  });
                -1 !== n.indexOf("LINK") &&
                  o.push(function () {
                    return r._canMakePaymentForBackingLibrary("LINK", {
                      skipEnrollmentCheck: !0,
                    });
                  });
                var i = !1,
                  a = new at.E();
                return (0, q.tN)(o, function (e) {
                  var t = e.backingLibraryName,
                    n = e.available,
                    o = e.linkExperimentAssignments;
                  if (!r._isInLinkBeta() && n && "LINK" === t) {
                    var a = null == o ? void 0 : o[k.om],
                      c = null == o ? void 0 : o[k.wW];
                    if (
                      (i ||
                        (a && r._logExperimentExposure(k.om),
                        c && r._logExperimentExposure(k.wW),
                        (i = !0)),
                      "treatment" !== c)
                    )
                      return (r._canMakePaymentAvailability.LINK = !1), !n;
                  }
                  return (
                    n &&
                      ((r._activeBackingLibraryName = t),
                      (r._activeBackingLibrary = r._backingLibraries[t]),
                      (r._buttonTypeName = r._activeBackingLibraryName),
                      r._isGooglePayOnAndroid() &&
                        (r._buttonTypeName = "GOOGLE_PAY")),
                    n
                  );
                }).then(function (e) {
                  var t,
                    n = new at.E();
                  r._canMakePaymentResolved = !0;
                  var o = null;
                  return (
                    "SATISFIED" === e.type &&
                      (o = r._constructCanMakePaymentResponse()),
                    r._report("pr.can_make_payment_response", {
                      response: o,
                      cached: !1,
                      duration: a.getElapsedTime(n),
                      activeBackingLibrary: r._activeBackingLibrary,
                      amount:
                        null === (t = r._reportOnlyTotal) || void 0 === t
                          ? void 0
                          : t.amount,
                      currency: r._reportOnlyCurrency,
                    }),
                    o
                  );
                });
              })),
              (r.update = C(function (e) {
                var t;
                if (r._isShowing)
                  throw (
                    (r._report("pr.update_called_while_showing"),
                    new b.No(
                      "You cannot update Payment Request options while the payment sheet is showing."
                    ))
                  );
                var n = (0, m.Gu)(te, e, "PaymentRequest update()"),
                  o = n.value,
                  i = n.warnings;
                r._report("pr.update"),
                  i.forEach(function (e) {
                    return r._warn(e);
                  }),
                  o.shippingOptions &&
                    !(null === (t = r._initialOptions) || void 0 === t
                      ? void 0
                      : t.requestShipping) &&
                    r._report("pr.update_shipping_options_without_shipping"),
                  o.total && (r._reportOnlyTotal = o.total),
                  o.currency && (r._reportOnlyCurrency = o.currency),
                  (0, g.VO)(r._backingLibraries).forEach(function (e) {
                    e && e.update(o);
                  });
              })),
              (r.show = C(function () {
                var e;
                if (
                  (r._usedByButtonElement &&
                    !r._showCalledByButtonElement &&
                    (r._report("pr.show_called_with_button"),
                    r._warn(
                      "Do not call show() yourself if you are using the paymentRequestButton Element. The Element handles showing the payment sheet."
                    )),
                  !r._canMakePaymentResolved)
                )
                  throw (
                    (r._report("pr.show_called_before_can_make_payment"),
                    new b.No(
                      "You must first check the Payment Request API's availability using paymentRequest.canMakePayment() before calling show()."
                    ))
                  );
                if (!r._activeBackingLibrary)
                  throw (
                    (r._report("pr.show_called_with_can_make_payment_false"),
                    new b.No(
                      "Payment Request is not available in this browser."
                    ))
                  );
                if (
                  !r._showCalledByButtonElement &&
                  "LINK" === r._activeBackingLibraryName
                )
                  throw (
                    (r._report("pr.show_called_with_link"),
                    new b.No(
                      "Payment Request with Link cannot be used without the paymentRequestButton Element"
                    ))
                  );
                var t = r._activeBackingLibrary;
                r._report("pr.show", {
                  amount:
                    null === (e = r._reportOnlyTotal) || void 0 === e
                      ? void 0
                      : e.amount,
                  currency: r._reportOnlyCurrency,
                  listeners: Object.keys(r._callbacks).sort(),
                }),
                  (r._isShowing = !0),
                  t.show({ locale: r._locale });
              })),
              (r.abort = C(function () {
                if (r._activeBackingLibrary) {
                  var e = r._activeBackingLibrary;
                  r._report("pr.abort"), e.abort();
                }
              })),
              (r.isShowing = function () {
                return r._isShowing;
              }),
              (r._controller = e.controller),
              (r._authentication = e.authentication),
              (r._mids = e.mids),
              (r._listenerRegistry = e.listenerRegistry);
            var o = (0, m.Gu)(
                (e.betas,
                (0, m.mC)({
                  displayItems: (0, m.jt)((0, m.CT)(V)),
                  shippingOptions: (0, m.jt)((0, m.uw)("id")((0, m.CT)(X))),
                  wallets: (0, m.jt)(
                    (0, m.CT)(
                      m.kw.apply(
                        void 0,
                        (0, s.Z)(
                          G().filter(function (e) {
                            return e !== F.link;
                          })
                        )
                      )
                    )
                  ),
                  disableWallets: (0, m.jt)(
                    (0, m.CT)(m.kw.apply(void 0, (0, s.Z)(G())))
                  ),
                  blockedCardBrands: (0, m.jt)(
                    (0, m.CT)(m.kw.apply(void 0, (0, s.Z)(k.iw)))
                  ),
                  total: W,
                  requestShipping: (0, m.jt)(m.Xg),
                  requestPayerName: (0, m.jt)(m.Xg),
                  requestPayerEmail: (0, m.jt)(m.Xg),
                  requestPayerPhone: (0, m.jt)(m.Xg),
                  shippingType: (0, m.jt)($),
                  currency: m.cV,
                  country: m.hN,
                  jcbEnabled: (0, m.jt)(m.Xg),
                  __billingDetailsEmailOverride: (0, m.jt)(m.Z_),
                  __minApplePayVersion: (0, m.jt)(m.Rx),
                  __minGooglePayVersion: (0, m.jt)(Q),
                  __merchantDetails: (0, m.jt)(ee),
                  __isCheckout: (0, m.jt)(m.Xg),
                  __betas: (0, m.jt)(
                    (0, m.CT)(m.z$.apply(void 0, (0, s.Z)(v.Lv)))
                  ),
                })),
                e.rawOptions || {},
                "paymentRequest()"
              ),
              i = o.value,
              a = o.warnings;
            if (
              (r._report("pr.options", {
                options: (0, g.ei)(i, [
                  "country",
                  "currency",
                  "jcbEnabled",
                  "requestPayerEmail",
                  "requestPayerName",
                  "requestPayerPhone",
                  "requestShipping",
                  "disableWallets",
                  "wallets",
                  "blockedCardBrands",
                ]),
              }),
              a.forEach(function (e) {
                return r._warn(e);
              }),
              i.__billingDetailsEmailOverride && i.requestPayerEmail)
            )
              throw new b.No(
                "When providing `__billingDetailsEmailOverride`, `requestPayerEmail` has to be `false` so that the customer is not prompted for their email in the payment sheet."
              );
            var l = (0, v.uN)(e.betas, v.M4.link_in_prb_beta_1),
              f = G(),
              _ = i.disableWallets,
              y = _
                ? f.filter(function (e) {
                    return -1 === _.indexOf(e) && (l || e !== F.link);
                  })
                : i.wallets;
            return (
              e.queryStrategyOverride
                ? (r._queryStrategy = e.queryStrategyOverride)
                : (r._queryStrategy = oe(y || f)),
              r._report("pr.query_strategy", {
                queryStrategy: r._queryStrategy,
              }),
              (r._initialOptions = (0, c.Z)(
                (0, c.Z)({}, i),
                {},
                { __betas: e.betas, wallets: y }
              )),
              (r._reportOnlyCurrency = i.currency),
              (r._reportOnlyTotal = i.total),
              r._initBackingLibraries(r._initialOptions),
              r
            );
          }
          (0, x.Z)(t, e);
          var n = (0, L.Z)(t);
          return t;
        })(D),
        ut = st,
        lt = {
          base: (0, m.jt)(m.Ry),
          complete: (0, m.jt)(m.Ry),
          empty: (0, m.jt)(m.Ry),
          invalid: (0, m.jt)(m.Ry),
          paymentRequestButton: (0, m.jt)(m.Ry),
        },
        pt = {
          classes: (0, m.jt)(
            (0, m.mC)({
              base: (0, m.jt)(m.Z_),
              complete: (0, m.jt)(m.Z_),
              empty: (0, m.jt)(m.Z_),
              focus: (0, m.jt)(m.Z_),
              invalid: (0, m.jt)(m.Z_),
              webkitAutofill: (0, m.jt)(m.Z_),
            })
          ),
          hidePostalCode: (0, m.jt)(m.Xg),
          hideIcon: (0, m.jt)(m.Xg),
          showIcon: (0, m.jt)(m.Xg),
          style: (0, m.jt)((0, m.mC)(lt)),
          iconStyle: (0, m.jt)((0, m.kw)("solid", "default")),
          value: (0, m.jt)((0, m.or)(m.Z_, m.Ry)),
          __privateCvcOptional: (0, m.jt)(m.Xg),
          __privateValue: (0, m.jt)((0, m.or)(m.Z_, m.Ry)),
          __privateEmitIbanValue: (0, m.jt)(m.Xg),
          error: (0, m.jt)(
            (0, m.mC)({
              type: m.Z_,
              code: (0, m.jt)(m.Z_),
              decline_code: (0, m.jt)(m.Z_),
              param: (0, m.jt)(m.Z_),
            })
          ),
          locale: (0, m.yv)("elements()"),
          fonts: (0, m.yv)("elements()"),
          placeholder: (0, m.jt)(m.Z_),
          disabled: (0, m.jt)(m.Xg),
          placeholderCountry: (0, m.jt)(m.Z_),
          paymentRequest: (0, m.jt)(
            (0, m.n2)(ut, "stripe.paymentRequest(...)")
          ),
          supportedCountries: (0, m.jt)((0, m.CT)(m.Z_)),
          accountHolderType: (0, m.jt)((0, m.kw)("individual", "company")),
          issuingCard: (0, m.jt)(m.Z_),
          ephemeralKeySecret: (0, m.jt)(m.Z_),
          nonce: (0, m.jt)(m.Z_),
          toCopy: (0, m.jt)((0, m.kw)("number", "cvc", "expiry", "pin")),
        },
        dt = (0, m.mC)(pt),
        mt =
          ((et = {}),
          (0, p.Z)(et, k.Yj.card, Be.NC.CARD_ELEMENT),
          (0, p.Z)(et, k.Yj.cardNumber, Be.NC.CARD_ELEMENT),
          (0, p.Z)(et, k.Yj.cardExpiry, Be.NC.CARD_ELEMENT),
          (0, p.Z)(et, k.Yj.cardCvc, Be.NC.CARD_ELEMENT),
          (0, p.Z)(et, k.Yj.postalCode, Be.NC.CARD_ELEMENT),
          (0, p.Z)(
            et,
            k.Yj.paymentRequestButton,
            Be.NC.PAYMENT_REQUEST_ELEMENT
          ),
          (0, p.Z)(et, k.Yj.iban, Be.NC.IBAN_ELEMENT),
          (0, p.Z)(et, k.Yj.idealBank, Be.NC.IDEAL_BANK_ELEMENT),
          (0, p.Z)(et, k.Yj.p24Bank, Be.NC.P24_BANK_ELEMENT),
          (0, p.Z)(et, k.Yj.auBankAccount, Be.NC.AU_BANK_ACCOUNT_ELEMENT),
          (0, p.Z)(et, k.Yj.fpxBank, Be.NC.FPX_BANK_ELEMENT),
          (0, p.Z)(
            et,
            k.Yj.issuingCardNumberDisplay,
            Be.NC.ISSUING_CARD_NUMBER_DISPLAY_ELEMENT
          ),
          (0, p.Z)(
            et,
            k.Yj.issuingCardCopyButton,
            Be.NC.ISSUING_CARD_COPY_BUTTON_ELEMENT
          ),
          (0, p.Z)(
            et,
            k.Yj.issuingCardCvcDisplay,
            Be.NC.ISSUING_CARD_CVC_DISPLAY_ELEMENT
          ),
          (0, p.Z)(
            et,
            k.Yj.issuingCardExpiryDisplay,
            Be.NC.ISSUING_CARD_EXPIRY_DISPLAY_ELEMENT
          ),
          (0, p.Z)(
            et,
            k.Yj.issuingCardPinDisplay,
            Be.NC.ISSUING_CARD_PIN_DISPLAY_ELEMENT
          ),
          (0, p.Z)(et, k.Yj.epsBank, Be.NC.EPS_BANK_ELEMENT),
          (0, p.Z)(et, k.Yj.netbankingBank, Be.NC.NETBANKING_BANK_ELEMENT),
          (0, p.Z)(
            et,
            k.Yj.afterpayClearpayMessageModal,
            Be.NC.AFTERPAY_MESSAGE_MODAL_ELEMENT
          ),
          (0, p.Z)(
            et,
            k.Yj.autocompleteSuggestions,
            Be.NC.AUTOCOMPLETE_SUGGESTIONS_ELEMENT
          ),
          (0, p.Z)(
            et,
            k.Yj.achBankSearchResults,
            Be.NC.ACH_BANK_SEARCH_RESULTS_ELEMENT
          ),
          et),
        ft = function (e) {
          var t = (0, _.Dx)(e, null);
          return !!t && "rtl" === t.getPropertyValue("direction");
        },
        _t = function () {
          document.activeElement &&
            document.activeElement.blur &&
            document.activeElement.blur();
        },
        ht = e(7030),
        yt = e(9144),
        vt = function (e) {
          var t = document.createElement("input");
          return (
            (t.className = e),
            t.setAttribute("aria-hidden", "true"),
            t.setAttribute("aria-label", " "),
            t.setAttribute("autocomplete", "false"),
            (t.maxLength = 1),
            (t.disabled = !0),
            (0, _.yq)(t, yt.ZS),
            t
          );
        },
        gt = {
          margin: "0",
          padding: "0",
          border: "none",
          display: "block",
          background: "transparent",
          position: "relative",
          opacity: "1",
        },
        bt = function (e) {
          var t = e.name,
            n = e.value,
            r = e.expiresIn,
            o = e.path,
            i = e.domain,
            a = e.protocol,
            c = e.sameSite,
            s = void 0 === c ? "Lax" : c,
            u = new Date(),
            l = r || 31536e6;
          u.setTime(u.getTime() + l);
          var p = o || "/",
            d = (n || "").replace(/[^!#-+\--:<-[\]-~]/g, encodeURIComponent),
            m = ""
              .concat(encodeURIComponent(t), "=")
              .concat(d, ";expires=")
              .concat(u.toGMTString(), ";path=")
              .concat(p, ";SameSite=")
              .concat(s);
          return (
            i && (m += ";domain=".concat(i)),
            "https:" === a && (m += ";secure"),
            (document.cookie = m),
            m
          );
        },
        wt = function (e) {
          var t = (0, g.sE)(document.cookie.split("; "), function (t) {
            var n = t.indexOf("=");
            try {
              return decodeURIComponent(t.substr(0, n)) === e;
            } catch (e) {
              return !1;
            }
          });
          if (!t) return null;
          var n = t.indexOf("=");
          try {
            return decodeURIComponent(t.substr(n + 1));
          } catch (e) {
            return null;
          }
        },
        kt = e(3110),
        Et = e.n(kt),
        St = k.Xk.replace(/\/$/, ""),
        Pt = "_1776170249",
        At = "__1104211103",
        Ct = (function (e) {
          var t,
            n = ((t = {}), (0, p.Z)(t, Pt, !0), (0, p.Z)(t, At, !1), t);
          try {
            var r = (0, y.vB)(e.slice(e.indexOf("?") + 1));
            Object.keys(r).forEach(function (e) {
              var t = Et()(e),
                o = r[e];
              switch (t) {
                case Pt:
                  "false" === o && (n[t] = !1);
                  break;
                case At:
                  "true" === o && (n[t] = !0);
              }
            });
          } catch (e) {}
          return n;
        })(
          (function (e) {
            try {
              if (e.currentScript) return e.currentScript.src;
              var t = e.querySelectorAll('script[src^="'.concat(St, '"]')),
                n = (0, g.sE)(t, function (e) {
                  var t = (e.getAttribute("src") || "").split("?")[0];
                  return new RegExp("^".concat(St, "/?$")).test(t);
                });
              return (n && n.getAttribute("src")) || "";
            } catch (e) {
              return "";
            }
          })(document)
        ),
        Nt = Ct[Pt],
        It = Ct[At],
        Tt = e(3852),
        Mt = e(3538),
        jt = e(4044),
        Ot = (function (e) {
          function t(e) {
            var r,
              o = e.type,
              i = e.controllerId,
              a = e.listenerRegistry,
              c = e.betas,
              s = e.appParams;
            return (
              (0, u.Z)(this, t),
              ((r = n.call(this))._sendFAReq = function (e) {
                var t = (0, f.To)(e.tag);
                return new B.J(function (n, o) {
                  (r._requests[t] = { resolve: n, reject: o }),
                    r._send({
                      message: {
                        action: "stripe-frame-action",
                        payload: { nonce: t, faReq: e },
                      },
                      type: "outer",
                      frameId: r.id,
                      controllerId: r._controllerId,
                    });
                });
              }),
              (r.action = {
                perform3DS2Challenge: function (e) {
                  return r._sendFAReq({
                    tag: "PERFORM_3DS2_CHALLENGE",
                    value: e,
                  });
                },
                perform3DS2Fingerprint: function (e) {
                  return r._sendFAReq({
                    tag: "PERFORM_3DS2_FINGERPRINT",
                    value: e,
                  });
                },
                performOneClickWebauthnAuthentication: function (e) {
                  return r._sendFAReq({
                    tag: "PERFORM_ONE_CLICK_WEBAUTHN_AUTHENTICATION",
                    value: e,
                  });
                },
                show3DS2Spinner: function (e) {
                  return r._sendFAReq({ tag: "SHOW_3DS2_SPINNER", value: e });
                },
                checkCanMakePayment: function (e) {
                  return r._sendFAReq({
                    tag: "CHECK_CAN_MAKE_PAYMENT",
                    value: e,
                  });
                },
                closeLightboxFrame: function (e) {
                  return r._sendFAReq({
                    tag: "CLOSE_LIGHTBOX_FRAME",
                    value: e,
                  });
                },
                openLightboxFrame: function (e) {
                  return r._sendFAReq({ tag: "OPEN_LIGHTBOX_FRAME", value: e });
                },
                setFocusTarget: function (e) {
                  return r._sendFAReq({ tag: "SET_FOCUS_TARGET", value: e });
                },
              }),
              (r.type = o),
              (r.loaded = !1),
              (r._controllerId = i),
              (r._persistentMessages = []),
              (r._queuedMessages = []),
              (r._requests = {}),
              (r._listenerRegistry = a),
              (r.id = r._generateId()),
              (r._iframe = r._createIFrame(o, c, s)),
              r._on("load", function () {
                (r.loaded = !0),
                  r._ensureMounted(),
                  r.loaded &&
                    (r._persistentMessages.forEach(function (e) {
                      return r._send(e);
                    }),
                    r._queuedMessages.forEach(function (e) {
                      return r._send(e);
                    }),
                    (r._queuedMessages = []));
              }),
              r._on("title", function (e) {
                var t = e.title;
                r._iframe.setAttribute("title", t);
              }),
              r
            );
          }
          (0, x.Z)(t, e);
          var n = (0, L.Z)(t);
          return (
            (0, l.Z)(t, [
              {
                key: "_generateId",
                value: function () {
                  return (0, f.To)("__privateStripeFrame");
                },
              },
              {
                key: "send",
                value: function (e) {
                  this._send({
                    message: e,
                    type: "outer",
                    frameId: this.id,
                    controllerId: this._controllerId,
                  });
                },
              },
              {
                key: "sendPersistent",
                value: function (e) {
                  this._ensureMounted();
                  var t = {
                    message: e,
                    type: "outer",
                    frameId: this.id,
                    controllerId: this._controllerId,
                  };
                  (this._persistentMessages = [].concat(
                    (0, s.Z)(this._persistentMessages),
                    [t]
                  )),
                    this.loaded && (0, Be.oi)(t);
                },
              },
              {
                key: "resolve",
                value: function (e, t) {
                  this._requests[e] && this._requests[e].resolve(t);
                },
              },
              {
                key: "reject",
                value: function (e, t) {
                  this._requests[e] && this._requests[e].reject(t);
                },
              },
              {
                key: "_send",
                value: function (e) {
                  this._ensureMounted(),
                    this.loaded
                      ? (0, Be.oi)(e)
                      : (this._queuedMessages = [].concat(
                          (0, s.Z)(this._queuedMessages),
                          [e]
                        ));
                },
              },
              {
                key: "appendTo",
                value: function (e) {
                  this._emit("mount", { anchor: e }),
                    e.appendChild(this._iframe);
                },
              },
              {
                key: "prependTo",
                value: function (e, t) {
                  this._emit("mount", { anchor: e, parent: t }),
                    t.insertBefore(this._iframe, e);
                },
              },
              {
                key: "unmount",
                value: function () {
                  (this.loaded = !1), this._emit("unload");
                },
              },
              {
                key: "destroy",
                value: function () {
                  this.unmount();
                  var e = this._iframe.parentElement;
                  e && e.removeChild(this._iframe), this._emit("destroy");
                },
              },
              {
                key: "_ensureMounted",
                value: function () {
                  this._isMounted() || this.unmount();
                },
              },
              {
                key: "_isMounted",
                value: function () {
                  return (
                    !!document.body && document.body.contains(this._iframe)
                  );
                },
              },
              {
                key: "_createIFrame",
                value: function (e, t, n) {
                  var r = window.location.href.toString(),
                    o =
                      "string" == typeof n
                        ? n
                        : (0, y.qC)(
                            (0, c.Z)(
                              (0, c.Z)({}, n || {}),
                              {},
                              { referrer: r, controllerId: this._controllerId }
                            )
                          ),
                    i = document.createElement("iframe");
                  i.setAttribute("name", this.id);
                  var a = (0, Be.i7)(e);
                  return (
                    Object.keys(a).forEach(function (e) {
                      i.setAttribute(e, a[e]);
                    }),
                    (null == n ? void 0 : n.allowCamera) &&
                      i.setAttribute("allow", "camera"),
                    (i.src = ""
                      .concat((0, jt.D)(e))
                      .concat(o ? "#" : "")
                      .concat(o)),
                    i
                  );
                },
              },
            ]),
            t
          );
        })(D),
        Rt = Ot,
        Zt = (function (e) {
          function n(e) {
            var t;
            if (
              ((0, u.Z)(this, n),
              ((t = r.call(this, e)).autoload = e.autoload || !1),
              "complete" === document.readyState)
            )
              t._ensureMounted();
            else {
              var o = t._ensureMounted.bind((0, Z.Z)(t));
              t._listenerRegistry.addEventListener(
                document,
                "DOMContentLoaded",
                o
              ),
                t._listenerRegistry.addEventListener(window, "load", o),
                setTimeout(o, 5e3);
            }
            return t;
          }
          (0, x.Z)(n, e);
          var r = (0, L.Z)(n);
          return (
            (0, l.Z)(n, [
              {
                key: "_ensureMounted",
                value: function () {
                  t((0, Mt.Z)(n.prototype), "_ensureMounted", this).call(this),
                    this._isMounted() || this._autoMount();
                },
              },
              {
                key: "_autoMount",
                value: function () {
                  var e = document.body;
                  if (e) {
                    var t =
                      document.querySelector(
                        "#stripe-hidden-frames-container"
                      ) || e;
                    this.appendTo(t);
                  } else if (
                    "complete" === document.readyState ||
                    "interactive" === document.readyState
                  )
                    throw new b.No(
                      "Stripe.js requires that your page has a <body> element."
                    );
                  this.autoload && (this.loaded = !0);
                },
              },
              {
                key: "_createIFrame",
                value: function (e, r, o) {
                  var i = t((0, Mt.Z)(n.prototype), "_createIFrame", this).call(
                    this,
                    e,
                    r,
                    o
                  );
                  return (
                    i.setAttribute("aria-hidden", "true"),
                    i.setAttribute("tabIndex", "-1"),
                    (0, _.SV)(i),
                    i
                  );
                },
              },
            ]),
            n
          );
        })(Rt),
        xt = Zt,
        Lt = (function (e) {
          function t() {
            return (0, u.Z)(this, t), n.apply(this, arguments);
          }
          (0, x.Z)(t, e);
          var n = (0, L.Z)(t);
          return (
            (0, l.Z)(t, [
              {
                key: "_generateId",
                value: function () {
                  return this._controllerId;
                },
              },
            ]),
            t
          );
        })(xt),
        Dt = Lt,
        Bt = "__privateStripeMetricsController",
        qt = "merchant",
        Ft = "session",
        Ut = "NA",
        Gt = function (e) {
          return 42 === e.length;
        },
        Yt = function (e, t, n) {
          return n ? (!e || (!Gt(e) && Gt(t)) ? t : e) : (0, f.Vj)();
        },
        zt = (function () {
          function e() {
            var t = this,
              n =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : {};
            if (
              ((0, u.Z)(this, e),
              (this._controllerFrame = null),
              (this._latencies = []),
              (this._handleMessage = function (e) {
                return function (n) {
                  var r = n.data,
                    o = n.origin;
                  if ((0, y.Qg)(o) && "string" == typeof r)
                    try {
                      var i = JSON.parse(r),
                        a = i.originatingScript,
                        c = i.payload;
                      if ("m2" === a) {
                        var s = c.guid,
                          u = c.muid,
                          l = c.sid;
                        (t._guid = s),
                          (t._muid = t._getID(qt, u)),
                          (t._sid = t._getID(Ft, l)),
                          e();
                      }
                    } catch (e) {}
                };
              }),
              n.checkoutIds)
            ) {
              var r = n.checkoutIds,
                o = r.muid,
                i = r.sid;
              (this._guid = Ut),
                (this._muid = o),
                (this._sid = i),
                (this._doNotPersist = "NA" !== o && "NA" !== i);
            } else
              (this._guid = Ut),
                (this._muid = this._getID(qt)),
                (this._sid = this._getID(Ft)),
                (this._doNotPersist = !1);
            (this._listenerRegistry = (0, Tt.E)()),
              (this._idsPromise = new B.J(function (e) {
                t._establishMessageChannel(e);
              })),
              (this._id = (0, f.To)(Bt)),
              Nt &&
                ((this._controllerFrame = new Dt({
                  type: Be.NC.METRICS_CONTROLLER,
                  controllerId: this._id,
                  listenerRegistry: this._listenerRegistry,
                  autoload: !0,
                  appParams: this._buildFrameQueryString(),
                })),
                this._startIntervalCheck(),
                setTimeout(
                  this._testLatency.bind(this),
                  2e3 + 500 * Math.random()
                ));
          }
          return (
            (0, l.Z)(e, [
              {
                key: "ids",
                value: function () {
                  return { guid: this._guid, muid: this._muid, sid: this._sid };
                },
              },
              {
                key: "idsPromise",
                value: function () {
                  var e = this;
                  return this._idsPromise.then(function () {
                    return e.ids();
                  });
                },
              },
              {
                key: "_establishMessageChannel",
                value: function (e) {
                  if (!Nt) return (this._guid = (0, f.Vj)()), void e();
                  this._listenerRegistry.addEventListener(
                    window,
                    "message",
                    this._handleMessage(e)
                  );
                },
              },
              {
                key: "_startIntervalCheck",
                value: function () {
                  var e = this,
                    t = window.location.href;
                  setInterval(function () {
                    var n = window.location.href;
                    n !== t &&
                      (e.send(function (e) {
                        return {
                          action: "ping",
                          payload: {
                            sid: e.sid,
                            muid: e.muid,
                            title: document.title,
                            referrer: document.referrer,
                            url: document.location.href,
                            version: 6,
                          },
                        };
                      }),
                      (t = n));
                  }, 5e3);
                },
              },
              {
                key: "report",
                value: function (e, t) {
                  this.send(function (n) {
                    return {
                      action: "track",
                      payload: {
                        sid: n.sid,
                        muid: n.muid,
                        url: document.location.href,
                        source: e,
                        data: t,
                        version: 6,
                      },
                    };
                  });
                },
              },
              {
                key: "send",
                value: function (e) {
                  var t = this;
                  this._idsPromise.then(function () {
                    try {
                      t._controllerFrame && t._controllerFrame.send(e(t.ids()));
                    } catch (e) {}
                  });
                },
              },
              {
                key: "_testLatency",
                value: function () {
                  var e = this,
                    t = new Date();
                  this._listenerRegistry.addEventListener(
                    document,
                    "mousemove",
                    function n() {
                      try {
                        var r = new Date();
                        e._latencies.push(r - t),
                          e._latencies.length >= 10 &&
                            (e.report("mouse-timings-10", e._latencies),
                            e._listenerRegistry.removeEventListener(
                              document,
                              "mousemove",
                              n
                            )),
                          (t = r);
                      } catch (e) {}
                    }
                  );
                },
              },
              {
                key: "_extractMetaReferrerPolicy",
                value: function () {
                  var e = document.querySelector("meta[name=referrer]");
                  return null != e && e instanceof HTMLMetaElement
                    ? e.content.toLowerCase()
                    : null;
                },
              },
              {
                key: "_extractUrl",
                value: function (e) {
                  var t = document.location.href;
                  switch (e) {
                    case "origin":
                    case "strict-origin":
                    case "origin-when-cross-origin":
                    case "strict-origin-when-cross-origin":
                      return document.location.origin;
                    case "unsafe-url":
                      return t.split("#")[0];
                    default:
                      return t;
                  }
                },
              },
              {
                key: "_buildFrameQueryString",
                value: function () {
                  var e = this._extractMetaReferrerPolicy(),
                    t = this._extractUrl(e),
                    n = {
                      url: t,
                      title: document.title,
                      referrer: document.referrer,
                      muid: this._muid,
                      sid: this._sid,
                      version: 6,
                      preview: (0, y.Qg)(t),
                    };
                  return (
                    null != e && (n.metaReferrerPolicy = e),
                    Object.keys(n)
                      .map(function (e) {
                        return null != n[e]
                          ? ""
                              .concat(e, "=")
                              .concat(encodeURIComponent(n[e].toString()))
                          : null;
                      })
                      .join("&")
                  );
                },
              },
              {
                key: "_getID",
                value: function (e) {
                  var t =
                    arguments.length > 1 && void 0 !== arguments[1]
                      ? arguments[1]
                      : Ut;
                  switch (e) {
                    case qt:
                      if (this._doNotPersist) return Yt(this._muid, t, Nt);
                      try {
                        var n = "__stripe_mid",
                          r = Yt(wt(n), t, Nt);
                        return (
                          Gt(r) &&
                            bt({
                              name: n,
                              value: r,
                              domain: ".".concat(document.location.hostname),
                              protocol: document.location.protocol,
                              sameSite: "Strict",
                            }),
                          r
                        );
                      } catch (e) {
                        return Ut;
                      }
                    case Ft:
                      if (this._doNotPersist) return Yt(this._sid, t, Nt);
                      try {
                        var o = "__stripe_sid",
                          i = Yt(wt(o), t, Nt);
                        return (
                          Gt(i) &&
                            bt({
                              name: o,
                              value: i,
                              domain: ".".concat(document.location.hostname),
                              protocol: document.location.protocol,
                              sameSite: "Strict",
                              expiresIn: 18e5,
                            }),
                          i
                        );
                      } catch (e) {
                        return Ut;
                      }
                    default:
                      throw new Error("Invalid ID type specified: ".concat(e));
                  }
                },
              },
            ]),
            e
          );
        })(),
        Ht = null,
        Kt = function () {
          var e =
            arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          return (Ht = new zt(e));
        },
        Jt = !1,
        Wt = function () {
          var e = Ht;
          e &&
            (Jt ||
              ((Jt = !0),
              e.send(function (e) {
                return {
                  action: "ping",
                  payload: {
                    v2: 2,
                    sid: e.sid,
                    muid: e.muid,
                    title: document.title,
                    referrer: document.referrer,
                    url: document.location.href,
                    version: 6,
                  },
                };
              }),
              e.send(function (t) {
                return {
                  action: "track",
                  payload: {
                    sid: t.sid,
                    muid: t.muid,
                    url: document.location.href,
                    source: "mouse-timings-10-v2",
                    data: e._latencies,
                    version: 6,
                  },
                };
              })));
        },
        Vt = ["test_id"],
        Xt = function (e) {
          switch (e.type) {
            case "object":
              return Vt.push(e.object.id), { issuingCard: e.object };
            case "error":
              return { error: e.error };
            default:
              return (0, m.Rz)(e);
          }
        },
        Qt = function (e) {
          switch (e.type) {
            case "object":
              return { nonce: e.object.public_nonce };
            case "error":
              return { error: e.error };
            default:
              return (0, m.Rz)(e);
          }
        },
        $t = {
          display: "block",
          position: "absolute",
          top: "50%",
          right: "0",
          "margin-top": "-14px",
          height: "28px",
          width: "0",
          padding: "0",
          border: "none",
          overflow: "hidden",
          opacity: "1",
          visibility: "visible",
        },
        en = function (e) {
          var t = e.parent,
            n = e.frame,
            r = e.locale,
            o = void 0 === r ? "en" : r,
            i = e.controller,
            a = e.style,
            s = e.onLoad,
            u = e.onError,
            l = !1,
            p = (0, jt.D)("LINK_BUTTON_FOR_CARD_ELEMENT"),
            d = document.createElement("iframe");
          d.setAttribute("frameborder", "0"),
            d.setAttribute("allowTransparency", "true"),
            d.setAttribute("scrolling", "no"),
            (0, _.yq)(d, $t),
            (d.src = ""
              .concat(p, "#")
              .concat((0, y.qC)({ locale: o, style: a })));
          var m = function (e) {
              var t,
                r,
                a = e.data,
                p = e.origin;
              if (
                e.source === d.contentWindow &&
                p === k.jQ &&
                -1 !==
                  (null === (t = a.action) || void 0 === t
                    ? void 0
                    : t.indexOf("card-element-link"))
              )
                switch (a.action) {
                  case "card-element-link-load":
                    (l = !0), s();
                    break;
                  case "card-element-link-click":
                    n.send({
                      action: "stripe-user-link-click",
                      payload: {
                        locale: o || "en",
                        type: a.payload.type,
                        publishableKey: i._apiKey,
                        stripeAccount:
                          null !== (r = i._stripeAccount) && void 0 !== r
                            ? r
                            : null,
                        stripeJsId: i._stripeJsId,
                        mids: i.mids(),
                      },
                    });
                    break;
                  case "card-element-link-update-styles":
                    (0, _.yq)(d, (0, c.Z)((0, c.Z)({}, $t), a.payload));
                    break;
                  case "card-element-link-error":
                    u(a.payload.reason || "");
                }
            },
            f = function (e) {
              var t,
                n = e.isOpen;
              null === (t = d.contentWindow) ||
                void 0 === t ||
                t.postMessage(
                  {
                    action: "card-element-link-popup-toggled",
                    payload: { isOpen: n },
                  },
                  k.jQ
                );
            };
          return (
            n._on("outer-link-popup-toggled", f),
            window.addEventListener("message", m, !1),
            null == t || t.appendChild(d),
            {
              unmount: function () {
                var e;
                null === (e = d.contentWindow) ||
                  void 0 === e ||
                  e.postMessage({ action: "card-element-link-unmount" }, k.jQ),
                  n._off("outer-link-popup-toggled", f),
                  window.removeEventListener("message", m, !1),
                  null == t || t.removeChild(d);
              },
              updateButton: function (e) {
                var t;
                null === (t = d.contentWindow) ||
                  void 0 === t ||
                  t.postMessage(
                    { action: "card-element-link-button-change", payload: e },
                    k.jQ
                  );
              },
              hasLoaded: function () {
                return l;
              },
              setFocusable: function (e) {
                d.tabIndex = e ? 0 : -1;
              },
            }
          );
        },
        tn = {
          base: "StripeElement",
          focus: "StripeElement--focus",
          invalid: "StripeElement--invalid",
          complete: "StripeElement--complete",
          empty: "StripeElement--empty",
          webkitAutofill: "StripeElement--webkit-autofill",
        },
        nn = "#faffbd",
        rn = function (e) {
          return parseFloat(e.toFixed(1));
        },
        on = function (e) {
          return /^\d+(\.\d*)?px$/.test(e);
        },
        an = (function () {
          function e(t) {
            var n = this;
            (0, u.Z)(this, e),
              (this.focus = function () {
                if (n._isIssuingDisplayElement())
                  throw new b.No(
                    "Cannot call focus() on an ".concat(
                      n._componentName,
                      " Element."
                    )
                  );
                document.activeElement &&
                  document.activeElement.blur &&
                  document.activeElement.blur(),
                  n._fakeInput.focus();
              }),
              (this._formSubmit = function () {
                for (
                  var e = n._component.parentElement;
                  e && "FORM" !== e.nodeName;

                )
                  e = e.parentElement;
                if (e) {
                  var t = document.createEvent("Event");
                  t.initEvent("submit", !0, !0), e.dispatchEvent(t);
                }
              }),
              (this._setLinkButtonFrameFocusState = function (e) {
                var t;
                if ("link-manage" === e || "link-save" === e)
                  null === (t = n._linkButtonFrame) ||
                    void 0 === t ||
                    t.setFocusable(!0);
                else if ("" === e) {
                  var r;
                  null === (r = n._linkButtonFrame) ||
                    void 0 === r ||
                    r.setFocusable(!1);
                }
              }),
              (this._unmountLinkButtonFrame = function () {
                n._linkButtonFrame &&
                  (n._linkButtonFrame.unmount(), (n._linkButtonFrame = void 0));
              });
            var r = t.options,
              o = t.component,
              i = t.listenerRegistry,
              a = t.elementTimings,
              c = t.emitEvent,
              s = t.getParent,
              l = t.hasRegisteredListener,
              p = (0, g.CE)(r, ["loader"]),
              d = p.controller,
              f = p.componentName,
              _ = p.publicOptions,
              h = p.betas;
            (this._componentName = f),
              (this._component = o),
              (this._controller = d),
              (this._listenerRegistry = i),
              (this._emitEvent = c),
              (this._getParent = s),
              (this._hasRegisteredListener = l);
            var y = (0, m.Gu)(dt, _ || {}, "create()"),
              v = y.value;
            y.warnings.forEach(function (e) {
              return n._controller.warn(e);
            });
            var w,
              k = v.paymentRequest,
              E = v.classes,
              S = v.issuingCard,
              P = "paymentRequestButton" === this._componentName;
            if (P) {
              if (!k)
                throw new b.No(
                  "You must pass in a stripe.paymentRequest object in order to use this Element."
                );
              this._paymentRequest = k;
              var A = p.locale;
              this._paymentRequest._registerElement(),
                this._paymentRequest._updateLocale(A),
                null !== k._backingLibraries.LINK &&
                  this._controller.report("pr.link.will_call_config");
            }
            if (this._isIssuingDisplayElement()) {
              var C = 0 === (h || []).length;
              if (!S)
                throw new Error(
                  "You must pass in an ID to the issuingCard option in order to use this Element."
                );
              if (C) {
                if (!("nonce" in v) || !("ephemeralKeySecret" in v))
                  throw new Error(
                    "You must set the nonce and ephemeralKeySecret options to use this Element."
                  );
              } else if (((w = S), -1 === Vt.indexOf(w)))
                throw new Error(
                  "Issuing card ".concat(S, " has not been retrieved.")
                );
            }
            this._createElement(p, v, a),
              (this._classes = tn),
              this._computeCustomClasses(E || {}),
              (this._lastBackgroundColor = ""),
              (this._focused = !1),
              (this._empty = !P),
              (this._invalid = !1),
              (this._complete = !1),
              (this._autofilled = !1),
              (this._lastSubmittedAt = null);
          }
          return (
            (0, l.Z)(e, [
              {
                key: "update",
                value: function (e) {
                  var t = this,
                    n = (0, m.Gu)(dt, e || {}, "element.update()"),
                    r = n.value;
                  if (
                    (n.warnings.forEach(function (e) {
                      return t._controller.warn(e);
                    }),
                    r)
                  ) {
                    var o = r.classes,
                      i = (0, d.Z)(r, ["classes"]);
                    o &&
                      (this._removeClasses(),
                      this._computeCustomClasses(o),
                      this._updateClasses()),
                      this._updateFrameHeight(r),
                      Object.keys(i).length &&
                        (this._frame.update(i),
                        this._secondaryFrame && this._secondaryFrame.update(i));
                  }
                },
              },
              {
                key: "blur",
                value: function () {
                  if (this._isIssuingDisplayElement())
                    throw new b.No(
                      "Cannot call blur() on an ".concat(
                        this._componentName,
                        " Element."
                      )
                    );
                  this._frame.blur(), this._fakeInput.blur();
                },
              },
              {
                key: "clear",
                value: function () {
                  this._frame.clear();
                },
              },
              {
                key: "unmount",
                value: function () {
                  var e = this._getParent(),
                    t = this._label;
                  e &&
                    (this._listenerRegistry.removeEventListener(
                      e,
                      "click",
                      this.focus
                    ),
                    this._removeClasses()),
                    t &&
                      (this._listenerRegistry.removeEventListener(
                        t,
                        "click",
                        this.focus
                      ),
                      (this._label = null)),
                    this._secondaryFrame &&
                      (this._secondaryFrame.unmount(),
                      this._listenerRegistry.removeEventListener(
                        window,
                        "click",
                        this._handleOutsideClick
                      )),
                    this._linkButtonFrame &&
                      (this._linkButtonFrame.unmount(),
                      (this._linkButtonFrame = void 0)),
                    (this._fakeInput.disabled = !0),
                    this._frame.unmount();
                },
              },
              {
                key: "mount",
                value: function () {
                  if ((0, _.qW)(document, this._component)) {
                    this._controller.report("user_error.shadow_dom_mount", {
                      element: this._componentName,
                    });
                    var e = function () {
                      throw new b.No(
                        "Elements cannot be mounted in a ShadowRoot. Please mount in the Light DOM."
                      );
                    };
                    "test" === this._controller.keyMode()
                      ? e()
                      : setTimeout(e, 0);
                  }
                  if (this._paymentRequest) {
                    if (!this._paymentRequest._canMakePaymentResolved)
                      throw new b.No(
                        "For the paymentRequestButton Element, you must first check availability using paymentRequest.canMakePayment() before mounting the Element."
                      );
                    if (!this._paymentRequest._activeBackingLibraryName)
                      throw new b.No(
                        "The paymentRequestButton Element is not available in the current environment."
                      );
                  }
                  (this._mountTimestamp = new at.E()),
                    this._findPossibleLabel(),
                    this._updateClasses();
                },
              },
              {
                key: "_isIssuingDisplayElement",
                value: function () {
                  return (
                    "issuingCardNumberDisplay" === this._componentName ||
                    "issuingCardCvcDisplay" === this._componentName ||
                    "issuingCardExpiryDisplay" === this._componentName ||
                    "issuingCardPinDisplay" === this._componentName
                  );
                },
              },
              {
                key: "_updateClasses",
                value: function () {
                  var e = this._getParent();
                  e &&
                    (0, _.mb)(e, [
                      [this._classes.base, !0],
                      [this._classes.empty, this._empty],
                      [this._classes.focus, this._focused],
                      [this._classes.invalid, this._invalid],
                      [this._classes.complete, this._complete],
                      [this._classes.webkitAutofill, this._autofilled],
                    ]);
                },
              },
              {
                key: "_removeClasses",
                value: function () {
                  var e = this._getParent();
                  e &&
                    (0, _.mb)(e, [
                      [this._classes.base, !1],
                      [this._classes.empty, !1],
                      [this._classes.focus, !1],
                      [this._classes.invalid, !1],
                      [this._classes.complete, !1],
                      [this._classes.webkitAutofill, !1],
                    ]);
                },
              },
              {
                key: "_findPossibleLabel",
                value: function () {
                  var e = this._getParent();
                  if (e) {
                    var t,
                      n = e.getAttribute("id");
                    if (
                      (n &&
                        (t = document.querySelector(
                          "label[for='".concat(n, "']")
                        )),
                      t)
                    )
                      this._listenerRegistry.addEventListener(
                        e,
                        "click",
                        this.focus
                      );
                    else
                      for (
                        t = t || e.parentElement;
                        t && "LABEL" !== t.nodeName;

                      )
                        t = t.parentElement;
                    t
                      ? ((this._label = t),
                        this._listenerRegistry.addEventListener(
                          t,
                          "click",
                          this.focus
                        ))
                      : this._listenerRegistry.addEventListener(
                          e,
                          "click",
                          this.focus
                        );
                  }
                },
              },
              {
                key: "_computeCustomClasses",
                value: function (e) {
                  var t = {};
                  return (
                    Object.keys(e).forEach(function (n) {
                      if (!tn[n])
                        throw new b.No(
                          ""
                            .concat(
                              n,
                              " is not a customizable class name.\nYou can customize: "
                            )
                            .concat(Object.keys(tn).join(", "))
                        );
                      var r = e[n] || tn[n];
                      t[n] = r.replace(/\./g, " ");
                    }),
                    (this._classes = (0, c.Z)((0, c.Z)({}, this._classes), t)),
                    this
                  );
                },
              },
              {
                key: "_setupEvents",
                value: function (e, t, n) {
                  var r,
                    o = this,
                    i = e.stripeJsLoadTimestamp,
                    a = (e.stripeCreateTimestamp, e.groupCreateTimestamp),
                    c = e.createTimestamp,
                    u = 0,
                    l = 0,
                    p = {
                      stripeJsLoad: i.getAsPosixTime(),
                      stripeCreate: c.getAsPosixTime(),
                      groupCreate: a.getAsPosixTime(),
                      create: c.getAsPosixTime(),
                    };
                  if (
                    (this._frame._on("link-token-change", function (e) {
                      e.hasToken
                        ? (o._frame._iframe.setAttribute("tabIndex", "-1"),
                          o._fakeInput.setAttribute("tabIndex", "-1"))
                        : (o._frame._iframe.removeAttribute("tabIndex"),
                          o._fakeInput.removeAttribute("tabIndex"));
                    }),
                    this._frame._on("update-outer-link-frame", function (e) {
                      var t,
                        n = e.nextButtonType;
                      (
                        null === (t = o._linkButtonFrame) || void 0 === t
                          ? void 0
                          : t.hasLoaded()
                      )
                        ? (o._linkButtonFrame.updateButton(n),
                          o._setLinkButtonFrameFocusState(n))
                        : (r = n);
                    }),
                    this._frame._on("outer-link-card-mount", function () {
                      o._linkButtonFrame = en({
                        frame: o._frame,
                        parent: o._component,
                        locale: t.locale,
                        controller: o._controller,
                        style: null == n ? void 0 : n.style,
                        onLoad: function () {
                          var e;
                          r &&
                            (null === (e = o._linkButtonFrame) ||
                              void 0 === e ||
                              e.updateButton(r),
                            o._setLinkButtonFrameFocusState(r),
                            (r = ""));
                        },
                        onError: function (e) {
                          o._frame.send({
                            action: "stripe-eject-link",
                            payload: { reason: e },
                          }),
                            o._unmountLinkButtonFrame();
                        },
                      });
                    }),
                    this._frame._on("outer-link-card-unmount", function () {
                      return o._unmountLinkButtonFrame();
                    }),
                    this._frame._on("load", function (e) {
                      var t = e.source;
                      u++;
                      var n = o._getParent(),
                        r = ft(n),
                        i = o._paymentRequest
                          ? o._paymentRequest._buttonTypeName
                          : null;
                      o._mountTimestamp &&
                        (p.mount = o._mountTimestamp.getAsPosixTime()),
                        o._frame.send({
                          action: "stripe-user-mount",
                          payload: {
                            timestamps: p,
                            loadCount: u,
                            matchFrame: t === o._frame._iframe.contentWindow,
                            rtl: r,
                            paymentRequestButtonType: i,
                          },
                        });
                    }),
                    this._secondaryFrame)
                  ) {
                    var d = this._secondaryFrame;
                    d._on("load", function (e) {
                      var t = e.source;
                      l++,
                        o._mountTimestamp &&
                          (p.mount = o._mountTimestamp.getAsPosixTime()),
                        d.send({
                          action: "stripe-user-mount",
                          payload: {
                            timestamps: p,
                            loadCount: l,
                            matchFrame: t === d._iframe.contentWindow,
                            rtl: !1,
                            paymentRequestButtonType: null,
                          },
                        });
                    });
                  }
                  this._frame._on("redirectfocus", function (e) {
                    var t = e.focusDirection,
                      n = (0, _.dh)(o._component, t);
                    n && n.focus();
                  }),
                    this._frame._on("focus", function () {
                      var e;
                      (o._focused = !0),
                        o._updateClasses(),
                        null === (e = o._linkButtonFrame) ||
                          void 0 === e ||
                          e.setFocusable(!0);
                    }),
                    this._frame._on("blur", function () {
                      var e;
                      (o._focused = !1),
                        o._updateClasses(),
                        null === (e = o._linkButtonFrame) ||
                          void 0 === e ||
                          e.setFocusable(!1),
                        o._lastSubmittedAt &&
                          "paymentRequestButton" === o._componentName &&
                          (o._controller.report(
                            "payment_request_button.sheet_visible",
                            { latency: o._lastSubmittedAt.getElapsedTime() }
                          ),
                          (o._lastSubmittedAt = null));
                    }),
                    this._frame._on("submit", function () {
                      if ("paymentRequestButton" === o._componentName) {
                        o._lastSubmittedAt = new at.E();
                        var e = !1,
                          t = !1;
                        Wt(),
                          o._emitEvent("click", {
                            preventDefault: function () {
                              o._controller.report(
                                "payment_request_button.default_prevented"
                              ),
                                e &&
                                  o._controller.warn(
                                    "event.preventDefault() was called after the payment sheet was shown. Make sure to call it synchronously when handling the `click` event."
                                  ),
                                (t = !0);
                            },
                          }),
                          !t &&
                            o._paymentRequest &&
                            (o._paymentRequest._elementShow(), (e = !0));
                      } else o._emitEvent("submit"), o._formSubmit();
                    }),
                    ["ready", "focus", "blur", "escape", "click"].forEach(
                      function (e) {
                        o._frame._on(e, function () {
                          o._emitEvent(e);
                        });
                      }
                    ),
                    this._frame._on("change", function (e) {
                      Wt();
                      var t = {},
                        n = O._0[o._componentName] || [];
                      ["error", "value", "empty", "complete"]
                        .concat((0, s.Z)(n))
                        .forEach(function (n) {
                          return (t[n] = e[n]);
                        }),
                        o._emitEvent("change", t),
                        (o._empty = t.empty),
                        (o._invalid = !!t.error),
                        (o._complete = t.complete),
                        o._updateClasses();
                    }),
                    this._frame._on("__privateIntegrationError", function (e) {
                      var t = e.message;
                      o._emitEvent("__privateIntegrationError", { message: t });
                    }),
                    this._frame._on("networkschange-start", function () {
                      o._hasRegisteredListener("networkschange") &&
                        o._controller.action
                          .isCardMetadataRequired({ groupId: t.groupId })
                          .then(function (e) {
                            return (
                              e && o._emitNetworksChangeEvent(null, !0),
                              o._controller.action.retrieveCardNetworks({
                                groupId: t.groupId,
                              })
                            );
                          })
                          .then(function (e) {
                            e && o._emitNetworksChangeEvent(e, !1);
                          });
                    }),
                    this._frame._on("dimensions", function (e) {
                      var t = o._getParent();
                      if (t) {
                        var n = (0, _.Dx)(t, null);
                        if (n) {
                          var r = parseFloat(n.getPropertyValue("height")),
                            i = e.height;
                          if (
                            "border-box" === n.getPropertyValue("box-sizing")
                          ) {
                            var a = parseFloat(
                                n.getPropertyValue("padding-top")
                              ),
                              c = parseFloat(
                                n.getPropertyValue("padding-bottom")
                              );
                            r =
                              r -
                              parseFloat(n.getPropertyValue("border-top")) -
                              parseFloat(n.getPropertyValue("border-bottom")) -
                              a -
                              c;
                          }
                          var s = rn(r),
                            u = rn(i);
                          0 !== r &&
                            s < u &&
                            o._controller.report("wrapper_height_mismatch", {
                              height: u,
                              outer_height: s,
                            });
                          var l = o._component.getBoundingClientRect().height,
                            p = rn(l);
                          0 !== l &&
                            0 !== i &&
                            p !== u &&
                            (o._frame.updateStyle({
                              height: "".concat(i, "px"),
                            }),
                            o._controller.report("iframe_height_update", {
                              height: u,
                              calculated_height: p,
                            }));
                        }
                      }
                    }),
                    this._frame._on("autofill", function () {
                      var e = o._getParent();
                      if (e) {
                        var t = e.style.backgroundColor,
                          n = t === nn || "rgb(250, 255, 189)" === t;
                        (o._lastBackgroundColor = n
                          ? o._lastBackgroundColor
                          : t),
                          (e.style.backgroundColor = nn),
                          (o._autofilled = !0),
                          o._updateClasses();
                      }
                    }),
                    this._frame._on("autofill-cleared", function () {
                      var e = o._getParent();
                      (o._autofilled = !1),
                        e && (e.style.backgroundColor = o._lastBackgroundColor),
                        o._updateClasses();
                    }),
                    this._frame._on("update-outer-style", function (e) {
                      Object.keys(e).forEach(function (t) {
                        o._component.style.setProperty(t, e[t]);
                      });
                    });
                },
              },
              {
                key: "_emitNetworksChangeEvent",
                value: function (e, t) {
                  this._emitEvent("networkschange", {
                    networks: e,
                    loading: t,
                  });
                },
              },
              {
                key: "_handleOutsideClick",
                value: function () {
                  this._secondaryFrame &&
                    this._secondaryFrame.send({
                      action: "stripe-outside-click",
                      payload: {},
                    });
                },
              },
              {
                key: "_updateFrameHeight",
                value: function (e) {
                  var t =
                      arguments.length > 1 &&
                      void 0 !== arguments[1] &&
                      arguments[1],
                    n = e.style;
                  if ("paymentRequestButton" === this._componentName) {
                    var r = (n && n.paymentRequestButton) || {},
                      o = r.height,
                      i = "string" == typeof o ? o : void 0;
                    (t || i) &&
                      (this._frame.updateStyle({
                        height: i || this._lastHeight || Y,
                        minHeight: "auto",
                      }),
                      (this._lastHeight = i || this._lastHeight));
                  } else {
                    var a = (n && n.base) || {},
                      c = a.lineHeight,
                      s = a.fontSize,
                      u = a.padding,
                      l =
                        "string" != typeof c || isNaN(parseFloat(c))
                          ? void 0
                          : c,
                      p = "string" == typeof s ? s : void 0,
                      d = "string" == typeof u ? u : void 0;
                    if (
                      (p &&
                        !on(p) &&
                        this._controller.warn(
                          "The fontSize style you specified (".concat(
                            p,
                            ") is not in px. We do not recommend using relative css units, as they will be calculated relative to our iframe's styles rather than your site's."
                          )
                        ),
                      t || l || p)
                    ) {
                      var m =
                          -1 === k.T2.indexOf(this._componentName)
                            ? void 0
                            : d || this._lastPadding,
                        f = (0, _.Tf)(
                          l || this._lastHeight,
                          p || this._lastFontSize,
                          m
                        );
                      this._frame.updateStyle({ height: f }),
                        (this._lastFontSize = p || this._lastFontSize),
                        (this._lastHeight = l || this._lastHeight),
                        (this._lastPadding = m);
                    }
                  }
                },
              },
              {
                key: "_createElement",
                value: function (e, t, n) {
                  var r = this,
                    o = (e.controller, e.publicOptions, e.componentName),
                    i = e.groupId,
                    a = (0, d.Z)(e, [
                      "controller",
                      "publicOptions",
                      "componentName",
                      "groupId",
                    ]),
                    s =
                      (t.classes,
                      t.paymentRequest,
                      (0, d.Z)(t, ["classes", "paymentRequest"])),
                    u = this._component,
                    l = vt(ht.Kb);
                  (0, _.yq)(u, gt);
                  var p = ft(document.body),
                    m = mt[o],
                    f = (0, c.Z)((0, c.Z)((0, c.Z)({}, a), s), {}, { rtl: p }),
                    y = this._controller.createElementFrame(m, o, i, f);
                  if (
                    (y._on("load", function () {
                      l.disabled = !1;
                    }),
                    this._listenerRegistry.addEventListener(
                      l,
                      "focus",
                      function () {
                        y.focus();
                      }
                    ),
                    y.appendTo(u),
                    O._y[o])
                  ) {
                    var v = O._y[o].secondary,
                      g = this._controller.createSecondaryElementFrame(
                        m,
                        v,
                        o,
                        i,
                        f
                      );
                    g &&
                      g.on &&
                      g.on("height-change", function (e) {
                        g.updateStyle({ height: "".concat(e.height, "px") });
                      }),
                      (this._secondaryFrame = g),
                      g.appendTo(u),
                      this._listenerRegistry.addEventListener(
                        window,
                        "click",
                        function () {
                          return r._handleOutsideClick();
                        }
                      );
                  }
                  if (
                    (u.appendChild(l), h.Ah && o !== k.Yj.paymentRequestButton)
                  ) {
                    var b = (function () {
                      var e = vt(ht.tk);
                      return e.setAttribute("tabindex", "-1"), e;
                    })();
                    u.appendChild(b);
                  }
                  (this._frame = y),
                    (this._fakeInput = l),
                    this._setupEvents(n, e, t),
                    this._updateFrameHeight(t, !0);
                },
              },
            ]),
            e
          );
        })(),
        cn = an,
        sn = {
          amount: m.Rx,
          currency: (0, m.kw)("USD"),
          logoColor: (0, m.jt)((0, m.kw)("primary", "black", "white")),
          fontColor: (0, m.jt)(m.Z_),
          fontSize: (0, m.jt)(m.Z_),
          textAlign: (0, m.jt)(m.Z_),
          stripeMerchantId: (0, m.jt)(m.Z_),
        },
        un = (0, m.mC)(sn),
        ln = function (e) {
          var t = !1;
          window.Promise || ((t = !0), (window.Promise = B.J));
          var n = e();
          return t && window.Promise === B.J && delete window.Promise, n;
        },
        pn = function () {
          return ln(function () {
            return e.e(1).then(e.bind(e, 6167));
          });
        },
        dn = function (t) {
          var n,
            r = t.options,
            o = (0, d.Z)(t, ["options"]),
            i = t.emitEvent,
            a = t.listenerRegistry,
            u = r.controller,
            l = r.componentName,
            p = r.publicOptions,
            f = r.groupId,
            _ = new at.E(),
            h = function (e) {
              var t = (0, m.Gu)(un, e || {}, "create()"),
                n = t.value,
                r = t.warnings;
              if (!Math.floor(n.amount) === n.amount)
                throw new b.No(
                  "'Amount' must be a whole integer number that represents the lowest denomination (cents)."
                );
              return (
                r.forEach(function (e) {
                  return u.warn(e);
                }),
                n
              );
            },
            y = h(p),
            v = function (e, t) {
              return e.apply(void 0, [n].concat((0, s.Z)(t)));
            },
            w = [],
            k = function (e) {
              return function () {
                for (
                  var t = arguments.length, r = new Array(t), o = 0;
                  o < t;
                  o++
                )
                  r[o] = arguments[o];
                n ? v(e, r) : w.push([e, r]);
              };
            },
            E = function () {};
          B.J.all([
            ln(function () {
              return e.e(209).then(e.bind(e, 6393));
            }),
            pn(),
          ]).then(
            function (e) {
              var t = (0, We.Z)(e, 2),
                r = t[0],
                i = t[1],
                s = r.default;
              E = i.unmountModal;
              var p = (0, c.Z)(
                (0, c.Z)({}, o),
                {},
                {
                  options: {
                    groupId: f,
                    controller: u,
                    componentName: l,
                    publicOptions: y,
                  },
                  mountModal: function (e) {
                    return i.mountModal({
                      controller: u,
                      listenerRegistry: a,
                      url: e,
                    });
                  },
                }
              );
              (n = s(p)),
                u.report("affirm_message.loaded", {
                  load_time: _.getElapsedTime(),
                  currency: y.currency,
                }),
                (function () {
                  for (; w.length; ) {
                    var e = w.shift(),
                      t = (0, We.Z)(e, 2),
                      n = t[0],
                      r = t[1];
                    v(n, r);
                  }
                })();
            },
            function (e) {
              u.report("affirm_message.import_error", { error: e });
            }
          );
          var S = function (e) {
            return function () {
              throw new b.No(e);
            };
          };
          return {
            mount: k(function (e) {
              e.mount(y), i("mounted");
            }),
            unmount: k(function (e) {
              E(), e.unmount();
            }),
            update: k(function (e, t) {
              var n = (0, g.TS)(y, t);
              (y = h(n)), e.update(y);
            }),
            focus: S("Focus is not supported by affirmMessage."),
            blur: S("Blur is not supported by affirmMessage."),
            clear: S("Clear is not supported by affirmMessage."),
          };
        },
        mn = {
          amount: m.Rx,
          currency: (0, m.kw)("USD", "AUD", "CAD", "GBP", "NZD", "EUR"),
          badgeTheme: (0, m.jt)(
            (0, m.kw)(
              "black-on-mint",
              "black-on-white",
              "mint-on-black",
              "white-on-black"
            )
          ),
          introText: (0, m.jt)(
            (0, m.kw)("In", "in", "Or", "or", "Pay", "pay", "Pay in", "pay in")
          ),
          isEligible: (0, m.jt)(m.Xg),
          isCartEligible: (0, m.jt)(m.Xg),
          lockupTheme: (0, m.jt)((0, m.kw)("black", "white", "mint")),
          logoType: (0, m.jt)((0, m.kw)("badge", "lockup")),
          max: (0, m.jt)(m.Rx),
          min: (0, m.jt)(m.Rx),
          modalLinkStyle: (0, m.jt)(
            (0, m.kw)("circled-info-icon", "more-info-text", "learn-more-text")
          ),
          modalTheme: (0, m.jt)((0, m.kw)("mint", "white")),
          showInterestFree: (0, m.jt)(m.Xg),
          showLowerLimit: (0, m.jt)(m.Xg),
          showUpperLimit: (0, m.jt)(m.Xg),
          showWith: (0, m.jt)(m.Xg),
        },
        fn = (0, m.mC)(mn),
        _n = function () {
          return ln(function () {
            return e.e(259).then(e.bind(e, 8293));
          });
        },
        hn = function (t) {
          var n,
            r = t.emitEvent,
            o = t.options,
            i = o.controller,
            a = o.locale,
            c = o.publicOptions,
            u = new at.E(),
            l = function (e) {
              var t = (0, m.Gu)(fn, e || {}, "create()"),
                n = t.value;
              return (
                t.warnings.forEach(function (e) {
                  return i.warn(e);
                }),
                n
              );
            },
            p = l(c),
            d = function (e, t) {
              return e.apply(void 0, [n].concat((0, s.Z)(t)));
            },
            f = [],
            _ = function (e) {
              return function () {
                for (
                  var t = arguments.length, r = new Array(t), o = 0;
                  o < t;
                  o++
                )
                  r[o] = arguments[o];
                n ? d(e, r) : f.push([e, r]);
              };
            },
            h = function () {};
          B.J.all([
            ln(function () {
              return e.e(578).then(e.bind(e, 8434));
            }),
            _n(),
          ]).then(
            function (e) {
              var o = (0, We.Z)(e, 2),
                c = o[0],
                s = o[1],
                l = c.default;
              h = s.unmountModal;
              var m = t.component,
                _ = t.listenerRegistry;
              (n = l({
                component: m,
                mountModal: function (e, t) {
                  return s.mountModal({
                    controller: i,
                    listenerRegistry: _,
                    locale: e,
                    modalTheme: t,
                  });
                },
                locale: a,
                listenerRegistry: _,
              })),
                i.report("afterpay_message.loaded", {
                  load_time: u.getElapsedTime(),
                  locale: a,
                  currency: p.currency,
                }),
                (function () {
                  for (; f.length; ) {
                    var e = f.shift(),
                      t = (0, We.Z)(e, 2),
                      n = t[0],
                      r = t[1];
                    d(n, r);
                  }
                })(),
                r("ready");
            },
            function (e) {
              i.report("afterpay_message.import_error", { error: e });
            }
          );
          var y = function (e) {
            return function () {
              throw new b.No(e);
            };
          };
          return {
            mount: _(function (e) {
              e.mount(p);
            }),
            unmount: _(function (e) {
              h(), e.unmount();
            }),
            update: _(function (e, t) {
              var n = (0, g.TS)(p, t);
              (p = l(n)), e.update(p);
            }),
            focus: y("Focus is not supported by afterpayClearpayMessage."),
            blur: y("Blur is not supported by afterpayClearpayMessage."),
            clear: y("Clear is not supported by afterpayClearpayMessage."),
          };
        },
        yn = {
          amount: m.MZ,
          currency: (0, m.kw)(
            "USD",
            "GBP",
            "EUR",
            "DKK",
            "NOK",
            "SEK",
            "AUD",
            "CAD",
            "NZD"
          ),
          paymentMethods: (0, m.CT)((0, m.kw)("klarna", "afterpay_clearpay")),
          countryCode: (0, m.kw)(
            "US",
            "CA",
            "AU",
            "NZ",
            "GB",
            "IE",
            "FR",
            "ES",
            "DE",
            "AT",
            "BE",
            "DK",
            "FI",
            "IT",
            "NL",
            "NO",
            "SE"
          ),
          logoColor: (0, m.jt)((0, m.kw)("black", "white", "color")),
          metaData: (0, m.jt)(
            (0, m.mC)({ messagingClientReferenceId: (0, m.AG)(m.Z_) })
          ),
        },
        vn = (0, m.mC)(yn),
        gn = function (t) {
          var n,
            r = t.emitEvent,
            o = t.options,
            i = o.controller,
            a = o.locale,
            u = o.publicOptions,
            l = a ? (0, Ve.jR)(a) : "en",
            p = new at.E(),
            d = function (e) {
              var t = (0, m.Gu)(vn, e || {}, "create()"),
                n = t.value;
              return (
                t.warnings.forEach(function (e) {
                  return i.warn(e);
                }),
                n
              );
            },
            f = d(u),
            _ = function (e, t) {
              return e.apply(void 0, [n].concat((0, s.Z)(t)));
            },
            h = [],
            y = function (e) {
              return function () {
                for (
                  var t = arguments.length, r = new Array(t), o = 0;
                  o < t;
                  o++
                )
                  r[o] = arguments[o];
                n ? _(e, r) : h.push([e, r]);
              };
            },
            v = function () {};
          B.J.all([
            ln(function () {
              return e.e(429).then(e.bind(e, 6757));
            }),
            ln(function () {
              return e.e(557).then(e.bind(e, 7219));
            }),
          ]).then(
            function (e) {
              var o,
                a,
                s = (0, We.Z)(e, 2),
                u = s[0],
                d = s[1],
                m = u.default;
              v = d.unmountModal;
              var y = t.component,
                g = t.listenerRegistry;
              (n = m({
                component: y,
                mountModal: function (e) {
                  return d.mountModal({
                    controller: i,
                    listenerRegistry: g,
                    locale: e,
                    publicOptions: f,
                  });
                },
                locale: l,
                listenerRegistry: g,
              })),
                i.report(
                  "unified_message.loaded",
                  (0, c.Z)(
                    {
                      load_time: p.getElapsedTime(),
                      locale: l,
                      amount: f.amount,
                      currency: f.currency,
                      paymentMethods: f.paymentMethods,
                      countryCode: f.countryCode,
                    },
                    (null === (o = f.metaData) || void 0 === o
                      ? void 0
                      : o.messagingClientReferenceId) && {
                      messagingClientReferenceId:
                        null === (a = f.metaData) || void 0 === a
                          ? void 0
                          : a.messagingClientReferenceId,
                    }
                  )
                ),
                (function () {
                  for (; h.length; ) {
                    var e = h.shift(),
                      t = (0, We.Z)(e, 2),
                      n = t[0],
                      r = t[1];
                    _(n, r);
                  }
                })(),
                r("ready");
            },
            function (e) {
              i.report("unified_message.import_error", { error: e });
            }
          );
          var w = function (e) {
            return function () {
              throw new b.No(e);
            };
          };
          return {
            mount: y(function (e) {
              e.mount(f);
            }),
            unmount: y(function (e) {
              v(), e.unmount();
            }),
            update: y(function (e, t) {
              var n = (0, g.TS)(f, t);
              (f = d(n)), e.update(f);
            }),
            focus: w("Focus is not supported by paymentMethodMessaging."),
            blur: w("Blur is not supported by paymentMethodMessaging."),
            clear: w("Clear is not supported by paymentMethodMessaging."),
          };
        },
        bn = e(8666),
        wn = e(6856),
        kn = e(7955),
        En = e(2375),
        Sn = {
          locale: (0, m.yv)("elements()"),
          fonts: (0, m.yv)("elements()"),
          defaultValues: (0, m.jt)((0, m.mC)({ email: m.Z_ })),
        },
        Pn = (0, m.mC)(Sn),
        An = {
          locale: (0, m.yv)("elements()"),
          fonts: (0, m.yv)("elements()"),
          business: (0, m.jt)((0, m.mC)({ name: m.Z_ })),
          paymentMethodOrder: (0, m.jt)((0, m.CT)(m.Z_)),
          fields: (0, m.jt)(wn.mZ),
          readOnly: (0, m.jt)(m.Xg),
          terms: (0, m.jt)(wn.FC),
          wallets: (0, m.jt)(wn.xR),
          defaultValues: (0, m.jt)(wn.I2),
        },
        Cn = Object.freeze({
          line1: (0, m.jt)((0, m.AG)(m.Z_)),
          line2: (0, m.jt)((0, m.AG)(m.Z_)),
          city: (0, m.jt)((0, m.AG)(m.Z_)),
          state: (0, m.jt)((0, m.AG)(m.Z_)),
          country: (0, m.jt)((0, m.AG)(m.Z_)),
          postal_code: (0, m.jt)((0, m.AG)(m.Z_)),
        }),
        Nn = Object.freeze({
          name: (0, m.jt)((0, m.AG)(m.Z_)),
          firstName: (0, m.jt)((0, m.AG)(m.Z_)),
          lastName: (0, m.jt)((0, m.AG)(m.Z_)),
          address: (0, m.jt)((0, m.mC)(Cn)),
          phone: (0, m.jt)((0, m.AG)(m.Z_)),
        }),
        In = Object.freeze({
          name: m.Z_,
          address: (0, m.mC)(Cn),
          phone: (0, m.jt)((0, m.AG)(m.Z_)),
        }),
        Tn = {
          locale: (0, m.yv)("elements()"),
          fonts: (0, m.yv)("elements()"),
          mode: (0, m.or)((0, m.p3)("shipping"), (0, m.p3)("billing")),
          allowedCountries: (0, m.jt)((0, m.CT)(m.Z_)),
          autocomplete: (0, m.jt)(En.tX),
          blockPoBox: (0, m.jt)(m.Xg),
          defaultValues: (0, m.jt)((0, m.mC)(Nn)),
          contacts: (0, m.jt)((0, m.CT)((0, m.mC)(In))),
          fields: (0, m.jt)(En.mZ),
          validation: (0, m.jt)(En.qF),
          display: (0, m.jt)(En.ef),
        },
        Mn = (0, m.mC)(Object.freeze(Tn)),
        jn = (0, m.mC)(
          Object.freeze(
            (0, c.Z)(
              (0, c.Z)({}, Tn),
              {},
              { mode: (0, m.NM)("Mode cannot be updated.") }
            )
          )
        ),
        On = (0, m.mC)(
          Object.freeze(
            (0, c.Z)(
              (0, c.Z)({}, Tn),
              {},
              {
                mode: (0, m.NM)(
                  "The 'shippingAddress' Element does not support the 'mode' option, use 'address' Element instead."
                ),
                contacts: (0, m.NM)(
                  "The 'shippingAddress' Element does not support the 'contacts' option, use 'address' Element instead."
                ),
                display: (0, m.NM)(
                  "The 'shippingAddress' Element does not support the 'display' option, use 'address' Element instead."
                ),
                autocomplete: (0, m.jt)(
                  (0, m.mC)({ mode: (0, m.kw)("automatic", "disabled") })
                ),
              }
            )
          )
        ),
        Rn = function (e, t, n, r, o) {
          switch (e) {
            case "linkAuthentication":
              var i = (0, m.Gu)(Pn, t, n),
                a = i.value;
              a.locale, a.fonts;
              return {
                value: (0, d.Z)(a, ["locale", "fonts"]),
                warnings: i.warnings,
              };
            case "payment":
              var u = (0, m.Gu)(
                  (function (e, t) {
                    var n = (0, c.Z)({}, An);
                    return (
                      (0, v.uN)(t, v.M4.payment_element_beta_1) &&
                        ((n = (0, c.Z)(
                          (0, c.Z)({}, n),
                          {},
                          { appearance: (0, m.jt)(m.Ry), clientSecret: bn.Hv }
                        )),
                        e &&
                          (n = (0, c.Z)(
                            (0, c.Z)({}, n),
                            {},
                            { clientSecret: (0, m.jt)(bn.Hv) }
                          ))),
                      (0, v.uN)(t, v.M4.blocked_card_brands_beta_1) &&
                        !e &&
                        ((n.allowedCardBrands = (0, m.jt)(wn.jX)),
                        (n.disallowedCardBrands = (0, m.jt)(wn.jX))),
                      (0, v.uN)(
                        t,
                        v.M4.payment_element_vertical_layout_beta_1
                      ) && (n.layout = (0, m.jt)(wn.zf)),
                      (0, m.mC)(n)
                    );
                  })(r, o),
                  t,
                  n
                ),
                l = u.value,
                p = (l.locale, l.fonts, l.clientSecret),
                f = void 0 === p ? void 0 : p,
                _ = (0, d.Z)(l, ["locale", "fonts", "clientSecret"]),
                h = u.warnings;
              (0, v.uN)(o, v.M4.blocked_card_brands_beta_1) && (0, kn.VZ)(t);
              var y = [];
              return (
                (0, v.uN)(o, v.M4.payment_element_vertical_layout_beta_1) &&
                  (y = (0, kn._m)(t, r, n)),
                {
                  value: (0, c.Z)({ parsedIntentSecret: f }, _),
                  warnings: [].concat((0, s.Z)(h), (0, s.Z)(y)),
                }
              );
            case "shippingAddress":
              var g = (0, m.Gu)(On, t, n),
                b = g.value,
                w = (b.locale, b.fonts, (0, d.Z)(b, ["locale", "fonts"])),
                k = g.warnings;
              return (
                k.push(
                  "Shipping Address Element is now Address Element.\n          It is advised to switch to the Address Element. For more information,\n          see https://stripe.com/docs/elements/address-element.\n        "
                ),
                (0, kn.S6)(t),
                { value: w, warnings: k }
              );
            case "address":
              if (-1 !== n.indexOf("update")) {
                var E = (0, m.Gu)(jn, t, n),
                  S = E.value;
                S.locale, S.fonts;
                return {
                  value: (0, d.Z)(S, ["locale", "fonts"]),
                  warnings: E.warnings,
                };
              }
              var P = (0, m.Gu)(Mn, t, n),
                A = P.value,
                C = (A.locale, A.fonts, (0, d.Z)(A, ["locale", "fonts"])),
                N = P.warnings;
              return (
                (0, kn.C1)(t),
                (0, kn.S6)(t),
                (0, kn.YR)(t),
                { value: C, warnings: N }
              );
            case "autocompleteSuggestions":
            case "achBankSearchResults":
              return { value: Object.freeze({}), warnings: [] };
            default:
              return (0, m.Rz)(e);
          }
        },
        Zn = function (e, t) {
          switch (e) {
            case "linkAuthentication":
            case "payment":
            case "shippingAddress":
            case "address":
              return (0, c.Z)(
                { height: "2px", margin: "-4px", width: "calc(100% + 8px)" },
                t
                  ? { opacity: "0", transition: "opacity 0.4s ease 0.1s" }
                  : null
              );
            case "autocompleteSuggestions":
            case "achBankSearchResults":
              return {
                height: "2px",
                margin: "-4px",
                width: "calc(100% + 8px)",
              };
            default:
              return (0, m.Rz)(e);
          }
        },
        xn = function (e) {
          var t = e.wallet,
            n = e.options;
          if (n.controller.keyMode() === Oe.Kl.unknown) return !1;
          var r =
              !n.publicOptions.hasOwnProperty("wallets") ||
              "never" !== n.publicOptions.wallets[t],
            o =
              (0, v.uN)(n.betas, "payment_element_beta_1") &&
              !(0, v.uN)(n.betas, "payment_element_apple_pay_beta_1");
          return r && !o;
        },
        Ln = function (e) {
          return (
            -1 !==
            [
              "linkAuthentication",
              "payment",
              "shippingAddress",
              "address",
            ].indexOf(e)
          );
        },
        Dn = function (e) {
          var t = e.elementFrame,
            n = e.component,
            r = e.componentName,
            o = e.listenerRegistry,
            i = e.loaderEnabled,
            a = e.elementOptions,
            s = function (e) {
              if (!e) return null;
              var t = (function (e) {
                  var t = [],
                    n = (function e(n) {
                      var r = document.createElement("div");
                      return (
                        (0, _.yq)(r, n.style),
                        n.isShimmerNode && t.push(r),
                        Array.isArray(n.children) &&
                          n.children.forEach(function (t) {
                            return r.appendChild(e(t));
                          }),
                        r
                      );
                    })(e);
                  return (
                    (n.className = "__PrivateStripeElementLoader"),
                    { loaderComponent: n, shimmerNodes: t }
                  );
                })(e),
                n = t.loaderComponent,
                r = t.shimmerNodes;
              return (0, c.Z)(
                { loaderComponent: n },
                (function (e) {
                  var t,
                    n,
                    r = 3e3,
                    o = function () {
                      clearTimeout(t), clearTimeout(n);
                    };
                  return {
                    startAnimation: function () {
                      o();
                      var i = function (t) {
                        (0, _.Ql)(function () {
                          e.forEach(function (e) {
                            (e.style.transition =
                              "start" === t
                                ? "transform ".concat(r, "ms ease")
                                : ""),
                              (e.style.transform =
                                "start" === t
                                  ? "translateX(200%)"
                                  : "translateX(-100%)");
                          });
                        });
                      };
                      !(function e() {
                        i("start"),
                          (n = setTimeout(function () {
                            return i("stop");
                          }, r)),
                          (t = setTimeout(e, 3500));
                      })();
                    },
                    stopAnimation: o,
                  };
                })(r)
              );
            },
            u = new B.J(function (e) {
              var t = tt;
              t && i
                ? (t._emit("get-element-loader-ui", {
                    componentName: r,
                    elementOptions: a,
                  }),
                  t._on("element-loader-ui-callback", function (t) {
                    var n = t.message,
                      o = n.componentName,
                      i = n.loaderUiNodes;
                    r === o && e(s(i));
                  }))
                : e(null);
            }),
            l = function (e) {
              return function () {
                u.then(function (t) {
                  e(t);
                });
              };
            },
            p = function (e) {
              e.height && (n.style.height = e.height);
            };
          return {
            show: l(function (e) {
              if (e) {
                var r = e.loaderComponent,
                  o = e.startAnimation;
                (r.style.opacity = "1"),
                  t.updateStyle({ opacity: "0" }),
                  (n.style.height = r.style.height),
                  n.appendChild(r),
                  o(),
                  t._on("set_styles", p),
                  t._emit("loaderstart");
              }
            }),
            hide: l(function (e) {
              if (e) {
                var r = e.loaderComponent,
                  i = e.stopAnimation,
                  a = (0, q.$M)(function () {
                    t._off("set_styles", p),
                      (n.style.height = ""),
                      i(),
                      n.contains(r) && n.removeChild(r);
                  });
                o.addEventListener(r, "transitionend", a),
                  setTimeout(a, 600),
                  (r.style.opacity = "0");
              }
              t.updateStyle({ opacity: "1" });
            }),
            unmount: l(function (e) {
              if (e) {
                var r = e.loaderComponent,
                  o = e.stopAnimation;
                (r.style.opacity = "0"),
                  t.updateStyle({ opacity: "1" }),
                  t._off("set_styles", p),
                  (n.style.height = ""),
                  o(),
                  n.contains(r) && n.removeChild(r);
              } else t.updateStyle({ opacity: "1" });
            }),
          };
        },
        Bn = function (e, t) {
          var n = e.id,
            r = e.filters,
            o = e.permissions,
            i = e.return_url,
            a = { id: n, accounts: t, status: e.status };
          return (
            r && (a.filters = r),
            o && (a.permissions = o),
            i && (a.return_url = i),
            a
          );
        },
        qn = "close",
        Fn = "complete",
        Un =
          ((0, m.or)((0, m.xe)("bcsess_"), (0, m.xe)("bcrepsess_")),
          function (e, t) {
            return new B.J(function (n) {
              var r;
              try {
                r = t.createLightboxFrame({
                  type: Be.NC.LINKED_ACCOUNTS_INNER,
                  options: e,
                });
              } catch (e) {
                return n({ error: { message: e.message } });
              }
              return (
                r.show(),
                r.fadeInBackdrop(),
                r._on(qn, function () {
                  r.fadeOutBackdrop();
                  t.action
                    .localizeError({
                      type: "input_validation_error",
                      code: "financial_connections_session_cancelled",
                    })
                    .then(function (e) {
                      n({ error: e });
                    });
                }),
                r._on(Fn, function (e) {
                  r.destroy(!0)
                    .then(function () {
                      return (function (e, t) {
                        switch (e.linkAccountSessionCompleteResponse.type) {
                          case "object":
                            var n = e.linkedAccounts,
                              r = e.linkAccountSessionCompleteResponse,
                              o = e.consumer,
                              i = r.object,
                              a = i.id,
                              s = i.filters,
                              u = i.permissions,
                              l = i.payment_account,
                              p = i.bank_account_token,
                              d = i.return_url,
                              f = { id: a, linkedAccounts: n };
                            return (
                              p && (f.bankAccountToken = p),
                              l && !p && (f.paymentAccount = l),
                              s && (f.filters = s),
                              u && (f.permissions = u),
                              d && (f.returnUrl = d),
                              B.J.resolve({
                                linkAccountSession: f,
                                consumer: o,
                              })
                            );
                          case "error":
                            var _,
                              h = e.linkAccountSessionCompleteResponse.error;
                            return (
                              h.financial_connections_session &&
                                (_ = Bn(
                                  e.linkAccountSessionCompleteResponse.error
                                    .financial_connections_session,
                                  []
                                )),
                              t.action.localizeError(h).then(function (e) {
                                return {
                                  error: (0, c.Z)(
                                    (0, c.Z)({}, e),
                                    {},
                                    { financial_connections_session: _ }
                                  ),
                                };
                              })
                            );
                          default:
                            return (0,
                            m.Rz)(e.linkAccountSessionCompleteResponse);
                        }
                      })(e, t);
                    })
                    .then(function (e) {
                      n(e);
                    });
                }),
                null
              );
            });
          }),
        Gn = function (e, t) {
          return new B.J(function (n) {
            var r;
            try {
              r = t.createLightboxFrame({
                type: Be.NC.LINKED_ACCOUNTS_INNER,
                options: e,
              });
            } catch (e) {
              return n({ error: { message: e.message } });
            }
            return (
              r.show(),
              r.fadeInBackdrop(),
              r._on(qn, function () {
                r.fadeOutBackdrop();
              }),
              r._on(Fn, function (e) {
                r.destroy(!0)
                  .then(function () {
                    return (function (e, t) {
                      switch (e.linkAccountSessionCompleteResponse.type) {
                        case "object":
                          var n = e.linkedAccounts,
                            r = e.linkAccountSessionCompleteResponse,
                            o = e.consumer,
                            i = Bn(r.object, n);
                          return B.J.resolve({
                            financialConnectionsSession: i,
                            consumer: o,
                          });
                        case "error":
                          var a,
                            s = e.linkAccountSessionCompleteResponse.error;
                          return (
                            s.financial_connections_session &&
                              (a = Bn(
                                e.linkAccountSessionCompleteResponse.error
                                  .financial_connections_session,
                                []
                              )),
                            t.action.localizeError(s).then(function (e) {
                              return {
                                error: (0, c.Z)(
                                  (0, c.Z)({}, e),
                                  {},
                                  { financial_connections_session: a }
                                ),
                              };
                            })
                          );
                        default:
                          return (0,
                          m.Rz)(e.linkAccountSessionCompleteResponse);
                      }
                    })(e, t);
                  })
                  .then(function (e) {
                    n(e);
                  });
              }),
              null
            );
          });
        },
        Yn = function (e) {
          var t = e.linkAccountSessionCreatorClientSecret,
            n = e.linkAccountSessionCreatorType,
            r = e.linkAccountSessionCreatorId,
            o = e.controller,
            i = e.consumerSessionSecret,
            a = e.linkAccountSessionCreationParams,
            c = e.consumerPublishableKey,
            s = e.checkoutPriceAmount,
            u = e.email,
            l = e.linkMobilePhone,
            p = e.linkMobilePhoneCountry,
            d = e.useContinueButtonOnSuccess,
            m = e.instantDebitsIncentive;
          (0, _.xc)(o.warn);
          var f = o._stripeAccount,
            h = o._apiVersion,
            y = o._apiKey;
          return (
            "link_payment_intent" === n &&
              c &&
              ((y = c), (f = null), (h = null)),
            Un(
              {
                clientSecret: t,
                linkAccountSessionCreatorType: n,
                linkAccountSessionCreatorId: r,
                linkAccountSessionCreationParams: a,
                apiKey: y,
                consumerPublishableKey: c,
                consumerSessionSecret: i,
                stripeAccount: f,
                stripeVersion: h,
                checkoutPriceAmount: s,
                email: u,
                linkMobilePhone: l,
                linkMobilePhoneCountry: p,
                useContinueButtonOnSuccess: d,
                instantDebitsIncentive: m,
              },
              o
            )
          );
        },
        zn = function (e, t) {
          return (function (e) {
            var t = e.linkAccountSessionCreatorClientSecret,
              n = e.linkAccountSessionCreatorType,
              r = e.linkAccountSessionCreatorId,
              o = e.controller,
              i = e.consumerSessionSecret,
              a = e.linkAccountSessionCreationParams,
              c = e.consumerPublishableKey,
              s = e.checkoutPriceAmount,
              u = e.email,
              l = e.linkMobilePhone,
              p = e.linkMobilePhoneCountry;
            (0, _.xc)(o.warn);
            var d = o._stripeAccount,
              m = o._apiVersion,
              f = o._apiKey;
            return (
              "link_payment_intent" === n &&
                c &&
                ((f = c), (d = null), (m = null)),
              Gn(
                {
                  clientSecret: t,
                  linkAccountSessionCreatorType: n,
                  linkAccountSessionCreatorId: r,
                  linkAccountSessionCreationParams: a,
                  apiKey: f,
                  consumerPublishableKey: c,
                  consumerSessionSecret: i,
                  stripeAccount: d,
                  stripeVersion: m,
                  checkoutPriceAmount: s,
                  email: u,
                  linkMobilePhone: l,
                  linkMobilePhoneCountry: p,
                  useContinueButtonOnSuccess: !1,
                },
                o
              )
            );
          })({
            linkAccountSessionCreatorClientSecret: t.clientSecret,
            linkAccountSessionCreatorType: "link_account_session",
            controller: e,
            consumerPublishableKey: null,
            checkoutPriceAmount: { amount: null, currency: null },
            email: null,
            linkMobilePhone: null,
            linkMobilePhoneCountry: null,
            useContinueButtonOnSuccess: !1,
          }).then(function (e) {
            return "error" in e
              ? e
              : { financialConnectionsSession: e.financialConnectionsSession };
          });
        },
        Hn = function (e, t, n, r) {
          return Yn({
            linkAccountSessionCreatorClientSecret: e,
            linkAccountSessionCreatorType: "payment_intent",
            linkAccountSessionCreatorId: t,
            controller: n,
            linkAccountSessionCreationParams: { payment_method_data: r },
            consumerPublishableKey: null,
            checkoutPriceAmount: { amount: null, currency: null },
            email: null,
            linkMobilePhone: null,
            linkMobilePhoneCountry: null,
            useContinueButtonOnSuccess: !1,
          });
        },
        Kn = function (e, t, n, r) {
          return Yn({
            linkAccountSessionCreatorClientSecret: e,
            linkAccountSessionCreatorType: "setup_intent",
            linkAccountSessionCreatorId: t,
            controller: n,
            linkAccountSessionCreationParams: { payment_method_data: r },
            consumerPublishableKey: null,
            checkoutPriceAmount: { amount: null, currency: null },
            email: null,
            linkMobilePhone: null,
            linkMobilePhoneCountry: null,
            useContinueButtonOnSuccess: !1,
          });
        },
        Jn = {
          country: "US",
          currency: "usd",
          total: { amount: 0, label: "" },
          requestPayerName: !0,
          requestPayerEmail: !1,
          requestPayerPhone: !1,
        },
        Wn = function (e, t, n, r) {
          var o = "applePay" === r ? "googlePay" : "applePay",
            i = new ut({
              controller: e.controller,
              authentication: {
                apiKey: e.controller._apiKey,
                accountId: e.controller._stripeAccount || null,
              },
              mids: e.mids,
              rawOptions: (0, c.Z)(
                (0, c.Z)({}, Jn),
                {},
                { disableWallets: ["browserCard", o] }
              ),
              betas: e.betas,
              queryStrategyOverride: null,
              listenerRegistry: t,
            });
          i._on("token", function (t) {
            e.controller.action
              .completeWalletConfirm({ type: "token", token: t.token.id })
              .then(function () {
                t.complete("success");
              })
              .catch(function () {
                t.complete("unexpected failure");
              });
          }),
            i._on("cancel", function () {
              e.controller.action.completeWalletConfirm({ type: "cancelled" });
            });
          var a = i.canMakePayment().then(function (e) {
            e &&
              e[r] &&
              (n.send({ action: "should-list-wallet", payload: { wallet: r } }),
              n._on("show-wallet", function (e) {
                (0, q.i3)(e) === r && i.show();
              }));
          });
          return { pr: i, canMakePaymentPromise: a };
        },
        Vn = e(3849),
        Xn = { PAYMENT_INTENT: "payment_intent", SETUP_INTENT: "setup_intent" },
        Qn = function (e, t, n, r, o, i, a) {
          (function (e) {
            var t = e.linkAccountSessionCreatorClientSecret,
              n = e.linkAccountSessionCreatorType,
              r = e.createdBy,
              o = e.controller,
              i = e.attachRequired,
              a = e.institution,
              c = e.data,
              s = e.email,
              u = e.linkMobilePhone,
              l = e.linkMobilePhoneCountry,
              p = e.manualEntryOnly,
              d = e.searchSession,
              m = e.consumerSessionSecret,
              f = e.consumerPublishableKey;
            return Yn({
              linkAccountSessionCreatorClientSecret: t,
              linkAccountSessionCreatorType: n,
              linkAccountSessionCreatorId: r,
              controller: o,
              linkAccountSessionCreationParams: {
                attach_required: i,
                initial_institution: a,
                payment_method_data: c,
                manual_entry_only: p,
                search_session: d,
              },
              consumerSessionSecret: m,
              consumerPublishableKey: f,
              checkoutPriceAmount: { amount: null, currency: null },
              email: null != s ? s : null,
              linkMobilePhone: null != u ? u : null,
              linkMobilePhoneCountry: null != l ? l : null,
              useContinueButtonOnSuccess: !0,
            });
          })({
            linkAccountSessionCreatorClientSecret: r.clientSecret,
            linkAccountSessionCreatorType: Xn[r.type],
            createdBy: r.id,
            controller: e.controller,
            attachRequired: !1,
            institution: t,
            data: { type: "us_bank_account" },
            searchSession: o,
            manualEntryOnly: n,
            consumerSessionSecret: i,
            consumerPublishableKey: a,
          }).then(function (t) {
            if ("error" in t)
              "financial_connections_session_cancelled" === t.error.code
                ? e.controller.action.completeLinkAccountSessionElements({
                    groupId: e.groupId,
                    error: Vn.zb,
                  })
                : e.controller.action.completeLinkAccountSessionElements({
                    groupId: e.groupId,
                    error: Vn.TH,
                  });
            else if (t.linkAccountSession.paymentAccount) {
              var n = t.linkAccountSession.paymentAccount;
              switch (n.object) {
                case "financial_connections.account":
                case "linked_account":
                  var r = n;
                  e.controller.action.completeLinkAccountSessionElements({
                    groupId: e.groupId,
                    bankAccount: {
                      sessionId: t.linkAccountSession.id,
                      displayName: r.display_name,
                      bankName: r.institution_name,
                      last4: r.last4 || "",
                      type: "instant",
                    },
                  });
                  break;
                case "financial_connections.bank_account":
                case void 0:
                  var o = n;
                  e.controller.action.completeLinkAccountSessionElements({
                    groupId: e.groupId,
                    bankAccount: {
                      sessionId: t.linkAccountSession.id,
                      displayName: "Bank account",
                      bankName: o.bank_name,
                      last4: o.last4,
                      type: "manual",
                    },
                  });
                  break;
                default:
                  (0, m.Rz)(n);
              }
            } else
              e.controller.action.completeLinkAccountSessionElements({
                groupId: e.groupId,
                error: Vn.zb,
              });
          });
        },
        $n = function (e) {
          var t = e.options,
            n = e.institutionId,
            r = e.manualEntryOnly,
            o = e.parsedClientSecret,
            i = e.searchSession,
            a = e.consumerClientSecret,
            c = e.consumerPublishableKey;
          Qn(t, n, r, o, i, a, c);
        },
        er = function (e, t, n) {
          var r = e.createHiddenFrame(Be.NC.GOOGLE_MAPS_APP, {
            apiKey: "AIzaSyCab6eIMNih34mQb3XI_QWXagmF2_rvQAg",
            elementMode: n,
          });
          return (
            r._on("get-google-maps-predictions", function (e) {
              !(function (e, t) {
                r.send({
                  action: "get-google-maps-predictions",
                  payload: { data: { search: e, countryRestrictions: t } },
                });
              })(e.search, e.countryRestrictions);
            }),
            r._on("get-google-maps-details", function (e) {
              !(function (e) {
                r.send({
                  action: "get-google-maps-details",
                  payload: { data: { placeId: e } },
                });
              })(e.placeId);
            }),
            r._on("google-maps-callback", function (e) {
              var n = e.event,
                r = e.message;
              switch (n) {
                case "gotPredictions":
                  !(function (e) {
                    t.send({
                      action: "google-maps-predictions",
                      payload: { data: e },
                    });
                  })(r);
                  break;
                case "gotDetails":
                  !(function (e) {
                    t.send({
                      action: "google-maps-details",
                      payload: { data: e },
                    });
                  })(r);
              }
            }),
            r
          );
        },
        tr = function (e) {
          e.parsedIntentSecret, e.appearance;
          return (0, d.Z)(e, ["parsedIntentSecret", "appearance"]);
        },
        nr = function (e) {
          var t = e.controller,
            n = e.componentName,
            r = e.groupId,
            o = e.fonts,
            i = e.wait,
            a = e.publicOptions,
            c = e.controllingElement,
            s = e.controllingMode,
            u = e.mountedInternal,
            l = e.externalPaymentMethodTypes,
            p = {
              fonts: o,
              wait: i,
              rtl: ft(document.body),
              publicOptions: tr(a),
              controllingElement: c,
              controllingMode: s,
              mountedInternal: u,
              externalPaymentMethodTypes: l,
            },
            d = ht.P0[n];
          return t.createElementFrame(d, n, r, p);
        },
        rr = function (e) {
          var t = e.props,
            n = e.componentName,
            r = e.controllingElement,
            o = e.controllingMode,
            i = e.ariaHidden,
            a = t.component,
            s = t.elementTimings,
            u = t.getParent,
            l = t.options,
            p = nr(
              (0, c.Z)(
                (0, c.Z)({}, l),
                {},
                { componentName: n, controllingElement: r, controllingMode: o }
              )
            );
          p.appendTo(a),
            p.updateStyle(
              (0, c.Z)(
                (0, c.Z)({}, Zn(n, !1)),
                {},
                { position: "absolute", zIndex: "1" }
              )
            ),
            p._iframe.setAttribute("aria-hidden", i),
            p._on("load", function () {
              p.send({
                action: "stripe-user-mount",
                payload: {
                  timestamps: {
                    stripeJsLoad: s.stripeJsLoadTimestamp.getAsPosixTime(),
                    stripeCreate: s.stripeCreateTimestamp.getAsPosixTime(),
                    groupCreate: s.groupCreateTimestamp.getAsPosixTime(),
                    create: s.createTimestamp.getAsPosixTime(),
                    mount: new at.E().getAsPosixTime(),
                  },
                  rtl: ft(u()),
                },
              });
            }),
            p._on("set_styles", function (e) {
              p.updateStyle(e);
            }),
            "achBankSearchResults" === n &&
              p._on("us-bank-account-v2-launch", function (e) {
                return $n((0, c.Z)({ options: l }, e));
              });
        },
        or = function (e) {
          var t = e.controller,
            n = e.locale,
            r = e.isDarkMode,
            o = e.businessName,
            i = e.financialIncentive,
            a = t.createLightboxFrame({
              type: Be.NC.LINK_INFO_MODAL,
              options: {
                locale: n,
                isDarkMode: r,
                businessName: o,
                financialIncentive: i,
              },
            });
          a.show(), a.fadeInBackdrop();
          a._on("close", function () {
            a.fadeOutBackdrop(), a.destroy(!0);
          });
        },
        ir = function (e) {
          if ("object" == typeof e && e && e.hasOwnProperty("layout")) {
            var t = e.layout;
            if ("string" == typeof t) {
              if (-1 !== ["auto", "accordion", "tabs"].indexOf(t))
                return {
                  type: t,
                  defaultCollapsed: !1,
                  spacedAccordionItems: !1,
                };
            } else {
              var n = t.type,
                r = t.defaultCollapsed;
              if ("accordion" === n)
                return {
                  type: n,
                  defaultCollapsed: r,
                  spacedAccordionItems: t.spacedAccordionItems,
                };
              if (-1 !== ["auto", "tabs"].indexOf(n))
                return { type: n, defaultCollapsed: r };
            }
          }
          return {};
        },
        ar = function (e, t) {
          return "object" == typeof e && e && e.hasOwnProperty(t) ? e[t] : null;
        },
        cr = function (e, t) {
          switch (t) {
            case "payment":
              return { payment: { layout: ir(e) } };
            case "address":
              return { address: { display: ar(e, "display") } };
            default:
              return {};
          }
        },
        sr = function (e) {
          var t = e.component,
            n = e.listenerRegistry,
            r = e.elementTimings,
            o = e.getParent,
            i = e.emitEvent,
            a = e.options,
            s = e.selfDestruct,
            u = null,
            l = [],
            p = [],
            d = nr(a),
            m =
              ("payment" === a.componentName && ir(a.publicOptions),
              -1 !== ["auto", "always"].indexOf(a.loader) &&
                Ln(a.componentName)),
            f = Dn({
              controller: a.controller,
              elementFrame: d,
              component: t,
              componentName: a.componentName,
              listenerRegistry: n,
              loaderEnabled: m,
              elementOptions: cr(a.publicOptions, a.componentName),
            });
          d._on("load-error", function (e) {
            i("loaderror", { error: e }), s();
          });
          var h = ar(a.publicOptions, "autocomplete");
          if (
            ("shippingAddress" === a.componentName ||
              "address" === a.componentName) &&
            (null == h ? void 0 : h.mode) !== En.t0.disabled
          ) {
            var y = a.publicOptions.mode || En.gC;
            d._on("setup-stripe-google-maps-autocomplete", function () {
              !(function (e, t, n) {
                var r = er(e, t, n);
                t._on("get-google-maps-predictions", function (e) {
                  e.keyMode === En.UH.stripe &&
                    r._emit("get-google-maps-predictions", e);
                }),
                  t._on("get-google-maps-details", function (e) {
                    e.keyMode === En.UH.stripe &&
                      r._emit("get-google-maps-details", e);
                  });
              })(a.controller, d, y),
                rr({
                  props: e,
                  componentName: "autocompleteSuggestions",
                  controllingElement: "addressElement",
                  controllingMode: y,
                });
            }),
              (null == h ? void 0 : h.mode) === En.t0.google_maps_api &&
                (!(function (e, t, n) {
                  e.action.initGoogleMapsService({ apiKey: n }),
                    t._on("get-google-maps-predictions", function (n) {
                      n.keyMode === En.UH.merchant &&
                        e.action.getGoogleMapsPredictions({
                          data: n,
                          frameId: t.id,
                        });
                    }),
                    t._on("get-google-maps-details", function (n) {
                      n.keyMode === En.UH.merchant &&
                        e.action.getGoogleMapsDetails({
                          data: n,
                          frameId: t.id,
                        });
                    });
                })(a.controller, d, h.apiKey),
                rr({
                  props: e,
                  componentName: "autocompleteSuggestions",
                  controllingElement: "addressElement",
                  controllingMode: y,
                }));
          }
          if ("payment" === a.componentName) {
            var v;
            if (a.publicOptions.parsedIntentSecret)
              a.controller.action.setupStoreForElementsGroup({
                clientSecret: a.publicOptions.parsedIntentSecret,
                customerOptions: null,
                locale: a.locale,
                groupId: a.groupId,
                appearance:
                  null !== (v = a.publicOptions.appearance) && void 0 !== v
                    ? v
                    : a.appearance,
                loader: a.loader,
                externalPaymentMethodTypes: a.externalPaymentMethodTypes,
              });
            var b = null,
              w = function () {
                return _n().then(function (e) {
                  var t = e.mountModal,
                    n = e.unmountModal;
                  return (
                    l.push(function () {
                      n();
                    }),
                    t
                  );
                });
              };
            d._on("setup-afterpay-modal", function () {
              b || (b = w());
            }),
              d._on("mount-afterpay-modal", function (e) {
                var t = e.locale,
                  r = e.modalTheme;
                b || (b = w()),
                  b.then(function (e) {
                    e({
                      controller: a.controller,
                      listenerRegistry: n,
                      locale: t,
                      modalTheme: r,
                    });
                  });
              });
            var k = null,
              E = function () {
                return pn().then(function (e) {
                  var t = e.mountModal,
                    n = e.unmountModal;
                  return (
                    l.push(function () {
                      n();
                    }),
                    t
                  );
                });
              };
            d._on("setup-affirm-modal", function () {
              k || (k = E());
            }),
              d._on("affirm-modal-open", function (e) {
                var t = e.link;
                k || (k = E()),
                  k.then(function (e) {
                    e({
                      controller: a.controller,
                      listenerRegistry: n,
                      url: t,
                    });
                  });
              }),
              d._on("setup-us-bank-account", function () {
                rr({
                  props: e,
                  componentName: "achBankSearchResults",
                  controllingElement: "paymentElement",
                  ariaHidden: "true",
                });
              });
            var S = null;
            !S &&
              xn({ wallet: "applePay", options: a }) &&
              (S = Wn(a, n, d, "applePay")),
              d._on("update-apple-pay", function (e) {
                var t;
                null === (t = S) || void 0 === t || t.pr.update(e);
              });
            var P = null;
            if (!P && xn({ wallet: "googlePay", options: a })) {
              var A = (P = Wn(a, n, d, "googlePay")).pr._backingLibraries
                .GOOGLE_PAY;
              A && p.push(A._destroy);
            }
            if (
              (d._on("update-google-pay", function (e) {
                var t;
                null === (t = P) || void 0 === t || t.pr.update(e);
              }),
              P || S)
            ) {
              var C,
                N,
                I = a.groupId;
              a.controller.action.fetchingWallets({
                groupId: I,
                isComplete: !1,
              }),
                B.J.all([
                  null === (C = P) || void 0 === C
                    ? void 0
                    : C.canMakePaymentPromise,
                  null === (N = S) || void 0 === N
                    ? void 0
                    : N.canMakePaymentPromise,
                ]).then(function () {
                  a.controller.action.fetchingWallets({
                    groupId: I,
                    isComplete: !0,
                  });
                });
            }
            d._on("link-launch", function (e) {
              var t = e.institutionId,
                n = e.parsedClientSecret,
                r = e.consumerClientSecret,
                o = e.consumerPublishableKey,
                i = e.checkoutPriceAmount,
                c = e.email,
                s = e.linkMobilePhone,
                u = e.linkMobilePhoneCountry,
                l = e.instantDebitsIncentive;
              (function (e, t, n, r, o, i, a, c, s, u, l) {
                return Yn({
                  linkAccountSessionCreatorClientSecret: t,
                  linkAccountSessionCreatorType: "link_payment_intent",
                  linkAccountSessionCreatorId: n,
                  controller: r,
                  linkAccountSessionCreationParams: { initial_institution: e },
                  consumerSessionSecret: o,
                  consumerPublishableKey: i,
                  checkoutPriceAmount: a,
                  email: c,
                  linkMobilePhone: s,
                  linkMobilePhoneCountry: u,
                  useContinueButtonOnSuccess: !1,
                  instantDebitsIncentive: l,
                });
              })(
                t,
                n.clientSecret,
                n.id,
                a.controller,
                null != r ? r : void 0,
                o,
                i,
                c,
                s,
                u,
                l
              ).then(function (e) {
                if (!e.error) {
                  var t,
                    n = e.linkAccountSession,
                    o = e.consumer;
                  if (o && !r) {
                    var i;
                    a.controller.action.loginWithConsumerInfo({
                      consumerInfo: o,
                      groupId: a.groupId,
                    });
                    var c =
                      null === (i = o.paymentDetails[0]) || void 0 === i
                        ? void 0
                        : i.id;
                    o.country && "US" !== o.country
                      ? a.controller.action.clearInstantDebitsIncentive({
                          groupId: a.groupId,
                        })
                      : c &&
                        ((t = o.consumerSession),
                        (0, g.G)(t.verification_sessions, function (e) {
                          var t = e.type,
                            n = e.state;
                          return "SIGNUP" === t && "STARTED" === n;
                        })) &&
                        a.controller.action.confirmInstantDebitsIncentiveForPaymentDetails(
                          { bankPaymentDetailsId: c, groupId: a.groupId }
                        );
                  } else
                    n.paymentAccount &&
                      a.controller.action.createBankPaymentDetails({
                        bankAccount: n.paymentAccount.id,
                        groupId: a.groupId,
                      });
                }
              });
            }),
              d._on("us-bank-account-v2-launch", function (e) {
                $n((0, c.Z)({ options: a }, e));
              });
          }
          d._on("mount-link-info-modal", function (e) {
            or((0, c.Z)({ controller: a.controller }, e));
          }),
            (0, _.yq)(
              t,
              (0, c.Z)(
                (0, c.Z)({}, yt.KC),
                {},
                { margin: "-4px 0", transition: "height .35s ease" }
              )
            ),
            d.appendTo(t),
            d.updateStyle(Zn(a.componentName, m)),
            d._on("load", function () {
              d.send({
                action: "stripe-user-mount",
                payload: {
                  timestamps: {
                    stripeJsLoad: r.stripeJsLoadTimestamp.getAsPosixTime(),
                    stripeCreate: r.stripeCreateTimestamp.getAsPosixTime(),
                    groupCreate: r.groupCreateTimestamp.getAsPosixTime(),
                    create: r.createTimestamp.getAsPosixTime(),
                    mount: u ? u.getAsPosixTime() : 0,
                  },
                  rtl: ft(o()),
                },
              });
            }),
            ht.Nb.forEach(function (e) {
              d._on(e, function (t) {
                return i(e, t);
              });
            }),
            d._on("set_styles", function (e) {
              d.updateStyle(e);
            }),
            d._on("redirectfocus", function (e) {
              var n,
                r = e.focusDirection;
              null === (n = (0, _.dh)(t, r)) || void 0 === n || n.focus();
            }),
            d._on("submit", function () {
              i("submit");
              var e = t.closest("form");
              if (e) {
                var n = [
                  'button[type="submit"]',
                  'input[type="submit"]',
                  'input[type="image"]',
                ]
                  .map(function (t) {
                    return e.querySelector(t);
                  })
                  .filter(function (e) {
                    return !!e;
                  })[0];
                n && n.click();
              }
            });
          m &&
            d._on("ready", function () {
              f.hide();
            });
          return {
            update: function (e) {
              e.appearance &&
                a.controller.action.updateElementsOptions({
                  locale: void 0,
                  appearance: e.appearance,
                  groupId: a.groupId,
                }),
                d.update(e);
            },
            focus: function () {
              _t(),
                d.focus(),
                d.send({ action: "stripe-user-focus", payload: {} });
            },
            blur: function () {
              d.blur();
            },
            clear: function () {
              d.clear();
            },
            mount: function () {
              u = new at.E();
              var e = o();
              e &&
                (m && (f.show(), l.push(f.unmount)),
                (0, _.mb)(e, [[ht.et, !0]]),
                l.push(function () {
                  (0, _.mb)(e, [[ht.et, !1]]);
                }));
            },
            unmount: function () {
              for (; l.length; ) l.pop()();
              d.unmount();
            },
            destroy: function () {
              for (; p.length; ) {
                var e;
                null === (e = p.pop()) || void 0 === e || e();
              }
            },
            collapse: function () {
              d.collapse();
            },
            _frame: d,
          };
        },
        ur = function (e) {
          var t = e.options,
            n = (0, d.Z)(e, ["options"]),
            r = t.controller,
            o = t.componentName,
            i = t.publicOptions,
            a = (0, d.Z)(t, ["controller", "componentName", "publicOptions"]),
            s = (function (e) {
              switch (e) {
                case "linkAuthentication":
                case "payment":
                case "shippingAddress":
                case "address":
                case "autocompleteSuggestions":
                case "achBankSearchResults":
                  return e;
                default:
                  throw new Error("Unexpected element type for implementation");
              }
            })(o);
          if (
            ["address", "shippingAddress"].indexOf(s) > -1 &&
            r.keyMode() === Oe.Kl.unknown
          )
            throw new b.No(
              "It looks like you're using an older Stripe key. The Address Element is only available for use with a modern API key, which is prefixed with 'pk_live_' or 'pk_test_'.\n    You can roll your publishable key here: https://dashboard.stripe.com/account/apikeys"
            );
          var u = Rn(
            s,
            i || {},
            "elements.create('".concat(s, "')"),
            !1,
            t.betas
          );
          u.warnings.forEach(function (e) {
            return r.warn(e);
          });
          var l = ["payment", "linkAuthentication"].indexOf(o) > -1,
            p =
              "payment" === t.componentName &&
              (u.value.parsedIntentSecret || null);
          if (l && !t.clientSecret && !p)
            throw new b.No(
              "In order to create a ".concat(
                t.componentName,
                ' element, you must pass a valid PaymentIntent or SetupIntent client secret when creating the Elements group.\n\n  e.g. stripe.elements({clientSecret: "{{CLIENT_SECRET}}"})'
              )
            );
          var m = sr(
              (0, c.Z)(
                (0, c.Z)({}, n),
                {},
                {
                  options: (0, c.Z)(
                    (0, c.Z)({}, a),
                    {},
                    { controller: r, componentName: s, publicOptions: u.value }
                  ),
                }
              )
            ),
            f = m.update,
            _ = (0, d.Z)(m, ["update"]);
          return (0, c.Z)(
            {
              update: function (e) {
                var n = Rn(s, e || {}, "".concat(s, ".update()"), !0, t.betas);
                n.warnings.forEach(function (e) {
                  return r.warn(e);
                }),
                  f(n.value);
              },
            },
            _
          );
        },
        lr = Object.freeze({
          header: (0, m.jt)((0, m.mC)({ text: (0, m.jt)(m.Z_) })),
          showOnAdd: (0, m.jt)((0, m.kw)("auto", "never")),
        }),
        pr = Object.freeze(
          (0, c.Z)(
            {
              clientSecret: kn.pu,
              descriptor: (0, m.jt)((0, m.kw)("cart", "bag", "basket")),
            },
            lr
          )
        ),
        dr =
          ((0, c.Z)({}, (0, g.CE)(pr, ["clientSecret"])),
          Object.freeze({
            price: (0, m.jt)(m.Z_),
            product: (0, m.jt)(m.Z_),
            quantity: (0, m.jt)(m.Rx),
          })),
        mr =
          ((0, c.Z)(
            (0, c.Z)({}, dr),
            {},
            { quantity: m.Rx, outerRequestId: m.Rx }
          ),
          ["ready", "change", "checkout"]),
        fr = "StripeElement",
        _r = {
          margin: "0",
          padding: "0",
          border: "none",
          display: "block",
          background: "transparent",
          position: "relative",
          opacity: "1",
        },
        hr = {
          visibility: "hidden",
          position: "fixed",
          top: "0px",
          left: "100%",
          width: "100%",
          height: "100%",
          "pointer-events": "none",
          "max-width": "none",
          "max-height": "none",
          "min-width": "none",
          "min-height": "none",
        },
        yr = {
          visibility: "visible",
          position: "fixed",
          top: "0px",
          left: "0px",
          "z-index": "99999",
          width: "100%",
          height: "100%",
          "pointer-events": "all",
          "max-width": "none",
          "max-height": "none",
          "min-width": "none",
          "min-height": "none",
        },
        vr = function (e) {
          var t = e.component,
            n = e.getParent,
            r = e.emitEvent,
            o = e.options,
            i = e.selfDestruct,
            a = {
              mounted: !1,
              frameReady: !1,
              visible: !1,
              showStarted: !1,
              releasePageScroll: null,
              restoreFocus: null,
              runOnUnmount: [],
              addRequestIdCounter: 0,
            };
          (0, _.yq)(t, _r);
          var s = (function (e) {
            var t = e.controller,
              n = e.componentName,
              r = e.groupId,
              o = {
                fonts: e.fonts,
                wait: e.wait,
                rtl: !1,
                publicOptions: e.publicOptions,
                controllingElement: e.controllingElement,
              };
            return t.createElementFrame(Be.NC.CART_ELEMENT, n, r, o);
          })(o);
          s.updateStyle(hr), s.appendTo(t);
          var u = function (e) {
              return function (t) {
                a.mounted && a.frameReady && e(t);
              };
            },
            l = u(function () {
              a.visible ||
                ((a.visible = !0),
                s.updateStyle(yr),
                s.show(),
                (a.releasePageScroll = (0, _.MV)()),
                (a.restoreFocus ? a.restoreFocus() : B.J.resolve()).then(
                  function () {
                    var e = (0, _.W3)(s._iframe),
                      t = e.lockedPromise,
                      n = e.lockedElements;
                    a.restoreFocus = function () {
                      return (0, _.gl)(t, n);
                    };
                  }
                ));
            }),
            p = u(function () {
              a.visible && (s.hide(), a.showStarted || (v(), g()));
            }),
            d = u(function (e) {
              s.cancelCheckout(e);
            }),
            m = function (e) {
              return function () {
                throw new b.No(e);
              };
            },
            f = m("focus() is not supported by the cart Element."),
            h = m("blur() is not supported by the cart Element."),
            y = m("clear() is not supported by the cart Element.");
          s._on("load-error", function (e) {
            null == r || r("loaderror", { error: e }), null == i || i();
          }),
            s._on("ready", function () {
              a.frameReady = !0;
            }),
            mr.forEach(function (e) {
              s._on(e, function (t) {
                return null == r ? void 0 : r(e, t);
              });
            }),
            s._on("lineitemclick", function (e) {
              var t = e.url,
                n = !1;
              r("lineitemclick", {
                preventDefault: function () {
                  n = !0;
                },
                url: t,
              }),
                n || (window.location.href = t);
            }),
            s._on("show-start", function () {
              a.visible && (a.showStarted = !0);
            });
          var v = function () {
              var e, t;
              null === (e = a.releasePageScroll) || void 0 === e || e.call(a),
                (a.releasePageScroll = null),
                null === (t = a.restoreFocus) ||
                  void 0 === t ||
                  t.call(a).then(function () {
                    a.restoreFocus = null;
                  }),
                (a.showStarted = !1),
                (a.visible = !1);
            },
            g = function () {
              a.visible || s.updateStyle(hr);
            };
          return (
            s._on("hide-start", v),
            s._on("hide-complete", g),
            s._on("show", l),
            {
              update: function (e) {
                s.update(e);
              },
              focus: f,
              blur: h,
              clear: y,
              mount: function () {
                a.mounted = !0;
                var e = n();
                e &&
                  ((0, _.mb)(e, [[fr, !0]]),
                  a.runOnUnmount.push(function () {
                    (0, _.mb)(e, [[fr, !1]]);
                  }));
                var t = function () {
                  d();
                };
                window.addEventListener("beforeunload", t),
                  a.runOnUnmount.push(function () {
                    return window.removeEventListener("beforeunload", t);
                  });
                var r = function (e) {
                  "Escape" === e.code && p();
                };
                window.addEventListener("keydown", r),
                  a.runOnUnmount.push(function () {
                    return window.removeEventListener("keydown", r);
                  });
              },
              unmount: function () {
                for (var e, t; a.runOnUnmount.length; ) {
                  var n;
                  null === (n = a.runOnUnmount.pop()) || void 0 === n || n();
                }
                null === (e = a.releasePageScroll) || void 0 === e || e.call(a),
                  null === (t = a.restoreFocus) || void 0 === t || t.call(a),
                  (a.mounted = !1),
                  (a.releasePageScroll = null),
                  (a.restoreFocus = null),
                  s.unmount();
              },
              show: l,
              hide: p,
              addLineItem: function (e) {
                if (!a.frameReady || !a.mounted)
                  return B.J.resolve({ clientError: "initializing" });
                var t = ++a.addRequestIdCounter;
                return (
                  s.addLineItem(
                    (0, c.Z)(
                      (0, c.Z)({}, e),
                      {},
                      { quantity: e.quantity || 1, outerRequestId: t }
                    )
                  ),
                  new B.J(function (e) {
                    s._on("add-line-item-response", function n(r) {
                      var o = r.outerRequestId,
                        i = r.error;
                      o === t &&
                        (s._off("add-line-item-response", n),
                        e(i ? { error: i } : {}));
                    });
                  })
                );
              },
              cancelCheckout: d,
              _frame: s,
            }
          );
        },
        gr = function (e) {
          var t = e.options,
            n = (0, d.Z)(e, ["options"]),
            r = t.controller,
            o = t.publicOptions,
            i =
              (t.componentName,
              (0, d.Z)(t, ["controller", "publicOptions", "componentName"]));
          if (r.keyMode() === Oe.Kl.unknown)
            throw new b.No(
              "It looks like you're using an older Stripe key. The Cart Element is only available for use with a modern API key, which is prefixed with 'pk_live_' or 'pk_test_'.\n      You can roll your publishable key here: https://dashboard.stripe.com/account/apikeys"
            );
          var a,
            s,
            u,
            l =
              ((a = o || {}),
              (s = "elements.create('cart', options)"),
              (0, m.Gu)(
                (0, m.mC)(pr),
                a,
                s,
                u ? { authenticatedOrigin: u } : null
              )),
            p = l.value,
            f = p.clientSecret,
            _ = (0, d.Z)(p, ["clientSecret"]);
          l.warnings.forEach(function (e) {
            return r.warn(e);
          });
          var h = {},
            y = function (e, t) {
              return (
                e.forEach(function (e) {
                  return r.warn(e);
                }),
                B.J.resolve({ clientError: t })
              );
            },
            v = vr(
              (0, c.Z)(
                (0, c.Z)({}, n),
                {},
                {
                  options: (0, c.Z)(
                    (0, c.Z)({}, i),
                    {},
                    { componentName: "cart", controller: r, publicOptions: _ }
                  ),
                }
              )
            ),
            g = v.update,
            w = v.cancelCheckout,
            k = v.addLineItem,
            E = (0, d.Z)(v, ["update", "cancelCheckout", "addLineItem"]);
          return (
            r.action
              .fetchCartSession({ clientSecret: f, groupId: t.groupId })
              .catch(function (t) {
                e.emitEvent("loaderror", { error: t }), e.selfDestruct();
              }),
            (0, c.Z)(
              (0, c.Z)({}, E),
              {},
              {
                update: function (e) {
                  var t = (function (e, t, n) {
                      return (0, m.Gu)(
                        (0, m.mC)(lr),
                        e,
                        t,
                        n ? { authenticatedOrigin: n } : null
                      );
                    })(e || {}, "cart.update()"),
                    n = t.value;
                  t.warnings.forEach(function (e) {
                    return r.warn(e);
                  }),
                    g(n);
                },
                addLineItem: function (e) {
                  var t = (function (e, t) {
                      var n = (0, m.Gu)(
                        (0, m.mC)(dr),
                        e,
                        "cart.addLineItem()",
                        t ? { authenticatedOrigin: t } : null
                      );
                      return { value: n.value, warnings: n.warnings };
                    })(e || {}),
                    n = t.value,
                    r = t.warnings,
                    o = n.product || n.price;
                  if (o) {
                    if (
                      (function (e) {
                        var t = Date.now(),
                          n = h[e],
                          r = void 0 !== n && t - n < 200;
                        return r || (h[e] = t), r;
                      })(o)
                    )
                      return (
                        r.push(
                          "addLineItem() cannot be consecutively called within ".concat(
                            200,
                            " milliseconds for the same price or product."
                          )
                        ),
                        y(r, "throttled")
                      );
                  } else
                    r.push(
                      "addLineItem() must be provided either a product or price."
                    );
                  return r.length ? y(r, "integration") : k(n);
                },
                cancelCheckout: function (e) {
                  var t = "string" == typeof e,
                    n = t ? e : "";
                  t ||
                    r.warn(
                      "Expected a string passed to cancelCheckout(), but received ".concat(
                        typeof e,
                        "."
                      )
                    ),
                    w(n);
                },
              }
            )
          );
        },
        br = ["ready", "focus", "blur", "escape"],
        wr = "StripeElement",
        kr = {
          margin: "0",
          padding: "0",
          border: "none",
          display: "block",
          background: "transparent",
          position: "relative",
          opacity: "1",
        },
        Er = { height: "2px", margin: "-4px", width: "calc(100% + 8px)" },
        Sr = function (e) {
          var t = e.controller,
            n = e.eventName,
            r = e.time,
            o = e.timeLabel,
            i = e.reject,
            a = e.validateResolve,
            c = null,
            s = !1,
            u = !1;
          return (
            (c = setTimeout(function () {
              (u = !0),
                t.warn(
                  'Timed out waiting for a call to resolve(). If you listen to "'
                    .concat(
                      n,
                      '" events, then you must call event.resolve in the "'
                    )
                    .concat(n, '" handler within ')
                    .concat(o, ".")
                ),
                i();
            }, r)),
            function (e) {
              u
                ? t.warn(
                    "Call to resolve() was ignored because it has already timed out. Please ensure that resolve is called within ".concat(
                      o,
                      "."
                    )
                  )
                : s
                ? t.warn(
                    "Call to resolve() was ignored because it has already been called. Do not call resolve more than once."
                  )
                : (c && clearTimeout(c), (s = !0), a(e));
            }
          );
        },
        Pr = Object.freeze({
          applePay: (0, m.jt)((0, m.kw)("always", "auto", "never")),
          googlePay: (0, m.jt)((0, m.kw)("always", "auto", "never")),
        }),
        Ar = Object.freeze({
          applePay: (0, m.jt)((0, m.kw)("black", "white", "white-outline")),
          googlePay: (0, m.jt)((0, m.kw)("black", "white")),
          paypal: (0, m.jt)(
            (0, m.kw)("gold", "blue", "silver", "white", "black")
          ),
        }),
        Cr = Object.freeze({
          applePay: (0, m.jt)(
            (0, m.kw)(
              "add-money",
              "book",
              "buy",
              "checkout",
              "continue",
              "contribute",
              "donate",
              "order",
              "pay",
              "plain",
              "reload",
              "rent",
              "subscribe",
              "support",
              "tip",
              "top-up"
            )
          ),
          googlePay: (0, m.jt)(
            (0, m.kw)(
              "book",
              "buy",
              "checkout",
              "donate",
              "order",
              "pay",
              "plain",
              "subscribe"
            )
          ),
          paypal: (0, m.jt)((0, m.kw)("paypal", "checkout", "buynow", "pay")),
        }),
        Nr = Object.freeze({
          locale: (0, m.yv)("elements()"),
          buttonHeight: (0, m.jt)((0, m.rS)(25, 55)),
          layout: (0, m.jt)((0, m.kw)("auto", "horizontal", "vertical")),
          paymentMethodOrder: (0, m.jt)((0, m.CT)(m.Z_)),
        }),
        Ir =
          ((0, c.Z)(
            (0, c.Z)({}, Nr),
            {},
            {
              buttonTheme: (0, m.jt)((0, m.mC)(Ar)),
              buttonType: (0, m.jt)((0, m.mC)(Cr)),
              wallets: (0, m.jt)((0, m.mC)(Pr)),
            }
          ),
          Object.freeze({ name: m.Z_, amount: (0, m.M2)(0) })),
        Tr = Object.freeze({
          unit: (0, m.kw)("hour", "day", "business_day", "week", "month"),
          value: (0, m.M4)(0),
        }),
        Mr = Object.freeze({
          id: m.Z_,
          amount: (0, m.M2)(0),
          displayName: m.Z_,
          deliveryEstimate: (0, m.jt)(
            (0, m.mC)({
              maximum: (0, m.jt)((0, m.mC)(Tr)),
              minimum: (0, m.jt)((0, m.mC)(Tr)),
            })
          ),
        }),
        jr = Object.freeze({
          allowedShippingCountries: (0, m.jt)((0, m.CT)(m.hN)),
          business: (0, m.jt)((0, m.mC)({ name: m.Z_ })),
          lineItems: (0, m.jt)((0, m.CT)((0, m.mC)(Ir))),
          billingAddressRequired: (0, m.Wc)(m.Xg, function () {
            return !0;
          }),
          emailRequired: (0, m.jt)(m.Xg),
          phoneNumberRequired: (0, m.jt)(m.Xg),
          shippingAddressRequired: (0, m.jt)(m.Xg),
          shippingRates: (0, m.jt)((0, m.uw)("id")((0, m.CT)((0, m.mC)(Mr)))),
        }),
        Or = Object.freeze({
          lineItems: (0, m.jt)((0, m.CT)((0, m.mC)(Ir))),
          shippingRates: (0, m.jt)((0, m.uw)("id")((0, m.CT)((0, m.mC)(Mr)))),
        }),
        Rr = function (e, t) {
          var n = (0, m.Gu)(
              (0, m.mC)(Or),
              e,
              "".concat(t, " resolve callback")
            ),
            r = n.value,
            o = n.warnings,
            i = r.shippingRates;
          if (i && !i.length)
            throw new b.No("You must specify `shippingRates`.");
          return { value: r, warnings: o };
        },
        Zr = 1,
        xr = function (e, t) {
          if (e) {
            return Ze(e, function () {
              t.report("ece.apple_pay.missing_country_code", {
                country: e.country,
              });
            });
          }
        },
        Lr = function (e, t, n) {
          t.report("ece.apple_pay.session_creation_failed", { error: n }),
            e.abort();
          var r = n.message;
          "string" == typeof r && t.warn(r);
        },
        Dr = function (e, t, n, r) {
          return {
            amount: (0, me.Fe)(e, n),
            label: t,
            type: r ? "pending" : "final",
          };
        },
        Br = function (e) {
          return de(e, !1, []).filter(function (e) {
            return null !== e;
          });
        },
        qr = function (e, t) {
          var n = e.amount,
            r = (e.deliveryEstimate, e.displayName),
            o = e.id;
          return {
            label: r,
            detail: "Arrives in 5 to 7 business days",
            amount: (0, me.Fe)(n, t),
            identifier: o,
          };
        },
        Fr = function (e) {
          var t = e.controller,
            n = e.eventHandlers,
            r = e.groupId,
            o = e.listenerRegistry,
            i = {
              isPaymentSheetShowing: !1,
              total: 0,
              businessName: "",
              currency: "usd",
              pending: !1,
              shippingRates: void 0,
              allowedShippingCountries: void 0,
              lineItems: void 0,
            },
            a = function () {
              (i.isPaymentSheetShowing = !1),
                t.action.expressCheckoutConfirmEnd({ groupId: r });
            },
            u = function (e, s) {
              o.addEventListener(
                e,
                "validatemerchant",
                C(
                  (function (e) {
                    var t = e.privateSession,
                      n = e.controller,
                      r = e.displayName,
                      o = e.isPaymentSheetShowing;
                    return function (e) {
                      n.action
                        .createApplePaySession({
                          data: {
                            validation_url: e.validationURL,
                            domain_name: window.location.hostname,
                            display_name: r,
                          },
                          usesExpressCheckoutElement: !0,
                        })
                        .then(
                          function (e) {
                            switch (e.type) {
                              case "object":
                                if (!o()) return;
                                t.completeMerchantValidation(
                                  JSON.parse(e.object.session)
                                );
                                break;
                              case "error":
                                Lr(t, n, e.error);
                                break;
                              default:
                                (0, m.Rz)(e);
                            }
                          },
                          function (e) {
                            return Lr(t, n, e);
                          }
                        );
                    };
                  })({
                    privateSession: e,
                    controller: t,
                    displayName: s,
                    isPaymentSheetShowing: function () {
                      return i.isPaymentSheetShowing;
                    },
                  })
                )
              ),
                o.addEventListener(
                  e,
                  "cancel",
                  C(function () {
                    a(), n.cancel();
                  })
                );
              var u = function () {
                  var e = i.total,
                    t = i.businessName,
                    n = i.currency,
                    r = i.pending;
                  return Dr(e, t, n, r);
                },
                l = function (e) {
                  var t = e.lineItems,
                    n = e.shippingRates,
                    r = i.currency,
                    o = i.pending;
                  return {
                    newLineItems:
                      null == t
                        ? void 0
                        : t.map(function (e) {
                            var t = e.amount,
                              n = e.name;
                            return Dr(t, n, r, o);
                          }),
                    newShippingMethods:
                      null == n
                        ? void 0
                        : n.map(function (e) {
                            return qr(e, r);
                          }),
                  };
                };
              o.addEventListener(
                e,
                "shippingcontactselected",
                C(function (t) {
                  var r = (function (e) {
                    var t = e.administrativeArea,
                      n = e.countryCode;
                    return {
                      city: e.locality || "",
                      state: t || "",
                      postal_code: e.postalCode || "",
                      country: (null == n ? void 0 : n.toUpperCase()) || "",
                    };
                  })(t.shippingContact);
                  if (
                    i.allowedShippingCountries &&
                    -1 === i.allowedShippingCountries.indexOf(r.country)
                  ) {
                    var o = u(),
                      a = i.lineItems,
                      c = new window.ApplePayError(
                        "shippingContactInvalid",
                        "country",
                        "We can not ship to this country."
                      );
                    e.completeShippingContactSelection({
                      newTotal: o,
                      newLineItems: a,
                      errors: [c],
                    });
                  } else {
                    var s = {
                      paymentMethodType: "apple_pay",
                      name: "",
                      address: r,
                      resolve: function (t) {
                        var n = l(t),
                          r = n.newLineItems,
                          o = n.newShippingMethods,
                          a = u();
                        (i.lineItems = r || i.lineItems),
                          e.completeShippingContactSelection({
                            newLineItems: i.lineItems,
                            newShippingMethods: o,
                            newTotal: a,
                          });
                      },
                      reject: function () {
                        var t = u(),
                          n = i.lineItems,
                          r = new window.ApplePayError(
                            "shippingContactInvalid"
                          );
                        e.completeShippingContactSelection({
                          newTotal: t,
                          newLineItems: n,
                          errors: [r],
                        });
                      },
                    };
                    n.shippingAddressChange(s);
                  }
                })
              );
              o.addEventListener(
                e,
                "shippingmethodselected",
                C(function (t) {
                  var r = t.shippingMethod,
                    o = (0, g.sE)(i.shippingRates || [], function (e) {
                      return e.id === r.identifier;
                    });
                  if (o) {
                    var c = {
                      paymentMethodType: "apple_pay",
                      shippingRate: o,
                      resolve: function (t) {
                        var n = l(t),
                          r = n.newLineItems,
                          o = n.newShippingMethods,
                          a = u();
                        i.lineItems = r || i.lineItems;
                        var c = {
                          newLineItems: i.lineItems,
                          newShippingMethods: o,
                          newTotal: a,
                        };
                        e.completeShippingMethodSelection(c);
                      },
                      reject: function () {
                        var t = u();
                        e.completeShippingMethodSelection(Zr, t, []),
                          a(),
                          n.cancel();
                      },
                    };
                    n.shippingRateChange(c);
                  } else (0, m.Rz)(r, "User selected a new shipping method within the Apple Pay payment sheet, but it was not one of the shipping rates the merchant passed in.");
                })
              );
              o.addEventListener(
                e,
                "paymentauthorized",
                C(function (o) {
                  var i = o.payment;
                  t.action.expressCheckoutConfirmStart({ groupId: r }),
                    t.action
                      .tokenizeWithData({
                        type: "apple_pay",
                        elementName: k.Yj.expressCheckout,
                        tokenData: (0, c.Z)(
                          (0, c.Z)({}, i),
                          {},
                          { billingContact: xr(i.billingContact, t) }
                        ),
                        mids: t.mids(),
                      })
                      .then(function (r) {
                        if ("error" === r.type) {
                          var o = new window.ApplePayError("unknown");
                          return (
                            e.completePayment({ status: Zr, errors: [o] }),
                            t.report("ece.apple_pay.create_token_failed", {
                              error: r.error,
                            }),
                            void a()
                          );
                        }
                        var i = {
                          paymentMethodType: "apple_pay",
                          reject: function () {
                            var t =
                                arguments.length > 0 && void 0 !== arguments[0]
                                  ? arguments[0]
                                  : {},
                              n = t.reason,
                              r = void 0 === n ? "fail" : n,
                              o =
                                "invalid_shipping_address" === r
                                  ? [
                                      new window.ApplePayError(
                                        "shippingContactInvalid"
                                      ),
                                    ]
                                  : void 0;
                            e.completePayment({ status: Zr, errors: o }), a();
                          },
                        };
                        n.confirm(i);
                      });
                })
              );
            };
          return {
            showButton: function () {
              return t.action.showApplePayButton({
                groupId: r,
                showApplePayButton: !0,
              });
            },
            clickHandler: function (e, n) {
              var r,
                o,
                a = window.ApplePaySession;
              if (a) {
                var l =
                    (null === (r = n.business) || void 0 === r
                      ? void 0
                      : r.name) || e.businessName,
                  p = e.currency,
                  d = e.pending;
                (i.total = e.amount),
                  (i.businessName = l),
                  (i.currency = p),
                  (i.pending = d),
                  (i.shippingRates = n.shippingRates),
                  (i.allowedShippingCountries = n.allowedShippingCountries),
                  (i.lineItems =
                    null === (o = n.lineItems) || void 0 === o
                      ? void 0
                      : o.map(function (e) {
                          var t = e.amount,
                            n = e.name;
                          return Dr(t, n, p, d);
                        }));
                var m = new a(
                  4,
                  (function (e) {
                    var t = e.amount,
                      n = e.billingAddressRequired,
                      r = e.businessName,
                      o = e.country,
                      i = e.currency,
                      a = e.emailRequired,
                      c = e.lineItems,
                      u = e.pending,
                      l = e.phoneNumberRequired,
                      p = e.shippingAddressRequired,
                      d = e.shippingRates,
                      m = [].concat(
                        (0, s.Z)(a ? ["email"] : []),
                        (0, s.Z)(l ? ["phone"] : []),
                        (0, s.Z)(p ? ["postalAddress"] : [])
                      ),
                      f = n ? ["postalAddress"] : [],
                      _ =
                        null == d
                          ? void 0
                          : d.map(function (e) {
                              return qr(e, i);
                            }),
                      h =
                        null == c
                          ? void 0
                          : c.map(function (e) {
                              var t = e.amount,
                                n = e.name;
                              return Dr(t, n, i, u);
                            });
                    return {
                      countryCode: o,
                      currencyCode: i.toUpperCase(),
                      lineItems: h,
                      merchantCapabilities: ["supports3DS"],
                      requiredBillingContactFields: f,
                      requiredShippingContactFields: m,
                      shippingMethods: _,
                      supportedNetworks: Br(o),
                      total: Dr(t, r, i, u),
                    };
                  })(
                    (0, c.Z)(
                      (0, c.Z)((0, c.Z)({}, e), n),
                      {},
                      { businessName: l }
                    )
                  )
                );
                u(m, l), m.begin(), (i.isPaymentSheetShowing = !0);
              } else
                t.warn(
                  "User clicked on the Apple Pay button, but window.ApplePaySession does not exist."
                );
            },
            canMakePaymentsWithActiveCard: function () {
              var e = window.location.hostname,
                n = t.getCredentials().stripeAccount,
                r = t.keyMode() === Oe.Kl.test;
              return se(e, n, r, t.report, 4);
            },
          };
        },
        Ur = function (e) {
          var t = e.component,
            n = e.elementTimings,
            r = e.getParent,
            o = e.emitEvent,
            i = e.options,
            a = e.selfDestruct,
            s = e.hasRegisteredListener,
            u = e.listenerRegistry,
            l = i.controller,
            p = i.groupId,
            d = null,
            f = [],
            h = (function (e) {
              var t = e.controller,
                n = e.componentName,
                r = e.groupId,
                o = e.fonts,
                i = e.wait,
                a = e.publicOptions,
                c = e.controllingElement,
                s = {
                  fonts: o,
                  wait: i,
                  rtl: ft(document.body),
                  publicOptions: a,
                  controllingElement: c,
                };
              return t.createElementFrame(
                Be.NC.EXPRESS_CHECKOUT_ELEMENT,
                n,
                r,
                s
              );
            })(i);
          (0, _.yq)(
            t,
            (0, c.Z)(
              (0, c.Z)({}, kr),
              {},
              { margin: "-4px 0", transition: "height .35s ease" }
            )
          ),
            h.appendTo(t),
            h.updateStyle(Er),
            h._on("set_styles", function (e) {
              h.updateStyle(e);
            }),
            h._on("redirectfocus", function (e) {
              var n,
                r = e.focusDirection;
              null === (n = (0, _.dh)(t, r)) || void 0 === n || n.focus();
            }),
            h._on("load", function () {
              h.send({
                action: "stripe-user-mount",
                payload: {
                  timestamps: {
                    stripeJsLoad: n.stripeJsLoadTimestamp.getAsPosixTime(),
                    stripeCreate: n.stripeCreateTimestamp.getAsPosixTime(),
                    groupCreate: n.groupCreateTimestamp.getAsPosixTime(),
                    create: n.createTimestamp.getAsPosixTime(),
                    mount: d ? d.getAsPosixTime() : 0,
                  },
                  rtl: ft(r()),
                },
              });
            });
          var y = function (e) {
              var t = e.name,
                n = e.address,
                r = "shippingaddresschange";
              if (s(r)) {
                var i = Sr({
                  controller: l,
                  eventName: r,
                  time: 29900,
                  timeLabel: "30 seconds",
                  reject: e.reject,
                  validateResolve: function (t) {
                    var n = Rr(t, r),
                      o = n.value;
                    n.warnings.forEach(function (e) {
                      return l.warn(e);
                    }),
                      e.resolve(o);
                  },
                });
                o(r, { name: t, address: n, reject: e.reject, resolve: i });
              } else e.resolve({});
            },
            v = function (e) {
              var t = e.shippingRate,
                n = "shippingratechange";
              if (s(n)) {
                var r = Sr({
                  controller: l,
                  eventName: n,
                  time: 29900,
                  timeLabel: "30 seconds",
                  reject: e.reject,
                  validateResolve: function (t) {
                    var r = Rr(t, n),
                      o = r.value;
                    r.warnings.forEach(function (e) {
                      return l.warn(e);
                    }),
                      e.resolve(o);
                  },
                });
                o(n, { shippingRate: t, reject: e.reject, resolve: r });
              } else e.resolve({});
            },
            g = function () {
              o("cancel");
            },
            w = function (e) {
              var t = e.paymentMethodType,
                n = e.reject,
                r = e.billingDetails,
                i = e.shippingAddress,
                a = e.shippingRate;
              o("confirm", {
                expressPaymentMethodType: t,
                reject: n,
                billingDetails: r,
                shippingAddress: i,
                shippingRate: a,
              });
            },
            k = Fr({
              controller: l,
              eventHandlers: {
                cancel: g,
                shippingAddressChange: y,
                shippingRateChange: v,
                confirm: w,
              },
              groupId: p,
              listenerRegistry: u,
            });
          k.canMakePaymentsWithActiveCard().then(function (e) {
            e && k.showButton();
          }),
            h._on("cancel", g),
            h._on("click", function (e) {
              var t = e.paymentMethodType,
                n = "click";
              if (s(n)) {
                var r = Sr({
                  controller: i.controller,
                  eventName: n,
                  time: 900,
                  timeLabel: "1 second",
                  reject: "apple_pay" === t ? function () {} : e.reject,
                  validateResolve: function (n) {
                    var r = (function (e) {
                        var t = (0, m.Gu)(
                            (0, m.mC)(jr),
                            e,
                            "click resolve callback"
                          ),
                          n = t.value,
                          r = t.warnings,
                          o = n.shippingAddressRequired,
                          i = n.shippingRates;
                        if (o && (!i || !i.length))
                          throw new b.No(
                            "When `shippingAddressRequired` is true, you must specify `shippingRates`."
                          );
                        return { value: n, warnings: r };
                      })(n),
                      o = r.value;
                    r.warnings.forEach(function (e) {
                      return l.warn(e);
                    }),
                      "apple_pay" === t ? k.clickHandler(e, o) : e.resolve(o);
                  },
                });
                o(n, { paymentMethodType: t, resolve: r });
              } else "apple_pay" === t ? k.clickHandler(e, {}) : e.resolve({});
            }),
            h._on("shippingaddresschange", y),
            h._on("shippingratechange", v),
            h._on("confirm", w);
          return (
            h._on("load-error", function (e) {
              o("loaderror", { error: e }), a();
            }),
            br.forEach(function (e) {
              h._on(e, function (t) {
                return o(e, t);
              });
            }),
            {
              update: function (e) {
                h.update(e);
              },
              focus: function () {
                _t(),
                  h.focus(),
                  h.send({ action: "stripe-user-focus", payload: {} });
              },
              blur: function () {
                h.blur();
              },
              clear: function () {
                throw new b.No(
                  "clear() is not supported by the Express Checkout Element."
                );
              },
              mount: function () {
                d = new at.E();
                var e = r();
                e &&
                  ((0, _.mb)(e, [[wr, !0]]),
                  f.push(function () {
                    (0, _.mb)(e, [[wr, !1]]);
                  }));
              },
              unmount: function () {
                for (; f.length; ) {
                  var e;
                  null === (e = f.pop()) || void 0 === e || e();
                }
                h.unmount();
              },
              _frame: h,
            }
          );
        },
        Gr = function (e, t) {
          var n = (function (e) {
            if (!O.YA[e])
              throw new Error("Unexpected Element type: ".concat(e, "."));
            return O.YA[e].implementation;
          })(e);
          switch (n) {
            case "legacy":
              return new cn(t);
            case "affirm_message":
              return dn(t);
            case "afterpay_message":
              return hn(t);
            case "unified_message":
              return gn(t);
            case "frame":
              return ur(t);
            case "cart":
              return gr(t);
            case "express_checkout":
              return Ur(t);
            default:
              return (0, m.Rz)(
                n,
                "Unexpected implementation type: ".concat(n, ".")
              );
          }
        },
        Yr = function () {
          var e =
            arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          return (0, c.Z)(
            (0, c.Z)(
              {},
              (0, g.ei)(e, [
                "business",
                "fields",
                "paymentMethodOrder",
                "readOnly",
                "terms",
                "wallets",
                "allowedCardBrands",
                "disallowedCardBrands",
                "layout",
                "blockPoBox",
                "accountHolderType",
                "disabled",
                "hideIcon",
                "hidePostalCode",
                "iconStyle",
                "placeholderCountry",
                "rtl",
                "showIcon",
                "supportedCountries",
                "betas",
                "componentName",
                "groupId",
                "locale",
                "loader",
                "externalPaymentMethodTypes",
              ])
            ),
            e.autocomplete && {
              disableAutocomplete: "disabled" === e.autocomplete.mode,
            }
          );
        },
        zr = (function (e) {
          function t(e, r, o) {
            var i, a;
            (0, u.Z)(this, t),
              ((a = n.call(this)).mount = C(function (e) {
                var t;
                if ((a._checkDestroyed(), !e))
                  throw new b.No(
                    "Missing argument. Make sure to call mount() with a valid DOM element or selector."
                  );
                if ("string" == typeof e) {
                  var n = document.querySelectorAll(e);
                  if (
                    (n.length > 1 &&
                      a._controller.warn(
                        "The selector you specified ("
                          .concat(e, ") applies to ")
                          .concat(
                            n.length,
                            " DOM elements that are currently on the page.\nThe Stripe Element will be mounted to the first one."
                          )
                      ),
                    !n.length)
                  )
                    throw new b.No(
                      "The selector you specified (".concat(
                        e,
                        ") applies to no DOM elements that are currently on the page.\nMake sure the element exists on the page before calling mount()."
                      )
                    );
                  t = n[0];
                } else {
                  if (!e.appendChild)
                    throw new b.No(
                      "Invalid DOM element. Make sure to call mount() with a valid DOM element or selector."
                    );
                  t = e;
                }
                if ("INPUT" === t.nodeName)
                  throw new b.No(
                    "Stripe Elements must be mounted in a DOM element that\ncan contain child nodes. `input` elements are not permitted to have child\nnodes. Try using a `div` element instead."
                  );
                t.children.length &&
                  t !== document.body &&
                  a._controller.warn(
                    "This Element will be mounted to a DOM element that contains child nodes."
                  ),
                  a._mountToParent(t);
              })),
              (a.update = C(function (e) {
                return (
                  a._controller.report("update", {
                    options: Yr(e),
                    element: a._componentName,
                    element_mode: a._componentMode,
                  }),
                  a._checkDestroyed(),
                  a._implementation.update(e),
                  (0, Z.Z)(a)
                );
              })),
              (a.focus = C(function (e) {
                return (
                  a._checkDestroyed(),
                  e && e.preventDefault(),
                  a._implementation.focus(),
                  (0, Z.Z)(a)
                );
              })),
              (a.blur = C(function () {
                return (
                  a._checkDestroyed(), a._implementation.blur(), (0, Z.Z)(a)
                );
              })),
              (a.clear = C(function () {
                return (
                  a._checkDestroyed(), a._implementation.clear(), (0, Z.Z)(a)
                );
              })),
              (a.collapse = C(function () {
                if ((a._checkDestroyed(), !a._implementation.collapse))
                  throw new b.No(
                    "Collapse is not supported by the ".concat(
                      a._componentName,
                      " Element."
                    )
                  );
                return a._implementation.collapse(), (0, Z.Z)(a);
              })),
              (a.show = C(function () {
                if ((a._checkDestroyed(), !a._implementation.show))
                  throw new b.No(
                    "show() is not supported by the ".concat(
                      a._componentName,
                      " Element."
                    )
                  );
                return a._implementation.show(), (0, Z.Z)(a);
              })),
              (a.hide = C(function () {
                if ((a._checkDestroyed(), !a._implementation.hide))
                  throw new b.No(
                    "hide() is not supported by the ".concat(
                      a._componentName,
                      " Element."
                    )
                  );
                return a._implementation.hide(), (0, Z.Z)(a);
              })),
              (a.addLineItem = C(function (e) {
                if ((a._checkDestroyed(), a._implementation.addLineItem))
                  return a._implementation.addLineItem(e);
                throw new b.No(
                  "addLineItem() is not supported by the ".concat(
                    a._componentName,
                    " Element."
                  )
                );
              })),
              (a.cancelCheckout = C(function (e) {
                if ((a._checkDestroyed(), !a._implementation.cancelCheckout))
                  throw new b.No(
                    "cancelCheckout() is not supported by the ".concat(
                      a._componentName,
                      " Element."
                    )
                  );
                return a._implementation.cancelCheckout(e), (0, Z.Z)(a);
              })),
              (a.unmount = C(function () {
                return a._checkDestroyed(), a._unmount(), (0, Z.Z)(a);
              })),
              (a.destroy = C(function () {
                var e, t;
                return (
                  a._checkDestroyed(),
                  a.unmount(),
                  null === (e = (t = a._implementation).destroy) ||
                    void 0 === e ||
                    e.call(t),
                  (a._destroyed = !0),
                  a._emitEvent("destroy"),
                  (0, Z.Z)(a)
                );
              })),
              (a._getParent = function () {
                return a._parent;
              }),
              (a._emitEvent = function (e, t) {
                if (
                  ("loaderror" !== e ||
                    a._hasRegisteredListener("loaderror") ||
                    a._controller.keyMode() !== Oe.Kl.test ||
                    console.error(
                      "Unhandled ".concat(
                        a._componentName,
                        " Element loaderror"
                      ),
                      t
                    ),
                  "cart" === a._componentName &&
                    "checkout" === e &&
                    !a._hasRegisteredListener("checkout"))
                )
                  throw new b.No(
                    "Unhandled Cart Element checkout event. Make sure to register a checkout handler."
                  );
                return a._emit(
                  e,
                  (0, c.Z)({ elementType: a._componentName }, t)
                );
              }),
              (a._cancelCheckout = function (e) {
                "cart" === a._componentName &&
                  a._controller._sendCaReq("cancelCheckout", {
                    errorMessage: e,
                    groupId: a._groupId,
                  });
              });
            var s = e.controller,
              l = e.componentName,
              p = e.groupId,
              d = e.locale,
              m = e.betas,
              f = e.mids;
            (a._controller = s),
              (a._componentName = l),
              (a._componentMode =
                null === (i = e.publicOptions) || void 0 === i
                  ? void 0
                  : i.mode),
              (a._destroyed = !1),
              (a._groupId = p),
              (a._mids = f);
            var _ = document.createElement("div");
            return (
              (_.className = O.A2),
              (a._component = _),
              s.report("create", {
                options: Yr(
                  (0, c.Z)(
                    { componentName: l, groupId: p, locale: d, betas: m },
                    e.publicOptions
                  )
                ),
                element: l,
                element_mode: a._componentMode,
              }),
              (a._implementation = Gr(a._componentName, {
                options: e,
                component: _,
                listenerRegistry: r,
                elementTimings: o,
                emitEvent: a._emitEvent,
                getParent: a._getParent,
                hasRegisteredListener: a._hasRegisteredListener,
                selfDestruct: function () {
                  a.destroy();
                },
              })),
              a
            );
          }
          (0, x.Z)(t, e);
          var n = (0, L.Z)(t);
          return (
            (0, l.Z)(t, [
              {
                key: "_checkDestroyed",
                value: function () {
                  if (this._destroyed)
                    throw new b.No(
                      "This Element has already been destroyed. Please create a new one."
                    );
                },
              },
              {
                key: "_isMounted",
                value: function () {
                  return (
                    !!document.body && document.body.contains(this._component)
                  );
                },
              },
              {
                key: "_unmount",
                value: function () {
                  var e = this._component.parentElement;
                  e && e.removeChild(this._component),
                    this._controller.report("unmount", {
                      element: this._componentName,
                      element_mode: this._componentMode,
                    }),
                    this._implementation.unmount(),
                    (this._parent = null);
                },
              },
              {
                key: "_mountToParent",
                value: function (e) {
                  var t = this._component.parentElement,
                    n = this._isMounted();
                  if (e === t) {
                    if (n) return;
                    this.unmount(), this._mountTo(e);
                  } else if (t) {
                    if (n)
                      throw new b.No(
                        "This Element is already mounted. Use `unmount()` to unmount the Element before re-mounting."
                      );
                    this.unmount(), this._mountTo(e);
                  } else this._mountTo(e);
                },
              },
              {
                key: "_mountTo",
                value: function (e) {
                  for (this._parent = e; e.firstChild && e !== document.body; )
                    e.removeChild(e.firstChild);
                  e.appendChild(this._component),
                    this._controller.report("mount", {
                      element: this._componentName,
                      element_mode: this._componentMode,
                    }),
                    this._implementation.mount();
                },
              },
            ]),
            t
          );
        })(D),
        Hr = function (e, t) {
          e._controller.report("legacy_private_property_used", {
            prop: t,
            componentName: e._componentName,
          });
        };
      [
        "_autofilled",
        "_classes",
        "_complete",
        "_empty",
        "_fakeInput",
        "_focused",
        "_frame",
        "_invalid",
        "_lastBackgroundColor",
        "_lastFontSize",
        "_lastHeight",
        "_lastPadding",
        "_lastSubmittedAt",
        "_listenerRegistry",
        "_paymentRequest",
      ].forEach(function (e) {
        Object.defineProperty(zr.prototype, e, {
          enumerable: !1,
          get: function () {
            return Hr(this, e), this._implementation[e];
          },
        });
      });
      ["_formSubmit", "_isIssuingDisplayElement"].forEach(function (e) {
        Object.defineProperty(zr.prototype, e, {
          enumerable: !1,
          writable: !1,
          value: function () {
            return Hr(this, e), this._implementation[e]();
          },
        });
      });
      var Kr,
        Jr = zr,
        Wr = (0, m.mC)({
          locale: (0, m.jt)(m.Z_),
          appearance: (0, m.jt)(m.Ry),
        }),
        Vr = function (e) {
          if (e)
            return (0, c.Z)(
              (0, c.Z)(
                (0, c.Z)({}, e),
                e.hasOwnProperty("rules") ? { rules: "<truncated>" } : null
              ),
              e.hasOwnProperty("variables")
                ? { variables: "<truncated>" }
                : null
            );
        },
        Xr = function () {
          var e =
            arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          return (0, c.Z)(
            (0, c.Z)(
              (0, c.Z)(
                {},
                (0, g.ei)(e, ["locale", "loader", "externalPaymentMethodTypes"])
              ),
              e.hasOwnProperty("fonts") ? { fonts: "<truncated>" } : null
            ),
            {},
            { appearance: Vr(e.appearance) },
            e.customerOptions
              ? { customerOptions: { customer: e.customerOptions.customer } }
              : null
          );
        },
        Qr = function e(t, n, r, o, i, a) {
          var l = this;
          (0, u.Z)(this, e),
            (this.getElement = C(function (e) {
              var t,
                n =
                  (null != (t = e) &&
                  t.__elementType &&
                  "string" == typeof t.__elementType &&
                  "function" == typeof t
                    ? t.__elementType
                    : null) || e;
              return (
                R(n, l._betas),
                (0, g.sE)(l._elements, function (e) {
                  return e._componentName === n;
                }) || null
              );
            })),
            (this.update = C(function (e) {
              var t = (0, m.Gu)(Wr, e || {}, "elements.update()"),
                n = t.value;
              t.warnings.forEach(function (e) {
                return l._controller.warn(e);
              });
              var r = n.locale,
                o = n.appearance,
                i = void 0 === o ? void 0 : o,
                a = (0, v.jk)(r, l._betas);
              a && l._controller.action.fetchLocale({ locale: a }),
                l._elements.forEach(function (e) {
                  var t, n;
                  (t = e._implementation),
                    "function" ==
                      typeof (null === (n = t._paymentRequest) || void 0 === n
                        ? void 0
                        : n._updateLocale) &&
                      e._implementation._paymentRequest._updateLocale(a);
                }),
                (i || a) &&
                  l._controller.action.updateElementsOptions({
                    locale: a,
                    appearance: i,
                    groupId: l._id,
                  });
            })),
            (this.create = N(function (e, t) {
              var n = new at.E();
              !(function (e, t, n) {
                if ((R(e, n), O.YA[e].unique && -1 !== t.indexOf(e)))
                  throw new b.No(
                    "Can only create one Element of type ".concat(e, ".")
                  );
                var r = O.YA[e].conflict,
                  o = (0, g.dq)(t, r);
                if (o.length) {
                  var i = o[0];
                  throw new b.No(
                    "Cannot create an Element of type "
                      .concat(e, " after an Element of type ")
                      .concat(i, " has already been created.")
                  );
                }
              })(
                e,
                l._elements.map(function (e) {
                  return e._componentName;
                }),
                l._betas
              );
              var r = (0, c.Z)(
                  (0, c.Z)((0, c.Z)({}, t), l._commonOptions),
                  {},
                  { componentName: e, groupId: l._id }
                ),
                o = (r.paymentRequest, (0, d.Z)(r, ["paymentRequest"])),
                i = (h.P0 || h.JW) && (0, y.qC)(o).length > 2e3,
                a = !!l._pendingFonts || i;
              if (
                "never" !== l._commonOptions.loader &&
                !l._isLoaderFrameMounted &&
                Ln(e)
              ) {
                var u = (function (e) {
                  return (
                    tt ||
                    ((tt = e.createHiddenFrame(Be.NC.LOADER_UI_APP, {}))._on(
                      "generate-loader-ui",
                      function (e) {
                        tt.send({
                          action: "generate-loader-ui",
                          payload: { data: e },
                        });
                      }
                    ),
                    tt._on("get-element-loader-ui", function (e) {
                      tt.send({
                        action: "get-element-loader-ui",
                        payload: { data: e },
                      });
                    }),
                    tt)
                  );
                })(l._controller);
                u._emit("generate-loader-ui", {
                  rawAppearanceConfig: l._commonOptions.appearance,
                }),
                  (l._isLoaderFrameMounted = !0);
              }
              var p = new Jr(
                (0, c.Z)(
                  (0, c.Z)({ publicOptions: t }, l._commonOptions),
                  {},
                  {
                    componentName: e,
                    groupId: l._id,
                    fonts: i ? null : l._commonOptions.fonts,
                    controller: l._controller,
                    wait: a,
                    mids: l._mids,
                  }
                ),
                l._listenerRegistry,
                (0, c.Z)((0, c.Z)({}, l._timings), {}, { createTimestamp: n })
              );
              return (
                (l._elements = [].concat((0, s.Z)(l._elements), [p])),
                p._on("destroy", function () {
                  l._elements = l._elements.filter(function (t) {
                    return t._componentName !== e;
                  });
                }),
                i &&
                  p._implementation.update({ fonts: l._commonOptions.fonts }),
                p
              );
            })),
            (this.fetchUpdates = I(function () {
              if (l._commonOptions.clientSecret)
                return l._controller.action
                  .fetchUpdates({
                    clientSecret: l._commonOptions.clientSecret,
                    customerOptions: l._customerOptions,
                    locale: l._commonOptions.locale,
                    groupId: l._id,
                  })
                  .then(function (e) {
                    if ("error" === (null == e ? void 0 : e.type)) {
                      var t = e.error,
                        n = t.message,
                        r = t.extra_fields;
                      return (null == r ? void 0 : r.status)
                        ? { error: { message: n, status: r.status } }
                        : { error: { message: n } };
                    }
                    return {};
                  });
              throw new b.No(
                'In order to call fetchUpdates, you must pass a valid PaymentIntent or SetupIntent client secret when creating the Elements group.\n\n  e.g. stripe.elements({clientSecret: "{{CLIENT_SECRET}}"})'
              );
            }));
          var p = new at.E(),
            w = (0, m.Gu)(
              (function (e) {
                var t = {
                  locale: (0, m.jt)(m.Z_),
                  fonts: (0, m.jt)((0, m.CT)(m.Ry)),
                  appearance: (0, m.jt)(m.Ry),
                  clientSecret: (0, m.jt)(kn.Eu),
                  loader: (0, m.jt)((0, m.kw)("auto", "always", "never")),
                  externalPaymentMethodTypes: (0, m.jt)(wn.iU),
                };
                return (0, v.uN)(e, v.M4.elements_customers_beta_1)
                  ? (0, m.mC)(
                      (0, c.Z)(
                        (0, c.Z)({}, t),
                        {},
                        {
                          customerOptions: (0, m.jt)(
                            (0, m.mC)({ customer: m.Z_, ephemeralKey: m.Z_ })
                          ),
                        }
                      )
                    )
                  : (0, m.mC)(t);
              })(o),
              a || {},
              "elements()"
            ),
            k = w.value;
          w.warnings.forEach(function (e) {
            return t.warn(e);
          }),
            (0, _.BO)(t.warn),
            t.report("elements", { options: Xr(k) }),
            k.loader || (k.loader = "auto");
          var E = k.fonts,
            P = void 0 === E ? [] : E,
            A = k.locale,
            T = k.customerOptions,
            M = void 0 === T ? null : T,
            j = (0, d.Z)(k, ["fonts", "locale", "customerOptions"]);
          this._customerOptions = M;
          var Z = k.appearance ? k.appearance : {};
          (this._elements = []),
            (this._id = (0, f.To)("elements")),
            (this._timings = (0, c.Z)(
              (0, c.Z)({}, r),
              {},
              { groupCreateTimestamp: p }
            )),
            (this._controller = t),
            (this._betas = o),
            (this._listenerRegistry = n),
            (this._mids = i),
            (this._isLoaderFrameMounted = !1);
          var x = (0, v.jk)(A, o);
          this._controller.action.fetchLocale({ locale: x || "auto" });
          var L = P.filter(function (e) {
              return !e.cssSrc || "string" != typeof e.cssSrc;
            }).map(function (e) {
              return (0,
              c.Z)((0, c.Z)({}, e), {}, { __resolveFontRelativeTo: window.location.href });
            }),
            D = P.map(function (e) {
              return e.cssSrc;
            })
              .reduce(function (e, t) {
                return "string" == typeof t ? [].concat((0, s.Z)(e), [t]) : e;
              }, [])
              .map(function (e) {
                return (0, y.sD)(e) ? e : (0, y.v_)(window.location.href, e);
              });
          return (
            (this._pendingFonts = D.length),
            ((0, v.uN)(o, v.M4.payment_element_beta_1) && !j.clientSecret) ||
              t.action.setupStoreForElementsGroup({
                clientSecret: j.clientSecret,
                customerOptions: M,
                loader: k.loader,
                locale: A,
                appearance: Z,
                groupId: this._id,
                externalPaymentMethodTypes: j.externalPaymentMethodTypes,
              }),
            (this._commonOptions = (0, c.Z)(
              (0, c.Z)({}, j),
              {},
              { betas: o, appearance: Z, locale: x, fonts: L }
            )),
            D.forEach(function (e) {
              if ("string" == typeof e) {
                var t = new at.E();
                S(e)
                  .then(function (n) {
                    l._controller.report("font.loaded", {
                      load_time: t.getElapsedTime(),
                      font_count: n.length,
                      css_src: e,
                    });
                    var r = n.map(function (t) {
                      return (0,
                      c.Z)((0, c.Z)({}, t), {}, { __resolveFontRelativeTo: e });
                    });
                    l._controller.action.updateCSSFonts({
                      fonts: r,
                      groupId: l._id,
                    }),
                      (l._commonOptions = (0, c.Z)(
                        (0, c.Z)({}, l._commonOptions),
                        {},
                        {
                          fonts: [].concat(
                            (0, s.Z)(
                              l._commonOptions.fonts
                                ? l._commonOptions.fonts
                                : []
                            ),
                            (0, s.Z)(r)
                          ),
                        }
                      ));
                  })
                  .catch(function (n) {
                    l._controller.report("error.font.not_loaded", {
                      load_time: t.getElapsedTime(),
                      message: n && n.message && n.message,
                      css_src: e,
                    }),
                      l._controller.warn(
                        "Failed to load CSS file at ".concat(e, ".")
                      );
                  });
              }
            }),
            this
          );
        },
        $r = function (e, t, n, r, o, i, a) {
          return new ut({
            controller: e,
            authentication: t,
            mids: n,
            rawOptions: r,
            betas: o,
            queryStrategyOverride: i,
            listenerRegistry: a,
          });
        },
        eo = (0, m.mC)({
          name: (0, m.kw)(
            "react-stripe-js",
            "stripe-js",
            "react-stripe-elements"
          ),
          version: (0, m.AG)(m.Z_),
          startTime: (0, m.jt)(m.Rx),
        }),
        to = (0, m.ci)({
          name: (0, m.ui)(1, 30),
          partner_id: (0, m.jt)((0, m.xe)("pp_partner_")),
          version: (0, m.jt)((0, m.ui)(5, 15)),
          url: (0, m.jt)((0, m.ui)(4, 60)),
        }),
        no = e(248),
        ro = {
          border: "none",
          margin: "0",
          padding: "0",
          width: "1px",
          "min-width": "100%",
          overflow: "hidden",
          display: "block",
          "user-select": "none",
          transform: "translate(0)",
          "color-scheme": "only light",
        },
        oo = (function (e) {
          function n(e) {
            var t;
            return (
              (0, u.Z)(this, n),
              (t = r.call(this, e)),
              h.s$ &&
                t._listenerRegistry.addEventListener(
                  document,
                  "transitionstart",
                  function (e) {
                    switch (e.propertyName) {
                      case "opacity":
                      case "transform":
                      case "visibility":
                        var n = e.target;
                        t._isMounted() &&
                          n.contains(t._iframe) &&
                          t._forceRepaint();
                    }
                  },
                  { passive: !0 }
                ),
              t
            );
          }
          (0, x.Z)(n, e);
          var r = (0, L.Z)(n);
          return (
            (0, l.Z)(n, [
              {
                key: "update",
                value: function (e) {
                  this.send({ action: "stripe-user-update", payload: e });
                },
              },
              {
                key: "updateStyle",
                value: function (e) {
                  var t = this;
                  Object.keys(e).forEach(function (n) {
                    t._iframe.style[n] = e[n];
                  });
                },
              },
              {
                key: "focus",
                value: function () {
                  this.loaded &&
                    (h.s$
                      ? this._iframe.focus()
                      : this.send({
                          action: "stripe-user-focus",
                          payload: {},
                        }));
                },
              },
              {
                key: "blur",
                value: function () {
                  this.loaded &&
                    (this._iframe.contentWindow.blur(),
                    this._iframe.blur(),
                    document.activeElement === this._iframe &&
                      (window.focus(),
                      document.activeElement &&
                        "function" == typeof document.activeElement.blur &&
                        document.activeElement.blur()));
                },
              },
              {
                key: "clear",
                value: function () {
                  this.send({ action: "stripe-user-clear", payload: {} });
                },
              },
              {
                key: "collapse",
                value: function () {
                  this.send({ action: "stripe-user-collapse", payload: {} });
                },
              },
              {
                key: "show",
                value: function () {
                  this.send({ action: "stripe-user-show", payload: {} });
                },
              },
              {
                key: "hide",
                value: function () {
                  this.send({ action: "stripe-user-hide", payload: {} });
                },
              },
              {
                key: "addLineItem",
                value: function (e) {
                  this.send({
                    action: "stripe-user-add-line-item",
                    payload: e,
                  });
                },
              },
              {
                key: "cancelCheckout",
                value: function (e) {
                  this.send({
                    action: "stripe-user-cancel-checkout",
                    payload: { errorMessage: e },
                  });
                },
              },
              {
                key: "_createIFrame",
                value: function (e, r, o) {
                  var i = t((0, Mt.Z)(n.prototype), "_createIFrame", this).call(
                    this,
                    e,
                    r,
                    o
                  );
                  return (
                    i.setAttribute("title", "Secure payment input frame"),
                    (0, _.yq)(i, ro),
                    i
                  );
                },
              },
              {
                key: "_forceRepaint",
                value: function () {
                  var e = this._iframe,
                    t = e.style.display;
                  e.style.display = "none";
                  var n = e.offsetHeight;
                  return (e.style.display = t), n;
                },
              },
            ]),
            n
          );
        })(Rt),
        io = oo,
        ao = {
          position: "absolute",
          left: "0",
          top: "0",
          height: "100%",
          width: "100%",
        },
        co = (function (e) {
          function n(e) {
            var o,
              i,
              a,
              c = e.type,
              s = e.controllerId,
              l = e.listenerRegistry,
              p = e.options;
            return (
              (0, u.Z)(this, n),
              ((a = r.call(this, {
                type: c,
                controllerId: s,
                listenerRegistry: l,
                appParams: p,
              }))._autoMount = function () {
                a.appendTo(a._backdrop.domElement), a._backdrop.mount();
              }),
              (a.show = function () {
                a._backdrop.show(),
                  (0, _.yq)(a._iframe, ao),
                  (a.isVisible = !0);
              }),
              (a.fadeInBackdrop = function () {
                a._backdrop.fadeIn();
              }),
              (a._backdropFadeoutPromise = null),
              (a.fadeOutBackdrop = function () {
                return (
                  a._backdropFadeoutPromise ||
                    (a._backdropFadeoutPromise = a._backdrop.fadeOut()),
                  a._backdropFadeoutPromise.then(function () {
                    a._backdropFadeoutPromise = null;
                  })
                );
              }),
              (a.destroy = function () {
                var e =
                    arguments.length > 0 &&
                    void 0 !== arguments[0] &&
                    arguments[0],
                  r = a.fadeOutBackdrop().then(function () {
                    a._backdrop.unmount(),
                      e ||
                        t(
                          ((o = (0, Z.Z)(a)), (0, Mt.Z)(n.prototype)),
                          "destroy",
                          o
                        ).call(o);
                  });
                return (
                  e &&
                    t(
                      ((i = (0, Z.Z)(a)), (0, Mt.Z)(n.prototype)),
                      "destroy",
                      i
                    ).call(i),
                  (a.isVisible = !1),
                  r
                );
              }),
              (a._backdrop = new Ue({
                lockScrolling: !0,
                lockFocus: !0,
                lockFocusOn: a._iframe,
                listenerRegistry: l,
              })),
              a._autoMount(),
              (a.isVisible = !1),
              a
            );
          }
          (0, x.Z)(n, e);
          var r = (0, L.Z)(n);
          return n;
        })(Rt),
        so = co,
        uo = {
          display: "block",
          position: "absolute",
          "z-index": "1000",
          width: "1px",
          "min-width": "100%",
          margin: "2px 0 0 0",
          padding: "0",
          border: "none",
          overflow: "hidden",
        },
        lo = (function (e) {
          function n() {
            return (0, u.Z)(this, n), r.apply(this, arguments);
          }
          (0, x.Z)(n, e);
          var r = (0, L.Z)(n);
          return (
            (0, l.Z)(n, [
              {
                key: "updateStyle",
                value: function (e) {
                  var t = this;
                  Object.keys(e).forEach(function (n) {
                    t._iframe.style[n] = e[n];
                  });
                },
              },
              {
                key: "update",
                value: function (e) {
                  this.send({ action: "stripe-user-update", payload: e });
                },
              },
              {
                key: "_createIFrame",
                value: function (e, r, o) {
                  var i = t((0, Mt.Z)(n.prototype), "_createIFrame", this).call(
                    this,
                    e,
                    r,
                    o && "object" == typeof o
                      ? (0, c.Z)((0, c.Z)({}, o), {}, { isSecondaryFrame: !0 })
                      : o
                  );
                  return (0, _.yq)(i, uo), (i.style.height = "0"), i;
                },
              },
            ]),
            n
          );
        })(Rt),
        po = lo,
        mo = !1,
        fo = function (e) {
          mo ||
            ("null" === (null != e ? e : window.origin) &&
              ((mo = !0),
              console.error(
                "Stripe.js requires 'allow-same-origin' if sandboxed."
              )));
        },
        _o = e(6042),
        ho = "https://maps.googleapis.com/maps/api/js",
        yo =
          /^https:\/\/maps\.googleapis\.com\/maps\/api\/js\/?(\?.*)?libraries=(.*,)?places((,|&)+.*)?$/,
        vo = function (e) {
          switch (e) {
            case "INVALID_REQUEST":
            case "NOT_FOUND":
            case "OK":
            case "OVER_QUERY_LIMIT":
            case "REQUEST_DENIED":
            case "UNKNOWN_ERROR":
            case "ZERO_RESULTS":
              return e;
            default:
              return "UNKNOWN_ERROR";
          }
        },
        go = "ADDRESS_AUTOCOMPLETE_PREDICTION_RESULTS",
        bo = "ADDRESS_AUTOCOMPLETE_PLACE_DETAILS",
        wo = null,
        ko = function (e) {
          return (
            null !== wo ||
              (wo = new B.J(function (t, n) {
                if ("undefined" != typeof window)
                  if (window.google && window.google.maps.places)
                    t(window.google.maps.places);
                  else
                    try {
                      var r = (function () {
                        var e = document.querySelectorAll(
                          'script[src^="'.concat(ho, '"]')
                        );
                        for (var t in e) if (yo.test(e[t].src)) return e[t];
                        return null;
                      })();
                      r ||
                        (r = (function (e) {
                          var t = document.createElement("script");
                          return (
                            (t.src = ""
                              .concat(ho, "?key=")
                              .concat(e, "&libraries=places")),
                            (document.head || document.body).appendChild(t),
                            t
                          );
                        })(e)),
                        (r.onload = function () {
                          window.google.maps.places
                            ? t(window.google.maps.places)
                            : n(new Error("Google Maps API not available"));
                        });
                    } catch (e) {
                      n(e);
                    }
                else t(null);
              })),
            wo
          );
        },
        Eo = function (e, t, n) {
          var r = e.search,
            o = e.countryRestrictions;
          var i = function (e) {
            return {
              predictions: [],
              status: "error",
              error: {
                status: vo(e),
                message: "Google Maps returned an API error",
              },
            };
          };
          void 0 === t || Kr
            ? n.send({
                action: "google-maps-predictions",
                payload: { data: { tag: go, value: i("UNKNOWN_ERROR") } },
              })
            : (function (e, t) {
                try {
                  t();
                } catch (t) {
                  e.send({
                    action: "google-maps-predictions",
                    payload: {
                      data: {
                        tag: go,
                        value: {
                          predictions: [],
                          status: "error",
                          error: {
                            status: "UNKNOWN_ERROR",
                            message: t.message,
                          },
                        },
                      },
                    },
                  });
                }
              })(n, function () {
                var e = t.autocompleteService,
                  a = t.sessionToken;
                e.getPlacePredictions(
                  {
                    input: r,
                    sessionToken: a,
                    componentRestrictions: { country: o },
                  },
                  function (e, t) {
                    var r;
                    switch (t) {
                      case google.maps.places.PlacesServiceStatus.OK:
                        r = { predictions: e, status: "ok" };
                        break;
                      case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
                        r = { predictions: [], status: "zeroResults" };
                        break;
                      default:
                        r = i(t);
                    }
                    n.send({
                      action: "google-maps-predictions",
                      payload: { data: { tag: go, value: r } },
                    });
                  }
                );
              });
        },
        So = {
          attachLinkAccountSessionForPayment: null,
          attachLinkAccountSessionForSetup: null,
          authenticate3DS2: null,
          cancelCardImageVerificationChallenge: null,
          cancelCheckout: null,
          cancelPaymentIntentSource: null,
          cancelSetupIntentSource: null,
          clearInstantDebitsIncentive: null,
          completeLinkAccountSessionElements: null,
          completeWalletConfirm: null,
          confirmPaymentIntent: null,
          confirmReturnIntent: null,
          confirmSetupIntent: null,
          createAcssDebitSession: null,
          createApplePaySession: null,
          createBankPaymentDetails: null,
          createConsumerPaymentDetails: null,
          createEphemeralKeyNonce: null,
          createPaymentMethodWithData: null,
          createPaymentMethodWithElement: null,
          createPaymentMethodWithElements: null,
          createPaymentPage: null,
          createPaymentPageWithSession: null,
          createRadarSession: null,
          createSourceWithData: null,
          createSourceWithElement: null,
          confirmInstantDebitsIncentiveForPaymentDetails: null,
          fetchingWallets: null,
          showApplePayButton: null,
          expressCheckoutConfirmStart: null,
          expressCheckoutConfirmEnd: null,
          fetchLocale: null,
          fetchUpdates: null,
          localizeError: null,
          loginWithConsumerInfo: null,
          lookupLocale: null,
          refreshPaymentIntent: null,
          refreshSetupIntent: null,
          retrieveIssuingCard: null,
          retrieveIssuingCardWithoutNonce: null,
          retrieveOrder: null,
          retrievePaymentIntent: null,
          retrieveSetupIntent: null,
          retrieveSource: null,
          removeElementsExperimentId: null,
          fetchCartSession: null,
          getGoogleMapsPredictions: null,
          getGoogleMapsDetails: null,
          initGoogleMapsService: null,
          setupStoreForElementsGroup: null,
          showWalletIfNecessary: null,
          submitOrder: null,
          tokenizeCvcUpdate: null,
          tokenizeWithData: null,
          tokenizeWithElement: null,
          updateCSSFonts: null,
          updateElementsOptions: null,
          updateOrder: null,
          updatePaymentIntent: null,
          verifyCardImageVerificationChallenge: null,
          verifyMicrodepositsForPayment: null,
          verifyMicrodepositsForSetup: null,
          retrieveCardNetworks: null,
          isCardMetadataRequired: null,
          retrieveLinkConfig: null,
          checkForLinkClientSecret: null,
          resolveLocale: null,
        },
        Po = function (e) {
          var t = 0,
            n = [];
          return {
            acquire: function () {
              if (t < e) return t++, B.J.resolve();
              var r = new Xe();
              return n.push(r), r.promise;
            },
            release: function () {
              var r;
              (t--, n.length > 0 && t < e) &&
                (t++, null === (r = n.shift()) || void 0 === r || r.resolve());
            },
          };
        },
        Ao = !1,
        Co = {},
        No = function (e, t) {
          return (
            document.activeElement === e._iframe ||
            (e._iframe.parentElement && document.activeElement === t)
          );
        },
        Io = function (e) {
          return "object" == typeof e &&
            null !== e &&
            "IntegrationError" === e.name
            ? new b.No("string" == typeof e.message ? e.message : "")
            : e;
        },
        To = (function () {
          function e(t) {
            var n = this;
            (0, u.Z)(this, e),
              (this._sendCaReq = function (e, t) {
                var r = (0, f.To)(e),
                  o = new Xe();
                return (
                  (n._requests[r] = o),
                  n._controllerFrame.send({
                    action: "stripe-controller-action-request",
                    payload: { nonce: r, actionName: e, request: t },
                  }),
                  o.promise
                );
              }),
              (this.keyMode = function () {
                return (0, Oe.lO)(n._apiKey);
              }),
              (this.mids = function () {
                return n._getMids();
              }),
              (this.action = Object.keys(So).reduce(function (e, t) {
                return (0, c.Z)(
                  (0, c.Z)({}, e),
                  {},
                  (0, p.Z)({}, t, function (e) {
                    return n._sendCaReq(t, e);
                  })
                );
              }, {})),
              (this.createElementFrame = function (e, t, r, o) {
                var i = n._betas,
                  a = new io({
                    type: e,
                    betas: i,
                    controllerId: n._id,
                    listenerRegistry: n._listenerRegistry,
                    appParams: (0, c.Z)(
                      (0, c.Z)({}, o),
                      {},
                      {
                        componentName: t,
                        keyMode: (0, Oe.lO)(n._apiKey),
                        apiKey: n._apiKey,
                      }
                    ),
                  });
                return n._setupFrame(a, e, r);
              }),
              (this.createSecondaryElementFrame = function (e, t, r, o, i) {
                var a = n._betas,
                  s = new po({
                    type: e,
                    betas: a,
                    controllerId: n._id,
                    listenerRegistry: n._listenerRegistry,
                    appParams: (0, c.Z)(
                      (0, c.Z)({}, i),
                      {},
                      {
                        componentName: t,
                        primaryElementType: r,
                        keyMode: (0, Oe.lO)(n._apiKey),
                      }
                    ),
                  });
                return n._setupFrame(s, e, o);
              }),
              (this.createHiddenFrame = function (e, t) {
                var r = new xt({
                  type: e,
                  betas: n._betas,
                  controllerId: n._id,
                  listenerRegistry: n._listenerRegistry,
                  appParams: t,
                });
                return n._setupFrame(r, e);
              }),
              (this.getCredentials = function () {
                return {
                  publishableKey: n._apiKey,
                  stripeAccount: n._stripeAccount,
                  apiVersion: n._apiVersion,
                };
              }),
              (this.createLightboxFrame = function (e) {
                var t = e.type,
                  r = e.options,
                  o = new so({
                    type: t,
                    controllerId: n._id,
                    listenerRegistry: n._listenerRegistry,
                    options: (0, c.Z)((0, c.Z)({}, r), {}, { betas: n._betas }),
                  }),
                  i = "LINK_AUTOFILL_MODAL" === e.type ? e.groupId : null;
                return n._setupFrame(o, t, i);
              }),
              (this._setupFrame = function (e, t, r) {
                return (
                  (n._frames[e.id] = e),
                  n._controllerFrame.sendPersistent({
                    action: "stripe-user-createframe",
                    payload: { newFrameId: e.id, frameType: t, groupId: r },
                  }),
                  e._on("unload", function () {
                    n._controllerFrame.sendPersistent({
                      action: "stripe-frame-unload",
                      payload: { unloadedFrameId: e.id },
                    });
                  }),
                  e._on("destroy", function () {
                    delete n._frames[e.id],
                      n._controllerFrame.sendPersistent({
                        action: "stripe-frame-destroy",
                        payload: { destroyedFrameId: e.id },
                      });
                  }),
                  e._on("load", function () {
                    n._controllerFrame.sendPersistent({
                      action: "stripe-frame-load",
                      payload: { loadedFrameId: e.id },
                    }),
                      n._controllerFrame.loaded &&
                        e.send({
                          action: "stripe-controller-load",
                          payload: {},
                        });
                  }),
                  e
                );
              }),
              (this.report = function (e) {
                var t =
                  arguments.length > 1 && void 0 !== arguments[1]
                    ? arguments[1]
                    : {};
                n._controllerFrame.send({
                  action: "stripe-controller-report",
                  payload: { event: e, data: t },
                });
              }),
              (this.warn = function () {
                for (
                  var e = arguments.length, t = new Array(e), r = 0;
                  r < e;
                  r++
                )
                  t[r] = arguments[r];
                n._controllerFrame.send({
                  action: "stripe-controller-warn",
                  payload: { args: t },
                });
              }),
              (this.controllerFor = function () {
                return "outer";
              }),
              (this._setupPostMessage = function () {
                n._listenerRegistry.addEventListener(
                  window,
                  "message",
                  function (e) {
                    var t = e.data,
                      r = e.origin,
                      o = e.source,
                      i = (0, Be.$G)(t);
                    i && ((0, y.uW)(k.jQ, r) ? n._handleMessage(i, o) : fo(r));
                  }
                );
              }),
              (this._nodeIsKnownElement = function (e) {
                return (
                  e &&
                  "IFRAME" === e.nodeName &&
                  !!n._frames[e.getAttribute("name") || ""]
                );
              }),
              (this._handleMessage = function (e, t) {
                var r = e.controllerId,
                  o = e.frameId,
                  i = e.message,
                  a = n._frames[o];
                if (r === n._id)
                  switch (i.action) {
                    case "stripe-frame-event":
                      var s = i.payload.event,
                        u = i.payload.data;
                      if (a) {
                        if (h.Ah) {
                          var l = a._iframe.parentElement,
                            p = l && l.querySelector(".".concat(ht.Kb));
                          if (
                            "focus" === s &&
                            !Ao &&
                            p &&
                            !No(a, p) &&
                            !Co[o]
                          ) {
                            p.focus(),
                              (Ao = !0),
                              (Co[o] = !0),
                              setTimeout(function () {
                                Co[o] = !1;
                              }, 1e3);
                            break;
                          }
                          if ("blur" === s && Ao) {
                            Ao = !1;
                            break;
                          }
                          "blur" === s &&
                            h.Gx &&
                            setTimeout(function () {
                              var e = document.activeElement;
                              if (
                                e &&
                                !No(a, p) &&
                                !(0, _.a0)(e) &&
                                !n._nodeIsKnownElement(e)
                              ) {
                                var t = l && l.querySelector(".".concat(ht.tk));
                                if (t) {
                                  var r = t;
                                  (r.disabled = !1),
                                    r.focus(),
                                    r.blur(),
                                    (r.disabled = !0);
                                }
                                e.focus();
                              }
                            }, 400);
                        }
                        "load" === s &&
                          (u = (0, c.Z)((0, c.Z)({}, u), {}, { source: t })),
                          a._emit(s, u);
                      }
                      break;
                    case "stripe-frame-action-response":
                      a && a.resolve(i.payload.nonce, i.payload.faRes);
                      break;
                    case "stripe-frame-action-error":
                      a && a.reject(i.payload.nonce, Io(i.payload.faErr));
                      break;
                    case "stripe-frame-error":
                      throw new b.No(i.payload.message);
                    case "stripe-integration-error":
                      a &&
                        a._emit("__privateIntegrationError", {
                          message: i.payload.message,
                        });
                      break;
                    case "stripe-controller-load":
                      n._controllerFrame._emit("load", { source: t }),
                        n._loadCount++,
                        Object.keys(n._frames).forEach(function (e) {
                          return n._frames[e].send({
                            action: "stripe-controller-load",
                            payload: {},
                          });
                        });
                      var d = n._createTimestamp.getAsPosixTime(),
                        m = {
                          stripeJsLoad:
                            n._stripeJsLoadTimestamp.getAsPosixTime(),
                          stripeCreate: d,
                          create: d,
                        };
                      n._mountTimestamp &&
                        (m.mount = n._mountTimestamp.getAsPosixTime()),
                        n._controllerFrame.send({
                          action: "stripe-user-mount",
                          payload: {
                            timestamps: m,
                            loadCount: n._loadCount,
                            matchFrame:
                              t === n._controllerFrame._iframe.contentWindow,
                            rtl: !1,
                            paymentRequestButtonType: null,
                          },
                        });
                      break;
                    case "stripe-controller-local-storage-acquire-request":
                      var f = i.payload.nonce;
                      n._innerLocalStorageSemaphore.acquire().then(function () {
                        n._controllerFrame.send({
                          action:
                            "stripe-controller-local-storage-acquire-response",
                          payload: { nonce: f },
                        });
                      });
                      break;
                    case "stripe-controller-local-storage-release":
                      n._innerLocalStorageSemaphore.release();
                      break;
                    case "stripe-controller-action-response":
                      n._requests[i.payload.nonce] &&
                        n._requests[i.payload.nonce].resolve(
                          i.payload.response
                        );
                      break;
                    case "stripe-controller-action-error":
                      n._requests[i.payload.nonce] &&
                        n._requests[i.payload.nonce].reject(
                          Io(i.payload.error)
                        );
                      break;
                    case "stripe-api-call":
                      Wt();
                      break;
                    case "show-wallet":
                      var y = n._frames[i.payload.frameId];
                      y && y._emit("show-wallet", i.payload.wallet);
                      break;
                    case "show-bacs-mandate-confirmation":
                      var v = n.createLightboxFrame({
                        type: Be.NC.BACS_MANDATE_CONFIRMATION_APP,
                        options: { locale: n._locale || "en" },
                      });
                      v._on("load", function () {
                        v.show(), v.fadeInBackdrop();
                      }),
                        v._once("request-close", function () {
                          (0, _o.G)(v).then(function () {});
                        });
                      break;
                    case "init-google-maps-service":
                      ko(i.payload.apiKey).then(function (e) {
                        null !== e &&
                          (n._googleMapsService = (function (e) {
                            var t = window.gm_authFailure;
                            window.gm_authFailure = function () {
                              t && t(), (Kr = !0);
                            };
                            var n = new e.AutocompleteService(),
                              r = new e.AutocompleteSessionToken(),
                              o = document.createElement("div");
                            return {
                              autocompleteService: n,
                              sessionToken: r,
                              placeService: new e.PlacesService(o),
                            };
                          })(e));
                      });
                      break;
                    case "get-google-maps-predictions":
                      i.payload.frameId &&
                        Eo(
                          i.payload.data,
                          n._googleMapsService,
                          n._frames[i.payload.frameId]
                        );
                      break;
                    case "get-google-maps-details":
                      i.payload.frameId &&
                        (function (e, t, n) {
                          var r = e.placeId,
                            o = function (e) {
                              return {
                                error: {
                                  status: vo(e),
                                  message: "Google Maps returned an API error",
                                },
                              };
                            };
                          if (void 0 !== t) {
                            var i = t.placeService,
                              a = t.sessionToken;
                            i.getDetails(
                              {
                                placeId: r,
                                sessionToken: a,
                                fields: ["address_components"],
                              },
                              function (e, t) {
                                var r;
                                (r =
                                  t !==
                                  google.maps.places.PlacesServiceStatus.OK
                                    ? o(t)
                                    : { place: e }),
                                  n.send({
                                    action: "google-maps-details",
                                    payload: { data: { tag: bo, value: r } },
                                  });
                              }
                            );
                          } else
                            n.send({
                              action: "google-maps-details",
                              payload: {
                                data: { tag: bo, value: o("UNKNOWN_ERROR") },
                              },
                            });
                        })(
                          i.payload.data,
                          n._googleMapsService,
                          n._frames[i.payload.frameId]
                        );
                  }
              });
            var r = t.listenerRegistry,
              o = t.stripeJsLoadTimestamp,
              i = t.stripeCreateTimestamp,
              a = t.onFirstLoad,
              s = t.betas,
              l = t.mids,
              m = t.innerLocalStorageSemaphore,
              v = (0, d.Z)(t, [
                "listenerRegistry",
                "stripeJsLoadTimestamp",
                "stripeCreateTimestamp",
                "onFirstLoad",
                "betas",
                "mids",
                "innerLocalStorageSemaphore",
              ]),
              g = v.apiKey,
              w = v.apiVersion,
              E = v.stripeAccount,
              S = v.stripeJsId,
              P = v.locale;
            (this._id = (0, f.To)("__privateStripeController")),
              (this._innerLocalStorageSemaphore = m || Po(1)),
              (this._stripeJsId = S),
              (this._apiKey = g),
              (this._apiVersion = w),
              (this._stripeAccount = E),
              (this._listenerRegistry = r),
              (this._betas = s),
              (this._locale = P),
              (this._getMids =
                l ||
                function () {
                  return null;
                }),
              (this._controllerFrame = new Dt({
                type: Be.NC.CONTROLLER,
                betas: s,
                controllerId: this._id,
                listenerRegistry: r,
                appParams: (0, c.Z)(
                  (0, c.Z)({}, v),
                  {},
                  { betas: s, stripeJsLoadTime: o.getAsPosixTime() }
                ),
              })),
              (this._stripeJsLoadTimestamp = o),
              (this._createTimestamp = i),
              (this._loadCount = 0);
            var A = function (e) {
              var t = e.anchor;
              (n._mountTimestamp = new at.E()),
                t !== document.body &&
                  n.report("controller.mount.custom_container");
            };
            this._controllerFrame._isMounted()
              ? A({ anchor: this._controllerFrame._iframe.parentElement })
              : this._controllerFrame._once("mount", A),
              a && this._controllerFrame._once("load", a),
              (this._frames = {}),
              (this._requests = {}),
              this._setupPostMessage(),
              (this._handleMessage = N(this._handleMessage, this)),
              this.action.fetchLocale({ locale: P || "auto" });
          }
          return (
            (0, l.Z)(e, [
              {
                key: "registerWrapper",
                value: function (e) {
                  this._controllerFrame.send({
                    action: "stripe-wrapper-register",
                    payload: { stripeWrapperLibrary: e },
                  });
                },
              },
              {
                key: "registerAppInfo",
                value: function (e) {
                  this._controllerFrame.send({
                    action: "stripe-app-info-register",
                    payload: { wrapperLibrary: e },
                  });
                },
              },
            ]),
            e
          );
        })(),
        Mo = To,
        jo = ["elements", "createToken", "createPaymentMethod"],
        Oo = ["elements", "createSource", "createToken", "createPaymentMethod"],
        Ro = (function () {
          function e(t) {
            var n = this;
            (0, u.Z)(this, e),
              (this._gets = []),
              (this._didDetect = !1),
              (this._onDetection = function (e) {
                (n._didDetect = !0), t(e);
              }),
              window.Stripe &&
                window.Stripe.__cachedInstances &&
                this._onDetection("react-stripe-elements");
          }
          return (
            (0, l.Z)(e, [
              {
                key: "got",
                value: function (e) {
                  this._didDetect ||
                    ("elements" === e
                      ? (this._gets = ["elements"])
                      : this._gets.push(e),
                    this._checkForWrapper());
                },
              },
              {
                key: "called",
                value: function (e) {
                  this._didDetect ||
                    (this._gets = this._gets.filter(function (t) {
                      return t !== e;
                    }));
                },
              },
              {
                key: "_checkForWrapper",
                value: function () {
                  (0, g.Xy)(this._gets, jo)
                    ? this._onDetection("react-stripe-js")
                    : (0, g.Xy)(this._gets, Oo) &&
                      this._onDetection("react-stripe-elements");
                },
              },
            ]),
            e
          );
        })(),
        Zo = function (e) {
          if (!e || "object" != typeof e) return null;
          var t = e.type;
          return {
            type: "string" == typeof t ? t : null,
            data: (0, d.Z)(e, ["type"]),
          };
        },
        xo = function (e) {
          switch (e.type) {
            case "object":
              return { source: e.object };
            case "error":
              return { error: e.error };
            default:
              return (0, m.Rz)(e);
          }
        },
        Lo = {
          source: (0, m.mC)({
            id: (0, m.xe)("src_"),
            client_secret: (0, m.xe)("src_client_secret_"),
          }),
        },
        Do = (0, m.mC)(Lo),
        Bo = function (e) {
          switch (e.type) {
            case "object":
              return { paymentMethod: e.object };
            case "error":
              return { error: e.error };
            default:
              return (0, m.Rz)(e);
          }
        },
        qo = function (e, t, n, r, o, i) {
          if ("string" == typeof r)
            return (function (e, t, n, r, o) {
              var i = (0, m.rX)(r),
                a = Zo(i ? o : r),
                c = a || { type: null, data: {} },
                s = c.type,
                u = c.data;
              if (s && n !== s)
                return B.J.reject(
                  new b.No(
                    "The type supplied in payment_method_data is not consistent."
                  )
                );
              if (i) {
                var l = i._implementation._frame.id,
                  p = i._componentName;
                return e.action
                  .createPaymentMethodWithElement({
                    frameId: l,
                    elementName: p,
                    type: n,
                    paymentMethodData: u,
                    mids: t,
                  })
                  .then(Bo);
              }
              return a
                ? e.action
                    .createPaymentMethodWithData({
                      elementName: null,
                      type: n,
                      paymentMethodData: u,
                      mids: t,
                    })
                    .then(Bo)
                : B.J.reject(
                    new b.No(
                      "Please provide either an Element or PaymentMethod creation parameters to createPaymentMethod."
                    )
                  );
            })(e, t, r, o, i);
          try {
            var a = (function (e, t) {
                return (0, m.Gu)((0, bn.q2)(null, t), e, "createPaymentMethod")
                  .value;
              })(r, n),
              c = a.element,
              s = a.elements,
              u = a.type,
              l = a.data,
              p = (0, v.uN)(n, v.M4.elements_enable_deferred_intent_beta_1);
            if (c) {
              var d = c._implementation._frame.id,
                f = c._componentName;
              return e.action
                .createPaymentMethodWithElement({
                  frameId: d,
                  elementName: f,
                  type: u,
                  paymentMethodData: l,
                  mids: t,
                })
                .then(Bo);
            }
            if (p && s) {
              var _ = s._id;
              return e.action
                .createPaymentMethodWithElements({
                  groupId: _,
                  elements: s._elements,
                  paymentMethodData: l,
                  mids: t,
                })
                .then(Bo);
            }
            if (u)
              return e.action
                .createPaymentMethodWithData({
                  elementName: null,
                  type: u,
                  paymentMethodData: l,
                  mids: t,
                })
                .then(Bo);
            throw new Error("No type or elements provided");
          } catch (e) {
            return B.J.reject(e);
          }
        },
        Fo = e(1849),
        Uo = e(6977),
        Go = e(4167),
        Yo = e(112),
        zo = {
          clientSecret: (0, m.jt)(m.Z_),
          params: (0, m.jt)(m.Ry),
          elements: (0, m.jt)(m.Ry),
        },
        Ho = function (e, t) {
          var n = e.rawSecret,
            r = e.rawElements,
            o = e.validatedUpdateParams;
          if (
            ((function (e, t) {
              var n = e.rawSecret,
                r = e.rawElements;
              if (n && r)
                throw new b.No(
                  "".concat(
                    t,
                    ": expected either `elements` or `clientSecret`, but not both."
                  )
                );
              if (!n && !r)
                throw new b.No(
                  "".concat(
                    t,
                    ": expected either `elements` or `clientSecret`, but got neither."
                  )
                );
            })({ rawSecret: n, rawElements: r }, t),
            n)
          ) {
            if (
              (null == o ? void 0 : o.payment_method) &&
              (null == o ? void 0 : o.payment_method_data)
            )
              throw new b.No(
                "".concat(
                  t,
                  ": Expected either `payment_method` or `payment_method_data`, but not both."
                )
              );
            return { type: "clientSecret", clientSecret: n };
          }
          var i = (0, m.MO)(r);
          if (!i)
            throw new b.No(
              "Invalid value for "
                .concat(
                  t,
                  ": elements should be an Elements group. You specified: "
                )
                .concat(typeof r, ".")
            );
          return { type: "elements", elements: i };
        },
        Ko = function (e, t, n, r, o) {
          var i,
            a,
            s = (function (e) {
              var t = e.rawUpdateData,
                n = e.controller,
                r = e.errorMessageMethodName,
                o = (0, m.Gu)((0, m.mC)(zo), t, r),
                i = o.value,
                a = i.elements,
                c = void 0 === a ? void 0 : a,
                s = i.params,
                u = i.clientSecret,
                l = o.warnings,
                p = (0, m.Gu)(
                  (0, m.jt)(
                    (0, m.mC)({
                      payment_method: (0, m.jt)(m.Z_),
                      payment_method_data: (0, m.jt)(m.Ry),
                      payment_method_options: (0, m.jt)(m.Ry),
                      setup_future_usage: (0, m.jt)(m.Xg),
                    })
                  ),
                  s,
                  r,
                  { path: ["params"] }
                ).value,
                d = Ho(
                  { rawSecret: u, rawElements: c, validatedUpdateParams: p },
                  r
                );
              return (
                l.forEach(function (e) {
                  return n.warn(e);
                }),
                {
                  validatedUpdateParams: p,
                  rawUpdateParams: s,
                  validatedParams: d,
                }
              );
            })({ rawUpdateData: n, controller: e, errorMessageMethodName: o }),
            u = s.validatedParams,
            l = s.validatedUpdateParams,
            p = s.rawUpdateParams,
            f = null != p ? p : {},
            _ =
              (f.payment_method,
              f.payment_method_data,
              f.payment_method_options,
              (0, d.Z)(f, [
                "payment_method",
                "payment_method_data",
                "payment_method_options",
              ]));
          return "elements" === u.type
            ? {
                mode: {
                  tag: "elements",
                  groupId: u.elements._id,
                  data:
                    null !== (i = null == l ? void 0 : l.payment_method_data) &&
                    void 0 !== i
                      ? i
                      : {},
                  options:
                    null !==
                      (a = null == l ? void 0 : l.payment_method_options) &&
                    void 0 !== a
                      ? a
                      : {},
                },
                otherParams: _,
                expectedType: null,
                mids: t,
                options: null,
              }
            : (function (e) {
                var t,
                  n = e.validatedParams,
                  r = e.validatedConfirmParams,
                  o = e.otherParams,
                  i = e.intentType,
                  a = e.mids,
                  s = null != r ? r : {},
                  u = s.payment_method_data,
                  l = s.payment_method,
                  p = s.payment_method_options,
                  d =
                    "payment" === i
                      ? (0, Vn.cn)(n.clientSecret, "confirmPayment")
                      : (0, Vn.jH)(n.clientSecret, "confirmSetup"),
                  m = (0, Vn.k7)({ payment_method: u }),
                  f = {};
                return (
                  "paymentMethod" ===
                    (t =
                      u && m
                        ? {
                            intentSecret: d,
                            tag: "paymentMethod-from-data",
                            type: m,
                            data: u,
                            options: null != p ? p : {},
                          }
                        : l
                        ? {
                            intentSecret: d,
                            tag: "paymentMethod",
                            paymentMethod: l,
                            options: null != p ? p : {},
                          }
                        : { intentSecret: d, tag: "none" }).tag &&
                    (f = {
                      mandate_data: {
                        customer_acceptance: {
                          type: "online",
                          online: { infer_from_client: !0 },
                        },
                      },
                    }),
                  {
                    mids: a,
                    mode: t,
                    expectedType: m,
                    otherParams: (0, c.Z)((0, c.Z)({}, f), o),
                    options: { handleActions: !1 },
                  }
                );
              })({
                validatedParams: u,
                validatedConfirmParams: l,
                otherParams: _,
                intentType: r,
                mids: t,
              });
        },
        Jo = function (e, t) {
          return function (n, r, o, i, a) {
            var s = (0, Vn.cn)(o, e),
              u = (0, Vn.o1)(t, e, i, s),
              l = (0, Vn.el)(e, a),
              p = "none" === u.mode.tag,
              d = n.action.confirmPaymentIntent(
                (0, c.Z)(
                  (0, c.Z)({}, u),
                  {},
                  { expectedType: t, options: l, mids: r }
                )
              );
            return l.handleActions
              ? d.then((0, Go.nq)(n, p, !1, !1, u.otherParams.expand))
              : d.then(Uo.PA);
          };
        },
        Wo = Jo("confirmAcssDebitPayment", no.GS.acss_debit),
        Vo = Jo("confirmAffirmPayment", no.GS.affirm),
        Xo = Jo("confirmAfterpayClearpayPayment", no.GS.afterpay_clearpay),
        Qo = Jo("confirmAuBecsDebitPayment", no.GS.au_becs_debit),
        $o = Jo("confirmBacsDebitPayment", no.GS.bacs_debit),
        ei = Jo("confirmBancontactPayment", no.GS.bancontact),
        ti = Jo("confirmBoletoPayment", no.GS.boleto),
        ni = Jo("confirmCardPayment", no.GS.card),
        ri = Jo("confirmEpsPayment", no.GS.eps),
        oi = Jo("confirmFpxPayment", no.GS.fpx),
        ii = Jo("confirmGiropayPayment", no.GS.giropay),
        ai = Jo("confirmGrabPayPayment", no.GS.grabpay),
        ci = Jo("confirmIdealPayment", no.GS.ideal),
        si = Jo("confirmKlarnaPayment", no.GS.klarna),
        ui = Jo("confirmKonbiniPayment", no.GS.konbini),
        li = Jo("confirmMobilepayPayment", no.GS.mobilepay),
        pi = Jo("confirmOxxoPayment", no.GS.oxxo),
        di = Jo("confirmAlipayPayment", no.GS.alipay),
        mi = Jo("confirmP24Payment", no.GS.p24),
        fi = Jo("confirmPayByBankPayment", no.GS.pay_by_bank),
        _i = Jo("confirmPayPalPayment", no.GS.paypal),
        hi = Jo("confirmSepaDebitPayment", no.GS.sepa_debit),
        yi = Jo("confirmSofortPayment", no.GS.sofort),
        vi = Jo("confirmIdBankTransferPayment", no.GS.id_bank_transfer),
        gi = Jo("confirmUpiPayment", no.GS.upi),
        bi = Jo("confirmUsBankAccountPayment", no.GS.us_bank_account),
        wi = Jo("confirmNzBankAccountPayment", no.GS.nz_bank_account),
        ki = Jo("confirmBlikPayment", no.GS.blik),
        Ei = Jo("confirmZipPayment", no.GS.zip),
        Si = Jo("confirmCustomerBalancePayment", no.GS.customer_balance),
        Pi = function (e, t, n, r, o) {
          if (o && !0 === o.handleActions)
            throw new b.No("Expected option `handleActions` to be `false`.");
          var i = (0, c.Z)(
            (0, c.Z)({}, r),
            {},
            {
              payment_method: (0, c.Z)({}, (r && r.payment_method) || {}),
              payment_method_options: (0, c.Z)(
                (0, c.Z)({}, (r && r.payment_method_options) || {}),
                {},
                {
                  wechat_pay: (0, c.Z)(
                    (0, c.Z)(
                      {},
                      (r &&
                        r.payment_method_options &&
                        r.payment_method_options.wechat_pay) ||
                        {}
                    ),
                    {},
                    { client: "web" }
                  ),
                }
              ),
            }
          );
          return Jo("confirmWechatPayPayment", no.GS.wechat_pay)(e, t, n, i, o);
        },
        Ai = function (e, t, n, r, o) {
          if (
            !r ||
            !r.payment_method_options ||
            !r.payment_method_options.wechat_pay ||
            ("web" !== r.payment_method_options.wechat_pay.client &&
              "mobile_web" !== r.payment_method_options.wechat_pay.client)
          )
            throw new b.No(
              "Expected client value `web` or `mobile_web` in payment_method_options."
            );
          var i = {};
          "string" == typeof r.payment_method && (i = r.payment_method),
            "object" == typeof r.payment_method &&
              (i = (0, c.Z)({}, r.payment_method || {}));
          var a = (0, c.Z)(
            (0, c.Z)({}, r),
            {},
            {
              payment_method: i,
              payment_method_options: (0, c.Z)(
                (0, c.Z)({}, (r && r.payment_method_options) || {}),
                {},
                {
                  wechat_pay: (0, c.Z)(
                    {},
                    (r &&
                      r.payment_method_options &&
                      r.payment_method_options.wechat_pay) ||
                      {}
                  ),
                }
              ),
            }
          );
          return Jo("confirmWechatPayPayment", no.GS.wechat_pay)(e, t, n, a, o);
        },
        Ci = Jo("confirmCashappPayment", no.GS.cashapp),
        Ni = Jo("confirmPayNowPayment", no.GS.paynow),
        Ii = Jo("confirmPayNowDisplayBeta1", no.GS.paynow),
        Ti = Jo("confirmPixPayment", no.GS.pix),
        Mi = Jo("confirmPromptPayPayment", no.GS.promptpay),
        ji = Jo("confirmQrisPayment", no.GS.qris),
        Oi = Jo("confirmRevolutPayPayment", no.GS.revolut_pay),
        Ri = Jo("confirmNetbankingPayment", no.GS.netbanking),
        Zi = function (e, t, n, r) {
          var o = (0, Vn.cn)(n, "updatePaymentIntent"),
            i = (0, Vn.k7)(r),
            a = (0, Vn.o1)(i, "updatePaymentIntent", r, o);
          return e.action
            .updatePaymentIntent(
              (0, c.Z)(
                (0, c.Z)({}, a),
                {},
                { expectedType: i, mids: t, options: null }
              )
            )
            .then(Uo.PA);
        },
        xi = function (e) {
          var t;
          return "error" in e &&
            "external_payment_method_selected" === e.error.code
            ? {
                selectedPaymentMethod:
                  null === (t = e.error.extra_fields) || void 0 === t
                    ? void 0
                    : t.selectedPaymentMethod,
              }
            : e;
        },
        Li = function (e, t, n) {
          var r = (0, Vn.cn)(t, "verifyMicrodepositsForPayment"),
            o = (0, m.Gu)(m.Ry, n, "stripe.verifyMicrodepositsForPayment");
          return e.action
            .verifyMicrodepositsForPayment({ intentSecret: r, data: o.value })
            .then(Uo.PA);
        },
        Di = function (e, t, n) {
          var r = (0, Vn.cn)(t, "collectUsBankAccountForPayment"),
            o = (0, m.Gu)(
              (0, bn.ZY)("us_bank_account"),
              n,
              "stripe.collectUsBankAccountForPayment"
            ).value,
            i = o.paymentMethodData,
            a = o.otherParams;
          return Hn(r.clientSecret, r.id, e, i).then(function (t) {
            return t.error
              ? e.action.localizeError(t.error).then(function (e) {
                  return B.J.resolve({ error: e });
                })
              : t.linkAccountSession.paymentAccount
              ? e.action
                  .attachLinkAccountSessionForPayment({
                    intentSecret: r,
                    linkAccountSessionId: t.linkAccountSession.id,
                    expandParam: a.expand,
                  })
                  .then(function (e) {
                    return (0, Uo.PA)(e);
                  })
              : e.action
                  .retrievePaymentIntent({ intentSecret: r, hosted: !1 })
                  .then(Uo.PA);
          });
        },
        Bi = function (e, t) {
          var n = (0, m.Gu)(
              (0, bn.as)(bn.f4),
              t,
              "stripe.collectBankAccountForPayment"
            ).value,
            r = n.clientSecret,
            o = n.paymentMethodData,
            i = n.otherParams;
          return Hn(r.clientSecret, r.id, e, o).then(function (t) {
            return t.error
              ? e.action.localizeError(t.error).then(function (e) {
                  return B.J.resolve({ error: e });
                })
              : t.linkAccountSession.paymentAccount
              ? e.action
                  .attachLinkAccountSessionForPayment({
                    intentSecret: r,
                    linkAccountSessionId: t.linkAccountSession.id,
                    expandParam: i.expand,
                  })
                  .then(function (e) {
                    return (0, Uo.PA)(e);
                  })
              : e.action
                  .retrievePaymentIntent({ intentSecret: r, hosted: !1 })
                  .then(Uo.PA);
          });
        },
        qi = function (e, t) {
          var n = (0, Vn.cn)(e, "handleCardAction");
          return t.action
            .retrievePaymentIntent({ intentSecret: n, hosted: !1 })
            .then(function (e) {
              var n = (0, Go.Fh)(e);
              switch (n.type) {
                case "error":
                  return B.J.resolve((0, Uo.PA)(e));
                case "object":
                  var r = n.object;
                  if ((0, Uo.mD)(r.status)) {
                    if ("manual" !== r.confirmation_method)
                      throw new b.No(
                        "handleCardAction: The PaymentIntent supplied does not require manual server-side confirmation. Please use confirmCardPayment instead to complete the payment."
                      );
                    return (0, Go.gO)(t, r, n.locale, !1, !1);
                  }
                  throw new b.No(
                    "handleCardAction: The PaymentIntent supplied is not in the requires_action state."
                  );
                default:
                  return (0, m.Rz)(n);
              }
            });
        },
        Fi = Vn.OV,
        Ui = function (e) {
          var t = e.mode;
          return !("paymentMethod-from-data" === t.tag && t.data.acss_debit);
        },
        Gi = function (e) {
          return null !== e && "object" == typeof e && !0 === e.skipMandate;
        },
        Yi = function (e) {
          return (
            null !== e && "object" == typeof e && !!e.shouldCreatePaymentMethod
          );
        },
        zi = function (e) {
          var t = e.controller,
            n = e.shouldCreatePaymentMethod,
            r = e.intentSecret,
            o = e.mode,
            i = e.confirmIntentData;
          return t.action
            .createAcssDebitSession({
              intentSecret: r,
              shouldCreatePaymentMethod: n,
              confirmIntentData: i,
              mode: o,
            })
            .then(function (e) {
              if ("error" === e.type) return { type: "error", error: e.error };
              var n = (0, _o.q)(t, {
                url: (0, Be.jr)(e.object.url),
                size: "400x600",
                locale: e.locale,
                frameTitle: "acss.dialog_frame_title",
                useLightboxHostedCloseButton: !1,
              });
              return new B.J(function (e) {
                n._on("request-close", function () {
                  (0, _o.G)(n)
                    .then(function () {
                      return t.action.localizeError(Vn.LR);
                    })
                    .then(function (t) {
                      e({ type: "error", error: t });
                    });
                }),
                  n._on("session-complete", function (t) {
                    var r = t.paymentMethod;
                    (0, _o.G)(n).then(function () {
                      e({ type: "success", paymentMethod: r });
                    });
                  });
              });
            });
        },
        Hi = function (e, t, n, r, o) {
          var i = "confirmAcssDebitPayment",
            a = no.GS.acss_debit,
            s = (0, Vn.cn)(n, i),
            u = (0, Vn.o1)(a, i, r, s),
            l = Yi(o);
          return (
            Fi(o, i),
            Gi(o) || !Ui(u)
              ? e.action
                  .confirmPaymentIntent(
                    (0, c.Z)(
                      (0, c.Z)({}, u),
                      {},
                      {
                        expectedType: a,
                        options: { handleActions: !1 },
                        mids: t,
                      }
                    )
                  )
                  .then(Uo.PA)
              : zi({
                  controller: e,
                  shouldCreatePaymentMethod: l,
                  intentSecret: s,
                  mode: "payment",
                  confirmIntentData: u,
                }).then(function (n) {
                  switch (n.type) {
                    case "error":
                      return { error: n.error };
                    case "success":
                      return e.action
                        .confirmPaymentIntent({
                          mode: {
                            tag: "paymentMethod",
                            paymentMethod: n.paymentMethod,
                            options: u.mode.options || {},
                            intentSecret: s,
                          },
                          otherParams: u.otherParams,
                          expectedType: a,
                          options: { handleActions: !1 },
                          mids: t,
                        })
                        .then(Uo.PA);
                    default:
                      return (0, m.Rz)(n.type);
                  }
                })
          );
        },
        Ki = function (e, t, n, r, o) {
          var i = "confirmAcssDebitSetup",
            a = no.GS.acss_debit,
            s = (0, Vn.jH)(n, i),
            u = (0, Vn.o1)(a, i, r, s),
            l = Yi(o);
          return (
            Fi(o, i),
            Gi(o) || !Ui(u)
              ? e.action
                  .confirmSetupIntent(
                    (0, c.Z)(
                      (0, c.Z)({}, u),
                      {},
                      {
                        expectedType: a,
                        options: { handleActions: !1 },
                        mids: t,
                      }
                    )
                  )
                  .then(Uo.e3)
              : zi({
                  controller: e,
                  shouldCreatePaymentMethod: l,
                  intentSecret: s,
                  mode: "setup",
                  confirmIntentData: u,
                }).then(function (n) {
                  switch (n.type) {
                    case "error":
                      return { error: n.error };
                    case "success":
                      return e.action
                        .confirmSetupIntent({
                          mode: {
                            tag: "paymentMethod",
                            paymentMethod: n.paymentMethod,
                            options: u.mode.options || {},
                            intentSecret: s,
                          },
                          otherParams: u.otherParams,
                          expectedType: a,
                          options: { handleActions: !1 },
                          mids: t,
                        })
                        .then(Uo.e3);
                    default:
                      return (0, m.Rz)(n.type);
                  }
                })
          );
        },
        Ji = { type: "validation_error", code: "errors.code.unexpected" },
        Wi = {
          type: "validation_error",
          code: "errors.code.incomplete_payment_details",
        },
        Vi = function (e, t, n, r, o) {
          var i = "confirmInstantDebitsPilotPayment",
            a = (0, Vn.cn)(n, i),
            s = (0, Vn.el)(i, o),
            u = (0, Vn.o1)(null, i, r, a),
            l = e.createLightboxFrame({
              type: Be.NC.INSTANT_DEBITS_APP,
              options: {
                intentId: a.id,
                clientSecret: a.clientSecret,
                apiKey: e._apiKey,
                returnOnConfirm: !1 === s.handleActions,
              },
            });
          return (
            l.show(),
            l.fadeInBackdrop(),
            new B.J(function (n) {
              var r = function (e) {
                l.fadeOutBackdrop().then(function () {
                  n(e);
                });
              };
              l._once("cancel", function () {
                l.fadeOutBackdrop(),
                  e.action.localizeError(Wi).then(function (e) {
                    r({ error: e });
                  });
              }),
                l._on("instant-debits-fetch-payment-intent", function () {
                  e.action
                    .retrievePaymentIntent({ intentSecret: a, hosted: !1 })
                    .then(function (t) {
                      if (t.object) {
                        var o = t.object;
                        l.send({
                          action:
                            "stripe-instant-debits-received-payment-intent",
                          payload: { paymentIntent: o },
                        }),
                          !1 === s.handleActions &&
                            setTimeout(function () {
                              l.fadeOutBackdrop(), r((0, Uo.PA)(t));
                            }, 2e3);
                      } else {
                        var i = t.error;
                        e.action.localizeError(i).then(function (e) {
                          n({ error: e });
                        });
                      }
                    });
                }),
                l._on("instant-debits-attempt-payment", function () {
                  e.action
                    .confirmPaymentIntent(
                      (0, c.Z)(
                        (0, c.Z)({}, u),
                        {},
                        {
                          mode: { tag: "none", intentSecret: a },
                          expectedType: null,
                          options: s,
                          mids: t,
                        }
                      )
                    )
                    .then(function (t) {
                      t.object
                        ? (l.send({
                            action:
                              "stripe-instant-debits-successful-payment-intent",
                            payload: { paymentIntent: t.object },
                          }),
                          setTimeout(function () {
                            r((0, Uo.PA)(t));
                          }, 2e3))
                        : e.action.localizeError(t.error).then(function (e) {
                            r({ error: e });
                          });
                    });
                }),
                l._on("instant-debits-flow-error", function () {
                  e.action.localizeError(Ji).then(function (e) {
                    r({ error: e });
                  });
                });
            })
          );
        },
        Xi = e(7549),
        Qi = e(122),
        $i = e(7193),
        ea = e(8147),
        ta = e(6790),
        na = function (e, t, n, r, o) {
          var i = (0, Xi.l)((0, Uo.G2)(t)),
            a = (0, Uo.O3)(t);
          if (!i) return B.J.resolve({ setupIntent: t });
          switch (i.type) {
            case "captcha-challenge":
              return (0, ea.z)(i, t, e, n);
            case "3ds1-modal":
              return (0, Qi.s)(i, a, k.kE.SETUP_INTENT, e, n, o);
            case "3ds2-fingerprint":
            case "3ds2-challenge":
              return (0, $i.A)(
                i,
                {
                  intentSecret: a,
                  intentType: k.kE.SETUP_INTENT,
                  controller: e,
                  locale: n,
                  hosted: r,
                },
                o
              );
            case "redirect":
              return (0, ta.e)(t, i.redirectUrl, e);
            default:
              return B.J.resolve({ setupIntent: t });
          }
        },
        ra = function e(t, n, r, o, i) {
          var a =
            arguments.length > 5 && void 0 !== arguments[5] ? arguments[5] : 0;
          if (k.kO < a) throw new Error("max action recursion depth reached");
          return na(t, n, r, o, i || []).then(function (n) {
            if (n.paymentIntent)
              throw new Error("Got unexpected PaymentIntent response");
            if (
              n.setupIntent &&
              null != n.setupIntent.next_action &&
              "use_stripe_sdk" === n.setupIntent.next_action.type &&
              -1 !== k.zT.indexOf(n.setupIntent.next_action.use_stripe_sdk.type)
            ) {
              var c = a;
              return e(t, n.setupIntent, r, o, i, ++c);
            }
            return n;
          });
        },
        oa = function (e, t, n, r) {
          return function (o) {
            switch (o.type) {
              case "error":
                var i = o.error,
                  a = i.setup_intent;
                return t && a && "succeeded" === a.status
                  ? B.J.resolve({ setupIntent: a })
                  : B.J.resolve({ error: i });
              case "object":
                var c = o.object;
                return ra(e, c, o.locale, n, r);
              default:
                return (0, m.Rz)(o);
            }
          };
        },
        ia = function (e, t) {
          var n = (0, m.Gu)(
            (0, m.mC)({ clientSecret: bn.Hv }),
            t,
            "stripe.handleNextAction"
          ).value.clientSecret;
          return "SETUP_INTENT" === n.type
            ? (function (e, t) {
                return e.action
                  .retrieveSetupIntent({ intentSecret: t, hosted: !1 })
                  .then(function (t) {
                    switch (t.type) {
                      case "error":
                        return B.J.resolve((0, Uo.e3)(t));
                      case "object":
                        var n = t.object;
                        if ((0, Uo.mD)(n.status)) return ra(e, n, t.locale, !1);
                        throw new b.No(
                          "handleNextAction: The SetupIntent supplied is not in the requires_action state."
                        );
                      default:
                        return (0, m.Rz)(t);
                    }
                  });
              })(e, n)
            : (function (e, t) {
                return e.action
                  .retrievePaymentIntent({ intentSecret: t, hosted: !1 })
                  .then(function (t) {
                    switch (t.type) {
                      case "error":
                        return B.J.resolve((0, Uo.PA)(t));
                      case "object":
                        var n = t.object;
                        if ((0, Uo.mD)(n.status))
                          return (0, Go.gO)(e, n, t.locale, !1, !1);
                        throw new b.No(
                          "handleNextAction: The PaymentIntent supplied is not in the requires_action state."
                        );
                      default:
                        return (0, m.Rz)(t);
                    }
                  });
              })(e, n);
        },
        aa = function (e, t) {
          if (null == e) return (0, m.x4)(null);
          var n = e.type,
            r = (0, d.Z)(e, ["type"]),
            o = (0, m.Wc)(m.Z_, function () {
              return null;
            })(n, (0, m.NQ)(t, "type"));
          return "error" === o.type ? o : (0, m.x4)({ type: o.value, data: r });
        },
        ca = function (e, t, n, r) {
          if (null === e) {
            if (null === t) {
              var o = r ? "source_data" : "payment_method_data";
              throw new b.No(
                ""
                  .concat(
                    n,
                    ": you must additionally specify the type of payment method to create within "
                  )
                  .concat(o, ".")
              );
            }
            return t;
          }
          if (null === t) return e;
          if (t !== e)
            throw new b.No(
              ""
                .concat(n, ": you specified `type: ")
                .concat(t, "`, but ")
                .concat(n, " will create a ")
                .concat(e, " payment method.")
            );
          return e;
        },
        sa = function (e) {
          return function (t, n) {
            if ("object" == typeof t && null !== t) {
              var r = t.source,
                o = t.source_data,
                i = t.payment_method,
                a = t.payment_method_data,
                s = (0, d.Z)(t, [
                  "source",
                  "source_data",
                  "payment_method",
                  "payment_method_data",
                ]);
              if (null != r && "string" != typeof r)
                return (0, m.RH)("string", typeof r, (0, m.NQ)(n, "source"));
              if (null != i && "string" != typeof i)
                return (0, m.RH)(
                  "string",
                  typeof i,
                  (0, m.NQ)(n, "payment_method")
                );
              if (null != o && "object" != typeof o)
                return (0, m.RH)(
                  "object",
                  typeof o,
                  (0, m.NQ)(n, "source_data")
                );
              if (null != a && "object" != typeof a)
                return (0, m.RH)(
                  "object",
                  typeof a,
                  (0, m.NQ)(n, "payment_method_data")
                );
              var u = aa(o, (0, m.NQ)(n, "source_data"));
              if ("error" === u.type) return u;
              var l = u.value,
                p = aa(a, (0, m.NQ)(n, "payment_method_data"));
              if ("error" === p.type) return p;
              var f = p.value;
              return (0, m.x4)({
                sourceData: l,
                source: null == r ? null : r,
                paymentMethodData: f,
                paymentMethod: null == i ? null : i,
                otherParams: (0, c.Z)((0, c.Z)({}, e), s),
              });
            }
            return null === t
              ? (0, m.RH)("object", "null", n)
              : (0, m.RH)("object", typeof t, n);
          };
        },
        ua = function (e) {
          return function (t, n) {
            if (void 0 === t)
              return (0, m.x4)({
                sourceData: null,
                paymentMethodData: null,
                source: null,
                paymentMethod: null,
                otherParams: {},
              });
            if ("object" != typeof t) return (0, m.RH)("object", typeof t, n);
            if (null === t) return (0, m.RH)("object", "null", n);
            if (e) {
              if (!t.payment_intent) {
                var r = (0, m.Gu)(
                    (0, m.mC)({
                      return_url: (0, m.jt)(m.Z_),
                      expand: (0, m.jt)((0, m.CT)(m.Z_)),
                      shipping: (0, m.jt)(
                        (0, m.ci)({
                          name: m.Z_,
                          address: (0, m.ci)({
                            line1: (0, m.jt)(m.Z_),
                            line2: (0, m.jt)(m.Z_),
                            city: (0, m.jt)(m.Z_),
                            state: (0, m.jt)(m.Z_),
                            postal_code: (0, m.jt)(m.Z_),
                            country: (0, m.jt)(m.Z_),
                          }),
                        })
                      ),
                    }),
                    t,
                    "validate otherParams"
                  ).value,
                  o = (0, c.Z)((0, c.Z)({}, t), r);
                return (0, m.x4)({
                  sourceData: null,
                  paymentMethodData: null,
                  source: null,
                  paymentMethod: null,
                  otherParams: o,
                });
              }
              var i = t.payment_intent,
                a = (0, d.Z)(t, ["payment_intent"]);
              return sa(a)(i, (0, m.NQ)(n, "payment_intent"));
            }
            return t.payment_intent
              ? (0, m.zS)(
                  new b.No(
                    "The payment_intent parameter has been removed. To fix, move everything nested under the payment_intent parameter to the top-level object."
                  )
                )
              : sa({})(t, n);
          };
        },
        la = function (e, t, n, r, o) {
          return function (i, a) {
            var s = (function (e, t, n, r, o, i, a) {
              var s = (0, m.ld)(m.IN, o, r);
              if ("error" === s.type) return null;
              var u = s.value,
                l = (0, m.Gu)(ua(t), i, r).value,
                p = l.sourceData,
                d = l.source,
                f = l.paymentMethodData,
                _ = l.paymentMethod,
                h = l.otherParams;
              if (!e && p)
                throw new b.No(
                  "".concat(
                    r,
                    ": Expected payment_method_data, not source_data."
                  )
                );
              if (null != d)
                throw new b.No(
                  "When calling ".concat(
                    r,
                    " on an Element, you can't pass in a pre-existing source ID, as a source will be created using the Element."
                  )
                );
              if (null != _)
                throw new b.No(
                  "When calling ".concat(
                    r,
                    " on an Element, you can't pass in a pre-existing PaymentMethod ID, as a PaymentMethod will be created using the Element."
                  )
                );
              var y = u._componentName,
                v = u._implementation._frame.id,
                g = p || f || { type: null, data: {} },
                w = g.type,
                k = g.data,
                E = (0, no.ZX)(y, w),
                S = e && !f,
                P = {
                  elementName: y,
                  frameId: v,
                  type: ca(n, E, r, S),
                  data: k,
                };
              return S
                ? {
                    mode: (0, c.Z)(
                      { tag: "source-from-element", intentSecret: a },
                      P
                    ),
                    otherParams: h,
                  }
                : {
                    mode: (0, c.Z)(
                      {
                        tag: "paymentMethod-from-element",
                        options: null,
                        intentSecret: a,
                      },
                      P
                    ),
                    otherParams: h,
                  };
            })(e, t, n, r, i, a, o);
            if (s) return s;
            var u = (function (e, t, n, r, o, i, a) {
              var c = (0, m.Gu)(ua(t), o, r).value,
                s = c.sourceData,
                u = c.source,
                l = c.paymentMethodData,
                p = c.paymentMethod,
                d = c.otherParams;
              if (!e && s)
                throw new b.No(
                  "".concat(
                    r,
                    ": Expected payment_method, source, or payment_method_data, not source_data."
                  )
                );
              if (null !== u && null !== s)
                throw new b.No(
                  "".concat(
                    r,
                    ": Expected either source or source_data, but not both."
                  )
                );
              if (null !== p && null !== l)
                throw new b.No(
                  "".concat(
                    r,
                    ": Expected either payment_method or payment_method_data, but not both."
                  )
                );
              if (null !== p && null !== u)
                throw new b.No(
                  "".concat(
                    r,
                    ": Expected either payment_method or source, but not both."
                  )
                );
              if (s || l) {
                var f = s || l || {},
                  _ = f.type,
                  h = f.data,
                  y = e && !l,
                  v = ca(n, _, r, y);
                return y
                  ? {
                      mode: {
                        tag: "source-from-data",
                        intentSecret: a,
                        type: v,
                        data: h,
                      },
                      otherParams: d,
                    }
                  : {
                      mode: {
                        tag: "paymentMethod-from-data",
                        type: v,
                        data: h,
                        intentSecret: a,
                        options: null,
                      },
                      otherParams: d,
                    };
              }
              return null !== u
                ? {
                    mode: { tag: "source", intentSecret: a, source: u },
                    otherParams: d,
                  }
                : null !== p
                ? {
                    mode: {
                      tag: "paymentMethod",
                      paymentMethod: p,
                      intentSecret: a,
                      options: null,
                    },
                    otherParams: d,
                  }
                : { mode: { tag: "none", intentSecret: a }, otherParams: d };
            })(e, t, n, r, i, 0, o);
            if (u) return u;
            throw new b.No(
              "Expected: stripe."
                .concat(r, "(intentSecret, element[, data]) or stripe.")
                .concat(
                  r,
                  "(intentSecret[, data]). Please see the docs for more usage examples https://stripe.com/docs/payments/dynamic-authentication"
                )
            );
          };
        },
        pa = function (e, t, n, r, o, i) {
          var a = (0, m.Gu)(
              bn.f4,
              r,
              "stripe.confirmPaymentIntent intent secret"
            ).value,
            s = la(e, !1, null, "confirmPaymentIntent", a)(o, i);
          return t.action
            .confirmPaymentIntent(
              (0, c.Z)(
                (0, c.Z)({}, s),
                {},
                { expectedType: null, options: { handleActions: !1 }, mids: n }
              )
            )
            .then(Uo.PA);
        },
        da = function (e, t, n, r, o, i, a) {
          var s = (0, m.Gu)(
              bn.f4,
              o,
              "stripe.handleCardPayment intent secret"
            ).value,
            u = no.GS.card,
            l = la(e, r, u, "handleCardPayment", s)(i, a),
            p = !i && !a;
          return t.action
            .confirmPaymentIntent(
              (0, c.Z)(
                (0, c.Z)({}, l),
                {},
                { expectedType: u, options: { handleActions: !0 }, mids: n }
              )
            )
            .then((0, Go.nq)(t, p, !1, !1));
        },
        ma = function (e, t, n, r, o, i) {
          var a = (0, m.Gu)(
              bn.f4,
              r,
              "stripe.handleSepaDebitPayment intent secret"
            ).value,
            s = no.GS.sepa_debit,
            u = la(!1, n, s, "handleSepaDebitPayment", a)(o, i),
            l = !o && !i;
          return e.action
            .confirmPaymentIntent(
              (0, c.Z)(
                (0, c.Z)({}, u),
                {},
                { expectedType: s, options: { handleActions: !0 }, mids: t }
              )
            )
            .then((0, Go.nq)(e, l, !1, !1));
        },
        fa = function (e, t, n, r, o, i, a) {
          var s = (0, m.Gu)(
              bn.f4,
              o,
              "stripe.handleIdealPayment intent secret"
            ).value,
            u = no.GS.ideal,
            l = la(e, r, u, "handleIdealPayment", s)(i, a),
            p = !i && !a;
          return t.action
            .confirmPaymentIntent(
              (0, c.Z)(
                (0, c.Z)({}, l),
                {},
                { expectedType: u, options: { handleActions: !0 }, mids: n }
              )
            )
            .then((0, Go.nq)(t, p, !1, !1));
        },
        _a = function (e, t, n, r, o, i) {
          var a = (0, m.Gu)(
              bn.f4,
              r,
              "stripe.handleFpxPayment intent secret"
            ).value,
            s = no.GS.fpx,
            u = la(!1, n, s, "handleFpxPayment", a)(o, i),
            l = !o && !i;
          return e.action
            .confirmPaymentIntent(
              (0, c.Z)(
                (0, c.Z)({}, u),
                {},
                { expectedType: s, options: { handleActions: !0 }, mids: t }
              )
            )
            .then((0, Go.nq)(e, l, !1, !1));
        },
        ha = function (e) {
          switch (e.type) {
            case "object":
              return { returnIntent: e.object };
            case "error":
              return { error: e.error };
            default:
              return (0, m.Rz)(e);
          }
        },
        ya = function (e, t, n) {
          return e.action
            .confirmReturnIntent({ returnIntentId: t, data: n })
            .then(ha);
        },
        va = function (e, t) {
          return function (n, r, o, i, a) {
            var s = (0, Vn.jH)(o, e),
              u = (0, Vn.o1)(t, e, i, s),
              l = (0, Vn.el)(e, a),
              p = "none" === u.mode.tag,
              d = n.action.confirmSetupIntent(
                (0, c.Z)(
                  (0, c.Z)({}, u),
                  {},
                  { expectedType: t, options: l, mids: r }
                )
              );
            return l.handleActions
              ? d.then(oa(n, p, !1, u.otherParams.expand))
              : d.then(Uo.e3);
          };
        },
        ga = va("confirmAcssDebitSetup", no.GS.acss_debit),
        ba = va("confirmAfterpayClearpaySetup", no.GS.afterpay_clearpay),
        wa = va("confirmCardSetup", no.GS.card),
        ka = va("confirmSepaDebitSetup", no.GS.sepa_debit),
        Ea = va("confirmAuBecsDebitSetup", no.GS.au_becs_debit),
        Sa = va("confirmBacsDebitSetup", no.GS.bacs_debit),
        Pa = va("confirmIdealSetup", no.GS.ideal),
        Aa = va("confirmAlipaySetup", no.GS.alipay),
        Ca = va("confirmSofortSetup", no.GS.sofort),
        Na = va("confirmBancontactSetup", no.GS.bancontact),
        Ia = va("confirmIdBankTransferSetup", no.GS.id_bank_transfer),
        Ta = va("confirmPayPalSetup", no.GS.paypal),
        Ma = va("confirmUsBankAccountSetup", no.GS.us_bank_account),
        ja = va("confirmNzBankAccountSetup", no.GS.nz_bank_account),
        Oa = function (e) {
          var t;
          return "error" in e &&
            "external_payment_method_selected" === e.error.code
            ? {
                selectedPaymentMethod:
                  null === (t = e.error.extra_fields) || void 0 === t
                    ? void 0
                    : t.selectedPaymentMethod,
              }
            : e;
        },
        Ra = function (e, t, n) {
          var r = (0, Vn.jH)(t, "verifyMicrodepositsForSetup"),
            o = (0, m.Gu)(m.Ry, n, "stripe.verifyMicrodepositsForSetup");
          return e.action
            .verifyMicrodepositsForSetup({ intentSecret: r, data: o.value })
            .then(Uo.e3);
        },
        Za = function (e, t, n) {
          var r = (0, Vn.jH)(t, "collectUsBankAccountForSetup"),
            o = (0, m.Gu)(
              (0, bn.ZY)("us_bank_account"),
              n,
              "stripe.collectUsBankAccountForSetup"
            ).value,
            i = o.paymentMethodData,
            a = o.otherParams;
          return Kn(r.clientSecret, r.id, e, i).then(function (t) {
            return t.error
              ? e.action.localizeError(t.error).then(function (e) {
                  return B.J.resolve({ error: e });
                })
              : t.linkAccountSession.paymentAccount
              ? e.action
                  .attachLinkAccountSessionForSetup({
                    intentSecret: r,
                    linkAccountSessionId: t.linkAccountSession.id,
                    expandParam: a.expand,
                  })
                  .then(function (e) {
                    return (0, Uo.e3)(e);
                  })
              : e.action
                  .retrieveSetupIntent({ intentSecret: r, hosted: !1 })
                  .then(Uo.e3);
          });
        },
        xa = function (e, t) {
          var n = (0, m.Gu)(
              (0, bn.as)(bn.Yj),
              t,
              "stripe.collectBankAccountForSetup"
            ).value,
            r = n.clientSecret,
            o = n.paymentMethodData,
            i = n.otherParams;
          return Kn(r.clientSecret, r.id, e, o).then(function (t) {
            return t.error
              ? e.action.localizeError(t.error).then(function (e) {
                  return B.J.resolve({ error: e });
                })
              : t.linkAccountSession.paymentAccount
              ? e.action
                  .attachLinkAccountSessionForSetup({
                    intentSecret: r,
                    linkAccountSessionId: t.linkAccountSession.id,
                    expandParam: i.expand,
                  })
                  .then(function (e) {
                    return (0, Uo.e3)(e);
                  })
              : e.action
                  .retrieveSetupIntent({ intentSecret: r, hosted: !1 })
                  .then(Uo.e3);
          });
        },
        La = function (e, t, n, r, o) {
          var i = (0, m.Gu)(
              bn.Yj,
              n,
              "stripe.handleCardSetup intent secret"
            ).value,
            a = no.GS.card,
            s = la(!1, !1, a, "handleCardSetup", i)(r, o),
            u = !r && !o;
          return e.action
            .confirmSetupIntent(
              (0, c.Z)(
                (0, c.Z)({}, s),
                {},
                { expectedType: a, options: { handleActions: !0 }, mids: t }
              )
            )
            .then(oa(e, u, !1, s.otherParams.expand));
        },
        Da = function (e, t, n, r, o) {
          var i = (0, m.Gu)(
              bn.Yj,
              n,
              "stripe.handleSepaDebitSetup intent secret"
            ).value,
            a = no.GS.sepa_debit,
            s = la(!1, !1, a, "handleSepaDebitSetup", i)(r, o),
            u = !r && !o;
          return e.action
            .confirmSetupIntent(
              (0, c.Z)(
                (0, c.Z)({}, s),
                {},
                { expectedType: a, options: { handleActions: !0 }, mids: t }
              )
            )
            .then(oa(e, u, !1));
        },
        Ba = function (e, t, n, r, o) {
          var i = (0, m.Gu)(
              bn.Yj,
              n,
              "stripe.confirmSetupIntent intent secret"
            ).value,
            a = la(!1, !1, null, "confirmSetupIntent", i)(r, o);
          return e.action
            .confirmSetupIntent(
              (0, c.Z)(
                (0, c.Z)({}, a),
                {},
                {
                  otherParams: (0, c.Z)({}, a.otherParams),
                  expectedType: null,
                  options: { handleActions: !1 },
                  mids: t,
                }
              )
            )
            .then(Uo.e3);
        },
        qa = function (e, t) {
          var n = (function (e) {
              if ("string" == typeof e) {
                var t = e.trim().match(/^((vi|vs)_[0-9a-zA-Z]+)_secret_(.+)$/);
                if (!t)
                  throw new b.No(
                    "stripe.verifyIdentity: Could not parse client secret."
                  );
                return { identityClientSecret: t[0], id: t[1], token: t[3] };
              }
              throw new b.No(
                "stripe.verifyIdentity: Could not parse client secret."
              );
            })(e),
            r = n.id,
            o = (function (e) {
              return "".concat(k.Ht, "start/").concat(e);
            })(n.token);
          return (function (e) {
            var t = e.controller,
              n = e.url,
              r = (e.id, e.locale),
              o = void 0 === r ? "en-US" : r,
              i = (0, _o.q)(t, {
                url: (0, Be.jr)(n),
                size: "1100x800",
                frameTitle: "identity.verification_frame_title",
                locale: o,
                useLightboxHostedCloseButton: !0,
                allowCamera: !0,
                appType: "identity",
              });
            return new B.J(function (e) {
              var t = { type: "user_action", code: "session_cancelled" };
              i._on("identity-frame-close", function () {
                (0, _o.G)(i).then(function () {
                  e({ error: t });
                });
              }),
                i._on("identity-frame-error", function (e) {
                  var n = e.type,
                    r = e.code;
                  t = { type: n, code: r };
                }),
                i._on("identity-frame-session-complete", function () {
                  t = null;
                }),
                i._on("request-close", function () {
                  (0, _o.G)(i).then(function () {
                    e({ error: t });
                  });
                });
            });
          })({ controller: t, url: o, id: r });
        },
        Fa = ["number", "cvc", "pin.number"],
        Ua = function (e, t) {
          if ("string" != typeof e)
            return (0, m.$3)("an Issuing card ID of the form ic_xxx", e, t);
          var n,
            r = (n = e.trim().match(/ic_[a-zA-Z0-9_]+$/)) ? n[0] : null;
          return null === r
            ? (0, m.$3)("an Issuing card ID of the form ic_xxx", e, t)
            : (0, m.x4)(r, []);
        },
        Ga = function (e, t) {
          return (0, m.Gu)(Ua, e, "stripe.".concat(t, " cardId")).value;
        },
        Ya = function (e, t) {
          if ("string" != typeof e)
            return (0, m.$3)(
              "an ephemeral key secret of the form ek_xxx",
              e,
              t
            );
          var n,
            r = (n = e.trim().match(/ek_[a-zA-Z0-9_]+$/)) ? n[0] : null;
          return null === r
            ? (0, m.$3)("an ephemeral key secret of the form ek_xxx", e, t)
            : (0, m.x4)(r, []);
        },
        za = function (e, t) {
          return "string" != typeof e
            ? (0, m.$3)("a string", e, t)
            : Fa.indexOf(e) < 0
            ? (0, m.$3)("any of ".concat(Fa.join(", ")), e, t)
            : (0, m.x4)(e, []);
        },
        Ha = function (e, t) {
          return (0, m.Gu)(Ya, e, "stripe.".concat(t, " ephemeral key secret"))
            .value;
        },
        Ka = function (e, t) {
          if ("string" != typeof e)
            return (0, m.$3)(
              "an ephemeral key nonce of the form ephkn_xxx",
              e,
              t
            );
          var n,
            r = (n = e.trim().match(/ephkn_[a-zA-Z0-9_]+$/)) ? n[0] : null;
          return null === r
            ? (0, m.$3)("an ephemeral key nonce of the form ephkn_xxx", e, t)
            : (0, m.x4)(r, []);
        },
        Ja = function (e) {
          if ("object" == typeof e && e && e.ephemeralKeySecret && e.nonce) {
            var t,
              n = Ha(e.ephemeralKeySecret, "retrieveIssuingCard"),
              r =
                ((o = e.nonce),
                (i = "retrieveIssuingCard"),
                (0, m.Gu)(Ka, o, "stripe.".concat(i, " ephemeral key nonce"))
                  .value);
            return (
              Array.isArray(e.expand) &&
                (t = e.expand.map(function (e) {
                  return (function (e, t) {
                    return (0,
                    m.Gu)(za, e, "stripe.".concat(t, " expand param")).value;
                  })(e, "retrieveIssuingCard");
                })),
              { ephemeralKeySecret: n, publicNonce: r, expand: t }
            );
          }
          throw new b.No(
            "When retrieving an Issuing card, you must specify an ephemeral key secret and an ephemeral key nonce in the options argument of stripe.retrieveIssuingCard."
          );
          var o, i;
        },
        Wa = function (e, t) {
          var n = (function (e) {
            if ("object" == typeof e && e && e.issuingCard)
              return {
                issuingCard: Ga(e.issuingCard, "createEphemeralKeyNonce"),
              };
            throw new b.No(
              "When creating an ephemeral key nonce, you must specify an Issuing card ID in the options argument of stripe.createEphemeralKeyNonce."
            );
          })(e);
          return t.action
            .createEphemeralKeyNonce({ cardId: n.issuingCard })
            .then(Qt);
        },
        Va = [v.M4.checkout_beta_2, v.M4.checkout_beta_3, v.M4.checkout_beta_4],
        Xa = [
          v.M4.checkout_beta_2,
          v.M4.checkout_beta_3,
          v.M4.checkout_beta_4,
          v.M4.checkout_beta_locales,
          v.M4.checkout_beta_testcards,
        ],
        Qa = {
          bg: "bg",
          cs: "cs",
          da: "da",
          de: "de",
          el: "el",
          en: "en",
          "en-GB": "en-GB",
          es: "es",
          "es-419": "es-419",
          et: "et",
          fi: "fi",
          fil: "fil",
          fr: "fr",
          "fr-CA": "fr-CA",
          hr: "hr",
          hu: "hu",
          id: "id",
          it: "it",
          ja: "ja",
          ko: "ko",
          lt: "lt",
          lv: "lv",
          ms: "ms",
          mt: "mt",
          nb: "nb",
          nl: "nl",
          pl: "pl",
          pt: "pt",
          "pt-BR": "pt-BR",
          ro: "ro",
          ru: "ru",
          sk: "sk",
          sl: "sl",
          sv: "sv",
          th: "th",
          tr: "tr",
          vi: "vi",
          zh: "zh",
          "zh-HK": "zh-HK",
          "zh-TW": "zh-TW",
        },
        $a = { "pt-PT": "pt-PT" },
        ec = Object.keys(Qa),
        tc = Object.keys($a),
        nc = {
          sku: (0, m.jt)(m.Z_),
          plan: (0, m.jt)(m.Z_),
          clientReferenceId: (0, m.jt)(m.Z_),
          locale: (0, m.jt)(m.kw.apply(void 0, ["auto"].concat((0, s.Z)(ec)))),
          customerEmail: (0, m.jt)(m.Z_),
          billingAddressCollection: (0, m.jt)((0, m.kw)("required", "auto")),
          submitType: (0, m.jt)((0, m.kw)("auto", "pay", "book", "donate")),
          allowIncompleteSubscriptions: (0, m.jt)(m.Xg),
          shippingAddressCollection: (0, m.jt)(
            (0, m.ci)({ allowedCountries: (0, m.CT)(m.Z_) })
          ),
        },
        rc = /cs_(test|live)_.+/,
        oc = function (e, t) {
          var n = (0, m.ci)(
              (0, c.Z)(
                (0, c.Z)({}, nc),
                {},
                {
                  items: (0, m.jt)(
                    (0, m.or)(
                      (0, m.CT)(
                        (0, m.ci)({
                          type: (0, m.kw)("plan"),
                          quantity: (0, m.M4)(0),
                          id: m.Z_,
                        })
                      ),
                      (0, m.CT)(
                        (0, m.ci)({
                          type: (0, m.kw)("sku"),
                          quantity: (0, m.M4)(0),
                          id: m.Z_,
                        })
                      )
                    )
                  ),
                  successUrl: m.Z_,
                  cancelUrl: m.Z_,
                }
              )
            ),
            r = (0, m.Gu)(n, t, "stripe.redirectToCheckout").value,
            o = r.sku,
            i = r.plan,
            a = r.items,
            s = (0, d.Z)(r, ["sku", "plan", "items"]),
            u = (function (e, t, n) {
              if ((e && t) || ((e || t) && n))
                throw new b.No(
                  "stripe.redirectToCheckout: Expected only one of sku, plan, or items."
                );
              if ("string" == typeof e) return [{ sku: e, quantity: 1 }];
              if ("string" == typeof t) return [{ plan: t, quantity: 1 }];
              if (n)
                return n.map(function (e) {
                  return "sku" === e.type
                    ? { sku: e.id, quantity: e.quantity }
                    : { plan: e.id, quantity: e.quantity };
                });
              throw new b.No(
                "stripe.redirectToCheckout: You must provide either sku, plan, or items."
              );
            })(o, i, a);
          return (0, c.Z)({ tag: "no-session", items: u }, s);
        },
        ic = function (e, t, n) {
          var r = (0, m.ci)(
              (0, c.Z)(
                (0, c.Z)({}, nc),
                {},
                {
                  sessionId: (0, m.jt)(m.Z_),
                  successUrl: (0, m.jt)(m.Z_),
                  cancelUrl: (0, m.jt)(m.Z_),
                  mode: (0, m.jt)((0, m.kw)("subscription", "payment")),
                  items: (0, m.jt)(
                    (0, m.or)(
                      (0, m.CT)(
                        (0, m.ci)({ quantity: (0, m.M4)(0), plan: m.Z_ })
                      ),
                      (0, m.CT)(
                        (0, m.ci)({ quantity: (0, m.M4)(0), sku: m.Z_ })
                      )
                    )
                  ),
                  lineItems: (0, m.jt)(
                    (0, m.CT)(
                      (0, m.ci)({ quantity: (0, m.M4)(0), price: m.Z_ })
                    )
                  ),
                },
                -1 !== e.indexOf("checkout_beta_locales")
                  ? {
                      locale: (0, m.jt)(
                        m.kw.apply(
                          void 0,
                          ["auto"].concat((0, s.Z)(ec), (0, s.Z)(tc))
                        )
                      ),
                    }
                  : {}
              )
            ),
            o = (0, m.Gu)(r, t, "stripe.redirectToCheckout").value;
          if (o.sessionId) {
            var i = o.sessionId;
            if (Object.keys(o).length > 1)
              throw new b.No(
                "stripe.redirectToCheckout: Do not provide other parameters when providing sessionId. Specify all parameters on your server when creating the CheckoutSession."
              );
            if (!/^cs_/.test(i))
              throw new b.No(
                "stripe.redirectToCheckout: Invalid value for sessionId. You specified '".concat(
                  i,
                  "'."
                )
              );
            if ("live" === n && /^cs_test_/.test(i))
              throw new b.No(
                "stripe.redirectToCheckout: the provided sessionId is for a test mode Checkout Session, whereas Stripe.js was initialized with a live mode publishable key."
              );
            if ("test" === n && /^cs_live_/.test(i))
              throw new b.No(
                "stripe.redirectToCheckout: the provided sessionId is for a live mode Checkout Session, whereas Stripe.js was initialized with a test mode publishable key."
              );
            return { tag: "session", sessionId: i };
          }
          o.sessionId, o.sku, o.plan;
          var a = o.items,
            u = o.lineItems,
            l = o.successUrl,
            p = o.cancelUrl,
            f = o.mode,
            _ = (0, d.Z)(o, [
              "sessionId",
              "sku",
              "plan",
              "items",
              "lineItems",
              "successUrl",
              "cancelUrl",
              "mode",
            ]);
          if (!u && !a)
            throw new b.No(
              "stripe.redirectToCheckout: You must provide one of lineItems, items, or sessionId."
            );
          if (!l || !p)
            throw new b.No(
              "stripe.redirectToCheckout: You must provide successUrl and cancelUrl."
            );
          return (0, c.Z)(
            {
              tag: "no-session",
              items: a,
              lineItems: u,
              successUrl: l,
              cancelUrl: p,
              mode: f,
            },
            _
          );
        },
        ac = function (e, t, n) {
          var r = ic(e, t, n);
          if ("no-session" === r.tag) {
            var o = r.successUrl,
              i = r.cancelUrl;
            if (!(0, y.sD)(o))
              throw new b.No(
                "stripe.redirectToCheckout: successUrl must start with either http:// or https://."
              );
            if (!(0, y.sD)(i))
              throw new b.No(
                "stripe.redirectToCheckout: cancelUrl must start with either http:// or https://."
              );
            return r;
          }
          return r;
        },
        cc = function (e, t) {
          return "session" === t.tag ||
            null == e ||
            t.locale ||
            -1 === ["auto"].concat((0, s.Z)(ec)).indexOf(e)
            ? t
            : (0, c.Z)((0, c.Z)({}, t), {}, { locale: e });
        },
        sc = function (e, t, n) {
          var r = (0, g.sE)(Va, function (t) {
            return (0, v.uN)(e, t);
          });
          if (t && t.lineItems && r)
            throw new b.No("Prices cannot be used with ".concat(r));
          if ("string" == typeof t && rc.test(t))
            throw new b.No(
              "stripe.redirectToCheckout: Checkout Session IDs must be passed in as an object with a key of `sessionId` and the Session ID as the value."
            );
          switch (r) {
            case "checkout_beta_2":
              return oc(0, t);
            case "checkout_beta_3":
              return ic(e, t, n);
            default:
              return ac(e, t, n);
          }
        },
        uc = function (e, t, n) {
          var r =
            arguments.length > 3 && void 0 !== arguments[3]
              ? arguments[3]
              : "unknown";
          return cc(t, sc(e, n, r));
        },
        lc = function (e, t) {
          var n = t;
          return (
            Boolean(!1) &&
              window.__STRIPE_CHECKOUT_URL_OVERRIDE__ &&
              (n = t.replace(
                /^https?:\/\/[^/]+\//,
                window.__STRIPE_CHECKOUT_URL_OVERRIDE__
              )),
            (0, Fo.U)(n).then(function (t) {
              return (0, Fo.d)(e, "redirectToCheckout", t), { error: t.error };
            })
          );
        },
        pc = function (e) {
          switch (e.type) {
            case "object":
              return { token: e.object };
            case "error":
              return { error: e.error };
            default:
              return (0, m.Rz)(e);
          }
        },
        dc = function (e) {
          return "object" == typeof e && null !== e ? e : {};
        },
        mc = function (e) {
          switch (e.type) {
            case "object":
              return { radarSession: e.object };
            case "error":
              return { error: e.error };
            default:
              return (0, m.Rz)(e);
          }
        },
        fc = "securitypolicyviolation",
        _c = window,
        hc = /^require-trusted-types-for/,
        yc = "LOAD_ERROR",
        vc = "REPORT_ONLY",
        gc = "BLOCKED",
        bc = new at.E(),
        wc = document ? document.readyState : "unknown",
        kc = !1;
      switch (wc) {
        case "loading":
          kc = !0;
          break;
        case "interactive":
          try {
            var Ec = function () {
              kc = !0;
            };
            setTimeout(function () {
              document.removeEventListener("DOMContentLoaded", Ec);
            }, 0),
              document.addEventListener("DOMContentLoaded", Ec);
          } catch (e) {}
      }
      var Sc,
        Pc = !1,
        Ac = function t(n, r, o, i) {
          if (!Pc || i) {
            Pc = !0;
            var a = i || new at.E();
            if ("complete" === document.readyState) {
              var s = null,
                u = null,
                l = null,
                d = null,
                m = null;
              if (window.performance) {
                if (window.performance.timing) {
                  var f = window.performance.timing,
                    _ = f.fetchStart;
                  (s = f.domLoading - _),
                    (u = f.domInteractive - _),
                    (l = f.domComplete - _),
                    (d = at.E.fromPosixTime(_).getElapsedTime(bc));
                }
                if (window.performance.getEntriesByType) {
                  var h = window.performance.getEntriesByType("resource"),
                    v = "https://js.stripe.com/v3/".replace(/\/$/, "");
                  m = h.reduce(function (e, t) {
                    if (0 === t.name.indexOf(v)) {
                      var n = t.name.match(/\/([^/#?]*)\/?(?:$|[#?])/);
                      if (n && n[1]) {
                        var r = n[1].replace(/-[0-9a-f]{32}\./, ".");
                        return (
                          "v3" === r && (r = "stripe.js"),
                          (0, c.Z)(
                            (0, c.Z)({}, e),
                            {},
                            (0, p.Z)({}, r, {
                              transfer_size: t.transferSize,
                              duration: Math.round(t.duration),
                            })
                          )
                        );
                      }
                    }
                    return e;
                  }, {});
                }
              }
              n.report("timings", {
                element: n.controllerFor(),
                dom_loading: s,
                dom_interactive: u,
                dom_complete: l,
                since_fetch: d,
                load_count: 1,
                load_before_dom_content_loaded: kc,
                load_ready_state: wc,
                first_create_ready_state: r,
                first_mount_readyState: o,
                until_first_create: bc.getElapsedTime(n._createTimestamp),
                until_first_mount: n._mountTimestamp
                  ? bc.getElapsedTime(n._mountTimestamp)
                  : null,
                until_first_load: bc.getElapsedTime(a),
                resource_timings: m,
              }),
                setTimeout(function () {
                  new B.J(function (t) {
                    if (_c.trustedTypes && _c.Promise) {
                      var n,
                        r = !1,
                        o = function (e) {
                          (hc.test(e.effectiveDirective) ||
                            hc.test(e.violatedDirective)) &&
                            ((0, y.vo)(e.blockedURI) ||
                              (0, y.vo)(e.sourceFile)) &&
                            (r = !0);
                        },
                        i = function () {
                          return r ? gc : yc;
                        };
                      _c.addEventListener(fc, o);
                      try {
                        n = e
                          .e(913)
                          .then(e.bind(e, 9554))
                          .then(function (e) {
                            return (e.loaded && r ? vc : "ALLOWED") || yc;
                          }, i);
                      } catch (e) {
                        n = new B.J(function (e) {
                          return setTimeout(e, 0);
                        }).then(i);
                      }
                      n.then(function () {
                        _c.removeEventListener(fc, o);
                      }),
                        t(n);
                    } else t("NOT_SUPPORTED");
                  }).then(function (e) {
                    n.report("trusted_types_check", { result: e }),
                      (function (e) {
                        switch (e) {
                          case vc:
                          case gc:
                            return !0;
                        }
                        return !1;
                      })(e) &&
                        n.warn(
                          "We noticed that you are using Trusted Types. Nothing has broken, but we plan to add dynamic loading to parts of Stripe.js. Please allow scripts from 'https://js.stripe.com' in your default Trusted Types policy. For more information: https://stripe.com/docs/security/guide#content-security-policy"
                        );
                  });
                }, 5e3);
            } else
              window.addEventListener("load", function () {
                try {
                  t(n, r, o, a);
                } catch (e) {}
              });
          }
        },
        Cc = (0, m.mC)({
          apiKey: m.Z_,
          stripeAccount: (0, m.jt)(m.Z_),
          locale: (0, m.jt)(m.Z_),
          apiVersion: (0, m.jt)(m.Z_),
          __privateApiUrl: (0, m.jt)(m.Z_),
          __checkout: (0, m.jt)(
            (0, m.mC)({ mids: (0, m.mC)({ muid: m.Z_, sid: m.Z_ }) })
          ),
          __dashboard: (0, m.jt)(m.Ry),
          __hosted3DS: (0, m.jt)(m.Xg),
          canCreateRadarSession: (0, m.jt)(m.Xg),
          betas: (0, m.jt)((0, m.CT)(m.Z_)),
        }),
        Nc = function (e) {
          return "You have an in-flight "
            .concat(
              e,
              "! Please be sure to disable your form submit button when "
            )
            .concat(e, " is called.");
        },
        Ic = function (e) {
          return function () {
            throw new b.No(
              "You cannot call `stripe.".concat(
                e,
                "` without supplying an appropriate beta flag when initializing Stripe.js."
              )
            );
          };
        },
        Tc = function (e) {
          return function () {
            throw new b.No(
              "You cannot call `stripe.".concat(
                e,
                "` without supplying an Issuing beta flag when initializing Stripe.js."
              )
            );
          };
        },
        Mc = Po(1),
        jc = (function () {
          function t(e, n) {
            var r = this;
            (0, u.Z)(this, t),
              (this._listenerRegistry = (0, Tt.E)()),
              (this.elements = C(
                function (e) {
                  return new Qr(
                    r._controller,
                    r._listenerRegistry,
                    {
                      stripeJsLoadTimestamp: bc,
                      stripeCreateTimestamp: r._controller._createTimestamp,
                    },
                    r._betas,
                    r._mids(),
                    (0, c.Z)(
                      (0, c.Z)({}, r._locale ? { locale: r._locale } : {}),
                      e
                    )
                  );
                },
                void 0,
                "elements"
              )),
              (this.createToken = M(
                function (e, t) {
                  var n = r._mids();
                  return "cvc_update" === e
                    ? (function (e, t, n) {
                        var r = (0, m.rX)(t);
                        if (r && "cardCvc" === r._componentName) {
                          var o = r._implementation._frame.id;
                          return e.action
                            .tokenizeCvcUpdate({ frameId: o, mids: n })
                            .then(pc);
                        }
                        throw new b.No(
                          "You must provide a `cardCvc` Element to create a `cvc_update` token."
                        );
                      })(r._controller, t, n)
                    : (function (e, t) {
                        return function (n, r) {
                          var o = (0, m.rX)(n);
                          if (o) {
                            var i = o._implementation._frame.id,
                              a = o._componentName,
                              c = dc(r);
                            return e.action
                              .tokenizeWithElement({
                                frameId: i,
                                elementName: a,
                                tokenData: c,
                                mids: t,
                              })
                              .then(pc);
                          }
                          if ("string" == typeof n) {
                            var s = n,
                              u = dc(r);
                            return e.action
                              .tokenizeWithData({
                                elementName: null,
                                type: s,
                                tokenData: u,
                                mids: t,
                              })
                              .then(pc);
                          }
                          throw new b.No(
                            "You must provide a Stripe Element or a valid token type to create a Token."
                          );
                        };
                      })(r._controller, n)(e, t);
                },
                void 0,
                "createToken"
              )),
              (this.createSource = M(
                function (e, t) {
                  var n = (0, m.rX)(e),
                    o = Zo(n ? t : e),
                    i = o || { type: null, data: {} },
                    a = i.type,
                    c = i.data;
                  if (n) {
                    var s = n._implementation._frame.id,
                      u = n._componentName;
                    return !o && (0, no.ke)(u)
                      ? B.J.reject(
                          new b.No(
                            "Please provide Source creation parameters to createSource."
                          )
                        )
                      : r._controller.action
                          .createSourceWithElement({
                            frameId: s,
                            elementName: u,
                            type: a,
                            sourceData: c,
                            mids: r._mids(),
                          })
                          .then(xo);
                  }
                  return o
                    ? a
                      ? r._controller.action
                          .createSourceWithData({
                            elementName: null,
                            type: a,
                            sourceData: c,
                            mids: r._mids(),
                          })
                          .then(xo)
                      : B.J.reject(
                          new b.No(
                            "Please provide a source type to createSource."
                          )
                        )
                    : B.J.reject(
                        new b.No(
                          "Please provide either an Element or Source creation parameters to createSource."
                        )
                      );
                },
                void 0,
                "createSource"
              )),
              (this.retrieveSource = T(
                function (e) {
                  var t = (0, m.Gu)(Do, { source: e }, "retrieveSource"),
                    n = t.value;
                  return (
                    t.warnings.forEach(function (e) {
                      return r._controller.warn(e);
                    }),
                    r._controller.action.retrieveSource(n).then(xo)
                  );
                },
                void 0,
                "retrieveSource"
              )),
              (this.paymentRequest = N(
                function (e, t) {
                  (0, Oe.pF)(r._keyMode);
                  var n = r._isCheckout && t ? t : null;
                  return $r(
                    r._controller,
                    { apiKey: r._apiKey, accountId: r._stripeAccount },
                    r._mids(),
                    e,
                    r._betas,
                    n,
                    r._listenerRegistry
                  );
                },
                void 0,
                "paymentRequest"
              ));
            var o = new at.E(),
              i = (0, m.Gu)(Cc, e || {}, "Stripe()"),
              a = i.value,
              s = i.warnings;
            if (
              (function (e) {
                for (var t = 0, n = 0; n < e.length; n++) t += e.charCodeAt(n);
                return t % 100;
              })(a.apiKey) < 0 &&
              (h.JW || h.tS)
            )
              throw new Error(
                "Stripe.JS is no longer supported in this browser. See https://stripe.com/docs/js/appendix/supported_browsers for more information."
              );
            var l = a.apiKey,
              p = a.stripeAccount,
              d = a.apiVersion,
              f = a.locale,
              _ = a.__dashboard,
              y = a.__privateApiUrl,
              g = a.__checkout,
              w = a.__hosted3DS,
              E = (a.canCreateRadarSession, a.betas),
              S = (0, v.dZ)(E || null),
              P = S.validBetas,
              A = S.betaWarning;
            A && s.push(A),
              (0, Oe.Tj)(l),
              (null == g ? void 0 : g.mids) &&
                (t._ec = Kt({ checkoutIds: g.mids })),
              (this._apiKey = l.trim()),
              (this._keyMode = (0, Oe.lO)(this._apiKey)),
              (this._betas = P),
              (this._locale = (0, v.jk)(f, this._betas) || null),
              (this._stripeAccount = p || null),
              (this._isCheckout = !!g);
            var I = _ ? "".concat(k.J_) : void 0;
            this._attachControllerGetter(d, y, I, p, o),
              s.forEach(function (e) {
                return r._controller.warn(e);
              }),
              fo(),
              this._ensureHTTPOnlyLinkCookie(),
              this._ensureHTTPS(),
              this._ensureStripeHosted(n),
              this._attachPaymentIntentMethods(this._betas, !!w),
              this._attachLegacyPaymentIntentMethods(this._betas),
              this._attachCheckoutMethods(this._betas),
              this._attachPrivateMethodsForCheckout(this._isCheckout),
              this._attachPrivateMethodsForConsumer(It),
              this._attachCreateRadarSession(),
              this._attachGetters(),
              this._attachIssuingCardMethods(this._betas),
              this._attachIdentityMethods(this._betas),
              this._attachLinkedAccountsMethods(this._betas),
              this._attachAppInfo();
          }
          return (
            (0, l.Z)(t, [
              {
                key: "_attachCreateRadarSession",
                value: function () {
                  var e = this;
                  this.createRadarSession = I(function () {
                    return e._midsPromise().then(function (t) {
                      return (
                        (n = e._controller),
                        (r = t),
                        n.action.createRadarSession({ mids: r }).then(mc)
                      );
                      var n, r;
                    });
                  });
                },
              },
              {
                key: "_attachPaymentIntentMethods",
                value: function (t, n) {
                  var r,
                    o,
                    i,
                    a = this,
                    c = function () {
                      return a._mids();
                    };
                  (this.createPaymentMethod =
                    ((r = function () {
                      for (
                        var e = arguments.length, n = new Array(e), r = 0;
                        r < e;
                        r++
                      )
                        n[r] = arguments[r];
                      return qo.apply(
                        void 0,
                        [a._controller, c(), t].concat(n)
                      );
                    }),
                    (o = void 0),
                    (i = "createPaymentMethod"),
                    function (e, t, n) {
                      try {
                        return r.call(this, e, t, n);
                      } catch (e) {
                        return A(e, o || (this && this._controller), !1, i);
                      }
                    })),
                    (this._createPaymentMethod = this.createPaymentMethod),
                    (this.retrievePaymentIntent = T(
                      function (e) {
                        return (function (e, t) {
                          var n = (0, Vn.cn)(e, "retrievePaymentIntent");
                          return t.action
                            .retrievePaymentIntent({
                              intentSecret: n,
                              hosted: !1,
                            })
                            .then(Uo.PA);
                        })(e, a._controller);
                      },
                      void 0,
                      "retrievePaymentIntent"
                    )),
                    (this.retrieveSetupIntent = T(
                      function (e) {
                        return (function (e, t) {
                          var n = (0, Vn.jH)(e, "retrieveSetupIntent");
                          return t.action
                            .retrieveSetupIntent({
                              intentSecret: n,
                              hosted: !1,
                            })
                            .then(Uo.e3);
                        })(e, a._controller);
                      },
                      void 0,
                      "retrieveSetupIntent"
                    )),
                    (this.updatePaymentIntent = Ic("updatePaymentIntent")),
                    (0, v.uN)(this._betas, v.M4.line_items_beta_1) ||
                    (0, v.uN)(this._betas, v.M4.tax_product_beta_1)
                      ? (this.updatePaymentIntent = M(
                          function () {
                            for (
                              var e = arguments.length, t = new Array(e), n = 0;
                              n < e;
                              n++
                            )
                              t[n] = arguments[n];
                            return Zi.apply(
                              void 0,
                              [a._controller, c()].concat(t)
                            );
                          },
                          void 0,
                          "updatePaymentIntent"
                        ))
                      : (0, v.uN)(
                          this._betas,
                          v.M4.server_side_confirmation_beta_1
                        ) &&
                        (this.updatePaymentIntent = T(
                          function (e) {
                            return (function (e, t, n) {
                              var r = Ko(
                                e,
                                t,
                                n,
                                "payment",
                                "stripe.updatePaymentIntent()"
                              );
                              return e.action
                                .updatePaymentIntent(r)
                                .then(Uo.PA);
                            })(a._controller, c(), e);
                          },
                          void 0,
                          "updatePaymentIntent"
                        ));
                  var s = (0, q.AO)(qi, Nc("handleCardAction"));
                  this.handleCardAction = T(
                    function (e) {
                      return s(e, a._controller);
                    },
                    void 0,
                    "handleCardAction"
                  );
                  var u = (0, q.AO)(ia, Nc("handleNextAction"));
                  this.handleNextAction = T(
                    function () {
                      for (
                        var e = arguments.length, t = new Array(e), n = 0;
                        n < e;
                        n++
                      )
                        t[n] = arguments[n];
                      return u.apply(void 0, [a._controller].concat(t));
                    },
                    void 0,
                    "handleNextAction"
                  );
                  var l = (0, q.AO)(ni, Nc("confirmCardPayment"));
                  this.confirmCardPayment = j(
                    function () {
                      for (
                        var e = arguments.length, t = new Array(e), n = 0;
                        n < e;
                        n++
                      )
                        t[n] = arguments[n];
                      return l.apply(void 0, [a._controller, c()].concat(t));
                    },
                    void 0,
                    "confirmCardPayment"
                  );
                  var p = (0, q.AO)(wa, Nc("confirmCardSetup"));
                  (this.confirmCardSetup = j(
                    function () {
                      for (
                        var e = arguments.length, t = new Array(e), n = 0;
                        n < e;
                        n++
                      )
                        t[n] = arguments[n];
                      return p.apply(void 0, [a._controller, c()].concat(t));
                    },
                    void 0,
                    "confirmCardSetup"
                  )),
                    (this.confirmIdealPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return ci.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmIdealPayment"
                    )),
                    (this.confirmSepaDebitPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return hi.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmSepaDebitPayment"
                    )),
                    (this.confirmSepaDebitSetup = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return ka.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmSepaDebitSetup"
                    )),
                    (this.confirmFpxPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return oi.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmFpxPayment"
                    )),
                    (this.confirmAlipayPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return di.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmAlipayPayment"
                    )),
                    (this.confirmAlipaySetup = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return Aa.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmAlipaySetup"
                    )),
                    (this.confirmAuBecsDebitPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return Qo.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmAuBecsDebitPayment"
                    )),
                    (this.confirmAuBecsDebitSetup = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return Ea.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmAuBecsDebitSetup"
                    )),
                    (this.confirmBacsDebitPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return $o.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmBacsDebitPayment"
                    )),
                    (this.confirmBacsDebitSetup = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return Sa.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmBacsDebitSetup"
                    )),
                    (this.confirmBancontactPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return ei.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmBancontactPayment"
                    )),
                    (this.confirmBoletoPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return ti.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmBoletoPayment"
                    )),
                    (this.confirmEpsPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return ri.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmEpsPayment"
                    )),
                    (this.confirmGiropayPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return ii.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmGiropayPayment"
                    )),
                    (this.confirmOxxoPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return pi.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmOxxoPayment"
                    )),
                    (this.confirmP24Payment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return mi.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmP24Payment"
                    )),
                    (this.confirmSofortPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return yi.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmSofortPayment"
                    )),
                    (this.confirmIdealSetup = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return Pa.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmIdealSetup"
                    )),
                    (this.confirmSofortSetup = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return Ca.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmSofortSetup"
                    )),
                    (this.confirmBancontactSetup = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return Na.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmBancontactSetup"
                    )),
                    (this.confirmGrabPayPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return ai.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmGrabPayPayment"
                    )),
                    (this.confirmAffirmPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return Vo.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmAffirmPayment"
                    )),
                    (this.confirmAfterpayClearpayPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return Xo.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmAfterpayClearpayPayment"
                    )),
                    (this.verifyMicrodepositsForPayment = M(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return Li.apply(void 0, [a._controller].concat(t));
                      },
                      void 0,
                      "verifyMicrodepositsForPayment"
                    )),
                    (this.verifyMicrodepositsForSetup = M(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return Ra.apply(void 0, [a._controller].concat(t));
                      },
                      void 0,
                      "verifyMicrodepositsForSetup"
                    )),
                    (this.confirmPayment = T(
                      function (e) {
                        return (function (e, t, n, r) {
                          var o = (0, Yo.Qw)(
                              e,
                              t,
                              n,
                              r,
                              "payment",
                              "stripe.confirmPayment()"
                            ),
                            i = o.intentMutationRequest,
                            a = e.action.confirmPaymentIntent(i);
                          return (0, v.uN)(
                            n,
                            v.M4.server_side_confirmation_beta_1
                          ) &&
                            null !== i.options &&
                            !i.options.handleActions
                            ? a.then(Uo.PA).then(xi)
                            : a
                                .then(
                                  (0, Go.nq)(
                                    e,
                                    !1,
                                    !1,
                                    !0,
                                    i.otherParams.expand
                                  )
                                )
                                .then(function (t) {
                                  var n = xi(t);
                                  return "selectedPaymentMethod" in n
                                    ? n
                                    : t.error || "always" !== o.redirect
                                    ? t
                                    : (0, Fo.U)(
                                        (0, Vn.z2)(o.returnUrl, t.paymentIntent)
                                      ).then(function (n) {
                                        return (
                                          (0, Fo.d)(
                                            e,
                                            "confirmPayment redirect",
                                            n
                                          ),
                                          (0, Uo.PA)(n, t.paymentIntent)
                                        );
                                      });
                                });
                        })(a._controller, c(), a._betas, e);
                      },
                      void 0,
                      "confirmPayment"
                    )),
                    (this.confirmSetup = T(
                      function (e) {
                        return (function (e, t, n, r) {
                          var o = (0, Yo.Qw)(
                              e,
                              t,
                              n,
                              r,
                              "setup",
                              "stripe.confirmSetup()"
                            ),
                            i = o.intentMutationRequest,
                            a = e.action.confirmSetupIntent(i);
                          return (0, v.uN)(
                            n,
                            v.M4.server_side_confirmation_beta_1
                          ) &&
                            null !== i.options &&
                            !i.options.handleActions
                            ? a.then(Uo.e3).then(Oa)
                            : a
                                .then(oa(e, !1, !1, i.otherParams.expand))
                                .then(function (t) {
                                  var n = Oa(t);
                                  return "selectedPaymentMethod" in n
                                    ? n
                                    : t.error || "always" !== o.redirect
                                    ? t
                                    : (0, Fo.U)(
                                        (0, Vn.z2)(o.returnUrl, t.setupIntent)
                                      ).then(function (n) {
                                        return (
                                          (0, Fo.d)(
                                            e,
                                            "confirmSetup redirect",
                                            n
                                          ),
                                          (0, Uo.e3)(n, t.setupIntent)
                                        );
                                      });
                                });
                        })(a._controller, c(), a._betas, e);
                      },
                      void 0,
                      "confirmSetup"
                    )),
                    (this.confirmKlarnaPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return si.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmKlarnaPayment"
                    )),
                    (0, v.uN)(this._betas, v.M4.process_order_beta_1) &&
                      ((this.processOrder = T(
                        function (t) {
                          var n = (0, m.ld)(
                            (0, m.mC)({ elements: m.oQ }),
                            t,
                            "elements"
                          );
                          return (
                            "valid" === n.type
                              ? a._controller.action.showWalletIfNecessary(
                                  n.value.elements._id
                                )
                              : B.J.resolve(null)
                          ).then(function (n) {
                            return e
                              .e(404)
                              .then(e.bind(e, 6217))
                              .then(function (e) {
                                return (0,
                                e.processOrder)(a._controller, c(), a._betas, t, n);
                              });
                          });
                        },
                        void 0,
                        "processOrder"
                      )),
                      (this.retrieveOrder = T(
                        function (t) {
                          return e
                            .e(404)
                            .then(e.bind(e, 6217))
                            .then(function (e) {
                              return (0, e.retrieveOrder)(t, a._controller);
                            });
                        },
                        void 0,
                        "retrieveOrder"
                      )),
                      (this.updateOrder = T(
                        function (t) {
                          return e
                            .e(404)
                            .then(e.bind(e, 6217))
                            .then(function (e) {
                              return (0, e.updateOrder)(a._controller, t);
                            });
                        },
                        void 0,
                        "updateOrder"
                      )),
                      (this.addPromotionCodeToOrder = T(
                        function (t) {
                          return e
                            .e(404)
                            .then(e.bind(e, 6217))
                            .then(function (e) {
                              return (0,
                              e.addPromotionCodeToOrder)(a._controller, t);
                            });
                        },
                        void 0,
                        "addPromotionCodeToOrder"
                      )),
                      (this.removePromotionCodeFromOrder = T(
                        function (t) {
                          return e
                            .e(404)
                            .then(e.bind(e, 6217))
                            .then(function (e) {
                              return (0,
                              e.removePromotionCodeFromOrder)(a._controller, t);
                            });
                        },
                        void 0,
                        "removePromotionCodeFromOrder"
                      ))),
                    (this.collectBankAccountForPayment = T(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return Bi.apply(void 0, [a._controller].concat(t));
                      },
                      void 0,
                      "collectBankAccountForPayment"
                    )),
                    (this.collectBankAccountForSetup = T(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return xa.apply(void 0, [a._controller].concat(t));
                      },
                      void 0,
                      "collectBankAccountForSetup"
                    )),
                    (0, v.uN)(this._betas, v.M4.us_bank_account_beta_2) &&
                      ((this.collectUsBankAccountForPayment = M(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return Di.apply(void 0, [a._controller].concat(t));
                        },
                        void 0,
                        "collectUsBankAccountForPayment"
                      )),
                      (this.collectUsBankAccountForSetup = M(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return Za.apply(void 0, [a._controller].concat(t));
                        },
                        void 0,
                        "collectUsBankAccountForSetup"
                      ))),
                    (0, v.uN)(this._betas, v.M4.acss_debit_beta_1)
                      ? ((this.confirmAcssDebitPayment = j(
                          function () {
                            for (
                              var e = arguments.length, t = new Array(e), n = 0;
                              n < e;
                              n++
                            )
                              t[n] = arguments[n];
                            return Wo.apply(
                              void 0,
                              [a._controller, c()].concat(t)
                            );
                          },
                          void 0,
                          "confirmAcssDebitPayment"
                        )),
                        (this.confirmAcssDebitSetup = j(
                          function () {
                            for (
                              var e = arguments.length, t = new Array(e), n = 0;
                              n < e;
                              n++
                            )
                              t[n] = arguments[n];
                            return ga.apply(
                              void 0,
                              [a._controller, c()].concat(t)
                            );
                          },
                          void 0,
                          "confirmAcssDebitSetup"
                        )))
                      : ((this.confirmAcssDebitPayment = j(
                          function () {
                            for (
                              var e = arguments.length, t = new Array(e), n = 0;
                              n < e;
                              n++
                            )
                              t[n] = arguments[n];
                            return Hi.apply(
                              void 0,
                              [a._controller, c()].concat(t)
                            );
                          },
                          void 0,
                          "confirmAcssDebitPayment"
                        )),
                        (this.confirmAcssDebitSetup = j(
                          function () {
                            for (
                              var e = arguments.length, t = new Array(e), n = 0;
                              n < e;
                              n++
                            )
                              t[n] = arguments[n];
                            return Ki.apply(
                              void 0,
                              [a._controller, c()].concat(t)
                            );
                          },
                          void 0,
                          "confirmAcssDebitSetup"
                        ))),
                    (this.confirmAfterpayClearpaySetup = Ic(
                      "confirmAfterpayClearpaySetup"
                    )),
                    (0, v.uN)(
                      this._betas,
                      v.M4.afterpay_clearpay_setup_intents_beta
                    ) &&
                      (this.confirmAfterpayClearpaySetup = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return ba.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmAfterpayClearpaySetup"
                      )),
                    (this.confirmBlikPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return ki.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmBlikPayment"
                    )),
                    (this.confirmCustomerBalancePayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return Si.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmCustomerBalancePayment"
                    )),
                    (0, v.uN)(this._betas, v.M4.return_intents_beta_1) &&
                      (this.confirmReturnIntent = M(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return ya.apply(void 0, [a._controller].concat(t));
                        },
                        void 0,
                        "confirmReturnIntent"
                      )),
                    (this.confirmKonbiniPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return ui.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmKonbiniPayment"
                    )),
                    (this.confirmMobilepayPayment = Ic(
                      "confirmMobilepayPayment"
                    )),
                    (0, v.uN)(this._betas, v.M4.mobilepay_pm_beta_1) &&
                      (this.confirmMobilepayPayment = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return li.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmMobilepayPayment"
                      )),
                    (0, v.uN)(this._betas, v.M4.oxxo_pm_beta_1) &&
                      (this.confirmOxxoPayment = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return pi.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmOxxoPayment"
                      )),
                    (this.confirmWechatPayPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return Ai.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmWechatPayPayment"
                    )),
                    (0, v.uN)(this._betas, v.M4.wechat_pay_pm_beta_1) &&
                      (this.confirmWechatPayPayment = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return Pi.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmWechatPayPayment"
                      )),
                    (0, v.uN)(this._betas, v.M4.wechat_pay_pm_beta_3) &&
                      (this.confirmWechatPayPayment = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return Ai.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmWechatPayPayment"
                      )),
                    (this.confirmPayByBankPayment = Ic(
                      "confirmPayByBankPayment"
                    )),
                    (0, v.uN)(this._betas, v.M4.pay_by_bank_beta_1) &&
                      (this.confirmPayByBankPayment = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return fi.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmPayByBankPayment"
                      )),
                    (this.confirmCashappPayment = Ic("confirmCashappPayment")),
                    (0, v.uN)(this._betas, v.M4.cashapp_beta_1) &&
                      (this.confirmCashappPayment = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return Ci.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmCashappPayPayment"
                      )),
                    (this.confirmPayNowPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return Ni.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmPayNowPayPayment"
                    )),
                    (0, v.uN)(this._betas, v.M4.wechat_pay_pm_beta_1) &&
                      (this.confirmPayNowPayment = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return Ii.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmPayNowPayment"
                      )),
                    (this.confirmPixPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return Ti.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmPixPayment"
                    )),
                    (this.confirmPromptPayPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return Mi.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmPromptPayPayment"
                    )),
                    (this.confirmPayPalPayment = Ic("confirmPayPalPayment")),
                    (0, v.uN)(this._betas, v.M4.paypal_pm_beta_1) &&
                      (this.confirmPayPalPayment = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return _i.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmPayPalPayment"
                      )),
                    (0, v.uN)(this._betas, v.M4.paypal_pm_beta_1) &&
                      (this.confirmPayPalSetup = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return Ta.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmPayPalSetup"
                      )),
                    (this.confirmQrisPayment = Ic("confirmQrisPayment")),
                    (0, v.uN)(this._betas, v.M4.qris_beta_1) &&
                      (this.confirmQrisPayment = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return ji.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmQrisPayment"
                      )),
                    (this.confirmRevolutPayPayment = Ic(
                      "confirmRevolutPayPayment"
                    )),
                    (0, v.uN)(this._betas, v.M4.revolut_pay_pm_beta_1) &&
                      (this.confirmRevolutPayPayment = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return Oi.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmRevolutPayPayment"
                      )),
                    (this.confirmZipPayment = Ic("confirmZipPayment")),
                    (0, v.uN)(this._betas, v.M4.zip_beta_1) &&
                      (this.confirmZipPayment = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return Ei.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmZipPayment"
                      )),
                    (this.confirmUpiPayment = Ic("confirmUpiPayment")),
                    (0, v.uN)(this._betas, v.M4.upi_beta_1) &&
                      (this.confirmUpiPayment = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return gi.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmUpiPayment"
                      )),
                    (this.confirmUsBankAccountPayment = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return bi.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmUsBankAccountPayment"
                    )),
                    (this.confirmUsBankAccountSetup = j(
                      function () {
                        for (
                          var e = arguments.length, t = new Array(e), n = 0;
                          n < e;
                          n++
                        )
                          t[n] = arguments[n];
                        return Ma.apply(void 0, [a._controller, c()].concat(t));
                      },
                      void 0,
                      "confirmUsBankAccountSetup"
                    )),
                    (0, v.uN)(this._betas, v.M4.nz_bank_account_beta_1) &&
                      ((this.confirmNzBankAccountPayment = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return wi.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmNzBankAccountPayment"
                      )),
                      (this.confirmNzBankAccountSetup = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return ja.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmNzBankAccountSetup"
                      ))),
                    (this.confirmNetbankingPayment = Ic(
                      "confirmNetbankingPayment"
                    )),
                    (0, v.uN)(this._betas, v.M4.netbanking_beta_1) &&
                      (this.confirmNetbankingPayment = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return Ri.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmNetbankingPayment"
                      )),
                    (this.confirmInstantDebitsPilotPayment = Ic(
                      "confirmInstantDebitsPilotPayment"
                    )),
                    (0, v.uN)(this._betas, v.M4.instant_debits_beta_1) &&
                      (this.confirmInstantDebitsPilotPayment = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return Vi.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmInstantDebitsPilotPayment"
                      )),
                    (this.linkAutofillModal = Ic("linkAutofillModal")),
                    (0, v.uN)(this._betas, v.M4.link_autofill_modal_beta_1) &&
                      (this.linkAutofillModal = C(
                        function (e) {
                          return (function (e, t, n) {
                            var r = function (e) {
                                throw new b.No(
                                  "stripe.linkAutofill.".concat(
                                    e,
                                    " can only be called when the user is logged-in."
                                  )
                                );
                              },
                              o = !1,
                              i = !1,
                              a = e.createLightboxFrame({
                                type: Be.NC.LINK_AUTOFILL_MODAL,
                                options: {
                                  apiKey: e._apiKey,
                                  stripeAccount: e._stripeAccount,
                                  locale: n || "",
                                },
                                groupId: t._id,
                              }),
                              c = function () {
                                (o = !0), a.show(), a.fadeInBackdrop();
                              },
                              s = function () {
                                (o = !1), a.fadeOutBackdrop();
                              };
                            a._on("open", function () {
                              c();
                            }),
                              a._on("cancel", function () {
                                s();
                              });
                            var u = [];
                            a._on(
                              "link-autofill-modal-authenticated",
                              function (e) {
                                (i = !0),
                                  u.forEach(function (t) {
                                    t({ value: { email: e.emailAddress } });
                                  });
                              }
                            );
                            var l = [];
                            return (
                              a._on(
                                "link-autofill-modal-autofill-info",
                                function (e) {
                                  s(),
                                    l.forEach(function (t) {
                                      t({
                                        empty: !e.info.hasPaymentDetails,
                                        value: {
                                          shippingAddress:
                                            e.info.shippingAddress,
                                          billingAddress: e.info.billingAddress,
                                        },
                                      });
                                    });
                                }
                              ),
                              {
                                on: function (t, n) {
                                  if ("function" != typeof n)
                                    throw new b.No(
                                      "stripe.linkAutofill.on: Expected the handler to be a function."
                                    );
                                  switch (t) {
                                    case "authenticated":
                                      u.push(C(n, e, "authenticationHandler"));
                                      break;
                                    case "autofill":
                                      l.push(C(n, e, "autofillHandler"));
                                      break;
                                    default:
                                      throw new b.No(
                                        "stripe.linkAutofill.on: Expected either 'authenticated' or 'autofill' as an event name."
                                      );
                                  }
                                },
                                launch: function (e) {
                                  var t = e.email;
                                  a.send({
                                    action:
                                      "stripe-link-autofill-modal-email-attempt",
                                    payload: { email: t },
                                  });
                                },
                                show: function () {
                                  i || r("show"), o || c();
                                },
                                logout: function () {
                                  if ((i || r("logout"), o))
                                    throw new b.No(
                                      "stripe.linkAutofill.logout can only be called when the modal is closed. Did you call it from outside a click event?"
                                    );
                                  (i = !1),
                                    a.send({
                                      action:
                                        "stripe-link-autofill-modal-logout",
                                      payload: {},
                                    });
                                },
                              }
                            );
                          })(a._controller, e, a._locale);
                        },
                        void 0,
                        "linkAutofillModal"
                      )),
                    (this.confirmIdBankTransferPayment = Ic(
                      "confirmIdBankTransferPayment"
                    )),
                    (this.confirmIdBankTransferSetup = Ic(
                      "confirmIdBankTransferSetup"
                    )),
                    ((0, v.uN)(this._betas, v.M4.id_bank_transfer_beta_1) ||
                      (0, v.uN)(this._betas, v.M4.id_bank_transfer_beta_2)) &&
                      ((this.confirmIdBankTransferPayment = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return vi.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmIdBankTransferPayment"
                      )),
                      (this.confirmIdBankTransferSetup = j(
                        function () {
                          for (
                            var e = arguments.length, t = new Array(e), n = 0;
                            n < e;
                            n++
                          )
                            t[n] = arguments[n];
                          return Ia.apply(
                            void 0,
                            [a._controller, c()].concat(t)
                          );
                        },
                        void 0,
                        "confirmIdBankTransferSetup"
                      ))),
                    n &&
                      ((this.handleHosted3DS2Payment = T(function (e) {
                        return (function (e, t) {
                          var n = (0, Vn.cn)(
                            e,
                            "handleHosted3DS2Setup [internal]"
                          );
                          return t.action
                            .retrievePaymentIntent({
                              intentSecret: n,
                              hosted: !0,
                            })
                            .then((0, Go.nq)(t, !1, !0, !1));
                        })(e, a._controller);
                      })),
                      (this.handleHosted3DS2Setup = T(function (e) {
                        return (function (e, t) {
                          var n = (0, Vn.jH)(
                            e,
                            "handleHosted3DS2Setup [internal]"
                          );
                          return t.action
                            .retrieveSetupIntent({
                              intentSecret: n,
                              hosted: !0,
                            })
                            .then(oa(t, !1, !0));
                        })(e, a._controller);
                      })));
                },
              },
              {
                key: "_attachLegacyPaymentIntentMethods",
                value: function () {
                  var e = this,
                    t =
                      (0, v.uN)(this._betas, v.M4.payment_intent_beta_1) ||
                      (0, v.uN)(this._betas, v.M4.payment_intent_beta_2),
                    n = function () {
                      return e._mids();
                    },
                    r = j(
                      function () {
                        for (
                          var t = arguments.length, r = new Array(t), o = 0;
                          o < t;
                          o++
                        )
                          r[o] = arguments[o];
                        return pa.apply(
                          void 0,
                          [!0, e._controller, n()].concat(r)
                        );
                      },
                      void 0,
                      "confirmPaymentIntent"
                    ),
                    o = j(
                      function () {
                        for (
                          var t = arguments.length, r = new Array(t), o = 0;
                          o < t;
                          o++
                        )
                          r[o] = arguments[o];
                        return pa.apply(
                          void 0,
                          [!1, e._controller, n()].concat(r)
                        );
                      },
                      void 0,
                      "confirmPaymentIntent"
                    ),
                    i = (0, q.AO)(da, Nc("handleCardPayment")),
                    a = j(
                      function () {
                        for (
                          var r = arguments.length, o = new Array(r), a = 0;
                          a < r;
                          a++
                        )
                          o[a] = arguments[a];
                        return i.apply(
                          void 0,
                          [!0, e._controller, n(), t].concat(o)
                        );
                      },
                      void 0,
                      "handleCardPayment"
                    ),
                    c = j(
                      function () {
                        for (
                          var r = arguments.length, o = new Array(r), a = 0;
                          a < r;
                          a++
                        )
                          o[a] = arguments[a];
                        return i.apply(
                          void 0,
                          [!1, e._controller, n(), t].concat(o)
                        );
                      },
                      void 0,
                      "handleCardPayment"
                    ),
                    s = (0, q.AO)(La, Nc("handleCardSetup")),
                    u = j(
                      function () {
                        for (
                          var t = arguments.length, r = new Array(t), o = 0;
                          o < t;
                          o++
                        )
                          r[o] = arguments[o];
                        return s.apply(void 0, [e._controller, n()].concat(r));
                      },
                      void 0,
                      "handleCardSetup"
                    ),
                    l = j(
                      function () {
                        for (
                          var t = arguments.length, r = new Array(t), o = 0;
                          o < t;
                          o++
                        )
                          r[o] = arguments[o];
                        return Ba.apply(void 0, [e._controller, n()].concat(r));
                      },
                      void 0,
                      "confirmSetupIntent"
                    ),
                    p = j(
                      function () {
                        for (
                          var r = arguments.length, o = new Array(r), i = 0;
                          i < r;
                          i++
                        )
                          o[i] = arguments[i];
                        return ma.apply(
                          void 0,
                          [e._controller, n(), t].concat(o)
                        );
                      },
                      void 0,
                      "handleSepaDebitPayment"
                    ),
                    d = j(
                      function () {
                        for (
                          var t = arguments.length, r = new Array(t), o = 0;
                          o < t;
                          o++
                        )
                          r[o] = arguments[o];
                        return Da.apply(void 0, [e._controller, n()].concat(r));
                      },
                      void 0,
                      "handleSepaDebitSetup"
                    ),
                    m = j(
                      function () {
                        for (
                          var r = arguments.length, o = new Array(r), i = 0;
                          i < r;
                          i++
                        )
                          o[i] = arguments[i];
                        return fa.apply(
                          void 0,
                          [!0, e._controller, n(), t].concat(o)
                        );
                      },
                      void 0,
                      "handleIdealPayment"
                    ),
                    f = j(
                      function () {
                        for (
                          var r = arguments.length, o = new Array(r), i = 0;
                          i < r;
                          i++
                        )
                          o[i] = arguments[i];
                        return fa.apply(
                          void 0,
                          [!1, e._controller, n(), t].concat(o)
                        );
                      },
                      void 0,
                      "handleIdealPayment"
                    ),
                    _ = j(
                      function () {
                        for (
                          var r = arguments.length, o = new Array(r), i = 0;
                          i < r;
                          i++
                        )
                          o[i] = arguments[i];
                        return _a.apply(
                          void 0,
                          [e._controller, n(), t].concat(o)
                        );
                      },
                      void 0,
                      "handleFpxPayment"
                    );
                  (this.handleCardPayment = c),
                    (this.confirmPaymentIntent = o),
                    (this.handleCardSetup = u),
                    (this.confirmSetupIntent = l),
                    (this.fulfillPaymentIntent = Ic("fulfillPaymentIntent")),
                    (this.handleSepaDebitPayment = Ic(
                      "handleSepaDebitPayment"
                    )),
                    (this.handleSepaDebitSetup = Ic("handleSepaDebitSetup")),
                    (this.handleIdealPayment = Ic("handleIdealPayment")),
                    (this.handleFpxPayment = Ic("handleFpxPayment")),
                    (0, v.uN)(this._betas, v.M4.payment_intent_beta_1)
                      ? (this.fulfillPaymentIntent = a)
                      : ((0, v.uN)(this._betas, v.M4.payment_intent_beta_3) ||
                          (0, v.uN)(this._betas, v.M4.payment_intent_beta_2)) &&
                        (this.handleCardPayment = a),
                    (0, v.uN)(this._betas, v.M4.payment_intent_beta_3) &&
                      ((this.confirmPaymentIntent = r),
                      (this.handleIdealPayment = m),
                      (this.handleSepaDebitPayment = p)),
                    (0, v.uN)(this._betas, v.M4.fpx_bank_beta_1) &&
                      (this.handleFpxPayment = _),
                    (0, v.uN)(this._betas, v.M4.ideal_pm_beta_1) &&
                      (this.handleIdealPayment = f),
                    (0, v.uN)(this._betas, v.M4.sepa_pm_beta_1) &&
                      ((this.handleSepaDebitPayment = p),
                      (this.handleSepaDebitSetup = d));
                },
              },
              {
                key: "_attachPrivateMethodsForCheckout",
                value: function (e) {
                  var t = this;
                  e &&
                    ((this.sendInteractionEvent = Wt),
                    (this.tryNextAction = M(function (e) {
                      var n = (0, m.Gu)(bn.LK, e, "Payment Intent").value;
                      return "payment_intent" === n.object
                        ? (0, Go.gO)(t._controller, n, "auto", !1, !1)
                        : ra(t._controller, n, "auto", !1);
                    })));
                },
              },
              {
                key: "_attachCheckoutMethods",
                value: function (e) {
                  var t = this,
                    n = function () {
                      return t._mids();
                    },
                    r = e.reduce(function (e, t) {
                      var n = (0, g.sE)(Xa, function (e) {
                        return e === t;
                      });
                      return n ? [].concat((0, s.Z)(e), [n]) : e;
                    }, []);
                  this.redirectToCheckout = function (e) {
                    return (function (e, t, n, r, o) {
                      var i = uc(t, r, o, e.keyMode());
                      if (
                        (e.report("redirect_to_checkout.options", {
                          betas: t,
                          options: (0, g.ei)(i, ["mode", "sessionId"]),
                          globalLocale: r,
                        }),
                        "session" === i.tag)
                      ) {
                        var a = i.sessionId;
                        return e.action
                          .createPaymentPageWithSession({
                            betas: t,
                            mids: n(),
                            sessionId: a,
                          })
                          .then(function (t) {
                            if ("error" === t.type) return { error: t.error };
                            var n = t.object.url;
                            return lc(e, n);
                          });
                      }
                      var s = i,
                        u = (s.tag, s.items),
                        l = s.lineItems,
                        p = s.mode,
                        m = s.successUrl,
                        f = s.cancelUrl,
                        _ = s.clientReferenceId,
                        h = s.customerEmail,
                        y = s.billingAddressCollection,
                        v = s.submitType,
                        b = s.allowIncompleteSubscriptions,
                        w = s.shippingAddressCollection,
                        k = (0, d.Z)(s, [
                          "tag",
                          "items",
                          "lineItems",
                          "mode",
                          "successUrl",
                          "cancelUrl",
                          "clientReferenceId",
                          "customerEmail",
                          "billingAddressCollection",
                          "submitType",
                          "allowIncompleteSubscriptions",
                          "shippingAddressCollection",
                        ]),
                        E = [];
                      if (l && u)
                        throw new Error(
                          "Only one of items, lineItems can be passed in."
                        );
                      if (l) {
                        if (!p) throw new Error("Expected `mode`");
                        E = l.map(function (e) {
                          if (e.price)
                            return {
                              type: "price",
                              id: e.price,
                              quantity: e.quantity,
                            };
                          throw new Error("Unexpected item shape.");
                        });
                      } else {
                        if (!u)
                          throw new Error("An items field must be passed in.");
                        E = u.map(function (e) {
                          if ("sku" in e)
                            return {
                              type: "sku",
                              id: e.sku,
                              quantity: e.quantity,
                            };
                          if (e.plan)
                            return {
                              type: "plan",
                              id: e.plan,
                              quantity: e.quantity,
                            };
                          throw new Error("Unexpected item shape.");
                        });
                      }
                      return e.action
                        .createPaymentPage(
                          (0, c.Z)(
                            {
                              betas: t,
                              mids: n(),
                              items: E,
                              mode: p,
                              success_url: m,
                              cancel_url: f,
                              client_reference_id: _,
                              customer_email: h,
                              billing_address_collection: y,
                              submit_type: v,
                              allow_incomplete_subscriptions: b,
                              shipping_address_collection: w && {
                                allowed_countries: w.allowedCountries,
                              },
                            },
                            k
                          )
                        )
                        .then(function (t) {
                          if ("error" === t.type) return { error: t.error };
                          var n = t.object.url;
                          return lc(e, n);
                        });
                    })(t._controller, r, n, t._locale, e);
                  };
                },
              },
              {
                key: "_attachPrivateMethodsForConsumer",
                value: function (e) {
                  var t = this;
                  e &&
                    (this.__createConsumerPaymentDetails = M(
                      function (e, n) {
                        var r,
                          o = {};
                        if (!n.email)
                          return B.J.reject(new b.No("You must pass email"));
                        if (!e)
                          return B.J.reject(
                            new b.No("You must pass a clientSecret")
                          );
                        if (n.cardElement) {
                          if (
                            !n.billing_details ||
                            !n.billing_details.country_code
                          )
                            return B.J.reject(
                              new b.No(
                                "You must pass in billing_details.country_code if you are using the Card Element"
                              )
                            );
                          var i = (0, m.rX)(n.cardElement);
                          if (!i)
                            return B.J.reject(
                              new b.No("Card Element is invalid")
                            );
                          var a = i._implementation._frame.id,
                            c = i._componentName;
                          if ("card" !== c && "cardNumber" !== c)
                            return B.J.reject(
                              new b.No(
                                "Please provide a Card Element to __createConsumerPaymentDetails"
                              )
                            );
                          o = {
                            frameId: a,
                            elementName: c,
                            billingDetails: n.billing_details,
                            requestSurface: n.request_surface,
                          };
                        } else if (n.elements) {
                          var s;
                          o = {
                            elementsId:
                              null == n ||
                              null === (s = n.elements) ||
                              void 0 === s
                                ? void 0
                                : s._id,
                            billingDetails:
                              (null == n ? void 0 : n.billing_details) || {},
                            requestSurface:
                              null == n ? void 0 : n.request_surface,
                          };
                        }
                        return o.elementsId
                          ? t._controller.action.createConsumerPaymentDetails({
                              email: n.email,
                              clientSecret: e,
                              billingDetails: o.billingDetails,
                              isDefault: !!n.is_default,
                              requestSurface: n.request_surface,
                              elementsId: o.elementsId,
                            })
                          : o.frameId &&
                            o.elementName &&
                            (null == n ||
                            null === (r = n.billing_details) ||
                            void 0 === r
                              ? void 0
                              : r.country_code)
                          ? t._controller.action.createConsumerPaymentDetails({
                              email: n.email,
                              clientSecret: e,
                              billingDetails: o.billingDetails,
                              isDefault: !!n.is_default,
                              requestSurface: n.request_surface,
                              frameId: o.frameId,
                              elementName: o.elementName,
                            })
                          : B.J.reject(
                              new b.No(
                                "Please provide either an Elements or Card Element creation parameters to __createConsumerPaymentDetails."
                              )
                            );
                      },
                      void 0,
                      "__createConsumerPaymentDetails"
                    ));
                },
              },
              {
                key: "_attachGetters",
                value: function () {
                  var e = this,
                    t = new Ro(function (t) {
                      e._registerWrapper({ name: t, version: null });
                    });
                  [
                    "elements",
                    "createToken",
                    "createSource",
                    "createPaymentMethod",
                  ].forEach(function (n) {
                    if (e.hasOwnProperty(n)) {
                      var r = e[n],
                        o = function () {
                          t.called(n);
                          for (
                            var e = arguments.length, o = new Array(e), i = 0;
                            i < e;
                            i++
                          )
                            o[i] = arguments[i];
                          return r.apply(this, o);
                        };
                      Object.defineProperty(e, n, {
                        enumerable: !0,
                        get: function () {
                          return t.got(n), o;
                        },
                      });
                    }
                  });
                },
              },
              {
                key: "_attachIssuingCardMethods",
                value: function () {
                  var e = this;
                  (this.retrieveIssuingCard = Tc("retrieveIssuingCard")),
                    (this.createEphemeralKeyNonce = Tc(
                      "createEphemeralKeyNonce"
                    ));
                  var t = 0 === this._betas.length;
                  (0, v.uN)(this._betas, v.M4.issuing_elements_1)
                    ? (this.retrieveIssuingCard = M(function (t, n) {
                        return (function (e, t, n) {
                          var r = Ga(e, "retrieveIssuingCard"),
                            o = Ha(t, "retrieveIssuingCard");
                          return n.action
                            .retrieveIssuingCardWithoutNonce({
                              cardId: r,
                              ephemeralKeySecret: o,
                            })
                            .then(Xt);
                        })(t, n, e._controller);
                      }))
                    : ((0, v.uN)(this._betas, [v.M4.issuing_elements_2]) ||
                        t) &&
                      ((this.retrieveIssuingCard = M(function (t, n) {
                        return (function (e, t, n) {
                          var r = Ga(e, "retrieveIssuingCard"),
                            o = Ja(t);
                          return n.action
                            .retrieveIssuingCard({
                              cardId: r,
                              ephemeralKeySecret: o.ephemeralKeySecret,
                              publicNonce: o.publicNonce,
                              expand: o.expand,
                            })
                            .then(Xt);
                        })(t, n, e._controller);
                      })),
                      (this.createEphemeralKeyNonce = T(function (t) {
                        return Wa(t, e._controller);
                      })));
                },
              },
              {
                key: "_attachIdentityMethods",
                value: function () {
                  var e = this;
                  this.verifyIdentity = T(function (t) {
                    return qa(t, e._controller);
                  });
                },
              },
              {
                key: "_attachControllerGetter",
                value: function (e, n, r, o, i) {
                  var a,
                    s = this,
                    u = [],
                    l = document.readyState;
                  Object.defineProperties(this, {
                    _registerWrapper: {
                      enumerable: !1,
                      configurable: !0,
                      writable: !1,
                      value: function (e) {
                        u.push(e);
                      },
                    },
                    _controller: {
                      enumerable: !0,
                      configurable: !0,
                      get: function () {
                        return (function () {
                          if (a) return a;
                          var p = document.readyState;
                          return (
                            (a = new Mo(
                              (0, c.Z)(
                                (0, c.Z)(
                                  {
                                    apiKey: s._apiKey,
                                    apiVersion: s._injectBetaHeader(e),
                                    __privateApiUrl: n,
                                    __privatePaymentUserAgentSuffix: r,
                                    stripeAccount: o,
                                    betas: s._betas,
                                    stripeJsId: t.stripeJsId,
                                    stripeJsLoadTimestamp: bc,
                                    stripeCreateTimestamp: i,
                                    onFirstLoad: function () {
                                      try {
                                        Ac(a, l, p);
                                      } catch (e) {}
                                    },
                                    listenerRegistry: s._listenerRegistry,
                                  },
                                  s._locale ? { locale: s._locale } : {}
                                ),
                                {},
                                {
                                  mids: s._mids,
                                  innerLocalStorageSemaphore: Mc,
                                }
                              )
                            )),
                            Object.defineProperties(s, {
                              _registerWrapper: {
                                value: Oc,
                                writable: !1,
                                enumerable: !1,
                                configurable: !0,
                              },
                              _controller: {
                                value: a,
                                writable: !0,
                                enumerable: !0,
                                configurable: !0,
                              },
                            }),
                            u.forEach(function (e) {
                              return s._registerWrapper(e);
                            }),
                            u.splice(0),
                            a
                          );
                        })();
                      },
                    },
                  });
                },
              },
              {
                key: "_attachLinkedAccountsMethods",
                value: function () {
                  var e = this;
                  (this.collectFinancialConnectionsAccounts = T(function (t) {
                    return zn(e._controller, t);
                  })),
                    (this.collectBankAccountToken = T(function (t) {
                      return (function (e, t) {
                        return Yn({
                          linkAccountSessionCreatorClientSecret: t.clientSecret,
                          linkAccountSessionCreatorType: "link_account_session",
                          controller: e,
                          consumerPublishableKey: null,
                          checkoutPriceAmount: { amount: null, currency: null },
                          email: null,
                          linkMobilePhone: null,
                          linkMobilePhoneCountry: null,
                          useContinueButtonOnSuccess: !1,
                        }).then(function (e) {
                          if ("error" in e) return e;
                          var t = e.linkAccountSession,
                            n = t.linkedAccounts,
                            r = (0, d.Z)(t, ["linkedAccounts"]);
                          return {
                            token: e.linkAccountSession.bankAccountToken,
                            linkAccountSession: e.linkAccountSession,
                            financialConnectionsSession: (0, c.Z)(
                              (0, c.Z)({}, r),
                              {},
                              { accounts: n }
                            ),
                          };
                        });
                      })(e._controller, t);
                    }));
                },
              },
              {
                key: "_attachAppInfo",
                value: function () {
                  var e = this;
                  this.registerAppInfo = C(function (t) {
                    var n = (0, m.ld)(to, t, "WrapperLibrary");
                    "error" !== n.type
                      ? e._controller.registerAppInfo(n.value)
                      : e._controller.warn(
                          "Failed to register your library: ".concat(
                            n.error.message
                          )
                        );
                  });
                },
              },
              {
                key: "_injectBetaHeader",
                value: function (e) {
                  return e;
                },
              },
              {
                key: "_ensureHTTPS",
                value: function () {
                  var e = window.location.protocol,
                    t =
                      -1 !==
                      ["localhost", "127.0.0.1", "0.0.0.0"].indexOf(
                        window.location.hostname
                      ),
                    n =
                      (!0 === window.isSecureContext && !t) ||
                      -1 !==
                        [
                          "https:",
                          "file:",
                          "ionic:",
                          "httpsionic:",
                          "chrome-extension:",
                          "moz-extension:",
                        ].indexOf(e),
                    r = this._keyMode === Oe.Kl.live,
                    o =
                      "Live Stripe.js integrations must use HTTPS. For more information: https://stripe.com/docs/security/guide#tls";
                  if (!n) {
                    if (r && !t)
                      throw (
                        (this._controller.report("user_error.non_https_error", {
                          protocol: e,
                        }),
                        new b.No(o))
                      );
                    !r || t
                      ? window.console &&
                        console.warn(
                          "You may test your Stripe.js integration over HTTP. However, live Stripe.js integrations must use HTTPS."
                        )
                      : window.console && console.warn(o);
                  }
                },
              },
              {
                key: "_ensureHTTPOnlyLinkCookie",
                value: function () {
                  if (
                    !(this._keyMode === Oe.Kl.live) &&
                    wt("stripe.link.persistent_token")
                  )
                    throw new b.No(
                      "`stripe.link.persistent_token` must be set as an httpOnly cookie. For more information https://stripe.com/docs/payments/link/accept-a-payment?platform=web#merchant-domain-cookie"
                    );
                },
              },
              {
                key: "_ensureStripeHosted",
                value: function (e) {
                  if (!e)
                    throw (
                      (this._controller.report("user_error.self_hosted"),
                      new b.No(
                        "Stripe.js must be loaded from js.stripe.com. For more information https://stripe.com/docs/stripe-js/reference#including-stripejs"
                      ))
                    );
                },
              },
              {
                key: "_mids",
                value: function () {
                  return t._ec ? t._ec.ids() : null;
                },
              },
              {
                key: "_midsPromise",
                value: function () {
                  return t._ec ? t._ec.idsPromise() : B.J.resolve(this._mids());
                },
              },
            ]),
            t
          );
        })();
      (jc.version = 3),
        (jc.stripeJsId = (0, f.Vj)()),
        (jc._ec =
          ((Sc = new RegExp(
            ""
              .concat(document.location.protocol, "//")
              .concat(document.location.host)
          )),
          "https://checkout.stripe.com/".match(Sc) ? null : Kt()));
      var Oc = function (e) {
          var t = (0, m.ld)(eo, e, "StripeWrapperLibrary");
          if ("error" !== t.type) {
            var n = t.value,
              r = n.name,
              o = n.version,
              i = n.startTime;
            this._controller.registerWrapper({
              name: r,
              version: o,
              startTime: i,
            });
          } else
            this._controller.report("register_wrapper.error", {
              error: t.error.message,
            });
        },
        Rc = jc,
        Zc = (function () {
          if (document.currentScript) {
            var e = (0, y.Ds)(document.currentScript.src);
            return !e || (0, y.Qg)(e.origin);
          }
          return !0;
        })(),
        xc = function (e, t) {
          return new Rc(
            (0, c.Z)({ apiKey: e }, t && "object" == typeof t ? t : {}),
            Zc
          );
        };
      (xc.version = Rc.version),
        window.Stripe && 2 === window.Stripe.version && !window.Stripe.StripeV3
          ? (window.Stripe.StripeV3 = xc)
          : window.Stripe
          ? window.console &&
            console.warn(
              "It looks like Stripe.js was loaded more than one time. Please only load it once per page."
            )
          : (window.Stripe = xc);
    })();
})();
