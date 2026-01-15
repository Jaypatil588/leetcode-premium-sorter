import { memo } from 'react';
import PropTypes from 'prop-types';
import { RiDashboardLine, RiFileListLine, RiUserLine } from 'react-icons/ri';
import styles from './Sidebar.module.css';

function Sidebar({ username, totalQuestions, collapsed, onToggle }) {
  return (
    <div
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
    >
      <button
        className={styles['sidebar-toggle']}
        onClick={onToggle}
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={styles['sidebar-header']}>
        <div className={styles['user-avatar']}>
          <RiUserLine />
        </div>
        {!collapsed && (
          <div className={styles['user-info']}>
            <div className={styles['user-name']}>{username || 'Guest'}</div>
            <div className={styles['user-status']}>LeetCode Sorter</div>
          </div>
        )}
      </div>

      <nav className={styles['sidebar-nav']}>
        <div
          className={`${styles['nav-item']} ${styles['nav-item-inactive']}`}
          title="Coming Soon"
        >
          <RiDashboardLine className={styles['nav-icon']} />
          {!collapsed && (
            <>
              <span className={styles['nav-label']}>Dashboard</span>
              <span className={styles['nav-badge']}>Soon</span>
            </>
          )}
        </div>

        <div
          className={`${styles['nav-item']} ${styles['nav-item-active']}`}
        >
          <RiFileListLine className={styles['nav-icon']} />
          {!collapsed && <span className={styles['nav-label']}>Problems</span>}
        </div>
      </nav>

      <div className={styles['sidebar-footer']}>
        <div className={styles['footer-stat']}>
          <div className={styles['footer-stat-value']}>
            {totalQuestions.toLocaleString()}
          </div>
          {!collapsed && (
            <div className={styles['footer-stat-label']}>Total Questions</div>
          )}
        </div>
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  username: PropTypes.string,
  totalQuestions: PropTypes.number.isRequired,
  collapsed: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
};

export default memo(Sidebar);
