import './ProgressBar.css';

function ProgressBar({ value, max = 100, showLabel = true, height = '8px' }) {
  // Calculate percentage
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  
  // Determine color based on percentage
  const getColor = () => {
    // Use a calmer blue-green scale so this column doesn't dominate
    if (percentage >= 67) return '#60a5fa'; // brighter blue
    if (percentage >= 34) return '#38bdf8'; // mid blue
    return '#22c55e'; // green for low/medium
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

