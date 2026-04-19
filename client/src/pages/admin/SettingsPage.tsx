import { useState, useEffect, FormEvent } from 'react';
import { getSettings, updateSettings } from '../../api/portfolio';

export default function SettingsPage() {
  const [form, setForm] = useState({
    title: '', subtitle: '', description: '', disclaimer: '',
    seoTitle: '', seoDescription: '', slug: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then((data) => {
      setForm({
        title: data.portfolio?.title || '',
        subtitle: data.portfolio?.subtitle || '',
        description: data.portfolio?.description || '',
        disclaimer: data.portfolio?.disclaimer || '',
        seoTitle: data.publicPage?.seoTitle || '',
        seoDescription: data.publicPage?.seoDescription || '',
        slug: data.publicPage?.slug || '',
      });
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        portfolio: {
          title: form.title,
          subtitle: form.subtitle,
          description: form.description,
          disclaimer: form.disclaimer,
        },
        publicPage: {
          seoTitle: form.seoTitle,
          seoDescription: form.seoDescription,
          slug: form.slug,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // error
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div><div className="page-header"><h1>Settings</h1></div><p>Loading...</p></div>;

  return (
    <div>
      <div className="page-header"><h1>Settings</h1></div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Portfolio Information</h3>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input id="title" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label htmlFor="subtitle">Subtitle</label>
            <input id="subtitle" value={form.subtitle} onChange={(e) => setForm(p => ({ ...p, subtitle: e.target.value }))} />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="form-group">
            <label htmlFor="disclaimer">Disclaimer</label>
            <textarea id="disclaimer" value={form.disclaimer} onChange={(e) => setForm(p => ({ ...p, disclaimer: e.target.value }))} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Public Page SEO</h3>
          <div className="form-group">
            <label htmlFor="seoTitle">SEO Title</label>
            <input id="seoTitle" value={form.seoTitle} onChange={(e) => setForm(p => ({ ...p, seoTitle: e.target.value }))} />
          </div>
          <div className="form-group">
            <label htmlFor="seoDescription">SEO Description</label>
            <textarea id="seoDescription" value={form.seoDescription} onChange={(e) => setForm(p => ({ ...p, seoDescription: e.target.value }))} maxLength={160} />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {saved && <div className="toast toast-success" role="status" aria-live="polite">Settings saved.</div>}
    </div>
  );
}
