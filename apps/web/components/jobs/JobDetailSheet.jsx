"use client";

import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  RefreshCw,
  X,
} from "lucide-react";
import api from "@/lib/axios";
import { formatJobDate, formatSalary } from "@/lib/jobs";
import { safeJobDescription } from "@/lib/jobDescription.mjs";
import CompanyLogo from "./CompanyLogo";
import JobActions from "./JobActions";

const label = (value) => (value || "Not specified").replaceAll("-", " ");

export default function JobDetailSheet({ selection, onClose, onRestoreFocus }) {
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const gesture = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    api
      .get(`/jobs/slug/${encodeURIComponent(selection.slug)}`, {
        signal: controller.signal,
      })
      .then(({ data }) => {
        if (!data?.data?.job)
          throw new Error("This job is no longer available.");
        if (!controller.signal.aborted) {
          setJob(data.data.job);
          setError("");
        }
      })
      .catch((failure) => {
        if (!controller.signal.aborted)
          setError(
            failure.response?.status === 404
              ? "This job is no longer available."
              : "We couldn’t load this job. Please try again.",
          );
      });
    return () => controller.abort();
  }, [selection.slug, retry]);
  const preview = job || selection.summary;
  const company = preview?.company || {};

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-200 bg-zinc-950/50 backdrop-blur-sm" />
        <Dialog.Content
          onCloseAutoFocus={onRestoreFocus}
          aria-describedby="job-sheet-summary"
          className="fixed inset-x-0 bottom-0 z-201 mx-auto flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] border border-zinc-200 bg-white text-zinc-950 shadow-2xl outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 sm:max-h-[90dvh] sm:rounded-t-4xl motion-safe:animate-[job-sheet-in_220ms_ease-out]"
        >
          <div className="relative shrink-0 border-b border-zinc-100 px-5 pb-4 pt-3 dark:border-zinc-800 sm:px-7">
            <div
              aria-hidden="true"
              className="mx-auto mb-2 flex h-5 w-24 touch-none items-center justify-center"
              onPointerDown={(event) => {
                gesture.current = { y: event.clientY, x: event.clientX };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerUp={(event) => {
                const start = gesture.current;
                gesture.current = null;
                if (
                  start &&
                  event.clientY - start.y > 65 &&
                  Math.abs(event.clientX - start.x) < 80
                )
                  onClose();
              }}
            >
              <span className="h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <Dialog.Title className="text-sm font-bold">
                  Job details
                </Dialog.Title>
                <Dialog.Description
                  id="job-sheet-summary"
                  className="mt-0.5 truncate text-xs text-zinc-500"
                >
                  {preview?.companyName || "Find your next opportunity"}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close job details"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-blue-500 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-5 [-webkit-overflow-scrolling:touch] sm:px-7"
            aria-busy={!job && !error}
          >
            {preview && (
              <header>
                <CompanyLogo
                  company={company}
                  job={preview}
                  className="mb-4 h-14 w-14"
                  priority
                />
                <h2 className="wrap-break-word font-outfit text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                  {preview.title}
                </h2>
                <p className="mt-2 text-sm font-semibold text-zinc-500">
                  {preview.companyName}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {preview.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatJobDate(preview.postedAt)}
                  </span>
                </div>
              </header>
            )}
            {error ? (
              <div
                role="alert"
                className="my-8 rounded-2xl bg-zinc-50 p-5 text-sm dark:bg-zinc-900"
              >
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setRetry((value) => value + 1);
                  }}
                  className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-blue-600"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </button>
              </div>
            ) : !job ? (
              <div role="status" className="py-10">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600 motion-reduce:animate-none" />
                <p className="mt-3 text-center text-sm text-zinc-500">
                  Loading job details…
                </p>
                <div aria-hidden="true" className="mt-7 space-y-3">
                  {[1, 2, 3, 4].map((row) => (
                    <div
                      key={row}
                      className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {job.isDemo && (
                  <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
                    Demo listing — not a live vacancy.
                  </p>
                )}
                {job.status === "expired" && (
                  <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
                    This position is no longer accepting applications.
                  </p>
                )}
                <dl className="my-6 grid grid-cols-2 gap-3 rounded-2xl bg-zinc-50 p-4 text-sm dark:bg-zinc-900">
                  {[
                    ["Salary", formatSalary(job)],
                    ["Employment", label(job.employmentType)],
                    ["Work mode", label(job.workMode)],
                    ["Experience", label(job.experienceLevel)],
                    ["Category", job.category],
                    ["Source", job.source?.name || job.sourceName],
                  ].map(([term, value]) => (
                    <div key={term} className="min-w-0">
                      <dt className="text-xs text-zinc-500">{term}</dt>
                      <dd className="mt-1 wrap-break-word font-semibold capitalize">
                        {value || "Not specified"}
                      </dd>
                    </div>
                  ))}
                </dl>
                <section>
                  <h3 className="text-base font-bold">About the role</h3>
                  <div
                    className="mt-3 wrap-break-word text-sm leading-7 text-zinc-600 dark:text-zinc-300 [&_h2]:mt-6 [&_h2]:font-bold [&_h3]:mt-5 [&_h3]:font-bold [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{
                      __html: safeJobDescription(
                        job.descriptionHtml || job.description,
                      ),
                    }}
                  />
                </section>
                {[
                  ["Responsibilities", job.responsibilities],
                  ["Requirements", job.requirements],
                  ["Benefits", job.benefits],
                ].map(
                  ([title, items]) =>
                    items?.length > 0 && (
                      <section key={title} className="mt-7">
                        <h3 className="font-bold">{title}</h3>
                        <ul className="mt-3 space-y-3">
                          {items.map((item, index) => (
                            <li
                              key={index}
                              className="flex gap-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300"
                            >
                              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                              <span className="min-w-0 wrap-break-word">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ),
                )}
                {job.skills?.length > 0 && (
                  <section className="mt-7">
                    <h3 className="font-bold">Skills</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="max-w-full wrap-break-word rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium dark:bg-zinc-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
                {company.description && (
                  <section className="mt-7">
                    <h3 className="font-bold">About {job.companyName}</h3>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-500">
                      {company.description}
                    </p>
                  </section>
                )}
                <a
                  href={`/jobs/${job.slug}`}
                  className="mt-7 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-blue-600"
                >
                  Open full job page
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </>
            )}
          </div>
          {job && (
            <footer className="shrink-0 border-t border-zinc-200 bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 dark:border-zinc-800 dark:bg-zinc-950 sm:px-7">
              <JobActions job={job} layout="bar" />
              <p className="mt-2 text-center text-[11px] text-zinc-500">
                {job.applicationType === "external"
                  ? "Apply securely on the employer’s website"
                  : "Send your application through asif.to"}
              </p>
            </footer>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
