import {
  Building2,
  CircleDollarSign,
  Briefcase,
  ShieldCheck,
  Headphones,
  type LucideIcon,
} from 'lucide-react'

export interface FAQItemData {
  question: string
  answer: string
}

export interface FAQCategory {
  id: string
  title: string
  description: string
  icon: LucideIcon
  items: FAQItemData[]
}

export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'plataforma',
    title: 'Sobre la plataforma',
    description: 'Cómo funciona Digisider junto a Workspace, Vista Digital y la Desktop App.',
    icon: Building2,
    items: [
      {
        question: '¿Qué es Digisider?',
        answer:
          'Digisider es la plataforma SaaS todo en uno desde donde gestionas tu suscripción y accedes a Workspace (productividad), Vista Digital (presencia digital) y la app de escritorio, todo con un solo inicio de sesión.',
      },
      {
        question: '¿Qué diferencia hay entre Workspace, Vista Digital y la Desktop App?',
        answer:
          'Workspace es tu espacio de trabajo colaborativo (proyectos, tareas, calendario, notas, contactos). Vista Digital es tu presencia pública en internet (tarjeta digital, portafolio, landing page, CV). La Desktop App es la versión de escritorio para acceder más rápido a tus herramientas sin depender del navegador.',
      },
      {
        question: '¿Necesito instalar algo o funciona todo desde el navegador?',
        answer:
          'No es obligatorio instalar nada: Digisider, Workspace y Vista Digital funcionan completamente desde el navegador. La Desktop App es opcional para quienes prefieren una app nativa con acceso más rápido.',
      },
      {
        question: '¿Puedo usar la app de escritorio en Windows, macOS y Linux?',
        answer:
          'Sí, la Desktop App está disponible para los tres sistemas operativos. Puedes descargarla desde la sección "Descargar" de Digisider.',
      },
      {
        question: '¿Cómo entro a Workspace o Vista Digital desde Digisider?',
        answer:
          'Con un solo clic. Digisider genera un enlace de acceso único y de corta duración que te lleva directo a Workspace o Vista Digital ya autenticado, sin pedirte la contraseña de nuevo.',
      },
    ],
  },
  {
    id: 'planes',
    title: 'Planes y precios',
    description: 'Qué incluye cada plan y cómo funciona la facturación.',
    icon: CircleDollarSign,
    items: [
      {
        question: '¿Qué planes existen?',
        answer:
          'Free, Starter, Professional y Enterprise. Cada uno amplía los límites de usuarios, proyectos, contactos y roles personalizados, además de funciones como MFA, SSO o auditoría extendida.',
      },
      {
        question: '¿Qué pasa si supero los límites de mi plan?',
        answer:
          'Cuando alcanzas el límite de un recurso (usuarios, proyectos, contactos, etc.) te avisamos e invitamos a subir de plan antes de dejarte seguir creando; nunca perdemos ni bloqueamos lo que ya tienes.',
      },
      {
        question: '¿Puedo cambiar de plan en cualquier momento?',
        answer: 'Sí, puedes subir o bajar de plan cuando quieras desde la sección de suscripción de Digisider.',
      },
      {
        question: '¿Tienen prueba gratuita del plan Professional?',
        answer:
          'Sí, puedes activar una prueba del plan Professional para conocer funciones como MFA y webhooks antes de decidir.',
      },
      {
        question: '¿Los servicios de agencia (páginas web, marketing, diseño, automatizaciones, IA) están incluidos en mi plan?',
        answer:
          'No, son servicios independientes que se cotizan a medida según tu proyecto; no forman parte de la suscripción mensual de la plataforma.',
      },
    ],
  },
  {
    id: 'servicios',
    title: 'Servicios de agencia',
    description: 'Páginas web, marketing digital, automatizaciones, diseño gráfico y capacitación en IA.',
    icon: Briefcase,
    items: [
      {
        question: 'Páginas web: ¿qué tipos de sitio desarrollan?',
        answer:
          'Portales con áreas privadas, tiendas virtuales con carrito y pagos, landing pages de alta conversión, blogs optimizados para SEO, portafolios y páginas institucionales. Todos incluyen diseño responsive, SEO básico y panel de administración.',
      },
      {
        question: 'Marketing digital: ¿qué incluye la gestión de redes y publicidad?',
        answer:
          'SEO, campañas de Google Ads y Meta Ads, gestión de redes sociales, marketing de contenidos, email marketing y reportes de resultados. No pedimos permanencia mínima.',
      },
      {
        question: 'Automatizaciones: ¿qué es n8n y por qué lo usan?',
        answer:
          'n8n es la herramienta que usamos para conectar tus ventas, CRM, WhatsApp y email marketing con inteligencia artificial. Trabajamos con instancias self-hosted, así tus datos no salen de tu propio servidor, y contamos con más de 400 integraciones disponibles.',
      },
      {
        question: 'Diseño gráfico: ¿cuántas revisiones incluye cada proyecto?',
        answer:
          'Revisiones ilimitadas hasta que apruebes el diseño final. Entregamos archivos editables (AI, PSD, Figma) y ofrecemos entregas express en 48 horas para proyectos urgentes.',
      },
      {
        question: 'Aprende IA: ¿las clases son presenciales u online?',
        answer:
          'Ambas modalidades, según lo que prefieras. Tenemos sesiones 1 a 1, talleres grupales y cursos por módulos para usuarios, personal de oficina y programadores, con certificado de participación al finalizar.',
      },
    ],
  },
  {
    id: 'cuenta',
    title: 'Cuenta, seguridad y datos',
    description: 'Aislamiento de datos, seguridad de tu cuenta y gestión de tu equipo.',
    icon: ShieldCheck,
    items: [
      {
        question: '¿Cómo protegen mis datos y los de mi equipo?',
        answer:
          'La plataforma es multi-tenant: los datos de cada empresa están completamente aislados de los demás clientes, con control de acceso basado en roles (RBAC) para cada usuario.',
      },
      {
        question: '¿Qué es la autenticación de dos factores (MFA) y en qué planes está disponible?',
        answer:
          'MFA agrega una capa extra de seguridad al inicio de sesión, pidiendo un código temporal además de tu contraseña. Está disponible desde el plan Professional en adelante.',
      },
      {
        question: '¿Puedo invitar a más usuarios de mi equipo?',
        answer:
          'Sí, según el límite de usuarios de tu plan. Desde el panel de administración puedes enviar invitaciones por correo para que se unan a tu cuenta.',
      },
      {
        question: '¿Cómo cancelo mi cuenta o suscripción?',
        answer:
          'Puedes gestionar o cancelar tu suscripción directamente desde la sección de facturación de Digisider, sin necesidad de contactar a soporte.',
      },
      {
        question: '¿Por cuánto tiempo se guardan los logs de auditoría?',
        answer:
          'Depende de tu plan: 7 días en Free, 30 en Starter, 365 en Professional y hasta 2555 días (7 años) en Enterprise.',
      },
    ],
  },
  {
    id: 'soporte',
    title: 'Soporte y contacto',
    description: 'Cómo hablar con nosotros y resolver dudas o problemas.',
    icon: Headphones,
    items: [
      {
        question: '¿Cómo contacto con soporte?',
        answer:
          'A través del formulario de contacto o el WhatsApp que encuentras en el pie de página, o desde la sección de soporte dentro de Digisider una vez que inicias sesión.',
      },
      {
        question: '¿Tienen soporte en español?',
        answer: 'Sí, todo nuestro soporte y contenido está en español.',
      },
      {
        question: '¿Dónde reporto un problema técnico o bug?',
        answer:
          'Desde la sección de soporte de Digisider puedes crear un ticket describiendo el problema, o escribirnos por el formulario de contacto del pie de página.',
      },
      {
        question: '¿Puedo agendar una consulta gratuita antes de contratar un servicio?',
        answer:
          'Sí, cada servicio (Páginas Web, Marketing Digital, Automatizaciones, Diseño Gráfico, Aprende IA) incluye una consulta o demo gratuita para conversar sobre tu proyecto antes de cotizar.',
      },
      {
        question: '¿En cuánto tiempo responden un mensaje de contacto?',
        answer: 'Normalmente respondemos en menos de 24 horas hábiles.',
      },
    ],
  },
]
