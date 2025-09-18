"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

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
    if (
      !employeeCode.trim() ||
      !amount.trim() ||
      isNaN(amount) ||
      Number(amount) <= 0
    ) {
      showMessage("Please enter a valid code and amount.");
      return;
    }

    try {
      setIsProcessing(true);
      
      // Use the backend API directly
      const response = await fetch(
        `http://127.0.0.1:8000/api/tip/${employeeCode}?amount=${Number(amount)}`,
        {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
        }
      );

      const rawText = await response.text();
      let data;
      
      try {
        // Handle Laravel's HTML response with JSON
        const cleaned = rawText.substring(rawText.indexOf("{"));
        data = JSON.parse(cleaned);
      } catch (e) {
        throw new Error(`Invalid response: ${rawText}`);
      }

      if (response.ok && data.link) {
        // Redirect to Chapa checkout
        window.location.href = data.link;
      } else {
        showMessage(data.error || "Payment failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      showMessage("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-foreground mb-6 text-center">
          Send a Tip
        </h1>

        {message && (
          <Alert className="mb-4 text-center" variant="destructive">
            {message}
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label
              htmlFor="employeeCode"
              className="text-foreground font-semibold"
            >
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
            <Label htmlFor="amount" className="text-foreground font-semibold">
              Tip Amount
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
            className={`w-full py-3 mt-2 font-bold shadow-lg rounded-xl transition-transform transform hover:scale-105 
              ${
                isProcessing
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-accent text-accent-foreground hover:bg-green-500"
              }`}
          >
            {isProcessing ? "Processing..." : "Send Tip"}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-6">
          TipTop. Quick, safe, and easy tipping from anywhere.
        </p>
      </div>
    </div>
  );
}
