"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/auth-context";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token de confirmación faltante");
      setLoading(false);
      return;
    }

    const confirmEmail = async () => {
      try {
        const response = await fetch("/api/user/confirm-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (response.ok) {
          setSuccess(true);
          setConfirmedEmail(data.email);
          await refreshUser();
        } else {
          setError(data.error || "No se pudo confirmar el correo.");
        }
      } catch (err: any) {
        setError(err.message || "Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [token, refreshUser]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-200 text-center">
        {loading ? (
          <div className="py-8 space-y-4">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#C1FD35] border-t-black"></div>
            <p className="text-gray-600 font-medium">Validando tu nuevo correo electrónico...</p>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black text-black">¡Correo confirmado!</h2>
            <p className="text-gray-600 text-sm">
              Tu nuevo correo electrónico <strong>{confirmedEmail}</strong> ha sido confirmado y registrado con éxito en Digital Money House.
            </p>
            <div className="pt-4">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#C1FD35] py-3 px-4 font-extrabold text-black hover:bg-[#b0f025] transition-colors"
              >
                Volver a mi perfil <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertCircle className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black text-black">Error de confirmación</h2>
            <p className="text-rose-600 text-sm font-medium">{error}</p>
            <div className="pt-4">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-black py-3 px-4 font-bold text-white hover:bg-neutral-800 transition-colors"
              >
                Ir a mi perfil
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#C1FD35] border-t-black"></div>
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
