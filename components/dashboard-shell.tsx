"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-context";
import { DmhLogo } from "./dmh-logo";
import { Menu, X } from "lucide-react";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEEAEA]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#C1FD35] border-t-black"></div>
          <p className="text-sm font-medium text-gray-700">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = () => {
    const firstInitial = user.name ? user.name[0] : "";
    const lastInitial = user.lastName ? user.lastName[0] : "";
    return (firstInitial + lastInitial).toUpperCase() || "DH";
  };

  const navItems = [
    { label: "Inicio", href: "/home" },
    { label: "Actividad", href: "/activity" },
    { label: "Tu perfil", href: "/profile" },
    { label: "Cargar dinero", href: "/deposit" },
    { label: "Pagar Servicios", href: "/services" },
    { label: "Tarjetas", href: "/cards" },
  ];

  const isCurrentActive = (href: string) => {
    if (href === "/home") return pathname === "/home";
    if (href === "/cards") return pathname.startsWith("/cards");
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EEEAEA] text-[#1E1E1E]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full bg-[#201F22] text-white shadow-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/home" className="flex items-center hover:opacity-90 transition-opacity">
            <DmhLogo className="h-8" />
          </Link>

          {/* User badge and Mobile Toggle */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Header User Badge - Clicking redirects to Dashboard */}
            <Link
              href="/home"
              id="header-user-badge"
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/10 transition-colors group"
              title="Ir al inicio"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C1FD35] text-sm font-extrabold text-black shadow-sm group-hover:scale-105 transition-transform">
                {getInitials()}
              </div>
              <span className="text-sm font-semibold text-white tracking-wide group-hover:text-[#C1FD35] transition-colors">
                Hola, {user.name} {user.lastName}
              </span>
            </Link>

            {/* Mobile hamburger menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle"
              className="flex h-9 w-9 items-center justify-center rounded-md text-white hover:bg-white/10 md:hidden"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex flex-1 relative">
        {/* Persistent Left Sidebar on Desktop & Tablet */}
        <aside className="hidden md:flex w-56 lg:w-64 flex-col bg-[#C1FD35] p-6 lg:p-8 shrink-0 select-none">
          <nav className="flex flex-col space-y-4 text-base">
            {navItems.map((item) => {
              const active = isCurrentActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-left py-1.5 transition-all text-[17px] ${
                    active
                      ? "font-extrabold text-black"
                      : "font-semibold text-black/75 hover:text-black hover:translate-x-1"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-black/15">
              <button
                onClick={logout}
                id="sidebar-logout-button"
                className="w-full text-left py-1.5 text-[17px] font-semibold text-black/60 hover:text-black hover:font-bold transition-all"
              >
                Cerrar sesión
              </button>
            </div>
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <div className="relative flex w-64 max-w-[80%] flex-col bg-[#C1FD35] p-6 shadow-2xl z-10">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-black/20">
                <span className="font-extrabold text-black text-lg">Menú</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded p-1 text-black hover:bg-black/10"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex flex-col space-y-4 text-base">
                {navItems.map((item) => {
                  const active = isCurrentActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-left py-1.5 text-[17px] ${
                        active
                          ? "font-extrabold text-black"
                          : "font-semibold text-black/75 hover:text-black"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                <div className="pt-4 border-t border-black/20">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left py-1.5 text-[17px] font-semibold text-black/60 hover:text-black"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 bg-[#EEEAEA] p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#2B2A2D] py-4 px-6 text-xs text-white/70 text-left">
        <div className="max-w-7xl mx-auto">
          © 2022 Digital Money House
        </div>
      </footer>
    </div>
  );
}
