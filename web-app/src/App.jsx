import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import AppLayout from './components/Layout/AppLayout/AppLayout.jsx';
import './App.css';
import LoginModal from './components/Features/Auth/LoginModal/LoginModal.jsx';
import FiltersPanel from './components/Features/Filters/FiltersPanel/FiltersPanel.jsx';
import AuthSection from './components/Features/Auth/AuthSection/AuthSection.jsx';
import { MAJOR_COMPANIES, SIDEBAR_STORAGE_KEY, fetchUserProfileApi } from './utilities/leetcodeApi.js';

const StatsBar = lazy(() => import('./components/Features/Stats/StatsBar/StatsBar.jsx'));
const QuestionsTable = lazy(
  () => import('./components/Features/Questions/QuestionsTable/QuestionsTable.jsx')
);

function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
  const [hidePremium, setHidePremium] = useState(() => {
    try {
      return localStorage.getItem('hidePremium') === 'true';
    } catch { return false; }
  });
  const [premiumCheckComplete, setPremiumCheckComplete] = useState(() => {
    try {
      return localStorage.getItem('premiumCheckComplete') === 'true';
    } catch { return false; }
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem('searchQuery') || '';
  });
  
  // LeetCode Integration
  const [lcUsername, setLcUsername] = useState(() => {
    return localStorage.getItem('lcUsername') || '';
  });
  const [lcSession, setLcSession] = useState(() => localStorage.getItem('lcSession') || '');
  const [lcCsrf, setLcCsrf] = useState(() => localStorage.getItem('lcCsrf') || '');
  const [lcAllCookies, setLcAllCookies] = useState(() => localStorage.getItem('lcAllCookies') || '');
  
  // Manual Login State
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [manualSessionInput, setManualSessionInput] = useState('');
  const [manualCsrfInput, setManualCsrfInput] = useState('');

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
  const [premiumMap, setPremiumMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('premiumMap')) || {};
    } catch { return {}; }
  });
  const [fetchingLC, setFetchingLC] = useState(false);

  const fetchUserProfile = async (sessionToken, csrfToken, allCookies) => {
    try {
      const data = await fetchUserProfileApi(sessionToken, csrfToken, allCookies);

      if (data.data?.userStatus?.isSignedIn) {
        const username = data.data.userStatus.username;
        setLcUsername(username);
        return username;
      }

      console.warn('User is not signed in according to LeetCode API');
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };


  const [fetchingPremium, setFetchingPremium] = useState(false);

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
    localStorage.setItem('premiumMap', JSON.stringify(premiumMap));
  }, [premiumMap]);

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
    localStorage.setItem('lcAllCookies', lcAllCookies);
  }, [lcAllCookies]);

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
    localStorage.setItem('hidePremium', hidePremium.toString());
  }, [hidePremium]);

  useEffect(() => {
    localStorage.setItem('premiumCheckComplete', premiumCheckComplete.toString());
  }, [premiumCheckComplete]);

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

  // Sync is now triggered when clicking on problem links (see title link onClick handler)
  
  const toggleSolved = (title) => {
    setSolvedMap(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // Function to check premium status for ALL problems
  const checkAllPremiumStatus = async (sessionToken = lcSession, csrfToken = lcCsrf, allCookies = lcAllCookies) => {
    if (!sessionToken || !csrfToken) {
      console.log('No session token available for premium check');
      return;
    }

    if (premiumCheckComplete) {
      console.log('Premium check already completed');
      return;
    }

    setFetchingPremium(true);
    try {
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
              isPaidOnly
            }
          }
        }
      `;

      const newPremiumMap = { ...premiumMap };
      let skip = 0;
      const limit = 50;
      let hasMore = true;
      let totalFetched = 0;

      // Fetch all problems in batches
      while (hasMore) {
        const headers = {
            'Content-Type': 'application/json',
            'x-lc-session': sessionToken,
            'x-lc-csrf': csrfToken,
            'x-csrftoken': csrfToken
        };
        if (allCookies) {
            headers['x-lc-all-cookies'] = allCookies;
        }

        const response = await fetch('/api/leetcode', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query,
            variables: { 
              categorySlug: "", 
              limit: limit, 
              skip: skip, 
              filters: {} 
            }
          })
        });

        if (!response.ok) {
          console.warn('Failed to fetch premium status:', response.status);
          break;
        }

        const data = await response.json();
        
        if (data.errors) {
          console.warn('GraphQL error:', data.errors);
          break;
        }

        const list = data.data?.problemsetQuestionList;
        if (!list || !list.questions || list.questions.length === 0) {
          hasMore = false;
        } else {
          list.questions.forEach(q => {
            newPremiumMap[q.title] = q.isPaidOnly || false;
          });
          
          skip += limit;
          totalFetched += list.questions.length;
          
          // Update state incrementally for better UX
          setPremiumMap({ ...newPremiumMap });
          
          console.log(`Fetched premium status for ${totalFetched} problems...`);
          
          // Check if we've fetched all problems
          if (list.total && totalFetched >= list.total) {
            hasMore = false;
          }
        }
      }

      setPremiumMap(newPremiumMap);
      setPremiumCheckComplete(true);
      console.log(`Completed premium status check for ${Object.keys(newPremiumMap).length} problems`);
    } catch (err) {
      console.error("Premium status check error:", err);
    } finally {
      setFetchingPremium(false);
    }
  };

  const fetchLeetCodeSubmissions = async (sessionToken = lcSession, csrfToken = lcCsrf, silent = true, username = lcUsername, allCookies = lcAllCookies) => {
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
        const headers = {
            'Content-Type': 'application/json',
            'x-lc-session': sessionToken,
            'x-lc-csrf': csrfToken,
            'x-csrftoken': csrfToken
        };
        if (allCookies) {
            headers['x-lc-all-cookies'] = allCookies;
        }

        const response = await fetch('/api/leetcode', {
            method: 'POST',
            headers,
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
      
      // Overwrite with fresh data from LeetCode
      const newLcMap = {};
      let newCount = 0;
      allSolved.forEach(q => {
          newLcMap[q.title] = true;
          newCount++;
      });
      setLcSolvedMap(newLcMap);
      console.log(`Synced ${newCount} solved questions.`);

    } catch (err) {
      console.error("LeetCode Fetch Error:", err);
      if (!silent) {
        alert("Failed to sync. " + err.message);
      }
    } finally {
      setFetchingLC(false);
    }
  };

  const loadTokensFromHelper = async () => {
    setFetchingLC(true);
    try {
      const res = await fetch('/api/local-tokens/login', { method: 'POST' });
      if (!res.ok) {
        let errDetail = {};
        try {
          errDetail = await res.json();
        } catch {
          errDetail = {};
        }
        throw new Error(errDetail.error || 'Login failed');
      }

      const data = await res.json();

      if (!data.session || !data.csrf) {
        throw new Error('Helper did not return valid auth tokens.');
      }
      
      setLcSession(data.session);
      setLcCsrf(data.csrf);
      if (data.allCookies) {
        setLcAllCookies(data.allCookies);
      }
      
      const username = await fetchUserProfile(data.session, data.csrf, data.allCookies);
      
      if (username) {
        await fetchLeetCodeSubmissions(data.session, data.csrf, false, username, data.allCookies);
        await checkAllPremiumStatus(data.session, data.csrf, data.allCookies);
      } else if (lcUsername) {
        await fetchLeetCodeSubmissions(data.session, data.csrf, false, lcUsername, data.allCookies);
        await checkAllPremiumStatus(data.session, data.csrf, data.allCookies);
      } else {
        alert('Authentication successful! Please enter your LeetCode username and click "Sync".');
      }
    } catch (error) {
      alert('Failed to authenticate: ' + error.message);
    } finally {
      setFetchingLC(false);
    }
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

  // Auto-check premium status on first load when logged in
  useEffect(() => {
    if (lcSession && lcCsrf && !premiumCheckComplete && !fetchingPremium && questions.length > 0) {
      console.log('Auto-checking premium status for all problems...');
      checkAllPremiumStatus(lcSession, lcCsrf);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lcSession, lcCsrf, questions.length, premiumCheckComplete]);

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

    // Filter by Premium Status
    if (hidePremium) {
      result = result.filter(q => premiumMap[q.title] !== true);
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
  }, [questions, selectedCompanies, selectedTopics, selectedDifficulties, searchQuery, sortConfigs, solvedMap, lcSolvedMap, premiumMap, hidePremium]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCompanies, selectedTopics, selectedDifficulties, searchQuery, sortConfigs, hidePremium]);

  const totalPages = Math.ceil(processedQuestions.length / itemsPerPage);
  const currentQuestions = processedQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalSolvedLc = Object.keys(lcSolvedMap).length;
  const totalRevised = Object.keys(solvedMap).filter(k => solvedMap[k]).length;
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
    setHidePremium(false);
  };

  if (loading) return <div className="p-5 text-center">Loading data...</div>;

  const header = (
    <div className="card filters-section" style={{ marginBottom: '1rem' }}>
      <div className="card-body" style={{ padding: '1rem' }}>
        <FiltersPanel
          selectedCompanies={selectedCompanies}
          setSelectedCompanies={setSelectedCompanies}
          selectedTopics={selectedTopics}
          setSelectedTopics={setSelectedTopics}
          selectedDifficulties={selectedDifficulties}
          setSelectedDifficulties={setSelectedDifficulties}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          hidePremium={hidePremium}
          setHidePremium={setHidePremium}
          fetchingPremium={fetchingPremium}
          premiumMap={premiumMap}
          premiumCheckComplete={premiumCheckComplete}
          clearFilters={clearFilters}
          companyOptions={companyOptions}
          topicOptions={topicOptions}
          difficultyOptions={difficultyOptions}
        />
        <AuthSection
          lcSession={lcSession}
          lcUsername={lcUsername}
          setLcUsername={setLcUsername}
          fetchingLC={fetchingLC}
          loadTokensFromHelper={loadTokensFromHelper}
          setManualSessionInput={setManualSessionInput}
          setManualCsrfInput={setManualCsrfInput}
          setShowManualLogin={setShowManualLogin}
          fetchLeetCodeSubmissions={fetchLeetCodeSubmissions}
          setLcSession={setLcSession}
          setLcCsrf={setLcCsrf}
          setLcAllCookies={setLcAllCookies}
          setLcSolvedMap={setLcSolvedMap}
          setPremiumMap={setPremiumMap}
        />
      </div>
    </div>
  );

  return (
    <AppLayout
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={toggleSidebar}
      username={lcUsername}
      totalQuestions={questions.length}
      header={header}
    >
      <LoginModal
        show={showManualLogin}
        session={manualSessionInput}
        csrf={manualCsrfInput}
        onSessionChange={setManualSessionInput}
        onCsrfChange={setManualCsrfInput}
        onClose={() => setShowManualLogin(false)}
        onSubmit={() => {
          setLcSession(manualSessionInput);
          setLcCsrf(manualCsrfInput);
          setShowManualLogin(false);
          // Auto-sync after manual login
          if (manualSessionInput && manualCsrfInput && lcUsername) {
             fetchLeetCodeSubmissions(manualSessionInput, manualCsrfInput, false, lcUsername);
          }
        }}
      />

      <Suspense fallback={null}>
        <StatsBar
          totalSolvedLc={totalSolvedLc}
          solvedPercent={solvedPercent}
          goal={goal}
          totalRevised={totalRevised}
          revisedPercent={revisedPercent}
          companyStats={companyStats}
          selectedCompanies={selectedCompanies}
        />
      </Suspense>

      <Suspense fallback={null}>
        <QuestionsTable
          questions={currentQuestions}
          solvedMap={solvedMap}
          lcSolvedMap={lcSolvedMap}
          selectedCompanies={selectedCompanies}
          premiumMap={premiumMap}
          toggleSolved={toggleSolved}
          handleSort={handleSort}
          getSortState={getSortState}
          getSortIcon={getSortIcon}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          fetchLeetCodeSubmissions={fetchLeetCodeSubmissions}
          lcUsername={lcUsername}
          lcSession={lcSession}
          lcCsrf={lcCsrf}
        />
      </Suspense>
    </AppLayout>
  );
}

export default App;
