export const COLUMN_HEADER = {
  servicio: 'servicio',
  estaPago: 'esta pago',
} as const

export const ESTA_PAGO = {
  pago: 'pago',
  no: 'no',
} as const

export type EstaPago = (typeof ESTA_PAGO)[keyof typeof ESTA_PAGO]

export interface ServicioPago {
  servicio: string
  estaPago: EstaPago
}

/** Column header plus the three service rows rendered on each month card. */
export type ServicioPagoRows = readonly [
  ServicioPago,
  ServicioPago,
  ServicioPago,
]

export interface ReciboMonthCard {
  id: string
  header: string
  servicios: ServicioPagoRows
  footer: string
}
