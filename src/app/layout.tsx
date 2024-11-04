import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@trustify/components/providers/QueryClientProvider";
import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";
import { Toaster } from "@trustify/components/ui/Toaster";
import { Toaster as SonnerToaster } from "@trustify/components/ui/Sonner";
import "@trustify/assets/styles/tailwind.css";

const inter = localFont({
  src: "../assets/fonts/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-inter",
  weight: "100 900",
});

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} h-screen w-screen antialiased`}>
        <Toaster />
        <SonnerToaster position="top-center" richColors />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryClientProvider>{children}</QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
