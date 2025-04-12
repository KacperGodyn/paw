import React, { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Placeholder type for the expected token response
interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

// Removed LoginPageProps

const LoginPage: React.FC = () => {
    const { login: contextLogin } = useAuth();
    const [loginInput, setLoginInput] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- DEBUG: Log process.env on mount ---
    useEffect(() => {
        console.log("DEBUG: process.env contents:", process.env);
    }, []);
    // --- END DEBUG ---

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const apiUrl = process.env.REACT_APP_API_URL;
        console.log("DEBUG: Read apiUrl:", apiUrl); // Add log here too
        if (!apiUrl) {
            setError("API URL not configured. Please set REACT_APP_API_URL environment variable.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login: loginInput, password }), // Use renamed state variable
            });

            if (response.ok) {
                const tokens = await response.json() as TokenResponse;
                console.log('Login successful:', tokens);
                // Call login from context to update state and store tokens
                contextLogin(tokens.accessToken, tokens.refreshToken);
                // No need for alert here, App.tsx will re-render
            } else if (response.status === 401) {
                setError('Nieprawidłowy login lub hasło.');
            } else {
                const errorData = await response.text();
                console.error('Login failed:', response.status, errorData);
                setError(`Błąd logowania: ${response.status} ${errorData || ''}`);
            }
        } catch (err) {
            console.error('Login network error:', err);
            setError('Nie można połączyć się z serwerem. Spróbuj ponownie później.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Zaloguj się do konta
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <input type="hidden" name="remember" defaultValue="true" />
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="login-address" className="sr-only">Login</label>
                            <input
                                id="login-address"
                                name="login"
                                type="text"
                                autoComplete="username"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Login"
                                value={loginInput} // Use renamed state variable
                                onChange={(e) => setLoginInput(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Hasło</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Hasło"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logowanie...' : 'Zaloguj się'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage; 