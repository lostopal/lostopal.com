import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const options = {};
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index]?.replace(/^--/, "");
  const value = process.argv[index + 1];
  if (key && value) options[key] = value;
}

const required = ["cities", "postal", "census", "countries", "admin1", "output"];
for (const key of required) {
  if (!options[key]) throw new Error(`Missing --${key}`);
}

const workspaceRoot = path.dirname(fileURLToPath(import.meta.url));
const expectedOutput = path.join(workspaceRoot, "phase-1-luminous-prototype", "nuncastra", "data", "places");
const outputDirectory = path.resolve(options.output);
if (outputDirectory.toLowerCase() !== expectedOutput.toLowerCase()) {
  throw new Error(`Refusing to write place data outside ${expectedOutput}`);
}

const stateNames = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
  NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  PR: "Puerto Rico", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

function normalize(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function shardKey(value) {
  const first = normalize(value).charAt(0);
  return /[a-z0-9]/.test(first) ? first : "misc";
}

function displayPlaceName(value) {
  return String(value || "")
    .replace(/\s+(city|town|village|borough|municipality|cdp)$/i, "")
    .trim();
}

const countries = new Map();
for (const line of (await readFile(options.countries, "utf8")).split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const fields = line.split("\t");
  if (fields[0] && fields[4]) countries.set(fields[0], fields[4]);
}

const adminAreas = new Map();
for (const line of (await readFile(options.admin1, "utf8")).split(/\r?\n/)) {
  if (!line) continue;
  const fields = line.split("\t");
  if (fields[0]) adminAreas.set(fields[0], fields[2] || fields[1] || "");
}

const shards = new Map();
const seen = new Set();
const counts = { worldCities: 0, censusPlaces: 0, postalCodes: 0 };

function addPlace({ primary, aliases = "", label, latitude, longitude, kind, population = 0, countAs }) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!label || !Number.isFinite(lat) || !Number.isFinite(lon)) return;
  const key = shardKey(primary);
  const identity = `${key}|${normalize(label)}|${lat.toFixed(4)}|${lon.toFixed(4)}`;
  if (seen.has(identity)) return;
  seen.add(identity);
  if (!shards.has(key)) shards.set(key, []);
  shards.get(key).push([
    label,
    Number(lat.toFixed(5)),
    Number(lon.toFixed(5)),
    kind,
    Number(population) || 0,
    normalize(aliases),
  ]);
  counts[countAs] += 1;
}

for (const line of (await readFile(options.cities, "utf8")).split(/\r?\n/)) {
  if (!line) continue;
  const fields = line.split("\t");
  const name = fields[1];
  const asciiName = fields[2];
  const countryCode = fields[8];
  if (!name || countryCode === "US") continue;
  const countryName = countries.get(countryCode) || countryCode;
  const adminName = adminAreas.get(`${countryCode}.${fields[10]}`) || "";
  const parts = [name, adminName, countryName].filter((part, index, values) => part && values.indexOf(part) === index);
  addPlace({
    primary: asciiName || name,
    aliases: [asciiName === name ? "" : asciiName, countryCode, fields[10]].join(" "),
    label: parts.join(", "),
    latitude: fields[4],
    longitude: fields[5],
    kind: 0,
    population: fields[14],
    countAs: "worldCities",
  });
}

const censusLines = (await readFile(options.census, "utf8")).split(/\r?\n/);
for (const line of censusLines.slice(1)) {
  if (!line) continue;
  const fields = line.split("|");
  const stateCode = fields[0];
  const rawName = fields[4];
  const name = displayPlaceName(rawName);
  const stateName = stateNames[stateCode] || stateCode;
  addPlace({
    primary: name,
    aliases: [rawName === name ? "" : rawName, stateCode, "US"].join(" "),
    label: `${name}, ${stateName}, United States`,
    latitude: fields[11],
    longitude: fields[12],
    kind: 1,
    countAs: "censusPlaces",
  });
}

for (const line of (await readFile(options.postal, "utf8")).split(/\r?\n/)) {
  if (!line) continue;
  const fields = line.split("\t");
  const postalCode = fields[1];
  const placeName = fields[2];
  const stateName = fields[3] || stateNames[fields[4]] || fields[4];
  if (!postalCode || !placeName) continue;
  addPlace({
    primary: postalCode,
    aliases: [fields[4], "US"].join(" "),
    label: `${placeName}, ${stateName} ${postalCode}, United States`,
    latitude: fields[9],
    longitude: fields[10],
    kind: 2,
    countAs: "postalCodes",
  });
}

await mkdir(outputDirectory, { recursive: true });
for (const filename of await readdir(outputDirectory)) {
  if (filename.endsWith(".json")) await rm(path.join(outputDirectory, filename));
}

const shardSummary = {};
for (const [key, places] of [...shards.entries()].sort(([left], [right]) => left.localeCompare(right))) {
  places.sort((left, right) => (right[4] - left[4]) || left[0].localeCompare(right[0]));
  const filename = `${key}.json`;
  const filePath = path.join(outputDirectory, filename);
  await writeFile(filePath, JSON.stringify(places), "utf8");
  shardSummary[key] = { records: places.length, bytes: (await stat(filePath)).size };
}

const manifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  records: counts,
  totalRecords: Object.values(counts).reduce((sum, value) => sum + value, 0),
  sources: [
    { name: "GeoNames cities5000", license: "CC BY 4.0", url: "https://www.geonames.org/export/" },
    { name: "GeoNames US postal codes", license: "CC BY 4.0", url: "https://www.geonames.org/export/" },
    { name: "2025 U.S. Census Gazetteer Places", license: "U.S. Government data", url: "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html" },
  ],
  shards: shardSummary,
};
await writeFile(path.join(outputDirectory, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

console.log(`Place index ready: ${manifest.totalRecords} records across ${Object.keys(shardSummary).length} shards.`);
console.log(outputDirectory);
