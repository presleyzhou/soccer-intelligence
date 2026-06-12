import { PolymarketProvider } from "@wci/providers/polymarket";

async function run(): Promise<void> {
  const provider = new PolymarketProvider();
  const health = await provider.healthCheck();
  console.log(JSON.stringify({ service: "wci-worker", job: "provider-health", provider: provider.key, ...health }));
}

void run();
