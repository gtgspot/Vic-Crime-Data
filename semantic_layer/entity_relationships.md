# Victorian Crime Data - Entity Relationships

This document describes how the five core datasets relate to each other and how they can be joined for analysis.

---

## Entity Relationship Diagram (Text Representation)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CRIMINAL INCIDENT                                       │
│                         (One unique crime event)                                     │
│                                                                                      │
│  ┌─────────────────┐    1:N    ┌──────────────────┐    N:1    ┌─────────────────┐   │
│  │ RECORDED        │◄─────────►│  CRIMINAL        │◄─────────►│ ALLEGED         │   │
│  │ OFFENCES        │           │  INCIDENTS       │           │ OFFENDERS       │   │
│  │ (Individual     │           │  (Event record)  │           │ (Person         │   │
│  │  crime acts)    │           │                  │           │  processed)     │   │
│  └─────────────────┘           └────────┬─────────┘           └─────────────────┘   │
│                                         │                                            │
│                                         │ N:1                                        │
│                                         ▼                                            │
│                                ┌──────────────────┐                                  │
│                                │ VICTIM REPORTS   │                                  │
│                                │ (Persons         │                                  │
│                                │  victimized)     │                                  │
│                                └──────────────────┘                                  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              FAMILY INCIDENTS                                        │
│                    (Separate tracking of family violence)                            │
│                                                                                      │
│  - Overlaps with Criminal Incidents where FV-prefixed offences exist                │
│  - Has its own victim tracking (Affected Family Member - AFM)                       │
│  - Limited time range (2017-2021 vs 2012-2021 for other datasets)                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

                              GEOGRAPHIC HIERARCHY

┌─────────────────┐    Contains    ┌─────────────────┐    Contains    ┌─────────────────┐
│  Police Region  │───────────────►│ Local Government│───────────────►│ Suburb/Town     │
│  (4 regions)    │                │ Area (79 LGAs)  │                │ (Many suburbs)  │
└─────────────────┘                └─────────────────┘                └─────────────────┘
        │                                  │
        │ Contains                         │ Contains
        ▼                                  ▼
┌─────────────────┐                ┌─────────────────┐
│ Police Service  │                │ Police Stations │
│ Area (PSA)      │                │ (331 stations)  │
└─────────────────┘                └─────────────────┘
```

---

## Relationship Definitions

### 1. Criminal Incidents → Recorded Offences (1:N)

**Cardinality:** One Criminal Incident can contain MANY Recorded Offences

**Business Logic:**
- A single criminal incident (e.g., home invasion) may involve multiple offences (burglary, assault, theft)
- Recorded Offences count is always ≥ Criminal Incidents count
- Typical ratio: ~1.35 offences per incident

**Join Keys:**
- `Year`
- `Local Government Area`
- `Offence Division` / `Offence Subdivision` / `Offence Subgroup`

**Example:**
```
Criminal Incident #12345 (Home Invasion in Melbourne)
├── Recorded Offence: B21 Aggravated burglary
├── Recorded Offence: A21 Assault
└── Recorded Offence: B32 Theft from person
```

---

### 2. Criminal Incidents → Alleged Offenders (N:1)

**Cardinality:** MANY Criminal Incidents can involve ONE Alleged Offender (or vice versa)

**Business Logic:**
- One person may be processed as an alleged offender for multiple incidents
- One incident may have multiple alleged offenders
- The count represents "processing events" not unique individuals

**Join Keys:**
- `Year`
- `Local Government Area`
- `Police Region`

**Analytical Considerations:**
- Alleged Offender counts < Criminal Incidents (not all incidents have identified offenders)
- Unsolved incidents have no associated alleged offenders

---

### 3. Criminal Incidents → Victim Reports (N:1)

**Cardinality:** MANY Incidents can affect ONE Victim (person victimized multiple times)

**Business Logic:**
- One person may be a victim in multiple incidents
- One incident may have multiple victims
- Not all crime types have victims (e.g., drug offences)

**Join Keys:**
- `Year`
- `Local Government Area`
- `Offence Division`

**Applicable Offence Types:**
- "A Crimes against the person" - Primary victim-based crimes
- Some property crimes where individual victims are identified

---

### 4. Criminal Incidents → Family Incidents (Subset)

**Cardinality:** Family Incidents are a SUBSET of Criminal Incidents

**Business Logic:**
- Family Incidents represent incidents where the relationship between parties meets family violence criteria
- Criminal Incidents with "FV" prefix offences overlap with Family Incidents
- Family Incidents dataset provides additional demographic detail about affected family members

**Join Strategy:**
- Cannot directly join (different aggregation levels)
- Compare trends at LGA/Region level
- Note: Family Incidents data only available 2017-2021

---

### 5. Geographic Relationships

#### 5.1 Police Region → Local Government Area (1:N)

**Cardinality:** One Police Region contains MANY LGAs

| Police Region | LGA Count | Example LGAs |
|--------------|-----------|--------------|
| 1 North West Metro | 14 | Melbourne, Brimbank, Hume, Wyndham |
| 2 Eastern | 25 | Boroondara, Knox, Latrobe, Wodonga |
| 3 Southern Metro | 10 | Casey, Frankston, Greater Dandenong |
| 4 Western | 30 | Ballarat, Greater Geelong, Mildura |

**Join File:** `Output_data/LGA_by_Regions_2012-2021.csv`

#### 5.2 Local Government Area → Suburb/Town (1:N)

**Cardinality:** One LGA contains MANY suburbs

**Join via:** Criminal Incidents Table 03

#### 5.3 Local Government Area → Police Stations (1:N)

**Cardinality:** One LGA contains MANY police stations (0 to 10+)

**Join File:** `Output_data/Number_of_police_stations_in_each_LGA_2021.csv`

---

## Common Join Patterns

### Pattern 1: Full Crime Picture by LGA

Join all core datasets at LGA level to get comprehensive crime statistics:

```sql
SELECT
    ci.Year,
    ci."Local Government Area",
    ci."Incidents Recorded" AS criminal_incidents,
    ro."Offence Count" AS recorded_offences,
    ao."Alleged Offender Incidents" AS alleged_offenders,
    vr."Victim Reports" AS victim_reports
