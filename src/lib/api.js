const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }

  setToken(token) {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  removeToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  // async request(endpoint, options = {}) {
  //   const token = this.getToken();

  //   const config = {
  //     headers: {
  //       "Content-Type": "application/json",
  //       Accept: "application/json",
  //       ...options.headers,
  //     },
  //     ...options,
  //   };

  //   if (token) {
  //     config.headers.Authorization = `Bearer ${token}`;
  //   }

  //   const response = await fetch(`${this.baseURL}${endpoint}`, config);
  //   const rawText = await response.text();

  //   let data;
  //   try {
  //     let jsonText = rawText;
  //     const jsonStart = rawText.indexOf("[");
  //     const objectStart = rawText.indexOf("{");

  //     if (jsonStart !== -1 && (objectStart === -1 || jsonStart < objectStart)) {
  //       const jsonEnd = rawText.lastIndexOf("]");
  //       if (jsonEnd !== -1 && jsonEnd > jsonStart) {
  //         jsonText = rawText.substring(jsonStart, jsonEnd + 1);
  //       }
  //     } else if (objectStart !== -1) {
  //       const jsonEnd = rawText.lastIndexOf("}");
  //       if (jsonEnd !== -1 && jsonEnd > objectStart) {
  //         jsonText = rawText.substring(objectStart, jsonEnd + 1);
  //       }
  //     }

  //     data = JSON.parse(jsonText);
  //   } catch (e) {
  //     console.error("Invalid JSON response:", rawText);
  //     throw new Error(`Invalid JSON response: ${rawText.substring(0, 200)}...`);
  //   }

  //   if (!response.ok) {
  //     throw new Error(data.error || `Error ${response.status}`);
  //   }

  //   return data;
  // }

  async request(endpoint, options = {}) {
  const token = this.getToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${this.baseURL}${endpoint}`, config);

  let data;
  try {
    data = await response.json(); // safer than manual substring parsing
  } catch {
    // fallback if response is not valid JSON
    const text = await response.text();
    data = { message: text };
  }

  if (!response.ok) {
    // throw a structured error instead of string
    const error = new Error("Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}


  // ----------------------------
  // Unified login
  // ----------------------------
  async login(credentials) {
    try {
      const res = await this.loginAdmin(credentials);
      return { ...res, role: "admin" };
    } catch {
      try {
        const res = await this.loginEmployee(credentials);
        return { ...res, role: "employee" };
      } catch {
        try {
          const res = await this.loginProvider(credentials);
          return { ...res, role: "provider" };
        } catch {
          throw new Error("Invalid credentials");
        }
      }
    }
  }

  // ----------------------------
  // Service Provider Auth
  // ----------------------------
  loginProvider(credentials) {
    return this.request("/service-providers/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }).then((res) => {
      if (res.token) this.setToken(res.token);
      return res;
    });
  }

  logoutProvider() {
    return this.request("/service-providers/logout", {
      method: "POST",
    }).finally(() => this.removeToken());
  }

  getProviderProfile() {
    return this.request("/service-providers/profile");
  }

  registerProvider(providerData, licenseFile) {
    const formData = new FormData();
    formData.append("provider_data", JSON.stringify(providerData));
    formData.append("license", licenseFile);

    return fetch(`${this.baseURL}/service-providers/register`, {
      method: "POST",
      body: formData,
    }).then(async (res) => {
      const rawText = await res.text();
      let data;
      try {
        const cleaned = rawText.substring(rawText.indexOf("{"));
        data = JSON.parse(cleaned);
      } catch {
        throw new Error(`Invalid JSON response: ${rawText}`);
      }

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`);
      }

      return data;
    });
  }

  verifyProviderEmail(token) {
    return this.request(`/service-providers/verify-email?token=${token}`, {
      method: "GET",
    });
  }
  verifyEmployeeEmail(token) {
    return this.request(`/employees/verify-email?token=${token}`, {
      method: "GET",
    });
  }

  // ----------------------------
  // Provider Dashboard API
  // ----------------------------
  fetchProfile() {
    return this.request("/service-providers/profile");
  }

  fetchEmployees() {
    return this.request("/service-providers/employees");
  }

  fetchEmployeeSummary() {
    return this.request("/service-providers/employees/summary");
  }

  registerEmployeesAPI(payload) {
    return this.request("/service-providers/employees/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  toggleEmployeeStatusAPI(employeeId, action) {
    const method = "PATCH";
    const endpoint =
      action === "activate"
        ? `/service-providers/employees/activate/${employeeId}`
        : `/service-providers/employees/deactivate/${employeeId}`;
    return this.request(endpoint, { method });
  }

  logoutAPI() {
    return this.request("/service-providers/logout", { method: "POST" });
  }

  // ----------------------------
  // Employee Auth
  // ----------------------------
  loginEmployee(credentials) {
    return this.request("/employees/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }).then((res) => {
      if (res.token) this.setToken(res.token);
      return res;
    });
  }

  logoutEmployee() {
    return this.request("/employees/logout", {
      method: "POST",
    }).finally(() => this.removeToken());
  }

  getEmployeeProfile() {
    return this.request("/employee/profile");
  }

  completeEmployeeRegistration(employeeData) {
    return this.request("/employees/register", {
      method: "POST",
      body: JSON.stringify(employeeData),
    });
  }

  // old registerEmployee (if still needed)
  registerEmployee(employeeData) {
    return this.request("/employees/register", {
      method: "POST",
      body: JSON.stringify(employeeData),
    });
  }

  // ----------------------------
  // Admin Auth & Management
  // ----------------------------
  loginAdmin(credentials) {
    return this.request("/admin/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }).then((res) => {
      if (res.token) this.setToken(res.token);
      return res;
    });
  }

  logoutAdmin() {
    return this.request("/admin/logout", {
      method: "POST",
    }).finally(() => this.removeToken());
  }

  getAdminProfile() {
    return this.request("/admin/profile");
  }

  getServiceProviders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/admin/service-providers${queryString ? `?${queryString}` : ""}`
    );
  }

  // ----------------------------
  // Categories & Tips
  // ----------------------------
  getCategories() {
    return this.request("/categories");
  }

  processTip(tipCode, amount) {
    return this.request(`/tip/${tipCode}?amount=${amount}`);
  }

  verifyTipPayment(paymentData) {
    return this.request("/verify-payment", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }
}

export const apiService = new ApiService();
