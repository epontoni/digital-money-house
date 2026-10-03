"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-context";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If on authenticated app shell routes, DashboardShell renders the dedicated layout
  const isDashboardRoute = ["/home", "/profile", "/cards", "/activity", "/deposit", "/services"].some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isDashboardRoute) return null;

  // Get initials from user's full name
  const getInitials = () => {
    if (!user) return "";
    const firstInitial = user.name ? user.name[0] : "";
    const lastInitial = user.lastName ? user.lastName[0] : "";
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#333333] bg-[#151515] text-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-wider text-[#C1FD35] hover:opacity-90">
            Digital Money House
          </span>
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <ModeToggle />
          
          {mounted && user ? (
            <div className="flex items-center gap-3">
              {/* User Avatar Initials */}
              <Link href="/home" className="flex items-center gap-2 hover:opacity-95 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C1FD35] text-sm font-bold text-black group-hover:bg-[#a6db29] transition-colors">
                  {getInitials()}
                </div>
                <span className="hidden text-sm font-medium text-white md:inline group-hover:text-[#C1FD35] transition-colors">
                  Hola, {user.name} {user.lastName}
                </span>
              </Link>
              {/* Logout Button */}
              <Button
                variant="ghost"
                onClick={logout}
                className="text-sm font-medium text-white hover:bg-[#333333] hover:text-[#C1FD35]"
              >
                Cerrar sesión
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                className="border-[#C1FD35] text-white hover:bg-[#C1FD35] hover:text-black bg-transparent"
              >
                <Link href="/login">Ingresar</Link>
              </Button>
              <Button asChild className="bg-[#C1FD35] text-black hover:bg-[#a6db29]">
                <Link href="/register">Crear cuenta</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

