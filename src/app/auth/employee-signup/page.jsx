"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Toaster, toast } from "sonner";
import { apiService } from "@/lib/api";

export default function EmployeeSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    employee_code: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    image_url: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (!formData.employee_code.trim()) {
      setErrorMessage("Employee code is required.");
      setLoading(false);
      return;
    }

    const employeeData = {
      employee_code: formData.employee_code,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      image_url: formData.image_url,
    };

    try {
      const res = await apiService.completeEmployeeRegistration(employeeData);

      setSuccessMessage(
        "Registration successful! Please check your email to verify your account."
      );
      toast.success(
        "Registration completed! Check your email for verification."
      );

      // Redirect to verification page using token from backend
      if (res.token) {
        setTimeout(() => {
          router.push(`/employees/verify-token?token=${res.token}`);
        }, 2000);
      }
    } catch (err) {
      console.error("Registration error:", err);

      let errorMessage = "Something went wrong. Please try again later.";

      if (err.response?.data) {
        const raw = err.response.data;
        try {
          const cleaned = raw.substring(raw.indexOf("{"));
          const parsed = JSON.parse(cleaned);

          if (parsed.errors) {
            errorMessage = Object.values(parsed.errors).flat().join(", ");
          } else if (parsed.error) {
            errorMessage = parsed.error;
          }
        } catch (e) {
          errorMessage = raw || errorMessage;
        }
      }

      setErrorMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Employee Registration
          </CardTitle>
          <CardDescription>
            Complete your employee profile to start receiving tips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="employee_code">Employee Code *</Label>
              <Input
                id="employee_code"
                name="employee_code"
                placeholder="Enter your employee code"
                onChange={handleChange}
                value={formData.employee_code}
                required
              />
              <p className="text-xs text-gray-500">
                Get this code from your service provider
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  placeholder="Enter your first name"
                  onChange={handleChange}
                  value={formData.first_name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  placeholder="Enter your last name"
                  onChange={handleChange}
                  value={formData.last_name}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                onChange={handleChange}
                value={formData.email}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Profile Picture URL</Label>
              <Input
                id="image_url"
                name="image_url"
                type="url"
                placeholder="https://example.com/profile.jpg"
                onChange={handleChange}
                value={formData.image_url}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password (min 6 characters)"
                  onChange={handleChange}
                  value={formData.password}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  onChange={handleChange}
                  value={formData.confirmPassword}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#71FF71] text-black hover:bg-[#00b74f] h-12 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Complete Registration"
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/auth/login")}
                  className="text-[#00b74f] hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
