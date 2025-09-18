"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  CreditCard, 
  Settings, 
  LogOut, 
  Copy,
  CheckCircle,
  XCircle,
  Loader2,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { apiService } from "@/lib/api";
import { Toaster, toast } from "sonner";

export default function EmployeeDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [bankInfo, setBankInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load profile
      const profileData = await apiService.getEmployeeProfile();
      setProfile(profileData.data);

      // Load transactions
      try {
        const transactionsData = await apiService.getEmployeeTransactions();
        setTransactions(transactionsData.data || []);
      } catch (err) {
        console.log("No transactions yet");
        setTransactions([]);
      }

      // Load bank info
      try {
        const bankData = await apiService.getBankAccount();
        setBankInfo(bankData.data);
      } catch (err) {
        console.log("No bank info yet");
        setBankInfo(null);
      }

    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_info");
    router.push("/auth/login");
  };

  const copyTipCode = () => {
    if (profile?.tip_code) {
      navigator.clipboard.writeText(profile.tip_code);
      setCopied(true);
      toast.success("Tip code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load profile. Please try logging in again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Employee Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {profile.first_name} {profile.last_name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="bank">Bank Account</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {transactions.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All time tips received
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {transactions.filter(t => {
                      const date = new Date(t.created_at);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    }).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tips this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Badge variant={profile.is_active ? "default" : "secondary"}>
                      {profile.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Account status
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tip Code Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Tip Code</CardTitle>
                <CardDescription>
                  Share this code with customers to receive tips
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Input
                    value={profile.tip_code || "Not available"}
                    readOnly
                    className="font-mono text-lg"
                  />
                  <Button
                    onClick={copyTipCode}
                    variant="outline"
                    size="sm"
                    disabled={!profile.tip_code}
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Customers can use this code to send you tips instantly
                </p>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Tips</CardTitle>
                <CardDescription>
                  Your latest tip transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Tip #{index + 1}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            +{transaction.amount} ETB
                          </p>
                          <Badge variant="outline">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No tips received yet. Share your tip code to start receiving tips!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>
                  Complete history of your tip transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Tip Transaction</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            +{transaction.amount} ETB
                          </p>
                          <Badge variant="outline">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No transactions yet. Start receiving tips by sharing your tip code!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input value={profile.first_name || ""} readOnly />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input value={profile.last_name || ""} readOnly />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={profile.email || ""} readOnly />
                </div>
                <div>
                  <Label>Tip Code</Label>
                  <Input value={profile.tip_code || ""} readOnly />
                </div>
                <div>
                  <Label>Account Status</Label>
                  <div className="mt-2">
                    <Badge variant={profile.is_active ? "default" : "secondary"}>
                      {profile.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant={profile.is_verified ? "default" : "destructive"} className="ml-2">
                      {profile.is_verified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bank" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bank Account Information</CardTitle>
                <CardDescription>
                  Your bank account details for receiving payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bankInfo ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Sub Account ID</Label>
                      <Input value={bankInfo.sub_account_id || ""} readOnly />
                    </div>
                    <div>
                      <Label>Last Updated</Label>
                      <Input value={new Date(bankInfo.updated_at).toLocaleString()} readOnly />
                    </div>
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your bank account is set up and ready to receive payments.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      No bank account information found. Please set up your bank account to receive payments.
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard/employee/bank-setup")}
                      className="bg-[#71FF71] text-black hover:bg-[#00b74f]"
                    >
                      Set Up Bank Account
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
}

