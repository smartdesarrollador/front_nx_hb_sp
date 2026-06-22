'use client'

import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  Users,
  Database,
  MessageCircle,
  Headphones,
  Mail,
  Zap,
  Shield,
  BarChart2,
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
    icon: TrendingUp,
    title: 'Automatización de Ventas',
    desc: 'Pipeline completo con seguimiento de oportunidades, notificaciones automáticas y cierre asistido por IA sin intervención manual.',
  },
  {
    icon: Users,
    title: 'Generación de Leads',
    desc: 'Captura, calificación y nurturing de leads desde múltiples canales — formularios, redes, ads — directamente hacia tu CRM.',
  },
  {
    icon: Database,
    title: 'Automatización de CRM',
    desc: 'Sincronización de datos en tiempo real, actualización de registros y reportes automáticos para que tu CRM siempre esté al día.',
  },
  {
    icon: MessageCircle,
    title: 'Chatbots WhatsApp con IA',
    desc: 'Bots conversacionales con inteligencia artificial que atienden, califican y derivan clientes en WhatsApp las 24 horas del día.',
  },
  {
    icon: Headphones,
    title: 'Atención al Cliente',
    desc: 'Respuestas automáticas, creación de tickets, escalamiento y seguimiento postventa sin necesidad de intervención humana constante.',
  },
  {
    icon: Mail,
    title: 'Email Marketing Automatizado',
    desc: 'Secuencias personalizadas, triggers por comportamiento y campañas en piloto automático que convierten en el momento exacto.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Diagnóstico',
    desc: 'Mapeamos tus procesos actuales e identificamos los flujos con mayor potencial de automatización y retorno inmediato.',
  },
  {
    number: '02',
    title: 'Diseño del flujo',
    desc: 'Diseñamos la arquitectura del workflow en n8n con integraciones a tus herramientas existentes sin romper lo que ya funciona.',
  },
  {
    number: '03',
    title: 'Implementación & pruebas',
    desc: 'Construimos, probamos y validamos cada automatización en un entorno seguro antes del lanzamiento a producción.',
  },
  {
    number: '04',
    title: 'Monitoreo & mejora',
    desc: 'Supervisamos el rendimiento en tiempo real y optimizamos continuamente los flujos para maximizar su eficiencia.',
  },
]

const WHY_US = [
  {
    icon: Zap,
    title: 'Sin código, sin límites',
    desc: 'n8n nos permite conectar cualquier app o API sin desarrollo costoso ni vendor lock-in. Cientos de integraciones listas para usar.',
  },
  {
    icon: Shield,
    title: 'Datos en tu infraestructura',
    desc: 'n8n self-hosted: tus datos nunca salen de tu servidor. Control total, privacidad garantizada y cumplimiento normativo.',
  },
  {
    icon: BarChart2,
    title: 'ROI medible desde el día 1',
    desc: 'Cada flujo tiene métricas claras. Sabes exactamente cuánto tiempo y dinero estás ahorrando con cada automatización activa.',
  },
]

const CHECKLIST = [
  'n8n self-hosted o cloud según tu preferencia',
  'Integración con +400 aplicaciones',
  'WhatsApp, Slack, Gmail, HubSpot, Salesforce y más',
  'Documentación completa de cada flujo',
  'Soporte y mantenimiento incluido',
  'Escalable sin costos adicionales por ejecución',
]

export default function AutomatizacionesPage() {
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
            Automatización con n8n &amp; IA
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-[#0B2740] dark:text-[#EAF1F8] mb-5 leading-tight tracking-tight">
            Automatiza tu negocio,{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              trabaja en lo que importa
            </span>
          </h1>

          <p className="text-lg text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)] mb-10 max-w-2xl mx-auto leading-relaxed">
            Conectamos tus herramientas y automatizamos tus procesos con n8n e inteligencia
            artificial. Desde ventas y CRM hasta chatbots de WhatsApp — todo funcionando
            solo, mientras tú te enfocas en crecer.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollTo('contacto')}
              className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl text-base font-semibold transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Solicitar demo
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollTo('servicios')}
              className="w-full sm:w-auto border border-[rgba(11,39,64,0.17)] dark:border-[rgba(234,241,248,0.18)] hover:border-primary-600 text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)] hover:text-primary-600 dark:hover:text-primary-400 px-8 py-3 rounded-xl text-base font-semibold transition-all hover:-translate-y-0.5"
            >
              Ver servicios
            </button>
          </div>

          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {[
              { value: '500+',  label: 'flujos implementados' },
              { value: '80%',   label: 'tiempo ahorrado' },
              { value: '4 años', label: 'de experiencia' },
              { value: '24/7',  label: 'siempre activo' },
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
              ¿Qué podemos automatizar?
            </h2>
            <p className="text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)] max-w-xl mx-auto">
              Desde el primer contacto con el cliente hasta el postventa, automatizamos
              cada etapa de tu operación con n8n e inteligencia artificial.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
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
              Un proceso claro de 4 etapas para que tus automatizaciones funcionen
              desde el primer día y escalen con tu negocio.
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

      {/* ── POR QUÉ ELEGIRNOS ── */}
      <section className="py-24 px-4 bg-[#EAF1F8] dark:bg-[#071D2E]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0B2740] dark:text-[#EAF1F8] mb-4">
              Por qué n8n y por qué nosotros
            </h2>
            <p className="text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)]">
              La herramienta correcta + el equipo correcto = automatización que dura y escala.
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
            Empieza hoy mismo
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#EAF1F8] mb-5 leading-tight tracking-tight">
            ¿Listo para automatizar{' '}
            <span className="bg-gradient-to-r from-primary-400 to-[#BBD3E9] bg-clip-text text-transparent">
              tu negocio
            </span>
            ?
          </h2>
          <p className="text-lg text-[rgba(234,241,248,0.72)] mb-10 max-w-xl mx-auto leading-relaxed">
            Agenda una demo gratuita y te mostramos en vivo cómo n8n puede automatizar
            tus procesos más críticos. Sin compromiso, con resultados reales.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/register')}
              className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all shadow-lg shadow-primary-600/40 hover:shadow-primary-600/60 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Solicitar demo gratuita
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full sm:w-auto border border-[rgba(234,241,248,0.18)] hover:border-[rgba(234,241,248,0.40)] text-[rgba(234,241,248,0.72)] hover:text-[#EAF1F8] px-8 py-3.5 rounded-xl text-base font-semibold transition-all hover:-translate-y-0.5"
            >
              Conoce nuestros planes
            </button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
