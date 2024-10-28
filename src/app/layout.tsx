import { QueryClientProvider } from "@trustify/components/providers/QueryClientProvider";
import { ThemeProvider } from "@trustify/components/providers/ThemeProvider";
// import { ThemePickerDropdown } from "@trustify/components/features/utils/ThemePickerDropdown";
import type { PropsWithChildren } from "react";
// import type { Metadata } from "next";
import localFont from "next/font/local";
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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryClientProvider>{children}</QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
