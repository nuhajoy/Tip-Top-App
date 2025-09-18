"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiService } from "@/lib/api";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("Invalid verification link");
      return;
    }

    async function verify() {
      try {
        await apiService.request(`/employees/verify-email?token=${token}`, {
          method: "POST", // or GET, depending on your backend
        });
        setStatus("✅ Email verified successfully!");
        setTimeout(() => router.push("/auth/login"), 2000);
      } catch (err) {
        setStatus("❌ Verification failed: " + err.message);
      }
    }

    verify();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>{status}</p>
    </div>
  );
}
