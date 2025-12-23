import { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ProgressBar from './components/ProgressBar';
import './App.css';

const SIDEBAR_STORAGE_KEY = 'sidebarCollapsed';

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
    <div className="dropdown" ref={containerRef}>
      <label className="form-label fw-bold" style={{ fontSize: '0.9rem', marginBottom: '0.15rem' }}>{label}</label>
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
  'Microsoft', 'Apple', 'Google', 'Netflix', 'Meta', 'Uber', 'Amazon', 'TikTok', 'X'
];

function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasAutoSyncedRef = useRef(false);
  
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return saved !== null ? saved === 'true' : true; // Collapsed by default
  });

  // Filters - Load from localStorage
  const [selectedCompanies, setSelectedCompanies] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('selectedCompanies')) || [];
    } catch { return []; }
  });
  const [selectedTopics, setSelectedTopics] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('selectedTopics')) || [];
    } catch { return []; }
  });
  const [selectedDifficulties, setSelectedDifficulties] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('selectedDifficulties')) || [];
    } catch { return []; }
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem('searchQuery') || '';
  });
  
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

  // Pagination - Load from localStorage
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const saved = localStorage.getItem('currentPage');
      return saved ? parseInt(saved, 10) : 1;
    } catch { return 1; }
  });
  const itemsPerPage = 50;

  // Sorting - Array of sort configs for stacking - Load from localStorage
  const [sortConfigs, setSortConfigs] = useState(() => {
    try {
      const saved = localStorage.getItem('sortConfigs');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

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

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  // Persist filters
  useEffect(() => {
    localStorage.setItem('selectedCompanies', JSON.stringify(selectedCompanies));
  }, [selectedCompanies]);

  useEffect(() => {
    localStorage.setItem('selectedTopics', JSON.stringify(selectedTopics));
  }, [selectedTopics]);

  useEffect(() => {
    localStorage.setItem('selectedDifficulties', JSON.stringify(selectedDifficulties));
  }, [selectedDifficulties]);

  useEffect(() => {
    localStorage.setItem('searchQuery', searchQuery);
  }, [searchQuery]);

  // Persist pagination
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage.toString());
  }, [currentPage]);

  // Persist sort configs
  useEffect(() => {
    localStorage.setItem('sortConfigs', JSON.stringify(sortConfigs));
  }, [sortConfigs]);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

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

  // Sync is now triggered when clicking on problem links (see title link onClick handler)

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
        await fetchLeetCodeSubmissions(session, csrf, false, lcUsername);
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

  const fetchLeetCodeSubmissions = async (sessionToken = lcSession, csrfToken = lcCsrf, silent = false, username = lcUsername) => {
    const usernameToUse = username || lcUsername;
    if (!usernameToUse) {
      if (!silent) alert('Please enter your LeetCode username first.');
      return;
    }
    
    if (!sessionToken) {
      if (!silent) alert('Please login first using the "Login with LeetCode" button.');
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
        const response = await fetch('/api/leetcode', {
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
          if (!silent) alert('No solved questions found! Make sure you are logged in to the correct account.');
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
      if (!silent) {
        alert(`Synced! Found ${allSolved.length} total solved questions (${newCount} new added).`);
      } else {
        console.log(`Auto-synced: Found ${allSolved.length} total solved questions (${newCount} new added).`);
      }

    } catch (err) {
      console.error("LeetCode Fetch Error:", err);
      if (!silent) {
        alert("Failed to sync. " + err.message);
      }
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

    // Sort - Apply all sort configs in order (only if user has explicitly set sorts)
    if (sortConfigs.length === 0) {
      // No sort applied - return questions in original order
      return result;
    }
    
    result.sort((a, b) => {
      for (const sortConfig of sortConfigs) {
        let valA, valB;

        if (sortConfig.key === 'frequency') {
          // Calculate max frequency for the question based on context
          const getFreq = (q) => {
            const relevantCompanies = selectedCompanies.length > 0 
              ? q.companies.filter(c => selectedCompanies.includes(c.name))
              : q.companies;
            if (relevantCompanies.length === 0) return -1; // Use -1 for no match to sort to bottom
            const frequencies = relevantCompanies.map(c => c.frequency || 0);
            return Math.max(...frequencies);
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
          // Sort by first topic, then second, etc.
          const topicsA = [...a.topics].sort();
          const topicsB = [...b.topics].sort();
          valA = topicsA.join(', ');
          valB = topicsB.join(', ');
        } else if (sortConfig.key === 'solved') {
          valA = solvedMap[a.title] ? 1 : 0;
          valB = solvedMap[b.title] ? 1 : 0;
        } else if (sortConfig.key === 'lcSolved') {
          // Explicitly convert to numbers to ensure proper comparison
          valA = lcSolvedMap[a.title] === true ? 1 : 0;
          valB = lcSolvedMap[b.title] === true ? 1 : 0;
        } else {
          valA = a[sortConfig.key];
          valB = b[sortConfig.key];
        }

        // Compare values - handle null/undefined
        if (valA == null) valA = sortConfig.key === 'frequency' ? -1 : '';
        if (valB == null) valB = sortConfig.key === 'frequency' ? -1 : '';
        
        let comparison = 0;
        if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else {
          // Fallback comparison
          if (valA < valB) comparison = -1;
          else if (valA > valB) comparison = 1;
        }
        
        // Apply sort direction
        if (comparison !== 0) {
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        }
        // If equal, continue to next sort level
      }
      return 0;
    });

    return result;
  }, [questions, selectedCompanies, selectedTopics, selectedDifficulties, searchQuery, sortConfigs, solvedMap, lcSolvedMap]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCompanies, selectedTopics, selectedDifficulties, searchQuery, sortConfigs]);

  const totalPages = Math.ceil(processedQuestions.length / itemsPerPage);
  const currentQuestions = processedQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalSolvedLc = Object.keys(lcSolvedMap).length;
  const totalRevised = Object.keys(solvedMap).filter(k => solvedMap[k]).length;
  const totalQuestionsCount = questions.length || 1;
  const goal = 500;
  const solvedPercent = Math.round((totalSolvedLc / goal) * 100);
  const revisedPercent = Math.round((totalRevised / goal) * 100);

  // Calculate company-specific stats
  const companyStats = useMemo(() => {
    if (selectedCompanies.length === 0) {
      return { solved: 0, remaining: 0, total: 0 };
    }
    
    // Get all questions for selected companies
    const companyQuestions = questions.filter(q => 
      q.companies.some(c => selectedCompanies.includes(c.name))
    );
    
    const total = companyQuestions.length;
    const solved = companyQuestions.filter(q => lcSolvedMap[q.title]).length;
    const remaining = total - solved;
    
    return { solved, remaining, total };
  }, [questions, selectedCompanies, lcSolvedMap]);

  const handleSort = (key) => {
    setSortConfigs(current => {
      const existingIndex = current.findIndex(s => s.key === key);
      let newConfigs;
      
      if (existingIndex >= 0) {
        // Column already in sort stack
        const existing = current[existingIndex];
        if (existing.direction === 'desc') {
          // Toggle to asc
          newConfigs = [...current];
          newConfigs[existingIndex] = { ...existing, direction: 'asc' };
        } else {
          // Remove from stack (third click)
          newConfigs = current.filter((_, i) => i !== existingIndex);
          // Allow empty array - no default sort
        }
      } else {
        // Add new sort (first click on this column)
        newConfigs = [...current, { key, direction: 'desc' }];
      }
      
      console.log('Sort configs updated:', newConfigs);
      return newConfigs;
    });
  };

  const getSortIcon = (key) => {
    const sortConfig = sortConfigs.find(s => s.key === key);
    if (!sortConfig) return '↕';
    const icon = sortConfig.direction === 'asc' ? '↑' : '↓';
    return icon;
  };

  const getSortState = (key) => {
    const sortConfig = sortConfigs.find(s => s.key === key);
    if (!sortConfig) return 'neutral';
    return sortConfig.direction === 'asc' ? 'asc' : 'desc';
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
    <div className="app-container">
      <Sidebar 
        username={lcUsername}
        totalQuestions={questions.length}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="card filters-section" style={{ marginBottom: '1rem' }}>
          <div className="card-body" style={{ padding: '1rem' }}>
            {(selectedCompanies.length > 0 || selectedTopics.length > 0 || selectedDifficulties.length > 0 || searchQuery) && (
              <div className="d-flex justify-content-between align-items-start" style={{ marginBottom: '0.75rem' }}>
                <div className="filter-pills flex-grow-1">
                  {selectedCompanies.map(company => (
                    <div key={company} className="filter-pill">
                      <span>{company}</span>
                      <button 
                        className="filter-pill-remove" 
                        onClick={() => setSelectedCompanies(prev => prev.filter(c => c !== company))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {selectedTopics.map(topic => (
                    <div key={topic} className="filter-pill">
                      <span>{topic}</span>
                      <button 
                        className="filter-pill-remove" 
                        onClick={() => setSelectedTopics(prev => prev.filter(t => t !== topic))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {selectedDifficulties.map(diff => (
                    <div key={diff} className="filter-pill">
                      <span>{diff}</span>
                      <button 
                        className="filter-pill-remove" 
                        onClick={() => setSelectedDifficulties(prev => prev.filter(d => d !== diff))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {searchQuery && (
                    <div className="filter-pill">
                      <span>Search: "{searchQuery}"</span>
                      <button 
                        className="filter-pill-remove" 
                        onClick={() => setSearchQuery('')}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                <button className="btn btn-ghost btn-sm ms-2 flex-shrink-0" onClick={clearFilters}>
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
                <label className="form-label fw-bold" style={{ fontSize: '0.9rem', marginBottom: '0.15rem' }}>Search</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search title..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="row">
              <div className="col-12">
                {!extensionInstalled ? (
                  <div className="alert alert-info shadow-sm border-0 mb-0" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))', border: '1px solid rgba(99, 102, 241, 0.2) !important', padding: '0.75rem 1rem' }}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="flex-grow-1">
                        <strong style={{ color: 'var(--active-color)', fontSize: '0.95rem' }}>🔐 Setup Required</strong>
                        <span className="ms-2 small" style={{ color: 'var(--text-muted)' }}>Install extension for LeetCode sync</span>
                      </div>
                      <div>
                        <button onClick={handleQuickSetup} className="btn btn-primary btn-sm me-2">
                          Quick Setup ⚡
                        </button>
                        <button 
                          onClick={() => window.location.reload()} 
                          className="btn btn-secondary btn-sm"
                          title="Refresh page to detect extension"
                        >
                          🔄
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="form-label fw-bold" style={{ color: 'var(--text-dark)', fontSize: '0.9rem', marginBottom: '0.15rem' }}>LeetCode Sync</label>
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
                        {fetchingLC ? (
                          <><span className="loading-spinner me-2"></span>Logging in...</>
                        ) : (
                          '🔑 Login'
                        )}
                      </button>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => fetchLeetCodeSubmissions(lcSession, lcCsrf, false, lcUsername)} 
                        disabled={fetchingLC || !lcUsername || !lcSession}
                      >
                        {fetchingLC ? (
                          <><span className="loading-spinner me-2"></span>Syncing...</>
                        ) : (
                          'Sync'
                        )}
                      </button>
                    </div>
                    <div className="form-text small d-flex justify-content-between" style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      <span>
                        {lcSession ? (
                          <span style={{ color: 'var(--badge-green)' }}>✓ Logged in</span>
                        ) : (
                          <span style={{ fontSize: '0.8rem' }}>Click "Login" for authentication</span>
                        )}
                      </span>
                      {lcSession && (
                        <button 
                          className="btn btn-link btn-sm p-0 text-decoration-none" 
                          style={{ color: 'var(--active-color)', fontSize: '0.8rem' }}
                          onClick={async () => {
                            if (window.leetcodeAuth) {
                              await window.leetcodeAuth.logout();
                            }
                            setLcSession('');
                            setLcCsrf('');
                          }}
                        >
                          Logout
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
            <span className="text-muted small">{selectedCompanies.length > 0 ? `${companyStats.solved} solved, ${companyStats.remaining} remaining` : 'Select a company'}</span>
          </div>
        </div>

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
                  {currentQuestions.map((q) => (
                    <tr 
                      key={q.title} 
                      className={solvedMap[q.title] ? 'solved-row' : ''}
                      onClick={(e) => {
                        // Don't toggle if clicking on the title link or checkbox
                        if (e.target.tagName === 'A' || e.target.type === 'checkbox') {
                          return;
                        }
                        toggleSolved(q.title);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="title-cell">
                        <a 
                          href={q.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-decoration-none fw-semibold title-link"
                          style={{ color: 'var(--text-dark)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Trigger sync when clicking on problem link
                            if (lcUsername && lcSession) {
                              // Fire sync in background, don't wait for it
                              fetchLeetCodeSubmissions(lcSession, lcCsrf, true, lcUsername).catch(err => {
                                console.error('Background sync failed:', err);
                              });
                            }
                          }}
                        >
                          {q.title}
                        </a>
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
                  {currentQuestions.length === 0 && (
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
      </main>
    </div>
  );
}

export default App;
