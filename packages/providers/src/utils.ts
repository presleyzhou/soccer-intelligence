export function impliedProbability(decimalOdds: number): number {
  if (!Number.isFinite(decimalOdds) || decimalOdds <= 1) throw new Error("Decimal odds must be greater than 1");
  return 1 / decimalOdds;
}
export function removeOverround(decimalOdds: readonly number[]): number[] {
  const raw = decimalOdds.map(impliedProbability);
  const total = raw.reduce((sum, value) => sum + value, 0);
  return raw.map((value) => value / total);
}
export async function fetchJson<T>(url: string, init: RequestInit = {}, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { ...init, signal: init.signal ?? AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error(`Provider returned ${response.status}`);
      return await response.json() as T;
    } catch (error) {
      lastError = error;
      if (attempt + 1 < attempts) await new Promise((resolve) => setTimeout(resolve, 200 * 2 ** attempt));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Provider request failed");
}
