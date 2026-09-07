import React, { useEffect, useState } from 'react';
import { ShieldAlert, Users, FileText, CheckCircle2, AlertTriangle, HardDrive, Clock, Activity } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await fetch('/api/v1/admin/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        const jobsRes = await fetch('/api/v1/admin/jobs?limit=15');
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData);
        }

        const usersRes = await fetch('/api/v1/admin/users?limit=15');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="app-container" style={{ padding: '3rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <ShieldAlert size={32} style={{ color: 'var(--brand-primary)' }} />
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Admin Operations Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Real-time service health, job telemetry, and usage records</p>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Total Conversions</span>
          <strong style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats?.total_conversions || 0}</strong>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Conversions Today</span>
          <strong style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{stats?.conversions_today || 0}</strong>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Registered Users</span>
          <strong style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats?.total_users || 0}</strong>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Failed Jobs</span>
          <strong style={{ fontSize: '1.8rem', fontWeight: 800, color: stats?.failed_conversions > 0 ? 'var(--error-text)' : 'var(--text-primary)' }}>
            {stats?.failed_conversions || 0}
          </strong>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Avg Proc Time</span>
          <strong style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats?.average_processing_time || 0}s</strong>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Total Processed</span>
          <strong style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats?.total_file_size_mb || 0} MB</strong>
        </div>
      </div>

      {/* JOBS & TOP TOOLS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Recent Processing Jobs */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} /> Recent Processing Jobs
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
            {jobs.length > 0 ? (
              jobs.map((j) => (
                <div key={j.id} style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{j.tool_type}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{j.input_filename}</div>
                  </div>
                  <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: j.status === 'completed' ? 'var(--success-bg)' : 'var(--error-bg)',
                    color: j.status === 'completed' ? 'var(--success-text)' : 'var(--error-text)'
                  }}>
                    {j.status}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No recent processing jobs logged.</div>
            )}
          </div>
        </div>

        {/* Top Tools Telemetry */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} /> Top Tools Usage
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats?.top_tools && stats.top_tools.length > 0 ? (
              stats.top_tools.map((t: any, idx: number) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)',
                  fontSize: '0.9rem'
                }}>
                  <span style={{ fontWeight: 600 }}>{t.tool_type}</span>
                  <strong style={{ color: 'var(--brand-primary)' }}>{t.count} runs</strong>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No usage telemetry available yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
