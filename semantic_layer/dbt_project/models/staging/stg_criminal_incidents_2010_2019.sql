/*
    Staging model for Criminal Incidents by Principal Offence (2010-2019)

    Purpose: Clean and standardize the 2010-2019 historical crime data
    Source: LGA_Criminal_Incidents_Principal_Offence_2010_2019.xlsx
    Grain: One row per LGA per Year per Principal Offence
    Time Period: Years ending March 2010-2019
    LGA Boundaries: ASGS 2011

    Notes:
    - This dataset uses MARCH year-ending (vs September for 2012-2021 data)
    - Uses ASGS 2011 LGA boundaries
    - Can be merged with 2012-2021 data for extended time series (with caveats)
*/

WITH source AS (
    SELECT * FROM {{ source('raw_crime_data_2010_2019', 'criminal_incidents_principal_offence') }}
),

cleaned AS (
    SELECT
        -- Generate surrogate key
        {{ dbt_utils.generate_surrogate_key([
            'year',
            'lga_name',
            'offence_division',
            'offence_subdivision',
            'offence_subgroup'
        ]) }} AS incident_id,

        -- Time dimension
        CAST(year AS INTEGER) AS year,
        'March' AS year_ending_month,

        -- Geographic dimensions
        TRIM(lga_code) AS lga_code,
        TRIM(lga_name) AS local_government_area,

        -- Offence classification
        TRIM(offence_division) AS offence_division,
        TRIM(offence_subdivision) AS offence_subdivision,
        TRIM(offence_subgroup) AS offence_subgroup,

        -- Extract division code (first character)
        UPPER(LEFT(TRIM(offence_division), 1)) AS offence_division_code,

        -- Metrics
        CAST(incidents_recorded AS INTEGER) AS incidents_recorded,
        CAST(rate_per_100000 AS DECIMAL(12,2)) AS rate_per_100k,

        -- Data source identifier
        'CSA_2010_2019' AS data_source,

        -- Metadata
        CURRENT_TIMESTAMP AS _loaded_at

    FROM source

    -- Exclude aggregate rows and special categories
    WHERE lga_name NOT IN (
        'Total',
        'Justice Institutions and Immigration Facilities',
        'Unincorporated Vic'
    )
    AND lga_name IS NOT NULL
    AND year BETWEEN 2010 AND 2019
)

SELECT * FROM cleaned
