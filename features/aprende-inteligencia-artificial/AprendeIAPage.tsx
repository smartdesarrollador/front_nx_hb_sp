'use client'

import { useRouter } from 'next/navigation'
import {
  User,
  Briefcase,
  Code,
  Video,
  Users,
  BookOpen,
  Building2,
  CalendarDays,
  MessageCircle,
  Zap,
  Target,
  UserCheck,
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
    icon: User,
    title: 'Para usuarios en general',
    desc: 'Domina ChatGPT, Claude y Gemini. Genera imágenes con IA y mejora tu productividad personal sin necesitar conocimientos técnicos.',
  },
  {
    icon: Briefcase,
    title: 'Para técnicos y oficina',
    desc: 'IA en Excel, Copilot en Microsoft 365, automatización de tareas repetitivas y presentaciones creadas con inteligencia artificial.',
  },
  {
    icon: Code,
    title: 'Para programadores',
    desc: 'GitHub Copilot, integración de APIs de IA (OpenAI, Anthropic), automatización con n8n y prompt engineering avanzado.',
  },
]

const MODALITIES = [
  {
    icon: Video,
    title: 'Sesiones 1 a 1',
    desc: 'Presencial u online, a tu ritmo y enfocadas en tus objetivos concretos.',
  },
  {
    icon: Users,
    title: 'Talleres grupales',
    desc: 'Aprendizaje colaborativo en grupos reducidos con dinámicas prácticas.',
  },
  {
    icon: BookOpen,
    title: 'Cursos por módulos',
    desc: 'Nivel básico, intermedio y avanzado. Avanza a tu propio ritmo.',
  },
  {
    icon: Building2,
    title: 'Capacitación in-company',
    desc: 'Formación a medida para equipos y empresas en sus propias instalaciones.',
  },
  {
    icon: CalendarDays,
    title: 'Asesoría mensual',
    desc: 'Acompañamiento recurrente para proyectos y consultas continuas.',
  },
  {
    icon: MessageCircle,
    title: 'Soporte por WhatsApp',
    desc: 'Respondo dudas puntuales por WhatsApp o videollamada cuando lo necesitas.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Diagnóstico',
    desc: 'Conversamos sobre tu nivel actual, las herramientas que usas y qué quieres lograr con la IA.',
  },
  {
    number: '02',
    title: 'Plan a medida',
    desc: 'Diseño un programa personalizado con los temas y herramientas más relevantes para ti.',
  },
  {
    number: '03',
    title: 'Clases y práctica',
    desc: 'Sesiones con ejercicios reales aplicados directamente a tu trabajo o proyecto concreto.',
  },
  {
    number: '04',
    title: 'Seguimiento',
    desc: 'Revisamos avances, resolvemos dudas y ajustamos el plan según tus progresos.',
  },
]

const WHY_US = [
  {
    icon: Zap,
    title: 'Enseñanza práctica y sin tecnicismos',
    desc: 'Nada de teoría aburrida — cada sesión termina con algo útil que puedes aplicar el mismo día en tu trabajo.',
  },
  {
    icon: Target,
    title: 'Adaptado a tu nivel y necesidad',
    desc: 'No hay un programa fijo. Empezamos desde donde estás tú y avanzamos según tu ritmo y objetivos reales.',
  },
  {
    icon: UserCheck,
    title: 'Acompañamiento antes, durante y después',
    desc: 'Estoy disponible para resolver dudas fuera de las sesiones. Tu aprendizaje no termina cuando acaba la clase.',
  },
]

const CHECKLIST = [
  'Materiales y recursos incluidos en cada módulo',
  'Grabaciones de las sesiones disponibles',
  'Ejercicios prácticos con casos reales',
  'Certificado de participación',
  'Acceso a comunidad de alumnos',
  'Actualizaciones incluidas cuando cambia la IA',
]

export default function AprendeIAPage() {
  const router = useRouter()

  const navLinks = [
    { label: 'Inicio',     onClick: () => router.push('/') },
    { label: 'Servicios',  onClick: () => scrollTo('servicios') },
    { label: 'Proceso',    onClick: () => scrollTo('proceso') },
    { label: 'Contacto',   onClick: () => scrollTo('contacto') },
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
            Asesoría &amp; Capacitación en Inteligencia Artificial
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-[#0B2740] dark:text-[#EAF1F8] mb-5 leading-tight tracking-tight">
            Aprende IA y transforma lo que haces —{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              sin importar tu nivel
            </span>
          </h1>

          <p className="text-lg text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)] mb-10 max-w-2xl mx-auto leading-relaxed">
            Clases, talleres y asesoría en Inteligencia Artificial para personas, equipos y
            empresas. Aprende a usar las herramientas de IA que ya existen y aplícalas en tu
            trabajo desde el primer día.
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
              Solicitar asesoría
            </button>
          </div>

          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {[
              { value: '200+',        label: 'alumnos formados' },
              { value: '5 años',      label: 'de experiencia' },
              { value: '4.9★',        label: 'valoración media' },
              { value: 'Online',      label: 'y presencial' },
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

      {/* ── SERVICIOS — ¿Para quién es? ── */}
      <section id="servicios" className="py-24 px-4 bg-white dark:bg-[#0F2D45]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0B2740] dark:text-[#EAF1F8] mb-4">
              ¿Para quién es?
            </h2>
            <p className="text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)] max-w-xl mx-auto">
              Tanto si nunca has usado IA como si ya programas con ella, tengo un programa
              diseñado exactamente para ti.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
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
              Cómo funciona
            </h2>
            <p className="text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)] max-w-xl mx-auto">
              Un proceso de 4 etapas pensado para que aprendas de forma efectiva y apliques
              la IA en tu trabajo desde la primera sesión.
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

      {/* ── MODALIDADES ── */}
      <section className="py-24 px-4 bg-[#EAF1F8] dark:bg-[#071D2E]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0B2740] dark:text-[#EAF1F8] mb-4">
              Modalidades de servicio
            </h2>
            <p className="text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)] max-w-xl mx-auto">
              Elige la modalidad que mejor se adapta a tu ritmo y disponibilidad.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
            {MODALITIES.map((item) => {
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
        </div>
      </section>

      {/* ── POR QUÉ ELEGIRME ── */}
      <section className="py-24 px-4 bg-white dark:bg-[#0F2D45]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0B2740] dark:text-[#EAF1F8] mb-4">
              Por qué elegirme
            </h2>
            <p className="text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)]">
              Práctica, personalización y acompañamiento — los tres pilares de mi método.
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
            ¿Listo para empezar con IA?
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#EAF1F8] mb-5 leading-tight tracking-tight">
            Empieza hoy —{' '}
            <span className="bg-gradient-to-r from-primary-400 to-[#BBD3E9] bg-clip-text text-transparent">
              sin saber nada de IA
            </span>
          </h2>
          <p className="text-lg text-[rgba(234,241,248,0.72)] mb-10 max-w-xl mx-auto leading-relaxed">
            Cuéntame en qué trabajas y qué quieres mejorar con IA. Te diseño un plan a medida
            en menos de 24 horas. Primera consulta sin costo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/register')}
              className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all shadow-lg shadow-primary-600/40 hover:shadow-primary-600/60 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Solicitar plan gratuito
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
