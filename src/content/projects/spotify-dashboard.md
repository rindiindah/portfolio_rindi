---
# OTHER PROJECT · shown in the "Another projects" grid (featured: false)
title: "Spotify Music Preference Dashboard"
shortTitle: "Spotify Music Dashboard"
featured: false
order: 5
accent: aqua
date: "Dec 2025"
tag: "Big Data Management Course Group Project"
intro: "Comparing music trends across countries with about 100,000 records crawled from YouTube, X, and Spotify."
description: "Music taste differs from country to country and the clues are spread across platforms. For this Big Data Management course project, crawled about 100,000 records from Spotify, YouTube and X (Twitter), then stored and managed them in Databricks. The data was processed with PySpark in Python, and the cleaned results were turned into a Power BI dashboard that gives insights into the Spotify charts."
oneLiner: "About 100,000 records crawled from YouTube, X, and Spotify to compare music trends across countries."
facts:
  - label: "Type"
    value: "Big Data Management course, group project"
  - label: "Sources"
    value: "YouTube, X, Spotify"
  - label: "Period"
    value: "Dec 2025"

keyResult:
  value: "~100,000"
  label: "records crawled from 3 platforms"

background: "Music preferences differ between countries, and the signals about them are spread across several platforms."
problem: "Comparing music trends across countries requires collecting and combining large amounts of data from different sources."
objective: "Analyze differences in music preferences across countries with a dashboard backed by a big data pipeline."

data:
  summary: "Approximately 100,000 records collected by crawling YouTube, X, and Spotify."
  stat:
    value: "~100,000"
    label: "records crawled"

approach: "Data went through collection, ingestion, storage, and preprocessing with PySpark, and was then visualized in a Power BI dashboard."
method:
  - "Crawl data from YouTube, X, and Spotify"
  - "Ingest and store the data"
  - "Preprocess with PySpark"
  - "Visualize in Power BI"

tools:
  - "PySpark"
  - "Power BI"
  - "Data crawling"

results:
  summary: "A Power BI dashboard that visualizes and compares music trends across countries. [TO FILL: add 1–2 findings]"

contribution: "[TO FILL: your part of the group work]"
insights: "[TO FILL: 1–2 lessons learned]"

# Two documentation slides: the Power BI dashboard, then the Databricks workspace holding the data.
maxSlides: 2
slides:
  - src: "/images/projects/spotify/dasboard1.png"
    alt: "Power BI dashboard of the Spotify Chart 2018-2021 with region and artist filters, total streams, streams by title and a ranking table"
    caption: "Power BI dashboard: Spotify Chart 2018–2021"
  - src: "/images/projects/spotify/databrics.png"
    alt: "Databricks Catalog Explorer showing the tubes_bigdata volume with the Spotify CSV files and the cleaned spotify_clean and x_yt_clean tables"
    caption: "Databricks: raw Spotify, X and YouTube files and the cleaned tables"

links:
  paper: ""
  github: ""
  demo: ""
  report: ""
---
