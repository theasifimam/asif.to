import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
            <Header />

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                    {/* Header Info */}
                    <div className="lg:col-span-5 flex flex-col gap-10">
                        <h1 className="text-6xl md:text-8xl font-black font-outfit tracking-tighter leading-[0.9] uppercase">
                            Get in <br /> Touch.
                        </h1>
                        <p className="text-xl font-light text-zinc-500 leading-relaxed max-w-sm">
                            For investigative leads, institutional licensing, or editorial inquiries. We prioritize secure communication.
                        </p>

                        <div className="flex flex-col gap-8 mt-10 font-sans">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Secure Message</span>
                                <span className="text-sm font-bold border-b border-zinc-200 pb-1 w-fit hover:border-zinc-900 cursor-pointer transition-colors">tips@mazlisnews.investigations</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Office HQ</span>
                                <span className="text-sm font-bold">Nyhavn 12, Copenhagen, Denmark</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-7 bg-white p-12 md:p-16 rounded-[3rem] border border-zinc-100 shadow-sm">
                        <form className="flex flex-col gap-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="flex flex-col gap-4">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Name</label>
                                    <input type="text" placeholder="Your Name" className="border-b border-zinc-200 py-3 text-sm focus:outline-none focus:border-zinc-900 transition-colors bg-transparent placeholder:text-zinc-300" />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Email</label>
                                    <input type="email" placeholder="example@domain.com" className="border-b border-zinc-200 py-3 text-sm focus:outline-none focus:border-zinc-900 transition-colors bg-transparent placeholder:text-zinc-300" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Subject</label>
                                <select className="border-b border-zinc-200 py-3 text-sm focus:outline-none focus:border-zinc-900 transition-colors bg-transparent text-zinc-400 appearance-none">
                                    <option>Editorial Inquiry</option>
                                    <option>Investigative Tip</option>
                                    <option>Licensing & Partnerships</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-4">
                                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Message</label>
                                <textarea rows={4} placeholder="How can we help you?" className="border-b border-zinc-200 py-3 text-sm focus:outline-none focus:border-zinc-900 transition-colors bg-transparent resize-none placeholder:text-zinc-300"></textarea>
                            </div>

                            <button className="bg-zinc-900 text-white font-black py-6 rounded-full hover:bg-zinc-700 transition-all uppercase tracking-[0.2em] text-xs mt-4">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>);

}