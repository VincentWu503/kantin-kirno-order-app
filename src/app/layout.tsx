// src/app/layout.tsx
"use client";
import { useEffect, useState } from "react";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "@/components/navbar";
import LoadingScreen from "@/components/loading";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import "./globals.css";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import Error from "@/app/error";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme";
import BottomSnackbar from "@/components/BottomSnackbar";
import { AlertColor } from "@mui/material";
import { useSnackbarMessage } from "@/hooks/useSnackbarMessage";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.includes("/auth");
  const { isLoading, isNavigating, setIsNavigating } = useAuth();

  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, setIsNavigating]);

  if (isLoading || isNavigating) {
    return <LoadingScreen />;
  }

  return (
    <>
      {!isAuthPage && <Navbar />}
      <main className={`${!isAuthPage ? "pb-20 md:pb-0 md:pt-16" : ""}`}>
        {children}
      </main>
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [snackbarOpen, setSnackbar] = useState(false);
  const [severity, setSeverity] = useState<AlertColor>("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // global message passing using session storage & external store react hook
  const errorMessage = useSnackbarMessage('error').getMessage();
  const successMessage = useSnackbarMessage('success').getMessage();

  useEffect(() => {
    if (!errorMessage) return;
    setSeverity('error');
    setSnackbarMessage(errorMessage);
    setSnackbar(true);
    sessionStorage.removeItem('error')
  }, [errorMessage])

  useEffect(() => {
    if (!successMessage) return;
    setSeverity('success');
    setSnackbarMessage(successMessage);
    setSnackbar(true);
    sessionStorage.removeItem('success')
  }, [successMessage])

  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 m-0 p-0">
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <ErrorBoundary errorComponent={Error}>
              <AuthProvider>
                <LayoutContent>
                  {children}
                  <BottomSnackbar
                    open={snackbarOpen}
                    severity={severity}
                    snackbarMessage={snackbarMessage}
                    closeAction={() => setSnackbar(false)}
                  >
                  </BottomSnackbar>
                </LayoutContent>
              </AuthProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}