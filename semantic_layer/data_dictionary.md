# Victorian Crime Data - Data Dictionary

This document provides comprehensive definitions for all columns across the five core datasets in the Victorian Crime Statistics repository.

---

## Table of Contents

1. [Criminal Incidents Dataset](#1-criminal-incidents-dataset)
2. [Recorded Offences Dataset](#2-recorded-offences-dataset)
3. [Alleged Offenders Dataset](#3-alleged-offenders-dataset)
4. [Family Incidents Dataset](#4-family-incidents-dataset)
5. [Victim Reports Dataset](#5-victim-reports-dataset)
6. [Supporting Datasets](#6-supporting-datasets)

---

## 1. Criminal Incidents Dataset

**Source File:** `Data/LGA_Criminal_Incidents_Year_Ending_September_2021.xlsx`

**Description:** Contains records of criminal incidents reported to Victoria Police, aggregated by Local Government Area (LGA). A criminal incident is a unique event that may involve one or more offences.

### Table 01 - Incidents by Police Region and LGA

| Column Name | Data Type | Business Definition | Example Values |
|-------------|-----------|---------------------|----------------|
| `Year` | Integer | The fiscal year ending in September when the incident was recorded | 2012, 2021 |
| `Year ending` | String | The month marking the end of the fiscal year | "September" |
| `Police Region` | String | Victoria Police administrative region responsible for the area | "1 North West Metro", "2 Eastern", "3 Southern Metro", "4 Western" |
| `Local Government Area` | String | The LGA where the incident occurred (79 LGAs in Victoria) | "Melbourne", "Casey", "Ballarat" |
| `Incidents Recorded` | Integer | Total count of unique criminal incidents recorded in the LGA | 5666, 13161 |
| `Rate per 100,000 population` | Float | Incidents normalized by population, enabling comparison across different-sized LGAs | 4310.78, 6488.33 |

### Table 02 - Incidents by Offence Type

| Column Name | Data Type | Business Definition | Example Values |
|-------------|-----------|---------------------|----------------|
| `Year` | Integer | Fiscal year ending September | 2012, 2021 |
| `Year ending` | String | End month of fiscal year | "September" |
| `Police Service Area` | String | Police Service Area (sub-region of Police Region) | "Ballarat" |
| `Local Government Area` | String | LGA where incident occurred | "Ballarat" |
| `Offence Division` | String | Highest-level crime category (A-F) | "A Crimes against the person", "B Property and deception offences" |
| `Offence Subdivision` | String | Mid-level crime category within a division | "A10 Homicide and related offences", "A20 Assault and related offences" |
| `Offence Subgroup` | String | Most granular crime classification | "A211 FV Serious assault", "A212 Non-FV Serious assault" |
| `Incidents Recorded` | Integer | Count of incidents for this offence type | 4, 140, 257 |
| `PSA Rate per 100,000 population` | Float | Rate per 100K at Police Service Area level | 3.31, 115.79 |
| `LGA Rate per 100,000 population` | Float | Rate per 100K at LGA level | 3.53, 123.51 |

### Table 03 - Incidents by Suburb

| Column Name | Data Type | Business Definition | Example Values |
|-------------|-----------|---------------------|----------------|
| `Year` | Integer | Fiscal year ending September | 2012, 2021 |
| `Local Government Area` | String | LGA containing the suburb | "Alpine", "Melbourne" |
| `Suburb/Town Name` | String | Specific suburb or town within the LGA | "Dederang", "Carlton" |

### Table 04 - Incidents by Charge Status

| Column Name | Data Type | Business Definition | Example Values |
|-------------|-----------|---------------------|----------------|
| `Year` | Integer | Fiscal year ending September | 2012, 2021 |
| `Local Government Area` | String | LGA where incident occurred | "Melbourne", "Casey" |
| `Offence Division` | String | Crime category | "A Crimes against the person" |
| `Charge Status` | String | Resolution status of the incident | "Charges", "No charges", "Unsolved" |
| `Incidents Recorded` | Integer | Count of incidents with this charge status | 1500, 2300 |

### Table 05 - Incidents by Premises Type

| Column Name | Data Type | Business Definition | Example Values |
|-------------|-----------|---------------------|----------------|
| `Year` | Integer | Fiscal year ending September | 2012, 2021 |
| `Premises Type` | String | Category of location where incident occurred | "Residential", "Retail", "Community", "Transport" |
| `Incidents Recorded` | Integer | Count of incidents at this premises type | 50000, 30000 |

---

## 2. Recorded Offences Dataset

**Source File:** `Data/LGA_Recorded_Offences_Year_Ending_September_2021.xlsx`

**Description:** Contains counts of individual offences recorded by Victoria Police. One criminal incident may contain multiple offences (e.g., an assault incident may include assault AND property damage offences).

### Table 01 - Offences by Police Region and LGA

| Column Name | Data Type | Business Definition | Example Values |
|-------------|-----------|---------------------|----------------|
| `Year` | Integer | Fiscal year ending September | 2012, 2021 |
| `Year ending` | String | End month of fiscal year | "September" |
| `Police Region` | String | Victoria Police administrative region | "1 North West Metro", "4 Western" |
| `Local Government Area` | String | LGA where offence was recorded | "Melbourne", "Geelong" |
| `Offence Count` | Integer | Total number of individual offences recorded | 8500, 15000 |
| `Rate per 100,000 population` | Float | Offences normalized by population | 5643.66, 7200.50 |

### Table 02 - Offences by Offence Type

| Column Name | Data Type | Business Definition | Example Values |
|-------------|-----------|---------------------|----------------|
| `Year` | Integer | Fiscal year ending September | 2012, 2021 |
| `Local Government Area` | String | LGA where offence occurred | "Melbourne" |
| `Offence Division` | String | High-level crime category | "A Crimes against the person" |
| `Offence Subdivision` | String | Mid-level crime category | "A20 Assault and related offences" |
| `Offence Subgroup` | String | Granular crime type | "A211 FV Serious assault" |
| `Offence Count` | Integer | Number of offences of this type | 150, 500 |
| `Rate per 100,000 population` | Float | Offence rate per 100K population | 45.5, 120.3 |

---

## 3. Alleged Offenders Dataset

**Source File:** `Data/LGA_Alleged_Offenders_Year_Ending_September_2021.xlsx`

**Description:** Contains counts of alleged offender incidents - instances where an individual was processed by police in connection with a criminal incident. One person may be counted multiple times if involved in multiple incidents.

### Table 01 - Alleged Offenders by Police Region and LGA

| Column Name | Data Type | Business Definition | Example Values |
|-------------|-----------|---------------------|----------------|
| `Year` | Integer | Fiscal year ending September | 2012, 2021 |
| `Year ending` | String | End month of fiscal year | "September" |
| `Police Region` | String | Victoria Police administrative region | "1 North West Metro", "2 Eastern" |
| `Local Government Area` | String | LGA where alleged offender was processed | "Melbourne", "Ballarat" |
| `Alleged Offender Incidents` | Integer | Count of alleged offender processing events | 3500, 7800 |
| `Rate per 100,000 population` | Float | Alleged offender rate per 100K population | 2100.5, 3800.2 |

### Table 02 - Alleged Offenders by Demographics

| Column Name | Data Type | Business Definition | Example Values |
|-------------|-----------|---------------------|----------------|
| `Year` | Integer | Fiscal year ending September | 2012, 2021 |
| `Local Government Area` | String | LGA where alleged offender was processed | "Melbourne" |
| `Age Group` | String | Age bracket of the alleged offender | "10-17 years", "18-24 years", "25-34 years" |
| `Sex` | String | Gender of the alleged offender | "Male", "Female" |
| `Alleged Offender Incidents` | Integer | Count for this demographic group | 500, 1200 |

---

## 4. Family Incidents Dataset

**Source File:** `Data/LGA_Family_Incidents_Year_Ending_September_2021.xlsx`

**Description:** Contains records of family violence incidents reported to Victoria Police. Family incidents involve violence or threats between family members or intimate partners.

**Note:** This dataset only covers 2017-2021 (5 years), unlike other datasets which cover 2012-2021 (10 years).

### Table 01 - Family Incidents by Police Region and LGA

| Column Name | Data Type | Business Definition | Example Values |
|-------------|-----------|---------------------|----------------|
| `Year` | Integer | Fiscal year ending September | 2017, 2021 |
| `Year ending` | String | End month of fiscal year | "September" |
| `Police Region` | String | Victoria Police administrative region | "1 North West Metro", "3 Southern Metro" |
| `Local Government Area` | String | LGA where family incident was recorded | "Casey", "Hume" |
| `Family Incidents` | Integer | Count of family violence incidents | 5134, 4227 |
| `Rate per 100,000 population` | Float | Family incident rate per 100K population | 1408.12, 1752.57 |

### Table 02 - Family Incidents by Relationship Type

| Column Name | Data Type | Business Definition | Example Values |
|-------------|-----------|---------------------|----------------|
| `Year` | Integer | Fiscal year ending September | 2017, 2021 |
| `Local Government Area` | String | LGA where incident occurred | "Casey" |
| `Relationship Type` | String | Relationship between parties involved | "Intimate partner", "Parent/child", "Sibling" |
| `Family Incidents` | Integer | Count for this relationship type | 3500, 800 |

### Table 03 - Family Incidents by Affected Family Member (AFM) Demographics

| Column Name | Data Type | Business Definition | Example Values |
|-------------|-----------|---------------------|----------------|
| `Year` | Integer | Fiscal year ending September | 2017, 2021 |
| `Year ending` | String | End month of fiscal year | "September" |
| `Local Government Area` | String | LGA where incident occurred | "Casey" |
| `AFM Sex` | String | Gender of the Affected Family Member (victim) | "Females", "Males" |
| `AFM Counter` | Integer | Count of affected family members of this gender | 3820, 1311 |

---

## 5. Victim Reports Dataset

**Source File:** `Data/LGA_Victim_Reports_Year_Ending_September_2021.xlsx`

**Description:** Contains counts of victim reports - instances where a person was recorded as a victim of a crime. One person may be counted multiple times if victimized in multiple incidents.

### Table 01 - Victim Reports by Police Region and LGA

| Column Name | Data Type | Business Definition | Example Values |
|-------------|-----------|---------------------|----------------|
| `Year` | Integer | Fiscal year ending September | 2012, 2021 |
| `Year ending` | String | End month of fiscal year | "September" |
| `Police Region` | String | Victoria Police administrative region | "1 North West Metro" |
| `Local Government Area` | String | LGA where victim was recorded | "Melbourne" |
| `Victim Reports` | Integer | Count of victim reports | 5000, 8500 |
| `Rate per 100,000 population` | Float | Victim rate per 100K population | 3500.5, 4200.3 |

### Table 02 - Victim Reports by Offence Type

| Column Name | Data Type | Business Definition | Example Values |
|-------------|-----------|---------------------|----------------|
| `Year` | Integer | Fiscal year ending September | 2012, 2021 |
| `Local Government Area` | String | LGA where victim was recorded | "Melbourne" |
| `Offence Division` | String | Type of offence the victim experienced | "A Crimes against the person" |
| `Victim Reports` | Integer | Count of victim reports for this offence type | 2500 |

### Table 03 - Victim Reports by Age Group

| Column Name | Data Type | Business Definition | Example Values |
|-------------|-----------|---------------------|----------------|
| `Year` | Integer | Fiscal year ending September | 2012, 2021 |
| `Year ending` | String | End month of fiscal year | "September" |
| `Local Government Area` | String | LGA where victim was recorded | "Alpine", "Melbourne" |
| `Age Group` | String | Age bracket of the victim | "00 - 24 years", "25 - 34 years", "35 - 44 years", "45 - 54 years", "55 + years" |
| `Victim Reports` | Integer | Count of victim reports in this age group | 42, 103, 500 |

---

## 6. Supporting Datasets

### 6.1 Police Station Locations

**Source File:** `Data/VMFEAT_POLICE_STATION.csv`

**Description:** Contains geographic and administrative information about all police stations in Victoria.

| Column Name | Data Type | Business Definition | Example Values |
|-------------|-----------|---------------------|----------------|
| `PFI` | Integer | Primary Feature Identifier (unique ID) | 134710, 134827 |
| `FEATURE_ID` | Integer | Feature identifier in the spatial database | 134710 |
| `FEATURE_TY` | String | Type of facility | "emergency facility" |
| `FEATURE_SU` | String | Subtype of facility | "police station" |
| `NAME` | String | Official name of the police station (uppercase) | "ALEXANDRA POLICE STATION" |
| `NAME_LABEL` | String | Display name (title case) | "Alexandra Police Station" |
| `STATE` | String | State/territory code | "VIC" |
| `CREATE_DAT` | DateTime | Date record was created | "2009-05-21" |
| `CREATE_DA0` | DateTime | Date record was last updated | "2021-04-22" |

### 6.2 LGA Boundaries

**Source File:** `Data/LGA_boundaries.json`

**Description:** GeoJSON file containing polygon boundaries for all 79 Victorian Local Government Areas.

| Property | Data Type | Business Definition | Example Values |
|----------|-----------|---------------------|----------------|
| `type` | String | GeoJSON feature type | "Feature" |
| `geometry` | Object | Polygon coordinates defining the LGA boundary | [coordinates array] |
| `properties.lga_name` | String | Name of the Local Government Area | "Melbourne", "Casey" |

### 6.3 Population Data (Derived)

**Source File:** `Output_data/Population_by_LGA_2012-2021.csv`

**Description:** Population estimates by LGA and year, derived from crime rate calculations.

| Column Name | Data Type | Business Definition | Example Values |
|-------------|-----------|---------------------|----------------|
| `Year` | Integer | Calendar year | 2012, 2021 |
| `Local Government Area` | String | LGA name | "Melbourne", "Casey" |
| `Total Population` | Integer | Estimated population of the LGA | 113350, 364600 |

### 6.4 LGA to Region Mapping

**Source File:** `Output_data/LGA_by_Regions_2012-2021.csv`

**Description:** Maps each LGA to its corresponding Police Region.

| Column Name | Data Type | Business Definition | Example Values |
|-------------|-----------|---------------------|----------------|
| `Year` | Integer | Calendar year | 2012, 2021 |
| `Police Region` | String | Victoria Police administrative region | "1 North West Metro", "4 Western" |
| `Local Government Area` | String | LGA name | "Melbourne", "Ballarat" |

---

## Data Quality Notes

1. **Population Estimates**: Population figures are derived from crime rate data (Incidents / Rate * 100,000) and may contain small rounding variations.

2. **Family Incidents Time Range**: Family Incidents data only covers 2017-2021, while other datasets cover 2012-2021.

3. **LGA Changes**: Some LGAs may have boundary changes over the 10-year period. Data is aligned to 2021 LGA boundaries where possible.

4. **"Total" Rows**: Many tables contain aggregated "Total" rows that should be filtered out when performing LGA-level analysis.

5. **Special Categories**:
   - "Justice Institutions and Immigration Facilities" - Not a geographic LGA
   - "Unincorporated Vic" - Areas outside defined LGAs

6. **FV Prefix**: Offence codes prefixed with "FV" indicate Family Violence related offences (e.g., "A211 FV Serious assault" vs "A212 Non-FV Serious assault").

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-27 | Initial data dictionary creation |
