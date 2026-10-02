"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { PlusCircle, ArrowRight, Trash2, AlertCircle } from "lucide-react";

interface CardItem {
  id: string;
  lastFour: string;
  cardholderName: string;
  expiryDate: string;
  brand: string;
  created_at: string;
}

export default function CardsPage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchCards = async () => {
    const token = localStorage.getItem("dmh_token");
    if (!token) return;

    try {
      const response = await fetch("/api/cards", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
      }
    } catch (err) {
      console.error("Error fetching cards", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta tarjeta?")) {
      return;
    }

    setDeletingId(cardId);
    try {
      const token = localStorage.getItem("dmh_token");
      const response = await fetch(`/api/cards?id=${cardId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setCards((prev) => prev.filter((c) => c.id !== cardId));
        if (data.remainingCount === 0) {
          setMessage("No tienes tarjetas asociadas");
        }
      } else {
        alert(data.error || "Error al eliminar la tarjeta");
      }
    } catch (err) {
      console.error("Error deleting card", err);
    } finally {
      setDeletingId(null);
    }
  };

  const isLimitReached = cards.length >= 10;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Top Dark Card: Agregá tu tarjeta */}
        <div className="rounded-2xl bg-[#201F22] p-6 sm:p-8 text-white shadow-md">
          <p className="text-base sm:text-lg font-bold text-white/90 mb-4">
            Agregá tu tarjeta de débito o crédito
          </p>

          {isLimitReached ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/40 p-4 text-amber-300 text-sm font-semibold">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>
                  Has alcanzado el límite máximo de 10 tarjetas asociadas. Elimina una para poder agregar otra.
                </span>
              </div>
              <button
                disabled
                className="flex items-center justify-between w-full rounded-xl bg-gray-700/60 p-4 sm:p-5 text-[#C1FD35]/50 cursor-not-allowed opacity-60"
              >
                <div className="flex items-center gap-3">
                  <PlusCircle className="h-7 w-7" />
                  <span className="text-lg sm:text-xl font-extrabold">
                    Nueva tarjeta
                  </span>
                </div>
                <ArrowRight className="h-6 w-6" />
              </button>
            </div>
          ) : (
            <Link
              href="/cards/new"
              id="btn-nueva-tarjeta"
              className="flex items-center justify-between w-full rounded-xl bg-transparent hover:bg-white/5 p-4 sm:p-5 text-[#C1FD35] group transition-all"
            >
              <div className="flex items-center gap-3">
                <PlusCircle className="h-7 w-7 text-[#C1FD35] group-hover:scale-110 transition-transform" />
                <span className="text-lg sm:text-xl font-extrabold text-[#C1FD35]">
                  Nueva tarjeta
                </span>
              </div>
              <ArrowRight className="h-6 w-6 text-[#C1FD35] group-hover:translate-x-1.5 transition-transform" />
            </Link>
          )}
        </div>

        {/* Bottom Card: Tus tarjetas */}
        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-extrabold text-black mb-6">
            Tus tarjetas
          </h2>

          {loading ? (
            <div className="py-8 text-center text-gray-500">
              Cargando tarjetas asociadas...
            </div>
          ) : cards.length === 0 ? (
            <div className="py-12 text-center text-gray-600 space-y-2" id="empty-cards-message">
              <p className="text-lg font-bold text-gray-800">
                No tienes tarjetas asociadas
              </p>
              <p className="text-sm text-gray-500">
                Comienza agregando tu primera tarjeta para operar con saldo y pagar servicios.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200" id="cards-list">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    {/* Lime bullet circle */}
                    <div className="h-5 w-5 shrink-0 rounded-full bg-[#C1FD35]" />
                    <div>
                      <span className="text-base sm:text-lg font-medium text-black">
                        Terminada en {card.lastFour}
                      </span>
                      <span className="ml-3 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">
                        {card.brand}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    disabled={deletingId === card.id}
                    id={`delete-card-${card.lastFour}`}
                    className="text-sm sm:text-base font-bold text-black hover:text-rose-600 transition-colors disabled:opacity-50"
                  >
                    {deletingId === card.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
