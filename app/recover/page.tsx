"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mockResetLink, setMockResetLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("El correo electrónico es obligatorio");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Formato de correo electrónico inválido");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/recover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error al enviar el enlace");
      }

      setSuccess(true);
      if (data.recoveryLink) {
        setMockResetLink(data.recoveryLink);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar la solicitud";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 border border-border shadow-xl dark:bg-[#1A1A1A]">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Recuperar contraseña
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresá tu correo electrónico para enviarte un enlace de recuperación.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive text-center font-medium">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-6">
            <div className="rounded-lg bg-green-500/10 p-4 text-sm text-green-600 dark:text-green-400 font-medium text-center border border-green-500/20">
              ¡Solicitud procesada con éxito! Se ha generado un enlace de recuperación.
            </div>

            {mockResetLink && (
              <div className="rounded-lg bg-[#C1FD35]/10 p-4 border border-[#C1FD35]/20 text-center space-y-3">
                <p className="text-xs font-semibold text-[#a6db29] uppercase tracking-wider">
                  [Mock Helper] Enlace recibido por email:
                </p>
                <Link href={mockResetLink}>
                  <Button className="w-full bg-[#C1FD35] text-black font-semibold hover:bg-[#a6db29]">
                    Ir a restablecer contraseña
                  </Button>
                </Link>
                <p className="text-[10px] text-muted-foreground font-mono truncate select-all">
                  {window.location.origin + mockResetLink}
                </p>
              </div>
            )}

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm font-semibold text-primary dark:text-[#C1FD35] hover:underline"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="nombre@ejemplo.com"
                className="mt-1 block w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm focus:border-[#C1FD35] focus:outline-none focus:ring-1 focus:ring-[#C1FD35]"
              />
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C1FD35] text-black font-semibold py-3 hover:bg-[#a6db29] transition-all"
              >
                {loading ? "Enviando..." : "Enviar enlace de recuperación"}
              </Button>
            </div>

            <div className="text-center text-sm">
              <Link
                href="/login"
                className="font-semibold text-primary dark:text-[#C1FD35] hover:underline"
              >
                Volver al Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
