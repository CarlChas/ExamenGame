import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async () => {
        setError('');
        const endpoint = mode === 'login' ? 'login' : 'register';
        console.log(`🔁 Trying to ${mode} at /api/users/${endpoint}`);

        try {
            const res = await fetch(`http://localhost:3001/api/users/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            console.log('📦 Response:', data);

            if (!res.ok) {
                setError(data.error || 'Something went wrong');
                return;
            }

            localStorage.setItem('currentUser', username);
            navigate('/game');
        } catch (err) {
            console.error('❌ Network or server error:', err);
            setError('Network error');
        }
    };


    return (
        <div style={{ maxWidth: 400, margin: '2rem auto', padding: '1rem', background: '#222', color: '#fff' }}>
            <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>

            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{ width: '100%', marginBottom: 10 }}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', marginBottom: 10 }}
            />

            <button onClick={handleSubmit} style={{ width: '100%' }}>
                {mode === 'login' ? 'Login' : 'Register'}
            </button>

            {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}

            <p style={{ marginTop: 20 }}>
                {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
                <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                    {mode === 'login' ? 'Register' : 'Login'}
                </button>
            </p>
        </div>
    );
};

export default LoginPage;
