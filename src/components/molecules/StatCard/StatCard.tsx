import { memo } from 'react';
import styles from './StatCard.module.scss';

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
}

/**
 * Molecule StatCard component
 * Displays a single statistic with label, value, optional unit, and subtext
 */
const StatCard = memo(function StatCard({ label, value, unit, subtext }: StatCardProps) {
  return (
    <div className={styles.statCard} role="article" aria-label={`${label}: ${value}${unit || ''}`}>
      <div className={styles.statCard__label}>{label}</div>
      <div className={styles.statCard__value}>
        {value}
        {unit && <span className={styles.statCard__unit}>{unit}</span>}
      </div>
      {subtext && <div className={styles.statCard__subtext}>{subtext}</div>}
    </div>
  );
});

export default StatCard;