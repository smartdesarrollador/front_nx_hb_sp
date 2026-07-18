'use client'

import Link from 'next/link'
import {
  Building2,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  MessageCircle,
} from 'lucide-react'
import { useFooterConfig } from '@/features/footer/hooks/useFooterConfig'

export default function LandingFooter() {
  const { footer, isLoading } = useFooterConfig()

  const hasSocial =
    footer?.facebook_url ||
    footer?.instagram_url ||
    footer?.youtube_url ||
    footer?.linkedin_url

  const hasContact = footer?.email || footer?.whatsapp || footer?.phone
  const hasLinks   = (footer?.links ?? []).length > 0

  return (
    <footer className="bg-[#0B2740] dark:bg-[#071D2E]">
      {/* ── CUERPO ── */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {isLoading ? (
          /* Skeleton */
          <div className="grid md:grid-cols-3 gap-12 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-4 bg-[rgba(234,241,248,0.10)] rounded w-1/2" />
                <div className="h-3 bg-[rgba(234,241,248,0.07)] rounded w-3/4" />
                <div className="h-3 bg-[rgba(234,241,248,0.07)] rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-12">
            {/* ── Col 1: Marca + Social ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary-600 text-white p-1.5 rounded-md">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="text-base font-bold text-[#EAF1F8]">Hub de Servicios</span>
              </div>

              {footer?.tagline && (
                <p className="text-sm text-[rgba(234,241,248,0.60)] leading-relaxed mb-6">
                  {footer.tagline}
                </p>
              )}

              {hasSocial && (
                <div className="flex items-center gap-3 mt-2">
                  {footer?.facebook_url && (
                    <a
                      href={footer.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="text-[rgba(234,241,248,0.50)] hover:text-primary-400 transition-colors"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {footer?.instagram_url && (
                    <a
                      href={footer.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="text-[rgba(234,241,248,0.50)] hover:text-primary-400 transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {footer?.youtube_url && (
                    <a
                      href={footer.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="YouTube"
                      className="text-[rgba(234,241,248,0.50)] hover:text-primary-400 transition-colors"
                    >
                      <Youtube className="h-5 w-5" />
                    </a>
                  )}
                  {footer?.linkedin_url && (
                    <a
                      href={footer.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="text-[rgba(234,241,248,0.50)] hover:text-primary-400 transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* ── Col 2: Servicios / Links ── */}
            {hasLinks && (
              <div>
                <h4 className="text-xs font-semibold text-[rgba(234,241,248,0.40)] uppercase tracking-widest mb-5">
                  Servicios
                </h4>
                <ul className="space-y-3">
                  {footer!.links.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={link.url}
                        className="text-sm text-[rgba(234,241,248,0.65)] hover:text-primary-400 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Col 3: Contacto ── */}
            {hasContact && (
              <div>
                <h4 className="text-xs font-semibold text-[rgba(234,241,248,0.40)] uppercase tracking-widest mb-5">
                  Contacto
                </h4>
                <ul className="space-y-4">
                  {footer?.email && (
                    <li className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-primary-400 flex-shrink-0" />
                      <a
                        href={`mailto:${footer.email}`}
                        className="text-sm text-[rgba(234,241,248,0.65)] hover:text-primary-400 transition-colors break-all"
                      >
                        {footer.email}
                      </a>
                    </li>
                  )}
                  {footer?.whatsapp && (
                    <li className="flex items-center gap-3">
                      <MessageCircle className="h-4 w-4 text-primary-400 flex-shrink-0" />
                      <a
                        href={`https://wa.me/${footer.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[rgba(234,241,248,0.65)] hover:text-primary-400 transition-colors"
                      >
                        {footer.whatsapp}
                      </a>
                    </li>
                  )}
                  {footer?.phone && (
                    <li className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-primary-400 flex-shrink-0" />
                      <a
                        href={`tel:${footer.phone}`}
                        className="text-sm text-[rgba(234,241,248,0.65)] hover:text-primary-400 transition-colors"
                      >
                        {footer.phone}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="border-t border-[rgba(234,241,248,0.08)] px-4 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[rgba(234,241,248,0.40)] text-center sm:text-left">
            © {new Date().getFullYear()} Hub de Servicios. Todos los derechos reservados.
          </p>
          <Link
            href="/preguntas-frecuentes"
            className="text-xs text-[rgba(234,241,248,0.40)] hover:text-primary-400 transition-colors"
          >
            Preguntas Frecuentes
          </Link>
        </div>
      </div>
    </footer>
  )
}
