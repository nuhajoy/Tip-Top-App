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

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("❌ Invalid verification link");
      return;
    }

    async function verifyEmail() {
      const endpoints = [
        "/api/employees/verify-token",
        "/api/service-provider/verify-token",
      ];
      let verified = false;

      for (const endpoint of endpoints) {
        try {
          const res = await axios.post(endpoint, {}, { params: { token } });
          setStatus("success");
          setMessage(res.data.message || "✅ Email verified successfully!");
          verified = true;
          setTimeout(() => router.push("/auth/login"), 2000);
          break;
        } catch {
          continue;
        }
      }

      if (!verified) {
        setStatus("error");
        setMessage(
          "❌ Verification failed. Please check your link or contact support."
        );
      }
    }

    verifyEmail();
  }, [searchParams, router]);

  const handleLogin = () => router.push("/auth/login");
  const handleSignup = () => router.push("/auth/signup");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Email Verification
          </CardTitle>
          <CardDescription>
            {status === "verifying" && "Verifying your email address..."}
            {status === "success" && "Email verification complete"}
            {status === "error" && "Verification failed"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "verifying" && (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Please wait...</span>
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
              <Button
                onClick={handleLogin}
                className="w-full bg-[#71FF71] text-black hover:bg-[#00b74f]"
              >
                Continue to Login
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <Alert variant="destructive">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
