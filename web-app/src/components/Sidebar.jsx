import { RiDashboardLine, RiFileListLine, RiUserLine } from 'react-icons/ri';
import './Sidebar.css';

function Sidebar({ username, totalQuestions, collapsed, onToggle }) {
  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Toggle Button - Hamburger */}
      <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* User Profile Section */}
      <div className="sidebar-header">
        <div className="user-avatar">
          <RiUserLine />
        </div>
        {!collapsed && (
          <div className="user-info">
            <div className="user-name">{username || 'Guest'}</div>
            <div className="user-status">LeetCode Sorter</div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <div className="nav-item nav-item-inactive" title="Coming Soon">
          <RiDashboardLine className="nav-icon" />
          {!collapsed && (
            <>
              <span className="nav-label">Dashboard</span>
              <span className="nav-badge">Soon</span>
            </>
          )}
        </div>
        
        <div className="nav-item nav-item-active">
          <RiFileListLine className="nav-icon" />
          {!collapsed && <span className="nav-label">Problems</span>}
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="footer-stat">
          <div className="footer-stat-value">{totalQuestions.toLocaleString()}</div>
          {!collapsed && <div className="footer-stat-label">Total Questions</div>}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;


