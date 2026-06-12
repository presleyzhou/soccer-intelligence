import { getMatch } from "@/lib/data"; import { json, rateLimit } from "@/lib/api";
export async function GET(request:Request,{params}:{params:Promise<{matchId:string}>}){const limited=rateLimit(request);if(limited)return limited;const{matchId}=await params;const match=getMatch(matchId);return match?json(match):json({title:"Match not found",status:404},{status:404});}
