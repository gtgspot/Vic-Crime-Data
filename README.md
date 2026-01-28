
# Project-1
# VICTORIA CRIME DATA ANALYTICS

![VIC_LGA_map](/../main/Figures/VIC_LGA_map.png)

## The project team
The team consisted of four members with various backgrounds and experienced that allocated by the class instructor. Regular catch ups and communications were done via Slack and zoom.

## Methodologies
We were allocted four teams members to our project group.
Together we searched publicly available data sets and choose recent "Victorian crime statistics" for data analysis.
Finalysing about 4 questions, we performed an initial analysis on this data using advanced excel techniques. 
We set about interrogating this data using python code in Jupyter Notebook. 
We utilised a number of modules including python, numpy, scipys, pandas, geopandas, matplotlib and API's.
We created a repository on Github and utilised branches to write our own code.
We then merged each branch code into the main repository.

## Findings
Several techniques had been adopted for data mining, scrapping, cleansing and visualising. Statistical calculations had also been used to project the trend and normalities of data (refer to the Jupyter notebooks for more details). <br />
Applications in used are Jupyter notebook, Jupyter lab, Anaconda, Windows terminal, Gitbash. Microsoft package was also used for importing/exporting csv data file, powerpoint presentation and report writing.<br />
Codes are stored on the open/shared platform: Github.<br />
Program language: python with various libraries such as numpy, scipys, pandas, geopandas, matplotlib, seaborn, folium, json, seasonal_decompose, os, API's, etc...

## Codes and Changes Management
Git hub is the central repository for storing source codes and files. It is also been used for managing change submissions and resolving change conflicts. <br />
Each team member produced a set of jupyter notebooks and files for their data analysing. Sub branches were created and merged to the github project's main branch after pulling the lastest updates from the main branch. When a conflict of change arised, communication via Slack had been established to revolved the issued immediately to minise the impact on others.

## Project's Objective
Based on the Victoria Crime data, the project team has to address the main four themes with their findings and observations
1. Compare crime offence by types – What is top offence types within last 10 years?
2. What is the trend of crime types over the years?
3. Top crime types by regions, what is the concentration of crime per regions?
4. What is the correlation between number of police station and number of crimes/offence status?

## Project Submission:

All the codes files are stored in the folder called [Scripts](/../main/Scripts/). Each Jyputer notebook in this Scripts folder is self-contained and can be executed individually.<br />
**NOTE:** Some depdendencies will need to be installed and imported on the local machine such as geopdandas (and its dependencies), seaborn, folium, statsmodels, plotly, shapefile <br />

All the input data files are stored in the folder [Data](/../main/Data/).<br />
The Victoria Crime findings & observations are documented in this [report](/../main/Write_up_report_final.docx)<br />
The presentation pack to showcase the findings and data visualisation can be accessed via this [PowerPoint Presentation](/../main/Crime_Victoria_PowerPoint_Presentation.pptx)<br />

## Data sources:

