import { COLUMN_HEADER, ESTA_PAGO, type EstaPago, type ReciboMonthCard } from '@/types/recibo'

type CardForMonthComponentProps = {
  month: ReciboMonthCard
}

function paymentClassName(estaPago: EstaPago): string {
  const base = 'inline-flex rounded-md px-2 py-0.5 text-xs font-medium'
  return estaPago === ESTA_PAGO.pago
    ? `${base} bg-primary text-primary-foreground`
    : `${base} bg-secondary text-secondary-foreground`
}

export function CardForMonthComponent({ month }: CardForMonthComponentProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <header className="border-b px-4 py-3">
        <h2 className="text-base font-semibold tracking-tight">{month.header}</h2>
      </header>

      <div className="flex-1">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/60 text-left">
              <th scope="col" className="px-4 py-2 font-medium">
                {COLUMN_HEADER.servicio}
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                {COLUMN_HEADER.estaPago}
              </th>
            </tr>
          </thead>
          <tbody>
            {month.servicios.map((row) => (
              <tr key={row.servicio} className="border-b last:border-b-0">
                <th scope="row" className="px-4 py-2.5 text-left font-normal">
                  {row.servicio}
                </th>
                <td className="px-4 py-2.5">
                  <span className={paymentClassName(row.estaPago)}>{row.estaPago}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="border-t bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        {month.footer}
      </footer>
    </article>
  )
}
