"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { VoucherModal } from "@/components/voucher-modal";
import { useAuth } from "@/components/auth-context";
import { CheckCircle2, ArrowLeft, Download } from "lucide-react";

interface ActivityDetail {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: string;
  dayName: string;
  operationNumber?: string;
  destination?: string;
  destinationDetail?: string;
  origin?: string;
  originDetail?: string;
  status?: string;
}

export default function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [voucherOpen, setVoucherOpen] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      const token = localStorage.getItem("dmh_token");
      if (!token) return;

      try {
        const response = await fetch(`/api/activity/${resolvedParams.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setActivity(data.activity);
        } else {
          setError("No se encontró la actividad solicitada.");
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar el detalle");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [resolvedParams.id]);

  const formatARS = (amount: number) => {
    return Math.abs(amount).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="py-20 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#C1FD35] border-t-black"></div>
          <p className="mt-3 text-sm text-gray-500 font-medium">Cargando detalle de la transacción...</p>
        </div>
      </DashboardShell>
    );
  }

  if (error || !activity) {
    return (
      <DashboardShell>
        <div className="max-w-xl mx-auto rounded-2xl bg-white p-8 text-center space-y-4 shadow-sm border border-gray-200">
          <p className="text-rose-600 font-bold text-lg">{error || "Actividad no encontrada"}</p>
          <Link
            href="/activity"
            className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-2.5 text-sm font-bold text-[#C1FD35]"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al listado
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const formattedDate = new Date(activity.date).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = new Date(activity.date).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isDeposit = activity.amount > 0 || activity.type === "deposit";
  const operationTypeLabel = isDeposit ? "Ingreso de dinero" : "Transferencia de dinero";
  const relationLabel = isDeposit ? "Ingresaste a" : "Le transferiste a";
  const recipientName = activity.destination || (isDeposit ? "Cuenta propia" : "Destinatario");
  const operationNumber = activity.operationNumber || "27903047281";

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-3xl">
        {/* Main Details Card (Matching Detalle de actividad.jpg) */}
        <div className="rounded-2xl bg-[#201F22] p-6 sm:p-10 text-white shadow-md">
          {/* Top Status and Date Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-6 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#C1FD35] text-[#C1FD35]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-lg sm:text-xl font-black text-[#C1FD35] tracking-wide">
                Aprobada
              </span>
            </div>
            <div className="text-xs sm:text-sm text-white/70">
              Creada el {formattedDate} a las {formattedTime} hs.
            </div>
          </div>

          {/* Transaction Core Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-bold text-white/80 uppercase tracking-wider">
                {operationTypeLabel}
              </p>
              <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                ${formatARS(activity.amount)}
              </div>
            </div>

            {/* Recipient / Destination */}
            <div>
              <span className="text-sm text-white/70">{relationLabel}</span>
              <div className="text-2xl font-black text-[#C1FD35] mt-0.5">
                {recipientName}
              </div>
              {activity.destinationDetail && (
                <div className="text-xs font-mono text-white/60 mt-1">
                  {activity.destinationDetail}
                </div>
              )}
            </div>

            {/* Operation Number */}
            <div className="pt-2">
              <span className="text-sm text-white/70 block">Número de operación</span>
              <span className="text-lg font-mono font-extrabold text-[#C1FD35] tracking-wider">
                {operationNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <Link
            href="/home"
            id="btn-detalle-ir-inicio"
            className="rounded-xl bg-[#D5D5D8] px-8 py-3.5 text-center font-bold text-black hover:bg-gray-300 transition-colors"
          >
            Ir al inicio
          </Link>
          <button
            onClick={() => setVoucherOpen(true)}
            id="btn-detalle-descargar-comprobante"
            className="rounded-xl bg-[#C1FD35] px-8 py-3.5 font-extrabold text-black hover:bg-[#b0f025] transition-colors"
          >
            Descargar comprobante
          </button>
        </div>

        {/* Voucher Modal Receipt */}
        <VoucherModal
          isOpen={voucherOpen}
          onClose={() => setVoucherOpen(false)}
          data={{
            title: `Comprobante de ${operationTypeLabel.toLowerCase()}`,
            type: operationTypeLabel,
            amount: activity.amount,
            date: activity.date,
            senderName: isDeposit
              ? activity.origin || "Medio de pago"
              : `${user?.name} ${user?.lastName}`,
            senderCvu: isDeposit ? undefined : user?.cvu,
            senderAccount: isDeposit ? activity.originDetail : "Cuenta Digital Money House",
            recipientName: recipientName,
            recipientDetail: activity.destinationDetail || "Cuenta propia",
            operationNumber: operationNumber,
            reason: activity.description,
          }}
        />
      </div>
    </DashboardShell>
  );
}
