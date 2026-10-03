"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { DashboardShell } from "@/components/dashboard-shell";
import { VoucherModal } from "@/components/voucher-modal";
import {
  Search,
  XCircle,
  Check,
  PlusCircle,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  Wallet,
  CreditCard,
  Building,
} from "lucide-react";

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  defaultAmount: number;
  logoType: string;
}

interface CardItem {
  id: string;
  lastFour: string;
  cardholderName: string;
  expiryDate: string;
  brand: string;
}

type ServiceStep =
  | "list"
  | "account_number"
  | "account_error"
  | "payment_method"
  | "payment_error"
  | "payment_success";

export default function ServicesPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<ServiceStep>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Selected Service & Account
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [invoiceData, setInvoiceData] = useState<any>(null);

  // User Cards
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("account"); // "account" or card.id

  // Payment Result
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const query = searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery.trim())}` : "";
        const res = await fetch(`/api/services${query}`);
        if (res.ok) {
          const data = await res.json();
          setServices(data.services || []);
        }
      } catch (err) {
        console.error("Error loading services", err);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, [searchQuery]);

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
        }
      } catch (err) {
        console.error("Error loading cards", err);
      }
    };

    fetchCards();
  }, []);

  const handleSelectCompany = (service: ServiceItem) => {
    setSelectedService(service);
    setAccountNumber("");
    setStep("account_number");
  };

  const handleValidateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !accountNumber.trim()) return;

    try {
      const res = await fetch("/api/services/validate-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          accountNumber: accountNumber.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setInvoiceData(data);
        setStep("payment_method");
      } else {
        setStep("account_error");
      }
    } catch {
      setStep("account_error");
    }
  };

  const handlePay = async () => {
    if (!selectedService || !invoiceData || processingPayment) return;

    setProcessingPayment(true);
    const token = localStorage.getItem("dmh_token");

    const isAccountMoney = selectedPaymentMethod === "account";
    const selectedCard = cards.find((c) => c.id === selectedPaymentMethod);

    try {
      const res = await fetch("/api/services/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          accountNumber: invoiceData.accountNumber,
          amount: invoiceData.amount,
          paymentMethod: isAccountMoney ? "account" : "card",
          cardId: selectedCard?.id,
          cardLastFour: selectedCard?.lastFour,
          cardBrand: selectedCard?.brand,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.user) {
          updateUser(data.user);
        }
        setPaymentResult({
          amount: invoiceData.amount,
          date: data.activity.date,
          serviceName: selectedService.name,
          paymentMethodLabel: isAccountMoney
            ? "Dinero en cuenta"
            : `Tarjeta ${selectedCard?.brand || "Visa"} **********${selectedCard?.lastFour || "0000"}`,
          operationNumber: data.activity.operationNumber,
          accountNumber: invoiceData.accountNumber,
        });
        setStep("payment_success");
      } else {
        setStep("payment_error");
      }
    } catch {
      setStep("payment_error");
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatARS = (amount: number) => {
    return amount.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Service Brand Logo Helper
  const renderCompanyLogo = (logoType: string, name: string) => {
    if (logoType === "claro") {
      return (
        <span className="font-black text-rose-600 tracking-wider text-xl italic flex items-center gap-1">
          <span className="h-6 w-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-black">C</span>
          Claro
        </span>
      );
    }
    if (logoType === "personal") {
      return (
        <span className="font-bold text-cyan-600 tracking-wide text-xl italic">
          Personal
        </span>
      );
    }
    if (logoType === "cablevision") {
      return (
        <span className="bg-rose-700 text-white px-2 py-0.5 rounded text-sm font-bold tracking-tight">
          Cablevisión
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 font-bold text-gray-800 text-lg">
        <Building className="h-5 w-5 text-gray-500" />
        {name}
      </span>
    );
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* STEP 1: SERVICES LIST (Unpaginated with search) */}
        {step === "list" && (
          <div className="space-y-6">
            {/* Search Input */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                id="search-services-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscá entre más de 5.000 empresas"
                className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-base text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#C1FD35] focus:outline-none focus:ring-2 focus:ring-[#C1FD35]"
              />
            </div>

            {/* Services White Card */}
            <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl font-extrabold text-black mb-6">
                Más recientes
              </h2>

              {loadingServices ? (
                <div className="py-12 text-center text-gray-500">
                  Cargando empresas de servicios...
                </div>
              ) : services.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <p className="font-bold">No se encontraron empresas con esa búsqueda.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200" id="services-list-container">
                  {services.map((serv) => (
                    <div
                      key={serv.id}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-6">
                        <div className="min-w-[120px]">
                          {renderCompanyLogo(serv.logoType, serv.name)}
                        </div>
                        <span className="hidden sm:inline text-base font-semibold text-black">
                          {serv.name}
                        </span>
                      </div>

                      <button
                        onClick={() => handleSelectCompany(serv)}
                        id={`btn-seleccionar-servicio-${serv.id}`}
                        className="text-base font-extrabold text-black hover:text-[#7bb00e] transition-colors"
                      >
                        Seleccionar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: ENTER ACCOUNT NUMBER */}
        {step === "account_number" && selectedService && (
          <div className="rounded-2xl bg-[#201F22] p-6 sm:p-10 text-white shadow-md max-w-3xl space-y-6">
            <button
              onClick={() => setStep("list")}
              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Volver a empresas
            </button>

            <h2 className="text-2xl font-black text-[#C1FD35]">
              Número de cuenta sin el primer 2
            </h2>

            <form onSubmit={handleValidateAccount} className="space-y-6">
              <div className="max-w-md">
                <input
                  type="text"
                  required
                  id="input-account-number"
                  placeholder="37289701912"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className="w-full rounded-xl border border-gray-300 bg-white p-4 text-base font-mono text-black shadow-sm focus:border-black focus:outline-none"
                />
                <p className="text-xs text-white/70 mt-2 leading-relaxed">
                  Son 11 números sin espacios, sin el &quot;2&quot; inicial. Agregá ceros adelante si tenés menos.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={accountNumber.length !== 11}
                  id="btn-continuar-numero-cuenta"
                  className={`w-full sm:w-44 rounded-xl py-3.5 px-6 font-extrabold text-black text-center transition-all ${
                    accountNumber.length === 11
                      ? "bg-[#C1FD35] hover:bg-[#b0f025] cursor-pointer"
                      : "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                  }`}
                >
                  Continuar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2 ERROR: INVALID ACCOUNT / NO INVOICES */}
        {step === "account_error" && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-[#201F22] p-8 sm:p-12 text-white shadow-md text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-rose-600 text-rose-600">
                <XCircle className="h-10 w-10 stroke-[2.5]" />
              </div>
              <h2 className="text-2xl font-black text-white" id="account-error-title">
                No encontramos facturas asociadas a este dato
              </h2>
              <div className="border-t border-white/10 w-full pt-4 max-w-md mx-auto">
                <p className="text-sm text-white/70 leading-relaxed">
                  Revisá el dato ingresado. Si es correcto, es posible que la empresa aún no haya cargado tu factura.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep("account_number")}
                id="btn-revisar-dato"
                className="w-full sm:w-44 rounded-xl bg-[#C1FD35] py-3.5 px-6 font-extrabold text-black hover:bg-[#b0f025] transition-colors"
              >
                Revisar dato
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SELECT PAYMENT METHOD */}
        {step === "payment_method" && selectedService && invoiceData && (
          <div className="space-y-6 max-w-3xl">
            {/* Top Dark Card: Total a pagar */}
            <div className="rounded-2xl bg-[#201F22] p-6 sm:p-8 text-white shadow-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-5">
                <h2 className="text-2xl font-black text-[#C1FD35]">
                  {selectedService.name}
                </h2>
                <button
                  onClick={() => setDetailsModalOpen(true)}
                  id="btn-ver-detalles-pago"
                  className="text-sm font-semibold text-white underline underline-offset-4 hover:text-[#C1FD35]"
                >
                  Ver detalles del pago
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg sm:text-xl font-extrabold text-white">
                  Total a pagar
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  ${formatARS(invoiceData.amount)}
                </span>
              </div>
            </div>

            {/* White Card: Medios de pago */}
            <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6">
              <h3 className="text-lg font-extrabold text-black">
                Tus medios de pago
              </h3>

              <div className="divide-y divide-gray-200">
                {/* Option: Dinero en cuenta */}
                <label className="flex items-center justify-between py-4 first:pt-0 cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="h-5 w-5 shrink-0 rounded-full bg-[#C1FD35]" />
                    <div>
                      <div className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-gray-700" />
                        Dinero en cuenta
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        Saldo disponible: ${user ? formatARS(user.balance) : "0,00"}
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethodRadio"
                    value="account"
                    checked={selectedPaymentMethod === "account"}
                    onChange={() => setSelectedPaymentMethod("account")}
                    className="h-5 w-5 accent-black cursor-pointer"
                  />
                </label>

                {/* Options: User Cards */}
                {cards.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center justify-between py-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-5 w-5 shrink-0 rounded-full bg-[#C1FD35]" />
                      <div>
                        <div className="text-base sm:text-lg font-medium text-black">
                          Terminada en {c.lastFour}
                        </div>
                        <div className="text-xs text-gray-400 font-semibold uppercase">
                          {c.brand}
                        </div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethodRadio"
                      value={c.id}
                      checked={selectedPaymentMethod === c.id}
                      onChange={() => setSelectedPaymentMethod(c.id)}
                      className="h-5 w-5 accent-black cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              {/* Add New Card Link */}
              <div className="pt-2 border-t border-gray-200">
                <Link
                  href="/cards/new"
                  className="inline-flex items-center gap-2 text-sm font-extrabold text-black hover:text-[#7bb00e]"
                >
                  <PlusCircle className="h-5 w-5 text-[#C1FD35]" />
                  <span>Agregar un medio de pago nuevo</span>
                </Link>
              </div>
            </div>

            {/* Pagar Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handlePay}
                disabled={processingPayment}
                id="btn-confirmar-pago-servicio"
                className="w-full sm:w-44 rounded-xl bg-[#C1FD35] py-3.5 px-6 font-extrabold text-black hover:bg-[#b0f025] transition-colors shadow text-center disabled:opacity-50"
              >
                {processingPayment ? "Procesando..." : "Pagar"}
              </button>
            </div>

            {/* Modal: Detalles del pago */}
            {detailsModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
                  <h3 className="text-xl font-black text-black">Detalle de la factura</h3>
                  <div className="divide-y divide-gray-200 text-sm">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Empresa:</span>
                      <span className="font-bold text-black">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Nro. de Cuenta:</span>
                      <span className="font-mono font-bold text-black">{invoiceData.accountNumber}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Factura:</span>
                      <span className="font-mono text-black">{invoiceData.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Vencimiento:</span>
                      <span className="text-black">
                        {new Date(invoiceData.dueDate).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 font-bold text-base">
                      <span>Importe:</span>
                      <span>${formatARS(invoiceData.amount)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setDetailsModalOpen(false)}
                    className="w-full rounded-xl bg-black py-2.5 font-bold text-[#C1FD35] hover:bg-neutral-800 transition-colors"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4 ERROR: PAYMENT ERROR (INSUFFICIENT FUNDS) */}
        {step === "payment_error" && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-[#201F22] p-8 sm:p-12 text-white shadow-md text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-rose-600 text-rose-600">
                <XCircle className="h-10 w-10 stroke-[2.5]" />
              </div>
              <h2 className="text-2xl font-black text-white" id="payment-error-title">
                Hubo un problema con tu pago
              </h2>
              <div className="border-t border-white/10 w-full pt-4 max-w-md mx-auto">
                <p className="text-sm text-white/70 leading-relaxed">
                  Puede deberse a fondos insuficientes.<br />
                  Comunicate con la entidad emisora de la tarjeta
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep("payment_method")}
                id="btn-reintentar-pago"
                className="w-full sm:w-44 rounded-xl bg-[#C1FD35] py-3.5 px-6 font-extrabold text-black hover:bg-[#b0f025] transition-colors"
              >
                Volver a intentarlo
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 SUCCESS: PAYMENT SUCCESS */}
        {step === "payment_success" && paymentResult && (
          <div className="space-y-6 max-w-3xl">
            {/* Green Banner */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-[#C1FD35] p-8 text-black shadow-md text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-black mb-3">
                <Check className="h-8 w-8 text-black stroke-[3]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight" id="payment-success-title">
                Ya realizaste tu pago
              </h2>
            </div>

            {/* Dark Details Card */}
            <div className="rounded-2xl bg-[#201F22] p-6 sm:p-8 text-white shadow-md space-y-4">
              <div className="text-sm text-white/70">
                {new Date(paymentResult.date).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                a las{" "}
                {new Date(paymentResult.date).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                hs.
              </div>

              <div className="text-3xl font-black text-[#C1FD35]">
                ${formatARS(paymentResult.amount)}
              </div>

              <div className="pt-2 space-y-1">
                <span className="text-xs text-white/60 block">Para</span>
                <span className="text-xl font-black text-[#C1FD35]">
                  {paymentResult.serviceName}
                </span>
                <div className="text-sm text-white/80 mt-2">
                  <span className="text-white/60 block text-xs">Medio de pago</span>
                  {paymentResult.paymentMethodLabel}
                </div>
              </div>
            </div>

            {/* Bottom Action buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <Link
                href="/home"
                id="btn-ir-al-inicio-pago"
                className="rounded-xl bg-[#D5D5D8] px-8 py-3.5 text-center font-bold text-black hover:bg-gray-300 transition-colors"
              >
                Ir al inicio
              </Link>
              <button
                onClick={() => setVoucherOpen(true)}
                id="btn-descargar-comprobante-pago"
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
                title: "Comprobante de pago de servicios",
                type: "Pago de servicios",
                amount: paymentResult.amount,
                date: paymentResult.date,
                senderName: `${user?.name} ${user?.lastName}`,
                senderCvu: user?.cvu,
                senderAccount: paymentResult.paymentMethodLabel,
                recipientName: paymentResult.serviceName,
                recipientDetail: `Factura: ${paymentResult.accountNumber}`,
                recipientAccount: "Servicio de recaudación",
                operationNumber: paymentResult.operationNumber,
                reason: `Pago de factura ${paymentResult.serviceName}`,
              }}
            />
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
