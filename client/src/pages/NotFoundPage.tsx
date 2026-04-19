import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <h1>404</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Page not found</p>
      <Link to="/" style={{ marginTop: '1rem' }}>Go home</Link>
    </div>
  );
}
