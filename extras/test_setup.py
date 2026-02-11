#!/usr/bin/env python
"""
Quick test script to verify the pipeline is working
"""

import os
import sys
import requests
import time
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).parent

print("\n" + "="*80)
print("[VERIFY] EMPLOYEE BRAND PERCEPTION ANALYTICS - VERIFICATION TEST")
print("="*80 + "\n")

# Check 1: CSV file exists
csv_file = BASE_DIR / "microsoft_employee_sentiment.csv"
print("[CHECK] Check 1: CSV Data File")
if csv_file.exists():
    size = csv_file.stat().st_size
    print(f"  [FOUND] Found: {csv_file}")
    print(f"  [SIZE] Size: {size:,} bytes\n")
else:
    print(f"  [MISSING] NOT FOUND: {csv_file}")
    print("  Run: python run_pipeline.py (to generate data)\n")
    sys.exit(1)

# Check 2: API Server
print("[CHECK] Check 2: Flask API Server")
try:
    response = requests.get("http://localhost:5000/api/health", timeout=2)
    data = response.json()
    if data.get("data_available"):
        count = len(data.get("data", []))
        print(f"  [OK] API is running")
        print(f"  [DATA_AVAILABLE] Data available: {data.get('data_available')}")
        print(f"  [FILE] File path: {data.get('data_file')}\n")
    else:
        print(f"  [WARN] API running but no data: {data}\n")
except requests.exceptions.ConnectionError:
    print(f"  ❌ Cannot connect to Flask API at http://localhost:5000")
    print("  Start API with: python api_server.py\n")
except Exception as e:
    print(f"  ❌ Error: {e}\n")

# Check 3: React Frontend
print("[CHECK] Check 3: React Frontend")
try:
    response = requests.get("http://localhost:5173", timeout=2)
    if response.status_code == 200:
        print(f"  [OK] Frontend is running at http://localhost:5173")
        print(f"  [OPEN] Open browser to: http://localhost:5173\n")
    else:
        print(f"  [WARN] Frontend responded with status {response.status_code}\n")
except requests.exceptions.ConnectionError:
    print(f"  [MISSING] Cannot connect to React frontend at http://localhost:5173")
    print("  Start frontend with: cd react-frontend && npm run dev\n")
except Exception as e:
    print(f"  ❌ Error: {e}\n")

# Check 4: Data endpoints
print("[CHECK] Check 4: API Data Endpoints")
try:
    response = requests.get("http://localhost:5000/api/data", timeout=2)
    data = response.json()
    if response.status_code == 200:
        print(f"  [OK] /api/data endpoint working")
        print(f"  [RECORDS] Records returned: {data.get('total', 'unknown')}\n")
    else:
        print(f"  [WARN] Status code: {response.status_code}")
        print(f"  Response: {data}\n")
except Exception as e:
    print(f"  ⚠️  Cannot test /api/data: {e}\n")

print("="*80)
print("[COMPLETE] VERIFICATION COMPLETE!")
print("="*80)
print("\nNext steps:")
print("  1. Open http://localhost:5173 in your browser")
print("  2. Check browser console (F12) for any errors")
print("  3. Filter by sentiment and date range")
print("  4. If no data shows, run: python run_pipeline.py\n")
