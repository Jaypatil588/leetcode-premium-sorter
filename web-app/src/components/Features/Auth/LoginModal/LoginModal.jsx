import React, { memo } from 'react';
import PropTypes from 'prop-types';
import './LoginModal.module.css';

/**
 * LoginModal renders manual token input for LeetCode authentication.
 */
function LoginModal({
  show,
  session,
  csrf,
  onSessionChange,
  onCsrfChange,
  onClose,
  onSubmit
}) {
  if (!show) return null;

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content shadow-lg">
          <div className="modal-header border-0">
            <h5 className="modal-title">Manual Login (No Extension)</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p className="small text-muted mb-3">
              If you can&apos;t use the extension, you can manually paste your LeetCode
              cookies here.
              <br />
              <strong>How to find them:</strong>
              <ol className="mb-0 mt-1 ps-3">
                <li>Go to LeetCode.com and log in</li>
                <li>Open Developer Tools (F12) → Application/Storage tab</li>
                <li>Go to Cookies → https://leetcode.com</li>
                <li>
                  Copy the values for <code>LEETCODE_SESSION</code> and{' '}
                  <code>csrftoken</code>
                </li>
              </ol>
            </p>

            <div className="mb-3">
              <label className="form-label">LEETCODE_SESSION</label>
              <input
                type="text"
                className="form-control font-monospace small"
                value={session}
                onChange={(e) => onSessionChange(e.target.value)}
                placeholder="Paste session cookie here..."
              />
            </div>

            <div className="mb-3">
              <label className="form-label">csrftoken</label>
              <input
                type="text"
                className="form-control font-monospace small"
                value={csrf}
                onChange={(e) => onCsrfChange(e.target.value)}
                placeholder="Paste csrf token here..."
              />
            </div>
          </div>
          <div className="modal-footer border-0">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={onSubmit}
              disabled={!session || !csrf}
            >
              Save &amp; Sync
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

LoginModal.propTypes = {
  show: PropTypes.bool.isRequired,
  session: PropTypes.string.isRequired,
  csrf: PropTypes.string.isRequired,
  onSessionChange: PropTypes.func.isRequired,
  onCsrfChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default memo(LoginModal);

