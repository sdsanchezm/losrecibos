import { ESTA_PAGO, type ServicioPago } from '@/types/recibo'

export function countPagados(servicios: readonly ServicioPago[]): number {
  return servicios.filter((servicio) => servicio.estaPago === ESTA_PAGO.pago)
    .length
}

export function formatPaymentFooter(servicios: readonly ServicioPago[]): string {
  const pagados = countPagados(servicios)
  return `${pagados} de ${servicios.length} pagados`
}
