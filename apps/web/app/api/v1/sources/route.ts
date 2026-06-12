import { sources } from "@/lib/data"; import { json, rateLimit } from "@/lib/api";
export async function GET(request:Request){const limited=rateLimit(request);if(limited)return limited;return json({data:sources});}
