import { json } from "@/lib/api";
export async function GET(){return json({status:"ok",service:"world-cup-intelligence-web",timestamp:new Date().toISOString()},{headers:{"cache-control":"no-store"}});}
