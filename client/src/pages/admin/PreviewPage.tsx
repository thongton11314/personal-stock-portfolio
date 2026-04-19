import { useState, useEffect } from 'react';
import { getSettings, publishPortfolio, unpublishPortfolio } from '../../api/portfolio';

export default function PreviewPage() {
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    getSettings().then((data) => {
      setIsPublished(data.publicPage?.isPublished || false);
      setLoading(false);
    });
  }, []);

  const handlePublishToggle = async () => {
    setShowConfirm(false);
    try {
      if (isPublished) {
        await unpublishPortfolio();
        setIsPublished(false);
      } else {
        await publishPortfolio();
        setIsPublished(true);
      }
    } catch {
      // error
    }
  };

  if (loading) return <div><div className="page-header"><h1>Preview & Publish</h1></div><p>Loading...</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Preview & Publish</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`badge ${isPublished ? 'badge-success' : 'badge-muted'}`}>
            {isPublished ? 'Published' : 'Unpublished'}
          </span>
          <button
            className={`btn ${isPublished ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => setShowConfirm(true)}
          >
            {isPublished ? 'Unpublish' : 'Publish'}
          </button>
          <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            <button
              className={`btn ${viewMode === 'desktop' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('desktop')}
              style={{ borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)', border: 'none' }}
            >
              Desktop
            </button>
            <button
              className={`btn ${viewMode === 'mobile' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('mobile')}
              style={{ borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', border: 'none' }}
            >
              Mobile
            </button>
          </div>
        </div>
      </div>

      <div style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        height: 'calc(100vh - 160px)',
        display: 'flex',
        justifyContent: 'center',
        background: 'var(--color-bg-secondary)',
      }}>
        <iframe
          src="/"
          title="Public page preview"
          style={{
            width: viewMode === 'mobile' ? '375px' : '100%',
            height: '100%',
            border: viewMode === 'mobile' ? '1px solid var(--color-border)' : 'none',
            background: 'white',
          }}
        />
      </div>

      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>{isPublished ? 'Unpublish Portfolio' : 'Publish Portfolio'}</h3>
            <p>
              {isPublished
                ? 'Unpublish portfolio? Visitors will see a 404 page.'
                : 'Publish portfolio? It will be visible to the public.'}
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className={`btn ${isPublished ? 'btn-danger' : 'btn-primary'}`} onClick={handlePublishToggle}>
                {isPublished ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
