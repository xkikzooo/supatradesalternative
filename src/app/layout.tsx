import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import { AuthProvider } from "@/providers/session-provider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "TradeLog",
  description: "Tu diario de trading personal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} min-h-screen bg-background font-sans antialiased selection:bg-blue-500/90 selection:text-white`}>
        {/* Efectos de fondo */}
        <div className="pointer-events-none fixed inset-0 z-30 transition duration-300 lg:absolute" style={{ background: "radial-gradient(circle at top center,rgba(13,71,161,0.1) 0%,transparent 25%)" }} />
        <div className="pointer-events-none fixed inset-0 z-30 transition duration-300 lg:absolute" style={{ background: "radial-gradient(circle at bottom left,rgba(126,87,194,0.1) 0%,transparent 25%)" }} />
        
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem={false}
          forcedTheme="dark"
        >
          <AuthProvider>
            <ToasterProvider />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
