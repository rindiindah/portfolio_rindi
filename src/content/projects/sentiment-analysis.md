---
# FEATURED PROJECT 2 · NLP Course Group Project (Nov–Dec 2025)
title: "Deforestation Impact Sentiment Analysis"
shortTitle: "Deforestation Sentiment"
featured: true
order: 3
accent: aqua
date: "Nov–Dec 2025"
tag: "NLP Course Group Project"
intro: "What does the Indonesian public actually feel about deforestation, and does it differ by platform?"
description: "Deforestation is a major environmental issue, and what people say about it is scattered across social media. I collected about 2,000 Indonesian opinions by crawling X, YouTube and online news, cleaned the text, and used TF-IDF with Logistic Regression and SVM to classify each opinion as positive, negative or neutral. The results are shown in an interactive Streamlit dashboard with sentiment charts, word clouds and insights per platform. About 48% of opinions were neutral, 32% negative and 20% positive, and X turned out to be the most critical platform."
oneLiner: "Sentiment classification of 1,987 public opinions from X, YouTube, and news."
facts:
  - label: "Type"
    value: "Natural Language Processing course, group project"
  - label: "Language"
    value: "Indonesian text"
  - label: "Platforms"
    value: "X/Twitter, YouTube, online news"
  - label: "Period"
    value: "Nov–Dec 2025"

keyResult:
  value: "1,987"
  label: "opinion records analyzed across 3 sources"

tldr:
  problem: "Public opinion on deforestation is scattered across social media, video comments, and news."
  approach: "Indonesian text preprocessing, TF-IDF, and a Logistic Regression vs SVM comparison."
  result: "An interactive Streamlit dashboard with sentiment distribution, word clouds, per-platform analysis, and strategic recommendations. [TO FILL: model accuracy / F1]"

background: "Deforestation is a major environmental issue, and public opinion about it is spread across social media, video comments, and online news."
problem: "There was no single view of how people actually feel about deforestation, or whether sentiment differs between platforms."
objective: "Classify public opinion into positive, negative, and neutral, and compare sentiment across platforms in an interactive dashboard."

data:
  summary: "2,211 public opinion records collected from X/Twitter, YouTube, and online news, which became 1,987 records after cleaning and preparation."
  stat:
    value: "2,211 → 1,987"
    label: "records collected → prepared for analysis"

approach: "I preprocessed the Indonesian text and applied TF-IDF to 1,589 documents with 7,808 features for 3-class sentiment classification (positive, negative, neutral). I then compared Logistic Regression and SVM, and presented the findings in a Streamlit dashboard."
method:
  - "Collect 2,211 opinions from X, YouTube, and news"
  - "Clean and preprocess Indonesian text (1,987 records)"
  - "TF-IDF: 1,589 documents × 7,808 features"
  - "Compare Logistic Regression vs SVM"
  - "Present in a Streamlit dashboard"

tools:
  - "Python"
  - "TF-IDF"
  - "Logistic Regression"
  - "SVM"
  - "Streamlit"
  - "[TO FILL: libraries, e.g. scikit-learn, pandas]"

results:
  summary: "The dashboard shows that public sentiment is fairly balanced: 48.2% neutral, 32.2% negative (639 opinions) and 19.6% positive (389). It differs by platform: X/Twitter is the most critical, YouTube is mostly neutral, and online news leans positive. Negative word clouds are dominated by words like 'rusak', 'ilegal', 'kebakaran' and 'kerusakan', while positive ones highlight 'lestari', 'rehabilitasi', 'reboisasi' and 'pelestarian'. [TO FILL: add accuracy / F1 for both models and which one won]"
  metrics:
    - label: "Logistic Regression (F1)"
      value: "[TO FILL]"
    - label: "SVM (F1)"
      value: "[TO FILL]"
    - label: "Best model"
      value: "[TO FILL]"

contribution: "I collected and processed the opinion data, performed the Indonesian text preprocessing and TF-IDF, compared the two models, and presented the results in the dashboard. [TO FILL: note which parts were yours within the team]"
insights: "[TO FILL: 1–2 lessons learned, e.g. challenges of Indonesian text, differences between platforms]"

# Two documentation slides: a screen recording of the dashboard, then the word clouds.
maxSlides: 2
slides:
  - video: "/images/projects/deforestation/deforestation.mp4"
    alt: "Screen recording of the deforestation sentiment dashboard in use"
    caption: "The sentiment dashboard in action"
  - src: "/images/projects/deforestation/deforestation2.webp"
    alt: "Word clouds of negative and positive words about deforestation in Indonesian"
    caption: "Word clouds: what people criticize vs. what they want to protect"

links:
  paper: ""
  github: ""
  demo: ""
---

<!--
Optional: write extra long-form details for the case-study page below this comment.
-->
