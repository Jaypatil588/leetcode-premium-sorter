import { useState, useEffect, useMemo, useRef } from 'react';

const MultiSelect = ({ options, selected, onChange, label, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(filterText.toLowerCase())
  );

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="dropdown mb-3" ref={containerRef}>
      <label className="form-label fw-bold">{label}</label>
      <div className="w-100">
        <button 
          className="btn btn-outline-secondary w-100 text-start d-flex justify-content-between align-items-center" 
          type="button" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-truncate">
            {selected.length === 0 ? placeholder : `${selected.length} selected`}
          </span>
          <span className="dropdown-toggle"></span>
        </button>
        
        {isOpen && (
          <div className="dropdown-menu show w-100 p-2 shadow" style={{ maxHeight: '300px', overflowY: 'auto', zIndex: 9999 }}>
            <input 
              type="text" 
              className="form-control mb-2" 
              placeholder="Search..." 
              value={filterText} 
              onChange={e => setFilterText(e.target.value)} 
              autoFocus
            />
            <div className="d-flex flex-column gap-1">
              <button 
                className="btn btn-sm btn-link text-decoration-none text-start p-0 mb-1"
                onClick={() => onChange([])}
              >
                Clear selection
              </button>
              {filteredOptions.length > 0 ? filteredOptions.map(opt => (
                <div key={opt} className="form-check" onClick={(e) => { e.stopPropagation(); toggleOption(opt); }}>
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    checked={selected.includes(opt)} 
                    readOnly 
                    style={{ cursor: 'pointer' }}
                  />
                  <label className="form-check-label w-100" style={{ cursor: 'pointer' }}>
                    {opt}
                  </label>
                </div>
              )) : (
                <div className="text-muted small">No matches found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MAJOR_COMPANIES = [
  'Google', 'Amazon', 'Meta', 'Facebook', 'Microsoft', 'Apple', 'Netflix', 
  'Uber', 'LinkedIn', 'Bloomberg', 'Adobe', 'TikTok', 'Salesforce', 'Oracle', 'Twitter', 'X'
];

function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'frequency', direction: 'desc' });

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load data", err);
        setLoading(false);
      });
  }, []);

  // Extract unique options
  const companyOptions = useMemo(() => {
    const companies = new Set();
    questions.forEach(q => q.companies.forEach(c => companies.add(c.name)));
    return Array.from(companies).sort();
  }, [questions]);

  const topicOptions = useMemo(() => {
    const topics = new Set();
    questions.forEach(q => q.topics.forEach(t => topics.add(t)));
    return Array.from(topics).sort();
  }, [questions]);

  const difficultyOptions = ['EASY', 'MEDIUM', 'HARD'];

  // Filtering and Sorting
  const processedQuestions = useMemo(() => {
    let result = [...questions];

    // Filter by Company
    if (selectedCompanies.length > 0) {
      result = result.filter(q => 
        q.companies.some(c => selectedCompanies.includes(c.name))
      );
    }

    // Filter by Topic
    if (selectedTopics.length > 0) {
      result = result.filter(q => 
        q.topics.some(t => selectedTopics.includes(t))
      );
    }

    // Filter by Difficulty
    if (selectedDifficulties.length > 0) {
      result = result.filter(q => selectedDifficulties.includes(q.difficulty.toUpperCase()));
    }

    // Filter by Search
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(q => q.title.toLowerCase().includes(lower));
    }

    // Sort
    result.sort((a, b) => {
      let valA, valB;

      if (sortConfig.key === 'frequency') {
        // Calculate max frequency for the question based on context
        const getFreq = (q) => {
          const relevantCompanies = selectedCompanies.length > 0 
            ? q.companies.filter(c => selectedCompanies.includes(c.name))
            : q.companies;
          return Math.max(0, ...relevantCompanies.map(c => c.frequency));
        };
        valA = getFreq(a);
        valB = getFreq(b);
      } else if (sortConfig.key === 'difficulty') {
        const diffMap = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 };
        valA = diffMap[a.difficulty.toUpperCase()] || 0;
        valB = diffMap[b.difficulty.toUpperCase()] || 0;
      } else if (sortConfig.key === 'acceptanceRate') {
        valA = a.acceptanceRate;
        valB = b.acceptanceRate;
      } else if (sortConfig.key === 'majorCompanies') {
        // Sort by max frequency of major companies
        const getMajorFreq = (q) => {
           const major = q.companies.filter(c => MAJOR_COMPANIES.includes(c.name));
           return major.length > 0 ? Math.max(...major.map(c => c.frequency)) : -1;
        };
        valA = getMajorFreq(a);
        valB = getMajorFreq(b);
      } else if (sortConfig.key === 'otherCompanies') {
        // Sort by max frequency of other companies
        const getOtherFreq = (q) => {
           const other = q.companies.filter(c => !MAJOR_COMPANIES.includes(c.name));
           return other.length > 0 ? Math.max(...other.map(c => c.frequency)) : -1;
        };
        valA = getOtherFreq(a);
        valB = getOtherFreq(b);
      } else if (sortConfig.key === 'topics') {
        valA = a.topics.join(', ');
        valB = b.topics.join(', ');
      } else {
        valA = a[sortConfig.key];
        valB = b[sortConfig.key];
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [questions, selectedCompanies, selectedTopics, selectedDifficulties, searchQuery, sortConfig]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCompanies, selectedTopics, selectedDifficulties, searchQuery, sortConfig]);

  const totalPages = Math.ceil(processedQuestions.length / itemsPerPage);
  const currentQuestions = processedQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const clearFilters = () => {
    setSelectedCompanies([]);
    setSelectedTopics([]);
    setSelectedDifficulties([]);
    setSearchQuery('');
  };

  if (loading) return <div className="p-5 text-center">Loading data...</div>;

  const renderCompanyBadges = (companies, limit = null) => {
      const sorted = [...companies].sort((a, b) => b.frequency - a.frequency);
      const toShow = limit ? sorted.slice(0, limit) : sorted;
      const hasMore = limit && sorted.length > limit;

      return (
          <div style={{ maxWidth: '300px' }}>
              {toShow.map(c => (
                  <span key={c.name} className="badge bg-light text-dark border me-2 mb-1 fw-normal text-start d-inline-block" style={{ fontSize: '0.8rem', padding: '0.35em 0.65em' }}>
                      <span className="fw-bold">{c.name}</span>
                      <span className="ms-1 text-secondary" style={{ borderLeft: '1px solid #ccc', paddingLeft: '6px' }}>{c.frequency.toFixed(0)}%</span>
                  </span>
              ))}
              {hasMore && <span className="badge bg-secondary text-white mb-1" style={{ fontSize: '0.75rem' }}>+{sorted.length - toShow.length} more</span>}
          </div>
      );
  };
  
  return (
    <div className="container-fluid py-4">
      <h1 className="mb-4 text-center">LeetCode Premium Sorter</h1>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <MultiSelect 
            label="Companies" 
            options={companyOptions} 
            selected={selectedCompanies} 
            onChange={setSelectedCompanies} 
            placeholder="All Companies"
          />
        </div>
        <div className="col-md-3">
          <MultiSelect 
            label="Topics" 
            options={topicOptions} 
            selected={selectedTopics} 
            onChange={setSelectedTopics} 
            placeholder="All Topics"
          />
        </div>
        <div className="col-md-3">
          <MultiSelect 
            label="Difficulty" 
            options={difficultyOptions} 
            selected={selectedDifficulties} 
            onChange={setSelectedDifficulties} 
            placeholder="All Difficulties"
          />
        </div>
        <div className="col-md-3">
          <label className="form-label fw-bold">Search</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <span className="badge bg-primary me-2">{processedQuestions.length} Questions</span>
          {(selectedCompanies.length > 0 || selectedTopics.length > 0 || selectedDifficulties.length > 0 || searchQuery) && (
             <button className="btn btn-sm btn-outline-danger" onClick={clearFilters}>Clear Filters</button>
          )}
        </div>
        
        {totalPages > 1 && (
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Previous</button>
              </li>
              <li className="page-item disabled">
                <span className="page-link">
                  Page {currentPage} of {totalPages}
                </span>
              </li>
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Next</button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-bordered table-striped">
          <thead className="table-dark sticky-top">
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('title')}>
                Title {getSortIcon('title')}
              </th>
              <th style={{ cursor: 'pointer', width: '100px' }} onClick={() => handleSort('difficulty')}>
                Diff {getSortIcon('difficulty')}
              </th>
              <th style={{ cursor: 'pointer', width: '120px' }} onClick={() => handleSort('acceptanceRate')}>
                Acc. Rate {getSortIcon('acceptanceRate')}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('majorCompanies')}>
                Major Companies {getSortIcon('majorCompanies')}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('otherCompanies')}>
                Other Companies {getSortIcon('otherCompanies')}
              </th>
              <th style={{ cursor: 'pointer', width: '120px' }} onClick={() => handleSort('frequency')}>
                Max Freq {getSortIcon('frequency')}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('topics')}>
                Topics {getSortIcon('topics')}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentQuestions.map((q) => (
              <tr key={q.title}>
                <td>
                  <a href={q.link} target="_blank" rel="noopener noreferrer" className="text-decoration-none fw-bold">
                    {q.title}
                  </a>
                </td>
                <td>
                  <span className={`badge ${
                    q.difficulty.toUpperCase() === 'EASY' ? 'bg-success' : 
                    q.difficulty.toUpperCase() === 'MEDIUM' ? 'bg-warning text-dark' : 'bg-danger'
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
                    // If filter applied, show all. Else show top 3.
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
                    return maxFreq.toFixed(1);
                  })()}
                </td>
                <td>
                  <small className="text-muted">{q.topics.slice(0, 3).join(', ')}{q.topics.length > 3 ? '...' : ''}</small>
                </td>
              </tr>
            ))}
            {currentQuestions.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-muted">
                  No questions found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
           <nav>
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Previous</button>
              </li>
              <li className="page-item disabled">
                <span className="page-link">
                  Page {currentPage} of {totalPages}
                </span>
              </li>
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Next</button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

export default App;
