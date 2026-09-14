"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellRing, BookOpen, CheckCircle2, Mail, UserRound } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const interestGroups = [
  { title: "Topics", description: "Follow the technologies you are learning.", icon: BellRing },
  { title: "Courses", description: "Hear when lessons and chapters are added.", icon: BookOpen },
  { title: "Authors", description: "Keep up with your favourite creators.", icon: UserRound },
];

export default function HomeSubscribeSection() {
  const [availableTopics, setAvailableTopics] = useState([]);
  const [topics, setTopics] = useState([]);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/communications/public/topics`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Unable to load interests."))))
      .then((result) => setAvailableTopics(result.data?.topics || []))
      .catch(() => {
        if (!controller.signal.aborted) setAvailableTopics([]);
      });
    return () => controller.abort();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/communications/public/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, topics }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to subscribe right now.");
      setState("success");
      setMessage(result.data?.message || "Check your inbox to confirm your subscription.");
    } catch (error) {
      setState("error");
      setMessage(error.message);
    }
  };

  return (
    <section className="overflow-hidden rounded-4xl border border-blue-500/15 bg-linear-to-br from-blue-500/10 via-indigo-500/10 to-white p-5 shadow-xs dark:to-zinc-900 sm:rounded-[2.5rem] sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/15 bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <Mail className="h-3.5 w-3.5" />
            Personalised updates
          </span>
          <h2 className="mt-4 font-outfit text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Get the learning updates you actually want.
          </h2>
          <p className="mt-3 max-w-lg text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
            Subscribe for new articles, course chapters, favourite topics and creator updates. Choose your interests and change them whenever you like.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {interestGroups.map(({ title, description, icon: Icon }) => (
              <div key={title} className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/70 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/60">
                <span className="rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400"><Icon className="h-4 w-4" /></span>
                <div><p className="text-xs font-bold text-foreground">{title}</p><p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p></div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/90 sm:p-5">
          {state === "success" ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <h3 className="mt-4 text-lg font-extrabold text-foreground">One last step</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{message}</p>
              <Link href="/email-preferences" className="mt-5 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400">Manage email preferences</Link>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-zinc-500">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-1.5 h-11 w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 text-sm font-medium normal-case tracking-normal text-foreground outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800/70" /></label>
                <label className="text-[11px] font-black uppercase tracking-wider text-zinc-500">Name <span className="font-medium normal-case tracking-normal">(optional)</span><input value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Alex" className="mt-1.5 h-11 w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 text-sm font-medium normal-case tracking-normal text-foreground outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800/70" /></label>
              </div>
              <fieldset className="mt-5">
                <legend className="text-xs font-extrabold text-foreground">Choose your interests</legend>
                <div className="mt-3 flex max-h-36 flex-wrap gap-2 overflow-y-auto">
                  {availableTopics.map((topic) => {
                    const selected = topics.includes(topic);
                    return <label key={topic} className={`cursor-pointer rounded-full border px-3 py-2 text-xs font-bold transition ${selected ? "border-blue-500 bg-blue-600 text-white" : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-blue-300 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-300"}`}><input type="checkbox" checked={selected} onChange={(event) => setTopics((current) => event.target.checked ? [...current, topic] : current.filter((value) => value !== topic))} className="sr-only" />{topic}</label>;
                  })}
                </div>
                {!availableTopics.length && <p className="mt-3 text-xs text-zinc-500">Interests are temporarily unavailable. You can still subscribe to general updates.</p>}
              </fieldset>
              <button type="submit" disabled={state === "loading"} className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60">{state === "loading" ? "Sending confirmation…" : "Subscribe to updates"}<Mail className="h-4 w-4" /></button>
              {state === "error" && <p role="alert" className="mt-3 text-center text-xs font-semibold text-rose-600">{message}</p>}
              <p className="mt-3 text-center text-[11px] leading-relaxed text-zinc-400">We will send a confirmation email first. No account is required. You can unsubscribe anytime.</p>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
