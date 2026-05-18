'use client'
import { useEffect, useState } from "react";

 // Error boundaries must be Client Components
 
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  const [isOffline, setOffline] = useState(false);
  
  if (error.name === 'TypeError' && error.message === 'NetworkError when attempting to fetch resource.') {
    useEffect(() => {
      setOffline(true);
    })
  }

  if (isOffline) {
    return (
      <div>
        <h2>Anda sedang offline!</h2>
        <p>Pastikan Anda telah tersambung ke koneksi internet dan muat ulang lagi aplikasi ini.</p>
        <button onClick={() => unstable_retry()}>Coba Lagi</button>
      </div>
    )
  }
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => unstable_retry()}>Try again</button>
    </div>
  )
}