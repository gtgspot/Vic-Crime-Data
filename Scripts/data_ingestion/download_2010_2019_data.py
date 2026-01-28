#!/usr/bin/env python3
"""
Data Download and Ingestion Script for Victorian Crime Statistics 2010-2019

This script provides utilities to download and process the VIC CSA Crime Statistics
dataset covering Criminal Incidents by Principal Offence (LGA) for 2010-2019.

Data Source:
    - Dataset: VIC CSA - Crime Statistics - Criminal Incidents by Principal Offence (LGA) 2010-2019
    - Publisher: Crime Statistics Agency Victoria
    - Time Period: Years ending March 2010-2019 (ASGS 2011 LGA boundaries)

Download URLs:
    1. AURIN Data Catalogue:
       https://data.aurin.org.au/dataset/vic-govt-csa-csa-crime-stats-criminal-incidents-princ-offence-lga-2010-2019-lga2011

    2. Research Data Australia:
       https://researchdata.edu.au/vic-csa-crime-2010-2019/2746422

    3. data.gov.au:
       https://data.gov.au/dataset/ds-aurin-55c99905-75fe-49b8-a663-85b6f24b827d

    4. Crime Statistics Agency Victoria (Original Source):
       https://www.crimestatistics.vic.gov.au/download-data-11

Usage:
    python download_2010_2019_data.py --download    # Download data (if available)
    python download_2010_2019_data.py --validate    # Validate existing data
    python download_2010_2019_data.py --info        # Show dataset information

Note:
    Some data sources may require AURIN portal login or institutional access.
    If automatic download fails, please manually download the data from the
    Crime Statistics Agency Victoria website.

Author: Victorian Crime Data Analytics Project
"""

import os
import sys
import argparse
import json
from pathlib import Path
from datetime import datetime

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = PROJECT_ROOT / "Data"
OUTPUT_DIR = PROJECT_ROOT / "Output_data"

# Dataset metadata
DATASET_INFO = {
    "name": "VIC CSA - Crime Statistics - Criminal Incidents by Principal Offence (LGA) 2010-2019",
    "publisher": "Crime Statistics Agency Victoria",
    "time_period": {
        "start_year": 2010,
        "end_year": 2019,
        "year_ending": "March",
        "asgs_version": "2011"
    },
    "description": """
    This dataset presents the footprint of the number of criminal incidents by
    principal offence recorded on the Victoria Police Law Enforcement Assistance
    Program (LEAP).

    A recorded criminal incident is a criminal event that may include multiple
    offences, alleged offenders and/or victims that is recorded on the LEAP
    database on a single date and at one location.

    The data spans the years ending March in the period of 2010 to 2019 and is
    aggregated to 2011 Australian Statistical Geography Standard (ASGS) Local
    Government Areas (LGA).
    """,
    "download_sources": [
        {
            "name": "AURIN Data Catalogue",
            "url": "https://data.aurin.org.au/dataset/vic-govt-csa-csa-crime-stats-criminal-incidents-princ-offence-lga-2010-2019-lga2011",
            "access_type": "Institutional Login",
            "format": "CSV/GeoJSON"
        },
        {
            "name": "Research Data Australia",
            "url": "https://researchdata.edu.au/vic-csa-crime-2010-2019/2746422",
            "access_type": "Public Metadata",
            "format": "Reference"
        },
        {
            "name": "data.gov.au",
            "url": "https://data.gov.au/dataset/ds-aurin-55c99905-75fe-49b8-a663-85b6f24b827d",
            "access_type": "Public",
            "format": "Various"
        },
        {
            "name": "Crime Statistics Agency Victoria",
            "url": "https://www.crimestatistics.vic.gov.au/download-data-11",
            "access_type": "Public",
            "format": "Excel (XLSX)"
        }
    ],
    "expected_columns": [
        "lga_code",          # LGA code (ASGS 2011)
        "lga_name",          # Local Government Area name
        "year",              # Year (2010-2019)
        "year_ending",       # Month of year ending (March)
        "offence_division",  # Principal offence division (A-F)
        "offence_subdivision",  # Offence subdivision
        "offence_subgroup",  # Offence subgroup
        "incidents_recorded", # Number of criminal incidents
        "rate_per_100000"    # Rate per 100,000 population
    ],
    "offence_divisions": {
        "A": "Crimes against the person",
        "B": "Property and deception offences",
        "C": "Drug offences",
        "D": "Public order and security offences",
        "E": "Justice procedures offences",
        "F": "Other offences"
    },
    "data_quality_notes": [
        "Data excludes Justice institutions and immigration facilities",
        "Data excludes Unincorporated Victoria",
        "Data excludes incidents where geographic location is unknown or outside Victoria",
        "Recorded crime statistics are subject to movement between releases",
        "Not representative of all crime that occurs in Victoria"
    ],
    "expected_filename": "LGA_Criminal_Incidents_Principal_Offence_2010_2019.xlsx",
    "local_path": str(DATA_DIR / "LGA_Criminal_Incidents_Principal_Offence_2010_2019.xlsx")
}


