import { json } from "@/lib/api";
export async function GET(){
  const modelUrl=process.env.MODEL_SERVICE_URL;
  let model="not-configured";
  if(modelUrl){try{const response=await fetch(`${modelUrl}/internal/v1/health`,{signal:AbortSignal.timeout(1200)});model=response.ok?"ready":"degraded";}catch{model="degraded";}}
  return json({status:model==="degraded"?"degraded":"ready",database:process.env.DATABASE_URL?"configured":"not-configured",redis:process.env.REDIS_URL?"configured":"memory-mode",model,football:"public-live-api"},{headers:{"cache-control":"no-store"}});
}
