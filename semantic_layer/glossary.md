# Victorian Crime Data - Standardized Terminology Glossary

This glossary provides standardized definitions for all terms used across the Victorian Crime Statistics datasets. Use these definitions to ensure consistent interpretation and communication of data.

---

## Table of Contents

1. [Core Measurement Terms](#core-measurement-terms)
2. [Geographic Terms](#geographic-terms)
3. [Offence Classification Terms](#offence-classification-terms)
4. [Status and Resolution Terms](#status-and-resolution-terms)
5. [Demographic Terms](#demographic-terms)
6. [Rate and Statistical Terms](#rate-and-statistical-terms)
7. [Family Violence Specific Terms](#family-violence-specific-terms)
8. [Abbreviations Reference](#abbreviations-reference)

---

## Core Measurement Terms

### Criminal Incident
**Definition:** A unique criminal event recorded by Victoria Police that may involve one or more offences committed at a particular time and place.

**Synonyms to AVOID:** crime, offence (use specifically), case

**Usage Example:** "Melbourne recorded 15,000 criminal incidents in 2021."

---

### Recorded Offence
**Definition:** An individual criminal act recorded by Victoria Police. Multiple recorded offences can occur within a single criminal incident.

**Synonyms to AVOID:** incident (use specifically), crime count

**Usage Example:** "The incident involved three recorded offences: assault, theft, and property damage."

**Relationship:** Recorded Offences ≥ Criminal Incidents (always)

---

### Alleged Offender Incident
**Definition:** An instance where a person was processed by Victoria Police in connection with a criminal incident. The same individual can be counted multiple times if involved in separate incidents.

**Synonyms to AVOID:** arrest, criminal, perpetrator

**Usage Example:** "There were 172,671 alleged offender incidents in 2021."

**Note:** "Alleged" indicates the person has not been convicted and is presumed innocent.

---

### Victim Report
**Definition:** A record of a person being identified as a victim of a crime. One person may be counted multiple times if victimized in multiple incidents.

**Synonyms to AVOID:** victim count (ambiguous), complainant

**Usage Example:** "Victim reports for the 25-34 age group totaled 52,000."

---

### Family Incident
**Definition:** An incident recorded by Victoria Police where the relationship between the affected parties meets the criteria for family violence under Victorian law.

**Synonyms to AVOID:** domestic violence (less precise), DV incident

**Usage Example:** "Family incidents in Casey LGA increased by 3.9% from 2020 to 2021."

---

## Geographic Terms

### Local Government Area (LGA)
**Definition:** A geographic administrative division in Victoria governed by a local council. Victoria has 79 LGAs.

**Synonyms to AVOID:** council area, municipality (less common), district

**Standard Format:** Title Case (e.g., "Greater Geelong", "Yarra Ranges")

**Usage Example:** "The LGA with highest crime rate was Melbourne."

---

### Police Region
**Definition:** One of four Victoria Police administrative regions used for operational management.

**Standard Values:**
| Code | Full Name | Alternative |
|------|-----------|-------------|
| 1 | 1 North West Metro | North West Metropolitan |
| 2 | 2 Eastern | Eastern Region |
| 3 | 3 Southern Metro | Southern Metropolitan |
| 4 | 4 Western | Western Region |

**Usage Example:** "North West Metro region recorded the highest number of incidents."

---

### Police Service Area (PSA)
**Definition:** A sub-region within a Police Region, typically corresponding to a police station's area of responsibility.

**Relationship:** Police Region → Police Service Area → Suburb/Town

---

### Suburb/Town
**Definition:** The smallest geographic unit in the crime data hierarchy, representing a specific locality within an LGA.

**Note:** Multiple suburbs exist within each LGA.

---

### Unincorporated Victoria
**Definition:** Areas of Victoria that fall outside the boundaries of any Local Government Area, typically remote or sparsely populated regions.

**Usage:** Exclude from standard LGA analysis; treat as special category.

---

## Offence Classification Terms

### Offence Division
**Definition:** The highest level of crime classification in the Victorian crime hierarchy. Six divisions exist (A-F).

**Standard Values:**

| Code | Division Name | Description |
|------|--------------|-------------|
| A | Crimes against the person | Violence, assault, sexual offences, homicide |
| B | Property and deception offences | Theft, burglary, fraud, arson |
| C | Drug offences | Drug use, possession, trafficking |
| D | Public order and security offences | Weapons, disorderly conduct |
| E | Justice procedures offences | Breach of orders, obstruction |
| F | Other offences | Transport, regulatory, miscellaneous |

---

### Offence Subdivision
**Definition:** The mid-level crime classification, providing more detail within an Offence Division.

**Format:** "[Division Code][Number] [Description]"

**Examples:**
- A10 Homicide and related offences
- A20 Assault and related offences
- B20 Burglary/Break and enter

---

### Offence Subgroup
**Definition:** The most granular level of crime classification, providing specific offence types.

**Format:** "[Division Code][Subdivision Number][Subgroup Number] [Description]"

**Examples:**
- A211 FV Serious assault (Family Violence context)
- A212 Non-FV Serious assault (Non-Family Violence)
- B211 Aggravated burglary

---

### FV (Family Violence) Prefix
**Definition:** Indicator that an offence occurred within a family violence context. Applied to assault and related offences.

**Usage:** "FV" appears in offence subgroup names to distinguish family violence from non-family violence offences.

**Examples:**
- A211 **FV** Serious assault
- A231 **FV** Common assault
- A212 **Non-FV** Serious assault

---

## Status and Resolution Terms

### Charge Status
**Definition:** The resolution status of a criminal incident investigation.

**Standard Values:**

| Status | Definition |
|--------|------------|
| **Charges** | Investigation completed with charges filed against one or more alleged offenders |
| **No charges** | Investigation completed but no charges filed (e.g., insufficient evidence, victim declined to proceed) |
| **Unsolved** | Investigation ongoing or closed without resolution |

---

### Incidents Recorded
**Definition:** The count of criminal incidents logged in Victoria Police systems for a given period and location.

**Note:** Represents reported crime only; unreported crime is not captured.

---

### Rate per 100,000 Population
**Definition:** A standardized metric showing the number of incidents/offences/victims per 100,000 residents, enabling comparison across areas with different populations.

**Formula:** `(Count / Population) × 100,000`

**Usage Example:** "Melbourne's crime rate was 14,600 per 100,000 population, compared to 2,500 in Alpine."

---

## Demographic Terms

### Age Group
**Definition:** Standardized age brackets used for demographic analysis.

**Standard Values (Victim Reports):**
- 00 - 24 years
- 25 - 34 years
- 35 - 44 years
- 45 - 54 years
- 55 + years

**Standard Values (Alleged Offenders):**
- 10-17 years (Youth)
- 18-24 years
- 25-34 years
- 35-44 years
- 45+ years

---

### Sex / Gender
**Definition:** The recorded gender of alleged offenders or victims.

**Standard Values:**
- Male / Males
- Female / Females

**Note:** Non-binary or other gender categories may not be captured in historical data.

---

## Rate and Statistical Terms

### Year (Fiscal)
**Definition:** The 12-month period ending in September of the stated year.

**Example:** "Year 2021" = October 2020 to September 2021

**Standard Format:** Four-digit year (e.g., 2021, not 21)

---

### Year Ending
**Definition:** The month marking the end of the fiscal reporting period.

**Standard Value:** "September" (for all Victorian crime data)

---

### Population
**Definition:** Estimated resident population of an LGA, used for rate calculations.

**Source:** Derived from crime rate data in this dataset (not official ABS figures)

**Calculation:** `Incidents Recorded / (Rate per 100,000 / 100,000)`

---

### Percentage Change
**Definition:** The relative change between two time periods, expressed as a percentage.

**Formula:** `((New Value - Old Value) / Old Value) × 100`

**Usage Example:** "Crime decreased by 12.6% from 2020 to 2021."

---

## Family Violence Specific Terms

### Affected Family Member (AFM)
**Definition:** The person identified as the victim in a family violence incident. This term is specific to family violence reporting.

**Synonyms to AVOID:** victim (use in general crime context), complainant

**Usage Example:** "74.5% of Affected Family Members in Casey were female."

---

### AFM Counter
**Definition:** The count of Affected Family Members recorded in family incidents data.

**Usage:** Used for aggregating victim demographics in family violence analysis.

---

### Family Violence
**Definition:** Behaviour by a person towards a family member that is physically, sexually, emotionally, psychologically, or economically abusive, threatening, coercive, or controlling.

**Legal Basis:** Family Violence Protection Act 2008 (Vic)

**Scope:** Includes intimate partner violence, parent-child violence, sibling violence, and extended family violence.

---

## Abbreviations Reference

| Abbreviation | Full Term |
|--------------|-----------|
| AFM | Affected Family Member |
| AO | Alleged Offender |
| CI | Criminal Incident |
| FI | Family Incident |
| FV | Family Violence |
| LGA | Local Government Area |
| PSA | Police Service Area |
| RO | Recorded Offence |
| VR | Victim Report |

---

## Column Naming Standards

For consistency across notebooks and outputs, use these standard column names:

| Concept | Standard Column Name | Avoid |
|---------|---------------------|-------|
| Year | `Year` | `year`, `YEAR`, `Yr` |
| LGA | `Local Government Area` | `LGA`, `lga`, `Council` |
| Police Region | `Police Region` | `Region`, `region` |
| Incident Count | `Incidents Recorded` | `Incidents`, `incident_count` |
| Offence Count | `Offence Count` | `Offences`, `offence_count` |
| Rate | `Rate per 100,000 population` | `Rate`, `rate_per_100k` |
| Population | `Total Population` | `Population`, `pop` |

---

## Usage Guidelines

1. **Be Specific:** Use "Criminal Incident" vs "Recorded Offence" precisely - they measure different things.

2. **Include Context:** When citing rates, always specify the population denominator (per 100,000).

3. **Note Time Periods:** Family Incidents data covers 2017-2021 only; other datasets cover 2012-2021.

4. **Handle Totals:** Filter out "Total" rows when performing LGA-level analysis.

5. **Respect Presumption of Innocence:** Always use "alleged offender" rather than "offender" or "criminal."

6. **Geographic Precision:** Use LGA names exactly as they appear in the data (e.g., "Greater Geelong" not "Geelong").

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-27 | Initial glossary creation |
