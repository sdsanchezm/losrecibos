import { useState } from 'react'
import { Button } from '@/components/ui/button'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Hello World: {count}</h1>
      <Button onClick={() => setCount((value) => value + 1)}>Click me</Button>
    </div>
  )
}

export default App
