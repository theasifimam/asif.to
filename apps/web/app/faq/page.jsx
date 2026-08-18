"use client";

import React, { useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useGetPageBySlugQuery } from "@/lib/api/pagesApi";
import {
  HelpCircle,
  Search,
  ChevronDown,
  MessageSquare,
  Mail,
  ArrowRight,
  Sparkles,
  BookOpen,
  Brain,
  Terminal,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";

const DEFAULT_FAQS = [
  {
    category: "General",
    question: "What is asif.to?",
    answer:
      "<p>asif.to is an interactive learning platform designed to help web developers master modern front-end technologies (like React, Next.js, and CSS) through comprehensive, structured courses, practical challenges, and interview preparation guides.</p>",
  },
  {
    category: "General",
    question: "How can I contact support?",
    answer:
      "<p>You can reach out to us by visiting our <a href='/contact' class='text-blue-600 dark:text-blue-400 font-bold hover:underline'>Contact Page</a> and submitting a message, or by emailing us directly at <a href='mailto:support@asif.to' class='text-blue-600 dark:text-blue-400 font-bold hover:underline'>support@asif.to</a>. We typically respond within 24 hours.</p>",
  },
  {
    category: "Courses",
    question: "Are all the courses and cheatsheets free?",
    answer:
      "<p>Yes, currently all courses, syntax cheatsheets, revision flashcards, and quizzes on asif.to are completely free. Our mission is to make high-quality, structured frontend learning accessible to everyone.</p>",
  },
  {
    category: "Courses",
    question: "Do I need an account to study on asif.to?",
    answer:
      "<p>You can read courses and cheatsheets without creating an account. However, creating a free account allows you to save bookmarks, track your course completion progress, track flashcards, and take certification exams.</p>",
  },
  {
    category: "Courses",
    question: "How do I track or save my learning progress?",
    answer:
      "<p>Once you are logged in, the platform automatically tracks the chapters you complete. You can also manually mark chapters as complete using the checkbox on the chapter reader sidebar, and view your progress directly on the dashboard.</p>",
  },
  {
    category: "Exams & Quizzes",
    question: "Can I get a certificate of completion?",
    answer:
      "<p>Yes! Many of our courses include a final exam. If you achieve a passing score, you will be issued a digital certificate of completion that you can save, share, or add to your LinkedIn profile.</p>",
  },
  {
    category: "Exams & Quizzes",
    question: "How do exams and quizzes work?",
    answer:
      "<p>Exams are timed, multiple-choice tests covering the entire syllabus of a course. Quizzes are shorter, untimed practice sets designed to test your knowledge on specific topics as you study.</p>",
  },
  {
    category: "Playground",
    question: "What is the Playground?",
    answer:
      "<p>The Playground is our interactive coding workspace. It allows you to write HTML, CSS, and JavaScript directly in your browser, run it, and see the results instantly without any local setup.</p>",
  },
  {
    category: "Playground",
    question: "How do I run and test my code?",
    answer:
      "<p>Inside the Playground, simply write your code in the editor panels and click the 'Run' button. The output panel will render your HTML/CSS output, and the console panel will log any JavaScript execution results.</p>",
  },
];

function parseHTMLToFAQ(html) {
  if (!html) return null;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const children = Array.from(doc.body.children);

    const faqs = [];
    let currentCategory = "General";
    let currentQuestion = null;
    let currentAnswerParts = [];

    const flushCurrent = () => {
      if (currentQuestion && currentAnswerParts.length > 0) {
        faqs.push({
          category: currentCategory,
          question: currentQuestion,
          answer: currentAnswerParts.join(""),
        });
      }
      currentAnswerParts = [];
      currentQuestion = null;
    };

    for (const el of children) {
      const tagName = el.tagName.toUpperCase();
      const text = el.textContent.trim();

      if (
        tagName === "H1" ||
        tagName === "H2" ||
        tagName === "H3" ||
        tagName === "H4"
      ) {
        // Check if this looks like a category (short, no question mark) or a question
        const isQuestion = text.includes("?") || text.split(/\s+/).length > 4;

        if (isQuestion) {
          flushCurrent();
          currentQuestion = text;
        } else {
          flushCurrent();
          currentCategory = text || "General";
        }
      } else {
        if (currentQuestion) {
          currentAnswerParts.push(el.outerHTML);
        }
      }
    }

    flushCurrent();
    return faqs.length > 0 ? faqs : null;
  } catch (err) {
    console.error("Error parsing FAQ HTML content:", err);
    return null;
  }
}

function CategoryIcon({ category, className }) {
  const name = String(category).toLowerCase();
  if (name.includes("course") || name.includes("learn")) {
    return <BookOpen className={className} />;
  }
  if (name.includes("exam") || name.includes("quiz") || name.includes("cert")) {
    return <Brain className={className} />;
  }
  if (
    name.includes("play") ||
    name.includes("code") ||
    name.includes("practice")
  ) {
    return <Terminal className={className} />;
  }
  return <Sparkles className={className} />;
}

