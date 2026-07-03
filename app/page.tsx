import Link from "next/link";
import { getLandingPageData } from "@/lib/db";
import { Button } from "@/components/ui/button";

export default function Home() {
  const landingData = getLandingPageData();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#151515] py-20 text-white md:py-28">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Text column */}
            <div className="space-y-6 lg:col-span-7">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-none">
                {landingData.heroTitle.split("Usá").map((text: string, idx: number) => {
                  if (idx === 0) {
                    return <span key={idx}>{text}</span>;
                  }
                  return (
                    <span key={idx} className="block mt-2">
                      Usá <span className="text-[#C1FD35]">Digital Money House</span>
                    </span>
                  );
                })}
              </h1>
              <p className="max-w-2xl text-lg text-[#999999] md:text-xl">
                {landingData.heroDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register">
                  <Button className="w-full sm:w-auto bg-[#C1FD35] text-black font-semibold text-base py-6 px-8 hover:bg-[#a6db29] transition-all">
                    Crear cuenta gratis
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-white text-white font-semibold text-base py-6 px-8 hover:bg-white hover:text-black bg-transparent transition-all"
                  >
                    Iniciar sesión
                  </Button>
                </Link>
              </div>
            </div>

            {/* Image column */}
            <div className="relative lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md aspect-square lg:max-w-none">
                {/* Visual Glass Card Design Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#C1FD35]/20 to-transparent rounded-full filter blur-3xl opacity-60"></div>
                {/* Main Hero Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={landingData.heroImage}
                  alt="Digital Money House Interface"
                  className="relative z-10 w-full h-auto object-contain rounded-2xl drop-shadow-[0_20px_50px_rgba(193,253,53,0.15)] animate-pulse-slow"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features / Benefits Section */}
      <section className="bg-[#F5F5F5] dark:bg-[#111111] py-20 transition-colors duration-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Una billetera virtual diseñada para simplificar tu vida
            </h2>
            <p className="text-lg text-muted-foreground">
              Manejá tu dinero de forma inteligente con nuestras funcionalidades principales.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Feature 1: Transferir dinero */}
            <div className="flex flex-col justify-between p-8 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-border hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-[#C1FD35]/5 transition-all group">
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#C1FD35]/10 text-black dark:text-[#C1FD35] group-hover:scale-110 transition-transform">
                  <svg
                    className="h-6 w-6 text-[#C1FD35]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Transferencias al instante</h3>
                <p className="text-muted-foreground text-base">
                  Enviá y recibí dinero de manera inmediata a cualquier cuenta bancaria (CBU) o virtual (CVU). Sin comisiones ocultas y con acreditación en segundos.
                </p>
              </div>
              <div className="pt-6">
                <Link href="/login">
                  <span className="text-[#C1FD35] font-semibold text-sm inline-flex items-center gap-1 hover:underline">
                    Comenzar a transferir
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>

            {/* Feature 2: Pago de servicios */}
            <div className="flex flex-col justify-between p-8 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-border hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-[#C1FD35]/5 transition-all group">
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#C1FD35]/10 text-black dark:text-[#C1FD35] group-hover:scale-110 transition-transform">
                  <svg
                    className="h-6 w-6 text-[#C1FD35]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Pago de servicios sin demoras</h3>
                <p className="text-muted-foreground text-base">
                  Pagá tus facturas de luz, gas, agua, internet y más desde la comodidad de tu celular. Agendá tus vencimientos para no volver a pagar recargos.
                </p>
              </div>
              <div className="pt-6">
                <Link href="/login">
                  <span className="text-[#C1FD35] font-semibold text-sm inline-flex items-center gap-1 hover:underline">
                    Pagar un servicio
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Promotion Banner */}
      <section className="bg-white dark:bg-[#1A1A1A] py-16 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Unite a las miles de personas que ya controlan sus finanzas con nosotros.
          </h2>
          <Link href="/register">
            <Button className="bg-black dark:bg-[#C1FD35] text-white dark:text-black font-semibold py-5 px-8 rounded-lg hover:opacity-90">
              Registrarme ahora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
