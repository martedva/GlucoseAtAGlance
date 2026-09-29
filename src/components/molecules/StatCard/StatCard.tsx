import { memo } from 'react';
import './StatCard.css';

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
    <div className="stat-card" role="article" aria-label={`${label}: ${value}${unit || ''}`}>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">
        {value}
        {unit && <span className="stat-card__unit">{unit}</span>}
      </div>
      {subtext && <div className="stat-card__subtext">{subtext}</div>}
    </div>
  );
});

export default StatCard;