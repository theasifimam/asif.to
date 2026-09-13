import JobSheetProvider from "@/components/jobs/JobSheetProvider";

export default function JobsLayout({ children }) {
  return <JobSheetProvider>{children}</JobSheetProvider>;
}
