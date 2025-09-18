"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Login() {
  const router = useRouter();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const tryLogin = async (endpoint) => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/${endpoint}/login`,
        credentials,
        { responseType: "text" }
      );

      const raw = res.data;
      const cleaned = raw.substring(raw.indexOf("{"));
      const parsed = JSON.parse(cleaned);

      return { ...parsed, role: endpoint };
    } catch (error) {
      // Handle different error responses
      if (error.response?.data) {
        const raw = error.response.data;
        try {
          const cleaned = raw.substring(raw.indexOf("{"));
          const parsed = JSON.parse(cleaned);
          error.response.data = parsed;
        } catch (e) {
          // Keep original error data if parsing fails
        }
      }
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = credentials;

    if (!email || !password) {
      toast.error("Please fill in all fields!");
      return;
    }

    setLoading(true);

    const roles = ["admin", "employee", "service-providers"];
    let result = null;
    let lastError = null;

    for (const role of roles) {
      try {
        result = await tryLogin(role);
        break; // Stop at first successful login
      } catch (err) {
        lastError = err;
        // Continue to next role
      }
    }

    if (!result) {
      // Show specific error message if available
      let errorMessage = "Invalid credentials. Please try again.";
      
      if (lastError?.response?.data) {
        const data = lastError.response.data;
        if (data.status === "email_unverified") {
          errorMessage = "Please verify your email before logging in.";
        } else if (data.status === "license_pending") {
          errorMessage = "Your license is under review. Please wait for approval.";
        } else if (data.status === "license_rejected") {
          errorMessage = "Your license was rejected. Please contact support.";
        } else if (data.error) {
          errorMessage = data.error;
        }
      }
      
      toast.error(errorMessage);
      setLoading(false);
      return;
    }

    const { token, role, user } = result;

    if (!token || !role) {
      toast.error("Invalid login response. Please contact support.");
      setLoading(false);
      return;
    }

    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_role", role);
    localStorage.setItem("user_info", JSON.stringify(user));

    toast.success(
      `🎉 Login successful! Welcome back, ${
        user?.name || user?.first_name || "user"
      } — your dashboard is ready.`
    );

    setTimeout(() => {
      if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "service-providers") {
        router.push("/dashboard/provider");
      } else if (role === "employee") {
        router.push("/dashboard/employee");
      } else {
        router.push("/unauthorized");
      }
    }, 1500); // 1.5 seconds delay

    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full py-4 px-6 bg-white shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1A1A1A]">TipTop</h1>
        <Link
          href="/"
          className="text-sm font-semibold text-[#00b74f] border border-[#00b74f] px-4 py-1 rounded-full hover:bg-[#00b74f] hover:text-white transition-all duration-200"
        >
          Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col md:flex-row md:h-screen">
        {/* Left: Login Card */}
        <div className="md:flex-1 flex justify-center items-center bg-[#f9f9f9] px-4 py-10">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#1A1A1A]">
              Welcome Back 👋
            </h1>
            <p className="text-center text-[#666] mb-6 text-sm md:text-base">
              Log in to manage your tips, track performance, and empower your
              team.
            </p>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <Label className="text-sm text-[#333]">Email *</Label>
                <Input
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <Label className="text-sm text-[#333]">Password *</Label>
                <Input
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#71FF71] text-black w-full mt-4 hover:bg-[#00b74f] rounded-full py-3"
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </div>
        </div>

        {/* Right: Full Image with Overlay */}
        <div className="relative w-full h-[300px] md:h-auto md:flex-1">
          <Image
            src="/waiter.png"
            alt="Ethiopian café worker"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-opacity-40 flex flex-col justify-center items-center text-center px-6 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              New to TipTop?
            </h2>
            <p className="text-sm md:text-lg mb-4 max-w-md">
              Join now and start receiving instant digital tips with ease.
            </p>
            <div className="space-y-2">
              <Link href="/auth/signup">
                <Button className="bg-[#71FF71] text-black hover:bg-[#00b74f] w-44 rounded-full py-2">
                  Business Sign Up
                </Button>
              </Link>
              <Link href="/auth/employee-signup">
                <Button variant="outline" className="w-44 rounded-full py-2 border-[#71FF71] text-[#00b74f] hover:bg-[#71FF71] hover:text-black">
                  Employee Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-6 bg-[#2E2E2E] text-center text-sm text-[#f1f1f1] border-t">
        © {new Date().getFullYear()} TipTop. All rights reserved.
      </footer>

      <Toaster />
    </div>
  );
}
