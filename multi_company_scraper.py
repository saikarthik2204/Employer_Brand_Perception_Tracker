"""
Multi-Company Employee Sentiment Data Collection Pipeline
Supports: Microsoft, Google, Amazon, Apple, Meta
"""

import os
import pandas as pd
from datetime import datetime, timedelta
import random
import json

# ===============================
# Company Configurations
# ===============================
COMPANIES_CONFIG = {
    "microsoft": {
        "name": "Microsoft",
        "sites": ["glassdoor.com", "indeed.com", "linkedin.com"],
        "keywords": ["microsoft", "msft", "windows", "azure", "office365"],
        "sample_size": 1000
    },
    "google": {
        "name": "Google",
        "sites": ["glassdoor.com", "indeed.com", "linkedin.com"],
        "keywords": ["google", "alphabet", "gmail", "android", "search"],
        "sample_size": 1000
    },
    "amazon": {
        "name": "Amazon",
        "sites": ["glassdoor.com", "indeed.com", "linkedin.com"],
        "keywords": ["amazon", "aws", "alexa", "prime", "logistics"],
        "sample_size": 1000
    },
    "apple": {
        "name": "Apple",
        "sites": ["glassdoor.com", "indeed.com", "linkedin.com"],
        "keywords": ["apple", "iphone", "macos", "ipad", "siri"],
        "sample_size": 1000
    },
    "meta": {
        "name": "Meta",
        "sites": ["glassdoor.com", "indeed.com", "linkedin.com"],
        "keywords": ["meta", "facebook", "whatsapp", "instagram", "reels"],
        "sample_size": 1000
    }
}

# ===============================
# Sample Review Data Pool
# ===============================
POSITIVE_REVIEWS = [
    "Great company culture and benefits package",
    "Excellent work-life balance and flexibility",
    "Amazing teammates and mentorship opportunities",
    "Good salary and career growth potential",
    "Love the innovation and cutting-edge tech",
    "Supportive management and clear career path",
    "Fantastic perks and office amenities",
    "Great team collaboration and communication",
    "Excellent health insurance and retirement plans",
    "Love working with smart and talented people"
]

NEGATIVE_REVIEWS = [
    "Management lacks transparency and communication",
    "Work-life balance is poor, too many long hours",
    "Limited career growth opportunities",
    "Compensation does not match industry standards",
    "Outdated tech stack and processes",
    "Poor work environment and toxic culture",
    "Lack of diversity and inclusion initiatives",
    "Slow decision making and bureaucracy",
    "Limited support for remote work",
    "Unfair promotion and performance review process"
]

NEUTRAL_REVIEWS = [
    "It's an okay place to work overall",
    "Average job, nothing special",
    "Work environment is neutral, typical corporate",
    "Pay is average for the industry",
    "Standard benefits like other tech companies",
    "Decent team but could be better",
    "No major complaints but no standouts either",
    "Similar to other large tech companies",
    "Meeting expectations but nothing extraordinary",
    "Regular corporate job with pros and cons"
]

# ===============================
# Data Generation (Demo Purpose)
# ===============================
def generate_sample_data(company: str, count: int = 100) -> pd.DataFrame:
    """
    Generate sample employee review data for demonstration.
    In production, this would scrape actual review sites.
    """
    company_config = COMPANIES_CONFIG.get(company)
    if not company_config:
        raise ValueError(f"Unknown company: {company}")

    records = []
    base_date = datetime.now() - timedelta(days=180)

    for i in range(count):
        random_type = random.choice(['positive', 'neutral', 'negative'])

        if random_type == 'positive':
            text = random.choice(POSITIVE_REVIEWS)
            sentiment = 'Positive'
        elif random_type == 'neutral':
            text = random.choice(NEUTRAL_REVIEWS)
            sentiment = 'Neutral'
        else:
            text = random.choice(NEGATIVE_REVIEWS)
            sentiment = 'Negative'

        records.append({
            'id': f"{company}_{i:06d}",
            'text': text,
            'clean_text': text,
            'createdAt': (base_date + timedelta(days=random.randint(0, 180))).isoformat(),
            'sentiment': sentiment,
            'source': random.choice(company_config['sites']),
            'rating': random.randint(2, 5) if sentiment == 'Positive' else random.randint(1, 3)
        })

    return pd.DataFrame(records)