### Primary Datasets (2012-2021)
- Input crimes data were downloaded from the goverment website [Crime Statistics](https://www.crimestatistics.vic.gov.au/crime-statistics/latest-victorian-crime-data/download-data)

### Historical Dataset (2010-2019)
The project also includes support for the **VIC CSA - Crime Statistics - Criminal Incidents by Principal Offence (LGA) 2010-2019** dataset:

- **Time Period:** Years ending March 2010-2019
- **Geographic Boundaries:** ASGS 2011 LGA boundaries
- **Focus:** Criminal incidents by principal offence classification

**Download Sources:**
- [AURIN Data Catalogue](https://data.aurin.org.au/dataset/vic-govt-csa-csa-crime-stats-criminal-incidents-princ-offence-lga-2010-2019-lga2011) (requires institutional login)
- [data.gov.au](https://data.gov.au/dataset/ds-aurin-55c99905-75fe-49b8-a663-85b6f24b827d)
- [Crime Statistics Agency Victoria](https://www.crimestatistics.vic.gov.au/download-data-11)

**Note:** The 2010-2019 dataset uses March year-ending (vs September for the primary 2012-2021 data) and different LGA boundaries. See the [data dictionary](semantic_layer/data_dictionary.md) for details on merging these datasets.

### Other Data Sources

- Latitude of police stations from [government data source](https://data.gov.au/dataset/ds-aurin-aurin%3Adatasource-VIC_Govt_DELWP-VIC_Govt_DELWP_datavic_VMFEAT_POLICE_STATION/distribution/dist-aurin-aurin%3Adatasource-VIC_Govt_DELWP-VIC_Govt_DELWP_datavic_VMFEAT_POLICE_STATION-0/details?q=), converted this to [geojson file](/../main/Data/VMFEAT_POLICE_STATION.json) and [csv file](/../main/Data/VMFEAT_POLICE_STATION.csv)  using [mapshaper](https://mapshaper.org/)

- LGA boundaries from [government data source](https://data.gov.au/dataset/ds-dga-bdf92691-c6fe-42b9-a0e2-a4cd716fa811/distribution/dist-dga-ce0a0ed3-6003-47fd-88ad-4b49d9337d47/details?q=), and https://data.gov.au/dataset/ds-dga-bdf92691-c6fe-42b9-a0e2-a4cd716fa811/details

- LGA boundaries Json file had been saved this file in [here](/../main//Data/LGA_boundaries.json)

## Data Ingestion Tools

The project includes data processing utilities for loading and merging crime statistics:

```python
# Load and process crime data
from Scripts.data_ingestion import CrimeDataProcessor

processor = CrimeDataProcessor()

# Load 2012-2021 data
df_2012 = processor.load_criminal_incidents_2012_2021()

# Load 2010-2019 data (if available)
df_2010 = processor.load_criminal_incidents_2010_2019()

# Merge for extended time series
df_merged = processor.merge_time_series(prefer_september=True)
```

For download instructions:
```bash
python Scripts/data_ingestion/download_2010_2019_data.py --download
```

## Installation of dependencies - geopandas:

Installing extention Geopandas is required to plot geographical information, which is sometimes tricky and time consuming, below is an installation method that works:

>⦁ Go to Unofficial Windows Binaries for Python Extension Packages. (https://www.lfd.uci.edu/~gohlke/pythonlibs/)
>⦁ Download the following binaries in a specifi folder in your laptop/PC: GDAL, Pyproj, Fiona, Shapely & Geopandas

>matching the version of Python, and whether the 32-bit or 64-bit OS is installed on your laptop. (E.g. for Python v3.8x (64-bit), GDAL package should be GDAL-3.3.2-cp38-cp38-win_amd64.whl)

>Go to the folder where the binaries are downloaded in the command prompt window. (C:\Users\abc\GeoPandas dependencies) Order of execution of the following commands matter.

>pip install .\GDAL-3.3.2-cp38-cp38-win_amd64.whl
>pip install .\pyproj-3.2.0-cp38-cp38-win_amd64.whl
>pip install .\Fiona-1.8.20-cp38-cp38-win_amd64.whl
>pip install .\Shapely-1.7.1-cp38-cp38-win_amd64.whl
>pip install .\geopandas-0.9.0-py3-none-any.whl

***Credits to mpriya from [stackoverflow](https://stackoverflow.com/questions/41009215/importerror-no-module-named-geopandas)***

# Glossary
#### Charge status ####
>The charge status indicates when a charge has been laid by Victoria Police at the time these data were extracted from the LEAP database. CSA output categories for this variable include:

>- Charges Laid,
>- No Charges Laid,
>- Unsolved

>In the event that no charges have been recorded the investigation status determines whether the incident is categorised as ‘unsolved’ or ‘no charges laid’. The ‘no charges laid’ category represents all investigation statuses other than ‘unsolved’. Both charge and investigation statuses represent information at a point in time and are subject to change.

#### Investigation status:
>indicates how the offences has been dealt with by Victoria Police at the time data was extracted from the LEAP database. This status represents information at a point in time and is subject to change.
CSA output categories include:

>- Arrest/Summons
>- Caution/Official warning
>- Intent to Summons
>- Other
>- Unsolved
>- Other includes: Penalty infringement notice, caution not authorised, complaint withdrawn, notice to appear, no offence disclosed, not authorised, offender processed, warrant issued, summons not authorised, presentment and other statuses.


For more [Glossary](https://www.crimestatistics.vic.gov.au/about-the-data/glossary-and-data-dictionary)***

