import { NextResponse } from "next/server";
import { getMatch, getTeam } from "@/lib/data";

export async function GET(_request: Request, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const match = getMatch(matchId);
  if (!match) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ match, homeTeam: getTeam(match.homeTeamId), awayTeam: getTeam(match.awayTeamId) });
}
