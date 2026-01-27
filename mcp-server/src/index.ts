import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import {
  getLgas,
  getPoliceRegions,
  getYears,
  getCrimeStatsByLga,
  getCrimeTrends,
  loadOffenceDivisions,
  loadPoliceStations,
  loadPoliceStationCounts,
  loadPopulationData,
  loadLgaRegionMapping,
  loadLgaBoundaries,
  searchCrimeData,
  fetchDocument,
} from "./data-loader.js";

// Create the MCP server
const server = new McpServer({
  name: "vic-crime-data",
  version: "1.0.0",
});

// ============================================================================
// SEARCH AND FETCH TOOLS (Company Knowledge Compatible)
// ============================================================================

server.tool(
  "search",
  {
    description:
      "Search Victorian crime data for LGAs, police regions, offence types, and police stations. Returns matching results that can be fetched for more details.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (e.g., 'Melbourne', 'assault', 'Eastern')",
        },
      },
      required: ["query"],
    },
    annotations: {
      readOnlyHint: true,
    },
  },
  async ({ query }) => {
    const results = searchCrimeData(query);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            results: results.slice(0, 20).map((r) => ({
              id: r.id,
              title: r.name,
              url: `https://vic-crime-data.example.com/${r.type}/${encodeURIComponent(r.name)}`,
            })),
          }),
        },
      ],
    };
  }
);

server.tool(
  "fetch",
  {
    description:
      "Fetch detailed information about a specific item from Victorian crime data (LGA, region, offence type, or police station).",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The ID of the item to fetch (e.g., 'lga:Melbourne', 'region:Eastern')",
        },
      },
      required: ["id"],
    },
    annotations: {
      readOnlyHint: true,
    },
  },
  async ({ id }) => {
    const doc = fetchDocument(id);

    if (!doc) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: `Document not found: ${id}`,
            }),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            id: doc.id,
            title: doc.title,
            text: doc.text,
            url: doc.url,
            metadata: doc.metadata,
          }),
        },
      ],
    };
  }
);

// ============================================================================
// CRIME STATISTICS TOOLS
// ============================================================================

