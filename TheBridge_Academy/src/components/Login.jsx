import { useState } from 'react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      setError('Credenciales incorrectas o error de red.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <svg className="icon" style={{ width: '48px', height: '48px', marginBottom: '1rem' }} role="presentation">
          <use href="/icons.svg#documentation-icon"></use>
        </svg>
        <h2>Acceso Plataforma</h2>
        <p>Inicia sesión para continuar</p>
      </div>

      {error && <div style={{ color: 'var(--danger600)', background: 'var(--brand-soft)', padding: '10px', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '14px', border: '1px solid var(--danger600)' }}>{error}</div>}

      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>Email</label>
          <input 
            type="email" 
            className="glass-input" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="admin@aprentic.com"
          />
        </div>
        <div className="input-group">
          <label>Contraseña</label>
          <input 
            type="password" 
            className="glass-input" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Verificando...' : 'Entrar al Dashboard'}
        </button>
      </form>
    </div>
  );
}
