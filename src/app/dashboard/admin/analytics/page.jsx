"use client";

import { create } from "zustand";
import { Card } from "@/components/ui/card";

export const useAnalyticsStore = create((set) => ({
  providers: [],
  setProviders: (list) => set({ providers: list }),
}));

const StatCard = ({ title, value, color }) => (
  <Card className="p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className={`text-xl font-bold ${color}`}>{value}</p>
  </Card>
);

export default function AnalyticsPage() {
  const providers = useAnalyticsStore((state) => state.providers);

  const approvedProviders = providers.filter(
    (p) => p.status === "Approved" || p.status === "Verified"
  ).length;

  const pendingProviders = providers.filter(
    (p) => !p.status || p.status === "Pending"
  ).length;

  const analytics = {
    totalTransactions: 16500,
    withdrawn: 4500,
    inPlatform: 12000,
    approvedProviders,
    pendingProviders,
    totalProviders: providers.length,
  };

  const topStats = [
    { title: "Total Transactions", value: analytics.totalTransactions.toLocaleString() + " ETB", color: "text-secondary" },
    { title: "In Platform", value: analytics.inPlatform.toLocaleString() + " ETB", color: "text-secondary" },
    { title: "Approved Providers", value: analytics.approvedProviders, color: "text-accent-foreground" },
    { title: "Pending Providers", value: analytics.pendingProviders, color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topStats.map((item) => (
          <StatCard key={item.title} title={item.title} value={item.value} color={item.color} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
          <div className="space-y-6">
            {[
              { title: "Total Transactions", value: analytics.totalTransactions, color: "bg-primary" },
              { title: "In Platform", value: analytics.inPlatform, color: "bg-secondary" },
              { title: "Withdrawn", value: analytics.withdrawn, color: "bg-accent" },
            ].map((item) => (
              <div key={item.title} className="space-y-2">
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`${item.color} h-3 rounded-full transition-all duration-500`}
                    style={{
                      width: `${Math.min((item.value / analytics.totalTransactions) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-sm font-semibold">{item.value.toLocaleString()} ETB</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Top Performing Providers</h3>
          <div className="space-y-4">
            {providers.slice(0, 5).map((p, idx) => (
              <div
                key={`${p.id ?? "provider"}-${idx}`}
                className="flex items-center justify-between border-b pb-2 last:border-none last:pb-0"
              >
                <span className="text-sm font-medium">{p.businessName || "Provider"}</span>
                <span className="font-semibold text-sm text-primary">
                  {Math.floor(Math.random() * 5000).toLocaleString()} ETB
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 rounded-2xl shadow-sm lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Provider Stats</h3>
        <p className="text-sm text-muted-foreground mb-2">Total Providers</p>
        <div className="w-full bg-muted rounded-full h-3 mb-2">
          <div
            className="bg-accent h-3 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min((analytics.totalProviders / 50) * 100, 100)}%`,
            }}
          />
        </div>
        <p className="font-semibold">{analytics.totalProviders} Providers out of the planned 500</p>
      </Card>
    </div>
  );
}
