"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { DashboardShell } from "@/components/dashboard-shell";
import { VoucherModal, VoucherData } from "@/components/voucher-modal";
import {
  User,
  CreditCard,
  ArrowRight,
  Copy,
  Check,
  PlusCircle,
  Pencil,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

interface CardItem {
  id: string;
  lastFour: string;
  cardholderName: string;
  expiryDate: string;
  brand: string;
}

type DepositStep =
  | "select_method"
  | "external_transfer"
  | "select_card"
  | "input_amount"
  | "review"
  | "success";

export default function DepositPage() {
  const { user, refreshUser, updateUser } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<DepositStep>("select_method");
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [amountInput, setAmountInput] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [completedDeposit, setCompletedDeposit] = useState<{
    amount: number;
    date: string;
    operationNumber: string;
    cardLastFour?: string;
  } | null>(null);

  const [voucherOpen, setVoucherOpen] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      const token = localStorage.getItem("dmh_token");
      if (!token) return;

      try {
        const res = await fetch("/api/cards", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCards(data.cards || []);
          if (data.cards && data.cards.length > 0) {
            setSelectedCardId(data.cards[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching cards", err);
      } finally {
        setLoadingCards(false);
      }
    };

    fetchCards();
  }, []);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const selectedCard = cards.find((c) => c.id === selectedCardId);
  const numericAmount = parseFloat(amountInput) || 0;
  const isAmountValid = numericAmount > 0;

  const handleConfirmDeposit = async () => {
    if (!isAmountValid || processing) return;

    setProcessing(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("dmh_token");
      const response = await fetch("/api/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: numericAmount,
          cardId: selectedCard?.id,
          cardLastFour: selectedCard?.lastFour,
          type: "card",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al procesar la carga de saldo");
      }

      if (data.user) {
        updateUser(data.user);
      }

      setCompletedDeposit({
        amount: numericAmount,
        date: data.activity.date,
        operationNumber: data.activity.operationNumber,
        cardLastFour: selectedCard?.lastFour,
      });

      setStep("success");
    } catch (err: any) {
      setErrorMessage(err.message || "Error al procesar el ingreso de dinero");
    } finally {
      setProcessing(false);
    }
  };

  const formatARS = (val: number) => {
    return val.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm font-semibold text-rose-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: SELECT METHOD */}
        {step === "select_method" && (
          <div className="space-y-4 max-w-3xl">
            {/* Option 1: Transferencia bancaria */}
            <button
              onClick={() => setStep("external_transfer")}
              id="btn-metodo-transferencia"
              className="flex items-center justify-between w-full rounded-2xl bg-[#201F22] p-6 sm:p-8 text-white shadow-md hover:bg-[#28272b] transition-all group text-left"
            >
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 border-[#C1FD35] text-[#C1FD35]">
                  <User className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <span className="text-xl sm:text-2xl font-extrabold text-[#C1FD35]">
                  Transferencia bancaria
                </span>
              </div>
              <ArrowRight className="h-7 w-7 text-[#C1FD35] group-hover:translate-x-1.5 transition-transform" />
            </button>

            {/* Option 2: Seleccionar tarjeta */}
            <button
              onClick={() => setStep("select_card")}
              id="btn-metodo-tarjeta"
              className="flex items-center justify-between w-full rounded-2xl bg-[#201F22] p-6 sm:p-8 text-white shadow-md hover:bg-[#28272b] transition-all group text-left"
            >
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border-2 border-[#C1FD35] text-[#C1FD35]">
                  <CreditCard className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <span className="text-xl sm:text-2xl font-extrabold text-[#C1FD35]">
                  Seleccionar tarjeta
                </span>
              </div>
              <ArrowRight className="h-7 w-7 text-[#C1FD35] group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        )}

        {/* STEP: EXTERNAL TRANSFER (CVU / ALIAS) */}
        {step === "external_transfer" && (
          <div className="space-y-4 max-w-3xl">
            <button
              onClick={() => setStep("select_method")}
              className="flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-black mb-2"
            >
              <ArrowLeft className="h-4 w-4" /> Volver a métodos de carga
            </button>

            <div className="rounded-2xl bg-[#201F22] p-6 sm:p-8 text-white shadow-md">
              <h3 className="text-base sm:text-lg font-semibold text-white/95 mb-6">
                Copia tu cvu o alias para ingresar o transferir dinero desde otra cuenta
              </h3>

              <div className="space-y-6">
                {/* CVU */}
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <div className="text-sm font-bold text-[#C1FD35] mb-1">CVU</div>
                    <div className="font-mono text-base sm:text-lg tracking-wider text-white">
                      {user?.cvu || "0000002100075320000000"}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(user?.cvu || "", "cvu")}
                    id="copy-cvu-deposit-btn"
                    className="flex items-center gap-1.5 rounded-lg p-2.5 text-[#C1FD35] hover:bg-white/10 transition-colors"
                  >
                    {copiedField === "cvu" ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-[#C1FD35]">
                        <Check className="h-5 w-5" /> ¡Copiado!
                      </span>
                    ) : (
                      <Copy className="h-6 w-6" />
                    )}
                  </button>
                </div>

                {/* Alias */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="text-sm font-bold text-[#C1FD35] mb-1">Alias</div>
                    <div className="font-mono text-base sm:text-lg text-white">
                      {user?.alias || "este.alias.dh"}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(user?.alias || "", "alias")}
                    id="copy-alias-deposit-btn"
                    className="flex items-center gap-1.5 rounded-lg p-2.5 text-[#C1FD35] hover:bg-white/10 transition-colors"
                  >
                    {copiedField === "alias" ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-[#C1FD35]">
                        <Check className="h-5 w-5" /> ¡Copiado!
                      </span>
                    ) : (
                      <Copy className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP: SELECT CARD */}
        {step === "select_card" && (
          <div className="rounded-2xl bg-[#201F22] p-6 sm:p-10 text-white shadow-md max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-[#C1FD35]">
                Seleccionar tarjeta
              </h2>
              <button
                onClick={() => setStep("select_method")}
                className="text-xs text-white/60 hover:text-white"
              >
                Cambiar método
              </button>
            </div>

            {/* White Box for cards */}
            <div className="rounded-2xl bg-white p-6 sm:p-8 text-black shadow-sm mb-6">
              <h3 className="text-lg font-extrabold text-black mb-4">
                Tus tarjetas
              </h3>

              {loadingCards ? (
                <div className="py-6 text-center text-gray-500">Cargando tarjetas...</div>
              ) : cards.length === 0 ? (
                <div className="py-8 text-center text-gray-600">
                  <p className="font-bold">No tienes tarjetas asociadas</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Agrega una tarjeta para continuar con la carga.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {cards.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0 cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-5 w-5 shrink-0 rounded-full bg-[#C1FD35]" />
                        <span className="text-base sm:text-lg font-medium text-black">
                          Terminada en {c.lastFour}
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="selectedCard"
                        value={c.id}
                        checked={selectedCardId === c.id}
                        onChange={() => setSelectedCardId(c.id)}
                        className="h-5 w-5 accent-black cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/cards/new"
                className="flex items-center gap-2 text-base font-extrabold text-[#C1FD35] hover:opacity-90"
              >
                <PlusCircle className="h-6 w-6" />
                <span>Nueva tarjeta</span>
              </Link>

              <button
                onClick={() => setStep("input_amount")}
                disabled={!selectedCardId || cards.length === 0}
                id="btn-continuar-seleccion-tarjeta"
                className="w-full sm:w-44 rounded-xl bg-[#C1FD35] py-3.5 px-6 font-extrabold text-black text-center hover:bg-[#b0f025] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* STEP: INPUT AMOUNT */}
        {step === "input_amount" && (
          <div className="rounded-2xl bg-[#201F22] p-6 sm:p-10 text-white shadow-md max-w-3xl">
            <h2 className="text-2xl font-black text-[#C1FD35] mb-8">
              ¿Cuánto querés ingresar a la cuenta?
            </h2>

            <div className="mb-10 max-w-xs">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-xl font-bold text-black">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  id="input-deposit-amount"
                  placeholder="0"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-9 pr-4 text-xl font-black text-black shadow-sm focus:border-black focus:outline-none"
                />
              </div>
              <p className="text-xs text-white/60 mt-2">
                Tarjeta seleccionada: Terminada en {selectedCard?.lastFour}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep("review")}
                disabled={!isAmountValid}
                id="btn-continuar-monto"
                className={`w-full sm:w-44 rounded-xl py-3.5 px-6 font-extrabold text-black text-center transition-all ${
                  isAmountValid
                    ? "bg-[#C1FD35] hover:bg-[#b0f025] cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-75"
                }`}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* STEP: REVIEW */}
        {step === "review" && (
          <div className="rounded-2xl bg-[#201F22] p-6 sm:p-10 text-white shadow-md max-w-3xl">
            <h2 className="text-2xl font-black text-[#C1FD35] mb-8">
              Revisá que está todo bien
            </h2>

            <div className="space-y-6 mb-10">
              {/* Vas a transferir */}
              <div>
                <div className="flex items-center gap-2 text-sm text-white/80 font-medium">
                  <span>Vas a transferir</span>
                  <button
                    onClick={() => setStep("input_amount")}
                    className="text-[#C1FD35] hover:underline"
                    title="Editar monto"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-3xl font-black text-white mt-1">
                  ${formatARS(numericAmount)}
                </div>
              </div>

              {/* Para */}
              <div>
                <span className="text-sm text-white/70">Para</span>
                <div className="text-xl font-extrabold text-[#C1FD35] mt-0.5">
                  Cuenta propia
                </div>
                <div className="text-sm text-white/80 font-medium mt-1">
                  Tarjeta terminada en {selectedCard?.lastFour}
                </div>
                <div className="text-xs text-white/60 font-mono mt-0.5">
                  CVU {user?.cvu}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleConfirmDeposit}
                disabled={processing}
                id="btn-confirmar-ingreso"
                className="w-full sm:w-44 rounded-xl bg-[#C1FD35] py-3.5 px-6 font-extrabold text-black text-center hover:bg-[#b0f025] transition-all disabled:opacity-50"
              >
                {processing ? "Procesando..." : "Continuar"}
              </button>
            </div>
          </div>
        )}

        {/* STEP: SUCCESS / COMPROBANTE */}
        {step === "success" && completedDeposit && (
          <div className="space-y-6 max-w-3xl">
            {/* Green Banner */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-[#C1FD35] p-8 text-black shadow-md text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-black mb-3">
                <Check className="h-8 w-8 text-black stroke-[3]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                Ya cargamos el dinero en tu cuenta
              </h2>
            </div>

            {/* Dark Details Card */}
            <div className="rounded-2xl bg-[#201F22] p-6 sm:p-8 text-white shadow-md space-y-4">
              <div className="text-sm text-white/70">
                {new Date(completedDeposit.date).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                a las{" "}
                {new Date(completedDeposit.date).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                hs.
              </div>

              <div className="text-3xl font-black text-[#C1FD35]">
                ${formatARS(completedDeposit.amount)}
              </div>

              <div className="pt-2">
                <span className="text-xs text-white/60 block">Para</span>
                <span className="text-lg font-extrabold text-[#C1FD35]">
                  Cuenta propia
                </span>
                <div className="text-sm text-white/80 mt-1">
                  Tarjeta terminada en {completedDeposit.cardLastFour || "0000"}
                </div>
                <div className="text-xs font-mono text-white/60 mt-0.5">
                  CVU {user?.cvu}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <Link
                href="/home"
                id="btn-ir-al-inicio-deposito"
                className="rounded-xl bg-[#D5D5D8] px-8 py-3.5 text-center font-bold text-black hover:bg-gray-300 transition-colors"
              >
                Ir al inicio
              </Link>
              <button
                onClick={() => setVoucherOpen(true)}
                id="btn-descargar-comprobante-deposito"
                className="rounded-xl bg-[#C1FD35] px-8 py-3.5 font-extrabold text-black hover:bg-[#b0f025] transition-colors"
              >
                Descargar comprobante
              </button>
            </div>

            {/* Voucher Modal */}
            <VoucherModal
              isOpen={voucherOpen}
              onClose={() => setVoucherOpen(false)}
              data={{
                title: "Comprobante de ingreso de dinero",
                type: "Ingreso de dinero",
                amount: completedDeposit.amount,
                date: completedDeposit.date,
                senderName: `Tarjeta terminada en ${completedDeposit.cardLastFour || "0000"}`,
                senderAccount: "Tarjeta de débito/crédito",
                recipientName: `${user?.name} ${user?.lastName}`,
                recipientDetail: "Cuenta Digital Money House",
                recipientAccount: `CVU ${user?.cvu}`,
                operationNumber: completedDeposit.operationNumber,
                reason: "Carga de saldo",
              }}
            />
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
