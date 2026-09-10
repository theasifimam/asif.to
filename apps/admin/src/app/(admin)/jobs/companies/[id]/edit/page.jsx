"use client";

import { use } from "react";
import CompanyForm from "../../components/CompanyForm";

export default function EditCompanyPage({ params }) {
  const { id } = use(params);
  return <CompanyForm companyId={id} />;
}
