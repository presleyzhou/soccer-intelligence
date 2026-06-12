import { NextResponse } from "next/server";
import { matches, teams } from "@/lib/data";

export function GET() {
  return NextResponse.json({ matches, teams, generatedAt: new Date().toISOString() });
}
