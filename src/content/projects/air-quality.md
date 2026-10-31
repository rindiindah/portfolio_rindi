---
# FEATURED PROJECT 1 · Final Project (Feb 2026)
title: "Air Quality Forecast Dashboard"
shortTitle: "Air Quality Forecast"
featured: true
order: 1
accent: sky
date: "Feb 2026"
tag: "Final Project · Cilacap Environmental Agency"
intro: "Forecasting SO₂ air quality in Cilacap so the agency can see what's coming, not only what happened."
description: "Cilacap is an industrial area where monitoring sulfur dioxide levels is important for air quality management. Existing monitoring data mainly reflects past conditions, offering limited insight into future pollution levels. To address this, I processed and analyzed approximately 15,000 historical records from the Cilacap Environmental Agency and developed machine learning models in Python to forecast SO₂ concentrations. I built an interactive web dashboard that combines historical data and predicted levels, allowing user to explore pollution trends and identify potential changes in air quality."
oneLiner: "A web dashboard showing historical and predicted SO₂ levels for Cilacap."
facts:
  - label: "Type"
    value: "Final project"
  - label: "Partner"
    value: "Cilacap Environmental Agency"
  - label: "Location"
    value: "Cilacap, Indonesia"
  - label: "Period"
    value: "Feb 2026"

# Tip: once you have your best metric (e.g. RMSE), replace this headline number with it.
keyResult:
  value: "~15,000"
  label: "historical air quality records analyzed"

tldr:
  problem: "Air quality records existed but weren't turned into forward-looking, easy-to-read information."
  approach: "Machine learning to predict SO₂ concentrations, shown in a web dashboard."
  result: "An interactive dashboard of historical and predicted SO₂."

background: "Cilacap is an industrial area where SO₂ levels matter for public health. "
problem: "Historical air quality data was available, but it wasn't presented as forward-looking, accessible information. "
objective: "Build a web-based dashboard that shows both historical and predicted SO₂ concentrations in an accessible format."

data:
  summary: "About 15,000 historical air quality records, processed and analyzed before modeling. "
  stat:
    value: "~15,000"
    label: "historical records processed"

approach: "I processed and analyzed the historical records, applied machine learning to predict SO₂ concentrations, and built interactive visualizations in Python to present the predictions and air quality trends. The related ICADEIS 2026 paper describes a hybrid LSTM–CNN model for multivariate SO₂ prediction. "
method:
  - "Collect and clean ~15,000 historical records"
  - "Train a model to predict SO₂"
  - "Evaluate the predictions"
  - "Present results in an interactive web dashboard"

tools:
  - "Python"
  - "Machine learning"
  - "Interactive visualization"
  - "Web dashboard"

results:
  summary: "A working web dashboard that presents historical and predicted SO₂ levels and air quality trends. "
  metrics:
    - label: "RMSE"
      value: ""
    - label: "MAE"
      value: ""
    - label: "R²"
      value: ""

contribution: "I developed the web-based dashboard, processed and analyzed the historical data, applied machine learning to predict SO₂, and built the interactive visualizations in Python."
insights: ""

# Two documentation slides: a screenshot of the dashboard, then a screen recording of the whole website in action.
maxSlides: 2
slides:
  - src: "/images/projects/so2_prediction/screenshot.webp"
    alt: "Screenshot of the SO₂ prediction dashboard for Cilacap"
    caption: "Dashboard: historical and predicted SO₂"
  - video: "/images/projects/so2_prediction/demo.mp4"
    poster: "/images/projects/so2_prediction/demo.webp"
    alt: "Screen recording of the SO₂ prediction website in use"
    caption: "The prediction website in action"

links:
  paper: "https://doi.org/10.1109/ICADEIS71120.2026.11644506"
  github: ""
  demo: ""
---

<!--
Optional: write extra long-form details for the case-study page below this comment.
Anything here appears at the bottom of /projects/air-quality. Delete this comment when you add text.
-->
