"use client";
import { Children } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export const readable = value => String(value || "").toLowerCase().replaceAll("_", " ").replace(/^./, c => c.toUpperCase());
// Match the form select contract while using the established admin select UI.
export default function SelectField({ children, value, defaultValue, onChange, className, disabled, required, ...props }) {
  const options = Children.toArray(children).filter(Boolean);
  const normalize = value => String(value) === "" ? "__all__" : String(value);
  return <Select value={value == null ? undefined : normalize(value)} defaultValue={defaultValue == null ? undefined : normalize(defaultValue)} disabled={disabled} required={required} onValueChange={value => onChange?.({ target: { value: value === "__all__" ? "" : value } })}>
    <SelectTrigger className={className} aria-label={props["aria-label"]}><SelectValue placeholder="Choose an option" /></SelectTrigger>
    <SelectContent>{options.map(option => { const raw = option.props.value ?? option.props.children; const label = option.props.children; return <SelectItem key={normalize(raw)} value={normalize(raw)} disabled={option.props.disabled}>{typeof label === "string" && /^[A-Z_]+$/.test(label) ? readable(label) : label}</SelectItem>; })}</SelectContent>
  </Select>;
}
