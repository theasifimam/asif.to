"use client";
import { createContext, useContext } from "react";
const SiteBrandingContext = createContext(null);
export function SiteBrandingProvider({ value, children }) { return <SiteBrandingContext.Provider value={value}>{children}</SiteBrandingContext.Provider>; }
export function useSiteBranding() { return useContext(SiteBrandingContext) || { title: "asif.to", tagline: "Coding Tutorials & Cheatsheets", logoUrl: "/logo.png", supportEmail: "support@asif.to", social: {} }; }
