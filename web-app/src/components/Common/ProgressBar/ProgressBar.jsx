import { memo } from 'react';
import PropTypes from 'prop-types';
import './ProgressBar.module.css';

/**
 * ProgressBar renders a simple percentage bar with optional label.
 */
function ProgressBar({ value, max = 100, showLabel = true, height = '8px' }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  const getColor = () => {
    if (percentage >= 67) return '#60a5fa';
    if (percentage >= 34) return '#38bdf8';
    return '#22c55e';
  };

  const color = getColor();

  return (
    <div
      className="progress-bar-container"
      title={`${value}/${max} (${percentage.toFixed(1)}%)`}
    >
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

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  showLabel: PropTypes.bool,
  height: PropTypes.string
};

export default memo(ProgressBar);

