"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.apiService = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

var ApiService =
/*#__PURE__*/
function () {
  function ApiService() {
    _classCallCheck(this, ApiService);

    this.baseURL = API_BASE_URL;
  }

  _createClass(ApiService, [{
    key: "getToken",
    value: function getToken() {
      if (typeof window !== "undefined") {
        return localStorage.getItem("auth_token");
      }

      return null;
    }
  }, {
    key: "setToken",
    value: function setToken(token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", token);
      }
    }
  }, {
    key: "removeToken",
    value: function removeToken() {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
      }
    }
  }, {
    key: "request",
    value: function request(endpoint) {
      var options,
          token,
          config,
          response,
          rawText,
          data,
          jsonText,
          jsonStart,
          objectStart,
          jsonEnd,
          _jsonEnd,
          _args = arguments;

      return regeneratorRuntime.async(function request$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              options = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
              token = this.getToken();
              config = _objectSpread({
                headers: _objectSpread({
                  "Content-Type": "application/json",
                  Accept: "application/json"
                }, options.headers)
              }, options);

              if (token) {
                config.headers.Authorization = "Bearer ".concat(token);
              }

              _context.next = 6;
              return regeneratorRuntime.awrap(fetch("".concat(this.baseURL).concat(endpoint), config));

            case 6:
              response = _context.sent;
              _context.next = 9;
              return regeneratorRuntime.awrap(response.text());

            case 9:
              rawText = _context.sent;
              _context.prev = 10;
              jsonText = rawText;
              jsonStart = rawText.indexOf("[");
              objectStart = rawText.indexOf("{");

              if (jsonStart !== -1 && (objectStart === -1 || jsonStart < objectStart)) {
                jsonEnd = rawText.lastIndexOf("]");

                if (jsonEnd !== -1 && jsonEnd > jsonStart) {
                  jsonText = rawText.substring(jsonStart, jsonEnd + 1);
                }
              } else if (objectStart !== -1) {
                _jsonEnd = rawText.lastIndexOf("}");

                if (_jsonEnd !== -1 && _jsonEnd > objectStart) {
                  jsonText = rawText.substring(objectStart, _jsonEnd + 1);
                }
              }

              data = JSON.parse(jsonText);
              _context.next = 22;
              break;

            case 18:
              _context.prev = 18;
              _context.t0 = _context["catch"](10);
              console.error("Invalid JSON response:", rawText);
              throw new Error("Invalid JSON response: ".concat(rawText.substring(0, 200), "..."));

            case 22:
              if (response.ok) {
                _context.next = 24;
                break;
              }

              throw new Error(data.error || "Error ".concat(response.status));

            case 24:
              return _context.abrupt("return", data);

            case 25:
            case "end":
              return _context.stop();
          }
        }
      }, null, this, [[10, 18]]);
    } // ----------------------------
    // Unified login
    // ----------------------------

  }, {
    key: "login",
    value: function login(credentials) {
      var res, _res, _res2;

      return regeneratorRuntime.async(function login$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return regeneratorRuntime.awrap(this.loginAdmin(credentials));

            case 3:
              res = _context2.sent;
              return _context2.abrupt("return", _objectSpread({}, res, {
                role: "admin"
              }));

            case 7:
              _context2.prev = 7;
              _context2.t0 = _context2["catch"](0);
              _context2.prev = 9;
              _context2.next = 12;
              return regeneratorRuntime.awrap(this.loginEmployee(credentials));

            case 12:
              _res = _context2.sent;
              return _context2.abrupt("return", _objectSpread({}, _res, {
                role: "employee"
              }));

            case 16:
              _context2.prev = 16;
              _context2.t1 = _context2["catch"](9);
              _context2.prev = 18;
              _context2.next = 21;
              return regeneratorRuntime.awrap(this.loginProvider(credentials));

            case 21:
              _res2 = _context2.sent;
              return _context2.abrupt("return", _objectSpread({}, _res2, {
                role: "provider"
              }));

            case 25:
              _context2.prev = 25;
              _context2.t2 = _context2["catch"](18);
              throw new Error("Invalid credentials");

            case 28:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this, [[0, 7], [9, 16], [18, 25]]);
    } // ----------------------------
    // Service Provider Auth
    // ----------------------------

  }, {
    key: "loginProvider",
    value: function loginProvider(credentials) {
      var _this = this;

      return this.request("/service-providers/login", {
        method: "POST",
        body: JSON.stringify(credentials)
      }).then(function (res) {
        if (res.token) _this.setToken(res.token);
        return res;
      });
    }
  }, {
    key: "logoutProvider",
    value: function logoutProvider() {
      var _this2 = this;

      return this.request("/service-providers/logout", {
        method: "POST"
      })["finally"](function () {
        return _this2.removeToken();
      });
    }
  }, {
    key: "getProviderProfile",
    value: function getProviderProfile() {
      return this.request("/service-providers/profile");
    }
  }, {
    key: "registerProvider",
    value: function registerProvider(providerData, licenseFile) {
      var formData = new FormData();
      formData.append("provider_data", JSON.stringify(providerData));
      formData.append("license", licenseFile);
      return fetch("".concat(this.baseURL, "/service-providers/register"), {
        method: "POST",
        body: formData
      }).then(function _callee(res) {
        var rawText, data, cleaned;
        return regeneratorRuntime.async(function _callee$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return regeneratorRuntime.awrap(res.text());

              case 2:
                rawText = _context3.sent;
                _context3.prev = 3;
                cleaned = rawText.substring(rawText.indexOf("{"));
                data = JSON.parse(cleaned);
                _context3.next = 11;
                break;

              case 8:
                _context3.prev = 8;
                _context3.t0 = _context3["catch"](3);
                throw new Error("Invalid JSON response: ".concat(rawText));

              case 11:
                if (res.ok) {
                  _context3.next = 13;
                  break;
                }

                throw new Error(data.error || "Error ".concat(res.status));

              case 13:
                return _context3.abrupt("return", data);

              case 14:
              case "end":
                return _context3.stop();
            }
          }
        }, null, null, [[3, 8]]);
      });
    }
  }, {
    key: "verifyProviderEmail",
    value: function verifyProviderEmail(token) {
      return this.request("/service-providers/verify-email?token=".concat(token), {
        method: "GET"
      });
    }
  }, {
    key: "verifyEmployeeEmail",
    value: function verifyEmployeeEmail(token) {
      return this.request("/employees/verify-email?token=".concat(token), {
        method: "GET"
      });
    } // ----------------------------
    // Provider Dashboard API
    // ----------------------------

  }, {
    key: "fetchProfile",
    value: function fetchProfile() {
      return this.request("/service-providers/profile");
    }
  }, {
    key: "fetchEmployees",
    value: function fetchEmployees() {
      return this.request("/service-providers/employees");
    }
  }, {
    key: "fetchEmployeeSummary",
    value: function fetchEmployeeSummary() {
      return this.request("/service-providers/employees/summary");
    }
  }, {
    key: "registerEmployeesAPI",
    value: function registerEmployeesAPI(payload) {
      return this.request("/service-providers/employees/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }
  }, {
    key: "toggleEmployeeStatusAPI",
    value: function toggleEmployeeStatusAPI(employeeId, action) {
      var method = "PATCH";
      var endpoint = action === "activate" ? "/service-providers/employees/activate/".concat(employeeId) : "/service-providers/employees/deactivate/".concat(employeeId);
      return this.request(endpoint, {
        method: method
      });
    }
  }, {
    key: "logoutAPI",
    value: function logoutAPI() {
      return this.request("/service-providers/logout", {
        method: "POST"
      });
    } // ----------------------------
    // Employee Auth
    // ----------------------------

  }, {
    key: "loginEmployee",
    value: function loginEmployee(credentials) {
      var _this3 = this;

      return this.request("/employees/login", {
        method: "POST",
        body: JSON.stringify(credentials)
      }).then(function (res) {
        if (res.token) _this3.setToken(res.token);
        return res;
      });
    }
  }, {
    key: "logoutEmployee",
    value: function logoutEmployee() {
      var _this4 = this;

      return this.request("/employees/logout", {
        method: "POST"
      })["finally"](function () {
        return _this4.removeToken();
      });
    }
  }, {
    key: "getEmployeeProfile",
    value: function getEmployeeProfile() {
      return this.request("/employee/profile");
    }
  }, {
    key: "completeEmployeeRegistration",
    value: function completeEmployeeRegistration(employeeData) {
      return this.request("/employees/register", {
        method: "POST",
        body: JSON.stringify(employeeData)
      });
    } // old registerEmployee (if still needed)

  }, {
    key: "registerEmployee",
    value: function registerEmployee(employeeData) {
      return this.request("/employees/register", {
        method: "POST",
        body: JSON.stringify(employeeData)
      });
    } // ----------------------------
    // Admin Auth & Management
    // ----------------------------

  }, {
    key: "loginAdmin",
    value: function loginAdmin(credentials) {
      var _this5 = this;

      return this.request("/admin/login", {
        method: "POST",
        body: JSON.stringify(credentials)
      }).then(function (res) {
        if (res.token) _this5.setToken(res.token);
        return res;
      });
    }
  }, {
    key: "logoutAdmin",
    value: function logoutAdmin() {
      var _this6 = this;

      return this.request("/admin/logout", {
        method: "POST"
      })["finally"](function () {
        return _this6.removeToken();
      });
    }
  }, {
    key: "getAdminProfile",
    value: function getAdminProfile() {
      return this.request("/admin/profile");
    }
  }, {
    key: "getServiceProviders",
    value: function getServiceProviders() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var queryString = new URLSearchParams(params).toString();
      return this.request("/admin/service-providers".concat(queryString ? "?".concat(queryString) : ""));
    } // ----------------------------
    // Categories & Tips
    // ----------------------------

  }, {
    key: "getCategories",
    value: function getCategories() {
      return this.request("/categories");
    }
  }, {
    key: "processTip",
    value: function processTip(tipCode, amount) {
      return this.request("/tip/".concat(tipCode, "?amount=").concat(amount));
    }
  }, {
    key: "verifyTipPayment",
    value: function verifyTipPayment(paymentData) {
      return this.request("/verify-payment", {
        method: "POST",
        body: JSON.stringify(paymentData)
      });
    }
  }]);

  return ApiService;
}();

var apiService = new ApiService();
exports.apiService = apiService;