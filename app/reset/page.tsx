"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      newErrors.password = "La contraseña debe incluir al menos una letra y un número";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Debe confirmar su contraseña";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Token de recuperación ausente o inválido");
      return;
    }

    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al restablecer la contraseña");
      }

      // Success: redirect to login
      router.push("/login?registered=true");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ocurrió un error inesperado";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive font-medium border border-destructive/20">
          Enlace de recuperación inválido o expirado. Por favor, solicitá uno nuevo.
        </div>
        <Button
          onClick={() => router.push("/recover")}
          className="bg-[#C1FD35] text-black font-semibold hover:bg-[#a6db29]"
        >
          Solicitar nuevo enlace
        </Button>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive text-center font-medium">
            {error}
          </div>
        )}

        {/* New Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Nueva contraseña
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.password;
                  return next;
                });
                setError("");
              }}
              className={`block w-full rounded-md border bg-transparent px-3 py-2 pr-10 text-sm shadow-sm focus:border-[#C1FD35] focus:outline-none focus:ring-1 focus:ring-[#C1FD35] ${
                errors.password ? "border-destructive" : "border-border"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-white"
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium">
            Repetir nueva contraseña
          </label>
          <div className="relative mt-1">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.confirmPassword;
                  return next;
                });
                setError("");
              }}
              className={`block w-full rounded-md border bg-transparent px-3 py-2 pr-10 text-sm shadow-sm focus:border-[#C1FD35] focus:outline-none focus:ring-1 focus:ring-[#C1FD35] ${
                errors.confirmPassword ? "border-destructive" : "border-border"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-white"
            >
              {showConfirmPassword ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-destructive">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      <div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#C1FD35] text-black font-semibold py-3 hover:bg-[#a6db29] transition-all"
        >
          {loading ? "Actualizando..." : "Restablecer contraseña"}
        </Button>
      </div>
    </form>
  );
}

export default function ResetPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 border border-border shadow-xl dark:bg-[#1A1A1A]">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Restablecer contraseña
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresá tu nueva contraseña para volver a acceder a tu cuenta.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#C1FD35] border-r-transparent"></div>
            </div>
          }
        >
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
