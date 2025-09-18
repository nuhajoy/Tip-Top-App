"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CustomerTipPage() {
  const [employeeCode, setEmployeeCode] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleSendTip = async () => {
    if (!employeeCode.trim() || !amount.trim() || isNaN(amount) || Number(amount) <= 0) {
      showMessage("Please enter a valid code and amount.");
      return;
    }

    try {
      setIsProcessing(true);
      // Call your backend API to create a Chapa payment
      const res = await fetch("/api/send-tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: employeeCode, amount: Number(amount) }),
      });

      const data = await res.json();
      if (res.ok) {
        window.location.href = data.checkout_url; // Redirect to Chapa checkout
      } else {
        showMessage(data.message || "Payment failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      showMessage("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Send a Tip
        </h1>

        {message && (
          <Alert className="mb-4 text-center" variant="destructive">
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="employeeCode" className="text-gray-700 font-semibold">
              Employee Code
            </Label>
            <Input
              id="employeeCode"
              placeholder="Enter employee code"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="amount" className="text-gray-700 font-semibold">
              Tip Amount (USD)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleSendTip}
            disabled={isProcessing}
            className={`w-full py-3 mt-2 font-bold text-white shadow-lg rounded-xl transition-transform transform hover:scale-105 ${
              isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isProcessing ? "Processing..." : "Send Tip"}
          </Button>
        </div>

        <p className="text-sm text-gray-500 text-center mt-6">
          Quick, safe, and easy tipping from anywhere.
        </p>
      </div>
    </div>
  );
}