import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReduxProvider } from "@/redux/provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"]
});

export const metadata = {
  title: "asif.to | Admin Control Panel",
  description: "Advanced Admin & Content Management Interface for asif.to",
  icons: {
    icon: "/logo.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <ReduxProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              storageKey="asif-admin-theme"
              disableTransitionOnChange
            >
              {children}
              <Toaster richColors position="top-right" theme="dark" />
            </ThemeProvider>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}