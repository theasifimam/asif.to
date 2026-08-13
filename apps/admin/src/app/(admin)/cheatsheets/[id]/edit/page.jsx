"use client";
import { use } from "react";
import CheatsheetForm from "../../components/CheatsheetForm";
export default function EditCheatsheetPage({ params }) { const { id } = use(params); return <CheatsheetForm cheatsheetId={id} />; }