FROM criminal_incidents_table01 ci
LEFT JOIN recorded_offences_table01 ro
    ON ci.Year = ro.Year
    AND ci."Local Government Area" = ro."Local Government Area"
LEFT JOIN alleged_offenders_table01 ao
    ON ci.Year = ao.Year
    AND ci."Local Government Area" = ao."Local Government Area"
LEFT JOIN victim_reports_table01 vr
    ON ci.Year = vr.Year
    AND ci."Local Government Area" = vr."Local Government Area"
WHERE ci."Local Government Area" != 'Total'
```

### Pattern 2: Crime Rate Analysis with Population

```sql
SELECT
    p.Year,
    p."Local Government Area",
    p."Total Population",
    ci."Incidents Recorded",
    (ci."Incidents Recorded" * 100000.0 / p."Total Population") AS calculated_rate
FROM population_by_lga p
JOIN criminal_incidents_table01 ci
    ON p.Year = ci.Year
    AND p."Local Government Area" = ci."Local Government Area"
```

### Pattern 3: Regional Analysis with Police Resources

```sql
SELECT
    r."Police Region",
    r.Year,
    COUNT(DISTINCT r."Local Government Area") AS lga_count,
    SUM(ps."Police Stations in LGA") AS total_stations,
    SUM(ci."Incidents Recorded") AS total_incidents
FROM lga_by_regions r
JOIN police_stations ps
    ON r."Local Government Area" = ps."Local Government Area"
JOIN criminal_incidents_table01 ci
    ON r.Year = ci.Year
    AND r."Local Government Area" = ci."Local Government Area"
GROUP BY r."Police Region", r.Year
```

### Pattern 4: Family Violence Focus

```sql
-- Compare FV vs Non-FV assault incidents
SELECT
    Year,
    "Local Government Area",
    SUM(CASE WHEN "Offence Subgroup" LIKE '%FV%' THEN "Incidents Recorded" ELSE 0 END) AS fv_incidents,
    SUM(CASE WHEN "Offence Subgroup" LIKE '%Non-FV%' THEN "Incidents Recorded" ELSE 0 END) AS non_fv_incidents
FROM criminal_incidents_table02
WHERE "Offence Subdivision" LIKE '%Assault%'
GROUP BY Year, "Local Government Area"
```

---

## Data Lineage

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         SOURCE: Victoria Police                           │
│                    Crime Statistics Agency Data                          │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         RAW DATA (Data/ folder)                          │
│  • LGA_Criminal_Incidents_Year_Ending_September_2021.xlsx                │
│  • LGA_Recorded_Offences_Year_Ending_September_2021.xlsx                 │
│  • LGA_Alleged_Offenders_Year_Ending_September_2021.xlsx                 │
│  • LGA_Family_Incidents_Year_Ending_September_2021.xlsx                  │
│  • LGA_Victim_Reports_Year_Ending_September_2021.xlsx                    │
│  • VMFEAT_POLICE_STATION.csv (from data.vic.gov.au)                      │
│  • LGA_boundaries.json (from data.gov.au)                                │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    TRANSFORMATION (Scripts/ notebooks)                    │
│  • LGA_criminal_incidents_Output_files_generator.ipynb                   │
│  • Various analysis notebooks                                             │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     DERIVED DATA (Output_data/ folder)                    │
│  • Population_by_LGA_2012-2021.csv                                       │
│  • Population_by_Regions_2012-2021.csv                                   │
│  • LGA_by_Regions_2012-2021.csv                                          │
│  • Number_of_police_stations_in_each_LGA_2021.csv                        │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Key Business Rules

1. **Incident vs Offence Counting:**
   - Criminal Incidents = Unique events
   - Recorded Offences = Individual crimes within events
   - Always: Recorded Offences ≥ Criminal Incidents

2. **Rate Calculations:**
   - Rate = (Count / Population) × 100,000
   - Enables fair comparison between high and low population areas

3. **Charge Status Categories:**
   - "Charges" = Investigation resulted in charges filed
   - "No charges" = Investigation closed without charges
   - "Unsolved" = Investigation ongoing or cold case

4. **Family Violence Identification:**
   - Offence codes with "FV" prefix indicate family violence context
   - Family Incidents dataset provides victim (AFM) demographics

5. **Geographic Exclusions:**
   - "Justice Institutions and Immigration Facilities" - Not a geographic area
   - "Unincorporated Vic" - Areas outside LGA boundaries
   - "Total" rows - Aggregated summaries to exclude in analysis

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-27 | Initial entity relationship documentation |
