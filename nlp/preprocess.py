import pandas as pd
import os
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Download required NLTK data (first run only)
nltk.download("stopwords")
nltk.download("wordnet")

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
input_path = os.path.join(BASE_DIR, "microsoft_employee_filtered.csv")
output_path = os.path.join(BASE_DIR, "microsoft_employee_clean.csv")

# Load data
df = pd.read_csv(input_path)

stop_words = set(stopwords.words("english"))
lemmatizer = WordNetLemmatizer()

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+", "", text)     # remove URLs
    text = re.sub(r"@\w+", "", text)        # remove mentions
    text = re.sub(r"#\w+", "", text)        # remove hashtags
    text = re.sub(r"[^a-z\s]", "", text)    # remove emojis & symbols

    words = text.split()
    words = [lemmatizer.lemmatize(w) for w in words if w not in stop_words]

    return " ".join(words)

df["clean_text"] = df["text"].apply(clean_text)

df.to_csv(output_path, index=False)

print("Text cleaning completed")
print("Saved to:", output_path)
