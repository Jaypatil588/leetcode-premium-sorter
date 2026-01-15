import React from 'react';
import ProgressBar from './ProgressBar';

/**
 * @typedef {{name:string, frequency:number}} CompanyFreq
 * @typedef {{ title:string, link:string, difficulty:string, acceptanceRate:number, companies:CompanyFreq[], topics:string[] }} Question
 */

/**
 * @typedef {Object} QuestionsTableProps
 * @property {Question[]} questions Current page of questions
 * @property {Record<string, boolean>} solvedMap Revised map
 * @property {Record<string, boolean>} lcSolvedMap LC solved map
 * @property {string[]} selectedCompanies Selected companies filter
 * @property {Record<string, boolean>} premiumMap Map of premium flags per title
 * @property {function(string):void} toggleSolved Toggle revised state
 * @property {function(string):void} handleSort Toggle sort for given key
 * @property {function(string):'neutral'|'asc'|'desc'} getSortState Get sort state for header
 * @property {function(string):string} getSortIcon Get sort icon for header
 * @property {number} totalPages Total pages count
 * @property {number} currentPage Current page index (1-based)
 * @property {function(function(number):number):void} setCurrentPage Setter for current page
 * @property {function(string, string, boolean, string):Promise<void>} fetchLeetCodeSubmissions Background sync
 * @property {string} lcUsername Username
 * @property {string} lcSession Session token
 * @property {string} lcCsrf CSRF token
 */

/**
 * Renders the questions table with sorting, badges, and pagination.
 * @param {QuestionsTableProps} props
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
    'Microsoft', 'Apple', 'Google', 'Netflix', 'Meta', 'Uber', 'Amazon', 'TikTok', 'X'
  ];

  /**
   * @param {CompanyFreq[]} companies
   * @param {number|null} limit
   */
  const renderCompanyBadges = (companies, limit = null) => {
    const sorted = [...companies].sort((a, b) => b.frequency - a.frequency);
    const toShow = limit ? sorted.slice(0, limit) : sorted;
    const hasMore = limit && sorted.length > limit;

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxWidth: '300px' }}>
        {toShow.map(c => (
          <span key={c.name} className="badge badge-company">
            <span className="fw-semibold">{c.name}</span>
            <span className="ms-1" style={{ borderLeft: '1px solid rgba(59, 130, 246, 0.3)', paddingLeft: '0.35rem', opacity: 0.8 }}>
              {c.frequency.toFixed(0)}%
            </span>
          </span>
        ))}
        {hasMore && (
          <span className="badge" style={{ backgroundColor: 'var(--text-muted)', color: 'white', fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>
            +{sorted.length - toShow.length}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="card" style={{ marginBottom: '0' }}>
      <div className="card-header" style={{ padding: '0.5rem 0.85rem' }}>
      </div>

      <div className="table-container">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th className={`sortable sort-${getSortState('title')}`} onClick={() => handleSort('title')}>
                  Title <span className="sort-icon">{getSortIcon('title')}</span>
                </th>
                <th className={`sortable sort-${getSortState('difficulty')}`} style={{ width: '100px' }} onClick={() => handleSort('difficulty')}>
                  Difficulty <span className="sort-icon">{getSortIcon('difficulty')}</span>
                </th>
                <th className={`sortable sort-${getSortState('acceptanceRate')}`} style={{ width: '120px' }} onClick={() => handleSort('acceptanceRate')}>
                  Acceptance <span className="sort-icon">{getSortIcon('acceptanceRate')}</span>
                </th>
                <th className={`sortable sort-${getSortState('majorCompanies')}`} onClick={() => handleSort('majorCompanies')}>
                  Major Companies <span className="sort-icon">{getSortIcon('majorCompanies')}</span>
                </th>
                <th className={`sortable sort-${getSortState('otherCompanies')}`} onClick={() => handleSort('otherCompanies')}>
                  Other Companies <span className="sort-icon">{getSortIcon('otherCompanies')}</span>
                </th>
                <th className={`sortable sort-${getSortState('frequency')}`} style={{ width: '180px' }} onClick={() => handleSort('frequency')}>
                  Frequency <span className="sort-icon">{getSortIcon('frequency')}</span>
                </th>
                <th className={`sortable sort-${getSortState('topics')}`} onClick={() => handleSort('topics')}>
                  Topics <span className="sort-icon">{getSortIcon('topics')}</span>
                </th>
                <th className={`text-center sortable sort-${getSortState('lcSolved')}`} style={{ width: '80px' }} onClick={() => handleSort('lcSolved')}>
                  <div>LC <span className="sort-icon">{getSortIcon('lcSolved')}</span></div>
                </th>
                <th className={`text-center sortable sort-${getSortState('solved')}`} style={{ width: '80px' }} onClick={() => handleSort('solved')}>
                  <div>Revised <span className="sort-icon">{getSortIcon('solved')}</span></div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <a 
                        href={q.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-decoration-none fw-semibold title-link"
                        style={{ color: 'var(--text-dark)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (lcUsername && lcSession) {
                            fetchLeetCodeSubmissions(lcSession, lcCsrf, true, lcUsername).catch(() => {});
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
                    <span className={`badge ${
                      q.difficulty.toUpperCase() === 'EASY' ? 'badge-easy' : 
                      q.difficulty.toUpperCase() === 'MEDIUM' ? 'badge-medium' : 'badge-hard'
                    }`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td>{(q.acceptanceRate * 100).toFixed(1)}%</td>
                  <td>
                    {(() => {
                      const relevantCompanies = selectedCompanies.length > 0
                        ? q.companies.filter(c => selectedCompanies.includes(c.name))
                        : q.companies;
                      
                      const major = relevantCompanies.filter(c => MAJOR_COMPANIES.includes(c.name));
                      return renderCompanyBadges(major);
                    })()}
                  </td>
                  <td>
                    {(() => {
                      const relevantCompanies = selectedCompanies.length > 0
                        ? q.companies.filter(c => selectedCompanies.includes(c.name))
                        : q.companies;
                      
                      const others = relevantCompanies.filter(c => !MAJOR_COMPANIES.includes(c.name));
                      const limit = selectedCompanies.length > 0 ? null : 3;
                      return renderCompanyBadges(others, limit);
                    })()}
                  </td>
                  <td>
                    {(() => {
                      const relevantCompanies = selectedCompanies.length > 0 
                        ? q.companies.filter(c => selectedCompanies.includes(c.name))
                        : q.companies;
                      const maxFreq = Math.max(0, ...relevantCompanies.map(c => c.frequency));
                      return <ProgressBar value={maxFreq} max={100} height="9px" />;
                    })()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {q.topics.slice(0, 3).map(topic => (
                        <span key={topic} className="badge badge-topic">
                          {topic}
                        </span>
                      ))}
                      {q.topics.length > 3 && (
                        <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
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
                  <td className="text-center" onClick={(e) => e.stopPropagation()}>
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
                  <td colSpan="9" className="text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
                    No questions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center" style={{ padding: '1.5rem 0' }}>
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button disabled className="active">
              Page {currentPage} of {totalPages}
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionsTable;

