import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#EAF1F8] dark:bg-[#071D2E] flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <p className="text-8xl font-black text-primary-600 leading-none">404</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Página no encontrada
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            La dirección que buscas no existe o fue movida. Verifica la URL o regresa al inicio.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors text-sm"
          >
            Volver al inicio
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 border border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors text-sm"
          >
            Ir al dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
