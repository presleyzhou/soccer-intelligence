import { FootballDataProvider, OpenMeteoProvider, PolymarketProvider } from "@wci/providers";
type JobResult={job:string;status:string;detail?:string};
export async function runScheduledJobs(now=new Date()):Promise<JobResult[]>{
  const context={requestedAt:now.toISOString()};
  const football=new FootballDataProvider(process.env.FOOTBALL_DATA_API_KEY);
  const weather=new OpenMeteoProvider();
  const markets=new PolymarketProvider();
  const health=await Promise.all([football.healthCheck(),weather.healthCheck(),markets.healthCheck()]);
  return [
    {job:"daily-ratings",status:"ready",detail:"Model service batch endpoint"},
    {job:"hourly-markets",status:health[2].status},
    {job:"match-weather",status:health[1].status},
    {job:"fixtures",status:health[0].status},
    {job:"context",status:"ready",detail:context.requestedAt}
  ];
}
if(import.meta.url===`file://${process.argv[1]}`){runScheduledJobs().then((results)=>console.log(JSON.stringify(results,null,2))).catch((error)=>{console.error(error);process.exitCode=1})}
