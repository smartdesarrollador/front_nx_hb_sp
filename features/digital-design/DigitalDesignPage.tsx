'use client'

import { useRouter } from 'next/navigation'
import {
  Palette,
  Share2,
  Monitor,
  Printer,
  Presentation,
  Sparkles,
  Package,
  ShoppingBag,
  Zap,
  Star,
  MessageCircle,
  ArrowRight,
  Check,
} from 'lucide-react'
import LandingNavbar from '@/components/shared/LandingNavbar'
import LandingFooter from '@/components/shared/LandingFooter'

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

const SERVICES = [
  {
    icon: Palette,
    title: 'Identidad y Branding',
    desc: 'Logotipos, manual de marca y papelería corporativa que comunican quién eres y te diferencian de la competencia.',
  },
  {
    icon: Share2,
    title: 'Redes Sociales y Marketing',
    desc: 'Piezas para RRSS, banners publicitarios y email marketing con diseño coherente que atrae y convierte.',
  },
  {
    icon: Monitor,
    title: 'Diseño Web y UI',
    desc: 'Interfaces intuitivas, landing pages de alto impacto y mockups listos para desarrollo o presentación al cliente.',
  },
  {
    icon: Printer,
    title: 'Impresión y Publicidad',
    desc: 'Flyers, brochures, catálogos digitales e impresores listos para impresión con sangrías y perfiles de color correctos.',
  },
  {
    icon: Presentation,
    title: 'Presentaciones',
    desc: 'PowerPoint, Google Slides y pitch decks con diseño profesional que transmiten confianza ante inversores y clientes.',
  },
  {
    icon: Sparkles,
    title: 'Ilustración y Motion',
    desc: 'Ilustración digital personalizada, iconografía a medida y animaciones GIF para redes sociales y webs.',
  },
  {
    icon: Package,
    title: 'Packaging y Etiquetas',
    desc: 'Empaques, stickers y etiquetas con diseño estructural y acabados que potencian el unboxing de tu producto.',
  },
  {
    icon: ShoppingBag,
    title: 'Contenido para E-commerce',
    desc: 'Fichas de producto, infografías y creatividades para Amazon, Shopify o Mercado Libre que aumentan la conversión.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Briefing',
    desc: 'Conversamos sobre tu marca, público objetivo y objetivos para alinear visión antes de crear nada.',
  },
  {
    number: '02',
    title: 'Propuesta',
    desc: 'Bocetos y conceptos iniciales que presentamos para tu aprobación antes de avanzar al diseño final.',
  },
  {
    number: '03',
    title: 'Diseño final',
    desc: 'Artes en alta resolución, tipografías, paletas y variantes listas para usar en cualquier medio.',
  },
  {
    number: '04',
    title: 'Entrega & soporte',
    desc: 'Revisiones incluidas, archivos editables organizados y soporte durante 30 días post-entrega.',
  },
]

const WHY_US = [
  {
    icon: Zap,
    title: 'Entrega rápida',
    desc: 'Plazos express de 48 h para urgencias sin sacrificar calidad. Sabes desde el día 1 cuándo recibes tus archivos.',
  },
  {
    icon: Star,
    title: 'Calidad premium',
    desc: 'Diseño estratégico alineado a tu marca y mercado, no solo estética. Cada decisión visual tiene un propósito.',
  },
  {
    icon: MessageCircle,
    title: 'Comunicación directa',
    desc: 'Canal abierto durante todo el proyecto — sin intermediarios, sin sorpresas y con actualizaciones constantes.',
  },
]

const CHECKLIST = [
  'Archivos editables en AI, PSD y Figma',
  'Formatos para print y digital incluidos',
  'Revisiones ilimitadas hasta tu aprobación',
  'Manual de uso de la marca',
  'Entrega por WeTransfer o Google Drive',
  'Soporte post-entrega 30 días',
]

