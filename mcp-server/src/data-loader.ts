import { readFileSync, existsSync } from "fs";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, "../../..", "Data");
const OUTPUT_DIR = join(__dirname, "../../..", "Output_data");
const SEED_DIR = join(__dirname, "../../..", "semantic_layer/dbt_project/seeds");

// Type definitions
export interface PopulationRecord {
  year: number;
  localGovernmentArea: string;
  totalPopulation: number;
}

export interface LgaRegionRecord {
  year: number;
  policeRegion: string;
  localGovernmentArea: string;
}

export interface PoliceStation {
  pfi: string;
  name: string;
  nameLabel: string;
  state: string;
  featureType: string;
  featureSubtype: string;
}

export interface OffenceDivision {
  code: string;
  name: string;
  description: string;
  isViolentCrime: boolean;
}

export interface PoliceStationCount {
  localGovernmentArea: string;
  policeStationsCount: number;
}

export interface CrimeIncident {
  year: number;
  localGovernmentArea: string;
  policeRegion: string;
  offenceDivision: string;
  offenceSubdivision: string;
  incidentsRecorded: number;
  ratePerPopulation: number;
}

export interface LgaBoundary {
  type: string;
  properties: {
    name: string;
    [key: string]: unknown;
  };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

// Cache for loaded data
const dataCache = new Map<string, unknown>();

function loadCsv<T>(filePath: string, transform: (row: Record<string, string>) => T): T[] {
  const cacheKey = `csv:${filePath}`;
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey) as T[];
  }

  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return [];
  }

  const content = readFileSync(filePath, "utf-8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const result = records.map(transform);
  dataCache.set(cacheKey, result);
  return result;
}

function loadJson<T>(filePath: string): T | null {
  const cacheKey = `json:${filePath}`;
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey) as T;
  }

  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return null;
  }

  const content = readFileSync(filePath, "utf-8");
  const result = JSON.parse(content) as T;
  dataCache.set(cacheKey, result);
  return result;
}

function loadExcelSheet(filePath: string, sheetName?: string): Record<string, string>[] {
  const cacheKey = `xlsx:${filePath}:${sheetName || "0"}`;
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey) as Record<string, string>[];
  }

  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return [];
  }

  const workbook = XLSX.readFile(filePath);
  const sheet = sheetName
    ? workbook.Sheets[sheetName]
    : workbook.Sheets[workbook.SheetNames[0]];

  if (!sheet) {
    console.error(`Sheet not found: ${sheetName}`);
    return [];
  }

  const result = XLSX.utils.sheet_to_json(sheet) as Record<string, string>[];
  dataCache.set(cacheKey, result);
  return result;
}

// Data loaders
export function loadPopulationData(): PopulationRecord[] {
  return loadCsv(
    join(OUTPUT_DIR, "Population_by_LGA_2012-2021.csv"),
    (row) => ({
      year: parseInt(row["Year"], 10),
      localGovernmentArea: row["Local Government Area"],
      totalPopulation: parseInt(row["Total Population"], 10),
    })
  );
}

export function loadLgaRegionMapping(): LgaRegionRecord[] {
  return loadCsv(
    join(OUTPUT_DIR, "LGA_by_Regions_2012-2021.csv"),
    (row) => ({
      year: parseInt(row["Year"], 10),
      policeRegion: row["Police Region"],
      localGovernmentArea: row["Local Government Area"],
    })
  ).filter((r) => r.localGovernmentArea !== "Total");
}

export function loadPoliceStations(): PoliceStation[] {
  return loadCsv(
    join(DATA_DIR, "VMFEAT_POLICE_STATION.csv"),
    (row) => ({
      pfi: row["PFI"],
      name: row["NAME"],
      nameLabel: row["NAME_LABEL"],
      state: row["STATE"],
      featureType: row["FEATURE_TY"],
      featureSubtype: row["FEATURE_SU"],
    })
  );
}

export function loadOffenceDivisions(): OffenceDivision[] {
  return loadCsv(
    join(SEED_DIR, "seed_offence_divisions.csv"),
    (row) => ({
      code: row["offence_division_code"],
      name: row["offence_division_name"],
      description: row["description"],
      isViolentCrime: row["is_violent_crime"].toUpperCase() === "TRUE",
    })
  );
}

export function loadPoliceStationCounts(): PoliceStationCount[] {
  return loadCsv(
    join(SEED_DIR, "seed_police_stations_by_lga.csv"),
    (row) => ({
      localGovernmentArea: row["local_government_area"],
      policeStationsCount: parseInt(row["police_stations_count"], 10),
    })
  );
}

