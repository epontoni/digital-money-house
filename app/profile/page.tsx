"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import { DashboardShell } from "@/components/dashboard-shell";
import { Copy, Check, Pencil, ArrowRight, X } from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser, updateUser } = useAuth();

  // Copy state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Edit modal / inline states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    lastName: "",
    cuit: "",
    phone: "",
    alias: "",
    email: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailConfirmationNotice, setEmailConfirmationNotice] = useState<{
    link: string;
    email: string;
  } | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const startEditing = (field: string) => {
    if (!user) return;
    setErrorMessage("");
    setSuccessMessage("");
    setEditingField(field);
    setEditForm({
      name: user.name || "",
      lastName: user.lastName || "",
      cuit: user.cuit || "",
      phone: user.phone || "",
      alias: user.alias || "",
      email: user.email || "",
      password: "",
    });
  };

  const cancelEditing = () => {
    setEditingField(null);
    setErrorMessage("");
  };

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Custom client validations
    if (editingField === "alias") {
      const parts = editForm.alias.trim().split(".");
      if (
        parts.length !== 3 ||
        !parts.every((p) => p.length >= 2 && /^[a-zA-Z0-9]+$/.test(p))
      ) {
        setErrorMessage(
          "El alias debe estar conformado por 3 palabras separadas por puntos (ej: mi.cuenta.dmh)"
        );
        setSaving(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("dmh_token");
      const bodyPayload: Record<string, string> = {};

      if (editingField === "name") {
        bodyPayload.name = editForm.name.trim();
        bodyPayload.lastName = editForm.lastName.trim();
      } else if (editingField === "cuit") {
        bodyPayload.cuit = editForm.cuit.trim();
      } else if (editingField === "phone") {
        bodyPayload.phone = editForm.phone.trim();
      } else if (editingField === "alias") {
        bodyPayload.alias = editForm.alias.trim().toLowerCase();
      } else if (editingField === "email") {
        bodyPayload.email = editForm.email.trim();
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar los datos");
      }

      // Update user in context
      if (data.user) {
        updateUser(data.user);
      }

      if (data.emailConfirmationSent) {
        setEmailConfirmationNotice({
          link: data.confirmationLink,
          email: editForm.email.trim(),
        });
      } else {
        setSuccessMessage("¡Datos guardados con éxito!");
      }

      setEditingField(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Ocurrió un error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Success / Error Banners */}
        {successMessage && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-800 font-semibold text-sm flex items-center justify-between">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage("")} className="text-emerald-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-rose-800 font-semibold text-sm flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage("")} className="text-rose-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Optional feature: Email confirmation notification */}
        {emailConfirmationNotice && (
          <div className="rounded-xl bg-amber-500/15 border border-amber-500/40 p-5 text-amber-950 space-y-2">
            <h4 className="font-extrabold text-base">Confirmación de nuevo correo</h4>
            <p className="text-sm">
              Hemos generado un enlace de confirmación para validar el nuevo correo{" "}
              <strong>{emailConfirmationNotice.email}</strong>.
            </p>
            <div className="pt-2">
              <Link
                href={emailConfirmationNotice.link}
                className="inline-block rounded-lg bg-black px-4 py-2 text-xs font-bold text-[#C1FD35] hover:bg-neutral-800 transition-colors"
              >
                Confirmar correo ahora
              </Link>
            </div>
          </div>
        )}

        {/* Card 1: Tus datos */}
        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-extrabold text-black mb-6">
            Tus datos
          </h2>

          <div className="divide-y divide-gray-200 text-sm sm:text-base">
            {/* Email Row */}
            <div className="flex items-center justify-between py-4 first:pt-0">
              <span className="font-medium text-gray-500 w-1/3">Email</span>
              <span className="text-black font-medium flex-1 truncate px-2">
                {user?.email}
              </span>
              <button
                onClick={() => startEditing("email")}
                className="p-1.5 text-gray-400 hover:text-black transition-colors"
                title="Editar email"
                id="edit-email-btn"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>

            {/* Name & LastName Row */}
            <div className="flex items-center justify-between py-4">
              <span className="font-medium text-gray-500 w-1/3">
                Nombre y apellido
              </span>
              <span className="text-black font-semibold flex-1 truncate px-2">
                {user?.name} {user?.lastName}
              </span>
              <button
                onClick={() => startEditing("name")}
                className="p-1.5 text-gray-400 hover:text-black transition-colors"
                title="Editar nombre y apellido"
                id="edit-name-btn"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>

            {/* CUIT Row */}
            <div className="flex items-center justify-between py-4">
              <span className="font-medium text-gray-500 w-1/3">CUIT</span>
              <span className="text-black font-mono flex-1 truncate px-2">
                {user?.cuit || "20350269798"}
              </span>
              <button
                onClick={() => startEditing("cuit")}
                className="p-1.5 text-gray-400 hover:text-black transition-colors"
                title="Editar CUIT"
                id="edit-cuit-btn"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>

            {/* Teléfono Row */}
            <div className="flex items-center justify-between py-4">
              <span className="font-medium text-gray-500 w-1/3">Teléfono</span>
              <span className="text-black font-mono flex-1 truncate px-2">
                {user?.phone || "1146730989"}
              </span>
              <button
                onClick={() => startEditing("phone")}
                className="p-1.5 text-gray-400 hover:text-black transition-colors"
                title="Editar teléfono"
                id="edit-phone-btn"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>

            {/* Contraseña Row - Displayed invisible with (******) */}
            <div className="flex items-center justify-between py-4 last:pb-0">
              <span className="font-medium text-gray-500 w-1/3">Contraseña</span>
              <span className="text-black font-mono tracking-widest flex-1 truncate px-2">
                ******
              </span>
              <Link
                href="/recover"
                className="p-1.5 text-gray-400 hover:text-black transition-colors"
                title="Cambiar contraseña"
                id="edit-password-btn"
              >
                <Pencil className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2: Gestioná los medios de pago (Lime green banner button) */}
        <Link
          href="/cards"
          id="btn-gestionar-medios-pago"
          className="flex items-center justify-between rounded-2xl bg-[#C1FD35] p-6 sm:p-7 shadow hover:bg-[#b0f025] hover:scale-[1.005] active:scale-[0.995] transition-all group"
        >
          <span className="text-lg sm:text-xl font-extrabold text-black tracking-tight">
            Gestioná los medios de pago
          </span>
          <ArrowRight className="h-6 w-6 text-black group-hover:translate-x-1.5 transition-transform" />
        </Link>

        {/* Card 3: Black card: Copia tu CVU o alias */}
        <div className="rounded-2xl bg-[#201F22] p-6 sm:p-8 text-white shadow-md">
          <h3 className="text-sm sm:text-base font-semibold text-white/90 mb-6">
            Copia tu cvu o alias para ingresar o transferir dinero desde otra cuenta
          </h3>

          <div className="space-y-6">
            {/* CVU Row */}
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <div className="text-sm font-bold text-[#C1FD35] mb-1">CVU</div>
                <div className="font-mono text-base sm:text-lg tracking-wider text-white">
                  {user?.cvu || "0000002100075320000000"}
                </div>
              </div>
              <button
                onClick={() => handleCopy(user?.cvu || "", "cvu")}
                id="copy-cvu-btn"
                className="flex items-center gap-1.5 rounded-lg p-2.5 text-[#C1FD35] hover:bg-white/10 transition-colors"
                title="Copiar CVU"
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

            {/* Alias Row */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-sm font-bold text-[#C1FD35] mb-1 flex items-center gap-2">
                  <span>Alias</span>
                  <button
                    onClick={() => startEditing("alias")}
                    className="text-white/60 hover:text-[#C1FD35] p-0.5"
                    title="Editar alias"
                    id="edit-alias-btn"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="font-mono text-base sm:text-lg text-white">
                  {user?.alias || "este.alias.dh"}
                </div>
              </div>
              <button
                onClick={() => handleCopy(user?.alias || "", "alias")}
                id="copy-alias-btn"
                className="flex items-center gap-1.5 rounded-lg p-2.5 text-[#C1FD35] hover:bg-white/10 transition-colors"
                title="Copiar Alias"
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

        {/* Modal for editing data in place */}
        {editingField && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl">
              <button
                onClick={cancelEditing}
                className="absolute top-4 right-4 text-gray-400 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-xl font-extrabold text-black mb-4">
                {editingField === "name" && "Editar nombre y apellido"}
                {editingField === "cuit" && "Editar CUIT"}
                {editingField === "phone" && "Editar teléfono"}
                {editingField === "alias" && "Editar Alias"}
                {editingField === "email" && "Modificar correo electrónico"}
              </h3>

              {errorMessage && (
                <div className="mb-4 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSaveField} className="space-y-4">
                {editingField === "name" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Apellido
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.lastName}
                        onChange={(e) =>
                          setEditForm({ ...editForm, lastName: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {editingField === "cuit" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      CUIT (11 dígitos)
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.cuit}
                      onChange={(e) =>
                        setEditForm({ ...editForm, cuit: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm font-mono focus:border-black focus:outline-none"
                    />
                  </div>
                )}

                {editingField === "phone" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      required
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm font-mono focus:border-black focus:outline-none"
                    />
                  </div>
                )}

                {editingField === "alias" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Alias (3 palabras separadas por puntos)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ejemplo: palabra.palabra.palabra"
                      value={editForm.alias}
                      onChange={(e) =>
                        setEditForm({ ...editForm, alias: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm font-mono focus:border-black focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Debe contener exactamente 3 palabras separadas por puntos &quot;X.X.X&quot;.
                    </p>
                  </div>
                )}

                {editingField === "email" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Nuevo Correo Electrónico
                    </label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Se enviará un mail de confirmación para validar el nuevo correo.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    id="save-profile-btn"
                    className="flex-1 rounded-lg bg-[#C1FD35] py-2.5 text-sm font-extrabold text-black hover:bg-[#b0f025] transition-colors disabled:opacity-50"
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
