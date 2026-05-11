import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FolderKanban, CheckSquare, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-card" style={{ 
      margin: '20px', 
      padding: '15px 30px', 
      display: 'flex', 
      justifyContent: 'between', 
      alignItems: 'center',
      position: 'sticky',
      top: '20px',
      zIndex: 100
    }}>
      <div className="flex items-center gap-2">
        <LayoutDashboard className="primary" />
        <h2 className="gradient-text" style={{ fontSize: '1.5rem', margin: 0 }}>TeamTask</h2>
      </div>

      <div className="flex items-center gap-4" style={{ flex: 1, justifyContent: 'center' }}>
        <Link to="/" className="flex items-center gap-2 nav-link">
          <LayoutDashboard size={18} /> <span>Dashboard</span>
        </Link>
        <Link to="/projects" className="flex items-center gap-2 nav-link">
          <FolderKanban size={18} /> <span>Projects</span>
        </Link>
        <Link to="/tasks" className="flex items-center gap-2 nav-link">
          <CheckSquare size={18} /> <span>Tasks</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2" style={{ marginRight: '10px' }}>
          <UserIcon size={18} />
          <span style={{ fontWeight: 500 }}>{user?.name}</span>
          <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--glass)' }}>{user?.role}</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2" style={{ 
          background: 'var(--danger)', 
          padding: '8px 16px', 
          borderRadius: '8px',
          color: 'white'
        }}>
          <LogOut size={18} /> <span>Logout</span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-link {
          color: var(--text-muted);
          transition: all 0.3s ease;
          padding: 8px 16px;
          border-radius: 8px;
        }
        .nav-link:hover {
          color: var(--text-main);
          background: var(--glass);
        }
        .primary { color: var(--primary); }
      `}} />
    </nav>
  );
};

export default Navbar;
