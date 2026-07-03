"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const showSuccessAlert = searchParams.get("registered") === "true";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Testing helper: stores the generated code so the user can easily copy/paste it
  const [mockGeneratedCode, setMockGeneratedCode] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
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

    try {
      const response = await fetch("/api/auth/login-step-1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo validar el correo electrónico");
      }

      // Store generated code in state for easy copying in mock/dev testing
      if (data.code) {
        setMockGeneratedCode(data.code);
      }
      
      setStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ocurrió un error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("La contraseña es obligatoria");
      return;
    }
    if (!verificationCode) {
      setError("El código de verificación es obligatorio");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login-step-2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      // Login success: save token and update context
      login(data.token, data.user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al autenticar";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 border border-border shadow-xl dark:bg-[#1A1A1A]">
        
        {/* Success Alert from registration */}
        {showSuccessAlert && (
          <div className="rounded-lg bg-green-500/10 p-4 text-sm text-green-600 dark:text-green-400 font-medium text-center border border-green-500/20">
            ¡Registro completado con éxito! Por favor, iniciá sesión.
          </div>
        )}

        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Iniciar sesión
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === 1 
              ? "Ingresá tu correo electrónico para comenzar." 
              : "Ingresá tus credenciales y el código recibido."
            }
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive text-center font-medium">
            {error}
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
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
                {loading ? "Verificando..." : "Continuar"}
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Password and Verification Code Form */}
        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleCredentialsSubmit}>
            <div className="space-y-4">
              {/* Email Display (Readonly) */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Correo electrónico
                </label>
                <div className="mt-1 flex items-center justify-between text-sm font-medium">
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setMockGeneratedCode("");
                      setVerificationCode("");
                    }}
                    className="text-xs text-primary dark:text-[#C1FD35] hover:underline"
                  >
                    Modificar
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Contraseña
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="block w-full rounded-md border border-border bg-transparent px-3 py-2 pr-10 text-sm shadow-sm focus:border-[#C1FD35] focus:outline-none focus:ring-1 focus:ring-[#C1FD35]"
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
                <div className="mt-1 text-right">
                  <Link
                    href="/recover"
                    className="text-xs text-primary dark:text-[#C1FD35] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              {/* 6 Digit Verification Code */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium">
                  Código de verificación (6 dígitos)
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  maxLength={6}
                  required
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value);
                    setError("");
                  }}
                  placeholder="123456"
                  className="mt-1 block w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm focus:border-[#C1FD35] focus:outline-none focus:ring-1 focus:ring-[#C1FD35] text-center font-mono tracking-widest text-lg"
                />
              </div>

              {/* Mock QA Helper Box */}
              {mockGeneratedCode && (
                <div className="rounded-lg bg-[#C1FD35]/10 p-3 border border-[#C1FD35]/20 text-center">
                  <p className="text-xs font-semibold text-[#a6db29] uppercase tracking-wider mb-1">
                    [Mock Helper] Código de correo
                  </p>
                  <p className="text-xl font-bold tracking-widest font-mono text-white select-all">
                    {mockGeneratedCode}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    En una app real, este código se enviaría por correo electrónico.
                  </p>
                </div>
              )}
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C1FD35] text-black font-semibold py-3 hover:bg-[#a6db29] transition-all"
              >
                {loading ? "Autenticando..." : "Ingresar"}
              </Button>
            </div>
          </form>
        )}

        <div className="text-center text-sm pt-2">
          <span>¿No tenés una cuenta? </span>
          <Link
            href="/register"
            className="font-semibold text-primary dark:text-[#C1FD35] hover:underline"
          >
            Registrate gratis
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#C1FD35] border-r-transparent"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

