"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

export default function ProviderStatusPage() {
  const { user, userType, loading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!loading && userType === "service_provider") {
      const isApproved = user.registration_status === "accepted";
      const emailVerified = !!user.email_verified_at;

      setStatus({ isApproved, emailVerified });
    }
  }, [loading, user, userType]);

  if (loading || !status)
    return <p className="text-center">Loading status...</p>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold text-center">Account Status</h2>

      {!status.isApproved && (
        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="font-semibold text-yellow-800">⏳ Pending Approval</h3>
          <p>
            Your documents are under review. You’ll be notified once approved.
          </p>
        </div>
      )}

      {status.isApproved && !status.emailVerified && (
        <div className="bg-blue-100 p-4 rounded">
          <h3 className="font-semibold text-blue-800">
            📧 Email Verification Needed
          </h3>
          <p>
            We’ve sent a verification link to your email. Please check your
            inbox.
          </p>
        </div>
      )}

      {status.isApproved && status.emailVerified && (
        <div className="bg-green-100 p-4 rounded">
          <h3 className="font-semibold text-green-800">✅ You're Verified!</h3>
          <p>Welcome aboard. You can now access your dashboard.</p>
          <button
            onClick={() => router.push("/provider/dashboard")}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
