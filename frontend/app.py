import streamlit as st
import pandas as pd
import os
import subprocess
import sys
import matplotlib.pyplot as plt
from datetime import date

# ===============================
# Paths
# ===============================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, "microsoft_employee_sentiment.csv")

# ===============================
# Page config
# ===============================
st.set_page_config(
    page_title="Employee Brand Perception Tracker",
    layout="wide"
)

st.title("🏢 Employee Brand Perception Tracker")
st.caption("Microsoft • Twitter Employee Reviews • NLP + Drift Detection")

st.divider()

# ===============================
# Run pipeline button (auto-refresh)
# ===============================
col_run, col_info = st.columns([1, 4])

with col_run:
    if st.button("🚀 Run Analysis Pipeline"):
        with st.spinner("Running backend pipeline..."):
            subprocess.run(
                [sys.executable, os.path.join(BASE_DIR, "run_pipeline.py")]
            )
        st.success("Pipeline executed successfully")
        st.rerun()

with col_info:
    st.info("Re-runs filtering, sentiment analysis, and drift detection")

# ===============================
# Load data
# ===============================
if not os.path.exists(DATA_FILE):
    st.warning("No sentiment data found. Run the pipeline first.")
    st.stop()

df = pd.read_csv(DATA_FILE)

df["createdAt"] = pd.to_datetime(df["createdAt"], errors="coerce")
df = df.dropna(subset=["createdAt"])

# ===============================
# Noise filters
# ===============================
df = df = df[~df["text"].str.startswith("@") | df["text"].str.contains("employee|worked|work", case=False)]
df = df[df["text"].str.len() > 20]

if df.empty:
    st.warning("No valid employee feedback after filtering.")
    st.stop()

# ===============================
# Sidebar – Date range filter (FIXED)
# ===============================
st.sidebar.header("📅 Filters")

min_date = df["createdAt"].min().date()
max_date = df["createdAt"].max().date()

start_date, end_date = st.sidebar.date_input(
    "Select date range",
    value=(min_date, max_date),
    min_value=min_date,
    max_value=max_date
)

# Apply date filter
df = df[
    (df["createdAt"].dt.date >= start_date) &
    (df["createdAt"].dt.date <= end_date)
]

# ===============================
# Sentiment percentage cards
# ===============================
st.subheader("📊 Sentiment Overview")

total = len(df)
pos = (df["sentiment"] == "Positive").sum()
neu = (df["sentiment"] == "Neutral").sum()
neg = (df["sentiment"] == "Negative").sum()

col1, col2, col3 = st.columns(3)
col1.metric("😊 Positive", f"{(pos / total) * 100:.1f}%")
col2.metric("😐 Neutral", f"{(neu / total) * 100:.1f}%")
col3.metric("☹️ Negative", f"{(neg / total) * 100:.1f}%")

# ===============================
# Drift / alert message
# ===============================
st.subheader("🚨 Employee Perception Alert")

negative_ratio = neg / total

if negative_ratio > 0.40:
    st.error("⚠️ High negative sentiment detected among employees")
elif negative_ratio > 0.25:
    st.warning("⚠️ Noticeable increase in negative employee sentiment")
else:
    st.success("✅ Employee sentiment appears stable")

# ===============================
# Sentiment trend
# ===============================
st.subheader("📈 Employee Sentiment Trend")

sentiment_map = {"Positive": 1, "Neutral": 0, "Negative": -1}
df["sentiment_score"] = df["sentiment"].map(sentiment_map)

trend = df.groupby(df["createdAt"].dt.date)["sentiment_score"].mean()

fig, ax = plt.subplots(figsize=(10, 4))
ax.plot(trend.index, trend.values)
ax.axhline(0, linestyle="--")
ax.set_xlabel("Date")
ax.set_ylabel("Average Sentiment")
ax.set_title("Employee Brand Perception Over Time")
plt.xticks(rotation=45)

st.pyplot(fig)

# ===============================
# Employee feedback table
# ===============================
st.subheader("🧾 Employee Feedback (Cleaned)")

st.dataframe(
    df[["createdAt", "text", "sentiment"]]
    .sort_values("createdAt", ascending=False)
    .head(25),
    use_container_width=True
)
