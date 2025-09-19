"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiService } from "@/lib/api";

function VerifyTokenInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("❌ Invalid verification link");
      return;
    }

    async function verify() {
      try {
        await apiService.request(`/api/employee/verify-token?token=${token}`, {
          method: "POST", // Change to "GET" if your backend expects GET
        });
        setStatus("✅ Email verified successfully!");
        setTimeout(() => router.push("/auth/login"), 2000);
      } catch (err) {
        let message = "Verification failed. Please try again.";
        if (err.response?.data?.error) {
          message = err.response.data.error;
        }
        setStatus(`❌ ${message}`);
      }
    }

    verify();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg font-semibold">{status}</p>
    </div>
  );
}

export default function VerifyTokenPage() {
  return (
    <Suspense>
      <VerifyTokenInner />
    </Suspense>
  );
}
