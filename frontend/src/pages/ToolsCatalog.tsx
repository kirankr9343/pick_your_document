import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TOOLS_CONFIG, TOOL_CATEGORIES } from '../config/tools.config';
import { Search, ArrowRight, FileText, Filter } from 'lucide-react';

export const ToolsCatalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTools = useMemo(() => {
    return Object.values(TOOLS_CONFIG).filter((tool) => {
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      const matchesSearch =
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase()) ||
        tool.inputFormats.some((fmt) => fmt.toLowerCase().includes(query.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [query, activeCategory]);

  return (
    <div className="app-container" style={{ padding: '3rem 1.25rem' }}>
      
      {/* Header & Search */}
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Document Tools Directory
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
          What do you want to do with your document today?
        </p>

        {/* Live Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            placeholder="Search tools (e.g. Convert PDF to Word, Extract text from image, Merge PDF)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem 1.25rem 1rem 3rem',
              borderRadius: '999px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              boxShadow: 'var(--shadow-md)'
            }}
          />
          <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
        marginBottom: '2.5rem'
      }}>
        {TOOL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '999px',
              border: '1px solid',
              borderColor: activeCategory === cat.id ? 'var(--brand-primary)' : 'var(--border-subtle)',
              background: activeCategory === cat.id ? 'var(--brand-primary)' : 'var(--bg-surface)',
              color: activeCategory === cat.id ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredTools.map((tool) => (
            <Link
              key={tool.id}
              to={`/tools/${tool.id}`}
              className="glass-card"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: 'var(--brand-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={22} />
                  </div>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    background: 'var(--bg-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    {tool.category}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{tool.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{tool.description}</p>
              </div>

              <div style={{
                marginTop: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--brand-primary)',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}>
                Open Tool <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No tools matched your search "{query}".</p>
          <button onClick={() => { setQuery(''); setActiveCategory('all'); }} className="btn-secondary">
            Reset Search Filters
          </button>
        </div>
      )}
    </div>
  );
};
