import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { RiCloseLine } from 'react-icons/ri';
import styles from './LoginModal.module.css';

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
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h5 className={styles.modalTitle}>Manual Login</h5>
            <button className={styles.closeButton} onClick={onClose}>
              <RiCloseLine />
            </button>
          </div>
          
          <div className={styles.modalBody}>
            <div className={styles.helperText}>
              If you can&apos;t use the extension, you can manually paste your LeetCode
              cookies here.
              <br /><br />
              <strong>How to find them:</strong>
              <ol style={{ marginTop: '0.5rem', paddingLeft: '1.2rem', marginBottom: 0 }}>
                <li>Go to LeetCode.com and log in</li>
                <li>Open Developer Tools (F12) → Application/Storage tab</li>
                <li>Go to Cookies → https://leetcode.com</li>
                <li>
                  Copy the values for <code className={styles.codeBlock}>LEETCODE_SESSION</code> and{' '}
                  <code className={styles.codeBlock}>csrftoken</code>
                </li>
              </ol>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>LEETCODE_SESSION</label>
              <input
                type="text"
                className={styles.input}
                value={session}
                onChange={(e) => onSessionChange(e.target.value)}
                placeholder="Paste session cookie here..."
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>csrftoken</label>
              <input
                type="text"
                className={styles.input}
                value={csrf}
                onChange={(e) => onCsrfChange(e.target.value)}
                placeholder="Paste csrf token here..."
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button className={styles.btnCancel} onClick={onClose}>
              Cancel
            </button>
            <button
              className={styles.btnSubmit}
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