export default function DigitalDesignPage() {
  const router = useRouter()

  const navLinks = [
    { label: 'Inicio',    onClick: () => router.push('/') },
    { label: 'Servicios', onClick: () => scrollTo('servicios') },
    { label: 'Proceso',   onClick: () => scrollTo('proceso') },
    { label: 'Contacto',  onClick: () => scrollTo('contacto') },
  ]

  return (
    <div className="min-h-screen bg-[#EAF1F8] dark:bg-[#071D2E] text-[#0B2740] dark:text-[#EAF1F8]">
      {/* ── NAVBAR ── */}
      <LandingNavbar navLinks={navLinks} />

      {/* ── HERO ── */}
      <section className="relative pt-36 pb-28 px-4 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 85% 55% at 50% -5%, rgba(28,128,242,0.18), transparent)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(28,128,242,0.12) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage:
              'radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)',
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center border border-primary-600/30 bg-primary-600/10 text-primary-700 dark:text-primary-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wide">
            Diseño Gráfico &amp; Branding Digital
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-[#0B2740] dark:text-[#EAF1F8] mb-5 leading-tight tracking-tight">
            Diseña tu marca,{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              impacta al mundo
            </span>
          </h1>

          <p className="text-lg text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)] mb-10 max-w-2xl mx-auto leading-relaxed">
            Creamos identidades visuales, piezas para redes sociales, interfaces digitales y
            material impreso que conectan con tu audiencia y hacen crecer tu negocio desde el
            primer vistazo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollTo('servicios')}
              className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl text-base font-semibold transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Ver servicios
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollTo('contacto')}
              className="w-full sm:w-auto border border-[rgba(11,39,64,0.17)] dark:border-[rgba(234,241,248,0.18)] hover:border-primary-600 text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)] hover:text-primary-600 dark:hover:text-primary-400 px-8 py-3 rounded-xl text-base font-semibold transition-all hover:-translate-y-0.5"
            >
              Solicitar presupuesto
            </button>
          </div>

          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {[
              { value: '150+',  label: 'proyectos entregados' },
              { value: '8 años', label: 'de experiencia' },
              { value: '4.9★',  label: 'valoración media' },
              { value: '48h',   label: 'entrega express' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-[#0B2740] dark:text-[#EAF1F8]">
                  {stat.value}
                </div>
                <div className="text-xs text-[rgba(11,39,64,0.45)] dark:text-[rgba(234,241,248,0.50)] mt-1.5 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section id="servicios" className="py-24 px-4 bg-white dark:bg-[#0F2D45]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0B2740] dark:text-[#EAF1F8] mb-4">
              ¿Qué puedo diseñar para ti?
            </h2>
            <p className="text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)] max-w-xl mx-auto">
              Desde la identidad de marca hasta el contenido diario para redes: diseño gráfico
              profesional adaptado a cada canal y formato.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {SERVICES.map((service) => {
              const Icon = service.icon
              return (
                <div
                  key={service.title}
                  className="group bg-[#EAF1F8] dark:bg-[#071D2E] border border-[rgba(11,39,64,0.10)] dark:border-[rgba(234,241,248,0.10)] rounded-2xl p-8 hover:border-primary-600/40 transition-all hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-600/10 dark:bg-primary-600/15 flex items-center justify-center mb-6 group-hover:bg-primary-600/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#0B2740] dark:text-[#EAF1F8] mb-3">
                    {service.title}
                  </h3>
                  <p className="text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)] text-sm leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── PROCESO ── */}
      <section id="proceso" className="py-24 px-4 bg-[#DDE5EE] dark:bg-[#0F2D45]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0B2740] dark:text-[#EAF1F8] mb-4">
              Cómo trabajamos
            </h2>
            <p className="text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)] max-w-xl mx-auto">
              Un proceso transparente de 4 etapas para que recibas exactamente lo que
              necesitas, en el plazo acordado y sin sorpresas.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {STEPS.map((step) => (
              <div key={step.number} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary-600/10 dark:bg-primary-600/20 border border-primary-600/20 dark:border-primary-600/40 flex items-center justify-center mb-5 flex-shrink-0">
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#0B2740] dark:text-[#EAF1F8] mb-2">
                  {step.title}
                </h3>
                <p className="text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)] text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POR QUÉ ELEGIRME ── */}
      <section className="py-24 px-4 bg-[#EAF1F8] dark:bg-[#071D2E]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0B2740] dark:text-[#EAF1F8] mb-4">
              Por qué elegirme
            </h2>
            <p className="text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)]">
              Rapidez, calidad y comunicación — los tres pilares de cada proyecto que entrego.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {WHY_US.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-600/10 dark:bg-primary-600/15 flex items-center justify-center mt-0.5">
                    <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#0B2740] dark:text-[#EAF1F8] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)] text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-16 grid sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {CHECKLIST.map((feat) => (
              <div
                key={feat}
                className="flex items-center gap-2.5 text-sm text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)]"
              >
                <Check className="h-4 w-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL (on-dark) ── */}
      <section
        id="contacto"
        className="py-24 px-4 bg-[#0B2740] dark:bg-[#071D2E] relative overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(28,128,242,0.18), transparent)',
          }}
        />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center border border-primary-400/30 bg-primary-600/20 text-primary-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wide">
            ¿Tienes un proyecto en mente?
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#EAF1F8] mb-5 leading-tight tracking-tight">
            Transforma tu idea en{' '}
            <span className="bg-gradient-to-r from-primary-400 to-[#BBD3E9] bg-clip-text text-transparent">
              diseño que vende
            </span>
          </h2>
          <p className="text-lg text-[rgba(234,241,248,0.72)] mb-10 max-w-xl mx-auto leading-relaxed">
            Cuéntame qué necesitas y te envío una propuesta sin compromiso en menos de 24 horas.
            El primer paso hacia una marca que impacta cuesta cero.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/register')}
              className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all shadow-lg shadow-primary-600/40 hover:shadow-primary-600/60 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Comenzar proyecto
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full sm:w-auto border border-[rgba(234,241,248,0.18)] hover:border-[rgba(234,241,248,0.40)] text-[rgba(234,241,248,0.72)] hover:text-[#EAF1F8] px-8 py-3.5 rounded-xl text-base font-semibold transition-all hover:-translate-y-0.5"
            >
              Ver planes
            </button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
