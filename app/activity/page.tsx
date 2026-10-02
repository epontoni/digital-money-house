"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { Search, ArrowUpDown, Filter } from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: string;
  dayName: string;
}

function ActivityContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filterType, setFilterType] = useState<"all" | "in" | "out">("all");
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      const token = localStorage.getItem("dmh_token");
      if (!token) return;

      try {
        const queryParam = searchQuery.trim() ? `&q=${encodeURIComponent(searchQuery.trim())}` : "";
        const response = await fetch(`/api/activity?limit=50${queryParam}`, {
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
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchActivities, 250);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const filteredActivities = activities.filter((item) => {
    if (filterType === "in") return item.amount > 0;
    if (filterType === "out") return item.amount < 0;
    return true;
  });

  const formatARS = (amount: number) => {
    return amount.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Search & Filter Header */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200 space-y-4">
          <h1 className="text-2xl font-black text-black">Mi actividad</h1>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                id="activity-page-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por concepto, día o importe..."
                className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#C1FD35] focus:outline-none focus:ring-2 focus:ring-[#C1FD35]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200">
              <button
                onClick={() => setFilterType("all")}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  filterType === "all" ? "bg-black text-[#C1FD35] shadow" : "text-gray-600 hover:text-black"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterType("in")}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  filterType === "in" ? "bg-black text-[#C1FD35] shadow" : "text-gray-600 hover:text-black"
                }`}
              >
                Ingresos
              </button>
              <button
                onClick={() => setFilterType("out")}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  filterType === "out" ? "bg-black text-[#C1FD35] shadow" : "text-gray-600 hover:text-black"
                }`}
              >
                Egresos
              </button>
            </div>
          </div>
        </div>

        {/* Activity Items List */}
        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200">
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              Cargando movimientos...
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="py-16 text-center text-gray-500 space-y-2">
              <p className="text-lg font-bold text-gray-800">
                No se encontraron actividades
              </p>
              <p className="text-sm text-gray-500">
                Intenta ajustando el filtro de búsqueda o el tipo de movimiento.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredActivities.map((item) => {
                const isNegative = item.amount < 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-5 w-5 shrink-0 rounded-full bg-[#C1FD35]" />
                      <div>
                        <p className="text-base font-semibold text-black">
                          {item.description}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">
                          {item.dayName} • {new Date(item.date).toLocaleDateString("es-AR")}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base sm:text-lg font-bold text-black">
                        {isNegative ? `-$ ${formatARS(Math.abs(item.amount))}` : `$ ${formatARS(item.amount)}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

export default function ActivityPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#C1FD35] border-t-black"></div>
        </div>
      }
    >
      <ActivityContent />
    </Suspense>
  );
}
