#!/usr/bin/env python3
"""
Data Processor for Victorian Crime Statistics

This module provides utilities to load, process, and merge crime statistics
data from multiple time periods:
    - 2010-2019 (Years ending March, ASGS 2011 LGA boundaries)
    - 2012-2021 (Years ending September, current LGA boundaries)

The processor handles:
    - Loading data from Excel/CSV files
    - Standardizing column names and formats
    - Merging overlapping years (2012-2019)
    - Creating extended time series (2010-2021)
    - Data validation and quality checks

Author: Victorian Crime Data Analytics Project
"""

import os
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import json
from datetime import datetime

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = PROJECT_ROOT / "Data"
OUTPUT_DIR = PROJECT_ROOT / "Output_data"

try:
    import pandas as pd
    import numpy as np
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False
    print("Warning: pandas not available. Install with: pip install pandas openpyxl")


class CrimeDataProcessor:
    """
    Processor for Victorian Crime Statistics data.

    Handles loading, processing, and merging crime statistics from
    multiple data sources covering 2010-2021.
    """

    # Standard column mappings for different data sources
    COLUMN_MAPPINGS = {
        "2012_2021": {
            "Year": "year",
            "Year ending": "year_ending",
            "Police Region": "police_region",
            "Local Government Area": "lga_name",
            "Incidents Recorded": "incidents_recorded",
            "Rate per 100,000 population": "rate_per_100000",
            "Offence Division": "offence_division",
            "Offence Subdivision": "offence_subdivision",
            "Offence Subgroup": "offence_subgroup",
            "Police Service Area": "police_service_area",
            "Postcode": "postcode",
            "Suburb/Town Name": "suburb",
            "Location Division": "location_division",
            "Location Subdivision": "location_subdivision",
            "Location Group": "location_group",
            "Charge Status": "charge_status",
        },
        "2010_2019": {
            "Year": "year",
            "Year ending": "year_ending",
            "LGA_CODE": "lga_code",
            "LGA_NAME": "lga_name",
            "lga_name": "lga_name",
            "Local Government Area": "lga_name",
            "Offence Division": "offence_division",
            "Offence Subdivision": "offence_subdivision",
            "Offence Subgroup": "offence_subgroup",
            "offence_division": "offence_division",
            "Incidents Recorded": "incidents_recorded",
            "incidents_recorded": "incidents_recorded",
            "Rate per 100,000 population": "rate_per_100000",
            "rate_per_100000": "rate_per_100000",
        }
    }

    # File paths for data sources
    DATA_FILES = {
        "criminal_incidents_2012_2021": DATA_DIR / "LGA_Criminal_Incidents_Year_Ending_September_2021.xlsx",
        "criminal_incidents_2010_2019": DATA_DIR / "LGA_Criminal_Incidents_Principal_Offence_2010_2019.xlsx",
        "recorded_offences": DATA_DIR / "LGA_Recorded_Offences_Year_Ending_September_2021.xlsx",
        "alleged_offenders": DATA_DIR / "LGA_Alleged_Offenders_Year_Ending_September_2021.xlsx",
        "family_incidents": DATA_DIR / "LGA_Family_Incidents_Year_Ending_September_2021.xlsx",
        "victim_reports": DATA_DIR / "LGA_Victim_Reports_Year_Ending_September_2021.xlsx",
    }

    def __init__(self):
        """Initialize the data processor."""
        if not PANDAS_AVAILABLE:
            raise ImportError("pandas is required. Install with: pip install pandas openpyxl")

        self.loaded_data = {}
        self._validate_paths()

    def _validate_paths(self):
        """Validate that data directories exist."""
        if not DATA_DIR.exists():
            raise FileNotFoundError(f"Data directory not found: {DATA_DIR}")

        if not OUTPUT_DIR.exists():
            OUTPUT_DIR.mkdir(parents=True)

    def get_available_files(self) -> Dict[str, bool]:
        """Check which data files are available."""
        return {
            name: path.exists()
            for name, path in self.DATA_FILES.items()
        }

    def load_criminal_incidents_2012_2021(
        self,
        sheet_name: str = "Table 01"
    ) -> pd.DataFrame:
        """
        Load the 2012-2021 Criminal Incidents data.

        Parameters
        ----------
        sheet_name : str
            Name of the sheet to load. Options:
            - 'Table 01': LGA summary by Police Region
            - 'Table 02': By PSA, LGA, and Offence
            - 'Table 03': By LGA, Suburb, and Offence
            - 'Table 04': By LGA and Location
            - 'Table 05': By LGA and Charge Status

        Returns
        -------
        pd.DataFrame
            Loaded and standardized DataFrame
        """
        file_path = self.DATA_FILES["criminal_incidents_2012_2021"]

        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        df = pd.read_excel(file_path, sheet_name=sheet_name)
        df = self._standardize_columns(df, "2012_2021")
        df["data_source"] = "CSA_2012_2021"
        df["year_ending_month"] = "September"

        self.loaded_data["criminal_incidents_2012_2021"] = df
        return df

    def load_criminal_incidents_2010_2019(
        self,
        sheet_name: Optional[str] = None
    ) -> pd.DataFrame:
        """
        Load the 2010-2019 Criminal Incidents by Principal Offence data.

        Parameters
        ----------
        sheet_name : str, optional
            Name of the sheet to load. If None, loads the first data sheet.

        Returns
        -------
        pd.DataFrame
            Loaded and standardized DataFrame
        """
        file_path = self.DATA_FILES["criminal_incidents_2010_2019"]

        if not file_path.exists():
            raise FileNotFoundError(
                f"File not found: {file_path}\n"
                "Please download the 2010-2019 data from:\n"
                "https://www.crimestatistics.vic.gov.au/download-data-11\n"
                "or run: python download_2010_2019_data.py --download"
            )

        # Read Excel file
        excel_file = pd.ExcelFile(file_path)
        sheets = excel_file.sheet_names

        # Find the data sheet (skip contents/metadata sheets)
        if sheet_name is None:
            data_sheets = [s for s in sheets if s.lower() not in ['contents', 'notes', 'metadata']]
            if data_sheets:
                sheet_name = data_sheets[0]
            else:
                sheet_name = sheets[0]

        df = pd.read_excel(file_path, sheet_name=sheet_name)
        df = self._standardize_columns(df, "2010_2019")
        df["data_source"] = "CSA_2010_2019"
        df["year_ending_month"] = "March"

        self.loaded_data["criminal_incidents_2010_2019"] = df
        return df

    def _standardize_columns(
        self,
        df: pd.DataFrame,
        source_type: str
    ) -> pd.DataFrame:
        """Standardize column names based on source type."""
        mapping = self.COLUMN_MAPPINGS.get(source_type, {})

        # Rename columns that exist in the mapping
        columns_to_rename = {
            col: mapping[col]
            for col in df.columns
            if col in mapping
        }

        df = df.rename(columns=columns_to_rename)

        # Ensure year is integer
        if 'year' in df.columns:
            df['year'] = pd.to_numeric(df['year'], errors='coerce')

        return df

    def merge_time_series(
        self,
        prefer_september: bool = True
    ) -> pd.DataFrame:
        """
        Merge 2010-2019 and 2012-2021 data into extended time series.

        For overlapping years (2012-2019), can prefer either:
        - September year-ending data (from 2012-2021 dataset)
        - March year-ending data (from 2010-2019 dataset)

        Parameters
        ----------
        prefer_september : bool
            If True, use September year-ending for overlapping years.
            If False, use March year-ending.

        Returns
        -------
        pd.DataFrame
            Extended time series from 2010-2021
        """
        # Load both datasets if not already loaded
        df_2012 = self.loaded_data.get("criminal_incidents_2012_2021")
        df_2010 = self.loaded_data.get("criminal_incidents_2010_2019")

        if df_2012 is None:
            try:
                df_2012 = self.load_criminal_incidents_2012_2021()
            except FileNotFoundError:
                df_2012 = None

        if df_2010 is None:
            try:
                df_2010 = self.load_criminal_incidents_2010_2019()
            except FileNotFoundError:
                df_2010 = None

        if df_2012 is None and df_2010 is None:
            raise FileNotFoundError("No data files available to merge")

        if df_2012 is None:
            return df_2010

        if df_2010 is None:
            return df_2012

        # Identify overlapping years
        years_2012 = set(df_2012['year'].dropna().unique())
        years_2010 = set(df_2010['year'].dropna().unique())
        overlapping = years_2012.intersection(years_2010)

        print(f"Years in 2012-2021 dataset: {sorted(years_2012)}")
        print(f"Years in 2010-2019 dataset: {sorted(years_2010)}")
        print(f"Overlapping years: {sorted(overlapping)}")

        if prefer_september:
            # Use 2012-2021 for overlapping years
            # Take 2010-2011 from 2010-2019 dataset
            df_early = df_2010[df_2010['year'] < min(years_2012)]
            merged = pd.concat([df_early, df_2012], ignore_index=True)
        else:
            # Use 2010-2019 for overlapping years
            # Take 2020-2021 from 2012-2021 dataset
            df_late = df_2012[df_2012['year'] > max(years_2010)]
            merged = pd.concat([df_2010, df_late], ignore_index=True)

        merged = merged.sort_values(['year', 'lga_name']).reset_index(drop=True)

        return merged

    def get_lga_summary(
        self,
        df: pd.DataFrame,
        group_cols: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """
        Generate summary statistics by LGA.

        Parameters
        ----------
        df : pd.DataFrame
            Crime data DataFrame
        group_cols : list, optional
            Columns to group by. Default: ['year', 'lga_name']

        Returns
        -------
        pd.DataFrame
            Summary statistics
        """
        if group_cols is None:
            group_cols = ['year', 'lga_name']

        # Filter to only include valid group columns
        valid_cols = [c for c in group_cols if c in df.columns]

        if 'incidents_recorded' in df.columns:
            summary = df.groupby(valid_cols).agg({
                'incidents_recorded': ['sum', 'mean', 'count']
            }).reset_index()

            # Flatten column names
            summary.columns = [
                '_'.join(col).strip('_') if isinstance(col, tuple) else col
                for col in summary.columns
            ]

            return summary

        return df.groupby(valid_cols).size().reset_index(name='count')

    def get_offence_trends(
        self,
        df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Analyze trends by offence division over time.

        Parameters
        ----------
        df : pd.DataFrame
            Crime data with offence_division column

        Returns
        -------
        pd.DataFrame
            Trend analysis by offence division
        """
        if 'offence_division' not in df.columns:
            raise ValueError("DataFrame must contain 'offence_division' column")

        trends = df.groupby(['year', 'offence_division']).agg({
            'incidents_recorded': 'sum'
        }).reset_index()

        # Calculate year-over-year change
        trends = trends.sort_values(['offence_division', 'year'])
        trends['yoy_change'] = trends.groupby('offence_division')['incidents_recorded'].pct_change() * 100

        return trends

    def export_merged_data(
        self,
        output_format: str = "csv",
        filename: Optional[str] = None
    ) -> Path:
        """
        Export merged time series data.

        Parameters
        ----------
        output_format : str
            Output format: 'csv', 'excel', or 'parquet'
        filename : str, optional
            Custom filename. Default based on format.

        Returns
        -------
        Path
            Path to exported file
        """
        merged = self.merge_time_series()

        if filename is None:
            filename = f"criminal_incidents_extended_2010_2021.{output_format}"

        output_path = OUTPUT_DIR / filename

        if output_format == "csv":
            merged.to_csv(output_path, index=False)
        elif output_format == "excel":
            merged.to_excel(output_path, index=False)
        elif output_format == "parquet":
            merged.to_parquet(output_path, index=False)
        else:
            raise ValueError(f"Unsupported format: {output_format}")

        print(f"Exported to: {output_path}")
        return output_path

    def generate_report(self) -> Dict:
        """Generate a summary report of available data."""
        report = {
            "generated_at": datetime.now().isoformat(),
            "data_files": {},
            "loaded_data": {}
        }

        # Check file availability
        for name, path in self.DATA_FILES.items():
            report["data_files"][name] = {
                "path": str(path),
                "exists": path.exists(),
                "size_mb": path.stat().st_size / (1024 * 1024) if path.exists() else None
            }

        # Summarize loaded data
        for name, df in self.loaded_data.items():
            report["loaded_data"][name] = {
                "rows": len(df),
                "columns": list(df.columns),
                "years": sorted(df['year'].dropna().unique().tolist()) if 'year' in df.columns else None
            }

        return report


def main():
    """Main function demonstrating data processor usage."""
    print("Victorian Crime Data Processor")
    print("=" * 50)

    processor = CrimeDataProcessor()

    # Show available files
    print("\nAvailable data files:")
    for name, available in processor.get_available_files().items():
        status = "[OK]" if available else "[NOT FOUND]"
        print(f"  {status} {name}")

    # Try to load 2012-2021 data
    print("\nLoading 2012-2021 Criminal Incidents data...")
    try:
        df = processor.load_criminal_incidents_2012_2021()
        print(f"  Loaded {len(df):,} rows")
        print(f"  Years: {sorted(df['year'].dropna().unique())}")
        print(f"  Columns: {list(df.columns)}")
    except FileNotFoundError as e:
        print(f"  Error: {e}")

    # Try to load 2010-2019 data
    print("\nLoading 2010-2019 Criminal Incidents data...")
    try:
        df = processor.load_criminal_incidents_2010_2019()
        print(f"  Loaded {len(df):,} rows")
        print(f"  Years: {sorted(df['year'].dropna().unique())}")
    except FileNotFoundError as e:
        print(f"  Note: {e}")
        print("\n  Run 'python download_2010_2019_data.py --download' for instructions")

    # Generate report
    report = processor.generate_report()
    print("\nData Report:")
    print(json.dumps(report, indent=2, default=str))


if __name__ == "__main__":
    main()
