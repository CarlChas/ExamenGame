import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        if (!username) return;

        const userKey = `user:${username.toLowerCase()}`;
        const existing = localStorage.getItem(userKey);

        if (!existing) {
            // Create new user
            const newUser = {
                username,
                characters: [],
            };
            localStorage.setItem(userKey, JSON.stringify(newUser));
        }

        // Save current user session
        localStorage.setItem('currentUser', username.toLowerCase());

        // Go to game screen
        navigate('/game');
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Enter the Pantheon</h2>
            <input
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <br />
            <button onClick={handleLogin}>Log In</button>
        </div>
    );
};

export default Login;
