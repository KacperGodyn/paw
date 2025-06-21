import React, { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

const LoginPage: React.FC = () => {
    const { login: contextLogin } = useAuth();
    const [loginInput, setLoginInput] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const apiUrl = process.env.REACT_APP_API_URL;
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
                body: JSON.stringify({ login: loginInput, password }),
            });

            if (response.ok) {
                const tokens = await response.json() as TokenResponse;
                console.log('Login successful:', tokens);
                contextLogin(tokens.accessToken, tokens.refreshToken);
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
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
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Login"
                                value={loginInput}
                                onChange={(e) => setLoginInput(e.target.value)}
                                disabled={isLoading}
                                data-cy="login-field"
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
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Hasło"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                data-cy="pass-field"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-indigo-400 dark:bg-indigo-500 cursor-not-allowed' : 'bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                            disabled={isLoading}
                            data-cy="login-button"
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