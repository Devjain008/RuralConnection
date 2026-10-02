import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { jobService } from '../services';

const statusBadge = {
  APPLIED: { bg: '#e3f2fd', color: '#1565c0' },
  REVIEWING: { bg: '#fff3e0', color: '#e65100' },
  SHORTLISTED: { bg: '#ede7f6', color: '#512da8' },
  INTERVIEW: { bg: '#e0f7fa', color: '#00838f' },
  SELECTED: { bg: '#e8f5e9', color: '#2e7d32' },
  REJECTED: { bg: '#ffebee', color: '#c62828' }
};

const ApplicationsPage = () => {
  const { lang } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobService.getMyApplications()
      .then(res => setApplications(res.data.data || []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#2E7D32', marginBottom: '24px' }}>
        📋 {lang === 'hi' ? 'मेरे नौकरी आवेदन' : 'My Job Applications'}
      </h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>
      ) : applications.length === 0 ? (
        <div className="card" style={{ padding: '50px', textAlign: 'center', color: '#666' }}>
          <h3>{lang === 'hi' ? 'आपने अभी तक किसी नौकरी के लिए आवेदन नहीं किया है' : 'No job applications found'}</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {applications.map(app => {
            const badge = statusBadge[app.status] || { bg: '#eee', color: '#333' };
            return (
              <div key={app._id} className="card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem' }}>{app.job?.title || 'Job Posting'}</h3>
                  <div style={{ color: '#666', fontSize: '0.88rem' }}>
                    📅 {new Date(app.appliedAt).toLocaleDateString()} • 📍 {app.job?.location?.city || 'Local area'}
                  </div>
                  {app.coverLetter && (
                    <p style={{ margin: '8px 0 0', fontStyle: 'italic', fontSize: '0.85rem', color: '#555' }}>
                      "{app.coverLetter.slice(0, 90)}..."
                    </p>
                  )}
                </div>

                <span className="badge" style={{ background: badge.bg, color: badge.color, fontSize: '0.9rem', padding: '6px 14px' }}>
                  ● {app.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
