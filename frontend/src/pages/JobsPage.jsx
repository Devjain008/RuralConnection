import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { jobService } from '../services';
import { LocationContext } from '../store/locationStore';

const JobsPage = () => {
  const { t, lang } = useTranslation();
  const { userLocation, calculateDistance } = useContext(LocationContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortByDistance, setSortByDistance] = useState(true);

  const search = searchParams.get('search') || '';
  const jobType = searchParams.get('jobType') || '';

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (jobType) params.jobType = jobType;

    jobService.getJobs(params)
      .then(res => setJobs(res.data.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [search, jobType]);

  const handleFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val);
    else next.delete(key);
    setSearchParams(next);
  };

  // Enhance jobs with distance
  const jobsWithDistance = jobs.map(j => {
    const coords = j.location?.geo?.coordinates || j.business?.location?.coordinates || [79.02, 28.80];
    const distanceKm = calculateDistance(coords);
    return { ...j, distanceKm };
  });

  if (sortByDistance) {
    jobsWithDistance.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#2E7D32', margin: 0 }}>💼 {t('jobs.title')}</h1>
          <p style={{ color: '#666', margin: '4px 0 0' }}>
            {lang === 'hi'
              ? `आपके स्थान (${userLocation?.name || 'Local Area'}) से दूरी के अनुसार नौकरियां`
              : `Jobs ranked by distance from your location (${userLocation?.name || 'Local Area'})`}
          </p>
        </div>

        {/* Filters and Distance Sort */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder={lang === 'hi' ? 'पद या कौशल खोजें...' : 'Search title or skills...'}
            value={search}
            onChange={(e) => handleFilter('search', e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', minWidth: '180px' }}
          />

          <select
            value={jobType}
            onChange={(e) => handleFilter('jobType', e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="">{lang === 'hi' ? 'सभी प्रकार (All Types)' : 'All Job Types'}</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="TEMPORARY">Temporary</option>
            <option value="INTERNSHIP">Internship</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', cursor: 'pointer', background: '#e8f5e9', padding: '7px 12px', borderRadius: '6px', color: '#2E7D32', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={sortByDistance}
              onChange={(e) => setSortByDistance(e.target.checked)}
            />
            <span>{lang === 'hi' ? '📍 सबसे पास पहले' : '📍 Nearest First'}</span>
          </label>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>{t('common.loading')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {jobsWithDistance.map(j => (
            <div key={j._id} className="card" style={{ padding: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{j.title}</h3>
                  <span className="badge" style={{ background: '#e3f2fd', color: '#1565c0' }}>{j.jobType}</span>

                  {/* Prominent Distance Tag */}
                  {j.distanceKm !== null && (
                    <span className="badge" style={{ background: '#e8f5e9', color: '#2E7D32', border: '1px solid #c8e6c9', fontWeight: 700 }}>
                      📍 {j.distanceKm} km {lang === 'hi' ? 'आपके घर से दूर' : 'from your home'}
                    </span>
                  )}
                </div>

                <p style={{ color: '#555', margin: '4px 0 8px', fontSize: '0.95rem' }}>
                  🏢 {j.business?.businessName || 'Local Business'} • 📍 {j.location?.city || 'Local area'}, {j.location?.state || ''}
                </p>

                <p style={{ color: '#666', fontSize: '0.88rem', margin: '0 0 10px' }}>
                  {j.description?.slice(0, 140)}...
                </p>

                {j.skills && j.skills.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {j.skills.map((s, idx) => (
                      <span key={idx} style={{ background: '#f5f5f5', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#444' }}>
                        🏷️ {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px' }}>
                <div style={{ fontWeight: 800, color: '#2E7D32', fontSize: '1.2rem' }}>
                  ₹{j.salary?.min} - ₹{j.salary?.max}
                  <span style={{ fontSize: '0.85rem', color: '#777', fontWeight: 'normal' }}> / month</span>
                </div>
                <Link to={`/jobs/${j._id}`} className="btn btn-primary" style={{ textAlign: 'center', textDecoration: 'none', padding: '10px 20px' }}>
                  {t('common.viewDetails')}
                </Link>
              </div>
            </div>
          ))}
          {jobsWithDistance.length === 0 && (
            <div style={{ textAlign: 'center', padding: '50px', color: '#777' }}>
              <h3>{lang === 'hi' ? 'कोई नौकरी नहीं मिली' : 'No jobs found'}</h3>
              <p>{lang === 'hi' ? 'खोज या फ़िल्टर बदल कर देखें।' : 'Try adjusting your search criteria.'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobsPage;
