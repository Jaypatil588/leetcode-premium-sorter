import { memo } from 'react';
import PropTypes from 'prop-types';

function AuthSection({
  lcSession,
  lcUsername,
  setLcUsername,
  fetchingLC,
  loadTokensFromHelper,
  setManualSessionInput,
  setManualCsrfInput,
  setShowManualLogin,
  fetchLeetCodeSubmissions,
  setLcSession,
  setLcCsrf,
  setLcAllCookies,
  setLcSolvedMap,
  setPremiumMap
}) {
  if (!lcSession) {
    return (
      <div className="row">
        <div className="col-12">
          <div
            className="alert alert-info shadow-sm border-0 mb-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
              border: '1px solid rgba(99, 102, 241, 0.2) !important',
              padding: '0.75rem 1rem'
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div className="flex-grow-1">
                <strong
                  style={{ color: 'var(--active-color)', fontSize: '0.95rem' }}
                >
                  🔐 Authentication Required
                </strong>
                <span
                  className="ms-2 small"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Login to LeetCode to sync progress
                </span>
              </div>
              <div>
                <button
                  onClick={loadTokensFromHelper}
                  className="btn btn-primary btn-sm me-2"
                  disabled={fetchingLC}
                >
                  {fetchingLC ? 'Logging in...' : 'Login with LeetCode ⚡'}
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setManualSessionInput('');
                    setManualCsrfInput('');
                    setShowManualLogin(true);
                  }}
                >
                  Manual Input
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-12">
        <label
          className="form-label fw-bold"
          style={{
            color: 'var(--text-dark)',
            fontSize: '0.9rem',
            marginBottom: '0.15rem'
          }}
        >
          LeetCode Sync
        </label>
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
            className="btn btn-primary"
            onClick={() =>
              fetchLeetCodeSubmissions(undefined, undefined, false, lcUsername)
            }
            disabled={fetchingLC || !lcUsername || !lcSession}
          >
            {fetchingLC ? (
              <>
                <span className="loading-spinner me-2"></span>
                Syncing...
              </>
            ) : (
              'Sync Solved'
            )}
          </button>
          <button
            className="btn btn-outline-danger"
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                setLcSession('');
                setLcCsrf('');
                setLcUsername('');
                setLcAllCookies('');
                setLcSolvedMap({});
                setPremiumMap({});
                localStorage.removeItem('lcSession');
                localStorage.removeItem('lcCsrf');
                localStorage.removeItem('lcUsername');
                localStorage.removeItem('lcAllCookies');
                localStorage.removeItem('lcSolvedMap');
                localStorage.removeItem('premiumMap');
              }
            }}
          >
            Logout
          </button>
        </div>
        <div
          className="form-text small d-flex justify-content-between"
          style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}
        >
          <span>
            <span style={{ color: 'var(--badge-green)' }}>
              ✓ Logged in as {lcUsername || 'User'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

AuthSection.propTypes = {
  lcSession: PropTypes.string,
  lcUsername: PropTypes.string.isRequired,
  setLcUsername: PropTypes.func.isRequired,
  fetchingLC: PropTypes.bool.isRequired,
  loadTokensFromHelper: PropTypes.func.isRequired,
  setManualSessionInput: PropTypes.func.isRequired,
  setManualCsrfInput: PropTypes.func.isRequired,
  setShowManualLogin: PropTypes.func.isRequired,
  fetchLeetCodeSubmissions: PropTypes.func.isRequired,
  setLcSession: PropTypes.func.isRequired,
  setLcCsrf: PropTypes.func.isRequired,
  setLcAllCookies: PropTypes.func.isRequired,
  setLcSolvedMap: PropTypes.func.isRequired,
  setPremiumMap: PropTypes.func.isRequired
};

export default memo(AuthSection);

