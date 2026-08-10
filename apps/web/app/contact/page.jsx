"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, MapPin, Send, CheckCircle2, MessageSquare, Loader2 } from "lucide-react";
import { useSubmitContactMessageMutation } from "@/lib/api/contactApi";
import { toast } from "sonner";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const [submitMessage, { isLoading }] = useSubmitContactMessageMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitMessage(formData).unwrap();
      setSubmitted(true);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send message. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground font-sans transition-colors duration-300">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Header Info Left */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">
                <MessageSquare className="w-3.5 h-3.5" />
                Contact & Support
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
                Get in Touch with asif.to
              </h1>
              <p className="text-sm sm:text-base font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Have questions about our web development courses, cheatsheets,
                or platform features? Send us a message or reach out directly.
              </p>
            </div>

            <div className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              {/* Email Direct */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
                <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 block">
                    Direct Support Email
                  </span>
                  <a
                    href="mailto:support@asif.to"
                    className="text-base font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    support@asif.to
                  </a>
                </div>
              </div>

              {/* Platform Base */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
                <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 block">
                    Platform Availability
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    Global 24/7 Web Development Community
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Right */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-foreground">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-md">
                  Thank you for reaching out to asif.to. We will review your
                  message and respond to <strong>{formData.email}</strong>{" "}
                  shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      subject: "General Inquiry",
                      message: "",
                    });
                  }}
                  className="px-6 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all mt-4"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-sm font-medium text-foreground placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="support@asif.to"
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-sm font-medium text-foreground placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-sm font-medium text-foreground focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option>General Inquiry</option>
                    <option>Course Feedback</option>
                    <option>Bug Report / Technical Issue</option>
                    <option>Partnerships & Licensing</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="How can we help you?"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-sm font-medium text-foreground placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isLoading ? "Sending..." : "Send Message"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
