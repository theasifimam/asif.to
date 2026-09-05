import Script from "next/script";
import { ADS_CONFIG } from "@/config/ads.mjs";

export default function AdSenseProvider() {
  if (!ADS_CONFIG.canRequestAds) return null;

  const src =
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" +
    `?client=${encodeURIComponent(ADS_CONFIG.clientId)}`;

  return (
    <Script
      id="google-adsense"
      src={src}
      strategy="afterInteractive"
      crossOrigin="anonymous"
      async
    />
  );
}
