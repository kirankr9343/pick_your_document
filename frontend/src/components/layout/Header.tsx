import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileCode, Search, Menu, X, Sun, Moon, Sparkles, User, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenAuth: () => void;
  user: any;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode, onOpenAuth, user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tools?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--bg-surface-glass)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--brand-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <FileCode size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Pick Your Document
            </span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '-3px' }}>
              Convert. Extract. Create. Simplify.
            </div>
          </div>
        </Link>

        {/* Quick Search input (Desktop) */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'none', position: 'relative', width: '320px' }} className="desktop-search">
          <input
            type="text"
            placeholder="Search tools (e.g. PDF to Word, OCR)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 1rem 0.5rem 2.5rem',
              borderRadius: '999px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </form>

        {/* Nav Links (Desktop) */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/tools" style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
            All Tools
          </Link>
          <Link to="/pricing" style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
            Pricing
          </Link>
          <Link to="/about" style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
            About
          </Link>
          
          {user && (
            <Link to="/dashboard" style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--brand-primary)' }}>
              Dashboard
            </Link>
          )}

          {(user?.is_admin || user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.email?.toLowerCase() === 'kirankr93439343@gmail.com') && (
            <Link
              to="/admin"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'var(--brand-gradient)',
                color: '#ffffff',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.875rem',
                boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)'
              }}
            >
              <ShieldAlert size={18} /> Admin Dashboard
            </Link>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle theme"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '0.5rem',
              borderRadius: '8px'
            }}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Auth */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{user.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Account Role: {user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.is_admin ? 'Administrator' : 'User'}
                </span>
              </div>
              <button onClick={onLogout} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                Logout
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
              <User size={16} /> Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
