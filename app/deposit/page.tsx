"use client";

import React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { CreditCard, Building2, ArrowRight } from "lucide-react";

export default function DepositPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-black text-black">
          Cargar dinero
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option 1: Por transferencia bancaria */}
          <Link
            href="/profile"
            className="flex flex-col justify-between rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200 hover:border-black/30 hover:shadow-md transition-all group"
          >
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C1FD35] text-black">
                <Building2 className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-black">
                Por transferencia bancaria
              </h2>
              <p className="text-sm text-gray-500">
                Copia tu CVU o alias asignado para transferir dinero gratis y al instante desde cualquier banco o billetera.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-6 font-bold text-sm text-black group-hover:text-[#7bb00e]">
              <span>Ver mi CVU y Alias</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Option 2: Con tarjeta de débito o crédito */}
          <Link
            href="/cards"
            className="flex flex-col justify-between rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200 hover:border-black/30 hover:shadow-md transition-all group"
          >
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C1FD35] text-black">
                <CreditCard className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-black">
                Con tarjeta seleccionada
              </h2>
              <p className="text-sm text-gray-500">
                Usa cualquiera de tus tarjetas de débito o crédito asociadas a Digital Money House.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-6 font-bold text-sm text-black group-hover:text-[#7bb00e]">
              <span>Gestionar mis tarjetas</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
