/*
    Fact Table: Crime Summary

    Purpose: Comprehensive crime statistics by LGA and year
    Grain: One row per LGA per Year
    Primary Key: (year, local_government_area)

    This is the primary analytical model for crime analysis,
    consolidating all five core datasets.
*/

WITH criminal_incidents AS (
    SELECT
        year,
        local_government_area,
        police_region,
        incidents_recorded AS criminal_incidents,
        rate_per_100k AS criminal_incident_rate
    FROM {{ ref('stg_criminal_incidents') }}
),

recorded_offences AS (
    SELECT
        year,
        local_government_area,
        SUM(offence_count) AS recorded_offences,
        AVG(rate_per_100k) AS recorded_offence_rate
    FROM {{ ref('stg_recorded_offences') }}
    GROUP BY year, local_government_area
),

alleged_offenders AS (
    SELECT
        year,
        local_government_area,
        SUM(alleged_offender_incidents) AS alleged_offender_incidents
    FROM {{ ref('stg_alleged_offenders') }}
    GROUP BY year, local_government_area
),

victim_reports AS (
    SELECT
        year,
        local_government_area,
        SUM(victim_reports) AS victim_reports
    FROM {{ ref('stg_victim_reports') }}
    GROUP BY year, local_government_area
),

family_incidents AS (
    SELECT
        year,
        local_government_area,
        family_incidents
    FROM {{ ref('stg_family_incidents') }}
),

population AS (
    SELECT
        year,
        local_government_area,
        estimated_population AS population
    FROM {{ ref('int_population_estimates') }}
),

combined AS (
    SELECT
        ci.year,
        ci.local_government_area,
        ci.police_region,

        -- Population
        COALESCE(pop.population, 0) AS population,

        -- Criminal Incidents
        ci.criminal_incidents,
        ci.criminal_incident_rate,

        -- Recorded Offences
        COALESCE(ro.recorded_offences, 0) AS recorded_offences,
        COALESCE(ro.recorded_offence_rate, 0) AS recorded_offence_rate,

        -- Alleged Offenders
        COALESCE(ao.alleged_offender_incidents, 0) AS alleged_offender_incidents,

        -- Victim Reports
        COALESCE(vr.victim_reports, 0) AS victim_reports,

        -- Family Incidents (only available 2017+)
        fi.family_incidents,

        -- Derived Metrics
        CASE
            WHEN ci.criminal_incidents > 0
            THEN ROUND(COALESCE(ro.recorded_offences, 0) * 1.0 / ci.criminal_incidents, 2)
            ELSE 0
        END AS offences_per_incident

    FROM criminal_incidents ci
    LEFT JOIN recorded_offences ro
        ON ci.year = ro.year
        AND ci.local_government_area = ro.local_government_area
    LEFT JOIN alleged_offenders ao
        ON ci.year = ao.year
        AND ci.local_government_area = ao.local_government_area
    LEFT JOIN victim_reports vr
        ON ci.year = vr.year
        AND ci.local_government_area = vr.local_government_area
    LEFT JOIN family_incidents fi
        ON ci.year = fi.year
        AND ci.local_government_area = fi.local_government_area
    LEFT JOIN population pop
        ON ci.year = pop.year
        AND ci.local_government_area = pop.local_government_area
),

with_yoy AS (
    SELECT
        *,
        -- Year-over-year change calculation
        LAG(criminal_incidents) OVER (
            PARTITION BY local_government_area
            ORDER BY year
        ) AS prev_year_incidents,

        CASE
            WHEN LAG(criminal_incidents) OVER (
                PARTITION BY local_government_area ORDER BY year
            ) > 0
            THEN ROUND(
                (criminal_incidents - LAG(criminal_incidents) OVER (
                    PARTITION BY local_government_area ORDER BY year
                )) * 100.0 / LAG(criminal_incidents) OVER (
                    PARTITION BY local_government_area ORDER BY year
                ), 2
            )
            ELSE NULL
        END AS year_over_year_change_pct

    FROM combined
)

SELECT
    year,
    local_government_area,
    police_region,
    population,
    criminal_incidents,
    criminal_incident_rate,
    recorded_offences,
    recorded_offence_rate,
    alleged_offender_incidents,
    victim_reports,
    family_incidents,
    offences_per_incident,
    year_over_year_change_pct,

    -- Data quality flags
    CASE WHEN year >= 2017 THEN TRUE ELSE FALSE END AS has_family_incident_data,
    CURRENT_TIMESTAMP AS _updated_at

FROM with_yoy
