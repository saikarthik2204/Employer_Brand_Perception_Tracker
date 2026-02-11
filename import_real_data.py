"""
Data Import & Processing Script
Imports real CSV files from Downloads and processes them through sentiment analysis
"""

import os
import pandas as pd
import shutil
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# ===============================
# File Paths
# ===============================
DOWNLOADS_DIR = os.path.expanduser("~/Downloads")
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

# Source files in Downloads
SOURCE_FILES = {
    "google": "google_employee_raw_1000 (1).csv",
    "amazon": "amazon_employee_raw_1000.csv",
    "apple": "apple_employee_raw_1000.csv",
    "meta": "meta_employee_raw_1000.csv"
}

# ===============================
# VADER Analyzer Setup
# ===============================
analyzer = SentimentIntensityAnalyzer()

def get_sentiment(text):
    """VADER sentiment analysis with calibrated thresholds"""
    score = analyzer.polarity_scores(str(text))["compound"]
    
    if score >= 0.2:
        return "Positive"
    elif score <= -0.2:
        return "Negative"
    else:
        return "Neutral"

# ===============================
# Import & Process Files
# ===============================
print("\n" + "="*80)
print("[IMPORT] Real Data Files - Processing")
print("="*80)

for company, filename in SOURCE_FILES.items():
    source_path = os.path.join(DOWNLOADS_DIR, filename)
    
    # Check if file exists
    if not os.path.exists(source_path):
        print(f"\n❌ [{company.upper()}] File not found: {source_path}")
        continue
    
    try:
        # Read source file
        print(f"\n[{company.upper()}] Reading file: {filename}")
        df = pd.read_csv(source_path)
        
        print(f"  ✓ Loaded {len(df)} records")
        
        # Display columns
        print(f"  ✓ Columns: {df.columns.tolist()}")
        
        # Identify text column (try common names)
        text_column = None
        for col in ['text', 'clean_text', 'review', 'comment', 'feedback']:
            if col in df.columns:
                text_column = col
                break
        
        # If no common name found, use first string column
        if text_column is None:
            for col in df.columns:
                if df[col].dtype == 'object':
                    text_column = col
                    break
        
        if text_column is None:
            print(f"  ❌ Could not identify text column")
            continue
        
        print(f"  ✓ Text column: {text_column}")
        
        # Prepare data
        df['text'] = df[text_column]
        df['clean_text'] = df[text_column]
        
        # Ensure createdAt exists
        if 'createdAt' not in df.columns and 'created_at' in df.columns:
            df['createdAt'] = df['created_at']
        elif 'createdAt' not in df.columns:
            from datetime import datetime, timedelta
            base_date = datetime.now()
            df['createdAt'] = [
                (base_date - timedelta(days=int(i/5))).isoformat()
                for i in range(len(df))
            ]
        
        # Add company field
        df['company'] = company
        
        # Apply VADER sentiment analysis
        print(f"  ⏳ Analyzing sentiment...")
        df['sentiment'] = df['clean_text'].apply(get_sentiment)
        
        # Display sentiment distribution
        sentiment_counts = df['sentiment'].value_counts()
        print(f"  ✓ Sentiment Distribution:")
        for sentiment, count in sentiment_counts.items():
            pct = (count / len(df)) * 100
            print(f"      {sentiment}: {count} ({pct:.1f}%)")
        
        # Save as raw file (backup)
        raw_output = os.path.join(PROJECT_DIR, f"{company}_employee_raw.csv")
        df.to_csv(raw_output, index=False)
        print(f"  ✓ Saved raw: {raw_output}")
        
        # Save as sentiment file (processed)
        sentiment_output = os.path.join(PROJECT_DIR, f"{company}_employee_sentiment.csv")
        df.to_csv(sentiment_output, index=False)
        print(f"  ✓ Saved sentiment: {sentiment_output}")
        
    except Exception as e:
        print(f"  ❌ Error processing {company}: {e}")

print("\n" + "="*80)
print("[SUCCESS] Data import and processing complete!")
print("[NEXT] Restart API server and select companies from dropdown")
print("="*80 + "\n")
