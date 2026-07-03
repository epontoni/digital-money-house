"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#151515] py-6 text-[#999999] border-t border-[#333333]">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left">
        <p className="text-sm font-medium">
          © {new Date().getFullYear()} Digital Money House. Todos los derechos reservados.
        </p>
        <div className="flex gap-6 text-sm">
          <Link href="#" className="hover:text-white transition-colors">
            Términos y condiciones
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            Políticas de privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
