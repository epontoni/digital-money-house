"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { Search, SlidersHorizontal, ChevronDown, ChevronRight, X, ArrowRight } from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: string;
  dayName: string;
  operationNumber?: string;
  destination?: string;
}

function ActivityContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") || "";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<"periodo" | "operaciones" | "monto">("periodo");

  // Filter selections
  const [selectedPeriod, setSelectedPeriod] = useState<string>("todos");
  const [selectedOperation, setSelectedOperation] = useState<string>("todas");
  const [selectedAmountRange, setSelectedAmountRange] = useState<string>("todos");

  // Applied filters (commit upon clicking "Aplicar")
  const [appliedPeriod, setAppliedPeriod] = useState<string>("todos");
  const [appliedOperation, setAppliedOperation] = useState<string>("todas");
  const [appliedAmountRange, setAppliedAmountRange] = useState<string>("todos");

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      const token = localStorage.getItem("dmh_token");
      if (!token) return;

      try {
        const params = new URLSearchParams();
        params.set("page", currentPage.toString());
        params.set("limit", "10");

        if (searchQuery.trim()) params.set("q", searchQuery.trim());
        if (appliedPeriod !== "todos") params.set("period", appliedPeriod);
        if (appliedOperation !== "todas") params.set("operation", appliedOperation);
        if (appliedAmountRange !== "todos") params.set("amountRange", appliedAmountRange);

        const response = await fetch(`/api/activity?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || []);
          setTotalPages(data.totalPages || 1);
          setTotalCount(data.totalCount || 0);
        }
      } catch (err) {
        console.error("Error loading activities", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [currentPage, searchQuery, appliedPeriod, appliedOperation, appliedAmountRange]);

  const handleApplyFilters = () => {
    setAppliedPeriod(selectedPeriod);
    setAppliedOperation(selectedOperation);
    setAppliedAmountRange(selectedAmountRange);
    setCurrentPage(1);
    setFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedPeriod("todos");
    setSelectedOperation("todas");
    setSelectedAmountRange("todos");
    setAppliedPeriod("todos");
    setAppliedOperation("todas");
    setAppliedAmountRange("todos");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    appliedPeriod !== "todos" ||
    appliedOperation !== "todas" ||
    appliedAmountRange !== "todos";

  const formatARS = (amount: number) => {
    return amount.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Top Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              id="activity-search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar en tu actividad"
              className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-base text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#C1FD35] focus:outline-none focus:ring-2 focus:ring-[#C1FD35]"
            />
          </div>

          {/* Filtrar Button */}
          <button
            onClick={() => setFilterModalOpen(!filterModalOpen)}
            id="btn-abrir-filtros"
            className="flex items-center justify-center gap-3 rounded-2xl bg-[#C1FD35] px-6 py-4 text-base font-extrabold text-black shadow hover:bg-[#b0f025] transition-all"
          >
            <span>Filtrar</span>
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Popover Dropdown (Matching Filtrar.jpg) */}
        {filterModalOpen && (
          <div className="relative">
            <div className="w-full sm:w-96 rounded-2xl bg-[#F0EFEB] p-5 shadow-2xl border border-gray-300 ml-auto z-30">
              {/* Filter Tabs Header */}
              <div className="flex items-center justify-between border-b border-gray-300 pb-3 mb-4 text-sm font-bold text-gray-800">
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterTab("periodo")}
                    className={`pb-1 flex items-center gap-1 ${
                      filterTab === "periodo" ? "text-black border-b-2 border-black font-extrabold" : "text-gray-500"
                    }`}
                  >
                    Período <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setFilterTab("operaciones")}
                    className={`pb-1 flex items-center gap-1 ${
                      filterTab === "operaciones" ? "text-black border-b-2 border-black font-extrabold" : "text-gray-500"
                    }`}
                  >
                    Operaciones
                  </button>
                  <button
                    onClick={() => setFilterTab("monto")}
                    className={`pb-1 flex items-center gap-1 ${
                      filterTab === "monto" ? "text-black border-b-2 border-black font-extrabold" : "text-gray-500"
                    }`}
                  >
                    Monto
                  </button>
                </div>

                <button
                  onClick={handleClearFilters}
                  id="btn-borrar-filtros"
                  className="text-xs text-gray-500 hover:text-black font-semibold"
                >
                  Borrar filtros
                </button>
              </div>

              {/* Tab 1: Período */}
              {filterTab === "periodo" && (
                <div className="space-y-3 text-sm text-gray-700 py-1">
                  {[
                    { id: "todos", label: "Todos los períodos" },
                    { id: "hoy", label: "Hoy" },
                    { id: "ayer", label: "Ayer" },
                    { id: "semana", label: "Última semana" },
                    { id: "15dias", label: "Últimos 15 días" },
                    { id: "mes", label: "Último mes" },
                    { id: "3meses", label: "Últimos 3 meses" },
                    { id: "anio", label: "Último año" },
                  ].map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center justify-between cursor-pointer py-1"
                    >
                      <span className={selectedPeriod === p.id ? "font-extrabold text-black" : ""}>
                        {p.label}
                      </span>
                      <input
                        type="radio"
                        name="periodRadio"
                        value={p.id}
                        checked={selectedPeriod === p.id}
                        onChange={() => setSelectedPeriod(p.id)}
                        className="h-4 w-4 accent-black cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              )}

              {/* Tab 2: Operaciones */}
              {filterTab === "operaciones" && (
                <div className="space-y-3 text-sm text-gray-700 py-1">
                  {[
                    { id: "todas", label: "Todas las operaciones" },
                    { id: "ingresos", label: "Ingresos" },
                    { id: "egresos", label: "Egresos" },
                  ].map((op) => (
                    <label
                      key={op.id}
                      className="flex items-center justify-between cursor-pointer py-1"
                    >
                      <span className={selectedOperation === op.id ? "font-extrabold text-black" : ""}>
                        {op.label}
                      </span>
                      <input
                        type="radio"
                        name="operationRadio"
                        value={op.id}
                        checked={selectedOperation === op.id}
                        onChange={() => setSelectedOperation(op.id)}
                        className="h-4 w-4 accent-black cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              )}

              {/* Tab 3: Monto (Opcional Sprint 3) */}
              {filterTab === "monto" && (
                <div className="space-y-3 text-sm text-gray-700 py-1">
                  {[
                    { id: "todos", label: "Cualquier monto" },
                    { id: "0-1000", label: "$0 a $1000" },
                    { id: "1000-5000", label: "$1000 a $5000" },
                    { id: "5000-20000", label: "$5000 a $20 000" },
                    { id: "20000-100000", label: "$20 000 a $100 000" },
                    { id: "100000+", label: "Más de $100 000" },
                  ].map((m) => (
                    <label
                      key={m.id}
                      className="flex items-center justify-between cursor-pointer py-1"
                    >
                      <span className={selectedAmountRange === m.id ? "font-extrabold text-black" : ""}>
                        {m.label}
                      </span>
                      <input
                        type="radio"
                        name="amountRadio"
                        value={m.id}
                        checked={selectedAmountRange === m.id}
                        onChange={() => setSelectedAmountRange(m.id)}
                        className="h-4 w-4 accent-black cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              )}

              {/* Bottom Apply button */}
              <div className="pt-4 border-t border-gray-300 mt-4">
                <button
                  onClick={handleApplyFilters}
                  id="btn-aplicar-filtros"
                  className="w-full rounded-xl bg-[#C1FD35] py-2.5 font-extrabold text-black hover:bg-[#b0f025] transition-colors shadow"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Pill Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-gray-600">Filtros aplicados:</span>
            {appliedPeriod !== "todos" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-1 font-bold text-[#C1FD35]">
                Período: {appliedPeriod}
              </span>
            )}
            {appliedOperation !== "todas" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-1 font-bold text-[#C1FD35]">
                Operación: {appliedOperation}
              </span>
            )}
            {appliedAmountRange !== "todos" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-1 font-bold text-[#C1FD35]">
                Monto: {appliedAmountRange}
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-xs text-rose-600 font-bold hover:underline ml-2"
            >
              Borrar todos
            </button>
          </div>
        )}

        {/* Activities List Card */}
        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200">
          <h2 className="text-xl font-extrabold text-black mb-6">
            Tu actividad
          </h2>

          {loading ? (
            <div className="py-12 text-center text-gray-500">
              Cargando transacciones...
            </div>
          ) : activities.length === 0 ? (
            <div className="py-16 text-center text-gray-500 space-y-2">
              <p className="text-lg font-bold text-gray-800">
                No se encontraron actividades
              </p>
              <p className="text-sm text-gray-500">
                Prueba borrando los filtros o buscando con otra palabra clave.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200" id="activity-list-container">
              {activities.map((item) => {
                const isNegative = item.amount < 0;
                return (
                  <Link
                    key={item.id}
                    href={`/activity/${item.id}`}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-4 group hover:bg-gray-50 px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Lime Bullet Circle */}
                      <div className="h-5 w-5 shrink-0 rounded-full bg-[#C1FD35]" />
                      <div>
                        <span className="text-base sm:text-lg font-medium text-black group-hover:text-black group-hover:font-semibold transition-all">
                          {item.description}
                        </span>
                        {item.destination && item.description !== item.destination && (
                          <p className="text-xs text-gray-400">
                            Destino: {item.destination}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base sm:text-lg font-bold text-black">
                        {isNegative
                          ? `-$ ${formatARS(Math.abs(item.amount))}`
                          : `$ ${formatARS(item.amount)}`}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">
                        {item.dayName}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination Controls (Matching Actividad.jpg) */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2 pt-4 border-t border-gray-200">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  id={`page-btn-${pageNum}`}
                  className={`h-9 w-9 rounded-lg text-sm font-bold transition-all ${
                    currentPage === pageNum
                      ? "bg-gray-200 text-black shadow-inner"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
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
        <div className="flex min-h-screen items-center justify-center bg-[#EEEAEA]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#C1FD35] border-t-black"></div>
        </div>
      }
    >
      <ActivityContent />
    </Suspense>
  );
}
