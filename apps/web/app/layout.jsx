import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ReduxProvider } from "@/components/ReduxProvider";
import BottomNav from "@/components/BottomNav";
import { ScrollNavProvider } from "@/components/ScrollNavProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "asif.to — Step-by-Step Web & Full-Stack Coding Tutorials",
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
  authors: [{ name: "asif.to Team" }],
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
              {children}
              <BottomNav />
            </ScrollNavProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
