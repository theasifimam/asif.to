const KEY = "asifto:recent-searches";
export function getRecentSearches() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }
export function rememberSearch(query) { const value = query.trim(); if (!value) return; localStorage.setItem(KEY, JSON.stringify([value, ...getRecentSearches().filter((item) => item !== value)].slice(0, 6))); }
export function removeRecentSearch(query) { localStorage.setItem(KEY, JSON.stringify(getRecentSearches().filter((item) => item !== query))); }
export function clearRecentSearches() { localStorage.removeItem(KEY); }