export function loadCrimeIncidents(): CrimeIncident[] {
  const filePath = join(DATA_DIR, "LGA_Criminal_Incidents_Year_Ending_September_2021.xlsx");

  if (!existsSync(filePath)) {
    console.error(`Crime incidents file not found: ${filePath}`);
    return [];
  }

  const cacheKey = `crime:${filePath}`;
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey) as CrimeIncident[];
  }

  const records = loadExcelSheet(filePath);
  const lgaRegions = loadLgaRegionMapping();
  const regionMap = new Map<string, string>();

  lgaRegions.forEach((r) => {
    regionMap.set(`${r.year}:${r.localGovernmentArea}`, r.policeRegion);
  });

  const result = records
    .filter(
      (row) =>
        row["Local Government Area"] &&
        row["Local Government Area"] !== "Total" &&
        row["Local Government Area"] !== "Justice Institutions and Immigration Facilities" &&
        row["Local Government Area"] !== "Unincorporated Vic"
    )
    .map((row) => {
      const year = parseInt(String(row["Year"]), 10);
      const lga = String(row["Local Government Area"]);
      return {
        year,
        localGovernmentArea: lga,
        policeRegion: regionMap.get(`${year}:${lga}`) || regionMap.get(`2021:${lga}`) || "Unknown",
        offenceDivision: String(row["Offence Division"] || ""),
        offenceSubdivision: String(row["Offence Subdivision"] || ""),
        incidentsRecorded: parseInt(String(row["Incidents Recorded"] || "0"), 10) || 0,
        ratePerPopulation: parseFloat(String(row["Rate per 100,000 population"] || "0")) || 0,
      };
    });

  dataCache.set(cacheKey, result);
  return result;
}

export function loadLgaBoundaries(): LgaBoundary[] {
  const filePath = join(DATA_DIR, "LGA_boundaries.json");
  const geojson = loadJson<{ type: string; features: LgaBoundary[] }>(filePath);

  if (!geojson || !geojson.features) {
    return [];
  }

  return geojson.features;
}

// Query functions
export function getLgas(): string[] {
  const population = loadPopulationData();
  const lgas = new Set(population.map((p) => p.localGovernmentArea));
  return Array.from(lgas).sort();
}

export function getPoliceRegions(): string[] {
  const mapping = loadLgaRegionMapping();
  const regions = new Set(mapping.map((m) => m.policeRegion));
  return Array.from(regions).sort();
}

export function getYears(): number[] {
  const population = loadPopulationData();
  const years = new Set(population.map((p) => p.year));
  return Array.from(years).sort((a, b) => a - b);
}

export function getCrimeStatsByLga(
  lga: string,
  year?: number
): {
  year: number;
  totalIncidents: number;
  totalRate: number;
  byDivision: Record<string, { incidents: number; rate: number }>;
}[] {
  const incidents = loadCrimeIncidents();
  const filtered = incidents.filter(
    (i) =>
      i.localGovernmentArea.toLowerCase() === lga.toLowerCase() &&
      (year === undefined || i.year === year)
  );

  const groupedByYear = new Map<
    number,
    { totalIncidents: number; totalRate: number; byDivision: Record<string, { incidents: number; rate: number }> }
  >();

  filtered.forEach((i) => {
    if (!groupedByYear.has(i.year)) {
      groupedByYear.set(i.year, { totalIncidents: 0, totalRate: 0, byDivision: {} });
    }

    const yearData = groupedByYear.get(i.year)!;
    yearData.totalIncidents += i.incidentsRecorded;

    if (i.offenceDivision) {
      if (!yearData.byDivision[i.offenceDivision]) {
        yearData.byDivision[i.offenceDivision] = { incidents: 0, rate: 0 };
      }
      yearData.byDivision[i.offenceDivision].incidents += i.incidentsRecorded;
      yearData.byDivision[i.offenceDivision].rate += i.ratePerPopulation;
    }
  });

  // Calculate total rate as sum of rates by division
  groupedByYear.forEach((data) => {
    data.totalRate = Object.values(data.byDivision).reduce((sum, d) => sum + d.rate, 0);
  });

  return Array.from(groupedByYear.entries())
    .map(([year, data]) => ({ year, ...data }))
    .sort((a, b) => a.year - b.year);
}

