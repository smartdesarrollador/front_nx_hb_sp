/**
 * Formatea un valor de almacenamiento (en GB) de forma legible:
 * muestra MB cuando el uso es menor a 1 GB (evita el confuso "0.0 GB" con la barra ya movida),
 * y GB con un decimal en el resto de los casos.
 *
 *   0        → "0.0 GB"
 *   0.037    → "38 MB"
 *   0.005    → "5.1 MB"
 *   1        → "1.0 GB"
 *   20       → "20.0 GB"
 */
export function formatStorage(gb: number): string {
  if (gb > 0 && gb < 1) {
    const mb = gb * 1024
    return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`
  }
  return `${gb.toFixed(1)} GB`
}
