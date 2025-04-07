import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            setCurrentUser(savedUser);
        }
    }, []);

    const handleLogin = () => {
        if (!username) return;

        const userKey = `user:${username.toLowerCase()}`;
        if (!localStorage.getItem(userKey)) {
            const newUser = {
                username,
                characters: [],
            };
            localStorage.setItem(userKey, JSON.stringify(newUser));
        }

        localStorage.setItem('currentUser', username.toLowerCase());
        navigate('/game');
    };

    const handleContinue = () => {
        navigate('/game');
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        setUsername('');
    };

    if (currentUser) {
        return (
            <div style={{ padding: '2rem' }}>
                <h2>Welcome back, {currentUser}!</h2>
                <button onClick={handleContinue}>Continue to Game</button>
                <br />
                <button onClick={handleLogout}>Log Out</button>
            </div>
        );
    }

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
            <button disabled={!username} onClick={handleLogin}>Log In</button>
        </div>
    );
};

export default Login;