def print_dataset_info():
    """Display comprehensive dataset information."""
    print("=" * 80)
    print("VICTORIAN CRIME STATISTICS - 2010-2019 DATASET INFORMATION")
    print("=" * 80)

    print(f"\nDataset Name: {DATASET_INFO['name']}")
    print(f"Publisher: {DATASET_INFO['publisher']}")
    print(f"\nTime Period:")
    print(f"  - Years: {DATASET_INFO['time_period']['start_year']} - {DATASET_INFO['time_period']['end_year']}")
    print(f"  - Year Ending: {DATASET_INFO['time_period']['year_ending']}")
    print(f"  - ASGS Version: {DATASET_INFO['time_period']['asgs_version']}")

    print(f"\nDescription:{DATASET_INFO['description']}")

    print("\nDownload Sources:")
    for i, source in enumerate(DATASET_INFO['download_sources'], 1):
        print(f"  {i}. {source['name']}")
        print(f"     URL: {source['url']}")
        print(f"     Access: {source['access_type']} | Format: {source['format']}")

    print("\nOffence Divisions:")
    for code, desc in DATASET_INFO['offence_divisions'].items():
        print(f"  {code}: {desc}")

    print("\nExpected Columns:")
    for col in DATASET_INFO['expected_columns']:
        print(f"  - {col}")

    print("\nData Quality Notes:")
    for note in DATASET_INFO['data_quality_notes']:
        print(f"  * {note}")

    print("\nExpected Local Path:")
    print(f"  {DATASET_INFO['local_path']}")
    print("=" * 80)


def check_data_exists():
    """Check if the 2010-2019 data file exists locally."""
    expected_path = Path(DATASET_INFO['local_path'])

    if expected_path.exists():
        size_mb = expected_path.stat().st_size / (1024 * 1024)
        print(f"[OK] Data file found: {expected_path}")
        print(f"     Size: {size_mb:.2f} MB")
        return True
    else:
        print(f"[!] Data file not found: {expected_path}")
        print("\n    To obtain this data:")
        print("    1. Visit: https://www.crimestatistics.vic.gov.au/download-data-11")
        print("    2. Download the Criminal Incidents data for 2010-2019")
        print("    3. Save the file as:")
        print(f"       {expected_path}")
        return False


