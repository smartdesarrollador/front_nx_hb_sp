'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ArrowRight } from 'lucide-react'
import LandingNavbar from '@/components/shared/LandingNavbar'
import LandingFooter from '@/components/shared/LandingFooter'
import { FAQ_CATEGORIES, type FAQItemData } from './faqData'

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function FAQItem({ question, answer }: FAQItemData) {
  const [open, setOpen] = useState(false)
  const panelId = `faq-answer-${question.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className="border border-[rgba(11,39,64,0.10)] dark:border-[rgba(234,241,248,0.10)] rounded-xl bg-white dark:bg-[#071D2E] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
      >
        <span className="text-base font-semibold text-[#0B2740] dark:text-[#EAF1F8]">{question}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-primary-600 dark:text-primary-400 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)] leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
}

const SECTION_BG = [
  'bg-white dark:bg-[#0F2D45]',
  'bg-[#DDE5EE] dark:bg-[#0F2D45]',
  'bg-[#EAF1F8] dark:bg-[#071D2E]',
]

export default function PreguntasFrecuentesPage() {
  const router = useRouter()

  const navLinks = [
    { label: 'Inicio', onClick: () => router.push('/') },
    ...FAQ_CATEGORIES.map((cat) => ({ label: cat.title, onClick: () => scrollTo(cat.id) })),
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
            backgroundImage:
              'radial-gradient(rgba(28,128,242,0.12) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage:
              'radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)',
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center border border-primary-600/30 bg-primary-600/10 text-primary-700 dark:text-primary-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wide">
            Preguntas Frecuentes
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-[#0B2740] dark:text-[#EAF1F8] mb-5 leading-tight tracking-tight">
            Resuelve tus dudas{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              en un solo lugar
            </span>
          </h1>

          <p className="text-lg text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)] mb-4 max-w-2xl mx-auto leading-relaxed">
            Todo lo que necesitas saber sobre la plataforma, los planes, nuestros
            servicios de agencia, seguridad y soporte.
          </p>
        </div>
      </section>

      {/* ── CATEGORÍAS ── */}
      {FAQ_CATEGORIES.map((category, i) => {
        const Icon = category.icon
        return (
          <section
            key={category.id}
            id={category.id}
            className={`py-24 px-4 ${SECTION_BG[i % SECTION_BG.length]}`}
          >
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-600/10 dark:bg-primary-600/15 mb-5">
                  <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#0B2740] dark:text-[#EAF1F8] mb-4">
                  {category.title}
                </h2>
                <p className="text-[rgba(11,39,64,0.66)] dark:text-[rgba(234,241,248,0.72)] max-w-xl mx-auto">
                  {category.description}
                </p>
              </div>

              <div className="space-y-4">
                {category.items.map((item) => (
                  <FAQItem key={item.question} question={item.question} answer={item.answer} />
                ))}
              </div>
            </div>
          </section>
        )
      })}

      {/* ── CTA FINAL (on-dark) ── */}
      <section id="contacto" className="py-24 px-4 bg-[#0B2740] dark:bg-[#071D2E] relative overflow-hidden">
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
            ¿No encontraste tu respuesta?
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#EAF1F8] mb-5 leading-tight tracking-tight">
            Escríbenos, con{' '}
            <span className="bg-gradient-to-r from-primary-400 to-[#BBD3E9] bg-clip-text text-transparent">
              gusto te ayudamos
            </span>
          </h2>
          <p className="text-lg text-[rgba(234,241,248,0.72)] mb-10 max-w-xl mx-auto leading-relaxed">
            Contáctanos a través del formulario o el WhatsApp del pie de página y
            resolvemos tu duda directamente.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/register?plan=free')}
              className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all shadow-lg shadow-primary-600/40 hover:shadow-primary-600/60 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Crear cuenta gratis
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