server.tool(
  "get_crime_stats_by_lga",
  {
    description:
      "Get crime statistics for a specific Local Government Area (LGA) in Victoria. Returns incident counts and rates by year and offence division.",
    inputSchema: {
      type: "object",
      properties: {
        lga: {
          type: "string",
          description: "Name of the Local Government Area (e.g., 'Melbourne', 'Greater Geelong', 'Ballarat')",
        },
        year: {
          type: "number",
          description: "Optional specific year (2012-2021). If not provided, returns all years.",
        },
      },
      required: ["lga"],
    },
    annotations: {
      readOnlyHint: true,
    },
  },
  async ({ lga, year }) => {
    const stats = getCrimeStatsByLga(lga, year);

    if (stats.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No crime statistics found for LGA: ${lga}. Use list_lgas to see available LGAs.`,
          },
        ],
        structuredContent: {
          error: "not_found",
          lga,
          message: "No crime statistics found for this LGA",
        },
      };
    }

    const population = loadPopulationData().filter(
      (p) => p.localGovernmentArea.toLowerCase() === lga.toLowerCase()
    );

    const regionMapping = loadLgaRegionMapping().find(
      (r) => r.localGovernmentArea.toLowerCase() === lga.toLowerCase() && r.year === 2021
    );

    return {
      content: [
        {
          type: "text",
          text: `Crime statistics for ${lga}: ${stats.length} year(s) of data from ${stats[0]?.year} to ${stats[stats.length - 1]?.year}.`,
        },
      ],
      structuredContent: {
        lga,
        policeRegion: regionMapping?.policeRegion,
        yearsAvailable: stats.map((s) => s.year),
        statistics: stats,
        population: population.map((p) => ({
          year: p.year,
          population: p.totalPopulation,
        })),
      },
    };
  }
);

server.tool(
  "get_crime_trends",
  {
    description:
      "Get crime trends over time for Victoria, optionally filtered by LGA or police region. Shows total incidents and average rates by year.",
    inputSchema: {
      type: "object",
      properties: {
        lga: {
          type: "string",
          description: "Optional LGA name to filter by",
        },
        region: {
          type: "string",
          description:
            "Optional police region to filter by (e.g., 'North West Metro', 'Eastern', 'Southern Metro', 'Western')",
        },
        start_year: {
          type: "number",
          description: "Start year for the trend analysis (default: 2012)",
        },
        end_year: {
          type: "number",
          description: "End year for the trend analysis (default: 2021)",
        },
      },
    },
    annotations: {
      readOnlyHint: true,
    },
  },
  async ({ lga, region, start_year, end_year }) => {
    const trends = getCrimeTrends(lga, region, start_year, end_year);

    const filterDescription = [
      lga ? `LGA: ${lga}` : null,
      region ? `Region: ${region}` : null,
      start_year || end_year ? `Years: ${start_year || "2012"}-${end_year || "2021"}` : null,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      content: [
        {
          type: "text",
          text: `Crime trends${filterDescription ? ` for ${filterDescription}` : " across Victoria"}: ${trends.length} years of data.`,
        },
      ],
      structuredContent: {
        filters: {
          lga: lga || null,
          region: region || null,
          startYear: start_year || 2012,
          endYear: end_year || 2021,
        },
        trends,
        summary: {
          totalYears: trends.length,
          overallIncidents: trends.reduce((sum, t) => sum + t.totalIncidents, 0),
          averageAnnualIncidents:
            trends.length > 0
              ? Math.round(trends.reduce((sum, t) => sum + t.totalIncidents, 0) / trends.length)
              : 0,
        },
      },
    };
  }
);

server.tool(
  "compare_lgas",
  {
    description:
      "Compare crime statistics between two or more Local Government Areas for a specific year or range of years.",
    inputSchema: {
      type: "object",
      properties: {
        lgas: {
          type: "array",
          items: { type: "string" },
          description: "List of LGA names to compare (2-5 LGAs)",
        },
        year: {
          type: "number",
          description: "Optional year to compare (2012-2021). If not provided, uses latest year (2021).",
        },
      },
      required: ["lgas"],
    },
    annotations: {
      readOnlyHint: true,
    },
  },
  async ({ lgas, year }) => {
    const targetYear = year || 2021;
    const comparisons = lgas.slice(0, 5).map((lga) => {
      const stats = getCrimeStatsByLga(lga, targetYear);
      const population = loadPopulationData().find(
        (p) => p.localGovernmentArea.toLowerCase() === lga.toLowerCase() && p.year === targetYear
      );
      const stationCount = loadPoliceStationCounts().find(
        (s) => s.localGovernmentArea.toLowerCase() === lga.toLowerCase()
      );

      const yearStats = stats[0];
      return {
        lga,
        year: targetYear,
        population: population?.totalPopulation || null,
        policeStations: stationCount?.policeStationsCount || null,
        totalIncidents: yearStats?.totalIncidents || 0,
        totalRate: yearStats?.totalRate || 0,
        byDivision: yearStats?.byDivision || {},
      };
    });

    return {
      content: [
        {
          type: "text",
          text: `Comparison of ${comparisons.length} LGAs for year ${targetYear}.`,
        },
      ],
      structuredContent: {
        year: targetYear,
        comparisons,
        ranking: {
          byTotalIncidents: [...comparisons].sort((a, b) => b.totalIncidents - a.totalIncidents).map((c) => c.lga),
          byRate: [...comparisons].sort((a, b) => b.totalRate - a.totalRate).map((c) => c.lga),
        },
      },
    };
  }
);

// ============================================================================
// REFERENCE DATA TOOLS
// ============================================================================

server.tool(
  "list_lgas",
  {
    description: "List all Local Government Areas (LGAs) in Victoria with optional filtering by police region.",
    inputSchema: {
      type: "object",
      properties: {
        region: {
          type: "string",
          description: "Optional police region to filter by",
        },
      },
    },
    annotations: {
      readOnlyHint: true,
    },
  },
  async ({ region }) => {
    let lgas = getLgas();

    if (region) {
      const mapping = loadLgaRegionMapping().filter(
        (r) => r.policeRegion.toLowerCase().includes(region.toLowerCase()) && r.year === 2021
      );
      const lgasInRegion = new Set(mapping.map((m) => m.localGovernmentArea));
      lgas = lgas.filter((lga) => lgasInRegion.has(lga));
    }

    return {
      content: [
        {
          type: "text",
          text: `Found ${lgas.length} Local Government Areas${region ? ` in ${region} region` : " in Victoria"}.`,
        },
      ],
      structuredContent: {
        count: lgas.length,
        lgas,
        filter: region || null,
      },
    };
  }
);

server.tool(
  "list_police_regions",
  {
    description: "List all police regions in Victoria with their associated LGAs.",
    inputSchema: {
      type: "object",
      properties: {},
    },
    annotations: {
      readOnlyHint: true,
    },
  },
  async () => {
    const regions = getPoliceRegions();
    const mapping = loadLgaRegionMapping().filter((r) => r.year === 2021);

    const regionDetails = regions.map((region) => {
      const lgasInRegion = mapping
        .filter((m) => m.policeRegion === region)
        .map((m) => m.localGovernmentArea)
        .filter((lga) => lga !== "Total");
      return {
        region,
        lgaCount: lgasInRegion.length,
        lgas: lgasInRegion,
      };
    });

    return {
      content: [
        {
          type: "text",
          text: `Victoria has ${regions.length} police regions.`,
        },
      ],
      structuredContent: {
        count: regions.length,
        regions: regionDetails,
      },
    };
  }
);

server.tool(
  "list_offence_types",
  {
    description: "List all offence divisions/categories used in Victorian crime classification.",
    inputSchema: {
      type: "object",
      properties: {},
    },
    annotations: {
      readOnlyHint: true,
    },
  },
  async () => {
    const divisions = loadOffenceDivisions();

    return {
      content: [
        {
          type: "text",
          text: `Victorian crime is classified into ${divisions.length} offence divisions (A-F).`,
        },
      ],
      structuredContent: {
        count: divisions.length,
        divisions,
      },
    };
  }
);

server.tool(
  "get_available_years",
  {
    description: "Get the range of years available in the Victorian crime dataset.",
    inputSchema: {
      type: "object",
      properties: {},
    },
    annotations: {
      readOnlyHint: true,
    },
  },
  async () => {
    const years = getYears();

    return {
      content: [
        {
          type: "text",
          text: `Crime data is available from ${years[0]} to ${years[years.length - 1]} (${years.length} years).`,
        },
      ],
      structuredContent: {
        years,
        startYear: years[0],
        endYear: years[years.length - 1],
        totalYears: years.length,
      },
    };
  }
);

// ============================================================================
// GEOGRAPHIC DATA TOOLS
// ============================================================================

server.tool(
  "get_police_stations",
  {
    description: "Get police stations in Victoria, optionally filtered by name search.",
    inputSchema: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description: "Optional search term to filter stations by name",
        },
        limit: {
          type: "number",
          description: "Maximum number of stations to return (default: 50)",
        },
      },
    },
    annotations: {
      readOnlyHint: true,
    },
  },
  async ({ search, limit }) => {
    let stations = loadPoliceStations();

    if (search) {
      const lowerSearch = search.toLowerCase();
      stations = stations.filter(
        (s) => s.name.toLowerCase().includes(lowerSearch) || s.nameLabel.toLowerCase().includes(lowerSearch)
      );
    }

    const maxLimit = limit || 50;
    const limitedStations = stations.slice(0, maxLimit);

    return {
      content: [
        {
          type: "text",
          text: `Found ${stations.length} police stations${search ? ` matching "${search}"` : " in Victoria"}${
            stations.length > maxLimit ? ` (showing first ${maxLimit})` : ""
          }.`,
        },
      ],
      structuredContent: {
        totalCount: stations.length,
        returnedCount: limitedStations.length,
        stations: limitedStations.map((s) => ({
          name: s.nameLabel,
          pfi: s.pfi,
        })),
      },
    };
  }
);

server.tool(
  "get_police_station_counts",
  {
    description: "Get the number of police stations in each LGA.",
    inputSchema: {
      type: "object",
      properties: {
        lga: {
          type: "string",
          description: "Optional LGA name to get count for a specific area",
        },
      },
    },
    annotations: {
      readOnlyHint: true,
    },
  },
  async ({ lga }) => {
    let counts = loadPoliceStationCounts();

    if (lga) {
      counts = counts.filter((c) => c.localGovernmentArea.toLowerCase() === lga.toLowerCase());
    }

    const totalStations = counts.reduce((sum, c) => sum + c.policeStationsCount, 0);

    return {
      content: [
        {
          type: "text",
          text: lga
            ? counts.length > 0
              ? `${lga} has ${counts[0].policeStationsCount} police stations.`
              : `No data found for LGA: ${lga}`
            : `Victoria has ${totalStations} police stations across ${counts.length} LGAs.`,
        },
      ],
      structuredContent: {
        totalStations,
        lgaCount: counts.length,
        counts: lga ? counts[0] : counts.sort((a, b) => b.policeStationsCount - a.policeStationsCount),
      },
    };
  }
);

server.tool(
  "get_lga_boundary",
  {
    description: "Get the geographic boundary (GeoJSON) for a specific LGA in Victoria.",
    inputSchema: {
      type: "object",
      properties: {
        lga: {
          type: "string",
          description: "Name of the Local Government Area",
        },
      },
      required: ["lga"],
    },
    annotations: {
      readOnlyHint: true,
    },
  },
  async ({ lga }) => {
    const boundaries = loadLgaBoundaries();
    const boundary = boundaries.find((b) => {
      const name = b.properties?.name || b.properties?.LGA_NAME || "";
      return name.toLowerCase().includes(lga.toLowerCase());
    });

    if (!boundary) {
      return {
        content: [
          {
            type: "text",
            text: `No boundary data found for LGA: ${lga}. Use list_lgas to see available LGAs.`,
          },
        ],
        structuredContent: {
          error: "not_found",
          lga,
        },
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Geographic boundary retrieved for ${boundary.properties?.name || lga}.`,
        },
      ],
      structuredContent: {
        lga: boundary.properties?.name || lga,
        type: boundary.geometry?.type,
        properties: boundary.properties,
      },
      _meta: {
        // Full GeoJSON in _meta to avoid sending large coordinates to the model
        geojson: boundary,
      },
    };
  }
);