export default function FAQPage() {
  const { data: pageData, isLoading } = useGetPageBySlugQuery("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIndexes, setOpenIndexes] = useState({});

  // Parse FAQs dynamically or fallback
  const faqs = useMemo(() => {
    if (isLoading) return [];
    const content = pageData?.data?.content;
    if (content) {
      const parsed = parseHTMLToFAQ(content);
      if (parsed) return parsed;
    }
    return DEFAULT_FAQS;
  }, [pageData, isLoading]);

  // Extract categories dynamically
  const categories = useMemo(() => {
    const cats = new Set(faqs.map((faq) => faq.category));
    return ["All", ...Array.from(cats)];
  }, [faqs]);

  // Filter FAQs based on search query and active category
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "All" || faq.category === activeCategory;
      const cleanSearch = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !cleanSearch ||
        faq.question.toLowerCase().includes(cleanSearch) ||
        faq.answer
          .toLowerCase()
          .replace(/<[^>]*>/g, "")
          .includes(cleanSearch);

      return matchesCategory && matchesSearch;
    });
  }, [faqs, searchQuery, activeCategory]);

  const toggleAccordion = (index) => {
    setOpenIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Structured Data (FAQPage)
  const jsonLdData = useMemo(() => {
    if (!filteredFaqs.length) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: filteredFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer.replace(/<[^>]*>/g, ""), // Strip HTML for plain text schema answer
        },
      })),
    };
  }, [filteredFaqs]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground font-sans transition-colors duration-300">
      <Header />

      {/* FAQ Schema */}
      {jsonLdData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdData).replace(/</g, "\\u003c"),
          }}
        />
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 space-y-12">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6 pt-6 sm:pt-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">
            <HelpCircle className="w-4 h-4 animate-pulse" />
            <span>Help Center</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black font-outfit text-foreground tracking-tight leading-tight">
            How can we help you?
          </h1>
          <p className="text-sm sm:text-base font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Find answers to frequently asked questions about courses, exams,
            certification, and code playground settings on asif.to.
          </p>

          {/* Search Box */}
          <div className="relative max-w-xl mx-auto mt-8">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles, questions, or keywords..."
              className="w-full pl-12 pr-12 py-4 rounded-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-semibold placeholder:text-zinc-400 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-4 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>

        {/* Main Content Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-6">
          {/* Left Column: Categories List */}
          <div className="lg:col-span-9 space-y-1 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-4xl overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
                <span className="text-xs font-extrabold uppercase tracking-widest">
                  Loading questions...
                </span>
              </div>
            ) : filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = !!openIndexes[index];
                return (
                  <article
                    key={index}
                    className="overflow-hidden transition-all duration-300 shadow-xs"
                  >
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-500 px-2 py-0.5 rounded-md bg-blue-500/10 shrink-0 hidden sm:inline-block">
                          {faq.category}
                        </span>
                        <h3 className="font-extrabold text-sm sm:text-base text-foreground font-outfit truncate-normal">
                          {faq.question}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-zinc-400 transition-transform duration-300 shrink-0 ${
                          isOpen ? "transform rotate-180 text-blue-500" : ""
                        }`}
                      />
                    </button>

                    {/* Animated Panel (simple height expansion) */}
                    <div
                      className={`transition-all duration-300 ease-in-out border-t border-zinc-100 dark:border-zinc-800/80 overflow-hidden ${
                        isOpen
                          ? "max-h-125 opacity-100"
                          : "max-h-0 opacity-0 pointer-events-none"
                      }`}
                    >
                      <div
                        className="p-5 sm:p-6 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed space-y-4 prose prose-zinc dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[28px] space-y-4">
                <HelpCircle className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <h3 className="text-lg font-black text-foreground font-outfit">
                  No questions match your query
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
                  We couldn&apos;t find any match for &quot;{searchQuery}&quot;.
                  Try searching with different terms, or contact support below.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Right Column: FAQ Accordion List */}
          <div className="lg:col-span-3 lg:sticky lg:top-24 h-fit space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-3">
              Categories
            </h2>
            <div className="flex flex-row lg:flex-col overflow-x-auto gap-2 scrollbar-none rounded-3xl text-xs sm:text-sm font-bold border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/80 p-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setOpenIndexes({}); // close accordions on tab switch
                  }}
                  className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 shrink-0 text-left w-full justify-between lg:justify-start rounded-full ${
                    activeCategory === cat
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/25"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon
                      category={cat}
                      className={`w-4 h-4 ${activeCategory === cat ? "text-white" : "text-blue-500"}`}
                    />
                    <span>{cat}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Contact/Support CTA Card */}
        <section className="bg-white dark:bg-zinc-900 p-6 sm:p-10 rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5" />
              <span>Still Have Questions?</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-outfit text-foreground tracking-tight">
              Can&apos;t find the answers you&apos;re looking for?
            </h2>
            <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
              If your question is not covered in our help database, feel free to
              contact us. Our team is ready to support you with any platform
              issues.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition-all shrink-0 w-fit"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact Support</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
