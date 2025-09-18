"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_BASE = "http://127.0.0.1:8000/api/admin";

const useProviderListState = () => {
  const [providers, setProviders] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    if (!token) {
      setError("No auth token found. Please log in.");
      setLoading(false);
      return;
    }

    const fetchProviders = async () => {
      setLoading(true);
      try {
        console.log("Fetching providers...");
        const res = await axios.get(`${API_BASE}/service-providers?per_page=50`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let data = res.data;
        if (typeof data === "string") {
          const jsonStart = data.indexOf("{");
          data = JSON.parse(data.substring(jsonStart));
        }

        const formatted = (data.data || []).map((p) => ({
          ...p,
          status: p.registration_status === "accepted" ? "Verified" : "Pending",
        }));

        console.log("Providers fetched:", formatted);
        setProviders(formatted);
      } catch (err) {
        console.error("Error fetching providers:", err.response || err);
        setError("Failed to fetch providers.");
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [token]);

  const handleAction = async (provider, action) => {
    if (!provider.id) return;
    if (!token) return console.error("No token found for API call");

    let url = `${API_BASE}/service-providers/${provider.id}`;
    if (action === "approve") url += "/accept";
    if (action === "suspend") url += "/suspend";
    if (action === "unsuspend") url += "/unsuspend";
    if (action === "remove") url += "/reject";

    let payload = action === "suspend" ? { reason: "Policy violation" } : {};

    try {
      console.log(`Calling ${action} API for provider ${provider.id}`);
      const res = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`${action} response:`, res.data);
      
      if (res.data.provider) {
        setProviders((prev) =>
          prev.map((p) => (p.id === provider.id ? {
            ...p,
            ...res.data.provider,
            status:
              res.data.provider.registration_status === "accepted"
                ? "Verified"
                : p.status === "Pending" && action === "approve"
                ? "Verified"
                : p.status
          } : p))
        );
      }
    } catch (err) {
      console.error(`Failed to ${action} provider:`, err.response || err);
    }
  };

  const filteredProviders = !searchQuery
    ? providers
    : providers.filter((p) =>
        (p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
      );

  return {
    filteredProviders,
    searchQuery,
    setSearchQuery,
    expandedRow,
    setExpandedRow,
    editRow,
    setEditRow,
    loading,
    error,
    handleAction,
  };
};

const ProvidersTable = ({
  providers,
  expandedRow,
  editRow,
  setExpandedRow,
  setEditRow,
  handleAction,
}) => {
  const getStatusClass = (status) => {
    if (status === "Verified") return "text-[var(--accent-foreground)] bg-[var(--accent)]";
    if (status === "Suspended") return "text-[var(--destructive)] bg-[var(--slight-accent)]";
    return "text-[var(--foreground)] bg-[var(--muted)]";
  };

  const handleEditClick = (e, providerId) => {
    e.stopPropagation();
    setEditRow(editRow === providerId ? null : providerId);
    setExpandedRow(expandedRow === providerId ? null : providerId);
  };


  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full divide-y border-[var(--border)]">
        <thead className="bg-[var(--muted)]">
          <tr>
            {["Avatar", "Name", "Type", "Email", "Status", "Actions"].map((title) => (
              <th
                key={title}
                className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider"
              >
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-[var(--background)] divide-y border-[var(--border)]">
          {providers.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-[var(--muted-foreground)]">
                No service providers found. Try a different search?
              </td>
            </tr>
          ) : (
            providers.flatMap((provider) => {
              const providerKey = provider.id;
              const displayStatus = provider.status || "Pending";

              const row = (
                <tr
                  key={providerKey}
                  className="hover:bg-[var(--accent)]/20 cursor-pointer transition-colors"
                  onClick={() =>
                    setExpandedRow(
                      expandedRow === providerKey ? null : providerKey
                    )
                  }
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-10 h-10 relative rounded-full overflow-hidden">
                      <Image
                        src={provider.license_url}
                        alt={provider.name || "Provider"}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {provider.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {provider.category_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {provider.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                        displayStatus
                      )}`}
                    >
                      {displayStatus === "Verified"
                        ? "Approved"
                        : displayStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleEditClick(e, providerKey)}
                    >
                      {editRow === providerKey ? "Close" : "Edit"}
                    </Button>
                  </td>
                </tr>
              );


              const details = (
                <tr key={`${providerKey}-details`} className="bg-[var(--muted)]">
                  <td colSpan="6" className="p-4 text-sm text-[var(--muted-foreground)]">
                    <div className="grid grid-cols-2 gap-2">
                      <p><strong>Description:</strong> {provider.description || "N/A"}</p>
                      <p><strong>Phone:</strong> {provider.contact_phone || "N/A"}</p>
                      <p><strong>Tax ID:</strong> {provider.tax_id || "N/A"}</p>
                      {provider.license && (
                        <p>
                          <strong>License:</strong>{" "}
                          <a
                            href={provider.license}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--accent-foreground)] underline"
                          >
                            View
                          </a>
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button
                        onClick={() => handleAction(provider, "approve")}
                        className="bg-[var(--accent)] text-[var(--accent-foreground)] hover:brightness-110 transition-colors"
                      >
                        Approve
                      </Button>

                      {!provider.is_suspended ? (
                        <Button
                          onClick={() => handleAction(provider, "suspend")}
                          className="bg-[var(--slight-accent)] text-[var(--foreground)] hover:brightness-110 transition-colors"
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleAction(provider, "unsuspend")}
                          className="bg-[var(--muted)] text-[var(--foreground)] hover:brightness-110 transition-colors"
                        >
                          Unsuspend
                        </Button>
                      )}

                      <Button
                        onClick={() => handleAction(provider, "remove")}
                        className="bg-[var(--error)] text-[var(--accent-foreground)] hover:brightness-110 transition-colors"
                      >
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              );

              return expandedRow === providerKey ? [row, details] : [row];
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default function ProvidersSection() {
  const {
    filteredProviders,
    searchQuery,
    setSearchQuery,
    expandedRow,
    setExpandedRow,
    editRow,
    setEditRow,
    loading,
    error,
    handleAction,
  } = useProviderListState();

  const approvedCount = filteredProviders.filter(
    (p) => p.status === "Verified"
  ).length;
  const suspendedCount = filteredProviders.filter((p) => p.is_suspended).length;
  const pendingCount =
    filteredProviders.length - approvedCount - suspendedCount;

  const summaryStats = [
    { title: "Total Providers", value: filteredProviders.length },
    { title: "Approved", value: approvedCount },
    { title: "Suspended", value: suspendedCount },
    { title: "Pending", value: pendingCount },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {summaryStats.map((stat, index) => (
          <Card
            key={index}
            className="p-4 rounded-2xl shadow hover:shadow-md transition-shadow"
          >
            <h4 className="text-sm font-medium text-[var(--muted-foreground)]">
              {stat.title}
            </h4>
            <p className="text-2xl font-bold">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4 rounded-2xl shadow hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
          <h3 className="text-lg font-semibold">Service Providers</h3>
          <Input
            placeholder="Search providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="!shadow-none max-w-xs"
          />
        </div>

        {loading ? (
          <p className="text-[var(--muted-foreground)]">Loading providers...</p>
        ) : error ? (
          <p className="text-[var(--destructive)]">{error}</p>
        ) : (
          <ProvidersTable
            providers={filteredProviders}
            expandedRow={expandedRow}
            editRow={editRow}
            setExpandedRow={setExpandedRow}
            setEditRow={setEditRow}
            handleAction={handleAction}
          />
        )}
      </Card>
    </div>
  );
}
