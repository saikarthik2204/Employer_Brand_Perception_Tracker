import pandas as pd
import os

# Define project root (one level above nlp)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Input CSV (inside data folder)
input_path = os.path.join(BASE_DIR, "data", "microsoft_employee_raw.csv")

# Output CSV (project root to avoid OneDrive issues)
output_path = os.path.join(BASE_DIR, "microsoft_employee_filtered.csv")

# Load data
df = pd.read_csv(input_path)

employee_keywords = [
    "employee", "worked at", "working at", "work at",
    "former microsoft", "fmr microsoft",
    "layoff", "laid off",
    "manager", "management",
    "office culture", "work culture",
    "job", "career", "hr", "salary", "benefits",
    "work life", "burnout", "promotion"
]

opinion_keywords = [
    "good", "bad", "great", "worst", "better",
    "toxic", "amazing", "stress", "pressure",
    "love", "hate", "issue", "problem", "experience"
]

def is_employee_related(text):
    text = str(text).lower()
    has_employee_context = any(k in text for k in employee_keywords)
    has_opinion = any(k in text for k in opinion_keywords)
    return has_employee_context and has_opinion

# Filter employee-related tweets
df_employee = df[df["text"].apply(is_employee_related)]

# Save output
df_employee.to_csv(output_path, index=False)

print("Filtered tweets:", len(df_employee))
print("Saved to:", output_path)
