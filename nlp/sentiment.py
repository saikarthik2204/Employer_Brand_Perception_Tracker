import pandas as pd
import os
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
input_path = os.path.join(BASE_DIR, "microsoft_employee_clean.csv")
output_path = os.path.join(BASE_DIR, "microsoft_employee_sentiment.csv")

# Load cleaned data
df = pd.read_csv(input_path)

analyzer = SentimentIntensityAnalyzer()

def get_sentiment(text):
    score = analyzer.polarity_scores(str(text))["compound"]
    if score >= 0.05:
        return "Positive"
    elif score <= -0.05:
        return "Negative"
    else:
        return "Neutral"

# Apply sentiment analysis
df["sentiment"] = df["clean_text"].apply(get_sentiment)

# Save output
df.to_csv(output_path, index=False)

print("Sentiment analysis completed")
print(df["sentiment"].value_counts())
print("Saved to:", output_path)
