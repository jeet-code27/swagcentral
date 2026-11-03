"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ShieldAlert, ArrowRight, Loader2, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Store token in localStorage as well for optional Authorization header usage
      if (data.token) {
        localStorage.setItem("swagcentral_admin_token", data.token);
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-between p-4 sm:p-6 text-gray-100 font-body relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ff5500]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top bar back link */}
      <div className="max-w-md mx-auto w-full pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition font-unbounded font-semibold"
        >
          <ArrowLeft size={14} />
          <span>Back to SwagCentral Store</span>
        </Link>
      </div>

      {/* Center Login Box */}
      <div className="max-w-md w-full mx-auto bg-[#0f172a] border border-gray-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 space-y-6">
        {/* Brand Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img
              src="/images/logo.webp"
              alt="SwagCentral"
              className="h-14 w-auto object-contain"
            />
          </div>
          <div className="space-y-1">
            <span className="inline-block bg-[#ff5500]/10 border border-[#ff5500]/30 text-[#ff5500] text-[10px] font-unbounded font-black px-3 py-1 rounded-full uppercase tracking-wider">
              SUPER ADMIN PORTAL
            </span>
            <h1 className="font-unbounded font-black text-2xl text-white tracking-tight">
              SIGN IN
            </h1>
            <p className="text-xs text-gray-400">
              Token-based authentication for SwagCentral control panel.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/60 text-red-300 border border-red-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
            <ShieldAlert size={16} className="flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-unbounded font-semibold text-gray-300 uppercase mb-1.5">
              Super Admin Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email..."
                className="w-full bg-[#0a0f1d] border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff5500]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-unbounded font-semibold text-gray-300 uppercase mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password..."
                className="w-full bg-[#0a0f1d] border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff5500]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff5500] hover:bg-[#e04b00] disabled:bg-gray-700 text-white font-unbounded font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-98"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Verifying Token...</span>
              </>
            ) : (
              <>
                <span>Enter Admin Console</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer text */}
      <div className="text-center text-xs text-gray-500 pb-2">
        Protected with 256-bit encrypted JWT sessions. SwagCentral © 2026.
      </div>
    </div>
  );
}
