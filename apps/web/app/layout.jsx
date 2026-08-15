import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ReduxProvider } from "@/components/ReduxProvider";
import BottomNav from "@/components/BottomNav";
import { ScrollNavProvider } from "@/components/ScrollNavProvider";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { Suspense } from "react";
import FloatingPlayground from "@/components/interactive-code/FloatingPlayground";
import GoogleAnalyticsPageView from "@/components/GoogleAnalyticsPageView";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://asif.to"),
  title: {
    default: "asif.to — Step-by-Step Web & Full-Stack Coding Courses & Tutorials",
    template: "%s | asif.to Tutorials",
  },
  description:
    "Learn and revise React.js, Next.js, Express.js, Node.js, MongoDB & TypeScript on asif.to. Mobile-first step-by-step coding tutorials, instant syntax cheatsheets, flashcards, and practice quizzes.",
  keywords: [
    "asif.to",
    "asif.to tutorials",
    "Next.js",
    "React.js",
    "Express.js",
    "Node.js",
    "MongoDB",
    "Mongoose",
    "JavaScript",
    "TypeScript",
    "Coding Tutorials",
    "Revision Flashcards",
  ],
  authors: [{ name: "Asif", url: "/author/asif" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "asif.to — Mobile-First Coding Tutorials & Revision",
    description:
      "Learn and revise coding concepts step-by-step on asif.to with flashcards, code snippets, and quizzes.",
    siteName: "asif.to Tutorials",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased selection:bg-blue-500 selection:text-white bg-zinc-50 dark:bg-zinc-950 text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReduxProvider>
            <ScrollNavProvider>
              <Suspense fallback={null}><AnalyticsTracker /></Suspense>
              {gaMeasurementId && (
                <>
                  <Script
                    src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
                    strategy="afterInteractive"
                  />
                  <Script id="google-analytics" strategy="afterInteractive">
                    {`
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      window.gtag = gtag;
                      gtag('js', new Date());
                      gtag('config', '${gaMeasurementId}');
                    `}
                  </Script>
                  <Suspense fallback={null}>
                    <GoogleAnalyticsPageView />
                  </Suspense>
                </>
              )}
              {children}
              <FloatingPlayground />
              <BottomNav />
            </ScrollNavProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
