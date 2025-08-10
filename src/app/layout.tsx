import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/providers/session-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ToasterProvider } from "@/components/providers/toaster-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Supatrades - Gestión de Trading",
  description: "Plataforma completa para la gestión y análisis de trades",
  icons: {
    icon: "/Favicon.svg",
    shortcut: "/Favicon.svg",
    apple: "/Favicon.svg"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} min-h-screen bg-black font-sans antialiased selection:bg-blue-500/90 selection:text-white`}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem={false}
          forcedTheme="dark"
        >
          <QueryProvider>
            <AuthProvider>
              <ToasterProvider />
              {children}
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
