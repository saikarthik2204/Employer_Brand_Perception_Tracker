import pandas as pd
import os
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# ===============================
# Paths
# ===============================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
input_path = os.path.join(BASE_DIR, "microsoft_employee_clean.csv")
output_path = os.path.join(BASE_DIR, "microsoft_employee_sentiment.csv")

# ===============================
# Load cleaned data
# ===============================
df = pd.read_csv(input_path)

analyzer = SentimentIntensityAnalyzer()

# ===============================
# CALIBRATED SENTIMENT FUNCTION
# ===============================
# Reason:
# Default VADER thresholds are too harsh for employee/corporate language.
# These thresholds produce realistic, non-fake distributions.
def get_sentiment(text):
    score = analyzer.polarity_scores(str(text))["compound"]

    if score >= 0.2:
        return "Positive"
    elif score <= -0.2:
        return "Negative"
    else:
        return "Neutral"

# Apply sentiment classification
df["sentiment"] = df["clean_text"].apply(get_sentiment)

# Save results
df.to_csv(output_path, index=False)

# ===============================
# Debug summary (VERY USEFUL)
# ===============================
print("Sentiment analysis completed")
print(df["sentiment"].value_counts())
print("Saved to:", output_path)
