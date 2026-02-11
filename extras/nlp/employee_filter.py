import pandas as pd
import os
import re

# ===============================
# Paths
# ===============================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
input_path = os.path.join(BASE_DIR, "data", "microsoft_employee_raw.csv")
output_path = os.path.join(BASE_DIR, "microsoft_employee_filtered.csv")

# ===============================
# Load raw data
# ===============================
df = pd.read_csv(input_path)
print("RAW DATA SIZE:", len(df))   # 🔍 DEBUG (IMPORTANT)

# ===============================
# Employee-related keywords
# ===============================
employee_keywords = [
    "employee",
    "worked at", "working at", "work at",
    "former microsoft", "fmr microsoft",
    "layoff", "laid off", "layoffs",
    "manager", "management",
    "office culture", "work culture",
    "job", "career", "hr", "salary", "benefits",
    "work life", "burnout", "promotion"
]

# Strong fallback signals
strong_employee_signals = [
    "my team", "my manager", "my role",
    "years at microsoft", "at microsoft for",
    "joined microsoft", "left microsoft"
]

# ===============================
# Helper functions
# ===============================
def keyword_match(text, keyword):
    """
    Use word-boundary regex for single words
    Use substring match for phrases
    """
    if " " in keyword:
        return keyword in text
    else:
        return re.search(rf"\b{keyword}\b", text) is not None


def is_employee_tweet(text):
    if not isinstance(text, str):
        return False

    text = text.lower()

    # Microsoft context (mandatory)
    if not ("microsoft" in text or "msft" in text):
        return False

    # Keyword match
    keyword_hit = any(
        keyword_match(text, kw) for kw in employee_keywords
    )

    # Fallback signals
    fallback_hit = any(
        signal in text for signal in strong_employee_signals
    )

    return keyword_hit or fallback_hit


# ===============================
# Apply filtering
# ===============================
df_employee = df[df["text"].apply(is_employee_tweet)].copy()

# ===============================
# Save filtered output
# ===============================
df_employee.to_csv(output_path, index=False)

# ===============================
# Debug output
# ===============================
print("Filtered tweets:", len(df_employee))
print("Saved to:", output_path)
