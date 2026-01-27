/*
    Staging model for Criminal Incidents

    Purpose: Clean and standardize raw criminal incidents data
    Source: LGA_Criminal_Incidents_Year_Ending_September_2021.xlsx (Table 01)
    Grain: One row per LGA per Year
*/

WITH source AS (
    SELECT * FROM {{ source('raw_crime_data', 'criminal_incidents') }}
),

cleaned AS (
    SELECT
        -- Generate surrogate key
        {{ dbt_utils.generate_surrogate_key(['year', 'local_government_area']) }} AS incident_id,

        -- Time dimension
        CAST(year AS INTEGER) AS year,
        year_ending,

        -- Geographic dimensions
        TRIM(police_region) AS police_region,
        TRIM(local_government_area) AS local_government_area,

        -- Metrics
        CAST(incidents_recorded AS INTEGER) AS incidents_recorded,
        CAST(rate_per_100000_population AS DECIMAL(12,2)) AS rate_per_100k,

        -- Derived: Extract region code
        CAST(LEFT(police_region, 1) AS INTEGER) AS police_region_code,

        -- Metadata
        CURRENT_TIMESTAMP AS _loaded_at

    FROM source

    -- Exclude aggregate rows and special categories
    WHERE local_government_area NOT IN (
        'Total',
        'Justice Institutions and Immigration Facilities',
        'Unincorporated Vic'
    )
    AND local_government_area IS NOT NULL
)

SELECT * FROM cleaned
