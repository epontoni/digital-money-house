"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Zap, Droplets, Flame, Wifi, Search, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [paid, setPaid] = useState(false);

  const services = [
    { id: "edenor", name: "Edenor", category: "Electricidad", icon: Zap },
    { id: "metrogas", name: "Metrogas", category: "Gas natural", icon: Flame },
    { id: "aysa", name: "AySA", category: "Agua corriente", icon: Droplets },
    { id: "fibertel", name: "Personal Flow", category: "Internet y TV", icon: Wifi },
  ];

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber.trim()) return;
    setPaid(true);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-black text-black">
          Pago de servicios
        </h1>

        {paid ? (
          <div className="rounded-2xl bg-white p-8 sm:p-12 text-center shadow-sm border border-gray-200 max-w-lg mx-auto space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black text-black">¡Pago completado!</h2>
            <p className="text-sm text-gray-500">
              El comprobante de pago fue generado y registrado en tu actividad.
            </p>
            <div className="pt-4">
              <button
                onClick={() => {
                  setPaid(false);
                  setSelectedService(null);
                  setInvoiceNumber("");
                }}
                className="w-full rounded-xl bg-[#C1FD35] py-3.5 px-6 font-extrabold text-black hover:bg-[#b0f025] transition-colors"
              >
                Pagar otro servicio
              </button>
            </div>
          </div>
        ) : selectedService ? (
          <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200 max-w-lg">
            <button
              onClick={() => setSelectedService(null)}
              className="text-xs font-bold text-gray-500 hover:text-black mb-4 flex items-center gap-1"
            >
              ← Volver al listado de servicios
            </button>
            <h2 className="text-xl font-extrabold text-black mb-1">
              Pagar {services.find((s) => s.id === selectedService)?.name}
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Ingresa el número de referencia o código de barra de tu factura.
            </p>

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Número de cuenta o factura
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 00239102931"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3.5 text-sm font-mono focus:border-black focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#C1FD35] py-3.5 font-extrabold text-black hover:bg-[#b0f025] transition-colors"
              >
                Continuar con el pago
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200 space-y-4">
            <h2 className="text-lg font-bold text-black">
              Selecciona una empresa o servicio
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((serv) => {
                const Icon = serv.icon;
                return (
                  <button
                    key={serv.id}
                    onClick={() => setSelectedService(serv.id)}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-black/30 hover:bg-gray-50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-800 group-hover:bg-[#C1FD35] group-hover:text-black transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-base font-bold text-black">{serv.name}</div>
                        <div className="text-xs text-gray-500">{serv.category}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 group-hover:text-black transition-all" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
