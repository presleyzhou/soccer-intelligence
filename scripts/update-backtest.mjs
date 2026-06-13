import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceUrl = "https://raw.githubusercontent.com/martj42/international_results/master/results.csv";
const evaluationStart = "2010-01-01";
const homeAdvantage = 65;

async function fetchWithRetry(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 750));
    }
  }
  throw lastError;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [headers = [], ...values] = rows;
  return values
    .filter((columns) => columns.length === headers.length)
    .map((columns) => Object.fromEntries(headers.map((header, index) => [header, columns[index]])));
}

function normalize(values) {
  const total = values.reduce((sum, value) => sum + value, 0);
  return values.map((value) => value / total);
}

function probabilities(homeRating, awayRating, neutral) {
  const difference = homeRating + (neutral ? 0 : homeAdvantage) - awayRating;
  const decisiveHome = 1 / (1 + 10 ** (-difference / 400));
  const draw = Math.max(0.15, 0.26 * Math.exp(-0.0012 * Math.abs(difference)));
  const [home, normalizedDraw, away] = normalize([(1 - draw) * decisiveHome, draw, (1 - draw) * (1 - decisiveHome)]);
  return { home, draw: normalizedDraw, away };
}

function competitionBucket(tournament) {
  if (tournament === "FIFA World Cup") return "worldCup";
  if (/qualif/i.test(tournament)) return "qualifiers";
  if (/friendly/i.test(tournament)) return "friendlies";
  if (/cup|championship|nations league|gold cup/i.test(tournament)) return "continental";
  return "other";
}

function kFactor(tournament) {
  if (tournament === "FIFA World Cup") return 50;
  if (/qualif|cup|championship|nations league|gold cup/i.test(tournament)) return 40;
  if (/friendly/i.test(tournament)) return 20;
  return 30;
}

function actualOutcome(homeScore, awayScore) {
  if (homeScore > awayScore) return { key: "home", elo: 1, vector: [1, 0, 0] };
  if (homeScore < awayScore) return { key: "away", elo: 0, vector: [0, 0, 1] };
  return { key: "draw", elo: 0.5, vector: [0, 1, 0] };
}

function emptyAggregate() {
  return {
    matches: 0,
    logLoss: 0,
    brier: 0,
    rps: 0,
    correct: 0
  };
}

function addPrediction(aggregate, prediction, actual) {
  const probabilitiesVector = [prediction.home, prediction.draw, prediction.away];
  const actualIndex = actual.key === "home" ? 0 : actual.key === "draw" ? 1 : 2;
  const predictedIndex = probabilitiesVector.indexOf(Math.max(...probabilitiesVector));
  aggregate.matches += 1;
  aggregate.logLoss += -Math.log(Math.max(1e-12, probabilitiesVector[actualIndex]));
  aggregate.brier += probabilitiesVector.reduce(
    (sum, probability, index) => sum + (probability - actual.vector[index]) ** 2,
    0
  );
  const first = probabilitiesVector[0] - actual.vector[0];
  const second = probabilitiesVector[0] + probabilitiesVector[1] - actual.vector[0] - actual.vector[1];
  aggregate.rps += (first ** 2 + second ** 2) / 2;
  aggregate.correct += predictedIndex === actualIndex ? 1 : 0;
}

function finalizeAggregate(aggregate) {
  if (!aggregate.matches) {
    return { matches: 0, logLoss: null, brier: null, rps: null, accuracy: null };
  }
  return {
    matches: aggregate.matches,
    logLoss: aggregate.logLoss / aggregate.matches,
    brier: aggregate.brier / aggregate.matches,
    rps: aggregate.rps / aggregate.matches,
    accuracy: aggregate.correct / aggregate.matches
  };
}

const response = await fetchWithRetry(sourceUrl);
const records = parseCsv(await response.text())
  .map((record) => ({
    date: record.date,
    homeTeam: record.home_team,
    awayTeam: record.away_team,
    homeScore: Number(record.home_score),
    awayScore: Number(record.away_score),
    tournament: record.tournament,
    neutral: record.neutral === "TRUE"
  }))
  .filter(
    (record) =>
      /^\d{4}-\d{2}-\d{2}$/.test(record.date) &&
      record.date <= new Date().toISOString().slice(0, 10) &&
      record.homeTeam &&
      record.awayTeam &&
      Number.isInteger(record.homeScore) &&
      Number.isInteger(record.awayScore)
  )
  .sort((left, right) => left.date.localeCompare(right.date));

