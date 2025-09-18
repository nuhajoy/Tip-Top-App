"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import axios from "axios";

export default function VerifyTokenPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("verifying"); // verifying, success, error, waiting
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("waiting");
      setMessage("Waiting for verification token...");
      return;
    }

    axios
      .post(
        "http://127.0.0.1:8000/api/service-providers/verify-email",
        {},
        {
          params: { token },
        }
      )
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully.");
      })
      .catch((err) => {
        console.error("Verification error:", err);
        const fallback = "Verification failed. Please try again.";
        const errorMsg = err.response?.data?.error || fallback;
        setStatus("error");
        setMessage(errorMsg);
      });
  }, [searchParams]);

  const handleLogin = () => router.push("/auth/login");
  const handleSignup = () => router.push("/auth/signup");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Email Verification
          </CardTitle>
          <CardDescription>
            {status === "verifying" && "Verifying your email address..."}
            {status === "success" && "Email verification complete"}
            {status === "error" && "Verification failed"}
            {status === "waiting" && "Awaiting verification token"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "verifying" && (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Please wait...</span>
            </div>
          )}

          {status === "waiting" && (
            <div className="text-center space-y-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
              <p className="text-gray-600">
                If you arrived here directly, please check your inbox and click
                the verification link.
              </p>
              <Button
                onClick={handleLogin}
                className="w-full bg-[#71FF71] text-black hover:bg-[#00b74f]"
              >
                Go to Login
              </Button>
            </div>
          )}

          {status === "success" && (
            <>
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 text-center">
                  Your email has been successfully verified. You can now log in
                  to your account.
                </p>
                <Button
                  onClick={handleLogin}
                  className="w-full bg-[#71FF71] text-black hover:bg-[#00b74f]"
                >
                  Continue to Login
                </Button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <Alert variant="destructive">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 text-center">
                  If you're having trouble verifying your email, please contact
                  support or try registering again.
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleSignup}
                    className="flex-1"
                  >
                    Register Again
                  </Button>
                  <Button
                    onClick={handleLogin}
                    className="flex-1 bg-[#71FF71] text-black hover:bg-[#00b74f]"
                  >
                    Go to Login
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
