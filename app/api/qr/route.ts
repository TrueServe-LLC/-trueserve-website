import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

function clampSize(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 260;
  return Math.max(120, Math.min(1200, Math.round(parsed)));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get("data");
  const size = clampSize(searchParams.get("size"));

  if (!data) {
    return NextResponse.json({ error: "Missing data parameter" }, { status: 400 });
  }

  const svg = await QRCode.toString(data, {
    type: "svg",
    width: size,
    margin: 1,
    color: {
      dark: "#0b0f14",
      light: "#ffffff",
    },
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
