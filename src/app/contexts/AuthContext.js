"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { apiService } from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'admin', 'provider', 'employee'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = apiService.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Try admin profile
      try {
        const profile = await apiService.getAdminProfile();
        setUser(profile);
        setUserType("admin");
        return;
      } catch {}

      // Try provider profile
      try {
        const profile = await apiService.getProviderProfile();

        // Check provider status
        if (profile.status === "email_unverified") {
          throw new Error("Please verify your email before logging in.");
        }

        setUser(profile);
        setUserType("provider");
        return;
      } catch {}

      // Try employee profile
      try {
        const profile = await apiService.getEmployeeProfile();
        setUser(profile);
        setUserType("employee");
        return;
      } catch {}

      // If all fail, clear auth
      apiService.removeToken();
      setUser(null);
      setUserType(null);
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Clear previous session
      apiService.removeToken();
      setUser(null);
      setUserType(null);

      let response = null;
      let role = null;

      // Try admin login
      try {
        response = await apiService.loginAdmin(credentials);
        role = "admin";
      } catch {}

      // Try employee login
      if (!response) {
        try {
          response = await apiService.loginEmployee(credentials);
          role = "employee";
        } catch {}
      }

      // Try provider login
      if (!response) {
        try {
          response = await apiService.loginProvider(credentials);
          role = "provider";

          // Check provider status
          if (
            response.provider?.status === "email_unverified" ||
            response.provider?.status === "license_rejected"
          ) {
            throw new Error(
              response.provider.status === "email_unverified"
                ? "Please verify your email before logging in."
                : "Your license was rejected. Please contact support."
            );
          }
        } catch {}
      }

      if (!response?.token || !role) {
        throw new Error("Login failed: No valid role or token");
      }

      // Save token
      apiService.setToken(response.token);
      setUserType(role);

      // Normalize user object
      const normalizedUser =
        response[role] ||
        response.user ||
        response.admin ||
        response.provider ||
        response.employee ||
        null;

      setUser(normalizedUser);
      return { role, token: response.token };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (userType === "admin") {
        await apiService.logoutAdmin();
      } else if (userType === "provider") {
        await apiService.logoutProvider();
      } else if (userType === "employee") {
        await apiService.logoutEmployee();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setUserType(null);
      apiService.removeToken();
    }
  };

  const register = async (data) => {
    try {
      const response = await apiService.registerProvider(data);
      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const value = {
    user,
    userType,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
