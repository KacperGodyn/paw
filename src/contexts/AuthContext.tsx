import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    login: string;
    role: string;
    firstName: string;
    lastName: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            const storedAccessToken = localStorage.getItem('accessToken');
            const storedRefreshToken = localStorage.getItem('refreshToken');

            if (storedAccessToken) {
                
                console.log("Found tokens, but validation/user fetch not implemented yet.");
                 setAccessToken(storedAccessToken);
                 setRefreshToken(storedRefreshToken);
                 setIsAuthenticated(true);

            }
            setIsLoading(false);
        };

        checkAuthStatus();
    }, []);

    const login = (newAccessToken: string, newRefreshToken: string) => {
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        setIsAuthenticated(true);
        console.log("Logged in via context. TODO: Fetch user data.");
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('activeProjectId');

        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setIsAuthenticated(false);
        console.log("Logged out via context.");
    };

    const value = {
        isAuthenticated,
        user,
        accessToken,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
