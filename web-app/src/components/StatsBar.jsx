import React from 'react';

/**
 * @typedef {Object} StatsBarProps
 * @property {number} totalSolvedLc Total solved LeetCode count
 * @property {number} solvedPercent Percentage solved towards goal
 * @property {number} goal Target goal number
 * @property {number} totalRevised Total revised count
 * @property {number} revisedPercent Percentage revised towards goal
 * @property {{ solved: number, remaining: number, total: number }} companyStats Company-specific stats
 * @property {string[]} selectedCompanies Currently selected companies filter
 */

/**
 * StatsBar displays top-level progress metrics.
 * @param {StatsBarProps} props
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
        <span className="text-muted small">{solvedPercent}% of {goal}</span>
      </div>
      <div className="stat-card">
        <div className="stat-label">Revised</div>
        <div className="stat-value">{totalRevised}</div>
        <span className="text-muted small">{revisedPercent}% of {goal}</span>
      </div>
      <div className="stat-card">
        <div className="stat-label">Company Progress</div>
        <div className="stat-value">{companyStats.solved} / {companyStats.remaining}</div>
        <span className="text-muted small">
          {selectedCompanies.length > 0 ? `${companyStats.solved} solved, ${companyStats.remaining} remaining` : 'Select a company'}
        </span>
      </div>
    </div>
  );
}

export default StatsBar;

