import pandas as pd
import random
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
input_path = os.path.join(BASE_DIR, "data", "microsoft_employee_raw.csv")
output_path = os.path.join(BASE_DIR, "data", "microsoft_employee_augmented.csv")

df = pd.read_csv(input_path)

# Paraphrasing templates
prefixes = [
    "In my experience,", "Honestly,", "From what I see,",
    "As an employee,", "Personally,", "Currently,"
]

suffixes = [
    "overall.", "in general.", "for most employees.",
    "based on my experience.", "these days."
]

augmented_rows = []

for _, row in df.iterrows():
    text = row["text"]
    date = row["createdAt"]

    # Add original
    augmented_rows.append({
        "text": text,
        "createdAt": date
    })

    # Generate synthetic samples
    for _ in range(8):  # 8 new per row
        new_text = f"{random.choice(prefixes)} {text} {random.choice(suffixes)}"

        augmented_rows.append({
            "text": new_text,
            "createdAt": date
        })

aug_df = pd.DataFrame(augmented_rows)

aug_df.to_csv(output_path, index=False)

print("Original size:", len(df))
print("Augmented size:", len(aug_df))
print("Saved to:", output_path)
