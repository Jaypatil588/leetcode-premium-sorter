import { memo } from 'react';
import PropTypes from 'prop-types';
import MultiSelect from '../../../Common/MultiSelect/MultiSelect.jsx';

function FiltersPanel({
  selectedCompanies,
  setSelectedCompanies,
  selectedTopics,
  setSelectedTopics,
  selectedDifficulties,
  setSelectedDifficulties,
  searchQuery,
  setSearchQuery,
  hidePremium,
  setHidePremium,
  fetchingPremium,
  premiumMap,
  premiumCheckComplete,
  clearFilters,
  companyOptions,
  topicOptions,
  difficultyOptions
}) {
  const hasActiveFilters =
    selectedCompanies.length > 0 ||
    selectedTopics.length > 0 ||
    selectedDifficulties.length > 0 ||
    Boolean(searchQuery) ||
    hidePremium;

  return (
    <>
      {hasActiveFilters && (
          <div
            className="d-flex justify-content-between align-items-start"
            style={{ marginBottom: '0.75rem' }}
          >
            <div className="filter-pills flex-grow-1">
              {selectedCompanies.map((company) => (
                <div key={company} className="filter-pill">
                  <span>{company}</span>
                  <button
                    className="filter-pill-remove"
                    onClick={() =>
                      setSelectedCompanies((prev) => prev.filter((c) => c !== company))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
              {selectedTopics.map((topic) => (
                <div key={topic} className="filter-pill">
                  <span>{topic}</span>
                  <button
                    className="filter-pill-remove"
                    onClick={() =>
                      setSelectedTopics((prev) => prev.filter((t) => t !== topic))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
              {selectedDifficulties.map((diff) => (
                <div key={diff} className="filter-pill">
                  <span>{diff}</span>
                  <button
                    className="filter-pill-remove"
                    onClick={() =>
                      setSelectedDifficulties((prev) => prev.filter((d) => d !== diff))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
              {searchQuery && (
                <div className="filter-pill">
                  <span>Search: &quot;{searchQuery}&quot;</span>
                  <button
                    className="filter-pill-remove"
                    onClick={() => setSearchQuery('')}
                  >
                    ×
                  </button>
                </div>
              )}
              {hidePremium && (
                <div className="filter-pill">
                  <span>Hide Premium</span>
                  <button
                    className="filter-pill-remove"
                    onClick={() => setHidePremium(false)}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <button
              className="btn btn-ghost btn-sm ms-2 flex-shrink-0"
              onClick={clearFilters}
            >
              Clear All
            </button>
          </div>
        )}

        <div className="row" style={{ marginBottom: '0.75rem' }}>
          <div className="col-md-3 mb-2">
            <MultiSelect
              label="Companies"
              options={companyOptions}
              selected={selectedCompanies}
              onChange={setSelectedCompanies}
              placeholder="All Companies"
            />
          </div>
          <div className="col-md-3 mb-2">
            <MultiSelect
              label="Topics"
              options={topicOptions}
              selected={selectedTopics}
              onChange={setSelectedTopics}
              placeholder="All Topics"
            />
          </div>
          <div className="col-md-3 mb-2">
            <MultiSelect
              label="Difficulty"
              options={difficultyOptions}
              selected={selectedDifficulties}
              onChange={setSelectedDifficulties}
              placeholder="All Difficulties"
            />
          </div>
          <div className="col-md-3 mb-2">
            <label
              className="form-label fw-bold"
              style={{ fontSize: '0.9rem', marginBottom: '0.15rem' }}
            >
              Search
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Search title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="row mt-2">
          <div className="col-md-12 mb-2">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="hidePremium"
                checked={hidePremium}
                onChange={(e) => setHidePremium(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="hidePremium">
                Hide Premium Problems
              </label>
            </div>
          </div>
        </div>

      {fetchingPremium && (
          <div className="row mt-2">
            <div className="col-12">
              <small className="text-muted">
                <span className="loading-spinner me-2"></span>
                Checking premium status for all problems... (
                {Object.keys(premiumMap).length} checked)
              </small>
            </div>
          </div>
        )}

      {premiumCheckComplete && !fetchingPremium && (
        <div className="row mt-2">
          <div className="col-12">
            <small className="text-muted">
              ✓ Premium status checked for all problems (
              {Object.keys(premiumMap).filter((k) => premiumMap[k]).length} premium,
              {Object.keys(premiumMap).filter((k) => !premiumMap[k]).length} free)
            </small>
          </div>
        </div>
      )}
    </>
  );
}

FiltersPanel.propTypes = {
  selectedCompanies: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedCompanies: PropTypes.func.isRequired,
  selectedTopics: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedTopics: PropTypes.func.isRequired,
  selectedDifficulties: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedDifficulties: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  hidePremium: PropTypes.bool.isRequired,
  setHidePremium: PropTypes.func.isRequired,
  fetchingPremium: PropTypes.bool.isRequired,
  premiumMap: PropTypes.object.isRequired,
  premiumCheckComplete: PropTypes.bool.isRequired,
  clearFilters: PropTypes.func.isRequired,
  companyOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  topicOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  difficultyOptions: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default memo(FiltersPanel);
