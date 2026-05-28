// src/app/layout.tsx
"use client";
import { useEffect } from "react";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "@/components/navbar";
import LoadingScreen from "@/components/loading";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Montserrat } from "next/font/google";
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

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "700"], variable: '--font-montserrat' });

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
  return (
    <html lang="en">
      <body className={`${montserrat.className} antialiased bg-gray-50 m-0 p-0`}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <ErrorBoundary errorComponent={Error}>
              <AuthProvider>
                <LayoutContent>{children}</LayoutContent>
              </AuthProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}