"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Mail,
  Send,
  CheckCircle2,
  MessageSquare,
  Instagram,
  Facebook,
  Linkedin,
  MapPin,
} from "lucide-react";
import { useSubmitContactMessageMutation } from "@/lib/api/contactApi";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={`${className} fill-current`} viewBox="0 0 24 24">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.105 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

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
      toast.error(
        error?.data?.message || "Failed to send message. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground font-sans transition-colors duration-300">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
        <nav className="mb-7 flex items-center gap-2 text-xs font-bold text-zinc-400 px-6 sm:px-10">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-700 dark:text-zinc-200">Contact</span>
        </nav>
        {/* Main Content Outer Container with Extra Rounded Corners & Solid Surfaces */}
        <div className="p-6 sm:p-10">
          {/* Top Center Header Section */}
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest">
              <MessageSquare className="w-3.5 h-3.5" />
              Contact &amp; Support
            </div>

            <h1 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight">
              Get in Touch with{" "}
              <span className="text-blue-600 dark:text-blue-400">
                asif.to
              </span>
            </h1>

            <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Have questions about our web development courses, cheatsheets,
              or platform features? Send us a message or connect directly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Direct Support & Official Social Handles */}
            <div className="lg:col-span-5 space-y-2">

              {/* Direct Email Card */}
              <div className="flex items-center gap-4 p-4 rounded-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800/80">
                <div className="p-3 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 block">
                    Direct Support Email
                  </span>
                  <a
                    href="mailto:support@asif.to"
                    className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    support@asif.to
                  </a>
                </div>
              </div>

              {/* Platform Community Availability */}
              <div className="flex items-center gap-4 p-4 rounded-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800/80">
                <div className="p-3 rounded-full bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 block">
                    Platform Availability
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    Global 24/7 Web Development Community
                  </span>
                </div>
              </div>

              {/* Official Social Handles Block */}
              <div className="p-5 rounded-4xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                    Official Social Media
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black">
                    @theasifto
                  </span>
                </div>

                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Follow asif.to for daily coding tips, new course
                  announcements, and updates.
                </p>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <a
                    href="https://instagram.com/theasifto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-full bg-white dark:bg-zinc-900 hover:border-pink-500/50 hover:text-pink-600 dark:hover:text-pink-400 border border-zinc-200/80 dark:border-zinc-700/80 transition-all group"
                  >
                    <div className="p-2 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors shrink-0">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground">
                        Instagram
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate">
                        @theasifto
                      </span>
                    </div>
                  </a>

                  <a
                    href="https://facebook.com/theasifto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-full bg-white dark:bg-zinc-900 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 border border-zinc-200/80 dark:border-zinc-700/80 transition-all group"
                  >
                    <div className="p-2 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                      <Facebook className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground">
                        Facebook
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate">
                        @theasifto
                      </span>
                    </div>
                  </a>

                  <a
                    href="https://linkedin.com/in/theasifto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-full bg-white dark:bg-zinc-900 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 border border-zinc-200/80 dark:border-zinc-700/80 transition-all group"
                  >
                    <div className="p-2 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] group-hover:bg-[#0A66C2] group-hover:text-white transition-colors shrink-0">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground">
                        LinkedIn
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate">
                        @theasifto
                      </span>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/theasifto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-4xl bg-white dark:bg-zinc-900 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400 border border-zinc-200/80 dark:border-zinc-700/80 transition-all group"
                  >
                    <div className="p-2 rounded-4xl bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-colors shrink-0">
                      <WhatsAppIcon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground">
                        WhatsApp
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate">
                        @theasifto
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Solid Contact Form Card */}
            <div className="lg:col-span-7 bg-zinc-50 dark:bg-zinc-800/40 p-6 sm:p-8 rounded-4xl border border-zinc-200/80 dark:border-zinc-800/80">
              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-outfit text-xl font-extrabold text-foreground">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-md leading-relaxed">
                    Thank you for reaching out to asif.to. We will review your
                    message and reply to{" "}
                    <strong className="text-foreground">
                      {formData.email}
                    </strong>{" "}
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
                    className="px-6 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all mt-2 cursor-pointer active:scale-95"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] pl-5 font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
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
                        className="w-full px-4 py-3 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-foreground placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] pl-5 font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
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
                        className="w-full px-4 py-3 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-foreground placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] pl-5 font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-foreground focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option>General Inquiry</option>
                      <option>Course Feedback</option>
                      <option>Bug Report / Technical Issue</option>
                      <option>Partnerships &amp; Licensing</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] pl-5 font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
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
                      className="w-full px-4 py-3 rounded-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-foreground placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-widest shadow-md shadow-blue-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isLoading ? (
                      <LogoLoader className="w-4 h-4 "  />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>
                      {isLoading ? "Sending Message..." : "Send Message"}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
