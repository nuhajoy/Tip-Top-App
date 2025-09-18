"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const useEmployeeListState = () => {
  const [employees, setEmployees] = useState([]);
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

    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/admin/employees?per_page=50",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        let data = res.data;
        if (typeof data === "string") {
          const jsonStart = data.indexOf("{");
          data = JSON.parse(data.substring(jsonStart));
        }

        setEmployees(data.data || []);
      } catch (err) {
        console.error("Error fetching employees:", err.response || err);
        setError("Failed to fetch employees.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [token]);

  const handleActivate = async (id) => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/admin/employees/${id}/activate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, is_active: true, ...res.data.employee } : e
        )
      );
    } catch (err) {
      console.error("Failed to activate employee:", err.response || err);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/admin/employees/${id}/deactivate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, is_active: false, ...res.data.employee } : e
        )
      );
    } catch (err) {
      console.error("Failed to deactivate employee:", err.response || err);
    }
  };

  const handleSuspend = async (id) => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/admin/employees/${id}/suspend`,
        { reason: "Policy violation" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, is_suspended: true, ...res.data.employee } : e
        )
      );
    } catch (err) {
      console.error("Failed to suspend employee:", err.response || err);
    }
  };

  const handleUnsuspend = async (id) => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/admin/employees/${id}/unsuspend`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, is_suspended: false, ...res.data.employee } : e
        )
      );
    } catch (err) {
      console.error("Failed to unsuspend employee:", err.response || err);
    }
  };


  const filteredEmployees = !searchQuery
    ? employees
    : employees.filter((e) =>
        (e.unique_id || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );

  return {
    filteredEmployees,
    searchQuery,
    setSearchQuery,
    expandedRow,
    setExpandedRow,
    editRow,
    setEditRow,
    loading,
    error,
    handleActivate,
    handleDeactivate,
    handleSuspend,
    handleUnsuspend,
  };
};

const EmployeesTable = ({
  employees,
  expandedRow,
  editRow,
  setExpandedRow,
  setEditRow,
  handleActivate,
  handleDeactivate,
  handleSuspend,
  handleUnsuspend,
}) => {
  const handleEditClick = (e, employeeId) => {
    e.stopPropagation();
    setEditRow(editRow === employeeId ? null : employeeId);
    setExpandedRow(expandedRow === employeeId ? null : employeeId);
  };

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full divide-y border-[var(--border)]">
        <thead className="bg-[var(--muted)]">
          <tr>
            {["Unique ID", "Provider ID", "Active", "Verified", "Suspended", "Actions"].map(
              (title) => (
                <th
                  key={title}
                  className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider"
                >
                  {title}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="bg-[var(--background)] divide-y border-[var(--border)]">
          {employees.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-4 text-center text-sm text-[var(--muted-foreground)]"
              >
                No employees found. Try a different search?
              </td>
            </tr>
          ) : (
            employees.flatMap((employee) => {
              const row = (
                <tr
                  key={employee.id}
                  className="hover:bg-[var(--accent)]/20 cursor-pointer transition-colors"
                  onClick={() =>
                    setExpandedRow(
                      expandedRow === employee.id ? null : employee.id
                    )
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">{employee.unique_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.service_provider_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.is_active ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.is_verified ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.is_suspended ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleEditClick(e, employee.id)}
                    >
                      {editRow === employee.id ? "Close" : "Edit"}
                    </Button>
                  </td>
                </tr>
              );


              const details = (
                <tr key={`${employee.id}-details`} className="bg-[var(--muted)]">
                  <td colSpan="6" className="p-4 text-sm text-[var(--muted-foreground)]">
                    <div className="flex space-x-2 mt-4">
                      {employee.is_active ? (
                        <Button
                          onClick={() => handleDeactivate(employee.id)}
                          className="bg-[var(--slight-accent)] text-[var(--foreground)] hover:brightness-110"
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleActivate(employee.id)}
                          className="bg-[var(--accent)] text-[var(--accent-foreground)] hover:brightness-110"
                        >
                          Activate
                        </Button>
                      )}

                      {employee.is_suspended ? (
                        <Button
                          onClick={() => handleUnsuspend(employee.id)}
                          className="bg-[var(--slight-accent)] text-[var(--foreground)] hover:brightness-110"
                        >
                          Unsuspend
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleSuspend(employee.id)}
                          className="bg-[var(--error)] text-[var(--accent-foreground)] hover:brightness-110"
                        >
                          Suspend
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );

              return expandedRow === employee.id ? [row, details] : [row];
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default function EmployeesSection() {
  const {
    filteredEmployees,
    searchQuery,
    setSearchQuery,
    expandedRow,
    setExpandedRow,
    editRow,
    setEditRow,
    loading,
    error,
    handleActivate,
    handleDeactivate,
    handleSuspend,
    handleUnsuspend,
  } = useEmployeeListState();

  const activeCount = filteredEmployees.filter((e) => e.is_active).length;
  const suspendedCount = filteredEmployees.filter((e) => e.is_suspended).length;
  const inactiveCount = filteredEmployees.filter((e) => !e.is_active).length;

  const summaryStats = [
    { title: "Total Employees", value: filteredEmployees.length },
    { title: "Active", value: activeCount },
    { title: "Inactive", value: inactiveCount },
    { title: "Suspended", value: suspendedCount },
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
          <h3 className="text-lg font-semibold">Employees</h3>
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="!shadow-none max-w-xs"
          />
        </div>

        {loading ? (
          <p className="text-[var(--muted-foreground)]">Loading employees...</p>
        ) : error ? (
          <p className="text-[var(--destructive)]">{error}</p>
        ) : (
          <EmployeesTable
            employees={filteredEmployees}
            expandedRow={expandedRow}
            editRow={editRow}
            setExpandedRow={setExpandedRow}
            setEditRow={setEditRow}
            handleActivate={handleActivate}
            handleDeactivate={handleDeactivate}
            handleSuspend={handleSuspend}
            handleUnsuspend={handleUnsuspend}
          />
        )}
      </Card>
    </div>
  );
}
