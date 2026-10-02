"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { DashboardShell } from "@/components/dashboard-shell";
import { Search, ArrowRight } from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: string;
  dayName: string;
}

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      const token = localStorage.getItem("dmh_token");
      if (!token) return;

      try {
        const response = await fetch("/api/activity?limit=10", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || []);
        }
      } catch (err) {
        console.error("Error loading activities", err);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/activity?q=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        router.push("/activity");
      }
    }
  };

  const formatARS = (amount: number) => {
    return amount.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Top Dark Card: Dinero Disponible */}
        <div className="rounded-2xl bg-[#201F22] p-6 sm:p-8 text-white shadow-md relative">
          <div className="flex justify-end gap-6 text-sm font-semibold tracking-wide">
            <Link
              href="/cards"
              id="link-ver-tarjetas"
              className="text-white hover:text-[#C1FD35] underline underline-offset-4 transition-colors"
            >
              Ver tarjetas
            </Link>
            <Link
              href="/profile"
              id="link-ver-cvu"
              className="text-white hover:text-[#C1FD35] underline underline-offset-4 transition-colors"
            >
              Ver CVU
            </Link>
          </div>

          <div className="mt-4 sm:mt-6">
            <p className="text-base sm:text-lg font-bold text-white/90">
              Dinero disponible
            </p>
            <div className="mt-3 inline-block rounded-full border-2 border-[#C1FD35] px-6 py-2.5 sm:px-8 sm:py-3">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                $ {user ? formatARS(user.balance) : "0,00"}
              </span>
            </div>
          </div>
        </div>

        {/* Direct Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/deposit"
            id="btn-transferir-dinero"
            className="flex items-center justify-center rounded-xl bg-[#C1FD35] py-5 px-6 text-center text-lg sm:text-xl font-extrabold text-black shadow hover:bg-[#b0f025] hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            Transferir dinero
          </Link>

          <Link
            href="/services"
            id="btn-pago-servicios"
            className="flex items-center justify-center rounded-xl bg-[#C1FD35] py-5 px-6 text-center text-lg sm:text-xl font-extrabold text-black shadow hover:bg-[#b0f025] hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            Pago de servicios
          </Link>
        </div>

        {/* Search Bar with Enter key redirection */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            id="input-search-activity"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Buscar en tu actividad"
            className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-12 pr-4 text-base text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#C1FD35] focus:outline-none focus:ring-2 focus:ring-[#C1FD35]"
          />
        </div>

        {/* Activity Summary Card */}
        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200">
          <h2 className="text-lg sm:text-xl font-extrabold text-black mb-6">
            Tu actividad
          </h2>

          {loadingActivities ? (
            <div className="py-8 text-center text-gray-500">
              Cargando movimientos recientes...
            </div>
          ) : activities.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p className="font-semibold text-lg">No hay movimientos recientes</p>
              <p className="text-sm mt-1 text-gray-400">
                Tus transacciones aparecerán reflejadas aquí.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {activities.map((item) => {
                const isNegative = item.amount < 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-4 group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Lime Bullet Circle */}
                      <div className="h-5 w-5 shrink-0 rounded-full bg-[#C1FD35]" />
                      <span className="text-sm sm:text-base font-medium text-black">
                        {item.description}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-sm sm:text-base font-semibold text-black">
                        {isNegative ? `-$ ${formatARS(Math.abs(item.amount))}` : `$ ${formatARS(item.amount)}`}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">
                        {item.dayName}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Link: Ver toda tu actividad */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              href="/activity"
              id="link-ver-toda-actividad"
              className="flex items-center justify-between font-extrabold text-sm sm:text-base text-black hover:text-[#7bb00e] transition-colors group"
            >
              <span>Ver toda tu actividad</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
