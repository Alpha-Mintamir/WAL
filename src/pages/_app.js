import "@/styles/globals.css";
import { Lexend } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Providers } from "@/redux/providers";
import React, { Suspense } from "react";
import Loader from "@/components/ReUseableComponents/Loader";
import { TranslationProvider } from "@/components/Layout/TranslationContext";
import PushNotificationLayout from "@/components/firebaseNotification/PushNotification";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "react-hot-toast";

const font = Lexend({ subsets: ["latin"] });

export default function App({ Component, pageProps }) {

  return (
    <main className={font.className}>
      <ErrorBoundary>
        <Providers>
          <ThemeProvider attribute="class">
            <Suspense fallback={<Loader />}>
              <TranslationProvider>
                <PushNotificationLayout>
                  <Component {...pageProps} />
                </PushNotificationLayout>
              </TranslationProvider>
            </Suspense>

            <Toaster
              position="top-right"
              reverseOrder={false}
              toastOptions={{
                success: {
                  duration: 2000,
                },
              }}
            />
          </ThemeProvider>
        </Providers>
      </ErrorBoundary>
    </main>
  );
}