export function getCrimeTrends(
  lga?: string,
  region?: string,
  startYear?: number,
  endYear?: number
): {
  year: number;
  totalIncidents: number;
  averageRate: number;
  lgaCount: number;
}[] {
  const incidents = loadCrimeIncidents();
  const years = getYears();
  const effectiveStartYear = startYear || Math.min(...years);
  const effectiveEndYear = endYear || Math.max(...years);

  let filtered = incidents.filter(
    (i) => i.year >= effectiveStartYear && i.year <= effectiveEndYear
  );

  if (lga) {
    filtered = filtered.filter((i) => i.localGovernmentArea.toLowerCase() === lga.toLowerCase());
  }

  if (region) {
    filtered = filtered.filter((i) => i.policeRegion.toLowerCase().includes(region.toLowerCase()));
  }

  const groupedByYear = new Map<number, { incidents: number; rates: number[]; lgas: Set<string> }>();

  filtered.forEach((i) => {
    if (!groupedByYear.has(i.year)) {
      groupedByYear.set(i.year, { incidents: 0, rates: [], lgas: new Set() });
    }

    const yearData = groupedByYear.get(i.year)!;
    yearData.incidents += i.incidentsRecorded;
    yearData.rates.push(i.ratePerPopulation);
    yearData.lgas.add(i.localGovernmentArea);
  });

  return Array.from(groupedByYear.entries())
    .map(([year, data]) => ({
      year,
      totalIncidents: data.incidents,
      averageRate: data.rates.length > 0 ? data.rates.reduce((a, b) => a + b, 0) / data.rates.length : 0,
      lgaCount: data.lgas.size,
    }))
    .sort((a, b) => a.year - b.year);
}

export function searchCrimeData(query: string): {
  type: "lga" | "region" | "offence" | "station";
  name: string;
  description: string;
  id: string;
}[] {
  const results: { type: "lga" | "region" | "offence" | "station"; name: string; description: string; id: string }[] =
    [];
  const lowerQuery = query.toLowerCase();

  // Search LGAs
  const lgas = getLgas();
  lgas
    .filter((lga) => lga.toLowerCase().includes(lowerQuery))
    .forEach((lga) => {
      results.push({
        type: "lga",
        name: lga,
        description: `Local Government Area in Victoria`,
        id: `lga:${lga}`,
      });
    });

  // Search regions
  const regions = getPoliceRegions();
  regions
    .filter((region) => region.toLowerCase().includes(lowerQuery))
    .forEach((region) => {
      results.push({
        type: "region",
        name: region,
        description: `Police Region in Victoria`,
        id: `region:${region}`,
      });
    });

  // Search offence divisions
  const divisions = loadOffenceDivisions();
  divisions
    .filter(
      (d) =>
        d.name.toLowerCase().includes(lowerQuery) ||
        d.description.toLowerCase().includes(lowerQuery) ||
        d.code.toLowerCase() === lowerQuery
    )
    .forEach((d) => {
      results.push({
        type: "offence",
        name: d.name,
        description: d.description,
        id: `offence:${d.code}`,
      });
    });

  // Search police stations
  const stations = loadPoliceStations();
  stations
    .filter((s) => s.name.toLowerCase().includes(lowerQuery) || s.nameLabel.toLowerCase().includes(lowerQuery))
    .slice(0, 20) // Limit station results
    .forEach((s) => {
      results.push({
        type: "station",
        name: s.nameLabel,
        description: `Police Station in Victoria`,
        id: `station:${s.pfi}`,
      });
    });

  return results;
}

