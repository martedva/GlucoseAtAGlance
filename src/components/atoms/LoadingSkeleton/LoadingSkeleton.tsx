import { memo } from 'react';
import styles from './LoadingSkeleton.module.scss';

export interface LoadingSkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

/**
 * Atomic LoadingSkeleton component
 * Animated placeholder for loading states
 */
const LoadingSkeleton = memo(function LoadingSkeleton({
  width = '100%',
  height = '20px',
  className = '',
}: LoadingSkeletonProps) {
  const classNames = [styles.loadingSkeleton, className].filter(Boolean).join(' ');

  return <div className={classNames} style={{ width, height }} />;
});

export default LoadingSkeleton;