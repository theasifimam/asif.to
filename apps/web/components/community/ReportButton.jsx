"use client";
import { useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/store/hooks";
import { useReportCommunityContentMutation } from "@/lib/api/communityApi";
import { REPORT_REASONS } from "./communityConstants";

export default function ReportButton({ targetType, targetId }) {
  const authenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [open,setOpen]=useState(false); const [reason,setReason]=useState("spam"); const [explanation,setExplanation]=useState("");
  const [report,{isLoading}]=useReportCommunityContentMutation();
  const submit=async()=>{if(!authenticated){location.href="/login";return;}try{await report({targetType,targetId,reason,explanation}).unwrap();toast.success("Report submitted");setOpen(false);}catch(error){toast.error(error?.data?.message||"Unable to submit report");}};
  return <>{<button onClick={()=>setOpen(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-rose-600"><Flag className="h-3.5 w-3.5"/>Report</button>}{open&&<div className="fixed inset-0 z-100 grid place-items-center bg-black/60 p-4" onClick={()=>setOpen(false)}><div onClick={(e)=>e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white p-6 text-zinc-950 shadow-2xl dark:bg-zinc-900 dark:text-white"><h2 className="text-xl font-black">Report content</h2><p className="mt-2 text-sm text-zinc-500">Reports are private. Please choose the closest reason.</p><select value={reason} onChange={(e)=>setReason(e.target.value)} className="mt-5 w-full rounded-xl border bg-transparent p-3 text-sm dark:border-zinc-700">{REPORT_REASONS.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>{reason==="other"&&<textarea value={explanation} onChange={(e)=>setExplanation(e.target.value)} maxLength={500} rows={3} placeholder="Briefly explain" className="mt-3 w-full rounded-xl border bg-transparent p-3 text-sm dark:border-zinc-700"/>}<p className="mt-3 text-xs text-zinc-500">Please review the <a href="/community/guidelines" className="text-blue-600">community guidelines</a>. Duplicate reports are prevented.</p><div className="mt-5 flex justify-end gap-2"><button onClick={()=>setOpen(false)} className="rounded-full px-4 py-2 text-sm font-bold">Cancel</button><button disabled={isLoading} onClick={submit} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Submit report</button></div></div></div>}</>;
}
