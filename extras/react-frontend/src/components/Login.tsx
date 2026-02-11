import React, { useState } from 'react';

interface Props {
  onLogin: (token: string) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      const token = data.token;
      if (token) {
        localStorage.setItem('auth_token', token);
        onLogin(token);
      } else {
        setError('No token returned');
      }
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={submit} className="w-full max-w-sm bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Sign In</h2>
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        <label className="block mb-2 text-sm">Username</label>
        <input value={username} onChange={e => setUsername(e.target.value)} className="w-full border px-3 py-2 rounded mb-3" />
        <label className="block mb-2 text-sm">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border px-3 py-2 rounded mb-4" />
        <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">{loading ? 'Signing in...' : 'Sign In'}</button>
        <p className="text-xs text-gray-500 mt-3">Default demo admin: username <strong>admin</strong> password <strong>admin123</strong></p>
      </form>
    </div>
  );
};

export default Login;