def validate_data():
    """Validate the structure of the 2010-2019 data file."""
    try:
        import pandas as pd
    except ImportError:
        print("[ERROR] pandas is required. Install with: pip install pandas openpyxl")
        return False

    data_path = Path(DATASET_INFO['local_path'])

    if not data_path.exists():
        print(f"[ERROR] Data file not found: {data_path}")
        return False

    print(f"\nValidating: {data_path}")

    try:
        # Read Excel file
        excel_file = pd.ExcelFile(data_path)
        sheets = excel_file.sheet_names
        print(f"[OK] Successfully read Excel file")
        print(f"     Sheets: {sheets}")

        # Check for expected data
        validation_passed = True

        for sheet in sheets:
            if sheet.lower() == 'contents':
                continue

            df = pd.read_excel(data_path, sheet_name=sheet)
            print(f"\n  Sheet: {sheet}")
            print(f"    Rows: {len(df):,}")
            print(f"    Columns: {list(df.columns)}")

            # Check for year column
            if 'Year' in df.columns:
                years = df['Year'].dropna().unique()
                print(f"    Years found: {sorted(years)}")

                # Validate year range
                expected_years = list(range(2010, 2020))
                if not all(y in years for y in expected_years):
                    print(f"    [!] Warning: Not all expected years (2010-2019) found")

            # Check for LGA column
            lga_cols = [c for c in df.columns if 'lga' in c.lower() or 'local government' in c.lower()]
            if lga_cols:
                print(f"    LGA Column: {lga_cols[0]}")
                num_lgas = df[lga_cols[0]].nunique()
                print(f"    Unique LGAs: {num_lgas}")

        if validation_passed:
            print("\n[OK] Data validation passed")
            return True
        else:
            print("\n[!] Data validation completed with warnings")
            return True

    except Exception as e:
        print(f"[ERROR] Failed to validate data: {e}")
        return False


def save_metadata():
    """Save dataset metadata to JSON file."""
    metadata_path = DATA_DIR / "2010_2019_dataset_metadata.json"

    metadata = {
        **DATASET_INFO,
        "created_at": datetime.now().isoformat(),
        "project": "Victorian Crime Data Analytics"
    }

    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"[OK] Metadata saved to: {metadata_path}")


def download_instructions():
    """Print detailed download instructions."""
    print("\n" + "=" * 80)
    print("MANUAL DOWNLOAD INSTRUCTIONS")
    print("=" * 80)

    print("""
Since automatic download may be restricted, please follow these steps:

OPTION 1: Crime Statistics Agency Victoria (Recommended)
---------------------------------------------------------
1. Visit: https://www.crimestatistics.vic.gov.au/download-data-11
2. Look for "Criminal Incidents" data tables
3. Download data covering years 2010-2019
4. Save to: {data_dir}/LGA_Criminal_Incidents_Principal_Offence_2010_2019.xlsx

OPTION 2: AURIN Data Catalogue (Requires Institutional Access)
--------------------------------------------------------------
1. Visit: https://data.aurin.org.au
2. Search for: "Criminal Incidents Principal Offence LGA 2010-2019"
3. Login with your institutional credentials (Australian universities)
4. Download the dataset in your preferred format
5. Save to: {data_dir}/

OPTION 3: data.gov.au
--------------------
1. Visit: https://data.gov.au/dataset/ds-aurin-55c99905-75fe-49b8-a663-85b6f24b827d
2. Look for available downloads or related resources
3. Follow links to access the data

After downloading, run validation:
    python download_2010_2019_data.py --validate
""".format(data_dir=DATA_DIR))


def main():
    parser = argparse.ArgumentParser(
        description="Download and manage Victorian Crime Statistics 2010-2019 dataset"
    )
    parser.add_argument('--info', action='store_true',
                       help='Display dataset information')
    parser.add_argument('--validate', action='store_true',
                       help='Validate existing data file')
    parser.add_argument('--download', action='store_true',
                       help='Show download instructions')
    parser.add_argument('--metadata', action='store_true',
                       help='Save dataset metadata to JSON')
    parser.add_argument('--check', action='store_true',
                       help='Check if data file exists')

    args = parser.parse_args()

    if not any([args.info, args.validate, args.download, args.metadata, args.check]):
        # Default: show info and check status
        print_dataset_info()
        print("\n")
        check_data_exists()
        print("\nUse --help for more options")
        return

    if args.info:
        print_dataset_info()

    if args.check:
        check_data_exists()

    if args.validate:
        validate_data()

    if args.download:
        download_instructions()

    if args.metadata:
        save_metadata()


if __name__ == "__main__":
    main()
