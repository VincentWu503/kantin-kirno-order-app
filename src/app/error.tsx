'use client'
import ErrorDialog from "@/components/ErrorDialog";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";

 // Error boundaries must be Client Components
 
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  // const [isOffline, setOffline] = useState(false);
  // const [dialogOpen, setDialogOpen] = useState(true);
  
  // if (error.name === 'TypeError' && error.message === 'NetworkError when attempting to fetch resource.') {
  //   useEffect(() => {
  //     setOffline(true);
  //   })
  // }

  // if (isOffline) {
    // return (
    //   <div>
    //     <h2>Anda sedang offline!</h2>
    //     <p>Pastikan Anda telah tersambung ke koneksi internet dan muat ulang lagi aplikasi ini.</p>
    //     <button onClick={() => unstable_retry()}>Coba Lagi</button>
    //   </div>
    // )

  // }
  // return (
  //   <div>
  //     <h2>Something went wrong!</h2>
  //     <button onClick={() => unstable_retry()}>Try again</button>
  //   </div>
  // )

  function getErrorMessage(): string {
    const CHROME_NETWORK_ERR_MSG = "Failed to fetch";
    const FIREFOX_NETWORK_ERR_MSG = 'NetworkError when attempting to fetch resource.';

    if (error.name === 'TypeError' && 
      error.message === CHROME_NETWORK_ERR_MSG || error.message === FIREFOX_NETWORK_ERR_MSG
    ) {
      return "Silakan periksa koneksi Anda dan coba lagi.";
    } else return error.message;
  }

  function getErrorTitle(): string {
    if (error.name === 'TypeError' && error.message === 'NetworkError when attempting to fetch resource.') {
      return "Anda sedang offline!"
    } else return "Terjadi kesalahan teknis!"
  }
  
  return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <h2 className="mb-3 font-bold">{getErrorTitle() || "Terjadi kesalahan tidak terduga!"}</h2>
        <p className="mb-2">{getErrorMessage() || error.message}</p>
        <button onClick={() => unstable_retry()}>Coba Lagi</button>
      </div>
  );
}