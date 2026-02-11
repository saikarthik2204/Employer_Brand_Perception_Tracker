import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedbackRecord, Sentiment } from '../types';
import { calculateSentimentDrift, calculateSentimentCounts } from '../utils/analytics';

interface SentimentAlertBannerProps {
  data: FeedbackRecord[];
  allData: FeedbackRecord[];
  negativeThreshold?: number; // Default 15%
}

const SentimentAlertBanner: React.FC<SentimentAlertBannerProps> = ({
  data,
  allData,
  negativeThreshold = 15
}) => {
  const alerts = useMemo(() => {
    const alertList: Array<{
      type: 'negative' | 'drift';
      message: string;
      severity: 'warning' | 'critical';
    }> = [];

    // Check negative sentiment threshold
    const counts = calculateSentimentCounts(data);
    const negativePercent = (counts[Sentiment.NEGATIVE] / counts.total) * 100;

    if (negativePercent > negativeThreshold) {
      const severity = negativePercent > 25 ? 'critical' : 'warning';
      alertList.push({
        type: 'negative',
        message: `Negative sentiment at ${negativePercent.toFixed(1)}% exceeds threshold of ${negativeThreshold}%.`,
        severity
      });
    }

    // Check for sentiment drift
    const { driftDetected, negativeIncrease, changePercent } = calculateSentimentDrift(
      data.slice(0, Math.ceil(data.length / 2)),
      data.slice(Math.ceil(data.length / 2))
    );

    if (driftDetected && negativeIncrease) {
      alertList.push({
        type: 'drift',
        message: `Negative sentiment increased by ${Math.abs(changePercent).toFixed(1)}% between periods. Monitor closely.`,
        severity: changePercent > 20 ? 'critical' : 'warning'
      });
    }

    return alertList;
  }, [data, negativeThreshold]);

  return (
    <AnimatePresence mode="wait">
      {alerts.length > 0 && (
        <motion.div
          key="alert-banner"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          {alerts.map((alert, index) => (
            <div
              key={`${alert.type}-${index}`}
              className={`rounded-lg p-4 flex items-start space-x-3 border ${
                alert.severity === 'critical'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              {/* Icon */}
              <div
                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  alert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'
                }`}
              >
                {alert.severity === 'critical' ? '!' : '⚠'}
              </div>

              {/* Message */}
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${
                    alert.severity === 'critical' ? 'text-red-900' : 'text-amber-900'
                  }`}
                >
                  {alert.severity === 'critical' ? 'Critical Alert' : 'Warning'}
                </p>
                <p
                  className={`text-sm mt-0.5 ${
                    alert.severity === 'critical' ? 'text-red-700' : 'text-amber-700'
                  }`}
                >
                  {alert.message}
                </p>
              </div>

              {/* Status indicator */}
              <div className={`flex-shrink-0 h-2 w-2 rounded-full ${
                alert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'
              } animate-pulse`}></div>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SentimentAlertBanner;
