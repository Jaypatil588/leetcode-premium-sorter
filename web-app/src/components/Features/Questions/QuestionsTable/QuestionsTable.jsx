import React, { memo } from 'react';
import PropTypes from 'prop-types';
import ProgressBar from '../../../Common/ProgressBar/ProgressBar.jsx';
import './QuestionsTable.module.css';

/**
 * Renders the questions table with sorting, badges, and pagination.
 */
function QuestionsTable({
  questions,
  solvedMap,
  lcSolvedMap,
  selectedCompanies,
  premiumMap,
  toggleSolved,
  handleSort,
  getSortState,
  getSortIcon,
  totalPages,
  currentPage,
  setCurrentPage,
  fetchLeetCodeSubmissions,
  lcUsername,
  lcSession,
  lcCsrf
}) {
  const MAJOR_COMPANIES = [
    'Microsoft',
    'Apple',
    'Google',
    'Netflix',
    'Meta',
    'Uber',
    'Amazon',
    'TikTok',
    'X'
  ];

  const renderCompanyBadges = (companies, limit = null) => {
    const sorted = [...companies].sort((a, b) => b.frequency - a.frequency);
    const toShow = limit ? sorted.slice(0, limit) : sorted;
    const hasMore = limit && sorted.length > limit;

    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.35rem',
          maxWidth: '300px'
        }}
      >
        {toShow.map((c) => (
          <span key={c.name} className="badge badge-company">
            <span className="fw-semibold">{c.name}</span>
            <span
              className="ms-1"
              style={{
                borderLeft: '1px solid rgba(59, 130, 246, 0.3)',
                paddingLeft: '0.35rem',
                opacity: 0.8
              }}
            >
              {c.frequency.toFixed(0)}%
            </span>
          </span>
        ))}
        {hasMore && (
          <span
            className="badge"
            style={{
              backgroundColor: 'var(--text-muted)',
              color: 'white',
              fontSize: '0.7rem',
              padding: '0.25rem 0.5rem'
            }}
          >
            +{sorted.length - toShow.length}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="card" style={{ marginBottom: '0' }}>
      <div className="card-header" style={{ padding: '0.5rem 0.85rem' }}></div>

      <div className="table-container">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th
                  className={`sortable sort-${getSortState('title')}`}
                  onClick={() => handleSort('title')}
                >
                  Title <span className="sort-icon">{getSortIcon('title')}</span>
                </th>
                <th
                  className={`sortable sort-${getSortState('difficulty')}`}
                  style={{ width: '100px' }}
                  onClick={() => handleSort('difficulty')}
                >
                  Difficulty{' '}
                  <span className="sort-icon">{getSortIcon('difficulty')}</span>
                </th>
                <th
                  className={`sortable sort-${getSortState('acceptanceRate')}`}
                  style={{ width: '120px' }}
                  onClick={() => handleSort('acceptanceRate')}
                >
                  Acceptance{' '}
                  <span className="sort-icon">{getSortIcon('acceptanceRate')}</span>
                </th>
                <th
                  className={`sortable sort-${getSortState('majorCompanies')}`}
                  onClick={() => handleSort('majorCompanies')}
                >
                  Major Companies{' '}
                  <span className="sort-icon">{getSortIcon('majorCompanies')}</span>
                </th>
                <th
                  className={`sortable sort-${getSortState('otherCompanies')}`}
                  onClick={() => handleSort('otherCompanies')}
                >
                  Other Companies{' '}
                  <span className="sort-icon">{getSortIcon('otherCompanies')}</span>
                </th>
                <th
                  className={`sortable sort-${getSortState('frequency')}`}
                  style={{ width: '180px' }}
                  onClick={() => handleSort('frequency')}
                >
                  Frequency{' '}
                  <span className="sort-icon">{getSortIcon('frequency')}</span>
                </th>
                <th
                  className={`sortable sort-${getSortState('topics')}`}
                  onClick={() => handleSort('topics')}
                >
                  Topics <span className="sort-icon">{getSortIcon('topics')}</span>
                </th>
                <th
                  className={`text-center sortable sort-${getSortState('lcSolved')}`}
                  style={{ width: '80px' }}
                  onClick={() => handleSort('lcSolved')}
                >
                  <div>
                    LC <span className="sort-icon">{getSortIcon('lcSolved')}</span>
                  </div>
                </th>
                <th
                  className={`text-center sortable sort-${getSortState('solved')}`}
                  style={{ width: '80px' }}
                  onClick={() => handleSort('solved')}
                >
                  <div>
                    Revised <span className="sort-icon">{getSortIcon('solved')}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr
                  key={q.title}
                  className={solvedMap[q.title] ? 'solved-row' : ''}
                  onClick={(e) => {
                    if (e.target.tagName === 'A' || e.target.type === 'checkbox') {
                      return;
                    }
                    toggleSolved(q.title);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="title-cell">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <a
                        href={q.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none fw-semibold title-link"
                        style={{ color: 'var(--text-dark)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (lcUsername && lcSession) {
                            fetchLeetCodeSubmissions(
                              lcSession,
                              lcCsrf,
                              true,
                              lcUsername
                            ).catch(() => {});
                          }
                        }}
                      >
                        {q.title}
                      </a>
                      {premiumMap[q.title] === true && (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: '#3E2723',
                            color: '#FFA500',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            padding: '0.3rem 0.65rem',
                            borderRadius: '14px',
                            border: 'none',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            letterSpacing: '0.01em'
                          }}
                          title="LeetCode Premium"
                        >
                          Premium
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        q.difficulty.toUpperCase() === 'EASY'
                          ? 'badge-easy'
                          : q.difficulty.toUpperCase() === 'MEDIUM'
                          ? 'badge-medium'
                          : 'badge-hard'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </td>
                  <td>{(q.acceptanceRate * 100).toFixed(1)}%</td>
                  <td>
                    {(() => {
                      const relevantCompanies =
                        selectedCompanies.length > 0
                          ? q.companies.filter((c) =>
                              selectedCompanies.includes(c.name)
                            )
                          : q.companies;

                      const major = relevantCompanies.filter((c) =>
                        MAJOR_COMPANIES.includes(c.name)
                      );
                      return renderCompanyBadges(major);
                    })()}
                  </td>
                  <td>
                    {(() => {
                      const relevantCompanies =
                        selectedCompanies.length > 0
                          ? q.companies.filter((c) =>
                              selectedCompanies.includes(c.name)
                            )
                          : q.companies;

                      const others = relevantCompanies.filter(
                        (c) => !MAJOR_COMPANIES.includes(c.name)
                      );
                      const limit = selectedCompanies.length > 0 ? null : 3;
                      return renderCompanyBadges(others, limit);
                    })()}
                  </td>
                  <td>
                    {(() => {
                      const relevantCompanies =
                        selectedCompanies.length > 0
                          ? q.companies.filter((c) =>
                              selectedCompanies.includes(c.name)
                            )
                          : q.companies;
                      const maxFreq = Math.max(
                        0,
                        ...relevantCompanies.map((c) => c.frequency)
                      );
                      return (
                        <ProgressBar value={maxFreq} max={100} height="9px" />
                      );
                    })()}
                  </td>
                  <td>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.25rem'
                      }}
                    >
                      {q.topics.slice(0, 3).map((topic) => (
                        <span key={topic} className="badge badge-topic">
                          {topic}
                        </span>
                      ))}
                      {q.topics.length > 3 && (
                        <span
                          className="badge bg-secondary"
                          style={{ fontSize: '0.7rem' }}
                        >
                          +{q.topics.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-center">
                    {lcSolvedMap[q.title] ? (
                      <span className="check-icon">✓</span>
                    ) : (
                      <span style={{ color: 'var(--border-color)' }}></span>
                    )}
                  </td>
                  <td
                    className="text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input revised-checkbox"
                      style={{
                        cursor: 'pointer',
                        width: '1.5rem',
                        height: '1.5rem',
                        border: '2px solid var(--border-color)',
                        borderRadius: '4px',
                        accentColor: 'var(--badge-green)'
                      }}
                      checked={!!solvedMap[q.title]}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSolved(q.title);
                      }}
                    />
                  </td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center"
                    style={{
                      padding: '3rem',
                      color: 'var(--text-muted)'
                    }}
                  >
                    No questions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={page === currentPage ? 'active' : ''}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}

QuestionsTable.propTypes = {
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
      difficulty: PropTypes.string.isRequired,
      acceptanceRate: PropTypes.number.isRequired,
      companies: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          frequency: PropTypes.number.isRequired
        })
      ).isRequired,
      topics: PropTypes.arrayOf(PropTypes.string).isRequired
    })
  ).isRequired,
  solvedMap: PropTypes.object.isRequired,
  lcSolvedMap: PropTypes.object.isRequired,
  selectedCompanies: PropTypes.arrayOf(PropTypes.string).isRequired,
  premiumMap: PropTypes.object.isRequired,
  toggleSolved: PropTypes.func.isRequired,
  handleSort: PropTypes.func.isRequired,
  getSortState: PropTypes.func.isRequired,
  getSortIcon: PropTypes.func.isRequired,
  totalPages: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  fetchLeetCodeSubmissions: PropTypes.func.isRequired,
  lcUsername: PropTypes.string,
  lcSession: PropTypes.string,
  lcCsrf: PropTypes.string
};

export default memo(QuestionsTable);

