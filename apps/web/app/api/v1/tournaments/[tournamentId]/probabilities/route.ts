import { advancement } from "@/lib/data"; import { json, rateLimit } from "@/lib/api";
export async function GET(request:Request,{params}:{params:Promise<{tournamentId:string}>}){const limited=rateLimit(request);if(limited)return limited;const{tournamentId}=await params;return json({tournamentId,iterations:100000,seed:20260612,data:advancement});}
