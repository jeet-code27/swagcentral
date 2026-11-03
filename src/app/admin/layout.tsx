"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  UploadCloud,
  ArrowLeft,
  LogOut,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<{ email: string } | null>(null);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      return;
    }

    // Check token-based authentication session
    fetch("/api/admin/auth/me")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        if (data.authenticated) {
          setAdminUser(data.admin);
          setCheckingAuth(false);
        } else {
          router.push("/admin/login");
        }
      })
      .catch(() => {
        router.push("/admin/login");
      });
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      localStorage.removeItem("swagcentral_admin_token");
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      router.push("/admin/login");
    }
  };

  // If on login page, render full screen without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: Layers },
    { href: "/admin/orders", label: "Orders & Delivery", icon: ShoppingBag },
    { href: "/admin/import", label: "WordPress Importer", icon: UploadCloud },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0f172a] text-gray-100 font-body relative">
      {/* Non-blocking overlay while checking auth token */}
      {checkingAuth && (
        <div className="fixed inset-0 z-50 bg-[#070b14]/90 backdrop-blur-sm flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#ff5500]" />
            <span className="font-unbounded text-xs tracking-wider uppercase text-gray-400">
              Verifying Admin Security Token...
            </span>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0a0f1d] border-b md:border-b-0 md:border-r border-gray-800 p-6 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-8">
          {/* Logo with transparent image */}
          <Link href="/" className="flex flex-col gap-2">
            <img
              src="/images/logo.webp"
              alt="SwagCentral"
              className="h-10 w-auto object-contain"
            />
            <div className="inline-flex items-center gap-1.5 bg-[#ff5500]/15 text-[#ff5500] px-2 py-0.5 rounded text-[10px] font-unbounded font-black tracking-widest uppercase w-max">
              <ShieldCheck size={12} />
              <span>SUPER ADMIN</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="space-y-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-unbounded font-semibold transition ${
                    isActive
                      ? "bg-[#ff5500] text-white shadow-lg shadow-[#ff5500]/20"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom user info and actions */}
        <div className="pt-6 border-t border-gray-800 mt-6 space-y-3">
          {adminUser && (
            <div className="text-[11px] text-gray-400 truncate">
              Signed in as: <br />
              <strong className="text-white">{adminUser.email}</strong>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition font-unbounded font-bold"
            >
              <ArrowLeft size={13} />
              <span>Store</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition font-unbounded font-bold"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Always Rendered */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">{children}</main>
    </div>
  );
}
