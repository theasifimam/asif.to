import JobForm from "../../components/JobForm";
export default async function EditJobPage({ params }) { const { id } = await params; return <JobForm jobId={id} />; }
