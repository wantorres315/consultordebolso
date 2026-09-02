import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as auth from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [impersonating, setImpersonating] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        auth.fetchUser()
            .then(({ data }) => {
                setUser(data.user);
                setImpersonating(data.impersonating);
            })
            .catch(() => {
                setUser(null);
                setImpersonating(false);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = useCallback(async (data) => {
        const { data: body } = await auth.login(data);
        setUser(body.user);
        setImpersonating(false);

        return body.user;
    }, []);

    const signup = useCallback(async (data) => {
        const { data: body } = await auth.signup(data);
        setUser(body.user);
        setImpersonating(false);

        return body.user;
    }, []);

    const refreshUser = useCallback(async () => {
        const { data } = await auth.fetchUser();
        setUser(data.user);
        setImpersonating(data.impersonating);

        return data.user;
    }, []);

    const logout = useCallback(async () => {
        await auth.logout();
        setUser(null);
        setImpersonating(false);
    }, []);

    const impersonate = useCallback(async (userId) => {
        const { data } = await auth.impersonate(userId);
        setUser(data.user);
        setImpersonating(true);
    }, []);

    const stopImpersonating = useCallback(async () => {
        const { data } = await auth.stopImpersonating();
        setUser(data.user);
        setImpersonating(false);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                impersonating,
                login,
                signup,
                logout,
                impersonate,
                stopImpersonating,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
