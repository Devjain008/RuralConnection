import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { jobService } from '../services';
import { AuthContext } from '../store/authStore';
import { LocationContext } from '../store/locationStore';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const { isAuthenticated, user } = useContext(AuthContext);
  const { calculateDistance } = useContext(LocationContext);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    jobService.getJob(id)
      .then(res => setJob(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Job not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setApplying(true);
    setError('');
    try {
      await jobService.applyToJob(id, { coverLetter });
      setSuccess(lang === 'hi' ? 'आवेदन सफलतापूर्वक जमा कर दिया गया!' : 'Application submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>{t('common.loading')}</div>;
  if (error && !job) return <div style={{ textAlign: 'center', padding: '60px', color: '#c62828' }}>⚠️ {error}</div>;

  const jobCoords = job.location?.geo?.coordinates || job.business?.location?.coordinates || [79.02, 28.80];
  const distanceKm = calculateDistance(jobCoords);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn" style={{ background: '#eee', marginBottom: '20px' }}>
        ← {lang === 'hi' ? 'वापस जाएं' : 'Back'}
      </button>

      <div className="card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ margin: '0 0 6px', color: '#2E7D32', fontSize: '1.8rem' }}>{job.title}</h1>
            <p style={{ color: '#555', margin: 0, fontSize: '1.05rem' }}>
              🏢 {job.business?.businessName || 'Local Business'} • 📍 {job.location?.city || 'Local area'}
            </p>
            {distanceKm !== null && (
              <div style={{ marginTop: '6px' }}>
                <span className="badge" style={{ background: '#e8f5e9', color: '#2E7D32', border: '1px solid #c8e6c9', fontWeight: 700, fontSize: '0.9rem' }}>
                  📍 {distanceKm} km {lang === 'hi' ? 'आपके घर से दूर' : 'from your home'}
                </span>
              </div>
            )}
          </div>
          <span className="badge" style={{ background: '#e3f2fd', color: '#1565c0', fontSize: '0.9rem', padding: '6px 12px' }}>
            {job.jobType}
          </span>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

        {/* Highlight Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: '#f9f9f9', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>💰 {t('jobs.salary')}</div>
            <strong style={{ color: '#2E7D32', fontSize: '1.1rem' }}>₹{job.salary?.min} - ₹{job.salary?.max}</strong>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>🎓 {lang === 'hi' ? 'योग्यता' : 'Qualification'}</div>
            <strong>{job.qualification || 'Not specified'}</strong>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>⏳ {lang === 'hi' ? 'अनुभव' : 'Experience'}</div>
            <strong>{job.experience?.min || 0} - {job.experience?.max || 5} years</strong>
          </div>
        </div>

        <h3 style={{ marginBottom: '8px' }}>{lang === 'hi' ? 'नौकरी का विवरण' : 'Job Description'}</h3>
        <p style={{ color: '#444', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginBottom: '24px' }}>
          {job.description}
        </p>

        {job.skills && job.skills.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h4 style={{ marginBottom: '8px' }}>{lang === 'hi' ? 'अपेक्षित कौशल (Skills)' : 'Required Skills'}</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {job.skills.map((s, idx) => (
                <span key={idx} style={{ background: '#e8f5e9', color: '#2E7D32', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

        {/* Application Form */}
        {success ? (
          <div style={{ background: '#e8f5e9', color: '#2E7D32', padding: '16px', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>
            🎉 {success}
          </div>
        ) : (
          <div>
            <h3 style={{ marginBottom: '12px' }}>{lang === 'hi' ? 'इस नौकरी के लिए आवेदन करें' : 'Apply For This Position'}</h3>
            {error && <div style={{ color: '#c62828', marginBottom: '12px' }}>⚠️ {error}</div>}

            {user?.role === 'retailer' || user?.role === 'admin' ? (
              <p style={{ color: '#777', fontStyle: 'italic' }}>
                {lang === 'hi' ? 'केवल सामान्य उपयोगकर्ता (Job Seekers) आवेदन कर सकते हैं।' : 'Only candidate user profiles can apply to jobs.'}
              </p>
            ) : (
              <form onSubmit={handleApply}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
                    {lang === 'hi' ? 'कवर संदेश / अनुभव का संक्षिप्त विवरण (Cover Letter):' : 'Cover Letter / Brief Experience Note:'}
                  </label>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder={lang === 'hi' ? 'बताएं कि आप इस काम के लिए उपयुक्त क्यों हैं...' : 'Tell the employer why you are a good fit for this role...'}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={applying}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '1.05rem' }}
                >
                  {applying ? (lang === 'hi' ? 'आवेदन भेजा जा रहा है...' : 'Submitting...') : (lang === 'hi' ? 'आवेदन भेजें' : 'Submit Application')}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailPage;
