import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ReduxProvider } from "@/components/ReduxProvider";
import BottomNav from "@/components/BottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "asif.to | Mobile-First Coding Tutorials & Revision",
  description:
    "Learn and revise Next.js, React.js, Express.js, Node.js, MongoDB, Mongoose, JavaScript & TypeScript concepts on the go. Mobile-first bite-sized coding tutorials, flashcards, code snippets, and quizzes.",
  keywords: ["Next.js", "React.js", "Express.js", "Node.js", "MongoDB", "Mongoose", "JavaScript", "TypeScript", "Coding Tutorials", "Revision Flashcards"],
  authors: [{ name: "asif.to Team" }],
  openGraph: {
    title: "asif.to | Mobile-First Coding Tutorials & Revision",
    description: "Learn and revise coding concepts on the go with flashcards, code snippets, and quizzes.",
    type: "website",
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
      <body className={`${inter.variable} ${outfit.variable} antialiased selection:bg-blue-500 selection:text-white bg-zinc-50 dark:bg-zinc-950 text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReduxProvider>
            {children}
            <BottomNav />
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}