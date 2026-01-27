# Victorian Crime Data - Semantic Layer

This directory contains the semantic layer for the Victorian Crime Statistics project, providing standardized definitions, documentation, and data modeling infrastructure.

## Overview

The semantic layer bridges the gap between raw crime data and business understanding by providing:

1. **Data Dictionary** - Comprehensive column definitions and business meanings
2. **Entity Relationships** - How datasets connect and can be joined
3. **Standardized Glossary** - Consistent terminology across analysis
4. **dbt Project** - Data transformation and metadata infrastructure

## Directory Structure

```
semantic_layer/
├── README.md                    # This file
├── data_dictionary.md           # Column definitions for all datasets
├── entity_relationships.md      # How datasets relate to each other
├── glossary.md                  # Standardized terminology
└── dbt_project/                 # dbt-based metadata catalog
    ├── dbt_project.yml          # Project configuration
    ├── models/
    │   ├── schema.yml           # Model documentation & metadata
    │   ├── staging/             # Cleaned source data
    │   └── marts/               # Analytical models
    │       └── core/            # Core fact & dimension tables
    └── seeds/                   # Reference data
```

## Quick Links

| Document | Purpose |
|----------|---------|
| [Data Dictionary](data_dictionary.md) | Look up what any column means |
| [Entity Relationships](entity_relationships.md) | Understand how to join datasets |
| [Glossary](glossary.md) | Get consistent term definitions |
| [dbt Models](dbt_project/models/schema.yml) | Technical metadata catalog |

## Key Concepts

### The Five Core Datasets

| Dataset | What It Measures | Time Range |
|---------|-----------------|------------|
| Criminal Incidents | Unique crime events | 2012-2021 |
| Recorded Offences | Individual criminal acts | 2012-2021 |
| Alleged Offenders | Persons processed by police | 2012-2021 |
| Family Incidents | Family violence events | **2017-2021** |
| Victim Reports | Persons victimized | 2012-2021 |

### Important Relationships

```
1 Criminal Incident → N Recorded Offences (one event, multiple crimes)
1 Criminal Incident → N Alleged Offenders (one event, multiple suspects)
1 Criminal Incident → N Victim Reports (one event, multiple victims)
```

### Key Metrics

| Metric | Definition |
|--------|------------|
| Crime Rate | Incidents per 100,000 population |
| Clearance Rate | % of incidents with charges filed |
| Offences per Incident | Average number of crimes per event |

## Using the dbt Project

The dbt project provides a modern data transformation framework:

### Prerequisites

```bash
pip install dbt-core dbt-postgres  # or dbt-duckdb for local
```

### Key Models

| Model | Description |
|-------|-------------|
| `fct_crime_summary` | Main fact table with all crime metrics |
| `dim_local_government_area` | LGA dimension with attributes |
| `dim_offence_type` | Offence classification hierarchy |

### Running dbt

```bash
cd semantic_layer/dbt_project

# Run all models
dbt run

# Generate documentation
dbt docs generate
dbt docs serve

# Run tests
dbt test
```

## Common Questions

### Q: What's the difference between an incident and an offence?

**Incident**: A unique criminal event (e.g., home invasion)
**Offence**: An individual crime within that event (e.g., burglary, assault, theft)

One incident can contain multiple offences. That's why Recorded Offences count is always ≥ Criminal Incidents count.

### Q: Why is Family Incidents data only from 2017?

Victoria Police changed their recording methodology for family violence in 2017, making earlier data non-comparable. Analysis of family incidents should only use 2017-2021 data.

### Q: How do I join datasets?

Use `Year` + `Local Government Area` as the join key. See [Entity Relationships](entity_relationships.md) for detailed join patterns and SQL examples.

### Q: What are "Total" rows?

Many source tables contain aggregated summary rows labeled "Total". These should be filtered out when doing LGA-level analysis to avoid double-counting.

## Contributing

When adding new analysis or modifying data processing:

1. Check the glossary for standard terminology
2. Follow column naming conventions in the data dictionary
3. Update documentation if adding new derived metrics
4. Add new models to schema.yml with full documentation

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-27 | Initial semantic layer creation |
