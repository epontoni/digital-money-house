"use client";

import React from "react";
import { DmhLogo } from "./dmh-logo";
import { Printer, Download, X } from "lucide-react";

export interface VoucherData {
  title?: string;
  type?: string;
  amount: number;
  date: string;
  senderName: string;
  senderCvu?: string;
  senderAccount?: string;
  recipientName: string;
  recipientDetail?: string;
  recipientAccount?: string;
  reason?: string;
  operationNumber: string;
}

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: VoucherData;
}

export function VoucherModal({ isOpen, onClose, data }: VoucherModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatARS = (amount: number) => {
    return Math.abs(amount).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formattedDate = new Date(data.date).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = new Date(data.date).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#201F22] text-white shadow-2xl border border-white/10 print:border-none print:shadow-none print:max-w-full">
        {/* Top Lime Banner Header */}
        <div className="bg-[#C1FD35] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-black tracking-tight">DIGITAL</span>
            <span className="bg-black text-[#C1FD35] px-2 py-0.5 rounded font-black text-sm tracking-widest">
              MONEY HOUSE
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-black hover:bg-black/10 print:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Voucher Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#C1FD35]">
              {data.title || "Comprobante de operación"}
            </h2>
            <p className="text-xs text-white/70 mt-1">
              {formattedDate} a las {formattedTime} hs.
            </p>
          </div>

          {/* White Card Receipt */}
          <div className="rounded-2xl bg-white p-6 text-black shadow-md space-y-5">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {data.type || "Transferencia"}
              </span>
              <div className="text-3xl font-black text-black mt-1">
                ${formatARS(data.amount)}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-4 text-xs sm:text-sm">
              {/* De */}
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-black mt-1.5 shrink-0" />
                <div>
                  <span className="text-gray-500 font-medium">De</span>
                  <div className="font-extrabold text-black text-base">
                    {data.senderName}
                  </div>
                  {data.senderCvu && (
                    <div className="text-gray-600 font-mono text-xs">
                      CVU: {data.senderCvu}
                    </div>
                  )}
                  <div className="text-gray-500 text-xs">
                    {data.senderAccount || "Cuenta Digital Money House"}
                  </div>
                </div>
              </div>

              {/* Para */}
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-black mt-1.5 shrink-0" />
                <div>
                  <span className="text-gray-500 font-medium">Para</span>
                  <div className="font-extrabold text-black text-base">
                    {data.recipientName}
                  </div>
                  {data.recipientDetail && (
                    <div className="text-gray-600 text-xs">
                      {data.recipientDetail}
                    </div>
                  )}
                  {data.recipientAccount && (
                    <div className="text-gray-500 text-xs">
                      {data.recipientAccount}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Motivo:</span>
                <span className="font-semibold text-black">{data.reason || "Varios"}</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-2 flex flex-col gap-0.5">
                <span className="text-gray-400 text-[11px]">Código de transferencia</span>
                <span className="font-mono font-bold text-black text-sm">
                  {data.operationNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 print:hidden pt-2">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 py-3 text-sm font-bold text-white transition-colors"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#C1FD35] hover:bg-[#b0f025] py-3 text-sm font-extrabold text-black transition-colors"
            >
              <Download className="h-4 w-4" />
              Descargar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
