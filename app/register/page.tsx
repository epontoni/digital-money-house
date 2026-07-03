"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    setServerError("");
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!formData.lastName.trim()) newErrors.lastName = "El apellido es obligatorio";
    
    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "El correo electrónico es obligatorio";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Formato de correo electrónico inválido";
    }

    // Phone validation (numbers only, length check)
    const phoneRegex = /^[0-9]+$/;
    if (!formData.phone) {
      newErrors.phone = "El teléfono es obligatorio";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "El teléfono debe contener solo números";
    } else if (formData.phone.length < 8 || formData.phone.length > 15) {
      newErrors.phone = "El teléfono debe tener entre 8 y 15 dígitos";
    }

    // Password validation (must be at least 6 characters, contain letter and number)
    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = "La contraseña debe incluir al menos una letra y un número";
    }

    // Confirm password check
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Debe confirmar su contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error en el servidor al registrar el usuario");
      }

      // Successful registration: redirect to login
      router.push("/login?registered=true");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ocurrió un error inesperado";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 border border-border shadow-xl dark:bg-[#1A1A1A]">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Crear cuenta
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Registrate en segundos para comenzar a operar.
          </p>
        </div>

        {serverError && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive text-center font-medium">
            {serverError}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="given-name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:border-[#C1FD35] focus:outline-none focus:ring-1 focus:ring-[#C1FD35] ${
                  errors.name ? "border-destructive" : "border-border"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium">
                Apellido
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:border-[#C1FD35] focus:outline-none focus:ring-1 focus:ring-[#C1FD35] ${
                  errors.lastName ? "border-destructive" : "border-border"
                }`}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-destructive">{errors.lastName}</p>
              )}
            </div>

            {/* Correo Electrónico */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:border-[#C1FD35] focus:outline-none focus:ring-1 focus:ring-[#C1FD35] ${
                  errors.email ? "border-destructive" : "border-border"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium">
                Teléfono de contacto
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:border-[#C1FD35] focus:outline-none focus:ring-1 focus:ring-[#C1FD35] ${
                  errors.phone ? "border-destructive" : "border-border"
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:border-[#C1FD35] focus:outline-none focus:ring-1 focus:ring-[#C1FD35] ${
                  errors.password ? "border-destructive" : "border-border"
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:border-[#C1FD35] focus:outline-none focus:ring-1 focus:ring-[#C1FD35] ${
                  errors.confirmPassword ? "border-destructive" : "border-border"
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C1FD35] text-black font-semibold py-3 hover:bg-[#a6db29] transition-all"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </div>
        </form>

        <div className="text-center text-sm pt-2">
          <span>¿Ya tenés una cuenta? </span>
          <Link
            href="/login"
            className="font-semibold text-primary dark:text-[#C1FD35] hover:underline"
          >
            Iniciá sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
