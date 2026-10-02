"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { AlertCircle, CreditCard } from "lucide-react";

export default function NewCardPage() {
  const router = useRouter();

  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [securityCode, setSecurityCode] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Detect card brand based on first 4 digits
  const detectBrand = (number: string): "Visa" | "Mastercard" | "AMEX" | "Otra" => {
    const cleaned = number.replace(/\D/g, "");
    if (cleaned.startsWith("4")) {
      return "Visa";
    }
    const firstTwo = parseInt(cleaned.slice(0, 2), 10);
    const firstFour = parseInt(cleaned.slice(0, 4), 10);
    if ((firstTwo >= 51 && firstTwo <= 55) || (firstFour >= 2221 && firstFour <= 2720)) {
      return "Mastercard";
    }
    if (firstTwo === 34 || firstTwo === 37) {
      return "AMEX";
    }
    return "Otra";
  };

  const detectedBrand = detectBrand(cardNumber);

  // Format card number with spaces every 4 digits
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(rawValue);
  };

  // Format expiry date as MM/AA
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + "/" + raw.slice(2);
    }
    setExpiryDate(raw);
  };

  // Format card number display for preview
  const formatCardNumberPreview = (raw: string) => {
    if (!raw) return "**** **** **** ****";
    const padded = raw.padEnd(16, "*");
    return `${padded.slice(0, 4)} ${padded.slice(4, 8)} ${padded.slice(8, 12)} ${padded.slice(12, 16)}`;
  };

  // Form validity check
  const isFormValid =
    cardNumber.length >= 13 &&
    cardholderName.trim().length >= 3 &&
    /^\d{2}\/\d{2}$/.test(expiryDate) &&
    securityCode.trim().length >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;

    setSubmitting(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("dmh_token");
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cardNumber,
          cardholderName,
          expiryDate,
          securityCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo registrar la tarjeta");
      }

      // Success: redirect back to cards list
      router.push("/cards");
    } catch (err: any) {
      setErrorMessage(err.message || "Error al dar de alta la tarjeta");
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      <div className="rounded-2xl bg-white p-6 sm:p-10 shadow-sm border border-gray-200">
        {errorMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm font-semibold text-rose-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Card Mockup Visual Preview */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div
            id="card-preview"
            className={`relative w-full max-w-[340px] sm:max-w-[380px] h-[210px] rounded-2xl p-6 text-white shadow-xl transition-all duration-300 ${
              cardNumber.length > 0
                ? "bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E]"
                : "bg-gradient-to-br from-[#D5D5D8] to-[#E3E3E6] text-gray-500"
            }`}
          >
            {/* Top row: Brand / Chip */}
            <div className="flex items-center justify-between mb-8">
              <div
                className={`h-7 w-10 rounded-md ${
                  cardNumber.length > 0 ? "bg-[#3A393E]" : "bg-gray-300/80"
                }`}
              />
              <div className="text-right">
                {detectedBrand === "Visa" && (
                  <span className="font-black italic text-xl tracking-wider text-white">
                    VISA
                  </span>
                )}
                {detectedBrand === "Mastercard" && (
                  <div className="flex items-center">
                    <span className="h-6 w-6 rounded-full bg-red-500 opacity-90"></span>
                    <span className="-ml-3 h-6 w-6 rounded-full bg-amber-400 opacity-90"></span>
                  </div>
                )}
                {detectedBrand === "AMEX" && (
                  <span className="font-extrabold text-sm tracking-widest text-[#C1FD35] bg-neutral-900 px-2 py-1 rounded">
                    AMEX
                  </span>
                )}
                {detectedBrand === "Otra" && cardNumber.length > 0 && (
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Tarjeta
                  </span>
                )}
              </div>
            </div>

            {/* Middle row: Card Digits */}
            <div className="mb-6">
              <span
                id="card-number-display"
                className={`font-mono text-lg sm:text-xl tracking-[0.18em] font-semibold ${
                  cardNumber.length > 0 ? "text-white" : "text-gray-400"
                }`}
              >
                {formatCardNumberPreview(cardNumber)}
              </span>
            </div>

            {/* Bottom row: Name & Expiration */}
            <div className="flex items-end justify-between text-xs tracking-wider uppercase font-semibold">
              <div className="max-w-[200px] truncate">
                <span id="card-holder-display">
                  {cardholderName.trim()
                    ? cardholderName.toUpperCase()
                    : "NOMBRE DEL TITULAR"}
                </span>
              </div>
              <div>
                <span id="card-expiry-display">
                  {expiryDate || "MM/AA"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Inputs Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Input 1: Número de tarjeta */}
            <div>
              <input
                type="text"
                id="input-card-number"
                required
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="Número de la tarjeta*"
                className="w-full rounded-xl border border-gray-300 bg-white p-4 text-base text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              {cardNumber.length >= 4 && (
                <p className="mt-1 text-xs text-gray-500 font-medium">
                  Tipo detectado: <strong className="text-black">{detectedBrand}</strong>
                </p>
              )}
            </div>

            {/* Input 2: Fecha de vencimiento */}
            <div>
              <input
                type="text"
                id="input-card-expiry"
                required
                value={expiryDate}
                onChange={handleExpiryChange}
                placeholder="Fecha de vencimiento* (MM/AA)"
                className="w-full rounded-xl border border-gray-300 bg-white p-4 text-base text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Input 3: Nombre y apellido */}
            <div>
              <input
                type="text"
                id="input-card-holder"
                required
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Nombre y apellido*"
                className="w-full rounded-xl border border-gray-300 bg-white p-4 text-base text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Input 4: Código de seguridad */}
            <div>
              <input
                type="password"
                id="input-card-cvv"
                required
                maxLength={4}
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, ""))}
                placeholder="Código de seguridad*"
                className="w-full rounded-xl border border-gray-300 bg-white p-4 text-base text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={!isFormValid || submitting}
              id="btn-continuar-alta-tarjeta"
              className={`w-full sm:w-56 rounded-xl py-4 text-center text-lg font-extrabold transition-all shadow ${
                isFormValid && !submitting
                  ? "bg-[#C1FD35] text-black hover:bg-[#b0f025] hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {submitting ? "Guardando..." : "Continuar"}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
