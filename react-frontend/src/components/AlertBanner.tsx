import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedbackRecord, Sentiment } from '../types';
import { calculateSentimentStats, getPeriodComparison, calculatePercentageChange } from '../utils/dashboardAnalytics';

interface AlertBannerProps {
  data: FeedbackRecord[];
  dateRange: { start: string; end: string };
}

const AlertBanner: React.FC<AlertBannerProps> = ({ data, dateRange }) => {
  const alerts = useMemo(() => {
    const alertList: Array<{
      type: 'threshold' | 'drift';
      message: string;
      severity: 'warning' | 'critical';
    }> = [];

    const stats = calculateSentimentStats(data);
    const { previous } = getPeriodComparison(data, dateRange);

    // Check negative sentiment threshold
    if (stats.negativePercent > 15) {
      const severity = stats.negativePercent > 25 ? 'critical' : 'warning';
      alertList.push({
        type: 'threshold',
        message: `Negative sentiment at ${stats.negativePercent.toFixed(1)}% exceeds threshold of 15%.`,
        severity
      });
    }

    // Check sentiment drift
    const negDrift = calculatePercentageChange(stats.negative, previous.stats.negative);
    if (Math.abs(negDrift) > 10 && negDrift > 0) {
      alertList.push({
        type: 'drift',
        message: `Negative sentiment increased by ${negDrift.toFixed(1)}% vs previous period.`,
        severity: negDrift > 20 ? 'critical' : 'warning'
      });
    }

    return alertList;
  }, [data, dateRange]);

  return (
    <AnimatePresence mode="wait">
      {alerts.length > 0 && (
        <motion.div
          key="alerts"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-3 mb-6"
        >
          {alerts.map((alert, idx) => (
            <div
              key={`${alert.type}-${idx}`}
              className={`rounded-lg p-4 border flex items-start space-x-3 ${
                alert.severity === 'critical'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${
                  alert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'
                }`}
              >
                !
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${
                    alert.severity === 'critical' ? 'text-red-900' : 'text-amber-900'
                  }`}
                >
                  {alert.severity === 'critical' ? 'Critical Alert' : 'Warning'}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    alert.severity === 'critical' ? 'text-red-700' : 'text-amber-700'
                  }`}
                >
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertBanner;
