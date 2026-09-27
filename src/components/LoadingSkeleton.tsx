import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

const LoadingSkeleton = ({
  width = '100%',
  height = '20px',
  className = '',
}: LoadingSkeletonProps) => {
  return <div className={`loading-skeleton ${className}`} style={{ width, height }} />;
};

export default LoadingSkeleton;