const ratings = new Map();
const overall = emptyAggregate();
const byCompetition = new Map();
const byYear = new Map();
const calibration = Array.from({ length: 10 }, (_, index) => ({
  lower: index / 10,
  upper: (index + 1) / 10,
  matches: 0,
  confidence: 0,
  correct: 0
}));

for (const match of records) {
  const homeRating = ratings.get(match.homeTeam) ?? 1500;
  const awayRating = ratings.get(match.awayTeam) ?? 1500;
  const prediction = probabilities(homeRating, awayRating, match.neutral);
  const actual = actualOutcome(match.homeScore, match.awayScore);

  if (match.date >= evaluationStart) {
    addPrediction(overall, prediction, actual);
    const competition = competitionBucket(match.tournament);
    const competitionAggregate = byCompetition.get(competition) ?? emptyAggregate();
    addPrediction(competitionAggregate, prediction, actual);
    byCompetition.set(competition, competitionAggregate);

    const year = match.date.slice(0, 4);
    const yearAggregate = byYear.get(year) ?? emptyAggregate();
    addPrediction(yearAggregate, prediction, actual);
    byYear.set(year, yearAggregate);

    const vector = [prediction.home, prediction.draw, prediction.away];
    const confidence = Math.max(...vector);
    const predictedIndex = vector.indexOf(confidence);
    const actualIndex = actual.key === "home" ? 0 : actual.key === "draw" ? 1 : 2;
    const bin = calibration[Math.min(9, Math.floor(confidence * 10))];
    bin.matches += 1;
    bin.confidence += confidence;
    bin.correct += predictedIndex === actualIndex ? 1 : 0;
  }

  const difference = homeRating + (match.neutral ? 0 : homeAdvantage) - awayRating;
  const expected = 1 / (1 + 10 ** (-difference / 400));
  const goalDifference = Math.abs(match.homeScore - match.awayScore);
  const margin = goalDifference <= 1 ? 1 : Math.log(goalDifference + 1) * (2.2 / (Math.abs(difference) * 0.001 + 2.2));
  const change = kFactor(match.tournament) * margin * (actual.elo - expected);
  ratings.set(match.homeTeam, homeRating + change);
  ratings.set(match.awayTeam, awayRating - change);
}

const calibrationRows = calibration
  .filter((bin) => bin.matches > 0)
  .map((bin) => ({
    lower: bin.lower,
    upper: bin.upper,
    matches: bin.matches,
    meanConfidence: bin.confidence / bin.matches,
    accuracy: bin.correct / bin.matches
  }));
const expectedCalibrationError = calibrationRows.reduce(
  (sum, bin) => sum + (bin.matches / overall.matches) * Math.abs(bin.accuracy - bin.meanConfidence),
  0
);

const output = {
  generatedAt: new Date().toISOString(),
  source: {
    name: "International football results from 1872 to present",
    url: sourceUrl,
    repository: "https://github.com/martj42/international_results"
  },
  methodology: {
    model: "Chronological Elo three-way baseline",
    warmupStart: records[0]?.date ?? null,
    evaluationStart,
    evaluationEnd: records.at(-1)?.date ?? null,
    homeAdvantage,
    leakageControl:
      "Each probability is generated from ratings available before that match; ratings update only after its result."
  },
  overall: {
    ...finalizeAggregate(overall),
    expectedCalibrationError
  },
  byCompetition: Object.fromEntries(
    [...byCompetition.entries()].map(([key, aggregate]) => [key, finalizeAggregate(aggregate)])
  ),
  byYear: [...byYear.entries()].map(([year, aggregate]) => ({
    year,
    ...finalizeAggregate(aggregate)
  })),
  calibration: calibrationRows
};

const outputDirectory = path.join(process.cwd(), "apps/web/public/data");
await mkdir(outputDirectory, { recursive: true });
await writeFile(path.join(outputDirectory, "backtest.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(`Saved rolling backtest for ${overall.matches.toLocaleString()} evaluated matches`);
