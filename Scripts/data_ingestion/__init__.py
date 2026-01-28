"""
Victorian Crime Data Ingestion Package

This package provides utilities for downloading, processing, and merging
Victorian crime statistics data from multiple sources.

Modules:
    - download_2010_2019_data: Dataset information and download utilities
    - data_processor: Data loading, processing, and merging utilities

Data Sources:
    - CSA 2012-2021: Criminal Incidents (Year Ending September 2021)
    - CSA 2010-2019: Criminal Incidents by Principal Offence (Year Ending March)

Usage:
    from data_ingestion import CrimeDataProcessor

    processor = CrimeDataProcessor()
    df = processor.load_criminal_incidents_2012_2021()
"""

from .data_processor import CrimeDataProcessor

__all__ = ['CrimeDataProcessor']
__version__ = '1.0.0'
