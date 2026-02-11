"""
Flask API server for Employee Brand Perception Analytics
Serves data from the sentiment analysis pipeline to the React frontend
Supports multiple companies with dynamic company selection
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# ===============================
# Company Configuration
# ===============================
COMPANIES = {
    "microsoft": {
        "name": "Microsoft",
        "file": "microsoft_employee_sentiment.csv",
        "color": "#00A4EF",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/256px-Microsoft_logo.svg.png"
    },
    "google": {
        "name": "Google",
        "file": "google_employee_sentiment.csv",
        "color": "#4285F4",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/256px-Google_2015_logo.svg.png"
    },
    "amazon": {
        "name": "Amazon",
        "file": "amazon_employee_sentiment.csv",
        "color": "#FF9900",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/256px-Amazon_logo.svg.png"
    },
    "apple": {
        "name": "Apple",
        "file": "apple_employee_sentiment.csv",
        "color": "#555555",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/256px-Apple_logo_black.svg.png"
    },
    "meta": {
        "name": "Meta",
        "file": "meta_employee_sentiment.csv",
        "color": "#0A66C2",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/256px-Facebook_Logo_%282019%29.png"
    },
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ===============================
# Global data cache
# ===============================
_data_cache = {}
_cache_timestamp = {}

def get_data_file(company):
    """Get the data file path for a company"""
    if company not in COMPANIES:
        return None
    return os.path.join(BASE_DIR, COMPANIES[company]["file"])

def load_data(company="microsoft"):
    """Load sentiment data from CSV for a specific company"""
    global _data_cache, _cache_timestamp
    
    if company not in COMPANIES:
        print(f"[WARNING] Unknown company: {company}")
        return None
    
    data_file = get_data_file(company)
    
    if not os.path.exists(data_file):
        print(f"[WARNING] Data file not found: {data_file}")
        return None
    
    # Cache for 5 seconds per company
    now = datetime.now()
    if company in _data_cache and company in _cache_timestamp:
        if (now - _cache_timestamp[company]).total_seconds() < 5:
            return _data_cache[company]
    
    try:
        df = pd.read_csv(data_file)
        print(f"[DATA] Loaded {len(df)} records from {data_file}")
        
        df["createdAt"] = pd.to_datetime(df["createdAt"], errors="coerce")
        df = df.dropna(subset=["createdAt"])
        
        # Convert to list of dicts for JSON serialization
        data = []
        for _, row in df.iterrows():
            data.append({
                "id": str(row.get("id", "")),
                "text": str(row.get("text", "")),
                "createdAt": row["createdAt"].isoformat(),
                "sentiment": str(row.get("sentiment", "Neutral")).upper(),
                "company": company
            })
        
        _data_cache[company] = data
        _cache_timestamp[company] = now
        return data
    except Exception as e:
        print(f"[ERROR] Error loading data for {company}: {e}")
        return None

# ===============================
# API Routes
# ===============================

@app.route("/api/companies", methods=["GET"])
def get_companies():
    """Get list of available companies"""
    companies_list = [
        {
            "id": company_id,
            "name": config["name"],
            "color": config["color"],
            "logo": config["logo"],
            "available": os.path.exists(get_data_file(company_id))
        }
        for company_id, config in COMPANIES.items()
    ]
    return jsonify({"companies": companies_list})


@app.route("/api/data", methods=["GET"])
def get_data():
    """
    Get filtered sentiment data
    
    Query parameters:
    - company: company ID (default: microsoft)
    - sentiments: comma-separated list (POSITIVE, NEUTRAL, NEGATIVE)
    - startDate: ISO date string (YYYY-MM-DD)
    - endDate: ISO date string (YYYY-MM-DD)
    """
    print("[API] GET /api/data called")
    
    company = request.args.get("company", "microsoft").lower()
    data = load_data(company)
    
    if data is None:
        print("[ERROR] No data available")
        return jsonify({"error": f"Data not available for {company}. Run pipeline first."}), 404
    
    # Parse filters
    sentiments = request.args.get("sentiments", "POSITIVE,NEUTRAL,NEGATIVE").split(",")
    sentiments = [s.strip().upper() for s in sentiments]
    
    start_date_str = request.args.get("startDate")
    end_date_str = request.args.get("endDate")
    
    filtered_data = data
    
    # Filter by sentiment
    filtered_data = [d for d in filtered_data if d["sentiment"] in sentiments]
    
    # Filter by date range
    if start_date_str and end_date_str:
        try:
            start_date = datetime.fromisoformat(start_date_str)
            end_date = datetime.fromisoformat(end_date_str)
            
            filtered_data = [
                d for d in filtered_data
                if start_date <= datetime.fromisoformat(d["createdAt"]) <= end_date
            ]
        except ValueError as e:
            return jsonify({"error": f"Invalid date format: {e}"}), 400
    
    return jsonify({
        "data": filtered_data,
        "total": len(filtered_data),
        "company": company,
        "timestamp": datetime.now().isoformat()
    })

@app.route("/api/statistics", methods=["GET"])
def get_statistics():
    """
    Get statistics about the data
    
    Query parameters:
    - company: company ID (default: microsoft)
    - sentiments: comma-separated list (POSITIVE, NEUTRAL, NEGATIVE)
    - startDate: ISO date string (YYYY-MM-DD)
    - endDate: ISO date string (YYYY-MM-DD)
    """
    company = request.args.get("company", "microsoft").lower()
    data = load_data(company)
    
    if data is None:
        return jsonify({"error": f"Data not available for {company}"}), 404
    
    # Parse filters (same as /api/data)
    sentiments = request.args.get("sentiments", "POSITIVE,NEUTRAL,NEGATIVE").split(",")
    sentiments = [s.strip().upper() for s in sentiments]
    
    start_date_str = request.args.get("startDate")
    end_date_str = request.args.get("endDate")
    
    filtered_data = data
    
    # Filter by sentiment
    filtered_data = [d for d in filtered_data if d["sentiment"] in sentiments]
    
    # Filter by date range
    if start_date_str and end_date_str:
        try:
            start_date = datetime.fromisoformat(start_date_str)
            end_date = datetime.fromisoformat(end_date_str)
            
            filtered_data = [
                d for d in filtered_data
                if start_date <= datetime.fromisoformat(d["createdAt"]) <= end_date
            ]
        except ValueError as e:
            return jsonify({"error": f"Invalid date format: {e}"}), 400
    
    # Calculate statistics
    positive_count = sum(1 for d in filtered_data if d["sentiment"] == "POSITIVE")
    neutral_count = sum(1 for d in filtered_data if d["sentiment"] == "NEUTRAL")
    negative_count = sum(1 for d in filtered_data if d["sentiment"] == "NEGATIVE")
    
    total_count = len(filtered_data)
    all_data = load_data(company) or []
    
    return jsonify({
        "total": total_count,
        "positive": positive_count,
        "neutral": neutral_count,
        "negative": negative_count,
        "positive_percentage": (positive_count / total_count * 100) if total_count > 0 else 0,
        "neutral_percentage": (neutral_count / total_count * 100) if total_count > 0 else 0,
        "negative_percentage": (negative_count / total_count * 100) if total_count > 0 else 0,
        "all_data_total": len(all_data),
        "company": company,
        "timestamp": datetime.now().isoformat()
    })

@app.route("/api/date-range", methods=["GET"])
def get_date_range():
    """Get the min and max dates available in the dataset"""
    company = request.args.get("company", "microsoft").lower()
    data = load_data(company)
    
    if data is None:
        return jsonify({"error": f"Data not available for {company}"}), 404
    
    if not data:
        return jsonify({"error": "No data available"}), 404
    
    dates = [datetime.fromisoformat(d["createdAt"]) for d in data]
    min_date = min(dates)
    max_date = max(dates)
    
    return jsonify({
        "minDate": min_date.date().isoformat(),
        "maxDate": max_date.date().isoformat(),
        "company": company
    })

@app.route("/api/timeline", methods=["GET"])
def get_timeline():
    """Get sentiment timeline data grouped by date"""
    company = request.args.get("company", "microsoft").lower()
    data = load_data(company)
    
    if data is None:
        return jsonify({"error": f"Data not available for {company}"}), 404
    
    # Group by date
    timeline = {}
    for record in data:
        date = record["createdAt"].split("T")[0]  # YYYY-MM-DD
        if date not in timeline:
            timeline[date] = {"POSITIVE": 0, "NEUTRAL": 0, "NEGATIVE": 0, "total": 0}
        
        timeline[date][record["sentiment"]] += 1
        timeline[date]["total"] += 1
    
    # Sort by date
    sorted_timeline = sorted(timeline.items())
    
    return jsonify({
        "timeline": [
            {
                "date": date,
                "positive": counts["POSITIVE"],
                "neutral": counts["NEUTRAL"],
                "negative": counts["NEGATIVE"],
                "total": counts["total"]
            }
            for date, counts in sorted_timeline
        ],
        "company": company
    })

@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint"""
    company = request.args.get("company", "microsoft").lower()
    data = load_data(company)
    data_available = data is not None and len(data) > 0
    data_file = get_data_file(company)
    
    return jsonify({
        "status": "healthy" if data_available else "no_data",
        "data_available": data_available,
        "company": company,
        "data_file": data_file,
        "data_file_exists": os.path.exists(data_file) if data_file else False
    })

if __name__ == "__main__":
    print("\n" + "="*80)
    print("[FLASK] FLASK API SERVER STARTING")
    print("="*80)
    print(f"[COMPANIES] Available companies: {', '.join(COMPANIES.keys())}")
    print("\n[ENDPOINTS] Available endpoints:")
    print("  GET /api/health           - Health check")
    print("  GET /api/companies        - Get list of companies")
    print("  GET /api/data             - Get filtered data")
    print("  GET /api/statistics       - Get statistics")
    print("  GET /api/date-range       - Get available date range")
    print("  GET /api/timeline         - Get timeline data")
    print(f"\n[SERVER] Server running on http://localhost:5000")
    print("="*80 + "\n")
    
    app.run(debug=False, host="0.0.0.0", port=5000, use_reloader=False)
