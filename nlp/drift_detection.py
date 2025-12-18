import pandas as pd
import os
from river.drift import ADWIN

# =====================================
# Paths
# =====================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
input_path = os.path.join(BASE_DIR, "microsoft_employee_sentiment.csv")

# =====================================
# Load dataset
# =====================================
df = pd.read_csv(input_path)

# -------------------------------------
# Fix datetime warning explicitly
# -------------------------------------
# Use UTC to avoid mixed-format warning
df["createdAt"] = pd.to_datetime(
    df["createdAt"],
    utc=True,
    errors="coerce"
)

# Drop invalid dates and sort
df = df.dropna(subset=["createdAt"])
df = df.sort_values("createdAt")

# =====================================
# Convert sentiment to numeric
# =====================================
sentiment_map = {
    "Positive": 1,
    "Neutral": 0,
    "Negative": -1
}
df["sentiment_score"] = df["sentiment"].map(sentiment_map)

# =====================================
# Weekly aggregation
# =====================================
weekly_sentiment = (
    df
    .resample("W", on="createdAt")["sentiment_score"]
    .mean()
    .dropna()
)

# =====================================
# Drift Detection (ADWIN)
# =====================================
adwin = ADWIN()   # use delta=0.01 if you want higher sensitivity
drift_weeks = []

for date, score in weekly_sentiment.items():
    adwin.update(score)
    if adwin.drift_detected:
        drift_weeks.append(date)

# =====================================
# Output Results
# =====================================
print("\nWeekly Sentiment Drift Detection Results")
print("---------------------------------------")

if drift_weeks:
    print("Drift detected on the following weeks:")
    for d in drift_weeks:
        print(d.date())
else:
    print("No significant weekly sentiment drift detected")
