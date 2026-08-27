import { localStorageProvider } from "./localStorage.service.js";

const providers = { local: localStorageProvider };

export function getStorageProvider(name = process.env.ASSET_STORAGE_PROVIDER || "local") {
  const provider = providers[name];
  if (!provider) throw new Error(`Unsupported asset storage provider: ${name}`);
  return provider;
}

export default getStorageProvider();
