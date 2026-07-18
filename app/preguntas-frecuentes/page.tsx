import PreguntasFrecuentesPage from '@/features/preguntas-frecuentes/PreguntasFrecuentesPage'
import { FAQ_CATEGORIES } from '@/features/preguntas-frecuentes/faqData'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata(
  'Preguntas Frecuentes | Hub de Servicios',
  'Resuelve tus dudas sobre la plataforma, planes, servicios de agencia, seguridad y soporte de Hub de Servicios.',
  '/preguntas-frecuentes',
  {
    ogTitle: 'Preguntas Frecuentes | Hub de Servicios',
    ogDescription: 'Todo lo que necesitas saber sobre Hub de Servicios.',
  },
)

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_CATEGORIES.flatMap((category) =>
    category.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  ),
}

export default function PreguntasFrecuentesRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PreguntasFrecuentesPage />
    </>
  )
}
