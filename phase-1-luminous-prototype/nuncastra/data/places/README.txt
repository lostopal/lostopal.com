Nuncastra Local Place Index
===========================

These generated search shards keep typed city and ZIP-code queries in the
visitor's browser. They contain worldwide GeoNames cities with a population of
roughly 5,000 or more (plus administrative centers), U.S. postal-code records,
and official U.S. Census Gazetteer places.

GeoNames data is licensed under Creative Commons Attribution 4.0.
https://www.geonames.org/export/

U.S. Census Gazetteer data is produced by the United States Census Bureau.
https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html

Run update_nuncastra_place_index.ps1 from the repository root to download the
current source datasets and rebuild the compact JSON shards. Raw vendor files
are processed in a temporary directory and are not committed to the site.