export function fetchDocument(id: string): {
  id: string;
  title: string;
  text: string;
  url: string;
  metadata: Record<string, unknown>;
} | null {
  const [type, ...rest] = id.split(":");
  const key = rest.join(":");

  if (type === "lga") {
    const stats = getCrimeStatsByLga(key);
    const population = loadPopulationData().filter(
      (p) => p.localGovernmentArea.toLowerCase() === key.toLowerCase()
    );
    const stationCounts = loadPoliceStationCounts().find(
      (s) => s.localGovernmentArea.toLowerCase() === key.toLowerCase()
    );
    const regionMapping = loadLgaRegionMapping().find(
      (r) => r.localGovernmentArea.toLowerCase() === key.toLowerCase() && r.year === 2021
    );

    const latestStats = stats[stats.length - 1];
    const text = `
# ${key} - Crime Statistics Summary

## Overview
- Police Region: ${regionMapping?.policeRegion || "Unknown"}
- Police Stations: ${stationCounts?.policeStationsCount || "Unknown"}
- Latest Population (2021): ${population.find((p) => p.year === 2021)?.totalPopulation?.toLocaleString() || "Unknown"}

## Latest Crime Statistics (${latestStats?.year || "N/A"})
- Total Incidents: ${latestStats?.totalIncidents?.toLocaleString() || 0}
- Rate per 100,000: ${latestStats?.totalRate?.toFixed(1) || 0}

## Crime by Division
${
  latestStats
    ? Object.entries(latestStats.byDivision)
        .map(([div, data]) => `- ${div}: ${data.incidents.toLocaleString()} incidents`)
        .join("\n")
    : "No data available"
}

## Historical Trends
${stats.map((s) => `- ${s.year}: ${s.totalIncidents.toLocaleString()} incidents`).join("\n")}
    `.trim();

    return {
      id,
      title: `${key} Crime Statistics`,
      text,
      url: `https://vic-crime-data.example.com/lga/${encodeURIComponent(key)}`,
      metadata: {
        type: "lga",
        policeRegion: regionMapping?.policeRegion,
        policeStations: stationCounts?.policeStationsCount,
        latestYear: latestStats?.year,
        totalIncidents: latestStats?.totalIncidents,
      },
    };
  }

  if (type === "region") {
    const trends = getCrimeTrends(undefined, key);
    const mapping = loadLgaRegionMapping().filter(
      (r) => r.policeRegion.toLowerCase().includes(key.toLowerCase()) && r.year === 2021
    );
    const lgaList = [...new Set(mapping.map((m) => m.localGovernmentArea))];

    const latestTrend = trends[trends.length - 1];
    const text = `
# ${key} - Police Region Crime Statistics

## Overview
- Number of LGAs: ${lgaList.length}
- LGAs: ${lgaList.slice(0, 10).join(", ")}${lgaList.length > 10 ? ` and ${lgaList.length - 10} more` : ""}

## Latest Statistics (${latestTrend?.year || "N/A"})
- Total Incidents: ${latestTrend?.totalIncidents?.toLocaleString() || 0}
- Average Rate per 100,000: ${latestTrend?.averageRate?.toFixed(1) || 0}

## Historical Trends
${trends.map((t) => `- ${t.year}: ${t.totalIncidents.toLocaleString()} incidents`).join("\n")}
    `.trim();

    return {
      id,
      title: `${key} Police Region Statistics`,
      text,
      url: `https://vic-crime-data.example.com/region/${encodeURIComponent(key)}`,
      metadata: {
        type: "region",
        lgaCount: lgaList.length,
        latestYear: latestTrend?.year,
        totalIncidents: latestTrend?.totalIncidents,
      },
    };
  }

  if (type === "offence") {
    const divisions = loadOffenceDivisions();
    const division = divisions.find((d) => d.code.toLowerCase() === key.toLowerCase());

    if (!division) {
      return null;
    }

    const text = `
# ${division.name}

## Classification
- Code: ${division.code}
- Category: ${division.name}
- Violent Crime: ${division.isViolentCrime ? "Yes" : "No"}

## Description
${division.description}

## Examples
${
  division.code === "A"
    ? "Homicide, assault, sexual offences, abduction, robbery, stalking, harassment, threatening behaviour"
    : division.code === "B"
    ? "Burglary, theft, motor vehicle theft, fraud, deception, handling stolen goods"
    : division.code === "C"
    ? "Drug dealing, drug trafficking, drug possession, drug cultivation"
    : division.code === "D"
    ? "Weapons offences, disorderly conduct, public nuisance, offensive behaviour"
    : division.code === "E"
    ? "Breach of orders, resist arrest, escape custody, breach of bail"
    : "Traffic offences, regulatory offences, environmental offences"
}
    `.trim();

    return {
      id,
      title: division.name,
      text,
      url: `https://vic-crime-data.example.com/offence/${division.code}`,
      metadata: {
        type: "offence",
        code: division.code,
        isViolentCrime: division.isViolentCrime,
      },
    };
  }

  if (type === "station") {
    const stations = loadPoliceStations();
    const station = stations.find((s) => s.pfi === key);

    if (!station) {
      return null;
    }

    const text = `
# ${station.nameLabel}

## Details
- Name: ${station.name}
- Type: ${station.featureSubtype}
- State: ${station.state}
- PFI: ${station.pfi}
    `.trim();

    return {
      id,
      title: station.nameLabel,
      text,
      url: `https://vic-crime-data.example.com/station/${station.pfi}`,
      metadata: {
        type: "station",
        pfi: station.pfi,
      },
    };
  }

  return null;
}
