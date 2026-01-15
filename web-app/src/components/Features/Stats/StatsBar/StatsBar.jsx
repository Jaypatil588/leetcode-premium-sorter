import React, { memo } from 'react';
import PropTypes from 'prop-types';
import './StatsBar.module.css';

/**
 * StatsBar displays top-level progress metrics.
 */
function StatsBar({
  totalSolvedLc,
  solvedPercent,
  goal,
  totalRevised,
  revisedPercent,
  companyStats,
  selectedCompanies
}) {
  return (
    <div className="stats-bar">
      <div className="stat-card">
        <div className="stat-label">LC Solved</div>
        <div className="stat-value">{totalSolvedLc}</div>
        <span className="text-muted small">
          {solvedPercent}% of {goal}
        </span>
      </div>
      <div className="stat-card">
        <div className="stat-label">Revised</div>
        <div className="stat-value">{totalRevised}</div>
        <span className="text-muted small">
          {revisedPercent}% of {goal}
        </span>
      </div>
      <div className="stat-card">
        <div className="stat-label">Company Progress</div>
        <div className="stat-value">
          {companyStats.solved} / {companyStats.remaining}
        </div>
        <span className="text-muted small">
          {selectedCompanies.length > 0
            ? `${companyStats.solved} solved, ${companyStats.remaining} remaining`
            : 'Select a company'}
        </span>
      </div>
    </div>
  );
}

StatsBar.propTypes = {
  totalSolvedLc: PropTypes.number.isRequired,
  solvedPercent: PropTypes.number.isRequired,
  goal: PropTypes.number.isRequired,
  totalRevised: PropTypes.number.isRequired,
  revisedPercent: PropTypes.number.isRequired,
  companyStats: PropTypes.shape({
    solved: PropTypes.number.isRequired,
    remaining: PropTypes.number.isRequired,
    total: PropTypes.number
  }).isRequired,
  selectedCompanies: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default memo(StatsBar);

