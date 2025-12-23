import './ProgressBar.css';

function ProgressBar({ value, max = 100, showLabel = true, height = '8px' }) {
  // Calculate percentage
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  
  // Determine color based on percentage
  const getColor = () => {
    if (percentage >= 67) return '#ef4444'; // Red
    if (percentage >= 34) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  const color = getColor();

  return (
    <div className="progress-bar-container" title={`${value}/${max} (${percentage.toFixed(1)}%)`}>
      <div className="progress-bar-track" style={{ height }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            height: '100%'
          }}
        />
      </div>
      {showLabel && (
        <span className="progress-bar-label" style={{ color }}>
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  );
}

export default ProgressBar;
