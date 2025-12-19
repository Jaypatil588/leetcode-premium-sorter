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
  
  // LeetCode Integration
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [lcUsername, setLcUsername] = useState(() => localStorage.getItem('lcUsername') || '');
  const [lcSession, setLcSession] = useState(() => localStorage.getItem('lcSession') || '');
  const [lcCsrf, setLcCsrf] = useState(() => localStorage.getItem('lcCsrf') || '');
  const [solvedMap, setSolvedMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('solvedMap')) || {};
    } catch { return {}; }
  });
  const [lcSolvedMap, setLcSolvedMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lcSolvedMap')) || {};
    } catch { return {}; }
  });
  const [fetchingLC, setFetchingLC] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'frequency', direction: 'desc' });

  // Persist state
  useEffect(() => {
    localStorage.setItem('solvedMap', JSON.stringify(solvedMap));
  }, [solvedMap]);

  useEffect(() => {
    localStorage.setItem('lcSolvedMap', JSON.stringify(lcSolvedMap));
  }, [lcSolvedMap]);

  useEffect(() => {
    localStorage.setItem('lcUsername', lcUsername);
  }, [lcUsername]);

  useEffect(() => {
    localStorage.setItem('lcSession', lcSession);
  }, [lcSession]);

  useEffect(() => {
    localStorage.setItem('lcCsrf', lcCsrf);
  }, [lcCsrf]);

  // Detect extension on load
  useEffect(() => {
    const checkExtension = () => {
      const isInstalled = typeof window.leetcodeAuth !== 'undefined';
      console.log('Extension detection check:', {
        isInstalled,
        hasAPI: !!window.leetcodeAuth,
        apiKeys: window.leetcodeAuth ? Object.keys(window.leetcodeAuth) : []
      });
      setExtensionInstalled(isInstalled);
      return isInstalled;
    };
    
    // Check immediately
    const initialCheck = checkExtension();
    console.log('Initial extension check:', initialCheck);
    
    // Also listen for extension ready event
    const handleReady = () => {
      console.log('Extension ready event received!');
      checkExtension();
    };
    window.addEventListener('leetcode-auth-ready', handleReady);
    
    // Re-check when window regains focus (after user installs extension)
    const handleFocus = () => {
      console.log('Window focused, rechecking extension...');
      setTimeout(() => checkExtension(), 500);
    };
    window.addEventListener('focus', handleFocus);
    
    // Also check periodically for 10 seconds after load (in case extension loads late)
    let checkCount = 0;
    const interval = setInterval(() => {
      checkCount++;
      if (checkExtension() || checkCount >= 20) {
        clearInterval(interval);
      }
    }, 500);
    
    return () => {
      window.removeEventListener('leetcode-auth-ready', handleReady);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  // Listen for auth success from extension
  useEffect(() => {
    const handleAuthSuccess = (event) => {
      if (event.detail) {
        setLcSession(event.detail.session);
        setLcCsrf(event.detail.csrf);
      }
    };
    window.addEventListener('leetcode-auth-success', handleAuthSuccess);
    return () => window.removeEventListener('leetcode-auth-success', handleAuthSuccess);
  }, []);

  const toggleSolved = (title) => {
    setSolvedMap(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // Extension-based LeetCode Login
  const handleLeetCodeLogin = async () => {
    if (!window.leetcodeAuth) {
      alert('Extension not detected. Please install it first.');
      return;
    }

    setFetchingLC(true);
    try {
      const { session, csrf } = await window.leetcodeAuth.login();
      setLcSession(session);
      setLcCsrf(csrf);
      
      // Auto-fetch submissions if username is set
      if (lcUsername) {
        await fetchLeetCodeSubmissions(session, csrf);
      } else {
        alert('Login successful! Please enter your LeetCode username and click "Sync Solved".');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed: ' + error.message);
    } finally {
      setFetchingLC(false);
    }
  };

  const fetchLeetCodeSubmissions = async (sessionToken = lcSession, csrfToken = lcCsrf) => {
    if (!lcUsername) {
      alert('Please enter your LeetCode username first.');
      return;
    }
    
    if (!sessionToken) {
      alert('Please login first using the "Login with LeetCode" button.');
      return;
    }

    setFetchingLC(true);
    try {
      let allSolved = [];
      let skip = 0;
      const limit = 50; // Fetch 50 at a time (safe limit)
      let hasMore = true;
      let totalFetched = 0;

      // Query to fetch ALL solved questions for the authenticated user
      const query = `
        query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
          problemsetQuestionList: questionList(
            categorySlug: $categorySlug
            limit: $limit
            skip: $skip
            filters: $filters
          ) {
            total: totalNum
            questions: data {
              title
              status
            }
          }
        }
      `;

      // Loop to fetch all pages
      while (hasMore) {
        const response = await fetch('/leetcode-api/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-lc-session': sessionToken,
                'x-lc-csrf': csrfToken,
                'x-csrftoken': csrfToken
            },
            body: JSON.stringify({
                query,
                variables: { 
                  categorySlug: "", 
                  limit: limit, 
                  skip: skip, 
                  filters: { status: "AC" } 
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        const list = data.data.problemsetQuestionList;
        const questions = list.questions;
        const total = list.total;
        
        if (!questions || questions.length === 0) {
            hasMore = false;
        } else {
            allSolved = [...allSolved, ...questions];
            skip += limit;
            totalFetched += questions.length;
            
            // Log progress
            console.log(`Fetched ${totalFetched}/${total} solved questions...`);
            
            // Check if we are done
            if (totalFetched >= total) {
                hasMore = false;
            }
        }
      }
      
      if (allSolved.length === 0) {
          alert('No solved questions found! Make sure you are logged in to the correct account.');
          return;
      }
      
      const newLcMap = { ...lcSolvedMap };
      let newCount = 0;
      allSolved.forEach(q => {
          if (!newLcMap[q.title]) {
              newLcMap[q.title] = true;
              newCount++;
          }
      });
      setLcSolvedMap(newLcMap);
      alert(`Synced! Found ${allSolved.length} total solved questions (${newCount} new added).`);

    } catch (err) {
      console.error("LeetCode Fetch Error:", err);
      alert("Failed to sync. " + err.message);
    } finally {
      setFetchingLC(false);
    }
  };

  const handleQuickSetup = () => {
    setShowSetupModal(true);
  };

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
      } else if (sortConfig.key === 'solved') {
        valA = solvedMap[a.title] ? 1 : 0;
        valB = solvedMap[b.title] ? 1 : 0;
      } else if (sortConfig.key === 'lcSolved') {
        valA = lcSolvedMap[a.title] ? 1 : 0;
        valB = lcSolvedMap[b.title] ? 1 : 0;
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
        <div className="col-md-12">
          {!extensionInstalled ? (
            <div className="alert alert-primary shadow-sm border-0 mb-0">
              <div className="d-flex align-items-center justify-content-between">
                <div className="flex-grow-1">
                  <h5 className="mb-1">🔐 One-Time Setup Required</h5>
                  <p className="mb-0 small text-muted">Install our local extension for secure LeetCode login</p>
                </div>
                <div>
                  <button onClick={handleQuickSetup} className="btn btn-lg btn-success me-2">
                    Quick Setup ⚡
                  </button>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="btn btn-outline-secondary"
                    title="Refresh page to detect extension"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
              <div className="form-text mt-2 text-muted">
                Takes 10 seconds • No data leaves your computer • Open source
                {' '}<span className="text-warning">• Did you install? Click Refresh ↗</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="form-label fw-bold">LeetCode Sync</label>
              <div className="input-group">
                <span className="input-group-text">@</span>
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder="LeetCode Username" 
                    value={lcUsername}
                    onChange={(e) => setLcUsername(e.target.value)}
                />
                <button 
                    className="btn btn-success" 
                    onClick={handleLeetCodeLogin}
                    disabled={fetchingLC}
                >
                    {fetchingLC ? 'Logging in...' : '🔑 Login with LeetCode'}
                </button>
                <button 
                    className="btn btn-primary" 
                    onClick={() => fetchLeetCodeSubmissions()} 
                    disabled={fetchingLC || !lcUsername || !lcSession}
                >
                    {fetchingLC ? 'Fetching...' : 'Sync Solved'}
                </button>
              </div>
              <div className="form-text text-muted small d-flex justify-content-between">
                <span>
                  {lcSession ? (
                    <span className="text-success">✓ Logged in</span>
                  ) : (
                    <span>Click "Login with LeetCode" for OAuth-like authentication</span>
                  )}
                </span>
                {lcSession && (
                  <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={async () => {
                    if (window.leetcodeAuth) {
                      await window.leetcodeAuth.logout();
                    }
                    setLcSession('');
                    setLcCsrf('');
                  }}>
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showSetupModal && (
        <div 
          className="modal d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowSetupModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content shadow-lg">
              <div className="modal-header border-0">
                <h5 className="modal-title">⚡ Quick Extension Setup</h5>
                <button type="button" className="btn-close" onClick={() => setShowSetupModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning mb-3">
                  <small className="fw-bold">⚡ Use Unpacked Extension (Easiest):</small>
                </div>
                
                <ol className="mb-3">
                  <li className="mb-3">
                    <span className="badge bg-success me-2">1</span>
                    Open Chrome Extensions:
                    <div className="input-group input-group-sm mt-2">
                      <input 
                        type="text" 
                        className="form-control font-monospace bg-light" 
                        value="chrome://extensions" 
                        readOnly 
                        onClick={(e) => e.target.select()}
                      />
                      <button 
                        className="btn btn-outline-secondary btn-sm" 
                        onClick={() => {
                          navigator.clipboard.writeText('chrome://extensions');
                        }}
                      >
                        Copy
                      </button>
                    </div>
                    <small className="text-muted">Paste in address bar</small>
                  </li>
                  <li className="mb-3">
                    <span className="badge bg-success me-2">2</span>
                    Toggle <strong>"Developer mode"</strong> ON (top right)
                  </li>
                  <li className="mb-3">
                    <span className="badge bg-success me-2">3</span>
                    Click <strong>"Load unpacked"</strong> button
                  </li>
                  <li className="mb-3">
                    <span className="badge bg-success me-2">4</span>
                    Navigate to and select this folder:
                    <div className="input-group input-group-sm mt-2">
                      <input 
                        type="text" 
                        className="form-control font-monospace bg-light small" 
                        value="/Users/senpai/Desktop/projects/leetcode premium sorter/web-app/extension" 
                        readOnly 
                        onClick={(e) => e.target.select()}
                      />
                      <button 
                        className="btn btn-outline-secondary btn-sm" 
                        onClick={() => {
                          navigator.clipboard.writeText('/Users/senpai/Desktop/projects/leetcode premium sorter/web-app/extension');
                        }}
                      >
                        Copy Path
                      </button>
                    </div>
                    <small className="text-muted">Cmd+Shift+G in finder to paste path</small>
                  </li>
                </ol>
                
                <div className="alert alert-success mb-3">
                  <small>✅ Come back here and <strong>refresh the page</strong> (Cmd+R)!</small>
                </div>


                <details className="mb-0">
                  <summary className="text-danger small fw-bold" style={{cursor: 'pointer'}}>
                    🔧 Extension installed but not detected?
                  </summary>
                  <div className="mt-2 small">
                    <p className="fw-bold mb-2">Checklist:</p>
                    <div className="form-check mb-2">
                      <input className="form-check-input" type="checkbox" id="check1" />
                      <label className="form-check-label" htmlFor="check1">
                        Extension shows in <code>chrome://extensions</code> with toggle ON
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input className="form-check-input" type="checkbox" id="check2" />
                      <label className="form-check-label" htmlFor="check2">
                        "Developer mode" is enabled
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input className="form-check-input" type="checkbox" id="check3" />
                      <label className="form-check-label" htmlFor="check3">
                        I refreshed this page AFTER installing (Cmd+R or F5)
                      </label>
                    </div>
                    <div className="form-check mb-3">
                      <input className="form-check-input" type="checkbox" id="check4" />
                      <label className="form-check-label" htmlFor="check4">
                        No errors shown in extension (check service worker logs)
                      </label>
                    </div>
                    
                    <p className="fw-bold mb-2">Debug in Console (F12):</p>
                    <div className="bg-dark text-light p-2 rounded font-monospace small mb-2">
                      window.leetcodeAuth
                    </div>
                    <p className="mb-2">
                      Should return an object. If <code>undefined</code>, content script isn't running.
                    </p>

                    <p className="fw-bold mb-2">Common Issues:</p>
                    <ul className="mb-0">
                      <li>Selected wrong folder (need the <code>extension</code> folder specifically)</li>
                      <li>Extension disabled or has errors</li>
                      <li>Didn't hard refresh (try Ctrl+Shift+R or Cmd+Shift+R)</li>
                      <li>Using Firefox (extension is Chrome-only)</li>
                    </ul>
                  </div>
                </details>
              </div>
              <div className="modal-footer border-0 d-flex justify-content-between">
                <button 
                  className="btn btn-info btn-sm" 
                  onClick={() => {
                    const hasExt = typeof window.leetcodeAuth !== 'undefined';
                    alert(hasExt 
                      ? '✅ Extension IS detected!\nAPI: ' + Object.keys(window.leetcodeAuth).join(', ')
                      : '❌ Extension NOT detected\nwindow.leetcodeAuth is undefined\n\nMake sure:\n1. Extension is installed\n2. Extension is enabled\n3. You refreshed the page\n4. No console errors'
                    );
                  }}
                >
                  🧪 Test Detection
                </button>
                <div>
                  <button className="btn btn-secondary" onClick={() => setShowSetupModal(false)}>
                    Close
                  </button>
                  <button className="btn btn-primary ms-2" onClick={() => window.location.reload()}>
                    I've Installed It - Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <th className="text-center" style={{ cursor: 'pointer', width: '80px' }} onClick={() => handleSort('lcSolved')}>
                LC {getSortIcon('lcSolved')}
              </th>
              <th className="text-center" style={{ cursor: 'pointer', width: '80px' }} onClick={() => handleSort('solved')}>
                Done {getSortIcon('solved')}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentQuestions.map((q) => (
              <tr key={q.title} className={solvedMap[q.title] ? 'table-success' : ''}>
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
                <td className="text-center">
                    {lcSolvedMap[q.title] ? (
                        <span className="text-success fw-bold">✓</span>
                    ) : (
                        <span className="text-muted opacity-25">•</span>
                    )}
                </td>
                <td className="text-center">
                    <input 
                        type="checkbox" 
                        className="form-check-input border-secondary" 
                        style={{ cursor: 'pointer', width: '1.2em', height: '1.2em' }}
                        checked={!!solvedMap[q.title]} 
                        onChange={() => toggleSolved(q.title)}
                    />
                </td>
              </tr>
            ))}
            {currentQuestions.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center text-muted">
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
