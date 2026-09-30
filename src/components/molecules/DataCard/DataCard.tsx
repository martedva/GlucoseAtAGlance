import { memo } from 'react';
import './DataCard.css';

export interface DataCardProps {
  children: React.ReactNode;
  className?: string;
  role?: string;
  'aria-label'?: string;
}

/**
 * Molecule DataCard component
 * A prominent card container for displaying data visualizations
 */
const DataCard = memo(function DataCard({ children, className = '', role, 'aria-label': ariaLabel }: DataCardProps) {
  return (
    <div className={`data-card ${className}`} role={role} aria-label={ariaLabel}>
      {children}
    </div>
  );
});

export default DataCard;