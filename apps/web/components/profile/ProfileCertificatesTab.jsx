"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Award, BadgeCheck, ChevronRight, Download } from "lucide-react";
import { generateCertificate } from "@/components/exam/generateCertificate";
import { toast } from "sonner";

export default function ProfileCertificatesTab({
  user,
  certificates = [],
}) {
  const [downloadingCertificate, setDownloadingCertificate] = useState(null);

  const downloadPdf = async (certificate) => {
    if (!Number.isFinite(certificate.score) || !certificate.total) {
      toast.error(
        "This older certificate does not contain a recorded score and cannot be regenerated.",
      );
      return;
    }
    setDownloadingCertificate(certificate._id);
    try {
      const verificationUrl = certificate.certificateUrl
        ? `${window.location.origin}${certificate.certificateUrl}`
        : "";
      await generateCertificate({
        studentName: user?.fullName || user?.username,
        studentEmail: user?.email || "",
        courseName: certificate.courseId?.title || "Course",
        score: certificate.score,
        total: certificate.total,
        date: new Date(certificate.issueDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        verificationUrl,
      });
    } catch {
      toast.error("Unable to generate the certificate PDF. Please try again.");
    } finally {
      setDownloadingCertificate(null);
    }
  };

  return (
    <div>
      <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
        <Award className="w-4 h-4 text-amber-500" />
        <span>My Certificates ({certificates.length})</span>
      </h3>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {certificates.map((cert, idx) => (
            <div
              key={cert._id || idx}
              className="p-6 rounded-3xl bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-800/30 shadow-sm flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center shadow-sm">
                  <Award className="w-6 h-6" />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  <BadgeCheck className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-base text-foreground leading-snug">
                  {cert.courseId?.title || "Course Certificate"}
                </h4>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  Issued on{" "}
                  {cert.issueDate
                    ? new Date(cert.issueDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>

              {cert.certificateUrl && (
                <div className="flex items-end justify-between gap-3">
                  <div className="flex flex-col items-start gap-2">
                    <a
                      href={cert.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:underline dark:text-amber-400"
                    >
                      <span>View Certificate</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => downloadPdf(cert)}
                      disabled={
                        downloadingCertificate === cert._id ||
                        !Number.isFinite(cert.score) ||
                        !cert.total
                      }
                      className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>
                        {downloadingCertificate === cert._id
                          ? "Generating…"
                          : "Download PDF"}
                      </span>
                    </button>
                  </div>
                  <img
                    src={`/api/certificate-qr?data=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || "https://asif.to"}${cert.certificateUrl}`)}`}
                    alt="QR code to verify certificate"
                    className="h-16 w-16 rounded-lg border border-amber-200 bg-white p-1"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-sm text-center flex flex-col items-center gap-3 border border-zinc-100 dark:border-zinc-800">
          <Award className="w-10 h-10 text-zinc-200 dark:text-zinc-700" />
          <h3 className="font-extrabold text-base text-foreground">
            No Certificates Yet
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm">
            Pass the final proctored exam of any course to earn your verified certificate.
          </p>
          <Link
            href="/quiz"
            className="mt-2 px-6 py-2.5 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-500/25 hover:bg-amber-600 transition-all active:scale-95"
          >
            Go to Exams
          </Link>
        </div>
      )}
    </div>
  );
}
