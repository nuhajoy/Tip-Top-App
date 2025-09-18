"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { useAdminStore } from "@/store/adminStore";
import {
  Bell,
  UserCircle,
  LogOut,
  Home,
  Users,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const { loadProviders } = useAdminStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New provider registered", read: false },
    { id: 2, text: "Transaction exceeded 10,000 ETB", read: false },
    { id: 3, text: "Provider account suspended", read: false },
  ]);

  useEffect(() => {
    (async () => {
      try {
        await loadProviders();
      } catch (err) {
        console.error("Failed to load providers:", err);
      }
    })();
  }, [loadProviders]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className="flex-1 flex flex-col bg-background">
        <Topbar notifications={notifications} setNotifications={setNotifications} />
        <main className="p-6 space-y-6 bg-background">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

const Sidebar = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();
  const menuItems = [
    { label: "Overview", href: "/dashboard/admin", icon: <Home size={18} /> },
    { label: "Analytics", href: "/dashboard/admin/analytics", icon: <Users size={18} /> },
    { label: "Providers", href: "/dashboard/admin/providers", icon: <Users size={18} /> },
    { label: "Transactions", href: "/dashboard/admin/transactions", icon: <CreditCard size={18} /> },
    { label: "Employees", href: "/dashboard/admin/employees", icon: <Users size={18} /> },
    { label: "Settings", href: "/dashboard/admin/settings", icon: <Settings size={18} /> },
    { label: "Logout", href: "/admin/logout", icon: <LogOut size={18} /> },
  ];

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-sidebar shadow-xl flex flex-col transition-all duration-300`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <img src="/logo.png" alt="TipTop Logo" className="h-20 w-auto" />
        </div>
        <button
          className="ml-2"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className="flex-1 flex flex-col gap-1 mt-2 px-2">
        {menuItems.map((item) => {
          const active = item.href === pathname;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200 w-full text-left ${
                active ? "bg-secondary text-secondary-foreground" : "hover:bg-accent text-foreground"
              }`}
            >
              {item.icon}
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

const Topbar = ({ notifications, setNotifications }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <header className="flex justify-start items-center gap-4 px-6 py-4 bg-primary shadow-sm relative">
      <div className="text-xl font-bold">Admin Dashboard</div>
      <div className="ml-auto flex items-center gap-4">
        <div className="relative">
          <button onClick={() => setNotifOpen((o) => !o)} className="relative">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[var(--error)] rounded-full text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-primary shadow-lg rounded-xl py-2 z-50">
              {notifications.length === 0 ? (
                <p className="px-4 py-2 text-sm text-muted-foreground">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-center justify-between px-4 py-2 text-sm ${
                      n.read ? "text-muted-foreground" : "text-foreground font-medium"
                    }`}
                  >
                    <span>{n.text}</span>
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="ml-2 text-xs text-accent hover:text-accent flex items-center gap-1"
                      >
                        <Check size={12} /> read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 focus:outline-none"
          >
            <UserCircle size={20} />
            <span className="hidden md:inline">Admin</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-primary shadow-lg rounded-xl py-2 z-50">
              <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-input rounded-lg">
                <Settings size={16} /> Settings
              </button>
              <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-input rounded-lg">
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};