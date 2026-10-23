import { formatPaymentFooter } from '@/helpers/reciboPayment'
import { ESTA_PAGO, type ReciboMonthCard, type ServicioPagoRows } from '@/types/recibo'

const MONTH_HEADERS = ['Enero', 'Febrero', 'Marzo', 'Abril'] as const

const SERVICIOS: ServicioPagoRows = [
  { servicio: 'servicio1', estaPago: ESTA_PAGO.pago },
  { servicio: 'servicio2', estaPago: ESTA_PAGO.no },
  { servicio: 'servicio3', estaPago: ESTA_PAGO.no },
]

export function getRecibosByMonth(): ReciboMonthCard[] {
  return MONTH_HEADERS.map((header) => ({
    id: header.toLowerCase(),
    header,
    servicios: SERVICIOS,
    footer: formatPaymentFooter(SERVICIOS),
  }))
}
