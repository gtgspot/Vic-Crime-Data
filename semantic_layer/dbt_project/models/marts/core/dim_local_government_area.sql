/*
    Dimension Table: Local Government Area

    Purpose: Master reference table for Victorian LGAs with attributes
    Grain: One row per LGA
    Primary Key: local_government_area
*/

WITH lga_region_mapping AS (
    -- Get the most recent year's mapping
    SELECT DISTINCT
        local_government_area,
        police_region
    FROM {{ ref('stg_criminal_incidents') }}
    WHERE year = (SELECT MAX(year) FROM {{ ref('stg_criminal_incidents') }})
),

police_stations AS (
    SELECT
        local_government_area,
        police_stations_count
    FROM {{ ref('seed_police_stations_by_lga') }}
),

final AS (
    SELECT
        -- Surrogate key
        {{ dbt_utils.generate_surrogate_key(['lga.local_government_area']) }} AS lga_id,

        -- LGA attributes
        lga.local_government_area,
        lga.police_region,

        -- Extract region code (1-4)
        CAST(LEFT(lga.police_region, 1) AS INTEGER) AS police_region_code,

        -- Region name without number prefix
        TRIM(SUBSTRING(lga.police_region, 3)) AS police_region_name,

        -- Police station count
        COALESCE(ps.police_stations_count, 0) AS police_station_count,

        -- Metropolitan indicator
        CASE
            WHEN lga.police_region IN ('1 North West Metro', '3 Southern Metro')
            THEN TRUE
            ELSE FALSE
        END AS is_metropolitan,

        -- Regional grouping
        CASE
            WHEN lga.police_region = '1 North West Metro' THEN 'Inner Metro'
            WHEN lga.police_region = '3 Southern Metro' THEN 'Outer Metro'
            WHEN lga.police_region = '2 Eastern' THEN 'Regional East'
            WHEN lga.police_region = '4 Western' THEN 'Regional West'
            ELSE 'Unknown'
        END AS geographic_classification,

        -- Metadata
        CURRENT_TIMESTAMP AS _updated_at

    FROM lga_region_mapping lga
    LEFT JOIN police_stations ps
        ON lga.local_government_area = ps.local_government_area
)

SELECT * FROM final
ORDER BY police_region_code, local_government_area
