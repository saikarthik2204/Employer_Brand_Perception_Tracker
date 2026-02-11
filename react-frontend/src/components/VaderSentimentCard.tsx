import React from 'react';
import './VaderSentimentCard.css';

interface VaderSentimentCardProps {
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  total: number;
}

const VaderSentimentCard: React.FC<VaderSentimentCardProps> = ({
  positiveCount,
  neutralCount,
  negativeCount,
  total
}) => {
  const positivePercent = total > 0 ? (positiveCount / total) * 100 : 0;
  const neutralPercent = total > 0 ? (neutralCount / total) * 100 : 0;
  const negativePercent = total > 0 ? (negativeCount / total) * 100 : 0;

  return (
    <div className="vader-sentiment-card">
      <div className="vader-header">
        <h3>VADER Sentiment Analysis</h3>
        <p className="vader-description">
          Valence Aware Dictionary and sEntiment Reasoner
        </p>
      </div>

      <div className="vader-content">
        <div className="sentiment-item positive">
          <div className="sentiment-header">
            <span className="label">Positive</span>
            <span className="count">{positiveCount}</span>
          </div>
          <div className="bar-container">
            <div
              className="bar positive-bar"
              style={{ width: `${positivePercent}%` }}
            ></div>
          </div>
          <span className="percentage">{positivePercent.toFixed(1)}%</span>
        </div>

        <div className="sentiment-item neutral">
          <div className="sentiment-header">
            <span className="label">Neutral</span>
            <span className="count">{neutralCount}</span>
          </div>
          <div className="bar-container">
            <div
              className="bar neutral-bar"
              style={{ width: `${neutralPercent}%` }}
            ></div>
          </div>
          <span className="percentage">{neutralPercent.toFixed(1)}%</span>
        </div>

        <div className="sentiment-item negative">
          <div className="sentiment-header">
            <span className="label">Negative</span>
            <span className="count">{negativeCount}</span>
          </div>
          <div className="bar-container">
            <div
              className="bar negative-bar"
              style={{ width: `${negativePercent}%` }}
            ></div>
          </div>
          <span className="percentage">{negativePercent.toFixed(1)}%</span>
        </div>

        <div className="sentiment-summary">
          <div className="summary-stat">
            <span className="summary-label">Total Analyzed</span>
            <span className="summary-value">{total}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Sentiment Index</span>
            <span className="summary-value sentiment-index">
              {((positiveCount - negativeCount) / total * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="vader-info">
        <p>
          <strong>About VADER:</strong> A lexicon and rule-based sentiment
          analysis tool optimized for social media and short-form text,
          particularly effective for understanding sentiment intensity and
          polarity.
        </p>
      </div>
    </div>
  );
};

export default VaderSentimentCard;
