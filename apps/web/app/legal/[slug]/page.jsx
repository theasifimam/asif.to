"use client";

import React from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useGetPageBySlugQuery } from "@/lib/api/pagesApi";
import { ShieldCheck, FileText, Cookie, Mail } from "lucide-react";
import { PrivacyPolicy, TermsOfService } from "@/components/legal/LegalPolicies";

const LEGAL_FALLBACKS = {
  "privacy-policy": {
    title: "Privacy Policy",
    subtitle: "Last Updated: August 2026",
    icon: ShieldCheck,
    content: (
      <div className="space-y-6 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
        <p>
          At <strong>asif.to</strong>, accessible from{" "}
          <a
            href="https://asif.to"
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            https://asif.to
          </a>
          , the privacy of our visitors and users is one of our main priorities.
          This Privacy Policy document outlines the types of information
          collected and recorded by asif.to and how we use it.
        </p>

        <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight pt-2">
          1. Information We Collect
        </h2>
        <p>
          When you register for an account, subscribe to updates, or interact
          with interactive learning features on asif.to, we may collect:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            Account credentials (Full Name, Email Address, Password hash).
          </li>
          <li>
            Course progress, completed chapters, saved lectures, and bookmarks.
          </li>
          <li>
            Basic device data and browser type for user experience optimization.
          </li>
        </ul>

        <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight pt-2">
          2. How We Use Your Information
        </h2>
        <p>We use the information we collect in various ways, including to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            Provide, operate, and maintain our web development learning
            platform.
          </li>
          <li>Track and store your course progress and revision flashcards.</li>
          <li>
            Send security alerts, system updates, or technical newsletters if
            subscribed.
          </li>
          <li>
            Analyze platform analytics to improve interactive course content.
          </li>
        </ul>

        <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight pt-2">
          3. Security of Data
        </h2>
        <p>
          The security of your personal data is paramount to us. We use
          industry-standard encryption, secure HTTP connections, and hashed
          passwords to protect your personal information against unauthorized
          access.
        </p>

        <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight pt-2">
          4. Contact Us
        </h2>
        <p>
          If you have additional questions or require more information about our
          Privacy Policy, do not hesitate to contact us at:
        </p>
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold w-fit">
          <a href="mailto:support@asif.to" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>support@asif.to</span>
          </a>
        </div>
      </div>
    ),
  },

  "terms-conditions": {
    title: "Terms & Conditions",
    subtitle: "Last Updated: August 2026",
    icon: FileText,
    content: (
      <div className="space-y-6 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
        <p>
          Welcome to <strong>asif.to</strong>! These terms and conditions
          outline the rules and regulations for the use of asif.to Website and
          Web Development Platform.
        </p>

        <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight pt-2">
          1. Intellectual Property
        </h2>
        <p>
          Unless otherwise stated, asif.to owns the intellectual property rights
          for all course material, tutorials, code snippet examples, and
          flashcard content on asif.to. All intellectual property rights are
          reserved. You may access this from asif.to for your own personal,
          educational use.
        </p>

        <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight pt-2">
          2. User Accounts
        </h2>
        <p>
          When creating an account on asif.to, you agree to provide accurate
          registration information. You are responsible for maintaining the
          confidentiality of your account credentials.
        </p>

        <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight pt-2">
          3. Platform Restrictions
        </h2>
        <p>You are specifically restricted from all of the following:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            Automated scraping or mass redistribution of platform course
            databases.
          </li>
          <li>
            Using this website in any way that is or may be damaging to this
            website.
          </li>
          <li>Engaging in any data mining or unauthorized data extraction.</li>
        </ul>

        <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight pt-2">
          4. Contact Information
        </h2>
        <p>
          For any questions regarding these Terms & Conditions, please contact
          us at:
        </p>
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold w-fit">
          <a href="mailto:support@asif.to" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>support@asif.to</span>
          </a>
        </div>
      </div>
    ),
  },

  "cookie-usage": {
    title: "Cookie Policy",
    subtitle: "Last Updated: August 2026",
    icon: Cookie,
    content: (
      <div className="space-y-6 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
        <p>
          <strong>asif.to</strong> uses essential cookies and local browser
          storage to provide personalized learning experiences, save course
          progress, and preserve dark/light theme preferences.
        </p>
        <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight pt-2">
          Contact Support
        </h2>
        <p>For questions about cookie management, reach out to us at:</p>
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold w-fit">
          <a href="mailto:support@asif.to" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>support@asif.to</span>
          </a>
        </div>
      </div>
    ),
  },
};

// Comprehensive source-controlled policies. CMS content can still override
// these fallbacks when an intentionally published legal page exists.
LEGAL_FALLBACKS["privacy-policy"].content = <PrivacyPolicy />;
LEGAL_FALLBACKS["privacy-policy"].subtitle = "Effective and Last Updated: August 15, 2026";
LEGAL_FALLBACKS["terms-conditions"].content = <TermsOfService />;
LEGAL_FALLBACKS["terms-conditions"].title = "Terms of Service";
LEGAL_FALLBACKS["terms-conditions"].subtitle = "Effective and Last Updated: August 15, 2026";

export default function LegalPage() {
  const params = useParams();
  const slug = params?.slug;
  const { data: pageData, isLoading } = useGetPageBySlugQuery(slug, {
    skip: !slug,
  });

  const page = pageData?.data;
  const fallback = LEGAL_FALLBACKS[slug];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-3 border-zinc-300 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="mt-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
            Loading Legal Document...
          </span>
        </main>
        <Footer />
      </div>
    );
  }

  const displayTitle =
    page?.title || fallback?.title || slug?.replace(/-/g, " ").toUpperCase();
  const IconComponent = fallback?.icon || FileText;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground font-sans transition-colors duration-300">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 space-y-8">
        {/* Document Header */}
        <div className="space-y-4 py-6 sm:py-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <IconComponent className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              asif.to Legal & Policy
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
            {displayTitle}
          </h1>

          {fallback?.subtitle && (
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {fallback.subtitle}
            </p>
          )}

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {page?.content ? (
              <div
                className="prose prose-zinc dark:prose-invert max-w-none text-justify text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : fallback?.content ? (
              fallback.content
            ) : (
              <p className="text-sm text-zinc-500 font-medium">
                Document content is currently being updated. For inquiries,
                email us at{" "}
                <a
                  href="mailto:support@asif.to"
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  support@asif.to
                </a>
                .
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
