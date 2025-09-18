"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Toaster, toast } from "sonner";
import { apiService } from "@/lib/api";

export default function BankSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    business_name: "",
    account_name: "",
    bank_code: "",
    account_number: "",
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
    if (!formData.business_name.trim()) {
      setErrorMessage("Business name is required.");
      setLoading(false);
      return;
    }

    if (!formData.account_name.trim()) {
      setErrorMessage("Account name is required.");
      setLoading(false);
      return;
    }

    if (!formData.bank_code.trim() || isNaN(formData.bank_code)) {
      setErrorMessage("Valid bank code is required.");
      setLoading(false);
      return;
    }

    if (!formData.account_number.trim()) {
      setErrorMessage("Account number is required.");
      setLoading(false);
      return;
    }

    const bankData = {
      business_name: formData.business_name,
      account_name: formData.account_name,
      bank_code: parseInt(formData.bank_code),
      account_number: formData.account_number,
    };

    try {
      const result = await apiService.setBankInfo(bankData);

      setSuccessMessage("Bank account set up successfully!");
      toast.success("Bank account configured successfully!");
      
      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard/employee");
      }, 2000);

    } catch (err) {
      console.error("Bank setup error:", err);

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
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div></div>
          </div>
          <CardTitle className="text-2xl font-bold">Bank Account Setup</CardTitle>
          <CardDescription>
            Set up your bank account to receive tip payments
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
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                name="business_name"
                placeholder="Enter business name"
                onChange={handleChange}
                value={formData.business_name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_name">Account Holder Name *</Label>
              <Input
                id="account_name"
                name="account_name"
                placeholder="Enter account holder name"
                onChange={handleChange}
                value={formData.account_name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_code">Bank Code *</Label>
              <Input
                id="bank_code"
                name="bank_code"
                type="number"
                placeholder="Enter bank code (e.g., 946)"
                onChange={handleChange}
                value={formData.bank_code}
                required
              />
              <p className="text-xs text-gray-500">
                Common bank codes: 946 (Commercial Bank of Ethiopia), 100 (Dashen Bank)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number *</Label>
              <Input
                id="account_number"
                name="account_number"
                placeholder="Enter account number"
                onChange={handleChange}
                value={formData.account_number}
                required
              />
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your bank account information will be verified with the bank before payments can be processed.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#71FF71] text-black hover:bg-[#00b74f] h-12 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Set Up Bank Account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}