# ===============================
# Data Scraping Configuration
# ===============================
SCRAPER_CONFIG = {
    "glassdoor": {
        "url": "https://www.glassdoor.com/Reviews/index.htm",
        "selectors": {
            "reviews": ".v2__EIReviewsComponent",
            "rating": ".v2__ratingCell",
            "title": ".v2__reviewTitle",
            "text": ".v2__reviewBody"
        },
        "requires_js": True,
        "timeout": 30
    },
    "indeed": {
        "url": "https://www.indeed.com/cmp/{company}/reviews",
        "selectors": {
            "reviews": ".reviewsModule",
            "rating": ".rating",
            "title": ".reviewTitle",
            "text": ".reviewBody"
        },
        "requires_js": False,
        "timeout": 15
    },
    "linkedin": {
        "url": "https://www.linkedin.com/company/{company}/reviews/",
        "selectors": {
            "reviews": ".org-review-item",
            "rating": ".org-review-rating",
            "title": ".org-review-title",
            "text": ".org-review-body"
        },
        "requires_js": True,
        "timeout": 30
    }
}

# ===============================
# Helper Functions
# ===============================
def create_scraper_for_company(company: str):
    """
    Factory function to create appropriate scraper for each company.
    This is a template - implement actual scrapers using Selenium/Scrapy.
    """
    config = COMPANIES_CONFIG.get(company)
    if not config:
        raise ValueError(f"Unknown company: {company}")

    class CompanyScraper:
        def __init__(self, company_name: str):
            self.company = company_name
            self.config = COMPANIES_CONFIG[company_name]

        def scrape_glassdoor(self):
            """Scrape Glassdoor reviews"""
            # Implementation would use Selenium for JavaScript rendering
            print(f"Scraping Glassdoor for {self.company} reviews...")
            # Example: Use Selenium to load page, find reviews
            # return list of review texts

        def scrape_indeed(self):
            """Scrape Indeed reviews"""
            # Implementation would use BeautifulSoup
            print(f"Scraping Indeed for {self.company} reviews...")
            # Example: Use requests + BeautifulSoup
            # return list of review texts

        def scrape_linkedin(self):
            """Scrape LinkedIn reviews"""
            # Implementation would use Selenium
            print(f"Scraping LinkedIn for {self.company} reviews...")
            # Example: Use Selenium with auth
            # return list of review texts

        def run(self) -> pd.DataFrame:
            """Run all scrapers and combine results"""
            all_reviews = []

            try:
                glassdoor_reviews = self.scrape_glassdoor()
                all_reviews.extend(glassdoor_reviews or [])
            except Exception as e:
                print(f"Glassdoor scraping failed: {e}")

            try:
                indeed_reviews = self.scrape_indeed()
                all_reviews.extend(indeed_reviews or [])
            except Exception as e:
                print(f"Indeed scraping failed: {e}")

            try:
                linkedin_reviews = self.scrape_linkedin()
                all_reviews.extend(linkedin_reviews or [])
            except Exception as e:
                print(f"LinkedIn scraping failed: {e}")

            print(f"Collected {len(all_reviews)} reviews for {self.company}")
            return all_reviews

    return CompanyScraper(company)

# ===============================
# Main Pipeline
# ===============================
if __name__ == "__main__":
    print("\n" + "="*80)
    print("[PIPELINE] Multi-Company Employee Sentiment Collection")
    print("="*80)

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    for company, config in COMPANIES_CONFIG.items():
        print(f"\n[{company.upper()}] Processing {config['name']}...")

        # Generate sample data for demonstration
        # In production: data = create_scraper_for_company(company).run()
        df = generate_sample_data(company, count=config['sample_size'])

        # Save raw data
        raw_file = os.path.join(BASE_DIR, f"{company}_employee_raw.csv")
        df.to_csv(raw_file, index=False)
        print(f"  ✓ Raw data saved: {raw_file}")

        # Display stats
        print(f"  ✓ Records collected: {len(df)}")
        print(f"  ✓ Date range: {df['createdAt'].min()} to {df['createdAt'].max()}")
        print(f"  ✓ Sources: {df['source'].unique().tolist()}")

    print("\n" + "="*80)
    print("[SUCCESS] Data collection pipeline completed")
    print("[NEXT] Run the sentiment analysis pipeline (sentiment.py)")
    print("="*80 + "\n")
