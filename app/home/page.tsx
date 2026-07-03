"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#C1FD35] border-r-transparent"></div>
        <span className="sr-only">Cargando...</span>
      </div>
    );
  }

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Greetings section */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hola, {user.name} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido a tu panel de control de Digital Money House.
          </p>
        </div>
        <div>
          <Button
            variant="outline"
            onClick={logout}
            className="border-destructive/30 hover:bg-destructive/10 text-destructive bg-transparent transition-all"
          >
            Cerrar sesión
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Side: Balance & Account details */}
        <div className="space-y-8 lg:col-span-8">
          
          {/* Balance Card */}
          <div className="rounded-2xl bg-[#151515] p-6 text-white shadow-lg border border-[#333333] relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-40 w-40 bg-[#C1FD35]/5 rounded-full filter blur-3xl group-hover:bg-[#C1FD35]/10 transition-colors"></div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Tu saldo disponible
            </p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl text-[#C1FD35]">
              ${user.balance.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </h2>

            <div className="mt-6 border-t border-[#333333] pt-6 grid gap-4 sm:grid-cols-2">
              {/* Account Number */}
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Nro. de Cuenta</span>
                <div className="flex items-center justify-between rounded-lg bg-[#202020] px-3 py-2 text-sm font-mono border border-[#333333]">
                  <span>{user.accountNumber}</span>
                  <button
                    onClick={() => handleCopy(user.accountNumber, "accountNumber")}
                    className="text-[#C1FD35] hover:opacity-85 text-xs font-semibold"
                  >
                    {copiedField === "accountNumber" ? "Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>

              {/* CVU */}
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium">CVU</span>
                <div className="flex items-center justify-between rounded-lg bg-[#202020] px-3 py-2 text-sm font-mono border border-[#333333]">
                  <span className="truncate max-w-[180px]">{user.cvu}</span>
                  <button
                    onClick={() => handleCopy(user.cvu, "cvu")}
                    className="text-[#C1FD35] hover:opacity-85 text-xs font-semibold"
                  >
                    {copiedField === "cvu" ? "Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="rounded-2xl bg-white p-6 border border-border shadow-md dark:bg-[#1A1A1A]">
            <h3 className="text-xl font-bold mb-4">Tu actividad reciente</h3>
            
            {/* Empty activity state for Sprint 1 */}
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="rounded-full bg-muted p-3 text-muted-foreground">
                <svg
                  className="h-8 w-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold text-muted-foreground">
                No tenés movimientos todavía
              </p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Cuando realices transferencias o pagues servicios, verás el historial detallado de tus transacciones aquí.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Actions Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-white p-6 border border-border shadow-md dark:bg-[#1A1A1A] space-y-4">
            <h3 className="text-xl font-bold mb-2">Acciones rápidas</h3>
            
            {/* Action 1: Cargar Dinero */}
            <Button className="w-full flex items-center justify-start gap-3 py-6 px-4 bg-muted hover:bg-[#C1FD35] hover:text-black text-foreground dark:bg-[#252525] border-none font-semibold transition-all group">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C1FD35]/15 text-[#C1FD35] group-hover:bg-black/10 group-hover:text-black transition-colors">
                +
              </span>
              Cargar dinero
            </Button>

            {/* Action 2: Transferencias */}
            <Button className="w-full flex items-center justify-start gap-3 py-6 px-4 bg-muted hover:bg-[#C1FD35] hover:text-black text-foreground dark:bg-[#252525] border-none font-semibold transition-all group">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C1FD35]/15 text-[#C1FD35] group-hover:bg-black/10 group-hover:text-black transition-colors">
                ⇄
              </span>
              Transferir dinero
            </Button>

            {/* Action 3: Pagar Servicios */}
            <Button className="w-full flex items-center justify-start gap-3 py-6 px-4 bg-muted hover:bg-[#C1FD35] hover:text-black text-foreground dark:bg-[#252525] border-none font-semibold transition-all group">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C1FD35]/15 text-[#C1FD35] group-hover:bg-black/10 group-hover:text-black transition-colors">
                $
              </span>
              Pagar servicios
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
