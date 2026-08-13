import { NextResponse } from "next/server";

export async function GET(request) {
  const data = new URL(request.url).searchParams.get("data")?.trim();
  if (!data || data.length > 500)
    return NextResponse.json({ error: "A valid certificate URL is required." }, { status: 400 });

  let certificateUrl;
  try {
    certificateUrl = new URL(data);
  } catch {
    return NextResponse.json({ error: "Invalid certificate URL." }, { status: 400 });
  }
  if (!certificateUrl.pathname.startsWith("/certificates/"))
    return NextResponse.json({ error: "Only certificate links can be encoded." }, { status: 400 });

  try {
    const upstream = await fetch(
      `https://api.qrserver.com/v1/create-qr-code/?size=180x180&format=png&data=${encodeURIComponent(certificateUrl.href)}`,
      { next: { revalidate: 86400 } },
    );
    if (!upstream.ok) throw new Error("QR provider failed");
    return new NextResponse(await upstream.arrayBuffer(), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to generate QR code." }, { status: 502 });
  }
}
