import { memo } from 'react';
import PropTypes from 'prop-types';
import Sidebar from '../Sidebar/Sidebar.jsx';
import '../../../App.css';

function AppLayout({
  sidebarCollapsed,
  onToggleSidebar,
  username,
  totalQuestions,
  header,
  children,
  footer
}) {
  return (
    <div className="app-container">
      <Sidebar
        username={username}
        totalQuestions={totalQuestions}
        collapsed={sidebarCollapsed}
        onToggle={onToggleSidebar}
      />
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {header}
        {children}
        {footer}
      </main>
    </div>
  );
}

AppLayout.propTypes = {
  sidebarCollapsed: PropTypes.bool.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
  username: PropTypes.string,
  totalQuestions: PropTypes.number.isRequired,
  header: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node
};

export default memo(AppLayout);

