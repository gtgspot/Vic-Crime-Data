# Victorian Crime Data MCP Server

A Model Context Protocol (MCP) server that provides access to Victorian crime statistics, geographic data, and trends from 2012-2021.

## Features

- **Crime Statistics**: Query crime incidents by LGA, year, and offence type
- **Trend Analysis**: Analyze crime trends over time with regional filtering
- **Geographic Data**: Access LGA boundaries, police station locations, and population data
- **Search & Fetch**: Company knowledge compatible search and fetch tools
- **Reference Data**: List LGAs, police regions, offence classifications, and available years

## Installation

```bash
cd mcp-server
npm install
```

## Building

```bash
npm run build
```

## Running

### Development mode (with tsx)
```bash
npm run dev
```

### Production mode
```bash
npm run build
npm start
```

## Available Tools

### Search & Fetch (Company Knowledge Compatible)

| Tool | Description |
|------|-------------|
| `search` | Search Victorian crime data for LGAs, regions, offence types, and stations |
| `fetch` | Fetch detailed information about a specific item by ID |

### Crime Statistics

| Tool | Description |
|------|-------------|
| `get_crime_stats_by_lga` | Get crime statistics for a specific LGA |
| `get_crime_trends` | Get crime trends over time with optional filters |
| `compare_lgas` | Compare crime statistics between multiple LGAs |

### Reference Data

| Tool | Description |
|------|-------------|
| `list_lgas` | List all LGAs in Victoria |
| `list_police_regions` | List all police regions with their LGAs |
| `list_offence_types` | List all offence divisions (A-F) |
| `get_available_years` | Get the range of years in the dataset |

### Geographic Data

| Tool | Description |
|------|-------------|
| `get_police_stations` | Get police stations with optional search |
| `get_police_station_counts` | Get station counts per LGA |
| `get_lga_boundary` | Get GeoJSON boundary for an LGA |
| `get_population_data` | Get population data by LGA and year |

## Data Sources

The server reads from the following data files:

- `Data/LGA_Criminal_Incidents_Year_Ending_September_2021.xlsx` - Crime incidents
- `Data/VMFEAT_POLICE_STATION.csv` - Police station locations
- `Data/LGA_boundaries.json` - LGA geographic boundaries
- `Output_data/Population_by_LGA_2012-2021.csv` - Population estimates
- `Output_data/LGA_by_Regions_2012-2021.csv` - LGA to region mapping
- `semantic_layer/dbt_project/seeds/` - Reference data (offence divisions, station counts)

## Data Coverage

- **Years**: 2012-2021 (fiscal years ending September)
- **LGAs**: 79 Local Government Areas
- **Police Regions**: 4 regions (North West Metro, Eastern, Southern Metro, Western)
- **Offence Divisions**: 6 categories (A-F)
- **Police Stations**: 331 stations

## Example Usage

### Search for crime data
```json
{
  "tool": "search",
  "arguments": {
    "query": "Melbourne"
  }
}
```

### Get crime statistics for an LGA
```json
{
  "tool": "get_crime_stats_by_lga",
  "arguments": {
    "lga": "Melbourne",
    "year": 2021
  }
}
```

### Get crime trends
```json
{
  "tool": "get_crime_trends",
  "arguments": {
    "region": "Eastern",
    "start_year": 2018,
    "end_year": 2021
  }
}
```

### Compare LGAs
```json
{
  "tool": "compare_lgas",
  "arguments": {
    "lgas": ["Melbourne", "Greater Geelong", "Ballarat"],
    "year": 2021
  }
}
```

## Configuration for ChatGPT Apps

To use this server with ChatGPT Apps, configure your connector to point to the server's HTTP endpoint. The server includes:

- `text/html+skybridge` MIME type support for widget templates
- `structuredContent` for model-readable responses
- `_meta` for widget-only data (like full GeoJSON boundaries)
- `readOnlyHint` annotations for company knowledge compatibility

## License

MIT
