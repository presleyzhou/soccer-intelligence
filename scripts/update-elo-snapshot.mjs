import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceUrl = "https://www.eloratings.net/World.tsv";
const namesUrl = "https://www.eloratings.net/en.teams.tsv";
const [response, namesResponse] = await Promise.all([fetch(sourceUrl), fetch(namesUrl)]);

if (!response.ok || !namesResponse.ok) {
  throw new Error(`World Football Elo Ratings returned ${response.status}/${namesResponse.status}`);
}

const names = new Map(
  (await namesResponse.text())
    .trim()
    .split("\n")
    .map((line) => {
      const [code, ...teamNames] = line.split("\t");
      return [code, teamNames.filter(Boolean)];
    })
);

const rows = (await response.text())
  .trim()
  .split("\n")
  .map((line) => {
    const columns = line.split("\t");
    return {
      rank: Number(columns[0]),
      code: columns[2],
      rating: Number(columns[3]),
      names: names.get(columns[2]) ?? []
    };
  })
  .filter((row) => Number.isInteger(row.rank) && row.code.length === 2 && Number.isFinite(row.rating));

if (rows.length < 150) {
  throw new Error(`Elo snapshot contained only ${rows.length} valid teams`);
}

const output = {
  source: "World Football Elo Ratings",
  sourceUrl,
  namesUrl,
  fetchedAt: new Date().toISOString(),
  sourceLastModified: response.headers.get("last-modified"),
  teams: rows
};

const outputDirectory = path.join(process.cwd(), "apps/web/public/data");
await mkdir(outputDirectory, { recursive: true });
await writeFile(path.join(outputDirectory, "world-elo.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(`Saved ${rows.length} Elo ratings`);
