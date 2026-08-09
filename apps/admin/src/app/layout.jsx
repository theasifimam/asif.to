
import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"]
});

export const metadata = {
  title: "MAZLIS CONTROL | Editorial Hub",
  description: "Advanced Management Interface for Mazlis News",
  icons: {
    icon: "/logo.jpeg"
  }
};

import { AuthProvider } from "@/contexts/AuthContext";
import { ReduxProvider } from "@/redux/provider";

export default function RootLayout({
  children


}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <ReduxProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              storageKey="mazlis-admin-theme"
              disableTransitionOnChange>
              
              {children}
              <Toaster richColors position="top-right" theme="dark" />
            </ThemeProvider>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>);

}