server.tool(
  "get_population_data",
  {
    description: "Get population data for Victorian LGAs across years (2012-2021).",
    inputSchema: {
      type: "object",
      properties: {
        lga: {
          type: "string",
          description: "Optional LGA name to get population for a specific area",
        },
        year: {
          type: "number",
          description: "Optional specific year (2012-2021)",
        },
      },
    },
    annotations: {
      readOnlyHint: true,
    },
  },
  async ({ lga, year }) => {
    let population = loadPopulationData();

    if (lga) {
      population = population.filter((p) => p.localGovernmentArea.toLowerCase() === lga.toLowerCase());
    }

    if (year) {
      population = population.filter((p) => p.year === year);
    }

    const totalPopulation = population.reduce((sum, p) => sum + p.totalPopulation, 0);

    return {
      content: [
        {
          type: "text",
          text: lga
            ? `Population data for ${lga}${year ? ` in ${year}` : ""}: ${population.length} records.`
            : `Population data for Victoria${year ? ` in ${year}` : ""}: ${population.length} LGA records.`,
        },
      ],
      structuredContent: {
        filters: { lga: lga || null, year: year || null },
        recordCount: population.length,
        totalPopulation: year ? totalPopulation : undefined,
        data: lga
          ? population.map((p) => ({ year: p.year, population: p.totalPopulation }))
          : year
          ? population
              .sort((a, b) => b.totalPopulation - a.totalPopulation)
              .slice(0, 20)
              .map((p) => ({ lga: p.localGovernmentArea, population: p.totalPopulation }))
          : undefined,
      },
    };
  }
);

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Victorian Crime Data MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
