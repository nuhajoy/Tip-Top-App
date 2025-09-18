"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Users,
  Settings,
  PlusCircle,
  LogOut,
  Menu,
  X as CloseIcon,
  Coffee,
  Copy,
  Search,
  UserCheck,
  UserX,
  UserPlus,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { apiService } from "@/lib/api"; // <-- use single instance

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [employees, setEmployees] = useState([]);
  const [employeeSummary, setEmployeeSummary] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [newEmployeeCount, setNewEmployeeCount] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const profileData = await apiService.fetchProfile();
      setProfile(profileData);

      const summaryData = await apiService.fetchEmployeeSummary();
      setEmployeeSummary({
        total: summaryData.total,
        active: summaryData.active,
        inactive: summaryData.inactive,
      });

      const employeeList = await apiService.fetchEmployees();
      const mappedEmployees = (employeeList.employees || employeeList).map(
        (emp) => ({ ...emp, is_active: emp.is_active ?? true })
      );
      setEmployees(mappedEmployees);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      showMessage("Failed to load dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addEmployees = async () => {
    if (!newEmployeeCount || newEmployeeCount < 1) {
      showMessage("Enter a valid number of employees (min 1)", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.registerEmployeesAPI({
        count: newEmployeeCount,
      });

      const createdEmployees = (response.employees || []).map((emp) => ({
        id: emp.employee_code,
        is_active: true,
        first_name: null,
        last_name: null,
        email: null,
      }));

      setEmployees((prev) => [...prev, ...createdEmployees]);
      setEmployeeSummary((prev) => ({
        ...prev,
        total: prev.total + createdEmployees.length,
        active: prev.active + createdEmployees.length,
        inactive: prev.inactive,
      }));

      setNewEmployeeCount(1);
      setShowForm(false);
      showMessage(`Employee code(s) generated successfully.`, "success");
    } catch (err) {
      console.error(err);
      showMessage("Error adding employee: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    showMessage(`Code ${code} copied to clipboard!`);
  };

  const toggleActive = async (employeeId) => {
    setLoading(true);
    try {
      const emp = employees.find((e) => e.id === employeeId);
      if (!emp) throw new Error("Employee not found.");

      await apiService.toggleEmployeeStatusAPI(
        employeeId,
        emp.is_active ? "deactivate" : "activate"
      );

      setEmployees((prev) =>
        prev.map((e) =>
          e.id === employeeId ? { ...e, is_active: !e.is_active } : e
        )
      );

      setEmployeeSummary((prev) => ({
        ...prev,
        active: emp.is_active ? prev.active - 1 : prev.active + 1,
        inactive: emp.is_active ? prev.inactive + 1 : prev.inactive - 1,
      }));

      showMessage(`Employee is now ${!emp.is_active ? "Active" : "Inactive"}`);
    } catch (err) {
      console.error(err);
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logoutAPI();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
      showMessage("Failed to log out. Please try again.", "error");
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (isMobile) setIsMobileMenuOpen(false);
  };

  const chartData = [
    { name: "Active", value: employeeSummary.active },
    { name: "Inactive", value: employeeSummary.inactive },
  ];
  const COLORS = ["#4ade80", "#f87171"];

  const employeeList = employees.map((emp) => ({
    ...emp,
    name:
      emp.first_name && emp.last_name
        ? `${emp.first_name} ${emp.last_name}`
        : null,
  }));

  const filteredEmployees = employeeList.filter(
    (emp) =>
      (emp.name || "Pending")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recentEmployees = employeeList
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  if (loading && !employees.length) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center z-50">
        <div className="flex space-x-6">
          {[Users, BarChart3, Coffee].map((Icon, idx) => (
            <motion.div
              key={idx}
              animate={{ y: ["0%", "-20%", "0%"] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatDelay: 0.1,
                delay: idx * 0.2,
              }}
              className="text-white"
            >
              <Icon className="h-12 w-12" />
            </motion.div>
          ))}
        </div>
        <p className="text-white mt-4 text-lg animate-pulse">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  // --- THE REST OF YOUR UI stays exactly the same ---
  // Keep all your header, sidebar, tabs, charts, employee table, recent employees, add form, etc.

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ x: isMobile ? -256 : 0 }}
        animate={{ x: isMobileMenuOpen || !isMobile ? 0 : -256 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="fixed md:relative inset-y-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 py-6 px-4 flex flex-col justify-between z-40"
      >
        <div>
          <div className="flex items-center justify-between mb-8 px-2">
            <Image
              src="/logo.png"
              alt="TipTop Logo"
              width={100}
              height={60}
              priority
            />
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <CloseIcon className="h-6 w-6" />
              </Button>
            )}
          </div>
          <nav className="space-y-1">
            {[
              { key: "overview", label: "Dashboard", icon: BarChart3 },
              { key: "employees", label: "Employees", icon: Users },
              { key: "settings", label: "Settings", icon: Settings },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant="ghost"
                className={`w-full justify-start ${
                  activeTab === key
                    ? "bg-[var(--accent)] text-black hover:opacity-90"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => handleTabChange(key)}
              >
                <Icon className="mr-3 h-5 w-5" /> {label}
              </Button>
            ))}
          </nav>
        </div>
        {isMobile && (
          <Button
            variant="destructive"
            className="flex items-center justify-center h-10 bg-red-600 mt-4"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" /> Logout
          </Button>
        )}
      </motion.div>
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`flex-1 ${
          isMobile ? "overflow-auto" : "overflow-hidden"
        } md:overflow-auto`}
      >
        <header className="flex items-center justify-between p-4 md:p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={profile?.image_url || "/avatars/default.jpg"}
                />
                <AvatarFallback>
                  {profile?.name
                    ? profile.name.slice(0, 2).toUpperCase()
                    : "SP"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {profile?.name || "Service Provider"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {profile?.category || "Loading..."}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
            {!isMobile && (
              <Button
                variant="destructive"
                className="flex items-center justify-center h-10 bg-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" /> Logout
              </Button>
            )}
          </div>
        </header>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg text-white ${
                message.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <main className="p-4 md:p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsContent value="overview">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Welcome back, {profile?.name || "Service Provider"}!
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[
                    {
                      title: "Total Employees",
                      value: employeeSummary.total,
                      color: "text-black-500",
                      icon: Users,
                    },
                    {
                      title: "Active Employees",
                      value: employeeSummary.active,
                      color: "text-green-500",
                      icon: UserCheck,
                    },
                    {
                      title: "Inactive Employees",
                      value: employeeSummary.inactive,
                      color: "text-red-500",
                      icon: UserX,
                    },
                    {
                      title: "Pending",
                      value: employees.filter(
                        (e) => !e.first_name && !e.last_name && !e.email
                      ).length,
                      color: "text-yellow-500",
                      icon: UserPlus,
                    },
                  ].map(({ title, value, color, icon: Icon }, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            {title}
                          </CardTitle>
                          <Icon className={`h-4 w-4 ${color}`} />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{value}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-sm md:text-base">
                        Employee Status Ratio
                      </CardTitle>
                      <CardDescription>
                        Active vs Inactive Employees
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label
                          >
                            {chartData.map((entry, index) => (
                              <Cell
                                key={index}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle>Recent Employee Registrations</CardTitle>
                      <CardDescription>
                        The most recently added employees.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        {recentEmployees.length > 0 ? (
                          recentEmployees.map((emp) => (
                            <li
                              key={emp.id}
                              className="flex items-center space-x-3"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={emp.image_url || "/avatars/default.jpg"}
                                />
                                <AvatarFallback>
                                  {emp.name
                                    ? emp.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                    : "UN"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {emp.name || "Pending Employee"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Code: {emp.id}
                                </p>
                              </div>
                            </li>
                          ))
                        ) : (
                          <p className="text-gray-500 italic text-sm">
                            No recent employees found.
                          </p>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="employees">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
                  <div>
                    <CardTitle className="text-sm md:text-base text-gray-800">
                      Employees
                    </CardTitle>
                    <CardDescription>Manage your staff</CardDescription>
                  </div>
                  <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full"
                      />
                    </div>
                    {!showForm ? (
                      <Button
                        onClick={() => setShowForm(true)}
                        className="flex items-center bg-[var(--accent)]"
                        disabled={loading}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => setShowForm(false)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardHeader>

                {showForm && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={newEmployeeCount}
                        onChange={(e) =>
                          setNewEmployeeCount(parseInt(e.target.value))
                        }
                        placeholder="Number of employees to add (1-100)"
                        className="w-full px-3 py-2 border rounded"
                        disabled={loading}
                      />
                    </div>
                    <Button
                      onClick={addEmployees}
                      className="bg-[var(--accent)] hover:opacity-90"
                      disabled={loading}
                    >
                      {loading ? "Adding..." : "Generate Code(s)"}
                    </Button>
                  </div>
                )}

                <div className="overflow-x-auto mt-4">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                          Code
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                          Status
                        </th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-500 dark:text-gray-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((emp) => (
                          <tr key={emp.id}>
                            <td className="px-4 py-2">
                              {emp.name ? (
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage
                                      src={
                                        emp.image_url || "/avatars/default.jpg"
                                      }
                                    />
                                    <AvatarFallback>
                                      {emp.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {emp.name}
                                    </p>
                                    {emp.email && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {emp.email}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-500 italic">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs">
                                  {emp.id}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyCode(emp.id)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <Badge
                                variant={
                                  emp.is_active ? "success" : "destructive"
                                }
                              >
                                {emp.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="px-4 py-2 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleActive(emp.id)}
                                disabled={loading}
                              >
                                <Badge
                                  variant={
                                    emp.is_active ? "destructive" : "success"
                                  }
                                >
                                  {emp.is_active ? "Deactivate" : "Activate"}
                                </Badge>
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                          >
                            No employees found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6">
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure your dashboard preferences.
                </CardDescription>
                <Button
                  onClick={handleLogout}
                  className="mt-4 bg-red-600 hover:black"
                >
                  Logout
                </Button>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
