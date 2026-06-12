import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "world-cup-intelligence-web",
    timestamp: new Date().toISOString(),
    modelServiceConfigured: Boolean(process.env.MODEL_SERVICE_URL)
  });
}
