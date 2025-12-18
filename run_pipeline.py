import subprocess
import sys

scripts = [
    "nlp/employee_filter.py",
    "nlp/preprocess.py",
    "nlp/sentiment.py",
    "nlp/drift_detection.py"
]

print("\n🚀 Starting Brand Perception Pipeline\n")

for script in scripts:
    print(f"▶ Running {script} ...")

    result = subprocess.run(
        [sys.executable, script],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print(f"\n❌ Error while running {script}")
        print(result.stderr)
        break
    else:
        print(result.stdout)

print("\n✅ Pipeline execution completed\n")
