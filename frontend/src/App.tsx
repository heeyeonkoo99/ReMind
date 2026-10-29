import { useEffect, useState } from 'react'

function App() {
  const [health, setHealth] = useState('checking...')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealth(data.status))
      .catch(() => setHealth('backend not reachable'))
  }, [])

  return (
    <main style={{ padding: 32 }}>
      <h1>ReMind (M0)</h1>
      <p>Backend health: {health}</p>
    </main>
  )
}

export default App
