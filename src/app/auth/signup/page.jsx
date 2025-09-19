"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, CheckCircle, XCircle } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    email: "",
    password: "",
    confirmPassword: "",
    contact_phone: "",
    tax_id: "",
    description: "",
    street_address: "",
    city: "",
    region: "",
    image_url: "",
    license: null,
  });

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/categories", { 
        responseType: "text" 
      });
      
      const raw = res.data;
      const cleaned = raw.substring(raw.indexOf("["));
      const parsed = JSON.parse(cleaned);
      
      setCategories(parsed);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setErrorMessage("Unable to load categories. Please try again later.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  fetchCategories();
}, []);



  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
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

    if (formData.license && formData.license.size > 5 * 1024 * 1024) {
      setErrorMessage("License file must be under 5MB.");
      setLoading(false);
      return;
    }

    if (!formData.license) {
      setErrorMessage("License file is required.");
      setLoading(false);
      return;
    }

    // Phone validation (Ethiopian format)
    const phoneRegex = /^\+251(9|7)[0-9]{8}$/;
    if (!phoneRegex.test(formData.contact_phone)) {
      setErrorMessage("Phone number must be in format +2519xxxxxxxx or +2517xxxxxxxx");
      setLoading(false);
      return;
    }

    const providerData = {
      name: formData.name,
      category_id: formData.category_id,
      email: formData.email,
      password: formData.password,
      contact_phone: formData.contact_phone,
      tax_id: formData.tax_id,
      description: formData.description,
      address: {
        street_address: formData.street_address,
        city: formData.city,
        region: formData.region,
      },
      image_url: formData.image_url,
    };

    const fd = new FormData();
    fd.append("provider_data", JSON.stringify(providerData));
    fd.append("license", formData.license);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/service-providers/register",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setSuccessMessage("Registration successful! Please check your email to verify your account.");
      toast.success("Registration completed! Check your email for verification.");
      
      // Redirect to verification page after a short delay
      setTimeout(() => {
        // After registration, redirect to unified verification page
        router.push(`/auth/verify?token=${res.verification_token}`);
      }, 2000);

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
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Service Provider Registration</CardTitle>
          <CardDescription>
            Join TipTop and start receiving digital tips for your business
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

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your business name"
                    onChange={handleChange}
                    value={formData.name}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category_id">Business Category *</Label>
                  <select
                    id="category_id"
                    name="category_id"
                    onChange={handleChange}
                    value={formData.category_id}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Select Category</option>
                    {categoriesLoading ? (
                      <option disabled>Loading categories...</option>
                    ) : Array.isArray(categories) && categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No categories available</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your business..."
                  onChange={handleChange}
                  value={formData.description}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_id">Tax ID</Label>
                  <Input
                    id="tax_id"
                    name="tax_id"
                    placeholder="Enter tax ID"
                    onChange={handleChange}
                    value={formData.tax_id}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Logo URL</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    onChange={handleChange}
                    value={formData.image_url}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="business@example.com"
                    onChange={handleChange}
                    value={formData.email}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Phone Number *</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    placeholder="+2519xxxxxxxx"
                    onChange={handleChange}
                    value={formData.contact_phone}
                    required
                  />
                  <p className="text-xs text-gray-500">Format: +2519xxxxxxxx or +2517xxxxxxxx</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Address</h3>
              
              <div className="space-y-2">
                <Label htmlFor="street_address">Street Address *</Label>
                <Input
                  id="street_address"
                  name="street_address"
                  placeholder="Enter street address"
                  onChange={handleChange}
                  value={formData.street_address}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Enter city"
                    onChange={handleChange}
                    value={formData.city}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Input
                    id="region"
                    name="region"
                    placeholder="Enter region"
                    onChange={handleChange}
                    value={formData.region}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Security</h3>
              
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
            </div>

            {/* License Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business License</h3>
              
              <div className="space-y-2">
                <Label htmlFor="license">Upload License Document *</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="license"
                    name="license"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#71FF71] file:text-black hover:file:bg-[#00b74f]"
                    required
                  />
                  <Upload className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">
                  Accepted formats: PDF, JPG, PNG (max 5MB)
                </p>
                {formData.license && (
                  <p className="text-sm text-green-600">
                    ✓ {formData.license.name} selected
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || categoriesLoading}
              className="w-full bg-[#71FF71] text-black hover:bg-[#00b74f] h-12 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Business"
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
