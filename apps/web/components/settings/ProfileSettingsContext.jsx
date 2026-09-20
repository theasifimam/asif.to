"use client";

import { createContext, useContext } from "react";

const ProfileSettingsContext = createContext(null);

export function ProfileSettingsProvider({ value, children }) {
  return <ProfileSettingsContext.Provider value={value}>{children}</ProfileSettingsContext.Provider>;
}

export function useProfileSettings() {
  const value = useContext(ProfileSettingsContext);
  if (!value) throw new Error("useProfileSettings must be used inside ProfileSettingsProvider");
  return value;
}
