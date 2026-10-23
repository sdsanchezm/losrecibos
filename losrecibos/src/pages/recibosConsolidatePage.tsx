import { CardForMonthComponent } from '@/components/recibos/cardForMonthComponent'
import { getRecibosByMonth } from '@/services/recibosService'

export function RecibosConsolidatePage() {
  const months = getRecibosByMonth()

  return (
    <main className="min-h-svh bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Recibos consolidados
          </h1>
        </header>

        <section
          aria-label="Recibos por mes"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {months.map((month) => (
            <CardForMonthComponent key={month.id} month={month} />
          ))}
        </section>
      </div>
    </main>
  )
}
